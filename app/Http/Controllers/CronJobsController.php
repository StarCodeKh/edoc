<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class CronJobsController extends Controller
{
    // command:piping_email

    /**
     * Drains the mail queue from a URL, for shared hosting where a permanent
     * worker (scripts/edoc-queue.service) cannot be run. Everywhere else the
     * worker is the answer - it sends within a second instead of waiting for
     * the next cron minute.
     */
    public function queueWork(Request $request)
    {
        // The URL has to be callable by cron, which cannot log in, so it is
        // public. When CRON_TOKEN is set it must be presented; left unset the
        // endpoint behaves as it always has.
        $token = config('app.cron_token');
        if (!empty($token) && !hash_equals((string) $token, (string) $request->query('token'))) {
            abort(403);
        }

        // Capped so the request cannot run until the web server times it out,
        // and so two overlapping cron minutes cannot pile workers up
        // indefinitely; the next run takes whatever is left.
        Artisan::call('queue:work --queue=high,default --stop-when-empty --max-time=50');

        return response('queue processed', 200)->header('Content-Type', 'text/plain');
    }
}
