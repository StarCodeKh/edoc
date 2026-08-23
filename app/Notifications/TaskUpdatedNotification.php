<?php
namespace App\Notifications;

use App\Notifications\Concerns\SendsTelegramNotification;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Spatie\SlackAlerts\Facades\SlackAlert;
use App\Models\EmailTemplate;
use App\Models\NotificationSetting;

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
            'action_user_name' => $this->updatingUser->first_name . ' ' . $this->updatingUser->last_name,
            'action_user_photo' => $this->updatingUser->photo_path,
            'task_title' => $this->task->title, // Always use the current title for context
            'project_name' => $this->task->project->title,
            'workspace_name' => $this->task->project->workspace->name,
            'actor_name' => $this->updatingUser->first_name . ' ' . $this->updatingUser->last_name,
            'change_message' => $this->generateMessage(),
            'message' => $this->generateMessage(), // Generate the dynamic message
            'url' => route('projects.board.with.task', [$this->task->project_id, $this->task->id]),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);

        $template = EmailTemplate::where('slug', 'task_updated')->first();

        $replacements = [
            '{user}'          => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{task_name}'     => $this->task->title,
            '{project_name}'  => $this->task->project->title,
            '{task_link}'     => $url,
            '{task_url}'      => $url,
            // Common aliases your templates might use
            '{task_title}'    => $this->task->title,
            '{project_title}' => $this->task->project->title,
            '{action_url}'    => $url,
            // Extra context for templates
            '{actor_name}'     => trim($this->updatingUser->first_name.' '.($this->updatingUser->last_name ?? '')),
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
    private function generateMessage(): string
    {
        switch ($this->field) {
            case 'title':
                return 'renamed the task from "' . $this->oldValue . '" to "' . $this->newValue . '"';

            case 'description':
                return 'updated the description for task "' . $this->task->title . '"';

            case 'due_date':
                $old = $this->oldValue ? Carbon::parse($this->oldValue)->format('M d') : 'no date';
                $new = $this->newValue ? Carbon::parse($this->newValue)->format('M d') : 'no date';
                return 'changed the due date from ' . $old . ' to ' . $new;

            case 'list_id':
                $fromTitle = $this->oldValue ? (BoardList::find($this->oldValue)?->title) : null;
                $toTitle   = $this->newValue ? (BoardList::find($this->newValue)?->title) : null;
                return 'moved task "' . $this->task->title . '" from "' . ($fromTitle ?? 'Unknown') . '" to "' . ($toTitle ?? 'Unknown') . '"';

            case 'is_done':
                if ($this->newValue === true || $this->newValue === '1' || $this->newValue === 1 || $this->newValue === 'true') {
                    return 'marked "' . $this->task->title . '" as done';
                }
                if ($this->oldValue === true || $this->oldValue === '1' || $this->oldValue === 1 || $this->oldValue === 'true') {
                    return 'marked "' . $this->task->title . '" as not done';
                }
                return 'updated the completion status of task "' . $this->task->title . '"';

            default:
                return 'updated task "' . $this->task->title . '"';
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
        $message .= "_ProTask • " . now()->format('M d, Y g:i A') . "_";

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
