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

/**
 * Roles, as the ministry defines them:
 *   Super Admin - everything in the system   (roles.id 1)
 *   Admin       - everything on every board  (roles.id 2)
 *   Normal      - only their own documents   (roles.slug 'normal')
 *
 * Super Admin and Admin share the slug 'admin', so they are told apart by name
 * or id; every existing `slug == 'admin'` check keeps working.
 */
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
     * The board titles this user is responsible for.
     *
     * Steps are matched to boards by title, the way Support\WorkflowStep has
     * always resolved them, so a responsibility gives titles rather than ids.
     * Memoised: some loops ask this once per task.
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

            // ...and the group above it, but only on a standard step, which
            // names the group and means all of it. A dynamic step is handed to
            // one member on forward and reaches them by an assignee row.
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
     * The sub-office this person works in, from the same department tree the
     * intake form's source pair is built from. The department is its parent,
     * so filing a user under an office files them under both.
     */
    public function documentSource()
    {
        return $this->belongsTo(DocumentSource::class, 'document_source_id');
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
     * both ways, so it reads the whole register across every workspace - and
     * reads it only. Acting still needs the step to be one of theirs.
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

    /**
     * The user list's search box, matching everything the list shows.
     *
     * It reached name/phone/email only, so typing a ចំណងជើង, responsibility or
     * department returned an empty table. Names are stored split, so the two
     * full-name arms are what let "ទ្រី គីមហេង" match at all.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $like = '%'.$search.'%';

            $query->where(function ($query) use ($like) {
                $query->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    // Written both ways round: Khmer names are given
                    // family-name-first, and the list is read by people who
                    // type them either way.
                    ->orWhereRaw("CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) LIKE ?", [$like])
                    ->orWhereRaw("CONCAT(COALESCE(last_name, ''), ' ', COALESCE(first_name, '')) LIKE ?", [$like])
                    ->orWhereHas('role', fn ($q) => $q->where('name', 'like', $like))
                    ->orWhereHas('workflowSubRole', fn ($q) => $q->where('name', 'like', $like)
                        ->orWhere('code', 'like', $like))
                    // នាយកដ្ឋាន and ការិយាល័យរង: the office someone is filed
                    // under, and the department that office sits in.
                    ->orWhereHas('documentSource', fn ($q) => $q->where('name', 'like', $like)
                        ->orWhereHas('parent', fn ($p) => $p->where('name', 'like', $like)));
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
