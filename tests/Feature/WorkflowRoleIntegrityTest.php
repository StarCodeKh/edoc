<?php

namespace Tests\Feature;

use App\Models\EdocWorkflowRole;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The rules that keep Settings → Workflow Roles from producing a flow that
 * looks configured and routes nothing.
 *
 * A step names its responsibility by code rather than by foreign key, so three
 * guards stand in for the constraint the schema does not have: a rename carries
 * across, a delete is refused while anything still points at it, and a code
 * that names nothing is rejected on the way in.
 */
class WorkflowRoleIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->admin = User::factory()->create(['role_id' => $role->id]);
        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->admin->id,
            'type_id' => null,
            'slug' => 'flow',
        ]);

        $this->actingAs($this->admin);
    }

    private function makeStep(array $overrides = [])
    {
        return $this->postJson('/workflow-roles/create', array_merge([
            'workflow_type' => 'probe_flow',
            'list_title' => 'Registry',
            'workspace_id' => $this->workspace->id,
            'responsible_role' => 'asg',
        ], $overrides));
    }

    public function test_a_step_cannot_name_a_responsibility_that_does_not_exist(): void
    {
        $this->makeStep(['responsible_role' => 'no_such_code'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('responsible_role');

        $this->assertSame(0, EdocWorkflowRole::count());
    }

    public function test_renaming_a_responsibility_carries_across_to_its_steps(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'asg', 'name' => 'ASG', 'order' => 0]);
        $this->makeStep()->assertOk();

        $this->postJson('/workflow-roles/sub-roles/update/'.$subRole->id, [
            'code' => 'asg2',
            'name' => 'ASG',
        ])->assertOk();

        $this->assertSame('asg2', EdocWorkflowRole::first()->responsible_role);
    }

    public function test_a_responsibility_in_use_cannot_be_deleted(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'asg', 'name' => 'ASG', 'order' => 0]);
        $this->makeStep()->assertOk();

        $this->postJson('/workflow-roles/sub-roles/delete/'.$subRole->id)
            ->assertStatus(422)
            ->assertJson(['error' => true]);

        $this->assertNotNull(WorkflowSubRole::find($subRole->id));
    }

    public function test_a_responsibility_someone_carries_cannot_be_deleted(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'SG', 'order' => 0]);
        User::factory()->create(['workflow_sub_role_id' => $subRole->id]);

        $this->postJson('/workflow-roles/sub-roles/delete/'.$subRole->id)
            ->assertStatus(422);

        $this->assertNotNull(WorkflowSubRole::find($subRole->id));
    }

    public function test_a_responsibility_standing_for_others_cannot_be_deleted(): void
    {
        $parent = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);
        WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 1, 'parent_id' => $parent->id]);

        $this->postJson('/workflow-roles/sub-roles/delete/'.$parent->id)
            ->assertStatus(422);

        $this->assertNotNull(WorkflowSubRole::find($parent->id));
    }

    /** Nesting is one level: a child cannot itself become a parent's parent. */
    public function test_responsibilities_nest_only_one_level(): void
    {
        $parent = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);
        $child = WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 1, 'parent_id' => $parent->id]);

        $this->postJson('/workflow-roles/sub-roles/create', [
            'code' => 'd1a',
            'name' => 'D1a',
            'parent_id' => $child->id,
        ])->assertStatus(422);
    }

    /**
     * 'dynamic' means the forwarder picks one of the responsibility's members.
     * A responsibility that stands for nobody has nothing to pick from, so the
     * step is stored as standard rather than as a dead end.
     */
    public function test_dynamic_mode_is_downgraded_when_the_responsibility_stands_alone(): void
    {
        WorkflowSubRole::create(['code' => 'asg', 'name' => 'ASG', 'order' => 0]);

        $this->makeStep(['role_mode' => 'dynamic'])->assertOk();

        $this->assertSame('standard', EdocWorkflowRole::first()->role_mode);
    }

    public function test_dynamic_mode_is_kept_when_the_responsibility_stands_for_others(): void
    {
        $parent = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);
        WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 1, 'parent_id' => $parent->id]);

        $this->makeStep(['responsible_role' => 'dpt', 'role_mode' => 'dynamic'])->assertOk();

        $this->assertSame('dynamic', EdocWorkflowRole::first()->role_mode);
    }
}
