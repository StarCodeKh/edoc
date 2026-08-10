<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'task_id', 'field_changed', 'old_value', 'new_value', 'comment_id'];

    protected $casts = [
        'user_id'    => 'integer',
        'task_id'    => 'integer',
        'comment_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
}
