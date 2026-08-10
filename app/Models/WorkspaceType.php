<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceType extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $guarded = [];

    public function scopeFilter($query, array $filters) {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%');
            });
        });
    }
}
