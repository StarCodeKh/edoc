<?php

namespace App\Listeners;

use App\Events\UserCreated;
use App\Mail\SendMailFromHtml;
use App\Models\EmailTemplate;
use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Spatie\SlackAlerts\Facades\SlackAlert;

class UserCreatedNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\UserCreated  $event
     * @return void
     */
    public function handle(UserCreated $event) {
        $data = $event->data;
        $user = User::where('id', $data['id'])->first();
        $notifications = app('App\ProTask')->getSettingsEmailNotifications();
        $slackNotifications = app('App\ProTask')->getSettingsSlackNotifications();
        if(!empty($user)){
            $variables = [
                'name' => $user->first_name,
                'email' => $user->email,
                'password' => $data['password'] ?? '',
                'url' => config('app.url').'/login',
                'sender_name' => 'Manager',
            ];
            if($notifications['user_created']){
                $template = EmailTemplate::where('slug', 'user_created')->first();
                if(!empty($template)){
                    $template = $template->html;
                    if (preg_match_all("/{(.*?)}/", $template, $m)) {
                        foreach ($m[1] as $i => $varname) {
                            $template = str_replace($m[0][$i], sprintf($variables[$m[1][$i]], $varname), $template);
                        }
                    }
                    $messageData = ['html' => $template, 'subject' => 'ProTask - Your account has been created.'];
                    if(config('queue.enable')){
                        Mail::to($user->email)->queue(new SendMailFromHtml($messageData));
                    }else{
                        Mail::to($user->email)->send(new SendMailFromHtml($messageData));
                    }
                }
            }

            if($slackNotifications['user_created']){
                $message = "A new account has been created with $user->email email.";
                SlackAlert::message($message);
            }
        }
    }
}
