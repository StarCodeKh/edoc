<?php

namespace Tests\Feature;

use App\Models\EdocWorkflowRole;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkflowSubRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The responsibilities a workflow step can be handed to.
 *
 * They are their own list rather than rows in `roles`, because `roles.slug` is
 * what User::isAdmin() reads - these name who should act on a step, they grant
 * nothing.
 */
class WorkflowSubRoleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->user = User::factory()->create(['role_id' => $role->id]);

        $this->actingAs($this->user);
    }

    private function step(array $overrides = []): EdocWorkflowRole
    {
        static $order = 0;

        return EdocWorkflowRole::create(array_merge([
            'workflow_type' => 'internal_cgmc',
            'list_title' => 'Registry',
            'order' => $order++,
            'responsible_role' => 'sg',
        ], $overrides));
    }

    public function test_the_settings_page_carries_the_list(): void
    {
        WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        $this->get(route('workflow-roles'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Settings/WorkflowRoles')
                ->has('sub_roles', 1)
                ->where('sub_roles.0.code', 'sg')
                ->where('sub_roles.0.name', 'Secretary General')
            );
    }

    public function test_one_can_be_added(): void
    {
        $this->post(route('workflow-roles.sub.create'), ['code' => 'dpt', 'name' => 'Department'])
            ->assertOk();

        $this->assertDatabaseHas('workflow_sub_roles', ['code' => 'dpt', 'name' => 'Department']);
    }

    public function test_codes_are_unique_and_constrained(): void
    {
        WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        $this->postJson(route('workflow-roles.sub.create'), ['code' => 'sg', 'name' => 'Duplicate'])
            ->assertStatus(422);

        // Steps store the bare code, so a space or slash would be a footgun.
        $this->postJson(route('workflow-roles.sub.create'), ['code' => 'a b/c', 'name' => 'Bad'])
            ->assertStatus(422);

        $this->assertSame(1, WorkflowSubRole::count());
    }

    /**
     * Steps hold the code as a string, not a foreign key, so a rename that did
     * not carry across would leave every step pointing at nothing.
     */
    public function test_renaming_a_code_carries_it_across_the_steps_using_it(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        $using = $this->step(['responsible_role' => 'sg']);
        $other = $this->step(['responsible_role' => 'admin']);

        $this->post(route('workflow-roles.sub.update', $subRole->id), [
            'code' => 'secgen',
            'name' => 'Secretary General',
        ])->assertOk();

        $this->assertSame('secgen', $using->fresh()->responsible_role);
        $this->assertSame('admin', $other->fresh()->responsible_role, 'Only the renamed code should move.');
    }

    public function test_one_still_in_use_cannot_be_deleted(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);
        $this->step(['responsible_role' => 'sg']);

        $this->postJson(route('workflow-roles.sub.delete', $subRole->id))
            ->assertStatus(422)
            ->assertJson(['error' => true]);

        $this->assertDatabaseHas('workflow_sub_roles', ['id' => $subRole->id]);
    }

    public function test_an_unused_one_can_be_deleted(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'unused', 'name' => 'Nobody', 'order' => 0]);

        $this->post(route('workflow-roles.sub.delete', $subRole->id))->assertOk();

        $this->assertDatabaseMissing('workflow_sub_roles', ['id' => $subRole->id]);
    }

    /**
     * These routes shipped without auth middleware while every route around them
     * had it - a logged-out visitor could read and rewrite workflow settings.
     * This covers the whole group, not just the three added with the list.
     */
    public function test_the_whole_workflow_settings_area_requires_a_login(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);
        $step = $this->step();

        auth()->logout();

        $login = route('login');

        $this->get(route('workflow-roles'))->assertRedirect($login);
        $this->get(route('workflow-roles.board-lists'))->assertRedirect($login);
        $this->get(route('workflow-roles.types'))->assertRedirect($login);
        $this->post(route('workflow-roles.create'))->assertRedirect($login);
        $this->post(route('workflow-roles.update', $step->id))->assertRedirect($login);
        $this->post(route('workflow-roles.delete', $step->id))->assertRedirect($login);
        $this->post(route('workflow-roles.assign-workspace'))->assertRedirect($login);
        $this->post(route('workflow-roles.sub.update', $subRole->id))->assertRedirect($login);
        $this->post(route('workflow-roles.sub.delete', $subRole->id))->assertRedirect($login);

        $this->assertDatabaseHas('workflow_sub_roles', ['id' => $subRole->id]);
        $this->assertDatabaseHas('edoc_workflow_roles', ['id' => $step->id]);
    }

    public function test_a_user_can_be_given_a_responsibility(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        $this->get(route('users.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('sub_roles', 1));

        $this->post(route('users.store'), [
            'first_name' => 'Sok',
            'last_name' => 'Dara',
            'email' => 'sok.dara@example.test',
            'workflow_sub_role_id' => $subRole->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'sok.dara@example.test',
            'workflow_sub_role_id' => $subRole->id,
        ]);
    }

    /**
     * Unlike role_id, an empty value is written through - clearing someone's
     * responsibility has to be possible, not just changing it.
     */
    public function test_a_responsibility_can_be_cleared(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);
        $person = User::factory()->create([
            'role_id' => $this->user->role_id,
            'workflow_sub_role_id' => $subRole->id,
        ]);

        $this->put(route('users.update', $person->id), [
            'first_name' => $person->first_name,
            'last_name' => $person->last_name,
            'email' => $person->email,
            'workflow_sub_role_id' => null,
        ])->assertRedirect();

        $this->assertNull($person->fresh()->workflow_sub_role_id);
    }

    public function test_one_assigned_to_a_user_cannot_be_deleted(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);
        User::factory()->create(['role_id' => $this->user->role_id, 'workflow_sub_role_id' => $subRole->id]);

        $this->postJson(route('workflow-roles.sub.delete', $subRole->id))
            ->assertStatus(422)
            ->assertJson(['error' => true]);

        $this->assertDatabaseHas('workflow_sub_roles', ['id' => $subRole->id]);
    }

    public function test_a_guest_cannot_manage_the_list(): void
    {
        auth()->logout();

        $this->post(route('workflow-roles.sub.create'), ['code' => 'x', 'name' => 'X'])
            ->assertRedirect(route('login'));

        $this->assertSame(0, WorkflowSubRole::count());
    }
}
