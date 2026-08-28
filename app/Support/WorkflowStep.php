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
