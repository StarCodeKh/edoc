import { expect, test } from '@playwright/test';

/**
 * What the server-side tests cannot see: whether the page actually draws.
 *
 * An Inertia page that fails in the browser still returns 200 with a correct
 * data-page attribute - the screen just stays blank. These tests watch the
 * console and the network while a page loads, then check that Vue mounted
 * something into #app.
 */

/** Collect console errors and failed requests for the life of a page. */
function watchFor(page) {
    const problems = [];

    page.on('console', (message) => {
        if (message.type() === 'error') {
            problems.push(`console: ${message.text()}`);
        }
    });
    page.on('pageerror', (error) => problems.push(`uncaught: ${error.message}`));
    page.on('requestfailed', (request) =>
        problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`)
    );
    page.on('response', (response) => {
        if (response.status() >= 400) {
            problems.push(`http ${response.status()}: ${response.url()}`);
        }
    });

    return problems;
}

test('the login page mounts with no console errors', async ({ page }) => {
    const problems = watchFor(page);

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Inertia renders into #app; if the bundle failed, it stays empty.
    const app = page.locator('#app');
    await expect(app).not.toBeEmpty();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    expect(problems, `page reported:\n${problems.join('\n')}`).toEqual([]);
});

test('assets come from a reachable origin', async ({ page }) => {
    // The dev server writes public/hot with the address it bound to. If that
    // address is not reachable from the browser, every script tag 404s and
    // every page in the app goes blank - which looks like an app bug and is not.
    const urls = [];
    page.on('request', (request) => {
        if (request.resourceType() === 'script') urls.push(request.url());
    });

    await page.goto('/login', { waitUntil: 'networkidle' });

    expect(urls.length, 'no scripts were requested at all').toBeGreaterThan(0);

    for (const url of urls) {
        const response = await page.request.get(url).catch((error) => ({ error }));
        expect(response.error, `script unreachable: ${url}`).toBeUndefined();
        expect(response.status(), `script ${url}`).toBeLessThan(400);
    }
});
