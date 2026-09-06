<template>
    <div class="h-full">
        <Head :title="$t('Documents')" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 dark:from-white/5 to-white overflow-y-auto">
                <div class="m-4 flex flex-col">
                    <!-- Header -->
                    <div
                        class="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-5 shadow-lg"
                    >
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
                                <!-- The register is where you notice something is missing,
                                     so the way to file it belongs here too. -->
                                <Link
                                    :href="route('workspace.documents.submit', workspace.slug || workspace.id)"
                                    class="flex items-center gap-2 rounded-xl bg-white dark:bg-[#262932] px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
                                >
                                    <icon name="post" class="h-4 w-4" />
                                    {{ $t('Submit Document') }}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div
                        class="mt-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-3 sm:p-4 shadow-sm"
                    >
                        <div class="flex flex-wrap items-start lg:items-center gap-x-6 gap-y-4">
                            <!-- Uploader -->
                            <div
                                class="doc-filter flex flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2"
                            >
                                <span
                                    class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0"
                                    >{{ $t('Uploader') }}</span
                                >
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        @click="form.uploader = null"
                                        :class="chipClass(!selectedUploaders.length)"
                                    >
                                        {{ $t('Everyone') }}
                                    </button>
                                    <button
                                        v-for="user in uploaders"
                                        :key="user.id"
                                        type="button"
                                        @click="toggleUploader(user.id)"
                                        :class="[chipClass(isUploaderSelected(user.id)), 'gap-1.5']"
                                        :title="user.name"
                                    >
                                        <img
                                            :src="user.photo || '/images/user.svg'"
                                            :alt="user.name"
                                            class="h-4 w-4 rounded-full object-cover"
                                        />
                                        <span class="max-w-[7rem] truncate">{{ user.name }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Document type -->
                            <div
                                class="doc-filter flex flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2"
                            >
                                <span
                                    class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0"
                                    >{{ $t('Document Type') }}</span
                                >
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
                            <div
                                class="doc-filter flex flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2"
                            >
                                <span
                                    class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0"
                                    >{{ $t('Period') }}</span
                                >
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <button
                                        v-for="period in periods"
                                        :key="period.key || 'all'"
                                        type="button"
                                        @click="setPeriod(period.key)"
                                        :class="chipClass(activePeriod === period.key)"
                                    >
                                        {{ $t(period.label) }}
                                    </button>
                                </div>
                            </div>

                            <!-- Custom range -->
                            <div v-if="activePeriod === 'custom'" class="doc-filter flex flex-wrap items-center gap-2">
                                <date-picker v-model="fromDate" :max-date="form.to" :placeholder="$t('From')" />
                                <span class="text-gray-400 dark:text-gray-500">–</span>
                                <date-picker v-model="toDate" :min-date="form.from" :placeholder="$t('To')" />
                            </div>

                            <button
                                v-if="hasFilters"
                                type="button"
                                @click="reset"
                                class="w-full lg:w-auto lg:ml-auto flex items-center justify-center lg:justify-start gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600"
                            >
                                <icon name="close" class="h-3.5 w-3.5" />
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>

                    <!-- List. One line per document; the file list, dates, source
                         and type live in the detail panel, so a document with five
                         attachments no longer owns half the page. -->
                    <div
                        class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                    >
                        <div v-if="documents.data.length" class="divide-y divide-gray-100 dark:divide-white/10">
                            <!-- A div rather than a button: the print control sits
                                 inside the row, and a button inside a button is
                                 not something a browser will render. -->
                            <div
                                v-for="doc in documents.data"
                                :key="doc.id"
                                class="doc-row"
                                role="button"
                                tabindex="0"
                                @click="openDetail(doc)"
                                @keydown.enter.prevent="openDetail(doc)"
                                @keydown.space.prevent="openDetail(doc)"
                            >
                                <icon :name="docIcon(doc)" class="doc-row__icon" />

                                <span v-if="doc.code" class="doc-row__code">{{ doc.code }}</span>

                                <span class="doc-row__title">{{ doc.title }}</span>

                                <span v-if="doc.project" class="doc-row__project">{{ doc.project.title }}</span>

                                <span class="doc-row__files" :title="$t('Attachments')">
                                    <icon name="attachment" class="h-3 w-3" />{{ khNum(doc.attachments_count) }}
                                </span>

                                <span class="doc-row__user">
                                    <img
                                        v-if="doc.user"
                                        :src="doc.user.photo || '/images/user.svg'"
                                        :alt="doc.user.name"
                                        class="doc-row__avatar"
                                    />
                                    <span class="doc-row__user-name">{{ doc.user ? doc.user.name : '—' }}</span>
                                </span>

                                <span class="doc-row__date">{{ khShortDate(doc.created_at, true) }}</span>

                                <span
                                    class="doc-row__status"
                                    :class="doc.is_done ? 'is-done' : 'is-open'"
                                    :title="statusLabel(doc)"
                                >
                                    {{ statusLabel(doc) }}
                                </span>

                                <!-- The tracking slip, printable straight from the
                                     register - the row already carries everything
                                     the slip prints. -->
                                <button
                                    type="button"
                                    class="doc-row__print"
                                    @click.stop="openReceiptModal(doc, $event)"
                                    :title="$t('Print tracking document')"
                                    :aria-label="$t('Print tracking document')"
                                >
                                    <printer-icon class="doc-row__print-icon" />
                                </button>

                                <!-- A real href, so the row can still be opened in
                                     a new tab; the click itself is handled so it
                                     does not also open the detail panel behind. -->
                                <a
                                    :href="commentsHref(doc)"
                                    class="doc-row__open"
                                    :title="$t('Open comments')"
                                    :aria-label="$t('Open comments')"
                                    @click.stop.prevent="openComments(doc)"
                                >
                                    <icon name="chevron-right" class="doc-row__chevron" />
                                </a>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-2xl bg-gray-100 dark:bg-white/10 p-4">
                                <icon name="book" class="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p class="font-semibold text-gray-700 dark:text-gray-200">
                                {{ $t('No documents found.') }}
                            </p>
                            <button
                                v-if="hasFilters"
                                type="button"
                                @click="reset"
                                class="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800"
                            >
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
                        <span
                            class="doc-row__status doc-panel__status"
                            :class="detail.is_done ? 'is-done' : 'is-open'"
                            :title="statusLabel(detail)"
                        >
                            {{ statusLabel(detail) }}
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
                                    <img
                                        :src="detail.user.photo || '/images/user.svg'"
                                        :alt="detail.user.name"
                                        class="h-5 w-5 rounded-full object-cover"
                                    />
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

                        <!-- At a signature step the file is not something to read
                             but something waiting on you, and the row says so. -->
                        <p
                            v-if="detail.can && detail.can.sign && detail.files && detail.files.length"
                            class="doc-panel__sign-hint"
                        >
                            <icon name="edit" class="h-3.5 w-3.5 shrink-0" />
                            {{ $t('This step needs a signature — open the file to draw or type on it.') }}
                        </p>

                        <ul v-if="detail.files && detail.files.length" class="doc-panel__files">
                            <li v-for="file in detail.files" :key="file.id" class="doc-panel__file">
                                <icon :name="fileIcon(file.ext)" class="h-6 w-6 flex-shrink-0" />
                                <span class="doc-panel__file-text">
                                    <span class="doc-panel__file-name" :title="file.name">{{ file.name }}</span>
                                    <span class="doc-panel__file-size">{{ fileSize(file.size) }}</span>
                                </span>
                                <a
                                    :href="annotatorUrl(detail, file)"
                                    target="_blank"
                                    rel="noopener"
                                    class="doc-panel__file-btn"
                                    :title="detail.can && detail.can.sign ? $t('Open to sign') : $t('View')"
                                >
                                    <icon name="eye" class="h-4 w-4" />
                                </a>
                                <button
                                    v-if="detail.can && detail.can.detach"
                                    type="button"
                                    class="doc-panel__file-btn is-danger"
                                    :disabled="removingFileId === file.id"
                                    :title="$t('Delete')"
                                    @click="removeFile(detail, file)"
                                >
                                    <icon
                                        :name="removingFileId === file.id ? 'spinner' : 'trash'"
                                        class="h-4 w-4"
                                        :class="{ 'animate-spin': removingFileId === file.id }"
                                    />
                                </button>
                            </li>
                        </ul>
                        <p v-else class="doc-panel__empty">{{ $t('This document has no attached file yet.') }}</p>

                        <p v-if="fileNotice" class="doc-panel__notice">{{ fileNotice }}</p>
                    </div>

                    <div class="doc-panel__foot">
                        <!-- The tracking slip, as it prints: what it is, and the
                             code it is filed under. -->
                        <button type="button" class="doc-track" @click="openReceiptModal(detail, $event)">
                            <printer-icon class="doc-track__icon" />
                            <span class="doc-track__text">
                                <span class="doc-track__label">{{ $t('Tracking Document') }}</span>
                                <span class="doc-track__code">{{ detail.code }}</span>
                            </span>
                        </button>

                        <button type="button" class="doc-btn doc-btn--ghost" @click="closeDetail">
                            {{ $t('Close') }}
                        </button>
                        <Link
                            :href="
                                route('workspace.documents.show', [
                                    workspace.slug || workspace.id,
                                    detail.slug || detail.id,
                                ])
                            "
                            class="doc-btn doc-btn--primary"
                        >
                            <icon name="details" class="h-3.5 w-3.5" />
                            {{ $t('View details') }}
                        </Link>
                        <Link
                            v-if="detail.project"
                            :href="
                                route('projects.board.with.task', [detail.project.slug || detail.project.id, detail.id])
                            "
                            class="doc-btn doc-btn--ghost"
                        >
                            <icon name="link_external" class="h-3.5 w-3.5" />
                            {{ $t('Open full task') }}
                        </Link>
                    </div>
                </div>
            </div>
        </transition>

        <DocumentReceipt v-if="receiptModalOpen" :task="selectedReceiptTask" @close="closeReceiptModal" />
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import Pagination from '@/Shared/Pagination.vue';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import DatePicker from '@/Shared/Components/DatePicker.vue';
import PrinterIcon from '@/Shared/Components/PrinterIcon.vue';
import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue';
import axios from 'axios';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import moment_timezone from 'moment-timezone';
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin';

const EXTENSION_ICONS = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    rtf: 'file-word',
    odt: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    csv: 'file-excel',
    ods: 'file-excel',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    odp: 'file-ppt',
    zip: 'file-zip',
    rar: 'file-zip',
    '7z': 'file-zip',
    tar: 'file-zip',
    gz: 'file-zip',
    png: 'file-image',
    jpg: 'file-image',
    jpeg: 'file-image',
    gif: 'file-image',
    webp: 'file-image',
    svg: 'file-image',
    bmp: 'file-image',
    heic: 'file-image',
    txt: 'file-text',
    md: 'file-text',
    log: 'file-text',
};

