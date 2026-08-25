<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * System-wide audit trail: every recorded change on every document, across all
 * workspaces. Limited to the Super Admin (see EnsureSuperAdmin) - unlike the
 * per-document trail in the board drawer, this one is deliberately not scoped
 * by Task::scopeVisibleTo, because its whole purpose is oversight.
 */
class AuditLogController extends Controller
{
    /** field_changed values the app writes, for the action filter. */
    private const ACTIONS = [
        'list_id'             => 'Moved between boards',
        'signature_requested' => 'Approval & signature requested',
        'is_done'             => 'Completion changed',
        'is_archive'          => 'Archive status changed',
        'title'               => 'Title changed',
        'description'         => 'Description updated',
        'priority_id'         => 'Priority changed',
        'due_date'            => 'Due date changed',
        'order'               => 'Reordered',
        'cover'               => 'Cover image changed',
        'comment'             => 'Comment posted',
        'comment_edit'        => 'Comment edited',
        'comment_delete'      => 'Comment deleted',
        'deleted_at'          => 'Deleted or restored',
    ];

    /** One entry, in full — the list stays terse, this fills in the rest. */
    public function show($id)
    {
        $entry = Activity::with([
            'user:id,first_name,last_name,email,photo_path,title',
            'task:id,title,task_code,project_id,list_id,is_done,created_at',
            'task.project:id,title,slug',
            'task.list:id,title',
        ])->findOrFail($id);

        return response()->json([
            'id' => $entry->id,
            'action' => $entry->field_changed,
            'action_label' => self::ACTIONS[$entry->field_changed] ?? $entry->field_changed,
            'old_value' => $entry->old_value,
            'new_value' => $entry->new_value,
            'created_at' => optional($entry->created_at)->toIso8601String(),
            'user' => $entry->user ? [
                'id' => $entry->user->id,
                'name' => trim($entry->user->first_name.' '.$entry->user->last_name),
                'email' => $entry->user->email,
                'title' => $entry->user->title,
                'photo' => $entry->user->photo_path,
            ] : null,
            'task' => $entry->task ? [
                'id' => $entry->task->id,
                'code' => $entry->task->task_code,
                'title' => $entry->task->title,
                'is_done' => (bool) $entry->task->is_done,
                'created_at' => optional($entry->task->created_at)->toIso8601String(),
                'current_board' => optional($entry->task->list)->title,
                'project' => $entry->task->project ? [
                    'id' => $entry->task->project->id,
                    'slug' => $entry->task->project->slug,
                    'title' => $entry->task->project->title,
                ] : null,
            ] : null,
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->only('search', 'action', 'user', 'from', 'to');

        $entries = Activity::query()
            ->with([
                'user:id,first_name,last_name,photo_path,title',
                'task:id,title,task_code,project_id',
                'task.project:id,title,slug',
            ])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('task', fn ($t) => $t
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('task_code', 'like', "%{$search}%"))
                      ->orWhereHas('user', fn ($u) => $u
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"))
                      ->orWhere('old_value', 'like', "%{$search}%")
                      ->orWhere('new_value', 'like', "%{$search}%");
                });
            })
            ->when($filters['action'] ?? null, fn ($q, $action) => $q
                ->whereIn('field_changed', array_filter(explode(',', (string) $action))))
            ->when($filters['user'] ?? null, fn ($q, $user) => $q
                ->whereIn('user_id', array_filter(explode(',', (string) $user))))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Activity $entry) => [
                'id' => $entry->id,
                'action' => $entry->field_changed,
                'old_value' => $entry->old_value,
                'new_value' => $entry->new_value,
                'created_at' => optional($entry->created_at)->toIso8601String(),
                'user' => $entry->user ? [
                    'id' => $entry->user->id,
                    'name' => trim($entry->user->first_name.' '.$entry->user->last_name),
                    'title' => $entry->user->title,
                    'photo' => $entry->user->photo_path,
                ] : null,
                'task' => $entry->task ? [
                    'id' => $entry->task->id,
                    'code' => $entry->task->task_code,
                    'title' => $entry->task->title,
                    'project' => $entry->task->project ? [
                        'id' => $entry->task->project->id,
                        'slug' => $entry->task->project->slug,
                        'title' => $entry->task->project->title,
                    ] : null,
                ] : null,
            ]);

        // Only offer actions and people that actually appear in the log.
        $usedActions = Activity::distinct()->pluck('field_changed')->filter()->all();
        $actorIds = Activity::distinct()->pluck('user_id')->filter()->all();

        return Inertia::render('AuditLog/Index', [
            'title' => 'Audit Log',
            'entries' => $entries,
            'filters' => $filters,
            'actions' => collect($usedActions)
                ->map(fn ($action) => [
                    'value' => $action,
                    'label' => self::ACTIONS[$action] ?? $action,
                ])
                ->sortBy('label')
                ->values(),
            'actors' => User::whereIn('id', $actorIds)
                ->orderByName()
                ->get(['id', 'first_name', 'last_name', 'photo_path'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => trim($user->first_name.' '.$user->last_name),
                    'photo' => $user->photo_path,
                ]),
            'total' => Activity::count(),
        ]);
    }
}
