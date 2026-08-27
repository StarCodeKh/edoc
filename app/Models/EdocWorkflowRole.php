<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EdocWorkflowRole extends Model
{
    protected $table = 'edoc_workflow_roles';

    protected $fillable = [
        'workflow_type',
        'workspace_id',
        'list_title',
        'order',
        'responsible_role',
        'requires_signature',
        'is_terminal',
    ];

    protected $casts = [
        'requires_signature' => 'boolean',
        'is_terminal' => 'boolean',
        'order' => 'integer',
    ];
}
