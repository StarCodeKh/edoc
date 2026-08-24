<?php

namespace App\Http\Controllers;

use App\Events\UserAssignedToTask;
use App\Models\Assignee;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class AssigneesController extends Controller
{
    use \App\Http\Controllers\Concerns\AuthorizesTasks;

    public function assignUserToTask(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'task_id' => 'required|exists:tasks,id',
        ]);

        $this->authorizeTask($validated['task_id'], 'edit');

        $assignee = Assignee::where('user_id', $validated['user_id'])->where('task_id', $validated['task_id'])->first();
        $wasRemoved = false;

        if ($assignee) {
            $assignee->delete();
            $wasRemoved = true;
        } else {
            $assignee = Assignee::create($validated);
            $assignee->load('user');
        }

        $user = User::find($validated['user_id']);
        $task = Task::withTrashed()->find($validated['task_id']);
        $assigner = auth()->user();

        if (!$user || !$task) {
            return response()->json([
                'success' => false,
                'message' => 'User or task not found.',
            ], 404);
        }

        event(new UserAssignedToTask($user, $task, $assigner));

        return response()->json([
            'success' => true,
            'action' => $wasRemoved ? 'unassigned' : 'assigned',
            'assignee' => $wasRemoved ? null : $assignee,
        ]);
    }
}