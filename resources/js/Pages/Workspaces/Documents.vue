<template>
    <div class="h-full">
        <Head :title="$t('Documents')" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
                <div class="m-4 flex flex-col">

                    <!-- Header -->
                    <div class="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-5 shadow-lg">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                    <icon name="book" class="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold text-white">{{ $t('All Documents') }}</h1>
                                    <p class="text-sm text-indigo-100">{{ workspace.name }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                                    <div class="text-lg font-bold text-white">{{ khNum(documents.total) }}</div>
                                    <div class="text-[11px] font-medium text-indigo-100">{{ $t('Showing') }}</div>
                                </div>
                                <div class="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                                    <div class="text-lg font-bold text-white">{{ khNum(total) }}</div>
                                    <div class="text-[11px] font-medium text-indigo-100">{{ $t('Total') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="mt-4 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
                        <div class="flex flex-wrap items-center gap-x-6 gap-y-4">
                            <!-- Uploader -->
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wide text-gray-500">{{ $t('Uploader') }}</span>
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        @click="form.uploader = null"
                                        :class="chipClass(!selectedUploaders.length)"
                                    >{{ $t('Everyone') }}</button>
                                    <button
                                        v-for="user in uploaders"
                                        :key="user.id"
                                        type="button"
                                        @click="toggleUploader(user.id)"
                                        :class="[chipClass(isUploaderSelected(user.id)), 'gap-1.5']"
                                        :title="user.name"
                                    >
                                        <img :src="user.photo || '/images/user.svg'" :alt="user.name" class="h-4 w-4 rounded-full object-cover" />
                                        <span class="max-w-[7rem] truncate">{{ user.name }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Document type -->
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wide text-gray-500">{{ $t('Document Type') }}</span>
                                <filter-select
                                    v-model="form.type"
                                    multiple
                                    :options="typeOptions"
                                    :all-label="$t('All types')"
                                    :placeholder="$t('All types')"
                                    :search-placeholder="$t('Search') + '…'"
                                    :empty-label="$t('No matches')"
                                    :count-label="$t(':count selected', { count: khNum(selectedTypeCount) })"
                                    :clear-label="$t('Clear All')"
                                    icon="category"
                                />
                            </div>

                            <!-- Period -->
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wide text-gray-500">{{ $t('Period') }}</span>
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <button
                                        v-for="period in periods"
                                        :key="period.key || 'all'"
                                        type="button"
                                        @click="setPeriod(period.key)"
                                        :class="chipClass(activePeriod === period.key)"
                                    >{{ $t(period.label) }}</button>
                                </div>
                            </div>

                            <!-- Custom range -->
                            <div v-if="activePeriod === 'custom'" class="flex items-center gap-2">
                                <date-picker v-model="fromDate" :max-date="form.to" :placeholder="$t('From')" />
                                <span class="text-gray-400">–</span>
                                <date-picker v-model="toDate" :min-date="form.from" :placeholder="$t('To')" />
                            </div>

                            <button v-if="hasFilters" type="button" @click="reset" class="ml-auto flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600">
                                <icon name="close" class="h-3.5 w-3.5" />
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>

                    <!-- List. One line per document; the file list, dates, source
                         and type live in the detail panel, so a document with five
                         attachments no longer owns half the page. -->
                    <div class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
                        <div v-if="documents.data.length" class="divide-y divide-gray-100">
                            <button
                                v-for="doc in documents.data"
                                :key="doc.id"
                                type="button"
                                class="doc-row"
                                @click="openDetail(doc)"
                            >
                                <icon :name="docIcon(doc)" class="doc-row__icon" />

                                <span v-if="doc.code" class="doc-row__code">{{ doc.code }}</span>

                                <span class="doc-row__title">{{ doc.title }}</span>

                                <span v-if="doc.project" class="doc-row__project">{{ doc.project.title }}</span>

                                <span class="doc-row__files" :title="$t('Attachments')">
                                    <icon name="attachment" class="h-3 w-3" />{{ khNum(doc.attachments_count) }}
                                </span>

                                <span class="doc-row__user">
                                    <img v-if="doc.user" :src="doc.user.photo || '/images/user.svg'" :alt="doc.user.name" class="doc-row__avatar" />
                                    <span class="doc-row__user-name">{{ doc.user ? doc.user.name : '—' }}</span>
                                </span>

                                <span class="doc-row__date">{{ khShortDate(doc.created_at, true) }}</span>

                                <span class="doc-row__status" :class="doc.is_done ? 'is-done' : 'is-open'">
                                    {{ doc.is_done ? $t('Done') : (doc.status || $t('Active')) }}
                                </span>

                                <icon name="chevron-right" class="doc-row__chevron" />
                            </button>
                        </div>

                        <!-- Empty state -->
                        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-2xl bg-gray-100 p-4">
                                <icon name="book" class="h-8 w-8 text-gray-400" />
                            </div>
                            <p class="font-semibold text-gray-700">{{ $t('No documents found.') }}</p>
                            <button v-if="hasFilters" type="button" @click="reset" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>

                    <pagination v-if="documents.data.length" class="mt-4" :links="documents.links" />
                </div>
            </div>
        </div>

        <!-- One document, in full. Everything here already came down with the
             list, so opening it costs no round trip. -->
        <transition name="doc-fade">
            <div v-if="detail" class="doc-backdrop" @click.self="closeDetail">
                <div class="doc-panel">
                    <div class="doc-panel__head">
                        <icon :name="docIcon(detail)" class="h-9 w-9 flex-shrink-0" />
                        <div class="min-w-0 flex-1">
                            <div class="doc-panel__title">{{ detail.title }}</div>
                            <div v-if="detail.code" class="doc-panel__code">{{ detail.code }}</div>
                        </div>
                        <span class="doc-row__status" :class="detail.is_done ? 'is-done' : 'is-open'">
                            {{ detail.is_done ? $t('Done') : (detail.status || $t('Active')) }}
                        </span>
                        <button type="button" class="doc-panel__close" @click="closeDetail" :title="$t('Close')">
                            <icon name="close" class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="doc-panel__body">
                        <dl class="doc-panel__grid">
                            <div v-if="detail.project">
                                <dt>{{ $t('Project') }}</dt>
                                <dd>{{ detail.project.title }}</dd>
                            </div>
                            <div v-if="detail.status">
                                <dt>{{ $t('Current board') }}</dt>
                                <dd>{{ detail.status }}</dd>
                            </div>
                            <div v-if="detail.type">
                                <dt>{{ $t('Document type') }}</dt>
                                <dd>{{ detail.type }}</dd>
                            </div>
                            <div v-if="detail.source">
                                <dt>{{ $t('Document source') }}</dt>
                                <dd>{{ detail.source }}</dd>
                            </div>
                            <div v-if="detail.user">
                                <dt>{{ $t('Uploader') }}</dt>
                                <dd class="flex items-center gap-2">
                                    <img :src="detail.user.photo || '/images/user.svg'" :alt="detail.user.name" class="h-5 w-5 rounded-full object-cover" />
                                    {{ detail.user.name }}
                                </dd>
                            </div>
                            <div>
                                <dt>{{ $t('Received') }}</dt>
                                <dd>{{ khShortDate(detail.created_at, true) }}</dd>
                            </div>
                            <div v-if="detail.due_date">
                                <dt>{{ $t('Due date') }}</dt>
                                <dd>{{ khShortDate(detail.due_date, true) }}</dd>
                            </div>
                        </dl>

                        <div class="doc-panel__label">
                            {{ $t('Attachments') }} · {{ khNum(detail.attachments_count) }}
                        </div>

                        <ul v-if="detail.files && detail.files.length" class="doc-panel__files">
                            <li v-for="file in detail.files" :key="file.id" class="doc-panel__file">
                                <icon :name="fileIcon(file.ext)" class="h-6 w-6 flex-shrink-0" />
                                <span class="doc-panel__file-name" :title="file.name">{{ file.name }}</span>
                                <span class="doc-panel__file-size">{{ fileSize(file.size) }}</span>
                                <a :href="file.path" :download="file.name" class="doc-panel__file-btn" :title="$t('Download')">
                                    <icon name="download" class="h-3.5 w-3.5" />
                                </a>
                            </li>
                        </ul>
                        <p v-else class="doc-panel__empty">{{ $t('This document has no attached file yet.') }}</p>
                    </div>

                    <div class="doc-panel__foot">
                        <button type="button" class="doc-btn doc-btn--ghost" @click="closeDetail">{{ $t('Close') }}</button>
                        <Link
                            v-if="detail.project"
                            :href="route('projects.board.with.task', [detail.project.slug || detail.project.id, detail.id])"
                            class="doc-btn doc-btn--primary"
                        >
                            <icon name="link_external" class="h-3.5 w-3.5" />
                            {{ $t('Open full task') }}
                        </Link>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head, Link } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import Pagination from '@/Shared/Pagination.vue'
import FilterSelect from '@/Shared/Components/FilterSelect.vue'
import DatePicker from '@/Shared/Components/DatePicker.vue'
import pickBy from 'lodash/pickBy'
import throttle from 'lodash/throttle'
import moment_timezone from 'moment-timezone'
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin'

const EXTENSION_ICONS = {
    pdf: 'file-pdf',
    doc: 'file-word', docx: 'file-word', rtf: 'file-word', odt: 'file-word',
    xls: 'file-excel', xlsx: 'file-excel', csv: 'file-excel', ods: 'file-excel',
    ppt: 'file-ppt', pptx: 'file-ppt', odp: 'file-ppt',
    zip: 'file-zip', rar: 'file-zip', '7z': 'file-zip', tar: 'file-zip', gz: 'file-zip',
    png: 'file-image', jpg: 'file-image', jpeg: 'file-image', gif: 'file-image',
    webp: 'file-image', svg: 'file-image', bmp: 'file-image', heic: 'file-image',
    txt: 'file-text', md: 'file-text', log: 'file-text',
}

export default {
    metaInfo: { title: 'Documents' },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    components: { Head, Link, Icon, Pagination, FilterSelect, DatePicker },
    props: {
        title: String,
        workspace: Object,
        documents: Object,
        uploaders: { type: Array, default: () => [] },
        types: { type: Array, default: () => [] },
        filters: { type: Object, default: () => ({}) },
        total: { type: Number, default: 0 },
    },
    data() {
        return {
            moment: moment_timezone,
            periods: [
                { key: null, label: 'All time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This week' },
                { key: 'month', label: 'This month' },
                { key: 'year', label: 'This year' },
                { key: 'custom', label: 'Custom' },
            ],
            // The document whose detail panel is open, or null.
            detail: null,

            form: {
                uploader: this.filters.uploader || null,
                type: this.filters.type || null,
                period: this.filters.period || null,
                from: this.filters.from || null,
                to: this.filters.to || null,
            },
        }
    },
    computed: {
        activePeriod() {
            return this.form.period || null
        },
        hasFilters() {
            return !!(this.form.uploader || this.form.type || this.form.period)
        },
        selectedUploaders() {
            return this.form.uploader ? String(this.form.uploader).split(',').filter(Boolean) : []
        },
        selectedTypeCount() {
            return this.form.type ? String(this.form.type).split(',').filter(Boolean).length : 0
        },
        typeOptions() {
            return this.types.map((type) => ({ value: String(type.id), label: type.name }))
        },
        /** DatePicker works in Date objects; the query string wants YYYY-MM-DD. */
        fromDate: {
            get() { return this.form.from || null },
            set(value) { this.form.from = value ? this.moment(value).format('YYYY-MM-DD') : null },
        },
        toDate: {
            get() { return this.form.to || null },
            set(value) { this.form.to = value ? this.moment(value).format('YYYY-MM-DD') : null },
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                // A custom range with no dates yet would just reload the full list.
                if (this.form.period === 'custom' && !this.form.from && !this.form.to) return
                this.$inertia.get(
                    this.route('workspace.view.documents', this.workspace.slug || this.workspace.id),
                    pickBy(this.form),
                    { preserveState: true, preserveScroll: true, replace: true },
                )
            }, 300),
        },
    },
    methods: {
        /** Map a file extension onto one of the file icons. */
        fileIcon(ext) {
            return EXTENSION_ICONS[String(ext || '').toLowerCase()] || 'file-generic'
        },
        /** The row icon follows the document's first attachment. */
        docIcon(doc) {
            const first = doc.files && doc.files.length ? doc.files[0] : null
            return first ? this.fileIcon(first.ext) : 'file-generic'
        },
        openDetail(doc) {
            this.detail = doc
        },
        closeDetail() {
            this.detail = null
        },
        fileSize(bytes) {
            const size = Number(bytes) || 0
            if (size < 1024) return `${this.khNum(size)} B`
            if (size < 1024 * 1024) return `${this.khNum((size / 1024).toFixed(0))} KB`
            return `${this.khNum((size / 1024 / 1024).toFixed(1))} MB`
        },
        isUploaderSelected(id) {
            return this.selectedUploaders.includes(String(id))
        },
        toggleUploader(id) {
            const next = this.isUploaderSelected(id)
                ? this.selectedUploaders.filter((v) => v !== String(id))
                : [...this.selectedUploaders, String(id)]
            this.form.uploader = next.length ? next.join(',') : null
        },
        chipClass(active) {
            return [
                'flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]
        },
        setPeriod(key) {
            this.form.period = this.form.period === key ? null : key
            if (this.form.period !== 'custom') {
                this.form.from = null
                this.form.to = null
            }
        },
        reset() {
            this.form.uploader = null
            this.form.type = null
            this.form.period = null
            this.form.from = null
            this.form.to = null
        },
    },
}
</script>

<style scoped>
/* ---- one-line rows ---- */
.doc-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 16px;
    text-align: left;
    transition: background-color .12s ease;
}
.doc-row:hover { background: rgba(238, 242, 255, .55); }
.doc-row:hover .doc-row__chevron { color: #6574cd; transform: translateX(2px); }

.doc-row__icon { width: 22px; height: 22px; flex-shrink: 0; }

.doc-row__code {
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 6px;
    background: #f1f5f9;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
}
.doc-row__title {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-row__project {
    width: 8rem;
    flex-shrink: 0;
    font-size: 12px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-row__files {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    width: 3rem;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
}
.doc-row__user {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: 9rem;
    flex-shrink: 0;
    min-width: 0;
}
.doc-row__avatar {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 999px;
    object-fit: cover;
}
.doc-row__user-name {
    font-size: 12px;
    color: #4b5563;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-row__date {
    width: 6rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
}
.doc-row__status {
    flex-shrink: 0;
    max-width: 12rem;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-row__status.is-done { background: #dcfce7; color: #15803d; }
.doc-row__status.is-open { background: #dbeafe; color: #1d4ed8; }

.doc-row__chevron {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #d1d5db;
    transition: color .12s ease, transform .12s ease;
}

/* ---- detail panel ---- */
.doc-backdrop {
    position: fixed;
    inset: 0;
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(15, 23, 42, .5);
    backdrop-filter: blur(2px);
}
.doc-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 36rem;
    max-height: 88vh;
    overflow: hidden;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, .3);
}
.doc-panel__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #eef2f7;
}
.doc-panel__title { font-size: 15px; font-weight: 700; color: #0f172a; }
.doc-panel__code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    color: #6574cd;
}
.doc-panel__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 999px;
    color: #94a3b8;
}
.doc-panel__close:hover { background: #f1f5f9; color: #475569; }

.doc-panel__body { padding: 16px 18px; overflow-y: auto; }
.doc-panel__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
    margin-bottom: 16px;
}
.doc-panel__grid dt {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 2px;
}
.doc-panel__grid dd { font-size: 13px; color: #1f2937; line-height: 1.5; }

.doc-panel__label {
    margin-bottom: 8px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #94a3b8;
}
.doc-panel__files {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
}
.doc-panel__file {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
}
.doc-panel__file:last-child { border-bottom: 0; }
.doc-panel__file:hover { background: rgba(238, 242, 255, .5); }
.doc-panel__file-name {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-panel__file-size { flex-shrink: 0; font-size: 11px; color: #9ca3af; }
.doc-panel__file-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 8px;
    color: #94a3b8;
}
.doc-panel__file-btn:hover { background: #e0e7ff; color: #4338ca; }

.doc-panel__empty {
    padding: 1.5rem;
    border: 1px dashed #e5e7eb;
    border-radius: 12px;
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
}

.doc-panel__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid #eef2f7;
    background: #fbfdff;
}
.doc-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
}
.doc-btn--ghost { color: #475569; background: #fff; border: 1px solid #e2e8f0; }
.doc-btn--ghost:hover { background: #f1f5f9; }
.doc-btn--primary { color: #fff; background: #6574cd; }
.doc-btn--primary:hover { background: #5661b3; }

.doc-fade-enter-active, .doc-fade-leave-active { transition: opacity .15s ease; }
.doc-fade-enter-from, .doc-fade-leave-to { opacity: 0; }
</style>
