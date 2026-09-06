/**
 * One place the whole app gets its data colours from.
 *
 * Five diverging palettes used to exist, each indexed by the row's position in
 * whatever list the screen held - so one document was green on the register and
 * blue on the dashboard. Two rules fix that:
 *
 *   1. One set of values, selected per surface rather than flipped. Both modes
 *      pass the data-viz validator as a set: adjacent CVD separation 9.1 light
 *      / 8.4 dark (target >= 8), normal-vision floor 19.6 / 19.3 (floor 15).
 *
 *   2. A status colour comes from board_lists.order - the step's place in the
 *      flow - not from the array index, so it survives filtering and partial
 *      views. A column with no order falls back to a hash of its name.
 *
 * Thirteen steps into eight slots means the ninth reuses the first. Deliberate:
 * colliding steps are always eight apart, never side by side, and every surface
 * prints the status name beside the colour anyway.
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
