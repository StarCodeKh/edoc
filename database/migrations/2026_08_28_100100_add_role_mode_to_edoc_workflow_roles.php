<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            // 'standard' assigns everyone holding responsible_role, as before.
            // 'dynamic' means responsible_role only names the group: whoever
            // forwards the document into this step picks which child of it
            // actually gets the work.
            $table->string('role_mode', 20)->default('standard')->after('responsible_role');
        });
    }

    public function down(): void
    {
        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            $table->dropColumn('role_mode');
        });
    }
};
