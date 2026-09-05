<?php

namespace App\Http\Controllers;

use App\Models\EdocWorkflowRole;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use App\Support\WorkflowStep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowRoleController extends Controller
{
    const WORKFLOW_TYPES = ['external_ministry', 'casino_operator', 'internal_cgmc'];

    /**
     * The two ways a step can be qualified: 'standard' is the fixed thing the
     * step always expects, 'dynamic' is decided per document as it passes.
     *
     * Served to the page rather than written into the template so the choices,
     * their order and their wording live in one place - the settings screen and
     * the validation rules can no longer drift apart.
     */
    const STEP_MODES = [
        ['value' => 'standard', 'label' => 'Standard'],
        ['value' => 'dynamic', 'label' => 'Dynamic'],
    ];

    public function index()
    {
        $roles = EdocWorkflowRole::orderBy('workflow_type')->orderBy('order')->get();

        $workflowTypes = collect(self::WORKFLOW_TYPES)
            ->merge($roles->pluck('workflow_type')->filter()->unique())
            ->unique()
            ->values();

        $workspaces = Workspace::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Settings/WorkflowRoles', [
            'title' => 'Workflow Roles',
            'roles' => $roles,
            'workflow_types' => $workflowTypes,
            'workspaces' => $workspaces,
            'sub_roles' => WorkflowSubRole::ordered()->get(['id', 'parent_id', 'code', 'name', 'order']),
            'step_modes' => self::STEP_MODES,
        ]);
    }

    public function listTitlesByWorkspace()
    {
        $roles = EdocWorkflowRole::whereNotNull('workspace_id')
            ->orderBy('workspace_id')
            ->orderBy('order')
            ->get(['id', 'workspace_id', 'workflow_type', 'list_title']);

        $workspaces = $roles->groupBy('workspace_id')->map(function ($items, $workspaceId) {
            return [
                'id' => (int) $workspaceId,
                'workflow_type' => $items->first()->workflow_type,
                'boards' => $items->map(fn ($r) => ['id' => $r->id, 'name' => $r->list_title])->values(),
            ];
        })->values();

        return response()->json(['workspaces' => $workspaces]);
    }

    public function assignWorkspace(Request $request)
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|max:64',
            'workspace_id' => 'required|integer|exists:workspaces,id',
        ]);

        EdocWorkflowRole::where('workspace_id', $validated['workspace_id'])
            ->where('workflow_type', '!=', $validated['workflow_type'])
            ->update(['workspace_id' => null]);

        $updated = EdocWorkflowRole::where('workflow_type', $validated['workflow_type'])
            ->update(['workspace_id' => $validated['workspace_id']]);
        WorkflowStep::flush();

        return response()->json(['success' => true, 'updated' => $updated]);
    }

    /**
     * The responsibilities a step can be handed to. Kept apart from Role, which
     * grants access - these only say who is expected to act.
     */
    public function storeSubRole(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|regex:/^[A-Za-z0-9_-]+$/|unique:workflow_sub_roles,code',
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:workflow_sub_roles,id',
        ]);

        if ($message = $this->parentProblem($validated['parent_id'] ?? null, null)) {
            return response()->json(['error' => true, 'message' => $message], 422);
        }

        $validated['order'] = (WorkflowSubRole::max('order') ?? -1) + 1;

        return response()->json(WorkflowSubRole::create($validated));
    }

    public function updateSubRole(Request $request, $id)
    {
        $subRole = WorkflowSubRole::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|regex:/^[A-Za-z0-9_-]+$/|unique:workflow_sub_roles,code,'.$subRole->id,
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:workflow_sub_roles,id',
        ]);

        if ($message = $this->parentProblem($validated['parent_id'] ?? null, $subRole)) {
            return response()->json(['error' => true, 'message' => $message], 422);
        }

        $previous = $subRole->code;
        $subRole->update($validated);

        // Steps store the code, not a foreign key, so a rename has to be carried
        // across or every step using it would silently point at nothing.
        if ($previous !== $subRole->code) {
            EdocWorkflowRole::where('responsible_role', $previous)
                ->update(['responsible_role' => $subRole->code]);
        }

        return response()->json($subRole);
    }

    public function destroySubRole($id)
    {
        $subRole = WorkflowSubRole::findOrFail($id);

        $steps = EdocWorkflowRole::where('responsible_role', $subRole->code)->count();

        if ($steps > 0) {
            return response()->json([
                'error' => true,
                'message' => __('This responsibility is used by :count step(s). Change those first.', ['count' => $steps]),
            ], 422);
        }

        // Users carry it too, and deleting it under them would leave the column
        // pointing at a row that no longer exists.
        $people = User::where('workflow_sub_role_id', $subRole->id)->count();

        if ($people > 0) {
            return response()->json([
                'error' => true,
                'message' => __('This responsibility is assigned to :count user(s). Change those first.', ['count' => $people]),
            ], 422);
        }

        $children = WorkflowSubRole::where('parent_id', $subRole->id)->count();

        if ($children > 0) {
            return response()->json([
                'error' => true,
                'message' => __('This responsibility stands for :count other(s). Move those out first.', ['count' => $children]),
            ], 422);
        }

        $subRole->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Nesting is one level deep and never circular: a responsibility cannot sit
     * under itself, under one of its own children, or under one that already
     * has a parent of its own.
     */
    private function parentProblem(?int $parentId, ?WorkflowSubRole $subject): ?string
    {
        if (empty($parentId)) {
            return null;
        }

        if ($subject && (int) $parentId === (int) $subject->id) {
            return __('A responsibility cannot sit under itself.');
        }

        $parent = WorkflowSubRole::find($parentId);

        if (empty($parent)) {
            return __('That responsibility no longer exists.');
        }

        if (!empty($parent->parent_id)) {
            return __('Responsibilities only nest one level deep.');
        }

        if ($subject && WorkflowSubRole::where('parent_id', $subject->id)->exists()) {
            return __('A responsibility that stands for others cannot be moved under another.');
        }

        return null;
    }

    public function workflowTypesSummary()
    {
        $rows = EdocWorkflowRole::select('workflow_type', 'workspace_id')->get();

        $summary = $rows->groupBy('workflow_type')->map(function ($items, $type) {
            $workspaceIds = $items->pluck('workspace_id')->filter()->unique()->values();

            return [
                'workflow_type' => $type,
                'steps' => $items->count(),
                'linked_workspace_id' => $workspaceIds->count() === 1 ? $workspaceIds->first() : null,
            ];
        })->values();

        return response()->json(['workflow_types' => $summary]);
    }

    /** The validation twin of STEP_MODES, so the two cannot drift apart. */
    private function stepModeRule(): string
    {
        return 'nullable|in:'.implode(',', array_column(self::STEP_MODES, 'value'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|max:64|regex:/^[a-z0-9_]+$/',
            'list_title' => 'required|string|max:255',
            'workspace_id' => 'nullable|integer|exists:workspaces,id',
            // The code has to name a responsibility that exists. Renaming one
            // carries across to its steps and deleting one is refused while
            // steps use it, so the UI cannot produce a dangling code - but the
            // endpoint could, and a step nobody is responsible for holds a
            // document forever without saying so.
            'responsible_role' => 'nullable|string|max:100|exists:workflow_sub_roles,code',
            'role_mode' => $this->stepModeRule(),
            'requires_signature' => 'boolean',
            'requires_attachment' => 'boolean',
            'attachment_mode' => $this->stepModeRule(),
            'is_terminal' => 'boolean',
            'allows_merge' => 'boolean',
        ]);

        $validated['attachment_mode'] = $validated['attachment_mode'] ?? 'standard';
        $validated['role_mode'] = $this->resolvedRoleMode($validated['responsible_role'] ?? null, $validated['role_mode'] ?? null);

        $maxOrder = EdocWorkflowRole::where('workflow_type', $validated['workflow_type'])->max('order');
        $validated['order'] = ($maxOrder ?? -1) + 1;

        $role = EdocWorkflowRole::create($validated);
        WorkflowStep::flush();

        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        $role = EdocWorkflowRole::findOrFail($id);

        $request->validate([
            'list_title' => 'required|string|max:255',
            'workspace_id' => 'nullable|integer|exists:workspaces,id',
            'responsible_role' => 'required|string|max:50|exists:workflow_sub_roles,code',
            'role_mode' => $this->stepModeRule(),
            'requires_signature' => 'boolean',
            'requires_attachment' => 'boolean',
            'attachment_mode' => $this->stepModeRule(),
            'is_terminal' => 'boolean',
            'allows_merge' => 'boolean',
        ]);

        $role->update([
            'list_title' => $request->input('list_title'),
            'workspace_id' => $request->input('workspace_id'),
            'responsible_role' => $request->input('responsible_role'),
            'role_mode' => $this->resolvedRoleMode($request->input('responsible_role'), $request->input('role_mode')),
            'requires_signature' => (bool) $request->input('requires_signature', false),
            'requires_attachment' => (bool) $request->input('requires_attachment', false),
            'attachment_mode' => $request->input('attachment_mode') ?: 'standard',
            'is_terminal' => (bool) $request->input('is_terminal', false),
            'allows_merge' => (bool) $request->input('allows_merge', false),
        ]);
        WorkflowStep::flush();

        return response()->json($role);
    }

    /**
     * A step can only be dynamic when its responsibility actually stands for
     * others - there would be nothing for the forwarder to choose from
     * otherwise, and the document would land on nobody.
     */
    private function resolvedRoleMode(?string $code, ?string $requested): string
    {
        if ($requested !== 'dynamic' || empty($code)) {
            return 'standard';
        }

        $parent = WorkflowSubRole::where('code', $code)->first();

        $standsForOthers = $parent && WorkflowSubRole::where('parent_id', $parent->id)->exists();

        return $standsForOthers ? 'dynamic' : 'standard';
    }

    public function destroy($id)
    {
        EdocWorkflowRole::findOrFail($id)->delete();
        WorkflowStep::flush();

        return response()->json(['success' => true]);
    }
}
