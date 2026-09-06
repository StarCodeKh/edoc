<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RedirectIfNotAdmin;
use App\Models\Language;
use App\Models\Setting;
use App\Models\User;
use App\Support\EnvFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware(RedirectIfNotAdmin::class.':global,smtp');
    }

    private function configExist($array)
    {
        $hasValue = true;
        $envLoad = EnvFile::load();
        $keys = $envLoad->getKeys($array);
        foreach ($keys as $key) {
            if (!$key['value']) {
                $hasValue = false;
                break;
            }
        }

        return $hasValue;
    }

    public function preMadeBoards()
    {
        $board_list = Setting::where('slug', 'pre_made_board_list')->first();
        $pre_made_enable = Setting::where('slug', 'enable_pre_made_board')->first();

        return Inertia::render('Settings/PreMadeList', [
            'title' => 'Pre-made board lists',
            'lists' => $board_list ? is_string($board_list->value) ? json_decode($board_list->value, true) : $board_list->value : [],
            'enable_list' => $pre_made_enable ? (bool) $pre_made_enable->value : false,
        ]);
    }

    public function index()
    {
        $settings = Setting::orderBy('id')->get();
        $settingData = [];
        foreach ($settings as $setting) {
            $settingData[$setting['slug']] = ['id' => $setting->id, 'name' => $setting->name, 'slug' => $setting->slug, 'type' => $setting->type, 'value' => $setting->value];
            if ($setting->type === 'json') {
                $value = $setting->value;
                $settingData[$setting['slug']]['value'] = is_string($value) ? json_decode($value, true) : $value;
            }
        }
        $customCss = File::get(public_path('css/custom.css'));
        $settingData['custom_css'] = ['slug' => 'custom_css', 'name' => 'Custom CSS', 'value' => $customCss];
        $env = EnvFile::load();
        $site_key = $env->keyExists('RE_CAPTCHA_KEY') ? $env->getValue('RE_CAPTCHA_KEY') : '';
        $webhook_url = $env->keyExists('SLACK_ALERT_WEBHOOK') ? $env->getValue('SLACK_ALERT_WEBHOOK') : '';

        return Inertia::render('Settings/Index', [
            'title' => 'Global Settings',
            'settings' => $settingData,
            'site_key' => $site_key,
            'webhook_url' => $webhook_url,
            'languages' => Language::orderBy('name')
                ->get()
                ->map
                ->only('code', 'name'),
        ]);
    }

    public function updatePreMadeList()
    {
        $requests = Request::all();
        if (isset($requests['enable_pre_made_board'])) {
            $enable_pre_made_board = Setting::where('slug', 'enable_pre_made_board')->first();
            if (!empty($enable_pre_made_board)) {
                $enable_pre_made_board->value = (int) $requests['enable_pre_made_board'];
                $enable_pre_made_board->save();
                Setting::where('slug', 'enable_pre_made_board')->update(['value' => (int) $requests['enable_pre_made_board']]);
            } else {
                DB::table('settings')->insert(['name' => 'Enable Pre-made Board', 'slug' => 'enable_pre_made_board', 'type' => 'text', 'value' => (int) $requests['enable_pre_made_board']]);
            }
        }

        if (isset($requests['pre_made_board_list'])) {
            $pre_made_board_list = Setting::where('slug', 'pre_made_board_list')->first();
            if (!empty($pre_made_board_list)) {
                $pre_made_board_list->value = json_encode($requests['pre_made_board_list']);
                $pre_made_board_list->save();
            } else {
                DB::table('settings')->insert(['name' => 'Pre-made Board Lists', 'slug' => 'pre_made_board_list', 'type' => 'text', 'value' => json_encode($requests['pre_made_board_list'])]);
            }
        }

        return Redirect::route('pre-made-boards')->with('success', __('Pre-made list updated!'));
    }

    public function update()
    {
        $requests = Request::all();

        $settings = Setting::orderBy('id')->get();
        $settingData = [];
        foreach ($settings as $setting) {
            $settingData[$setting['slug']] = ['id' => $setting->id, 'name' => $setting->name, 'slug' => $setting->slug, 'type' => $setting->type, 'value' => $setting->value];
            if ($setting->type === 'json') {
                $settingData[$setting['slug']]['value'] = $setting->value ? is_string($setting->value) ? json_decode($setting->value, true) : $setting->value : null;
            }
        }

        if (config('app.demo')) {
            return Redirect::back()->with('error', __('Updating not allowed for some global settings on the live demo.'));
        }

        if (!empty($requests['default_language']) && ($settingData['default_language']['value'] != $requests['default_language'])) {
            $user = Auth()->user();
            Session()->put('locale', $requests['default_language']);
            User::where('id', $user['id'])->update(['locale' => $requests['default_language']]);
        }

        $requests['enable_registration'] = (int) $requests['enable_registration'];

        $customCss = File::get(public_path('css/custom.css'));

        if (!empty($requests['custom_css']) && ($customCss != $requests['custom_css'])) {
            Storage::disk('public_path')->put('css/custom.css', $requests['custom_css']);
        }

        $env = EnvFile::load();

        if (isset($requests['site_key'])) {
            $env->setKey('RE_CAPTCHA_KEY', $requests['site_key']);
            $env->save();
        }

        if (isset($requests['webhook_url'])) {
            $env->setKey('SLACK_ALERT_WEBHOOK', $requests['webhook_url']);
            $env->save();
        }

        array_splice($requests, array_search($requests['custom_css'], array_values($requests)), 1);
        $jsonFields = ['hide_ticket_fields', 'allowed_file_types'];

        $requestsData = ['app_name' => $requests['app_name'], 'enable_registration' => $requests['enable_registration'],
            'default_language' => $requests['default_language'],
            'allowed_file_types' => $requests['allowed_file_types'],
        ];

        foreach ($requestsData as $requestKey => $requestValue) {
            $setting = Setting::where('slug', $requestKey)->first();
            if (isset($setting)) {
                $setting->value = $setting->type == 'json' ? json_encode($requestValue) : $requestValue;
                $setting->save();
            } else {
                Setting::create([
                    'slug' => $requestKey,
                    'name' => ucfirst(str_replace('_', ' ', $requestKey)),
                    'type' => in_array($requestKey, $jsonFields) ? 'json' : 'text',
                    'value' => in_array($requestKey, $jsonFields) ? json_encode($requestValue) : $requestValue,
                ]);
            }
        }

        if (Request::file('logo') && !empty(Request::file('logo'))) {
            Request::file('logo')->storeAs('/', 'logo.png', ['disk' => 'image']);
        }

        if (Request::file('logo_white') && !empty(Request::file('logo_white'))) {
            Request::file('logo_white')->storeAs('/', 'logo_white.png', ['disk' => 'image']);
        }

        if (Request::file('favicon')) {
            Request::file('favicon')->storeAs('/', 'favicon.png', ['disk' => 'public_path']);
        }

        Cache::forget('global_settings');

        return Redirect::route('global')->with('success', __('Settings updated.'));
    }

    public function smtp()
    {
        $demo = config('app.demo');
        $env = EnvFile::load();
        $keys = $env->getKeys(['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_ENCRYPTION', 'MAIL_FROM_ADDRESS', 'MAIL_FROM_NAME']);

        return Inertia::render('Settings/Smtp', [
            'title' => 'SMTP Settings',
            'keys' => $keys,
            'demo' => boolval($demo),
        ]);
    }

    public function updateSmtp()
    {
        if (config('app.demo')) {
            return Redirect::back()->with('error', __('Updating SMTP setup is not allowed for the live demo.'));
        }

        $mailVariables = Request::validate([
            'MAIL_HOST' => ['required'],
            'MAIL_PORT' => ['required'],
            'MAIL_USERNAME' => ['required'],
            'MAIL_PASSWORD' => ['required'],
            'MAIL_ENCRYPTION' => ['required'],
            'MAIL_FROM_ADDRESS' => ['nullable', 'email'],
            'MAIL_FROM_NAME' => ['nullable'],
        ]);
        $this->setEnvVariables($mailVariables);

        return Redirect::back()->with('success', __('SMTP configuration updated!'));
    }

    private function setEnvVariables($data)
    {
        $env = EnvFile::load();
        foreach ($data as $data_key => $data_value) {
            $env->setKey($data_key, $data_value);
        }
        $env->save();
    }
}
