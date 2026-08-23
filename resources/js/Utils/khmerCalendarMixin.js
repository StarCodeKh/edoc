/**
 * Drop-in Khmer-calendar layer for the calendar pages.
 *
 * Expects the host component to expose `currentDate`, `selectedDate` and
 * `currentView` (all four calendar pages do). Everything it adds is namespaced
 * with a `kh` prefix so it can't collide with the page's own members.
 */
import {
    getKhmerDate,
    getKhmerDateDetail,
    getKhmerEvents,
    getKhmerMonthRangeLabel,
    toKhmerNumeral,
    KHMER_SOLAR_MONTHS,
    KHMER_WEEKDAYS,
    KHMER_WEEKDAYS_SHORT,
} from '@/Utils/khmerCalendar'

const STORAGE_KEY = 'calendar.khmer_lunar'

export default {
    data() {
        return {
            khmerCalendarOn: false,
        }
    },
    computed: {
        khLocale() {
            return this.$page?.props?.auth?.user?.locale || 'en'
        },
        khIsKhmerLocale() {
            return this.khLocale === 'kh'
        },
        /** Pages disagree on the name: currentView, calendarView or timelineView. */
        khActiveView() {
            return this.currentView || this.calendarView || this.timelineView || 'month'
        },
        /** Lunar month(s) spanned by whatever period is on screen. */
        khPeriodLabel() {
            if (!this.khmerCalendarOn) return ''
            const anchor = ['week', 'day'].includes(this.khActiveView) ? this.selectedDate : this.currentDate
            if (this.khActiveView === 'day') {
                const kh = getKhmerDate(anchor)
                return kh ? (this.khIsKhmerLocale ? kh.full : `${kh.dayLabelLatin} ${kh.monthLabelLatin}, B.E. ${kh.beYear}`) : ''
            }
            return getKhmerMonthRangeLabel(anchor, this.khLocale)
        },
        /** Weekday column headers, in the user's own language. */
        calendarWeekdays() {
            return this.khIsKhmerLocale ? KHMER_WEEKDAYS : this.daysOfWeek
        },
        /** Single-letter weekday headers for the year view's mini calendars. */
        miniCalendarWeekdays() {
            return this.khIsKhmerLocale ? KHMER_WEEKDAYS_SHORT : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        },
    },
    methods: {
        /**
         * Render any number (or a string containing digits) in Khmer numerals
         * when the user reads Khmer, untouched otherwise.
         */
        khNum(value) {
            return this.khIsKhmerLocale ? toKhmerNumeral(value) : String(value)
        },
        /** Gregorian month name, localised. */
        khSolarMonth(monthIndex) {
            return this.khIsKhmerLocale
                ? KHMER_SOLAR_MONTHS[monthIndex]
                : this.moment().month(monthIndex).format('MMMM')
        },
        /** 'សីហា ២០២៦' / 'August 2026' */
        khMonthYear(date) {
            if (!this.khIsKhmerLocale) return this.moment(date).format('MMMM YYYY')
            const d = new Date(date)
            return `${KHMER_SOLAR_MONTHS[d.getMonth()]} ${toKhmerNumeral(d.getFullYear())}`
        },
        /** 'ថ្ងៃអាទិត្យ ទី២៣ ខែសីហា ឆ្នាំ២០២៦' / 'Sunday, August 23rd, 2026' */
        khFullDate(date) {
            if (!this.khIsKhmerLocale) return this.moment(date).format('dddd, MMMM Do, YYYY')
            const d = new Date(date)
            return `ថ្ងៃ${KHMER_WEEKDAYS[d.getDay()]} ទី${toKhmerNumeral(d.getDate())} ខែ${KHMER_SOLAR_MONTHS[d.getMonth()]} ឆ្នាំ${toKhmerNumeral(d.getFullYear())}`
        },
        /** 'ទី២៣ សីហា ២០២៦' / 'Aug 23, 2026' — compact, year optional. */
        khShortDate(date, withYear = false) {
            if (!this.khIsKhmerLocale) return this.moment(date).format(withYear ? 'MMM D, YYYY' : 'MMM D')
            const d = new Date(date)
            const head = `ទី${toKhmerNumeral(d.getDate())} ${KHMER_SOLAR_MONTHS[d.getMonth()]}`
            return withYear ? `${head} ${toKhmerNumeral(d.getFullYear())}` : head
        },
        /** Weekday name for a column header, localised. */
        khWeekdayName(date) {
            return this.khIsKhmerLocale ? KHMER_WEEKDAYS[new Date(date).getDay()] : this.moment(date).format('ddd')
        },
        /** Compact cell label, e.g. '១០កើត'. */
        khDayLabel(date) {
            const kh = getKhmerDate(date)
            if (!kh) return ''
            return this.khIsKhmerLocale ? kh.dayLabel : `${kh.day} ${kh.moonPhase === 0 ? 'kaet' : 'roch'}`
        },
        khShortWeekday(index) {
            return KHMER_WEEKDAYS_SHORT[index] || ''
        },
        khEvents(date) {
            if (!this.khmerCalendarOn) return []
            return getKhmerEvents(date).map((event) => ({
                ...event,
                title: this.khIsKhmerLocale ? event.kh : event.en,
            }))
        },
        khDetail(date) {
            return getKhmerDateDetail(date, this.khLocale)
        },
        /** Tooltip text: full Khmer date plus any notable days. */
        khTooltip(date) {
            const kh = getKhmerDate(date)
            if (!kh) return ''
            const events = this.khEvents(date).map((event) => event.title)
            const head = this.khIsKhmerLocale
                ? kh.full
                : `${kh.weekdayLatin} ${kh.dayLabelLatin} ${kh.monthLabelLatin}, ${kh.animalYearLatin}, B.E. ${kh.beYear}`
            return events.length ? `${head}\n${events.join('\n')}` : head
        },
        khIsSilaDay(date) {
            const kh = getKhmerDate(date)
            return !!kh && kh.isSilaDay
        },
        toggleKhmerCalendar() {
            this.khmerCalendarOn = !this.khmerCalendarOn
            try {
                localStorage.setItem(STORAGE_KEY, this.khmerCalendarOn ? '1' : '0')
            } catch (e) {
                // Private browsing — the toggle just won't persist.
            }
        },
    },
    created() {
        let stored = null
        try {
            stored = localStorage.getItem(STORAGE_KEY)
        } catch (e) {
            stored = null
        }
        // On by default for Khmer users, opt-in for everyone else.
        this.khmerCalendarOn = stored === null ? this.khIsKhmerLocale : stored === '1'
    },
}
