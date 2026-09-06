<?php

namespace App\Support;

use App\Events\UserAssignedToTask;
use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\EdocWorkflowRole;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use Illuminate\Support\Collection;

/**
 * Who a document lands on when it reaches a step.
 *
 * Extracted from DocumentSubmissionController because signing moves a document
 * too, and a second copy of these rules is how the register drifts: a document
 * forwarded by hand would reach the step's holders while the same document
 * signed onto the same step reached nobody.
 */
class StepAssignment
{
    /**
     * Assign the document to everyone carrying the step's responsibility.
     *
     * The chain is board title -> step -> responsible_role -> sub-role -> its
     * holders; a missing link just means nobody is assigned automatically, so
     * an unconfigured flow still moves. The actor is always skipped: putting
     * the document straight back on their own list would hide the hand-off.
     *
     * $handTo names the responsibilities chosen on a dynamic step (often
     * several - D1 through D5 at once). $assignTo names people outright and
     * settles the question; it is the only arm that works on a step carrying
     * no responsibility at all.
     */
    public static function assign(
        Task $task,
        int $workspaceId,
        BoardList $step,
        ?Collection $handTo = null,
        ?Collection $assignTo = null
    ): Collection {
        $alreadyOn = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        if ($assignTo && $assignTo->isNotEmpty()) {
            return self::putOnPlates(
                $task,
                User::whereIn('id', $assignTo->all())
                    ->where('id', '!=', auth()->id())
                    ->whereNotIn('id', $alreadyOn)
                    ->get()
            );
        }

        $code = EdocWorkflowRole::where('workspace_id', $workspaceId)
            ->where('list_title', $step->title)
            ->value('responsible_role');

        if (empty($code)) {
            return collect();
        }

        $subRole = WorkflowSubRole::where('code', $code)->first();

        if (empty($subRole)) {
            return collect();
        }

        $chosen = $handTo && $handTo->isNotEmpty()
            ? WorkflowSubRole::whereIn('code', $handTo->all())->get()
            : collect();

        $holders = fn (WorkflowSubRole $role) => User::where('workflow_sub_role_id', $role->id)
            ->where('id', '!=', auth()->id())
            ->whereNotIn('id', $alreadyOn)
            ->get();

        // Several departments can be picked at once, and one person can only be
        // put on the document once however many of them they carry.
        $owners = $chosen
            ->flatMap(fn (WorkflowSubRole $role) => $holders($role))
            ->unique('id')
            ->values();

        // Nobody carries the chosen department, or nothing was chosen because
        // the step is standard. Either way it falls back to the responsibility
        // the step names - and one that stands for others is carried by its
        // members, not by anyone filed directly under the group.
        if ($owners->isEmpty()) {
            $owners = self::holdersOfResponsibility($subRole, $alreadyOn);
        }

        return self::putOnPlates($task, $owners);
    }

    /**
     * Everyone carrying a responsibility: the people filed under it, and the
     * people filed under anything it stands for. The mirror of
     * User::responsibleStepsQuery().
     *
     * @param  array<int, int>  $exclude  user ids already on the document
     */
    public static function holdersOfResponsibility(WorkflowSubRole $role, array $exclude = []): Collection
    {
        $roleIds = WorkflowSubRole::where('id', $role->id)
            ->orWhere('parent_id', $role->id)
            ->pluck('id');

        return User::whereIn('workflow_sub_role_id', $roleIds)
            ->where('id', '!=', auth()->id())
            ->whereNotIn('id', $exclude)
            ->get();
    }

    /** Files the assignee rows and tells each person, in one place. */
    private static function putOnPlates(Task $task, Collection $owners): Collection
    {
        $assigner = auth()->user();

        foreach ($owners as $owner) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $owner->id]);
            event(new UserAssignedToTask($owner, $task, $assigner));
        }

        return $owners;
    }
}
