<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RedirectIfNotAdmin;
use App\Models\Role;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class RolesController extends Controller {
    public function __construct(){
        $this->middleware(RedirectIfNotAdmin::class);
    }

    public function create(){
        return Inertia::render('Roles/Create',[
            'title' => 'Create a new role'
        ]);
    }

    public function index(){
        return Inertia::render('Roles/Index', [
            'title' => 'User Roles',
            'filters' => Request::all(['search', 'role_id']),
            'roles' => Role::orderByName()
                ->filter(Request::all(['search']))
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'create_workspace' => $role->create_workspace,
                    'create_project' => $role->create_project,
                    'slug' => $role->slug,
                    'updated_at' => $role->updated_at,
                ]),
        ]);
    }

    public function store(){
        $userRequest = Request::validate([
            'name' => ['required', 'max:50'],
            'slug' => ['required', 'max:50'],
            'create_workspace' => ['max:50'],
            'create_project' => ['max:50'],
        ]);

        Role::create(['slug' => $userRequest['slug'], 'name' => $userRequest['name'], 'create_workspace' => $userRequest['create_workspace'] ?? 0, 'create_project' => $userRequest['create_project'] ?? 0]);
        return Redirect::route('roles')->with('success', 'Role created.');
    }

    public function edit(Role $role) {
        return Inertia::render('Roles/Edit', [
            'title' => $role->name,
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'create_workspace' => $role->create_workspace,
                'create_project' => $role->create_project,
                'updated_at' => $role->updated_at,
            ],
        ]);
    }

    public function update(Role $role) {
        if (config('app.demo')) {
            return Redirect::back()->with('error', 'Updating role is not allowed for the live demo.');
        }

        $userRequest = Request::validate([
            'name' => ['required', 'max:50'],
            'slug' => ['required', 'max:50'],
            'create_workspace' => ['max:50'],
            'create_project' => ['max:50'],
        ]);

        $role->update(['slug' => $userRequest['slug'], 'name' => $userRequest['name'], 'create_workspace' => $userRequest['create_workspace'] ?? 0, 'create_project' => $userRequest['create_project'] ?? 0]);
        return Redirect::back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role) {
        if (config('app.demo')) {
            return Redirect::back()->with('error', 'Deleting role is not allowed for the live demo.');
        }
        $role->delete();
        return Redirect::route('roles')->with('success', 'The role has been deleted!');
    }
}
