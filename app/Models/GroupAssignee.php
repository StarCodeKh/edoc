<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupAssignee extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'task_id',
        'user_group_id',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function userGroup()
    {
        return $this->belongsTo(UserGroup::class, 'user_group_id');
    }
}
