<?php

namespace App\Http\Controllers;

use App\Models\SlowRequest;
use App\Support\ServerHealth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Server health and slow-request history. Super Admin only (EnsureSuperAdmin):
 * it exposes paths, driver names and database size.
 */
class PerformanceController extends Controller
{
    private const PER_PAGE = 25;

    public function index(Request $request)
    {
        $filters = $request->only('days', 'route', 'search');
        $days = (int) ($filters['days'] ?? 7);
        $days = in_array($days, [1, 7, 30], true) ? $days : 7;

        $base = SlowRequest::since($days);

        $slowest = (clone $base)
            ->selectRaw('route, path, COUNT(*) as hits, ROUND(AVG(duration_ms)) as avg_ms, MAX(duration_ms) as max_ms, ROUND(AVG(query_count)) as avg_queries')
            ->groupBy('route', 'path')
            ->orderByDesc('avg_ms')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'route' => $row->route,
                'path' => $row->path,
                'hits' => (int) $row->hits,
                'avg_ms' => (int) $row->avg_ms,
                'max_ms' => (int) $row->max_ms,
                'avg_queries' => (int) $row->avg_queries,
            ]);

        $entries = (clone $base)
            ->with('user:id,first_name,last_name')
            ->when($filters['route'] ?? null, fn ($q, $route) => $q->whereIn('route', array_filter(explode(',', (string) $route))))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('path', 'like', "%{$search}%"))
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (SlowRequest $row) => [
                'id' => $row->id,
                'route' => $row->route,
                'method' => $row->method,
                'path' => $row->path,
                'status' => $row->status,
                'duration_ms' => $row->duration_ms,
                'query_count' => $row->query_count,
                'query_ms' => $row->query_ms,
                'memory_kb' => $row->memory_kb,
                'created_at' => optional($row->created_at)->toIso8601String(),
                'user' => $row->user ? trim($row->user->first_name.' '.$row->user->last_name) : null,
            ]);

        return Inertia::render('Settings/Performance', [
            'title' => 'Performance',
            'checks' => ServerHealth::checks(),
            'slowest' => $slowest,
            'entries' => $entries,
            'filters' => array_merge($filters, ['days' => $days]),
            'routes' => (clone $base)->distinct()->orderBy('route')->pluck('route')->filter()->values(),
            'threshold' => (int) config('performance.slow_request_ms', 500),
            'retention' => (int) config('performance.retention_days', 14),
            'recording' => (bool) config('performance.enabled', true),
            'summary' => [
                'total' => (clone $base)->count(),
                'avg_ms' => (int) round((clone $base)->avg('duration_ms') ?? 0),
                'max_ms' => (int) ((clone $base)->max('duration_ms') ?? 0),
                'worst_queries' => (int) ((clone $base)->max('query_count') ?? 0),
            ],
        ]);
    }

    /** Discard the recorded history without touching the live checks. */
    public function clear()
    {
        DB::table('slow_requests')->delete();

        return back()->with('success', __('Recorded requests cleared.'));
    }
}
