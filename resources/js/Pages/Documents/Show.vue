<template>
    <div class="h-full">
        <Head :title="document.code || document.title" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
                <div class="m-4 flex flex-col pb-8">
                    <!-- Header -->
                    <div
                        class="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-5 shadow-lg"
                    >
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div class="flex min-w-0 items-start gap-3">
                                <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                    <icon name="file-pdf" class="h-6 w-6 text-white" />
                                </div>
                                <div class="min-w-0">
                                    <h1 class="break-words text-xl font-bold text-white">{{ document.title }}</h1>
                                    <p v-if="document.code" class="mt-0.5 text-sm font-semibold text-indigo-100">
                                        {{ document.code }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <!-- Where it is, without opening the Tracking tab. -->
                                <span
                                    v-if="steps.length"
                                    class="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur"
                                >
                                    <span class="block text-sm font-bold text-white">
                                        {{ currentStepNumber }}/{{ steps.length }}
                                    </span>
                                    <span class="block text-[11px] font-medium text-indigo-100">
                                        {{ $t('Tracking') }}
                                    </span>
                                </span>
                                <span class="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                                    {{ document.is_done ? $t('Done') : document.status || $t('Active') }}
                                </span>
                                <!-- Walk the register without going back to it. -->
                                <span
                                    v-if="neighbours.total"
                                    class="flex items-center overflow-hidden rounded-xl bg-white/15 backdrop-blur"
                                >
                                    <Link
                                        v-if="neighbours.previous"
                                        :href="neighbourHref(neighbours.previous)"
                                        class="px-3 py-2 text-white hover:bg-white/20"
                                        :title="neighbours.previous.code || neighbours.previous.title"
                                    >
                                        <icon name="chevron-left" class="h-4 w-4" />
                                    </Link>
                                    <span v-else class="px-3 py-2 text-white/40">
                                        <icon name="chevron-left" class="h-4 w-4" />
                                    </span>

                                    <span class="px-2 text-xs font-semibold text-white">
                                        {{ neighbours.position }} / {{ neighbours.total }}
                                    </span>

                                    <Link
                                        v-if="neighbours.next"
                                        :href="neighbourHref(neighbours.next)"
                                        class="px-3 py-2 text-white hover:bg-white/20"
                                        :title="neighbours.next.code || neighbours.next.title"
                                    >
                                        <icon name="chevron-right" class="h-4 w-4" />
                                    </Link>
                                    <span v-else class="px-3 py-2 text-white/40">
                                        <icon name="chevron-right" class="h-4 w-4" />
                                    </span>
                                </span>

                                <Link
                                    v-if="document.project"
                                    :href="
                                        route('projects.board.with.task', [
                                            document.project.slug || document.project.id,
                                            document.slug || document.id,
                                        ])
                                    "
                                    class="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
                                >
                                    <icon name="link_external" class="h-4 w-4" />
                                    {{ $t('Open full task') }}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <!-- The intake form's own field groups, read-only. -->
                        <div class="space-y-4 xl:col-span-2">
                            <section class="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm sm:p-6">
                                <h2 class="text-base font-bold text-gray-900">{{ $t('Document Info') }}</h2>
                                <dl class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div v-for="row in infoRows" :key="row.label">
                                        <dt class="form-label mb-1">{{ $t(row.label) }}</dt>
                                        <dd :class="valueClass(row.value)">{{ row.value || $t('Not set') }}</dd>
                                    </div>
                                    <div>
                                        <dt class="form-label mb-1">{{ $t('Priority') }}</dt>
                                        <dd>
                                            <span
                                                v-if="document.priority"
                                                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                                                :style="{ backgroundColor: document.priority.color || '#4f46e5' }"
                                            >
                                                {{ document.priority.name }}
                                            </span>
                                            <span v-else class="text-gray-300">{{ $t('Not set') }}</span>
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            <section class="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm sm:p-6">
                                <h2 class="text-base font-bold text-gray-900">{{ $t('Dates & Routing') }}</h2>
                                <dl class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div v-for="row in dateRows" :key="row.label">
                                        <dt class="form-label mb-1">{{ $t(row.label) }}</dt>
                                        <dd :class="valueClass(row.value)">{{ row.value || $t('Not set') }}</dd>
                                    </div>
                                </dl>

                                <div class="mt-4">
                                    <div class="form-label mb-2">{{ $t('Assign to') }}</div>
                                    <ul v-if="document.assignees.length" class="flex flex-wrap gap-2">
                                        <li
                                            v-for="person in document.assignees"
                                            :key="person.id"
                                            class="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3"
                                        >
                                            <img
                                                v-if="person.photo"
                                                :src="person.photo"
                                                :alt="person.name"
                                                class="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span
                                                v-else
                                                class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700"
                                            >
                                                {{ person.name.charAt(0) }}
                                            </span>
                                            <span class="text-sm text-gray-700">{{ person.name }}</span>
                                        </li>
                                    </ul>
                                    <p v-else class="text-sm text-gray-300">{{ $t('Not set') }}</p>
                                </div>
                            </section>

                            <section class="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm sm:p-6">
                                <h2 class="text-base font-bold text-gray-900">{{ $t('Content & Files') }}</h2>

                                <div class="mt-4">
                                    <div class="form-label mb-1">{{ $t('Description') }}</div>
                                    <div
                                        v-if="document.description"
                                        class="prose prose-sm max-w-none text-gray-700"
                                        v-html="document.description"
                                    ></div>
                                    <p v-else class="text-sm text-gray-300">{{ $t('Not set') }}</p>
                                </div>

                                <div class="mt-5">
                                    <div class="flex items-center justify-between">
                                        <div class="form-label mb-0">
                                            {{ $t('Attachments') }} · {{ attachments.length }}
                                        </div>
                                        <button
                                            v-if="can.attach"
                                            type="button"
                                            class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            :disabled="uploading"
                                            @click="$refs.fileInput.click()"
                                        >
                                            <icon
                                                :name="uploading ? 'spinner' : 'plus'"
                                                class="h-3.5 w-3.5"
                                                :class="{ 'animate-spin': uploading }"
                                            />
                                            {{ uploading ? $t('Submitting...') : $t('Add') }}
                                        </button>
                                        <input
                                            ref="fileInput"
                                            type="file"
                                            class="hidden"
                                            multiple
                                            accept="application/pdf,.pdf"
                                            @change="uploadFiles"
                                        />
                                    </div>

                                    <p v-if="notice" class="form-error">{{ notice }}</p>

                                    <ul v-if="attachments.length" class="mt-2 space-y-2">
                                        <li
                                            v-for="file in attachments"
                                            :key="file.id"
                                            class="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2"
                                        >
                                            <icon name="file-pdf" class="h-5 w-5 shrink-0 text-rose-500" />
                                            <span class="min-w-0 flex-1">
                                                <span class="block truncate text-sm text-gray-800">{{
                                                    file.name
                                                }}</span>
                                                <span class="block text-xs text-gray-400">{{
                                                    fileSize(file.size)
                                                }}</span>
                                            </span>
                                            <a
                                                :href="file.path"
                                                target="_blank"
                                                rel="noopener"
                                                class="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                                                :title="$t('Open')"
                                            >
                                                <icon name="eye" class="h-4 w-4" />
                                            </a>
                                            <button
                                                v-if="can.attach"
                                                type="button"
                                                class="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                                                :title="$t('Remove')"
                                                @click="removeFile(file)"
                                            >
                                                <icon name="trash" class="h-4 w-4" />
                                            </button>
                                        </li>
                                    </ul>
                                    <p v-else class="mt-2 text-sm text-gray-300">
                                        {{ $t('This document has no attached file yet.') }}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <!-- Summary, tracking and the trail share one panel: on a
                             document page you want one of the three at a time, not
                             all three fighting for the same column. -->
                        <aside class="xl:col-span-1">
                            <div class="sticky top-4 space-y-4">
                                <div class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
                                    <div class="doc-tabs" role="tablist">
                                        <button
                                            v-for="tab in tabs"
                                            :key="tab.key"
                                            type="button"
                                            role="tab"
                                            class="doc-tab"
                                            :class="{ 'is-active': active_tab === tab.key }"
                                            :aria-selected="active_tab === tab.key"
                                            @click="active_tab = tab.key"
                                        >
                                            <icon :name="tab.icon" class="h-4 w-4" />
                                            <span class="doc-tab__label">{{ $t(tab.label) }}</span>
                                            <span v-if="tab.count" class="doc-tab__count">{{ tab.count }}</span>
                                        </button>
                                    </div>

                                    <div class="doc-tabs__panel">
                                        <!-- Summary -->
                                        <dl v-if="active_tab === 'summary'" class="space-y-3">
                                            <div v-for="row in summaryRows" :key="row.label">
                                                <dt
                                                    class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                                                >
                                                    {{ $t(row.label) }}
                                                </dt>
                                                <dd class="mt-0.5 break-words text-sm" :class="valueClass(row.value)">
                                                    {{ row.value || $t('Not set') }}
                                                </dd>
                                            </div>
                                        </dl>

                                        <!-- Tracking: the same steps as before, read top to
                                             bottom because a narrow column is the right shape
                                             for a journey. -->
                                        <template v-else-if="active_tab === 'tracking'">
                                            <ol v-if="steps.length" class="space-y-0">
                                                <li v-for="(step, index) in steps" :key="step.id" class="trail">
                                                    <span
                                                        class="trail__rail"
                                                        :class="{ 'is-last': index === steps.length - 1 }"
                                                    >
                                                        <span class="step-dot" :class="stepBadgeClass(step)">
                                                            <icon
                                                                v-if="step.state === 'done'"
                                                                name="check"
                                                                class="h-4 w-4"
                                                            />
                                                            <template v-else>{{ index + 1 }}</template>
                                                        </span>
                                                    </span>
                                                    <div class="min-w-0 flex-1 pb-5">
                                                        <div
                                                            class="text-sm font-semibold"
                                                            :class="
                                                                step.state === 'pending'
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-900'
                                                            "
                                                        >
                                                            {{ step.title }}
                                                        </div>
                                                        <div
                                                            v-if="step.responsible_role"
                                                            class="text-[11px] text-gray-500"
                                                        >
                                                            {{ step.responsible_role }}
                                                        </div>

                                                        <div v-if="step.actor" class="mt-1.5 flex items-center gap-1.5">
                                                            <img
                                                                v-if="step.actor.photo"
                                                                :src="step.actor.photo"
                                                                :alt="step.actor.name"
                                                                class="h-5 w-5 rounded-full object-cover"
                                                            />
                                                            <span
                                                                v-else
                                                                class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700"
                                                            >
                                                                {{ step.actor.name.charAt(0) }}
                                                            </span>
                                                            <span class="truncate text-[11px] text-gray-600">
                                                                {{ step.actor.name }}
                                                            </span>
                                                        </div>
                                                        <div v-if="step.entered_at" class="text-[11px] text-gray-400">
                                                            {{ formatDate(step.entered_at) }}
                                                        </div>
                                                        <div
                                                            v-else-if="step.state === 'pending'"
                                                            class="mt-1 text-[11px] text-gray-400"
                                                        >
                                                            {{ $t('Not reached yet') }}
                                                        </div>

                                                        <div class="mt-1.5 flex flex-wrap gap-1">
                                                            <span v-if="step.requires_signature" class="step-chip">
                                                                {{ $t('Signature required') }}
                                                            </span>
                                                            <span v-if="step.is_terminal" class="step-chip">
                                                                {{ $t('Final step') }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400">
                                                {{ $t('This project has no open list') }}
                                            </p>
                                        </template>

                                        <!-- Activity -->
                                        <template v-else-if="active_tab === 'activity'">
                                            <ol v-if="activities.length" class="space-y-0">
                                                <li v-for="(entry, index) in activities" :key="entry.id" class="trail">
                                                    <span
                                                        class="trail__rail"
                                                        :class="{ 'is-last': index === activities.length - 1 }"
                                                    >
                                                        <img
                                                            v-if="entry.actor && entry.actor.photo"
                                                            :src="entry.actor.photo"
                                                            :alt="entry.actor.name"
                                                            class="trail__avatar"
                                                        />
                                                        <span v-else class="trail__avatar trail__avatar--initial">
                                                            {{ entry.actor ? entry.actor.name.charAt(0) : '?' }}
                                                        </span>
                                                    </span>
                                                    <div class="min-w-0 flex-1 pb-5">
                                                        <p class="text-sm text-gray-800">
                                                            <span class="font-semibold">
                                                                {{ entry.actor ? entry.actor.name : $t('System') }}
                                                            </span>
                                                            {{ ' ' }}{{ entry.text }}
                                                        </p>
                                                        <p class="mt-0.5 text-xs text-gray-400">
                                                            {{ formatDate(entry.at) }}
                                                        </p>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400">
                                                {{ $t('No activity recorded yet.') }}
                                            </p>
                                        </template>

                                        <!-- Comments -->
                                        <template v-else>
                                            <ol v-if="thread.length" class="space-y-3">
                                                <li v-for="note in thread" :key="note.id" class="flex gap-3">
                                                    <img
                                                        v-if="note.author && note.author.photo"
                                                        :src="note.author.photo"
                                                        :alt="note.author.name"
                                                        class="trail__avatar"
                                                    />
                                                    <span v-else class="trail__avatar trail__avatar--initial">
                                                        {{ note.author ? note.author.name.charAt(0) : '?' }}
                                                    </span>
                                                    <div class="min-w-0 flex-1">
                                                        <div class="flex items-baseline gap-2">
                                                            <span class="truncate text-sm font-semibold text-gray-800">
                                                                {{ note.author ? note.author.name : $t('System') }}
                                                            </span>
                                                            <span class="shrink-0 text-[11px] text-gray-400">
                                                                {{ formatDate(note.at) }}
                                                            </span>
                                                        </div>
                                                        <div
                                                            class="prose prose-sm mt-0.5 max-w-none break-words text-sm text-gray-700"
                                                            v-html="note.details"
                                                        ></div>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400">{{ $t('No comments yet.') }}</p>

                                            <div v-if="canForward" class="mt-4 border-t border-gray-100 pt-3">
                                                <textarea
                                                    v-model="new_comment"
                                                    rows="3"
                                                    class="form-textarea"
                                                    :placeholder="$t('Write a comment...')"
                                                ></textarea>

                                                <div class="mt-2">
                                                    <!-- Hands the document to the next board. Anything
                                                         typed above rides along as the note. There is
                                                         no separate save: the box is the note. -->
                                                    <button
                                                        type="button"
                                                        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        :disabled="forwarding"
                                                        :title="$t('Forward to :step', { step: next_step.title })"
                                                        @click="forward"
                                                    >
                                                        <icon
                                                            :name="forwarding ? 'spinner' : 'send'"
                                                            class="h-4 w-4"
                                                            :class="{ 'animate-spin': forwarding }"
                                                        />
                                                        {{ $t('Forward') }}
                                                    </button>
                                                </div>

                                                <p
                                                    v-if="canForward"
                                                    class="mt-1.5 text-center text-[11px] text-gray-400"
                                                >
                                                    {{ $t('Next: :step', { step: next_step.title }) }}
                                                </p>
                                                <p v-else class="mt-1.5 text-center text-[11px] text-gray-400">
                                                    {{ $t('This document is already at the last step.') }}
                                                </p>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <div
                                    v-if="document.qr_code"
                                    class="rounded-2xl border border-gray-200/70 bg-white p-4 text-center shadow-sm"
                                >
                                    <h3 class="text-sm font-bold text-gray-900">{{ $t('Tracking') }}</h3>
                                    <img :src="document.qr_code" :alt="document.code" class="mx-auto mt-3 h-32 w-32" />
                                    <p v-if="document.code" class="mt-2 text-xs font-semibold text-gray-500">
                                        {{ document.code }}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import moment from 'moment';
import axios from 'axios';

export default {
    metaInfo: { title: 'Document' },
    layout: Layout,
    components: { Head, Link, Icon },
    props: {
        title: String,
        workspace: Object,
        document: { type: Object, required: true },
        steps: { type: Array, default: () => [] },
        activities: { type: Array, default: () => [] },
        comments: { type: Array, default: () => [] },
        neighbours: { type: Object, default: () => ({ previous: null, next: null, position: 0, total: 0 }) },
        next_step: { type: Object, default: null },
        can: { type: Object, default: () => ({ attach: false, forward: false }) },
    },
    data() {
        return {
            active_tab: 'summary',
            // Server props are the starting point; both lists grow in place as
            // the page is used, so nothing here waits on a round trip.
            thread: [...this.comments],
            attachments: [...this.document.files],
            new_comment: '',
            uploading: false,
            forwarding: false,
            notice: '',
        };
    },
    computed: {
        tabs() {
            return [
                { key: 'summary', label: 'Summary', icon: 'details', count: 0 },
                { key: 'tracking', label: 'Tracking', icon: 'timeline', count: this.steps.length },
                { key: 'activity', label: 'Activity', icon: 'time', count: this.activities.length },
                { key: 'comments', label: 'Comments', icon: 'comments', count: this.thread.length },
            ];
        },
        currentStepNumber() {
            const index = this.steps.findIndex((step) => step.state === 'current');
            return index === -1 ? 0 : index + 1;
        },
        infoRows() {
            return [
                { label: 'Document Type', value: this.document.type },
                { label: 'Department', value: this.document.department },
                { label: 'Sub-office', value: this.document.office },
                { label: 'Project', value: this.document.project ? this.document.project.title : '' },
                { label: 'Status', value: this.document.status },
                { label: 'Submitted by', value: this.document.submitted_by ? this.document.submitted_by.name : '' },
            ];
        },
        dateRows() {
            return [
                { label: 'Entry date', value: this.formatDate(this.document.entry_date) },
                { label: 'Due date', value: this.formatDate(this.document.due_date) },
                { label: 'Exit date', value: this.formatDate(this.document.exit_date) },
            ];
        },
        /** Mirrors the intake form's summary panel, row for row. */
        summaryRows() {
            return [
                { label: 'Title', value: this.document.title },
                { label: 'Document Type', value: this.document.type },
                { label: 'Source', value: this.sourceLabel },
                { label: 'Project', value: this.document.project ? this.document.project.title : '' },
                { label: 'Status', value: this.document.status },
                { label: 'Entry date', value: this.formatDate(this.document.entry_date) },
                { label: 'Due date', value: this.formatDate(this.document.due_date) },
                { label: 'Exit date', value: this.formatDate(this.document.exit_date) },
                { label: 'Priority', value: this.document.priority ? this.document.priority.name : '' },
                {
                    label: 'Assign to',
                    value: this.document.assignees.length
                        ? this.$t(':count assignee(s)', { count: this.document.assignees.length })
                        : '',
                },
                {
                    label: 'Attachments',
                    value: this.document.files.length
                        ? this.$t(':count files', { count: this.document.files.length })
                        : '',
                },
            ];
        },
        canForward() {
            return !!(this.can.forward && this.next_step);
        },
        sourceLabel() {
            if (this.document.department && this.document.office) {
                return this.document.department + ' / ' + this.document.office;
            }
            return this.document.office || this.document.department || '';
        },
    },
    methods: {
        formatDate(value) {
            if (!value) return '';
            const parsed = moment(value);
            return parsed.isValid() ? parsed.format('MMM D, YYYY HH:mm') : '';
        },
        valueClass(value) {
            return value ? 'text-gray-800' : 'text-gray-300';
        },
        stepBadgeClass(step) {
            if (step.state === 'current') return 'bg-indigo-600 text-white';
            if (step.state === 'done') return 'bg-emerald-100 text-emerald-700';
            return 'bg-gray-200 text-gray-500';
        },
        neighbourHref(neighbour) {
            return this.route('workspace.documents.show', [this.workspace.slug || this.workspace.id, neighbour.uid]);
        },
        forward() {
            if (!this.canForward || this.forwarding) return;

            this.forwarding = true;

            // A full visit, not axios: the move rewrites the tracker, the trail
            // and the neighbours, so the page is re-fetched rather than patched.
            router.post(
                this.route('workspace.documents.forward', [
                    this.workspace.slug || this.workspace.id,
                    this.document.slug || this.document.id,
                ]),
                { note: this.new_comment.trim() || null },
                {
                    onFinish: () => {
                        this.forwarding = false;
                    },
                }
            );
        },
        /**
         * Files go up one at a time against the endpoint the task modal uses, so
         * one rejected file does not take the rest of the batch with it.
         */
        uploadFiles(event) {
            const files = Array.from(event.target.files || []);
            event.target.value = '';
            if (!files.length) return;

            this.notice = '';
            this.uploading = true;

            const send = (file) => {
                const data = new FormData();
                data.append('file', file);
                return axios
                    .post(this.route('task.attachment.add', this.document.id), data)
                    .then((response) => {
                        if (response.data && response.data.id) {
                            this.attachments.unshift(response.data);
                        } else if (response.data && response.data.message) {
                            this.notice = response.data.message;
                        }
                    })
                    .catch((error) => {
                        const data = error.response && error.response.data;
                        this.notice =
                            (data && (data.message || (data.errors && data.errors.file && data.errors.file[0]))) ||
                            this.$t('Only PDF files are allowed.');
                    });
            };

            files
                .reduce((chain, file) => chain.then(() => send(file)), Promise.resolve())
                .finally(() => {
                    this.uploading = false;
                });
        },
        removeFile(file) {
            axios
                .post(this.route('task.attachment.delete', file.id))
                .then(() => {
                    this.attachments = this.attachments.filter((item) => item.id !== file.id);
                })
                .catch(() => {
                    this.notice = this.$t('Failed to remove the attachment.');
                });
        },
        fileSize(bytes) {
            if (!bytes) return '0 KB';
            if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },
    },
};
</script>

<style scoped>
/* Segmented tab bar. Khmer labels are wide, so each tab takes an equal share
   and truncates rather than wrapping the row onto two lines. */
.doc-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
}

.doc-tab {
    display: flex;
    /* Wide Khmer labels are read in full: each tab takes at least a rough half
       of the row and the bar spills onto a second line rather than clipping
       សេចក្តីសង្ខេប down to សេចក្តីស... */
    flex: 1 1 8.5rem;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 10px;
    border-radius: 10px;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.7;
    text-align: center;
    transition:
        background-color 0.15s ease,
        color 0.15s ease,
        box-shadow 0.15s ease;
}

.doc-tab:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #4338ca;
}

