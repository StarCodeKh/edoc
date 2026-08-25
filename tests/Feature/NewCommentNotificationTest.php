<?php

namespace Tests\Feature;

use App\Events\NewCommentAdded;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\NotificationSetting;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\NewCommentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NewCommentNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignees_are_notified_when_a_comment_is_added(): void
    {
        Notification::fake();

        NotificationSetting::create([
            'type' => 'new_comment',
            'name' => 'New comment',
            'is_active' => true,
        ]);

        $taskCreator = User::factory()->create();
        $assignee = User::factory()->create();
        $commenter = User::factory()->create();

        // A task needs a project: saving one builds a QR code from the route to
        // its board, which cannot be generated without one.
        $workspace = Workspace::factory()->create(['user_id' => $taskCreator->id, 'type_id' => null]);
        $project = Project::factory()->create([
            'user_id' => $taskCreator->id,
            'workspace_id' => $workspace->id,
            'background_id' => null,
        ]);
        $list = BoardList::create([
            'project_id' => $project->id,
            'title' => 'To do',
            'order' => 1,
            'user_id' => $taskCreator->id,
        ]);

        $task = Task::factory()->create([
            'user_id' => $taskCreator->id,
            'project_id' => $project->id,
            'list_id' => $list->id,
            'order' => 1,
        ]);
        $task->assignees()->create(['user_id' => $assignee->id]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'user_id' => $commenter->id,
            'details' => 'This is a test comment.',
        ]);

        event(new NewCommentAdded($comment));

        Notification::assertSentTo($assignee, NewCommentNotification::class);
        Notification::assertNotSentTo($commenter, NewCommentNotification::class);
    }
}
