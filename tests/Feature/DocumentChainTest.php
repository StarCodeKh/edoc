<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\BoardList;
use App\Models\DocumentLink;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Workspace;
use App\Support\DocumentChain;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * An external document waiting on the internal work it raised.
 *
 * The rule in one line: an external document moves through its own steps
 * normally, but the step that would finish it is refused while any internal
 * document raised off it is still running - and taken automatically once the
 * last of them finishes.
 */
class DocumentChainTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Workspace $external;

    private Workspace $internal;

    private Project $externalProject;

    private Project $internalProject;

    /** @var array<int, BoardList> */
    private array $externalLists = [];

    /** @var array<int, BoardList> */
    private array $internalLists = [];

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->admin = User::factory()->create(['role_id' => $role->id]);

        [$this->external, $this->externalProject, $this->externalLists] = $this->makeFlow('External Ministry');
        [$this->internal, $this->internalProject, $this->internalLists] = $this->makeFlow('Internal CGMC');

        // Only the internal workspace carries the internal_cgmc workflow, which
        // is how the "create internal document" target is resolved.
        foreach (['Registry', 'Review', 'Closed'] as $index => $title) {
            EdocWorkflowRole::create([
                'workflow_type' => 'internal_cgmc',
                'workspace_id' => $this->internal->id,
                'list_title' => $title,
                'order' => $index + 1,
                'responsible_role' => null,
                'is_terminal' => $title === 'Closed',
            ]);
        }

        $this->actingAs($this->admin);
    }

    /**
     * A Normal User who belongs to the internal workspace and nothing else.
     *
     * The membership is the point: without it the workspace does not open at
     * all, and these tests would pass on a 404 rather than on the guard they
     * are actually about.
     */
    private function makeInternalMember(): User
    {
        $normal = User::factory()->create([
            'role_id' => Role::create(['name' => 'User', 'slug' => 'user', 'access' => json_encode([])])->id,
        ]);

        TeamMember::create([
            'workspace_id' => $this->internal->id,
            'user_id' => $normal->id,
            'added_by' => $this->admin->id,
            'role' => 'member',
        ]);

        return $normal;
    }

    /** A workspace with a three-step board: Registry -> Review -> Closed. */
    private function makeFlow(string $name): array
    {
        $workspace = Workspace::factory()->create([
            'user_id' => $this->admin->id,
            'name' => $name,
            'type_id' => null,
        ]);

        $project = Project::factory()->create([
            'user_id' => $this->admin->id,
            'workspace_id' => $workspace->id,
            'background_id' => null,
        ]);

        $lists = [];
        foreach (['Registry', 'Review', 'Closed'] as $index => $title) {
            $lists[] = BoardList::create([
                'project_id' => $project->id,
                'title' => $title,
                'order' => $index + 1,
                'user_id' => $this->admin->id,
            ]);
        }

        return [$workspace, $project, $lists];
    }

    private function makeTask(Project $project, BoardList $list, string $title): Task
    {
        return Task::create([
            'title' => $title,
            'project_id' => $project->id,
            'list_id' => $list->id,
            'user_id' => $this->admin->id,
            'entry_date' => '2026-08-26 09:00:00',
            'order' => 1,
        ]);
    }

    private function link(Task $parent, Task $child): void
    {
        DocumentLink::create([
            'parent_task_id' => $parent->id,
            'child_task_id' => $child->id,
            'created_by' => $this->admin->id,
        ]);
    }

    private function forward(Workspace $workspace, Task $task)
    {
        return $this->post(route('workspace.documents.forward', [
            'uid' => $workspace->slug ?: $workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]));
    }

    // ---------------------------------------------------------------- completion

    public function test_a_document_on_the_last_board_counts_as_complete(): void
    {
        $task = $this->makeTask($this->internalProject, $this->internalLists[2], 'Internal');

        $this->assertTrue(DocumentChain::isComplete($task));
    }

    public function test_a_document_mid_flow_is_not_complete(): void
    {
        $task = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');

        $this->assertFalse(DocumentChain::isComplete($task));
    }

    // ---------------------------------------------------------------- the hold

    public function test_an_external_document_moves_freely_through_its_earlier_steps(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        // Registry -> Review is not the finishing step, so the hold does not apply.
        $this->forward($this->external, $parent);

        $this->assertSame($this->externalLists[1]->id, $parent->fresh()->list_id);
    }

    public function test_the_finishing_step_is_refused_while_an_internal_document_runs(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        $this->forward($this->external, $parent)->assertSessionHas('error');

        // It did not move.
        $this->assertSame($this->externalLists[1]->id, $parent->fresh()->list_id);
        $this->assertFalse((bool) $parent->fresh()->is_done);
    }

    public function test_the_refusal_names_the_document_being_waited_on(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        $this->forward($this->external, $parent);

        $this->assertStringContainsString(
            DocumentChain::label($child->fresh()),
            (string) session('error'),
        );
    }

    public function test_the_finishing_step_is_allowed_once_the_internal_document_is_done(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[2], 'Internal');
        $this->link($parent, $child);

        $this->forward($this->external, $parent);

        $this->assertSame($this->externalLists[2]->id, $parent->fresh()->list_id);
    }

    public function test_every_internal_document_has_to_finish_not_just_one(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $done = $this->makeTask($this->internalProject, $this->internalLists[2], 'Finished');
        $running = $this->makeTask($this->internalProject, $this->internalLists[0], 'Running');
        $this->link($parent, $done);
        $this->link($parent, $running);

        $this->forward($this->external, $parent)->assertSessionHas('error');

        $this->assertSame($this->externalLists[1]->id, $parent->fresh()->list_id);
    }

    /** A document with no internal work behind it is not held by anything. */
    public function test_an_unlinked_document_finishes_normally(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');

        $this->forward($this->external, $parent);

        $this->assertSame($this->externalLists[2]->id, $parent->fresh()->list_id);
    }

    // ---------------------------------------------------------------- the release

    public function test_finishing_the_last_internal_document_closes_the_external_one(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[1], 'Internal');
        $this->link($parent, $child);

        // Review -> Closed finishes the internal document.
        $this->forward($this->internal, $child);

        $parent = $parent->fresh();
        $this->assertTrue((bool) $parent->is_done);
        $this->assertSame($this->externalLists[2]->id, $parent->list_id);
    }

    public function test_the_external_document_stays_open_while_a_sibling_still_runs(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $first = $this->makeTask($this->internalProject, $this->internalLists[1], 'First');
        $second = $this->makeTask($this->internalProject, $this->internalLists[0], 'Second');
        $this->link($parent, $first);
        $this->link($parent, $second);

        $this->forward($this->internal, $first);

        $this->assertFalse((bool) $parent->fresh()->is_done);
    }

    public function test_closing_the_external_document_is_written_to_its_trail(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[1], 'Internal');
        $this->link($parent, $child);

        $this->forward($this->internal, $child);

        $entry = Activity::where('task_id', $parent->id)
            ->where('field_changed', 'closed_by_internal_document')
            ->first();

        $this->assertNotNull($entry, 'the external document closed with nothing in its trail to say why');
        $this->assertStringContainsString(DocumentChain::label($child->fresh()), (string) $entry->new_value);
    }

    // ---------------------------------------------------------------- raising

    public function test_raising_an_internal_document_links_it_and_marks_both_trails(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'External');

        $this->post(route('workspace.documents.submit.store', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]), [
            'title' => 'Internal follow-up',
            'project_id' => $this->internalProject->id,
            'list_id' => $this->internalLists[0]->id,
            'entry_date' => '2026-08-27 09:00:00',
            'parent_task_id' => $parent->id,
        ]);

        $child = Task::where('title', 'Internal follow-up')->first();

        $this->assertNotNull($child);
        $this->assertTrue($parent->childDocuments()->where('tasks.id', $child->id)->exists());
        $this->assertDatabaseHas('activities', [
            'task_id' => $parent->id,
            'field_changed' => 'internal_document_raised',
        ]);
        $this->assertDatabaseHas('activities', [
            'task_id' => $child->id,
            'field_changed' => 'raised_from_external_document',
        ]);
    }

    public function test_the_intake_form_prefills_from_the_document_it_was_opened_from(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'Budget circular');

        $url = route('workspace.documents.submit', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]).'?from='.$parent->id;

        $this->get($url)->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('parent_document.id', $parent->id)
                ->where('parent_document.title', 'Budget circular')
        );
    }

    /** ?from= must not become a way to read a document you may not open. */
    public function test_a_parent_the_user_cannot_view_is_ignored(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'Secret');

        $this->actingAs($this->makeInternalMember());

        $url = route('workspace.documents.submit', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]).'?from='.$parent->id;

        $this->get($url)->assertInertia(
            fn (AssertableInertia $page) => $page->where('parent_document', null)
        );
    }

    // ---------------------------------------------------------------- the picker

    /**
     * The main flow the administration uses: the external document is filed
     * first, then a new internal document picks it off a list.
     */
    public function test_the_intake_form_offers_external_documents_to_link(): void
    {
        $external = $this->makeTask($this->externalProject, $this->externalLists[0], 'Budget circular');

        $this->get(route('workspace.documents.submit', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('linkable_documents.0.id', $external->id)
                ->where('linkable_documents.0.title', 'Budget circular')
        );
    }

    /** Its own workspace's documents are not external to it. */
    public function test_the_picker_leaves_out_documents_from_the_same_workspace(): void
    {
        $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal neighbour');

        $this->get(route('workspace.documents.submit', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page->where('linkable_documents', [])
        );
    }

    /** Nothing is waiting on a finished document, so it is not offered. */
    public function test_the_picker_leaves_out_finished_documents(): void
    {
        $this->makeTask($this->externalProject, $this->externalLists[2], 'Already closed');

        $this->get(route('workspace.documents.submit', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page->where('linkable_documents', [])
        );
    }

    public function test_a_new_internal_document_can_be_filed_against_several_external_ones(): void
    {
        $first = $this->makeTask($this->externalProject, $this->externalLists[1], 'External A');
        $second = $this->makeTask($this->externalProject, $this->externalLists[1], 'External B');

        $this->post(route('workspace.documents.submit.store', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]), [
            'title' => 'Internal follow-up',
            'project_id' => $this->internalProject->id,
            'list_id' => $this->internalLists[1]->id,
            'entry_date' => '2026-08-27 09:00:00',
            'parent_task_ids' => [$first->id, $second->id],
        ]);

        $child = Task::where('title', 'Internal follow-up')->firstOrFail();

        $this->assertEqualsCanonicalizing(
            [$first->id, $second->id],
            $child->parentDocuments()->pluck('tasks.id')->all(),
        );

        // Both are now held...
        $this->forward($this->external, $first)->assertSessionHas('error');
        $this->forward($this->external, $second)->assertSessionHas('error');

        // ...and finishing the internal document releases both.
        $this->forward($this->internal, $child);

        $this->assertTrue((bool) $first->fresh()->is_done);
        $this->assertTrue((bool) $second->fresh()->is_done);
    }

    /** An external document the user may not view cannot be linked by id. */
    public function test_an_unviewable_external_document_is_not_linked(): void
    {
        $external = $this->makeTask($this->externalProject, $this->externalLists[0], 'Secret');

        $this->actingAs($this->makeInternalMember());

        $this->post(route('workspace.documents.submit.store', [
            'uid' => $this->internal->slug ?: $this->internal->id,
        ]), [
            'title' => 'Sneaky',
            'project_id' => $this->internalProject->id,
            'list_id' => $this->internalLists[0]->id,
            'entry_date' => '2026-08-27 09:00:00',
            'parent_task_ids' => [$external->id],
        ]);

        $child = Task::where('title', 'Sneaky')->first();

        $this->assertNotNull($child);
        $this->assertSame(0, $child->parentDocuments()->count());
    }

    // ---------------------------------------------------------------- the page

    public function test_the_document_page_carries_the_chain_and_the_hold(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[1], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        $this->get(route('workspace.documents.show', [
            'uid' => $this->external->slug ?: $this->external->id,
            'taskUid' => $parent->slug ?: $parent->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('links.held', true)
                ->where('links.pending_count', 1)
                ->where('links.blocks_forward', true)
                ->where('links.children.0.id', $child->id)
                ->where('links.children.0.is_complete', false)
        );
    }

    /** Earlier in the flow the chain is shown but nothing is blocked. */
    public function test_the_hold_does_not_block_a_forward_that_would_not_finish_it(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        $this->get(route('workspace.documents.show', [
            'uid' => $this->external->slug ?: $this->external->id,
            'taskUid' => $parent->slug ?: $parent->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('links.held', true)
                ->where('links.blocks_forward', false)
        );
    }

    /**
     * One internal document can answer several external ones - the link is a
     * join table, so both ends are many. Each external document is held by it
     * independently.
     */
    public function test_one_internal_document_can_answer_several_external_ones(): void
    {
        $first = $this->makeTask($this->externalProject, $this->externalLists[1], 'External A');
        $second = $this->makeTask($this->externalProject, $this->externalLists[1], 'External B');
        $child = $this->makeTask($this->internalProject, $this->internalLists[1], 'Internal');

        $this->link($first, $child);
        $this->link($second, $child);

        // Both are shown on the internal document's page...
        $this->get(route('workspace.documents.show', [
            'uid' => $this->internal->slug ?: $this->internal->id,
            'taskUid' => $child->slug ?: $child->id,
        ]))->assertInertia(fn (AssertableInertia $page) => $page->count('links.parents', 2));

        // ...and both are held by it.
        $this->forward($this->external, $first)->assertSessionHas('error');
        $this->forward($this->external, $second)->assertSessionHas('error');

        // Finishing it releases both.
        $this->forward($this->internal, $child);

        $this->assertTrue((bool) $first->fresh()->is_done);
        $this->assertTrue((bool) $second->fresh()->is_done);
    }

    public function test_the_internal_document_names_the_external_one_it_answers(): void
    {
        $parent = $this->makeTask($this->externalProject, $this->externalLists[0], 'External');
        $child = $this->makeTask($this->internalProject, $this->internalLists[0], 'Internal');
        $this->link($parent, $child);

        $this->get(route('workspace.documents.show', [
            'uid' => $this->internal->slug ?: $this->internal->id,
            'taskUid' => $child->slug ?: $child->id,
        ]))->assertInertia(
            fn (AssertableInertia $page) => $page->where('links.parents.0.id', $parent->id)
        );
    }
}
