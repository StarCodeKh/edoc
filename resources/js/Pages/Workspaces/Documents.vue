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

                    <!-- List -->
                    <div class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
                        <div v-if="documents.data.length" class="divide-y divide-gray-100">
                            <div
                                v-for="doc in documents.data"
                                :key="doc.id"
                                class="group px-5 py-3.5 transition-colors hover:bg-indigo-50/40"
                            >
                                <div class="flex items-center gap-4">
                                    <!-- Icon reflects the document's own file type -->
                                    <div class="h-10 w-10 flex-shrink-0">
                                        <icon :name="docIcon(doc)" class="h-10 w-10" />
                                    </div>

                                    <div class="min-w-0 flex-1">
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span v-if="doc.code" class="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-600">{{ doc.code }}</span>
                                            <Link
                                                :href="doc.project ? route('projects.board.with.task', [doc.project.id, doc.id]) : '#'"
                                                class="truncate font-semibold text-gray-900 hover:text-indigo-700 hover:underline"
                                            >{{ doc.title }}</Link>
                                        </div>
                                        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                            <span v-if="doc.project" class="flex items-center gap-1">
                                                <icon name="project" class="h-3 w-3" />{{ doc.project.title }}
                                            </span>
                                            <span v-if="doc.type" class="rounded bg-violet-100 px-1.5 py-0.5 font-medium text-violet-700">{{ doc.type }}</span>
                                            <span v-if="doc.source">{{ doc.source }}</span>
                                            <span class="flex items-center gap-1">
                                                <icon name="attachment" class="h-3 w-3" />{{ khNum(doc.attachments_count) }}
                                            </span>
                                        </div>
                                    </div>

                                    <div v-if="doc.user" class="hidden items-center gap-2 sm:flex">
                                        <img :src="doc.user.photo || '/images/user.svg'" :alt="doc.user.name" class="h-7 w-7 rounded-full object-cover ring-2 ring-white" />
                                        <span class="max-w-[8rem] truncate text-xs font-medium text-gray-600">{{ doc.user.name }}</span>
                                    </div>

                                    <div class="w-28 flex-shrink-0 text-right">
                                        <div class="text-xs font-semibold text-gray-700">{{ khShortDate(doc.created_at, true) }}</div>
                                        <div v-if="khmerCalendarOn" class="khmer-lunar-text text-[11px] text-indigo-500">{{ khDayLabel(doc.created_at) }}</div>
                                    </div>

                                    <span :class="[
                                        'flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                        doc.is_done ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                    ]">{{ doc.is_done ? $t('Done') : (doc.status || $t('Active')) }}</span>
                                </div>

                                <!-- Attached files. One per line rather than wrapping chips:
                                     a row with five files used to ragged-wrap into a block
                                     with every name cut short. -->
                                <div v-if="doc.files && doc.files.length" class="mt-2.5 pl-14">
                                    <ul class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        <li
                                            v-for="file in visibleFiles(doc)"
                                            :key="file.id"
                                            class="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-indigo-50/50"
                                        >
                                            <icon :name="fileIcon(file.ext)" class="h-6 w-6 flex-shrink-0" />
                                            <span class="min-w-0 flex-1 truncate text-xs font-medium text-gray-700" :title="file.name">{{ file.name }}</span>
                                            <span class="flex-shrink-0 text-[11px] text-gray-400">{{ fileSize(file.size) }}</span>
                                            <a
                                                :href="file.path"
                                                :download="file.name"
                                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                                                :title="$t('Download')"
                                            >
                                                <icon name="download" class="h-3.5 w-3.5" />
                                            </a>
                                        </li>
                                    </ul>

                                    <button
                                        v-if="doc.files.length > filePreviewLimit"
                                        type="button"
                                        @click="toggleFiles(doc.id)"
                                        class="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        <icon :name="isFilesExpanded(doc.id) ? 'chevron-up' : 'chevron-down'" class="h-3 w-3" />
                                        {{ isFilesExpanded(doc.id)
                                            ? $t('Show less')
                                            : $t('Show all :count files').replace(':count', khNum(doc.files.length)) }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-2xl bg-gray-100 p-4">
                                <icon name="book" class="h-8 w-8 text-gray-400" />
                            </div>
                            <p class="font-semibold text-gray-700">{{ $t('No documents found.') }}</p>
                            <button v-if="hasFilters" type="button" @click="reset" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>

                    <pagination v-if="documents.data.length" class="mt-4" :links="documents.links" />
                </div>
            </div>
        </div>
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
            // Document ids whose full file list is open; long lists collapse so a
            // single document cannot push the rest of the page off screen.
            expandedFiles: [],
            filePreviewLimit: 1,

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
        isFilesExpanded(docId) {
            return this.expandedFiles.includes(docId)
        },
        toggleFiles(docId) {
            this.expandedFiles = this.isFilesExpanded(docId)
                ? this.expandedFiles.filter((id) => id !== docId)
                : [...this.expandedFiles, docId]
        },
        visibleFiles(doc) {
            const files = doc.files || []
            return this.isFilesExpanded(doc.id) ? files : files.slice(0, this.filePreviewLimit)
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
