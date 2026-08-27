<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Which workflow responsibility a user carries - "sg", "dpt" and so on.
 *
 * Stored as a foreign key rather than the code that edoc_workflow_roles keeps,
 * because that column is legacy free text: a code renamed there has to be
 * copied across every row using it, and there is no reason to take on that
 * again for a column being created now.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('workflow_sub_role_id')->nullable()->after('role_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('workflow_sub_role_id');
        });
    }
};
