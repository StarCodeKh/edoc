<template>
    <div class="h-full">
        <Head :title="$t('Performance')" />
        <div class="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 dark:from-white/5 to-white">
            <div class="flex-shrink-0 px-4 pt-4">
                <div class="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 px-6 py-5 shadow-lg">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                <icon name="timeline" class="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-white">{{ $t('Performance') }}</h1>
                                <p class="text-sm text-slate-300">
                                    {{
                                        $t('Requests slower than :ms ms, kept for :days days')
                                            .replace(':ms', threshold)
                                            .replace(':days', retention)
                                    }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="perf-tile">
                                <div class="perf-tile__value" :class="warnCount ? 'text-orange-400' : 'text-green-400'">
                                    {{ khNum(warnCount) }}
                                </div>
                                <div class="perf-tile__label">{{ $t('Warnings') }}</div>
                            </div>
                            <div class="perf-tile">
                                <div class="perf-tile__value text-white">{{ khNum(summary.total) }}</div>
                                <div class="perf-tile__label">{{ $t('Slow requests') }}</div>
                            </div>
                            <div class="perf-tile">
                                <div
                                    class="perf-tile__value"
                                    :class="summary.avg_ms >= 800 ? 'text-orange-400' : 'text-white'"
                                >
                                    {{ ms(summary.avg_ms) }}
                                </div>
                                <div class="perf-tile__label">{{ $t('Average') }}</div>
                            </div>
                            <div class="perf-tile">
                                <div
                                    class="perf-tile__value"
                                    :class="summary.max_ms >= 2000 ? 'text-red-400' : 'text-white'"
                                >
                                    {{ ms(summary.max_ms) }}
                                </div>
                                <div class="perf-tile__label">{{ $t('Worst') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="perf-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <!-- Server health -->
                <div class="mt-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm">
                    <div class="perf-section">{{ $t('Server health') }}</div>
                    <div class="perf-checks">
                        <div
                            v-for="check in checks"
                            :key="check.label"
                            class="perf-check"
                            :class="'is-' + check.status"
                        >
                            <span class="perf-check__dot"></span>
                            <div class="min-w-0 flex-1">
                                <div class="perf-check__label">{{ $t(check.label) }}</div>
                                <div class="perf-check__value">{{ check.value }}</div>
                                <div v-if="check.hint" class="perf-check__hint">{{ check.hint }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Slowest routes -->
                <div
                    class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                >
                    <div class="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
                        <div class="perf-section mb-0">{{ $t('Slowest pages') }}</div>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="option in [1, 7, 30]"
                                :key="option"
                                type="button"
                                class="perf-range"
                                :class="{ 'is-active': form.days === option }"
                                @click="form.days = option"
                            >
                                {{ $t(':days days').replace(':days', khNum(option)) }}
                            </button>
                        </div>
                    </div>

                    <div v-if="slowest.length" class="mt-3 divide-y divide-gray-100 dark:divide-white/10">
                        <div v-for="row in slowest" :key="row.route + row.path" class="perf-route">
                            <div class="min-w-0 flex-1">
                                <div class="perf-route__name">{{ row.route || $t('Unnamed route') }}</div>
                                <div class="perf-route__path">{{ row.path }}</div>
                            </div>
                            <div class="perf-route__bar">
                                <div
                                    class="perf-route__fill"
                                    :class="barClass(row.avg_ms)"
                                    :style="{ width: barWidth(row.avg_ms) }"
                                ></div>
                            </div>
                            <span class="perf-route__stat" :class="msClass(row.avg_ms)">{{ ms(row.avg_ms) }}</span>
                            <span class="perf-route__muted">{{ $t('max') }} {{ ms(row.max_ms) }}</span>
                            <span class="perf-route__muted">{{ khNum(row.avg_queries) }} {{ $t('queries') }}</span>
                            <span class="perf-route__hits">{{ khNum(row.hits) }}×</span>
                        </div>
                    </div>
                    <p v-else class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                        {{ $t('Nothing has been slow enough to record.') }}
                    </p>
                </div>

                <!-- Recent slow requests -->
                <div
                    class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                >
                    <div class="flex flex-wrap items-end justify-between gap-3 px-4 pt-4">
                        <div class="perf-section mb-0">{{ $t('Recent slow requests') }}</div>
                        <div class="flex flex-wrap items-end gap-2">
                            <div class="perf-search">
                                <icon name="search" class="perf-search__icon" />
                                <input
                                    v-model="form.search"
                                    type="text"
                                    class="perf-search__input"
                                    :placeholder="$t('Path…')"
                                />
                            </div>
                            <filter-select
                                v-model="form.route"
                                class="perf-select"
                                :options="routeOptions"
                                :all-label="$t('All pages')"
                                :search-placeholder="$t('Search') + '…'"
                                multiple
                                :count-label="$t('selected')"
                                :clear-label="$t('Clear')"
                            />
                            <button v-if="entries.total" type="button" class="perf-danger" @click="confirmClear">
                                <icon name="trash" class="h-3.5 w-3.5" />
                                {{ $t('Clear history') }}
                            </button>
                        </div>
                    </div>

                    <div v-if="entries.data.length" class="mt-3 divide-y divide-gray-100 dark:divide-white/10">
                        <div v-for="entry in entries.data" :key="entry.id" class="perf-row">
                            <span class="perf-row__ms" :class="msClass(entry.duration_ms)">{{
                                ms(entry.duration_ms)
                            }}</span>
                            <span class="perf-row__method">{{ entry.method }}</span>
                            <span class="perf-row__path" :title="entry.path">{{ entry.path }}</span>
                            <span class="perf-row__meta" :title="$t('Database queries')">
                                <icon name="table" class="h-3 w-3" />{{ khNum(entry.query_count) }} ·
                                {{ ms(entry.query_ms) }}
                            </span>
                            <span class="perf-row__meta">{{ khNum(Math.round(entry.memory_kb / 1024)) }} MB</span>
                            <span v-if="entry.user" class="perf-row__user">{{ entry.user }}</span>
                            <span class="perf-row__time">{{ moment(entry.created_at).format('DD MMM, HH:mm') }}</span>
                        </div>
                    </div>
                    <p v-else class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                        {{ recording ? $t('Nothing has been slow enough to record.') : $t('Recording is turned off.') }}
                    </p>

                    <pagination v-if="entries.data.length" class="px-4 pb-4 pt-3" :links="entries.links" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import Pagination from '@/Shared/Pagination.vue';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import moment from 'moment';
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin';

export default {
    metaInfo: { title: 'Performance' },
    components: { Head, Icon, Pagination, FilterSelect },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    props: {
        title: String,
        checks: { type: Array, default: () => [] },
        slowest: { type: Array, default: () => [] },
        entries: Object,
        filters: Object,
        routes: { type: Array, default: () => [] },
        threshold: { type: Number, default: 500 },
        retention: { type: Number, default: 14 },
        recording: { type: Boolean, default: true },
        summary: { type: Object, default: () => ({ total: 0, avg_ms: 0, max_ms: 0 }) },
    },
    data() {
        return {
            moment,
            form: {
                days: this.filters.days || 7,
                route: this.filters.route || null,
                search: this.filters.search || null,
            },
        };
    },
    computed: {
        warnCount() {
            return this.checks.filter((c) => c.status !== 'ok').length;
        },
        routeOptions() {
            return this.routes.map((r) => ({ value: r, label: r }));
        },
        /** The slowest page sets the scale for every bar. */
        peak() {
            return this.slowest.reduce((max, r) => Math.max(max, r.avg_ms), 0) || 1;
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(this.route('settings.performance'), pickBy(this.form), {
                    preserveState: true,
                    replace: true,
                });
            }, 400),
        },
    },
    methods: {
        ms(value) {
            const n = Number(value) || 0;
            return n >= 1000 ? `${this.khNum((n / 1000).toFixed(1))} s` : `${this.khNum(n)} ms`;
        },
        msClass(value) {
            if (value >= 2000) return 'is-bad';
            if (value >= 1000) return 'is-warn';
            return 'is-ok';
        },
        barClass(value) {
            return this.msClass(value);
        },
        barWidth(value) {
            return `${Math.max(4, Math.round((value / this.peak) * 100))}%`;
        },
        async confirmClear() {
            const ok = await this.$confirm({
                title: this.$t('Discard the recorded request history?'),
                message: this.$t('This cannot be undone.'),
                confirmLabel: this.$t('Delete'),
            });
            if (!ok) return;
            this.$inertia.post(this.route('settings.performance.clear'));
        },
    },
};
</script>

<style scoped>
.perf-tile {
    padding: 8px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    text-align: center;
}
.perf-tile__value {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
}
.perf-tile__label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #cbd5e1;
}

.perf-scroll {
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}
.perf-scroll::-webkit-scrollbar {
    width: 8px;
}
.perf-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.perf-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.28);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}

