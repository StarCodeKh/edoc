<template>
    <div class="wdash">
        <Head :title="$t(title)" />

        <!-- Who is looking, and at what. A Normal User and an Admin read the
             same screen over different registers, so the scope has to be said
             out loud rather than left for them to infer from the numbers. -->
        <header class="wdash__hero">
            <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-white/70">
                    {{ $t('ផ្ទាំងគ្រប់គ្រង') }}
                </p>
                <h1 class="mt-1 truncate text-xl font-extrabold text-white sm:text-2xl">
                    {{ greeting }}
                </h1>
                <p class="mt-1 truncate text-sm text-white/80">{{ scopeCaption }}</p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
                <span v-if="viewer.role" class="wdash__chip">{{ $t(viewer.role) }}</span>
                <span v-if="viewer.sub_role" class="wdash__chip">{{ $t(viewer.sub_role) }}</span>
                <span class="wdash__chip wdash__chip--solid">
                    {{ workspace ? workspace.name : '' }}
                </span>
            </div>
        </header>

        <!-- The headline numbers. Which five appear is the role's decision;
             they are all counted server-side over the visible register. -->
        <div class="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            <div v-for="tile in tiles" :key="tile.key" class="wdash__tile">
                <div class="flex items-start justify-between gap-2">
                    <span class="wdash__tile-icon" :style="{ backgroundColor: tile.color + '1f', color: tile.color }">
                        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                            <path :d="tile.icon" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                    <span
                        v-if="tile.share !== null"
                        class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        >{{ tile.share }}%</span
                    >
                </div>
                <div class="mt-3 text-3xl font-extrabold leading-none tabular-nums text-gray-900 dark:text-white">
                    {{ tile.value }}
                </div>
                <div class="mt-1 truncate text-xs font-semibold text-gray-500 dark:text-gray-400" :title="tile.label">
                    {{ tile.label }}
                </div>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <span
                        class="block h-full rounded-full transition-[width] duration-500"
                        :style="{ width: (tile.share === null ? 100 : tile.share) + '%', backgroundColor: tile.color }"
                    ></span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-5">
            <!-- Part-to-whole: every document sits on exactly one board. -->
            <section class="wdash__panel xl:col-span-2">
                <header class="wdash__panel-head">
                    <div class="min-w-0">
                        <h2 class="wdash__panel-title">{{ $t('សេចក្តីសង្ខេប') }}</h2>
                        <p class="wdash__panel-sub">{{ metrics.total }} {{ $t('ឯកសារ') }}</p>
                    </div>
                    <span class="wdash__badge">{{ metrics.completion }}% {{ $t('រួចរាល់') }}</span>
                </header>

                <div v-if="ready && statusRows.length" class="h-[260px]">
                    <apexchart type="donut" height="100%" :options="donutOptions" :series="donutSeries" />
                </div>
                <p v-else class="flex h-[220px] items-center justify-center text-sm text-gray-400">
                    {{ $t('មិនទាន់មានឯកសារទេ។') }}
                </p>

                <!-- The legend names and counts every segment: identity is never
                     carried by colour alone, and it is the relief the lighter
                     slots need against a white card. -->
                <ul v-if="statusRows.length" class="mt-2 flex flex-col gap-2">
                    <li v-for="row in statusRows" :key="row.key" class="flex items-center gap-2 text-sm">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: row.color }"></span>
                        <span class="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200" :title="row.name">{{
                            row.name
                        }}</span>
                        <span class="shrink-0 font-bold tabular-nums text-gray-900 dark:text-white">{{
                            row.total
                        }}</span>
                        <span class="w-10 shrink-0 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400"
                            >{{ row.share }}%</span
                        >
                    </li>
                </ul>
            </section>

            <!-- Change over time: one measure, one axis, one series. -->
            <section class="wdash__panel xl:col-span-3">
                <header class="wdash__panel-head">
                    <div class="min-w-0">
                        <h2 class="wdash__panel-title">{{ $t('ឯកសារចូល ១៤ ថ្ងៃចុងក្រោយ') }}</h2>
                        <p class="wdash__panel-sub">
                            {{ trendTotal }} {{ $t('ឯកសារ') }} · {{ $t('សប្តាហ៍នេះ') }}
                            {{ metrics.new_this_week }}
                        </p>
                    </div>
                </header>

                <div v-if="ready" class="h-[300px]">
                    <apexchart type="area" height="100%" :options="trendOptions" :series="trendSeries" />
                </div>
            </section>
        </div>

        <div class="grid grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-2">
            <!-- Magnitude by a nominal category, one bar per row: this keeps
                 long Khmer project names readable where a bar chart's rotated
                 axis labels would not. -->
            <section class="wdash__panel">
                <header class="wdash__panel-head">
                    <div class="min-w-0">
                        <h2 class="wdash__panel-title">{{ $t('ថ្នាក់/ក្រុម/គម្រោង ឯកសារ') }}</h2>
                        <p class="wdash__panel-sub">{{ resolvedStatistics.length }} {{ $t('គម្រោង') }}</p>
                    </div>
                </header>

                <ul v-if="resolvedStatistics.length" class="flex flex-col gap-3.5">
                    <li v-for="(stat, idx) in resolvedStatistics" :key="'stat_' + idx" class="flex flex-col gap-1.5">
                        <div class="flex items-center justify-between gap-3">
                            <span class="min-w-0 truncate text-sm text-gray-700 dark:text-gray-200" :title="stat.label">
                                {{ $t(stat.label) }}
                            </span>
                            <span class="shrink-0 text-xs font-bold tabular-nums text-gray-900 dark:text-white">
                                {{ stat.done }}/{{ stat.total }}
                            </span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="relative h-2.5 flex-1 rounded-full bg-gray-100 dark:bg-white/10">
                                <span
                                    class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                                    :style="{ width: stat.percent + '%', backgroundColor: palette.complete }"
                                ></span>
                            </span>
                            <span
                                class="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400"
                                >{{ stat.percent }}%</span
                            >
                        </div>
                    </li>
                </ul>
                <p v-else class="flex h-[120px] items-center justify-center text-sm text-gray-400">
                    {{ $t('មិនទាន់មានឯកសារទេ។') }}
                </p>
            </section>

            <!-- The panel that changes with the role: open load per person for
                 whoever reads the whole register, own responsibility steps for
                 everyone else. -->
            <section class="wdash__panel">
                <header class="wdash__panel-head">
                    <div class="min-w-0">
                        <h2 class="wdash__panel-title">{{ workloadTitle }}</h2>
                        <p class="wdash__panel-sub">{{ workloadCaption }}</p>
                    </div>
                </header>

                <ul v-if="workloadRows.length" class="flex flex-col gap-3.5">
                    <li v-for="row in workloadRows" :key="row.key" class="flex items-center gap-3">
                        <span v-if="row.photo" class="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                            <img :src="row.photo" alt="" class="h-full w-full object-cover" />
                        </span>
                        <span
                            v-else
                            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-300"
                            >{{ row.initials }}</span
                        >
                        <span
                            class="w-24 shrink-0 truncate text-sm text-gray-700 sm:w-40 dark:text-gray-200"
                            :title="row.label"
                            >{{ row.label }}</span
                        >
                        <span class="relative h-2.5 flex-1 rounded-full bg-gray-100 dark:bg-white/10">
                            <span
                                class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                                :style="{ width: row.share + '%', backgroundColor: palette.series }"
                            ></span>
                        </span>
                        <span
                            class="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-gray-900 dark:text-white"
                            >{{ row.total }}</span
                        >
                    </li>
                </ul>
                <p v-else class="flex h-[120px] items-center justify-center px-4 text-center text-sm text-gray-400">
                    {{ workloadEmpty }}
                </p>
            </section>
        </div>

        <!-- The register itself. It is also the table view the lighter chart
             colours owe the reader under the relief rule. -->
        <div class="wdash__table-card">
            <div class="wdash__table-toolbar">
                <div class="min-w-0">
                    <h2 class="wdash__table-title">{{ $t('បញ្ជីឯកសារ') }}</h2>
                    <p class="wdash__panel-sub">{{ taskRows.length }} {{ $t('ឯកសារ') }}</p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button
                        type="button"
                        class="wdash__icon-btn"
                        @click="$emit('add-document')"
                        :aria-label="$t('Add document')"
                    >
                        <icon class="w-4 h-4" name="plus" />
                    </button>
                    <button
                        type="button"
                        class="wdash__icon-btn"
                        @click="$emit('toggle-filter')"
                        :aria-label="$t('Filter')"
                    >
                        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="wdash__doc-table">
                <div class="wdash__doc-row wdash__doc-row--head hidden md:grid">
                    <div></div>
                    <div>{{ $t('ល.រ.') }}</div>
                    <div>{{ $t('លេខកូដឯកសារ') }}</div>
                    <div>{{ $t('កម្មវត្ថុ') }}</div>
                    <div>{{ $t('កាលបរិច្ឆេទចូល') }}</div>
                    <div>{{ $t('ស្ថានភាព') }}</div>
                    <div>{{ $t('បាកូដ') }}</div>
                    <div>{{ $t('បោះពុម្ព') }}</div>
                </div>

                <draggable
                    v-model="pageRows"
                    tag="div"
                    class="wdash__doc-rows"
                    handle=".wdash__drag-handle"
                    item-key="id"
                    @end="afterDrop"
                >
                    <template #item="{ element, index }">
                        <div class="wdash__doc-row">
                            <div class="wdash__drag-handle hidden md:flex">
                                <icon class="w-5 h-5" name="drag" />
                            </div>
                            <div :data-label="$t('ល.រ.')">#{{ (currentPage - 1) * pageSize + index + 1 }}</div>
                            <div :data-label="$t('លេខកូដឯកសារ')">
                                <span class="wdash__doc-code" @click="taskDetailsPopup(element)">{{
                                    documentCode(element)
                                }}</span>
                            </div>
                            <div :data-label="$t('កម្មវត្ថុ')">
                                <span class="wdash__doc-subject" @click="taskDetailsPopup(element)">{{
                                    element.title
                                }}</span>
                                <span
                                    v-if="element.attachments_count"
                                    class="wdash__doc-attach"
                                    :aria-label="$t('Attachments')"
                                >
                                    <icon class="w-3.5 h-3.5" name="attachment" />{{ element.attachments_count }}
                                </span>
                            </div>
                            <div :data-label="$t('កាលបរិច្ឆេទចូល')">
                                {{ element.created_at ? moment(element.created_at).format('DD MMM YYYY') : '' }}
                            </div>
                            <div :data-label="$t('ស្ថានភាព')">
                                <span class="wdash__status-pill" :style="{ backgroundColor: statusColorFor(element) }">
                                    {{ element.list ? element.list.title : '' }}
                                </span>
                            </div>
                            <div :data-label="$t('បាកូដ')">
                                <div class="wdash__barcode">
                                    <svg
                                        :ref="setBarcodeRef(element.id)"
                                        :data-barcode-value="documentCode(element)"
                                    ></svg>
                                </div>
                            </div>
                            <div :data-label="$t('បោះពុម្ព')">
                                <!-- Opens the same printable receipt/tracking document used on
                                     the board and full table views. -->
                                <button
                                    type="button"
                                    @click.stop="openReceiptModal(element, $event)"
                                    class="wdash__print-btn"
                                    :title="$t('បោះពុម្ពឯកសារតាមដាន')"
                                    :aria-label="$t('បោះពុម្ពឯកសារតាមដាន')"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                                        <path
                                            d="M7 8.5V3.5h10v5"
                                            stroke="currentColor"
                                            stroke-width="1.6"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                        <rect
                                            x="4"
                                            y="8.5"
                                            width="16"
                                            height="7.5"
                                            rx="1.4"
                                            stroke="currentColor"
                                            stroke-width="1.6"
                                        />
                                        <rect
                                            x="7"
                                            y="13.5"
                                            width="10"
                                            height="7"
                                            rx="0.6"
                                            stroke="currentColor"
                                            stroke-width="1.6"
                                        />
                                        <circle cx="17" cy="11" r="0.9" fill="currentColor" />
                                    </svg>
                                    <span class="hidden md:inline">{{ $t('បោះពុម្ព') }}</span>
                                </button>
                            </div>
                        </div>
                    </template>
                </draggable>

                <div v-if="!taskRows.length" class="wdash__doc-empty">{{ $t('No documents found!') }}</div>

                <!-- Pagination — only shown once there's more than one page.
                     Same pattern as the full Table view: dragging only
                     reorders within the currently visible page. -->
                <div v-if="totalPages > 1" class="wdash__pagination">
                    <div class="wdash__pagination-info">
                        {{ $t('Showing') }} {{ paginationStart }}–{{ paginationEnd }} {{ $t('of') }}
                        {{ taskRows.length }}
                    </div>
                    <div class="wdash__pagination-controls">
                        <button
                            type="button"
                            class="wdash__page-btn"
                            :disabled="currentPage === 1"
                            @click="goToPage(currentPage - 1)"
                            :aria-label="$t('Previous page')"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                                <path
                                    d="M15 6l-6 6 6 6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <template v-for="(p, i) in paginationPages" :key="'pg_' + i">
                            <span v-if="p === '...'" class="wdash__page-ellipsis">…</span>
                            <button
                                v-else
                                type="button"
                                class="wdash__page-btn"
                                :class="{ 'wdash__page-btn--active': p === currentPage }"
                                @click="goToPage(p)"
                            >
                                {{ p }}
                            </button>
                        </template>
                        <button
                            type="button"
                            class="wdash__page-btn"
                            :disabled="currentPage === totalPages"
                            @click="goToPage(currentPage + 1)"
                            :aria-label="$t('Next page')"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                                <path
                                    d="M9 6l6 6-6 6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Same printable tracking document used on the board and full table views. -->
        <DocumentReceipt v-if="receiptModalOpen" :task="selectedReceiptTask" @close="closeReceiptModal" />
    </div>
