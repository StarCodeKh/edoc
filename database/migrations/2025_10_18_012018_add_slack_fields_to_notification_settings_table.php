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
        Schema::table('notification_settings', function (Blueprint $table) {
            // Add a column to check if the notification type is eligible for Slack
            $table->boolean('can_be_slacked')
                ->default(true)
                ->after('email_is_active')
                ->comment('Whether this type can be sent to Slack');

            // Add a column to globally enable/disable this notification for Slack
            $table->boolean('slack_is_active')
                ->default(true)
                ->after('can_be_slacked')
                ->comment('Master switch for Slack notifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notification_settings', function (Blueprint $table) {
            $table->dropColumn(['can_be_slacked', 'slack_is_active']);
        });
    }
};
