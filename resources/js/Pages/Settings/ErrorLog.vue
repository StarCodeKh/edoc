<template>
    <div class="h-full">
        <Head :title="$t('Error Log')" />
        <div class="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">

            <!-- Header + filters hold their place; only the log below scrolls. -->
            <div class="flex-shrink-0 px-4 pt-4">
                <div class="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-900 px-6 py-5 shadow-lg">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                                <icon name="info" class="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-white">{{ $t('Error Log') }}</h1>
                                <p class="text-sm text-slate-300">{{ activeFile || $t('No log file yet.') }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <div v-for="level in levelOrder" :key="level" v-show="counts[level]" class="rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/20 backdrop-blur">
                                <div class="text-base font-bold" :class="levelTextClass(level)">{{ khNum(counts[level] || 0) }}</div>
                                <div class="text-[10px] font-medium uppercase tracking-wide text-slate-300">{{ level }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
                    <div class="flex flex-wrap items-end gap-3">
                        <div class="min-w-[15rem] flex-1">
                            <span class="log-caption">{{ $t('Search') }}</span>
                            <div class="log-search">
                                <icon name="search" class="log-search__icon" />
                                <input v-model="form.search" type="text" class="log-search__input" :placeholder="$t('Message or stack trace…')" />
                            </div>
                        </div>

                        <div>
                            <span class="log-caption">{{ $t('Level') }}</span>
                            <filter-select
                                v-model="form.level"
                                class="log-select"
                                :options="levelOptions"
                                :all-label="$t('All levels')"
                                :search-placeholder="$t('Search') + '…'"
                                multiple
                                :count-label="$t('selected')"
                                :clear-label="$t('Clear')"
                            />
                        </div>

                        <div>
                            <span class="log-caption">{{ $t('Log file') }}</span>
                            <filter-select
                                v-model="form.file"
                                class="log-select"
                                :options="fileOptions"
                                :show-all="false"
                                :placeholder="activeFile || $t('No log file yet.')"
                                :search-placeholder="$t('Search') + '…'"
                            />
                        </div>

                        <button v-if="hasFilters" type="button" @click="reset" class="log-clear">
                            <icon name="close" class="h-3.5 w-3.5" />
                            {{ $t('Clear All') }}
                        </button>

                        <button
                            v-if="activeFile && total"
                            type="button"
                            class="log-danger ml-auto"
                            :disabled="clearing"
                            @click="confirmClear"
                        >
                            <icon name="trash" class="h-3.5 w-3.5" />
                            {{ clearing ? $t('Saving...') : $t('Empty this log file') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Log -->
            <div class="log-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <div class="mt-4 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
                    <div v-if="entries.data.length" class="divide-y divide-gray-100">
                        <button
                            v-for="entry in entries.data"
                            :key="entry.id"
                            type="button"
                            class="log-row"
                            @click="detail = entry"
                        >
                            <span class="log-row__level" :class="levelClass(entry.level)">{{ entry.level }}</span>
                            <span class="log-row__msg" :title="entry.message">{{ entry.excerpt }}</span>
                            <span v-if="entry.context" class="log-row__trace" :title="$t('Has a stack trace')">
                                <icon name="code" class="h-3 w-3" />
                            </span>
                            <span class="log-row__time">{{ moment(entry.timestamp).format('DD MMM, HH:mm:ss') }}</span>
                            <icon name="chevron-right" class="log-row__chevron" />
                        </button>
                    </div>

                    <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <div class="rounded-2xl bg-green-100 p-4">
                            <icon name="complete" class="h-8 w-8 text-green-600" />
                        </div>
                        <p class="font-semibold text-gray-700">{{ hasFilters ? $t('No matches') : $t('Nothing logged — the application is running clean.') }}</p>
                        <button v-if="hasFilters" type="button" @click="reset" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            {{ $t('Clear All') }}
                        </button>
                    </div>
                </div>

                <pagination v-if="entries.data.length" class="mt-4" :links="entries.links" />
            </div>
        </div>

        <!-- One entry, in full -->
        <transition name="log-fade">
            <div v-if="detail" class="log-backdrop" @click.self="detail = null">
                <div class="log-panel">
                    <div class="log-panel__head">
                        <span class="log-row__level" :class="levelClass(detail.level)">{{ detail.level }}</span>
                        <div class="min-w-0 flex-1">
                            <div class="log-panel__time">{{ moment(detail.timestamp).format('DD MMM YYYY, HH:mm:ss') }}</div>
                            <div class="log-panel__meta">{{ detail.channel }} · {{ detail.file }}</div>
                        </div>
                        <button type="button" class="log-panel__close" @click="detail = null" :title="$t('Close')">
                            <icon name="close" class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="log-panel__body">
                        <div class="log-panel__label">{{ $t('Message') }}</div>
                        <p class="log-panel__message">{{ detail.message }}</p>

                        <template v-if="detail.context">
                            <div class="log-panel__label mt-4">{{ $t('Stack trace') }}</div>
                            <pre class="log-panel__trace">{{ detail.context }}</pre>
                        </template>
                    </div>

                    <div class="log-panel__foot">
                        <button type="button" class="log-btn log-btn--ghost" @click="copyEntry">
                            <icon name="code" class="h-3.5 w-3.5" />
                            {{ copied ? $t('Copied') : $t('Copy') }}
                        </button>
                        <button type="button" class="log-btn log-btn--primary" @click="detail = null">{{ $t('Close') }}</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Head } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import Pagination from '@/Shared/Pagination.vue'
import FilterSelect from '@/Shared/Components/FilterSelect.vue'
import pickBy from 'lodash/pickBy'
import throttle from 'lodash/throttle'
import moment from 'moment'
import khmerCalendarMixin from '@/Utils/khmerCalendarMixin'

/** Monolog's levels, most severe first — drives both the tiles and the colours. */
const LEVELS = {
    EMERGENCY: 'is-emergency',
    ALERT: 'is-alert',
    CRITICAL: 'is-critical',
    ERROR: 'is-error',
    WARNING: 'is-warning',
    NOTICE: 'is-notice',
    INFO: 'is-info',
    DEBUG: 'is-debug',
}

export default {
    metaInfo: { title: 'Error Log' },
    components: { Head, Icon, Pagination, FilterSelect },
    layout: Layout,
    mixins: [khmerCalendarMixin],
    props: {
        title: String,
        entries: Object,
        filters: Object,
        files: { type: Array, default: () => [] },
        activeFile: { type: String, default: null },
        levels: { type: Array, default: () => [] },
        counts: { type: Object, default: () => ({}) },
        total: { type: Number, default: 0 },
    },
    data() {
        return {
            moment,
            detail: null,
            copied: false,
            clearing: false,
            form: {
                search: this.filters.search || null,
                level: this.filters.level || null,
                file: this.filters.file || null,
            },
        }
    },
    computed: {
        levelOrder() {
            return Object.keys(LEVELS).filter(l => this.counts[l])
        },
        levelOptions() {
            return this.levels.map(l => ({ value: l, label: l }))
        },
        fileOptions() {
            return this.files.map(f => ({
                value: f.name,
                label: `${f.name} · ${this.fileSize(f.size)}`,
            }))
        },
        hasFilters() {
            return !!(this.form.search || this.form.level)
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(this.route('settings.error-log'), pickBy(this.form), {
                    preserveState: true,
                    replace: true,
                })
            }, 400),
        },
    },
    methods: {
        levelClass(level) {
            return LEVELS[level] || 'is-debug'
        },
        levelTextClass(level) {
            return ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR'].includes(level) ? 'text-red-400'
                 : level === 'WARNING' ? 'text-orange-400'
                 : 'text-white'
        },
        fileSize(bytes) {
            const size = Number(bytes) || 0
            if (size < 1024) return `${this.khNum(size)} B`
            if (size < 1024 * 1024) return `${this.khNum((size / 1024).toFixed(0))} KB`
            return `${this.khNum((size / 1024 / 1024).toFixed(1))} MB`
        },
        copyEntry() {
            if (!this.detail) return
            const text = `[${this.detail.timestamp}] ${this.detail.channel}.${this.detail.level}: ${this.detail.message}\n${this.detail.context || ''}`
            navigator.clipboard?.writeText(text).then(() => {
                this.copied = true
                setTimeout(() => { this.copied = false }, 1500)
            })
        },
        confirmClear() {
            if (!window.confirm(this.$t('Empty this log file? Its entries cannot be recovered.'))) return
            this.clearing = true
            this.$inertia.post(this.route('settings.error-log.clear'), { file: this.activeFile }, {
                onFinish: () => { this.clearing = false },
            })
        },
        reset() {
            this.form.search = null
            this.form.level = null
        },
    },
}
</script>

<style scoped>
/* ---- filter bar ---- */
.log-caption {
    display: block;
    margin-bottom: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: #6b7280;
}
.log-search { position: relative; }
.log-search__icon {
    position: absolute;
    top: 50%;
    left: 12px;
    width: 14px;
    height: 14px;
    transform: translateY(-50%);
    pointer-events: none;
    color: #9ca3af;
}
.log-search__input {
    width: 100%;
    height: 38px;
    padding: 0 12px 0 34px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    font-size: 14px;
    color: #1f2937;
    background: #fff;
    transition: border-color .15s ease, box-shadow .15s ease;
}
.log-search__input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .12);
}
.log-select :deep(.filter-select__trigger) {
    height: 38px;
    min-width: 11rem;
    border-radius: 9px;
    border-color: #d1d5db;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
}
.log-clear, .log-danger {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 38px;
    padding: 0 12px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
}
.log-clear { color: #6b7280; }
.log-clear:hover { background: #fef2f2; color: #dc2626; }
.log-danger { color: #b91c1c; border: 1px solid #fecaca; background: #fff; }
.log-danger:hover:not(:disabled) { background: #fef2f2; border-color: #fca5a5; }
.log-danger:disabled { opacity: .55; cursor: not-allowed; }

/* ---- scroll pane ---- */
.log-scroll {
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, .35) transparent;
}
.log-scroll::-webkit-scrollbar { width: 8px; }
.log-scroll::-webkit-scrollbar-track { background: transparent; }
.log-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, .28);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}
.log-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, .5); background-clip: content-box; }