</template>

<script>
import { Head } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import Icon from '@/Shared/Icon.vue';
import JsBarcode from 'jsbarcode';
import draggable from 'vuedraggable';
import moment from 'moment';
import axios from 'axios';
import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue';

/**
 * Two palettes, each selected for the surface it sits on rather than flipped
 * from the other. Both were run through the data-viz validator as a set:
 * the categorical eight pass the lightness band, chroma floor, adjacent CVD
 * separation (worst 9.1 light / 8.4 dark, target >= 8) and the normal-vision
 * floor (19.6 / 19.3, floor 15) in both modes.
 *
 * Three light slots and one dark slot sit under 3:1 against the card, so the
 * relief rule applies and is met: every donut segment is named and counted in
 * the legend beside it, and the register itself is on the same screen.
 *
 * STATUS is reserved for document state - done, overdue, due soon, open,
 * unassigned - and is never reused as "series 6". Board columns are identity,
 * not state, so they draw from CATEGORICAL. Same values as Projects/Dashboard,
 * so a document keeps its colour across the two dashboards.
 */
const STATUS = {
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
        grid: '#e8e7e3',
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
        grid: '#3a3d46',
    },
};

/** Fixed slot order - assigned by position, never cycled through a hue wheel. */
const CATEGORICAL = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

