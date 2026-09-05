<?php

namespace App\Http\Middleware;

use Closure;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        // The Vue side reads the locale off the authenticated user, so PHP has
        // to agree with it — otherwise a user whose profile says "kh" gets a
        // Khmer interface with English flash messages until they touch the
        // switcher. Session first for guests, then the stored preference.
        $locale = config('app.locale');

        if (session()->has('locale')) {
            $locale = session('locale');
        }

        if ($user = $request->user()) {
            $locale = $user->locale ?: $locale;
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
