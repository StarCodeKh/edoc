<template>
    <div class="h-full">
        <Head :title="$t(title)" />

        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
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

            <!-- Enhanced Time Logs Container -->
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
                <div
                    class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden"
                >
                    <!-- Enhanced Header -->
                    <div
                        class="time-logs-header border-b border-gray-200/60 bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden"
                    >
                        <!-- Background Pattern -->
                        <div class="absolute inset-0 opacity-5">
                            <div
                                class="absolute inset-0"
                                style="
                                    background-image: radial-gradient(
                                        circle at 1px 1px,
                                        rgba(99, 102, 241, 0.3) 1px,
                                        transparent 0
                                    );
                                    background-size: 20px 20px;
                                "
                            ></div>
                        </div>

                        <div class="relative px-6 py-6">
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <!-- Title and Stats -->
                                <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div class="flex items-center space-x-4">
                                        <div
                                            class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                                        >
                                            <icon name="clock" class="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
                                                {{ $t('Time Logs') }}
                                            </h2>
                                            <p class="text-sm text-gray-500 mt-1 font-medium">
                                                {{ $t('Track and manage time spent on tasks') }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Stats Cards -->
                                    <div class="flex flex-col sm:flex-row gap-4">
                                        <!-- Total Duration Card -->
                                        <div
                                            v-if="total_duration"
                                            class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                        >
                                            <div class="flex items-center">
                                                <div class="p-2 bg-white/20 rounded-xl mr-3">
                                                    <icon name="clock" class="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p class="text-xs opacity-90 font-medium uppercase tracking-wide">
                                                        {{ $t('Total Duration') }}
                                                    </p>
                                                    <p class="text-lg font-bold">
                                                        {{ formatDuration(total_duration, 'minutes') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Logs Count Card -->
                                        <div
                                            class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                        >
                                            <div class="flex items-center">
                                                <div class="p-2 bg-white/20 rounded-xl mr-3">
                                                    <icon name="list" class="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p class="text-xs opacity-90 font-medium uppercase tracking-wide">
                                                        {{ $t('Total Logs') }}
                                                    </p>
                                                    <p class="text-lg font-bold">
                                                        {{ time_logs.total || time_logs.data.length }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Search and Actions -->
                                <div class="flex flex-col sm:flex-row items-center gap-4">
                                    <div class="relative">
                                        <search-input
                                            v-model="form.search"
                                            class="w-full sm:w-80"
                                            @reset="reset"
                                            placeholder="Search time logs..."
                                        />
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex items-center space-x-3">
                                        <!-- Filter Button -->
                                        <button
                                            @click="open_filter = !open_filter"
                                            class="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200/60 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <icon name="filter" class="w-4 h-4 mr-2" />{{ $t('Filter') }}
                                        </button>

                                        <!-- Export Button -->
                                        <button
                                            class="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            <icon name="download" class="w-4 h-4 mr-2" />{{ $t('Export') }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Time Logs Content -->
                    <div class="time-logs-content flex-1 overflow-hidden">
                        <!-- Responsive Table Container -->
                        <div class="h-full">
                            <!-- Enhanced Scroll Controls for Mobile/Tablet -->
                            <div
                                class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60 xl:hidden backdrop-blur-sm"
                            >
                                <div class="flex items-center text-xs text-gray-600 font-medium">
                                    <div class="p-1.5 bg-indigo-100 rounded-lg mr-3">
                                        <icon name="info" class="w-3 h-3 text-indigo-600" />
                                    </div>
                                    <span class="hidden sm:inline">{{
                                        $t('Scroll horizontally to view all columns')
                                    }}</span>
                                    <span class="sm:hidden">{{ $t('Swipe to view all columns') }}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button
                                        @click="scrollTable('left')"
                                        :disabled="!canScrollLeft"
                                        class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
                                    >
                                        <icon name="arrow-left" class="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        @click="scrollTable('right')"
                                        :disabled="!canScrollRight"
                                        class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
                                    >
                                        <icon name="arrow-right" class="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        @click="scrollToStart"
                                        class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md"
                                        title="Scroll to beginning"
                                    >
                                        <icon name="arrow-left-double" class="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        @click="scrollToEnd"
                                        class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md"
                                        title="Scroll to end"
                                    >
                                        <icon name="arrow-right-double" class="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <!-- Responsive Table -->
                            <div
                                ref="tableContainer"
                                class="overflow-x-auto h-full scroll-smooth xl:overflow-x-visible"
                                @scroll="handleScroll"
                            >
                                <table class="min-w-full divide-y divide-gray-200/60 responsive-table">
                                    <thead
                                        class="bg-gradient-to-r from-gray-50/80 to-gray-100/80 sticky top-0 backdrop-blur-sm"
                                    >
                                        <tr>
                                            <!-- Task Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider task-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-indigo-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-indigo-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="task"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{ $t('Task') }}</span>
                                                    <span class="sm:hidden font-semibold">{{ $t('Task') }}</span>
                                                </div>
                                            </th>

                                            <!-- Member Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider member-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-blue-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-blue-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="user"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{
                                                        $t('Member')
                                                    }}</span>
                                                    <span class="sm:hidden font-semibold">{{ $t('User') }}</span>
                                                </div>
                                            </th>

                                            <!-- Started Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider started-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-green-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-green-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="play"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{
                                                        $t('Started')
                                                    }}</span>
                                                    <span class="sm:hidden font-semibold">{{ $t('Start') }}</span>
                                                </div>
                                            </th>

                                            <!-- Stopped Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider stopped-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-red-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-red-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="stop"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{
                                                        $t('Stopped')
                                                    }}</span>
                                                    <span class="sm:hidden font-semibold">End</span>
                                                </div>
                                            </th>

                                            <!-- Duration Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider duration-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-purple-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-purple-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="clock"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{
                                                        $t('Duration')
                                                    }}</span>
                                                    <span class="sm:hidden font-semibold">{{ $t('Time') }}</span>
                                                </div>
                                            </th>

                                            <!-- Memo Column -->
                                            <th
                                                class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider memo-column"
                                            >
                                                <div class="flex items-center group">
                                                    <div
                                                        class="p-1.5 bg-yellow-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-yellow-200 transition-colors"
                                                    >
                                                        <icon
                                                            name="note"
                                                            class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0"
                                                        />
                                                    </div>
                                                    <span class="hidden sm:inline font-semibold">{{ $t('Memo') }}</span>
                                                    <span class="sm:hidden font-semibold">{{ $t('Note') }}</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200/60">
                                        <tr
                                            v-for="log in time_logs.data"
                                            :key="log.id"
                                            class="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 focus-within:bg-gray-50 transition-all duration-200 group"
                                        >
                                            <!-- Task Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 task-column">
                                                <button
                                                    @click="openTask(log.task)"
                                                    class="group flex items-center text-xs sm:text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-150"
                                                >
                                                    <div class="flex-1 min-w-0">
                                                        <p
                                                            class="truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none text-left"
                                                        >
                                                            {{ log.task.title }}
                                                        </p>
                                                        <p
                                                            v-if="log.task.description"
                                                            class="text-xs text-gray-500 truncate mt-1 max-w-[120px] sm:max-w-[200px] lg:max-w-none hidden sm:block"
                                                        >
                                                            {{ log.task.description }}
                                                        </p>
                                                    </div>
                                                    <icon
                                                        name="external-link"
                                                        class="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    />
                                                </button>
                                            </td>

                                            <!-- Member Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 member-column">
                                                <div class="flex items-center">
                                                    <div class="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                                                        <img
                                                            class="h-6 w-6 sm:h-8 sm:w-8 rounded-full border border-white shadow-sm"
                                                            :src="log.user.photo_path"
                                                            :alt="log.user.name"
                                                        />
                                                    </div>
                                                    <div class="ml-2 sm:ml-3 min-w-0">
                                                        <p
                                                            class="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none"
                                                        >
                                                            {{ log.user.name }}
                                                        </p>
                                                        <p
                                                            class="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none hidden sm:block"
                                                        >
                                                            {{ log.user.email }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- Started Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 started-column">
                                                <div class="text-xs sm:text-sm text-gray-900">
                                                    <div class="font-medium hidden sm:block">
                                                        {{ moment(log.started_at).format('MMM D, YYYY') }}
                                                    </div>
                                                    <div class="font-medium sm:hidden">
                                                        {{ moment(log.started_at).format('MMM D') }}
                                                    </div>
                                                    <div class="text-gray-500">
                                                        {{ moment(log.started_at).format('h:mm a') }}
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- Stopped Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 stopped-column">
                                                <div class="text-xs sm:text-sm text-gray-900">
                                                    <div class="font-medium hidden sm:block">
                                                        {{ moment(log.stopped_at).format('MMM D, YYYY') }}
                                                    </div>
                                                    <div class="font-medium sm:hidden">
                                                        {{ moment(log.stopped_at).format('MMM D') }}
                                                    </div>
                                                    <div class="text-gray-500">
                                                        {{ moment(log.stopped_at).format('h:mm a') }}
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- Duration Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 duration-column">
                                                <div class="flex items-center">
                                                    <div
                                                        class="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        <div class="flex items-center">
                                                            <icon name="clock" class="w-3 h-3 mr-1" />
                                                            {{ formatDuration(log.duration, 'minutes') }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- Memo Column -->
                                            <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 memo-column">
                                                <div
                                                    class="text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-[150px] lg:max-w-xs"
                                                >
                                                    <p v-if="log.title" class="truncate">{{ log.title }}</p>
                                                    <!-- Two v-else in a row is not a chain; the pair of
                                                         placeholders belongs inside one v-else. -->
                                                    <template v-else>
                                                        <p class="text-gray-400 italic hidden sm:block">
                                                            {{ $t('No memo') }}
                                                        </p>
                                                        <p class="text-gray-400 italic sm:hidden">-</p>
                                                    </template>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Empty State -->
                                        <tr v-if="time_logs.data.length === 0">
                                            <td colspan="6" class="px-6 py-12 text-center">
                                                <div class="flex flex-col items-center">
                                                    <icon name="clock" class="w-12 h-12 text-gray-400 mb-4" />
                                                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                                                        {{ $t('No time logs found') }}
                                                    </h3>
                                                    <p class="text-gray-500">
                                                        Start tracking time on your tasks to see logs here.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Mobile Card View -->
                        <div class="lg:hidden h-full overflow-y-auto">
                            <div class="p-4 space-y-4">
                                <div
                                    v-for="log in time_logs.data"
                                    :key="log.id"
                                    class="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                                >
                                    <!-- Task Header -->
                                    <div class="flex items-start justify-between mb-3">
                                        <Link
                                            :href="
                                                this.route('projects.board.with.task', {
                                                    projectUid: project.slug || project.id,
                                                    taskUid: log.task.slug || log.task.id,
                                                })
                                            "
                                            class="flex-1 min-w-0 group"
                                        >
                                            <h3
                                                class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate"
                                            >
                                                {{ log.task.title }}
                                            </h3>
                                            <p
                                                v-if="log.task.description"
                                                class="text-xs text-gray-500 mt-1 line-clamp-2"
                                            >
                                                {{ log.task.description }}
                                            </p>
                                        </Link>
                                        <div
                                            class="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ml-2 flex-shrink-0"
                                        >
                                            <div class="flex items-center">
                                                <icon name="clock" class="w-3 h-3 mr-1" />
                                                {{ formatDuration(log.duration, 'seconds') }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Member Info -->
                                    <div class="flex items-center mb-3">
                                        <img
                                            class="h-6 w-6 rounded-full border border-white shadow-sm"
                                            :src="log.user.photo_path"
                                            :alt="log.user.name"
                                        />
                                        <span class="ml-2 text-sm font-medium text-gray-900">{{ log.user.name }}</span>
                                    </div>

                                    <!-- Time Info -->
                                    <div class="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">
                                                {{ $t('Started') }}
                                            </p>
                                            <p class="text-sm font-medium text-gray-900">
                                                {{ moment(log.started_at).format('MMM D, h:mm a') }}
                                            </p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">
                                                {{ $t('Stopped') }}
                                            </p>
                                            <p class="text-sm font-medium text-gray-900">
                                                {{ moment(log.stopped_at).format('MMM D, h:mm a') }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Memo -->
                                    <div v-if="log.title" class="border-t border-gray-100 pt-3">
                                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                            {{ $t('Memo') }}
                                        </p>
                                        <p class="text-sm text-gray-900">{{ log.title }}</p>
                                    </div>
                                </div>

                                <!-- Mobile Empty State -->
                                <div v-if="time_logs.data.length === 0" class="text-center py-12">
                                    <icon name="clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                                        {{ $t('No time logs found') }}
                                    </h3>
                                    <p class="text-gray-500">Start tracking time on your tasks to see logs here.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Pagination -->
                        <div
                            v-if="time_logs.data.length > 0"
                            class="border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 px-6 py-5 backdrop-blur-sm"
                        >
                            <div class="flex items-center justify-between">
                                <div class="text-sm text-gray-600 font-medium">
                                    Showing {{ time_logs.from || 0 }} to {{ time_logs.to || 0 }} of
                                    {{ time_logs.total || time_logs.data.length }} results
                                </div>
                                <pagination :links="time_logs.links" />
                            </div>
                        </div>
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
import SearchInput from '@/Shared/SearchInput.vue';
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
        SearchInput,
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
            canScrollLeft: false,
            canScrollRight: true,
        };
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
    computed: {},
    created() {
        this.moment = moment;
    },
    mounted() {
        // Initialize scroll state
        this.$nextTick(() => {
            this.updateScrollState();
        });

        // Listen for window resize to update scroll state
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        // Clean up resize listener
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        formatDuration(duration, unit = 'minutes') {
            const durationObj = moment.duration(duration, unit);
            const hours = Math.floor(durationObj.asHours());
            const minutes = Math.floor(durationObj.asMinutes()) % 60;
            const seconds = Math.floor(durationObj.asSeconds()) % 60;

            let result = '';

            if (hours > 0) {
                result += `${hours}h`;
                if (minutes > 0) {
                    result += ` ${minutes}m`;
                }
            } else if (minutes > 0) {
                result += `${minutes}m`;
                if (seconds > 0) {
                    result += ` ${seconds}s`;
                }
            } else {
                result += `${seconds}s`;
            }

            return result;
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
        scrollTable(direction) {
            const container = this.$refs.tableContainer;
            if (container) {
                const scrollAmount = 300;
                if (direction === 'left') {
                    container.scrollLeft -= scrollAmount;
                } else {
                    container.scrollLeft += scrollAmount;
                }
                // Update scroll state after scrolling
                this.$nextTick(() => {
                    this.updateScrollState();
                });
            }
        },
        scrollToStart() {
            const container = this.$refs.tableContainer;
            if (container) {
                container.scrollLeft = 0;
                this.updateScrollState();
            }
        },
        scrollToEnd() {
            const container = this.$refs.tableContainer;
            if (container) {
                container.scrollLeft = container.scrollWidth - container.clientWidth;
                this.updateScrollState();
            }
        },
        updateScrollState() {
            const container = this.$refs.tableContainer;
            if (container) {
                // Check if we're on a large screen where horizontal scroll is disabled
                const isLargeScreen = window.innerWidth >= 1200;

                if (isLargeScreen) {
                    // On large screens, disable scroll controls
                    this.canScrollLeft = false;
                    this.canScrollRight = false;
                } else {
                    // On smaller screens, check actual scroll state
                    this.canScrollLeft = container.scrollLeft > 0;
                    this.canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
                }
            }
        },
        handleScroll() {
            this.updateScrollState();
        },
        handleResize() {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateScrollState();
            }, 150);
        },
    },
};
</script>

<style scoped>
/* Enhanced Time Logs Styling */
.time-logs-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    position: relative;
}

