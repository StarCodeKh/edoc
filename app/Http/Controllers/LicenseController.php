<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LicenseController extends Controller
{

    public function showActivationForm()
    {
        return Inertia::render('License/Activate', [
            'message' => session('license_error')
        ]);
    }


    public function activate(Request $request)
    {
        $request->validate(['purchase_code' => 'required|string']);

        $licenseServerUrl = config('services.license.server_url');
        $itemId = config('services.license.item_id');
        $currentDomain = $request->getHttpHost();

        $response = Http::post($licenseServerUrl . '/api/activate', [
            'purchase_code' => $request->purchase_code,
            'domain'        => $currentDomain,
            'item_id'       => $itemId,
        ]);

        if ($response->failed()) {
            $errorMessage = $response->json('message', 'An unknown error occurred.');
            return Redirect::route('license.show')->with('license_error', $errorMessage);
        }

        Setting::updateOrCreate(
            ['slug' => 'license_key'],
            ['value' => $request->purchase_code]
        );
        Setting::updateOrCreate(
            ['slug' => 'license_domain'],
            ['value' => $currentDomain]
        );

        Artisan::call('cache:clear');

        return Redirect::to('/');
    }

    public function showSettings()
    {
        $licenseKey = Setting::where('slug', 'license_key')->value('value');
        $activatedDomain = Setting::where('slug', 'license_domain')->value('value');

        if (!$licenseKey || !$activatedDomain) {
            return Redirect::route('license.show');
        }

        return Inertia::render('License/Settings', [
            'title'           => 'License Settings',
            'activatedDomain' => $activatedDomain,
            'licenseKey'      => $licenseKey,
            'error'           => session('error'),
        ]);
    }

    public function deactivate(Request $request)
    {
        if (config('app.demo')) {
            return Redirect::back()->with('error', 'License deactivation is disabled in demo mode.');
        }

        $licenseKey = Setting::where('slug', 'license_key')->value('value');
        $domain = Setting::where('slug', 'license_domain')->value('value');

        if (!$domain) {
            $domain = $request->getHttpHost();
        }

        $licenseServerUrl = config('services.license.server_url');
        $itemId = config('services.license.item_id');

        $response = Http::post($licenseServerUrl . '/api/deactivate', [
            'purchase_code' => $licenseKey,
            'domain'        => $domain,
            'item_id'       => $itemId,
        ]);

        if ($response->failed()) {
            $errorMessage = $response->json('message', 'Deactivation failed from server.');
            return Redirect::route('license.settings')->with('error', $errorMessage);
        }

        Setting::whereIn('slug', ['license_key', 'license_domain'])->delete();

        Cache::forget('license_key');
        Cache::forget('license_verification_status');

        return Redirect::route('license.show')->with('license_error', 'License deactivated successfully. You may now activate it on this new domain.');
    }
}
