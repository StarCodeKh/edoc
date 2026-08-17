<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
            $table->text('qr_code')->nullable();
            $table->text('bar_code')->nullable();
            $table->string('title', 200);
            $table->string('slug', 200)->nullable();
            $table->boolean('is_done')->default(false);
            $table->boolean('is_archive')->default(false);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('cover_id')->nullable();
            $table->unsignedBigInteger('list_id')->index();
            $table->unsignedBigInteger('document_source_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('project_id')->index();
            $table->integer('order')->default(0)->index();
            $table->timestamp('due_date')->nullable();
            $table->dateTime('entry_date')->nullable();
            $table->dateTime('exit_date')->nullable();
            $table->timestamps();
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
