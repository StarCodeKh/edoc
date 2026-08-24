<?php

use App\Models\Activity;
use App\Models\BoardList;
use App\Models\Task;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remembers the board (list) a task was created in.
 *
 * A Normal User keeps edit rights over a document they created only while it
 * still sits in the board it was created in - once it moves on, the document is
 * in the workflow and they can no longer change it. That rule needs the origin,
 * which nothing recorded until now.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('origin_list_id')->nullable()->after('list_id');
        });

        $this->backfill();
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('origin_list_id');
        });
    }

    /**
     * Existing tasks: the earliest "moved the Board from `X`" activity names the
     * list a task started in, so use that when it exists. Tasks that were never
     * moved simply started where they are now. Anything we cannot resolve falls
     * back to the current list - permissive rather than locking a document by
     * accident.
     */
    private function backfill(): void
    {
        Task::withTrashed()->select('id', 'list_id', 'project_id')->chunkById(200, function ($tasks) {
            foreach ($tasks as $task) {
                $origin = $task->list_id;

                $firstMove = Activity::where('task_id', $task->id)
                    ->where('field_changed', 'list_id')
                    ->orderBy('id')
                    ->first();

                if ($firstMove && preg_match('/`(.+)`/u', (string) $firstMove->old_value, $matches)) {
                    $originList = BoardList::where('project_id', $task->project_id)
                        ->where('title', $matches[1])
                        ->first();

                    if ($originList) {
                        $origin = $originList->id;
                    }
                }

                Task::withTrashed()->where('id', $task->id)->update(['origin_list_id' => $origin]);
            }
        });
    }
};
