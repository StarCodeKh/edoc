<?php

namespace Tests\Feature;

use App\Models\DocumentSource;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkflowSubRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The user list's search box.
 *
 * It reached first name, last name, phone and email only, so every other column
 * on the page - ចំណងជើង, តួនាទី - and the department someone is filed under
 * returned an empty table when typed in. A search box that cannot find what the
 * list is showing is worse than none.
 */
class UserSearchTest extends TestCase
{
    use RefreshDatabase;

    private User $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $department = DocumentSource::create(['name' => 'នាយកដ្ឋានរដ្ឋបាល', 'order' => 0]);
        $office = DocumentSource::create([
            'name' => 'ការិយាល័យរង ១', 'parent_id' => $department->id, 'order' => 0,
        ]);

        $admin = Role::create(['name' => 'Admin', 'slug' => 'admin', 'access' => json_encode([])]);
        $normal = Role::create(['name' => 'Normal', 'slug' => 'normal', 'access' => json_encode([])]);

        $this->subject = User::factory()->create([
            'first_name' => 'ទ្រី',
            'last_name' => 'គីមហេង',
            'email' => 'trykimheng@cgmc.gov.kh',
            'title' => 'ប្រធាននាយកដ្ឋាន',
            'role_id' => $admin->id,
            'workflow_sub_role_id' => WorkflowSubRole::create([
                'code' => 'sg', 'name' => 'អគ្គលេខាធិការ', 'order' => 0,
            ])->id,
            'document_source_id' => $office->id,
        ]);

        // Somebody who must not come back on any of the searches below. Their
        // role is pinned: UserFactory picks role_id at random from 1-4, so
        // leaving it to the factory put them on "Admin" some runs and made the
        // role search assert against two users about a third of the time.
        User::factory()->create([
            'first_name' => 'Someone',
            'last_name' => 'Else',
            'email' => 'else@example.com',
            'title' => 'Clerk',
            'role_id' => $normal->id,
            'workflow_sub_role_id' => null,
            'document_source_id' => null,
        ]);
    }

    /** @return array<int, int> */
    private function search(string $term): array
    {
        return User::filter(['search' => $term])->pluck('id')->all();
    }

    public static function terms(): array
    {
        return [
            'first name' => ['ទ្រី'],
            'last name' => ['គីមហេង'],
            'email' => ['trykimheng'],
            'ចំណងជើង' => ['ប្រធាននាយកដ្ឋាន'],
            'តួនាទី' => ['Admin'],
            'responsibility' => ['អគ្គលេខាធិការ'],
            'responsibility code' => ['sg'],
            'នាយកដ្ឋាន' => ['នាយកដ្ឋានរដ្ឋបាល'],
            'ការិយាល័យរង' => ['ការិយាល័យរង ១'],
        ];
    }

    /**
     * @dataProvider terms
     */
    public function test_the_search_reaches_every_field_the_list_shows(string $term): void
    {
        $this->assertSame([$this->subject->id], $this->search($term), 'searching "'.$term.'" should find them');
    }

    /**
     * Names are stored split and Khmer names are given family-name-first, so
     * the whole name matched neither column on its own.
     */
    public function test_a_full_name_matches_written_either_way_round(): void
    {
        $this->assertSame([$this->subject->id], $this->search('ទ្រី គីមហេង'));
        $this->assertSame([$this->subject->id], $this->search('គីមហេង ទ្រី'));
    }

    public function test_it_still_finds_nobody_when_nobody_matches(): void
    {
        $this->assertSame([], $this->search('ឯកសារដែលគ្មាន'));
    }

    /** The role filter is unchanged, and the two narrow together. */
    public function test_the_role_filter_still_narrows(): void
    {
        $normal = Role::where('slug', 'normal')->value('id');

        $this->assertSame(
            [],
            User::filter(['search' => 'ទ្រី', 'role_id' => $normal])->pluck('id')->all()
        );
    }
}
