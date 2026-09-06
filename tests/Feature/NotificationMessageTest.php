<?php

namespace Tests\Feature;

use App\Models\BoardList;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\TaskUpdatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * What a notification stores for the bell to read back.
 *
 * The message was one English sentence baked at write time, which the page
 * could only replay. It now carries a key and its values instead.
 */
class NotificationMessageTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Project $project;

    private BoardList $first;

    private BoardList $second;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $this->actor = User::factory()->create(['role_id' => $role->id, 'first_name' => 'Sok']);

        $workspace = Workspace::factory()->create(['user_id' => $this->actor->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $this->actor->id, 'workspace_id' => $workspace->id, 'background_id' => null,
        ]);

        $this->first = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'ឯកសារចូល', 'order' => 0, 'user_id' => $this->actor->id,
        ]);
        $this->second = BoardList::create([
            'project_id' => $this->project->id, 'title' => 'ពិនិត្យ', 'order' => 1, 'user_id' => $this->actor->id,
        ]);
    }

    private function task(): Task
    {
        return Task::create([
            'title' => 'Testv1',
            'project_id' => $this->project->id,
            'list_id' => $this->first->id,
            'user_id' => $this->actor->id,
            'order' => 1,
        ]);
    }

    private function payload(string $field, $old, $new): array
    {
        return (new TaskUpdatedNotification($this->task(), $this->actor, $field, $old, $new, false))
            ->toArray($this->actor);
    }

    public function test_a_move_is_stored_as_a_key_and_its_values(): void
    {
        $data = $this->payload('list_id', $this->first->id, $this->second->id);

        $this->assertSame('moved task ":task" from ":from" to ":to"', $data['message_key']);
        $this->assertSame([
            'task' => 'Testv1',
            'from' => 'ឯកសារចូល',
            'to' => 'ពិនិត្យ',
        ], $data['message_values']);
    }

    /**
     * The English sentence stays alongside it. Mail and Slack are sent once to
     * one place and want English, and rows written before the pair existed are
     * still read back for thirty days.
     */
    public function test_the_english_sentence_is_kept_for_mail_and_slack(): void
    {
        $data = $this->payload('list_id', $this->first->id, $this->second->id);

        $this->assertSame(
            'moved task "Testv1" from "ឯកសារចូល" to "ពិនិត្យ"',
            $data['message']
        );
    }

    /**
     * A board deleted since the move leaves the id resolving to nothing. The
     * stand-in travels as a key: resolved at write time it would carry the
     * locale of whoever pressed the button.
     */
    public function test_a_missing_board_travels_as_a_key_not_as_text(): void
    {
        $data = $this->payload('list_id', 999999, $this->second->id);

        $this->assertSame(['translate' => 'Unknown'], $data['message_values']['from']);

        // The mail and Slack copy is English and stays plain text.
        $this->assertStringContainsString('Unknown', $data['message']);
    }

    /** The same, for a due date that was never set. */
    public function test_a_missing_due_date_travels_as_a_key(): void
    {
        $data = $this->payload('due_date', null, '2026-09-30');

        $this->assertSame(['translate' => 'no date'], $data['message_values']['from']);
        $this->assertSame('Sep 30', $data['message_values']['to']);
    }

    public static function fields(): array
    {
        return [
            'title' => ['title', 'renamed the task from ":from" to ":to"'],
            'description' => ['description', 'updated the description for task ":task"'],
            'due_date' => ['due_date', 'changed the due date from :from to :to'],
            'anything else' => ['priority_id', 'updated task ":task"'],
        ];
    }

    /**
     * @dataProvider fields
     */
    public function test_every_field_stores_a_key(string $field, string $expected): void
    {
        $data = $this->payload($field, 'a', 'b');

        $this->assertSame($expected, $data['message_key']);
    }

    /** is_done arrives as a bool, an int or a string depending on the caller. */
    public function test_completion_reads_the_same_whichever_shape_it_arrives_in(): void
    {
        foreach ([true, 1, '1', 'true'] as $truthy) {
            $this->assertSame(
                'marked ":task" as done',
                $this->payload('is_done', false, $truthy)['message_key'],
                'newValue '.var_export($truthy, true).' should read as done'
            );
        }

        $this->assertSame(
            'marked ":task" as not done',
            $this->payload('is_done', '1', '0')['message_key']
        );
    }
}
