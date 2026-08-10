<?php
namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskFieldUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Task $task,
        public User $updatingUser,
        public string $field,
        public mixed $oldValue,
        public mixed $newValue
    ) {}
}
