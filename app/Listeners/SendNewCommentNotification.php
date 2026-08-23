<?php
namespace App\Listeners;

use App\Events\NewCommentAdded;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Notifications\NewCommentNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendNewCommentNotification implements ShouldQueue
{
    public function handle(NewCommentAdded $event)
    {
        $setting = NotificationSetting::where('type', 'new_comment')->first();
        if (!$setting || !$setting->is_active) {
            return;
        }

        $comment = $event->comment->load([
            'user',
            'task.user',
            'task.assignees',
            'task.watchers',
            'task.project.workspace.teamMembers'
        ]);
        $task = $comment->task;
        $commenter = $comment->user;

        $assigneeUsers   = collect($task->assignees)->map(fn ($a) => $a->user ?? null);
        $teamMemberUsers = collect(optional($task->project->workspace)->teamMembers)->map(fn ($tm) => $tm->user ?? null);
        $watcherUsers    = collect($task->watchers)->map(fn ($w) => $w->user ?? $w);
        $ownerUser       = $task->user ?? null;

        $usersToNotify = collect()
            ->merge($assigneeUsers)
            ->merge($teamMemberUsers)
            ->merge($watcherUsers)
            ->push($ownerUser)
            ->filter(fn ($u) => $u instanceof User && !empty($u->email))
            ->unique('id')
            ->reject(fn (User $u) => $u->id === ($commenter->id ?? null))
            ->values();


        if ($usersToNotify->isEmpty()) {
            return;
        }


        $emailIsActive = (bool) $setting->email_is_active;

        $notification = new NewCommentNotification($comment, $emailIsActive);
        Notification::send($usersToNotify, $notification);
        
        // Send ONE Slack notification for the comment (not per user)
        $notification->sendSlackNotification();
        $notification->sendTelegramNotification();
    }
}
