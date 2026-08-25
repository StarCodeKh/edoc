<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            DB::table('settings')->where('slug', 'slack_notifications')->update([
                'value' => json_encode([
                    ['name' => 'Adding user to Workspace', 'slug' => 'new_workspace_member', 'value' => false],
                    ['name' => 'Assign to a task', 'slug' => 'user_assigned', 'value' => false],
                    ['name' => 'Task update', 'slug' => 'task_updated', 'value' => false],
                    ['name' => 'Project update', 'slug' => 'project_update', 'value' => false],
                    ['name' => 'New comment', 'slug' => 'new_comment', 'value' => false],
                    ['name' => 'Daily reminder for due task', 'slug' => 'due_task_reminder', 'value' => false],
                ]),
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
