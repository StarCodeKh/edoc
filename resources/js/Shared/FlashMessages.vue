<template>
    <teleport to="body">
        <div class="alert-stack" aria-live="polite" aria-atomic="true">
            <transition name="alert">
                <div v-if="visible" class="alert" :class="'alert--' + kind" role="alert">
                    <span class="alert__icon">
                        <svg v-if="kind === 'success'" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 8v5m0 3.5h.01"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                            />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </span>

                    <div class="alert__body">
                        <p v-if="messages.length === 1" class="alert__message">{{ messages[0] }}</p>
                        <template v-else>
                            <p class="alert__title">
                                {{ $t('There are {count} form errors.').replace('{count}', messages.length) }}
                            </p>
                            <ul class="alert__list">
                                <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
                            </ul>
                        </template>
                    </div>

                    <button type="button" class="alert__close" @click="dismiss" :aria-label="$t('Dismiss')">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                            />
                        </svg>
                    </button>

                    <span class="alert__bar" :style="{ animationDuration: duration + 'ms' }"></span>
                </div>
            </transition>
        </div>
    </teleport>
</template>

<script>
export default {
    data() {
        return {
            show: true,
            timer: null,
        };
    },
    computed: {
        flash() {
            return this.$page.props.flash || {};
        },
        errors() {
            return this.$page.props.errors || {};
        },
        kind() {
            return this.flash.success && !this.flash.error ? 'success' : 'error';
        },
        // Flash message first, then any validation errors handed back by Laravel.
        messages() {
            if (this.flash.success && !this.flash.error) return [this.flash.success];
            if (this.flash.error) return [this.flash.error];
            return Object.values(this.errors);
        },
        visible() {
            return this.show && this.messages.length > 0;
        },
        // Give people longer to read a list of validation errors.
        duration() {
            return this.kind === 'success' ? 4000 : Math.min(6000 + this.messages.length * 1000, 12000);
        },
    },
    watch: {
        '$page.props.flash': {
            handler() {
                this.reset();
            },
            deep: true,
        },
        '$page.props.errors': {
            handler() {
                this.reset();
            },
            deep: true,
        },
    },
    methods: {
        reset() {
            this.show = true;
            clearTimeout(this.timer);
            if (this.messages.length) {
                this.timer = setTimeout(() => {
                    this.show = false;
                }, this.duration);
            }
        },
        dismiss() {
            clearTimeout(this.timer);
            this.show = false;
        },
    },
    mounted() {
        this.reset();
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
};
</script>

<style scoped>
/* Same visual language as the in-app toasts (see TaskDetails.vue):
       a light surface, a tinted icon badge, and a countdown bar. */
.alert-stack {
    position: fixed;
    top: max(16px, env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
    z-index: 100000;
    width: 420px;
    max-width: calc(100vw - 24px);
    pointer-events: none;
}

.alert {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow:
        0 12px 32px -8px rgba(15, 23, 42, 0.25),
        0 2px 6px rgba(15, 23, 42, 0.06);
    overflow: hidden;
    pointer-events: auto;
}

/* Accent hairline down the leading edge. */
.alert::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: currentColor;
}
.alert--success {
    color: #16a34a;
}
.alert--error {
    color: #dc2626;
}

.alert__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: currentColor;
    color: #ffffff;
}
.alert--success .alert__icon {
    background: #16a34a;
}
.alert--error .alert__icon {
    background: #dc2626;
}
.alert__icon svg {
    width: 15px;
    height: 15px;
}

.alert__body {
    flex: 1;
    min-width: 0;
    padding-top: 2px;
}

.alert__message,
.alert__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: #0f172a;
    word-break: break-word;
}

.alert__list {
    margin: 6px 0 0;
    padding-left: 16px;
    list-style: disc;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    color: #475569;
    max-height: 30vh;
    overflow-y: auto;
}

.alert__close {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition:
        color 0.15s ease,
        background 0.15s ease;
}
.alert__close svg {
    width: 100%;
    height: 100%;
}
.alert__close:hover {
    color: #0f172a;
    background: rgba(100, 116, 139, 0.12);
}

.alert__bar {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: currentColor;
    opacity: 0.3;
    transform-origin: left;
    animation-name: alert-countdown;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

@keyframes alert-countdown {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}

/* Dark theme follows the app's `.dark` class, not the OS setting. */
:global(.dark) .alert {
    background: #1e293b;
    border-color: rgba(148, 163, 184, 0.16);
    box-shadow:
        0 12px 32px -8px rgba(0, 0, 0, 0.6),
        0 2px 6px rgba(0, 0, 0, 0.35);
}
:global(.dark) .alert__message,
:global(.dark) .alert__title {
    color: #f1f5f9;
}
:global(.dark) .alert__list {
    color: #cbd5e1;
}
:global(.dark) .alert__close:hover {
    color: #e2e8f0;
    background: rgba(148, 163, 184, 0.16);
}

.alert-enter-active {
    transition:
        opacity 0.25s ease,
        transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.alert-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease-in;
}
.alert-enter-from,
.alert-leave-to {
    opacity: 0;
    transform: translateY(-14px) scale(0.97);
}

/* Phones: dock to the bottom, clear of the thumb zone and the notch. */
@media (max-width: 640px) {
    .alert-stack {
        top: auto;
        bottom: max(16px, env(safe-area-inset-bottom));
        width: auto;
        left: 12px;
        right: 12px;
        transform: none;
        max-width: none;
    }
    .alert {
        padding: 12px 14px;
        border-radius: 12px;
    }
    .alert__message,
    .alert__title {
        font-size: 13.5px;
    }
    .alert-enter-from,
    .alert-leave-to {
        transform: translateY(14px) scale(0.97);
    }
}

@media (prefers-reduced-motion: reduce) {
    .alert-enter-active,
    .alert-leave-active {
        transition: opacity 0.15s ease;
    }
    .alert-enter-from,
    .alert-leave-to {
        transform: none;
    }
    .alert__bar {
        animation: none;
    }
}
</style>
