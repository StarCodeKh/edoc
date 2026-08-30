<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Which board the document was sitting on when the file was attached.
 *
 * Without it "this step has produced its document" cannot be answered: the
 * attachment list is flat, so a step that requires a document would be
 * satisfied by the scan that arrived at the registry weeks earlier. Nullable
 * and not backfilled - a row from before this migration belongs to no step,
 * which is the safe answer for a step that is still waiting for its own file.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->unsignedBigInteger('list_id')->nullable()->after('task_id');
            $table->index(['task_id', 'list_id']);
        });
    }

    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropIndex(['task_id', 'list_id']);
            $table->dropColumn('list_id');
        });
    }
};