.time-logs-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
    pointer-events: none;
}

.time-logs-content {
    background: #ffffff;
}

/* Enhanced card hover effects */
.group:hover .group-hover\:bg-indigo-200 {
    background-color: rgb(199 210 254);
}

.group:hover .group-hover\:bg-blue-200 {
    background-color: rgb(191 219 254);
}

.group:hover .group-hover\:bg-green-200 {
    background-color: rgb(187 247 208);
}

.group:hover .group-hover\:bg-red-200 {
    background-color: rgb(254 202 202);
}

.group:hover .group-hover\:bg-purple-200 {
    background-color: rgb(221 214 254);
}

.group:hover .group-hover\:bg-yellow-200 {
    background-color: rgb(254 240 138);
}

/* Custom scrollbar for mobile view */
.time-logs-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.time-logs-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.time-logs-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.time-logs-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Horizontal scrollbar styling for table container */
.overflow-x-auto::-webkit-scrollbar {
    height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    border: 2px solid #f8fafc;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Smooth scrolling */
.overflow-x-auto {
    scroll-behavior: smooth;
}

/* Enhanced table scrolling */
.overflow-x-auto::-webkit-scrollbar-corner {
    background: #f8fafc;
}

/* Table container improvements */
.overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f8fafc;
}

/* Responsive table layout */
.responsive-table {
    min-width: 1000px;
    width: max-content;
}

