<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />

        <!-- Add a new workflow type -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mb-5"
        >
            <div class="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-start gap-3 sm:gap-4">
                <span
                    class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                >
                    <Icon name="plus" class="w-5 h-5" />
                </span>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-gray-900 dark:text-gray-100">{{ $t('Add a new workflow') }}</div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {{
                            $t(
                                'Not just external ministry, casino operator or internal CGMC — add any workflow you need.'
                            )
                        }}
                    </p>
                    <div class="flex flex-wrap items-center gap-2">
                        <input
                            v-model="newWorkflowForm.type"
                            @input="newWorkflowForm.type = slugify(newWorkflowForm.type)"
                            type="text"
                            @keyup.enter="addWorkflowType"
                            class="w-52 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            :placeholder="$t('key, e.g. partner_review')"
                        />
                        <input
                            v-model="newWorkflowForm.label"
                            type="text"
                            @keyup.enter="addWorkflowType"
                            class="w-full min-w-0 sm:flex-1 sm:min-w-[180px] bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            :placeholder="$t('Display name, e.g. Partner Review')"
                        />
                        <button
                            type="button"
                            :disabled="!canAddWorkflowType"
                            @click="addWorkflowType"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                        >
                            <Icon name="plus" class="w-3.5 h-3.5" />
                            {{ $t('Add workflow') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Workflow tabs — horizontally scrollable so any number of workflows fit -->
        <div
            v-if="allWorkflowTypes.length"
            class="flex flex-nowrap gap-2 mb-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-1 px-1"
        >
            <button
                v-for="type in allWorkflowTypes"
                :key="'tab_' + type"
                type="button"
                @click="selectedWorkflowType = type"
                class="workflow-tab shrink-0 snap-start whitespace-nowrap flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                :class="{ 'workflow-tab--active': selectedWorkflowType === type }"
                :style="workflowTabStyle(type)"
            >
                <span class="workflow-avatar" :style="{ backgroundColor: workflowMeta(type).color }">
                    <Icon v-if="workflowMeta(type).icon" :name="workflowMeta(type).icon" class="w-3.5 h-3.5" />
                    <span v-else>{{ initials(workflowMeta(type).label) }}</span>
                </span>
                <span class="text-sm">{{ workflowMeta(type).label }}</span>
                <span
                    class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold bg-white/85"
                    :style="{ color: workflowMeta(type).color }"
                    >{{ groupedRoles[type].length }}</span
                >
            </button>
        </div>

        <div
            v-for="type in allWorkflowTypes"
            v-show="selectedWorkflowType === type"
            :key="type"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mb-5"
        >
            <div
                class="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-start gap-3 sm:gap-4 border-b border-gray-100 dark:border-gray-700"
            >
                <span
                    class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold shadow-sm"
                    :style="{ backgroundColor: workflowMeta(type).color }"
                >
                    <Icon v-if="workflowMeta(type).icon" :name="workflowMeta(type).icon" class="w-5 h-5" />
                    <span v-else>{{ initials(workflowMeta(type).label) }}</span>
                </span>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="font-bold text-gray-900 dark:text-gray-100">{{ workflowMeta(type).label }}</div>
                        <!-- Shows which workspace this workflow is currently
                             linked to, if all its steps agree on one — same
                             workspace_id every step in this group shares. -->
                        <span
                            v-if="groupWorkspaceId(type)"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                        >
                            <Icon name="briefcase" class="w-3 h-3" />
                            {{ workspaceLabel(groupWorkspaceId(type)) }}
                        </span>
                        <span
                            v-else-if="groupHasMixedWorkspaces(type)"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
                        >
                            {{ $t('Mixed workspaces') }}
                        </span>
                    </div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ $t('Steps, responsible role, SLA and signature requirements for this workflow.') }}
                    </p>
                </div>
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1">
                    {{ groupedRoles[type].length }} {{ groupedRoles[type].length === 1 ? $t('step') : $t('steps') }}
                </span>
                <button
                    v-if="canRemoveWorkflowType(type)"
                    type="button"
                    @click="removeWorkflowType(type)"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0 transition-colors"
                    :title="$t('Remove this empty workflow')"
                >
                    <Icon name="trash" class="w-3.5 h-3.5" />
                </button>
            </div>

            <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <div
                    v-for="role in groupedRoles[type]"
                    :key="role.id"
                    class="grid grid-cols-2 items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 lg:flex lg:flex-wrap"
                >
                    <span
                        class="col-span-2 lg:col-span-1 w-auto lg:w-6 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0"
                    >
                        <span class="lg:hidden">{{ $t('Step') }} </span>{{ role.order }}
                    </span>

                    <input
                        v-model="role.list_title"
                        type="text"
                        class="col-span-2 w-full min-w-0 lg:w-auto lg:flex-1 lg:min-w-[180px] bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('Step name')"
                    />

                    <select
                        v-model="role.workspace_id"
                        class="col-span-2 w-full lg:w-40 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :title="$t('Workspace this step belongs to')"
                    >
                        <option :value="null">{{ $t('No workspace') }}</option>
                        <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">{{ ws.name }}</option>
                    </select>

                    <input
                        v-model="role.responsible_role"
                        type="text"
                        class="w-full lg:w-24 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('Role')"
                    />

                    <input
                        v-model.number="role.sla_hours"
                        type="number"
                        min="0"
                        class="w-full lg:w-20 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('SLA hrs')"
                    />

                    <label
                        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                    >
                        <input
                            type="checkbox"
                            v-model="role.requires_signature"
                            class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Signature') }}
                    </label>

                    <label
                        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                    >
                        <input
                            type="checkbox"
                            v-model="role.is_terminal"
                            class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Terminal') }}
                    </label>

                    <button
                        type="button"
                        :disabled="role.saving"
                        @click="saveRole(role)"
                        class="col-span-1 justify-center inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex-shrink-0 transition-colors"
                    >
                        <Icon name="tick_check" class="w-3 h-3" />
                        {{ role.saving ? $t('Saving...') : $t('Save') }}
                    </button>

                    <button
                        type="button"
                        @click="deleteRole(type, role)"
                        class="justify-self-end lg:justify-self-auto inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0 transition-colors"
                        :title="$t('Delete step')"
                    >
                        <Icon name="trash" class="w-3.5 h-3.5" />
                    </button>
                </div>

                <div
                    v-if="!groupedRoles[type].length"
                    class="px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-400 dark:text-gray-500"
                >
                    {{ $t('No steps yet — add one below.') }}
                </div>
            </div>

            <!-- Add new step -->
            <div
                class="grid grid-cols-2 items-center gap-2 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 lg:flex lg:flex-wrap"
            >
                <input
                    v-model="newRoleForms[type].list_title"
                    type="text"
                    @keyup.enter="addRole(type)"
                    class="col-span-2 w-full min-w-0 lg:w-auto lg:flex-1 lg:min-w-[180px] bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('e.g. Verify draft')"
                />
                <select
                    v-model="newRoleForms[type].workspace_id"
                    class="col-span-2 w-full lg:w-40 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :title="$t('Workspace this step belongs to')"
                >
                    <option :value="null">{{ $t('No workspace') }}</option>
                    <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">{{ ws.name }}</option>
                </select>
                <input
                    v-model="newRoleForms[type].responsible_role"
                    type="text"
                    @keyup.enter="addRole(type)"
                    class="w-full lg:w-24 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('Role')"
                />
                <input
                    v-model.number="newRoleForms[type].sla_hours"
                    type="number"
                    min="0"
                    @keyup.enter="addRole(type)"
                    class="w-full lg:w-20 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('SLA hrs')"
                />
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1">
                    <input
                        type="checkbox"
                        v-model="newRoleForms[type].requires_signature"
                        class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                    />
                    {{ $t('Signature') }}
                </label>
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1">
                    <input
                        type="checkbox"
                        v-model="newRoleForms[type].is_terminal"
                        class="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                    />
                    {{ $t('Terminal') }}
                </label>
                <button
                    type="button"
                    :disabled="!newRoleForms[type].list_title.trim()"
                    @click="addRole(type)"
                    class="col-span-2 justify-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
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
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast-item"
                    :class="'toast-item--' + toast.type"
                    role="alert"
                >
                    <div class="toast-item__icon">
                        <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                    <div class="toast-item__message">{{ toast.message }}</div>
                    <button class="toast-item__close" @click="removeToast(toast.id)" :aria-label="$t('Dismiss')">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script>
