<?php

namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserAssignedToTask
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Public properties are automatically accessible
    public function __construct(
        public User $assignedUser, // The user who was assigned
        public Task $task,         // The task they were assigned to
        public User $assignerUser  // The user who performed the assignment
    ) {}
}
