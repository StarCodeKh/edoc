<template>
    <div class="wdash">
        <Head :title="$t(title)" />

        <!-- Workspace name + total-projects badge for this workspace. -->
        <div v-if="workspace" class="wdash__header">
            <h1 class="wdash__header-title">{{ workspace.name }}</h1>
            <div class="wdash__header-count">
                {{ $t('ថ្នាក់/ក្រុម/គម្រោង ឯកសារ') }}
                <span class="wdash__header-count-badge">{{ workspaceProjectCount }}</span>
            </div>
        </div>

        <!-- Top status cards -->
        <div class="wdash__cards">
            <div v-for="(card, cIdx) in resolvedStatusCards" :key="'card_'+cIdx" class="wdash__card">
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

            <div class="wdash__card wdash__card--simple">
                <div class="wdash__card-title">{{ $t('ថ្នាក់/ក្រុម/គម្រោង ឯកសារ') }}</div>
                <div class="wdash__card-total">{{ workspaceProjectCount }}</div>
            </div>
            <div class="wdash__card wdash__card--simple">
                <div class="wdash__card-title">{{ $t('ឯកសារសរុប') }}</div>
                <div class="wdash__card-total">{{ allTasks.length }}</div>
            </div>
        </div>

        <!-- Summary + Statistics -->
        <div class="wdash__row">
            <div class="wdash__panel wdash__panel--summary">
                <div class="wdash__panel-title">{{ $t('សេចក្តីសង្ខេប') }}</div>
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
                    <div class="wdash__donut-center">{{ resolvedSummary.percent }}%</div>
                </div>
                <div class="wdash__legend">
                    <div v-if="!resolvedSummary.segments.length" class="wdash__empty-note">{{ $t('No documents yet.') }}</div>
                    <div v-for="(seg, sIdx) in resolvedSummary.segments" :key="'leg_'+sIdx" class="wdash__legend-item">
                        <span class="wdash__legend-dot" :style="{ backgroundColor: seg.color }"></span>
                        <span>{{ $t(seg.label) }} {{ seg.max ? seg.value + '/' + seg.max : seg.value + ' (' + seg.percent + '%)' }}</span>
                    </div>
                </div>
            </div>

            <div class="wdash__panel wdash__panel--stats">
                <div class="wdash__panel-title">{{ $t('ស្ថិតិឯកសារ') }}</div>
                <div class="wdash__stat-list">
                    <div v-if="!resolvedStatistics.length" class="wdash__empty-note">{{ $t('No documents yet.') }}</div>
                    <div v-for="(stat, stIdx) in resolvedStatistics" :key="'stat_'+stIdx" class="wdash__stat-row">
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
                    <div>{{ $t('បោះពុម្ព') }}</div>
                </div>

                <draggable v-model="pageRows" tag="div" class="wdash__doc-rows" handle=".wdash__drag-handle" item-key="id" @end="afterDrop">
                    <template #item="{ element, index }">
                        <div class="wdash__doc-row">
                            <div class="wdash__drag-handle hidden md:flex">
                                <icon class="w-5 h-5" name="drag" />
                            </div>
                            <div :data-label="$t('ល.រ.')">#{{ (currentPage - 1) * pageSize + index + 1 }}</div>
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
                                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M7 8.5V3.5h10v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="8.5" width="16" height="7.5" rx="1.4" stroke="currentColor" stroke-width="1.6"/><rect x="7" y="13.5" width="10" height="7" rx="0.6" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="11" r="0.9" fill="currentColor"/></svg>
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
                        {{ $t('Showing') }} {{ paginationStart }}–{{ paginationEnd }} {{ $t('of') }} {{ taskRows.length }}
                    </div>
                    <div class="wdash__pagination-controls">
                        <button type="button" class="wdash__page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" :aria-label="$t('Previous page')">
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <template v-for="(p, i) in paginationPages" :key="'pg_'+i">
                            <span v-if="p === '...'" class="wdash__page-ellipsis">…</span>
                            <button v-else type="button" class="wdash__page-btn" :class="{ 'wdash__page-btn--active': p === currentPage }" @click="goToPage(p)">{{ p }}</button>
                        </template>
                        <button type="button" class="wdash__page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" :aria-label="$t('Next page')">
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Same printable tracking document used on the board and full table views. -->
        <DocumentReceipt
            v-if="receiptModalOpen"
            :task="selectedReceiptTask"
            @close="closeReceiptModal"
        />
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
    import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue'

    export default {
        name: 'workspace-dashboard',
        components: { Head, Icon, draggable, DocumentReceipt },
        layout: Layout,
        emits: ['add-document', 'toggle-filter', 'open-document'],
        props: {
            title: { type: String, default: 'Dashboard' },
            workspace: { type: Object, default: null },
            lists: { type: Array, default: () => [] },
            statusCards: { type: Array, default: () => ([]) },
            summary: { type: Object, default: () => ({ percent: 0, segments: [] }) },
            statistics: { type: Array, default: () => ([]) },
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
                statusPalette: ['#4a90d9', '#c9d94d', '#4caf50', '#e0503a', '#9b59b6', '#7cb342', '#f0a63a', '#06b6d4'],
            }
        },
        computed: {
            donutCircumference() {
                return 2 * Math.PI * 80;
            },
            donutTotalPercent() {
                return this.resolvedSummary.segments.reduce((sum, s) => sum + (s.percent || 0), 0) || 1;
            },
            donutSegments() {
                let cumulative = 0;
                return this.resolvedSummary.segments.map(seg => {
                    const normalizedPercent = (seg.percent / this.donutTotalPercent) * 100;
                    const dash = (normalizedPercent / 100) * this.donutCircumference;
                    const offset = -((cumulative / 100) * this.donutCircumference);
                    cumulative += normalizedPercent;
                    return { ...seg, dash, offset };
                });
            },
            isAdmin() {
                return this?.workspace?.member?.role === 'admin';
            },

            workspaceProjectCount() {
                if (!this.workspace) return 0;
                if (typeof this.workspace.projects_count === 'number') return this.workspace.projects_count;
                if (Array.isArray(this.workspace.projects)) return this.workspace.projects.length;
                return 0;
            },

            allTasks() {
                if (!this.lists) return [];
                return this.lists.flatMap(listItem =>
                    this.tasksForList(listItem).map(task => {
                        if (!task.list) task.list = { id: listItem.id, title: listItem.title };
                        if (!task.list_id) task.list_id = listItem.id;
                        return task;
                    })
                );
            },
            dynamicStatusCard() {
                const items = (this.lists || []).map((listItem, idx) => ({
                    label: listItem.title,
                    value: this.tasksForList(listItem).length,
                    color: this.statusPalette[idx % this.statusPalette.length],
                }));
                const total = items.reduce((sum, i) => sum + i.value, 0);
                return { title: 'ស្ថានភាពឯកសារ', total, items };
            },

            resolvedStatusCards() {
                return (this.statusCards && this.statusCards.length) ? this.statusCards : [this.dynamicStatusCard];
            },

            dynamicSummary() {
                const tasks = this.allTasks;
                const total = tasks.length;
                const doneCount = tasks.filter(t => !!t.is_done).length;
                const percent = total ? Math.round((doneCount / total) * 100) : 0;
                const segments = (this.lists || []).map((listItem, idx) => {
                    const count = this.tasksForList(listItem).length;
                    const segPercent = total ? Math.round((count / total) * 100) : 0;
                    return {
                        label: listItem.title,
                        value: count,
                        percent: segPercent,
                        color: this.statusPalette[idx % this.statusPalette.length],
                    };
                });
                return { percent, segments };
            },

            resolvedSummary() {
                return (this.summary && this.summary.segments && this.summary.segments.length) ? this.summary : this.dynamicSummary;
            },

            dynamicStatistics() {
                return (this.lists || []).map(listItem => {
                    const tasks = this.tasksForList(listItem);
                    const total = tasks.length;
                    const done = tasks.filter(t => !!t.is_done).length;
                    const percent = total ? Math.round((done / total) * 100) : 0;
                    return { label: listItem.title, done, total, percent };
                });
            },

            resolvedStatistics() {
                return (this.statistics && this.statistics.length) ? this.statistics : this.dynamicStatistics;
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
                if (!this.lists) return this.statusPalette[0];
                let idx = this.lists.findIndex(l => l.id === element.list_id);
                if (idx === -1) {
                    idx = this.lists.findIndex(l => (l.tasks || []).some(t => t.id === element.id));
                }
                return this.statusPalette[(idx === -1 ? 0 : idx) % this.statusPalette.length];
            },
            documentCode(element) {
                if (element.task_code) return element.task_code;
                return 'CGMC-' + String(element.id).padStart(9, '0');
            },

            isAssignedToMe(task) {
                const userId = this.$page?.props?.auth?.user?.id;
                if (!userId) return false;
                return (task.assignees || []).some(a => Number(a.user_id) === Number(userId));
            },

            tasksForList(listItem) {
                const tasks = listItem.tasks || [];
                return this.isAdmin ? tasks : tasks.filter(t => this.isAssignedToMe(t));
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

    /* Workspace name + total-projects badge */
    .wdash__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    .wdash__header-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }
    .wdash__header-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
    }
    .wdash__header-count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        height: 22px;
        padding: 0 0.4rem;
        border-radius: 999px;
        background: #4f46e5;
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
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
    .wdash__card--simple {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100%;
    }
    .wdash__card--simple .wdash__card-total {
        margin-bottom: 0;
    }
    .wdash__rings {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;
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
    .wdash__empty-note {
        font-size: 0.8rem;
        opacity: 0.75;
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
        grid-template-columns: 4% 6% 14% 22% 12% 12% 16% 14%;
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
    .wdash__barcode svg { width: 100%; height: 30px; display: block; }

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
        transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    .wdash__print-btn:hover {
        background: #e0e7ff;
        border-color: #c7d2fe;
        transform: translateY(-1px);
    }
    .wdash__print-btn:active { transform: translateY(0); }
    .dark .wdash__print-btn {
        background: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.25);
        color: #a5b4fc;
    }
    .dark .wdash__print-btn:hover { background: rgba(99, 102, 241, 0.2); }

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
        transition: background-color 0.15s ease, color 0.15s ease;
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
</style>