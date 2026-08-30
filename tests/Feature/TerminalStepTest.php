<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * ជំហានចុងក្រោយ: the step a document stops on.
 *
 * The button that forwards everywhere else closes the document here instead -
 * even where a later board exists, because the flag is the configuration's way
 * of saying this is the end of this workflow.
 */
class TerminalStepTest extends TestCase
{
    use RefreshDatabase;

    private User $officer;

    private Workspace $workspace;

    private Project $project;

    private BoardList $review;

    private BoardList $closing;

    private BoardList $after;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        $this->officer = User::factory()->create([
            'role_id' => $adminRole->id,
            'workflow_sub_role_id' => $subRole->id,
        ]);

        $this->workspace = Workspace::factory()->create(['user_id' => $this->officer->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $this->officer->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        // A terminal step deliberately followed by another board, so the test
        // proves the flag wins rather than "there was nowhere left to go".
        $boards = [['Review', 1, false], ['Closing', 2, true], ['After', 3, false]];

        foreach ($boards as [$title, $order, $terminal]) {
            $list = BoardList::create([
                'project_id' => $this->project->id,
                'title' => $title,
                'order' => $order,
                'user_id' => $this->officer->id,
            ]);

            EdocWorkflowRole::create([
                'workflow_type' => 'internal_cgmc',
                'workspace_id' => $this->workspace->id,
                'list_title' => $title,
                'order' => $order,
                'responsible_role' => 'sg',
                'is_terminal' => $terminal,
            ]);

            $this->{strtolower($title)} = $list;
        }
    }

    private function documentOn(BoardList $list): Task
    {
        return Task::create([
            'title' => 'Minute',
            'project_id' => $this->project->id,
            'list_id' => $list->id,
            'origin_list_id' => $list->id,
            'user_id' => $this->officer->id,
            'order' => 1,
        ]);
    }

    private function press(Task $task, array $payload = [])
    {
        $uid = $this->workspace->slug ?: $this->workspace->id;

        return $this->actingAs($this->officer)
            ->post("/w/{$uid}/documents/{$task->slug}/forward", $payload);
    }

    public function test_the_page_says_the_document_finishes_here(): void
    {
        $task = $this->documentOn($this->closing);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        $this->actingAs($this->officer)
            ->get("/w/{$uid}/documents/{$task->slug}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('finishes_here', true));
    }

    public function test_an_ordinary_step_does_not(): void
    {
        $task = $this->documentOn($this->review);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        $this->actingAs($this->officer)
            ->get("/w/{$uid}/documents/{$task->slug}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('finishes_here', false));
    }

    public function test_pressing_it_on_a_terminal_step_closes_the_document(): void
    {
        $task = $this->documentOn($this->closing);

        $this->press($task)->assertSessionHas('success');

        $task->refresh();

        $this->assertSame(1, (int) $task->is_done);
        // It stays where it ended: the board is the record of where it stopped.
        $this->assertSame($this->closing->id, (int) $task->list_id);
    }

    public function test_an_ordinary_step_still_moves_the_document(): void
    {
        $task = $this->documentOn($this->review);

        $this->press($task)->assertSessionHas('success');

        $task->refresh();

        $this->assertSame(0, (int) $task->is_done);
        $this->assertSame($this->closing->id, (int) $task->list_id);
    }

    public function test_the_note_is_filed_when_the_document_is_closed(): void
    {
        $task = $this->documentOn($this->closing);

        $this->press($task, ['note' => 'Closing this off.'])->assertSessionHas('success');

        $this->assertSame(1, Comment::where('task_id', $task->id)->count());
    }

    /** Once it is closed the page must stop offering to close it again. */
    public function test_a_finished_document_offers_no_further_action(): void
    {
        $task = $this->documentOn($this->closing);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        $this->press($task)->assertSessionHas('success');

        $this->actingAs($this->officer)
            ->get("/w/{$uid}/documents/{$task->slug}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('can.forward', false));
    }

    public function test_a_finished_document_cannot_be_finished_again(): void
    {
        $task = $this->documentOn($this->closing);

        $this->press($task, ['note' => 'Closing.'])->assertSessionHas('success');

        // A second press must do nothing at all - not even file its note.
        $this->press($task, ['note' => 'And again.'])->assertSessionHas('error');

        $this->assertSame(1, Comment::where('task_id', $task->id)->count());
    }

    /** The step's own document requirement still has to be met to close. */
    public function test_a_terminal_step_that_needs_a_document_will_not_close_without_one(): void
    {
        EdocWorkflowRole::where('list_title', 'Closing')->update([
            'requires_attachment' => true,
            'attachment_mode' => 'standard',
        ]);

        $task = $this->documentOn($this->closing);

        $this->press($task)->assertSessionHas('error');

        $this->assertSame(0, (int) $task->fresh()->is_done);
    }

    public function test_the_same_step_closes_once_its_document_is_filed(): void
    {
        EdocWorkflowRole::where('list_title', 'Closing')->update([
            'requires_attachment' => true,
            'attachment_mode' => 'standard',
        ]);

        $task = $this->documentOn($this->closing);

        $this->actingAs($this->officer)->post("/task/attachment/add/{$task->id}", [
            'file' => UploadedFile::fake()->create('final.pdf', 10, 'application/pdf'),
        ])->assertOk();

        $this->press($task)->assertSessionHas('success');

        $this->assertSame(1, (int) $task->fresh()->is_done);
        $this->assertSame(1, Attachment::where('task_id', $task->id)->count());
    }
}
