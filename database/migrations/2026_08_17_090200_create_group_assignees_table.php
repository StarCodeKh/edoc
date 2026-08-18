<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_assignees', function (Blueprint $table) {
            $table->id();
            $table->integer('task_id')->index();
            $table->integer('user_group_id')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_assignees');
    }
};
