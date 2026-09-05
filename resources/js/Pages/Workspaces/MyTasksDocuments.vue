<template>
    <div class="h-full">
        <Head :title="$t('My Documents')" />

        <!-- Same toolbar the other four My Tasks views carry. -->
        <div v-if="workspace" class="project__view__menu w-full p-2 text-sm flex justify-first items-center">
            <div class="inline-flex w-full flex-wrap items-center">
                <div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap">
                    <h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">{{ workspace.name }}</h2>
                    <Link
                        v-for="option in viewOptions"
                        :key="option.slug"
                        class="flex py-2 px-3 items-center cursor-pointer capitalize rounded"
                        :class="{ active: option.slug === 'documents' }"
                        :href="route('workspace.view.my-tasks.' + option.slug, workspace.slug || workspace.id)"
                    >
                        <icon :name="option.icon" class="w-4 fill-[#ffffff] h-4 mr-[5px]" />
                        {{ $t(option.name) }}
                    </Link>
                </div>
            </div>
        </div>

        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 dark:from-white/5 to-white overflow-y-auto">
                <div class="m-4 flex flex-col pb-8">
                    <!-- Header -->
                    <div
                        class="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-5 shadow-lg"
                    >
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                    <icon name="file-text" class="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold text-white">{{ $t('My Documents') }}</h1>
                                    <p class="text-sm text-indigo-100">{{ workspace.name }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                                    <div class="text-lg font-bold text-white">{{ documents.total }}</div>
                                    <div class="text-[11px] font-medium text-indigo-100">{{ $t('Total') }}</div>
                                </div>
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

                    <!-- Filter -->
                    <div
                        v-if="types.length"
                        class="mt-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-3 shadow-sm"
                    >
                        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div class="flex flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2">
                                <span
                                    class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                >
                                    {{ $t('Document Type') }}
                                </span>
                                <filter-select
                                    v-model="form.type"
                                    multiple
                                    :options="typeOptions"
                                    :all-label="$t('All types')"
                                    :placeholder="$t('All types')"
                                    :search-placeholder="$t('Search') + '…'"
                                    :empty-label="$t('No matches')"
                                    :clear-label="$t('Clear All')"
                                    icon="category"
                                />
                            </div>
                            <button
                                v-if="form.type"
                                type="button"
                                class="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800"
                                @click="form.type = null"
                            >
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>

                    <!-- The register's own rows: same markup, same stylesheet. -->
                    <div
                        class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                    >
                        <div v-if="documents.data.length" class="divide-y divide-gray-100 dark:divide-white/10">
                            <Link
                                v-for="doc in documents.data"
                                :key="doc.id"
                                class="doc-row"
                                :href="
                                    route('workspace.documents.show', [
                                        workspace.slug || workspace.id,
                                        doc.slug || doc.id,
                                    ])
                                "
                            >
                                <icon :name="docIcon(doc)" class="doc-row__icon" />
                                <span v-if="doc.code" class="doc-row__code">{{ doc.code }}</span>
                                <span class="doc-row__title">{{ doc.title }}</span>
                                <span v-if="doc.project" class="doc-row__project">{{ doc.project.title }}</span>
                                <span class="doc-row__files" :title="$t('Attachments')">
                                    <icon name="attachment" class="h-3 w-3" />{{ doc.attachments_count }}
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
                                <span class="doc-row__date">{{ shortDate(doc.created_at) }}</span>
                                <span class="doc-row__status" :class="doc.is_done ? 'is-done' : 'is-open'">
                                    {{ doc.is_done ? $t('Done') : doc.status || $t('Active') }}
                                </span>
                                <icon name="chevron-right" class="doc-row__chevron" />
                            </Link>
                        </div>

                        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-2xl bg-gray-100 dark:bg-white/10 p-4">
                                <icon name="list" class="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p class="font-semibold text-gray-700 dark:text-gray-200">
                                {{ $t('No documents found.') }}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ $t('Documents assigned to you show up here.') }}
                            </p>
                        </div>
                    </div>

                    <pagination v-if="documents.data.length" class="mt-4" :links="documents.links" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import Pagination from '@/Shared/Pagination.vue';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import moment from 'moment';

const EXTENSION_ICONS = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    png: 'file-image',
    jpg: 'file-image',
    jpeg: 'file-image',
};

export default {
    metaInfo: { title: 'My Documents' },
    layout: Layout,
    components: { Head, Link, Icon, Pagination, FilterSelect },
    props: {
        title: String,
        workspace: Object,
        documents: Object,
        types: { type: Array, default: () => [] },
        filters: { type: Object, default: () => ({}) },
        total: { type: Number, default: 0 },
    },
    data() {
        return {
            // Documents first: it is where the sidebar lands. The icon rides on
            // the option so the order can be changed in one place - it used to
            // live in a second, position-parallel array that had to be kept in
            // step by hand across five files.
            viewOptions: [
                { name: 'Documents', slug: 'documents', icon: 'file-text' },
                { name: 'Board', slug: 'board', icon: 'board' },
                { name: 'Calendar', slug: 'calendar', icon: 'calendar' },
                { name: 'Timeline', slug: 'timeline', icon: 'timeline' },
                { name: 'List', slug: 'table', icon: 'table' },
            ],
            form: { type: this.filters.type || null },
        };
    },
    computed: {
        typeOptions() {
            return this.types.map((type) => ({ value: String(type.id), label: type.name }));
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                router.get(
                    this.route('workspace.view.my-tasks.documents', this.workspace.slug || this.workspace.id),
                    pickBy(this.form),
                    { preserveState: true, replace: true }
                );
            }, 250),
        },
    },
    methods: {
        shortDate(value) {
            if (!value) return '';
            const parsed = moment(value);
            return parsed.isValid() ? parsed.format('MMM D') : '';
        },
        fileIcon(ext) {
            return EXTENSION_ICONS[String(ext || '').toLowerCase()] || 'file-generic';
        },
        /** The row icon follows the document's first attachment. */
        docIcon(doc) {
            const first = doc.files && doc.files.length ? doc.files[0] : null;
            return first ? this.fileIcon(first.ext) : 'file-generic';
        },
    },
};
</script>