export default {
    metaInfo: { title: 'Documents' },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    components: { Head, Link, Icon, Pagination, FilterSelect, DatePicker, PrinterIcon, DocumentReceipt },
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

            // The tracking slip, and the document it is being printed for.
            receiptModalOpen: false,
            selectedReceiptTask: null,

            // Which attachment is mid-delete, and what went wrong if it did.
            removingFileId: null,
            fileNotice: '',

            form: {
                uploader: this.filters.uploader || null,
                type: this.filters.type || null,
                period: this.filters.period || null,
                from: this.filters.from || null,
                to: this.filters.to || null,
            },
        };
    },
    computed: {
        activePeriod() {
            return this.form.period || null;
        },
        hasFilters() {
            return !!(this.form.uploader || this.form.type || this.form.period);
        },
        selectedUploaders() {
            return this.form.uploader ? String(this.form.uploader).split(',').filter(Boolean) : [];
        },
        selectedTypeCount() {
            return this.form.type ? String(this.form.type).split(',').filter(Boolean).length : 0;
        },
        typeOptions() {
            return this.types.map((type) => ({ value: String(type.id), label: type.name }));
        },
        /** DatePicker works in Date objects; the query string wants YYYY-MM-DD. */
        fromDate: {
            get() {
                return this.form.from || null;
            },
            set(value) {
                this.form.from = value ? this.moment(value).format('YYYY-MM-DD') : null;
            },
        },
        toDate: {
            get() {
                return this.form.to || null;
            },
            set(value) {
                this.form.to = value ? this.moment(value).format('YYYY-MM-DD') : null;
            },
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                // A custom range with no dates yet would just reload the full list.
                if (this.form.period === 'custom' && !this.form.from && !this.form.to) return;
                this.$inertia.get(
                    this.route('workspace.view.documents', this.workspace.slug || this.workspace.id),
                    pickBy(this.form),
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }, 300),
        },
    },
    methods: {
        /**
         * The board a document sits on, or "Done" once closed. Also the chip's
         * title: the list row clips to one line, and board names here run to
         * "ការិយាល័យ រដ្ឋបាល ពិនិត្យ និងបញ្ជូនឯកសារ".
         */
        statusLabel(doc) {
            return doc.is_done ? this.$t('Done') : doc.status || this.$t('Active');
        },
        /** Map a file extension onto one of the file icons. */
        fileIcon(ext) {
            return EXTENSION_ICONS[String(ext || '').toLowerCase()] || 'file-generic';
        },
        /** The row icon follows the document's first attachment. */
        docIcon(doc) {
            const first = doc.files && doc.files.length ? doc.files[0] : null;
            return first ? this.fileIcon(first.ext) : 'file-generic';
        },
        openDetail(doc) {
            this.detail = doc;
            this.fileNotice = '';
        },
        closeDetail() {
            this.detail = null;
        },

        /**
         * The annotator, not the raw file: for a PDF it is the viewer, and it is
         * the only place a signature can be drawn onto one. What it lets the
         * reader do once it opens is the server's call, not this link's.
         */
        annotatorUrl(doc, file) {
            return this.route('task.attachment.view', { taskUid: doc.id, attachmentId: file.id });
        },

        /** The document's own page, opened straight onto its comment thread. */
        commentsHref(doc) {
            const base = this.route('workspace.documents.show', [
                this.workspace.slug || this.workspace.id,
                doc.slug || doc.id,
            ]);

            return `${base}?tab=comments`;
        },

        openComments(doc) {
            router.visit(this.commentsHref(doc));
        },

        openReceiptModal(doc, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            // The slip is printed from the receipt-shaped payload the row
            // carries, so no round trip is needed to open it.
            this.selectedReceiptTask = doc.receipt || doc;
            this.receiptModalOpen = true;
        },
        closeReceiptModal() {
            this.receiptModalOpen = false;
            this.selectedReceiptTask = null;
        },

        /**
         * Remove an attachment, then keep the row's own count in step - the
         * register is not reloaded, so nothing else would correct it.
         */
        async removeFile(doc, file) {
            if (this.removingFileId) return;

            this.fileNotice = '';
            this.removingFileId = file.id;

            try {
                await axios.post(this.route('task.attachment.delete', file.id));
                doc.files = (doc.files || []).filter((item) => item.id !== file.id);
                doc.attachments_count = doc.files.length;
            } catch (error) {
                this.fileNotice = error?.response?.data?.message || this.$t('Failed to remove the attachment.');
            } finally {
                this.removingFileId = null;
            }
        },
        fileSize(bytes) {
            const size = Number(bytes) || 0;
            if (size < 1024) return `${this.khNum(size)} B`;
            if (size < 1024 * 1024) return `${this.khNum((size / 1024).toFixed(0))} KB`;
            return `${this.khNum((size / 1024 / 1024).toFixed(1))} MB`;
        },
        isUploaderSelected(id) {
            return this.selectedUploaders.includes(String(id));
        },
        toggleUploader(id) {
            const next = this.isUploaderSelected(id)
                ? this.selectedUploaders.filter((v) => v !== String(id))
                : [...this.selectedUploaders, String(id)];
            this.form.uploader = next.length ? next.join(',') : null;
        },
        chipClass(active) {
            return [
                'flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10',
            ];
        },
        setPeriod(key) {
            this.form.period = this.form.period === key ? null : key;
            if (this.form.period !== 'custom') {
                this.form.from = null;
                this.form.to = null;
            }
        },
        reset() {
            this.form.uploader = null;
            this.form.type = null;
            this.form.period = null;
            this.form.from = null;
            this.form.to = null;
        },
    },
};
</script>