import { Head } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import Layout from '@/Shared/Layout.vue';
import axios from 'axios';

export default {
    components: { Icon, Head },
    layout: Layout,
    props: {
        title: String,
        roles: { type: Array, default: () => [] },
        workflow_types: { type: Array, default: () => ['external_ministry', 'casino_operator', 'internal_cgmc'] },
        workspaces: { type: Array, default: () => [] },
    },
    data() {
        const builtInLabels = {
            external_ministry: 'External Ministry',
            casino_operator: 'Casino Operator',
            internal_cgmc: 'Internal CGMC',
        };
        const builtInIcons = {
            external_ministry: 'send',
            casino_operator: 'briefcase',
            internal_cgmc: 'building',
        };
        const colorPalette = ['#3b82f6', '#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];

        let savedLabels = {};
        try {
            savedLabels = JSON.parse(localStorage.getItem('edoc-workflow-type-labels') || '{}') || {};
        } catch (e) {
            savedLabels = {};
        }

        const roles = (this.roles || []).map((r) => ({ ...r, saving: false }));
        const discoveredFromRoles = [...new Set(roles.map((r) => r.workflow_type).filter(Boolean))];
        const startingTypes = [...new Set([...(this.workflow_types || []), ...discoveredFromRoles])];

        const newRoleForms = {};
        startingTypes.forEach((type) => {
            newRoleForms[type] = {
                list_title: '',
                responsible_role: '',
                sla_hours: null,
                requires_signature: false,
                is_terminal: false,
                workspace_id: null,
            };
        });

        return {
            localRoles: roles,
            newRoleForms,
            dynamicWorkflowTypes: [],
            typeLabels: { ...builtInLabels, ...savedLabels },
            builtInIcons,
            colorPalette,
            selectedWorkflowType: startingTypes[0] || null,
            newWorkflowForm: { type: '', label: '' },
            toasts: [],
            toastIdCounter: 0,
        };
    },
    watch: {
        allWorkflowTypes(newTypes) {
            if (!newTypes.length) {
                this.selectedWorkflowType = null;
            } else if (!this.selectedWorkflowType || !newTypes.includes(this.selectedWorkflowType)) {
                this.selectedWorkflowType = newTypes[0];
            }
        },
    },
    computed: {
        allWorkflowTypes() {
            const fromProp = this.workflow_types || [];
            const fromRoles = this.localRoles.map((r) => r.workflow_type).filter(Boolean);
            const combined = [...fromProp, ...fromRoles, ...this.dynamicWorkflowTypes];
            return [...new Set(combined)];
        },
        canAddWorkflowType() {
            const type = (this.newWorkflowForm.type || '').trim();
            return !!type && !this.allWorkflowTypes.includes(type);
        },
        groupedRoles() {
            const groups = {};
            this.allWorkflowTypes.forEach((type) => {
                groups[type] = [];
            });
            this.localRoles.forEach((role) => {
                if (!groups[role.workflow_type]) groups[role.workflow_type] = [];
                groups[role.workflow_type].push(role);
            });
            Object.keys(groups).forEach((type) => {
                groups[type].sort((a, b) => (a.order || 0) - (b.order || 0));
            });
            return groups;
        },
    },
    methods: {
        slugify(value) {
            return (value || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9_]+/g, '_')
                .replace(/^_+|_+$/g, '');
        },
        titleCase(type) {
            return (type || '')
                .split('_')
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        },
        persistTypeLabels() {
            try {
                localStorage.setItem('edoc-workflow-type-labels', JSON.stringify(this.typeLabels));
            } catch (e) {
                // ignore storage failures (private browsing, quota, etc.)
            }
        },
        initials(label) {
            return (
                (label || '')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w.charAt(0).toUpperCase())
                    .join('') || '?'
            );
        },
        hashType(type) {
            let hash = 0;
            for (let i = 0; i < type.length; i++) {
                hash = (hash << 5) - hash + type.charCodeAt(i);
                hash |= 0;
            }
            return hash;
        },
        workflowMeta(type) {
            const label = this.typeLabels[type] || this.titleCase(type) || type;
            const idx = this.allWorkflowTypes.indexOf(type);
            const color =
                this.colorPalette[(idx > -1 ? idx : Math.abs(this.hashType(type))) % this.colorPalette.length];
            return { label, icon: this.builtInIcons[type] || null, color };
        },
        hexToRgba(hex, alpha) {
            const clean = (hex || '').replace('#', '');
            const full =
                clean.length === 3
                    ? clean
                          .split('')
                          .map((c) => c + c)
                          .join('')
                    : clean;
            const num = parseInt(full, 16) || 0;
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        },
        workflowTabStyle(type) {
            const color = this.workflowMeta(type).color;
            const isActive = this.selectedWorkflowType === type;
            if (isActive) {
                return {
                    backgroundColor: color,
                    borderColor: color,
                    color: '#ffffff',
                    boxShadow: `0 4px 14px -4px ${this.hexToRgba(color, 0.55)}`,
                };
            }
            return {
                backgroundColor: this.hexToRgba(color, 0.1),
                borderColor: this.hexToRgba(color, 0.25),
                color: color,
                boxShadow: 'none',
            };
        },

        workspaceLabel(id) {
            const ws = this.workspaces.find((w) => w.id === id);
            return ws ? ws.name : 'Workspace #' + id;
        },
        groupWorkspaceId(type) {
            const ids = [...new Set((this.groupedRoles[type] || []).map((r) => r.workspace_id).filter(Boolean))];
            return ids.length === 1 ? ids[0] : null;
        },
        groupHasMixedWorkspaces(type) {
            const ids = [...new Set((this.groupedRoles[type] || []).map((r) => r.workspace_id).filter(Boolean))];
            return ids.length > 1;
        },

        addWorkflowType() {
            const type = this.slugify(this.newWorkflowForm.type);
            const label = (this.newWorkflowForm.label || '').trim();
            if (!type) return;
            if (this.allWorkflowTypes.includes(type)) {
                this.showToast(this.$t('That workflow already exists.'), 'error');
                return;
            }
            this.dynamicWorkflowTypes.push(type);
            this.typeLabels[type] = label || this.titleCase(type);
            this.persistTypeLabels();
            if (!this.newRoleForms[type]) {
                this.newRoleForms[type] = {
                    list_title: '',
                    responsible_role: '',
                    sla_hours: null,
                    requires_signature: false,
                    is_terminal: false,
                    workspace_id: null,
                };
            }
            this.newWorkflowForm = { type: '', label: '' };
            this.selectedWorkflowType = type;
            this.showToast(this.$t('Workflow added — add its first step below.'));
        },

        canRemoveWorkflowType(type) {
            return this.dynamicWorkflowTypes.includes(type) && (this.groupedRoles[type] || []).length === 0;
        },
        removeWorkflowType(type) {
            const idx = this.dynamicWorkflowTypes.indexOf(type);
            if (idx > -1) this.dynamicWorkflowTypes.splice(idx, 1);
            delete this.newRoleForms[type];
            delete this.typeLabels[type];
            this.persistTypeLabels();
        },

        showToast(message, type = 'success') {
            const id = ++this.toastIdCounter;
            this.toasts.push({ id, message, type });
            setTimeout(() => this.removeToast(id), type === 'error' ? 4000 : 2500);
        },
        removeToast(id) {
            const idx = this.toasts.findIndex((t) => t.id === id);
            if (idx > -1) this.toasts.splice(idx, 1);
        },

        saveRole(role) {
            role.saving = true;
            axios
                .post(this.route('workflow-roles.update', role.id), {
                    list_title: role.list_title,
                    workspace_id: role.workspace_id || null,
                    responsible_role: role.responsible_role,
                    sla_hours: role.sla_hours,
                    requires_signature: !!role.requires_signature,
                    is_terminal: !!role.is_terminal,
                })
                .then(() => {
                    this.showToast(this.$t('Step saved.'));
                })
                .catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to save the step.'), 'error');
                })
                .finally(() => {
                    role.saving = false;
                });
        },

        deleteRole(type, role) {
            axios
                .post(this.route('workflow-roles.delete', role.id))
                .then(() => {
                    const idx = this.localRoles.findIndex((r) => r.id === role.id);
                    if (idx > -1) this.localRoles.splice(idx, 1);
                    this.showToast(this.$t('Step removed.'));
                })
                .catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to remove the step.'), 'error');
                });
        },

        addRole(type) {
            const form = this.newRoleForms[type];
            const title = (form.list_title || '').trim();
            if (!title) return;

            axios
                .post(this.route('workflow-roles.create'), {
                    workflow_type: type,
                    list_title: title,
                    workspace_id: form.workspace_id || null,
                    responsible_role: form.responsible_role || '',
                    sla_hours: form.sla_hours,
                    requires_signature: !!form.requires_signature,
                    is_terminal: !!form.is_terminal,
                })
                .then((response) => {
                    if (response.data) {
                        this.localRoles.push({ ...response.data, saving: false });
                        this.newRoleForms[type] = {
                            list_title: '',
                            responsible_role: '',
                            sla_hours: null,
                            requires_signature: false,
                            is_terminal: false,
                            workspace_id: null,
                        };
                        this.showToast(this.$t('Step added.'));
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.showToast(this.$t('Failed to add the step.'), 'error');
                });
        },
    },
};
</script>

