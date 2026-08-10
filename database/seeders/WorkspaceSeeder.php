<?php

namespace Database\Seeders;

use App\Models\Workspace;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\WorkspaceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('🏢 Creating workspaces and team members...');

        // Get all users and workspace types
        $users = User::all();
        $workspaceTypes = WorkspaceType::all();

        if ($users->count() < 5) {
            $this->command->error('❌ Need at least 5 users. Please run UserSeeder first.');
            return;
        }

        // Create 5 real workspaces with meaningful names and descriptions
        $workspaces = collect([
            [
                'name' => 'Adobe Creative Cloud',
                'type' => 'Creative Software',
                'website' => 'https://adobe.com',
                'description' => 'Leading provider of creative software and digital experience solutions. Empowering creative professionals and businesses worldwide with innovative tools and cloud services.',
                'team_size' => 25,
                'logo' => '/images/demo/workspaces/adobe.svg'
            ],
            [
                'name' => 'Amazon Web Services',
                'type' => 'Cloud Computing',
                'website' => 'https://aws.amazon.com',
                'description' => 'Comprehensive cloud computing platform offering infrastructure services, platform services, and packaged software. Trusted by millions of customers globally.',
                'team_size' => 18,
                'logo' => '/images/demo/workspaces/amazon.svg'
            ],
            [
                'name' => 'Google Chrome Team',
                'type' => 'Web Browser Development',
                'website' => 'https://chrome.google.com',
                'description' => 'Development team behind the world\'s most popular web browser. Focused on creating fast, secure, and user-friendly browsing experiences across all platforms.',
                'team_size' => 15,
                'logo' => '/images/demo/workspaces/chrome.svg'
            ],
            [
                'name' => 'Figma Design Platform',
                'type' => 'Design Collaboration',
                'website' => 'https://figma.com',
                'description' => 'Collaborative interface design tool that brings teams together to create, test, and ship better designs from start to finish. Revolutionizing how design teams work.',
                'team_size' => 12,
                'logo' => '/images/demo/workspaces/figma.svg'
            ],
            [
                'name' => 'Microsoft Windows',
                'type' => 'Operating System',
                'website' => 'https://microsoft.com/windows',
                'description' => 'Development team responsible for the Windows operating system. Creating innovative features, security enhancements, and user experiences for billions of users worldwide.',
                'team_size' => 22,
                'logo' => '/images/demo/workspaces/windows.svg'
            ]
        ]);

        $createdWorkspaces = collect();

        foreach ($workspaces as $workspaceData) {
            // Create workspace
            $workspace = Workspace::create([
                'user_id' => $users->random()->id,
                'name' => $workspaceData['name'],
                'slug' => Str::slug($workspaceData['name']),
                'website' => $workspaceData['website'],
                'description' => $workspaceData['description'],
                'logo' => $workspaceData['logo'],
                'type_id' => $workspaceTypes->random()->id ?? 1,
                'created_at' => fake()->dateTimeBetween('-6 months', '-1 month'),
                'updated_at' => fake()->dateTimeBetween('-1 month', 'now'),
            ]);

            $createdWorkspaces->push($workspace);

            // Add team members to workspace
            $teamSize = $workspaceData['team_size'];

            // Ensure user_id 1 and 2 are always included
            $requiredUsers = collect();

            // Add user_id 1 as admin
            if ($users->where('id', 1)->isNotEmpty()) {
                $requiredUsers->push($users->where('id', 1)->first());
            }

            // Add user_id 2 as manager
            if ($users->where('id', 2)->isNotEmpty()) {
                $requiredUsers->push($users->where('id', 2)->first());
            }

            // Add remaining users randomly
            $remainingUsers = $users->whereNotIn('id', [1, 2])->random(min($teamSize - 2, $users->count() - 2))->unique('id');
            $workspaceUsers = $requiredUsers->merge($remainingUsers);

            foreach ($workspaceUsers as $index => $user) {
                // Assign roles: user_id 1 is admin, user_id 2 is manager, rest are members
                $role = 'member';
                if ($user->id === 1) {
                    $role = 'admin';
                } elseif ($user->id === 2) {
                    $role = 'manager';
                } elseif ($index === 0 && $user->id !== 1) {
                    // If user_id 1 is not available, make first user admin
                    $role = 'admin';
                } elseif ($index === 1 && $user->id !== 2 && $teamSize > 5) {
                    // If user_id 2 is not available, make second user manager
                    $role = 'manager';
                }

                TeamMember::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                    'added_by' => $workspace->user_id,
                    'role' => $role,
                    'created_at' => fake()->dateTimeBetween($workspace->created_at, 'now'),
                ]);
            }

            // Log admin and manager assignments
            $adminUser = $workspaceUsers->where('id', 1)->first();
            $managerUser = $workspaceUsers->where('id', 2)->first();

            $roleInfo = [];
            if ($adminUser) {
                $roleInfo[] = "Admin: {$adminUser->first_name} {$adminUser->last_name} (ID: {$adminUser->id})";
            }
            if ($managerUser) {
                $roleInfo[] = "Manager: {$managerUser->first_name} {$managerUser->last_name} (ID: {$managerUser->id})";
            }

            $this->command->info("✅ Created workspace: {$workspace->name} with {$workspaceUsers->count()} team members");
            if (!empty($roleInfo)) {
                $this->command->line("   " . implode(', ', $roleInfo));
            }
        }

        $this->command->info("🎉 Successfully created {$createdWorkspaces->count()} workspaces with team members!");

        // Store workspace IDs for other seeders
        // cache()->put('seeded_workspace_ids', $createdWorkspaces->pluck('id')->toArray(), 3600);
    }
}
