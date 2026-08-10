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
        if (Schema::hasTable('projects')){
            if(!Schema::hasColumn('projects', 'is_private')){
                Schema::table('projects', function (Blueprint $table) {
                    $table->integer('is_private')->default(0)->nullable();
                });
            }
        }

        if (Schema::hasTable('workspaces')){
            if(!Schema::hasColumn('workspaces', 'logo')){
                Schema::table('workspaces', function (Blueprint $table) {
                    $table->string('logo', 200)->default(null)->nullable();
                });
            }
        }

        if (Schema::hasTable('backgrounds')){
            if(!Schema::hasColumn('backgrounds', 'type')){
                Schema::table('backgrounds', function (Blueprint $table) {
                    $table->string('type', 50)->default('default')->nullable();
                });
            }

            if(!Schema::hasColumn('backgrounds', 'color')){
                Schema::table('backgrounds', function (Blueprint $table) {
                    $table->string('color', 50)->default('#ffffff')->nullable();
                });
            }
        }

        if (Schema::hasTable('settings')){
            $check_slack_notification = DB::table('settings')->where('slug', 'slack_notifications')->first();
            if(empty($check_slack_notification)){
                DB::table('settings')->insert(['name' => 'Slack Notifications', 'slug' => 'slack_notifications', 'type' => 'json',
                    'value' => json_encode([
                        ['name' => 'Adding user to Workspace', 'slug' => 'new_workspace_member', 'value' => false],
                        ['name' => 'Assign to a task', 'slug' => 'user_assigned', 'value' => false],
                        ['name' => 'Task update', 'slug' => 'task_updated', 'value' => false],
                        ['name' => 'Project update', 'slug' => 'project_update', 'value' => false],
                        ['name' => 'New comment', 'slug' => 'new_comment', 'value' => false],
                    ])
                ]);
            }
        }
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
