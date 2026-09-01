<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Workspace extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'user_id' => 'integer',
        'type_id' => 'integer',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function member()
    {
        return $this->hasOne(TeamMember::class, 'workspace_id')->where('user_id', auth()->id());
    }

    /**
     * Workspaces a user may open. Admins (and Super Admins) run every board flow,
     * and the registry office answers for the register across all of them, so
     * neither is held to workspace membership; everyone else sees the ones they
     * own, belong to, or carry a workflow responsibility in.
     *
     * That last arm is what a Normal User actually reaches a workspace by. The
     * administration gives people a responsibility, not a team_members row, so
     * a rule written on membership alone left them with nothing at all.
     */
    public function scopeAccessibleTo($query, $user = null)
    {
        $user = $user ?: Auth::user();

        if ($user && $user->seesEveryDocument()) {
            return $query;
        }

        $responsibleFor = $user ? $user->responsibleWorkspaceIds() : [];

        return $query->where(function ($query) use ($user, $responsibleFor) {
            $query->where('user_id', $user->id ?? null)->orWhereHas('member');

            if (!empty($responsibleFor)) {
                $query->orWhereIn('id', $responsibleFor);
            }
        });
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function members()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function type()
    {
        return $this->belongsTo(WorkspaceType::class, 'type_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        });
    }

    public function boards()
    {
        return $this->hasMany(WorkspaceBoard::class)->orderBy('order');
    }
}
