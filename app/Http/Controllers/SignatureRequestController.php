<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Activity;
use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\WorkflowSubRole;
use App\Support\DocumentChain;
use App\Support\StepAssignment;
use App\Support\TaskAbility;
use App\Support\WorkflowStep;
use Illuminate\Support\Facades\DB;

/**
 * "Approve & Sign from Secretariat General".
 *
 * A column whose step has `requires_signature` is where a document waits for
 * the Secretary General: open the last file, confirm, and the card moves on.
 * Which columns those are is configuration - Settings → Workflow Roles.
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

        if (!WorkflowStep::requiresSignature($list)) {
            abort(422, 'This board does not require a signature.');
        }

        // Who signs is the workflow's answer, not a hardcoded role: whoever
        // carries the responsibility this step names. See TaskAbility::canSign.
        if (!$user || !TaskAbility::canSign($user, $task)) {
            abort(403, 'Only the reviewer responsible for this step may approve and sign it.');
        }

        $next = $this->nextList($task, $list);

        if (!$next) {
            abort(422, 'There is no next board to move this document to.');
        }

        // Whether signing finishes the document is the workflow's answer, not
        // this controller's: it did `is_done = 1` on every signature, closing
        // documents that still had steps ahead of them. A step is the end of a
        // flow when it is configured as one - Settings → Workflow Roles.
        $finishes = WorkflowStep::isTerminal($next);

        // A finishing move is held by the same rule as a forward: internal work
        // raised off the document has to be finished first. A move that carries
        // on to another step is not.
        if ($finishes) {
            $pending = DocumentChain::pendingChildren($task);

            if ($pending->isNotEmpty()) {
                abort(422, DocumentChain::heldMessage($pending));
            }
        }

        DB::transaction(function () use ($task, $list, $next, $user, $finishes) {
            Activity::create([
                'user_id' => $user->id,
                'task_id' => $task->id,
                'field_changed' => 'signature_requested',
                'old_value' => $list?->title,
                'new_value' => $next->title,
            ]);

            $task->list_id = $next->id;
            $task->order = (int) Task::where('list_id', $next->id)->max('order') + 1;
            $task->is_done = $finishes ? 1 : 0;
            $task->save();

            // Signing hands the document on, so it lands on the plates of
            // whoever carries the step it reached - the same rule a forward
            // follows. Without this it arrived on the next board assigned to
            // nobody and notified nobody.
            Assignee::where('task_id', $task->id)->where('user_id', $user->id)->delete();

            if (!$finishes) {
                StepAssignment::assign($task, (int) $task->project->workspace_id, $next);
            }
        });

        // A finishing move may release an external document waiting on this one.
        if ($finishes) {
            DocumentChain::releaseParents($task->fresh(['list']), $user);
        }

        return response()->json([
            'moved' => true,
            'task_id' => $task->id,
            'from_list_id' => $list?->id,
            'to_list_id' => $next->id,
            'to_list_title' => $next->title,
            'order' => $task->order,
            'is_done' => $finishes ? 1 : 0,
        ]);
    }

    private function isEligible(Task $task, ?BoardList $list): bool
    {
        $user = auth()->user();

        return $user
            && TaskAbility::canSign($user, $task)
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

    /** A responsibility code as it reads on screen. */
    private function roleName(?string $code): ?string
    {
        return $code ? (WorkflowSubRole::where('code', $code)->value('name') ?: $code) : null;
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
            // The readable name behind that code. The button names whoever the
            // document is being sent to rather than one hardcoded office.
            'responsible_role_name' => $this->roleName($step->responsible_role ?? null),
            'requires_signature' => (bool) ($step->requires_signature ?? false),
            'requires_attachment' => (bool) ($step->requires_attachment ?? false),
            'attachment_mode' => $step->attachment_mode ?? 'standard',
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
