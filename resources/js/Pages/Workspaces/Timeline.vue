<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <workspace-view-menu :workspace="workspace" @filter-toggle="open_filter = !open_filter" :filters="filters" view="timeline" />

            <!-- Enhanced Timeline Container -->
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
                <div v-if="timelineReady" class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">

                    <!-- Enhanced Timeline Header -->
                    <div class="timeline-header border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white">
                        <div class="px-6 py-5">
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <!-- Navigation Section -->
                                <div class="flex items-center justify-center lg:justify-start">
                                    <div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200/60 p-1">
                                        <button @click="navigatePeriod(-1)" class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
                                            <icon name="arrow-left" class="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                        </button>
                                        <div class="px-6 text-center min-w-[200px]">
                                            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
                                                {{ currentPeriodTitle }}
                                            </h2>
                                            <p class="text-sm text-gray-500 mt-0.5 font-medium">{{ currentPeriodSubtitle }}</p>
                                        </div>
                                        <button @click="navigatePeriod(1)" class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
                                            <icon name="arrow-right" class="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Controls Section -->
                                <div class="flex flex-col sm:flex-row items-center gap-4">
                                    <!-- View Mode Switcher -->
                                    <div class="flex bg-gray-100/80 rounded-2xl p-1.5 shadow-sm border border-gray-200/40">
                                        <button
                                            v-for="view in availableViews"
                                            :key="view.key"
                                            @click="changeView(view.key)"
                                            :class="[
                                                'flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap',
                                                currentView === view.key
                                                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-100'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                            ]"
                                            :title="view.description"
                                        >
                                            <icon :name="view.icon" class="w-4 h-4 mr-2" />
                                            {{ view.label }}
                                        </button>
                                    </div>

                                    <!-- Today Button -->
                                    <button @click="goToToday" class="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200/60 transition-all duration-200">
                                        <icon name="calendar-today" class="w-4 h-4 mr-2" />
                                        Today
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Content -->
                    <div class="timeline-content flex-1 overflow-hidden">
                        <!-- Month View -->
                        <div v-if="currentView === 'month'" class="month-view h-full flex flex-col">
                            <div class="flex-1 overflow-y-auto p-6">
                                <div class="timeline-container">
                                    <div v-for="month in monthsInView" :key="month.month + '-' + month.year" class="mb-8">
                                        <div class="month-header mb-6">
                                            <h3 class="text-xl font-bold text-gray-900">{{ month.name }} {{ month.year }}</h3>
                                            <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2"></div>
                                        </div>

                                        <div class="timeline-events space-y-4">
                                            <div
                                                v-for="task in getTasksForMonth(month.month, month.year)"
                                                :key="task.id"
                                                :class="[
                                                    'timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
                                                    getTaskColorClass(task)
                                                ]"
                                                @click="openTask(task)"
                                            >
                                                <div class="flex items-start justify-between">
                                                    <div class="flex-1">
                                                        <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
                                                        <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">{{ task.description }}</p>
                                                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span v-if="task.project" class="flex items-center">
                                                                <div class="project__color w-4 h-4 rounded-full inline-block mr-1" :aria-label="task.project.title"
                                                                     :style="[task.project.background?{background: 'url('+task.project.background.image+')'}:{}]"
                                                                ></div>
                                                                {{ task.project.title }}
                                                            </span>
                                                            <span v-if="task.list" class="flex items-center">
                                                                <icon name="list" class="w-3 h-3 mr-1" />
                                                                {{ task.list.title }}
                                                            </span>
                                                            <span v-if="task.due_date" class="flex items-center">
                                                                <icon name="calendar" class="w-3 h-3 mr-1" />
                                                                {{ formatDate(task.due_date) }}
                                                            </span>
                                                            <span v-if="task.assignees && task.assignees.length" class="flex items-center">
                                                                <icon name="user" class="w-3 h-3 mr-1" />
                                                                {{ task.assignees.length }} assignee(s)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center space-x-2 ml-4">
                                                        <div v-if="task.taskLabels && task.taskLabels.length" class="flex space-x-1">
                                                            <span
                                                                v-for="label in task.taskLabels.slice(0, 3)"
                                                                :key="label.id"
                                                                :style="{ backgroundColor: label.label.color + '20', color: label.label.color }"
                                                                class="px-2 py-1 rounded-full text-xs font-medium"
                                                            >
                                                                {{ label.label.name }}
                                                            </span>
                                                        </div>
                                                        <div v-if="isOverdue(task)" class="text-red-500">
                                                            <icon name="exclamation-triangle" class="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Week View -->
                        <div v-else-if="currentView === 'week'" class="week-view h-full flex flex-col">
                            <div class="flex-1 overflow-y-auto p-6">
                                <div class="timeline-container">
                                    <div v-for="week in weeksInView" :key="week.start.toISOString()" class="mb-8">
                                        <div class="week-header mb-6">
                                            <h3 class="text-lg font-bold text-gray-900">
                                                {{ formatWeekRange(week.start, week.end) }}
                                            </h3>
                                            <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2"></div>
                                        </div>

                                        <div class="timeline-events space-y-3">
                                            <div
                                                v-for="task in getTasksForWeek(week.start, week.end)"
                                                :key="task.id"
                                                :class="[
                                                    'timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
                                                    getTaskColorClass(task)
                                                ]"
                                                @click="openTask(task)"
                                            >
                                                <div class="flex items-start justify-between">
                                                    <div class="flex-1">
                                                        <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
                                                        <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">{{ task.description }}</p>
                                                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span v-if="task.list" class="flex items-center">
                                                                <icon name="list" class="w-3 h-3 mr-1" />
                                                                {{ task.list.title }}
                                                            </span>
                                                            <span v-if="task.due_date" class="flex items-center">
                                                                <icon name="calendar" class="w-3 h-3 mr-1" />
                                                                {{ formatDate(task.due_date) }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center space-x-2 ml-4">
                                                        <div v-if="task.taskLabels && task.taskLabels.length" class="flex space-x-1">
                                                            <span
                                                                v-for="label in task.taskLabels.slice(0, 2)"
                                                                :key="label.id"
                                                                :style="{ backgroundColor: label.label.color + '20', color: label.label.color }"
                                                                class="px-2 py-1 rounded-full text-xs font-medium"
                                                            >
                                                                {{ label.label.name }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Day View -->
                        <div v-else-if="currentView === 'day'" class="day-view h-full flex flex-col">
                            <div class="flex-1 overflow-y-auto p-6">
                                <div class="timeline-container">
                                    <div class="day-header mb-6">
                                        <h3 class="text-xl font-bold text-gray-900">{{ formatFullDate(selectedDate) }}</h3>
                                        <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2"></div>
                                    </div>

                                    <div class="timeline-events space-y-3">
                                        <div
                                            v-for="task in getTasksForDay(selectedDate)"
                                            :key="task.id"
                                            :class="[
                                                'timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
                                                getTaskColorClass(task)
                                            ]"
                                            @click="openTask(task)"
                                        >
                                            <div class="flex items-start justify-between">
                                                <div class="flex-1">
                                                    <h4 class="font-semibold text-gray-900 mb-1">{{ task.title }}</h4>
                                                    <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">{{ task.description }}</p>
                                                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span v-if="task.list" class="flex items-center">
                                                            <icon name="list" class="w-3 h-3 mr-1" />
                                                            {{ task.list.title }}
                                                        </span>
                                                        <span v-if="task.due_date" class="flex items-center">
                                                            <icon name="calendar" class="w-3 h-3 mr-1" />
                                                            {{ formatDate(task.due_date) }}
                                                        </span>
                                                        <span v-if="task.assignees && task.assignees.length" class="flex items-center">
                                                            <icon name="user" class="w-3 h-3 mr-1" />
                                                            {{ task.assignees.length }} assignee(s)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="flex items-center space-x-2 ml-4">
                                                    <div v-if="task.taskLabels && task.taskLabels.length" class="flex space-x-1">
                                                        <span
                                                            v-for="label in task.taskLabels.slice(0, 3)"
                                                            :key="label.id"
                                                            :style="{ backgroundColor: label.label.color + '20', color: label.label.color }"
                                                            class="px-2 py-1 rounded-full text-xs font-medium"
                                                        >
                                                            {{ label.label.name }}
                                                        </span>
                                                    </div>
                                                    <div v-if="isOverdue(task)" class="text-red-500">
                                                        <icon name="exclamation-triangle" class="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                        <p class="text-gray-600">Loading timeline...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Task Details Modal -->
      <task-details v-if="taskDetailsOpen" :id="taskDetailsId" view="timeline" :isPopup="true" @closeModal="closeDetails()" />
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head, Link } from '@inertiajs/vue3'
import WorkspaceViewMenu from '@/Shared/WorkspaceViewMenu.vue'
import Icon from '@/Shared/Icon.vue'
import TaskDetails from '@/Shared/Modals/TaskDetails.vue'
import moment_timezone from 'moment-timezone'

