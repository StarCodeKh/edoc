<template>
    <div class="custom-datetime-picker" :class="{ 'is-open': isOpen }">
        <!-- Input Trigger -->
        <div
            class="datetime-picker-trigger"
            @click="togglePicker"
            @keydown.enter="togglePicker"
            @keydown.space.prevent="togglePicker"
            tabindex="0"
            role="button"
            :aria-expanded="isOpen"
            :aria-label="placeholder"
        >
            <div class="trigger-content">
                <Icon name="calendar" class="w-4 h-4 text-gray-500" />
                <span class="trigger-text">
                    {{ displayValue || placeholder }}
                </span>
                <Icon
                    :name="isOpen ? 'chevron-up' : 'chevron-down'"
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                />
            </div>
        </div>

        <!-- DateTime Picker Dropdown -->
        <Transition name="datetime-picker-fade">
            <div
                v-if="isOpen"
                :class="['datetime-picker-dropdown', { 'modal-positioning': isInModal }]"
                :style="dropdownStyle"
                @click.stop
            >
                <!-- Header -->
                <div class="datetime-picker-header">
                    <h3 class="datetime-picker-title">Select Date & Time</h3>
                    <div class="header-actions">
                        <button @click="toggleFormat" class="format-toggle" type="button">
                            {{ is24HourFormat ? '24H' : '12H' }}
                        </button>
                        <button @click="toggleMode" class="mode-toggle" type="button">
                            {{ currentMode === 'date' ? 'Time' : 'Date' }}
                        </button>
                    </div>
                </div>

                <!-- Mode Tabs -->
                <div class="mode-tabs">
                    <button
                        @click="setMode('date')"
                        :class="['mode-tab', { 'is-active': currentMode === 'date' }]"
                        type="button"
                    >
                        <Icon name="calendar" class="w-4 h-4" />
                        Date
                    </button>
                    <button
                        @click="setMode('time')"
                        :class="['mode-tab', { 'is-active': currentMode === 'time' }]"
                        type="button"
                    >
                        <Icon name="clock" class="w-4 h-4" />
                        Time
                    </button>
                </div>

                <!-- Date Picker Section -->
                <div v-if="currentMode === 'date'" class="date-section">
                    <!-- Month/Year Navigation -->
                    <div class="date-navigation">
                        <button @click="previousMonth" class="nav-button" type="button" aria-label="Previous month">
                            <Icon name="chevron-left" class="w-4 h-4" />
                        </button>

                        <div class="month-year-display">
                            <button @click="showYearPicker = !showYearPicker" class="month-year-button" type="button">
                                {{ currentMonthYear }}
                            </button>
                        </div>

                        <button @click="nextMonth" class="nav-button" type="button" aria-label="Next month">
                            <Icon name="chevron-right" class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Year Picker -->
                    <div v-if="showYearPicker" class="year-picker">
                        <div class="year-grid">
                            <button
                                v-for="year in yearRange"
                                :key="year"
                                @click="selectYear(year)"
                                :class="['year-button', { 'is-selected': year === currentYear }]"
                                type="button"
                            >
                                {{ year }}
                            </button>
                        </div>
                    </div>

                    <!-- Calendar Grid -->
                    <div v-else class="calendar-grid">
                        <!-- Day Headers -->
                        <div class="day-headers">
                            <div v-for="day in dayHeaders" :key="day" class="day-header">
                                {{ day }}
                            </div>
                        </div>

                        <!-- Calendar Days -->
                        <div class="calendar-days">
                            <button
                                v-for="day in calendarDays"
                                :key="`${day.date}-${day.month}`"
                                @click="selectDate(day)"
                                :class="[
                                    'calendar-day',
                                    {
                                        'is-today': day.isToday,
                                        'is-selected': day.isSelected,
                                        'is-other-month': day.isOtherMonth,
                                        'is-disabled': day.isDisabled,
                                    },
                                ]"
                                :disabled="day.isDisabled"
                                type="button"
                            >
                                {{ day.date }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Time Picker Section -->
                <div v-if="currentMode === 'time'" class="time-section">
                    <div class="time-selection">
                        <!-- Hour Selection -->
                        <div class="time-column">
                            <label class="time-label">Hour</label>
                            <div class="time-scroll-container">
                                <div class="time-scroll-list">
                                    <button
                                        v-for="hour in availableHours"
                                        :key="hour.value"
                                        @click="selectHour(hour.value)"
                                        :class="['time-option', { 'is-selected': hour.value === selectedHour }]"
                                        type="button"
                                    >
                                        {{ hour.display }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Minute Selection -->
                        <div class="time-column">
                            <label class="time-label">Minute</label>
                            <div class="time-scroll-container">
                                <div class="time-scroll-list">
                                    <button
                                        v-for="minute in availableMinutes"
                                        :key="minute"
                                        @click="selectMinute(minute)"
                                        :class="['time-option', { 'is-selected': minute === selectedMinute }]"
                                        type="button"
                                    >
                                        {{ minute.toString().padStart(2, '0') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- AM/PM Selection (12-hour format only) -->
                        <div v-if="!is24HourFormat" class="time-column">
                            <label class="time-label">Period</label>
                            <div class="time-scroll-container">
                                <div class="time-scroll-list">
                                    <button
                                        @click="selectPeriod('AM')"
                                        :class="['time-option', { 'is-selected': selectedPeriod === 'AM' }]"
                                        type="button"
                                    >
                                        AM
                                    </button>
                                    <button
                                        @click="selectPeriod('PM')"
                                        :class="['time-option', { 'is-selected': selectedPeriod === 'PM' }]"
                                        type="button"
                                    >
                                        PM
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Time Presets -->
                    <div class="time-presets">
                        <h4 class="presets-title">Quick Select</h4>
                        <div class="presets-grid">
                            <button
                                v-for="preset in timePresets"
                                :key="preset.value"
                                @click="selectPreset(preset)"
                                class="preset-button"
                                type="button"
                            >
                                {{ preset.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="datetime-picker-footer">
                    <button @click="selectNow" class="now-button" type="button">Now</button>
                    <button @click="clearDateTime" class="clear-button" type="button">Clear</button>
                    <button @click="confirmSelection" class="confirm-button" type="button">Done</button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import moment from 'moment';

export default {
    name: 'DateTimePicker',
    components: {
        Icon,
    },
    props: {
        modelValue: {
            type: [Date, String, null],
            default: null,
        },
        placeholder: {
            type: String,
            default: 'Select date & time',
        },
        format: {
            type: String,
            default: 'MMM D, YYYY h:mm A',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        is24Hour: {
            type: Boolean,
            default: false,
        },
        minDate: {
            type: [Date, String, null],
            default: null,
        },
        maxDate: {
            type: [Date, String, null],
            default: null,
        },
        disabledDates: {
            type: Array,
            default: () => [],
        },
    },
    emits: ['update:modelValue', 'change', 'update:is24Hour'],
    data() {
        return {
            isOpen: false,
            currentMode: 'date',
            showYearPicker: false,
            currentDate: moment(),
            selectedDate: null,
            selectedHour: 12,
            selectedMinute: 0,
            selectedPeriod: 'AM',
            localIs24Hour: false,
        };
    },
    computed: {
        displayValue() {
            if (!this.modelValue) return '';
            return moment(this.modelValue).format(this.format);
        },
        is24HourFormat() {
            return this.is24Hour !== undefined ? this.is24Hour : this.localIs24Hour;
        },
        currentMonthYear() {
            return this.currentDate.format('MMMM YYYY');
        },
        currentYear() {
            return this.currentDate.year();
        },
        yearRange() {
            const currentYear = this.currentDate.year();
            const years = [];
            for (let i = currentYear - 10; i <= currentYear + 10; i++) {
                years.push(i);
            }
            return years;
        },
        dayHeaders() {
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        },
        calendarDays() {
            const startOfMonth = this.currentDate.clone().startOf('month');
            const endOfMonth = this.currentDate.clone().endOf('month');
            const startOfCalendar = startOfMonth.clone().startOf('week');
            const endOfCalendar = endOfMonth.clone().endOf('week');

            const days = [];
            const current = startOfCalendar.clone();
            const today = moment();

            while (current.isSameOrBefore(endOfCalendar)) {
                const isToday = current.isSame(today, 'day');
                const isSelected = this.selectedDate && current.isSame(this.selectedDate, 'day');
                const isOtherMonth = !current.isSame(this.currentDate, 'month');
                const isDisabled = this.isDateDisabled(current);

                days.push({
                    date: current.date(),
                    month: current.month(),
                    year: current.year(),
                    moment: current.clone(),
                    isToday,
                    isSelected,
                    isOtherMonth,
                    isDisabled,
                });

                current.add(1, 'day');
            }

            return days;
        },
        availableHours() {
            const hours = [];
            if (this.is24HourFormat) {
                for (let i = 0; i < 24; i++) {
                    hours.push({
                        value: i,
                        display: i.toString().padStart(2, '0'),
                    });
                }
            } else {
                for (let i = 1; i <= 12; i++) {
                    hours.push({
                        value: i,
                        display: i.toString(),
                    });
                }
            }
            return hours;
        },
        availableMinutes() {
            const minutes = [];
            for (let i = 0; i < 60; i += 5) {
                minutes.push(i);
            }
            return minutes;
        },
        timePresets() {
            return [
                { label: '9:00 AM', value: { hour: 9, minute: 0, period: 'AM' } },
                { label: '12:00 PM', value: { hour: 12, minute: 0, period: 'PM' } },
                { label: '1:00 PM', value: { hour: 1, minute: 0, period: 'PM' } },
                { label: '5:00 PM', value: { hour: 5, minute: 0, period: 'PM' } },
                { label: '6:00 PM', value: { hour: 6, minute: 0, period: 'PM' } },
                { label: '9:00 PM', value: { hour: 9, minute: 0, period: 'PM' } },
            ];
        },
        isInModal() {
            return this.$el && this.$el.closest('.fixed.inset-0');
        },
        dropdownStyle() {
            if (!this.isInModal || !this.isOpen) return {};

            const rect = this.$el.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dropdownHeight = 500; // Approximate dropdown height

            // Check if dropdown would go off screen
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top = rect.bottom + 4;
            let left = rect.left;
            let right = 'auto';
            let width = rect.width;

            // If not enough space below, position above
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                top = rect.top - dropdownHeight - 4;
            }

            // Ensure dropdown stays within viewport
            if (left + width > window.innerWidth) {
                left = window.innerWidth - width - 16;
            }
            if (left < 16) {
                left = 16;
            }

            return {
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                right: 'auto',
                width: `${width}px`,
                zIndex: 10000,
            };
        },
    },
    watch: {
        is24Hour: {
            immediate: true,
            handler(newValue) {
                if (newValue !== undefined) {
                    this.localIs24Hour = newValue;
                }
            },
        },
        modelValue: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    const momentTime = moment(newValue);
                    this.selectedDate = momentTime.toDate();
                    this.selectedHour = momentTime.hour();
                    this.selectedMinute = momentTime.minute();
                    this.selectedPeriod = momentTime.format('A');
                } else {
                    this.selectedDate = null;
                    this.selectedHour = this.is24HourFormat ? 0 : 12;
                    this.selectedMinute = 0;
                    this.selectedPeriod = 'AM';
                }
            },
        },
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('resize', this.updatePosition);
        window.addEventListener('scroll', this.updatePosition, true);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('resize', this.updatePosition);
        window.removeEventListener('scroll', this.updatePosition, true);
    },
    methods: {
        togglePicker() {
            if (this.disabled) return;
            this.isOpen = !this.isOpen;
            this.showYearPicker = false;
        },

        toggleFormat() {
            this.localIs24Hour = !this.localIs24Hour;
            // Reset hour selection when switching formats
            if (this.localIs24Hour) {
                this.selectedHour = 0;
            } else {
                this.selectedHour = 12;
            }
            this.selectedPeriod = 'AM';

            // Emit the format change to parent
            this.$emit('update:is24Hour', this.localIs24Hour);
        },

        toggleMode() {
            this.currentMode = this.currentMode === 'date' ? 'time' : 'date';
        },

        setMode(mode) {
            this.currentMode = mode;
        },

        previousMonth() {
            this.currentDate = this.currentDate.clone().subtract(1, 'month');
            this.$nextTick(() => {
                // Force reactivity update
            });
        },

        nextMonth() {
            this.currentDate = this.currentDate.clone().add(1, 'month');
            this.$nextTick(() => {
                // Force reactivity update
            });
        },

        selectYear(year) {
            this.currentDate = this.currentDate.clone().year(year);
            this.showYearPicker = false;
        },

        selectDate(day) {
            if (day.isDisabled) return;

            this.selectedDate = day.moment.toDate();
            this.emitDateTime();
        },

        selectHour(hour) {
            this.selectedHour = hour;
            this.emitDateTime();
        },

        selectMinute(minute) {
            this.selectedMinute = minute;
            this.emitDateTime();
        },

        selectPeriod(period) {
            this.selectedPeriod = period;
            this.emitDateTime();
        },

        selectPreset(preset) {
            this.selectedHour = preset.value.hour;
            this.selectedMinute = preset.value.minute;
            this.selectedPeriod = preset.value.period;
            this.emitDateTime();
        },

        selectNow() {
            const now = moment();
            this.selectedDate = now.toDate();
            this.selectedHour = now.hour();
            this.selectedMinute = now.minute();
            this.selectedPeriod = now.format('A');
            this.emitDateTime();
        },

        clearDateTime() {
            this.selectedDate = null;
            this.selectedHour = this.is24HourFormat ? 0 : 12;
            this.selectedMinute = 0;
            this.selectedPeriod = 'AM';
            this.$emit('update:modelValue', null);
            this.$emit('change', null);
            this.isOpen = false;
        },

        confirmSelection() {
            this.isOpen = false;
        },

        emitDateTime() {
            if (!this.selectedDate) return;

            let hour = this.selectedHour;

            // Convert 12-hour to 24-hour format
            if (!this.is24HourFormat) {
                if (this.selectedPeriod === 'AM' && hour === 12) {
                    hour = 0;
                } else if (this.selectedPeriod === 'PM' && hour !== 12) {
                    hour += 12;
                }
            }

            const dateTime = moment(this.selectedDate)
                .hour(hour)
                .minute(this.selectedMinute)
                .second(0)
                .millisecond(0)
                .toDate();

            this.$emit('update:modelValue', dateTime);
            this.$emit('change', dateTime);
        },

        isDateDisabled(date) {
            if (this.minDate && date.isBefore(this.minDate, 'day')) return true;
            if (this.maxDate && date.isAfter(this.maxDate, 'day')) return true;

            return this.disabledDates.some((disabledDate) => date.isSame(moment(disabledDate), 'day'));
        },

        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isOpen = false;
                this.showYearPicker = false;
            }
        },

        handleKeydown(event) {
            if (!this.isOpen) return;

            switch (event.key) {
                case 'Escape':
                    this.isOpen = false;
                    this.showYearPicker = false;
                    break;
                case 'ArrowLeft':
                    if (this.currentMode === 'date') {
                        event.preventDefault();
                        this.previousMonth();
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentMode === 'date') {
                        event.preventDefault();
                        this.nextMonth();
                    }
                    break;
            }
        },

        updatePosition() {
            if (this.isInModal && this.isOpen) {
                this.$forceUpdate();
            }
        },
    },
};
</script>

<style scoped>
.custom-datetime-picker {
    position: relative;
    display: inline-block;
    width: 100%;
}

.datetime-picker-trigger {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 2.5rem;
}

.datetime-picker-trigger:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
}

