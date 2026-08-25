<?php

namespace App\Support;

use App\Models\SlowRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * A live snapshot of how the installation is doing. Nothing here is recorded -
 * every value is read at the moment the page is opened.
 *
 * Each check returns a status of ok | warn | bad so the page can flag trouble
 * without the front end re-deciding what "slow" means.
 */
class ServerHealth
{
    public static function checks(): array
    {
        return array_values(array_filter([
            self::phpVersion(),
            self::memory(),
            self::disk(),
            self::database(),
            self::logSize(),
            self::queueDriver(),
            self::cacheDriver(),
            self::configCached(),
            self::debugMode(),
            self::pendingMigrations(),
            self::averageResponse(),
        ]));
    }

    private static function check(string $label, $value, string $status, ?string $hint = null, ?string $group = null): array
    {
        // A missing config value is a finding, not a crash - this page exists
        // precisely to surface things that are unset or misconfigured.
        $value = ($value === null || $value === '') ? 'not set' : (string) $value;

        return compact('label', 'value', 'status', 'hint', 'group');
    }

    private static function phpVersion(): array
    {
        $version = PHP_VERSION;
        $status = version_compare($version, '8.2', '>=') ? 'ok'
            : (version_compare($version, '8.1', '>=') ? 'warn' : 'bad');

        return self::check('PHP version', $version, $status,
            $status === 'ok' ? null : 'This version is past or nearing end of support.', 'runtime');
    }

    private static function memory(): array
    {
        $limit = self::bytes(ini_get('memory_limit'));
        $used = memory_get_peak_usage(true);

        if ($limit <= 0) {
            return self::check('Memory limit', 'unlimited', 'ok', null, 'runtime');
        }

        $percent = (int) round($used / $limit * 100);
        $warn = (int) config('performance.warn.memory_percent', 80);

        return self::check(
            'Memory (peak)',
            self::human($used).' / '.self::human($limit).' · '.$percent.'%',
            $percent >= $warn ? 'warn' : 'ok',
            $percent >= $warn ? 'This request alone used most of the PHP memory limit.' : null,
            'runtime'
        );
    }

    private static function disk(): array
    {
        $path = storage_path();
        $free = @disk_free_space($path);
        $total = @disk_total_space($path);

        if (! $free || ! $total) {
            return self::check('Disk', 'unavailable', 'warn', 'Could not read disk usage for the storage path.', 'runtime');
        }

        $usedPercent = (int) round(($total - $free) / $total * 100);
        $warn = (int) config('performance.warn.disk_percent', 85);

        return self::check(
            'Disk',
            self::human($total - $free).' used of '.self::human($total).' · '.$usedPercent.'%',
            $usedPercent >= $warn ? 'warn' : 'ok',
            $usedPercent >= $warn ? 'Free space is running low on the volume holding storage/.' : null,
            'runtime'
        );
    }

    private static function database(): array
    {
        try {
            $name = DB::connection()->getDatabaseName();
            $rows = DB::select(
                'SELECT SUM(data_length + index_length) AS bytes, COUNT(*) AS tables
                 FROM information_schema.TABLES WHERE table_schema = ?', [$name]
            );
            $bytes = (int) ($rows[0]->bytes ?? 0);
            $tables = (int) ($rows[0]->tables ?? 0);

            return self::check('Database', self::human($bytes).' · '.$tables.' tables', 'ok', null, 'data');
        } catch (\Throwable $e) {
            return self::check('Database', 'unreadable', 'warn', 'Could not read table sizes on this connection.', 'data');
        }
    }

    private static function logSize(): array
    {
        $bytes = collect(LogReader::files())->sum('size');
        $warn = (int) config('performance.warn.log_size_mb', 50) * 1024 * 1024;

        return self::check(
            'Log files',
            self::human($bytes).' · '.LogReader::files()->count().' files',
            $bytes >= $warn ? 'warn' : 'ok',
            $bytes >= $warn ? 'Logs are large; consider lowering LOG_DAILY_DAYS.' : null,
            'data'
        );
    }

