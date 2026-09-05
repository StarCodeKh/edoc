<?php

namespace Tests\Feature;

use App\Models\BoardList;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TmpQrProbeTest extends TestCase
{
    use RefreshDatabase;

    public function test_probe(): void
    {
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $user = User::factory()->create(['role_id' => $role->id]);
        $ws = Workspace::factory()->create(['user_id' => $user->id, 'type_id' => null, 'slug' => 'w1']);
        $project = Project::factory()->create(['user_id' => $user->id, 'workspace_id' => $ws->id, 'background_id' => null]);
        $list = BoardList::create(['project_id' => $project->id, 'title' => 'Intake', 'order' => 0, 'user_id' => $user->id]);

        $task = Task::create([
            'title' => 'Probe doc', 'project_id' => $project->id, 'list_id' => $list->id,
            'user_id' => $user->id, 'order' => 1,
        ]);

        fwrite(STDERR, "\n=== DB ===\n");
        fwrite(STDERR, 'task_code: '.var_export($task->task_code, true)."\n");
        fwrite(STDERR, 'qr len: '.strlen((string) $task->qr_code)."\n");
        fwrite(STDERR, 'qr head: '.substr((string) $task->qr_code, 0, 60)."\n");

        $this->actingAs($user)
            ->get('/w/w1/documents/'.($task->slug ?: $task->id))
            ->assertOk()
            ->assertInertia(function (AssertableInertia $page) {
                $doc = $page->toArray()['props']['document'];
                fwrite(STDERR, "\n=== PROP ===\n");
                fwrite(STDERR, 'code: '.var_export($doc['code'] ?? null, true)."\n");
                fwrite(STDERR, 'qr_code len: '.strlen((string) ($doc['qr_code'] ?? ''))."\n");
                fwrite(STDERR, 'qr_code head: '.substr((string) ($doc['qr_code'] ?? ''), 0, 60)."\n");

                return $page;
            });
    }
}
