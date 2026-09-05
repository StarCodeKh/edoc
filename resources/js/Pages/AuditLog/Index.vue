<template>
    <div class="h-full">
        <Head :title="$t('Audit Log')" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <!-- The header and filter bar hold their place; only the log
                 below them scrolls, so the filters stay reachable however
                 far down the trail runs. -->
            <div
                class="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 dark:from-white/5 to-white dark:to-white/5"
            >
                <div class="flex-shrink-0 px-4 pt-4">
                    <!-- Header. This gradient ended on indigo shade 700, which the
                         app's tailwind.config does not define (it replaces the
                         palette, and its indigo skips that step). The class compiled
                         to nothing, so the gradient faded to white and took the two
                         stat tiles with it. Shade 800 exists. -->
                    <div
                        class="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-800 px-6 py-5 shadow-lg"
                    >
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                    <icon name="security" class="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold text-white">{{ $t('Audit Log') }}</h1>
                                    <p class="text-sm text-slate-300">
                                        {{ $t('Every recorded change, across every workspace') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div
                                    class="rounded-xl bg-white/10 px-4 py-2 text-center ring-1 ring-white/20 backdrop-blur"
                                >
                                    <div class="text-lg font-bold text-white">{{ khNum(entries.total) }}</div>
                                    <div class="text-[11px] font-medium text-slate-300">{{ $t('Showing') }}</div>
                                </div>
                                <div
                                    class="rounded-xl bg-white/10 px-4 py-2 text-center ring-1 ring-white/20 backdrop-blur"
                                >
                                    <div class="text-lg font-bold text-white">{{ khNum(total) }}</div>
                                    <div class="text-[11px] font-medium text-slate-300">{{ $t('Total') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters. Every control is the same height and shares one
                         focus treatment, so the row reads as a single bar. -->
                    <div
                        class="mt-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-3 sm:p-4 shadow-sm"
                    >
                        <div class="flex flex-wrap items-end gap-3">
                            <div class="w-full sm:min-w-[15rem] sm:flex-1">
                                <span class="audit-caption">{{ $t('Search') }}</span>
                                <!-- The icon is positioned against the input, not the
                                     label: the label also contains the caption above,
                                     which is what pushed it onto the placeholder. -->
                                <div class="audit-search">
                                    <icon name="search" class="audit-search__icon" />
                                    <input
                                        v-model="form.search"
                                        type="text"
                                        class="audit-search__input"
                                        :placeholder="$t('Document, code, person…')"
                                    />
                                </div>
                            </div>

                            <div class="audit-filter">
                                <span class="audit-caption">{{ $t('Action') }}</span>
                                <filter-select
                                    v-model="form.action"
                                    class="audit-select"
                                    :options="actionOptions"
                                    :all-label="$t('All actions')"
                                    :search-placeholder="$t('Search') + '…'"
                                    multiple
                                    :count-label="$t('selected')"
                                    :clear-label="$t('Clear')"
                                />
                            </div>

                            <div class="audit-filter">
                                <span class="audit-caption">{{ $t('Person') }}</span>
                                <filter-select
                                    v-model="form.user"
                                    class="audit-select"
                                    :options="actorOptions"
                                    :all-label="$t('Everyone')"
                                    :search-placeholder="$t('Search') + '…'"
                                    multiple
                                    :count-label="$t('selected')"
                                    :clear-label="$t('Clear')"
                                />
                            </div>

                            <!-- The app's own calendar rather than the browser's:
                                 the native picker ignores the app's styling and
                                 draws its own chrome. Same component the documents
                                 page uses, so both ranges look and behave alike. -->
                            <div class="audit-filter">
                                <span class="audit-caption">{{ $t('Period') }}</span>
                                <div class="audit-range" :class="{ 'is-set': form.from || form.to }">
                                    <date-picker v-model="fromDate" :max-date="form.to" :placeholder="$t('From')" />
                                    <span class="audit-range__sep">–</span>
                                    <date-picker v-model="toDate" :min-date="form.from" :placeholder="$t('To')" />
                                    <button
                                        v-if="form.from || form.to"
                                        type="button"
                                        class="audit-range__clear"
                                        @click="
                                            form.from = null;
                                            form.to = null;
                                        "
                                        :title="$t('Clear')"
                                    >
                                        <icon name="close" class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            <button
                                v-if="hasFilters"
                                type="button"
                                @click="reset"
                                class="audit-clear w-full justify-center sm:w-auto sm:justify-start"
                            >
                                <icon name="close" class="h-3.5 w-3.5" />
                                {{ $t('Clear All') }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="audit-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                    <!-- Log. One line per entry; the full record is in the panel. -->
                    <div
                        class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                    >
                        <div v-if="entries.data.length" class="divide-y divide-gray-100 dark:divide-white/10">
                            <button
                                v-for="entry in entries.data"
                                :key="entry.id"
                                type="button"
                                class="audit-row"
                                @click="openDetail(entry.id)"
                            >
                                <span class="audit-row__icon" :class="actionColor(entry)">
                                    <icon :name="actionIcon(entry)" class="h-3 w-3" />
                                </span>

                                <span class="audit-row__user">{{ entry.user ? entry.user.name : $t('System') }}</span>

                                <span class="audit-row__chip">{{ actionLabel(entry.action) }}</span>

                                <span class="audit-row__text" :title="describe(entry)">{{ describe(entry) }}</span>

                                <span v-if="entry.task && entry.task.code" class="audit-row__code">{{
                                    entry.task.code
                                }}</span>

                                <span
                                    class="audit-row__time"
                                    :title="moment(entry.created_at).format('DD MMM YYYY, HH:mm:ss')"
                                >
                                    {{ moment(entry.created_at).format('DD MMM, HH:mm') }}
                                </span>

                                <icon name="chevron-right" class="audit-row__chevron h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <div class="rounded-2xl bg-gray-100 dark:bg-white/10 p-4">
                                <icon name="security" class="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p class="font-semibold text-gray-700 dark:text-gray-200">
                                {{ $t('No activity recorded yet.') }}
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

                    <pagination v-if="entries.data.length" class="mt-4" :links="entries.links" />
                </div>
            </div>
        </div>

        <!-- One entry, in full -->
        <transition name="audit-fade">
            <div v-if="detailOpen" class="audit-backdrop" @click.self="closeDetail">
                <div class="audit-panel">
                    <div class="audit-panel__head">
                        <span class="audit-panel__icon" :class="detail ? actionColor(detail) : 'bg-gray-400'">
                            <icon :name="detail ? actionIcon(detail) : 'edit'" class="h-4 w-4" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <div class="audit-panel__title">
                                {{ detail ? actionLabel(detail.action) : $t('Loading...') }}
                            </div>
                            <div class="audit-panel__ref">#{{ detailId }}</div>
                        </div>
                        <button type="button" class="audit-panel__close" @click="closeDetail" :title="$t('Close')">
                            <icon name="close" class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="audit-panel__body">
                        <div v-if="detailLoading" class="audit-panel__state">
                            <span class="audit-spinner"></span>{{ $t('Loading...') }}
                        </div>

                        <template v-else-if="detail">
                            <p class="audit-panel__summary">{{ describe(detail) }}</p>

                            <dl class="audit-panel__grid">
                                <div>
                                    <dt>{{ $t('When') }}</dt>
                                    <dd>
                                        {{ moment(detail.created_at).format('DD MMM YYYY, HH:mm:ss') }}
                                        <span class="audit-panel__muted"
                                            >· {{ moment(detail.created_at).fromNow() }}</span
                                        >
                                    </dd>
                                </div>
                                <div v-if="detail.user">
                                    <dt>{{ $t('Person') }}</dt>
                                    <dd>
                                        {{ detail.user.name }}
                                        <span v-if="detail.user.title" class="audit-panel__muted"
                                            >· {{ detail.user.title }}</span
                                        >
                                        <div v-if="detail.user.email" class="audit-panel__muted">
                                            {{ detail.user.email }}
                                        </div>
                                    </dd>
                                </div>
                                <div v-if="detail.task">
                                    <dt>{{ $t('Document') }}</dt>
                                    <dd>
                                        <span v-if="detail.task.code" class="audit-panel__code">{{
                                            detail.task.code
                                        }}</span>
                                        {{ detail.task.title }}
                                    </dd>
                                </div>
                                <div v-if="detail.task && detail.task.project">
                                    <dt>{{ $t('Project') }}</dt>
                                    <dd>{{ detail.task.project.title }}</dd>
                                </div>
                                <div v-if="detail.task && detail.task.current_board">
                                    <dt>{{ $t('Current board') }}</dt>
                                    <dd>{{ detail.task.current_board }}</dd>
                                </div>
                                <div v-if="detail.old_value">
                                    <dt>{{ $t('Before') }}</dt>
                                    <dd class="audit-panel__value">{{ detail.old_value }}</dd>
                                </div>
                                <div v-if="detail.new_value">
                                    <dt>{{ $t('After') }}</dt>
                                    <dd class="audit-panel__value">{{ detail.new_value }}</dd>
                                </div>
                            </dl>
                        </template>

                        <div v-else class="audit-panel__state">{{ $t('Something went wrong loading this task.') }}</div>
                    </div>

                    <div class="audit-panel__foot">
                        <button type="button" class="audit-btn audit-btn--ghost" @click="closeDetail">
                            {{ $t('Close') }}
                        </button>
                        <Link
                            v-if="detail && detail.task && detail.task.project"
                            :href="
                                route('projects.board.with.task', [
                                    detail.task.project.slug || detail.task.project.id,
                                    detail.task.id,
                                ])
                            "
                            class="audit-btn audit-btn--primary"
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
import Layout from '@/Shared/Layout.vue';
import { Head, Link } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import Pagination from '@/Shared/Pagination.vue';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import DatePicker from '@/Shared/Components/DatePicker.vue';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import moment from 'moment';
import axios from 'axios';
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin';

/** field_changed -> how the row should read and look. */
const ACTIONS = {
    list_id: { label: 'Moved between boards', icon: 'move_right', color: 'bg-sky-500' },
    signature_requested: { label: 'Approval & signature requested', icon: 'send_plan', color: 'bg-indigo-600' },
    is_done: { label: 'Completion changed', icon: 'complete', color: 'bg-green-500' },
    is_archive: { label: 'Archive status changed', icon: 'archive', color: 'bg-amber-500' },
    title: { label: 'Title changed', icon: 'edit', color: 'bg-blue-500' },
    slug: { label: 'Title changed', icon: 'edit', color: 'bg-blue-500' },
    description: { label: 'Description updated', icon: 'details', color: 'bg-indigo-500' },
    priority_id: { label: 'Priority changed', icon: 'priorities', color: 'bg-rose-500' },
    due_date: { label: 'Due date changed', icon: 'calendar', color: 'bg-orange-500' },
    order: { label: 'Reordered', icon: 'drag', color: 'bg-sky-500' },
    cover: { label: 'Cover image changed', icon: 'image', color: 'bg-purple-500' },
    comment: { label: 'Comment posted', icon: 'comment', color: 'bg-yellow-500' },
    comment_edit: { label: 'Comment edited', icon: 'comment', color: 'bg-yellow-500' },
    comment_delete: { label: 'Comment deleted', icon: 'trash', color: 'bg-red-500' },
    deleted_at: { label: 'Deleted or restored', icon: 'trash', color: 'bg-red-500' },
};

export default {
    metaInfo: { title: 'Audit Log' },
    components: { Head, Link, Icon, Pagination, FilterSelect, DatePicker },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    props: {
        title: String,
        entries: Object,
        filters: Object,
        actions: { type: Array, default: () => [] },
        actors: { type: Array, default: () => [] },
        total: { type: Number, default: 0 },
    },
    data() {
        return {
            moment,
            detailOpen: false,
            detailId: null,
            detail: null,
            detailLoading: false,

            form: {
                search: this.filters.search || null,
                action: this.filters.action || null,
                user: this.filters.user || null,
                from: this.filters.from || null,
                to: this.filters.to || null,
            },
        };
    },
    computed: {
        actionOptions() {
            return this.actions.map((a) => ({ value: String(a.value), label: this.$t(a.label) }));
        },
        actorOptions() {
            return this.actors.map((a) => ({ value: String(a.id), label: a.name }));
        },
        fromDate: {
            get() {
                return this.form.from || null;
            },
            set(value) {
                this.form.from = value ? moment(value).format('YYYY-MM-DD') : null;
            },
        },
        toDate: {
            get() {
                return this.form.to || null;
            },
            set(value) {
                this.form.to = value ? moment(value).format('YYYY-MM-DD') : null;
            },
        },
        hasFilters() {
            return Object.values(this.form).some((v) => v !== null && v !== '');
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(this.route('audit.log'), pickBy(this.form), {
                    preserveState: true,
                    replace: true,
                });
            }, 400),
        },
    },
    methods: {
        actionLabel(action) {
            const known = ACTIONS[action];
            return known ? this.$t(known.label) : action;
        },
        actionIcon(entry) {
            // "marked as done" and "marked as not done" are one field, opposite events.
            if (entry.action === 'is_done') {
                return /not done/i.test(String(entry.new_value || '')) ? 'incomplete' : 'complete';
            }
            return (ACTIONS[entry.action] || {}).icon || 'edit';
        },
        actionColor(entry) {
            if (entry.action === 'is_done') {
                return /not done/i.test(String(entry.new_value || '')) ? 'bg-gray-400' : 'bg-green-500';
            }
            return (ACTIONS[entry.action] || {}).color || 'bg-gray-400';
        },
        /**
         * Task.php stores most changes as one sentence split across old_value and
         * new_value ("moved the Board from `A`" + "to `B`"), so those are joined.
         * is_done / is_archive keep the state the row ended in.
         */
        describe(entry) {
            if (['is_done', 'is_archive'].includes(entry.action)) {
                return entry.new_value || this.actionLabel(entry.action);
            }
            // Task.php has no case for deleted_at, so both values are bare
            // timestamps - say what happened instead of printing one.
            if (entry.action === 'deleted_at') {
                return entry.new_value ? this.$t('Deleted this document') : this.$t('Restored this document');
            }
            if (entry.action === 'signature_requested') {
                return (
                    this.$t('requested approval & signature from the Secretariat General') +
                    ' · ' +
                    (entry.old_value || '—') +
                    ' → ' +
                    (entry.new_value || '—')
                );
            }
            return [entry.old_value, entry.new_value].filter(Boolean).join(' ') || this.actionLabel(entry.action);
        },
        /** Fetched per id rather than reused from the row, so the panel can show
         *  fields the list does not carry (email, current board, project). */
        openDetail(id) {
            this.detailId = id;
            this.detail = null;
            this.detailOpen = true;
            this.detailLoading = true;

            axios
                .get(this.route('audit.log.show', id))
                .then(({ data }) => {
                    this.detail = data;
                })
                .catch(() => {
                    this.detail = null;
                })
                .finally(() => {
                    this.detailLoading = false;
                });
        },
        closeDetail() {
            this.detailOpen = false;
            this.detail = null;
            this.detailId = null;
        },
        reset() {
            this.form = { search: null, action: null, user: null, from: null, to: null };
        },
    },
};
</script>

<style scoped>
/* ---- filter bar: one height, one focus treatment ---- */
.audit-caption {
    display: block;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #6b7280;
}

.audit-search {
    position: relative;
}
.audit-search__icon {
    position: absolute;
    top: 50%;
    left: 12px;
    width: 14px;
    height: 14px;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--ink-muted);
}
.audit-search__input {
    width: 100%;
    height: 38px;
    padding: 0 12px 0 34px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    font-size: 14px;
    color: var(--ink);
    background: var(--surface);
    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
}
.audit-search__input::placeholder {
    color: var(--ink-muted);
}
.audit-search__input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

/* Match the two dropdowns to everything else in the row. */
.audit-select :deep(.filter-select__trigger) {
    height: 38px;
    min-width: 10.5rem;
    border-radius: 9px;
    border-color: #d1d5db;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
}

.audit-range {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 38px;
    padding: 0 6px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    background: var(--surface);
    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
}
.audit-range:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.audit-range.is-set {
    border-color: #a5b4fc;
    background: #f8faff;
}

/* The picker brings its own bordered trigger; inside this range it is just the
   text, so the two read as one control rather than boxes within a box. */
.audit-range :deep(.date-picker-trigger) {
    border: 0;
    background: transparent;
    padding: 0 4px;
    min-height: 0;
    box-shadow: none;
}
.audit-range :deep(.trigger-text) {
    font-size: 13px;
    color: #374151;
    white-space: nowrap;
}
.audit-range__sep {
    color: #cbd5e1;
    font-size: 12px;
    padding: 0 2px;
}

.audit-range__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 999px;
    color: #94a3b8;
}
.audit-range__clear:hover {
    background: #fee2e2;
    color: #dc2626;
}

.audit-clear {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 38px;
    padding: 0 12px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
}
.audit-clear:hover {
    background: #fef2f2;
    color: #dc2626;
}

/* ---- the scrolling half of the page ---- */
.audit-scroll {
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}
.audit-scroll::-webkit-scrollbar {
    width: 8px;
}
.audit-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.audit-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.28);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}
.audit-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.5);
    background-clip: content-box;
}

