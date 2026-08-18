<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'user_id' => 'integer',
        'type_id' => 'integer',
    ];

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function member() {
        return $this->hasOne(TeamMember::class, 'workspace_id')->where('user_id', auth()->id());
    }

    public function teamMembers() {
        return $this->hasMany(TeamMember::class);
    }

    public function members() {
        return $this->hasMany(TeamMember::class);
    }

    public function type() {
        return $this->belongsTo(WorkspaceType::class, 'type_id');
    }

    public function scopeFilter($query, array $filters){
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        });
    }

    public function boards() {
        return $this->hasMany(WorkspaceBoard::class)->orderBy('order');
    }
}
