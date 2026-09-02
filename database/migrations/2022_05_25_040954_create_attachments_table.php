<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttachmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('attachments')) {
            return;
        }
        Schema::create('attachments', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('task_id')->nullable()->index();
            // Which board the document was sitting on when the file was
            // attached - without it "this step has produced its document"
            // cannot be answered, since the attachment list is otherwise flat.
            $table->unsignedBigInteger('list_id')->nullable();
            $table->integer('comment_id')->nullable()->index();
            $table->string('name', 150)->nullable();
            $table->integer('user_id')->nullable()->index();
            $table->integer('size')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('path', 250);
            $table->timestamps();
            $table->index(['task_id', 'list_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attachments');
    }
}