/* ---- one-line rows ---- */
.audit-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 16px;
    text-align: left;
    transition: background-color 0.12s ease;
}
.audit-row:hover {
    background: rgba(238, 242, 255, 0.6);
}
.audit-row:hover .audit-row__chevron {
    color: #6574cd;
    transform: translateX(2px);
}

.audit-row__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 999px;
    color: #fff;
}
.audit-row__user {
    width: 9rem;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.audit-row__chip {
    flex-shrink: 0;
    max-width: 12rem;
    padding: 2px 8px;
    border-radius: 6px;
    background: #f1f5f9;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.audit-row__text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.audit-row__code {
    flex-shrink: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    color: #6574cd;
}
.audit-row__time {
    width: 6.75rem;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-muted);
}
.audit-row__chevron {
    flex-shrink: 0;
    color: #d1d5db;
    transition:
        color 0.12s ease,
        transform 0.12s ease;
}

/* ---- detail panel ---- */
.audit-backdrop {
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
.audit-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 34rem;
    max-height: 88vh;
    overflow: hidden;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.3);
}
.audit-panel__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #eef2f7;
}
.audit-panel__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 10px;
    color: #fff;
}
.audit-panel__title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
}
.audit-panel__ref {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #94a3b8;
}
.audit-panel__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 999px;
    color: #94a3b8;
}
.audit-panel__close:hover {
    background: #f1f5f9;
    color: #475569;
}

