<?php

namespace App\Support;

use App\Models\BoardList;
use App\Models\EdocWorkflowRole;
use Illuminate\Support\Collection;

/**
 * Board lists are created from the workflow steps configured in
 * Settings → Workflow Roles (see ProjectsController::jsonCreate), but nothing
 * links a board_lists row back to its edoc_workflow_roles row. This joins the
 * two back up by workspace + title, so the board can tell which of its columns
 * is a signature step.
 *
 * Titles are the join key because that is what jsonCreate copies across; the
 * step order is used only as a fallback for lists renamed after creation.
 */
class WorkflowStep
{
    /** @var array<int|string, Collection> */
    private static array $cache = [];

    /**
     * Forget the cached step sets.
     *
     * The cache exists so a page of documents costs one query rather than one
     * per row, which is right within a request. It is wrong the moment the
     * steps themselves change, or the process outlives the request - a queue
     * worker, or a test run where workspace ids repeat - so anything that
     * writes to edoc_workflow_roles clears it, and so does each test.
     */
    public static function flush(?int $workspaceId = null): void
    {
        if ($workspaceId === null) {
            self::$cache = [];

            return;
        }

        unset(self::$cache[$workspaceId]);
    }

    /** Every configured step for a workspace, keyed by normalised title. */
    public static function forWorkspace(?int $workspaceId): Collection
    {
        if (empty($workspaceId)) {
            return collect();
        }

        return self::$cache[$workspaceId] ??= EdocWorkflowRole::where('workspace_id', $workspaceId)
            ->orderBy('order')
            ->get()
            ->keyBy(fn ($role) => self::key($role->list_title));
    }

    /**
     * Add the workflow-step fields to each board list, so the front end can
     * decide what a column is without a second round trip.
     *
     * @param  array<int, array>  $lists  board_lists rows as arrays
     * @return array<int, array>
     */
    public static function decorate(array $lists, ?int $workspaceId): array
    {
        $steps = self::forWorkspace($workspaceId);
        $byOrder = $steps->values();

        foreach ($lists as $index => $list) {
            $step = $steps->get(self::key($list['title'] ?? '')) ?: $byOrder->get($index);

            $lists[$index]['workflow_step'] = $step ? [
                'id' => $step->id,
                'order' => $step->order,
                'responsible_role' => $step->responsible_role,
            ] : null;
            $lists[$index]['requires_signature'] = (bool) ($step->requires_signature ?? false);
            $lists[$index]['requires_attachment'] = (bool) ($step->requires_attachment ?? false);
            $lists[$index]['attachment_mode'] = $step->attachment_mode ?? 'standard';
            $lists[$index]['is_terminal'] = (bool) ($step->is_terminal ?? false);
            $lists[$index]['allows_merge'] = (bool) ($step->allows_merge ?? false);
            $lists[$index]['responsible_role'] = $step->responsible_role ?? null;
        }

        return $lists;
    }

    /** The step behind a single board list, or null when it has no match. */
    public static function forList(?BoardList $list): ?EdocWorkflowRole
    {
        if (!$list) {
            return null;
        }

        $workspaceId = $list->project?->workspace_id;
        $steps = self::forWorkspace($workspaceId ? (int) $workspaceId : null);

        return $steps->get(self::key($list->title))
            ?: $steps->values()->get((int) $list->order);
    }

    public static function requiresSignature(?BoardList $list): bool
    {
        return (bool) (self::forList($list)->requires_signature ?? false);
    }

    /**
     * The same answer from a workspace id and a board title, for listings that
     * hold many rows and must not load each one's project to find its
     * workspace. The per-workspace step set is cached, so a page of documents
     * costs one query however many rows it has.
     */
    public static function requiresSignatureForTitle(?int $workspaceId, ?string $title): bool
    {
        $step = self::forWorkspace($workspaceId)->get(self::key($title));

        return (bool) ($step->requires_signature ?? false);
    }

    /** Whether the step refuses to be passed on without a document on it. */
    public static function requiresAttachment(?BoardList $list): bool
    {
        return (bool) (self::forList($list)->requires_attachment ?? false);
    }

    /** 'standard' or 'dynamic' - only meaningful when an attachment is required. */
    public static function attachmentMode(?BoardList $list): string
    {
        return self::forList($list)->attachment_mode ?? 'standard';
    }

    /**
     * Whether a file may be filed against the step at all.
     *
     * A step that does not ask for a document has no reason to take one: it is
     * a review, and the document it reviews arrived with it. So the flag reads
     * both ways - it opens the upload, and it holds the step shut until the
     * upload happens.
     *
     * The one thing it does not govern is a signature. Saving a drawn-on copy
     * back is what `requires_signature` asks for, and it goes through the same
     * upload endpoint, so it is exempted there rather than here.
     */
    public static function acceptsAttachment(?BoardList $list): bool
    {
        return self::requiresAttachment($list);
    }

    /** 'standard' steps hold one document; a new upload replaces the old one. */
    public static function holdsOneAttachment(?BoardList $list): bool
    {
        return self::requiresAttachment($list) && self::attachmentMode($list) !== 'dynamic';
    }

    /**
     * Whether the step may combine the documents linked to the one it holds.
     *
     * Set per step rather than per person: gathering several files into one is
     * something a particular point in the flow does - the registry pulling a
     * case together before it goes up - not a right somebody carries around.
     */
    public static function allowsMerge(?BoardList $list): bool
    {
        return (bool) (self::forList($list)->allows_merge ?? false);
    }

    /** The step a document finishes on, where the workflow marks one. */
    public static function isTerminal(?BoardList $list): bool
    {
        return (bool) (self::forList($list)->is_terminal ?? false);
    }

    private static function key(?string $title): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $title)));
    }
}