/* Desktop optimization - prevent horizontal scroll on large screens */
@media (min-width: 1200px) {
    .responsive-table {
        min-width: auto;
        width: 100%;
        table-layout: fixed;
    }

    .overflow-x-auto {
        overflow-x: visible;
    }
}

/* Column width constraints for different screen sizes */
@media (max-width: 640px) {
    .responsive-table {
        min-width: 800px;
    }

    .task-column {
        min-width: 150px;
        max-width: 200px;
    }

    .member-column {
        min-width: 100px;
        max-width: 120px;
    }

    .started-column,
    .stopped-column {
        min-width: 80px;
        max-width: 100px;
    }

    .duration-column {
        min-width: 60px;
        max-width: 80px;
    }

    .memo-column {
        min-width: 80px;
        max-width: 120px;
    }
}

@media (min-width: 641px) and (max-width: 1024px) {
    .responsive-table {
        min-width: 900px;
    }

    .task-column {
        min-width: 200px;
        max-width: 300px;
    }

    .member-column {
        min-width: 150px;
        max-width: 200px;
    }

    .started-column,
    .stopped-column {
        min-width: 120px;
        max-width: 160px;
    }

    .duration-column {
        min-width: 80px;
        max-width: 160px;
    }

    .memo-column {
        min-width: 150px;
        max-width: 220px;
    }
}

