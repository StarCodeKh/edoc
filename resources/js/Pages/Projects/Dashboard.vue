<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <board-view-menu :project="project" view="dashboard" />
        <div
            class="task__dashboard flex h-[calc(100%-52px)] flex-col gap-4 overflow-y-auto px-3 py-4 sm:gap-5 sm:px-5 sm:py-5"
        >
            <!-- Four counts do not need four charts. -->
            <div class="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
                <div
                    v-for="tile in tiles"
                    :key="tile.key"
                    class="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#262932]"
                >
                    <div class="flex items-center gap-2">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: tile.color }"></span>
                        <span class="truncate text-xs font-semibold text-gray-500 dark:text-gray-400">{{
                            tile.label
                        }}</span>
                    </div>
                    <div class="mt-2 text-3xl font-extrabold leading-none text-gray-900 dark:text-white">
                        {{ tile.value }}
                    </div>
                    <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <span
                            class="block h-full rounded-full transition-[width] duration-500"
                            :style="{ width: tile.share + '%', backgroundColor: tile.color }"
                        ></span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-2">
                <!-- Part-to-whole: every document sits in exactly one bucket. -->
                <section
                    class="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-lg sm:p-5 dark:border-white/10 dark:bg-[#262932]"
                >
                    <header class="mb-2 flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="truncate text-base font-bold text-gray-900 dark:text-white">
                                {{ $t('Due Date') }}
                            </h2>
                            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {{ total_documents }} {{ $t('Documents') }}
                            </p>
                        </div>
                    </header>

                    <div v-if="total_documents" class="h-[300px] sm:h-[320px]">
                        <apexchart type="donut" height="100%" :options="due_options" :series="due_series" />
                    </div>
                    <p v-else class="flex h-[220px] items-center justify-center text-sm text-gray-400">
                        {{ $t('No item found!') }}
                    </p>
                </section>

                <!-- Magnitude by a nominal category: one bar per row, one colour,
                     the count beside it. This is the table view and the chart at
                     once, which is what keeps long Khmer names readable. -->
                <section
                    v-for="card in bar_cards"
                    :key="card.key"
                    class="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-lg sm:p-5 dark:border-white/10 dark:bg-[#262932]"
                >
                    <header class="mb-4 flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="truncate text-base font-bold text-gray-900 dark:text-white">
                                {{ card.title }}
                            </h2>
                            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {{ card.total }} {{ $t('Documents') }}
                            </p>
                        </div>
                        <span
                            v-if="card.rows.length"
                            class="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300"
                            >{{ card.rows.length }}</span
                        >
                    </header>

                    <ul v-if="card.rows.length" class="flex flex-col gap-3">
                        <li v-for="row in card.rows" :key="row.key" class="flex items-center gap-3">
                            <span
                                class="w-24 shrink-0 truncate text-sm text-gray-700 sm:w-44 xl:w-56 dark:text-gray-200"
                                :title="row.name"
                                >{{ row.name }}</span
                            >
                            <span class="relative h-2.5 flex-1 rounded-full bg-gray-100 dark:bg-white/10">
                                <span
                                    class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                                    :style="{ width: row.share + '%', backgroundColor: row.color }"
                                ></span>
                            </span>
                            <span
                                class="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-gray-900 dark:text-white"
                                >{{ row.total }}</span
                            >
                        </li>
                    </ul>
                    <p v-else class="flex h-[120px] items-center justify-center text-sm text-gray-400">
                        {{ $t('No item found!') }}
                    </p>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import { Head, Link } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import Icon from '@/Shared/Icon.vue';
import BoardViewMenu from '@/Shared/BoardViewMenu.vue';

/**
 * Status colours for the due buckets, and the one series colour the magnitude
 * charts use. Both modes are chosen for their own surface rather than flipped:
 * validated for colour-blind separation (worst adjacent pair dE 11.3 light /
 * 8.6 dark) and for contrast against the card. The amber sits under 3:1 on
 * white by design - it never carries meaning alone, every segment is named in
 * the legend and counted beside it.
 */
const PALETTE = {
    light: {
        complete: '#0ca30c',
        soon: '#fab219',
        later: '#2a78d6',
        overdue: '#d03b3b',
        none: '#8a8f98',
        series: '#2a78d6',
        surface: '#ffffff',
        ink: '#52514e',
        muted: '#898781',
    },
    dark: {
        complete: '#0ca30c',
        soon: '#fab219',
        later: '#3987e5',
        overdue: '#e66767',
        none: '#9aa0a6',
        series: '#3987e5',
        surface: '#262932',
        ink: '#c3c2b7',
        muted: '#898781',
    },
};