<style scoped>
.doc-backdrop {
    position: fixed;
    inset: 0;
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(2px);
}
.doc-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 36rem;
    max-height: 88vh;
    overflow: hidden;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.3);
}
.doc-panel__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #eef2f7;
}
/* The same chip serves the list and this panel. In a row it has to be one
   clipped line so the rows align, but here there is room, and a board name cut
   to "ការិយាល័យ រដ្ឋបាល ពិនិត្យ និង…" tells the reader less than the space
   allows. Wrapped, capped at two lines so a long one cannot push the close
   button around. */
.doc-panel__status {
    max-width: 15rem;
    white-space: normal;
    overflow: hidden;
    text-overflow: clip;
    line-height: 1.35;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
.doc-panel__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
}
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
    color: var(--ink-subtle);
}
.doc-panel__close:hover {
    background: var(--surface-raised);
    color: var(--ink-muted);
}

.doc-panel__body {
    padding: 16px 18px;
    overflow-y: auto;
}
.doc-panel__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
    margin-bottom: 16px;
}
.doc-panel__grid dt {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-subtle);
    margin-bottom: 2px;
}
.doc-panel__grid dd {
    font-size: 13px;
    color: var(--ink);
    line-height: 1.5;
}

.doc-panel__label {
    margin-bottom: 8px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-subtle);
}
.doc-panel__files {
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
}
.doc-panel__file {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
}
.doc-panel__file:last-child {
    border-bottom: 0;
}
.doc-panel__file:hover {
    background: rgba(238, 242, 255, 0.5);
}
/* Name over size, the way the file rows read on the document page. */
.doc-panel__file-text {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
}
.doc-panel__file-name {
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.doc-panel__file-size {
    font-size: 11px;
    color: var(--ink-subtle);
}

/* The chevron is the row's way out to the document itself. It sits inside the
   row, which is itself clickable, so it needs its own hit area and hover. */
.doc-row__open {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: 8px;
    color: #cbd5e1;
}
.doc-row__open:hover {
    background: var(--tint-accent-bg);
    color: var(--accent-ink);
}
.doc-row__open:focus-visible {
    outline: 2px solid var(--accent-ink);
    outline-offset: 1px;
}

.doc-panel__sign-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 12px;
    background: var(--tint-accent-bg);
    font-size: 12px;
    font-weight: 500;
    color: var(--accent-ink);
}

