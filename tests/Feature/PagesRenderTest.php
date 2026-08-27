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

/**
 * Every page an admin can reach is rendered once, and the Inertia component
 * name that comes back is checked.
 *
 * The point is the class of failure that is otherwise only visible in a
 * browser: a controller that renders a page component which no longer exists,
 * a share() that throws, a route that lost its view. A green run here does not
 * prove the page draws - that is the browser's job - but a page that cannot be
 * rendered at all never gets that far.
 */
class PagesRenderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'access' => json_encode([]),
        ]);

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

        $list = BoardList::create([
            'project_id' => $this->project->id,
            'title' => 'To do',
            'order' => 1,
            'user_id' => $this->user->id,
        ]);

        Task::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
            'list_id' => $list->id,
            'order' => 1,
        ]);

        $this->actingAs($this->user);
    }

    public static function projectViews(): array
    {
        return [
            'board' => ['projects.view.board', 'Projects/View'],
            'table' => ['projects.view.table', 'Projects/Table'],
            'calendar' => ['projects.view.calendar', 'Projects/Calendar'],
            'timeline' => ['projects.view.timeline', 'Projects/Timeline'],
            'dashboard' => ['projects.view.dashboard', 'Projects/Dashboard'],
            'time logs' => ['projects.view.time_logs', 'Projects/Timer'],
        ];
    }

    /** @dataProvider projectViews */
    public function test_project_views_render(string $route, string $component): void
    {
        $this->get(route($route, $this->project->slug ?: $this->project->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component($component));
    }

    public static function settingsPages(): array
    {
        return [
            'global' => ['settings/global', 'Settings/Index'],
            'smtp' => ['settings/smtp', 'Settings/Smtp'],
            'notifications' => ['settings/notifications', 'Settings/NotificationSettings'],
            'pre-made boards' => ['settings/pre-made-boards', 'Settings/PreMadeList'],
            'workflow roles' => ['settings/workflow-roles', 'Settings/WorkflowRoles'],
        ];
    }

    /** @dataProvider settingsPages */
    public function test_settings_pages_render(string $path, string $component): void
    {
        $this->get('/'.$path)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component($component));
    }

    public function test_login_page_renders_for_a_guest(): void
    {
        auth()->logout();

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Auth/Login'));
    }

    public function test_the_root_url_lands_on_a_page(): void
    {
        // "/" forwards to whatever the user was last in - here, the one project
        // that exists. What matters is that the redirect ends on a real page.
        $this->followingRedirects()
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Projects/View'));
    }

    /**
     * `async data()` returns a Promise, and Vue's Options API assigns it as the
     * component's data without complaint - every field then reads as undefined
     * and the template throws on first access. The page returns 200 with a
     * correct data-page attribute and renders nothing, so no server-side test
     * can see it. Six pages shipped this way.
     */
    public function test_no_page_declares_an_async_data_option(): void
    {
        $offenders = [];

        // glob() does not recurse, so the tree is walked properly.
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(resource_path('js'), \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if ($file->getExtension() !== 'vue') {
                continue;
            }

            if (preg_match('/async\s+data\s*\(/', file_get_contents($file->getPathname()))) {
                $offenders[] = str_replace(resource_path('js').'/', '', $file->getPathname());
            }
        }

        sort($offenders);

        $this->assertSame([], $offenders, 'data() must be synchronous, or the component renders blank: '.implode(', ', $offenders));
    }

    /**
     * Every page component a controller names has to exist on disk. This is
     * what catches a page deleted while a controller still renders it.
     */
    public function test_every_rendered_page_component_exists(): void
    {
        $sources = collect(glob(app_path('Http/Controllers/*.php')))
            ->merge(glob(base_path('routes/*.php')))
            ->map(fn ($file) => file_get_contents($file))
            ->implode("\n");

        preg_match_all("/Inertia::render\('([^']+)'/", $sources, $matches);

        $missing = collect($matches[1])->unique()
            ->reject(fn ($component) => file_exists(resource_path("js/Pages/{$component}.vue")))
            ->values()
            ->all();

        $this->assertSame([], $missing, 'Controllers render page components that are not on disk: '.implode(', ', $missing));
    }
}
