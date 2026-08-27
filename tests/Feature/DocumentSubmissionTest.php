<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\DocumentSource;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The standard intake form. A document submitted here has to arrive complete -
 * dates, source, people and the PDF all landing in the same places the task
 * modal would have written them one field at a time.
 */
class DocumentSubmissionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Project $project;

    private BoardList $list;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('file_uploads');

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);

        $this->user = User::factory()->create(['role_id' => $role->id]);

        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->user->id,
            'type_id' => null,
        ]);

        $this->project = Project::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        $this->list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'To do',
            'order' => 1,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    private function submitUrl(): string
    {
        return route('workspace.documents.submit.store', $this->workspace->slug ?: $this->workspace->id);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Circular on budget review',
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'entry_date' => '2026-08-26 09:00',
        ], $overrides);
    }

    public function test_the_form_renders_with_the_data_it_needs(): void
    {
        $department = DocumentSource::create(['name' => 'Finance', 'order' => 1]);
        DocumentSource::create(['name' => 'Accounting', 'parent_id' => $department->id, 'order' => 1]);

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Documents/Submit')
                ->has('projects', 1)
                ->has('lists', 1)
                ->has('document_sources', 1)
                ->has('document_sources.0.children', 1)
                ->where('limits.max_files', 10)
                ->where('limits.max_file_mb', 50)
            );
    }

    public function test_a_document_is_created_with_every_field_it_was_given(): void
    {
        $department = DocumentSource::create(['name' => 'Finance', 'order' => 1]);
        $office = DocumentSource::create(['name' => 'Accounting', 'parent_id' => $department->id, 'order' => 1]);
        $assignee = User::factory()->create(['role_id' => $this->user->role_id]);

        $response = $this->post($this->submitUrl(), $this->validPayload([
            'document_source_id' => $office->id,
            'due_date' => '2026-09-01 17:00',
            'description' => 'Please review before the deadline.',
            'assignees' => [$assignee->id],
        ]));

        $task = Task::firstWhere('title', 'Circular on budget review');

        $this->assertNotNull($task);
        $response->assertRedirect(route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]));

        $this->assertSame($this->list->id, (int) $task->list_id);
        $this->assertSame($this->project->id, (int) $task->project_id);
        $this->assertSame($this->user->id, (int) $task->user_id);
        $this->assertSame($office->id, (int) $task->document_source_id);
        // entry_date has no datetime cast on the model, so it comes back raw.
        $this->assertSame('2026-08-26 09:00:00', (string) $task->entry_date);
        $this->assertSame('2026-09-01 17:00:00', $task->due_date->format('Y-m-d H:i:s'));
        $this->assertNotEmpty($task->task_code, 'The document should get its tracking code on creation.');
        $this->assertSame(1, Assignee::where('task_id', $task->id)->where('user_id', $assignee->id)->count());
    }

    public function test_an_attached_pdf_is_stored_against_the_document(): void
    {
        $this->post($this->submitUrl(), $this->validPayload([
            'files' => [UploadedFile::fake()->create('សំបុត្រ ចេញ.pdf', 120, 'application/pdf')],
        ]))->assertSessionHasNoErrors();

        $task = Task::firstWhere('title', 'Circular on budget review');
        $attachment = Attachment::where('task_id', $task->id)->first();

        $this->assertNotNull($attachment);
        // The original (Khmer) name is kept for display; the stored name is not.
        $this->assertSame('សំបុត្រ ចេញ.pdf', $attachment->name);
        $this->assertStringStartsWith('/files/tasks/', $attachment->path);
        Storage::disk('file_uploads')->assertExists(str_replace('/files/', '', $attachment->path));
    }

    public function test_a_non_pdf_attachment_is_rejected_and_no_document_is_created(): void
    {
        $this->post($this->submitUrl(), $this->validPayload([
            'files' => [UploadedFile::fake()->create('notes.docx', 10)],
        ]))->assertSessionHasErrors('files.0');

        $this->assertSame(0, Task::count());
    }

    public function test_a_due_date_before_the_entry_date_is_rejected(): void
    {
        $this->post($this->submitUrl(), $this->validPayload([
            'due_date' => '2026-08-01 09:00',
        ]))->assertSessionHasErrors('due_date');

        $this->assertSame(0, Task::count());
    }

    /**
     * exists: rules only prove the rows are real. This is the check that stops a
     * hand-edited payload filing a document onto another workspace's board.
     */
    public function test_a_project_from_another_workspace_is_refused(): void
    {
        $otherWorkspace = Workspace::factory()->create(['user_id' => $this->user->id, 'type_id' => null]);
        $otherProject = Project::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $otherWorkspace->id,
            'background_id' => null,
        ]);

        $this->post($this->submitUrl(), $this->validPayload([
            'project_id' => $otherProject->id,
        ]))->assertSessionHasErrors('project_id');

        $this->assertSame(0, Task::count());
    }

    public function test_a_status_from_another_project_is_refused(): void
    {
        $otherProject = Project::factory()->create([
            'user_id' => $this->user->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);
        $otherList = BoardList::create([
            'project_id' => $otherProject->id,
            'title' => 'Elsewhere',
            'order' => 1,
            'user_id' => $this->user->id,
        ]);

        $this->post($this->submitUrl(), $this->validPayload([
            'list_id' => $otherList->id,
        ]))->assertSessionHasErrors('list_id');

        $this->assertSame(0, Task::count());
    }

    /**
     * My Tasks filters on assignee, not on who filed the document - so a
     * submission that assigns the submitter is the only thing that puts it on
     * their own list. The form ticks that box by default.
     */
    public function test_a_self_assigned_document_reaches_my_tasks(): void
    {
        $this->post($this->submitUrl(), $this->validPayload([
            'assignees' => [$this->user->id],
        ]))->assertSessionHasNoErrors();

        $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertOk()
            ->assertJson(['count' => 1]);
    }

    public function test_a_document_assigned_to_nobody_stays_off_my_tasks(): void
    {
        $this->post($this->submitUrl(), $this->validPayload())->assertSessionHasNoErrors();

        $this->assertSame(1, Task::count());

        $this->get(route('json.workspace.assigned-count', $this->workspace->id))
            ->assertOk()
            ->assertJson(['count' => 0]);
    }

    public function test_a_guest_cannot_submit(): void
    {
        auth()->logout();

        $this->post($this->submitUrl(), $this->validPayload())->assertRedirect(route('login'));

        $this->assertSame(0, Task::count());
    }
}
