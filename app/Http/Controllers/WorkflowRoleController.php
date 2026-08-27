<?php

namespace App\Http\Controllers;

use App\Models\EdocWorkflowRole;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowRoleController extends Controller
{
    const WORKFLOW_TYPES = ['external_ministry', 'casino_operator', 'internal_cgmc'];

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
            'sub_roles' => WorkflowSubRole::ordered()->get(['id', 'code', 'name', 'order']),
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
        ]);

        $validated['order'] = (WorkflowSubRole::max('order') ?? -1) + 1;

        return response()->json(WorkflowSubRole::create($validated));
    }

    public function updateSubRole(Request $request, $id)
    {
        $subRole = WorkflowSubRole::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|regex:/^[A-Za-z0-9_-]+$/|unique:workflow_sub_roles,code,'.$subRole->id,
            'name' => 'required|string|max:255',
        ]);

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

        $subRole->delete();

        return response()->json(['success' => true]);
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|max:64|regex:/^[a-z0-9_]+$/',
            'list_title' => 'required|string|max:255',
            'workspace_id' => 'nullable|integer|exists:workspaces,id',
            'responsible_role' => 'nullable|string|max:100',
            'requires_signature' => 'boolean',
            'is_terminal' => 'boolean',
        ]);

        $maxOrder = EdocWorkflowRole::where('workflow_type', $validated['workflow_type'])->max('order');
        $validated['order'] = ($maxOrder ?? -1) + 1;

        $role = EdocWorkflowRole::create($validated);

        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        $role = EdocWorkflowRole::findOrFail($id);

        $request->validate([
            'list_title' => 'required|string|max:255',
            'workspace_id' => 'nullable|integer|exists:workspaces,id',
            'responsible_role' => 'required|string|max:50',
            'requires_signature' => 'boolean',
            'is_terminal' => 'boolean',
        ]);

        $role->update([
            'list_title' => $request->input('list_title'),
            'workspace_id' => $request->input('workspace_id'),
            'responsible_role' => $request->input('responsible_role'),
            'requires_signature' => (bool) $request->input('requires_signature', false),
            'is_terminal' => (bool) $request->input('is_terminal', false),
        ]);

        return response()->json($role);
    }

    public function destroy($id)
    {
        EdocWorkflowRole::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
