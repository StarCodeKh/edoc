<template>
    <div class="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
                v-if="icon"
                class="flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 sm:p-3"
            >
                <icon :name="icon" class="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div class="min-w-0">
                <div class="flex items-baseline gap-2">
                    <h1 class="truncate text-xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                        {{ title }}
                    </h1>
                    <!-- The count belongs beside the name, not in a stat card of
                         its own: it is one number about the thing on screen. -->
                    <span
                        v-if="count !== null"
                        class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-300"
                    >
                        {{ count }}
                    </span>
                </div>
                <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
            </div>
        </div>

        <div v-if="$slots.actions" class="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <slot name="actions" />
        </div>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';

/**
 * The band at the top of a settings page: what this page is, how many of them
 * there are, and the one or two things you can do here.
 *
 * Written once because every admin list had its own arrangement of the same
 * three parts, and they had drifted apart.
 */
export default {
    components: { Icon },
    props: {
        title: { type: String, required: true },
        subtitle: { type: String, default: '' },
        icon: { type: String, default: '' },
        /** Shown as a pill beside the title. Null hides it; 0 is a real answer. */
        count: { type: [Number, String], default: null },
    },
};
</script>
