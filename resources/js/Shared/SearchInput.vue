<template>
    <div :class="['flex items-center gap-2', $attrs.class]">
        <div class="relative flex w-full">
            <icon
                name="search"
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
                class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-0 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                autocomplete="off"
                type="text"
                name="search"
                :placeholder="placeholder || $t('Search...')"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
            />
        </div>
        <!-- Only once there is something to reset. As a permanent label it
             wrapped onto two lines beside the box and read as part of it. -->
        <button
            v-if="!disableReset && modelValue"
            class="shrink-0 whitespace-nowrap text-sm text-gray-500 hover:text-gray-700 focus:text-indigo-500 dark:text-gray-400 dark:hover:text-gray-200"
            type="button"
            @click="$emit('reset')"
        >
            {{ $t('Reset') }}
        </button>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';

export default {
    inheritAttrs: false,
    components: { Icon },
    props: {
        modelValue: String,
        /** What this box searches, so the hint can say so per page. */
        placeholder: { type: String, default: '' },
        disableTrash: String,
        maxWidth: {
            type: Number,
            default: 300,
        },
        disableReset: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'reset'],
};
</script>
