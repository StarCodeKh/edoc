<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />

        <div
            v-for="type in workflow_types"
            :key="type"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mb-5"
        >
            <div class="px-8 py-6 flex items-start gap-4 border-b border-gray-100 dark:border-gray-700">
                <span class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl" :class="workflowMeta(type).badgeClass">
                    <Icon :name="workflowMeta(type).icon" class="w-5 h-5" />
                </span>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-gray-900 dark:text-gray-100">{{ workflowMeta(type).label }}</div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('Steps, responsible role, SLA and signature requirements for this workflow.') }}</p>
                </div>
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1">
                    {{ groupedRoles[type].length }} {{ groupedRoles[type].length === 1 ? $t('step') : $t('steps') }}
                </span>
            </div>

            <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <div
                    v-for="role in groupedRoles[type]"
                    :key="role.id"
                    class="flex flex-wrap items-center gap-2 px-8 py-3"
                >
                    <span class="w-6 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">{{ role.order }}</span>

                    <input
                        v-model="role.list_title"
                        type="text"
                        class="flex-1 min-w-[180px] bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('Step name')"
                    >

                    <input
                        v-model="role.responsible_role"
                        type="text"
                        class="w-24 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('Role')"
                    >

                    <input
                        v-model.number="role.sla_hours"
                        type="number"
                        min="0"
                        class="w-20 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('SLA hrs')"
                    >

                    <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <input type="checkbox" v-model="role.requires_signature" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600">
                        {{ $t('Signature') }}
                    </label>

                    <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <input type="checkbox" v-model="role.is_terminal" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600">
                        {{ $t('Terminal') }}
                    </label>

                    <button
                        type="button"
                        :disabled="role.saving"
                        @click="saveRole(role)"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex-shrink-0 transition-colors"
                    >
                        <Icon name="tick_check" class="w-3 h-3" />
                        {{ role.saving ? $t('Saving...') : $t('Save') }}
                    </button>

                    <button
                        type="button"
                        @click="deleteRole(type, role)"
                        class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0 transition-colors"
                        :title="$t('Delete step')"
                    >
                        <Icon name="trash" class="w-3.5 h-3.5" />
                    </button>
                </div>

                <div v-if="!groupedRoles[type].length" class="px-8 py-6 text-sm text-gray-400 dark:text-gray-500">
                    {{ $t('No steps yet — add one below.') }}
                </div>
            </div>

            <!-- Add new step -->
            <div class="flex flex-wrap items-center gap-2 px-8 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
                <input
                    v-model="newRoleForms[type].list_title"
                    type="text"
                    @keyup.enter="addRole(type)"
                    class="flex-1 min-w-[180px] bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('e.g. Verify draft')"
                >
                <input
                    v-model="newRoleForms[type].responsible_role"
                    type="text"
                    @keyup.enter="addRole(type)"
                    class="w-24 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('Role')"
                >
                <input
                    v-model.number="newRoleForms[type].sla_hours"
                    type="number"
                    min="0"
                    @keyup.enter="addRole(type)"
                    class="w-20 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('SLA hrs')"
                >
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                    <input type="checkbox" v-model="newRoleForms[type].requires_signature" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600">
                    {{ $t('Signature') }}
                </label>
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                    <input type="checkbox" v-model="newRoleForms[type].is_terminal" class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600">
                    {{ $t('Terminal') }}
                </label>
                <button
                    type="button"
                    :disabled="!newRoleForms[type].list_title.trim()"
                    @click="addRole(type)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                >
                    <Icon name="plus" class="w-3.5 h-3.5" />
                    {{ $t('Add step') }}
                </button>
            </div>
        </div>
    </div>

    <!-- Toast notifications -->
    <teleport to="body">
        <div class="toast-stack" aria-live="polite" aria-atomic="true">
            <transition-group name="toast">
                <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="'toast-item--' + toast.type" role="alert">
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
    import { Head } from '@inertiajs/vue3'
    import Icon from '@/Shared/Icon.vue'
    import Layout from '@/Shared/Layout.vue'
    import axios from 'axios'

    export default {
        components: { Icon, Head },
        layout: Layout,
        props: {
            title: String,
            roles: { type: Array, default: () => [] },
            workflow_types: { type: Array, default: () => ['external_ministry', 'casino_operator', 'internal_cgmc'] },
        },
        data() {
            const newRoleForms = {};
            this.workflow_types.forEach(type => {
                newRoleForms[type] = { list_title: '', responsible_role: '', sla_hours: null, requires_signature: false, is_terminal: false };
            });

            return {
                localRoles: (this.roles || []).map(r => ({ ...r, saving: false })),
                newRoleForms,
                toasts: [],
                toastIdCounter: 0,
            }
        },
        computed: {
            groupedRoles() {
                const groups = {};
                this.workflow_types.forEach(type => { groups[type] = []; });
                this.localRoles.forEach(role => {
                    if (!groups[role.workflow_type]) groups[role.workflow_type] = [];
                    groups[role.workflow_type].push(role);
                });
                Object.keys(groups).forEach(type => {
                    groups[type].sort((a, b) => (a.order || 0) - (b.order || 0));
                });
                return groups;
            },
        },
        methods: {
            workflowMeta(type) {
                const meta = {
                    external_ministry: { label: this.$t('External Ministry'), icon: 'send', badgeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                    casino_operator: { label: this.$t('Casino Operator'), icon: 'briefcase', badgeClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
                    internal_cgmc: { label: this.$t('Internal CGMC'), icon: 'building', badgeClass: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
                };
                return meta[type] || { label: type, icon: 'checklist', badgeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
            },

            showToast(message, type = 'success') {
                const id = ++this.toastIdCounter;
                this.toasts.push({ id, message, type });
                setTimeout(() => this.removeToast(id), type === 'error' ? 4000 : 2500);
            },
            removeToast(id) {
                const idx = this.toasts.findIndex(t => t.id === id);
                if (idx > -1) this.toasts.splice(idx, 1);
            },

            saveRole(role) {
                role.saving = true;
                axios.post(this.route('workflow-roles.update', role.id), {
                    list_title: role.list_title,
                    responsible_role: role.responsible_role,
                    sla_hours: role.sla_hours,
                    requires_signature: !!role.requires_signature,
                    is_terminal: !!role.is_terminal,
                }).then(() => {
                    this.showToast(this.$t('Step saved.'));
                }).catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to save the step.'), 'error');
                }).finally(() => {
                    role.saving = false;
                });
            },

            deleteRole(type, role) {
                axios.post(this.route('workflow-roles.delete', role.id)).then(() => {
                    const idx = this.localRoles.findIndex(r => r.id === role.id);
                    if (idx > -1) this.localRoles.splice(idx, 1);
                    this.showToast(this.$t('Step removed.'));
                }).catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to remove the step.'), 'error');
                });
            },

            addRole(type) {
                const form = this.newRoleForms[type];
                const title = (form.list_title || '').trim();
                if (!title) return;

                axios.post(this.route('workflow-roles.create'), {
                    workflow_type: type,
                    list_title: title,
                    responsible_role: form.responsible_role || '',
                    sla_hours: form.sla_hours,
                    requires_signature: !!form.requires_signature,
                    is_terminal: !!form.is_terminal,
                }).then((response) => {
                    if (response.data) {
                        this.localRoles.push({ ...response.data, saving: false });
                        this.newRoleForms[type] = { list_title: '', responsible_role: '', sla_hours: null, requires_signature: false, is_terminal: false };
                        this.showToast(this.$t('Step added.'));
                    }
                }).catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to add the step.'), 'error');
                });
            },
        },
    }
</script>

<style scoped>
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

    .toast-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .toast-leave-active { transition: all 0.2s ease-in; position: absolute; }
    .toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-16px) scale(0.95); }
    .toast-move { transition: transform 0.2s ease; }
</style>
