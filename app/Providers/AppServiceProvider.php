<?php

namespace App\Providers;

use App\Services\KernelStatusService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        Model::unguard();
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(KernelStatusService $statusService)
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        if (!$statusService->isVerified()) {
            View::share('license_invalid', true);
        } else {
            View::share('license_invalid', false);
        }

    }
}
