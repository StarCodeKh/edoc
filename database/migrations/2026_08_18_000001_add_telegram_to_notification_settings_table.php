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
            if (!Schema::hasColumn('notification_settings', 'can_be_telegrammed')) {
                $table->boolean('can_be_telegrammed')->default(true)->after('can_be_slacked')->comment('Whether this type supports Telegram');
            }
            if (!Schema::hasColumn('notification_settings', 'telegram_is_active')) {
                $table->boolean('telegram_is_active')->default(false)->after('slack_is_active')->comment('Master switch for Telegram delivery');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notification_settings', function (Blueprint $table) {
            if (Schema::hasColumn('notification_settings', 'telegram_is_active')) {
                $table->dropColumn('telegram_is_active');
            }
            if (Schema::hasColumn('notification_settings', 'can_be_telegrammed')) {
                $table->dropColumn('can_be_telegrammed');
            }
        });
    }
};
