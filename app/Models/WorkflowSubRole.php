<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The list of responsibilities a workflow step can be assigned to - "sg",
 * "dpt", "admin" and whatever else an administration needs.
 *
 * Deliberately separate from Role: that table drives the permission system
 * (User::isAdmin() reads roles.slug), and these are labels on a workflow step,
 * not grants of access.
 */
class WorkflowSubRole extends Model
{
    protected $table = 'workflow_sub_roles';

    protected $fillable = ['code', 'name', 'order'];

    protected $casts = ['order' => 'integer'];

    public function scopeOrdered($query)
    {
        $query->orderBy('order')->orderBy('code');
    }
}
