<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePage, router, Link } from '@inertiajs/vue3';
import axios from 'axios';
import Icon from '@/Shared/Icon.vue'

const isOpen = ref(false);
const isMenuOpen = ref(false);

const page = usePage();
const notifications = ref(page.props.auth.notifications || []);
const unreadCount = ref(page.props.auth.unread_count || 0);
const user = computed(() => page.props.auth.user);

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 2) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const handleNotificationClick = (notification) => {
    isOpen.value = false;
    const task_url = notification.data.url;

    if (!notification.read_at) {
        const index = notifications.value.findIndex(n => n.id === notification.id);
        if (index !== -1) {
            notifications.value[index].read_at = new Date().toISOString();
        }
        if (unreadCount.value > 0) {
            unreadCount.value--;
        }

        axios.patch(route('notifications.update', notification.id))
            .then(() => {
                router.visit(task_url);
            })
            .catch((e) => {
                if (index !== -1) {
                    notifications.value[index].read_at = null;
                }
                unreadCount.value++;
            });
    } else {
        router.visit(task_url);
    }
};

const markAllAsRead = () => {
    if (unreadCount.value > 0) {
        notifications.value.forEach(n => { n.read_at = new Date().toISOString(); });
        unreadCount.value = 0;
    }

    isMenuOpen.value = false;
    isOpen.value = false;

    router.post(route('notifications.markAllAsRead'), {}, {
        preserveScroll: true,
    });
};

const closeAll = () => {
    isMenuOpen.value = false;
    isOpen.value = false;
};

onMounted(() => {
    if (user.value) {
        const channel = `App.Models.User.${user.value.id}`;
        window.Echo.private(channel)
            .notification((notification) => {
                notifications.value.unshift(notification);

                if (notifications.value.length > 10) {
                    notifications.value.pop();
                }

                unreadCount.value++;
            });
    }
});

onUnmounted(() => {
    if (user.value) {
        window.Echo.leave(`App.Models.User.${user.value.id}`);
    }
});

const closeOnEscape = (e) => {
    if (isOpen.value && e.key === 'Escape') {
        isOpen.value = false;
    }
};
onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));
</script>

<template>
    <div class="relative">
        <!-- The Bell Icon Button -->
        <button @click="isOpen = !isOpen" class="relative text-white opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1">
            <!-- Bell SVG Icon -->
            <Icon name="notification" class="h-6 w-6 bell__icon" />
            <!-- Unread Badge with Animation -->
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 dark:bg-gray-600 items-center justify-center text-xs text-white dark:text-white">{{ unreadCount }}</span>
            </span>
        </button>

        <!-- Main Dropdown Panel -->
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
            <div v-show="isOpen" @click.away="isOpen = false" class="absolute top-5 right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-md shadow-lg bg-gray-100 dark:bg-gray-800 ring-1 ring-black dark:ring-white ring-opacity-5 z-50">
                <!-- Dropdown Header with 3-Dot Menu -->
                <div class="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="font-semibold text-gray-700 dark:text-white">Notifications</h3>

                    <!-- 3-Dot Menu Button and its own dropdown -->
                    <div class="relative">
                        <button @click.stop="isMenuOpen = !isMenuOpen" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400">
                            <svg class="h-5 w-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                            <div v-if="isMenuOpen" @click.away="isMenuOpen = false" class="absolute right-0 mt-1 w-48 origin-top-right rounded-md shadow-lg bg-gray-100 dark:bg-gray-800 ring-1 ring-black dark:ring-white ring-opacity-5 z-10">
                                <div class="py-1">
                                    <button @click="markAllAsRead" class="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Mark all as read
                                    </button>
                                    <Link :href="route('notifications.index')" @click="closeAll" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        All Notifications
                                    </Link>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>

                <div v-if="notifications.length > 0" class="max-h-96 overflow-y-auto">
                    <Link v-for="n in notifications" :key="n.id || n.task_id" :href="n.data?.url || '#'" @click.prevent="handleNotificationClick(n)"
                          :class="['block w-full text-left p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700', { 'bg-sky-50 dark:bg-gray-700': !n.read_at }]">
                        <div class="flex items-start space-x-3">
                            <!-- User Photo -->
                            <div class="flex-shrink-0">
                                <img v-if="n.data?.action_user_photo" class="h-8 w-8 rounded-full object-cover" :src="n.data.action_user_photo" :alt="n.data?.action_user_name">
                                <!-- Fallback Icon -->
                                <div v-else class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-white font-bold">
                                    {{ n.data?.action_user_name?.charAt(0) }}
                                </div>
                            </div>

                            <!-- Notification Text Content -->
                            <div class="flex-1 min-w-0">
                                <!-- CONSTRUCT THE FULL SENTENCE HERE -->
                                <p class="text-sm text-gray-800 dark:text-gray-300 leading-snug">
                                    <strong class="font-medium dark:text-white">{{ n.data?.action_user_name }}</strong>
                                    {{ n.data?.message }} on task
                                    <strong class="font-medium text-blue-600 dark:text-blue-400">“{{ n.data?.task_title }}”</strong>
                                    in project
                                    <strong class="font-medium dark:text-white">“{{ n.data?.project_name }}”</strong>
                                    under workspace
                                    <strong class="font-medium dark:text-white">“{{ n.data?.workspace_name }}”</strong>.
                                </p>

                                <!-- Timestamp (This part remains the same) -->
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    <span>{{ formatTimeAgo(n.created_at) }}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link :href="route('notifications.index')" @click="closeAll" class="flex text-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        All Notifications
                    </Link>
                </div>
                <div v-else class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    You're all caught up!
                </div>
            </div>
        </transition>
    </div>
</template>
