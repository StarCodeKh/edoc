<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->unique()->comment('A unique slug like new_comment');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->comment('Master switch for this notification type');
            $table->boolean('can_be_emailed')->default(true)->comment('Whether this type supports email');
            $table->boolean('email_is_active')->default(true)->comment('Master switch for email delivery');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