.perf-section {
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-muted);
}

/* ---- health grid ---- */
.perf-checks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 10px;
}
.perf-check {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 12px;
    border: 1px solid #eef2f7;
    border-radius: 12px;
    background: var(--surface-sunken);
}
.perf-check.is-warn {
    border-color: var(--tint-warn-border);
    background: var(--tint-warn-bg);
}
.perf-check.is-bad {
    border-color: var(--tint-bad-border);
    background: var(--tint-bad-bg);
}
.perf-check__dot {
    width: 8px;
    height: 8px;
    margin-top: 5px;
    flex-shrink: 0;
    border-radius: 999px;
    background: #22c55e;
}
.perf-check.is-warn .perf-check__dot {
    background: #f59e0b;
}
.perf-check.is-bad .perf-check__dot {
    background: #ef4444;
}
.perf-check__label {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-subtle);
}
.perf-check__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
}
.perf-check__hint {
    margin-top: 3px;
    font-size: 11px;
    line-height: 1.45;
    color: var(--tint-warn-ink);
}
.perf-check.is-bad .perf-check__hint {
    color: var(--tint-bad-ink);
}

/* ---- slowest pages ---- */
.perf-range {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-muted);
}
.perf-range:hover {
    background: var(--surface-raised);
}
.perf-range.is-active {
    background: #6574cd;
    color: #fff;
}

