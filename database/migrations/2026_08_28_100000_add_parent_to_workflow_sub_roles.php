<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workflow_sub_roles', function (Blueprint $table) {
            // One responsibility standing for several - នាយកដ្ឋាន D1-D5 holding
            // D1 through D5. A step naming the parent can be handed to exactly
            // one child when the document is forwarded.
            //
            // Deliberately one level deep: the picker offers a parent's
            // children, and nothing reads a grandchild.
            $table->unsignedBigInteger('parent_id')->nullable()->after('id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('workflow_sub_roles', function (Blueprint $table) {
            $table->dropColumn('parent_id');
        });
    }
};
