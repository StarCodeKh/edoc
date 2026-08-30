<?php

namespace Tests\Feature;

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
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * Who may draw on a document and sign it. The answer is configuration, not a
 * role name: the step must have ហត្ថលេខា ticked in Settings → Workflow Roles,
 * and the reader must be the one carrying that step. Everyone else opens the
 * file read-only.
 */
class SignatureAbilityTest extends TestCase
{
    use RefreshDatabase;

    private Workspace $workspace;

    private Project $project;

    private BoardList $signatureBoard;

    private BoardList $plainBoard;

    private WorkflowSubRole $subRole;

    private Role $normalRole;

    protected function setUp(): void
    {
        parent::setUp();

        $admin = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->normalRole = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);

        $owner = User::factory()->create(['role_id' => $admin->id]);

        $this->workspace = Workspace::factory()->create(['user_id' => $owner->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $owner->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        $this->signatureBoard = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Secretary General reviews',
            'order' => 1,
            'user_id' => $owner->id,
        ]);
        $this->plainBoard = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 2,
            'user_id' => $owner->id,
        ]);

        $this->subRole = WorkflowSubRole::create(['code' => 'sg', 'name' => 'Secretary General', 'order' => 0]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'Secretary General reviews',
            'order' => 1,
            'responsible_role' => 'sg',
            'requires_signature' => true,
        ]);
        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'Registry',
            'order' => 2,
            'responsible_role' => 'sg',
            'requires_signature' => false,
        ]);
    }

    private function documentOn(BoardList $list): Task
    {
        return Task::create([
            'title' => 'Minute for signature',
            'project_id' => $this->project->id,
            'list_id' => $list->id,
            'origin_list_id' => $list->id,
            'user_id' => User::factory()->create(['role_id' => $this->normalRole->id])->id,
            'order' => 1,
        ]);
    }

    private function reviewer(): User
    {
        return User::factory()->create([
            'role_id' => $this->normalRole->id,
            'workflow_sub_role_id' => $this->subRole->id,
        ]);
    }

    public function test_the_responsible_reviewer_may_sign_at_a_signature_step(): void
    {
        $task = $this->documentOn($this->signatureBoard);

        $this->assertTrue(TaskAbility::canSign($this->reviewer(), $task));
    }

    public function test_the_same_reviewer_may_not_sign_at_a_step_that_asks_for_no_signature(): void
    {
        $task = $this->documentOn($this->plainBoard);

        $this->assertFalse(TaskAbility::canSign($this->reviewer(), $task));
    }

    public function test_someone_without_the_responsibility_may_not_sign(): void
    {
        $task = $this->documentOn($this->signatureBoard);
        $outsider = User::factory()->create(['role_id' => $this->normalRole->id]);

        $this->assertFalse(TaskAbility::canSign($outsider, $task));
    }

    public function test_a_finished_document_is_no_longer_signable(): void
    {
        $task = $this->documentOn($this->signatureBoard);
        $reviewer = $this->reviewer();

        // Finishing it is an edit, and Task's updating hook writes an activity
        // row against whoever made it - so it needs a signed-in user.
        $this->actingAs($reviewer);
        $task->update(['is_done' => 1]);

        $this->assertFalse(TaskAbility::canSign($reviewer, $task->fresh()));
    }

    public function test_the_viewer_page_tells_the_reviewer_it_may_be_signed(): void
    {
        $task = $this->documentOn($this->signatureBoard);
        $attachment = $task->attachments()->create([
            'name' => 'minute.pdf',
            'path' => '/files/minute.pdf',
            'size' => 1024,
            'user_id' => $this->reviewer()->id,
        ]);

        $this->actingAs($this->reviewer())
            ->get("/task/{$task->id}/attachment/{$attachment->id}/view")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Attachments/View')
                ->where('can.sign', true));
    }

    public function test_the_viewer_page_opens_read_only_for_everyone_else(): void
    {
        $task = $this->documentOn($this->signatureBoard);
        $owner = User::find($task->user_id);
        $attachment = $task->attachments()->create([
            'name' => 'minute.pdf',
            'path' => '/files/minute.pdf',
            'size' => 1024,
            'user_id' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->get("/task/{$task->id}/attachment/{$attachment->id}/view")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('can.sign', false));
    }

    public function test_saving_an_annotated_copy_is_refused_to_a_reader(): void
    {
        $task = $this->documentOn($this->signatureBoard);
        $owner = User::find($task->user_id);

        // The author may attach - that is not in question. Marking the document
        // up is what the flag claims, and what is refused.
        $this->actingAs($owner)
            ->post("/task/attachment/add/{$task->id}", [
                'file' => UploadedFile::fake()->create('annotated.pdf', 10, 'application/pdf'),
                'annotated' => '1',
            ])
            ->assertForbidden();
    }

    public function test_the_reviewer_may_save_an_annotated_copy(): void
    {
        $task = $this->documentOn($this->signatureBoard);

        $this->actingAs($this->reviewer())
            ->post("/task/attachment/add/{$task->id}", [
                'file' => UploadedFile::fake()->create('annotated.pdf', 10, 'application/pdf'),
                'annotated' => '1',
            ])
            ->assertOk();
    }
}
