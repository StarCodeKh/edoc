<?php

namespace App\Http\Middleware;

use App\Models\SlowRequest;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Times every request, but only writes a row when one is slow enough to be
 * worth looking at. A fast request costs one microtime() call and nothing else.
 *
 * Thresholds and retention are configurable via config/performance.php.
 */
class RecordSlowRequests
{
    public function handle(Request $request, Closure $next)
    {
        if (!config('performance.enabled', true)) {
            return $next($request);
        }

        $start = microtime(true);

        // Counting queries is cheap; the listener only increments two numbers.
        $queries = 0;
        $queryMs = 0.0;
        DB::listen(function ($query) use (&$queries, &$queryMs) {
            $queries++;
            $queryMs += $query->time;
        });

        $response = $next($request);

        $this->record($request, $response, $start, $queries, $queryMs);

        return $response;
    }

    private function record(Request $request, $response, float $start, int $queries, float $queryMs): void
    {
        $duration = (microtime(true) - $start) * 1000;

        if ($duration < (int) config('performance.slow_request_ms', 500)) {
            return;
        }

        // Never let monitoring break the request it is monitoring.
        try {
            SlowRequest::create([
                'route' => optional($request->route())->getName(),
                'method' => $request->method(),
                'path' => mb_substr('/'.ltrim($request->path(), '/'), 0, 500),
                'status' => $response instanceof Response ? $response->getStatusCode() : null,
                'duration_ms' => (int) round($duration),
                'query_count' => $queries,
                'query_ms' => (int) round($queryMs),
                'memory_kb' => (int) round(memory_get_peak_usage(true) / 1024),
                'user_id' => optional($request->user())->id,
                'created_at' => now(),
            ]);

            $this->prune();
        } catch (\Throwable $e) {
            // Swallowed on purpose - a monitoring write must not surface as a 500.
        }
    }

    /** Drop rows past the retention window, occasionally rather than every time. */
    private function prune(): void
    {
        if (random_int(1, 100) !== 1) {
            return;
        }

        SlowRequest::where('created_at', '<', now()->subDays((int) config('performance.retention_days', 14)))->delete();
    }
}
