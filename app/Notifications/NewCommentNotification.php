<?php
namespace App\Notifications;

use App\Notifications\Concerns\SendsTelegramNotification;
use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Spatie\SlackAlerts\Facades\SlackAlert;
use Illuminate\Notifications\Notification;
use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use Illuminate\Support\Facades\Log;

class NewCommentNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use SendsTelegramNotification;

    public function __construct(public Comment $comment, public bool $emailIsActive)
    {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($this->emailIsActive) {
            $channels[] = 'mail';
        }

        // Slack notifications are handled separately via SlackAlert facade

        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'action_user_id' => $this->comment->user->id,
            'action_user_name' => $this->comment->user->first_name . ' ' . $this->comment->user->last_name,
            'project_id' => $this->comment->task->project_id,
            'project_name' => $this->comment->task->project->title,
            'task_id' => $this->comment->task_id,
            'task_title' => $this->comment->task->title,
            'message' => 'added a new comment', // Removed the period to fit the sentence better
            'url' => route('projects.board.with.task', [$this->comment->task->project_id, $this->comment->task_id]),
            'action_user_photo' => $this->comment->user->photo_path,
            'workspace_name' => $this->comment->task->project->workspace->name,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $data = $this->toArray($notifiable);
        $data['created_at'] = now()->toDateTimeString();
        $data['read_at'] = null;
        return new BroadcastMessage($data);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('projects.board.with.task', [$this->comment->task->project_id, $this->comment->task_id]);

        $template = EmailTemplate::where('slug', 'new_comment')->first();

        $replacements = [
            '{user}'          => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{task_name}'     => $this->comment->task->title,
            '{project_name}'  => $this->comment->task->project->title,
            '{comment}'       => $this->comment->details,
            '{task_link}'     => $url,
            '{task_url}'      => $url,
            // Common aliases your templates might use
            '{task_title}'    => $this->comment->task->title,
            '{project_title}' => $this->comment->task->project->title,
            '{action_url}'    => $url,
        ];

        $subject = $template && filled($template->subject)
            ? strtr($template->subject, $replacements)
            : '[Task - '.$this->comment->task->title.'] - A new comment';

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
            .'<p>A new comment was added on the task <strong>'.e($r['{task_name}']).'</strong> in project <strong>'.e($r['{project_name}']).'</strong>.</p>'
            .'<blockquote style="margin:10px 0;padding:8px 12px;border-left:3px solid #eee;">'.e($r['{comment}']).'</blockquote>'
            .'<p><a href="'.e($r['{task_link}']).'" target="_blank">View Task</a></p>'
            .'</body></html>';
    }

    public function sendSlackNotification(): void
    {
        $setting = NotificationSetting::where('type', 'new_comment')->first();
        if (!$setting || !$setting->slack_is_active || !$setting->can_be_slacked) {
            return;
        }

        $url = route('projects.board.with.task', [$this->comment->task->project_id, $this->comment->task_id]);
        $commentPreview = substr(strip_tags($this->comment->details), 0, 200) . (strlen(strip_tags($this->comment->details)) > 200 ? '...' : '');

        $message = "💬 *New Comment Added*\n";
        $message .= "*Task:* <{$url}|{$this->comment->task->title}>\n";
        $message .= "*Project:* {$this->comment->task->project->title}\n";
        $message .= "*Workspace:* {$this->comment->task->project->workspace->name}\n";
        $message .= "*Comment by:* {$this->comment->user->first_name} {$this->comment->user->last_name}\n";
        $message .= "*Comment:* {$commentPreview}\n";
        $message .= "_eDoc • " . now()->format('M d, Y g:i A') . "_";

        SlackAlert::message($message);
    }

    public function sendTelegramNotification(): void
    {
        $url = route('projects.board.with.task', [$this->comment->task->project_id, $this->comment->task_id]);

        $this->dispatchTelegram('new_comment', [
            '{actor_name}' => $this->telegramSafe($this->comment->user->first_name.' '.$this->comment->user->last_name),
            '{task_name}' => $this->telegramSafe($this->comment->task->title),
            '{project_name}' => $this->telegramSafe($this->comment->task->project->title),
            '{workspace_name}' => $this->telegramSafe($this->comment->task->project->workspace->name),
            '{comment}' => $this->telegramSafe($this->comment->details, 500),
            '{task_url}' => $url,
        ], "\xF0\x9F\x92\xAC <b>New Comment</b>\n<a href=\"{task_url}\">{task_name}</a> — {actor_name}\n\n{comment}");
    }
}
