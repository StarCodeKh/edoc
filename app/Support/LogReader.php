<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

/**
 * Reads Laravel's own log files into structured entries.
 *
 * Log files grow without bound, so only the tail of each file is parsed - far
 * enough back to be useful, never far enough to exhaust memory on a server
 * whose log nobody has rotated in a year.
 */
class LogReader
{
    /** How much of the end of each file to read. */
    private const TAIL_BYTES = 2 * 1024 * 1024;

    /** Hard ceiling on parsed entries, newest first. */
    private const MAX_ENTRIES = 2000;

    /** `[2026-08-25 09:11:39] local.ERROR: message` */
    private const HEADER = '/^\[(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})[^\]]*\]\s+([\w-]+)\.(\w+):\s?(.*)$/';

    /** Every log file present, newest first. */
    public static function files(): Collection
    {
        $dir = storage_path('logs');

        if (! File::isDirectory($dir)) {
            return collect();
        }

        return collect(File::files($dir))
            ->filter(fn ($file) => $file->getExtension() === 'log')
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->map(fn ($file) => [
                'name' => $file->getFilename(),
                'size' => $file->getSize(),
                'modified_at' => Carbon::createFromTimestamp($file->getMTime())->toIso8601String(),
            ])
            ->values();
    }

    /**
     * Parse one file (or every file when $only is null) into entries, newest
     * first. Each entry keeps its stack trace as `context`.
     */
    public static function entries(?string $only = null): Collection
    {
        $names = self::files()->pluck('name');

        if ($only !== null) {
            $names = $names->filter(fn ($name) => $name === $only);
        }

        $entries = collect();

        foreach ($names as $name) {
            foreach (self::parse($name) as $entry) {
                $entries->push($entry);
                if ($entries->count() >= self::MAX_ENTRIES) {
                    break 2;
                }
            }
        }

        return $entries->sortByDesc('timestamp')->values();
    }

    /** Distinct levels present, for the filter. */
    public static function levels(Collection $entries): Collection
    {
        return $entries->pluck('level')->unique()->sort()->values();
    }

    private static function parse(string $name): array
    {
        $path = storage_path('logs/'.$name);

        if (! File::exists($path) || ! File::isReadable($path)) {
            return [];
        }

        $contents = self::tail($path);
        $lines = preg_split("/\r\n|\n|\r/", $contents);

        $entries = [];
        $current = null;
        $index = 0;

        foreach ($lines as $line) {
            if (preg_match(self::HEADER, $line, $m)) {
                if ($current) {
                    $entries[] = self::finish($current);
                }

                $current = [
                    // Stable enough to address one entry across a request.
                    'id' => $name.':'.(++$index),
                    'file' => $name,
                    'timestamp' => $m[1],
                    'channel' => $m[2],
                    'level' => strtoupper($m[3]),
                    'message' => trim($m[4]),
                    'context' => [],
                ];
                continue;
            }

            // Anything before the first header is the tail of a truncated entry.
            if ($current !== null && $line !== '') {
                $current['context'][] = $line;
            }
        }

        if ($current) {
            $entries[] = self::finish($current);
        }

        return array_reverse($entries);
    }

    private static function finish(array $entry): array
    {
        $context = implode("\n", $entry['context']);

        // The message often carries the whole exception JSON on one line; keep
        // the readable half in `message` and push the rest down into context.
        if (($pos = mb_strpos($entry['message'], ' {"exception":')) !== false) {
            $context = mb_substr($entry['message'], $pos + 1)."\n".$context;
            $entry['message'] = mb_substr($entry['message'], 0, $pos);
        }

        $entry['context'] = trim($context);
        $entry['excerpt'] = mb_strimwidth($entry['message'], 0, 180, '…');

        return $entry;
    }

    /** Last TAIL_BYTES of a file, trimmed to start at a line boundary. */
    private static function tail(string $path): string
    {
        $size = filesize($path);

        if ($size === false || $size === 0) {
            return '';
        }

        if ($size <= self::TAIL_BYTES) {
            return (string) file_get_contents($path);
        }

        $handle = fopen($path, 'rb');
        fseek($handle, -self::TAIL_BYTES, SEEK_END);
        $contents = (string) fread($handle, self::TAIL_BYTES);
        fclose($handle);

        // Drop the partial first line so parsing starts cleanly.
        $break = strpos($contents, "\n");

        return $break === false ? $contents : substr($contents, $break + 1);
    }
}
