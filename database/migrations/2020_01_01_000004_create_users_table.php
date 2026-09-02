<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('users')) {
            return;
        }
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('role_id')->default(null)->nullable()->index();
            // The workflow responsibility this user carries, if any.
            $table->unsignedBigInteger('workflow_sub_role_id')->nullable()->index();
            // The sub-office this user works in, from the document_sources
            // tree. Not constrained here: that table is created long after
            // this one, so the reference is held the same way the line above
            // holds its own.
            $table->unsignedBigInteger('document_source_id')->nullable()->index();
            $table->string('edoc_role', 20)->nullable();
            $table->string('locale', 5)->default('en');
            $table->string('address', 200)->default(null)->nullable();
            $table->string('first_name', 25);
            $table->string('last_name', 25);
            $table->string('title')->nullable();
            $table->string('email', 50)->unique();
            $table->string('phone', 20)->default(null)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('photo_path', 100)->nullable();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