<style scoped>
.workflow-tab {
    background: rgba(100, 116, 139, 0.08);
    border-width: 1px;
}
.workflow-tab--active {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6) inset;
}
.workflow-avatar {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 9999px;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.02em;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
    display: none;
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
    box-shadow:
        0 8px 24px -6px rgba(15, 23, 42, 0.18),
        0 2px 6px rgba(15, 23, 42, 0.08);
    border-left: 4px solid #64748b;
    pointer-events: auto;
}
:global(.dark) .toast-item {
    background: #1f2937;
    box-shadow:
        0 8px 24px -6px rgba(0, 0, 0, 0.5),
        0 2px 6px rgba(0, 0, 0, 0.3);
}

.toast-item--success {
    border-left-color: #16a34a;
}
.toast-item--error {
    border-left-color: #dc2626;
}

.toast-item__icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
}
.toast-item__icon svg {
    width: 100%;
    height: 100%;
}
.toast-item--success .toast-item__icon {
    color: #16a34a;
}
.toast-item--error .toast-item__icon {
    color: #dc2626;
}

.toast-item__message {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: #334155;
}
:global(.dark) .toast-item__message {
    color: #cbd5e1;
}

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
.toast-item__close svg {
    width: 100%;
    height: 100%;
}
.toast-item__close:hover {
    color: #334155;
    background: rgba(100, 116, 139, 0.12);
}
:global(.dark) .toast-item__close:hover {
    color: #e2e8f0;
    background: rgba(148, 163, 184, 0.15);
}

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