.perf-route {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
}
.perf-route__name {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.perf-route__path {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--ink-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.perf-route__bar {
    width: 8rem;
    height: 6px;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--surface-raised);
    overflow: hidden;
}
.perf-route__fill {
    height: 100%;
    border-radius: 999px;
}
.perf-route__fill.is-ok {
    background: #22c55e;
}
.perf-route__fill.is-warn {
    background: #f59e0b;
}
.perf-route__fill.is-bad {
    background: #ef4444;
}

.perf-route__stat {
    width: 4.5rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 12.5px;
    font-weight: 700;
}
.perf-route__muted {
    width: 5.5rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    color: var(--ink-subtle);
}
.perf-route__hits {
    width: 3rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-muted);
}

.is-ok {
    color: var(--tint-good-ink);
}
.is-warn {
    color: var(--tint-warn-ink);
}
.is-bad {
    color: var(--tint-bad-ink);
}

/* ---- recent requests ---- */
.perf-search {
    position: relative;
}
.perf-search__icon {
    position: absolute;
    top: 50%;
    left: 10px;
    width: 13px;
    height: 13px;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--ink-subtle);
}
.perf-search__input {
    width: 12rem;
    height: 34px;
    padding: 0 10px 0 30px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    font-size: 13px;
}
.perf-search__input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.perf-select :deep(.filter-select__trigger) {
    height: 34px;
    min-width: 10rem;
    border-radius: 9px;
    border-color: var(--line-strong);
    font-size: 12.5px;
    font-weight: 500;
}
.perf-danger {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 12px;
    border-radius: 9px;
    border: 1px solid var(--tint-bad-border);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--tint-bad-ink);
    background: var(--surface);
}
.perf-danger:hover {
    background: var(--tint-bad-bg);
    border-color: var(--tint-bad-border);
}

.perf-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
}
.perf-row:hover {
    background: rgba(238, 242, 255, 0.5);
}
.perf-row__ms {
    width: 4.5rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 12.5px;
    font-weight: 700;
}
.perf-row__method {
    width: 3.2rem;
    flex-shrink: 0;
    text-align: center;
    padding: 2px 0;
    border-radius: 6px;
    background: var(--surface-raised);
    font-size: 10px;
    font-weight: 800;
    color: var(--ink-muted);
}
.perf-row__path {
    flex: 1;
    min-width: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.perf-row__meta {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    width: 7rem;
    flex-shrink: 0;
    justify-content: flex-end;
    font-size: 11px;
    color: var(--ink-subtle);
}
.perf-row__user {
    width: 8rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    color: var(--ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.perf-row__time {
    width: 6.5rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    color: var(--ink-subtle);
}

/* ---------------------------------------------------------------------
   Narrow screens: the row is a desktop table line, so the path, the meta
   figures and the timestamp ran off the right edge. It folds into two -
   how slow and what was called, then the details.
   --------------------------------------------------------------------- */
@media (max-width: 767px) {
    .perf-row {
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 10px 12px;
    }
    .perf-row__ms {
        order: 0;
        width: auto;
        text-align: left;
    }
    .perf-row__method {
        order: 1;
        width: auto;
        padding-left: 8px;
        padding-right: 8px;
    }
    .perf-row__path {
        order: 2;
        flex: 1 1 100%;
        white-space: normal;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .perf-row__meta,
    .perf-row__user {
        order: 3;
    }
    .perf-row__time {
        order: 4;
        margin-left: auto;
        text-align: right;
    }
}
</style>
