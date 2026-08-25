<?php

namespace App\Observers;

use App\Events\TaskFieldUpdated; // We will create this event next
use App\Models\Task;

class TaskObserver
{
    /**
     * Handle the Task "creating" event - stamp the board the task starts in, so
     * we can tell later whether it has moved on.
     */
    public function creating(Task $task)
    {
        if (empty($task->origin_list_id)) {
            $task->origin_list_id = $task->list_id;
        }
    }

    /**
     * Handle the Task "updated" event.
     * This fires AFTER a task has been saved to the database.
     */
    public function updated(Task $task)
    {
        // We only care about updates made by a logged-in user
        if (!auth()->check()) {
            return;
        }

        $user = auth()->user();

        // Define which fields we want to track for notification-worthy changes
        $trackableFields = [
            'title',
            'is_done',
            'is_archive',
            'description',
            'project_id',
            'due_date',
            'list_id', // This represents moving the task between lists
        ];

        foreach ($trackableFields as $field) {
            if ($task->wasChanged($field)) {
                event(new TaskFieldUpdated(
                    $task,
                    $user,
                    $field,
                    $task->getOriginal($field), // The old value
                    $task->{$field} // The new value
                ));
            }
        }
    }
}
