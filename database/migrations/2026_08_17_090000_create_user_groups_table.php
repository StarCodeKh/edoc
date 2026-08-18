<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable()->index();
            $table->string('edoc_role', 20)->nullable()->index();
            $table->string('description')->nullable();
            $table->integer('created_by')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_groups');
    }
};
