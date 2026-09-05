<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The workspace dashboard counts the register the reader is allowed to see, so
 * the same screen says different things to different roles. What is checked
 * here is that split: an Admin's tiles cover every document, a Normal User's
 * cover the ones that reached them, and the scope flag the front end branches
 * on says which of the two it is.
 */
class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    private Workspace $workspace;

    private Project $project;

    private BoardList $list;

    private User $admin;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $normalRole = Role::create(['name' => 'Normal', 'slug' => 'normal', 'access' => json_encode([])]);

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->member = User::factory()->create(['role_id' => $normalRole->id]);

        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->admin->id,
            'type_id' => null,
            'slug' => 'dashboard-flow',
        ]);
        $this->project = Project::factory()->create([
            'user_id' => $this->admin->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);
        $this->list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 1,
            'user_id' => $this->admin->id,
        ]);
    }

    private function makeDocument(array $attributes = [], ?User $assignee = null): Task
    {
        $task = Task::create(array_merge([
            'title' => 'Document',
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'user_id' => $this->admin->id,
            'order' => 1,
        ], $attributes));

        if ($assignee) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $assignee->id]);
        }

        return $task;
    }

    private function dashboard(User $user): AssertableInertia
    {
        $page = null;

        $this->actingAs($user)
            ->get('/workspace/'.$this->workspace->slug.'/main-dashboard')
            ->assertOk()
            ->assertInertia(function (AssertableInertia $inertia) use (&$page) {
                $page = $inertia;
            });

        return $page;
    }

    public function test_an_admin_reads_the_whole_register(): void
    {
        $this->makeDocument(['title' => 'Open']);
        $this->makeDocument(['title' => 'Closed', 'is_done' => 1]);
        $this->makeDocument(['title' => 'Late', 'due_date' => Carbon::now()->subDays(2)]);

        $page = $this->dashboard($this->admin);

        $page->where('viewer.scope', 'all')
            ->where('viewer.is_admin', true)
            ->where('metrics.total', 3)
            ->where('metrics.done', 1)
            ->where('metrics.open', 2)
            ->where('metrics.overdue', 1)
            // Nobody was assigned anything, and two of the three are still open.
            ->where('metrics.unassigned', 2)
            ->where('metrics.completion', 33);
    }

    public function test_a_normal_user_counts_only_what_reached_them(): void
    {
        $this->makeDocument(['title' => 'Someone elses']);
        $this->makeDocument(['title' => 'Mine, open'], $this->member);
        $this->makeDocument(['title' => 'Mine, closed', 'is_done' => 1], $this->member);

        $page = $this->dashboard($this->member);

        $page->where('viewer.scope', 'mine')
            ->where('viewer.is_admin', false)
            ->where('metrics.total', 2)
            ->where('metrics.mine', 2)
            ->where('metrics.awaiting_me', 1)
            ->where('metrics.done', 1);
    }

    public function test_the_intake_trend_covers_fourteen_days_and_counts_today(): void
    {
        $this->makeDocument(['title' => 'Arrived today']);

        $page = $this->dashboard($this->admin);

        $trend = $page->toArray()['props']['trend'];

        $this->assertCount(14, $trend);
        $this->assertSame(Carbon::now()->toDateString(), $trend[13]['date']);
        $this->assertSame(1, $trend[13]['total']);
    }

    /** Whoever reads the whole register gets the open load per person. */
    public function test_the_workload_panel_ranks_assignees_for_an_admin(): void
    {
        $this->makeDocument(['title' => 'One'], $this->member);
        $this->makeDocument(['title' => 'Two'], $this->member);
        $this->makeDocument(['title' => 'Done, so not a load', 'is_done' => 1], $this->member);

        $page = $this->dashboard($this->admin);

        $workload = $page->toArray()['props']['workload'];

        $this->assertCount(1, $workload);
        $this->assertSame(2, $workload[0]['total']);
        $this->assertSame(trim($this->member->first_name.' '.$this->member->last_name), $workload[0]['label']);
    }

    /**
     * A responsibility puts a board's documents on your plate whether or not
     * anyone remembered to assign them - the same rule the sidebar badge and
     * the My Documents view already use.
     */
    public function test_a_responsible_board_counts_for_the_person_who_holds_it(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'adsg', 'name' => 'ADSG', 'order' => 0]);
        $this->member->update(['workflow_sub_role_id' => $subRole->id]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => $this->list->title,
            'order' => 1,
            'responsible_role' => 'adsg',
        ]);

        // Nobody is assigned to it at all.
        $this->makeDocument(['title' => 'Waiting on ADSG']);

        $page = $this->dashboard($this->member);

        $page->where('metrics.total', 1)
            ->where('metrics.awaiting_me', 1)
            ->where('viewer.responsibilities', [$this->list->title]);
    }

    /**
     * The looser arms of Task::scopeVisibleTo - having commented on a document,
     * say - open it read-only. They are not work waiting on anyone, so the
     * dashboard must not count them, or the tiles would disagree with the rows
     * the same page lists.
     */
    public function test_a_document_reachable_only_by_a_comment_is_not_on_the_plate(): void
    {
        $task = $this->makeDocument(['title' => 'Someone elses']);

        Comment::create([
            'task_id' => $task->id,
            'user_id' => $this->member->id,
            'details' => 'Noted.',
        ]);

        $page = $this->dashboard($this->member);

        $page->where('metrics.total', 0)
            ->where('metrics.awaiting_me', 0);
    }
}
