/**
 * Front-end mirror of App\Support\TaskAbility.
 *
 * The server is the authority - every endpoint checks for itself. This exists so
 * the UI can hide what would be refused, instead of offering a button that 403s.
 *
 * The rules:
 *   Super Admin / Admin - everything.
 *   Normal User         - sees only documents assigned to them or created by
 *                         them; may edit / delete / move a document they created
 *                         only while it still sits in the board it was created
 *                         in; on anything else they may only attach files and
 *                         comment.
 */

export function isAdmin(user) {
    return !!(user && user.role && user.role.slug === 'admin');
}

export function isOwner(user, task) {
    return !!(user && task && Number(task.user_id) === Number(user.id));
}

export function isAssigned(user, task) {
    if (!user || !task || !Array.isArray(task.assignees)) return false;
    return task.assignees.some((a) => Number(a.user_id) === Number(user.id));
}

/** Has the document moved on from the board it was created in? */
export function hasLeftOriginList(task) {
    if (!task || !task.origin_list_id) return false;
    return Number(task.list_id) !== Number(task.origin_list_id);
}

export function canView(user, task) {
    return isAdmin(user) || isOwner(user, task) || isAssigned(user, task);
}

/** Title, description, priority, due date, labels, checklists, assignees, merge. */
export function canEdit(user, task) {
    if (isAdmin(user)) return true;
    return isOwner(user, task) && !hasLeftOriginList(task);
}

export const canMove = canEdit;
export const canDelete = canEdit;

/** The two things a Normal User keeps on work handed to them. */
export function canAttach(user, task) {
    return canEdit(user, task) || isAssigned(user, task);
}

export const canComment = canAttach;

export function abilities(user, task) {
    return {
        view: canView(user, task),
        edit: canEdit(user, task),
        move: canMove(user, task),
        delete: canDelete(user, task),
        attach: canAttach(user, task),
        comment: canComment(user, task),
    };
}
