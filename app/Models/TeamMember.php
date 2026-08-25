<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class TeamMember extends Model
{
    use HasFactory;
    use Notifiable;

    protected $table = 'team_members';

    protected $casts = [
        'user_id' => 'integer',
        'workspace_id' => 'integer',
        'added_by' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function scopeExceptMe($query)
    {
        $query->where('user_id', '!=', auth()->id());
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Get the user who added this member.
     */
    public function adder()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) {})->WhereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', '%'.$search.'%')->orWhere('last_name', 'like', '%'.$search.'%');
            });
            //                $query->where('user.first_name', 'like', '%'.$search.'%')->orWhere('task', 'like', '%'.$search.'%');
        });
    }
}
