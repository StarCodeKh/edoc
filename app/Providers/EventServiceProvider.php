<?php

namespace App\Providers;

use App\Events\BoardUpdated;
use App\Events\DueTaskReminder;
use App\Events\ForgotPassword;
use App\Events\NewCommentAdded;
use App\Events\NewMemberAddedToWorkspace;
use App\Events\SendMail;
use App\Events\TaskFieldUpdated;
use App\Events\UserAddedToWorkspace;
use App\Events\UserAssignedToTask;
use App\Events\UserCreated;
use App\Listeners\BoardUpdateNotification;
use App\Listeners\DueTaskReminderNotification;
use App\Listeners\SendForgotPasswordNotification;
use App\Listeners\SendMailNotification;
use App\Listeners\SendNewCommentNotification;
use App\Listeners\SendNewMemberNotification;
use App\Listeners\SendTaskUpdatedNotification;
use App\Listeners\SendUserAssignedNotification;
use App\Listeners\UserCreatedNotification;
use App\Listeners\WorkspaceUserAddNotification;
use App\Models\Task;
use App\Observers\TaskObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        //        'App\Events\NewChatMessage' => [
        //            'App\Listeners\SendChatMessageNotification'
        //        ],
        UserCreated::class => [
            UserCreatedNotification::class,
        ],
        BoardUpdated::class => [
            BoardUpdateNotification::class,
        ],
        UserAddedToWorkspace::class => [
            WorkspaceUserAddNotification::class,
        ],
        ForgotPassword::class => [
            SendForgotPasswordNotification::class,
        ],
        SendMail::class => [
            SendMailNotification::class,
        ],
        DueTaskReminder::class => [
            DueTaskReminderNotification::class,
        ],
        NewCommentAdded::class => [
            SendNewCommentNotification::class,
        ],
        UserAssignedToTask::class => [
            SendUserAssignedNotification::class,
        ],
        TaskFieldUpdated::class => [
            SendTaskUpdatedNotification::class,
        ],
        NewMemberAddedToWorkspace::class => [
            SendNewMemberNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        Task::observe(TaskObserver::class);
    }
}