export default {
    components: {
        Head,
        Icon,
        Link,
        BoardViewMenu,
    },
    layout: Layout,
    props: {
        title: String,
        auth: Object,
        project: Object,
        per_list: Object,
        per_assignee: Object,
        per_label: Object,
        due_data: {
            required: true,
        },
    },
    data() {
        return {
            is_dark: false,
            mode_observer: null,
        };
    },
    computed: {
        palette() {
            return this.is_dark ? PALETTE.dark : PALETTE.light;
        },

        due_rows() {
            return (this.due_data || []).map((row) => ({
                key: row.due.key,
                name: this.$t(row.due.name),
                total: Number(row.total) || 0,
                color: this.palette[row.due.key] || this.palette.none,
            }));
        },
        total_documents() {
            return this.due_rows.reduce((sum, row) => sum + row.total, 0);
        },

        /** The headline numbers, as numbers - not as a one-bar bar chart. */
        tiles() {
            const share = (value) => (this.total_documents ? Math.round((value / this.total_documents) * 100) : 0);
            const find = (key) => this.due_rows.find((row) => row.key === key);
            const of = (key) => (find(key) ? find(key).total : 0);

            return [
                {
                    key: 'total',
                    label: this.$t('Documents'),
                    value: this.total_documents,
                    color: this.palette.series,
                    share: this.total_documents ? 100 : 0,
                },
                {
                    key: 'complete',
                    label: this.$t('Complete'),
                    value: of('complete'),
                    color: this.palette.complete,
                    share: share(of('complete')),
                },
                {
                    key: 'overdue',
                    label: this.$t('Overdue'),
                    value: of('overdue'),
                    color: this.palette.overdue,
                    share: share(of('overdue')),
                },
                {
                    key: 'none',
                    label: this.$t('No due date'),
                    value: of('none'),
                    color: this.palette.none,
                    share: share(of('none')),
                },
            ];
        },

        due_series() {
            return this.due_rows.map((row) => row.total);
        },
        due_options() {
            const p = this.palette;

            return {
                chart: {
                    type: 'donut',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    toolbar: { show: false },
                    animations: { speed: 400 },
                },
                labels: this.due_rows.map((row) => row.name),
                colors: this.due_rows.map((row) => row.color),
                // A gap in the surface colour separates segments; no borders.
                stroke: { width: 2, colors: [p.surface] },
                dataLabels: { enabled: false },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '12px',
                    labels: { colors: p.ink },
                    markers: { width: 10, height: 10, radius: 5 },
                    itemMargin: { horizontal: 8, vertical: 4 },
                    formatter: (name, opts) => name + '  ' + opts.w.globals.series[opts.seriesIndex],
                },
                plotOptions: {
                    pie: {
                        expandOnClick: false,
                        donut: {
                            size: '70%',
                            labels: {
                                show: true,
                                name: { color: p.muted, fontSize: '12px' },
                                value: {
                                    color: this.is_dark ? '#ffffff' : '#0b0b0b',
                                    fontSize: '26px',
                                    fontWeight: 700,
                                    offsetY: 4,
                                },
                                total: {
                                    show: true,
                                    label: this.$t('Documents'),
                                    color: p.muted,
                                    fontSize: '12px',
                                    formatter: () => this.total_documents,
                                },
                            },
                        },
                    },
                },
                states: { hover: { filter: { type: 'lighten', value: 0.06 } } },
                tooltip: {
                    theme: this.is_dark ? 'dark' : 'light',
                    y: { formatter: (value) => value + ' ' + this.$t('Documents') },
                },
                responsive: [{ breakpoint: 640, options: { legend: { itemMargin: { horizontal: 6, vertical: 2 } } } }],
            };
        },

        bar_cards() {
            return [
                this.buildCard('list', this.$t('List'), this.per_list, 'list', 'title'),
                this.buildCard('assignee', this.$t('Assignees'), this.per_assignee, 'user', 'name'),
                this.buildCard('label', this.$t('Labels'), this.per_label, 'label', 'name'),
            ];
        },
    },
    methods: {
        /**
         * One card of ranked rows. Rows are sorted by size and share a single
         * colour, except labels, which carry their own - a label's colour is
         * part of its identity, so it follows the label rather than its rank.
         */
        buildCard(key, title, rows, entity, name_field) {
            const items = (rows || [])
                .filter((row) => row && row[entity])
                .map((row) => ({
                    key: key + '_' + (row[entity].id || row[entity][name_field]),
                    name: row[entity][name_field] || '—',
                    total: Number(row.total) || 0,
                    color: entity === 'label' && row[entity].color ? row[entity].color : this.palette.series,
                }))
                .sort((a, b) => b.total - a.total);

            const max = items.reduce((m, row) => Math.max(m, row.total), 0);

            return {
                key,
                title,
                total: items.reduce((sum, row) => sum + row.total, 0),
                rows: items.map((row) => ({ ...row, share: max ? Math.max(4, (row.total / max) * 100) : 0 })),
            };
        },

        readMode() {
            const root = document.querySelector('.layout-app');
            this.is_dark = !!root && root.classList.contains('dark');
        },
    },
    mounted() {
        this.readMode();

        // The theme toggle swaps a class on the layout root; the charts pick
        // their colours for the surface they are on, so they have to hear it.
        const root = document.querySelector('.layout-app');
        if (root && typeof MutationObserver !== 'undefined') {
            this.mode_observer = new MutationObserver(this.readMode);
            this.mode_observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        }
    },
    beforeUnmount() {
        if (this.mode_observer) this.mode_observer.disconnect();
    },
};
</script>
