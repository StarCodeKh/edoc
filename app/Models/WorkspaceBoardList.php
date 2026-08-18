<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkspaceBoardList extends Model
{
    protected $fillable = [
        'workspace_board_id',
        'name',
        'order',
    ];

    public function board()
    {
        return $this->belongsTo(WorkspaceBoard::class, 'workspace_board_id');
    }
}
