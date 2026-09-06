<?php

namespace Tests\Feature;

use App\Models\BoardList;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The CGMC number a document is registered under.
 *
 * It is the document's identity - printed on the slip, read off the barcode,
 * quoted between offices - and there is no unique index on task_code, so the
 * generator is the only thing standing between the register and a duplicate.
 */
class TaskCodeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Project $project;

    private BoardList $list;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->user = User::factory()->create(['role_id' => $role->id]);

        $workspace = Workspace::factory()->create(['user_id' => $this->user->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $this->user->id, 'workspace_id' => $workspace->id, 'background_id' => null,
        ]);
        $this->list = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'Intake', 'order' => 0, 'user_id' => $this->user->id,
        ]);
    }

    private function makeDocument(string $title = 'A document'): Task
    {
        return Task::create([
            'title' => $title,
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'user_id' => $this->user->id,
            'order' => 1,
        ]);
    }

    public function test_codes_run_in_sequence(): void
    {
        $this->assertSame('CGMC-000000001', $this->makeDocument('one')->task_code);
        $this->assertSame('CGMC-000000002', $this->makeDocument('two')->task_code);
        $this->assertSame('CGMC-000000003', $this->makeDocument('three')->task_code);
    }

    /**
     * The bug this guards: Task is soft-deleted, and the generator asked the
     * default scope, so a deleted document's code was handed straight to the
     * next one created.
     */
    public function test_a_deleted_document_does_not_free_its_code(): void
    {
        $one = $this->makeDocument('one');
        $two = $this->makeDocument('two');

        $two->delete();

        $three = $this->makeDocument('three');

        $this->assertNotSame($two->task_code, $three->task_code);
        $this->assertSame('CGMC-000000003', $three->task_code);
        $this->assertNotSame($one->task_code, $three->task_code);
    }

    /** Deleting every document still does not restart the numbering. */
    public function test_emptying_the_register_does_not_restart_the_numbering(): void
    {
        $codes = [];

        foreach (['one', 'two', 'three'] as $title) {
            $codes[] = $this->makeDocument($title)->task_code;
        }

        Task::query()->delete();

        $next = $this->makeDocument('four')->task_code;

        $this->assertNotContains($next, $codes);
        $this->assertSame('CGMC-000000004', $next);
    }

    /** Every code the register has ever issued is distinct. */
    public function test_no_two_documents_ever_share_a_code(): void
    {
        $codes = [];

        for ($i = 0; $i < 6; $i++) {
            $task = $this->makeDocument('doc '.$i);
            $codes[] = $task->task_code;

            // Delete every other one, which is what surfaced the bug.
            if ($i % 2 === 0) {
                $task->delete();
            }
        }

        $this->assertSame($codes, array_values(array_unique($codes)));
        $this->assertCount(6, $codes);
    }

    /** A code already set by the caller is left alone. */
    public function test_a_supplied_code_is_not_overwritten(): void
    {
        $task = Task::create([
            'title' => 'Imported',
            'task_code' => 'CGMC-000009999',
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'user_id' => $this->user->id,
            'order' => 1,
        ]);

        $this->assertSame('CGMC-000009999', $task->task_code);

        // ...and the next one carries on past it rather than colliding.
        $this->assertSame('CGMC-000010000', $this->makeDocument('next')->task_code);
    }
}