/** Tile glyphs, as single stroked paths on a 24x24 box. */
const ICONS = {
    total: 'M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4',
    open: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    done: 'M20 6L9 17l-5-5',
    overdue: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    unassigned: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 3a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6',
    awaiting: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
    due_soon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    mine: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    fresh: 'M3 17l6-6 4 4 8-8M21 7v6h-6',
};

const EMPTY_METRICS = {
    total: 0,
    open: 0,
    done: 0,
    overdue: 0,
    due_soon: 0,
    unassigned: 0,
    mine: 0,
    awaiting_me: 0,
    new_this_week: 0,
    completion: 0,
};

export default {
    name: 'workspace-dashboard',
    components: { Head, Icon, draggable, DocumentReceipt },
    layout: Layout,
    emits: ['add-document', 'toggle-filter', 'open-document'],
    props: {
        title: { type: String, default: 'Dashboard' },
        workspace: { type: Object, default: null },
        lists: { type: Array, default: () => [] },
        statistics: { type: Array, default: () => [] },
        /** Role context - see WorkSpacesController::dashboardViewer. */
        viewer: { type: Object, default: () => ({}) },
        /** Headline counts over the register this person may see. */
        metrics: { type: Object, default: () => ({}) },
        /** Documents received per day, oldest first. */
        trend: { type: Array, default: () => [] },
        /** Open load per person (whole-register roles) or per responsibility step. */
        workload: { type: Array, default: () => [] },
    },
    data() {
        return {
            barcodeRefs: {},
            taskRows: [],
            receiptModalOpen: false,
            selectedReceiptTask: null,
            currentPage: 1,
            pageSize: 10,
            pageRows: [],
            is_dark: false,
            mode_observer: null,
            // ApexCharts is a browser component and is not registered on the
            // SSR build, so the charts wait for the client.
            ready: false,
        };
    },
    computed: {
        palette() {
            return this.is_dark ? STATUS.dark : STATUS.light;
        },
        categorical() {
            return this.is_dark ? CATEGORICAL.dark : CATEGORICAL.light;
        },

        /**
         * 'all' - this person reads the whole register (Admin, or the registry
         * office by responsibility). 'mine' - they read what has reached them.
         * The server decides it; this is only the fallback for a page rendered
         * without the prop.
         */
        scope() {
            if (this.viewer && this.viewer.scope) return this.viewer.scope;
            return this.workspace?.member?.role === 'admin' ? 'all' : 'mine';
        },
        isWholeRegister() {
            return this.scope === 'all';
        },

        greeting() {
            const name = this.viewer?.name || this.$page?.props?.auth?.user?.first_name || '';
            return name ? this.$t('សួស្តី') + ', ' + name : this.$t('ផ្ទាំងគ្រប់គ្រងឯកសារ');
        },
        scopeCaption() {
            return this.isWholeRegister
                ? this.$t('ទិដ្ឋភាពរួមនៃឯកសារទាំងអស់ក្នុងកន្លែងធ្វើការនេះ')
                : this.$t('ឯកសារដែលពាក់ព័ន្ធនឹងអ្នក និងតួនាទីរបស់អ្នក');
        },

        /** Server counts when they are there, counted here when they are not. */
        resolvedMetrics() {
            if (this.metrics && Object.keys(this.metrics).length) {
                return { ...EMPTY_METRICS, ...this.metrics };
            }

            const tasks = this.allTasks;
            const done = tasks.filter((task) => !!task.is_done).length;

            return {
                ...EMPTY_METRICS,
                total: tasks.length,
                open: tasks.length - done,
                done,
                mine: tasks.filter((task) => this.isMine(task)).length,
                completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
            };
        },

        /** Five tiles, chosen by role: the ones that role can act on. */
        tiles() {
            const m = this.resolvedMetrics;
            const p = this.palette;
            const share = (value) => (m.total ? Math.round((value / m.total) * 100) : 0);

            const wholeRegister = [
                {
                    key: 'total',
                    label: this.$t('ឯកសារសរុប'),
                    value: m.total,
                    color: p.series,
                    icon: ICONS.total,
                    share: null,
                },
                {
                    key: 'open',
                    label: this.$t('កំពុងដំណើរការ'),
                    value: m.open,
                    color: p.later,
                    icon: ICONS.open,
                    share: share(m.open),
                },
                {
                    key: 'done',
                    label: this.$t('បានបញ្ចប់'),
                    value: m.done,
                    color: p.complete,
                    icon: ICONS.done,
                    share: share(m.done),
                },
                {
                    key: 'overdue',
                    label: this.$t('ហួសកំណត់'),
                    value: m.overdue,
                    color: p.overdue,
                    icon: ICONS.overdue,
                    share: share(m.overdue),
                },
                {
                    key: 'unassigned',
                    label: this.$t('មិនទាន់ប្រគល់'),
                    value: m.unassigned,
                    color: p.none,
                    icon: ICONS.unassigned,
                    share: share(m.unassigned),
                },
            ];

            const mine = [
                {
                    key: 'mine',
                    label: this.$t('ឯកសាររបស់ខ្ញុំ'),
                    value: m.mine,
                    color: p.series,
                    icon: ICONS.mine,
                    share: null,
                },
                {
                    key: 'awaiting_me',
                    label: this.$t('រង់ចាំសកម្មភាពរបស់ខ្ញុំ'),
                    value: m.awaiting_me,
                    color: p.later,
                    icon: ICONS.awaiting,
                    share: share(m.awaiting_me),
                },
                {
                    key: 'due_soon',
                    label: this.$t('ជិតដល់កំណត់'),
                    value: m.due_soon,
                    color: p.soon,
                    icon: ICONS.due_soon,
                    share: share(m.due_soon),
                },
                {
                    key: 'overdue',
                    label: this.$t('ហួសកំណត់'),
                    value: m.overdue,
                    color: p.overdue,
                    icon: ICONS.overdue,
                    share: share(m.overdue),
                },
                {
                    key: 'done',
                    label: this.$t('បានបញ្ចប់'),
                    value: m.done,
                    color: p.complete,
                    icon: ICONS.done,
                    share: share(m.done),
                },
            ];

            return this.isWholeRegister ? wholeRegister : mine;
        },

        /** One row per board column - identity, so it draws from CATEGORICAL. */
        statusRows() {
            const rows = (this.lists || []).map((listItem, idx) => ({
                key: 'list_' + (listItem.id || idx),
                name: this.$t(listItem.title),
                total: this.tasksForList(listItem).length,
                color: this.categorical[idx % this.categorical.length],
            }));

            const total = rows.reduce((sum, row) => sum + row.total, 0);

            return rows
                .filter((row) => row.total > 0)
                .map((row) => ({ ...row, share: total ? Math.round((row.total / total) * 100) : 0 }));
        },

        donutSeries() {
            return this.statusRows.map((row) => row.total);
        },
        donutOptions() {
            const p = this.palette;

            return {
                chart: {
                    type: 'donut',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    toolbar: { show: false },
                    animations: { speed: 400 },
                },
                labels: this.statusRows.map((row) => row.name),
                colors: this.statusRows.map((row) => row.color),
                // A gap in the surface colour separates the segments; no borders.
                stroke: { width: 2, colors: [p.surface] },
                dataLabels: { enabled: false },
                legend: { show: false },
                plotOptions: {
                    pie: {
                        expandOnClick: false,
                        donut: {
                            size: '72%',
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
                                    label: this.$t('ឯកសារ'),
                                    color: p.muted,
                                    fontSize: '12px',
                                    formatter: () => this.resolvedMetrics.total,
                                },
                            },
                        },
                    },
                },
                states: { hover: { filter: { type: 'lighten', value: 0.06 } } },
                tooltip: {
                    theme: this.is_dark ? 'dark' : 'light',
                    y: { formatter: (value) => value + ' ' + this.$t('ឯកសារ') },
                },
            };
        },

        trendRows() {
            if (this.trend && this.trend.length) return this.trend;

            // No prop: fourteen empty days, so the panel keeps its shape.
            return Array.from({ length: 14 }, (unused, idx) => ({
                date: moment()
                    .subtract(13 - idx, 'days')
                    .format('YYYY-MM-DD'),
                total: 0,
            }));
        },
        trendTotal() {
            return this.trendRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
        },
        trendSeries() {
            return [{ name: this.$t('ឯកសារចូល'), data: this.trendRows.map((row) => Number(row.total) || 0) }];
        },
        trendOptions() {
            const p = this.palette;

            return {
                chart: {
                    type: 'area',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    toolbar: { show: false },
                    zoom: { enabled: false },
                    animations: { speed: 400 },
                },
                colors: [p.series],
                // One series: the title names it, so no legend box.
                legend: { show: false },
                dataLabels: { enabled: false },
                // Straight, not smoothed: a spline through daily counts
                // invents a plateau between two days that never happened.
                stroke: { curve: 'straight', width: 2 },
                fill: {
                    type: 'gradient',
                    gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 100] },
                },
                markers: { size: 0, hover: { size: 5 } },
                grid: {
                    borderColor: p.grid,
                    strokeDashArray: 4,
                    xaxis: { lines: { show: false } },
                    padding: { left: 4, right: 8 },
                },
                xaxis: {
                    categories: this.trendRows.map((row) => moment(row.date).format('DD MMM')),
                    tickAmount: 6,
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: { style: { colors: p.muted, fontSize: '11px' } },
                    tooltip: { enabled: false },
                },
                yaxis: {
                    min: 0,
                    // Whole documents only - a fractional tick would be a lie.
                    forceNiceScale: true,
                    labels: {
                        style: { colors: p.muted, fontSize: '11px' },
                        formatter: (value) => Math.round(value),
                    },
                },
                tooltip: {
                    theme: this.is_dark ? 'dark' : 'light',
                    x: { show: true },
                    y: { formatter: (value) => value + ' ' + this.$t('ឯកសារ') },
                },
            };
        },

        workloadTitle() {
            return this.isWholeRegister ? this.$t('បន្ទុកឯកសារតាមបុគ្គល') : this.$t('តួនាទីរបស់ខ្ញុំក្នុងលំហូរឯកសារ');
        },
        workloadCaption() {
            if (this.isWholeRegister) return this.$t('ឯកសារកំពុងដំណើរការ');
            const steps = (this.viewer?.responsibilities || []).length;
            return steps + ' ' + this.$t('ជំហានទទួលខុសត្រូវ');
        },
        workloadEmpty() {
            return this.isWholeRegister
                ? this.$t('មិនទាន់មានការប្រគល់ឯកសារទេ។')
                : this.$t('អ្នកមិនទាន់មានតួនាទីក្នុងលំហូរឯកសារទេ។');
        },
        workloadRows() {
            const rows = this.workload || [];
            const max = rows.reduce((m, row) => Math.max(m, Number(row.total) || 0), 0);

            return rows.map((row, idx) => {
                const total = Number(row.total) || 0;

                return {
                    key: 'load_' + idx,
                    label: this.$t(row.label || '—'),
                    photo: row.photo || null,
                    initials: this.initialsOf(row.label),
                    total,
                    share: max ? Math.max(4, (total / max) * 100) : 0,
                };
            });
        },

        workspaceProjectCount() {
            if (!this.workspace) return 0;
            if (typeof this.workspace.projects_count === 'number') return this.workspace.projects_count;
            if (Array.isArray(this.workspace.projects)) return this.workspace.projects.length;
            return 0;
        },

        allTasks() {
            if (!this.lists) return [];
            return this.lists.flatMap((listItem) =>
                this.tasksForList(listItem).map((task) => {
                    if (!task.list) task.list = { id: listItem.id, title: listItem.title };
                    if (!task.list_id) task.list_id = listItem.id;
                    return task;
                })
            );
        },

        dynamicStatistics() {
            return (this.lists || []).map((listItem) => {
                const tasks = this.tasksForList(listItem);
                const total = tasks.length;
                const done = tasks.filter((t) => !!t.is_done).length;
                const percent = total ? Math.round((done / total) * 100) : 0;
                return { label: listItem.title, done, total, percent };
            });
        },
        resolvedStatistics() {
            return this.statistics && this.statistics.length ? this.statistics : this.dynamicStatistics;
        },

        totalPages() {
            return Math.max(1, Math.ceil(this.taskRows.length / this.pageSize));
        },
        paginationStart() {
            return this.taskRows.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
        },
        paginationEnd() {
            return Math.min(this.currentPage * this.pageSize, this.taskRows.length);
        },
        paginationPages() {
            const total = this.totalPages;
            const current = this.currentPage;
            const delta = 2;
            const range = [];
            for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
                range.push(i);
            }
            const pages = [1];
            if (range[0] > 2) pages.push('...');
            pages.push(...range);
            if (range.length && range[range.length - 1] < total - 1) pages.push('...');
            if (total > 1) pages.push(total);
            return pages;
        },
    },
    watch: {
        lists: {
            deep: true,
            handler() {
                this.syncTaskRows();
            },
        },
    },
    created() {
        this.moment = moment;
        this.syncTaskRows();
    },
    mounted() {
        this.ready = true;
        this.readMode();

        // The theme toggle swaps a class on the layout root; the charts pick
        // their colours for the surface they are on, so they have to hear it.
        const root = document.querySelector('.layout-app');
        if (root && typeof MutationObserver !== 'undefined') {
            this.mode_observer = new MutationObserver(this.readMode);
            this.mode_observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        }

        this.$nextTick(() => this.renderBarcodes());
    },
    updated() {
        this.$nextTick(() => this.renderBarcodes());
    },
    beforeUnmount() {
        if (this.mode_observer) this.mode_observer.disconnect();
    },
    methods: {
        readMode() {
            const root = document.querySelector('.layout-app');
            this.is_dark = !!root && root.classList.contains('dark');
        },

        initialsOf(label) {
            return String(label || '—')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join('')
                .toUpperCase();
        },

        syncTaskRows() {
            this.taskRows = [...this.allTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
            this.syncPageRows();
        },
        syncPageRows() {
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
            const start = (this.currentPage - 1) * this.pageSize;
            this.pageRows = this.taskRows.slice(start, start + this.pageSize);
        },
        goToPage(page) {
            if (page === '...' || page < 1 || page > this.totalPages || page === this.currentPage) return;
            this.currentPage = page;
            this.syncPageRows();
        },
        afterDrop() {
            const start = (this.currentPage - 1) * this.pageSize;
            const payload = this.pageRows.map((task, idx) => {
                task.order = start + idx + 1;
                return { id: task.id, order: task.order };
            });
            this.taskRows.splice(start, this.pageRows.length, ...this.pageRows);
            axios.post(this.route('task.update.order'), payload).catch((error) => {
                console.log(error);
            });
        },
        statusColorFor(element) {
            if (!this.lists) return this.categorical[0];
            let idx = this.lists.findIndex((l) => l.id === element.list_id);
            if (idx === -1) {
                idx = this.lists.findIndex((l) => (l.tasks || []).some((t) => t.id === element.id));
            }
            return this.categorical[(idx === -1 ? 0 : idx) % this.categorical.length];
        },
        documentCode(element) {
            if (element.task_code) return element.task_code;
            return 'CGMC-' + String(element.id).padStart(9, '0');
        },

        isAssignedToMe(task) {
            const userId = this.$page?.props?.auth?.user?.id;
            if (!userId) return false;
            return (task.assignees || []).some((a) => Number(a.user_id) === Number(userId));
        },

        /**
         * The same three arms Task::scopeVisibleTo uses for someone who does
         * not read the whole register - theirs by authorship, by assignment, or
         * because it sits on a board their responsibility covers. Written the
         * same way here so the table cannot hide a document the server has
         * already decided this person may see.
         */
        isMine(task) {
            const userId = this.$page?.props?.auth?.user?.id;
            if (!userId) return false;

            if (Number(task.user_id) === Number(userId)) return true;
            if (this.isAssignedToMe(task)) return true;

            const responsibleFor = this.viewer?.responsibilities || [];
            const listTitle = task.list?.title;

            return !!(listTitle && responsibleFor.includes(listTitle));
        },

        /**
         * No filtering here. WorkSpacesController::viewMainDashboard narrows the
         * register before it renders - the whole register for whoever reads it,
         * that person's plate for everyone else - so a second rule at this end
         * could only disagree with the counts the same controller sent.
         */
        tasksForList(listItem) {
            return listItem.tasks || [];
        },

        taskDetailsPopup(element) {
            this.$emit('open-document', element.slug || element.id);
        },
        openReceiptModal(task, e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectedReceiptTask = task;
            this.receiptModalOpen = true;
        },
        closeReceiptModal() {
            this.receiptModalOpen = false;
            this.selectedReceiptTask = null;
        },
        setBarcodeRef(id) {
            return (el) => {
                if (el) this.barcodeRefs[id] = el;
            };
        },
        renderBarcodes() {
            Object.entries(this.barcodeRefs).forEach(([id, el]) => {
                if (!el || !el.isConnected) {
                    delete this.barcodeRefs[id];
                    return;
                }
                const value = el.dataset.barcodeValue;
                if (!value) return;
                try {
                    JsBarcode(el, value, {
                        format: 'CODE128',
                        width: 1,
                        height: 32,
                        fontSize: 10,
                        margin: 0,
                        displayValue: false,
                    });
                } catch (err) {
                    console.error('Failed to render barcode for', value, err);
                }
            });
        },
    },
};
</script>

