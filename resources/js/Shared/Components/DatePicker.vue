<template>
    <div class="custom-date-picker" :class="{ 'is-open': isOpen }">
        <!-- Input Trigger -->
        <div
            class="date-picker-trigger"
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

        <!-- Calendar Dropdown -->
        <Transition name="calendar-fade">
            <div
                v-if="isOpen"
                :class="['calendar-dropdown', { 'modal-positioning': isInModal }]"
                :style="dropdownStyle"
                @click.stop
            >
                <!-- Header -->
                <div class="calendar-header">
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

                <!-- Footer -->
                <div class="calendar-footer">
                    <button @click="selectToday" class="today-button" type="button">Today</button>
                    <button @click="clearDate" class="clear-button" type="button">Clear</button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import moment from 'moment';

export default {
    name: 'DatePicker',
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
            default: 'Select date',
        },
        format: {
            type: String,
            default: 'MMM D, YYYY',
        },
        disabled: {
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
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            isOpen: false,
            showYearPicker: false,
            currentDate: moment(),
            selectedDate: null,
            // Real size of the rendered calendar, measured on open.
            dropdownWidth: 0,
            dropdownHeight: 0,
        };
    },
    computed: {
        displayValue() {
            if (!this.selectedDate) return '';
            return moment(this.selectedDate).format(this.format);
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
        isInModal() {
            return this.$el && this.$el.closest('.fixed.inset-0');
        },
        /**
         * The calendar is positioned against the viewport whenever it is open,
         * not only inside a modal. Left as `position: absolute; left: 0` it ran
         * off the right edge of the screen for any trigger sitting near it -
         * the Saturday column and the Clear button were simply unreachable.
         */
        dropdownStyle() {
            if (!this.isOpen) return {};

            const rect = this.$el.getBoundingClientRect();
            const gap = 4;
            const margin = 12;
            // The calendar sizes itself; this is the width to keep on screen.
            const width = Math.max(this.dropdownWidth || 0, 280);
            const height = this.dropdownHeight || 400;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top = rect.bottom + gap;
            if (spaceBelow < height + margin && spaceAbove > spaceBelow) {
                top = Math.max(margin, rect.top - height - gap);
            }

            // Prefer the trigger's left edge, but never past either side.
            let left = rect.left;
            if (left + width > window.innerWidth - margin) {
                left = window.innerWidth - width - margin;
            }
            if (left < margin) {
                left = margin;
            }

            return {
                position: 'fixed',
                top: `${Math.round(top)}px`,
                left: `${Math.round(left)}px`,
                right: 'auto',
                // Width is left to the calendar itself - forcing the trigger's
                // width squashed it whenever the trigger was narrow.
                maxHeight: `${Math.max(240, window.innerHeight - top - margin)}px`,
                zIndex: 10000,
            };
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
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    this.selectedDate = moment(newValue).toDate();
                } else {
                    this.selectedDate = null;
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
            if (this.isOpen) this.measureDropdown();
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
            this.$emit('update:modelValue', this.selectedDate);
            this.$emit('change', this.selectedDate);

            // Close picker after selection
            this.isOpen = false;
        },

        selectToday() {
            const today = moment().toDate();
            this.selectedDate = today;
            this.currentDate = moment();
            this.$emit('update:modelValue', today);
            this.$emit('change', today);
            this.isOpen = false;
        },

        clearDate() {
            this.selectedDate = null;
            this.$emit('update:modelValue', null);
            this.$emit('change', null);
            this.isOpen = false;
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
                    event.preventDefault();
                    this.previousMonth();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.nextMonth();
                    break;
            }
        },

        updatePosition() {
            if (this.isOpen) {
                this.$forceUpdate();
            }
        },

        /** Measure the rendered calendar so the clamp works off real numbers
         *  rather than the 280x400 estimate. */
        measureDropdown() {
            this.$nextTick(() => {
                const panel = this.$el && this.$el.querySelector('.calendar-dropdown');
                if (!panel) return;
                this.dropdownWidth = panel.offsetWidth;
                this.dropdownHeight = panel.offsetHeight;
                this.$forceUpdate();
            });
        },
    },
};
</script>

<style scoped>
.custom-date-picker {
    position: relative;
    display: inline-block;
    width: 100%;
}

.date-picker-trigger {
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

.date-picker-trigger:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
}

.date-picker-trigger:focus {
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

.calendar-dropdown {
    /* position / top / left come from dropdownStyle, measured against the
       viewport so the panel cannot run off screen or be clipped. */
    position: fixed;
    width: max-content;
    max-width: calc(100vw - 24px);
    overflow-y: auto;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 9999;
    /* No margin: dropdownStyle already leaves the gap, and a margin here would
       push the panel the wrong way when it flips above the trigger. */
    min-width: 280px;
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
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
    padding: 1rem;
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

/* Modal positioning */
.calendar-dropdown.modal-positioning {
    position: fixed !important;
    z-index: 10000 !important;
}

.year-button.is-selected {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.calendar-grid {
    padding: 1rem;
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

.calendar-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 0 0 0.5rem 0.5rem;
}

.today-button,
.clear-button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.today-button:hover,
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

/* Animations */
.calendar-fade-enter-active,
.calendar-fade-leave-active {
    transition: all 0.2s ease;
}

.calendar-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.calendar-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
    /* left / right are set inline from the measured position now; only the
       size of the grid changes on a small screen. */
    .calendar-dropdown {
        min-width: auto;
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
