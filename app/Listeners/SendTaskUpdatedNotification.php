<?php
namespace App\Listeners;

use App\Events\TaskFieldUpdated;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Notifications\TaskUpdatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendTaskUpdatedNotification implements ShouldQueue
{
    public function handle(TaskFieldUpdated $event)
    {
        $setting = NotificationSetting::where('type', 'task_updated')->first();
        if (!$setting || !$setting->is_active) {
            return;
        }

        $task = $event->task->load('assignees', 'watchers', 'project.workspace');
        $updatingUser = $event->updatingUser;

        // Notify all assignees and watchers, except the person who made the change
        // Normalize potential pivot models (Assignee/Watcher) to underlying User models
        $assigneeUsers = collect($task->assignees)->map(fn ($a) => $a->user ?? null);
        $watcherUsers  = collect($task->watchers)->map(fn ($w) => $w->user ?? $w);

        Log::info($watcherUsers);

        $usersToNotify = collect()
            ->merge($assigneeUsers)
            ->merge($watcherUsers)
            ->filter(fn ($u) => $u instanceof User && !empty($u->email))
            ->unique('id')
            ->reject(fn (User $user) => $user->id === $updatingUser->id)
            ->values();

        $emailIsActive = (bool) $setting->email_is_active;

        if ($usersToNotify->isNotEmpty()) {
            $notification = new TaskUpdatedNotification(
                $task,
                $updatingUser,
                $event->field,
                $event->oldValue,
                $event->newValue,
                $emailIsActive
            );
            
            Notification::send($usersToNotify, $notification);
            
            // Send ONE Slack notification for the task update (not per user)
            $notification->sendSlackNotification();
        }
    }
}