/* ---- one-line rows ---- */
.log-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 16px;
    text-align: left;
    transition: background-color .12s ease;
}
.log-row:hover { background: rgba(238, 242, 255, .5); }
.log-row:hover .log-row__chevron { color: #6574cd; transform: translateX(2px); }

.log-row__level {
    flex-shrink: 0;
    width: 5.5rem;
    padding: 3px 0;
    border-radius: 6px;
    text-align: center;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .04em;
}
.log-row__level.is-emergency,
.log-row__level.is-alert,
.log-row__level.is-critical { background: #7f1d1d; color: #fff; }
.log-row__level.is-error    { background: #fee2e2; color: #b91c1c; }
.log-row__level.is-warning  { background: #ffedd5; color: #c2410c; }
.log-row__level.is-notice   { background: #fef9c3; color: #a16207; }
.log-row__level.is-info     { background: #dbeafe; color: #1d4ed8; }
.log-row__level.is-debug    { background: #f1f5f9; color: #64748b; }

.log-row__msg {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.log-row__trace { flex-shrink: 0; color: #94a3b8; }
.log-row__time {
    width: 8.5rem;
    flex-shrink: 0;
    text-align: right;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #9ca3af;
}
.log-row__chevron {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #d1d5db;
    transition: color .12s ease, transform .12s ease;
}

/* ---- detail panel ---- */
.log-backdrop {
    position: fixed;
    inset: 0;
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(15, 23, 42, .55);
    backdrop-filter: blur(2px);
}
.log-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 48rem;
    max-height: 88vh;
    overflow: hidden;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, .3);
}
.log-panel__head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #eef2f7;
}
.log-panel__time { font-size: 14px; font-weight: 700; color: #0f172a; }
.log-panel__meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #94a3b8;
}
.log-panel__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 999px;
    color: #94a3b8;
}
.log-panel__close:hover { background: #f1f5f9; color: #475569; }

.log-panel__body { padding: 16px 18px; overflow-y: auto; }
.log-panel__label {
    margin-bottom: 6px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #94a3b8;
}
.log-panel__message {
    padding: 10px 12px;
    border-radius: 10px;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    font-size: 13px;
    line-height: 1.55;
    color: #7f1d1d;
    word-break: break-word;
}
.log-panel__trace {
    padding: 12px;
    border-radius: 10px;
    background: #0f172a;
    color: #cbd5e1;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11.5px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 22rem;
    overflow-y: auto;
}

.log-panel__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid #eef2f7;
    background: #fbfdff;
}
.log-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
}
.log-btn--ghost { color: #475569; background: #fff; border: 1px solid #e2e8f0; }
.log-btn--ghost:hover { background: #f1f5f9; }
.log-btn--primary { color: #fff; background: #6574cd; }
.log-btn--primary:hover { background: #5661b3; }

.log-fade-enter-active, .log-fade-leave-active { transition: opacity .15s ease; }
.log-fade-enter-from, .log-fade-leave-to { opacity: 0; }
</style>
