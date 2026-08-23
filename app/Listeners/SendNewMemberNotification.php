<?php
namespace App\Listeners;

use App\Events\NewMemberAddedToWorkspace;
use App\Models\NotificationSetting;
use App\Notifications\NewMemberAddedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendNewMemberNotification implements ShouldQueue
{
    public function handle(NewMemberAddedToWorkspace $event)
    {
        $setting = NotificationSetting::where('type', 'new_workspace_member')->first();
        if (!$setting || !$setting->is_active) {
            return;
        }

        $teamMember = $event->teamMember->load(['user', 'workspace', 'adder']);
        $newUser = $teamMember->user;
        $adder = $teamMember->adder;

        // Do not notify a user if they add themselves (edge case)
        if ($newUser->id === $adder->id) {
            return;
        }

        $emailIsActive = $setting->email_is_active;

        // Send the notification directly to the new user
        $notification = new NewMemberAddedNotification($teamMember, $emailIsActive);
        $newUser->notify($notification);
        
        // Send Slack notification
        $notification->sendSlackNotification();
        $notification->sendTelegramNotification();
    }
}
