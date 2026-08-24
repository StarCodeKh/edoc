<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
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
        'role_id'             => 'integer',
        'email_verified_at'   => 'datetime',
        'password'            => 'hashed',
    ];

    public function resolveRouteBinding($value, $field = null) {
        return $this->where($field ?? 'id', $value)->firstOrFail();
    }

    public function getNameAttribute()
    {
        return $this->first_name.' '.$this->last_name;
    }

    public function getCreatedAtAttribute($date){
        return Carbon::parse($date)->format('jS F, Y');
    }

    public function role() {
        return $this->belongsTo(Role::class);
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::needsRehash($password) ? Hash::make($password) : $password;
    }

    /**
     * Roles, as the ministry defines them:
     *   Super Admin - everything in the system   (roles.id 1)
     *   Admin       - everything on every board  (roles.id 2)
     *   Normal      - only their own documents   (roles.slug 'normal')
     *
     * Super Admin and Admin share the slug 'admin', so the two are told apart by
     * role name / id; every existing `slug == 'admin'` check keeps working.
     */
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
        return ! $this->isAdmin();
    }

    public function isDemoUser()
    {
        return $this->email === 'johndoe@example.com';
    }

    public function scopeOrderByName($query)
    {
        $query->orderBy('last_name')->orderBy('first_name');
    }

    public function scopeByRole($query, array $filters){
        $query->when($filters['role'] ?? null, function ($query, $role) {
            $query->whereRole($role);
        });
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function tasks(){
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

    public function getFullNameAttribute(){
        return ucfirst($this->first_name) . ' ' . ucfirst($this->last_name);
    }

    public function watchedTasks(): MorphToMany
    {
        return $this->morphedByMany(Task::class, 'watchable', 'watchers');
    }

    public function watchedProjects(): MorphToMany
    {
        return $this->morphedByMany(Project::class, 'watchable', 'watchers');
    }

    public function scopeFilter($query, array $filters) {
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