.doc-panel__notice {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--tint-bad-ink);
}

/* The tracking slip button: what it is, then the code it is filed under. */
.doc-track {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-right: auto;
    padding: 6px 12px;
    border-radius: 12px;
    background: var(--tint-accent-bg);
    color: var(--accent-ink);
    transition: background-color 0.12s ease;
}
.doc-track:hover {
    background: var(--tint-accent-bg);
}
.doc-track__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.doc-track__text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
}
.doc-track__label {
    font-size: 10px;
    font-weight: 600;
}
.doc-track__code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    font-weight: 700;
}
.doc-panel__file-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 8px;
    color: var(--ink-subtle);
}
.doc-panel__file-btn:hover {
    background: var(--tint-accent-bg);
    color: var(--accent-ink);
}
.doc-panel__file-btn.is-danger:hover {
    background: var(--tint-bad-bg);
    color: var(--tint-bad-ink);
}
.doc-panel__file-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.doc-panel__empty {
    padding: 1.5rem;
    border: 1px dashed var(--line);
    border-radius: 12px;
    text-align: center;
    font-size: 13px;
    color: var(--ink-subtle);
}

.doc-panel__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid #eef2f7;
    background: var(--surface-sunken);
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
.doc-btn--ghost {
    color: var(--ink-muted);
    background: var(--surface);
    border: 1px solid var(--line);
}
.doc-btn--ghost:hover {
    background: var(--surface-raised);
}
.doc-btn--primary {
    color: #fff;
    background: #6574cd;
}
.doc-btn--primary:hover {
    background: #5661b3;
}

