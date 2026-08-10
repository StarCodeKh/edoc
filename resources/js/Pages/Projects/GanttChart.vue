<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <board-view-menu :project="project" @filter-toggle="open_filter = !open_filter" :filters="filters" view="timeline" />

            <!-- Enhanced Gantt Chart Container -->
            <div class="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <div v-if="ganttReady" class="flex-1 flex flex-col m-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

                    <!-- Enhanced Gantt Header -->
                    <div class="gantt-header border-b border-gray-200/40 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm">
                        <div class="px-8 py-6">
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <!-- Navigation Section -->
                                <div class="flex items-center justify-center lg:justify-start">
                                    <div class="flex items-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-1.5">
                                        <button @click="navigatePeriod(-1)" class="p-3.5 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group">
                                            <icon name="arrow-left" class="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                        </button>
                                        <div class="px-8 text-center min-w-[240px]">
                                            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
                                                {{ currentPeriodTitle }}
                                            </h2>
                                            <p class="text-sm text-indigo-600 mt-1 font-medium flex items-center justify-center">
                                                <icon name="chart-bar" class="w-4 h-4 mr-1.5" />
                                                Gantt Chart View
                                            </p>
                                        </div>
                                        <button @click="navigatePeriod(1)" class="p-3.5 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group">
                                            <icon name="arrow-right" class="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Controls Section -->
                                <div class="flex flex-col sm:flex-row items-center gap-4">
                                    <!-- View Mode Switcher -->
                                    <div class="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
                                        <button
                                            v-for="view in availableViews"
                                            :key="view.key"
                                            @click="changeView(view.key)"
                                            :class="[
                                                'flex items-center px-5 py-3 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap',
                                                currentView === view.key
                                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200/50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                            ]"
                                            :title="view.description"
                                        >
                                            <icon :name="view.icon" class="w-4 h-4 mr-2" />
                                            {{ view.label }}
                                        </button>
                                    </div>

                                    <!-- Today Button -->
                                    <button @click="goToToday" class="flex items-center px-5 py-3 text-sm font-medium text-gray-600 hover:text-white bg-white/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 rounded-xl border border-white/30 shadow-lg transition-all duration-300 backdrop-blur-sm">
                                        <icon name="calendar-today" class="w-4 h-4 mr-2" />
                                        Today
                                    </button>

                                    <!-- Zoom Controls -->
                                    <div class="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
                                        <button @click="zoomOut" class="p-2.5 hover:bg-indigo-50 rounded-lg transition-all duration-200" title="Zoom Out">
                                            <icon name="minus" class="w-4 h-4 text-gray-600" />
                                        </button>
                                        <span class="px-4 py-2 text-sm font-medium text-gray-600">{{ zoomLevel }}%</span>
                                        <button @click="zoomIn" class="p-2.5 hover:bg-indigo-50 rounded-lg transition-all duration-200" title="Zoom In">
                                            <icon name="plus" class="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <!-- Toggle Dependencies -->
                                    <button 
                                        @click="showDependencies = !showDependencies" 
                                        :class="[
                                            'flex items-center px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-300',
                                            showDependencies 
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-200/50' 
                                                : 'text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white/90 border-white/30 shadow-lg backdrop-blur-sm'
                                        ]"
                                        title="Toggle Dependencies"
                                    >
                                        <icon name="link" class="w-4 h-4 mr-2" />
                                        Dependencies
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Gantt Chart Content -->
                    <div class="gantt-content flex-1 overflow-hidden">
                        <div class="gantt-container h-full flex">
                            <!-- Enhanced Task List Panel -->
                            <div class="task-list-panel w-80 border-r border-gray-200/40 bg-gradient-to-b from-white/90 to-gray-50/50 backdrop-blur-sm flex flex-col">
                                <div class="task-list-header p-5 border-b border-gray-200/40 bg-gradient-to-r from-white to-indigo-50/30">
                                    <div class="flex items-center justify-between">
                                        <h3 class="font-bold text-gray-900 flex items-center">
                                            <icon name="list-bullet" class="w-5 h-5 mr-2 text-indigo-600" />
                                            Tasks ({{ sortedTasks.length }})
                                        </h3>
                                        <div class="flex items-center space-x-2">
                                            <div class="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                                                {{ completedTasksCount }} completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="task-list-content flex-1 overflow-y-auto">
                                    <div
                                        v-for="(task, index) in sortedTasks"
                                        :key="task.id"
                                        class="task-row group p-4 border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/30 transition-all duration-300 cursor-pointer relative"
                                        @click="selectTask(task)"
                                        :class="{ 
                                            'bg-gradient-to-r from-indigo-100/80 to-blue-100/60 border-indigo-200/50 shadow-sm': selectedTask?.id === task.id,
                                            'hover:shadow-md': selectedTask?.id !== task.id
                                        }"
                                    >
                                        <!-- Task Status Indicator -->
                                        <div class="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                                             :class="getTaskStatusColor(task)"></div>
                                        
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1 min-w-0 pl-2">
                                                <div class="flex items-center space-x-2 mb-2">
                                                    <h4 class="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                        {{ task.title }}
                                                    </h4>
                                                    <div v-if="task.is_done" class="text-emerald-500">
                                                        <icon name="check-circle" class="w-4 h-4" />
                                                    </div>
                                                </div>
                                                
                                                <!-- Task Meta Information -->
                                                <div class="flex items-center space-x-2 mb-2">
                                                    <span v-if="task.list" class="text-xs text-indigo-600 bg-indigo-100/60 px-2 py-1 rounded-full font-medium">
                                                        {{ task.list.title }}
                                                    </span>
                                                    <span v-if="task.duration_days" class="text-xs text-gray-600 bg-gray-100/60 px-2 py-1 rounded-full">
                                                        {{ task.duration_days }}d
                                                    </span>
                                                </div>

                                                <!-- Progress Bar -->
                                                <div v-if="task.progress_percentage > 0" class="mb-2">
                                                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progress</span>
                                                        <span>{{ task.progress_percentage }}%</span>
                                                    </div>
                                                    <div class="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
                                                        <div class="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-500"
                                                             :style="{ width: `${task.progress_percentage}%` }"></div>
                                                    </div>
                                                </div>

                                                <!-- Assignees -->
                                                <div v-if="task.assignees && task.assignees.length" class="flex items-center space-x-1">
                                                    <icon name="user" class="w-3 h-3 text-gray-400" />
                                                    <span class="text-xs text-gray-500">{{ task.assignees.length }} assignee(s)</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Task Priority Indicator -->
                                            <div class="flex flex-col items-end space-y-1 ml-3">
                                                <div v-if="isHighPriority(task)" class="text-orange-500">
                                                    <icon name="exclamation-triangle" class="w-4 h-4" />
                                                </div>
                                                <div v-if="isOverdue(task)" class="text-red-500">
                                                    <icon name="clock" class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Enhanced Timeline Panel -->
                            <div class="timeline-panel flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-white/95 to-gray-50/30">
                                <!-- Enhanced Timeline Header -->
                                <div class="timeline-header bg-gradient-to-r from-white via-indigo-50/30 to-white border-b border-gray-200/40 backdrop-blur-sm">
                                    <div class="timeline-header-content h-16 flex items-center" :style="{ transform: `translateX(${timelineOffset}px)` }">
                                        <div
                                            v-for="(date, index) in timelineDates"
                                            :key="date.toISOString()"
                                            class="timeline-date-cell flex-shrink-0 border-r border-gray-200/40 text-center relative"
                                            :style="{ width: `${dayWidth}px` }"
                                        >
                                            <!-- Weekend Highlighting -->
                                            <div v-if="isWeekend(date)" class="absolute inset-0 bg-orange-50/50"></div>
                                            
                                            <!-- Date Display -->
                                            <div class="relative z-10">
                                                <div class="text-xs font-semibold text-gray-700 py-1">
                                                    {{ formatDateHeader(date) }}
                                                </div>
                                                <div v-if="currentView === 'month'" class="text-xs text-gray-500">
                                                    {{ formatWeekday(date) }}
                                                </div>
                                            </div>

                                            <!-- Today Indicator -->
                                            <div v-if="isToday(date)" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Enhanced Timeline Content -->
                                <div class="timeline-content flex-1 overflow-auto bg-gradient-to-b from-white/50 to-transparent">
                                    <div class="timeline-grid relative" :style="{ width: `${totalTimelineWidth}px`, height: `${sortedTasks.length * 70 + 20}px` }">
                                        <!-- Enhanced Grid Lines -->
                                        <div
                                            v-for="(date, index) in timelineDates"
                                            :key="'grid-' + date.toISOString()"
                                            class="absolute top-0 bottom-0 border-r transition-colors"
                                            :class="isWeekend(date) ? 'border-orange-200/40' : 'border-gray-200/30'"
                                            :style="{ left: `${index * dayWidth}px` }"
                                        ></div>

                                        <!-- Weekend Background -->
                                        <div
                                            v-for="(date, index) in timelineDates"
                                            v-if="isWeekend(date)"
                                            :key="'weekend-' + date.toISOString()"
                                            class="absolute top-0 bottom-0 bg-orange-50/20"
                                            :style="{ left: `${index * dayWidth}px`, width: `${dayWidth}px` }"
                                        ></div>

                                        <!-- Enhanced Today Line -->
                                        <div
                                            v-if="todayPosition >= 0"
                                            class="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 z-20 shadow-lg"
                                            :style="{ left: `${todayPosition}px` }"
                                        >
                                            <div class="absolute -top-2 -left-1 w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
                                        </div>

                                        <!-- Enhanced Task Bars -->
                                        <div
                                            v-for="(task, index) in sortedTasks"
                                            :key="'bar-' + task.id"
                                            class="absolute group"
                                            :style="{ top: `${index * 70 + 15}px`, left: `${getTaskStartPosition(task)}px` }"
                                        >
                                            <!-- Task Bar Container -->
                                            <div
                                                class="task-bar-container relative"
                                                :style="{ width: `${getTaskWidth(task)}px` }"
                                            >
                                                <!-- Main Task Bar -->
                                                <div
                                                    class="task-bar h-10 rounded-xl border-l-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
                                                    :class="getTaskBarClass(task)"
                                                    @click="openTask(task)"
                                                    :title="getTaskTooltip(task)"
                                                >
                                                    <!-- Task Bar Background Pattern -->
                                                    <div class="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
                                                    
                                                    <!-- Task Content -->
                                                    <div class="relative z-10 flex items-center h-full px-4">
                                                        <div class="flex-1 min-w-0">
                                                            <div class="text-xs font-semibold text-white truncate drop-shadow-sm">
                                                                {{ task.title }}
                                                            </div>
                                                        </div>
                                                        <div v-if="task.progress_percentage > 0" class="ml-3 text-xs text-white/90 font-medium">
                                                            {{ task.progress_percentage }}%
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Enhanced Progress Bar -->
                                                    <div
                                                        v-if="task.progress_percentage > 0"
                                                        class="absolute top-0 left-0 h-full bg-white/25 rounded-xl transition-all duration-500"
                                                        :style="{ width: `${task.progress_percentage}%` }"
                                                    >
                                                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                                    </div>

                                                    <!-- Task Status Icons -->
                                                    <div class="absolute top-1 right-1 flex space-x-1">
                                                        <div v-if="task.is_done" class="text-white/90">
                                                            <icon name="check-circle" class="w-3 h-3" />
                                                        </div>
                                                        <div v-if="isOverdue(task)" class="text-white/90">
                                                            <icon name="exclamation-triangle" class="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Milestone Marker -->
                                                <div v-if="isMilestone(task)" class="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white shadow-lg"></div>
                                                </div>

                                                <!-- Task Duration Label -->
                                                <div v-if="getTaskWidth(task) > 60" class="absolute -bottom-5 left-0 text-xs text-gray-500 font-medium">
                                                    {{ task.duration_days || 1 }}d
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Enhanced Dependencies -->
                                        <svg
                                            v-if="showDependencies"
                                            class="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                                            :style="{ width: `${totalTimelineWidth}px`, height: `${sortedTasks.length * 70 + 20}px` }"
                                        >
                                            <defs>
                                                <marker
                                                    id="arrowhead"
                                                    markerWidth="12"
                                                    markerHeight="8"
                                                    refX="11"
                                                    refY="4"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 12 4, 0 8" fill="#8b5cf6" />
                                                </marker>
                                                <linearGradient id="dependencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
                                                    <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.6" />
                                                </linearGradient>
                                            </defs>
                                            <line
                                                v-for="dependency in taskDependencies"
                                                :key="`dep-${dependency.from}-${dependency.to}`"
                                                :x1="dependency.x1"
                                                :y1="dependency.y1"
                                                :x2="dependency.x2"
                                                :y2="dependency.y2"
                                                stroke="url(#dependencyGradient)"
                                                stroke-width="3"
                                                marker-end="url(#arrowhead)"
                                                stroke-dasharray="8,4"
                                                opacity="0.8"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-else class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p class="text-gray-600">Loading Gantt chart...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Task Details Modal -->
        <task-details
            v-if="taskDetailsOpen"
            :task-id="taskDetailsId"
            :project="project"
            @close="closeDetails"
        />
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head, Link } from '@inertiajs/vue3'
import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
import Icon from '@/Shared/Icon.vue'
import TaskDetails from '@/Shared/Modals/TaskDetails.vue'
import moment_timezone from 'moment-timezone'

