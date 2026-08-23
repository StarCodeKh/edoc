<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The templates table now holds message bodies for every notification channel,
 * not just email. `channel` tells them apart; existing rows stay on 'email'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('email_templates', 'channel')) {
                $table->string('channel', 20)
                    ->default('email')
                    ->after('slug')
                    ->index()
                    ->comment('Delivery channel this template belongs to: email, telegram');
            }
        });
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            if (Schema::hasColumn('email_templates', 'channel')) {
                $table->dropIndex(['channel']);
                $table->dropColumn('channel');
            }
        });
    }
};
