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
        'role_mode',
        'requires_signature',
        'requires_attachment',
        'attachment_mode',
        'is_terminal',
    ];

    protected $casts = [
        'requires_signature' => 'boolean',
        'requires_attachment' => 'boolean',
        'is_terminal' => 'boolean',
        'order' => 'integer',
    ];
}
