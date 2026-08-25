<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
    watchableId: { type: Number, required: true },
    watchableType: { type: String, required: true }, // e.g., 'Task' or 'Project'
    isWatching: { type: Boolean, default: false },
});

const isWatchingState = ref(props.isWatching);
const isLoading = ref(false);

const toggleWatch = () => {
    isLoading.value = true;
    axios
        .post(route('watch.toggle'), {
            watchable_id: props.watchableId,
            watchable_type: props.watchableType,
        })
        .then((response) => {
            isWatchingState.value = response.data.is_watching;
        })
        .catch((error) => {
            // Optionally show an error toast
            console.error('Failed to update watch status:', error);
        })
        .finally(() => {
            isLoading.value = false;
        });
};
</script>

<template>
    <button
        @click="toggleWatch"
        :disabled="isLoading"
        class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 text-sm font-medium text-gray-600"
    >
        <!-- Eye Icon -->
        <svg v-if="isWatchingState" class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
            />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
            />
        </svg>

        <!-- Text -->
        <span>{{ isWatchingState ? 'Watching' : 'Watch' }}</span>

        <!-- Loading Spinner -->
        <svg
            v-if="isLoading"
            class="animate-spin h-4 w-4 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    </button>
</template>
