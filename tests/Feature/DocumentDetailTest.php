<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\DocumentSource;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The document detail page: the intake form's fields read back, plus the two
 * things only a filed document has - where it sits in the workflow, and who
 * moved it there.
 */
class DocumentDetailTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Project $project;

    private BoardList $first;

    private BoardList $second;

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

        $this->first = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 1,
            'user_id' => $this->user->id,
        ]);
        $this->second = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Review',
            'order' => 2,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    private function makeDocument(array $overrides = [], bool $assignToMe = false): Task
    {
        $task = Task::create(array_merge([
            'title' => 'Circular on budget review',
            'project_id' => $this->project->id,
            'list_id' => $this->first->id,
            'user_id' => $this->user->id,
            'entry_date' => '2026-08-26 09:00:00',
            'order' => 1,
        ], $overrides));

        if ($assignToMe) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $this->user->id]);
        }

        return $task;
    }

    private function showUrl(Task $task): string
    {
        return route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]);
    }

    public function test_it_renders_the_document_in_the_intake_forms_vocabulary(): void
    {
        $department = DocumentSource::create(['name' => 'Finance', 'order' => 1]);
        $office = DocumentSource::create(['name' => 'Accounting', 'parent_id' => $department->id, 'order' => 1]);

        $task = $this->makeDocument(['document_source_id' => $office->id]);

        $this->get($this->showUrl($task))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Documents/Show')
                ->where('document.title', 'Circular on budget review')
                ->where('document.department', 'Finance')
                ->where('document.office', 'Accounting')
                ->where('document.status', 'Registry')
                ->where('document.submitted_by.id', $this->user->id)
                ->has('steps', 2)
            );
    }

    /**
     * The board a document starts on has no activity row of its own - the
     * filing itself is what put it there, so the creator is the doer.
     */
    public function test_the_first_step_credits_whoever_filed_the_document(): void
    {
        $task = $this->makeDocument();

        $this->get($this->showUrl($task))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('steps.0.title', 'Registry')
                ->where('steps.0.state', 'current')
                ->where('steps.0.actor.id', $this->user->id)
                ->where('steps.1.title', 'Review')
                ->where('steps.1.state', 'pending')
                ->where('steps.1.actor', null)
            );
    }

    public function test_moving_the_document_advances_the_tracker_and_names_the_mover(): void
    {
        $mover = User::factory()->create(['role_id' => $this->user->role_id]);
        $task = $this->makeDocument();

        $this->actingAs($mover);
        $task->update(['list_id' => $this->second->id]);

        $this->get($this->showUrl($task))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                // Left behind, so it is done; the filer still owns that step.
                ->where('steps.0.state', 'done')
                ->where('steps.0.actor.id', $this->user->id)
                // Landed here, and the tracker names whoever moved it.
                ->where('steps.1.state', 'current')
                ->where('steps.1.actor.id', $mover->id)
                ->has('activities', 1)
            );
    }

    public function test_a_step_carries_its_workflow_role_and_sla(): void
    {
        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'Registry',
            'order' => 1,
            'responsible_role' => 'Registry Officer',
            'sla_hours' => 24,
            'requires_signature' => true,
        ]);

        $task = $this->makeDocument();

        $this->get($this->showUrl($task))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('steps.0.responsible_role', 'Registry Officer')
                ->where('steps.0.sla_hours', 24)
                ->where('steps.0.requires_signature', true)
            );
    }

    public function test_a_document_from_another_workspace_is_not_reachable(): void
    {
        $otherWorkspace = Workspace::factory()->create(['user_id' => $this->user->id, 'type_id' => null]);
        $task = $this->makeDocument();

        $this->get(route('workspace.documents.show', [
            'uid' => $otherWorkspace->slug ?: $otherWorkspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]))->assertNotFound();
    }

    /**
     * Prev/next walk the register's own order - newest first - so a reviewer can
     * work through a pile without going back to the listing between each.
     */
    public function test_it_offers_the_neighbouring_documents(): void
    {
        $older = $this->makeDocument(['title' => 'Older', 'order' => 1]);
        $older->forceFill(['created_at' => '2026-08-20 09:00:00'])->saveQuietly();

        $middle = $this->makeDocument(['title' => 'Middle', 'order' => 2]);
        $middle->forceFill(['created_at' => '2026-08-22 09:00:00'])->saveQuietly();

        $newer = $this->makeDocument(['title' => 'Newer', 'order' => 3]);
        $newer->forceFill(['created_at' => '2026-08-24 09:00:00'])->saveQuietly();

        $this->get($this->showUrl($middle))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('neighbours.position', 2)
                ->where('neighbours.total', 3)
                ->where('neighbours.previous.title', 'Newer')
                ->where('neighbours.next.title', 'Older')
            );
    }

    public function test_the_ends_of_the_register_have_no_neighbour_to_step_to(): void
    {
        $only = $this->makeDocument();

        $this->get($this->showUrl($only))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('neighbours.position', 1)
                ->where('neighbours.total', 1)
                ->where('neighbours.previous', null)
                ->where('neighbours.next', null)
            );
    }

    public function test_it_carries_the_comment_thread(): void
    {
        $task = $this->makeDocument();

        $this->post(route('comments.new'), [
            'task_id' => $task->id,
            'user_id' => $this->user->id,
            'details' => 'Please sign before Friday.',
        ])->assertOk();

        $this->get($this->showUrl($task))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('comments', 1)
                ->where('comments.0.details', 'Please sign before Friday.')
                ->where('comments.0.author.id', $this->user->id)
                ->where('comments.0.is_mine', true)
            );
    }

    private function forwardUrl(Task $task): string
    {
        return route('workspace.documents.forward', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]);
    }

    /**
     * Forwarding is a plain list_id change on purpose, so the model's own hook
     * writes the activity row and the tracker advances from the same source of
     * truth a board drag would use.
     */
    public function test_forwarding_moves_the_document_to_the_next_step(): void
    {
        $task = $this->makeDocument();

        $this->post($this->forwardUrl($task))
            ->assertRedirect($this->showUrl($task))
            ->assertSessionHas('success');

        $this->assertSame($this->second->id, (int) $task->fresh()->list_id);

        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('steps.0.state', 'done')
                ->where('steps.1.state', 'current')
                ->where('steps.1.actor.id', $this->user->id)
                ->has('activities', 1)
            );
    }

    public function test_a_note_typed_while_forwarding_is_filed_as_a_comment(): void
    {
        $task = $this->makeDocument();

        $this->post($this->forwardUrl($task), ['note' => 'Checked, please approve.']);

        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('comments', 1)
                ->where('comments.0.details', 'Checked, please approve.')
            );
    }

    public function test_the_last_step_has_nowhere_to_forward_to(): void
    {
        $task = $this->makeDocument(['list_id' => $this->second->id]);

        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('next_step', null));

        $this->from($this->showUrl($task))
            ->post($this->forwardUrl($task))
            ->assertRedirect($this->showUrl($task))
            ->assertSessionHas('error');

        $this->assertSame($this->second->id, (int) $task->fresh()->list_id);
    }

    public function test_the_next_step_is_named_on_the_page(): void
    {
        $task = $this->makeDocument([], true);

        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('next_step.title', 'Review')
                ->where('can.forward', true)
            );
    }

    /**
     * The three things forwarding is meant to do: take the document off your
     * plate, drop it out of the My Tasks count, and take the button with it.
     */
    public function test_forwarding_hands_the_document_off(): void
    {
        $task = $this->makeDocument([], true);

        $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertJson(['count' => 1]);

        $this->post($this->forwardUrl($task))->assertSessionHas('success');

        $this->assertSame(
            0,
            Assignee::where('task_id', $task->id)->where('user_id', $this->user->id)->count(),
            'Forwarding should take the document off the forwarder\'s plate.'
        );

        // Gone from the count...
        $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertJson(['count' => 0]);

        // ...and from the listing.
        $this->get(route('workspace.view.my-tasks.documents', $this->workspace->slug ?: $this->workspace->id))
            ->assertInertia(fn (AssertableInertia $page) => $page->has('documents.data', 0));

        // ...and the button goes with it.
        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page->where('can.forward', false));
    }

    /**
     * Documents the rule as it stands, because it limits who the feature is for:
     * forwarding needs the 'move' ability, and TaskAbility::canMove is admin, or
     * the creator while the document is still on the board it was filed in.
     *
     * A Normal User who is only *assigned* a document therefore cannot forward
     * it - so the button reaches admins and creators, not the reviewers a
     * workflow would normally hand documents to. Widening canMove to include
     * assignees is a permissions change and is deliberately not made here.
     */
    public function test_an_assignee_without_move_rights_cannot_forward(): void
    {
        $normal = User::factory()->create([
            'role_id' => Role::create(['name' => 'User', 'slug' => 'user', 'access' => json_encode([])])->id,
        ]);

        // Not theirs, but assigned to them - the everyday reviewer case.
        $task = $this->makeDocument();
        Assignee::create(['task_id' => $task->id, 'user_id' => $normal->id]);

        $this->actingAs($normal);

        $this->post($this->forwardUrl($task))->assertForbidden();

        $this->assertSame($this->first->id, (int) $task->fresh()->list_id);
    }

    /**
     * Attaching is offered only while you are holding the document. The
     * endpoint keeps its wider rule - this is the page declining to offer it.
     */
    public function test_attaching_is_offered_only_to_whoever_holds_the_document(): void
    {
        $mine = $this->makeDocument([], true);
        $theirs = $this->makeDocument();

        $this->get($this->showUrl($mine))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('can.attach', true)
                ->where('can.forward', true)
            );

        $this->get($this->showUrl($theirs))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('can.attach', false)
                ->where('can.forward', false)
            );
    }

    public function test_forwarding_takes_the_attach_option_away_too(): void
    {
        $task = $this->makeDocument([], true);

        $this->post($this->forwardUrl($task))->assertSessionHas('success');

        $this->get($this->showUrl($task))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('can.attach', false)
                ->where('can.forward', false)
            );
    }

    public function test_a_guest_cannot_forward(): void
    {
        $task = $this->makeDocument();

        auth()->logout();

        $this->post($this->forwardUrl($task))->assertRedirect(route('login'));

        $this->assertSame($this->first->id, (int) $task->fresh()->list_id);
    }

    public function test_a_guest_cannot_view_a_document(): void
    {
        $task = $this->makeDocument();

        auth()->logout();

        $this->get($this->showUrl($task))->assertRedirect(route('login'));
    }
}
