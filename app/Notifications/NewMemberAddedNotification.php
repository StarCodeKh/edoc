<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Models\TeamMember;
use App\Notifications\Concerns\SendsTelegramNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Spatie\SlackAlerts\Facades\SlackAlert;

class NewMemberAddedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use SendsTelegramNotification;

    public function __construct(
        public TeamMember $teamMember,
        public bool $emailIsActive
    ) {}

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
            'action_user_id' => $this->teamMember->adder->id,
            'action_user_name' => $this->teamMember->adder->first_name.' '.$this->teamMember->adder->last_name,
            'action_user_photo' => $this->teamMember->adder->photo_path,
            'workspace_id' => $this->teamMember->workspace->id,
            'workspace_name' => $this->teamMember->workspace->name,
            'message' => 'added you to the workspace',
            'url' => route('workspace.view', $this->teamMember->workspace->slug), // Assumes a route name 'workspaces.show'
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
        $url = route('workspace.view', $this->teamMember->workspace->slug);

        $template = EmailTemplate::where('slug', 'new_workspace_member')->first();

        $replacements = [
            '{assignee_name}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{member_name}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{adder_name}' => trim($this->teamMember->adder->first_name.' '.($this->teamMember->adder->last_name ?? '')),
            '{added_by}' => trim($this->teamMember->adder->first_name.' '.($this->teamMember->adder->last_name ?? '')),
            '{workspace_name}' => $this->teamMember->workspace->name,
            '{action_url}' => $url,

            // extra aliases your HTML might use
            '{user}' => trim($notifiable->first_name.' '.($notifiable->last_name ?? '')),
            '{workspace_link}' => $url,
        ];

        $subject = $template && filled($template->subject)
            ? strtr($template->subject, $replacements)
            : 'You have been added to the '.$this->teamMember->workspace->name.' workspace';

        $html = $template && filled($template->html)
            ? strtr($template->html, $replacements)
            : $this->defaultHtml($replacements);

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.raw', ['html' => $html]);
    }

    public function sendSlackNotification(): void
    {
        $setting = NotificationSetting::where('type', 'new_workspace_member')->first();
        if (!$setting || !$setting->slack_is_active || !$setting->can_be_slacked) {
            return;
        }

        $url = route('workspace.view', $this->teamMember->workspace->slug);
        $message = "👥 *New Member Added to Workspace*\n";
        $message .= "*Workspace:* {$this->teamMember->workspace->name}\n";
        $message .= "*Added by:* {$this->teamMember->adder->first_name} {$this->teamMember->adder->last_name}\n";
        $message .= "*New member:* {$this->teamMember->user->first_name} ".($this->teamMember->user->last_name ?? '')."\n";
        $message .= "*Email:* {$this->teamMember->user->email}\n";
        $message .= '_eDoc • '.now()->format('M d, Y g:i A').'_';

        SlackAlert::message($message);
    }

    protected function defaultHtml(array $r): string
    {
        return '<!doctype html><html><body>'
            .'<p>Hi '.e($r['{user}']).',</p>'
            .'<p>You have been added to the <strong>'.e($r['{workspace_name}']).'</strong> workspace.</p>'
            .'<p><a href="'.e($r['{action_url}']).'" target="_blank">Open Workspace</a></p>'
            .'</body></html>';
    }

    public function sendTelegramNotification(): void
    {
        $url = route('workspace.view', $this->teamMember->workspace->slug);

        $this->dispatchTelegram('new_workspace_member', [
            '{member_name}' => $this->telegramSafe(trim($this->teamMember->user->first_name.' '.($this->teamMember->user->last_name ?? ''))),
            '{adder_name}' => $this->telegramSafe($this->teamMember->adder->first_name.' '.$this->teamMember->adder->last_name),
            '{workspace_name}' => $this->telegramSafe($this->teamMember->workspace->name),
            '{workspace_link}' => $url,
        ], "\xF0\x9F\x91\xA5 <b>New Workspace Member</b>\n{member_name} joined <a href=\"{workspace_link}\">{workspace_name}</a>");
    }
}
