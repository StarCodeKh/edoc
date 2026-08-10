<?php

namespace App;

use App\Models\Setting;
use App\Models\NotificationSetting;

class ProTask{
    /**
     * The ProTask version.
     *
     * @var string
     */
    const VERSION = '1';

    /**
     * The envato item ID.
     *
     * @var string
     */
    const ITEM_ID = '';

    public function getSettingsEmailNotifications(): array
    {
        // Use the new notification_settings table
        $settings = NotificationSetting::all();
        $notifications = [];
        
        foreach ($settings as $setting) {
            $notifications[$setting->type] = $setting->email_is_active;
        }
        
        return $notifications;
    }

    public function getSettingsSlackNotifications(): array
    {
        // Use the new notification_settings table
        $settings = NotificationSetting::all();
        $notifications = [];
        
        foreach ($settings as $setting) {
            $notifications[$setting->type] = $setting->slack_is_active;
        }
        
        return $notifications;
    }
}