export default {
    metaInfo: { title: 'Timeline' },
    layout: Layout,
    components: {
        Head,
        Link,
        WorkspaceViewMenu,
        Icon,
        TaskDetails,
    },
    props: {
        title: String,
        workspace: Object,
        tasks: Array,
        filters: Object,
    },
    data() {
        return {
            timelineReady: false,
            open_filter: false,
            currentView: 'month',
            selectedDate: new Date(),
            currentDate: new Date(),
            availableViews: [
                { key: 'month', label: 'Month', icon: 'calendar', description: 'Monthly timeline view' },
                { key: 'week', label: 'Week', icon: 'calendar-week', description: 'Weekly timeline view' },
                { key: 'day', label: 'Day', icon: 'calendar-day', description: 'Daily timeline view' },
            ],
            moment: null,
            // Task details popup properties
            taskDetailsOpen: false,
            taskDetailsId: null,
            td_pop: true,
            // Form object for filters and task details
            form: {
                range: { start: '', end: '' },
                period: 'timeline',
                task: null
            }
        }
    },
    computed: {
        currentPeriodTitle() {
            switch (this.currentView) {
                case 'year':
                    return this.moment(this.currentDate).format('YYYY')
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
        currentPeriodSubtitle() {
            switch (this.currentView) {
                case 'year':
                    return 'Yearly timeline view'
                case 'month':
                    return 'Monthly timeline view'
                case 'week':
                    return 'Weekly timeline view'
                case 'day':
                    return 'Daily timeline view'
                default:
                    return 'Timeline view'
            }
        },
        monthsInView() {
            const months = []
            const startDate = this.moment(this.currentDate).startOf('month')
            const endDate = this.moment(this.currentDate).endOf('month')

            let current = this.moment(startDate)
            while (current.isSameOrBefore(endDate, 'month')) {
                months.push({
                    month: current.month(),
                    year: current.year(),
                    name: current.format('MMMM')
                })
                current.add(1, 'month')
            }

            return months
        },
        weeksInView() {
            const weeks = []
            const startDate = this.moment(this.selectedDate).startOf('week')
            const endDate = this.moment(this.selectedDate).endOf('week')

            let current = this.moment(startDate)
            while (current.isSameOrBefore(endDate, 'week')) {
                weeks.push({
                    start: current.toDate(),
                    end: this.moment(current).endOf('week').toDate()
                })
                current.add(1, 'week')
            }

            return weeks
        }
    },
    methods: {
        changeView(view) {
            this.currentView = view
            this.updateFormRange()
        },
        navigatePeriod(direction) {
            switch (this.currentView) {
                case 'year':
                    this.currentDate = this.moment(this.currentDate).add(direction, 'year').toDate()
                    break
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
        updateFormRange() {
            let start, end

            switch (this.currentView) {
                case 'year':
                    start = this.moment(this.currentDate).startOf('year')
                    end = this.moment(this.currentDate).endOf('year')
                    break
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
            this.form.period = 'timeline'
        },
        getTasksForMonth(month, year) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.month() === month && taskDate.year() === year
            })
        },
        getTasksForWeek(startDate, endDate) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isBetween(this.moment(startDate), this.moment(endDate), 'day', '[]')
            })
        },
        getTasksForDay(date) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(date), 'day')
            })
        },
        getTaskColorClass(task) {
            if (task.is_done) {
                return 'bg-green-50 border-green-400 hover:bg-green-100'
            }
            if (this.isOverdue(task)) {
                return 'bg-red-50 border-red-400 hover:bg-red-100'
            }
            if (this.isHighPriority(task)) {
                return 'bg-orange-50 border-orange-400 hover:bg-orange-100'
            }
            return 'bg-blue-50 border-blue-400 hover:bg-blue-100'
        },
        getTaskTooltip(task) {
            let tooltip = task.title
            if (task.description) {
                tooltip += `\n${task.description}`
            }
            if (task.assignees && task.assignees.length) {
                tooltip += `\nAssigned to: ${task.assignees.map(a => a.user.name).join(', ')}`
            }
            return tooltip
        },
        isOverdue(task) {
            return task.due_date && this.moment(task.due_date).isBefore(this.moment()) && !task.is_done
        },
        isHighPriority(task) {
            return task.taskLabels && task.taskLabels.some(label => label.label.name.toLowerCase().includes('high'))
        },
        isToday(date) {
            return this.moment(date).isSame(this.moment(), 'day')
        },
        formatFullDate(date) {
            return this.moment(date).format('dddd, MMMM Do, YYYY')
        },
        formatDate(date) {
            return this.moment(date).format('MMM D, YYYY')
        },
        formatWeekRange(start, end) {
            const startFormatted = this.moment(start).format('MMM D')
            const endFormatted = this.moment(end).format('MMM D, YYYY')
            return `${startFormatted} - ${endFormatted}`
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
        initializeTimeline() {
            this.updateFormRange()
            this.timelineReady = true
        }
    },
    mounted() {
        this.initializeTimeline()
    },
    created() {
        this.moment = moment_timezone
    }
}
</script>

<style scoped>
/* Enhanced Timeline Layout */
.timeline-container {
    position: relative;
}

.timeline-event {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-event::before {
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

.timeline-event:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom scrollbar */
.timeline-content::-webkit-scrollbar {
    width: 6px;
}

.timeline-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.timeline-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.timeline-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
