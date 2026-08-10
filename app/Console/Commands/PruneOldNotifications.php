<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PruneOldNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:prune';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune old, read notifications from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $cutoffDate = now()->subMonths(3);

        $this->info("Pruning notifications older than {$cutoffDate}...");

        $count = DB::table('notifications')
            ->whereNotNull('read_at')
            ->where('created_at', '<', $cutoffDate)
            ->delete();

        $this->info("Done. Pruned {$count} notifications.");
        return 0;
    }
}
