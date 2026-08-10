<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Contact;
use App\Models\Country;
use App\Models\Language;
use App\Models\Role;
use App\Models\Status;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;

class DashboardController extends Controller {
    public function setLocale($language){
        $rtlCodes = ['sa'];
        $user = Auth()->user();
        Session()->put('locale', $language);
        Session()->put('dir', in_array($language, $rtlCodes) ? 'rtl' : 'ltr');
        if(!empty($user)){
            User::where('id', $user['id'])->update(['locale' => $language]);
        }
        return redirect()->back();
    }
    public function editProfile() {

        $user_id = Auth()->id();
        $user = User::where('id', $user_id)->first();

        return Inertia::render('Users/EditProfile', [
            'title' => $user->name,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'locale' => $user->locale,
                'role' => $user->role,
                'address' => $user->address,
                'photo' => $user->photo_path ?? null,
                'photo_path' => $user->photo_path ?? null,
                'deleted_at' => $user->deleted_at,
            ],
            'languages' => Language::get()
        ]);
    }

    public function editProfileUpdate(User $user) {

        if (config('app.demo')) {
            return Redirect::back()->with('error', 'Updating user is not allowed for the live demo.');
        }

        $validated = Request::validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:25'],
            'email' => ['required', 'string', 'email', 'max:50', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'address' => ['nullable', 'string'],
            'photo' => ['nullable', 'image'],
            'locale' => ['nullable', 'string', 'max:5'],
        ]);

        $user->update(collect($validated)->except(['photo', 'password'])->toArray());

        if (Request::hasFile('photo')) {
            if ($user->photo_path && File::exists(public_path($user->photo_path))) {
                File::delete(public_path($user->photo_path));
            }
            $path = Request::file('photo')->store('users', ['disk' => 'file_uploads']);
            $user->update(['photo_path' => '/files/' . $path]);
        }

        if (!empty($validated['password'])) {
            $user->update(['password' => $validated['password']]);
        }

        return Redirect::back()->with('success', 'Profile updated.');
    }
}
