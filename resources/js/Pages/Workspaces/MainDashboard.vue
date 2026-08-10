<template>
    <div class="wdash">
        <Head :title="$t(title)" />

        <!-- Top status cards -->
        <div class="wdash__cards">
            <div v-for="(card, cIdx) in statusCards" :key="'card_'+cIdx" class="wdash__card">
                <div class="wdash__card-title">{{ $t(card.title) }}</div>
                <div class="wdash__card-total">{{ card.total }}</div>
                <div class="wdash__rings">
                    <div v-for="(item, iIdx) in card.items" :key="'ring_'+cIdx+'_'+iIdx" class="wdash__ring">
                        <svg viewBox="0 0 76 76" class="wdash__ring-svg">
                            <circle cx="38" cy="38" r="32" class="wdash__ring-bg" />
                            <circle
                                cx="38" cy="38" r="32"
                                fill="none"
                                :stroke="item.color"
                                stroke-width="6"
                                stroke-linecap="round"
                                :stroke-dasharray="ringDasharray(card, item)"
                                transform="rotate(-90 38 38)"
                            />
                            <text x="38" y="44" text-anchor="middle" class="wdash__ring-value">{{ item.value }}</text>
                        </svg>
                        <div class="wdash__ring-label">{{ $t(item.label) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary + Statistics -->
        <div class="wdash__row">
            <div class="wdash__panel wdash__panel--summary">
                <div class="wdash__panel-title">{{ $t('Summary') }}</div>
                <div class="wdash__donut-wrap">
                    <svg viewBox="0 0 200 200" class="wdash__donut">
                        <circle cx="100" cy="100" r="80" class="wdash__donut-bg" />
                        <circle
                            v-for="(seg, sIdx) in donutSegments" :key="'seg_'+sIdx"
                            cx="100" cy="100" r="80"
                            fill="none"
                            :stroke="seg.color"
                            stroke-width="34"
                            :stroke-dasharray="seg.dash + ' ' + (donutCircumference - seg.dash)"
                            :stroke-dashoffset="seg.offset"
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                    <div class="wdash__donut-center">{{ summary.percent }}%</div>
                </div>
                <div class="wdash__legend">
                    <div v-for="(seg, sIdx) in summary.segments" :key="'leg_'+sIdx" class="wdash__legend-item">
                        <span class="wdash__legend-dot" :style="{ backgroundColor: seg.color }"></span>
                        <span>{{ $t(seg.label) }} {{ seg.max ? seg.value + '/' + seg.max : seg.value + ' (' + seg.percent + '%)' }}</span>
                    </div>
                </div>
            </div>

            <div class="wdash__panel wdash__panel--stats">
                <div class="wdash__panel-title">{{ $t('Document Statistic') }}</div>
                <div class="wdash__stat-list">
                    <div v-for="(stat, stIdx) in statistics" :key="'stat_'+stIdx" class="wdash__stat-row">
                        <div class="wdash__stat-label">{{ $t(stat.label) }}</div>
                        <div class="wdash__stat-bar-wrap">
                            <div class="wdash__stat-bar-track">
                                <div class="wdash__stat-bar-fill" :style="{ width: stat.percent + '%' }">
                                    <span class="wdash__stat-bar-text">{{ stat.done }}/{{ stat.total }}</span>
                                </div>
                            </div>
                            <span class="wdash__stat-percent">{{ stat.percent }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Documents table -->
        <div class="wdash__table-card">
            <div class="wdash__table-toolbar">
                <button type="button" class="wdash__icon-btn" @click="$emit('add-document')" :aria-label="$t('Add document')">
                    <icon class="w-4 h-4" name="plus" />
                </button>
                <button type="button" class="wdash__icon-btn" @click="$emit('toggle-filter')" :aria-label="$t('Filter')">
                    <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" />
                    </svg>
                </button>
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
                </div>

                <draggable v-model="taskRows" tag="div" class="wdash__doc-rows" handle=".wdash__drag-handle" item-key="id" @end="afterDrop">
                    <template #item="{ element, index }">
                        <div class="wdash__doc-row">
                            <div class="wdash__drag-handle hidden md:flex">
                                <icon class="w-5 h-5" name="drag" />
                            </div>
                            <div :data-label="$t('ល.រ.')">#{{ index + 1 }}</div>
                            <div :data-label="$t('លេខកូដឯកសារ')">
                                <span class="wdash__doc-code" @click="taskDetailsPopup(element)">{{ documentCode(element) }}</span>
                            </div>
                            <div :data-label="$t('កម្មវត្ថុ')">
                                <span class="wdash__doc-subject" @click="taskDetailsPopup(element)">{{ element.title }}</span>
                                <span v-if="element.attachments_count" class="wdash__doc-attach" :aria-label="$t('Attachments')">
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
                                    <svg :ref="setBarcodeRef(element.id)" :data-barcode-value="documentCode(element)"></svg>
                                </div>
                            </div>
                        </div>
                    </template>
                </draggable>

                <div v-if="!taskRows.length" class="wdash__doc-empty">{{ $t('No documents found!') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Head } from '@inertiajs/vue3'
    import Layout from '@/Shared/Layout.vue'
    import Icon from '@/Shared/Icon.vue'
    import JsBarcode from 'jsbarcode'
    import draggable from 'vuedraggable'
    import moment from 'moment'
    import axios from 'axios'

    export default {
        name: 'workspace-dashboard',
        components: { Head, Icon, draggable },
        layout: Layout,
        emits: ['add-document', 'toggle-filter', 'open-document'],
        props: {
            title: { type: String, default: 'Dashboard' },
            workspace: { type: Object, default: null },
            lists: { type: Array, default: () => [] },
            statusCards: {
                type: Array,
                default: () => ([
                    {
                        title: 'Document Status', total: 233, items: [
                            { label: 'Submitted', value: 12, color: '#4a90d9' },
                            { label: 'Reviewing', value: 15, color: '#c9d94d' },
                            { label: 'Approved', value: 20, color: '#4caf50' },
                            { label: 'Rejected', value: 10, color: '#e0503a' },
                        ]
                    },
                    {
                        title: 'Administrative Document', total: 233, items: [
                            { label: 'Submitted', value: 12, color: '#4a90d9' },
                            { label: 'Reviewing', value: 15, color: '#c9d94d' },
                            { label: 'Approved', value: 20, color: '#4caf50' },
                            { label: 'Rejected', value: 10, color: '#e0503a' },
                        ]
                    },
                    {
                        title: 'Casino Operators Document', total: 233, items: [
                            { label: 'Submitted', value: 12, color: '#4a90d9' },
                            { label: 'Reviewing', value: 15, color: '#c9d94d' },
                            { label: 'Approved', value: 20, color: '#4caf50' },
                            { label: 'Rejected', value: 10, color: '#e0503a' },
                        ]
                    },
                ])
            },
            summary: {
                type: Object,
                default: () => ({
                    percent: 65,
                    segments: [
                        { label: 'ដាក់ស្នើ', value: 28, max: 134, percent: 40, color: '#4a90d9' },
                        { label: 'ពោះបង់', value: 16, percent: 5, color: '#f0a63a' },
                        { label: 'បដិសេធ', value: 30, percent: 20, color: '#e0503a' },
                        { label: 'ការអនុម័តបណ្ណសារ', value: 30, percent: 20, color: '#9b59b6' },
                        { label: 'អនុម័ត', value: 30, percent: 20, color: '#7cb342' },
                    ]
                })
            },
            statistics: {
                type: Array,
                default: () => ([
                    { label: 'នាយកដ្ឋានកិច្ចការទូទៅ', done: 13, total: 15, percent: 70 },
                    { label: 'នាយកដ្ឋានកិច្ចការគតិយុត្ត និងអាជ្ញាប័ណ្ណ', done: 10, total: 20, percent: 50 },
                    { label: 'នាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល', done: 17, total: 20, percent: 87 },
                    { label: 'នាយកដ្ឋានត្រួតពិនិត្យបច្ចេកទេសល្បែង', done: 18, total: 20, percent: 85 },
                    { label: 'នាយកដ្ឋានគ្រប់គ្រងសន្តិសុខ និងសណ្តាប់ធ្នាប់', done: 18, total: 20, percent: 90 },
                    { label: 'អង្គភាពសវនកម្មផ្ទៃក្នុង', done: 5, total: 20, percent: 20 },
                ])
            },
        },
        data() {
            return {
                barcodeRefs: {},
                taskRows: [],
            }
        },
        computed: {
            donutCircumference() {
                return 2 * Math.PI * 80;
            },
            donutTotalPercent() {
                return this.summary.segments.reduce((sum, s) => sum + (s.percent || 0), 0) || 1;
            },
            donutSegments() {
                let cumulative = 0;
                return this.summary.segments.map(seg => {
                    const normalizedPercent = (seg.percent / this.donutTotalPercent) * 100;
                    const dash = (normalizedPercent / 100) * this.donutCircumference;
                    const offset = -((cumulative / 100) * this.donutCircumference);
                    cumulative += normalizedPercent;
                    return { ...seg, dash, offset };
                });
            },
            allTasks() {
                if (!this.lists) return [];
                return this.lists.flatMap(listItem =>
                    (listItem.tasks || []).map(task => {
                        if (!task.list) task.list = { id: listItem.id, title: listItem.title };
                        if (!task.list_id) task.list_id = listItem.id;
                        return task;
                    })
                );
            },
        },
        watch: {
            lists: {
                deep: true,
                handler() { this.syncTaskRows(); },
            },
        },
        created() {
            this.moment = moment;
            this.syncTaskRows();
        },
        mounted() {
            this.$nextTick(() => this.renderBarcodes());
        },
        updated() {
            this.$nextTick(() => this.renderBarcodes());
        },
        methods: {
            ringDasharray(card, item) {
                const totalItems = card.items.reduce((sum, i) => sum + (i.value || 0), 0) || 1;
                const circumference = 2 * Math.PI * 32;
                const percent = (item.value / totalItems) * 100;
                const dash = (percent / 100) * circumference;
                return dash + ' ' + (circumference - dash);
            },
            syncTaskRows() {
                this.taskRows = [...this.allTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
            },
            afterDrop() {
                const payload = this.taskRows.map((task, idx) => {
                    task.order = idx + 1;
                    return { id: task.id, order: task.order };
                });
                axios.post(this.route('task.update.order'), payload).catch((error) => {
                    console.log(error);
                });
            },
            statusColorFor(element) {
                if (!this.lists || !element.list_id) return '#3b82f6';
                const idx = this.lists.findIndex(l => l.id === element.list_id);
                return idx === 0 ? '#10b981' : '#3b82f6';
            },
            documentCode(element) {
                if (element.task_code) return element.task_code;
                return 'CGMC-' + String(element.id).padStart(9, '0');
            },
            taskDetailsPopup(element) {
                this.$emit('open-document', element.slug || element.id);
            },
            setBarcodeRef(id) {
                return (el) => { if (el) this.barcodeRefs[id] = el; };
            },
            renderBarcodes() {
                Object.entries(this.barcodeRefs).forEach(([id, el]) => {
                    if (!el || !el.isConnected) { delete this.barcodeRefs[id]; return; }
                    const value = el.dataset.barcodeValue;
                    if (!value) return;
                    try {
                        JsBarcode(el, value, { format: 'CODE128', width: 1, height: 32, fontSize: 10, margin: 0, displayValue: false });
                    } catch (err) { console.error('Failed to render barcode for', value, err); }
                });
            },
        },
    }
</script>

<style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');

    .wdash {
        font-family: 'Kantumruy Pro', 'KHMER OS Battambang', 'Segoe UI', system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 1rem 1.25rem 2rem;
    }

    /* Top cards */
    .wdash__cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }
    @media (max-width: 1024px) {
        .wdash__cards { grid-template-columns: 1fr; }
    }
    .wdash__card {
        background: linear-gradient(160deg, #2f6c81, #235567);
        border-radius: 0.9rem;
        padding: 1.25rem 1.5rem;
        color: #fff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .wdash__card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(0,0,0,0.18);
    }
    .wdash__card-title {
        font-size: 1.05rem;
        font-weight: 500;
        opacity: 0.95;
        margin-bottom: 0.35rem;
    }
    .wdash__card-total {
        font-size: 2.1rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    .wdash__rings {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
    }
    .wdash__ring {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        flex: 1;
        min-width: 0;
    }
    .wdash__ring-svg { width: 100%; max-width: 64px; }
    .wdash__ring-bg { fill: none; stroke: rgba(255,255,255,0.18); stroke-width: 6; }
    .wdash__ring-value { fill: #fff; font-size: 1.1rem; font-weight: 700; }
    .wdash__ring-label { font-size: 0.72rem; opacity: 0.85; text-align: center; }

    /* Summary + statistics row */
    .wdash__row {
        display: grid;
        grid-template-columns: 34% 66%;
        gap: 1rem;
    }
    @media (max-width: 900px) {
        .wdash__row { grid-template-columns: 1fr; }
    }
    .wdash__panel {
        background: linear-gradient(160deg, #2f6c81, #235567);
        border-radius: 0.9rem;
        padding: 1.25rem 1.5rem;
        color: #fff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .wdash__panel-title {
        font-size: 1.05rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    .wdash__donut-wrap {
        position: relative;
        width: 200px;
        max-width: 100%;
        margin: 0 auto 1.25rem;
    }
    .wdash__donut { width: 100%; display: block; }
    .wdash__donut-bg { fill: #fff; }
    .wdash__donut-center {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 700;
        color: #1f4b58;
    }
    .wdash__legend {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        font-size: 0.82rem;
    }
    .wdash__legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .wdash__legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        flex-shrink: 0;
    }
    .wdash__stat-list {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }
    .wdash__stat-label { font-size: 0.85rem; margin-bottom: 0.3rem; }
    .wdash__stat-bar-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .wdash__stat-bar-track {
        flex: 1;
        height: 22px;
        background: rgba(255,255,255,0.25);
        border-radius: 999px;
        overflow: hidden;
    }
    .wdash__stat-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #4caf50, #43a047);
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        transition: width 0.4s ease;
    }
    .wdash__stat-bar-text { font-size: 0.75rem; font-weight: 600; color: #fff; white-space: nowrap; }
    .wdash__stat-percent { font-size: 0.82rem; font-weight: 600; width: 3rem; text-align: right; }

    /* Documents table */
    .wdash__table-card {
        background: #fff;
        border-radius: 0.9rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        overflow: hidden;
    }
    .wdash__table-toolbar {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0.85rem 1rem 0;
    }
    .wdash__icon-btn {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        color: #64748b;
        transition: background-color 0.15s ease, color 0.15s ease;
    }
    .wdash__icon-btn:hover { background: #f1f5f9; color: #235567; }
    .wdash__doc-table { padding: 0.75rem 1rem 1rem; }
    .wdash__doc-rows { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; }
    .wdash__doc-row {
        display: grid;
        grid-template-columns: 4% 6% 16% 26% 14% 14% 20%;
        gap: 0.75rem;
        align-items: center;
        padding: 0.85rem 0.75rem;
        border-radius: 0.6rem;
        transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .wdash__doc-rows > .wdash__doc-row:hover {
        background: #f8fafc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
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
    .wdash__drag-handle:hover { color: #64748b; }
    .wdash__drag-handle:active { cursor: grabbing; }
    @media (max-width: 900px) {
        .wdash__doc-row { grid-template-columns: 1fr; }
        .wdash__drag-handle { display: none; }
        .wdash__doc-row > [data-label] {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            padding: 0.3rem 0;
            border-bottom: 1px solid #eef2f6;
        }
        .wdash__doc-row > [data-label]:last-child { border-bottom: none; }
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
    .wdash__doc-code, .wdash__doc-subject {
        cursor: pointer;
        color: #1e293b;
        font-weight: 500;
    }
    .wdash__doc-code:hover, .wdash__doc-subject:hover {
        color: #04b2f2;
        text-decoration: none;
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
    .wdash__barcode svg { width: 100%; height: 30px; display: block; }
    .wdash__doc-empty {
        text-align: center;
        padding: 2rem;
        font-size: 0.85rem;
        color: #94a3b8;
    }
</style>