.audit-panel__body {
    padding: 16px 18px;
    overflow-y: auto;
}
.audit-panel__summary {
    margin-bottom: 14px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    font-size: 13px;
    line-height: 1.55;
    color: #334155;
}
.audit-panel__grid {
    display: grid;
    gap: 12px;
}
.audit-panel__grid dt {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 2px;
}
.audit-panel__grid dd {
    font-size: 13px;
    color: var(--ink);
    line-height: 1.5;
}
.audit-panel__muted {
    color: #94a3b8;
    font-size: 12px;
}
.audit-panel__code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 700;
    color: #6574cd;
    margin-right: 4px;
}
.audit-panel__value {
    padding: 6px 9px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    word-break: break-word;
}
.audit-panel__state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 2.5rem 1rem;
    font-size: 13px;
    color: #94a3b8;
}
.audit-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #cbd5e1;
    border-top-color: transparent;
    border-radius: 999px;
    animation: audit-spin 0.7s linear infinite;
}
@keyframes audit-spin {
    to {
        transform: rotate(360deg);
    }
}

.audit-panel__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid #eef2f7;
    background: #fbfdff;
}
.audit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
}
.audit-btn--ghost {
    color: #475569;
    background: var(--surface);
    border: 1px solid #e2e8f0;
}
.audit-btn--ghost:hover {
    background: #f1f5f9;
}
.audit-btn--primary {
    color: #fff;
    background: #6574cd;
}
.audit-btn--primary:hover {
    background: #5661b3;
}

