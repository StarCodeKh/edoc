<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\DocumentSource;
use App\Models\EdocWorkflowRole;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
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

    public function test_the_form_offers_the_people_filed_under_each_office(): void
    {
        // The source pair is only asked for where the flow routes by
        // department, and so is the directory the form narrows against.
        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'To do',
            'order' => 1,
            'responsible_role' => 'admin',
        ]);

        $department = DocumentSource::create(['name' => 'Finance', 'order' => 1]);
        $office = DocumentSource::create(['name' => 'Accounting', 'parent_id' => $department->id, 'order' => 1]);

        $officer = User::factory()->create(['role_id' => $this->user->role_id]);
        $officer->update(['document_source_id' => $office->id]);

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('source_members', 1)
                ->where('source_members.0.id', $officer->id)
                ->where('source_members.0.office_id', $office->id)
                // The department comes from the office's parent, which is what
                // lets the picker narrow on either half of the pair.
                ->where('source_members.0.department_id', $department->id)
            );
    }

    public function test_the_form_falls_back_to_the_people_the_workflow_reaches(): void
    {
        // Nobody is on the workspace team and nobody is filed under an office:
        // the only people this document can land on are the ones carrying a
        // responsibility one of its steps names.
        $group = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments D1-D5', 'order' => 1]);
        $office = WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 2, 'parent_id' => $group->id]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'To do',
            'order' => 1,
            'responsible_role' => $group->code,
            'role_mode' => 'dynamic',
        ]);

        $officer = User::factory()->create(['role_id' => $this->user->role_id]);
        $officer->update(['workflow_sub_role_id' => $office->id]);

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('team_members', 0)
                ->has('source_members', 0)
                // Reached through the group the step names, which a dynamic
                // step names just as a standard one does.
                ->has('role_members', 1)
                ->where('role_members.0.id', $officer->id)
                ->where('role_members.0.role', 'D1')
            );
    }

    public function test_the_form_says_whether_the_filer_is_a_doer_in_this_flow(): void
    {
        $role = WorkflowSubRole::create(['code' => 'admin', 'name' => 'Registry Office', 'order' => 1]);
        $this->user->update(['workflow_sub_role_id' => $role->id]);

        // No step names their responsibility yet, so nothing in this flow would
        // ever hand them the document.
        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('me.role', 'Registry Office')
                ->where('me.is_doer', false)
            );

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'To do',
            'order' => 1,
            'responsible_role' => $role->code,
        ]);

        // Re-authenticated on a fresh instance: the responsibility a user
        // carries is memoised per model, and actingAs() holds the same one
        // across both requests where a real one is resolved per request.
        $this->actingAs($this->user->fresh());

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('me.is_doer', true));
    }

    public function test_each_column_names_the_responsibility_its_step_is_handed_to(): void
    {
        // What the picker matches against: the column the document lands on
        // says who it is for, so unrelated people can be left off entirely.
        $role = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments D1-D5', 'order' => 1]);

        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'To do',
            'order' => 1,
            'responsible_role' => $role->code,
        ]);

        $office = WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 2, 'parent_id' => $role->id]);
        $officer = User::factory()->create(['role_id' => $this->user->role_id]);
        $officer->update(['workflow_sub_role_id' => $office->id]);

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('lists.0.responsible_role', 'dpt')
                ->where('lists.0.responsible_role_name', 'Departments D1-D5')
                // The group the officer sits under is carried too: a step
                // naming a group is handed to all of it.
                ->where('role_members.0.role_code', 'd1')
                ->where('role_members.0.role_parent_code', 'dpt')
            );
    }

    public function test_the_registry_office_is_exempt_from_the_doer_gate(): void
    {
        // Every document passes through the registry on the way in and on the
        // way out, so it keeps one it has just filed whatever the landing step
        // says - the form is told so, and the pinned row reads it.
        $registry = WorkflowSubRole::create([
            'code' => User::REGISTRY_SUB_ROLE_CODE,
            'name' => 'Registry Office',
            'order' => 1,
        ]);

        $this->user->update(['workflow_sub_role_id' => $registry->id]);

        // A step handed to somebody else entirely: the gate would close here
        // for anyone but the registry.
        EdocWorkflowRole::create([
            'workflow_type' => 'internal_cgmc',
            'workspace_id' => $this->workspace->id,
            'list_title' => 'To do',
            'order' => 1,
            'responsible_role' => 'dpt',
        ]);

        $this->actingAs($this->user->fresh());

        $this->get(route('workspace.documents.submit', $this->workspace->slug ?: $this->workspace->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('me.is_registry', true)
                // Their own responsibility is not the one the step names, so
                // the exemption is the only thing carrying them through.
                ->where('me.role_code', User::REGISTRY_SUB_ROLE_CODE)
                ->where('lists.0.responsible_role', 'dpt')
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
