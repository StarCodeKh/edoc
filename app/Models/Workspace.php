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
     * Workspaces a user may open.
     *
     * Admins and the registry office answer for every board, so neither is held
     * to membership. Everyone else owns, belongs to, or carries a
     * responsibility in one - and that last arm is how a Normal User reaches a
     * workspace at all, since the administration hands out responsibilities
     * rather than team_members rows.
     *
     * Holding a document is the other way in: a dynamic step is handed over as
     * an assignees row, not a responsibility, so its doer would otherwise see
     * the document in My Tasks and 404 opening it. That arm defers to
     * Task::scopeVisibleTo rather than restating the rule and drifting from it.
     * It grants listing only; every action is still TaskAbility's call.
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

            if (empty($user)) {
                return;
            }

            // A document they may read is filed here, so the pages that list it
            // have to open. scopeVisibleTo groups its own arms, so the OR
            // inside it cannot escape the constraint tying the task back to
            // this workspace's projects.
            $query->orWhereHas('projects.tasks', function ($tasks) use ($user) {
                $tasks->visibleTo($user);
            });
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
