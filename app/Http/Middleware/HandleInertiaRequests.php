<?php

namespace App\Http\Middleware;

use App\Models\Language;
use App\Models\Project;
use App\Models\Setting;
use App\Models\Timer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request)
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request) {
        return array_merge(parent::share($request), [
            'auth' => function () use ($request) {
                // Skip database queries during installation
                if (!config('app.installed')) {
                    return [
                        'user' => null,
                        'timer' => null,
                        'notifications' => null,
                        'unread_count' => 0,
                    ];
                }

                try {
                    // Check if database is connected
                    if (!DB::connection()->getPdo()) {
                        return [
                            'user' => null,
                            'timer' => null,
                            'notifications' => null,
                            'unread_count' => 0,
                        ];
                    }

                    return [
                        'user' => $request->user() ? [
                            'id' => $request->user()->id,
                            'first_name' => $request->user()->first_name,
                            'last_name' => $request->user()->last_name,
                            'email' => $request->user()->email,
                            'city' => $request->user()->city,
                            'locale' => $request->user()->locale,
                            'country_id' => $request->user()->country_id,
                            'role' => $request->user()->role ?? ['slug' => 'na', 'name' => 'Not Assigned', 'access' => null],
                            'photo' => $request->user()->photo_path ?? null,
                        ] : null,
                        'timer' => $request->user() ? Timer::with('task')->where('user_id', $request->user()->id)->whereNull('stopped_at')->first() : null,
                        'notifications' => fn () => $request->user()
                            ? $request->user()->notifications()->limit(10)->get()
                            : null,
                        'unread_count' => fn () => $request->user()
                            ? $request->user()->unreadNotifications()->count()
                            : 0,
                    ];
                } catch (\Exception $e) {
                    // If database query fails, return defaults
                    return [
                        'user' => null,
                        'timer' => null,
                        'notifications' => null,
                        'unread_count' => 0,
                    ];
                }
            },
            'flash' => function () use ($request) {
                return [
                    'message' => $request->session()->get('message'),
                    'success' => $request->session()->get('success'),
                    'error' => $request->session()->get('error'),
                ];
            },
            'settings' => function () {
                // Skip database queries during installation
                if (!config('app.installed')) {
                    return [
                        'app_name' => config('app.name', 'eDoc'),
                        'default_language' => 'en',
                        'allowed_file_types' => []
                    ];
                }

                try {
                    // Check if database is connected and settings table exists
                    if (!DB::connection()->getPdo()) {
                        return [
                            'app_name' => config('app.name', 'eDoc'),
                            'default_language' => 'en',
                            'allowed_file_types' => []
                        ];
                    }

                    if (!Schema::hasTable('settings')) {
                        return [
                            'app_name' => config('app.name', 'eDoc'),
                            'default_language' => 'en',
                            'allowed_file_types' => []
                        ];
                    }

                    return cache()->rememberForever('global_settings', function () {
                        return Setting::whereIn('slug', ['app_name', 'default_language', 'allowed_file_types'])->pluck('value', 'slug');
                    });
                } catch (\Exception $e) {
                    // If database query fails, return defaults
                    return [
                        'app_name' => config('app.name', 'eDoc'),
                        'default_language' => 'en',
                        'allowed_file_types' => []
                    ];
                }
            },
            'languages' => fn () => $this->availableLanguages(),
            'max_upload_size' => fn () => $this->maxUploadSize(),
        ]);
    }

    /**
     * Languages the top-bar switcher offers. Kept behind the same install and
     * connection guards as the other shared props so a half-installed app
     * still renders.
     */
    protected function availableLanguages(): array
    {
        if (!config('app.installed')) {
            return [];
        }

        try {
            if (!DB::connection()->getPdo() || !Schema::hasTable('languages')) {
                return [];
            }

            return cache()->rememberForever('available_languages', function () {
                // Khmer first, then English, then everything else by name.
                $preferred = ['kh', 'en'];

                return Language::orderBy('name')
                    ->get(['code', 'name'])
                    ->sortBy(function ($language) use ($preferred) {
                        $rank = array_search($language->code, $preferred, true);

                        return [$rank === false ? count($preferred) : $rank, $language->name];
                    })
                    ->values()
                    ->toArray();
            });
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * The largest upload the server will actually accept, in bytes.
     * PHP rejects anything above upload_max_filesize / post_max_size before
     * Laravel validation ever runs, so the UI has to know the real ceiling.
     */
    protected function maxUploadSize(): int
    {
        $limits = array_filter([
            $this->iniSizeInBytes(ini_get('upload_max_filesize')),
            $this->iniSizeInBytes(ini_get('post_max_size')),
            50 * 1024 * 1024,
        ]);

        return (int) min($limits);
    }

    /**
     * Convert a php.ini shorthand size ("2M", "8M", "1G") into bytes.
     */
    protected function iniSizeInBytes($value): int
    {
        $value = trim((string) $value);
        if ($value === '') {
            return 0;
        }

        $number = (float) $value;
        switch (strtolower(substr($value, -1))) {
            case 'g': $number *= 1024;
            case 'm': $number *= 1024;
            case 'k': $number *= 1024;
        }

        return (int) $number;
    }
}