export default {
    metaInfo: { title: 'Gantt Chart' },
    layout: Layout,
    components: {
        Head,
        Link,
        BoardViewMenu,
        Icon,
        TaskDetails,
    },
    props: {
        title: String,
        project: Object,
        tasks: Array,
        filters: Object,
    },
    data() {
        return {
            ganttReady: false,
            open_filter: false,
            currentView: 'month',
            selectedDate: new Date(),
            currentDate: new Date(),
            availableViews: [
                { key: 'month', label: 'Month', icon: 'calendar', description: 'Monthly Gantt view' },
                { key: 'week', label: 'Week', icon: 'calendar-week', description: 'Weekly Gantt view' },
                { key: 'day', label: 'Day', icon: 'calendar-day', description: 'Daily Gantt view' },
            ],
            form: {
                range: { start: '', end: '' },
                period: 'gantt',
                task: null
            },
            moment: null,
            // Gantt chart specific data
            zoomLevel: 100,
            dayWidth: 30,
            timelineOffset: 0,
            selectedTask: null,
            showDependencies: true,
            // Task details popup properties
            taskDetailsOpen: false,
            taskDetailsId: null,
            td_pop: true
        }
    },
    computed: {
        currentPeriodTitle() {
            switch (this.currentView) {
                case 'month':
                    return this.moment(this.currentDate).format('MMMM YYYY')
                case 'week':
                    const weekStart = this.moment(this.selectedDate).startOf('week')
                    const weekEnd = this.moment(this.selectedDate).endOf('week')
                    return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`
                case 'day':
                    return this.moment(this.selectedDate).format('dddd, MMMM Do, YYYY')
                default:
                    return this.moment(this.currentDate).format('MMMM YYYY')
            }
        },
        sortedTasks() {
            return [...this.tasks].sort((a, b) => {
                const aStart = this.moment(a.start_date || a.created_at)
                const bStart = this.moment(b.start_date || b.created_at)
                return aStart.diff(bStart)
            })
        },
        timelineDates() {
            const dates = []
            const startDate = this.getTimelineStartDate()
            const endDate = this.getTimelineEndDate()
            
            let current = this.moment(startDate)
            while (current.isSameOrBefore(endDate, 'day')) {
                dates.push(current.toDate())
                current.add(1, 'day')
            }
            
            return dates
        },
        totalTimelineWidth() {
            return this.timelineDates.length * this.dayWidth
        },
        todayPosition() {
            const today = this.moment()
            const startDate = this.getTimelineStartDate()
            const daysDiff = today.diff(startDate, 'days')
            return daysDiff * this.dayWidth
        },
        taskDependencies() {
            const dependencies = []
            
            this.sortedTasks.forEach((task, taskIndex) => {
                if (task.dependencies && task.dependencies.length > 0) {
                    task.dependencies.forEach(depId => {
                        const depTaskIndex = this.sortedTasks.findIndex(t => t.id === depId)
                        if (depTaskIndex >= 0) {
                            const fromTask = this.sortedTasks[depTaskIndex]
                            const toTask = task
                            
                            const fromX = this.getTaskStartPosition(fromTask) + this.getTaskWidth(fromTask)
                            const fromY = depTaskIndex * 70 + 35
                            const toX = this.getTaskStartPosition(toTask)
                            const toY = taskIndex * 70 + 35
                            
                            dependencies.push({
                                from: fromTask.id,
                                to: toTask.id,
                                x1: fromX,
                                y1: fromY,
                                x2: toX,
                                y2: toY
                            })
                        }
                    })
                }
            })
            
            return dependencies
        },
        completedTasksCount() {
            return this.sortedTasks.filter(task => task.is_done).length
        }
    },
    methods: {
        changeView(view) {
            this.currentView = view
            this.updateFormRange()
            this.adjustDayWidth()
        },
        navigatePeriod(direction) {
            switch (this.currentView) {
                case 'month':
                    this.currentDate = this.moment(this.currentDate).add(direction, 'month').toDate()
                    break
                case 'week':
                    this.selectedDate = this.moment(this.selectedDate).add(direction, 'week').toDate()
                    break
                case 'day':
                    this.selectedDate = this.moment(this.selectedDate).add(direction, 'day').toDate()
                    break
            }
            this.updateFormRange()
        },
        goToToday() {
            this.selectedDate = new Date()
            this.currentDate = new Date()
            this.updateFormRange()
        },
        zoomIn() {
            this.zoomLevel = Math.min(this.zoomLevel + 25, 300)
            this.dayWidth = Math.min(this.dayWidth + 5, 60)
        },
        zoomOut() {
            this.zoomLevel = Math.max(this.zoomLevel - 25, 50)
            this.dayWidth = Math.max(this.dayWidth - 5, 15)
        },
        adjustDayWidth() {
            switch (this.currentView) {
                case 'day':
                    this.dayWidth = 60
                    this.zoomLevel = 200
                    break
                case 'week':
                    this.dayWidth = 40
                    this.zoomLevel = 133
                    break
                case 'month':
                default:
                    this.dayWidth = 30
                    this.zoomLevel = 100
                    break
            }
        },
        getTimelineStartDate() {
            switch (this.currentView) {
                case 'month':
                    return this.moment(this.currentDate).startOf('month').subtract(7, 'days')
                case 'week':
                    return this.moment(this.selectedDate).startOf('week').subtract(3, 'days')
                case 'day':
                    return this.moment(this.selectedDate).subtract(7, 'days')
                default:
                    return this.moment(this.currentDate).startOf('month')
            }
        },
        getTimelineEndDate() {
            switch (this.currentView) {
                case 'month':
                    return this.moment(this.currentDate).endOf('month').add(7, 'days')
                case 'week':
                    return this.moment(this.selectedDate).endOf('week').add(3, 'days')
                case 'day':
                    return this.moment(this.selectedDate).add(7, 'days')
                default:
                    return this.moment(this.currentDate).endOf('month')
            }
        },
        getTaskStartPosition(task) {
            const taskStart = this.moment(task.start_date || task.created_at)
            const timelineStart = this.getTimelineStartDate()
            const daysDiff = taskStart.diff(timelineStart, 'days')
            return Math.max(0, daysDiff * this.dayWidth)
        },
        getTaskWidth(task) {
            const duration = task.duration_days || 1
            return Math.max(duration * this.dayWidth, 20)
        },
        getTaskBarClass(task) {
            if (task.is_done) {
                return 'bg-green-500 border-green-600'
            }
            if (this.isOverdue(task)) {
                return 'bg-red-500 border-red-600'
            }
            if (this.isHighPriority(task)) {
                return 'bg-orange-500 border-orange-600'
            }
            return 'bg-blue-500 border-blue-600'
        },
        getTaskTooltip(task) {
            let tooltip = `${task.title}\n`
            tooltip += `Duration: ${task.duration_days || 1} days\n`
            if (task.start_date) {
                tooltip += `Start: ${this.moment(task.start_date).format('MMM D, YYYY')}\n`
            }
            if (task.end_date) {
                tooltip += `End: ${this.moment(task.end_date).format('MMM D, YYYY')}\n`
            }
            if (task.progress_percentage > 0) {
                tooltip += `Progress: ${task.progress_percentage}%\n`
            }
            if (task.assignees && task.assignees.length) {
                tooltip += `Assigned to: ${task.assignees.map(a => a.user.name).join(', ')}`
            }
            return tooltip
        },
        selectTask(task) {
            this.selectedTask = task
        },
        isOverdue(task) {
            if (!task.end_date) return false
            return this.moment(task.end_date).isBefore(this.moment()) && !task.is_done
        },
        isHighPriority(task) {
            return task.taskLabels && task.taskLabels.some(label => label.label.name.toLowerCase().includes('high'))
        },
        formatDateHeader(date) {
            switch (this.currentView) {
                case 'day':
                    return this.moment(date).format('HH:mm')
                case 'week':
                    return this.moment(date).format('ddd D')
                case 'month':
                default:
                    return this.moment(date).format('D')
            }
        },
        formatWeekday(date) {
            return this.moment(date).format('ddd')
        },
        isWeekend(date) {
            const day = this.moment(date).day()
            return day === 0 || day === 6 // Sunday or Saturday
        },
        isToday(date) {
            return this.moment(date).isSame(this.moment(), 'day')
        },
        isMilestone(task) {
            // Consider a task a milestone if it has 0 duration or is marked as a milestone
            return task.duration_days === 0 || (task.taskLabels && task.taskLabels.some(label => 
                label.label.name.toLowerCase().includes('milestone')
            ))
        },
        getTaskStatusColor(task) {
            if (task.is_done) {
                return 'bg-gradient-to-b from-emerald-500 to-green-600'
            }
            if (this.isOverdue(task)) {
                return 'bg-gradient-to-b from-red-500 to-red-600'
            }
            if (this.isHighPriority(task)) {
                return 'bg-gradient-to-b from-orange-500 to-amber-600'
            }
            return 'bg-gradient-to-b from-indigo-500 to-blue-600'
        },
        updateFormRange() {
            let start, end

            switch (this.currentView) {
                case 'month':
                    start = this.moment(this.currentDate).startOf('month')
                    end = this.moment(this.currentDate).endOf('month')
                    break
                case 'week':
                    start = this.moment(this.selectedDate).startOf('week')
                    end = this.moment(this.selectedDate).endOf('week')
                    break
                case 'day':
                    start = this.moment(this.selectedDate).startOf('day')
                    end = this.moment(this.selectedDate).endOf('day')
                    break
                default:
                    start = this.moment(this.currentDate).startOf('month')
                    end = this.moment(this.currentDate).endOf('month')
            }

            this.form.range = {
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD')
            }
            this.form.period = 'gantt'
        },
        openTask(task) {
            this.taskDetailsPopup(task.id)
        },
        taskDetailsPopup(id) {
            this.form.task = id
            this.td_pop = true
            this.taskDetailsId = id
            this.taskDetailsOpen = true
        },
        closeDetails() {
            this.form.task = null
            this.taskDetailsOpen = false
        },
        initializeGantt() {
            this.updateFormRange()
            this.adjustDayWidth()
            this.ganttReady = true
        }
    },
    mounted() {
        this.initializeGantt()
    },
    created() {
        this.moment = moment_timezone
    }
}
</script>

<style scoped>
/* Enhanced Gantt Chart Layout */
.gantt-container {
    display: flex;
    height: 100%;
    min-height: 0;
}

.task-list-panel {
    flex-shrink: 0;
    min-width: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
}

.timeline-panel {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.3) 100%);
}

.timeline-header-content {
    display: flex;
    min-width: max-content;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(238, 242, 255, 0.3) 50%, rgba(255, 255, 255, 0.8) 100%);
}

.timeline-date-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    position: relative;
    transition: all 0.2s ease-in-out;
}

.timeline-date-cell:hover {
    background: rgba(99, 102, 241, 0.05);
}

.timeline-grid {
    position: relative;
    min-width: max-content;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
}

.task-bar {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 0.75rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.task-bar:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(255, 255, 255, 0.4);
}

.task-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
    border-radius: inherit;
}

.task-row {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.task-row::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.task-row:hover::before {
    opacity: 1;
}

.task-row:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(238, 242, 255, 0.3) 100%);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Enhanced Progress Bars */
.task-row .progress-bar {
    background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 100%);
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
}

.task-row .progress-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* Enhanced Custom Scrollbars */
.task-list-content::-webkit-scrollbar,
.timeline-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.task-list-content::-webkit-scrollbar-track,
.timeline-content::-webkit-scrollbar-track {
    background: rgba(241, 245, 249, 0.5);
    border-radius: 4px;
}

.task-list-content::-webkit-scrollbar-thumb,
.timeline-content::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.task-list-content::-webkit-scrollbar-thumb:hover,
.timeline-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
}

/* Enhanced Button Styles */
button {
    position: relative;
    overflow: hidden;
}

button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

button:hover::before {
    left: 100%;
}

/* Glassmorphism Effects */
.glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Enhanced Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.task-row {
    animation: fadeInUp 0.3s ease-out;
}

.task-row:nth-child(even) {
    animation-delay: 0.1s;
}

.task-row:nth-child(odd) {
    animation-delay: 0.05s;
}

/* Responsive Design */
@media (max-width: 768px) {
    .task-list-panel {
        width: 60vw;
    }
    
    .timeline-date-cell {
        font-size: 0.75rem;
    }
    
    .task-bar {
        height: 2rem;
    }
}

/* Print Styles */
@media print {
    .gantt-header,
    .task-list-header {
        background: white !important;
    }
    
    .task-bar {
        box-shadow: none !important;
        border: 1px solid #000 !important;
    }
}
</style>