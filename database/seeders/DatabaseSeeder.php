<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            BackgroundSeeder::class,
            EmailTemplateSeeder::class,
            TelegramTemplateSeeder::class,
            LanguageSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            SettingSeeder::class,
            WorkspaceTypeSeeder::class,
            NotificationSettingSeeder::class,
            DocumentSourceSeeder::class,
            WorkspacesInsertSeeder::class,
            WorkflowSubRoleSeeder::class,
            EdocWorkflowRoleSeeder::class,
            UserGroupSeeder::class,
            PrioritySeeder::class,
        ]);
    }
}
