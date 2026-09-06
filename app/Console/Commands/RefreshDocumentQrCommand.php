<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;

class RefreshDocumentQrCommand extends Command
{
    protected $signature = 'documents:refresh-qr {--dry-run : List what would change without writing}';

    protected $description = 'Regenerate the tracking QR on every document so it points at the current URL.';

    /**
     * A QR is baked once, when the document is created, so changing where it
     * points leaves every slip printed before that aiming at the old route.
     * This rewrites them.
     *
     * saveQuietly(), because the model's updating hook writes an activity row
     * for every change - a backfill is not something that belongs on a
     * document's trail.
     */
    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $changed = 0;
        $total = 0;

        Task::withTrashed()->chunkById(100, function ($tasks) use (&$changed, &$total, $dry) {
            foreach ($tasks as $task) {
                $total++;
                $before = (string) $task->qr_code;

                // The generator is private and keyed to the model's own state,
                // which is exactly what is wanted here.
                $after = (new \ReflectionMethod(Task::class, 'generateQrCode'))
                    ->invoke($task, $task->title, $task->task_code);

                if ($before === $after) {
                    continue;
                }

                $changed++;

                if (!$dry) {
                    $task->qr_code = $after;
                    $task->saveQuietly();
                }
            }
        });

        $this->info(($dry ? 'Would rewrite ' : 'Rewrote ')."{$changed} of {$total} documents.");

        return self::SUCCESS;
    }
}
