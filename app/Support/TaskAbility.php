<?php

namespace App\Support;

use App\Models\Task;
use App\Models\User;

/**
 * One place that answers "what may this user do with this document?".
 *
 * The rules, as given:
 *   Super Admin - everything in the system.
 *   Admin       - everything on every board flow.
 *   Registry    - ការិយាល័យ រដ្ឋបាល reads every document in every flow, and
 *                 acts on one only while it waits on a step of theirs, which
 *                 is the same rule every other responsibility is held to.
 *   Normal User  - sees documents assigned to them or created by them;
 *                 may review / edit / delete a document they created only while
 *                 it still sits in the board it was created in; once it moves on
 *                 they may no longer change it. On a document created by the
 *                 administration and assigned to them, they may only attach
 *                 files and leave comments. A document they are merely related
 *                 to - their group holds it, they follow it, they handled it at
 *                 an earlier step, or they commented on it - lists as normal but
 *                 opens read-only, with no action available on it at all.
 *
 * Controllers, policies and the Inertia payload all read from here, so the
 * answer cannot drift between the API and the buttons the UI shows.
 */
class TaskAbility
{
    public static function isOwner(User $user, Task $task): bool
    {
        return (int) $task->user_id === (int) $user->id;
    }

    public static function isAssigned(User $user, Task $task): bool
    {
        if ($task->relationLoaded('assignees')) {
            return $task->assignees->contains(fn ($assignee) => (int) $assignee->user_id === (int) $user->id);
        }

        return $task->assignees()->where('user_id', $user->id)->exists();
    }

    /** May the user open the document at all? */
    public static function canView(User $user, Task $task): bool
    {
        return $user->seesEveryDocument()
            || self::isOwner($user, $task)
            || self::isAssigned($user, $task)
            || self::isResponsibleForItsBoard($user, $task)
            || self::isRelatedTo($user, $task);
    }

    /**
     * The model-level twin of the related arm of Task::scopeVisibleTo: a group
     * the user belongs to holds the document, they follow it, they handled it
     * at an earlier workflow step, or they commented on it.
     *
     * This grants reading and nothing else. It is deliberately absent from
     * canEdit, canMove, canDelete and canAttach, which is what makes a related
     * document open as a detail page with no actions on it.
     *
     * The four checks are ordered cheapest-and-likeliest first and short
     * circuit, so the common case costs one query rather than four.
     */
    public static function isRelatedTo(User $user, Task $task): bool
    {
        return $task->activities()->where('user_id', $user->id)->exists()
            || $task->comments()->where('user_id', $user->id)->exists()
            || $task->watchers()->where('users.id', $user->id)->exists()
            || $task->groupAssignees()
                ->whereHas('userGroup.members', fn ($members) => $members->where('users.id', $user->id))
                ->exists();
    }

    /**
     * The model-level twin of the responsibility arm of Task::scopeVisibleTo.
     * Both have to agree, or a document would list but refuse to open.
     */
    public static function isResponsibleForItsBoard(User $user, Task $task): bool
    {
        $titles = $user->responsibleListTitles();

        if (empty($titles)) {
            return false;
        }

        $title = optional($task->relationLoaded('list') ? $task->list : $task->list()->first())->title;

        return $title !== null && in_array($title, $titles, true);
    }

    /**
     * May the user change the document itself - title, description, priority,
     * due date, labels, checklists, assignees, and moving it between boards?
     */
    public static function canEdit(User $user, Task $task): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Their own document, still in the board it was created in.
        return self::isOwner($user, $task) && !$task->hasLeftOriginList();
    }

    /**
     * Moving between boards, which is where this parts company with canEdit.
     *
     * Whoever is responsible for the board a document is sitting on may send it
     * onward - that is the job. It deliberately does not extend to canEdit:
     * being the reviewer of a step is not licence to rewrite the document's
     * title, dates or priority, and canDelete stays narrower still.
     */
    public static function canMove(User $user, Task $task): bool
    {
        return self::canEdit($user, $task) || self::isResponsibleForItsBoard($user, $task);
    }

    /** Deleting is only ever the administration's or the untouched creator's. */
    public static function canDelete(User $user, Task $task): bool
    {
        return self::canEdit($user, $task);
    }

    /**
     * Attaching a document and commenting are the two things a Normal User keeps
     * on work handed to them - so anyone who can edit, plus any assignee, plus
     * whoever is responsible for the board it is waiting on.
     */
    public static function canAttach(User $user, Task $task): bool
    {
        return self::canEdit($user, $task)
            || self::isAssigned($user, $task)
            || self::isResponsibleForItsBoard($user, $task);
    }

    public static function canComment(User $user, Task $task): bool
    {
        return self::canAttach($user, $task);
    }

    /**
     * Taking a file back off a document.
     *
     * The same people who may attach, right up until the document is finished.
     * A closed document keeps the record it was closed with: whatever was on it
     * at the end is what the file says happened, so nothing comes off it
     * afterwards. Attaching is deliberately not held to this - that is the
     * step's own rule, in WorkflowStep::acceptsAttachment.
     */
    public static function canDetach(User $user, Task $task): bool
    {
        return !$task->is_done && self::canAttach($user, $task);
    }

    /**
     * Drawing on a document and signing it are the same permission: both mark
     * the file as having been through a reviewer, so both are the act of the
     * step's reviewer and nobody else.
     *
     * It takes the board's own workflow step as the first condition - a step
     * without ហត្ថលេខា ticked in Settings → Workflow Roles is never signable,
     * whoever is looking at it - and then asks whether this user is the one
     * holding that step. Admin keeps it, as it keeps every other ability here.
     * Everyone else opens the file read-only.
     */
    public static function canSign(User $user, Task $task): bool
    {
        if ($task->is_done) {
            return false;
        }

        $list = $task->relationLoaded('list') ? $task->list : $task->list()->first();

        if (!WorkflowStep::requiresSignature($list)) {
            return false;
        }

        return $user->isAdmin() || self::isResponsibleForItsBoard($user, $task);
    }

    /**
     * Combining the documents linked to this one into a single file.
     *
     * The step asks for it first - a step without បញ្ចូលឯកសារ ticked in
     * Settings → Workflow Roles never merges, whoever is looking at it - and
     * then it is the person holding that step, exactly as signing is. A
     * finished document is left as it was closed.
     */
    public static function canMerge(User $user, Task $task): bool
    {
        if ($task->is_done) {
            return false;
        }

        $list = $task->relationLoaded('list') ? $task->list : $task->list()->first();

        if (!WorkflowStep::allowsMerge($list)) {
            return false;
        }

        return $user->isAdmin() || self::isResponsibleForItsBoard($user, $task);
    }

    /** The whole answer, in the shape the front end consumes. */
    public static function summary(User $user, Task $task): array
    {
        return [
            'view' => self::canView($user, $task),
            'edit' => self::canEdit($user, $task),
            'move' => self::canMove($user, $task),
            'delete' => self::canDelete($user, $task),
            'attach' => self::canAttach($user, $task),
            'comment' => self::canComment($user, $task),
            'detach' => self::canDetach($user, $task),
            'sign' => self::canSign($user, $task),
            'merge' => self::canMerge($user, $task),
        ];
    }
}
