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
 *   Normal User  - sees only documents assigned to them or created by them;
 *                 may review / edit / delete a document they created only while
 *                 it still sits in the board it was created in; once it moves on
 *                 they may no longer change it. On a document created by the
 *                 administration and assigned to them, they may only attach
 *                 files and leave comments.
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
        return $user->isAdmin() || self::isOwner($user, $task) || self::isAssigned($user, $task);
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
        return self::isOwner($user, $task) && ! $task->hasLeftOriginList();
    }

    /** Moving between boards is an edit, kept separate so it can diverge later. */
    public static function canMove(User $user, Task $task): bool
    {
        return self::canEdit($user, $task);
    }

    /** Deleting is only ever the administration's or the untouched creator's. */
    public static function canDelete(User $user, Task $task): bool
    {
        return self::canEdit($user, $task);
    }

    /**
     * Attaching a document and commenting are the two things a Normal User keeps
     * on work handed to them - so anyone who can edit, plus any assignee.
     */
    public static function canAttach(User $user, Task $task): bool
    {
        return self::canEdit($user, $task) || self::isAssigned($user, $task);
    }

    public static function canComment(User $user, Task $task): bool
    {
        return self::canAttach($user, $task);
    }

    /** The whole answer, in the shape the front end consumes. */
    public static function summary(User $user, Task $task): array
    {
        return [
            'view'    => self::canView($user, $task),
            'edit'    => self::canEdit($user, $task),
            'move'    => self::canMove($user, $task),
            'delete'  => self::canDelete($user, $task),
            'attach'  => self::canAttach($user, $task),
            'comment' => self::canComment($user, $task),
        ];
    }
}
