<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SLA tracking was dropped from the workflow: steps say who is responsible and
 * whether a signature is needed, but no longer carry an hour target.
 *
 * down() puts the column back so the schema can be rolled forward and back, but
 * the hour values themselves are gone - there is nowhere left to read them from.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('edoc_workflow_roles', 'sla_hours')) {
            return;
        }

        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            $table->dropColumn('sla_hours');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('edoc_workflow_roles', 'sla_hours')) {
            return;
        }

        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            $table->unsignedInteger('sla_hours')->nullable()->after('responsible_role');
        });
    }
};
