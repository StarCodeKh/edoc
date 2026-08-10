<script setup>
import Layout from '@/Shared/Layout.vue'
import { Head, router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    settings: Array,
});

const flash = computed(() => usePage().props.flash);

// --- NEW: Computed properties to check the state of all toggles in a group ---
const allInAppEnabled = computed(() => props.settings.every(s => s.is_active));
const allEmailEnabled = computed(() => {
    // Only consider settings that *can* be emailed
    const emailableSettings = props.settings.filter(s => s.can_be_emailed);
    if (emailableSettings.length === 0) return false;
    return emailableSettings.every(s => s.email_is_active);
});

// The existing method to update a single setting remains the same
const updateSetting = (setting, field) => {
    router.patch(route('notification-settings.update', setting.id), {
        [field]: !setting[field],
    }, {
        preserveScroll: true,
    });
};

// --- NEW: Method to handle the master toggles ---
const toggleAll = (field, currentMasterState) => {
    const newState = !currentMasterState;
    props.settings.forEach(setting => {
        // Only update if the setting's state is different from the new desired state
        if (setting[field] !== newState) {
            // For email, only toggle settings that support it
            if (field === 'email_is_active' && !setting.can_be_emailed) {
                return;
            }
            // Note: This makes multiple requests. For a large number of settings,
            // a dedicated bulk update endpoint would be more performant.
            router.patch(route('notification-settings.update', setting.id), {
                [field]: newState
            }, {
                preserveState: true, // preserveState helps manage multiple rapid updates
                preserveScroll: true,
            });
        }
    });
};
</script>

<template>
    <Head title="Notification Settings" />

    <Layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Notification Settings
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                <!-- Flash Message -->
                <div v-if="flash.success" class="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                    <p>{{ flash.success }}</p>
                </div>

                <!-- In-App Notifications Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-medium leading-6 text-gray-900">In-App Notifications</h3>
                                <p class="mt-1 text-sm text-gray-500">Control real-time notifications that appear inside the application.</p>
                            </div>
                            <!-- Master Toggle for In-App -->
                            <button @click="toggleAll('is_active', allInAppEnabled)" type="button" :class="[allInAppEnabled ? 'bg-blue-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200']" role="switch">
                                <span :class="[allInAppEnabled ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition']"></span>
                            </button>
                        </div>
                    </div>
                    <ul class="divide-y divide-gray-200">
                        <li v-for="setting in settings" :key="setting.id + '-app'" class="flex justify-between items-center p-6 hover:bg-gray-50">
                            <div>
                                <p class="font-medium text-gray-900">{{ setting.name }}</p>
                                <p class="text-sm text-gray-500">{{ setting.description }}</p>
                            </div>
                            <button @click="updateSetting(setting, 'is_active')" type="button" :class="[setting.is_active ? 'bg-blue-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200']" role="switch">
                                <span :class="[setting.is_active ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition']"></span>
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Email Notifications Card -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-medium leading-6 text-gray-900">Email Notifications</h3>
                                <p class="mt-1 text-sm text-gray-500">Manage which notifications are sent to users' email inboxes.</p>
                            </div>
                            <!-- Master Toggle for Email -->
                            <button @click="toggleAll('email_is_active', allEmailEnabled)" type="button" :class="[allEmailEnabled ? 'bg-blue-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200']" role="switch">
                                <span :class="[allEmailEnabled ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition']"></span>
                            </button>
                        </div>
                    </div>
                    <ul class="divide-y divide-gray-200">
                        <li v-for="setting in settings" :key="setting.id + '-email'" class="flex justify-between items-center p-6 hover:bg-gray-50">
                            <div>
                                <p class="font-medium text-gray-900">{{ setting.name }}</p>
                                <p v-if="!setting.can_be_emailed" class="text-xs text-gray-400 italic mt-1">Email not available for this notification type.</p>
                            </div>
                            <!-- Individual Toggle for Email -->
                            <button @click="updateSetting(setting, 'email_is_active')" type="button" :disabled="!setting.can_be_emailed" :class="[setting.email_is_active ? 'bg-blue-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200', { 'opacity-50 cursor-not-allowed': !setting.can_be_emailed }]" role="switch">
                                <span :class="[setting.email_is_active ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition']"></span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </Layout>
</template>
