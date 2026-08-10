<?php

namespace App\Listeners;

use App\Events\DueTaskReminder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Spatie\SlackAlerts\Facades\SlackAlert;

class DueTaskReminderNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(DueTaskReminder $event): void
    {
        $due_tasks = $event->due_tasks;
        $slackNotifications = app('App\ProTask')->getSettingsSlackNotifications();
        if(!empty($due_tasks) && $slackNotifications['due_task_reminder']){
            foreach ($due_tasks as $due_task){
                $link = config('app.url').'/p/board/'.$due_task['project_id'].'/?task='.$due_task['id'];
                $message = 'This is a friendly reminder that the task <'.$link.'|'.$due_task['title'].'> is due on '.date('F j, Y \a\t g:ia', strtotime($due_task['due_date'])).'.';
                SlackAlert::message($message);
            }
        }
    }
}
