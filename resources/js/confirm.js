import { reactive } from 'vue';

/**
 * A promise-shaped replacement for window.confirm, so a call site keeps
 * reading like the native one it replaces:
 *
 *     if (!(await this.$confirm({ message: this.$t('Delete this?') }))) return;
 *
 * The dialog itself is <confirm-dialog />, mounted once in Layout.vue. If it is
 * not on the page - an auth screen, say - this falls back to window.confirm
 * rather than returning a promise that never settles.
 */
export const confirmState = reactive({
    mounted: false,
    open: false,
    title: '',
    message: '',
    confirmLabel: '',
    cancelLabel: '',
    tone: 'danger',
    resolve: null,
});

export function askConfirmation(options = {}) {
    const opts = typeof options === 'string' ? { message: options } : options;

    if (!confirmState.mounted) {
        return Promise.resolve(window.confirm(opts.message || ''));
    }

    // A second ask while one is open answers the first with "no" rather than
    // stranding whoever is waiting on it.
    settleConfirmation(false);

    confirmState.title = opts.title || '';
    confirmState.message = opts.message || '';
    confirmState.confirmLabel = opts.confirmLabel || '';
    confirmState.cancelLabel = opts.cancelLabel || '';
    confirmState.tone = opts.tone || 'danger';
    confirmState.open = true;

    return new Promise((resolve) => {
        confirmState.resolve = resolve;
    });
}

export function settleConfirmation(answer) {
    const resolve = confirmState.resolve;

    confirmState.open = false;
    confirmState.resolve = null;

    if (resolve) resolve(!!answer);
}

export default {
    install(app) {
        app.config.globalProperties.$confirm = askConfirmation;
    },
};
