<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

class AppIntegrityValidator
{
    public function handle(Request $request, Closure $next)
    {
        // if (! $this->isDatabaseConnected() || ! Schema::hasTable('settings')) {
        //     return $next($request);
        // }

        // if ($this->isLocalEnvironment() || app()->runningInConsole()) {
        //     return $next($request);
        // }

        // $allowedRoutes = [
        //     'license.show',
        //     'license.activate',
        //     'license.settings',
        //     'license.deactivate',
        // ];

        // if (in_array(Route::currentRouteName(), $allowedRoutes)) {
        //     return $next($request);
        // }

        // $licenseKey = Cache::remember('license_key', now()->addHours(6), function () {
        //     return Setting::where('slug', 'license_key')->value('value');
        // });

        // if (empty($licenseKey)) {
        //     return Redirect::route('license.show')->with('license_error', 'Your application is not activated. Please enter your purchase code.');
        // }

        // $cacheKey = 'license_verification_status';
        // if (Cache::get($cacheKey)) {
        //     return $next($request);
        // }


        // $licenseServerUrl = config('services.license.server_url');
        // $itemId = config('services.license.item_id');
        // $currentDomain = $request->getHttpHost();

        // $response = Http::post($licenseServerUrl . '/api/verify', [
        //     'purchase_code' => $licenseKey,
        //     'domain'        => $currentDomain,
        //     'item_id'       => $itemId,
        // ]);

        // if ($response->successful() && $response->json('valid') === true) {
        //     Cache::put($cacheKey, true, now()->addDay());
        //     return $next($request);
        // }

        // $errorMessage = $response->json('message', 'License verification failed. Please check your settings.');
        // Cache::forget('license_key');
        // Cache::forget($cacheKey);

        // return Redirect::route('license.settings')->with('error', $errorMessage);
        return $next($request);
    }

    private function isDatabaseConnected(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function isLocalEnvironment(): bool
    {
        $host = request()->getHost();

        return in_array($host, [
            '127.0.0.1',
            'localhost',
            '::1',
        ]);
    }
}
