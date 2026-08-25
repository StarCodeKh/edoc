<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'settings';

    public $timestamps = false;

    protected $casts = [
        // This is very important based on your controller code using json_decode().
        'value' => 'array',
    ];
}
