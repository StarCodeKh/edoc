<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/**
 * The ឯកសារភ្ជាប់ box and its ស្តង់ដារ / ចាមរង្គ mode, which until now only drew
 * a chip on the timeline.
 *
 * Ticked, the step takes a document and will not be sent on without one.
 * Unticked, it is a review of what arrived and takes nothing. Standard holds a
 * single document; dynamic holds as many as the case produces.
 */
class StepAttachmentRuleTest extends TestCase
{
    use RefreshDatabase;

    private Workspace $workspace;

    private Project $project;

    private User $officer;

    private BoardList $drafting;   // takes a document, standard

    private BoardList $review;     // takes none

    private BoardList $collecting; // takes documents, dynamic

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $subRole = WorkflowSubRole::create(['code' => 'dept', 'name' => 'Department', 'order' => 0]);
        $this->officer = User::factory()->create([
            'role_id' => $adminRole->id,
            'workflow_sub_role_id' => $subRole->id,
        ]);

        $this->workspace = Workspace::factory()->create(['user_id' => $admin->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $admin->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        $boards = [
            ['Drafting', 1, true, 'standard'],
            ['Review', 2, false, 'standard'],
            ['Collecting', 3, true, 'dynamic'],
        ];

        foreach ($boards as [$title, $order, $needs, $mode]) {
            $list = BoardList::create([
                'project_id' => $this->project->id,
                'title' => $title,
                'order' => $order,
                'user_id' => $admin->id,
            ]);

            EdocWorkflowRole::create([
                'workflow_type' => 'internal_cgmc',
                'workspace_id' => $this->workspace->id,
                'list_title' => $title,
                'order' => $order,
                'responsible_role' => 'dept',
                'requires_attachment' => $needs,
                'attachment_mode' => $mode,
            ]);

            $property = lcfirst($title);
            $this->$property = $list;
        }
    }

    private function documentOn(BoardList $list): Task
    {
        return Task::create([
            'title' => 'Reply letter',
            'project_id' => $this->project->id,
            'list_id' => $list->id,
            'origin_list_id' => $list->id,
            'user_id' => $this->officer->id,
            'order' => 1,
        ]);
    }

    private function upload(Task $task, string $name = 'draft.pdf')
    {
        return $this->actingAs($this->officer)->post("/task/attachment/add/{$task->id}", [
            'file' => UploadedFile::fake()->create($name, 10, 'application/pdf'),
        ]);
    }

    public function test_a_step_that_takes_no_document_refuses_an_upload(): void
    {
        $task = $this->documentOn($this->review);

        $this->upload($task)->assertStatus(422);

        $this->assertSame(0, Attachment::where('task_id', $task->id)->count());
    }

    public function test_a_step_that_takes_a_document_accepts_one_and_records_its_board(): void
    {
        $task = $this->documentOn($this->drafting);

        $this->upload($task)->assertOk();

        $this->assertSame(
            $this->drafting->id,
            (int) Attachment::where('task_id', $task->id)->value('list_id')
        );
    }

    public function test_a_standard_step_holds_one_document(): void
    {
        $task = $this->documentOn($this->drafting);

        $this->upload($task, 'first.pdf')->assertOk();
        $this->upload($task, 'second.pdf')->assertOk();

        $files = Attachment::where('task_id', $task->id)->pluck('name');

        $this->assertCount(1, $files);
        $this->assertSame('second.pdf', $files->first());
    }

    public function test_a_dynamic_step_holds_as_many_as_it_is_given(): void
    {
        $task = $this->documentOn($this->collecting);

        $this->upload($task, 'first.pdf')->assertOk();
        $this->upload($task, 'second.pdf')->assertOk();

        $this->assertSame(2, Attachment::where('task_id', $task->id)->count());
    }

    public function test_replacing_never_touches_a_file_filed_at_another_step(): void
    {
        $task = $this->documentOn($this->drafting);

        // The scan the document arrived with, filed against an earlier board.
        $inherited = Attachment::create([
            'task_id' => $task->id,
            'list_id' => $this->review->id,
            'name' => 'original-scan.pdf',
            'user_id' => $this->officer->id,
            'size' => 100,
            'path' => '/files/original-scan.pdf',
        ]);

        $this->upload($task, 'first.pdf')->assertOk();
        $this->upload($task, 'second.pdf')->assertOk();

        $this->assertDatabaseHas('attachments', ['id' => $inherited->id]);
        $this->assertSame(2, Attachment::where('task_id', $task->id)->count());
    }

    public function test_a_step_that_needs_a_document_will_not_be_forwarded_without_one(): void
    {
        $task = $this->documentOn($this->drafting);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        $this->actingAs($this->officer)
            ->post("/w/{$uid}/documents/{$task->slug}/forward")
            ->assertSessionHas('error');

        $this->assertSame($this->drafting->id, (int) $task->fresh()->list_id);
    }

    public function test_the_same_step_forwards_once_its_document_is_filed(): void
    {
        $task = $this->documentOn($this->drafting);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        $this->upload($task)->assertOk();

        $this->actingAs($this->officer)
            ->post("/w/{$uid}/documents/{$task->slug}/forward")
            ->assertSessionHas('success');

        $this->assertSame($this->review->id, (int) $task->fresh()->list_id);
    }

    public function test_an_inherited_file_does_not_satisfy_the_step(): void
    {
        $task = $this->documentOn($this->drafting);
        $uid = $this->workspace->slug ?: $this->workspace->id;

        // Filed against another board, and against none at all - neither is
        // this step's own work.
        Attachment::create([
            'task_id' => $task->id, 'list_id' => $this->review->id, 'name' => 'other.pdf',
            'user_id' => $this->officer->id, 'size' => 10, 'path' => '/files/other.pdf',
        ]);
        Attachment::create([
            'task_id' => $task->id, 'list_id' => null, 'name' => 'legacy.pdf',
            'user_id' => $this->officer->id, 'size' => 10, 'path' => '/files/legacy.pdf',
        ]);

        $this->actingAs($this->officer)
            ->post("/w/{$uid}/documents/{$task->slug}/forward")
            ->assertSessionHas('error');
    }
}
