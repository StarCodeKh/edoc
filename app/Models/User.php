<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
    ];

    protected $appends = ['name'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'role_id' => 'integer',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? 'id', $value)->firstOrFail();
    }

    public function getNameAttribute()
    {
        return $this->first_name.' '.$this->last_name;
    }

    public function getCreatedAtAttribute($date)
    {
        return Carbon::parse($date)->format('jS F, Y');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::needsRehash($password) ? Hash::make($password) : $password;
    }

    /**
     * The responsibility code the registry office carries in
     * workflow_sub_roles - the row seeded as ការិយាល័យ រដ្ឋបាល.
     */
    public const REGISTRY_SUB_ROLE_CODE = 'admin';

    /**
     * Roles, as the ministry defines them:
     *   Super Admin - everything in the system   (roles.id 1)
     *   Admin       - everything on every board  (roles.id 2)
     *   Normal      - only their own documents   (roles.slug 'normal')
     *
     * Super Admin and Admin share the slug 'admin', so the two are told apart by
     * role name / id; every existing `slug == 'admin'` check keeps working.
     */
    /**
     * The board titles this user is responsible for, via their workflow
     * responsibility.
     *
     * Workflow steps are matched to boards by title - that is how
     * Support\WorkflowStep has always resolved them - so a responsibility
     * resolves to a set of titles rather than board ids.
     *
     * Memoised: visibility is asked once per task in some loops, and this
     * would otherwise be two queries every time.
     */
    public function responsibleListTitles(): array
    {
        return $this->responsibleTitlesCache ??= $this->pluckFromResponsibleSteps('list_title');
    }

    /**
     * The workspaces those steps are configured in.
     *
     * This is how a Normal User reaches a workspace at all. Team membership is
     * the other way in, and in practice the administration never creates those
     * rows - people are given a responsibility instead, and the responsibility
     * is what says which flow they work in.
     */
    public function responsibleWorkspaceIds(): array
    {
        return $this->responsibleWorkspacesCache ??= array_map(
            'intval',
            $this->pluckFromResponsibleSteps('workspace_id')
        );
    }

    /** One column of the steps this user's responsibility covers. */
    private function pluckFromResponsibleSteps(string $column): array
    {
        $query = $this->responsibleStepsQuery();

        if (empty($query)) {
            return [];
        }

        return $query->pluck($column)->filter()->unique()->values()->all();
    }

    /**
     * The workflow steps this user's responsibility covers, or null when they
     * carry no responsibility at all.
     */
    private function responsibleStepsQuery(): ?Builder
    {
        $role = $this->workflowSubRoleRecord();

        if (empty($role) || empty($role->code)) {
            return null;
        }

        $parentCode = $role->parent_id
            ? WorkflowSubRole::whereKey($role->parent_id)->value('code')
            : null;

        return EdocWorkflowRole::where(function ($query) use ($role, $parentCode) {
            // The responsibility this user actually carries.
            $query->where('responsible_role', $role->code);

            // ...and the group it sits under, but only where that step is
            // standard. A standard step names the group and means all of it, so
            // a D1 officer holds a "នាយកដ្ឋាន D1-D5" step like everyone else
            // under it. A dynamic step is handed to one member as it is
            // forwarded, and only that member should carry it - they get an
            // assignee row, which is what puts it on their plate instead.
            if ($parentCode) {
                $query->orWhere(function ($group) use ($parentCode) {
                    $group->where('responsible_role', $parentCode)
                        ->where(function ($mode) {
                            $mode->where('role_mode', '!=', 'dynamic')->orWhereNull('role_mode');
                        });
                });
            }
        });
    }

    /** The workflow responsibility this user carries, if any. */
    private ?array $responsibleTitlesCache = null;

    private ?array $responsibleWorkspacesCache = null;

    private ?WorkflowSubRole $workflowSubRoleCache = null;

    private bool $workflowSubRoleLoaded = false;

    public function workflowSubRole()
    {
        return $this->belongsTo(WorkflowSubRole::class, 'workflow_sub_role_id');
    }

    /**
     * The responsibility row itself, read once per user.
     *
     * Both the titles this user is responsible for and whether they are the
     * registry office are answered from it, and both are asked per document in
     * the register loops.
     */
    private function workflowSubRoleRecord(): ?WorkflowSubRole
    {
        if ($this->workflowSubRoleLoaded) {
            return $this->workflowSubRoleCache;
        }

        $this->workflowSubRoleLoaded = true;

        return $this->workflowSubRoleCache = empty($this->workflow_sub_role_id)
            ? null
            : WorkflowSubRole::find($this->workflow_sub_role_id);
    }

    /**
     * The registry office (ការិយាល័យ រដ្ឋបាល): every document passes through it
     * on the way in and on the way out, and it has to be able to find any of
     * them at any point in any flow to answer for the register.
     *
     * So it reads the whole register, across every workspace - and reads it
     * only. Acting on a document is unchanged: the step the document is
     * waiting on has to be one of theirs, which responsibleListTitles()
     * answers, for a standard step and a dynamic one alike.
     */
    public function isRegistryOffice(): bool
    {
        return optional($this->workflowSubRoleRecord())->code === self::REGISTRY_SUB_ROLE_CODE;
    }

    /** Sees every document, whether by permission role or by responsibility. */
    public function seesEveryDocument(): bool
    {
        return $this->isAdmin() || $this->isRegistryOffice();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role_id === 1 || strtolower((string) ($this->role->name ?? '')) === 'super admin';
    }

    public function isAdmin(): bool
    {
        return ($this->role->slug ?? null) === 'admin';
    }

    public function isNormalUser(): bool
    {
        return !$this->isAdmin();
    }

    public function isDemoUser()
    {
        return $this->email === 'johndoe@example.com';
    }

    public function scopeOrderByName($query)
    {
        $query->orderBy('last_name')->orderBy('first_name');
    }

    public function scopeByRole($query, array $filters)
    {
        $query->when($filters['role'] ?? null, function ($query, $role) {
            $query->whereRole($role);
        });
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getFullNameAttribute()
    {
        return ucfirst($this->first_name).' '.ucfirst($this->last_name);
    }

    public function watchedTasks(): MorphToMany
    {
        return $this->morphedByMany(Task::class, 'watchable', 'watchers');
    }

    public function watchedProjects(): MorphToMany
    {
        return $this->morphedByMany(Project::class, 'watchable', 'watchers');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        })->when($filters['role_id'] ?? null, function ($query, $role_id) {
            $query->whereRoleId($role_id);
        });
    }

    public function hasEdocRole(string $role): bool
    {
        return $this->edoc_role === $role;
    }
}