<style scoped>
.wdash {
    font-family: 'Kantumruy Pro', 'KHMER OS Battambang', 'Segoe UI', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1rem 1.25rem 2rem;
}

/* Greeting strip. The workspace background behind it is whatever the board
   is wearing, so the strip carries its own dark scrim rather than trusting
   the contrast of an arbitrary image. */
.wdash__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem 1.35rem;
    border-radius: 1rem;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.68));
    backdrop-filter: blur(6px);
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.18);
}
.wdash__chip {
    display: inline-flex;
    align-items: center;
    height: 1.75rem;
    padding: 0 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
}
.wdash__chip--solid {
    border-color: transparent;
    background: #fff;
    color: #1f2937;
}

/* Tiles and panels share one card treatment with the project dashboard. */
.wdash__tile,
.wdash__panel {
    border-radius: 1rem;
    border: 1px solid rgba(229, 231, 235, 0.6);
    background: #fff;
    padding: 1rem;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}
.wdash__panel {
    padding: 1.15rem 1.25rem;
}
.dark .wdash__tile,
.dark .wdash__panel {
    border-color: rgba(255, 255, 255, 0.1);
    background: #262932;
}
.wdash__tile {
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}
.wdash__tile:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}
.wdash__tile-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.65rem;
}

.wdash__panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}
.wdash__panel-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}
.dark .wdash__panel-title {
    color: #fff;
}
.wdash__panel-sub {
    margin: 0.15rem 0 0;
    font-size: 0.75rem;
    color: #6b7280;
}
.dark .wdash__panel-sub {
    color: #9ca3af;
}
.wdash__badge {
    flex-shrink: 0;
    border-radius: 0.5rem;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: #4b5563;
    white-space: nowrap;
}
.dark .wdash__badge {
    background: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
}