/* Solid fill, matching the active view in the workspace toolbar. */
.doc-tab.is-active {
    background: #4f46e5;
    color: #fff;
    box-shadow: 0 1px 3px rgba(79, 70, 229, 0.4);
}

.doc-tab.is-active:hover {
    background: #4338ca;
    color: #fff;
}

.doc-tab__label {
    white-space: normal;
    word-break: break-word;
}

.doc-tab__count {
    flex-shrink: 0;
    min-width: 17px;
    padding: 0 5px;
    border-radius: 9999px;
    background: #e2e8f0;
    color: #475569;
    font-size: 10px;
    font-weight: 700;
    line-height: 17px;
    text-align: center;
}

.doc-tab.is-active .doc-tab__count {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
}

.doc-tabs__panel {
    padding: 16px;
    max-height: calc(100vh - 12rem);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}

/* The numbered marker on a tracking row, sized to sit on the same rail as the
   activity avatars. */
.step-dot {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
}

.step-chip {
    display: inline-flex;
    align-items: center;
    padding: 1px 7px;
    border-radius: 9999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.7;
}

/* Timeline: the rail is drawn behind each avatar and stops at the last row. */
.trail {
    display: flex;
    gap: 12px;
}

.trail__rail {
    position: relative;
    flex-shrink: 0;
}

.trail__rail:not(.is-last)::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 32px;
    bottom: -8px;
    width: 2px;
    transform: translateX(-50%);
    background: #e5e7eb;
}

.trail__avatar {
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    object-fit: cover;
}

.trail__avatar--initial {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e0e7ff;
    color: #4338ca;
    font-size: 12px;
    font-weight: 700;
}
</style>
