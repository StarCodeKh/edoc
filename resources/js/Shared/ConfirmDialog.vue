<template>
    <Teleport to="body">
        <transition name="confirm-fade">
            <div
                v-if="state.open"
                class="fixed inset-0 z-[10050] flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
                @click.self="answer(false)"
            >
                <div
                    ref="card"
                    role="alertdialog"
                    aria-modal="true"
                    :aria-label="title"
                    class="confirm-dialog__card w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-2xl dark:border-white/10 dark:bg-[#262932]"
                >
                    <div class="flex gap-3 p-5">
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            :class="
                                isDanger
                                    ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                            "
                        >
                            <icon :name="isDanger ? 'trash' : 'info'" class="h-5 w-5" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h2>
                            <p
                                v-if="state.message"
                                class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                            >
                                {{ state.message }}
                            </p>
                        </div>
                    </div>

                    <div
                        class="flex flex-col-reverse gap-2 border-t border-gray-200/60 px-5 py-3 sm:flex-row sm:justify-end dark:border-white/10"
                    >
                        <button
                            type="button"
                            class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                            @click="answer(false)"
                        >
                            {{ state.cancelLabel || $t('Cancel') }}
                        </button>
                        <button
                            ref="confirm"
                            type="button"
                            class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors"
                            :class="
                                isDanger
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                            "
                            @click="answer(true)"
                        >
                            {{ state.confirmLabel || $t('OK') }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import { confirmState, settleConfirmation } from '@/confirm';

/**
 * The one dialog behind $confirm(). Mounted once, in Layout.vue - the state it
 * reads lives in confirm.js, so any component can ask without wiring props or
 * events through the page it happens to be on.
 */
export default {
    name: 'confirm-dialog',
    components: { Icon },
    data() {
        return { state: confirmState };
    },
    computed: {
        isDanger() {
            return this.state.tone !== 'default';
        },
        title() {
            return this.state.title || this.$t('Are you sure?');
        },
    },
    watch: {
        'state.open'(open) {
            if (!open) return;
            // Enter confirms, so the button has to be what is focused.
            this.$nextTick(() => this.$refs.confirm && this.$refs.confirm.focus());
        },
    },
    methods: {
        answer(value) {
            settleConfirmation(value);
        },
        onKeydown(e) {
            if (!this.state.open) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                this.answer(false);
            }
        },
    },
    mounted() {
        // Tells confirm.js there is a dialog to show; without one it falls back
        // to the browser's own.
        confirmState.mounted = true;
        document.addEventListener('keydown', this.onKeydown);
    },
    beforeUnmount() {
        confirmState.mounted = false;
        document.removeEventListener('keydown', this.onKeydown);
        // Nobody left to answer: release whoever is waiting.
        settleConfirmation(false);
    },
};
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
    transition: opacity 120ms ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
    opacity: 0;
}

.confirm-dialog__card {
    animation: confirm-pop 140ms ease-out;
}

@keyframes confirm-pop {
    from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
