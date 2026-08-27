<?php

namespace App\Support;

use App\Models\Activity;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * External documents that wait on internal ones.
 *
 * An external document (ឯកសារខាងក្រៅ) often cannot be answered until CGMC has
 * done the work itself, which is raised as an internal document
 * (ឯកសារផ្ទៃក្នុង). The external one is then not finished until every internal
 * document raised off it is finished:
 *
 *   - it moves through its own steps normally;
 *   - the step that would finish it is refused while a child is still running;
 *   - when the last child finishes, that step is taken automatically.
 *
 * Both the guard and the propagation read from here, so the rule that blocks a
 * forward and the rule that releases it cannot drift apart.
 */
class DocumentChain
{
    /**
     * A document is finished when it has been marked done, or when it sits on a
     * step there is nothing after - either flagged terminal in Settings →
     * Workflow Roles, or simply the last board of its project.
     */
    public static function isComplete(Task $task): bool
    {
        if ((bool) $task->is_done) {
            return true;
        }

        $list = $task->relationLoaded('list') ? $task->list : $task->list()->first();

        if (empty($list)) {
            return false;
        }

        return WorkflowStep::isTerminal($list) || self::nextList($task, $list) === null;
    }

    /** Children raised off this document that have not finished yet. */
    public static function pendingChildren(Task $task): Collection
    {
        return $task->childDocuments()
            ->with('list')
            ->get()
            ->reject(fn (Task $child) => self::isComplete($child))
            ->values();
    }

    /**
     * Is this document being held open by work it raised? Only meaningful for
     * the step that would finish it - everything earlier moves freely.
     */
    public static function isHeld(Task $task): bool
    {
        return self::pendingChildren($task)->isNotEmpty();
    }

    /**
     * Would moving to this list finish the document? That is the one move the
     * hold applies to.
     */
    public static function wouldComplete(Task $task, ?BoardList $destination): bool
    {
        if (empty($destination)) {
            return false;
        }

        return WorkflowStep::isTerminal($destination) || self::nextList($task, $destination) === null;
    }

    /**
     * The message shown when a forward is refused, naming what is being waited
     * on - "blocked" with no reason is not an answer anyone can act on.
     */
    public static function heldMessage(Collection $pending): string
    {
        $first = $pending->first();

        if ($pending->count() === 1) {
            return __('This document cannot be closed yet: the internal document :code is still in progress.', [
                'code' => self::label($first),
            ]);
        }

        return __('This document cannot be closed yet: :count internal documents are still in progress, including :code.', [
            'count' => $pending->count(),
            'code' => self::label($first),
        ]);
    }

    /**
     * Called after a document finishes. Any external document that was waiting
     * only on this one now takes the step it was held on.
     *
     * @return Collection<int, Task> the parents that were completed
     */
    public static function releaseParents(Task $child, ?User $actor = null): Collection
    {
        $completed = collect();

        if (!self::isComplete($child)) {
            return $completed;
        }

        foreach ($child->parentDocuments()->with('list')->get() as $parent) {
            if (self::isComplete($parent) || self::isHeld($parent)) {
                continue;
            }

            if (self::complete($parent, $child, $actor)) {
                $completed->push($parent);
            }
        }

        return $completed;
    }

    /**
     * Take the finishing step on a parent whose children have all finished:
     * move it to the step it was waiting to reach, and mark it done.
     */
    private static function complete(Task $parent, Task $child, ?User $actor): bool
    {
        $list = $parent->relationLoaded('list') ? $parent->list : $parent->list()->first();
        $destination = $list ? self::nextList($parent, $list) : null;

        DB::transaction(function () use ($parent, $child, $actor, $destination) {
            if ($destination) {
                $parent->list_id = $destination->id;
                $parent->order = (int) Task::where('list_id', $destination->id)->max('order') + 1;
            }

            $parent->is_done = 1;
            $parent->save();

            // The trail has to say why this moved on its own, or it reads as a
            // document that closed itself.
            Activity::create([
                'user_id' => $actor?->id ?? $child->user_id,
                'task_id' => $parent->id,
                'field_changed' => 'closed_by_internal_document',
                'old_value' => 'closed this document — the internal document',
                'new_value' => '`'.self::label($child).'` finished',
            ]);
        });

        return true;
    }

    /** The next open board of the same project, by board order. */
    private static function nextList(Task $task, ?BoardList $list): ?BoardList
    {
        if (empty($list)) {
            return null;
        }

        return BoardList::where('project_id', $task->project_id)
            ->isOpen()
            ->where(function ($query) use ($list) {
                $query->where('order', '>', $list->order)
                    ->orWhere(function ($tie) use ($list) {
                        // Two boards can share an order; the id keeps it decidable.
                        $tie->where('order', $list->order)->where('id', '>', $list->id);
                    });
            })
            ->orderBy('order')
            ->orderBy('id')
            ->first();
    }

    /** How a document is named in messages and the trail. */
    public static function label(?Task $task): string
    {
        if (empty($task)) {
            return '';
        }

        return $task->task_code ?: ('#'.$task->id);
    }
}
