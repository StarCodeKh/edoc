<?php

namespace App\Listeners;

use App\Events\UserAssignedToTask;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Notifications\UserAssignedNotification;
use App\Notifications\UserAssignedToWatchedTaskNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendUserAssignedNotification implements ShouldQueue
{
    public function handle(UserAssignedToTask $event)
    {
        $setting = NotificationSetting::where('type', 'user_assigned')->first();
        if (!$setting || !$setting->is_active) {
            return;
        }

        // Get the email setting once
        $emailIsActive = $setting->email_is_active;

        $assignedUser = $event->assignedUser;
        $assignerUser = $event->assignerUser;
        $task = $event->task->load('project.workspace', 'watchers');

        // --- Notification for the Assigned User ---
        // Don't notify someone if they assign themselves
        if ($assignedUser->id !== $assignerUser->id) {
            $notification = new UserAssignedNotification($task, $assignerUser, $assignedUser, $emailIsActive);
            $assignedUser->notify($notification);

            // Send Slack notification
            $notification->sendSlackNotification();
            $notification->sendTelegramNotification();
        }

        // --- Notification for Watchers ---
        // Find watchers who are NOT the person being assigned OR the person doing the assigning
        $watchersToNotify = $task->watchers->reject(function (User $watcher) use ($assignedUser, $assignerUser) {
            return $watcher->id === $assignedUser->id || $watcher->id === $assignerUser->id;
        });

        if ($watchersToNotify->isNotEmpty()) {
            Notification::send(
                $watchersToNotify,
                new UserAssignedToWatchedTaskNotification($task, $assignedUser, $assignerUser, $emailIsActive)
            );
        }
    }
}
