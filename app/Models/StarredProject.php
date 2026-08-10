<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StarredProject extends Model
{
    use HasFactory;
    protected $table = 'starred_projects';

    protected $casts = [
        'project_id' => 'integer',
        'user_id'    => 'integer',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
