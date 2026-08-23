<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <board-view-menu :project="project" @filter-toggle="open_filter = !open_filter" :filters="filters" view="calendar" />

            <!-- Enhanced Calendar Container -->
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
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
                                            <p v-if="khPeriodLabel" class="text-xs text-indigo-600 mt-1 font-semibold khmer-lunar-text leading-snug">{{ khPeriodLabel }}</p>
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
                                            :title="$t(view.description)"
                                        >
                                            <icon :name="view.icon" class="w-4 h-4 mr-2" />
                                            {{ $t(view.label) }}
                                        </button>
                                    </div>

                                    <!-- Quick Actions -->
                                    <div class="flex items-center gap-2">
                                        <button
                                            @click="toggleKhmerCalendar"
                                            :class="[
                                                'flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border',
                                                khmerCalendarOn
                                                    ? 'text-white bg-amber-500 border-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200'
                                                    : 'text-gray-400 bg-white border-dashed border-gray-300 hover:text-gray-600 hover:border-gray-400'
                                            ]"
                                            :aria-pressed="khmerCalendarOn ? 'true' : 'false'"
                                            :title="khmerCalendarOn ? $t('Hide the Khmer lunar calendar') : $t('Show the Khmer lunar calendar')"
                                        >
                                            <icon name="moon" class="w-4 h-4 mr-2" />
                                            {{ $t('Lunar') }}
                                        </button>
                                        <button @click="goToToday" class="flex items-center px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-all duration-200 border border-indigo-200/60">
                                            <icon name="calendar" class="w-4 h-4 mr-2" />
                                            {{ $t('Today') }}
                                        </button>
                                        <button @click="refreshCalendar" class="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-200/60" :title="$t('Refresh')">
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
                                <div v-for="(day, dayIndex) in calendarWeekdays" :key="dayIndex" class="px-4 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200/40 last:border-r-0 bg-white/60">
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
                                    <div class="flex items-center justify-between mb-3" :title="khmerCalendarOn ? khTooltip(day.date) : ''">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <div :class="[
                                                'text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0',
                                                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                                day.isToday ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' : 'group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                            ]">
                                                {{ khNum(day.date.getDate()) }}
                                            </div>
                                            <div v-if="khmerCalendarOn" class="min-w-0 leading-tight">
                                                <div :class="[
                                                    'text-[11px] font-semibold truncate khmer-lunar-text',
                                                    khIsSilaDay(day.date) ? 'text-amber-600' : (day.isCurrentMonth ? 'text-indigo-500' : 'text-gray-400')
                                                ]">
                                                    <span v-if="khIsSilaDay(day.date)" class="mr-0.5" :title="$t('Precept Day')">🧘</span>{{ khDayLabel(day.date) }}
                                                </div>
                                                <div v-if="khNote(day.date)" class="text-[10px] font-medium text-gray-400 truncate khmer-lunar-text">
                                                    {{ khNote(day.date) }}
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="getTasksForDay(day.date).length > 0" class="flex items-center">
                                            <div class="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full shadow-sm">
                                                {{ khNum(getTasksForDay(day.date).length) }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Khmer notable day -->
                                    <div
                                        v-for="(event, eventIndex) in khEvents(day.date).slice(0, 1)"
                                        :key="`${event.key}-${eventIndex}`"
                                        :class="[
                                            'mb-2 truncate rounded-lg px-2 py-1 text-[11px] font-semibold khmer-lunar-text',
                                            event.type === 'national' ? 'bg-rose-100/80 text-rose-700' : 'bg-emerald-100/80 text-emerald-700'
                                        ]"
                                        :title="event.title"
                                    >
                                        {{ event.title }}
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
                                                    {{ khNum(moment(task.due_date).format('HH:mm')) }}
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
                                            {{ khNum(getTasksForDay(day.date).length - 3) }} {{ $t('more') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Week View -->
                        <div v-else-if="currentView === 'week'" class="week-view h-full flex flex-col">
                            <!-- Week Header -->
                            <div class="grid grid-cols-8 border-b bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 sticky top-0 z-10">
                                <div class="p-4 border-r border-gray-200/40 bg-white/60">
                                    <span class="text-sm font-bold text-gray-700">{{ $t('Time') }}</span>
                                </div>
                                <div v-for="day in weekDays" :key="day.toISOString()" class="p-4 text-center border-r border-gray-200/40 last:border-r-0 bg-white/60">
                                    <div class="text-sm font-bold text-gray-700">{{ formatWeekDay(day) }}</div>
                                    <div :class="[
                                        'text-xl font-bold mt-2 w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all duration-200',
                                        isToday(day) ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' : 'text-gray-900 hover:bg-indigo-100'
                                    ]">
                                        {{ khNum(day.getDate()) }}
                                    </div>
                                    <div v-if="khmerCalendarOn" class="text-[11px] font-semibold text-indigo-500 mt-1 khmer-lunar-text" :title="khTooltip(day)">
                                        {{ khDayLabel(day) }}
                                    </div>
                                    <div class="text-xs text-indigo-600 mt-2 font-semibold bg-indigo-100 px-2 py-1 rounded-full">
                                        {{ $t(':count tasks', { count: khNum(getTasksForDay(day).length) }) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Week Grid with Time Slots -->
                            <div class="flex-1 overflow-y-auto">
                                <div class="grid grid-cols-8 min-h-full">
                                    <!-- Time Column -->
                                    <div class="border-r border-gray-200/40 bg-gray-50/60">
                                        <div v-for="hour in timeSlots" :key="hour" class="border-b border-gray-200/40 h-16 p-2 flex items-center">
                                            <span class="text-xs text-gray-600 font-semibold">{{ formatHour(hour) }}</span>
                                        </div>
                                    </div>

                                    <!-- Week Days -->
                                    <div v-for="day in weekDays" :key="day.toISOString()" class="border-r border-gray-200/40 last:border-r-0">
                                        <div v-for="hour in timeSlots" :key="hour" class="border-b border-gray-200/40 h-16 p-1 relative hover:bg-indigo-50/50 transition-all duration-200 group">
                                            <!-- Tasks for this hour -->
                                            <div class="space-y-1">
                                                <div
                                                    v-for="task in getTasksForHour(day, hour)"
                                                    :key="task.id"
                                                    :class="[
                                                        'text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4',
                                                        getTaskColorClass(task)
                                                    ]"
                                                    :title="getTaskTooltip(task)"
                                                    @click="openTask(task)"
                                                >
                                                    <div class="font-semibold truncate">{{ task.title }}</div>
                                                    <div v-if="task.list" class="text-xs opacity-75 mt-1 truncate">{{ task.list.title }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Day View -->
                        <div v-else-if="currentView === 'day'" class="day-view h-full flex">
                            <!-- Time Column -->
                            <!-- Day Content -->
                            <div class="flex-1">
                                <!-- Day Header -->
                                <div class="sticky top-0 bg-gradient-to-r from-indigo-50 to-blue-50/60 p-6 border-b border-gray-200/60 z-10 shadow-sm">
                                    <h3 class="text-2xl font-bold text-gray-900">{{ formatFullDate(selectedDate) }}</h3>
                                    <khmer-date-card v-if="khmerCalendarOn" :date="selectedDate" :locale="khLocale" class="mt-3" />
                                    <div class="flex items-center justify-between mt-2">
                                        <p class="text-sm text-gray-600">{{ $t(':count tasks scheduled', { count: khNum(getTasksForDay(selectedDate).length) }) }}</p>
                                        <div class="flex items-center space-x-4 text-sm">
                                            <span class="text-emerald-600 font-semibold">{{ $t(':count completed', { count: khNum(getCompletedTasksForDay(selectedDate)) }) }}</span>
                                            <span class="text-red-600 font-semibold">{{ $t(':count overdue', { count: khNum(getOverdueTasksForDay(selectedDate)) }) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Time Slots -->
                                <div class="relative">
                                    <div v-for="hour in timeSlots" :key="hour" class="border-b border-gray-200/40 h-20 p-4 hover:bg-indigo-50/30 transition-all duration-200 group">
                                        <!-- Hour label for context -->
                                        <div class="text-xs text-gray-400 font-medium mb-2">{{ formatHour(hour) }}</div>

                                        <!-- Tasks for this hour -->
                                        <div class="space-y-2">
                                            <div
                                                v-for="task in getTasksForHour(selectedDate, hour)"
                                                :key="task.id"
                                                :class="[
                                                    'p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 backdrop-blur-sm',
                                                    getTaskColorClass(task)
                                                ]"
                                                @click="openTask(task)"
                                            >
                                                <div class="flex items-start justify-between">
                                                    <div class="flex-1">
                                                        <h5 class="font-bold text-gray-900 mb-1">{{ task.title }}</h5>
                                                        <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">{{ task.description }}</p>
                                                        <div class="flex items-center space-x-4 text-xs">
                                                            <span v-if="task.due_date" class="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">{{ khNum(moment(task.due_date).format('HH:mm')) }}</span>
                                                            <span v-if="task.list" class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-medium">{{ task.list.title }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center space-x-2 ml-4">
                                                        <!-- Assignee Avatars -->
                                                        <div v-if="task.assignees && task.assignees.length > 0" class="flex -space-x-1">
                                                            <img
                                                                v-for="assignee in task.assignees.slice(0, 3)"
                                                                :key="assignee.id"
                                                                :src="assignee.user.photo_path || '/images/user.svg'"
                                                                :alt="assignee.user.name"
                                                                class="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                                :title="assignee.user.name"
                                                            />
                                                        </div>
                                                        <!-- Status Badge -->
                                                        <span v-if="task.is_done" class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-semibold">{{ $t('Done') }}</span>
                                                        <span v-else-if="isOverdue(task)" class="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse font-semibold">{{ $t('Overdue') }}</span>
                                                        <span v-else class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">{{ $t('Active') }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- All Day Tasks Section -->
                                    <div v-if="getAllDayTasks(selectedDate).length > 0" class="bg-gradient-to-r from-yellow-50 to-amber-50 border-t-2 border-yellow-200 p-6 mt-4">
                                        <h4 class="font-bold text-gray-900 mb-4 flex items-center">
                                            <icon name="calendar" class="w-5 h-5 mr-2 text-amber-600" />
                                            {{ $t('All Day Tasks') }}
                                        </h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div
                                                v-for="task in getAllDayTasks(selectedDate)"
                                                :key="task.id"
                                                :class="[
                                                    'p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4',
                                                    getTaskColorClass(task)
                                                ]"
                                                @click="openTask(task)"
                                            >
                                                <div class="flex items-center justify-between">
                                                    <h5 class="font-semibold text-gray-900 flex-1">{{ task.title }}</h5>
                                                    <span v-if="task.list" class="text-xs text-gray-600 bg-white px-2 py-1 rounded-lg ml-2">{{ task.list.title }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Year View -->
                        <div v-else-if="currentView === 'year'" class="year-view h-full p-6">
                            <!-- Year Overview Stats -->
                            <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/60">
                                    <div class="text-2xl font-bold text-blue-700">{{ khNum(getYearTaskCount()) }}</div>
                                    <div class="text-sm text-blue-600 font-medium">{{ $t('Total Tasks') }}</div>
                                </div>
                                <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200/60">
                                    <div class="text-2xl font-bold text-emerald-700">{{ khNum(getYearCompletedTaskCount()) }}</div>
                                    <div class="text-sm text-emerald-600 font-medium">{{ $t('Completed') }}</div>
                                </div>
                                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/60">
                                    <div class="text-2xl font-bold text-amber-700">{{ khNum(getYearPendingTaskCount()) }}</div>
                                    <div class="text-sm text-amber-600 font-medium">{{ $t('Pending') }}</div>
                                </div>
                                <div class="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-xl border border-red-200/60">
                                    <div class="text-2xl font-bold text-red-700">{{ khNum(getYearOverdueTaskCount()) }}</div>
                                    <div class="text-sm text-red-600 font-medium">{{ $t('Overdue') }}</div>
                                </div>
                            </div>

                            <!-- Monthly Grid -->
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full overflow-y-auto">
                                <div
                                    v-for="month in yearMonths"
                                    :key="month.month"
                                    class="year-month-card bg-white rounded-2xl border border-gray-200/60 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                    @click="selectMonth(month)"
                                >
                                    <!-- Month Header -->
                                    <div class="p-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-indigo-50/30">
                                        <h4 class="font-bold text-gray-900 text-lg">{{ month.name }}</h4>
                                        <div class="flex items-center justify-between mt-2">
                                            <p class="text-sm text-gray-600 font-medium">{{ $t(':count tasks', { count: khNum(month.taskCount) }) }}</p>
                                            <div class="flex items-center space-x-2">
                                                <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">{{ khNum(month.completedTasks) }}</span>
                                                <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">{{ khNum(month.overdueTasks) }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Mini Calendar -->
                                    <div class="p-4">
                                        <!-- Days of Week -->
                                        <div class="grid grid-cols-7 gap-1 mb-2">
                                            <div v-for="(day, miniIndex) in miniCalendarWeekdays" :key="miniIndex" class="text-xs text-gray-500 text-center font-bold">
                                                {{ day }}
                                            </div>
                                        </div>
                                        <!-- Calendar Days -->
                                        <div class="grid grid-cols-7 gap-1">
                                            <div
                                                v-for="(day, index) in month.days"
                                                :key="index"
                                                :class="[
                                                    'text-xs text-center p-2 rounded-lg transition-all duration-200 cursor-pointer',
                                                    day.isCurrentMonth ? 'text-gray-900 hover:bg-indigo-50' : 'text-gray-300',
                                                    day.isToday ? 'bg-indigo-600 text-white font-bold shadow-lg ring-2 ring-indigo-200' : '',
                                                    day.taskCount > 0 && !day.isToday ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold' : 'hover:bg-gray-100',
                                                    day.hasOverdue ? 'ring-2 ring-red-300' : ''
                                                ]"
                                                :title="miniDayTooltip(day)"
                                            >
                                                {{ khNum(day.date.getDate()) }}
                                                <div v-if="day.taskCount > 0" class="flex justify-center mt-0.5">
                                                    <div :class="[
                                                        'w-1.5 h-1.5 rounded-full',
                                                        day.hasOverdue ? 'bg-red-500' : day.isToday ? 'bg-white' : 'bg-blue-500'
                                                    ]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Task Summary -->
                                    <div class="p-4 border-t border-gray-200/60 bg-gray-50/60">
                                        <div class="grid grid-cols-3 gap-2 text-xs">
                                            <div class="text-center">
                                                <div class="font-bold text-emerald-600">{{ khNum(month.completedTasks) }}</div>
                                                <div class="text-gray-500">{{ $t('Done') }}</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="font-bold text-blue-600">{{ khNum(month.taskCount - month.completedTasks - month.overdueTasks) }}</div>
                                                <div class="text-gray-500">{{ $t('Active') }}</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="font-bold text-red-600">{{ khNum(month.overdueTasks) }}</div>
                                                <div class="text-gray-500">{{ $t('Overdue') }}</div>
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
        
        <!-- Task Details Popup -->
        <task-details v-if="taskDetailsOpen" :id="taskDetailsId" view="calendar" :isPopup="td_pop" @closeModal="closeDetails()" />
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head, Link } from '@inertiajs/vue3'
import moment_timezone from 'moment-timezone'
import { ref } from 'vue'
import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
import Icon from '@/Shared/Icon.vue'
import KhmerDateCard from '@/Shared/KhmerDateCard.vue'
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin'
import TaskDetails from '@/Shared/Modals/TaskDetails.vue'

export default {
    metaInfo: { title: 'Calendar' },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    components: {
        Head,
        Link,
        BoardViewMenu,
        Icon,
        KhmerDateCard,
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
                period: 'calendar',
                task: null
            },
            moment: null,
            // Task details popup properties
            taskDetailsOpen: false,
            taskDetailsId: null,
            td_pop: true
        }
    },
    computed: {
        currentPeriodTitle() {
            switch (this.currentView) {
                case 'year':
                    return this.khNum(this.currentDate.getFullYear())
                case 'month':
                    return this.khMonthYear(this.currentDate)
                case 'week':
                    const weekStart = this.moment(this.selectedDate).startOf('week')
                    const weekEnd = this.moment(this.selectedDate).endOf('week')
                    return `${this.khShortDate(weekStart.toDate())} - ${this.khShortDate(weekEnd.toDate(), true)}`
                case 'day':
                    return this.khFullDate(this.selectedDate)
                default:
                    return this.khMonthYear(this.currentDate)
            }
        },
        currentPeriodSubtitle() {
            const totalTasks = this.tasks.length
            const completedTasks = this.tasks.filter(task => task.is_done).length
            return this.$t(':count tasks, :done completed', {
                count: this.khNum(totalTasks),
                done: this.khNum(completedTasks),
            })
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
        },
        weekDays() {
            const days = []
            const startOfWeek = this.moment(this.selectedDate).startOf('week')
            for (let i = 0; i < 7; i++) {
                days.push(startOfWeek.clone().add(i, 'day').toDate())
            }
            return days
        },
        yearMonths() {
            const months = []
            const currentYear = this.moment(this.currentDate).year()

            for (let i = 0; i < 12; i++) {
                const monthStart = this.moment().year(currentYear).month(i).startOf('month')
                const monthEnd = this.moment().year(currentYear).month(i).endOf('month')

                // Generate mini calendar days
                const startOfCalendar = monthStart.clone().startOf('week')
                const endOfCalendar = monthEnd.clone().endOf('week')
                const days = []

                let current = startOfCalendar.clone()
                while (current.isSameOrBefore(endOfCalendar)) {
                    const dayTasks = this.getTasksForDay(current.toDate())
                    const hasOverdue = dayTasks.some(task => this.isOverdue(task))
                    days.push({
                        date: current.toDate(),
                        isCurrentMonth: current.isSame(monthStart, 'month'),
                        isToday: current.isSame(this.moment(), 'day'),
                        taskCount: dayTasks.length,
                        hasOverdue: hasOverdue
                    })
                    current.add(1, 'day')
                }

                const monthTasks = this.getTasksForMonth(monthStart.toDate())
                months.push({
                    month: i,
                    name: this.khSolarMonth(i),
                    days: days,
                    taskCount: monthTasks.length,
                    completedTasks: monthTasks.filter(t => t.is_done).length,
                    overdueTasks: monthTasks.filter(t => this.isOverdue(t)).length
                })
            }
            return months
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
        getTasksForHour(date, hour) {
            return this.tasks.filter(task => {
                if (!task.due_date) return false
                const taskDate = this.moment(task.due_date)
                return taskDate.isSame(this.moment(date), 'day') && taskDate.hour() === hour
            })
        },
        getAllDayTasks(date) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(date), 'day') && !task.due_date
            })
        },
        getTasksForMonth(date) {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(date), 'month')
            })
        },
        getCompletedTasksForDay(date) {
            return this.getTasksForDay(date).filter(task => task.is_done).length
        },
        getOverdueTasksForDay(date) {
            return this.getTasksForDay(date).filter(task => this.isOverdue(task)).length
        },
        getYearTaskCount() {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(this.currentDate), 'year')
            }).length
        },
        getYearCompletedTaskCount() {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(this.currentDate), 'year') && task.is_done
            }).length
        },
        getYearPendingTaskCount() {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(this.currentDate), 'year') && !task.is_done && !this.isOverdue(task)
            }).length
        },
        getYearOverdueTaskCount() {
            return this.tasks.filter(task => {
                const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at)
                return taskDate.isSame(this.moment(this.currentDate), 'year') && this.isOverdue(task)
            }).length
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
                tooltip += `\n${this.$t('Due')}: ${this.khShortDate(task.due_date, true)} ${this.khNum(this.moment(task.due_date).format('HH:mm'))}`
            }
            if (task.assignees && task.assignees.length > 0) {
                tooltip += `\n${this.$t('Assigned to')}: ${task.assignees.map(a => a.user.name).join(', ')}`
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
        formatFullDate(date) {
            return this.khFullDate(date)
        },
        formatWeekDay(date) {
            return this.khWeekdayName(date)
        },
        formatHour(hour) {
            return this.khNum(this.moment().hour(hour).minute(0).format('HH:mm'))
        },
        miniDayTooltip(day) {
            const label = this.$t(':count tasks', { count: this.khNum(day.taskCount) })
            return day.hasOverdue ? `${label} — ${this.$t('Overdue')}` : label
        },
        selectMonth(month) {
            this.currentDate = this.moment().year(this.moment(this.currentDate).year()).month(month.month).toDate()
            this.changeView('month')
        },
        openTask(task) {
            // Open task details popup
            this.taskDetailsPopup(task.id)
        },
        taskDetailsPopup(id) {
            this.form.task = id;
            this.td_pop = true;
            this.taskDetailsId = id;
            this.taskDetailsOpen = true;
        },
        closeDetails() {
            this.form.task = null;
            this.taskDetailsOpen = false;
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

/* Enhanced Year View Cards */
.year-month-card {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.year-month-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: inherit;
}

.year-month-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05);
}

/* Week & Day View Enhancements */
.week-view .time-slot,
.day-view .hour-slot {
    border-bottom: 1px solid rgba(229, 231, 235, 0.6);
    transition: background-color 0.2s ease;
}

.week-view .time-slot:hover,
.day-view .hour-slot:hover {
    background-color: rgba(99, 102, 241, 0.02);
    border-color: rgba(99, 102, 241, 0.2);
}

/* Enhanced Scrollbars */
.calendar-content::-webkit-scrollbar {
    width: 6px;
}

.calendar-content::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 3px;
}

.calendar-content::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

.calendar-content::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
}

/* Line clamp utility */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

    .week-view,
    .day-view {
        display: block;
    }

    .year-view .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .day-view .w-20 {
        width: 4rem;
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
