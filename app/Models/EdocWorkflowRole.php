<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EdocWorkflowRole extends Model
{
    protected $table = 'edoc_workflow_roles';

    protected $fillable = [
        'workflow_type',
        'board_list_id',
        'list_title',
        'order',
        'responsible_role',
        'sla_hours',
        'requires_signature',
        'is_terminal',
    ];

    protected $casts = [
        'requires_signature' => 'boolean',
        'is_terminal' => 'boolean',
        'sla_hours' => 'integer',
        'order' => 'integer',
    ];
}
