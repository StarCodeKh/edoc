<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComprehensiveDataSeeder extends Seeder
{
    /**
     * Whether to preserve existing users during truncation
     */
    protected $preserveUsers = false;

    /**
     * Set whether to preserve users during truncation
     */
    public function preserveUsers($preserve = true)
    {
        $this->preserveUsers = $preserve;

        return $this;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('🚀 Starting comprehensive eDoc data seeding...');
        $startTime = microtime(true);

        // Clear caches
        // cache()->flush();

        $this->command->info('📊 Seeding comprehensive eDoc data...');
        $this->command->newLine();

        // Disable foreign key checks for faster seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Truncate tables before seeding
            $this->truncateTables();

            // Core system data (if not already present)
            $this->seedCoreData();

            // Main data in dependency order
            $this->call([
                WorkspaceSeeder::class,
                ProjectSeeder::class,
                TaskSeeder::class,
                CommentSeeder::class,
                ActivitySeeder::class,
                TimerSeeder::class,
            ]);

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);

            $this->displaySummary();
            $this->command->info("⚡ Seeding completed in {$duration} seconds!");

        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $this->command->error('❌ Seeding failed: '.$e->getMessage());
            throw $e;
        }
    }

    private function seedCoreData()
    {
        $this->command->info('🔧 Ensuring core system data...');

        // Check if basic seeders need to run
        $coreSeederClasses = [
            //            'BackgroundSeeder',
            //            'EmailTemplateSeeder',
            //            'LanguageSeeder',
            //            'RoleSeeder',
            //            'SettingSeeder',
            'WorkspaceTypeSeeder',
            //            'NotificationSettingSeeder',
        ];

        foreach ($coreSeederClasses as $seederClass) {
            if (class_exists("Database\\Seeders\\{$seederClass}")) {
                // Check if data already exists to avoid duplicates
                $shouldSeed = true;

                switch ($seederClass) {
                    case 'LanguageSeeder':
                        $shouldSeed = DB::table('languages')->count() === 0;
                        break;
                    case 'RoleSeeder':
                        $shouldSeed = DB::table('roles')->count() === 0;
                        break;
                    case 'WorkspaceTypeSeeder':
                        $shouldSeed = DB::table('workspace_types')->count() === 0;
                        break;
                }

                if ($shouldSeed) {
                    $this->call("Database\\Seeders\\{$seederClass}");
                }
            }
        }

        // Ensure we have users
        if (DB::table('users')->count() < 20) {
            $this->call(UserSeeder::class);
        }
    }

    private function truncateTables()
    {
        // Safety check for production
        //        if (app()->environment('production')) {
        //            if (!$this->command->confirm('⚠️  You are about to truncate all data in PRODUCTION. Are you sure?')) {
        //                $this->command->info('❌ Truncation cancelled.');
        //                return;
        //            }
        //        }

        $this->command->info('🧹 Truncating tables before seeding...');

        // Define tables in reverse dependency order (child tables first)
        $tablesToTruncate = [
            // Child tables first (depend on other tables)
            'activities',
            'timers',
            'comments',
            'task_labels',
            'assignees',
            'checklists',
            'attachments',
            'repeats',
            'watchers',
            'tasks',
            'board_lists',
            'labels',
            'projects',
            'team_members',
            'workspaces',

            // Core system tables (can be truncated safely)
            'user_settings',
            'notifications',
            //            'notification_settings',
            //            'settings',
            //            'email_templates',
            //            'languages',
            //            'roles',
            'workspace_types',
            //            'backgrounds',
        ];

        // Handle users table separately
        if (!$this->preserveUsers) {
            $tablesToTruncate[] = 'users';
        }

        $truncatedCount = 0;

        foreach ($tablesToTruncate as $table) {
            try {
                if (DB::getSchemaBuilder()->hasTable($table)) {
                    DB::table($table)->truncate();
                    $truncatedCount++;
                    $this->command->line("  ✓ Truncated: {$table}");
                }
            } catch (\Exception $e) {
                $this->command->warn("  ⚠ Could not truncate {$table}: ".$e->getMessage());
            }
        }

        if ($this->preserveUsers) {
            $this->command->info('  ℹ️  Preserved existing users');
        }

        $this->command->info("🗑️  Truncated {$truncatedCount} tables successfully");
        $this->command->newLine();
    }

    /**
     * Show which tables will be truncated (for preview)
     */
    public function showTruncationPreview()
    {
        $this->command->info('📋 Tables that will be truncated:');

        $tablesToTruncate = [
            'activities', 'timers', 'comments', 'task_labels', 'assignees',
            'checklists', 'attachments', 'repeats', 'watchers', 'tasks',
            'board_lists', 'labels', 'projects', 'team_members', 'workspaces',
            'user_settings', 'notifications', 'notification_settings', 'settings',
            'email_templates', 'languages', 'roles', 'workspace_types', 'backgrounds',
        ];

        if (!$this->preserveUsers) {
            $tablesToTruncate[] = 'users';
        }

        foreach ($tablesToTruncate as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $count = DB::table($table)->count();
                $this->command->line("  • {$table} ({$count} records)");
            }
        }

        $this->command->newLine();
    }

    private function displaySummary()
    {
        $this->command->newLine();
        $this->command->info('📈 Seeding Summary:');
        $this->command->table(
            ['Entity', 'Count', 'Status'],
            [
                ['Workspaces', DB::table('workspaces')->count(), '✅ Complete'],
                ['Team Members', DB::table('team_members')->count(), '✅ Complete'],
                ['Projects', DB::table('projects')->count(), '✅ Complete'],
                ['Board Lists', DB::table('board_lists')->count(), '✅ Complete'],
                ['Labels', DB::table('labels')->count(), '✅ Complete'],
                ['Tasks', DB::table('tasks')->count(), '✅ Complete'],
                ['Task Assignees', DB::table('assignees')->count(), '✅ Complete'],
                ['Task Labels', DB::table('task_labels')->count(), '✅ Complete'],
                ['Comments', DB::table('comments')->count(), '✅ Complete'],
                ['Activities', DB::table('activities')->count(), '✅ Complete'],
                ['Timers', DB::table('timers')->count(), '✅ Complete'],
            ]
        );

        $this->command->newLine();
        $this->displayUsageInstructions();
    }

    private function displayUsageInstructions()
    {
        $this->command->info('🎯 Calendar Testing Data:');
        $this->command->line('• Tasks with due dates distributed across past 2 months and next 6 months');
        $this->command->line('• Overdue tasks for testing overdue indicators');
        $this->command->line('• Tasks scheduled at specific times for daily/weekly views');
        $this->command->line('• Various task statuses and priorities for visual testing');

        $this->command->newLine();
        $this->command->info('🔗 Quick Access:');
        $this->command->line('• Login with: john.due.helo@mail.com / s6J5WQR9ZlpvG7');
        $this->command->line('• Or: sabbir@example.com / SY7Ta85KTV2e0n');
        $this->command->line('• Navigate to any workspace to see projects and tasks');
        $this->command->line('• Calendar view: /p/calendar/{project_id}');

        $this->command->newLine();
        $this->command->info('🧹 To reset data: php artisan migrate:fresh --seed --class=ComprehensiveDataSeeder');
        $this->command->info('🔄 To truncate and reseed: php artisan db:seed --class=ComprehensiveDataSeeder');
    }
}

/**
 * Alternative seeder classes for different data sizes
 */
class SmallDatasetSeeder extends ComprehensiveDataSeeder
{
    public function run()
    {
        $this->command->info('🏠 Creating small dataset (3 workspaces, ~150 tasks)...');

        // Override some settings for smaller dataset
        config(['seeder.workspace_count' => 3]);
        config(['seeder.projects_per_workspace' => '3,5']);
        config(['seeder.tasks_per_project' => '10,20']);

        parent::run();
    }
}

class MediumDatasetSeeder extends ComprehensiveDataSeeder
{
    public function run()
    {
        $this->command->info('🏢 Creating medium dataset (6 workspaces, ~400 tasks)...');

        // Use default settings (already optimized for medium size)
        parent::run();
    }
}

class LargeDatasetSeeder extends ComprehensiveDataSeeder
{
    public function run()
    {
        $this->command->info('🏭 Creating large dataset (10 workspaces, ~800 tasks)...');

        // Override some settings for larger dataset
        config(['seeder.workspace_count' => 10]);
        config(['seeder.projects_per_workspace' => '5,10']);
        config(['seeder.tasks_per_project' => '20,50']);

        parent::run();
    }
}
