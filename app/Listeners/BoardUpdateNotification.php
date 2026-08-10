<?php

namespace App\Listeners;

use App\Events\BoardUpdated;
use App\Events\TaskUpdated;
use App\Mail\SendMailFromHtml;
use App\Models\EmailTemplate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Spatie\SlackAlerts\Facades\SlackAlert;

class BoardUpdateNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {

    }

    /**
     * Handle the event.
     */
    public function handle(BoardUpdated $event): void {
        $board = $event->board;
        $notifications = app('App\ProTask')->getSettingsEmailNotifications();
        $slackNotifications = app('App\ProTask')->getSettingsSlackNotifications();
        if(!empty($board)){
            $variables = [
                'board_name' => $board->title,
//                'project_name' => $task->project->title,
                'link' => config('app.url').'/p/board/'.$board->project->id.'/?task='.$board->id,
            ];

            if($slackNotifications['project_update']){
                $message = "A board `{$variables['board_name']}` has been updated! - {$variables['link']}";
                SlackAlert::message($message);
            }

        }
    }

    private function prepareMessage($template, $variables, $delay){
        if (preg_match_all("/{(.*?)}/", $template, $m)) {
            foreach ($m[1] as $i => $varname) {
                $template = str_replace($m[0][$i], sprintf($variables[$m[1][$i]], $varname), $template);
            }
        }
        $messageData = ['html' => $template, 'subject' => '[Task - '.$variables['task_name'].'] - Updated!'];
        if(config('queue.enable')){
            Mail::to($variables['email'])->queue(new SendMailFromHtml($messageData));
        }else{
            Mail::to($variables['email'])->send(new SendMailFromHtml($messageData));
        }
    }
}
