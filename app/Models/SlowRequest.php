<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlowRequest extends Model
{
    /** Only created_at is meaningful; a row is never updated. */
    public const UPDATED_AT = null;

    protected $fillable = [
        'route', 'method', 'path', 'status',
        'duration_ms', 'query_count', 'query_ms', 'memory_kb', 'user_id',
    ];

    protected $casts = [
        'status' => 'integer',
        'duration_ms' => 'integer',
        'query_count' => 'integer',
        'query_ms' => 'integer',
        'memory_kb' => 'integer',
        'user_id' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSince($query, $days)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