.audit-fade-enter-active,
.audit-fade-leave-active {
    transition: opacity 0.15s ease;
}
.audit-fade-enter-from,
.audit-fade-leave-to {
    opacity: 0;
}

/* ---------------------------------------------------------------------
   Narrow screens
   The row is a desktop table line - fixed columns for who, action, text,
   code and time - so on a phone the code and the timestamp ran off the
   right edge. Below md it folds into two lines: who did what, then what
   it was and when.
   --------------------------------------------------------------------- */
@media (min-width: 641px) and (max-width: 767px) {
    /* Two filters share a line on a small tablet. */
    .audit-filter {
        width: calc(50% - 6px);
    }
}

@media (max-width: 767px) {
    .audit-range {
        width: 100%;
    }
    .audit-select {
        width: 100%;
    }

    .audit-row {
        position: relative;
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 11px 24px 11px 12px;
    }
    .audit-row__icon {
        order: 0;
    }
    .audit-row__user {
        order: 1;
        width: auto;
        max-width: 60%;
    }
    .audit-row__chip {
        order: 2;
    }
    .audit-row__text {
        order: 3;
        flex: 1 1 100%;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .audit-row__code {
        order: 4;
    }
    .audit-row__time {
        order: 5;
        width: auto;
        margin-left: auto;
    }
    .audit-row__chevron {
        position: absolute;
        top: 50%;
        right: 6px;
        transform: translateY(-50%);
    }
}

/* The detail panel comes up from the bottom, the way a sheet does. */
@media (max-width: 640px) {
    /* One filter per line on a phone. */
    .audit-filter {
        width: 100%;
    }

    .audit-backdrop {
        align-items: flex-end;
        padding: 0;
    }
    .audit-panel {
        max-width: 100%;
        max-height: 92vh;
        border-radius: 18px 18px 0 0;
    }
}
</style>
