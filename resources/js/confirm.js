import { reactive } from 'vue';

/**
 * A promise-shaped window.confirm, so call sites keep reading like the native
 * one: `if (!(await this.$confirm({ message }))) return;`
 *
 * The dialog is <confirm-dialog />, mounted once in Layout.vue. Off-layout - an
 * auth screen - it falls back to window.confirm rather than never settling.
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
