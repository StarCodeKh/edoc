<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class ImportDemo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:import_demo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle() {
        /** Manual Restore
        ini_set('memory_limit', '-1');
        $sql_path = base_path('database/helpdesk.sql');
        DB::unprepared(file_get_contents($sql_path));
        **/

        Artisan::call('db:seed --class=FreshDataSeeder --force');
        dd('done');
    }
}
