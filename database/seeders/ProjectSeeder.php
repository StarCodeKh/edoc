<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Workspace;
use App\Models\BoardList;
use App\Models\Label;
use App\Models\Background;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('📁 Creating projects, board lists, and labels...');

        // Get workspaces
        $workspaces = Workspace::with('teamMembers')->get();

        if ($workspaces->count() === 0) {
            $this->command->error('❌ No workspaces found. Please run WorkspaceSeeder first.');
            return;
        }

        $createdProjects = collect();

        foreach ($workspaces as $workspace) {
            $projectCount = fake()->numberBetween(5, 8); // Minimum 5 projects per workspace

            for ($i = 0; $i < $projectCount; $i++) {
                $project = $this->createProject($workspace);
                $createdProjects->push($project);

                // Create board lists for each project
                $this->createBoardLists($project);

                // Create labels for each project
                $this->createLabels($project);

                $this->command->info("✅ Created project: {$project->title}");
            }
        }

        $this->command->info("🎉 Successfully created {$createdProjects->count()} projects with board lists and labels!");

        // Store project IDs for other seeders
        // cache()->put('seeded_project_ids', $createdProjects->pluck('id')->toArray(), 3600);

        DB::table('starred_projects')->truncate();

        $createdProjectIds = $createdProjects
            ->when($createdProjects->count() >= 6, fn ($c) => $c->random(6), fn ($c) => $c)
            ->pluck('id')
            ->values()
            ->all();
        $userIds = [1, 2];

        foreach ($createdProjectIds as $pid) {
            foreach ($userIds as $uid) {
                DB::table('starred_projects')->updateOrInsert(
                    ['project_id' => $pid, 'user_id' => $uid],
                    ['updated_at' => now()]
                );
            }
        }

        $this->command->info('done - done!');
    }

    private function createProject($workspace)
    {
        // Define realistic project templates based on workspace type
        $projectTemplates = [
            'Adobe Creative Cloud' => [
                'Photoshop 2024 Feature Update',
                'Illustrator AI Integration',
                'Premiere Pro Performance Optimization',
                'Creative Cloud Mobile App',
                'Adobe Express Redesign',
                'After Effects Plugin Development',
                'Creative SDK Documentation',
                'Cloud Storage Migration'
            ],
            'Amazon Web Services' => [
                'EC2 Instance Optimization',
                'Lambda Serverless Framework',
                'S3 Storage Analytics',
                'CloudFormation Templates',
                'RDS Database Scaling',
                'API Gateway Integration',
                'CloudWatch Monitoring',
                'Security Compliance Audit'
            ],
            'Google Chrome Team' => [
                'Chrome 120 Performance Update',
                'Privacy Sandbox Implementation',
                'Mobile Browser Optimization',
                'Extension API Enhancement',
                'Security Vulnerability Fixes',
                'Memory Usage Optimization',
                'Cross-Platform Sync',
                'Developer Tools Update'
            ],
            'Figma Design Platform' => [
                'Real-time Collaboration Enhancement',
                'Design System Library',
                'Prototyping Features',
                'Mobile App Redesign',
                'Plugin Marketplace',
                'Version Control System',
                'Team Management Dashboard',
                'Accessibility Improvements'
            ],
            'Microsoft Windows' => [
                'Windows 11 Feature Update',
                'Security Patch Management',
                'Performance Optimization',
                'Accessibility Features',
                'Developer Tools Integration',
                'Cloud Services Integration',
                'User Interface Redesign',
                'Compatibility Testing'
            ]
        ];

        // Get workspace-specific projects or fallback to general
        $workspaceProjects = $projectTemplates[$workspace->name] ?? [
            'Product Development',
            'Feature Enhancement',
            'Performance Optimization',
            'Security Update',
            'User Experience Improvement',
            'API Development',
            'Documentation Update',
            'Testing & QA'
        ];

        $prefixes = ['Q1 2024', 'Q2 2024', 'Phase 1', 'Phase 2', 'Beta', 'V2', 'Next Gen', 'Spring', 'Summer', 'Fall'];

        $title = fake()->randomElement($prefixes) . ' ' . fake()->randomElement($workspaceProjects);

        // Get a random team member, fallback to workspace owner
        $userId = $workspace->user_id; // Default to workspace owner
        if ($workspace->teamMembers && $workspace->teamMembers->count() > 0) {
            $userId = $workspace->teamMembers->random()->user_id;
        }

        return Project::create([
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->realText(250),
            'workspace_id' => $workspace->id,
            'user_id' => $userId,
            'background_id' => fake()->numberBetween(1, 10),
            'is_private' => fake()->boolean(15), // 15% private
            'created_at' => fake()->dateTimeBetween('-4 months', '-1 week'),
            'updated_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    private function createBoardLists($project)
    {
        // Standard Kanban board lists
        $boardLists = [
            ['title' => 'Backlog', 'order' => 1],
            ['title' => 'To Do', 'order' => 2],
            ['title' => 'In Progress', 'order' => 3],
            ['title' => 'Review', 'order' => 4],
            ['title' => 'Testing', 'order' => 5],
            ['title' => 'Done', 'order' => 6],
        ];

        // Sometimes add custom lists
        if (fake()->boolean(30)) {
            $customLists = [
                ['title' => 'Blocked', 'order' => 7],
                ['title' => 'On Hold', 'order' => 8],
                ['title' => 'Deployed', 'order' => 9],
            ];
            $boardLists = array_merge($boardLists, fake()->randomElements($customLists, fake()->numberBetween(0, 2)));
        }

        foreach ($boardLists as $listData) {
            BoardList::create([
                'title' => $listData['title'],
                'project_id' => $project->id,
                'order' => $listData['order'],
                'is_archive' => 0,
                'user_id' => $project->user_id,
                'created_at' => fake()->dateTimeBetween($project->created_at, 'now'),
            ]);
        }
    }

    private function createLabels($project)
    {
        $labelTemplates = [
            // Priority labels
            ['name' => 'High Priority', 'color' => '#ef4444'],
            ['name' => 'Medium Priority', 'color' => '#f59e0b'],
            ['name' => 'Low Priority', 'color' => '#10b981'],

            // Type labels
            ['name' => 'Bug', 'color' => '#dc2626'],
            ['name' => 'Feature', 'color' => '#2563eb'],
            ['name' => 'Enhancement', 'color' => '#7c3aed'],
            ['name' => 'Documentation', 'color' => '#059669'],

            // Status labels
            ['name' => 'Urgent', 'color' => '#991b1b'],
            ['name' => 'Blocked', 'color' => '#6b7280'],
            ['name' => 'Review Needed', 'color' => '#c2410c'],

            // Category labels
            ['name' => 'Frontend', 'color' => '#0891b2'],
            ['name' => 'Backend', 'color' => '#be123c'],
            ['name' => 'Design', 'color' => '#a21caf'],
            ['name' => 'Marketing', 'color' => '#15803d'],
            ['name' => 'Testing', 'color' => '#a16207'],
        ];

        // Select 6-10 random labels for each project
        $selectedLabels = fake()->randomElements($labelTemplates, fake()->numberBetween(6, 10));

        foreach ($selectedLabels as $labelData) {
            Label::create([
                'name' => $labelData['name'],
                'color' => $labelData['color'],
                'project_id' => $project->id,
            ]);
        }
    }
}
