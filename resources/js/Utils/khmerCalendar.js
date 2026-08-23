/**
 * Khmer calendar helpers (ប្រតិទិនច័ន្ទគតិខ្មែរ).
 *
 * Thin, UI-facing layer on top of the vendored Chhankitek engine in
 * ./momentkh.js. Everything here is pure + memoised so it is safe to call
 * straight from a Vue template for every cell of a month grid.
 */
import momentkh from './momentkh.js'

export const KHMER_WEEKDAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
export const KHMER_WEEKDAYS_SHORT = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស']
export const LATIN_WEEKDAYS = ['Athit', 'Chan', 'Angkear', 'Poth', 'Prohoas', 'Sok', 'Sao']

/** Gregorian month names in Khmer, January first. */
export const KHMER_SOLAR_MONTHS = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
]

export const LATIN_LUNAR_MONTHS = [
    'Mikasir', 'Boss', 'Meak', 'Phalkun', 'Chetr', 'Pisakh', 'Jesth',
    'Asadh', 'Srap', 'Phatrabot', 'Assoch', 'Kadeuk', 'Pathamasadh', 'Tutiyasadh',
]

export const LATIN_ANIMAL_YEARS = [
    'Chhut (Rat)', 'Chlov (Ox)', 'Khal (Tiger)', 'Thos (Rabbit)',
    'Rong (Dragon)', 'Masagn (Snake)', 'Momee (Horse)', 'Momae (Goat)',
    'Vok (Monkey)', 'Roka (Rooster)', 'Cho (Dog)', 'Kor (Pig)',
]

export const LATIN_SAK = [
    'Samritthisak', 'Aeksak', 'Tosak', 'Treisak', 'Chattvasak',
    'Panchasak', 'Chhasak', 'Sappasak', 'Atthasak', 'Nappasak',
]

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']

/** 12345 -> ១២៣៤៥ */
export function toKhmerNumeral(value) {
    return String(value).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)])
}

