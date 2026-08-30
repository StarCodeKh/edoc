<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The configured steps of a workflow: Settings → Workflow Roles.
 *
 * The three later ALTERs are folded in. `sla_hours` is not: it was created here
 * and dropped again without ever being read, so a fresh install has no reason
 * to build it only to throw it away.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edoc_workflow_roles', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_type', 50)->index();
            $table->unsignedBigInteger('workspace_id')->nullable()->index();
            $table->string('list_title');
            $table->unsignedSmallInteger('order')->default(0);
            $table->string('responsible_role', 100)->nullable();
            // 'standard' hands the step to everyone carrying the responsibility;
            // 'dynamic' asks the forwarder which one it goes to.
            $table->string('role_mode', 20)->default('standard');
            $table->boolean('requires_signature')->default(false);
            $table->boolean('requires_attachment')->default(false);
            $table->string('attachment_mode', 20)->default('standard');
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
