<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Task;
use App\Support\TaskAbility;

/**
 * Server-side half of the document permissions. The UI hides what a user may not
 * do, but every mutating endpoint still asks here - the buttons are a courtesy,
 * this is the rule.
 */
trait AuthorizesTasks
{
    /** Resolve a task by id or slug and authorize `$ability`, or abort. */
    protected function authorizeTask($taskUid, string $ability): Task
    {
        $task = Task::withTrashed()
            ->with('assignees')
            ->where(function ($query) use ($taskUid) {
                $query->where('id', $taskUid)->orWhere('slug', $taskUid);
            })
            ->first();

        if (empty($task)) {
            abort(404, 'Document not found.');
        }

        $this->authorizeTaskModel($task, $ability);

        return $task;
    }

    protected function authorizeTaskModel(Task $task, string $ability): void
    {
        $user = auth()->user();
        $check = 'can'.ucfirst($ability);

        if (!$user || !call_user_func([TaskAbility::class, $check], $user, $task)) {
            abort(403, $this->taskAbilityMessage($ability));
        }
    }

    /** True/false form, for the places that filter instead of failing. */
    protected function userCan(string $ability, Task $task): bool
    {
        $user = auth()->user();

        return $user && call_user_func([TaskAbility::class, 'can'.ucfirst($ability)], $user, $task);
    }

    protected function taskAbilityMessage(string $ability): string
    {
        return match ($ability) {
            'move' => 'You are not allowed to move this document to another board.',
            'edit' => 'You are not allowed to change this document.',
            'delete' => 'You are not allowed to delete this document.',
            'attach' => 'You are not allowed to attach files to this document.',
            'comment' => 'You are not allowed to comment on this document.',
            'sign' => 'This document is open to you for reading only - signing it belongs to the reviewer responsible for its current step.',
            default => 'You do not have access to this document.',
        };
    }
}
