<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Faq;
use App\Models\KnowledgeBase;
use App\Models\Organization;
use App\Models\Priority;
use App\Models\Status;
use App\Models\Ticket;
use App\Models\Label;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

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
            LanguageSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            SettingSeeder::class,
            WorkspaceTypeSeeder::class,
            NotificationSettingSeeder::class,
            DocumentSourceSeeder::class,
            WorkspacesInsertSeeder::class,
            EdocWorkflowRoleSeeder::class,
            UserGroupSeeder::class,
        ]);
    }
}
