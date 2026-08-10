<template>
    <div class="custom-time-picker" :class="{ 'is-open': isOpen }">
        <!-- Input Trigger -->
        <div 
            class="time-picker-trigger"
            @click="togglePicker"
            @keydown.enter="togglePicker"
            @keydown.space.prevent="togglePicker"
            tabindex="0"
            role="button"
            :aria-expanded="isOpen"
            :aria-label="placeholder"
        >
            <div class="trigger-content">
                <Icon name="clock" class="w-4 h-4 text-gray-500" />
                <span class="trigger-text">
                    {{ displayValue || placeholder }}
                </span>
                <Icon 
                    :name="isOpen ? 'chevron-up' : 'chevron-down'" 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                />
            </div>
        </div>

        <!-- Time Picker Dropdown -->
        <Transition name="time-picker-fade">
            <div 
                v-if="isOpen" 
                class="time-picker-dropdown"
                @click.stop
            >
                <!-- Header -->
                <div class="time-picker-header">
                    <h3 class="time-picker-title">Select Time</h3>
                    <button 
                        @click="toggleFormat"
                        class="format-toggle"
                        type="button"
                    >
                        {{ is24Hour ? '24H' : '12H' }}
                    </button>
                </div>

                <!-- Time Selection -->
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
                                    :class="[
                                        'time-option',
                                        { 'is-selected': hour.value === selectedHour }
                                    ]"
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
                                    :class="[
                                        'time-option',
                                        { 'is-selected': minute === selectedMinute }
                                    ]"
                                    type="button"
                                >
                                    {{ minute.toString().padStart(2, '0') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- AM/PM Selection (12-hour format only) -->
                    <div v-if="!is24Hour" class="time-column">
                        <label class="time-label">Period</label>
                        <div class="time-scroll-container">
                            <div class="time-scroll-list">
                                <button
                                    @click="selectPeriod('AM')"
                                    :class="[
                                        'time-option',
                                        { 'is-selected': selectedPeriod === 'AM' }
                                    ]"
                                    type="button"
                                >
                                    AM
                                </button>
                                <button
                                    @click="selectPeriod('PM')"
                                    :class="[
                                        'time-option',
                                        { 'is-selected': selectedPeriod === 'PM' }
                                    ]"
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

                <!-- Footer -->
                <div class="time-picker-footer">
                    <button 
                        @click="selectCurrentTime"
                        class="current-time-button"
                        type="button"
                    >
                        Now
                    </button>
                    <button 
                        @click="clearTime"
                        class="clear-button"
                        type="button"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue'
import moment from 'moment'

export default {
    name: 'TimePicker',
    components: {
        Icon
    },
    props: {
        modelValue: {
            type: [Date, String, null],
            default: null
        },
        placeholder: {
            type: String,
            default: 'Select time'
        },
        format: {
            type: String,
            default: 'h:mm A'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        is24Hour: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            isOpen: false,
            selectedHour: 12,
            selectedMinute: 0,
            selectedPeriod: 'AM'
        }
    },
    computed: {
        displayValue() {
            if (!this.modelValue) return ''
            return moment(this.modelValue).format(this.format)
        },
        availableHours() {
            const hours = []
            if (this.is24Hour) {
                for (let i = 0; i < 24; i++) {
                    hours.push({
                        value: i,
                        display: i.toString().padStart(2, '0')
                    })
                }
            } else {
                for (let i = 1; i <= 12; i++) {
                    hours.push({
                        value: i,
                        display: i.toString()
                    })
                }
            }
            return hours
        },
        availableMinutes() {
            const minutes = []
            for (let i = 0; i < 60; i += 5) {
                minutes.push(i)
            }
            return minutes
        },
        timePresets() {
            return [
                { label: '9:00 AM', value: { hour: 9, minute: 0, period: 'AM' } },
                { label: '12:00 PM', value: { hour: 12, minute: 0, period: 'PM' } },
                { label: '1:00 PM', value: { hour: 1, minute: 0, period: 'PM' } },
                { label: '5:00 PM', value: { hour: 5, minute: 0, period: 'PM' } },
                { label: '6:00 PM', value: { hour: 6, minute: 0, period: 'PM' } },
                { label: '9:00 PM', value: { hour: 9, minute: 0, period: 'PM' } }
            ]
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    const momentTime = moment(newValue)
                    this.selectedHour = momentTime.hour()
                    this.selectedMinute = momentTime.minute()
                    this.selectedPeriod = momentTime.format('A')
                } else {
                    this.selectedHour = this.is24Hour ? 0 : 12
                    this.selectedMinute = 0
                    this.selectedPeriod = 'AM'
                }
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
        document.addEventListener('keydown', this.handleKeydown)
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
        document.removeEventListener('keydown', this.handleKeydown)
    },
    methods: {
        togglePicker() {
            if (this.disabled) return
            this.isOpen = !this.isOpen
        },
        
        toggleFormat() {
            this.$emit('update:is24Hour', !this.is24Hour)
        },
        
        selectHour(hour) {
            this.selectedHour = hour
            this.emitTime()
        },
        
        selectMinute(minute) {
            this.selectedMinute = minute
            this.emitTime()
        },
        
        selectPeriod(period) {
            this.selectedPeriod = period
            this.emitTime()
        },
        
        selectPreset(preset) {
            this.selectedHour = preset.value.hour
            this.selectedMinute = preset.value.minute
            this.selectedPeriod = preset.value.period
            this.emitTime()
        },
        
        selectCurrentTime() {
            const now = moment()
            this.selectedHour = now.hour()
            this.selectedMinute = now.minute()
            this.selectedPeriod = now.format('A')
            this.emitTime()
        },
        
        clearTime() {
            this.selectedHour = this.is24Hour ? 0 : 12
            this.selectedMinute = 0
            this.selectedPeriod = 'AM'
            this.$emit('update:modelValue', null)
            this.$emit('change', null)
            this.isOpen = false
        },
        
        emitTime() {
            let hour = this.selectedHour
            
            // Convert 12-hour to 24-hour format
            if (!this.is24Hour) {
                if (this.selectedPeriod === 'AM' && hour === 12) {
                    hour = 0
                } else if (this.selectedPeriod === 'PM' && hour !== 12) {
                    hour += 12
                }
            }
            
            const time = moment().hour(hour).minute(this.selectedMinute).second(0).millisecond(0)
            this.$emit('update:modelValue', time.toDate())
            this.$emit('change', time.toDate())
        },
        
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isOpen = false
            }
        },
        
        handleKeydown(event) {
            if (!this.isOpen) return
            
            switch (event.key) {
                case 'Escape':
                    this.isOpen = false
                    break
            }
        }
    }
}
</script>

<style scoped>
.custom-time-picker {
    position: relative;
    display: inline-block;
    width: 100%;
}

.time-picker-trigger {
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

.time-picker-trigger:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
}

.time-picker-trigger:focus {
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

.time-picker-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 9999;
    margin-top: 0.25rem;
    min-width: 320px;
    max-height: 400px;
    overflow: hidden;
}

.time-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.time-picker-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
}

.format-toggle {
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

.format-toggle:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.time-selection {
    display: flex;
    padding: 1rem;
    gap: 1rem;
    max-height: 200px;
    overflow-y: auto;
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
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
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

.time-picker-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: white;
}

.current-time-button,
.clear-button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.current-time-button:hover,
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
.time-picker-fade-enter-active,
.time-picker-fade-leave-active {
    transition: all 0.2s ease;
}

.time-picker-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.time-picker-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
    .time-picker-dropdown {
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
}
</style>

