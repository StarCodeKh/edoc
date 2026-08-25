<template>
    <div
        v-if="detail"
        :class="[
            'khmer-date-card relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-amber-50/70 shadow-sm',
            compact ? 'p-3' : 'p-5',
        ]"
    >
        <!-- Decorative moon glow -->
        <div
            class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/30 blur-2xl"
        ></div>

        <div class="relative flex items-start gap-4">
            <!-- Moon phase -->
            <div
                :class="[
                    'flex flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-indigo-100',
                    compact ? 'h-11 w-11 text-xl' : 'h-14 w-14 text-2xl',
                ]"
                :title="detail.moonPhase"
            >
                {{ detail.moonEmoji }}
            </div>

            <div class="min-w-0 flex-1">
                <!-- Lunar day + month -->
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span :class="['font-bold text-gray-900 khmer-lunar-text', compact ? 'text-lg' : 'text-2xl']">
                        {{ detail.headline }}
                    </span>
                    <span :class="['font-semibold text-indigo-700 khmer-lunar-text', compact ? 'text-sm' : 'text-lg']">
                        {{ detail.month }}
                    </span>
                </div>

                <!-- Weekday · animal year · eras -->
                <div
                    class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-600 khmer-lunar-text"
                >
                    <span>{{ detail.weekday }}</span>
                    <span class="text-gray-300">•</span>
                    <span>{{ detail.animalYear }} {{ detail.sak }}</span>
                    <span class="text-gray-300">•</span>
                    <span :title="$t('Buddhist Era')">{{ detail.buddhistEra }}</span>
                    <span v-if="!compact" class="text-gray-300">•</span>
                    <span v-if="!compact" :title="$t('Lesser Era')">{{ detail.lesserEra }}</span>
                </div>

                <!-- Badges -->
                <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span
                        v-if="detail.isFullMoon"
                        class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                    >
                        {{ $t('Full Moon') }}
                    </span>
                    <span
                        v-else-if="detail.isNewMoon"
                        class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300"
                    >
                        {{ $t('New Moon') }}
                    </span>
                    <span
                        v-if="detail.isSilaDay"
                        class="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-200"
                    >
                        {{ $t('Precept Day') }}
                    </span>
                    <span
                        v-for="(event, index) in detail.events"
                        :key="`${event.key}-${index}`"
                        :class="[
                            'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 khmer-lunar-text',
                            event.type === 'national'
                                ? 'bg-rose-100 text-rose-800 ring-rose-200'
                                : 'bg-emerald-100 text-emerald-800 ring-emerald-200',
                        ]"
                        :title="event.detail"
                    >
                        {{ event.title }}<template v-if="event.detail"> — {{ event.detail }}</template>
                    </span>
                </div>

                <!-- Khmer New Year countdown -->
                <p
                    v-if="!compact && showCountdown && detail.daysToNewYear > 0 && detail.daysToNewYear <= 60"
                    class="mt-3 text-xs font-medium text-gray-500 khmer-lunar-text"
                >
                    {{ $t('Khmer New Year in :days days', { days: localeNumber(detail.daysToNewYear) }) }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { getKhmerDateDetail, toKhmerNumeral } from '@/Utils/khmerCalendar';

export default {
    name: 'KhmerDateCard',
    props: {
        date: { type: [Date, String], required: true },
        locale: { type: String, default: 'en' },
        compact: { type: Boolean, default: false },
        showCountdown: { type: Boolean, default: true },
    },
    computed: {
        detail() {
            return getKhmerDateDetail(this.date, this.locale);
        },
    },
    methods: {
        localeNumber(value) {
            return this.locale === 'kh' ? toKhmerNumeral(value) : String(value);
        },
    },
};
</script>
