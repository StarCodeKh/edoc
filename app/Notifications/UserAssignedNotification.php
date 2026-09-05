<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Models\Task;
use App\Models\User;
use App\Notifications\Concerns\SendsTelegramNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Spatie\SlackAlerts\Facades\SlackAlert;

class UserAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use SendsTelegramNotification;

    public function __construct(
        public Task $task,
        public User $assignerUser,
        public User $assignedUser,
        public bool $emailIsActive // Add this parameter
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Check email setting
        if ($this->emailIsActive) {
            $channels[] = 'mail';
        }

        // Slack notifications are handled separately via SlackAlert facade

        return $channels;
    }

    // toArray(), toBroadcast() and toMail() methods remain the same.
    // ...
    // Data for the 'database' channel
    public function toArray(object $notifiable): array
    {
        return [
            'action_user_id' => $this->assignerUser->id,
            'action_user_name' => $this->assignerUser->first_name.' '.$this->assignerUser->last_name,
            'action_user_photo' => $this->assignerUser->photo_path,
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'project_id' => $this->task->project_id,
            'project_name' => $this->task->project->title,
            'workspace_name' => $this->task->project->workspace->name,
            'message' => 'assigned you to the task', // Message is specific to the person being notified
            'message_key' => 'assigned you to the task',
            'url' => route('projects.board.with.task', [$this->task->project_id, $this->task->id]),
        ];
    }

    // Data for the 'broadcast' channel
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $data = $this->toArray($notifiable);
        $data['created_at'] = now()->toDateTimeString();
        $data['read_at'] = null;

        return new BroadcastMessage($data);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);

        $template = EmailTemplate::where('slug', 'user_assigned')->first();

        $replacements = [
            '{assignee_name}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{assigner_name}' => trim($this->assignerUser->first_name.' '.$this->assignerUser->last_name),
            '{task_title}' => $this->task->title,
            '{project_title}' => $this->task->project->title,
            '{workspace_name}' => $this->task->project->workspace->name,
            '{action_url}' => $url,

            // extra aliases your HTML might use
            '{user}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{task_name}' => $this->task->title,
            '{task_link}' => $url,
        ];

        $subject = $template && filled($template->subject)
            ? strtr($template->subject, $replacements)
            : 'Assigned to a task';

        $html = $template && filled($template->html)
            ? strtr($template->html, $replacements)
            : $this->defaultHtml($replacements); // optional fallback

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.raw', ['html' => $html]);
    }

    protected function defaultHtml(array $r): string
    {
        return '<!doctype html><html><body>'
            .'<p>Hi '.e($r['{user}']).',</p>'
            .'<p>You were assigned to a task.</p>'
            .'<p><strong>Task:</strong> '.e($r['{task_name}']).'</p>'
            .'<p><a href="'.e($r['{task_link}']).'" target="_blank">View Task</a></p>'
            .'</body></html>';
    }

    public function sendSlackNotification(): void
    {
        $setting = NotificationSetting::where('type', 'user_assigned')->first();
        if (!$setting || !$setting->slack_is_active || !$setting->can_be_slacked) {
            return;
        }

        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);
        $message = "👤 *User Assigned to Task*\n";
        $message .= "*Task:* <{$url}|{$this->task->title}>\n";
        $message .= "*Project:* {$this->task->project->title}\n";
        $message .= "*Workspace:* {$this->task->project->workspace->name}\n";
        $message .= "*Assigned by:* {$this->assignerUser->first_name} {$this->assignerUser->last_name}\n";
        $message .= "*Assigned to:* {$this->assignedUser?->first_name} ".($this->assignedUser?->last_name ?? '')."\n";
        $message .= '_eDoc • '.now()->format('M d, Y g:i A').'_';

        SlackAlert::message($message);
    }

    public function sendTelegramNotification(): void
    {
        $url = route('projects.board.with.task', [$this->task->project_id, $this->task->id]);

        $this->dispatchTelegram('user_assigned', [
            '{assignee_name}' => $this->telegramSafe(trim(($this->assignedUser?->first_name ?? '').' '.($this->assignedUser?->last_name ?? ''))),
            '{assigner_name}' => $this->telegramSafe($this->assignerUser->first_name.' '.$this->assignerUser->last_name),
            '{task_name}' => $this->telegramSafe($this->task->title),
            '{project_name}' => $this->telegramSafe($this->task->project->title),
            '{workspace_name}' => $this->telegramSafe($this->task->project->workspace->name),
            '{due_date}' => $this->task->due_date ? $this->task->due_date->format('M d, Y') : '—',
            '{task_url}' => $url,
        ], "\xF0\x9F\x93\x8C <b>Task Assigned</b>\n<a href=\"{task_url}\">{task_name}</a> → {assignee_name}");
    }
}
