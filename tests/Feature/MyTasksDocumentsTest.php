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
 * My Tasks' fifth view: the same register rows as All Documents, narrowed to
 * what the signed-in user is on the hook for.
 */
class MyTasksDocumentsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Project $project;

    private BoardList $list;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->user = User::factory()->create(['role_id' => $role->id]);
        // Addressed by slug, the way the menu links to it. Without one the
        // route falls back to the id, and the membership gate this suite covers
        // used to be skipped entirely for an id - see
        // WorkSpacesController::findWorkspace().
        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->user->id,
            'type_id' => null,
            'slug' => 'registry-flow',
        ]);
        $this->project = Project::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);
        $this->list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 1,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    private function makeDocument(string $title, ?User $assignee = null): Task
    {
        $task = Task::create([
            'title' => $title,
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'user_id' => $this->user->id,
            'order' => 1,
        ]);

        if ($assignee) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $assignee->id]);
        }

        return $task;
    }

    private function url(): string
    {
        return route('workspace.view.my-tasks.documents', $this->workspace->slug ?: $this->workspace->id);
    }

    /**
     * The page opens for the doer of a document, member of the workspace or not.
     *
     * The administration hands out a responsibility rather than a team_members
     * row, and a dynamic step is handed over as an assignees row - so the badge
     * on the menu counted the document (onMyPlate asks assignees and
     * responsibility) while the page behind it resolved its workspace on
     * membership alone and answered 404. The two now ask the same question.
     */
    public function test_the_page_opens_for_a_doer_who_is_not_a_team_member(): void
    {
        $normal = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);
        $doer = User::factory()->create(['role_id' => $normal->id]);

        $this->makeDocument('Handed over', $doer);

        $this->assertDatabaseMissing('team_members', ['user_id' => $doer->id]);

        $this->actingAs($doer);

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Workspaces/MyTasksDocuments')
                ->has('documents.data', 1)
                ->where('documents.data.0.title', 'Handed over')
            );
    }

    /** Someone with no connection to the workspace at all still gets nothing. */
    public function test_the_page_stays_shut_for_a_stranger(): void
    {
        $normal = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);
        $stranger = User::factory()->create(['role_id' => $normal->id]);

        $this->makeDocument('Not theirs', $this->user);

        $this->actingAs($stranger);

        $this->get($this->url())->assertNotFound();
    }

    public function test_it_lists_only_documents_assigned_to_the_signed_in_user(): void
    {
        $colleague = User::factory()->create(['role_id' => $this->user->role_id]);

        $this->makeDocument('Mine', $this->user);
        $this->makeDocument('Theirs', $colleague);
        $this->makeDocument('Nobody');

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Workspaces/MyTasksDocuments')
                ->has('documents.data', 1)
                ->where('documents.data.0.title', 'Mine')
                ->where('total', 1)
            );
    }

    /**
     * The rows are built by the same helper the full register uses, so the two
     * listings cannot drift apart.
     */
    public function test_a_row_carries_the_register_shape(): void
    {
        $this->makeDocument('Budget circular', $this->user);

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data.0', fn (AssertableInertia $row) => $row
                    ->where('title', 'Budget circular')
                    ->where('status', 'Registry')
                    ->where('attachments_count', 0)
                    ->where('user.id', $this->user->id)
                    ->etc()
                )
            );
    }

    public function test_it_paginates(): void
    {
        foreach (range(1, 21) as $index) {
            $this->makeDocument('Document '.$index, $this->user);
        }

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data', 20)
                ->where('documents.total', 21)
                ->where('total', 21)
            );
    }

    /**
     * The sidebar badge and this listing answer the same question, so they have
     * to answer it with the same number. They are separate queries in separate
     * methods; this is what stops them drifting apart again.
     */
    public function test_the_row_count_matches_the_sidebar_badge(): void
    {
        $this->makeDocument('Open one', $this->user);
        $this->makeDocument('Open two', $this->user);

        // Finished work is off your plate: the badge has always excluded it.
        $done = $this->makeDocument('Finished', $this->user);
        $done->update(['is_done' => true]);

        $badge = $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertOk()
            ->json('count');

        $this->assertSame(2, $badge);

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data', $badge)
                ->where('total', $badge)
            );
    }

    public function test_a_document_whose_board_was_archived_drops_off_the_list(): void
    {
        $this->makeDocument('Still live', $this->user);

        // Its own board, or archiving it would take "Still live" with it.
        $retired = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Retired',
            'order' => 2,
            'user_id' => $this->user->id,
        ]);

        $this->makeDocument('Board archived', $this->user)->update(['list_id' => $retired->id]);
        $retired->update(['is_archive' => 1]);

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data', 1)
                ->where('documents.data.0.title', 'Still live')
            );
    }

    /**
     * A document sitting on a board you are responsible for is yours to see,
     * whether or not anyone remembered to assign it. That is the whole point of
     * giving a user a responsibility.
     */
    public function test_a_document_on_a_board_i_am_responsible_for_shows_without_being_assigned(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'adsg', 'name' => 'ADSG', 'order' => 0]);
        $this->user->update(['workflow_sub_role_id' => $subRole->id]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => $this->list->title,
            'order' => 1,
            'responsible_role' => 'adsg',
        ]);

        // Nobody is assigned to it at all.
        $this->makeDocument('Waiting on ADSG');

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data', 1)
                ->where('documents.data.0.title', 'Waiting on ADSG')
            );

        $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertJson(['count' => 1]);
    }

    public function test_a_board_someone_else_is_responsible_for_stays_out_of_my_list(): void
    {
        $mine = WorkflowSubRole::create(['code' => 'adsg', 'name' => 'ADSG', 'order' => 0]);
        WorkflowSubRole::create(['code' => 'sg', 'name' => 'SG', 'order' => 1]);
        $this->user->update(['workflow_sub_role_id' => $mine->id]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => $this->list->title,
            'order' => 1,
            'responsible_role' => 'sg',
        ]);

        $this->makeDocument('Waiting on SG');

        $this->get($this->url())
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('documents.data', 0));
    }

    /**
     * The responsibility arm has to be in both queries, or the badge and the
     * listing disagree again.
     */
    public function test_the_badge_still_matches_the_rows_with_responsibilities_in_play(): void
    {
        $subRole = WorkflowSubRole::create(['code' => 'adsg', 'name' => 'ADSG', 'order' => 0]);
        $this->user->update(['workflow_sub_role_id' => $subRole->id]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => $this->list->title,
            'order' => 1,
            'responsible_role' => 'adsg',
        ]);

        $this->makeDocument('By responsibility');
        $this->makeDocument('By assignment', $this->user);

        $badge = $this->get(route('json.workspace.assigned-count', $this->workspace->id))->json('count');

        $this->assertSame(2, $badge);

        // Assigned AND responsible must not be counted twice.
        $this->get($this->url())
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('documents.data', $badge)
                ->where('total', $badge)
            );
    }

    public function test_a_guest_is_sent_to_login(): void
    {
        auth()->logout();

        $this->get($this->url())->assertRedirect(route('login'));
    }
}
