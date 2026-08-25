import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the app you already have running - `npm run dev`
 * plus `php artisan serve` - and drive the Chrome that is installed on this
 * machine, so nothing is downloaded.
 *
 *     npm run test:browser
 *     npm run test:browser -- --headed     # watch it happen
 */
export default defineConfig({
    testDir: './tests/Browser',
    timeout: 30_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    reporter: [['list']],
    use: {
        baseURL: process.env.APP_TEST_URL || 'http://127.0.0.1:8000',
        channel: 'chrome',
        headless: true,
        viewport: { width: 1280, height: 800 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
        {
            name: 'phone',
            use: {
                ...devices['iPhone 14 Pro'],
                // The iPhone descriptor asks for WebKit, which has no "chrome"
                // channel. Keep the phone's viewport and touch behaviour, run it
                // on the Chrome that is installed here.
                defaultBrowserType: 'chromium',
                channel: 'chrome',
            },
        },
    ],
});
