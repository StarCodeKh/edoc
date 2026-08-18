<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'edoc_role',
        'description',
        'created_by',
    ];

    /** Users belonging to this group, via user_group_members. */
    public function members()
    {
        return $this->belongsToMany(User::class, 'user_group_members', 'user_group_id', 'user_id')
            ->withTimestamps();
    }

    /** Tasks this group is assigned to, via group_assignees. */
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'group_assignees', 'user_group_id', 'task_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
