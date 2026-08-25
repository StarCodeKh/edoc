<?php

namespace App\Http\Controllers;

use App\Support\LogReader;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

/**
 * The application's own log, read from storage/logs.
 *
 * Super Admin only (see EnsureSuperAdmin): stack traces routinely carry file
 * paths, SQL and request payloads, which is not something to hand to every
 * administrator.
 */
class ErrorLogController extends Controller
{
    private const PER_PAGE = 25;

    public function index(Request $request)
    {
        $filters = $request->only('search', 'level', 'file');
        $files = LogReader::files();

        // Default to the newest file rather than every file at once.
        $active = $filters['file'] ?? $files->first()['name'] ?? null;

        $all = LogReader::entries($active);

        $filtered = $all
            ->when($filters['level'] ?? null, function ($entries, $level) {
                $wanted = array_map('strtoupper', array_filter(explode(',', (string) $level)));

                return $entries->filter(fn ($entry) => in_array($entry['level'], $wanted, true));
            })
            ->when($filters['search'] ?? null, function ($entries, $search) {
                $needle = mb_strtolower($search);

                return $entries->filter(fn ($entry) => str_contains(mb_strtolower($entry['message']), $needle)
                    || str_contains(mb_strtolower($entry['context']), $needle));
            })
            ->values();

        $page = LengthAwarePaginator::resolveCurrentPage();
        $entries = new LengthAwarePaginator(
            // The panel reads the full entry, so the trace rides along.
            $filtered->forPage($page, self::PER_PAGE)->values(),
            $filtered->count(),
            self::PER_PAGE,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Settings/ErrorLog', [
            'title' => 'Error Log',
            'entries' => $entries,
            'filters' => $filters,
            'files' => $files,
            'activeFile' => $active,
            'levels' => LogReader::levels($all),
            'counts' => $all->groupBy('level')->map->count(),
            'total' => $all->count(),
        ]);
    }

    /** Empty the active log file without deleting it. */
    public function clear(Request $request)
    {
        $name = $request->input('file');
        $known = LogReader::files()->pluck('name');

        // Never write to a path the caller made up.
        if (! $name || ! $known->contains($name)) {
            abort(422, 'Unknown log file.');
        }

        File::put(storage_path('logs/'.$name), '');

        return back()->with('success', __('Log cleared.'));
    }
}
