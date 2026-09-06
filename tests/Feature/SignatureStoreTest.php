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
use Tests\TestCase;

/**
 * Approving and signing a document.
 *
 * It used to set is_done = 1 unconditionally, closing documents that still had
 * steps ahead of them, and it assigned nobody on the board it moved to - so a
 * signed document landed on no plate and notified no one.
 */
class SignatureStoreTest extends TestCase
{
    use RefreshDatabase;

    private User $signer;

    private Workspace $workspace;

    private Project $project;

    private BoardList $sign;

    private BoardList $next;

    protected function setUp(): void
    {
        parent::setUp();

        $admin = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $sg = WorkflowSubRole::create(['code' => 'sg', 'name' => 'អគ្គលេខាធិការ', 'order' => 0]);

        $this->signer = User::factory()->create(['role_id' => $admin->id, 'workflow_sub_role_id' => $sg->id]);
        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->signer->id, 'type_id' => null, 'slug' => 'sig',
        ]);
        $this->project = Project::factory()->create([
            'user_id' => $this->signer->id, 'workspace_id' => $this->workspace->id, 'background_id' => null,
        ]);

        $this->sign = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'Sign', 'order' => 0, 'user_id' => $this->signer->id,
        ]);
        $this->next = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'Distribute', 'order' => 1, 'user_id' => $this->signer->id,
        ]);

        EdocWorkflowRole::create([
            'workflow_type' => 'flow', 'workspace_id' => $this->workspace->id,
            'list_title' => 'Sign', 'order' => 0,
            'responsible_role' => 'sg', 'requires_signature' => 1,
        ]);

        $this->actingAs($this->signer);
    }

    private function step(string $title, int $order, ?string $code, bool $terminal = false): void
    {
        EdocWorkflowRole::create([
            'workflow_type' => 'flow', 'workspace_id' => $this->workspace->id,
            'list_title' => $title, 'order' => $order,
            'responsible_role' => $code, 'is_terminal' => $terminal ? 1 : 0,
        ]);
    }

    private function document(): Task
    {
        return Task::create([
            'title' => 'A document', 'project_id' => $this->project->id,
            'list_id' => $this->sign->id, 'user_id' => $this->signer->id, 'order' => 1,
        ]);
    }

    private function sign(Task $task)
    {
        return $this->postJson('/task/'.$task->id.'/signature-request');
    }

    /** A step with more of the flow after it leaves the document open. */
    public function test_signing_onto_an_ordinary_step_does_not_finish_the_document(): void
    {
        $this->step('Distribute', 1, 'sg');

        $task = $this->document();
        $this->sign($task)->assertOk()->assertJson(['is_done' => 0]);

        $task->refresh();
        $this->assertSame($this->next->id, (int) $task->list_id);
        $this->assertSame(0, (int) $task->is_done);
    }

    /** ...and it lands on the plate of whoever carries that step. */
    public function test_signing_assigns_the_step_it_moves_to(): void
    {
        $rev = WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 1]);
        $reviewer = User::factory()->create(['workflow_sub_role_id' => $rev->id]);

        $this->step('Distribute', 1, 'rev');

        $task = $this->document();
        $this->sign($task)->assertOk();

        $this->assertDatabaseHas('assignees', ['task_id' => $task->id, 'user_id' => $reviewer->id]);
    }

    /** Only a step configured as the end of the flow closes the document. */
    public function test_signing_onto_a_terminal_step_finishes_it(): void
    {
        $this->step('Distribute', 1, 'sg', terminal: true);

        $task = $this->document();
        $this->sign($task)->assertOk()->assertJson(['is_done' => 1]);

        $this->assertSame(1, (int) $task->fresh()->is_done);
    }

    /** The signer hands it on, so it comes off their own list. */
    public function test_the_signer_does_not_keep_the_document(): void
    {
        $rev = WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 1]);
        User::factory()->create(['workflow_sub_role_id' => $rev->id]);
        $this->step('Distribute', 1, 'rev');

        $task = $this->document();
        Assignee::create(['task_id' => $task->id, 'user_id' => $this->signer->id]);

        $this->sign($task)->assertOk();

        $this->assertDatabaseMissing('assignees', [
            'task_id' => $task->id, 'user_id' => $this->signer->id,
        ]);
    }
}
