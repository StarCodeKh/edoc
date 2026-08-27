<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
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
        $this->workspace = Workspace::factory()->create(['user_id' => $this->user->id, 'type_id' => null]);
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

    public function test_a_guest_is_sent_to_login(): void
    {
        auth()->logout();

        $this->get($this->url())->assertRedirect(route('login'));
    }
}
