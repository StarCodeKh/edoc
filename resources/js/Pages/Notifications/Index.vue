<script setup>
import Layout from '@/Shared/Layout.vue';
import Pagination from '@/Shared/Pagination.vue';
import Icon from '@/Shared/Icon.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import moment from 'moment';
import { trans } from 'laravel-vue-i18n';

const props = defineProps({
    notifications: Object,
});

/**
 * "2 hours ago". Grouped by day already, so a relative time is the useful half
 * and the exact stamp goes in the title attribute for anyone who needs it.
 */
const timeAgo = (value) => (value ? moment(value).fromNow() : '');
const timeExact = (value) => (value ? moment(value).format('DD MMM YYYY, HH:mm') : '');

const hasUnread = computed(() => props.notifications.data.some((notification) => !notification.read_at));

const markAllAsRead = () => {
    router.post(route('notifications.markAllAsRead'), {}, { preserveScroll: true });
};

/**
 * One section per day, newest first.
 *
 * The label is translated rather than built from toLocaleDateString('en-US'),
 * which printed "October 15, 2023" over a Khmer page. Older days use the same
 * DD MMM YYYY the rest of the app writes dates in.
 */
const groupedNotifications = computed(() => {
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    const groups = new Map();

    for (const notification of props.notifications.data) {
        const day = moment(notification.created_at).startOf('day');

        let label;
        if (day.isSame(today)) {
            label = trans('Today');
        } else if (day.isSame(yesterday)) {
            label = trans('Yesterday');
        } else {
            label = day.format('DD MMM YYYY');
        }

        if (!groups.has(label)) groups.set(label, []);
        groups.get(label).push(notification);
    }

    return groups;
});
</script>

<template>
    <Layout>
        <!-- The page paints its own ground. Without it the board background
             behind the Layout showed through, which put a purple gradient
             under a white notification list. -->
        <div
            class="min-h-screen bg-gradient-to-br from-gray-50 dark:from-white/5 via-white dark:via-white/5 to-gray-100 dark:to-white/10"
        >
            <Head :title="$t('Notifications')" />

            <div class="bg-white dark:bg-[#262932] border-b border-gray-200/60 dark:border-white/10 shadow-sm">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="py-5 sm:py-8 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div
                                class="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex-shrink-0"
                            >
                                <icon name="notification" class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div class="min-w-0">
                                <h1
                                    class="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight"
                                >
                                    {{ $t('Notifications') }}
                                </h1>
                                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                                    {{ $t('A log of all important activity from the last 30 days.') }}
                                </p>
                            </div>
                        </div>

                        <!-- Nothing unread means nothing for it to do, so it goes
                             rather than sitting there as a button that does nothing. -->
                        <button
                            v-if="hasUnread"
                            type="button"
                            class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#262932]"
                            @click="markAllAsRead"
                        >
                            <icon name="tick_check" class="h-4 w-4" />
                            <span class="hidden sm:inline">{{ $t('Mark All as Read') }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                <div v-for="[label, group] in groupedNotifications" :key="label" class="mb-6 sm:mb-8">
                    <div class="mb-2 flex items-baseline gap-2">
                        <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {{ label }}
                        </h2>
                        <span class="text-xs text-gray-400 dark:text-gray-500">{{ group.length }}</span>
                    </div>

                    <div
                        class="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#262932] shadow-sm"
                    >
                        <ul class="divide-y divide-gray-100 dark:divide-white/5">
                            <li v-for="notification in group" :key="notification.id">
                                <Link
                                    :href="notification.data.url"
                                    class="flex gap-3 border-l-2 px-4 py-3 sm:px-5 transition-colors"
                                    :class="
                                        notification.read_at
                                            ? 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                            : 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-500/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/15'
                                    "
                                >
                                    <img
                                        v-if="notification.data.action_user_photo"
                                        class="h-9 w-9 shrink-0 rounded-full object-cover"
                                        :src="notification.data.action_user_photo"
                                        :alt="notification.data.action_user_name"
                                    />
                                    <div
                                        v-else
                                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300"
                                    >
                                        {{ notification.data.action_user_name?.charAt(0) }}
                                    </div>

                                    <div class="min-w-0 flex-1">
                                        <p class="text-sm leading-snug text-gray-800 dark:text-gray-100">
                                            <strong class="font-semibold">{{
                                                notification.data.action_user_name
                                            }}</strong>
                                            {{ $t(notification.data.message) }}
                                        </p>

                                        <!-- One line of context, not a bordered panel
                                             repeating three labelled rows per item. The
                                             icons carry what the words "Task:" and
                                             "Project:" were spending a line each on. -->
                                        <div
                                            class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400"
                                        >
                                            <span
                                                v-if="notification.data.task_title"
                                                class="inline-flex min-w-0 items-center gap-1"
                                                :title="$t('Task')"
                                            >
                                                <icon name="checklist_box" class="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                <span class="truncate">{{ notification.data.task_title }}</span>
                                            </span>
                                            <span
                                                v-if="notification.data.project_name"
                                                class="inline-flex min-w-0 items-center gap-1"
                                                :title="$t('Project')"
                                            >
                                                <icon name="project" class="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                <span class="truncate">{{ notification.data.project_name }}</span>
                                            </span>
                                            <span
                                                v-if="notification.data.workspace_name"
                                                class="inline-flex min-w-0 items-center gap-1"
                                                :title="$t('Workspace')"
                                            >
                                                <icon name="workspace" class="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                <span class="truncate">{{ notification.data.workspace_name }}</span>
                                            </span>
                                            <span
                                                class="text-gray-400 dark:text-gray-500"
                                                :title="timeExact(notification.created_at)"
                                            >
                                                {{ timeAgo(notification.created_at) }}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        v-if="!notification.read_at"
                                        class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500"
                                        :title="$t('Unread')"
                                    ></span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    v-if="!notifications.data.length"
                    class="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 py-16 text-center"
                >
                    <icon name="notification" class="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ $t('No Notifications') }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ $t('You have no new activity from the last 30 days.') }}
                    </p>
                </div>

                <Pagination v-if="notifications.data.length" :links="notifications.links" class="mt-8" />
            </div>
        </div>
    </Layout>
</template>
