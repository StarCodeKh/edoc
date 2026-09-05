<?php

namespace Tests\Feature;

use App\Models\Assignee;
use App\Models\BoardList;
use App\Models\EdocWorkflowRole;
use App\Models\NotificationSetting;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use App\Notifications\UserAssignedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Who hears about a document when it moves.
 *
 * Forwarding does not notify a workflow responsibility directly - it puts the
 * document on the plates of the people carrying the next step's responsibility,
 * and it is that assignment which notifies them. So the chain under test is
 * forward -> assign the step's doers -> notify each one, and the interesting
 * case is the step nobody carries, where there is nothing to notify.
 */
class WorkflowNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $forwarder;

    private Workspace $workspace;

    private Project $project;

    private BoardList $first;

    private BoardList $second;

    protected function setUp(): void
    {
        parent::setUp();

        NotificationSetting::updateOrCreate(['type' => 'user_assigned'], [
            'name' => 'User Assigned to a Task',
            'description' => 'Notify a user when they are assigned to a new task.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

        $admin = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->forwarder = User::factory()->create(['role_id' => $admin->id]);

        $this->workspace = Workspace::factory()->create([
            'user_id' => $this->forwarder->id, 'type_id' => null, 'slug' => 'flow',
        ]);
        $this->project = Project::factory()->create([
            'user_id' => $this->forwarder->id, 'workspace_id' => $this->workspace->id, 'background_id' => null,
        ]);

        $this->first = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'Intake', 'order' => 0, 'user_id' => $this->forwarder->id,
        ]);
        $this->second = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'Review', 'order' => 1, 'user_id' => $this->forwarder->id,
        ]);

        $this->actingAs($this->forwarder);
    }

    private function step(string $title, int $order, ?string $code): void
    {
        EdocWorkflowRole::create([
            'workflow_type' => 'flow',
            'workspace_id' => $this->workspace->id,
            'list_title' => $title,
            'order' => $order,
            'responsible_role' => $code,
        ]);
    }

    private function document(): Task
    {
        $task = Task::create([
            'title' => 'A document',
            'project_id' => $this->project->id,
            'list_id' => $this->first->id,
            'user_id' => $this->forwarder->id,
            'order' => 1,
        ]);
        Assignee::create(['task_id' => $task->id, 'user_id' => $this->forwarder->id]);

        return $task;
    }

    /** Forwarding redirects with a flash message rather than returning JSON. */
    private function forward(Task $task)
    {
        return $this->post('/w/'.$this->workspace->slug.'/documents/'.$task->slug.'/forward', []);
    }

    public function test_forwarding_notifies_whoever_carries_the_next_step(): void
    {
        Notification::fake();

        $subRole = WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 0]);
        $reviewer = User::factory()->create(['workflow_sub_role_id' => $subRole->id]);

        $this->step('Intake', 0, null);
        $this->step('Review', 1, 'rev');

        $task = $this->document();
        $this->forward($task)->assertRedirect();

        Notification::assertSentTo($reviewer, UserAssignedNotification::class);
        $this->assertDatabaseHas('assignees', ['task_id' => $task->id, 'user_id' => $reviewer->id]);
    }

    /** A group responsibility reaches everyone under it, so all of them hear. */
    public function test_a_group_step_notifies_every_member(): void
    {
        Notification::fake();

        $group = WorkflowSubRole::create(['code' => 'dpt', 'name' => 'Departments', 'order' => 0]);
        $d1 = WorkflowSubRole::create(['code' => 'd1', 'name' => 'D1', 'order' => 1, 'parent_id' => $group->id]);
        $d2 = WorkflowSubRole::create(['code' => 'd2', 'name' => 'D2', 'order' => 2, 'parent_id' => $group->id]);

        $one = User::factory()->create(['workflow_sub_role_id' => $d1->id]);
        $two = User::factory()->create(['workflow_sub_role_id' => $d2->id]);

        $this->step('Intake', 0, null);
        $this->step('Review', 1, 'dpt');

        $this->forward($this->document())->assertRedirect();

        Notification::assertSentTo($one, UserAssignedNotification::class);
        Notification::assertSentTo($two, UserAssignedNotification::class);
    }

    /**
     * A step naming a responsibility nobody carries is refused, not reported.
     *
     * Forwarding into it used to be allowed and merely warned about
     * afterwards, which left the document on a board with no plate to sit on
     * and off the forwarder's own list - so nobody held it and nobody heard.
     * The document stays where it is until the responsibility has a holder.
     */
    public function test_a_step_nobody_carries_refuses_the_forward(): void
    {
        Notification::fake();

        WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 0]);

        $this->step('Intake', 0, null);
        $this->step('Review', 1, 'rev');

        $task = $this->document();
        $this->forward($task)->assertRedirect();

        Notification::assertNothingSent();
        $this->assertStringContainsString('nobody carries', strtolower((string) session('error')));

        // Refused means refused: the document has not moved, and it is still on
        // the plate of the person who tried to send it - which is the whole
        // point. Forwarding used to take it off theirs and put it on no other.
        $this->assertSame((int) $this->first->id, (int) $task->fresh()->list_id);
        $this->assertDatabaseHas('assignees', ['task_id' => $task->id, 'user_id' => $this->forwarder->id]);
    }

    /** Give the responsibility a holder and the same forward goes through. */
    public function test_the_same_step_forwards_once_somebody_carries_it(): void
    {
        Notification::fake();

        $subRole = WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 0]);

        $this->step('Intake', 0, null);
        $this->step('Review', 1, 'rev');

        $task = $this->document();
        $this->forward($task)->assertRedirect();
        $this->assertSame((int) $this->first->id, (int) $task->fresh()->list_id);

        $reviewer = User::factory()->create(['workflow_sub_role_id' => $subRole->id]);

        $this->forward($task)->assertSessionHas('success');

        $this->assertSame((int) $this->second->id, (int) $task->fresh()->list_id);
        $this->assertDatabaseHas('assignees', ['task_id' => $task->id, 'user_id' => $reviewer->id]);
    }

    /** The switch on Settings → Notifications is respected. */
    public function test_turning_the_setting_off_stops_the_notification(): void
    {
        Notification::fake();

        NotificationSetting::where('type', 'user_assigned')->update(['is_active' => false]);

        $subRole = WorkflowSubRole::create(['code' => 'rev', 'name' => 'Reviewers', 'order' => 0]);
        User::factory()->create(['workflow_sub_role_id' => $subRole->id]);

        $this->step('Intake', 0, null);
        $this->step('Review', 1, 'rev');

        $this->forward($this->document())->assertRedirect();

        Notification::assertNothingSent();
    }
}