/* Documents table */
.wdash__table-card {
    background: #fff;
    border: 1px solid rgba(229, 231, 235, 0.6);
    border-radius: 1rem;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    overflow: hidden;
}
.wdash__table-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.25rem 0;
}
.wdash__table-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}
.wdash__icon-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    color: #64748b;
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}
.wdash__icon-btn:hover {
    background: #f1f5f9;
    color: #235567;
}
.wdash__doc-table {
    padding: 0.75rem 1rem 1rem;
}
.wdash__doc-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.5rem;
}
.wdash__doc-row {
    display: grid;
    grid-template-columns: 4% 6% 14% 22% 12% 12% 16% 14%;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 0.75rem;
    border-radius: 0.6rem;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}
.wdash__doc-rows > .wdash__doc-row:hover {
    background: #f8fafc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}
.wdash__doc-row--head {
    background: linear-gradient(135deg, #2b6f80, #235a68);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 0.6rem;
}
.wdash__drag-handle {
    align-items: center;
    justify-content: center;
    cursor: grab;
    color: #94a3b8;
    transition: color 0.15s ease;
}
.wdash__drag-handle:hover {
    color: #64748b;
}
.wdash__drag-handle:active {
    cursor: grabbing;
}
@media (max-width: 900px) {
    .wdash__doc-row {
        grid-template-columns: 1fr;
    }
    /* The header row is Tailwind-hidden below md, but this file's own
       .wdash__doc-row { display: grid } lands after it in the stylesheet and
       wins on equal specificity - so it is said again here. Each cell carries
       its own data-label at this width anyway. */
    .wdash__doc-row--head {
        display: none;
    }
    .wdash__drag-handle {
        display: none;
    }
    .wdash__doc-row > [data-label] {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        padding: 0.3rem 0;
        border-bottom: 1px solid #eef2f6;
    }
    .wdash__doc-row > [data-label]:last-child {
        border-bottom: none;
    }
    .wdash__doc-row > [data-label]::before {
        content: attr(data-label);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        color: #64748b;
        flex-shrink: 0;
    }
}
.wdash__doc-code,
.wdash__doc-subject {
    cursor: pointer;
    color: #1e293b;
    font-weight: 500;
}
.wdash__doc-code:hover,
.wdash__doc-subject:hover {
    color: #235567;
    text-decoration: underline;
    text-underline-offset: 2px;
}
.wdash__doc-attach {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    font-weight: 500;
    color: #64748b;
    background: #f1f5f9;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    margin-left: 0.5rem;
}
.wdash__status-pill {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #fff;
}
.wdash__barcode {
    background: #fff;
    border: 1px solid #eef2f6;
    border-radius: 0.4rem;
    padding: 0.35rem 0.5rem;
    width: 100%;
    max-width: 170px;
}
.wdash__barcode svg {
    width: 100%;
    height: 30px;
    display: block;
}

.wdash__print-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: #eef2ff;
    border: 1px solid #e0e7ff;
    color: #4f46e5;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease;
}
.wdash__print-btn:hover {
    background: #e0e7ff;
    border-color: #c7d2fe;
    transform: translateY(-1px);
}
.wdash__print-btn:active {
    transform: translateY(0);
}
.dark .wdash__print-btn {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.25);
    color: #a5b4fc;
}
.dark .wdash__print-btn:hover {
    background: rgba(99, 102, 241, 0.2);
}

