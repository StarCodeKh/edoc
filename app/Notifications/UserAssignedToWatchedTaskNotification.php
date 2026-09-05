<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class UserAssignedToWatchedTaskNotification extends Notification implements ShouldQueue
{
    use Queueable;

    // We don't need the MailMessage for this, as watchers likely don't need an email for this action.
    // The constructor also takes the email setting for consistency, though we may not use it.
    public function __construct(
        public Task $task,
        public User $assignedUser,
        public User $assignerUser,
        public bool $emailIsActive
    ) {}

    public function via(object $notifiable): array
    {
        // Watchers typically only need in-app notifications for this kind of event.
        return ['database', 'broadcast'];
    }

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
            // The message is different for watchers. English for mail and Slack
            // and for rows already written; the key and its value are what the
            // bell renders, in whatever language the reader has chosen.
            'message' => 'assigned '.$this->assignedUser->first_name.' to the task',
            'message_key' => 'assigned :name to the task',
            'message_values' => ['name' => $this->assignedUser->first_name],
            'url' => route('projects.board.with.task', [$this->task->project_id, $this->task->id]),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $data = $this->toArray($notifiable);
        $data['created_at'] = now()->toDateTimeString();
        $data['read_at'] = null;

        return new BroadcastMessage($data);
    }
}
