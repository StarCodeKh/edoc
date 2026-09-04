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
use App\Support\TaskAbility;
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
     * One document commonly goes to D1 through D5 at once, so the choice is a
     * list rather than a single department.
     */
    public function test_several_departments_can_be_chosen_at_once(): void
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

        // The picker posts its codes comma-joined.
        $this->forward($task, ['hand_to' => 'd1,d2']);

        $assigned = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        $this->assertContains($inD1->id, $assigned);
        $this->assertContains($inD2->id, $assigned);
    }

    public function test_someone_carrying_two_of_the_chosen_departments_is_assigned_once(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $inD1 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        $this->forward($task, ['hand_to' => 'd1,d1,d2']);

        $this->assertSame(
            1,
            Assignee::where('task_id', $task->id)->where('user_id', $inD1->id)->count()
        );
    }

    public function test_one_bad_code_in_the_list_refuses_the_whole_forward(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $this->forward($task, ['hand_to' => 'd1,not-a-department'])
            ->assertSessionHas('error');

        $this->assertSame($this->lists[0]->id, $task->fresh()->list_id);
    }

    /**
     * A standard step names the group and means all of it, so everyone filed
     * under the group carries it - not only whoever is filed under the group
     * row itself.
     */
    public function test_a_member_carries_a_standard_step_named_for_its_group(): void
    {
        $this->departmentGroup();
        $this->makeBoard('standard');

        $inD1 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        $this->assertContains($this->lists[1]->title, $inD1->responsibleListTitles());
    }

    /**
     * A dynamic step is handed to one member as it is forwarded, so the others
     * must not pick it up simply by being under the same group.
     */
    public function test_a_member_does_not_carry_a_dynamic_step_named_for_its_group(): void
    {
        $this->departmentGroup();
        $this->makeBoard();

        $inD1 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        $this->assertNotContains($this->lists[1]->title, $inD1->responsibleListTitles());
    }

    /**
     * The doer of a dynamic step reaches the board the document sits on.
     *
     * They get there by holding the document and nothing else: a dynamic step
     * is handed to one member as it is forwarded, so it never becomes part of
     * their responsibility (see the test above), and the administration gives
     * nobody a team_members row. Workspace access read on membership and
     * responsibility alone therefore 404'd the very person the document had
     * just been handed to, while My Tasks went on listing it.
     */
    public function test_the_doer_of_a_dynamic_step_can_open_the_board(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $normal = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);

        $inD1 = User::factory()->create([
            'role_id' => $normal->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        // Nothing but the responsibility yet, and a dynamic step is not part of
        // it - so the board is not theirs to open.
        $this->actingAs($inD1);
        $this->get(route('projects.view.board', $this->project->slug ?: $this->project->id))
            ->assertNotFound();

        // The administration hands the document to D1.
        $this->actingAs($this->admin);
        $this->forward($task, ['hand_to' => 'd1']);

        $this->assertContains($inD1->id, Assignee::where('task_id', $task->id)->pluck('user_id')->all());

        $this->actingAs($inD1->fresh());
        $this->get(route('projects.view.board', $this->project->slug ?: $this->project->id))
            ->assertOk();
    }

    /**
     * ...and sends it on from there.
     *
     * canMove asks who is responsible for the board the document sits on, and a
     * dynamic step is the one case where responsibility cannot answer: the
     * hand-off named the doer instead. Without that arm the person the document
     * was handed to could open it and do nothing with it, which leaves the flow
     * stuck on the step it was just forwarded into.
     */
    public function test_the_doer_of_a_dynamic_step_can_send_it_on(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $normal = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);

        $inD1 = User::factory()->create([
            'role_id' => $normal->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        $this->forward($task, ['hand_to' => 'd1']);

        // The document is now on the dynamic step, with D1 holding it.
        $task->refresh();
        $this->assertSame($this->lists[1]->id, $task->list_id);

        $inD1 = $inD1->fresh();

        $this->assertTrue(TaskAbility::canMove($inD1, $task));
        // Still not theirs to rewrite - holding a step never was.
        $this->assertFalse(TaskAbility::canEdit($inD1, $task));

        $this->actingAs($inD1);
        $this->forward($task)->assertRedirect();
    }

    /**
     * The forward panel names who the next step reaches, rather than only the
     * responsibility it carries. Pressing the button used to be the first time
     * anyone found out who the document had gone to.
     */
    public function test_the_next_step_carries_the_people_it_reaches(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $inD1 = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        $this->get(route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('next_step.role_mode', 'dynamic')
                ->where('next_step.responsible_role_name', 'Departments D1-D5')
                ->has('next_step.people', 1)
                ->where('next_step.people.0.id', $inD1->id)
                // The code it was reached by, so the panel can narrow the list
                // as departments are chosen.
                ->where('next_step.people.0.role_code', 'd1')
            );
    }

    /**
     * Naming people outright settles who gets the document, and stands in for
     * the department choice a dynamic step would otherwise demand.
     */
    public function test_forwarding_can_name_the_people_outright(): void
    {
        $this->departmentGroup();
        $this->makeBoard();
        $task = $this->makeTask();

        $one = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);
        $two = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'd1')->value('id'),
        ]);

        // No hand_to at all - the named people answer the same question.
        $this->forward($task, ['assign_to' => [$one->id]]);

        $on = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        $this->assertContains($one->id, $on);
        $this->assertNotContains($two->id, $on, 'only the person named should be on it');
    }

    /**
     * A standard step gets the same choice. It assigns every holder of its
     * responsibility by default, and that default is now something the
     * forwarder can narrow rather than the only outcome available.
     */
    public function test_a_standard_step_can_be_narrowed_to_one_person(): void
    {
        WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments D1-D5', 'order' => 0]);
        $this->makeBoard('standard');
        $task = $this->makeTask();

        $one = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'dpt')->value('id'),
        ]);
        $two = User::factory()->create([
            'role_id' => $this->role->id,
            'workflow_sub_role_id' => WorkflowSubRole::where('code', 'dpt')->value('id'),
        ]);

        $this->forward($task, ['assign_to' => [$two->id]]);

        $on = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        $this->assertContains($two->id, $on);
        $this->assertNotContains($one->id, $on);
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
