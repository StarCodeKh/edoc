<?php

namespace App\Enums;

use App\Models\NotificationSetting;

enum NotificationType: string
{
    case NEW_COMMENT = 'new_comment';
    case USER_ASSIGNED = 'user_assigned';
}

// Usage in listener:
NotificationSetting::where('type', NotificationType::NEW_COMMENT->value)->first();

