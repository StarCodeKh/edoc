<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Notifications\NewCommentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NewCommentNotificationTest extends TestCase
{
    // The test builds users and a task, so it needs the schema; without this
    // it ran against an empty in-memory database and could never pass.
    use RefreshDatabase;

    public function test_assignees_are_notified_when_a_comment_is_added()
    {
        Notification::fake(); // Prevents actual notifications from being sent

        $taskCreator = User::factory()->create();
        $assignee = User::factory()->create();
        $commenter = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $taskCreator->id]);
        $task->assignees()->attach($assignee);

        // Action: The commenter adds a comment
        //    $this->actingAs($commenter)->post(route('comments.store'), [
        //        'task_id' => $task->id,
        //        'details' => 'This is a test comment.',
        //    ]);

        // Assertions
        Notification::assertSentTo($assignee, NewCommentNotification::class);
        Notification::assertNotSentTo($commenter, NewCommentNotification::class); // Don't notify yourself
    }
}