.doc-fade-enter-active,
.doc-fade-leave-active {
    transition: opacity 0.15s ease;
}
.doc-fade-enter-from,
.doc-fade-leave-to {
    opacity: 0;
}

/* ---------------------------------------------------------------------
   Narrow screens
   The row is a desktop table line - fixed columns for project, files,
   uploader, date and status. Below md it folds into two lines: what the
   document is, then who and when.
   --------------------------------------------------------------------- */
@media (max-width: 767px) {
    .doc-filter {
        width: 100%;
    }

    .doc-row {
        position: relative;
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 11px 26px 11px 12px;
    }
    .doc-row__icon {
        order: 0;
    }
    .doc-row__code {
        order: 1;
    }
    .doc-row__status {
        order: 2;
        margin-left: auto;
    }
    .doc-row__title {
        order: 3;
        flex: 1 1 100%;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    /* The board a document belongs to is in the detail panel; on a phone the
       row is better off without it. */
    .doc-row__project {
        display: none;
    }
    .doc-row__files,
    .doc-row__user,
    .doc-row__date {
        order: 4;
        width: auto;
        flex: 0 0 auto;
    }
    .doc-row__user-name {
        max-width: 7rem;
    }
    .doc-row__date {
        margin-left: auto;
        text-align: right;
    }
    /* The link is what gets pinned to the edge now, not the glyph inside it -
       otherwise the hit area and the arrow end up in different places. */
    .doc-row__open {
        position: absolute;
        top: 50%;
        right: 2px;
        transform: translateY(-50%);
    }
}

/* The detail panel comes up from the bottom, the way a sheet does. */
@media (max-width: 640px) {
    .doc-backdrop {
        align-items: flex-end;
        padding: 0;
    }
    .doc-panel {
        max-width: 100%;
        max-height: 92vh;
        border-radius: 18px 18px 0 0;
    }
    .doc-panel__head {
        padding: 14px 14px 12px;
    }
}
</style>
