<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />

        <!-- The responsibilities a step can be handed to. Their own list, because
             a workflow step names who should act, not what anyone may access. -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mb-5"
        >
            <div class="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                <div class="flex items-start gap-3 sm:gap-4">
                    <span
                        class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300"
                    >
                        <Icon name="users" class="w-5 h-5" />
                    </span>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-gray-900 dark:text-gray-100">
                            {{ $t('Responsibilities') }}
                        </div>
                        <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">
                            {{ $t('The list every workflow step chooses its responsible role from.') }}
                        </p>
                    </div>
                    <span
                        class="flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-300"
                    >
                        {{ localSubRoles.length }}
                    </span>
                </div>

                <p v-if="subRoleError" class="mt-3 text-sm font-medium text-red-600">{{ subRoleError }}</p>

                <ul class="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
                    <li
                        v-for="subRole in nestedSubRoles"
                        :key="subRole.id"
                        class="flex flex-wrap items-center gap-2 py-2"
                        :class="{ 'pl-6': subRole.parent_id }"
                    >
                        <template v-if="subRole.editing">
                            <input
                                v-model="subRole.code"
                                type="text"
                                class="w-28 min-w-0 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                :placeholder="$t('Code')"
                            />
                            <input
                                v-model="subRole.name"
                                type="text"
                                @keyup.enter="saveSubRole(subRole)"
                                class="flex-1 min-w-0 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                :placeholder="$t('Name')"
                            />
                            <filter-select
                                v-model="subRole.parent_id"
                                :options="parentSelectOptions(subRole)"
                                :show-all="false"
                                :placeholder="$t('Stands on its own')"
                                :search-placeholder="$t('Search') + '…'"
                                :empty-label="$t('No matches')"
                                :title="$t('The responsibility this one sits under')"
                                icon="users"
                                class="w-48 min-w-0 filter-select--block"
                            />
                            <button
                                type="button"
                                class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                :disabled="subRole.saving"
                                @click="saveSubRole(subRole)"
                            >
                                {{ $t('Save') }}
                            </button>
                        </template>

                        <template v-else>
                            <span
                                class="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 font-mono text-xs font-bold text-gray-600 dark:text-gray-300"
                            >
                                {{ subRole.code }}
                            </span>
                            <span
                                class="flex-1 min-w-0 truncate text-sm text-gray-800 dark:text-gray-100 dark:text-gray-200"
                            >
                                {{ subRole.name }}
                            </span>
                            <span
                                v-if="childCount(subRole.id)"
                                class="flex-shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-300"
                                :title="$t('A step naming this one can be handed to any of them.')"
                            >
                                {{ $t('stands for :count', { count: childCount(subRole.id) }) }}
                            </span>
                            <button
                                type="button"
                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700"
                                :title="$t('Edit')"
                                @click="subRole.editing = true"
                            >
                                <Icon name="edit" class="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700"
                                :title="$t('Delete')"
                                @click="removeSubRole(subRole)"
                            >
                                <Icon name="trash" class="w-4 h-4" />
                            </button>
                        </template>
                    </li>

                    <li v-if="!localSubRoles.length" class="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                        {{ $t('No responsibilities yet.') }}
                    </li>
                </ul>

                <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <input
                        v-model="newSubRole.code"
                        type="text"
                        class="w-28 min-w-0 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        :placeholder="$t('Code')"
                    />
                    <input
                        v-model="newSubRole.name"
                        type="text"
                        @keyup.enter="addSubRole"
                        class="flex-1 min-w-0 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        :placeholder="$t('Name')"
                    />
                    <filter-select
                        v-model="newSubRole.parent_id"
                        :options="parentSelectOptions(null)"
                        :show-all="false"
                        :placeholder="$t('Stands on its own')"
                        :search-placeholder="$t('Search') + '…'"
                        :empty-label="$t('No matches')"
                        :title="$t('The responsibility this one sits under')"
                        icon="users"
                        class="w-48 min-w-0 filter-select--block"
                    />
                    <button
                        type="button"
                        class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        :disabled="savingSubRole"
                        @click="addSubRole"
                    >
                        <Icon name="plus" class="w-4 h-4" />
                        {{ $t('Add') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Add a new workflow type -->
        <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mr-2 mb-5"
        >
            <div class="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-start gap-3 sm:gap-4">
                <span
                    class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 dark:text-gray-300"
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
                        <!-- The heading above is the workspace this workflow is
                             linked to, so this keeps the flow's own name next to
                             it. Hidden when the two are already the same, which
                             is what a workflow with no single workspace shows. -->
                        <span
                            v-if="workflowMeta(type).own !== workflowMeta(type).label"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                        >
                            <Icon :name="workflowMeta(type).icon || 'briefcase'" class="w-3 h-3" />
                            {{ workflowMeta(type).own }}
                        </span>
                        <span
                            v-else-if="groupHasMixedWorkspaces(type)"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
                        >
                            {{ $t('Mixed workspaces') }}
                        </span>
                    </div>
                    <p class="pt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ $t('Steps, responsible role and signature requirements for this workflow.') }}
                    </p>
                </div>
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1">
                    {{ groupedRoles[type].length }} {{ groupedRoles[type].length === 1 ? $t('step') : $t('steps') }}
                </span>
                <button
                    v-if="canRemoveWorkflowType(type)"
                    type="button"
                    @click="removeWorkflowType(type)"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0 transition-colors"
                    :title="$t('Remove this empty workflow')"
                >
                    <Icon name="trash" class="w-3.5 h-3.5" />
                </button>
            </div>

            <!-- Column names, wide screens only. Below lg each row folds into a
                 stacked card where every field carries its own label. -->
            <div class="wr-row wr-head px-4 sm:px-6 lg:px-8 py-2">
                <span>#</span>
                <span>{{ $t('Step name') }}</span>
                <span>{{ $t('Workspace') }}</span>
                <span>{{ $t('Role') }}</span>
                <span>{{ $t('Signature') }}</span>
                <span>{{ $t('Terminal') }}</span>
                <span>{{ $t('Merge documents') }}</span>
                <span>{{ $t('Attachment') }}</span>
                <span></span>
                <span></span>
            </div>

            <div class="wr-scroll divide-y divide-gray-100 dark:divide-gray-700">
                <div v-for="role in groupedRoles[type]" :key="role.id" class="wr-row px-4 sm:px-6 lg:px-8 py-3">
                    <span
                        class="col-span-2 lg:col-span-1 w-auto lg:w-6 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0"
                    >
                        <span class="lg:hidden">{{ $t('Step') }} </span>{{ role.order }}
                    </span>

                    <input
                        v-model="role.list_title"
                        type="text"
                        class="col-span-2 w-full min-w-0 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="$t('Step name')"
                    />

                    <filter-select
                        v-model="role.workspace_id"
                        :options="workspaceOptions"
                        :placeholder="$t('No workspace')"
                        :search-placeholder="$t('Search') + '…'"
                        :empty-label="$t('No matches')"
                        :show-all="false"
                        :title="$t('Workspace this step belongs to')"
                        icon="briefcase"
                        class="col-span-2 w-full filter-select--block"
                    />

                    <!-- The mode only appears where it can mean something: a
                         responsibility standing for others. Dynamic hands the
                         choice of which one to whoever forwards the document. -->
                    <div class="w-full min-w-0 flex flex-col gap-1">
                        <filter-select
                            v-model="role.responsible_role"
                            :options="subRoleOptions"
                            :show-all="false"
                            :placeholder="$t('Role')"
                            :search-placeholder="$t('Search') + '…'"
                            :empty-label="$t('No matches')"
                            icon="users"
                            class="w-full filter-select--block"
                        />
                        <filter-select
                            v-if="roleStandsForOthers(role.responsible_role)"
                            v-model="role.role_mode"
                            :options="stepModeOptions"
                            :show-all="false"
                            :placeholder="$t('Standard')"
                            :title="
                                $t(
                                    'Standard assigns everyone in this responsibility; dynamic asks the forwarder which one it goes to.'
                                )
                            "
                            icon="users"
                            class="w-full filter-select--block filter-select--xs"
                        />
                    </div>

                    <label
                        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                    >
                        <input
                            type="checkbox"
                            v-model="role.requires_signature"
                            class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Signature') }}
                    </label>

                    <label
                        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                    >
                        <input
                            type="checkbox"
                            v-model="role.is_terminal"
                            class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Terminal') }}
                    </label>

                    <!-- Whether this step may combine the documents linked to
                         the one it is holding into a single PDF. -->
                    <label
                        class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                        :title="$t('This step may combine the documents linked to the one it holds into one PDF.')"
                    >
                        <input
                            type="checkbox"
                            v-model="role.allows_merge"
                            class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Merge documents') }}
                    </label>

                    <!-- Whether the step expects a document, and which kind: a
                         standard form it always takes, or whatever the case
                         produces. The mode only matters once the box is on. -->
                    <div class="col-span-2 flex items-center gap-1.5 flex-shrink-0 py-1">
                        <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                            <input
                                type="checkbox"
                                v-model="role.requires_attachment"
                                class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                            />
                            {{ $t('Attachment') }}
                        </label>
                        <filter-select
                            v-model="role.attachment_mode"
                            :options="stepModeOptions"
                            :show-all="false"
                            :disabled="!role.requires_attachment"
                            :placeholder="$t('Standard')"
                            :title="
                                $t(
                                    'Standard is the form this step always expects; dynamic is whatever the case produces.'
                                )
                            "
                            icon="attachment"
                            class="min-w-0 flex-1 filter-select--block filter-select--xs"
                        />
                    </div>

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
                        class="justify-self-end lg:justify-self-auto inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex-shrink-0 transition-colors"
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
                class="wr-row px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700"
            >
                <!-- Stands in for the step number the rows above carry, so this
                     row's fields sit under the columns they belong to. -->
                <span class="hidden lg:block"></span>

                <input
                    v-model="newRoleForms[type].list_title"
                    type="text"
                    @keyup.enter="addRole(type)"
                    class="col-span-2 w-full min-w-0 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="$t('e.g. Verify draft')"
                />
                <filter-select
                    v-model="newRoleForms[type].workspace_id"
                    :options="workspaceOptions"
                    :placeholder="$t('No workspace')"
                    :search-placeholder="$t('Search') + '…'"
                    :empty-label="$t('No matches')"
                    :show-all="false"
                    :title="$t('Workspace this step belongs to')"
                    icon="briefcase"
                    class="col-span-2 w-full filter-select--block"
                />
                <div class="w-full min-w-0 flex flex-col gap-1">
                    <filter-select
                        v-model="newRoleForms[type].responsible_role"
                        :options="subRoleOptions"
                        :show-all="false"
                        :placeholder="$t('Role')"
                        :search-placeholder="$t('Search') + '…'"
                        :empty-label="$t('No matches')"
                        icon="users"
                        class="w-full filter-select--block"
                    />
                    <filter-select
                        v-if="roleStandsForOthers(newRoleForms[type].responsible_role)"
                        v-model="newRoleForms[type].role_mode"
                        :options="stepModeOptions"
                        :show-all="false"
                        :placeholder="$t('Standard')"
                        :title="
                            $t(
                                'Standard assigns everyone in this responsibility; dynamic asks the forwarder which one it goes to.'
                            )
                        "
                        icon="users"
                        class="w-full filter-select--block filter-select--xs"
                    />
                </div>
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1">
                    <input
                        type="checkbox"
                        v-model="newRoleForms[type].requires_signature"
                        class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                    />
                    {{ $t('Signature') }}
                </label>
                <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1">
                    <input
                        type="checkbox"
                        v-model="newRoleForms[type].is_terminal"
                        class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                    />
                    {{ $t('Terminal') }}
                </label>
                <label
                    class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0 py-1"
                    :title="$t('This step may combine the documents linked to the one it holds into one PDF.')"
                >
                    <input
                        type="checkbox"
                        v-model="newRoleForms[type].allows_merge"
                        class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                    />
                    {{ $t('Merge documents') }}
                </label>
                <div class="col-span-2 flex items-center gap-1.5 flex-shrink-0 py-1">
                    <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <input
                            type="checkbox"
                            v-model="newRoleForms[type].requires_attachment"
                            class="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-gray-300 dark:border-gray-600"
                        />
                        {{ $t('Attachment') }}
                    </label>
                    <filter-select
                        v-model="newRoleForms[type].attachment_mode"
                        :options="stepModeOptions"
                        :show-all="false"
                        :disabled="!newRoleForms[type].requires_attachment"
                        :placeholder="$t('Standard')"
                        :title="
                            $t('Standard is the form this step always expects; dynamic is whatever the case produces.')
                        "
                        icon="attachment"
                        class="min-w-0 flex-1 filter-select--block filter-select--xs"
                    />
                </div>

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
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import Layout from '@/Shared/Layout.vue';
import axios from 'axios';
import { CATEGORICAL, isDarkMode, observeMode } from '@/Utils/palette';

export default {
    components: { FilterSelect, Icon, Head },
    layout: Layout,
    props: {
        title: String,
        roles: { type: Array, default: () => [] },
        workflow_types: { type: Array, default: () => ['external_ministry', 'casino_operator', 'internal_cgmc'] },
        workspaces: { type: Array, default: () => [] },
        sub_roles: { type: Array, default: () => [] },
        /** [{ value, label }] from WorkflowRoleController::STEP_MODES. */
        step_modes: {
            type: Array,
            default: () => [
                { value: 'standard', label: 'Standard' },
                { value: 'dynamic', label: 'Dynamic' },
            ],
        },
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

        let savedLabels = {};
        try {
            savedLabels = JSON.parse(localStorage.getItem('edoc-workflow-type-labels') || '{}') || {};
        } catch (e) {
            savedLabels = {};
        }

        const subRoles = (this.sub_roles || []).map((r) => ({
            ...r,
            parent_id: r.parent_id || null,
            editing: false,
            saving: false,
        }));
        const roles = (this.roles || []).map((r) => ({
            ...r,
            allows_merge: !!r.allows_merge,
            requires_attachment: !!r.requires_attachment,
            attachment_mode: r.attachment_mode || 'standard',
            role_mode: r.role_mode || 'standard',
            saving: false,
        }));
        const discoveredFromRoles = [...new Set(roles.map((r) => r.workflow_type).filter(Boolean))];
        const startingTypes = [...new Set([...(this.workflow_types || []), ...discoveredFromRoles])];

        const newRoleForms = {};
        startingTypes.forEach((type) => {
            newRoleForms[type] = {
                list_title: '',
                responsible_role: '',
                role_mode: 'standard',
                requires_signature: false,
                requires_attachment: false,
                attachment_mode: 'standard',
                is_terminal: false,
                allows_merge: false,
                workspace_id: null,
            };
        });

        return {
            localRoles: roles,
            localSubRoles: subRoles,
            newSubRole: { code: '', name: '', parent_id: null },
            subRoleError: '',
            savingSubRole: false,
            newRoleForms,
            dynamicWorkflowTypes: [],
            typeLabels: { ...builtInLabels, ...savedLabels },
            builtInIcons,
            is_dark: false,
            stop_watching_mode: null,
            selectedWorkflowType: startingTypes[0] || null,
            newWorkflowForm: { type: '', label: '' },
            toasts: [],
            toastIdCounter: 0,
        };
    },
    mounted() {
        this.is_dark = isDarkMode();
        this.stop_watching_mode = observeMode((dark) => {
            this.is_dark = dark;
        });
    },
    beforeUnmount() {
        if (this.stop_watching_mode) this.stop_watching_mode();
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
        /** Slots for the surface these chips are drawn on. */
        colorPalette() {
            return this.is_dark ? CATEGORICAL.dark : CATEGORICAL.light;
        },

        /** FilterSelect takes [{ value, label }]. A null row keeps "no workspace"
            available, which the old <select> had as its first option. */
        workspaceOptions() {
            return [
                { value: null, label: this.$t('No workspace') },
                ...(this.workspaces || []).map((ws) => ({ value: ws.id, label: ws.name })),
            ];
        },

        /** The dropdown the steps pick from, straight off the managed list. */
        /** The step modes as FilterSelect wants them, translated here so the
            server can keep sending plain English keys. */
        stepModeOptions() {
            return (this.step_modes || []).map((mode) => ({
                value: mode.value,
                label: this.$t(mode.label),
            }));
        },

        subRoleOptions() {
            return this.localSubRoles.map((r) => ({
                value: r.code,
                label: r.name && r.name !== r.code ? `${r.name} (${r.code})` : r.code,
            }));
        },

        /** id -> how many responsibilities sit under it. */
        childCounts() {
            const counts = {};
            this.localSubRoles.forEach((r) => {
                if (r.parent_id) counts[r.parent_id] = (counts[r.parent_id] || 0) + 1;
            });
            return counts;
        },

        /** Parents in their own order, each followed by the ones it stands for. */
        nestedSubRoles() {
            const roots = this.localSubRoles.filter((r) => !r.parent_id);
            const orphans = this.localSubRoles.filter(
                (r) => r.parent_id && !this.localSubRoles.some((p) => p.id === r.parent_id)
            );

            return [
                ...roots.flatMap((root) => [root, ...this.localSubRoles.filter((r) => r.parent_id === root.id)]),
                ...orphans,
            ];
        },

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
        childCount(id) {
            return this.childCounts[id] || 0;
        },

        /**
         * What a responsibility may be filed under. Nesting is one level deep,
         * so only responsibilities that stand on their own are offered, and
         * one that already stands for others cannot be moved beneath another.
         */
        /**
         * parentOptions in the shape FilterSelect wants. The null row is what the
         * old <select> had as its first option: a responsibility that stands on
         * its own rather than under another.
         */
        parentSelectOptions(subRole) {
            return [
                { value: null, label: this.$t('Stands on its own') },
                ...this.parentOptions(subRole).map((p) => ({
                    value: p.id,
                    label: `${this.$t('Under')} ${p.name}`,
                })),
            ];
        },

        parentOptions(subject) {
            if (subject && this.childCount(subject.id)) return [];

            return this.localSubRoles.filter((r) => !r.parent_id && (!subject || r.id !== subject.id));
        },

        /** Whether a step's role names a group, which is what dynamic needs. */
        roleStandsForOthers(code) {
            const role = this.localSubRoles.find((r) => r.code === code);
            return !!(role && this.childCount(role.id));
        },

        addSubRole() {
            const code = (this.newSubRole.code || '').trim();
            const name = (this.newSubRole.name || '').trim();

            this.subRoleError = '';

            if (!code || !name) {
                this.subRoleError = this.$t('A code and a name are both required.');
                return;
            }

            this.savingSubRole = true;

            axios
                .post(this.route('workflow-roles.sub.create'), {
                    code,
                    name,
                    parent_id: this.newSubRole.parent_id || null,
                })
                .then((response) => {
                    this.localSubRoles.push({ ...response.data, editing: false, saving: false });
                    this.newSubRole = { code: '', name: '', parent_id: null };
                })
                .catch((error) => {
                    this.subRoleError = this.subRoleMessage(error);
                })
                .finally(() => {
                    this.savingSubRole = false;
                });
        },
        saveSubRole(subRole) {
            const code = (subRole.code || '').trim();
            const name = (subRole.name || '').trim();

            if (!code || !name) {
                this.subRoleError = this.$t('A code and a name are both required.');
                return;
            }

            subRole.saving = true;
            this.subRoleError = '';

            axios
                .post(this.route('workflow-roles.sub.update', subRole.id), {
                    code,
                    name,
                    parent_id: subRole.parent_id || null,
                })
                .then((response) => {
                    // A renamed code is carried across the steps server-side; the
                    // rows already loaded here have to follow it.
                    const previous = subRole.code;
                    Object.assign(subRole, response.data);
                    if (previous !== response.data.code) {
                        this.localRoles.forEach((role) => {
                            if (role.responsible_role === previous) {
                                role.responsible_role = response.data.code;
                            }
                        });
                    }
                    subRole.editing = false;
                })
                .catch((error) => {
                    this.subRoleError = this.subRoleMessage(error);
                })
                .finally(() => {
                    subRole.saving = false;
                });
        },
        removeSubRole(subRole) {
            this.subRoleError = '';

            axios
                .post(this.route('workflow-roles.sub.delete', subRole.id))
                .then(() => {
                    this.localSubRoles = this.localSubRoles.filter((r) => r.id !== subRole.id);
                })
                .catch((error) => {
                    this.subRoleError = this.subRoleMessage(error);
                });
        },
        subRoleMessage(error) {
            const data = error.response && error.response.data;
            if (!data) return this.$t('Something went wrong.');
            if (data.message && !data.errors) return data.message;
            const first = data.errors && Object.values(data.errors)[0];
            return (first && first[0]) || data.message || this.$t('Something went wrong.');
        },
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
        /** The flow's own name - the built-in or renamed label, translated. */
        workflowTypeLabel(type) {
            return this.$t(this.typeLabels[type] || this.titleCase(type) || type);
        },
        workflowMeta(type) {
            // A flow is shown under the name of the workspace it runs in, so
            // renaming that workspace renames the tab with it. Its own label is
            // what shows while its steps name no workspace, or disagree on one.
            const own = this.workflowTypeLabel(type);
            const workspaceId = this.groupWorkspaceId(type);
            const label = workspaceId ? this.workspaceLabel(workspaceId) : own;
            const idx = this.allWorkflowTypes.indexOf(type);
            const color =
                this.colorPalette[(idx > -1 ? idx : Math.abs(this.hashType(type))) % this.colorPalette.length];
            return { label, own, icon: this.builtInIcons[type] || null, color };
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
                    role_mode: 'standard',
                    requires_signature: false,
                    requires_attachment: false,
                    attachment_mode: 'standard',
                    is_terminal: false,
                    allows_merge: false,
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
                    role_mode: role.role_mode || 'standard',
                    requires_signature: !!role.requires_signature,
                    requires_attachment: !!role.requires_attachment,
                    attachment_mode: role.attachment_mode || 'standard',
                    is_terminal: !!role.is_terminal,
                    allows_merge: !!role.allows_merge,
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
                    role_mode: form.role_mode || 'standard',
                    requires_signature: !!form.requires_signature,
                    requires_attachment: !!form.requires_attachment,
                    attachment_mode: form.attachment_mode || 'standard',
                    is_terminal: !!form.is_terminal,
                    allows_merge: !!form.allows_merge,
                })
                .then((response) => {
                    if (response.data) {
                        this.localRoles.push({ ...response.data, saving: false });
                        this.newRoleForms[type] = {
                            list_title: '',
                            responsible_role: '',
                            role_mode: 'standard',
                            requires_signature: false,
                            requires_attachment: false,
                            attachment_mode: 'standard',
                            is_terminal: false,
                            allows_merge: false,
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
/* One grid for the header, every step row and the add-step row, so the columns
   line up down the page. Below lg the row folds into the two-column card the
   phone layout already used, and the header is hidden. */
.wr-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
    gap: 0.5rem;
}
.wr-head {
    display: none;
}
@media (min-width: 1024px) {
    .wr-row {
        grid-template-columns: 2.5rem minmax(150px, 1fr) 9.5rem 6.5rem auto auto auto 12rem auto auto;
    }
    /* the col-span-* the stacked layout needs must not survive up here */
    .wr-row > * {
        grid-column: auto !important;
    }
    .wr-head {
        display: grid;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: #94a3b8;
        border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    }
}

/* A long workflow scrolls in its own pane instead of pushing the add-step row
   off the bottom of the page. max-height rather than height, so a short list
   still ends where its last step does and shows no scrollbar at all.

   The column header sits above this element and the add-step row below it, so
   both stay put while the steps move. FilterSelect teleports its panel to
   <body> and repositions on capture-phase scroll, so an open dropdown follows
   its row rather than being clipped here. */
.wr-scroll {
    max-height: 60vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}
.wr-scroll::-webkit-scrollbar {
    width: 8px;
}
.wr-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.wr-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.28);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}
.wr-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.5);
    background-clip: content-box;
}

/* Phone rows are stacked cards several times the height of a desktop line;
   capping at 60vh there would show barely two of them. */
@media (max-width: 1023px) {
    .wr-scroll {
        max-height: none;
        overflow-y: visible;
    }
}

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
