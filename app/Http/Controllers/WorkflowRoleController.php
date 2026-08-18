<?php

namespace App\Http\Controllers;

use App\Models\EdocWorkflowRole;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowRoleController extends Controller
{
    const WORKFLOW_TYPES = ['external_ministry', 'casino_operator', 'internal_cgmc'];

    public function index()
    {
        $roles = EdocWorkflowRole::orderBy('workflow_type')->orderBy('order')->get();

        return Inertia::render('Settings/WorkflowRoles', [
            'title' => 'Workflow Roles',
            'roles' => $roles,
            'workflow_types' => self::WORKFLOW_TYPES,
        ]);
    }

    public function listTitlesByWorkspace()
    {
        $roles = EdocWorkflowRole::whereNotNull('workspace_id')
            ->orderBy('workspace_id')
            ->orderBy('order')
            ->get(['id', 'workspace_id', 'list_title']);
 
        $workspaces = $roles->groupBy('workspace_id')->map(function ($items, $workspaceId) {
            return [
                'id' => (int) $workspaceId,
                'boards' => $items->map(fn ($r) => ['id' => $r->id, 'name' => $r->list_title])->values(),
            ];
        })->values();
 
        return response()->json(['workspaces' => $workspaces]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|max:64|regex:/^[a-z0-9_]+$/',
            'list_title' => 'required|string|max:255',
            'responsible_role' => 'nullable|string|max:100',
            'sla_hours' => 'nullable|integer|min:0',
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
            'responsible_role' => 'required|string|max:50',
            'sla_hours' => 'nullable|integer|min:0',
            'requires_signature' => 'boolean',
            'is_terminal' => 'boolean',
        ]);

        $role->update([
            'list_title' => $request->input('list_title'),
            'responsible_role' => $request->input('responsible_role'),
            'sla_hours' => $request->input('sla_hours'),
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