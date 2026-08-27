<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\GroupAssignee;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use App\Models\UserGroup;
use App\Models\Workspace;
use App\Support\TaskAbility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Documents a Normal User is merely *related* to.
 *
 * Owning a document or being assigned it already carried its own rights. These
 * four looser links - a group they belong to holds it, they follow it, they
 * handled it at an earlier step, or they commented on it - earn a place in the
 * register and a readable detail page, and nothing beyond that.
 *
 * Both halves matter and are tested together: the listing scope and the model
 * level ability have to agree, or a document lists but refuses to open.
 */
class DocumentRelatedVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $normal;

    private Workspace $workspace;

    private Project $project;

    private BoardList $list;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $userRole = Role::create(['name' => 'User', 'slug' => 'user', 'access' => json_encode([])]);

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->normal = User::factory()->create(['role_id' => $userRole->id]);

        $this->workspace = Workspace::factory()->create(['user_id' => $this->admin->id, 'type_id' => null]);
        $this->project = Project::factory()->create([
            'user_id' => $this->admin->id,
            'workspace_id' => $this->workspace->id,
            'background_id' => null,
        ]);
        $this->list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'Registry',
            'order' => 1,
            'user_id' => $this->admin->id,
        ]);
    }

    /** A document filed by the administration, with no link to the normal user. */
    private function makeDocument(): Task
    {
        return Task::create([
            'title' => 'Circular on budget review',
            'project_id' => $this->project->id,
            'list_id' => $this->list->id,
            'user_id' => $this->admin->id,
            'entry_date' => '2026-08-26 09:00:00',
            'order' => 1,
        ]);
    }

    private function showUrl(Task $task): string
    {
        return route('workspace.documents.show', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ]);
    }

    private function listingUrl(): string
    {
        return route('workspace.view.documents', [
            'uid' => $this->workspace->slug ?: $this->workspace->id,
        ]);
    }

    /** Puts the normal user in a group, and assigns that group the document. */
    private function relateByGroup(Task $task): void
    {
        $group = UserGroup::create(['name' => 'Finance', 'created_by' => $this->admin->id]);

        DB::table('user_group_members')->insert([
            'user_group_id' => $group->id,
            'user_id' => $this->normal->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        GroupAssignee::create(['task_id' => $task->id, 'user_group_id' => $group->id]);
    }

    /**
     * The baseline the rest of this file is measured against: without one of
     * the four links, the document neither lists nor opens.
     */
    public function test_an_unrelated_document_neither_lists_nor_opens(): void
    {
        $task = $this->makeDocument();

        $this->actingAs($this->normal);

        $this->assertFalse(TaskAbility::canView($this->normal, $task));
        $this->get($this->showUrl($task))->assertForbidden();

        $this->get($this->listingUrl())->assertInertia(
            fn (AssertableInertia $page) => $page->where('documents.data', [])
        );
    }

    public static function relationProvider(): array
    {
        return [
            'their group holds it' => ['group'],
            'they follow it' => ['watcher'],
            'they handled it earlier' => ['activity'],
            'they commented on it' => ['comment'],
        ];
    }

    /**
     * Each link on its own is enough to list the document and open it. Run per
     * relation so a regression names which one broke.
     */
    #[DataProvider('relationProvider')]
    public function test_a_related_document_lists_and_opens(string $relation): void
    {
        $task = $this->makeDocument();

        match ($relation) {
            'group' => $this->relateByGroup($task),
            'watcher' => $task->watchers()->attach($this->normal->id),
            'activity' => Activity::create([
                'user_id' => $this->normal->id,
                'task_id' => $task->id,
                'field_changed' => 'list_id',
            ]),
            'comment' => Comment::create([
                'task_id' => $task->id,
                'user_id' => $this->normal->id,
                'details' => 'Noted.',
            ]),
        };

        $this->actingAs($this->normal);

        $this->assertTrue(TaskAbility::canView($this->normal, $task));
        $this->get($this->showUrl($task))->assertOk();

        // The listing scope has to agree with the ability, not merely allow it.
        $this->get($this->listingUrl())->assertInertia(
            fn (AssertableInertia $page) => $page->where('documents.data.0.id', $task->id)
        );
    }

    /**
     * The point of the whole change: related is read, and only read. Nothing
     * here may become an action on the document.
     */
    #[DataProvider('relationProvider')]
    public function test_a_related_document_carries_no_rights_beyond_reading(string $relation): void
    {
        $task = $this->makeDocument();

        match ($relation) {
            'group' => $this->relateByGroup($task),
            'watcher' => $task->watchers()->attach($this->normal->id),
            'activity' => Activity::create([
                'user_id' => $this->normal->id,
                'task_id' => $task->id,
                'field_changed' => 'list_id',
            ]),
            'comment' => Comment::create([
                'task_id' => $task->id,
                'user_id' => $this->normal->id,
                'details' => 'Noted.',
            ]),
        };

        $abilities = TaskAbility::summary($this->normal, $task);

        $this->assertTrue($abilities['view']);
        $this->assertFalse($abilities['edit']);
        $this->assertFalse($abilities['move']);
        $this->assertFalse($abilities['delete']);
        $this->assertFalse($abilities['attach']);
        $this->assertFalse($abilities['comment']);
    }

    /** And the detail page offers them nothing to press. */
    public function test_the_detail_page_offers_a_related_user_no_actions(): void
    {
        $task = $this->makeDocument();
        $task->watchers()->attach($this->normal->id);

        $this->actingAs($this->normal);

        $this->get($this->showUrl($task))->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('can.attach', false)
                ->where('can.forward', false)
        );
    }

    /**
     * Group membership is read at request time, not copied at assign time -
     * which is the gap this closes. GroupAssignmentController fans a group out
     * into individual assignee rows when the group is assigned, so anyone added
     * to the group afterwards was previously invisible to it.
     */
    public function test_a_member_added_to_the_group_after_assignment_still_sees_it(): void
    {
        $task = $this->makeDocument();

        $group = UserGroup::create(['name' => 'Finance', 'created_by' => $this->admin->id]);
        GroupAssignee::create(['task_id' => $task->id, 'user_group_id' => $group->id]);

        // Joins only now - no assignee row was ever written for them.
        DB::table('user_group_members')->insert([
            'user_group_id' => $group->id,
            'user_id' => $this->normal->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertFalse(TaskAbility::isAssigned($this->normal, $task));
        $this->assertTrue(TaskAbility::canView($this->normal, $task));

        $this->actingAs($this->normal);
        $this->get($this->showUrl($task))->assertOk();
    }

    /**
     * The attachment viewer is a full document viewer, so it is the document's
     * rule that governs it. It previously checked only that the attachment
     * belonged to the task, which let anyone signed in read any file by id.
     */
    public function test_the_attachment_viewer_is_closed_to_an_unrelated_user(): void
    {
        $task = $this->makeDocument();
        $attachment = Attachment::create([
            'task_id' => $task->id,
            'name' => 'circular.pdf',
            'user_id' => $this->admin->id,
            'size' => 1024,
            'path' => '/files/tasks/circular.pdf',
        ]);

        $this->actingAs($this->normal);

        $this->get(route('task.attachment.view', [
            'taskUid' => $task->id,
            'attachmentId' => $attachment->id,
        ]))->assertForbidden();
    }

    /** And open to someone the document is related to, who may read it. */
    public function test_the_attachment_viewer_opens_for_a_related_user(): void
    {
        $task = $this->makeDocument();
        $attachment = Attachment::create([
            'task_id' => $task->id,
            'name' => 'circular.pdf',
            'user_id' => $this->admin->id,
            'size' => 1024,
            'path' => '/files/tasks/circular.pdf',
        ]);

        $task->watchers()->attach($this->normal->id);

        $this->actingAs($this->normal);

        $this->get(route('task.attachment.view', [
            'taskUid' => $task->id,
            'attachmentId' => $attachment->id,
        ]))->assertOk();
    }

    /** A relation to one document is not a relation to the next one. */
    public function test_relating_to_one_document_does_not_open_another(): void
    {
        $mine = $this->makeDocument();
        $other = $this->makeDocument();

        $mine->watchers()->attach($this->normal->id);

        $this->actingAs($this->normal);

        $this->assertTrue(TaskAbility::canView($this->normal, $mine));
        $this->assertFalse(TaskAbility::canView($this->normal, $other));
        $this->get($this->showUrl($other))->assertForbidden();
    }
}
