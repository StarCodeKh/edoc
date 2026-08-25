<?php

return [
    /*
    | Set false to stop recording entirely. The Performance page still shows
    | live server health; only the slow-request history goes quiet.
    */
    'enabled' => env('PERFORMANCE_MONITORING', true),

    /* A request slower than this (milliseconds) is recorded. */
    'slow_request_ms' => env('PERFORMANCE_SLOW_MS', 500),

    /* How long recorded requests are kept. */
    'retention_days' => env('PERFORMANCE_RETENTION_DAYS', 14),

    /*
    | Thresholds the health panel warns at. Percentages are of the total.
    */
    'warn' => [
        'memory_percent' => 80,
        'disk_percent' => 85,
        'log_size_mb' => 50,
        'avg_request_ms' => 800,
    ],
];
