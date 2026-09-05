<?php

namespace App\Notifications;

use App\Models\BoardList;
use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Models\Task;
use App\Models\User;
use App\Notifications\Concerns\SendsTelegramNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Spatie\SlackAlerts\Facades\SlackAlert;

class TaskUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use SendsTelegramNotification;

    public function __construct(
        public Task $task,
        public User $updatingUser,
        public string $field,
        public mixed $oldValue,
        public mixed $newValue,
        public bool $emailIsActive
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($this->emailIsActive) {
            $email = method_exists($notifiable, 'routeNotificationForMail')
                ? $notifiable->routeNotificationForMail($this)
                : ($notifiable->email ?? null);

            if (!empty($email)) {
                $channels[] = 'mail';
            }
        }

        // Slack notifications are handled separately via SlackAlert facade

        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'action_user_id' => $this->updatingUser->id,
            'action_user_name' => $this->updatingUser->first_name.' '.$this->updatingUser->last_name,
            'action_user_photo' => $this->updatingUser->photo_path,
            'task_title' => $this->task->title, // Always use the current title for context
            'project_name' => $this->task->project->title,
            'workspace_name' => $this->task->project->workspace->name,
            'actor_name' => $this->updatingUser->first_name.' '.$this->updatingUser->last_name,
            'change_message' => $this->generateMessage(),
            // English, for mail and Slack, and for rows written before the
            // translatable pair below existed.
            'message' => $this->generateMessage(),
            // The same sentence as a key and its values, so the page can build
            // it in the reader's language instead of replaying the language it
            // happened to be written in.
            ...$this->messageDescriptor(),
            'url' => route('projects.board.with.task', [$this->task->project_id, $this->task->id]),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);

        $template = EmailTemplate::where('slug', 'task_updated')->first();

        $replacements = [
            '{user}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{task_name}' => $this->task->title,
            '{project_name}' => $this->task->project->title,
            '{task_link}' => $url,
            '{task_url}' => $url,
            // Common aliases your templates might use
            '{task_title}' => $this->task->title,
            '{project_title}' => $this->task->project->title,
            '{action_url}' => $url,
            // Extra context for templates
            '{actor_name}' => trim($this->updatingUser->first_name.' '.($this->updatingUser->last_name ?? '')),
            '{change_message}' => $this->generateMessage(),
            '{workspace_name}' => $this->task->project->workspace->name,
        ];

        $subject = $template && filled($template->subject)
            ? strtr($template->subject, $replacements)
            : '['.$this->task->project->title.'] '.$this->updatingUser->first_name.' '.$this->updatingUser->last_name.' '.$this->generateMessage().' – "'.$this->task->title.'"';

        $html = $template && filled($template->html)
            ? strtr($template->html, $replacements)
            : $this->defaultHtml($replacements);

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.raw', ['html' => $html]);
    }

    protected function defaultHtml(array $r): string
    {
        return '<!doctype html><html><body>'
            .'<p>Hi '.e($r['{user}']).',</p>'
            .'<p>The task <strong>'.e($r['{task_name}']).'</strong> in project <strong>'.e($r['{project_name}']).'</strong> was updated.</p>'
            .'<p><a href="'.e($r['{task_link}']).'" target="_blank">View Task</a></p>'
            .'</body></html>';
    }

    /**
     * Generate a human-readable message based on the updated field.
     */
    /**
     * A date for the notification text. Rows written before dates were sanitised
     * can hold something Carbon cannot read, and a notification is no place to
     * throw over it.
     */
    private function shortDate($value): string
    {
        return $this->formatDate($value) ?? 'no date';
    }

    /** The same date for a stored value, where the stand-in has to travel as a key. */
    private function shortDateValue($value): string|array
    {
        return $this->formatDate($value) ?? self::translate('no date');
    }

    /** M d, or null where there is no date or Carbon cannot read it. */
    private function formatDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('M d');
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * The change as a translation key and its values.
     *
     * generateMessage() bakes the sentence in English at write time, which is
     * fine for the mail and Slack copies - they are sent once, to one place.
     * The database copy is read back for thirty days by whoever opens the bell,
     * in whatever language they have chosen, so it carries the parts instead.
     *
     * @return array{message_key: string, message_values: array<string, string>}
     */
    private function messageDescriptor(): array
    {
        $describe = function (string $key, array $values = []): array {
            return ['message_key' => $key, 'message_values' => $values];
        };

        switch ($this->field) {
            case 'title':
                return $describe('renamed the task from ":from" to ":to"', [
                    'from' => (string) $this->oldValue,
                    'to' => (string) $this->newValue,
                ]);

            case 'description':
                return $describe('updated the description for task ":task"', [
                    'task' => (string) $this->task->title,
                ]);

            case 'due_date':
                return $describe('changed the due date from :from to :to', [
                    'from' => $this->shortDateValue($this->oldValue),
                    'to' => $this->shortDateValue($this->newValue),
                ]);

            case 'list_id':
                return $describe('moved task ":task" from ":from" to ":to"', [
                    'task' => (string) $this->task->title,
                    'from' => $this->listTitle($this->oldValue) ?? self::translate('Unknown'),
                    'to' => $this->listTitle($this->newValue) ?? self::translate('Unknown'),
                ]);

            case 'is_done':
                if ($this->isTruthy($this->newValue)) {
                    return $describe('marked ":task" as done', ['task' => (string) $this->task->title]);
                }

                if ($this->isTruthy($this->oldValue)) {
                    return $describe('marked ":task" as not done', ['task' => (string) $this->task->title]);
                }

                return $describe('updated the completion status of task ":task"', [
                    'task' => (string) $this->task->title,
                ]);

            default:
                return $describe('updated task ":task"', ['task' => (string) $this->task->title]);
        }
    }

    /**
     * A value the page translates when it reads the row back.
     *
     * __() here would resolve at write time, inside a queued job running in the
     * *actor's* locale - so a Khmer clerk moving a task off a since-deleted
     * board stored "មិនស្គាល់", and an English reader got that word sitting in
     * an otherwise English sentence. A word standing in for a missing part is
     * the one piece of a message that has no language of its own, so it travels
     * as a key and is resolved by whoever is reading.
     *
     * A plain string can never be mistaken for one of these: a board really
     * named "Unknown" arrives as the string, this arrives as an object.
     *
     * @return array{translate: string}
     */
    private static function translate(string $key): array
    {
        return ['translate' => $key];
    }

    /**
     * The board a list id names, or null where the board has since been
     * deleted. The stand-in is the caller's to choose: the mail and Slack
     * copies want English, the stored one wants the reader's language.
     */
    private function listTitle($value): ?string
    {
        return $value ? BoardList::find($value)?->title : null;
    }

    /** is_done arrives as a bool, an int or a string depending on the caller. */
    private function isTruthy($value): bool
    {
        return $value === true || $value === 1 || $value === '1' || $value === 'true';
    }

    private function generateMessage(): string
    {
        switch ($this->field) {
            case 'title':
                return 'renamed the task from "'.$this->oldValue.'" to "'.$this->newValue.'"';

            case 'description':
                return 'updated the description for task "'.$this->task->title.'"';

            case 'due_date':
                return 'changed the due date from '.$this->shortDate($this->oldValue)
                    .' to '.$this->shortDate($this->newValue);

            case 'list_id':
                return 'moved task "'.$this->task->title.'" from "'.($this->listTitle($this->oldValue) ?? 'Unknown')
                    .'" to "'.($this->listTitle($this->newValue) ?? 'Unknown').'"';

            case 'is_done':
                if ($this->isTruthy($this->newValue)) {
                    return 'marked "'.$this->task->title.'" as done';
                }
                if ($this->isTruthy($this->oldValue)) {
                    return 'marked "'.$this->task->title.'" as not done';
                }

                return 'updated the completion status of task "'.$this->task->title.'"';

            default:
                return 'updated task "'.$this->task->title.'"';
        }
    }

    public function sendSlackNotification(): void
    {
        $setting = NotificationSetting::where('type', 'task_updated')->first();
        if (!$setting || !$setting->slack_is_active || !$setting->can_be_slacked) {
            return;
        }

        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);
        $changeMessage = $this->generateMessage();

        $message = "📝 *Task Updated*\n";
        $message .= "*Task:* <{$url}|{$this->task->title}>\n";
        $message .= "*Project:* {$this->task->project->title}\n";
        $message .= "*Workspace:* {$this->task->project->workspace->name}\n";
        $message .= "*Updated by:* {$this->updatingUser->first_name} {$this->updatingUser->last_name}\n";
        $message .= "*Change:* {$changeMessage}\n";
        $message .= '_eDoc • '.now()->format('M d, Y g:i A').'_';

        SlackAlert::message($message);
    }

    public function sendTelegramNotification(): void
    {
        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);

        $this->dispatchTelegram('task_updated', [
            '{actor_name}' => $this->telegramSafe($this->updatingUser->first_name.' '.$this->updatingUser->last_name),
            '{task_name}' => $this->telegramSafe($this->task->title),
            '{project_name}' => $this->telegramSafe($this->task->project->title),
            '{workspace_name}' => $this->telegramSafe($this->task->project->workspace->name),
            '{change_message}' => $this->telegramSafe($this->generateMessage(), 500),
            '{task_url}' => $url,
        ], "\xE2\x9C\x8F\xEF\xB8\x8F <b>Task Updated</b>\n<a href=\"{task_url}\">{task_name}</a>\n\n{change_message}");
    }
}
