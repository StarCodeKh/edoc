<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangePriorityIdTypeOnTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * The column was originally created as a varchar slug defaulting to
     * 'normal', which can never match the auto-increment id on the
     * priorities table. Replace it with a real foreign id, mirroring
     * how type_id is declared on this table.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('priority_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('priority_id')->nullable()->index()->after('is_archive');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('priority_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('priority_id', 20)->default('normal')->index()->after('is_archive');
        });
    }
}
