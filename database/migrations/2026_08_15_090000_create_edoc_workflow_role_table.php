<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edoc_workflow_roles', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_type', 50)->index();
            $table->unsignedBigInteger('board_list_id')->nullable()->index();
            $table->string('list_title');
            $table->unsignedSmallInteger('order')->default(0);
            $table->string('responsible_role', 100)->nullable();
            $table->unsignedInteger('sla_hours')->nullable();
            $table->boolean('requires_signature')->default(false);
            $table->boolean('is_terminal')->default(false);
            $table->timestamps();
            $table->unique(['workflow_type', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edoc_workflow_roles');
    }
};