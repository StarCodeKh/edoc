<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_group_members', function (Blueprint $table) {
            $table->id();
            $table->integer('user_group_id')->index();
            $table->integer('user_id')->index();
            $table->timestamps();
            $table->unique(['user_group_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_group_members');
    }
};
