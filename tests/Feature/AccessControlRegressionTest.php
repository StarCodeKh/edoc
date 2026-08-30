<?php

namespace Tests\Feature;

use App\Models\BoardList;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The holes found in the August 2026 review, each pinned by a test so they
 * cannot quietly reopen: anonymous read of the register, clients writing
 * columns no form offers, an unthrottled login, and script in a comment.
 */
class AccessControlRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Workspace $workspace;

    private Project $project;

    private Task $task;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Normal User', 'slug' => 'normal', 'access' => json_encode([])]);
        $this->owner = User::factory()->create(['role_id' => $role->id]);

        $this->workspace = Workspace::factory()->create(['user_id' => $this->owner->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $this->owner->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);

        $list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 1,
            'user_id' => $this->owner->id,
        ]);

        $this->task = Task::create([
            'title' => 'Confidential minute',
            'project_id' => $this->project->id,
            'list_id' => $list->id,
            'origin_list_id' => $list->id,
            'user_id' => $this->owner->id,
            'order' => 1,
        ]);
    }

    public function test_guest_cannot_read_the_workspace_dashboard(): void
    {
        $this->get('/workspace/'.$this->workspace->id.'/main-dashboard')
            ->assertRedirect('/login');
    }

    public function test_guest_cannot_search_documents(): void
    {
        $this->post('/json/task/search', ['q' => 'Confidential'])
            ->assertRedirect('/login');
    }

    public function test_visible_scope_returns_nothing_without_a_user(): void
    {
        $this->assertSame(0, Task::visibleTo()->count());
        $this->assertSame(1, Task::visibleTo($this->owner)->count());
    }

    public function test_search_does_not_expose_another_users_projects(): void
    {
        $outsider = User::factory()->create(['role_id' => $this->owner->role_id]);

        // Search on the project's own title, so an unscoped `projects` query
        // would certainly match it.
        $response = $this->actingAs($outsider)
            ->post('/json/task/search', ['q' => $this->project->title])
            ->assertOk();

        $this->assertSame([], $response->json('tasks'));
        $this->assertSame([], $response->json('projects'));
    }

    public function test_task_update_writes_the_title_but_ignores_unlisted_columns(): void
    {
        $intruder = User::factory()->create(['role_id' => $this->owner->role_id]);

        $this->actingAs($this->owner)
            ->post('/task/update/'.$this->task->id, [
                'title' => 'Renamed minute',
                'user_id' => $intruder->id,
                'task_code' => 'FORGED-0001',
            ])
            ->assertOk();

        $this->task->refresh();

        $this->assertSame('Renamed minute', $this->task->title);
        $this->assertSame($this->owner->id, $this->task->user_id);
        $this->assertNotSame('FORGED-0001', $this->task->task_code);
    }

    public function test_comment_update_cannot_re_attribute_authorship(): void
    {
        $intruder = User::factory()->create(['role_id' => $this->owner->role_id]);

        $comment = Comment::create([
            'task_id' => $this->task->id,
            'user_id' => $this->owner->id,
            'details' => 'Original note',
        ]);

        $this->actingAs($this->owner)
            ->post('/comments/update/'.$comment->id, [
                'details' => 'Edited note',
                'user_id' => $intruder->id,
            ])
            ->assertOk();

        $comment->refresh();

        $this->assertSame('Edited note', $comment->details);
        $this->assertSame($this->owner->id, $comment->user_id);
    }

    public function test_comment_markup_is_sanitised_on_the_way_in(): void
    {
        $this->actingAs($this->owner)
            ->post('/comments/new', [
                'task_id' => $this->task->id,
                'details' => '<p>Please review</p><script>alert(1)</script>',
            ])
            ->assertOk();

        $details = Comment::where('task_id', $this->task->id)->value('details');

        $this->assertStringNotContainsString('<script>', $details);
        $this->assertStringContainsString('Please review', $details);
    }

    public function test_login_is_rate_limited_after_five_failures(): void
    {
        RateLimiter::clear(strtolower($this->owner->email).'|127.0.0.1');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from('/login')->post('/login', [
                'email' => $this->owner->email,
                'password' => 'not-the-password',
            ]);
        }

        $this->from('/login')->post('/login', [
            'email' => $this->owner->email,
            'password' => 'not-the-password',
        ])->assertSessionHasErrors('email');

        $this->assertTrue(
            RateLimiter::tooManyAttempts(strtolower($this->owner->email).'|127.0.0.1', 5)
        );
    }
}
