<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Activity;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\Task;
use App\Support\WorkflowStep;
use Illuminate\Support\Facades\DB;

/**
 * "Approve & Sign from Secretariat General".
 *
 * A column whose workflow step has `requires_signature` is where a document
 * waits for the Secretary General. The administration opens the last file
 * attached to the document, confirms, and the card moves on to the next column.
 *
 * Which columns these are is configuration, not code — see
 * Settings → Workflow Roles and App\Support\WorkflowStep.
 */
class SignatureRequestController extends Controller
{
    use AuthorizesTasks;

    /** What the popup needs: the file to review, and where the card goes next. */
    public function show($taskUid)
    {
        $task = $this->authorizeTask($taskUid, 'view');
        $list = BoardList::with('project')->find($task->list_id);

        return response()->json([
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'code' => $task->task_code ?: 'CGMC-'.str_pad((string) $task->id, 9, '0', STR_PAD_LEFT),
            ],
            'eligible' => $this->isEligible($task, $list),
            'current_step' => $this->stepPayload($list),
            'next_step' => $this->stepPayload($this->nextList($task, $list)),
            'attachment' => $this->latestAttachmentPayload($task),
            'attachment_count' => Attachment::where('task_id', $task->id)->count(),
        ]);
    }

    /**
     * Record the request and carry the card to the next column.
     *
     * The button is only rendered for the administration, but the UI is a
     * courtesy — the rule is enforced here.
     */
    public function store($taskUid)
    {
        $task = $this->authorizeTask($taskUid, 'move');
        $user = auth()->user();
        $list = BoardList::with('project')->find($task->list_id);

        if (!$user || !$user->isAdmin()) {
            abort(403, 'Only the administration may request approval and signature.');
        }

        if (!WorkflowStep::requiresSignature($list)) {
            abort(422, 'This board does not require a signature.');
        }

        $next = $this->nextList($task, $list);

        if (!$next) {
            abort(422, 'There is no next board to move this document to.');
        }

        DB::transaction(function () use ($task, $list, $next, $user) {
            Activity::create([
                'user_id' => $user->id,
                'task_id' => $task->id,
                'field_changed' => 'signature_requested',
                'old_value' => $list?->title,
                'new_value' => $next->title,
            ]);

            // Land at the bottom of the destination column, signed off.
            $task->list_id = $next->id;
            $task->order = (int) Task::where('list_id', $next->id)->max('order') + 1;
            $task->is_done = 1;
            $task->save();
        });

        return response()->json([
            'moved' => true,
            'task_id' => $task->id,
            'from_list_id' => $list?->id,
            'to_list_id' => $next->id,
            'to_list_title' => $next->title,
            'order' => $task->order,
            'is_done' => 1,
        ]);
    }

    private function isEligible(Task $task, ?BoardList $list): bool
    {
        $user = auth()->user();

        return $user
            && $user->isAdmin()
            && !$task->is_done
            && WorkflowStep::requiresSignature($list)
            && $this->nextList($task, $list) !== null;
    }

    /** The next open column of the same project, by board order. */
    private function nextList(Task $task, ?BoardList $list): ?BoardList
    {
        if (!$list) {
            return null;
        }

        return BoardList::where('project_id', $task->project_id)
            ->isOpen()
            ->where(function ($query) use ($list) {
                $query->where('order', '>', $list->order)
                    ->orWhere(function ($tie) use ($list) {
                        $tie->where('order', $list->order)->where('id', '>', $list->id);
                    });
            })
            ->orderBy('order')
            ->orderBy('id')
            ->first();
    }

    private function stepPayload(?BoardList $list): ?array
    {
        if (!$list) {
            return null;
        }

        $step = WorkflowStep::forList($list);

        return [
            'list_id' => $list->id,
            'title' => $list->title,
            'responsible_role' => $step->responsible_role ?? null,
            'requires_signature' => (bool) ($step->requires_signature ?? false),
            'is_terminal' => (bool) ($step->is_terminal ?? false),
        ];
    }

    private function latestAttachmentPayload(Task $task): ?array
    {
        $attachment = Attachment::where('task_id', $task->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();

        if (!$attachment) {
            return null;
        }

        return [
            'id' => $attachment->id,
            'name' => $attachment->name,
            'path' => $attachment->path,
            'created_at' => $attachment->created_at,
            'view_url' => route('task.attachment.view', [
                'taskUid' => $task->id,
                'attachmentId' => $attachment->id,
            ]),
        ];
    }
}
