<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <board-view-menu :project="project" @filter-toggle="open_filter = !open_filter" :filters="filters" view="calendar" />
            
            <!-- Enhanced Calendar Container -->
            <div class="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                <div v-if="calendarReady" class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">

                    <!-- Enhanced Calendar Header -->
                    <div class="calendar-header border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white">
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

                                    <!-- Quick Actions -->
                                    <div class="flex items-center gap-2">
                                        <button @click="goToToday" class="flex items-center px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-all duration-200 border border-indigo-200/60">
                                            <icon name="calendar" class="w-4 h-4 mr-2" />
                                            {{ $t('Today') }}
                                        </button>
                                        <button @click="refreshCalendar" class="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-200/60" title="Refresh">
                                            <icon name="refresh" class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Calendar Content -->
                    <div class="calendar-content flex-1 overflow-hidden bg-white">
                        <!-- Month View -->
                        <div v-if="currentView === 'month'" class="month-view h-full flex flex-col">
                            <!-- Days of Week Header -->
                            <div class="grid grid-cols-7 bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 border-b border-gray-200/60">
                                <div v-for="day in daysOfWeek" :key="day" class="px-4 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200/40 last:border-r-0 bg-white/60">
                                    {{ day }}
                                </div>
                            </div>

                            <!-- Calendar Grid -->
                            <div class="grid grid-cols-7 flex-1" style="grid-template-rows: repeat(6, 1fr);">
                                <div
                                    v-for="(day, index) in calendarDays"
                                    :key="index"
                                    :class="[
                                        'border-r border-b border-gray-200/40 last:border-r-0 p-3 min-h-[140px] relative overflow-hidden transition-all duration-300 group',
                                        day.isCurrentMonth ? 'bg-white hover:bg-gray-50/80' : 'bg-gray-50/60 hover:bg-gray-100/80',
                                        day.isToday ? 'bg-gradient-to-br from-indigo-50 to-blue-50/60 ring-2 ring-indigo-200/60 shadow-inner' : '',
                                        'cursor-pointer'
                                    ]"
                                    @click="selectDate(day.date)"
                                >
                                    <!-- Day Header -->
                                    <div class="flex items-center justify-between mb-3">
                                        <div :class="[
                                            'text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                                            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                            day.isToday ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' : 'group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                        ]">
                                            {{ day.date.getDate() }}
                                        </div>
                                        <div v-if="getTasksForDay(day.date).length > 0" class="flex items-center">
                                            <div class="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full shadow-sm">
                                                {{ getTasksForDay(day.date).length }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Tasks for this day -->
                                    <div class="space-y-1.5 flex-1">
                                        <div
                                            v-for="(task, taskIndex) in getTasksForDay(day.date).slice(0, 3)"
                                            :key="task.id"
                                            :class="[
                                                'text-xs p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-white/60 backdrop-blur-sm',
                                                getTaskColorClass(task)
                                            ]"
                                            :title="getTaskTooltip(task)"
                                            @click.stop="openTask(task)"
                                        >
                                            <div class="flex items-center space-x-2">
                                                <div class="flex items-center space-x-1">
                                                    <div v-if="task.is_done" class="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-emerald-200"></div>
                                                    <div v-else-if="isOverdue(task)" class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 animate-pulse shadow-sm ring-2 ring-red-200"></div>
                                                    <div v-else-if="isHighPriority(task)" class="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-amber-200"></div>
                                                    <div v-else class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-blue-200"></div>
                                                </div>
                                                <span class="truncate font-semibold leading-relaxed">{{ task.title }}</span>
                                            </div>

                                            <div class="flex items-center justify-between mt-2">
                                                <span v-if="task.due_date" class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {{ moment(task.due_date).format('HH:mm') }}
                                                </span>
                                                <div class="flex items-center space-x-1.5">
                                                    <div v-if="task.assignees && task.assignees.length > 0" class="flex -space-x-1">
                                                        <img
                                                            v-for="assignee in task.assignees.slice(0, 2)"
                                                            :key="assignee.id"
                                                            :src="assignee.user.photo_path || '/images/user.svg'"
                                                            :alt="assignee.user.name"
                                                            class="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                                            :title="assignee.user.name"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Show more indicator -->
                                        <div v-if="getTasksForDay(day.date).length > 3"
                                             class="text-xs font-semibold text-indigo-600 text-center py-2 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 cursor-pointer border border-indigo-200/60 shadow-sm"
                                             @click.stop="selectDate(day.date)">
                                            <icon name="plus" class="w-3 h-3 inline mr-1" />
                                            {{ getTasksForDay(day.date).length - 3 }} {{ $t('more') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Week View -->
                        <div v-else-if="currentView === 'week'" class="week-view h-full flex flex-col">
                            <div class="p-6 text-center">
                                <h3 class="text-lg font-semibold text-gray-600">Week View</h3>
                                <p class="text-sm text-gray-500 mt-2">Week view implementation coming soon...</p>
                            </div>
                        </div>

                        <!-- Day View -->
                        <div v-else-if="currentView === 'day'" class="day-view h-full flex flex-col">
                            <div class="p-6 text-center">
                                <h3 class="text-lg font-semibold text-gray-600">Day View</h3>
                                <p class="text-sm text-gray-500 mt-2">Day view implementation coming soon...</p>
                            </div>
                        </div>

                        <!-- Year View -->
                        <div v-else-if="currentView === 'year'" class="year-view h-full flex flex-col">
                            <div class="p-6 text-center">
                                <h3 class="text-lg font-semibold text-gray-600">Year View</h3>
                                <p class="text-sm text-gray-500 mt-2">Year view implementation coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head, Link } from '@inertiajs/vue3'
import moment_timezone from 'moment-timezone'
import { ref } from 'vue'
import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
import Icon from '@/Shared/Icon.vue'

export default {
    metaInfo: { title: 'Calendar' },
    layout: Layout,
    components: {
        Head,
        Link,
        BoardViewMenu,
        Icon,
    },
    props: {
        title: String,
        project: Object,
        tasks: Array,
        filters: Object,
    },
    data() {
        return {
            calendarReady: false,
            open_filter: false,
            currentView: 'month',
            selectedDate: new Date(),
            currentDate: new Date(),
            availableViews: [
                { key: 'month', label: 'Month', icon: 'calendar', description: 'Monthly calendar view' },
                { key: 'week', label: 'Week', icon: 'calendar-week', description: 'Weekly calendar view' },
                { key: 'day', label: 'Day', icon: 'calendar-day', description: 'Daily calendar view' },
                { key: 'year', label: 'Year', icon: 'calendar-year', description: 'Yearly calendar view' },
            ],
            daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            timeSlots: Array.from({ length: 24 }, (_, i) => i),
            form: {
                range: { start: '', end: '' },
                period: 'calendar'
            },
            moment: null
        }
    },
    computed: {
        currentPeriodTitle() {
            switch (this.currentView) {
                case 'year':
                    return this.currentDate.getFullYear().toString()
                case 'month':
                    return this.moment(this.currentDate).format('MMMM YYYY')
                case 'week':
                    const weekStart = this.moment(this.selectedDate).startOf('week')
                    const weekEnd = this.moment(this.selectedDate).endOf('week')
                    return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`
                case 'day':
                    return this.moment(this.selectedDate).format('dddd, MMMM D, YYYY')
                default:
                    return this.moment(this.currentDate).format('MMMM YYYY')
            }
        },
        currentPeriodSubtitle() {
            const totalTasks = this.tasks.length
            const completedTasks = this.tasks.filter(task => task.is_done).length
            return `${totalTasks} tasks, ${completedTasks} completed`
        },
        calendarDays() {
            const start = this.moment(this.currentDate).startOf('month').startOf('week')
            const end = this.moment(this.currentDate).endOf('month').endOf('week')
            const days = []
            const current = start.clone()

            while (current.isSameOrBefore(end)) {
                days.push({
                    date: current.toDate(),
                    isCurrentMonth: current.month() === this.currentDate.getMonth(),
                    isToday: current.isSame(this.moment(), 'day')
                })
                current.add(1, 'day')
            }

            return days
        }
    },
    methods: {
        navigatePeriod(direction) {
            const newDate = this.moment(this.currentDate)
            
            switch (this.currentView) {
                case 'year':
                    newDate.add(direction, 'year')
                    break
                case 'month':
                    newDate.add(direction, 'month')
                    break
                case 'week':
                    newDate.add(direction, 'week')
                    this.selectedDate = newDate.toDate()
                    break
                case 'day':
                    newDate.add(direction, 'day')
                    this.selectedDate = newDate.toDate()
                    break
            }
            
            this.currentDate = newDate.toDate()
            this.updateFormRange()
        },
        changeView(view) {
            this.currentView = view
            this.updateFormRange()
        },
        goToToday() {
            this.currentDate = new Date()
            this.selectedDate = new Date()
            this.updateFormRange()
        },
        refreshCalendar() {
            // Refresh calendar data
            this.$inertia.reload({ only: ['tasks'] })
        },
        selectDate(date) {
            this.selectedDate = date
            if (this.currentView === 'month') {
                this.changeView('day')
            }
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
            this.form.period = 'calendar'
        },
        getTasksForDay(date) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(date), 'day')
            })
        },
        getTaskColorClass(task) {
            if (task.is_done) {
                return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200'
            } else if (this.isOverdue(task)) {
                return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200'
            } else if (this.isHighPriority(task)) {
                return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200'
            } else {
                return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200'
            }
        },
        getTaskTooltip(task) {
            let tooltip = task.title
            if (task.due_date) {
                tooltip += `\nDue: ${this.moment(task.due_date).format('MMM D, YYYY HH:mm')}`
            }
            if (task.assignees && task.assignees.length > 0) {
                tooltip += `\nAssigned to: ${task.assignees.map(a => a.user.name).join(', ')}`
            }
            return tooltip
        },
        isOverdue(task) {
            return task.due_date && this.moment(task.due_date).isBefore(this.moment()) && !task.is_done
        },
        isHighPriority(task) {
            return task.labels && task.labels.some(label => label.name.toLowerCase().includes('high'))
        },
        isToday(date) {
            return this.moment(date).isSame(this.moment(), 'day')
        },
        openTask(task) {
            // Navigate to task details
            this.$inertia.visit(this.route('tasks.show', task.id))
        },
        initializeCalendar() {
            this.updateFormRange()
            this.calendarReady = true
        }
    },
    mounted() {
        this.initializeCalendar()
    },
    created() {
        this.moment = moment_timezone
    }
}
</script>

<style scoped>
/* Enhanced Calendar Layout */
.custom-calendar {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.calendar-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.month-view,
.week-view,
.day-view,
.year-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Enhanced Task Cards */
.task-event {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-event::before {
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

.task-event:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 20;
}

/* Enhanced Mobile Responsiveness */
@media (max-width: 768px) {
    .calendar-header {
        padding: 1rem;
    }

    .month-view .grid-cols-7 > div {
        min-height: 100px;
        padding: 0.75rem 0.5rem;
    }

    .task-event {
        padding: 0.5rem;
        font-size: 0.75rem;
    }
}

@media (max-width: 640px) {
    .calendar-header .min-w-\[200px\] {
        min-width: 150px;
    }

    .calendar-header h2 {
        font-size: 1.25rem;
    }

    .month-view .grid-cols-7 > div {
        min-height: 80px;
        padding: 0.5rem 0.25rem;
    }
}

/* Enhanced Focus States */
.task-event:focus,
button:focus {
    outline: 2px solid rgba(99, 102, 241, 0.6);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* Enhanced Transitions */
* {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
