<script setup>
import Layout from '@/Shared/Layout.vue';
import Pagination from '@/Shared/Pagination.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { computed } from 'vue'; // <-- Import computed

const props = defineProps({
    notifications: Object,
});

// A helper function to make timestamps user-friendly
const formatTimeAgo = (dateString) => { /* ... same as before ... */ };

// Function to trigger the 'mark all as read' route
const markAllAsRead = () => {
    router.post(route('notifications.markAllAsRead'), {}, {
        preserveScroll: true,
    });
};

// --- NEW COMPUTED PROPERTY TO GROUP NOTIFICATIONS ---
const groupedNotifications = computed(() => {
    return props.notifications.data.reduce((acc, notification) => {
        // Group by a human-readable date, e.g., "Today", "Yesterday", "October 15, 2023"
        const date = new Date(notification.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey;
        if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
        } else {
            groupKey = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(notification);
        return acc;
    }, {});
});
</script>

<template>
    <Head title="My Notifications" />

    <Layout>
        <!-- Page Header -->
        <div class="p-4 sm:p-6 md:p-8 bg-white border-b">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        A log of all important activity from the last 30 days.
                    </p>
                </div>
                <button @click="markAllAsRead" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0">
                    Mark All as Read
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <!-- Loop through the Date Groups -->
                <div v-for="(group, date) in groupedNotifications" :key="date" class="mb-8">
                    <!-- Date Header -->
                    <div class="px-4 sm:px-0">
                        <h2 class="text-lg font-semibold text-gray-700">{{ date }}</h2>
                        <hr class="mt-2 mb-4">
                    </div>

                    <!-- Notification List for this Group -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <ul class="divide-y divide-gray-200">
                            <li v-for="notification in group" :key="notification.id">
                                <Link :href="notification.data.url" class="block p-4 sm:p-5 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div class="flex items-start space-x-4">
                                        <!-- User Photo / Fallback -->
                                        <div class="flex-shrink-0">
                                            <img v-if="notification.data.action_user_photo" class="h-10 w-10 rounded-full object-cover" :src="notification.data.action_user_photo" :alt="notification.data.action_user_name">
                                            <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                                                {{ notification.data.action_user_name?.charAt(0) }}
                                            </div>
                                        </div>

                                        <!-- Main Content -->
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-start">
                                                <!-- Notification Text -->
                                                <p class="text-sm text-gray-800 leading-snug">
                                                    <strong class="font-medium">{{ notification.data.action_user_name }}</strong>
                                                    {{ notification.data.message }}
                                                </p>
                                                <!-- Unread Indicator -->
                                                <span v-if="!notification.read_at" class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0" title="Unread"></span>
                                            </div>

                                            <!-- Context Block -->
                                            <div class="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 space-y-1">
                                                <div class="flex items-center">
                                                    <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                    <span>Task: <strong class="font-medium text-gray-800">{{ notification.data.task_title }}</strong></span>
                                                </div>
                                                <div class="flex items-center">
                                                    <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path></svg>
                                                    <span>Project: <strong class="font-medium text-gray-800">{{ notification.data.project_name }}</strong></span>
                                                </div>

                                                <div class="flex items-center">
                                                    <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    <span>Workspace: <strong class="font-medium text-gray-800">{{ notification.data.workspace_name }}</strong></span>
                                                </div>
                                            </div>

                                            <!-- Timestamp -->
                                            <p class="text-xs text-gray-500 mt-2">
                                                {{ formatTimeAgo(notification.created_at) }}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Empty State for the entire page -->
                <div v-if="notifications.data.length === 0" class="text-center py-16">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No Notifications</h3>
                    <p class="mt-1 text-sm text-gray-500">You have no new activity from the last 30 days.</p>
                </div>

                <!-- Pagination Links -->
                <Pagination v-if="notifications.data.length > 0" :links="notifications.links" class="mt-8" />
            </div>
        </div>
    </Layout>
</template>