.datetime-picker-trigger:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.trigger-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.trigger-text {
    flex: 1;
    text-align: left;
    color: #374151;
    font-size: 0.875rem;
}

.datetime-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 9999;
    margin-top: 0.25rem;
    min-width: 400px;
    max-height: 500px;
    overflow: hidden;
}

.datetime-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.datetime-picker-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.format-toggle,
.mode-toggle {
    padding: 0.25rem 0.75rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
}

.format-toggle:hover,
.mode-toggle:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.mode-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: white;
}

.mode-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    color: #6b7280;
    border-bottom: 2px solid transparent;
}

.mode-tab:hover {
    background: #f3f4f6;
    color: #374151;
}

.mode-tab.is-active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    background: #f0f9ff;
}

.date-section,
.time-section {
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
}

/* Date Section Styles */
.date-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: #f3f4f6;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-button:hover {
    background: #e5e7eb;
}

.month-year-display {
    flex: 1;
    text-align: center;
}

.month-year-button {
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
}

.month-year-button:hover {
    background: #f3f4f6;
}

.year-picker {
    max-height: 200px;
    overflow-y: auto;
}

.year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

.year-button {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.year-button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.year-button.is-selected {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

/* Modal positioning */
.datetime-picker-dropdown.modal-positioning {
    position: fixed !important;
    z-index: 10000 !important;
}

.calendar-grid {
    /* Calendar styles from DatePicker */
}

.day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.day-header {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    padding: 0.5rem 0;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
}

.calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    color: #374151;
    margin: 0 auto;
}

.calendar-day:hover {
    background: #f3f4f6;
}

.calendar-day.is-today {
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
}

.calendar-day.is-selected {
    background: #3b82f6;
    color: white;
}

.calendar-day.is-other-month {
    color: #9ca3af;
}

.calendar-day.is-disabled {
    color: #d1d5db;
    cursor: not-allowed;
}

.calendar-day.is-disabled:hover {
    background: white;
}

/* Time Section Styles */
.time-selection {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.time-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.time-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.time-scroll-container {
    width: 100%;
    max-height: 120px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background: #f9fafb;
}

.time-scroll-list {
    display: flex;
    flex-direction: column;
}

.time-option {
    padding: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    color: #374151;
    text-align: center;
    min-height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.time-option:hover {
    background: #e5e7eb;
}

.time-option.is-selected {
    background: #3b82f6;
    color: white;
}

.time-presets {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
}

.presets-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

.preset-button {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    color: #374151;
}

.preset-button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.datetime-picker-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: white;
}

.now-button,
.clear-button,
.confirm-button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.now-button:hover,
.clear-button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.clear-button {
    color: #dc2626;
    border-color: #fecaca;
}

.clear-button:hover {
    background: #fef2f2;
    border-color: #fca5a5;
}

.confirm-button {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.confirm-button:hover {
    background: #2563eb;
    border-color: #2563eb;
}

/* Animations */
.datetime-picker-fade-enter-active,
.datetime-picker-fade-leave-active {
    transition: all 0.2s ease;
}

.datetime-picker-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.datetime-picker-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
    .datetime-picker-dropdown {
        left: -1rem;
        right: -1rem;
        min-width: auto;
    }

    .time-selection {
        gap: 0.5rem;
    }

    .presets-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .calendar-day {
        width: 2.5rem;
        height: 2.5rem;
    }

    .year-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
