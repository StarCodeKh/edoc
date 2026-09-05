/**
 * One place the whole app gets its data colours from.
 *
 * Before this file there were three copies of a status palette - Projects/Table,
 * Workspaces/Table and the printed DocumentReceipt each carried their own array,
 * and the two dashboards carried a fourth and a fifth. They did not agree, and
 * they were indexed by the document's position in whichever list the screen
 * happened to be holding. The same document came out green on the register
 * table and blue on the dashboard.
 *
 * Two things fix that, and both live here:
 *
 *   1. One set of values, selected per surface rather than flipped. Both modes
 *      were run through the data-viz validator as a set: lightness band, chroma
 *      floor, adjacent CVD separation (worst 9.1 light / 8.4 dark, target >= 8)
 *      and the normal-vision floor (19.6 / 19.3, floor 15) all pass.
 *
 *   2. A status colour is derived from the column's own workflow position -
 *      board_lists.order, which is where the step sits in the flow - and not
 *      from where the row happens to fall in whatever array the screen is
 *      holding. Every screen reads the same number off the same database row,
 *      so a status is one colour everywhere, and it keeps that colour when the
 *      register is filtered or a project shows only part of the flow.
 *
 * Thirteen steps into eight slots means the ninth step reuses the first
 * colour. That is deliberate rather than a wrap-around accident: colliding
 * steps are always eight apart in the flow, so they are never side by side,
 * and every place that paints a status prints its name beside the colour
 * anyway - the colour is a second cue, never the only one.
 *
 * A column with no order to read falls back to a hash of its name, which is at
 * least stable. If hand-picked colours are ever wanted, the upgrade is a
 * `color` column on board_lists and a settings screen to set it; this file
 * then becomes the fallback for a column nobody has chosen a colour for.
 */

/**
 * Identity, in fixed slot order. Never cycled through a generated hue: a ninth
 * category folds back onto the first rather than inventing a colour.
 */
export const CATEGORICAL = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

/**
 * State, reserved. These say done / late / due / open / nobody, and are never
 * reused as "category nine" - which is what keeps red meaning late on every
 * screen that uses them. `series` is the single-series chart colour; the rest
 * are chart furniture.
 */
export const STATUS = {
    light: {
        complete: '#0ca30c',
        soon: '#fab219',
        later: '#2a78d6',
        overdue: '#d03b3b',
        none: '#8a8f98',
        series: '#2a78d6',
        surface: '#ffffff',
        ink: '#52514e',
        muted: '#898781',
        grid: '#e8e7e3',
    },
    dark: {
        complete: '#0ca30c',
        soon: '#fab219',
        later: '#3987e5',
        overdue: '#e66767',
        none: '#9aa0a6',
        series: '#3987e5',
        surface: '#262932',
        ink: '#c3c2b7',
        muted: '#898781',
        grid: '#3a3d46',
    },
};

/**
 * The app's accent, for JavaScript that needs the value itself rather than the
 * CSS variable - anything passed to hexToRgba(), or handed to a library that
 * parses colours. The same steps as --accent-* in resources/css/variables.scss
 * and the `indigo` scale in tailwind.config.js; change all three together.
 *
 * Prefer var(--accent-fill) / var(--accent-ink) in markup and stylesheets: they
 * follow the theme on their own, where these constants cannot.
 */
export const ACCENT = {
    light: { fill: '#4f46e5', fillHover: '#4338ca', bright: '#6366f1', ink: '#4f46e5', on: '#ffffff' },
    dark: { fill: '#4f46e5', fillHover: '#6366f1', bright: '#818cf8', ink: '#818cf8', on: '#ffffff' },
};

/** The colour a status with no name at all falls back to. */
const UNNAMED = { light: '#8a8f98', dark: '#9aa0a6' };

/** FNV-1a over the code points, so the same name always lands on the same slot. */
function slotFor(name, slots) {
    let hash = 0x811c9dc5;

    for (let i = 0; i < name.length; i++) {
        hash ^= name.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash % slots;
}

/**
 * The colour of a board column.
 *
 * Takes the column itself - anything carrying `order` and `title`, which is
 * every board_lists row the app hands around - and falls back to a bare title
 * string where only the label survived, as on a printed receipt for a document
 * whose board has since been archived.
 *
 * Pass dark = false for anything that will be printed or sits on paper-white:
 * the dark steps are chosen for a dark card, not for a sheet of A4.
 */
export function statusColor(list, dark = false) {
    const mode = dark ? 'dark' : 'light';
    const slots = CATEGORICAL[mode];
    const column = list && typeof list === 'object' ? list : null;
    const title = String((column ? column.title : list) ?? '').trim();

    // Where in the flow this step sits. order is 0-based and sequential, so it
    // is the slot index directly.
    if (column && Number.isFinite(Number(column.order))) {
        const step = Math.trunc(Number(column.order));

        if (step >= 0) {
            return slots[step % slots.length];
        }
    }

    if (!title || title === 'N/A') {
        return UNNAMED[mode];
    }

    return slots[slotFor(title, slots.length)];
}

/** Both halves of the palette for one surface, for a component's computed. */
export function paletteFor(dark = false) {
    return dark
        ? { categorical: CATEGORICAL.dark, status: STATUS.dark }
        : { categorical: CATEGORICAL.light, status: STATUS.light };
}

/** Is the app currently on its dark surface? */
export function isDarkMode() {
    if (typeof document === 'undefined') {
        return false;
    }

    const root = document.querySelector('.layout-app');

    return !!root && root.classList.contains('dark');
}

/**
 * Call handler whenever the theme toggle flips, and once is not enough - a
 * chart picks its colours for the surface it is drawn on, so it has to hear
 * the change. Returns the function that stops watching.
 */
export function observeMode(handler) {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
        return () => {};
    }

    const root = document.querySelector('.layout-app');

    if (!root) {
        return () => {};
    }

    const observer = new MutationObserver(() => handler(isDarkMode()));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
}

/** A palette colour at partial opacity, for tints and shadows. */
export function hexToRgba(hex, alpha) {
    const clean = String(hex || '').replace('#', '');
    const full =
        clean.length === 3
            ? clean
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : clean;
    const num = parseInt(full, 16) || 0;

    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}
