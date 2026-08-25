<?php

namespace App\Listeners;

use App\Events\BoardUpdated;
use App\Mail\SendMailFromHtml;
use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Services\TelegramService;
use Illuminate\Support\Facades\Mail;
use Spatie\SlackAlerts\Facades\SlackAlert;

class BoardUpdateNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(BoardUpdated $event): void
    {
        $board = $event->board;
        $notifications = app('App\ProTask')->getSettingsEmailNotifications();
        $slackNotifications = app('App\ProTask')->getSettingsSlackNotifications();
        if (!empty($board)) {
            $variables = [
                'board_name' => $board->title,
                //                'project_name' => $task->project->title,
                'link' => config('app.url').'/p/board/'.$board->project->id.'/?task='.$board->id,
            ];

            if ($slackNotifications['project_update']) {
                $message = "A board `{$variables['board_name']}` has been updated! - {$variables['link']}";
                SlackAlert::message($message);
            }

            $this->sendTelegramNotification($board, $variables);

        }
    }

    private function prepareMessage($template, $variables, $delay)
    {
        if (preg_match_all('/{(.*?)}/', $template, $m)) {
            foreach ($m[1] as $i => $varname) {
                $template = str_replace($m[0][$i], sprintf($variables[$m[1][$i]], $varname), $template);
            }
        }
        $messageData = ['html' => $template, 'subject' => '[Task - '.$variables['task_name'].'] - Updated!'];
        if (config('queue.enable')) {
            Mail::to($variables['email'])->queue(new SendMailFromHtml($messageData));
        } else {
            Mail::to($variables['email'])->send(new SendMailFromHtml($messageData));
        }
    }

    /**
     * Push the board change to Telegram using the 'project_update' template.
     */
    private function sendTelegramNotification($board, array $variables): void
    {
        $setting = NotificationSetting::where('type', 'project_update')->first();

        if (!$setting || !$setting->telegram_is_active || !$setting->can_be_telegrammed) {
            return;
        }

        $safe = fn ($value) => htmlspecialchars(trim(strip_tags((string) $value)), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $message = EmailTemplate::render('project_update', EmailTemplate::CHANNEL_TELEGRAM, [
            '{board_name}' => $safe($variables['board_name']),
            '{project_name}' => $safe(optional($board->project)->title),
            '{link}' => $variables['link'],
        ], "\xF0\x9F\x93\x8B <b>Project Updated</b>\n<a href=\"{link}\">{board_name}</a>");

        if ($message !== '') {
            app(TelegramService::class)->send($message);
        }
    }
}