    private static function queueDriver(): array
    {
        $driver = config('queue.default');

        if (! $driver) {
            return self::check('Queue driver', null, 'warn', 'QUEUE_CONNECTION is not set.', 'config');
        }

        return self::check('Queue driver', $driver,
            $driver === 'sync' ? 'warn' : 'ok',
            $driver === 'sync' ? 'Jobs run inside the request, so mail and notifications block the user.' : null,
            'config');
    }

    private static function cacheDriver(): array
    {
        $driver = config('cache.default');

        if (! $driver) {
            return self::check('Cache driver', null, 'warn', 'CACHE_DRIVER is not set; Laravel falls back to the file store.', 'config');
        }

        return self::check('Cache driver', $driver,
            in_array($driver, ['array', 'null'], true) ? 'warn' : 'ok',
            in_array($driver, ['array', 'null'], true) ? 'Nothing is actually cached with this driver.' : null,
            'config');
    }

    private static function configCached(): array
    {
        $cached = File::exists(base_path('bootstrap/cache/config.php'));
        $production = app()->environment('production');

        return self::check('Config cache', $cached ? 'cached' : 'not cached',
            ($production && ! $cached) ? 'warn' : 'ok',
            ($production && ! $cached) ? 'Run php artisan config:cache in production.' : null,
            'config');
    }

    private static function debugMode(): array
    {
        $debug = (bool) config('app.debug');
        $production = app()->environment('production');

        return self::check('Debug mode', $debug ? 'on' : 'off',
            ($production && $debug) ? 'bad' : 'ok',
            ($production && $debug) ? 'Debug mode leaks stack traces and configuration to visitors.' : null,
            'config');
    }

    private static function pendingMigrations(): array
    {
        try {
            $ran = DB::table('migrations')->pluck('migration')->all();
            $files = collect(File::files(database_path('migrations')))
                ->map(fn ($f) => $f->getFilenameWithoutExtension());
            $pending = $files->diff($ran)->count();

            return self::check('Migrations', $pending ? $pending.' pending' : 'up to date',
                $pending ? 'warn' : 'ok',
                $pending ? 'Run php artisan migrate.' : null, 'data');
        } catch (\Throwable $e) {
            return self::check('Migrations', 'unknown', 'warn', null, 'data');
        }
    }

    private static function averageResponse(): array
    {
        if (! config('performance.enabled', true)) {
            return self::check('Slow-request log', 'disabled', 'warn',
                'Set PERFORMANCE_MONITORING=true to record slow requests.', 'requests');
        }

        $avg = (int) round(SlowRequest::since(7)->avg('duration_ms') ?? 0);
        $count = SlowRequest::since(7)->count();

        if (! $count) {
            return self::check('Slow requests (7 days)', 'none recorded', 'ok',
                'Nothing has crossed the '.config('performance.slow_request_ms').' ms threshold.', 'requests');
        }

        $warn = (int) config('performance.warn.avg_request_ms', 800);

        return self::check('Slow requests (7 days)', $count.' · '.$avg.' ms average',
            $avg >= $warn ? 'warn' : 'ok',
            $avg >= $warn ? 'The slowest requests are averaging over '.$warn.' ms.' : null,
            'requests');
    }

    private static function bytes(?string $value): int
    {
        if ($value === false || $value === null || $value === '' || $value === '-1') {
            return 0;
        }

        $unit = strtolower(substr(trim($value), -1));
        $number = (int) $value;

        return match ($unit) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }

    private static function human(int $bytes): string
    {
        if ($bytes < 1024) return $bytes.' B';
        if ($bytes < 1024 ** 2) return round($bytes / 1024).' KB';
        if ($bytes < 1024 ** 3) return round($bytes / 1024 ** 2, 1).' MB';

        return round($bytes / 1024 ** 3, 2).' GB';
    }
}
