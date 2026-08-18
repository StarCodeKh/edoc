<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkspaceBoard extends Model
{
    protected $fillable = [
        'workspace_id',
        'name',
        'order',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function lists()
    {
        return $this->hasMany(WorkspaceBoardList::class)->orderBy('order');
    }
}
