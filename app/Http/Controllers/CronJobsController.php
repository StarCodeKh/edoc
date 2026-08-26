<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;

class CronJobsController extends Controller
{
    // command:piping_email

    public function queueWork()
    {
        Artisan::call('queue:work --queue=high,default --stop-when-empty');
        dd('done');
    }
}