function dateKey(date) {
    const d = date instanceof Date ? date : new Date(date)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// ---------------------------------------------------------------------------
// Notable days
// ---------------------------------------------------------------------------

const LUNAR_MONTHS = momentkh.MonthIndex

// Lunar (moving) holidays, matched on { day, moonPhase, month }.
// moonPhase: 0 = កើត (waxing), 1 = រោច (waning).
const LUNAR_EVENTS = [
    { key: 'meak_bochea', day: 15, moonPhase: 0, months: [LUNAR_MONTHS.Meak], kh: 'ពិធីបុណ្យមាឃបូជា', en: 'Meak Bochea Day', type: 'religious' },
    { key: 'visak_bochea', day: 15, moonPhase: 0, months: [LUNAR_MONTHS.Pisakh], kh: 'ពិធីបុណ្យវិសាខបូជា', en: 'Visak Bochea Day', type: 'religious' },
    { key: 'preah_neangkoal', day: 4, moonPhase: 1, months: [LUNAR_MONTHS.Pisakh], kh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', en: 'Royal Ploughing Ceremony', type: 'national' },
    { key: 'chol_vossa', day: 1, moonPhase: 1, months: [LUNAR_MONTHS.Asadh, LUNAR_MONTHS.Tutiyasadh], kh: 'ថ្ងៃចូលព្រះវស្សា', en: 'Beginning of Buddhist Lent', type: 'religious' },
    { key: 'chenh_vossa', day: 15, moonPhase: 0, months: [LUNAR_MONTHS.Assoch], kh: 'ថ្ងៃចេញព្រះវស្សា', en: 'End of Buddhist Lent', type: 'religious' },
    { key: 'pchum_ben', day: 15, moonPhase: 1, months: [LUNAR_MONTHS.Phatrabot], kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ', en: 'Pchum Ben Day', type: 'religious' },
    { key: 'om_touk', day: 14, moonPhase: 0, months: [LUNAR_MONTHS.Kadeuk], kh: 'ពិធីបុណ្យអុំទូក', en: 'Water Festival', type: 'national' },
    { key: 'om_touk', day: 15, moonPhase: 0, months: [LUNAR_MONTHS.Kadeuk], kh: 'បុណ្យសំពះព្រះខែ អកអំបុក', en: 'Water Festival — Moon Salutation', type: 'national' },
    { key: 'om_touk', day: 1, moonPhase: 1, months: [LUNAR_MONTHS.Kadeuk], kh: 'ពិធីបុណ្យអុំទូក', en: 'Water Festival', type: 'national' },
]

// Fixed Gregorian public holidays, keyed 'MM-DD'.
const SOLAR_EVENTS = {
    '01-01': { key: 'intl_new_year', kh: 'ទិវាចូលឆ្នាំសាកល', en: "International New Year's Day", type: 'national' },
    '01-07': { key: 'victory_day', kh: 'ទិវាជ័យជម្នះ ៧ មករា', en: 'Victory over Genocide Day', type: 'national' },
    '03-08': { key: 'womens_day', kh: 'ទិវានារីអន្តរជាតិ', en: "International Women's Day", type: 'national' },
    '05-01': { key: 'labour_day', kh: 'ទិវាពលកម្មអន្តរជាតិ', en: 'International Labour Day', type: 'national' },
    '05-14': { key: 'king_birthday', kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មព្រះមហាក្សត្រ', en: "King Sihamoni's Birthday", type: 'national' },
    '05-15': { key: 'king_birthday', kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មព្រះមហាក្សត្រ', en: "King Sihamoni's Birthday", type: 'national' },
    '05-16': { key: 'king_birthday', kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មព្រះមហាក្សត្រ', en: "King Sihamoni's Birthday", type: 'national' },
    '06-18': { key: 'queen_mother_birthday', kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មសម្តេចព្រះមហាក្សត្រី', en: "Queen Mother's Birthday", type: 'national' },
    '09-24': { key: 'constitution_day', kh: 'ទិវារដ្ឋធម្មនុញ្ញ', en: 'Constitution Day', type: 'national' },
    '10-15': { key: 'king_father', kh: 'ទិវាប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធព្រះបាទនរោត្តម សីហនុ', en: 'Commemoration Day of King Father', type: 'national' },
    '10-29': { key: 'coronation_day', kh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', en: "King Sihamoni's Coronation Day", type: 'national' },
    '11-09': { key: 'independence_day', kh: 'ទិវាបុណ្យឯករាជ្យជាតិ', en: 'Independence Day', type: 'national' },
}

const MAHA_SONGKRAN = { kh: 'ថ្ងៃមហាសង្ក្រាន្ត', en: 'Maha Songkran' }
const VIRAK_VANABAT = { kh: 'ថ្ងៃវារៈវនបត', en: 'Virak Vanabat' }
const LOENG_SAK = { kh: 'ថ្ងៃឡើងស័ក', en: 'Vearak Loeng Sak' }

const newYearCache = new Map()

/**
 * Khmer New Year for a Gregorian year: the exact Maha Songkran moment plus the
 * three celebrated days.
 */
export function getKhmerNewYear(gregorianYear) {
    if (newYearCache.has(gregorianYear)) return newYearCache.get(gregorianYear)

    let info = null
    try {
        const ny = momentkh.getNewYear(gregorianYear)
        const start = new Date(ny.year, ny.month - 1, ny.day, ny.hour, ny.minute)
        const dayAt = (offset) => new Date(ny.year, ny.month - 1, ny.day + offset)

        // Most years run Maha Songkran + one Vanabat + Loeng Sak, but some get a
        // second Vanabat day. Rather than hard-code three days, find ឡើងស័ក by
        // looking for the day the Jolak Sakaraj era number rolls over.
        const eraAt = (offset) => momentkh.fromDate(dayAt(offset)).khmer.jsYear
        const startEra = eraAt(0)
        let loengSak = 2
        for (let offset = 1; offset <= 5; offset++) {
            if (eraAt(offset) > startEra) {
                loengSak = offset
                break
            }
        }

        const days = []
        for (let offset = 0; offset <= loengSak; offset++) {
            const name = offset === 0 ? MAHA_SONGKRAN : (offset === loengSak ? LOENG_SAK : VIRAK_VANABAT)
            const date = dayAt(offset)
            days.push({ date, key: dateKey(date), index: offset, ...name })
        }

        info = { moment: start, hour: ny.hour, minute: ny.minute, days }
    } catch (e) {
        info = null
    }

    newYearCache.set(gregorianYear, info)
    return info
}

// ---------------------------------------------------------------------------
// Core conversion
// ---------------------------------------------------------------------------

const khmerDateCache = new Map()

function moonEmoji(day, moonPhase, daysInPhase) {
    if (moonPhase === 0) {
        if (day === 15) return '🌕'
        if (day === 8) return '🌓'
        return day < 8 ? '🌒' : '🌔'
    }
    if (day >= daysInPhase) return '🌑'
    if (day === 8) return '🌗'
    return day < 8 ? '🌖' : '🌘'
}

/**
 * Full Khmer-calendar description of a Gregorian date.
 * Returns null if the date falls outside what the engine can convert.
 */
export function getKhmerDate(date) {
    const d = date instanceof Date ? date : new Date(date)
    const key = dateKey(d)
    if (khmerDateCache.has(key)) return khmerDateCache.get(key)

    let result = null
    try {
        const kh = momentkh.fromDate(d).khmer
        // រោច runs to 14 in a 29-day month and to 15 in a 30-day one, and the
        // exceptions (បឋមាសាឍ, ទុតិយាសាឍ, and ជេស្ឋ in a leap-day year) do not
        // follow the odd/even rule. Rather than restate that table, ask the
        // engine what tomorrow is: if the month rolls over, today was its last
        // day — which is the new moon.
        const tomorrow = momentkh.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)).khmer
        const isLastWaning = kh.moonPhase === 1 && tomorrow.moonPhase === 0
        const daysInWaning = isLastWaning ? kh.day : (kh.monthIndex % 2 === 0 ? 14 : 15)
        const isFullMoon = kh.moonPhase === 0 && kh.day === 15

        result = {
            ...kh,
            dayKh: toKhmerNumeral(kh.day),
            // Printed Khmer calendars space the numeral off the phase: '១០ កើត'.
            dayLabel: `${toKhmerNumeral(kh.day)} ${kh.moonPhaseName}`,
            dayLabelLatin: `${kh.day} ${kh.moonPhase === 0 ? 'Waxing' : 'Waning'}`,
            // …and print the month's name in place of '១ កើត' on its first day.
            cellLabel: kh.moonPhase === 0 && kh.day === 1
                ? kh.monthName
                : `${toKhmerNumeral(kh.day)} ${kh.moonPhaseName}`,
            cellLabelLatin: kh.moonPhase === 0 && kh.day === 1
                ? (LATIN_LUNAR_MONTHS[kh.monthIndex] || kh.monthName)
                : `${kh.day} ${kh.moonPhase === 0 ? 'kaet' : 'roch'}`,
            monthLabel: `ខែ${kh.monthName}`,
            monthLabelLatin: LATIN_LUNAR_MONTHS[kh.monthIndex] || kh.monthName,
            yearLabel: `ឆ្នាំ${kh.animalYearName} ${kh.sakName}`,
            animalYearLatin: LATIN_ANIMAL_YEARS[kh.animalYear] || kh.animalYearName,
            sakLatin: LATIN_SAK[kh.sak] || kh.sakName,
            weekdayLabel: `ថ្ងៃ${kh.dayOfWeekName}`,
            weekdayLatin: LATIN_WEEKDAYS[kh.dayOfWeek] || kh.dayOfWeekName,
            beLabel: `ព.ស. ${toKhmerNumeral(kh.beYear)}`,
            jsLabel: `ច.ស. ${toKhmerNumeral(kh.jsYear)}`,
            isFullMoon,
            isNewMoon: isLastWaning,
            // ថ្ងៃសីល — the four Buddhist precept days of each lunar month.
            isSilaDay: isFullMoon || isLastWaning || kh.day === 8,
            moonEmoji: moonEmoji(kh.day, kh.moonPhase, daysInWaning),
            // Marks printed under the date on a Khmer calendar.
            noteLabel: isFullMoon ? 'ពេញបូណ៌មី' : (isLastWaning ? 'ដាច់ខែ' : ''),
            noteLabelLatin: isFullMoon ? 'Full moon' : (isLastWaning ? 'New moon' : ''),
            full: `ថ្ងៃ${kh.dayOfWeekName} ${toKhmerNumeral(kh.day)} ${kh.moonPhaseName} ខែ${kh.monthName} ឆ្នាំ${kh.animalYearName} ${kh.sakName} ព.ស. ${toKhmerNumeral(kh.beYear)}`,
        }
    } catch (e) {
        result = null
    }

    khmerDateCache.set(key, result)
    return result
}

/** '១០កើត' — the compact label for a month-grid cell. */
export function getKhmerDayLabel(date) {
    const kh = getKhmerDate(date)
    return kh ? kh.dayLabel : ''
}

/** 'ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០' — header line for a month. */
export function getKhmerPeriodLabel(date) {
    const kh = getKhmerDate(date)
    if (!kh) return ''
    return `${kh.monthLabel} ${kh.yearLabel} ${kh.beLabel}`
}

/**
 * Lunar month(s) covered by a Gregorian month, e.g.
 * 'ខែទុតិយាសាឍ-ស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០'.
 */
export function getKhmerMonthRangeLabel(date, locale = 'kh') {
    const d = date instanceof Date ? date : new Date(date)
    const first = getKhmerDate(new Date(d.getFullYear(), d.getMonth(), 1))
    const last = getKhmerDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
    if (!first || !last) return ''

    const isKh = locale === 'kh'
    if (!isKh) {
        const months = first.monthIndex === last.monthIndex
            ? first.monthLabelLatin
            : `${first.monthLabelLatin}-${last.monthLabelLatin}`
        return `${months} · ${last.animalYearLatin} · B.E. ${last.beYear}`
    }

    const months = first.monthIndex === last.monthIndex
        ? first.monthLabel
        : `${first.monthLabel}-${last.monthName}`
    return `${months} ${last.yearLabel} ${last.beLabel}`
}

/**
 * Every notable day falling on this date: Khmer New Year, moving lunar
 * festivals and fixed national holidays.
 */
export function getKhmerEvents(date) {
    const d = date instanceof Date ? date : new Date(date)
    const kh = getKhmerDate(d)
    const events = []

    const newYear = getKhmerNewYear(d.getFullYear())
    if (newYear) {
        const match = newYear.days.find((day) => day.key === dateKey(d))
        if (match) {
            events.push({
                key: 'khmer_new_year',
                kh: 'ពិធីបុណ្យចូលឆ្នាំប្រពៃណីជាតិ',
                en: 'Khmer New Year',
                detailKh: match.kh,
                detailEn: match.en,
                type: 'national',
            })
        }
    }

    if (kh) {
        for (const event of LUNAR_EVENTS) {
            if (event.day === kh.day && event.moonPhase === kh.moonPhase && event.months.includes(kh.monthIndex)) {
                events.push({ key: event.key, kh: event.kh, en: event.en, type: event.type })
            }
        }
        // កាន់បិណ្ឌ — the fourteen days leading up to Pchum Ben.
        if (kh.monthIndex === LUNAR_MONTHS.Phatrabot && kh.moonPhase === 1 && kh.day < 15) {
            events.push({
                key: 'kan_ben',
                kh: `កាន់បិណ្ឌទី${toKhmerNumeral(kh.day)}`,
                en: `Kan Ben Day ${kh.day}`,
                type: 'religious',
            })
        }
    }

    const solar = SOLAR_EVENTS[`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`]
    if (solar) events.push(solar)

    return events
}

/**
 * Everything the detail panel needs for one date, already localised.
 * `locale` is the app locale ('kh' renders Khmer script, anything else falls
 * back to romanised Khmer terms).
 */
export function getKhmerDateDetail(date, locale = 'en') {
    const kh = getKhmerDate(date)
    if (!kh) return null

    const isKh = locale === 'kh'
    const events = getKhmerEvents(date)
    const d = date instanceof Date ? date : new Date(date)

    const newYear = getKhmerNewYear(d.getFullYear()) || getKhmerNewYear(d.getFullYear() + 1)
    let daysToNewYear = null
    if (newYear) {
        const target = newYear.days[0].date
        const from = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        daysToNewYear = Math.round((target - from) / 86400000)
        if (daysToNewYear < 0) {
            const next = getKhmerNewYear(d.getFullYear() + 1)
            daysToNewYear = next ? Math.round((next.days[0].date - from) / 86400000) : null
        }
    }

    return {
        raw: kh,
        headline: isKh ? kh.dayLabel : kh.dayLabelLatin,
        weekday: isKh ? kh.weekdayLabel : kh.weekdayLatin,
        month: isKh ? kh.monthLabel : kh.monthLabelLatin,
        animalYear: isKh ? `ឆ្នាំ${kh.animalYearName}` : kh.animalYearLatin,
        sak: isKh ? kh.sakName : kh.sakLatin,
        moonPhase: isKh ? kh.moonPhaseName : (kh.moonPhase === 0 ? 'Waxing moon' : 'Waning moon'),
        moonEmoji: kh.moonEmoji,
        buddhistEra: isKh ? kh.beLabel : `B.E. ${kh.beYear}`,
        lesserEra: isKh ? kh.jsLabel : `J.S. ${kh.jsYear}`,
        isSilaDay: kh.isSilaDay,
        isFullMoon: kh.isFullMoon,
        isNewMoon: kh.isNewMoon,
        full: kh.full,
        daysToNewYear,
        events: events.map((event) => ({
            key: event.key,
            type: event.type,
            title: isKh ? event.kh : event.en,
            detail: isKh ? (event.detailKh || '') : (event.detailEn || ''),
        })),
    }
}

export default {
    toKhmerNumeral,
    getKhmerDate,
    getKhmerDayLabel,
    getKhmerPeriodLabel,
    getKhmerMonthRangeLabel,
    getKhmerEvents,
    getKhmerDateDetail,
    getKhmerNewYear,
    KHMER_WEEKDAYS,
    KHMER_WEEKDAYS_SHORT,
}
