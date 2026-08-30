<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The documents themselves.
 *
 * Columns that arrived later - merged_history, the workflow ids, soft deletes -
 * were folded back in here rather than left as eight separate ALTERs. The two
 * columns the churn produced are gone with it: priority_id was briefly a
 * string, and the gantt/timeline migrations turned out to be empty.
 */
class CreateTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_code', 100)->nullable();
            $table->json('merged_history')->nullable();
            $table->text('qr_code')->nullable();
            $table->text('bar_code')->nullable();
            $table->string('title', 200);
            $table->string('slug', 200)->nullable();
            $table->boolean('is_done')->default(false);
            $table->boolean('is_archive')->default(false);
            $table->unsignedBigInteger('priority_id')->nullable()->index();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('cover_id')->nullable();
            $table->unsignedBigInteger('list_id')->index();
            // The board a document was created on. It is what tells an edit by
            // its author apart from an edit after it has moved on.
            $table->unsignedBigInteger('origin_list_id')->nullable();
            $table->unsignedBigInteger('document_source_id')->nullable()->index();
            $table->unsignedBigInteger('type_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('project_id')->index();
            $table->integer('order')->default(0)->index();
            $table->timestamp('due_date')->nullable();
            $table->dateTime('entry_date')->nullable();
            $table->dateTime('exit_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}
