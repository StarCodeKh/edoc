<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Assignee;
use App\Models\UserGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupAssignmentController extends Controller
{
    use AuthorizesTasks;

    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|integer',
            'user_group_id' => 'required|integer|exists:user_groups,id',
        ]);

        $taskId = (int) $request->input('task_id');
        $this->authorizeTask($taskId, 'edit');
        $groupId = (int) $request->input('user_group_id');

        $group = UserGroup::findOrFail($groupId);

        $existingGroupAssignee = DB::table('group_assignees')
            ->where('task_id', $taskId)
            ->where('user_group_id', $groupId)
            ->first();

        if ($existingGroupAssignee) {
            $groupAssigneeId = $existingGroupAssignee->id;
        } else {
            $groupAssigneeId = DB::table('group_assignees')->insertGetId([
                'task_id' => $taskId,
                'user_group_id' => $groupId,
            ]);
        }

        $memberIds = DB::table('user_group_members')
            ->where('user_group_id', $groupId)
            ->pluck('user_id');

        $alreadyAssignedIds = DB::table('assignees')
            ->where('task_id', $taskId)
            ->whereIn('user_id', $memberIds)
            ->pluck('user_id');

        $toInsert = $memberIds->diff($alreadyAssignedIds);

        foreach ($toInsert as $userId) {
            DB::table('assignees')->insert([
                'task_id' => $taskId,
                'user_id' => $userId,
            ]);
        }

        $newAssignees = Assignee::with('user')
            ->where('task_id', $taskId)
            ->whereIn('user_id', $toInsert)
            ->get()
            ->map(function ($assignee) {
                return [
                    'id' => $assignee->id,
                    'task_id' => $assignee->task_id,
                    'user_id' => $assignee->user_id,
                    'user' => [
                        'id' => $assignee->user->id,
                        'name' => trim($assignee->user->first_name.' '.$assignee->user->last_name),
                        'photo_path' => $assignee->user->photo_path,
                    ],
                ];
            });

        return response()->json([
            'assignees' => $newAssignees,
            'group_assignee' => [
                'id' => $groupAssigneeId,
                'task_id' => $taskId,
                'user_group_id' => $groupId,
            ],
        ]);
    }
}
