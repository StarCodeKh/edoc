<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Whether a step may combine the documents linked to the one it is holding.
 *
 * Sits with requires_signature and is_terminal: another thing the step itself
 * either asks for or does not, rather than a permission on a person.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('edoc_workflow_roles') || Schema::hasColumn('edoc_workflow_roles', 'allows_merge')) {
            return;
        }

        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            $table->boolean('allows_merge')->default(false)->after('attachment_mode');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('edoc_workflow_roles') && Schema::hasColumn('edoc_workflow_roles', 'allows_merge')) {
            Schema::table('edoc_workflow_roles', function (Blueprint $table) {
                $table->dropColumn('allows_merge');
            });
        }
    }
};
