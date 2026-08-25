<template>
    <button type="button" @click="show = true">
        <slot />
        <teleport v-if="show" to="#dropdown">
            <div>
                <div
                    :style="[
                        { position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, zIndex: 99998 },
                        dim ? { background: 'black', opacity: 0.2 } : { background: 'transparent' },
                    ]"
                    @click="show = false"
                />
                <div
                    ref="dropdown"
                    class="dd_container"
                    :class="className"
                    style="position: absolute; z-index: 99999"
                    @click.stop="show = !autoClose"
                >
                    <slot name="dropdown" />
                </div>
            </div>
        </teleport>
    </button>
</template>

<script>
import { createPopper } from '@popperjs/core';
import { router } from '@inertiajs/vue3';

export default {
    props: {
        className: String,
        placement: {
            type: String,
            default: 'bottom-end',
        },
        autoClose: {
            type: Boolean,
            default: true,
        },
        /**
         * Darken the page behind the panel. On by default so existing
         * dropdowns are unchanged; menus that should read as a plain
         * dropdown rather than a modal opt out.
         */
        dim: {
            type: Boolean,
            default: true,
        },
        /**
         * Gap in pixels between the trigger and the panel. Applied through
         * Popper rather than a CSS margin — a margin on the popper element
         * throws off its own measurements.
         */
        offset: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            show: false,
        };
    },
    watch: {
        show(show) {
            if (!show) {
                this.destroyPopper();
                return;
            }

            this.$nextTick(() => {
                // The panel can be gone again already if the menu was closed
                // in the same tick; creating a popper then would throw.
                if (!this.show || !this.$refs.dropdown) return;
                this.destroyPopper();
                this.popper = createPopper(this.$el, this.$refs.dropdown, {
                    placement: this.placement,
                    modifiers: [
                        {
                            name: 'offset',
                            options: { offset: [0, this.offset] },
                        },
                        {
                            name: 'preventOverflow',
                            options: {
                                altBoundary: true,
                            },
                        },
                    ],
                });
            });
        },
    },
    methods: {
        /**
         * Tear the popper down straight away. This used to be deferred by
         * 100ms, which let a stale instance strip the inline positioning off
         * a panel that had already been reopened — the panel then fell back
         * to the top-left corner of the page.
         */
        destroyPopper() {
            if (this.popper) {
                this.popper.destroy();
                this.popper = null;
            }
        },
        onKeydown(e) {
            if (e.key === 'Escape') {
                this.show = false;
            }
        },
    },
    mounted() {
        document.addEventListener('keydown', this.onKeydown);
        // The layout persists across Inertia visits, so without this a panel
        // left open during a navigation stays orphaned on the new page.
        this.stopNavigationListener = router.on('navigate', () => {
            this.show = false;
        });
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown);
        if (this.stopNavigationListener) this.stopNavigationListener();
        this.destroyPopper();
    },
};
</script>