@media (min-width: 1025px) {
    .responsive-table {
        min-width: 1000px;
    }

    .task-column {
        min-width: 250px;
    }

    .member-column {
        min-width: 180px;
    }

    .started-column,
    .stopped-column {
        min-width: 140px;
    }

    .duration-column {
        min-width: 100px;
    }

    .memo-column {
        min-width: 200px;
    }
}

/* Large desktop optimization - fixed widths to prevent horizontal scroll */
@media (min-width: 1200px) {
    .task-column {
        width: 25%;
        min-width: 200px;
        max-width: 300px;
    }

    .member-column {
        width: 20%;
        min-width: 120px;
        max-width: 150px;
    }

    .started-column {
        width: 15%;
        min-width: 100px;
        max-width: 120px;
    }

    .stopped-column {
        width: 15%;
        min-width: 100px;
        max-width: 120px;
    }

    .duration-column {
        width: 15%;
        min-width: 80px;
        max-width: 100px;
    }

    .memo-column {
        width: 19%;
        min-width: 150px;
        max-width: 250px;
    }

    /* Enhanced text truncation for large screens */
    .task-column p {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .member-column p {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .memo-column p {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

/* Better table layout */
table {
    table-layout: fixed;
}

/* Column width constraints */
th,
td {
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Scroll indicator styling */
.scroll-indicator {
    background: linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%);
}

/* Enhanced scroll controls */
.scroll-controls {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(248, 250, 252, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

/* Scroll shadow indicators */
.overflow-x-auto::before,
.overflow-x-auto::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20px;
    pointer-events: none;
    z-index: 10;
}

.overflow-x-auto::before {
    left: 0;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.overflow-x-auto::after {
    right: 0;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.overflow-x-auto.scroll-left::before {
    opacity: 1;
}

.overflow-x-auto.scroll-right::after {
    opacity: 1;
}

/* Smooth scroll behavior */
.overflow-x-auto {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

/* Enhanced table hover effects */
tbody tr {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

tbody tr:hover {
    background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
    transform: translateY(-2px);
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Duration badge animation */
.bg-indigo-100 {
    transition: all 0.2s ease-in-out;
}

.bg-indigo-100:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

/* Card hover effects for mobile */
.lg\:hidden .bg-white {
    transition: all 0.2s ease-in-out;
}

.lg\:hidden .bg-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Line clamp utility */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Sticky header enhancement */
thead {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

/* Gradient text for total duration */
.bg-gradient-to-r {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

/* Enhanced focus states */
button:focus,
a:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
}

/* Loading state animation */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive improvements */
@media (max-width: 640px) {
    .time-logs-header {
        padding: 1rem;
    }

    .time-logs-content {
        margin: 0.5rem;
    }

    /* Mobile table adjustments */
    .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
    }

    /* Mobile card improvements */
    .lg\:hidden .bg-white {
        margin-bottom: 0.75rem;
    }

    /* Mobile button improvements */
    button {
        min-height: 44px; /* iOS touch target */
    }
}

@media (max-width: 480px) {
    /* Extra small screens */
    .time-logs-header h2 {
        font-size: 1.125rem;
    }

    .bg-gradient-to-r {
        padding: 0.75rem;
    }

    .bg-gradient-to-r p {
        font-size: 0.75rem;
    }

    .bg-gradient-to-r .text-lg {
        font-size: 1rem;
    }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
    .time-logs-content {
        margin: 1rem;
    }

    .overflow-x-auto {
        scrollbar-width: thin;
    }
}

/* Large screen optimizations */
@media (min-width: 1025px) {
    .time-logs-content {
        margin: 1.5rem;
    }

    .overflow-x-auto::-webkit-scrollbar {
        height: 10px;
    }
}
</style>
