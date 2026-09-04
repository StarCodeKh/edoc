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
     *
     * Holding a document here is the other way in, and it has to be. A dynamic
     * step is handed to one person as the document is forwarded, and that
     * hand-off is an assignees row rather than a responsibility - see
     * User::responsibleStepsQuery(), which deliberately leaves a dynamic group
     * step out - so the doer of such a step could see the document in My Tasks
     * and then get a 404 opening the page that listed it.
     *
     * Rather than name those connections again here and let the two drift, that
     * arm asks Task::scopeVisibleTo: a workspace holding a document this user
     * may read is a workspace they may open. Whatever earns a document a place
     * in the register earns the register itself, which is the only way a row
     * that lists can be a row that opens. It grants no more than that - every
     * action on a document is still TaskAbility's call, one document at a time.
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