.wdash__doc-empty {
    text-align: center;
    padding: 2rem;
    font-size: 0.85rem;
    color: #94a3b8;
}

/* Pagination */
.wdash__pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 0 0.25rem;
}
.wdash__pagination-info {
    font-size: 0.75rem;
    color: #64748b;
}
.wdash__pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}
.wdash__page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #475569;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}
.wdash__page-btn:hover:not(:disabled) {
    background: #eef2ff;
    color: #235567;
}
.wdash__page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}
.wdash__page-btn--active {
    background: #235567;
    border-color: #235567;
    color: #fff;
}
.wdash__page-btn--active:hover {
    background: #235567;
    color: #fff;
}
.wdash__page-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 32px;
    color: #94a3b8;
    font-size: 0.8rem;
}

/* Dark mode for the register. The table was written for a white card only;
   these are the same rules restated for the dark surface. */
.dark .wdash__table-card {
    background: #262932;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.dark .wdash__table-title {
    color: #fff;
}
.dark .wdash__icon-btn {
    color: #9ca3af;
}
.dark .wdash__icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}
.dark .wdash__doc-rows > .wdash__doc-row:hover {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: none;
}
.dark .wdash__doc-code,
.dark .wdash__doc-subject {
    color: #e5e7eb;
}
.dark .wdash__doc-code:hover,
.dark .wdash__doc-subject:hover {
    color: #93c5fd;
}
.dark .wdash__doc-attach {
    background: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
}
.dark .wdash__doc-row > [data-label]::before {
    color: #9ca3af;
}
.dark .wdash__doc-row > [data-label] {
    border-bottom-color: rgba(255, 255, 255, 0.08);
}
.dark .wdash__page-btn {
    color: #d1d5db;
}
.dark .wdash__page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}
.dark .wdash__page-btn--active,
.dark .wdash__page-btn--active:hover {
    background: #3987e5;
    border-color: #3987e5;
    color: #fff;
}
.dark .wdash__pagination-info {
    color: #9ca3af;
}
</style>
