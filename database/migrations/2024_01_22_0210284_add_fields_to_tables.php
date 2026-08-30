<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Seeds the Slack notification settings row.
 *
 * This migration also used to add projects.is_private, workspaces.logo and the
 * backgrounds colour columns. Every one of those is now declared by the create
 * migration for its table, so the guarded `hasColumn` blocks here did nothing
 * on a fresh install and have been removed. The data below is the part that
 * still has work to do.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('settings')) {
            return;
        }

        $exists = DB::table('settings')->where('slug', 'slack_notifications')->first();

        if (!empty($exists)) {
            return;
        }

        DB::table('settings')->insert([
            'name' => 'Slack Notifications',
            'slug' => 'slack_notifications',
            'type' => 'json',
            'value' => json_encode([
                ['name' => 'Adding user to Workspace', 'slug' => 'new_workspace_member', 'value' => false],
                ['name' => 'Assign to a task', 'slug' => 'user_assigned', 'value' => false],
                ['name' => 'Task update', 'slug' => 'task_updated', 'value' => false],
                ['name' => 'Project update', 'slug' => 'project_update', 'value' => false],
                ['name' => 'New comment', 'slug' => 'new_comment', 'value' => false],
            ]),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            DB::table('settings')->where('slug', 'slack_notifications')->delete();
        }
    }
};
