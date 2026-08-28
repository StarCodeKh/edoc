<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * A responsibility that stands for several others - នាយកដ្ឋាន D1-D5 holding D1
 * through D5 - and the steps that name it.
 *
 * A standard step assigns everyone carrying its responsibility. A dynamic one
 * treats the responsibility as a group: whoever forwards the document into it
 * says which member actually gets the work.
 */
class WorkflowDynamicRoleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Role $role;

    private Workspace $workspace;

    private Project $project;

    /** @var array<int, BoardList> */
    private array $lists = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->admin = User::factory()->create(['role_id' => $this->role->id]);

        $this->actingAs($this->admin);
    }

    /** នាយកដ្ឋាន D1-D5 with D1 and D2 under it. */
    private function departmentGroup(): WorkflowSubRole
    {
        $parent = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments D1-D5', 'order' => 0]);

        WorkflowSubRole::create(['code' => 'd1', 'name' => 'Department D1', 'order' => 1, 'parent_id' => $parent->id]);
        WorkflowSubRole::create(['code' => 'd2', 'name' => 'Department D2', 'order' => 2, 'parent_id' => $parent->id]);

        return $parent;
    }

    // ------------------------------------------------------------- the nesting

    public function test_one_can_be_filed_under_another(): void
    {
        $parent = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);

        $this->post(route('workflow-roles.sub.create'), [
            'code' => 'd1',
            'name' => 'Department D1',
            'parent_id' => $parent->id,
        ])->assertOk();

        $this->assertDatabaseHas('workflow_sub_roles', ['code' => 'd1', 'parent_id' => $parent->id]);
    }

    public function test_the_settings_page_carries_the_nesting(): void
    {
        $this->departmentGroup();

        $this->get(route('workflow-roles'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Settings/WorkflowRoles')
                ->has('sub_roles', 3)
                ->where('sub_roles.1.code', 'd1')
                ->where('sub_roles.1.parent_id', WorkflowSubRole::where('code', 'dpt')->value('id'))
            );
    }

    public function test_nesting_stops_at_one_level(): void
    {
        $this->departmentGroup();
        $child = WorkflowSubRole::where('code', 'd1')->first();

        $this->post(route('workflow-roles.sub.create'), [
            'code' => 'd1a',
            'name' => 'Sub-department',
            'parent_id' => $child->id,
        ])->assertStatus(422);

        $this->assertDatabaseMissing('workflow_sub_roles', ['code' => 'd1a']);
    }

    public function test_one_cannot_sit_under_itself(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);

        $this->post(route('workflow-roles.sub.update', $subRole->id), [
            'code' => 'dpt',
            'name' => 'Departments',
            'parent_id' => $subRole->id,
        ])->assertStatus(422);

        $this->assertNull($subRole->fresh()->parent_id);
    }

    public function test_one_standing_for_others_cannot_be_deleted(): void
    {
        $parent = $this->departmentGroup();

        $this->post(route('workflow-roles.sub.delete', $parent->id))->assertStatus(422);

        $this->assertDatabaseHas('workflow_sub_roles', ['id' => $parent->id]);
    }

    // ---------------------------------------------------------- the step's mode

    public function test_a_step_is_dynamic_only_when_its_role_stands_for_others(): void
    {
        $this->departmentGroup();
        WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 9]);

        $this->post(route('workflow-roles.create'), [
            'workflow_type' => 'internal_cgmc',
            'list_title' => 'To a department',
            'responsible_role' => 'dpt',
            'role_mode' => 'dynamic',
        ])->assertOk();

        // 'sg' stands for nobody, so there would be nothing to choose from.
        $this->post(route('workflow-roles.create'), [
            'workflow_type' => 'internal_cgmc',
            'list_title' => 'To the SG',
            'responsible_role' => 'sg',
            'role_mode' => 'dynamic',
        ])->assertOk();

        $this->assertDatabaseHas('edoc_workflow_roles', ['list_title' => 'To a department', 'role_mode' => 'dynamic']);
        $this->assertDatabaseHas('edoc_workflow_roles', ['list_title' => 'To the SG', 'role_mode' => 'standard']);
    }

    // ----------------------------------------------------------- the hand-off

    /** A two-step board whose second step is handed to one department. */
    private function makeBoard(string $secondStepMode = 'dynamic'): void
    {
        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Internal CGMC',
            'type_id' => null,
        ]);

        $this->project = Project::factory()->create([
            'user_id' => $this->admin->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        foreach (['Registry', 'With the department'] as $index => $title) {
            $this->lists[] = BoardList::create([
                'project_id' => $this->project->id,
                'title' => $title,
                'order' => $index + 1,
                'user_id' => $this->admin->id,
            ]);

            EdocWorkflowRole::create([
                'workflow_type' => 'internal_cgmc',
                'workspace_id' => $this->workspace->id,
                'list_title' => $title,
                'order' => $index + 1,
                'responsible_role' => $index === 0 ? 'admin' : 'dpt',
                'role_mode' => $index === 0 ? 'standard' : $secondStepMode,
            ]);
        }
    }

    private function makeTask(): Task
    {
        return Task::create([
            'title' => 'A document',
            'project_id' => $this->project->id,
            'list_id' => $this->lists[0]->id,
            'user_id' => $this->admin->id,
            'entry_date' => '2026-08-28 09:00:00',
            'order' => 1,
        ]);
    }

    private function forward(Task $task, array $payload = [])
    {
        return $this->post(route('workspace.documents.forward', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]), $payload);
    }

    public function test_the_page_offers_the_members_of_a_dynamic_next_step(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $this->get(route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Documents/Show')
                ->where('next_step.role_mode', 'dynamic')
                ->has('next_step.hand_to_options', 2)
                ->where('next_step.hand_to_options.0.code', 'd1')
            );
    }

    public function test_a_standard_next_step_offers_no_choice(): void
    {
        $this->departmentGroup();
        $this->makeBoard('standard');
        $task = $this->makeTask();

        $this->get(route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('next_step.role_mode', 'standard')
                ->has('next_step.hand_to_options', 0)
            );
    }

    public function test_forwarding_into_a_dynamic_step_needs_a_choice(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $this->forward($task)->assertSessionHas('error');

        $this->assertSame($this->lists[0]->id, $task->fresh()->list_id);
    }

    public function test_the_choice_has_to_be_one_the_step_offers(): void
    {
        $this->departmentGroup();
        WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 9]);
        $this->makeBoard();
        $task = $this->makeTask();

        $this->forward($task, ['hand_to' => 'sg'])->assertSessionHas('error');

        $this->assertSame($this->lists[0]->id, $task->fresh()->list_id);
    }

    public function test_only_the_chosen_department_is_assigned(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $inD1 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);
        $inD2 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd2')->value('id'),
        ]);

        $this->forward($task, ['hand_to' => 'd1']);

        $this->assertSame($this->lists[1]->id, $task->fresh()->list_id);

        $assigned = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        $this->assertContains($inD1->id, $assigned);
        $this->assertNotContains($inD2->id, $assigned);
    }

    /**
     * People may still be filed under the group rather than one of its members.
     * Falling back to the group beats handing the document to nobody.
     */
    public function test_the_group_is_used_when_the_chosen_one_has_nobody(): void
    {
        $parent = $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $inGroup = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => $parent->id,
        ]);

        $this->forward($task, ['hand_to' => 'd1']);

        $this->assertContains($inGroup->id, Assignee::where('task_id', $task->id)->pluck('user_id')->all());
    }
}
