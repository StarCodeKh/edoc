<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $table = 'notification_settings';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'type',
        'description',
        'is_active',
        'can_be_emailed',
        'email_is_active',
        'can_be_slacked',
        'slack_is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'can_be_emailed' => 'boolean',
        'email_is_active' => 'boolean',
        'can_be_slacked' => 'boolean',
        'slack_is_active' => 'boolean',
    ];
}
