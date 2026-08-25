<?php

namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    /**
     * Renders the Notification Settings management page.
     * It fetches all settings and passes them to the Vue component.
     */
    public function index()
    {
        return Inertia::render('Settings/NotificationSettings', [
            'settings' => NotificationSetting::all(),
        ]);
    }

    /**
     * Updates a single notification setting.
     * This is called every time a toggle is switched.
     */
    public function update(Request $request, NotificationSetting $setting)
    {
        $is_demo = (int) config('app.demo');

        // Prevent updates in demo mode
        if ($is_demo) {
            return back()->withErrors(['demo_mode' => 'Settings cannot be updated in demo mode.']);
        }

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'email_is_active' => 'sometimes|boolean',
            'slack_is_active' => 'sometimes|boolean',
            'telegram_is_active' => 'sometimes|boolean',
        ]);

        // This validation check is still important for the email toggles.
        if (isset($validated['email_is_active']) && !$setting->can_be_emailed) {
            return back()->withErrors(['email_is_active' => 'Email notifications are not supported for this type.']);
        }

        // This validation check is important for the slack toggles.
        if (isset($validated['slack_is_active']) && !$setting->can_be_slacked) {
            return back()->withErrors(['slack_is_active' => 'Slack notifications are not supported for this type.']);
        }

        $setting->update($validated);

        // A back() redirect with a flash message is the standard, effective
        // way to handle updates in Inertia.
        return back()->with('success', 'Setting updated successfully!');
    }
}
