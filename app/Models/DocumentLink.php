<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One external document (parent) waiting on one internal document (child).
 *
 * See App\Support\DocumentChain for what the link actually enforces.
 */
class DocumentLink extends Model
{
    protected $fillable = [
        'parent_task_id',
        'child_task_id',
        'created_by',
    ];

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function child()
    {
        return $this->belongsTo(Task::class, 'child_task_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
