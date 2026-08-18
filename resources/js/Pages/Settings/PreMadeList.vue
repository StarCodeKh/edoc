<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2">
            <div class="px-8 py-6 flex items-start gap-4">
                <span class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Icon name="checklist" class="w-5 h-5" />
                </span>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-gray-900 dark:text-gray-100">{{ $t('Pre made list') }}</div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('If you enable pre made list option - this list will be available while create a new project') }}</p>

                    <div class="flex items-center gap-3 mt-4">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input id="enableRegistration" type="checkbox" v-model="form.enable_pre_made_board" @change="update()" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                        <label for="enableRegistration" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer" @click="form.enable_pre_made_board = !form.enable_pre_made_board; update()">
                            {{ $t('Enable pre made board list') }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mt-5">
            <div class="px-8 py-6 flex items-start gap-4 border-b border-gray-100 dark:border-gray-700">
                <span class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Icon name="briefcase" class="w-5 h-5" />
                </span>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-gray-900 dark:text-gray-100">{{ $t('Workspace') }}</div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('Select a workspace to see its board names below.') }}</p>
                </div>
            </div>

            <div class="px-8 py-6">
                <div class="relative max-w-sm">
                    <div
                        class="flex items-center gap-2 pl-2 pr-8 border rounded-lg bg-gray-50 dark:bg-gray-700 transition-shadow"
                        :class="loadingWorkspaces ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'"
                    >
                        <span
                            v-if="selectedWorkspace"
                            class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-semibold"
                        >
                            {{ (selectedWorkspace.name || '?').charAt(0).toUpperCase() }}
                        </span>
                        <span v-else class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-white">
                            <Icon name="briefcase" class="w-3 h-3" />
                        </span>
                        <select
                            v-model="selectedWorkspaceId"
                            :disabled="loadingWorkspaces"
                            class="flex-1 min-w-[200px] appearance-none bg-transparent text-sm py-2.5 text-gray-900 dark:text-white focus:outline-none disabled:opacity-60"
                        >
                            <option :value="null">{{ $t('Select a workspace...') }}</option>
                            <option
                                v-for="ws in workspaceList"
                                :key="ws.id"
                                :value="ws.id"
                                :title="(ws.boards || []).length ? (ws.boards || []).map(b => b.name).join(', ') : $t('No boards yet')"
                            >{{ ws.name || ws.title || ('Workspace #' + ws.id) }}</option>
                        </select>
                    </div>
                    <div v-if="loadingWorkspaces" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
                    <Icon v-else class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500" name="arrow-down" />
                </div>

                <p v-if="loadingWorkspaces" class="mt-2.5 text-xs text-gray-400 dark:text-gray-500">{{ $t('Loading workspaces...') }}</p>
                <p v-else-if="!workspaceList.length" class="mt-2.5 text-xs text-gray-400 dark:text-gray-500">{{ $t('No workspaces found.') }}</p>
                <p v-else-if="selectedWorkspace" class="mt-2.5 text-xs text-gray-400 dark:text-gray-500">
                    {{ currentWorkspaceBoards.length ? currentWorkspaceBoards.map(b => b.name).join(', ') : $t('No boards yet for this workspace.') }}
                </p>
            </div>

            <transition name="fade-slide">
                <div v-if="selectedWorkspaceId" class="border-t border-gray-100 dark:border-gray-700 px-8 py-6">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Icon name="checklist" class="w-3.5 h-3.5" />
                        </span>
                        <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {{ $t('Boards') }} — {{ selectedWorkspaceName }}
                        </div>
                        <span class="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
                            {{ currentWorkspaceBoards.length }} {{ currentWorkspaceBoards.length === 1 ? $t('board') : $t('boards') }}
                        </span>
                    </div>

                    <!-- Read-only: these are the list_title values of every
                         workflow step tied to this workspace in
                         edoc_workflow_roles. Add/rename/remove them from
                         the Workflow Roles page — that's the single
                         source of truth now, this is just a live view of it. -->
                    <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        {{ $t('Pulled from this workspace\'s workflow steps. Add or rename steps on the Workflow Roles page.') }}
                    </p>

                    <div class="flex flex-wrap gap-2">
                        <span
                            v-for="board in currentWorkspaceBoards"
                            :key="board.id"
                            class="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 text-sm font-medium text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full ring-1 ring-inset ring-blue-200 dark:ring-blue-800"
                        >
                            <span class="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Icon name="checklist" class="w-2.5 h-2.5 text-white" />
                            </span>
                            {{ board.name }}
                        </span>
                        <div v-if="!currentWorkspaceBoards.length" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2">
                            <Icon name="checklist" class="w-4 h-4 opacity-50" />
                            {{ $t('No workflow steps assigned to this workspace yet.') }}
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>

    <!-- Toast notifications -->
    <teleport to="body">
        <div class="toast-stack" aria-live="polite" aria-atomic="true">
            <transition-group name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast-item"
                    :class="'toast-item--' + toast.type"
                    role="alert"
                >
                    <div class="toast-item__icon">
                        <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="toast-item__message">{{ toast.message }}</div>
                    <button class="toast-item__close" @click="removeToast(toast.id)" :aria-label="$t('Dismiss')">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script>
    import { Link, Head } from '@inertiajs/vue3'
    import Icon from '@/Shared/Icon.vue'
    import Layout from '@/Shared/Layout.vue'
    import Pagination from '@/Shared/Pagination.vue'
    import SearchInput from '@/Shared/SearchInput.vue'
    import axios from 'axios'

    export default {
    metaInfo: { title: 'Roles' },
    components: {
        Icon,
        Link,
        Head,
        Pagination,
        SearchInput,
    },
    layout: Layout,
    props: {
        title: String,
        enable_list: { require: false },
    },
    data() {
        return {
            form: this.$inertia.form({
                enable_pre_made_board: this.enable_list,
            }),
            workspaceList: [],
            loadingWorkspaces: true,
            selectedWorkspaceId: null,

            toasts: [],
            toastIdCounter: 0,
        }
    },
    computed: {
        selectedWorkspace() {
            return this.workspaceList.find(w => w.id === this.selectedWorkspaceId) || null;
        },
        currentWorkspaceBoards() {
            return this.selectedWorkspace ? (this.selectedWorkspace.boards || []) : [];
        },
        selectedWorkspaceName() {
            const ws = this.selectedWorkspace;
            return ws ? (ws.name || ws.title || ('Workspace #' + ws.id)) : '';
        },
    },
    created() {
        this.fetchWorkspaces();
    },
    methods: {
        showToast(message, type = 'success') {
            const id = ++this.toastIdCounter;
            this.toasts.push({ id, message, type });
            setTimeout(() => this.removeToast(id), type === 'error' ? 4000 : 2500);
        },
        removeToast(id) {
            const idx = this.toasts.findIndex(t => t.id === id);
            if (idx > -1) this.toasts.splice(idx, 1);
        },

        update() {
            this.form.post(this.route('global.update.pre_made_list'), {
                onSuccess: () => this.showToast(this.$t('Settings saved.')),
                onError: () => this.showToast(this.$t('Failed to save settings.'), 'error'),
            });
        },

        async fetchWorkspaces() {
            this.loadingWorkspaces = true;

            let workspacesData = [];
            try {
                const workspacesRes = await axios.get(this.route('json.workspaces.all'));
                workspacesData = Array.isArray(workspacesRes.data)
                    ? workspacesRes.data
                    : (workspacesRes.data?.workspaces || workspacesRes.data?.data || []);
            } catch (error) {
                console.log(error);
            }

            // Board names now come from edoc_workflow_roles.list_title,
            // grouped by workspace_id — not the old WorkspaceBoard table.
            let boardsByWorkspaceId = {};
            try {
                const boardsRes = await axios.get(this.route('workflow-roles.board-lists'));
                (boardsRes.data.workspaces || []).forEach(ws => {
                    boardsByWorkspaceId[ws.id] = ws.boards || [];
                });
            } catch (error) {
                console.error('[debug] workflow-roles.board-lists FAILED:', error?.response?.status, error?.response?.data || error.message);
            }

            this.workspaceList = workspacesData.map(ws => ({
                ...ws,
                boards: boardsByWorkspaceId[ws.id] || [],
            }));
            this.loadingWorkspaces = false;
        },
    },
    }
</script>

<style scoped>
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-6px);
    }

    .toast-stack {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 360px;
        max-width: calc(100vw - 32px);
        pointer-events: none;
    }

    .toast-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
        border-left: 4px solid #64748b;
        pointer-events: auto;
    }
    :global(.dark) .toast-item {
        background: #1f2937;
        box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .toast-item--success { border-left-color: #16a34a; }
    .toast-item--error { border-left-color: #dc2626; }

    .toast-item__icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
    }
    .toast-item__icon svg { width: 100%; height: 100%; }
    .toast-item--success .toast-item__icon { color: #16a34a; }
    .toast-item--error .toast-item__icon { color: #dc2626; }

    .toast-item__message {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        color: #334155;
    }
    :global(.dark) .toast-item__message { color: #cbd5e1; }

    .toast-item__close {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        padding: 0;
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
        border-radius: 4px;
    }
    .toast-item__close svg { width: 100%; height: 100%; }
    .toast-item__close:hover { color: #334155; background: rgba(100,116,139,0.12); }
    :global(.dark) .toast-item__close:hover { color: #e2e8f0; background: rgba(148,163,184,0.15); }

    .toast-enter-active {
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .toast-leave-active {
        transition: all 0.2s ease-in;
        position: absolute;
    }
    .toast-enter-from,
    .toast-leave-to {
        opacity: 0;
        transform: translateY(-16px) scale(0.95);
    }
    .toast-move {
        transition: transform 0.2s ease;
    }
</style>