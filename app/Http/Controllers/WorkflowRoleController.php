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

    public function store(Request $request)
    {
        $request->validate([
            'workflow_type' => 'required|string|in:' . implode(',', self::WORKFLOW_TYPES),
            'list_title' => 'required|string|max:255',
            'responsible_role' => 'required|string|max:50',
            'sla_hours' => 'nullable|integer|min:0',
            'requires_signature' => 'boolean',
            'is_terminal' => 'boolean',
        ]);

        $order = (int) EdocWorkflowRole::where('workflow_type', $request->input('workflow_type'))->max('order') + 1;

        $role = EdocWorkflowRole::create([
            'workflow_type' => $request->input('workflow_type'),
            'list_title' => $request->input('list_title'),
            'order' => $order,
            'responsible_role' => $request->input('responsible_role'),
            'sla_hours' => $request->input('sla_hours'),
            'requires_signature' => (bool) $request->input('requires_signature', false),
            'is_terminal' => (bool) $request->input('is_terminal', false),
        ]);

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