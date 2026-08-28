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

    protected $fillable = ['code', 'name', 'order', 'parent_id'];

    protected $casts = ['order' => 'integer'];

    public function scopeOrdered($query)
    {
        $query->orderBy('order')->orderBy('code');
    }

    /**
     * The responsibility this one sits under - D1 under នាយកដ្ឋាន D1-D5.
     * Nesting is one level deep, so a parent never has a parent of its own.
     */
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
