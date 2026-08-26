<template>
    <div class="h-full">
        <Head :title="$t(title)" />

        <div class="flex h-full flex-col">
            <board-view-menu
                :project="project"
                @filter-toggle="open_filter = !open_filter"
                @fClear="reset()"
                :filters="filters"
                view="time_logs"
            />
            <board-filter
                :project="project"
                @board-filter="open_filter = false"
                :filters="filters"
                v-if="open_filter"
                @do-filter="doFilter"
                options="user"
            />

            <div class="flex-1 overflow-hidden p-3 sm:p-4">
                <div
                    class="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-xl dark:border-white/10 dark:bg-[#262932]"
                >
                    <!-- One wrapping row: identity, the two numbers, then the
                         controls. Nothing here is pinned to a width that a
                         phone does not have. -->
                    <div
                        class="flex flex-wrap items-center gap-3 border-b border-gray-200/60 px-4 py-4 sm:gap-4 sm:px-5 dark:border-white/10"
                    >
                        <div class="flex min-w-0 items-center gap-3">
                            <span
                                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                            >
                                <icon name="clock" class="h-5 w-5 text-white" />
                            </span>
                            <div class="min-w-0">
                                <h2 class="truncate text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                                    {{ $t('Time Logs') }}
                                </h2>
                                <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {{ $t('Track and manage time spent on tasks') }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 sm:gap-3">
                            <div
                                class="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-500/15"
                            >
                                <icon name="clock" class="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
                                <div class="leading-tight">
                                    <p class="text-[10px] font-semibold uppercase text-indigo-500 dark:text-indigo-300">
                                        {{ $t('Total Duration') }}
                                    </p>
                                    <p class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                                        {{ formatDuration(total_duration || 0) }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-white/10">
                                <icon name="list" class="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-300" />
                                <div class="leading-tight">
                                    <p class="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        {{ $t('Total Logs') }}
                                    </p>
                                    <p class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                                        {{ total_logs }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex w-full basis-full items-center gap-2 sm:w-auto sm:flex-1 sm:basis-auto sm:justify-end sm:gap-3"
                        >
                            <div class="relative min-w-0 flex-1 sm:max-w-xs">
                                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <icon name="search" class="h-4 w-4 text-gray-400" />
                                </span>
                                <input
                                    v-model="form.search"
                                    type="text"
                                    autocomplete="off"
                                    :placeholder="$t('Search time logs...')"
                                    class="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-sm transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                                <button
                                    v-if="form.search"
                                    type="button"
                                    @click="reset"
                                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    :aria-label="$t('Reset')"
                                >
                                    <icon name="close" class="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                @click="open_filter = !open_filter"
                                class="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200/60 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                            >
                                <icon name="filter" class="h-4 w-4" />
                                <span class="hidden sm:inline">{{ $t('Filter') }}</span>
                            </button>

                            <button
                                @click="exportCsv"
                                :disabled="!time_logs.data.length"
                                class="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <icon name="download" class="h-4 w-4" />
                                <span class="hidden sm:inline">{{ $t('Export') }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto">
                        <!-- One empty state, not one per layout. -->
                        <div
                            v-if="!time_logs.data.length"
                            class="flex h-full min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center"
                        >
                            <span
                                class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/10"
                            >
                                <icon name="clock" class="h-7 w-7 text-gray-400" />
                            </span>
                            <h3 class="text-base font-bold text-gray-900 dark:text-white">
                                {{ $t('No time logs found') }}
                            </h3>
                            <p class="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                                {{ $t('Start tracking time on your tasks to see logs here.') }}
                            </p>
                        </div>

                        <template v-else>
                            <!-- The table is for screens with room for six
                                 columns; below that the same rows are cards.
                                 Only one of the two is ever rendered. -->
                            <div class="hidden lg:block">
                                <table class="min-w-full">
                                    <thead
                                        class="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm dark:bg-[#2f333e]/95"
                                    >
                                        <tr
                                            class="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                        >
                                            <th class="px-5 py-3 font-semibold">{{ $t('Task') }}</th>
                                            <th class="px-5 py-3 font-semibold">{{ $t('Member') }}</th>
                                            <th class="px-5 py-3 font-semibold">{{ $t('Started') }}</th>
                                            <th class="px-5 py-3 font-semibold">{{ $t('Stopped') }}</th>
                                            <th class="px-5 py-3 font-semibold">{{ $t('Duration') }}</th>
                                            <th class="px-5 py-3 font-semibold">{{ $t('Memo') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200/60 dark:divide-white/10">
                                        <tr
                                            v-for="log in time_logs.data"
                                            :key="log.id"
                                            class="group transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                                        >
                                            <td class="px-5 py-3">
                                                <button
                                                    @click="openTask(log.task)"
                                                    class="flex max-w-xs items-center gap-1.5 text-left text-sm font-medium text-gray-900 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-300"
                                                >
                                                    <span class="truncate" :title="log.task && log.task.title">{{
                                                        log.task && log.task.title
                                                    }}</span>
                                                    <icon
                                                        name="link_external"
                                                        class="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                    />
                                                </button>
                                            </td>

                                            <td class="px-5 py-3">
                                                <div class="flex items-center gap-2">
                                                    <img
                                                        class="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                                                        :src="(log.user && log.user.photo_path) || '/images/user.svg'"
                                                        :alt="log.user && log.user.name"
                                                    />
                                                    <span
                                                        class="max-w-[160px] truncate text-sm text-gray-900 dark:text-gray-100"
                                                        :title="log.user && log.user.name"
                                                        >{{ log.user && log.user.name }}</span
                                                    >
                                                </div>
                                            </td>

                                            <td class="px-5 py-3 text-sm">
                                                <div class="text-gray-900 dark:text-gray-100">
                                                    {{ moment(log.started_at).format('MMM D, YYYY') }}
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{ moment(log.started_at).format('h:mm a') }}
                                                </div>
                                            </td>

                                            <td class="px-5 py-3 text-sm">
                                                <template v-if="log.stopped_at">
                                                    <div class="text-gray-900 dark:text-gray-100">
                                                        {{ moment(log.stopped_at).format('MMM D, YYYY') }}
                                                    </div>
                                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                                        {{ moment(log.stopped_at).format('h:mm a') }}
                                                    </div>
                                                </template>
                                                <!-- A timer that is still running has no stop time,
                                                     which used to render as "Invalid date". -->
                                                <span
                                                    v-else
                                                    class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                                >
                                                    <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    {{ $t('Running') }}
                                                </span>
                                            </td>

                                            <td class="px-5 py-3">
                                                <span
                                                    class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold tabular-nums text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
                                                >
                                                    <icon name="clock" class="h-3 w-3" />
                                                    {{ formatDuration(log.duration) }}
                                                </span>
                                            </td>

                                            <td class="px-5 py-3">
                                                <p
                                                    v-if="log.title"
                                                    class="max-w-xs truncate text-sm text-gray-900 dark:text-gray-100"
                                                    :title="log.title"
                                                >
                                                    {{ log.title }}
                                                </p>
                                                <p v-else class="text-sm italic text-gray-400">{{ $t('No memo') }}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="space-y-3 p-3 lg:hidden">
                                <div
                                    v-for="log in time_logs.data"
                                    :key="log.id"
                                    class="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                                >
                                    <div class="flex items-start justify-between gap-3">
                                        <button
                                            @click="openTask(log.task)"
                                            class="min-w-0 flex-1 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                                        >
                                            <span class="line-clamp-2">{{ log.task && log.task.title }}</span>
                                        </button>
                                        <span
                                            class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold tabular-nums text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
                                        >
                                            <icon name="clock" class="h-3 w-3" />
                                            {{ formatDuration(log.duration) }}
                                        </span>
                                    </div>

                                    <div class="mt-3 flex items-center gap-2">
                                        <img
                                            class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                                            :src="(log.user && log.user.photo_path) || '/images/user.svg'"
                                            :alt="log.user && log.user.name"
                                        />
                                        <span class="truncate text-sm text-gray-700 dark:text-gray-200">{{
                                            log.user && log.user.name
                                        }}</span>
                                    </div>

                                    <div class="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <p class="text-[10px] font-semibold uppercase text-gray-400">
                                                {{ $t('Started') }}
                                            </p>
                                            <p class="text-sm text-gray-900 dark:text-gray-100">
                                                {{ moment(log.started_at).format('MMM D, h:mm a') }}
                                            </p>
                                        </div>
                                        <div>
                                            <p class="text-[10px] font-semibold uppercase text-gray-400">
                                                {{ $t('Stopped') }}
                                            </p>
                                            <p class="text-sm text-gray-900 dark:text-gray-100">
                                                {{
                                                    log.stopped_at
                                                        ? moment(log.stopped_at).format('MMM D, h:mm a')
                                                        : $t('Running')
                                                }}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        v-if="log.title"
                                        class="mt-3 border-t border-gray-100 pt-3 dark:border-white/10"
                                    >
                                        <p class="text-[10px] font-semibold uppercase text-gray-400">
                                            {{ $t('Memo') }}
                                        </p>
                                        <p class="text-sm text-gray-900 dark:text-gray-100">{{ log.title }}</p>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div
                        v-if="time_logs.data.length"
                        class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/60 px-4 py-3 sm:px-5 dark:border-white/10"
                    >
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{
                                $t('Showing :from to :to of :total', {
                                    from: time_logs.from || 0,
                                    to: time_logs.to || 0,
                                    total: total_logs,
                                })
                            }}
                        </p>
                        <pagination :links="time_logs.links" />
                    </div>
                </div>
            </div>
        </div>

        <task-details
            v-if="taskDetailsOpen"
            :id="selected_task?.id"
            view="timeline"
            :isPopup="true"
            @closeModal="closeDetails()"
        />
    </div>
</template>

<script>
import { Head, Link } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import Icon from '@/Shared/Icon.vue';
import pickBy from 'lodash/pickBy';
import Pagination from '@/Shared/Pagination.vue';
import mapValues from 'lodash/mapValues';
import throttle from 'lodash/throttle';
import BoardViewMenu from '@/Shared/BoardViewMenu.vue';
import moment from 'moment';
import BoardFilter from '@/Shared/BoardFilter.vue';
import TaskDetails from '@/Shared/Modals/TaskDetails.vue';

export default {
    components: {
        TaskDetails,
        BoardFilter,
        Head,
        Icon,
        Link,
        BoardViewMenu,
        Pagination,
    },
    layout: Layout,
    props: {
        title: String,
        auth: Object,
        project: Object,
        workspace: Object,
        time_logs: Object,
        total_duration: { required: false },
        filters: Object,
    },
    data() {
        return {
            open_filter: false,
            selected_task: null,
            taskDetailsOpen: false,
            form: {
                search: this.filters.search,
                user: this.filters.user,
                due: this.filters.due,
                label: this.filters.label,
            },
        };
    },
    computed: {
        total_logs() {
            return this.time_logs.total || this.time_logs.data.length;
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(
                    this.route('projects.view.time_logs', this.project.slug || this.project.id),
                    pickBy(this.form),
                    { preserveState: true }
                );
            }, 150),
        },
    },
    created() {
        this.moment = moment;
    },
    methods: {
        /**
         * Durations are stored in seconds (Timer writes diffInSeconds), so
         * that is what this reads. The table used to pass 'minutes' and
         * reported every log sixty times longer than it was.
         */
        formatDuration(duration) {
            const total = Math.max(0, Math.floor(Number(duration) || 0));
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            const seconds = total % 60;

            if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;

            return `${seconds}s`;
        },
        doFilter(form) {
            Object.assign(this.form, form);
        },
        openTask(task) {
            this.selected_task = task;
            this.taskDetailsOpen = true;
        },
        closeDetails() {
            this.selected_task = null;
            this.taskDetailsOpen = false;
        },
        reset() {
            this.form = mapValues(this.form, () => null);
        },

        /** The logs on screen, as a spreadsheet. */
        exportCsv() {
            if (!this.time_logs.data.length) return;

            const rows = [
                [
                    this.$t('Task'),
                    this.$t('Member'),
                    this.$t('Started'),
                    this.$t('Stopped'),
                    this.$t('Duration'),
                    this.$t('Memo'),
                ],
            ];

            this.time_logs.data.forEach((log) => {
                rows.push([
                    (log.task && log.task.title) || '',
                    (log.user && log.user.name) || '',
                    log.started_at ? moment(log.started_at).format('YYYY-MM-DD HH:mm') : '',
                    log.stopped_at ? moment(log.stopped_at).format('YYYY-MM-DD HH:mm') : '',
                    this.formatDuration(log.duration),
                    log.title || '',
                ]);
            });

            const csv = rows
                .map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
                .join('\n');
            // The BOM is what makes Excel read the Khmer columns as UTF-8.
            const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
            const link = document.createElement('a');

            link.href = url;
            link.download = 'time-logs-' + (this.project.slug || this.project.id) + '.csv';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        },
    },
};
</script>
