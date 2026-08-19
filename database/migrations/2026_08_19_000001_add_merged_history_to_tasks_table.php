<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('tasks') && !Schema::hasColumn('tasks', 'merged_history')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->json('merged_history')->nullable()->after('task_code');
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('tasks') && Schema::hasColumn('tasks', 'merged_history')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('merged_history');
            });
        }
    }
};