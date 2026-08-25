<?php

namespace App\Http\Controllers\Auth;

use App\Events\ForgotPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use App\Models\Workspace;
use App\Providers\RouteServiceProvider;
use App\Support\EnvFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * @return Response
     */
    public function create()
    {
        $is_demo = (int) config('app.demo');
        $env = EnvFile::load();
        $siteKey = $env->keyExists('RE_CAPTCHA_KEY') ? $env->getValue('RE_CAPTCHA_KEY') : '';
        $enable_registration = Setting::where('slug', 'enable_registration')->first();
        $enable_registration = $enable_registration->value ?? 0;

        return Inertia::render('Auth/Login', ['is_demo' => $is_demo, 'enable_registration' => $enable_registration, 'site_key' => $siteKey]);
    }

    public function register()
    {
        $enable_registration = Setting::where('slug', 'enable_registration')->first();
        $enable_registration = $enable_registration->value ?? 0;

        if (!$enable_registration) {
            abort(403);
        }

        $env = EnvFile::load();
        $is_demo = (int) config('app.demo');
        $siteKey = $env->keyExists('RE_CAPTCHA_KEY') ? $env->getValue('RE_CAPTCHA_KEY') : '';

        return Inertia::render('Auth/Register', ['is_demo' => $is_demo, 'site_key' => $siteKey]);
    }

    public function forgotPassword()
    {
        $is_demo = (int) config('app.demo');

        return Inertia::render('Auth/ForgotPassword', ['is_demo' => $is_demo]);
    }

    public function forgotPasswordMail(Request $request)
    {
        $requestData = $request->validate(['email' => 'required|email|exists:users']);

        $token = Str::random(64);
        DB::table('password_resets')->insert([
            'email' => $requestData['email'],
            'token' => $token,
            'created_at' => Carbon::now(),
        ]);

        event(new ForgotPassword(['email' => $requestData['email'], 'token' => $token]));

        return back()->with('success', 'We have e-mailed your password reset link!');
    }

    public function forgotPasswordToken($token)
    {
        return Inertia::render('Auth/ForgotPasswordInput', ['token' => $token]);
    }

    public function forgotPasswordStore(Request $request)
    {
        $requestData = $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required',
            'token' => 'required',
        ]);

        $updatePassword = DB::table('password_resets')
            ->where([
                'email' => $requestData['email'],
                'token' => $requestData['token'],
            ])
            ->first();

        if (!$updatePassword) {
            return Redirect::back()->with('error', 'Invalid email or token!');
        }

        User::where('email', $requestData['email'])->update(['password' => Hash::make($requestData['password'])]);
        DB::table('password_resets')->where(['email' => $requestData['email']])->delete();

        return Redirect::route('login')->with('success', 'Your password has been changed!');
    }

    /**
     * Handle an incoming authentication request.
     *
     * @return RedirectResponse
     */
    public function store(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->has('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $user = Auth::user();
            $workspace = Workspace::where('user_id', $user->id)
                ->orWhereHas('member', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->first();

            if ($workspace) {
                return redirect()->route('workspace.view.maindashboard', $workspace->slug ?? $workspace->id);
            }

            return redirect()->intended(RouteServiceProvider::DASHBOARD);
        }

        return back()->withErrors([
            'email' => 'Invalid credentials.',
        ]);
    }

    public function registerStore(Request $request)
    {

        $enable_registration = Setting::where('slug', 'enable_registration')->first();
        $enable_registration = $enable_registration->value ?? 0;

        if (!$enable_registration) {
            abort(403);
        }

        $requestData = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'string', 'min:10'],
            'confirm_password' => ['required', 'string', 'min:10', 'same:password'],
            'phone' => ['nullable', 'string', 'max:18'],
            'country' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
        ]);

        $role = Role::where('slug', 'normal')->first();
        $requestData['role_id'] = $role?->id ?? 2;

        unset($requestData['confirm_password']);

        $user = User::create($requestData);
        Auth::loginUsingId($user->id, true);

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::DASHBOARD);
    }

    /**
     * Destroy an authenticated session.
     *
     * @return RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
