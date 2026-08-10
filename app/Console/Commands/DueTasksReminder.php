<?php

namespace App\Console\Commands;

use App\Events\DueTaskReminder;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DueTasksReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:due-tasks-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reminder for the due tasks';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tasks = Task::whereBetween('due_date', [Carbon::now(), Carbon::now()->addDays(3)])->get()->toArray();
        event(new DueTaskReminder($tasks));
    }
}
