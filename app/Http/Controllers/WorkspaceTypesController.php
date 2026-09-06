<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RedirectIfNotAdmin;
use App\Models\WorkspaceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class WorkspaceTypesController extends Controller
{
    public function __construct()
    {
        $this->middleware(RedirectIfNotAdmin::class);
    }

    public function create()
    {
        return Inertia::render('WorkspaceTypes/Create', [
            'title' => 'Create a new workspace type',
        ]);
    }

    public function jsonGet()
    {
        $types = WorkspaceType::get()->toArray();

        return response()->json(['types' => $types]);
    }

    public function index(Request $request)
    {
        return Inertia::render('WorkspaceTypes/Index', [
            'title' => 'Workspace Type',
            'filters' => $request->all(['search']),
            'workspace_types' => WorkspaceType::orderBy('name')
                ->filter($request->all(['search']))
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($workspace_type) => [
                    'id' => $workspace_type->id,
                    'name' => $workspace_type->name,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $userRequest = $request->validate([
            'name' => ['required', 'max:50'],
        ]);

        WorkspaceType::create($userRequest);

        return Redirect::route('workspace_types.index')->with('success', __('Workspace type created.'));
    }

    public function update(WorkspaceType $workspaceType, Request $request)
    {
        if (config('app.demo')) {
            return Redirect::back()->with('error', __('Updating workspace type is not allowed for the live demo.'));
        }

        $userRequest = $request->validate([
            'name' => ['required', 'max:50'],
        ]);

        $workspaceType->update(['name' => $userRequest['name']]);

        return Redirect::route('workspace_types.index')->with('success', __('Workspace type updated.'));
    }

    public function edit(WorkspaceType $workspaceType)
    {
        return Inertia::render('WorkspaceTypes/Edit', [
            'title' => $workspaceType->name,
            'workspace_type' => [
                'id' => $workspaceType->id,
                'name' => $workspaceType->name,
            ],
        ]);
    }

    public function destroy(WorkspaceType $workspaceType)
    {

        if (config('app.demo')) {
            return Redirect::back()->with('error', __('Deleting workspace type is not allowed for the live demo.'));
        }

        $workspaceType->delete();

        return Redirect::route('workspace_types.index')->with('success', __('Workspace type deleted!'));
    }
}
