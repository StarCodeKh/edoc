<template>
    <div class="h-full">
        <Head :title="$t('Submit Document')" />
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
                                    <icon name="post" class="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold text-white">{{ $t('Submit Document') }}</h1>
                                    <p class="text-sm text-indigo-100">{{ workspace.name }}</p>
                                </div>
                            </div>
                            <Link
                                :href="route('workspace.view.documents', workspace.slug || workspace.id)"
                                class="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
                            >
                                <icon name="book" class="h-4 w-4" />
                                {{ $t('All Documents') }}
                            </Link>
                        </div>
                    </div>

                    <!-- Draft notice -->
                    <div
                        v-if="draft_restored"
                        class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/15 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
                    >
                        <div class="flex items-center gap-2">
                            <icon name="info" class="h-4 w-4 shrink-0" />
                            {{ $t('An unsent draft was restored.') }}
                        </div>
                        <button type="button" class="font-medium underline hover:no-underline" @click="discardDraft">
                            {{ $t('Discard draft') }}
                        </button>
                    </div>

                    <!-- Stepper -->
                    <div
                        class="mt-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-3 shadow-sm sm:p-4"
                    >
                        <ol class="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <li v-for="(item, index) in steps" :key="item.key" class="flex flex-1 items-center gap-3">
                                <button
                                    type="button"
                                    class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-left transition"
                                    :class="
                                        step === index
                                            ? 'bg-indigo-50 dark:bg-indigo-500/15 ring-1 ring-indigo-200'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                    "
                                    @click="goToStep(index)"
                                >
                                    <span
                                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                                        :class="stepBadgeClass(index)"
                                    >
                                        <icon v-if="index < step && stepIsValid(index)" name="check" class="h-4 w-4" />
                                        <template v-else>{{ index + 1 }}</template>
                                    </span>
                                    <span class="min-w-0">
                                        <span
                                            class="block truncate text-sm font-semibold"
                                            :class="
                                                step === index
                                                    ? 'text-indigo-700 dark:text-indigo-300'
                                                    : 'text-gray-700 dark:text-gray-200'
                                            "
                                        >
                                            {{ $t(item.label) }}
                                        </span>
                                        <span class="block truncate text-[11px] text-gray-500 dark:text-gray-400">
                                            {{ $t(item.hint) }}
                                        </span>
                                    </span>
                                </button>
                                <icon
                                    v-if="index < steps.length - 1"
                                    name="chevron-right"
                                    class="hidden h-4 w-4 shrink-0 text-gray-300 sm:block"
                                />
                            </li>
                        </ol>
                    </div>

                    <!-- Raised from an external document: the link is the reason
                         this form was opened, so it is stated before the fields
                         rather than left implicit in a query string. -->
                    <div
                        v-if="parent_document"
                        class="mt-4 flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-500/15 px-4 py-3"
                    >
                        <icon name="file-text" class="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-300" />
                        <p class="min-w-0 flex-1 text-xs text-indigo-800">
                            <span class="font-semibold">{{
                                $t('Raised from :code', { code: parent_document.code || parent_document.title })
                            }}</span>
                            <span class="block truncate text-indigo-600/80">{{
                                $t('That document stays open until this one is finished.')
                            }}</span>
                        </p>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <!-- Form -->
                        <form
                            class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm sm:p-6 xl:col-span-2"
                            @submit.prevent="submit"
                        >
                            <!-- STEP 1 - Document info -->
                            <section v-show="step === 0" class="space-y-5">
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Document Info') }}
                                </h2>

                                <div>
                                    <label class="form-label" for="doc-title">
                                        {{ $t('Title') }} <span class="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="doc-title"
                                        v-model="form.title"
                                        type="text"
                                        maxlength="200"
                                        class="form-input"
                                        :class="{ error: fieldError('title') }"
                                        :placeholder="$t('Subject of the document')"
                                    />
                                    <p class="mt-1 flex justify-between text-xs">
                                        <span class="text-rose-600">{{ fieldError('title') }}</span>
                                        <span class="text-gray-400 dark:text-gray-500"
                                            >{{ form.title.length }}/200</span
                                        >
                                    </p>
                                </div>

                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div v-if="document_types.length">
                                        <label class="form-label">
                                            {{ $t('Document Type') }} <span class="text-rose-500">*</span>
                                        </label>
                                        <select-input
                                            v-model="form.type_id"
                                            :placeholder="$t('Select type')"
                                            :search-placeholder="$t('Search…')"
                                            :error="fieldError('type_id')"
                                        >
                                            <option v-for="type in document_types" :key="type.id" :value="type.id">
                                                {{ type.name }}
                                            </option>
                                        </select-input>
                                    </div>

                                    <div v-if="priorities.length">
                                        <label class="form-label">{{ $t('Priority') }}</label>
                                        <div class="flex flex-wrap gap-2 pt-1">
                                            <button
                                                v-for="priority in priorities"
                                                :key="priority.id"
                                                type="button"
                                                class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                                                :class="
                                                    form.priority_id === priority.id
                                                        ? 'border-transparent text-white shadow-sm'
                                                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                                "
                                                :style="
                                                    form.priority_id === priority.id
                                                        ? { backgroundColor: priority.color || 'var(--accent-fill)' }
                                                        : {}
                                                "
                                                @click="
                                                    form.priority_id =
                                                        form.priority_id === priority.id ? null : priority.id
                                                "
                                            >
                                                <span
                                                    v-if="form.priority_id !== priority.id"
                                                    class="h-2 w-2 rounded-full"
                                                    :style="{ backgroundColor: priority.color || '#9ca3af' }"
                                                ></span>
                                                {{ priority.name }}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Source: department narrows the office list. -->
                                <div v-if="document_sources.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label class="form-label">
                                            {{ $t('Department') }} <span class="text-rose-500">*</span>
                                        </label>
                                        <select-input
                                            v-model="department_id"
                                            :placeholder="$t('Select department')"
                                            :search-placeholder="$t('Search…')"
                                        >
                                            <option v-for="dept in document_sources" :key="dept.id" :value="dept.id">
                                                {{ dept.name }}
                                            </option>
                                        </select-input>
                                    </div>

                                    <div>
                                        <label class="form-label">{{ $t('Sub-office') }}</label>
                                        <select-input
                                            v-model="form.document_source_id"
                                            :disabled="!offices.length"
                                            :placeholder="officePlaceholder"
                                            :search-placeholder="$t('Search…')"
                                            :error="fieldError('document_source_id')"
                                        >
                                            <option v-for="office in offices" :key="office.id" :value="office.id">
                                                {{ office.name }}
                                            </option>
                                        </select-input>
                                    </div>
                                </div>

                                <!-- Filing: the project is picked by hand again, but
                                     the column is not - the watcher on project_id lands
                                     list_id on that board's first open column. -->
                                <div>
                                    <label class="form-label">
                                        {{ $t('Project') }} <span class="text-rose-500">*</span>
                                    </label>
                                    <select-input
                                        v-model="form.project_id"
                                        :placeholder="$t('Select project')"
                                        :search-placeholder="$t('Search projects')"
                                        :error="fieldError('project_id')"
                                    >
                                        <option v-for="project in projects" :key="project.id" :value="project.id">
                                            {{ project.title }}
                                        </option>
                                    </select-input>
                                </div>

                                <!-- Said only when the pick cannot land anywhere, so a
                                     board that cannot take the document explains itself
                                     instead of just blocking the step. -->
                                <p
                                    v-if="!form.project_id || !form.list_id"
                                    class="rounded-xl bg-amber-50 dark:bg-amber-500/15 px-4 py-3 text-sm text-amber-700"
                                >
                                    {{ $t('This workspace has no open board to file a document into yet.') }}
                                </p>
                            </section>

                            <!-- STEP 2 - Dates & routing -->
                            <section v-show="step === 1" class="space-y-5">
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Dates & Routing') }}
                                </h2>

                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label class="form-label">
                                            {{ $t('Entry date') }} <span class="text-rose-500">*</span>
                                        </label>
                                        <DateTimePicker
                                            v-model="form.entry_date"
                                            :placeholder="$t('Select date & time')"
                                        />
                                        <p v-if="fieldError('entry_date')" class="form-error">
                                            {{ fieldError('entry_date') }}
                                        </p>
                                    </div>
                                    <div>
                                        <label class="form-label">{{ $t('Due date') }}</label>
                                        <DateTimePicker
                                            v-model="form.due_date"
                                            :placeholder="$t('Select date & time')"
                                        />
                                        <p v-if="dateError('due_date')" class="form-error">
                                            {{ dateError('due_date') }}
                                        </p>
                                    </div>
                                    <div>
                                        <label class="form-label">{{ $t('Exit date') }}</label>
                                        <DateTimePicker
                                            v-model="form.exit_date"
                                            :placeholder="$t('Select date & time')"
                                        />
                                        <p v-if="dateError('exit_date')" class="form-error">
                                            {{ dateError('exit_date') }}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div class="flex items-center justify-between">
                                        <label class="form-label mb-0">{{ $t('Assign to') }}</label>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ $t(':count selected', { count: form.assignees.length }) }}
                                        </span>
                                    </div>
                                    <div class="mt-2 rounded-xl border border-gray-200 dark:border-white/10">
                                        <!-- Pinned above the search: a document you file is yours by
                                             default, and this is what puts it in My Tasks. -->
                                        <label
                                            class="flex cursor-pointer items-center gap-3 border-b border-gray-100 dark:border-white/10 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5"
                                        >
                                            <input
                                                v-model="assignToMe"
                                                type="checkbox"
                                                class="h-4 w-4 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                                            />
                                            <span
                                                class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
                                            >
                                                <icon name="user" class="h-3.5 w-3.5" />
                                            </span>
                                            <span class="min-w-0">
                                                <span class="flex items-center gap-2">
                                                    <span
                                                        class="truncate text-sm font-medium text-gray-800 dark:text-gray-100"
                                                    >
                                                        {{ $t('Assign this document to me') }}
                                                    </span>
                                                    <!-- The responsibility the document would land on,
                                                         named where the workflow actually carries one. -->
                                                    <span
                                                        v-if="myRoleLabel"
                                                        class="shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300"
                                                    >
                                                        {{ myRoleLabel }}
                                                    </span>
                                                </span>
                                                <span
                                                    v-if="canAssignToMe"
                                                    class="block truncate text-xs text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ $t('Shows it in My Tasks') }}
                                                </span>
                                                <!-- No step in this flow is ever handed to them, so filing
                                                     it to themselves would park it where nothing moves it on. -->
                                                <span v-else class="block truncate text-xs text-amber-600">
                                                    {{ $t('No workflow step reaches you here - pick someone below.') }}
                                                </span>
                                            </span>
                                        </label>

                                        <div class="border-b border-gray-100 dark:border-white/10 p-2">
                                            <div class="relative">
                                                <icon
                                                    name="search"
                                                    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                                />
                                                <input
                                                    v-model="member_search"
                                                    type="text"
                                                    class="form-input pl-9"
                                                    :placeholder="$t('Search people')"
                                                />
                                            </div>
                                        </div>
                                        <!-- The list follows the department/sub-office
                                             picked in step 1; this says so when the
                                             pick reaches nobody and the whole team is
                                             shown instead. -->
                                        <!-- The step this document lands on names who it is
                                             for, so the list is that and nothing else. -->
                                        <p
                                            v-if="membersAreStepDoers"
                                            class="border-b border-gray-100 dark:border-white/10 px-3 py-2 text-xs text-gray-400 dark:text-gray-500"
                                        >
                                            {{ $t('Doers for :step', { step: stepRoleName || selectedList.title }) }}
                                        </p>
                                        <p
                                            v-else-if="stepHasNoDoers"
                                            class="border-b border-gray-100 dark:border-white/10 px-3 py-2 text-xs text-amber-600"
                                        >
                                            {{
                                                $t(
                                                    'Nobody carries :role yet - the step this document lands on has no doer.',
                                                    {
                                                        role: stepRoleName || stepRoleCode,
                                                    }
                                                )
                                            }}
                                        </p>
                                        <p
                                            v-else-if="membersFellBack"
                                            class="border-b border-gray-100 dark:border-white/10 px-3 py-2 text-xs text-amber-600"
                                        >
                                            {{ $t('Nobody is filed under this office yet - showing the whole team.') }}
                                        </p>
                                        <p
                                            v-else-if="membersFromRoles"
                                            class="border-b border-gray-100 dark:border-white/10 px-3 py-2 text-xs text-amber-600"
                                        >
                                            {{
                                                $t(
                                                    'Nobody is on this workspace team yet - showing people by workflow responsibility.'
                                                )
                                            }}
                                        </p>
                                        <p
                                            v-else-if="department_id"
                                            class="border-b border-gray-100 dark:border-white/10 px-3 py-2 text-xs text-gray-400 dark:text-gray-500"
                                        >
                                            {{ $t('People in :source', { source: sourceLabel || departmentLabel }) }}
                                        </p>
                                        <ul class="max-h-56 overflow-y-auto p-1">
                                            <li v-for="member in filteredMembers" :key="member.id">
                                                <label
                                                    class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        class="h-4 w-4 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                                                        :value="member.id"
                                                        v-model="form.assignees"
                                                    />
                                                    <img
                                                        v-if="member.photo"
                                                        :src="member.photo"
                                                        :alt="member.name"
                                                        class="h-7 w-7 rounded-full object-cover"
                                                    />
                                                    <span
                                                        v-else
                                                        class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                                                    >
                                                        {{ member.name.charAt(0) }}
                                                    </span>
                                                    <span class="min-w-0">
                                                        <span
                                                            class="block truncate text-sm text-gray-800 dark:text-gray-100"
                                                        >
                                                            {{ member.name }}
                                                        </span>
                                                        <span
                                                            class="block truncate text-xs text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{ member.email }}
                                                            <span v-if="member.role" class="text-gray-300">·</span>
                                                            <span v-if="member.role">{{ member.role }}</span>
                                                        </span>
                                                    </span>
                                                </label>
                                            </li>
                                            <li
                                                v-if="!filteredMembers.length"
                                                class="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t('No members found') }}
                                            </li>
                                        </ul>
                                    </div>
                                    <p v-if="fieldError('assignees')" class="form-error">
                                        {{ fieldError('assignees') }}
                                    </p>
                                </div>

                                <!-- The external document(s) this one answers. Picking
                                     one here holds it open until this document is
                                     finished, which is why it says so on the label. -->
                                <div v-if="linkable_documents.length">
                                    <div class="flex items-center justify-between">
                                        <label class="form-label mb-0">{{ $t('Answers external document') }}</label>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ $t(':count selected', { count: form.parent_task_ids.length }) }}
                                        </span>
                                    </div>
                                    <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {{ $t('Those documents stay open until this one is finished.') }}
                                    </p>
                                    <div class="mt-2 rounded-xl border border-gray-200 dark:border-white/10">
                                        <div class="border-b border-gray-100 dark:border-white/10 p-2">
                                            <div class="relative">
                                                <icon
                                                    name="search"
                                                    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                                />
                                                <input
                                                    v-model="link_search"
                                                    type="text"
                                                    class="form-input pl-9"
                                                    :placeholder="$t('Search external documents')"
                                                />
                                            </div>
                                        </div>
                                        <ul class="max-h-56 overflow-y-auto p-1">
                                            <li v-for="doc in filteredLinkable" :key="doc.id">
                                                <label
                                                    class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    <input
                                                        v-model="form.parent_task_ids"
                                                        type="checkbox"
                                                        class="h-4 w-4 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                                                        :value="doc.id"
                                                    />
                                                    <icon
                                                        name="file-text"
                                                        class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                                                    />
                                                    <span class="min-w-0">
                                                        <span
                                                            class="block truncate text-sm text-gray-800 dark:text-gray-100"
                                                        >
                                                            {{ doc.code ? doc.code + ' · ' : '' }}{{ doc.title }}
                                                        </span>
                                                        <span
                                                            class="block truncate text-xs text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{
                                                                [doc.workspace, doc.status].filter(Boolean).join(' · ')
                                                            }}
                                                        </span>
                                                    </span>
                                                </label>
                                            </li>
                                            <li
                                                v-if="!filteredLinkable.length"
                                                class="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t('No external documents found') }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <!-- STEP 3 - Content & files -->
                            <section v-show="step === 2" class="space-y-5">
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Content & Files') }}
                                </h2>

                                <div>
                                    <label class="form-label">{{ $t('Description') }}</label>
                                    <CustomEditor
                                        v-model="form.description"
                                        :placeholder="$t('Describe the document...')"
                                        :show-status-bar="false"
                                        :enable-auto-save="false"
                                    />
                                    <p v-if="fieldError('description')" class="form-error">
                                        {{ fieldError('description') }}
                                    </p>
                                </div>

                                <div>
                                    <label class="form-label">{{ $t('Attachments') }}</label>
                                    <div
                                        class="rounded-xl border-2 border-dashed px-4 py-8 text-center transition"
                                        :class="
                                            dragging
                                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/15'
                                                : 'border-gray-200 dark:border-white/10 hover:border-indigo-300'
                                        "
                                        @dragover.prevent="dragging = true"
                                        @dragleave.prevent="dragging = false"
                                        @drop.prevent="onDrop"
                                    >
                                        <icon
                                            name="attachment"
                                            class="mx-auto h-6 w-6 text-gray-400 dark:text-gray-500"
                                        />
                                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {{ $t('Drop PDF files here, or') }}
                                            <button
                                                type="button"
                                                class="font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
                                                @click="$refs.fileInput.click()"
                                            >
                                                {{ $t('browse') }}
                                            </button>
                                        </p>
                                        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            {{
                                                $t('PDF only, up to :size MB each, :count files max', {
                                                    size: limits.max_file_mb,
                                                    count: limits.max_files,
                                                })
                                            }}
                                        </p>
                                        <input
                                            ref="fileInput"
                                            type="file"
                                            class="hidden"
                                            multiple
                                            accept="application/pdf,.pdf"
                                            @change="onFilePick"
                                        />
                                    </div>

                                    <p v-if="file_error" class="form-error">{{ file_error }}</p>
                                    <p v-if="fileServerError" class="form-error">{{ fileServerError }}</p>

                                    <ul v-if="form.files.length" class="mt-3 space-y-2">
                                        <li
                                            v-for="(file, index) in form.files"
                                            :key="index"
                                            class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2"
                                        >
                                            <icon name="file-pdf" class="h-5 w-5 shrink-0 text-rose-500" />
                                            <span class="min-w-0 flex-1">
                                                <span class="block truncate text-sm text-gray-800 dark:text-gray-100">{{
                                                    file.name
                                                }}</span>
                                                <span class="block text-xs text-gray-400 dark:text-gray-500">{{
                                                    fileSize(file.size)
                                                }}</span>
                                            </span>
                                            <button
                                                type="button"
                                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                                                :aria-label="$t('Remove')"
                                                @click="removeFile(index)"
                                            >
                                                <icon name="trash" class="h-4 w-4" />
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <!-- Actions -->
                            <div
                                class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-white/10 pt-4"
                            >
                                <div class="flex items-center gap-2">
                                    <button
                                        type="button"
                                        class="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        @click="saveDraft(true)"
                                    >
                                        {{ draft_saved ? $t('Draft saved') : $t('Save draft') }}
                                    </button>
                                    <button
                                        v-if="step > 0"
                                        type="button"
                                        class="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        @click="step--"
                                    >
                                        {{ $t('Back') }}
                                    </button>
                                </div>

                                <div class="flex items-center gap-2">
                                    <button
                                        v-if="step < steps.length - 1"
                                        type="button"
                                        class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                                        @click="next"
                                    >
                                        {{ $t('Next') }}
                                    </button>
                                    <button
                                        v-else
                                        type="submit"
                                        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        :disabled="form.processing || !allStepsValid"
                                    >
                                        <icon v-if="form.processing" name="spinner" class="h-4 w-4 animate-spin" />
                                        <icon v-else name="send" class="h-4 w-4" />
                                        {{ form.processing ? $t('Submitting...') : $t('Review & submit') }}
                                    </button>
                                </div>
                            </div>

                            <p v-if="show_blocking_hint" class="mt-3 text-right text-xs text-rose-600">
                                {{ $t('Fill in the required fields on every step before submitting.') }}
                            </p>
                        </form>

                        <!-- Live summary -->
                        <aside class="xl:col-span-1">
                            <div
                                class="sticky top-4 rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm"
                            >
                                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ $t('Summary') }}</h3>
                                <dl class="mt-3 space-y-3">
                                    <div v-for="row in summaryRows" :key="row.label">
                                        <dt
                                            class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                        >
                                            {{ $t(row.label) }}
                                        </dt>
                                        <dd
                                            class="mt-0.5 break-words text-sm"
                                            :class="row.value ? 'text-gray-800 dark:text-gray-100' : 'text-gray-300'"
                                        >
                                            {{ row.value || $t('Not set') }}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>

        <!-- Final review. Submit opens this instead of posting: the document is
             read once more whole - the PDF beside the fields it will be filed
             under - and only Save files it. Editing happens back in the form,
             so nothing here is a second copy of a field that can drift. -->
        <Teleport to="body">
            <transition name="review-fade">
                <div
                    v-if="preview_open"
                    class="fixed inset-0 z-[10050] flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
                    @click.self="closePreview"
                >
                    <div
                        class="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-[#262932] shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        :aria-label="$t('Review before saving')"
                    >
                        <div
                            class="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 px-5 py-4"
                        >
                            <div>
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Review before saving') }}
                                </h2>
                                <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                    {{ $t('Nothing is filed until you save.') }}
                                </p>
                            </div>
                            <button
                                type="button"
                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-300"
                                :aria-label="$t('Close')"
                                @click="closePreview"
                            >
                                <icon name="close" class="h-4 w-4" />
                            </button>
                        </div>

                        <div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-5">
                            <!-- The document itself -->
                            <div
                                class="flex min-h-0 flex-col border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 lg:col-span-3 lg:border-b-0 lg:border-r"
                            >
                                <div class="mb-3 flex flex-wrap items-center gap-2">
                                    <span
                                        class="rounded-lg bg-white dark:bg-[#262932] px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 ring-1 ring-gray-200"
                                    >
                                        {{ attachmentModeLabel }}
                                    </span>
                                    <p v-if="attachmentNote" class="text-xs text-rose-600">{{ attachmentNote }}</p>
                                </div>

                                <div
                                    v-if="preview_urls.length"
                                    class="min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262932]"
                                >
                                    <iframe
                                        :src="preview_urls[preview_index]"
                                        class="h-full min-h-[45vh] w-full"
                                        :title="activeFileName"
                                    ></iframe>
                                </div>
                                <div
                                    v-else
                                    class="flex min-h-[45vh] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#262932] text-center"
                                >
                                    <icon name="file-pdf" class="h-7 w-7 text-gray-300" />
                                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {{ $t('No document attached') }}
                                    </p>
                                    <button
                                        type="button"
                                        class="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
                                        @click="editFrom(2)"
                                    >
                                        {{ $t('Attach one') }}
                                    </button>
                                </div>

                                <!-- A dynamic step carries several files; the tabs
                                     are what makes each of them readable here. -->
                                <ul v-if="form.files.length > 1" class="mt-3 flex flex-wrap gap-2">
                                    <li v-for="(file, index) in form.files" :key="index">
                                        <button
                                            type="button"
                                            class="flex max-w-[16rem] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs"
                                            :class="
                                                index === preview_index
                                                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#262932] text-gray-600 dark:text-gray-300 hover:border-indigo-200'
                                            "
                                            @click="preview_index = index"
                                        >
                                            <icon name="file-pdf" class="h-3.5 w-3.5 shrink-0 text-rose-500" />
                                            <span class="truncate">{{ file.name }}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <!-- What it will be filed as -->
                            <div class="min-h-0 overflow-y-auto p-5 lg:col-span-2">
                                <div v-for="section in reviewSections" :key="section.step" class="mb-6 last:mb-0">
                                    <div class="flex items-center justify-between gap-3">
                                        <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {{ $t(section.label) }}
                                        </h3>
                                        <button
                                            type="button"
                                            class="text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
                                            @click="editFrom(section.step)"
                                        >
                                            {{ $t('Edit') }}
                                        </button>
                                    </div>
                                    <dl class="mt-2 space-y-2.5">
                                        <div v-for="row in section.rows" :key="row.label">
                                            <dt
                                                class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t(row.label) }}
                                            </dt>
                                            <dd
                                                v-if="row.html && row.value"
                                                class="mt-0.5 break-words text-sm text-gray-800 dark:text-gray-100"
                                                v-html="row.value"
                                            ></dd>
                                            <dd
                                                v-else
                                                class="mt-0.5 break-words text-sm"
                                                :class="
                                                    row.value ? 'text-gray-800 dark:text-gray-100' : 'text-gray-300'
                                                "
                                            >
                                                {{ row.value || $t('Not set') }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 px-5 py-4"
                        >
                            <button
                                type="button"
                                class="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                @click="closePreview"
                            >
                                {{ $t('Back to editing') }}
                            </button>
                            <button
                                type="button"
                                class="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                :disabled="form.processing"
                                @click="save"
                            >
                                <icon v-if="form.processing" name="spinner" class="h-4 w-4 animate-spin" />
                                <icon v-else name="check" class="h-4 w-4" />
                                {{ form.processing ? $t('Submitting...') : $t('Save & submit') }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import CustomEditor from '@/Shared/Components/CustomEditor.vue';
import SelectInput from '@/Shared/SelectInput.vue';
import DateTimePicker from '@/Shared/Components/DateTimePicker.vue';
import moment from 'moment';

export default {
    metaInfo: { title: 'Submit Document' },
    layout: Layout,
    components: { Head, Link, Icon, CustomEditor, DateTimePicker, SelectInput },
    props: {
        title: String,
        workspace: Object,
        projects: { type: Array, default: () => [] },
        lists: { type: Array, default: () => [] },
        document_sources: { type: Array, default: () => [] },
        document_types: { type: Array, default: () => [] },
        priorities: { type: Array, default: () => [] },
        team_members: { type: Array, default: () => [] },
        // People filed under a department/sub-office, offered once one is
        // picked - they are rarely members of this workspace themselves.
        source_members: { type: Array, default: () => [] },
        // People the workspace's workflow steps reach through the
        // responsibility they carry, offered when neither list above has
        // anybody to show.
        role_members: { type: Array, default: () => [] },
        // The filer's own standing: the responsibility they carry, and whether
        // this workspace's workflow names it. The pinned "assign to me" row
        // reads both.
        me: { type: Object, default: () => ({ id: null, role: null, is_doer: false, is_registry: false }) },
        limits: { type: Object, default: () => ({ max_files: 10, max_file_mb: 50 }) },
        // Set when the form was opened from an external document to raise
        // internal work off it. The two are linked on save.
        parent_document: { type: Object, default: null },
        // External documents this one may be filed against, for the picker.
        linkable_documents: { type: Array, default: () => [] },
    },
    data() {
        return {
            step: 0,
            steps: [
                { key: 'info', label: 'Document Info', hint: 'Title, type and source' },
                { key: 'routing', label: 'Dates & Routing', hint: 'Dates, priority and people' },
                { key: 'content', label: 'Content & Files', hint: 'Description and PDFs' },
            ],
            // The parent department is a picker only - the document keeps the
            // sub-office id, exactly as the task modal stores it.
            department_id: null,
            member_search: '',
            // Set once the form has settled. The step's own people are ticked
            // when the column changes, and this keeps that from firing on the
            // column mounted() resolves - a restored draft keeps what it had.
            picker_ready: false,
            link_search: '',
            dragging: false,
            file_error: '',
            draft_restored: false,
            draft_saved: false,
            show_blocking_hint: false,
            // The review popup, and the object URLs the PDF viewer inside it
            // reads. They are made when it opens and revoked when it closes -
            // a File has no address of its own for an iframe to load.
            preview_open: false,
            preview_index: 0,
            preview_urls: [],
            form: useForm({
                title: '',
                project_id: null,
                list_id: null,
                type_id: null,
                document_source_id: null,
                priority_id: null,
                entry_date: null,
                due_date: null,
                exit_date: null,
                description: '',
                assignees: [],
                files: [],
                parent_task_ids: [],
            }),
        };
    },
    computed: {
        draftKey() {
            // A document raised from an external one keeps its own draft, so it
            // cannot pick up - or clobber - the blank form's saved draft.
            const parent = this.parent_document ? '.from-' + this.parent_document.id : '';
            return 'edoc.document-draft.' + this.workspace.id + parent;
        },
        projectLists() {
            if (!this.form.project_id) return [];
            return this.lists.filter((list) => Number(list.project_id) === Number(this.form.project_id));
        },
        offices() {
            const dept = this.document_sources.find((d) => Number(d.id) === Number(this.department_id));
            return dept ? dept.children || [] : [];
        },
        /**
         * A disabled dependent select has nothing to show, so its placeholder is
         * where it says why - which of the two reasons applies.
         */
        officePlaceholder() {
            if (!this.department_id) return this.$t('Select a department first');
            if (!this.offices.length) return this.$t('No sub-office in this department');
            return this.$t('Select sub-office');
        },
        currentUserId() {
            return this.$page.props.auth?.user?.id ?? null;
        },
        /** Reads and writes the same form.assignees the list below it uses. */
        assignToMe: {
            get() {
                return this.form.assignees.includes(this.currentUserId);
            },
            set(value) {
                if (value) {
                    if (!this.form.assignees.includes(this.currentUserId)) {
                        this.form.assignees.push(this.currentUserId);
                    }
                    return;
                }
                this.form.assignees = this.form.assignees.filter((id) => id !== this.currentUserId);
            },
        },
        filteredLinkable() {
            const query = this.link_search.trim().toLowerCase();
            if (!query) return this.linkable_documents;
            return this.linkable_documents.filter((doc) =>
                [doc.code, doc.title, doc.workspace, doc.status]
                    .filter(Boolean)
                    .some((field) => String(field).toLowerCase().includes(query))
            );
        },
        /** The workspace's own people, minus the pinned "me" row. */
        workspaceMembers() {
            return this.team_members.filter((member) => member.id !== this.currentUserId);
        },
        /**
         * Everyone the department/sub-office pick reaches: whoever is filed
         * under it, from either list. Empty until a department is picked.
         */
        sourceMatches() {
            if (!this.department_id) return [];

            const seen = new Set();

            return [...this.workspaceMembers, ...this.source_members]
                .filter((member) => member.id !== this.currentUserId)
                .filter((member) => {
                    if (seen.has(member.id) || !this.sitsInPick(member)) return false;
                    seen.add(member.id);
                    return true;
                });
        },
        /**
         * The responsibility the step this document lands on is handed to,
         * where it names one. The column itself is selectedList, below.
         */
        stepRoleCode() {
            return this.selectedList ? this.selectedList.responsible_role || null : null;
        },
        stepRoleName() {
            return this.selectedList ? this.selectedList.responsible_role_name || '' : '';
        },
        /** Every person the form knows of, from all three pools, listed once. */
        knownMembers() {
            const seen = new Set();

            return [...this.workspaceMembers, ...this.source_members, ...this.roleMembers]
                .filter((member) => member.id !== this.currentUserId)
                .filter((member) => {
                    if (seen.has(member.id)) return false;
                    seen.add(member.id);
                    return true;
                });
        },
        /**
         * The people the step this document lands on is actually handed to.
         *
         * Anyone else is dropped rather than offered: the picker's whole job is
         * to name the next doer, and a person no step reaches would hold a
         * document nothing moves on. A step naming a group means all of it,
         * the same rule the forward itself falls back on.
         */
        stepDoers() {
            if (!this.stepRoleCode) return [];

            return this.knownMembers.filter(
                (member) => member.role_code === this.stepRoleCode || member.role_parent_code === this.stepRoleCode
            );
        },
        /** Does the filer carry the responsibility this step is handed to? */
        meIsStepDoer() {
            if (!this.stepRoleCode) return Boolean(this.me.is_doer);

            return this.me.role_code === this.stepRoleCode || this.me.role_parent_code === this.stepRoleCode;
        },
        /**
         * May the filer put this document on their own plate?
         *
         * The landing step's own people - and the registry office whatever the
         * step says. Every document passes through the registry on the way in
         * and on the way out, so one it has just filed sitting on its own list
         * is the ordinary case, not a document parked where nothing reaches it.
         */
        canAssignToMe() {
            return Boolean(this.me.is_registry) || this.meIsStepDoer;
        },
        /** The filer's own responsibility, named on the pinned row when they carry one. */
        myRoleLabel() {
            return this.me && this.me.role ? this.me.role : '';
        },
        /** People reached by workflow responsibility, minus the pinned "me" row. */
        roleMembers() {
            return this.role_members.filter((member) => member.id !== this.currentUserId);
        },
        /**
         * The list the picker offers.
         *
         * Where the step this document lands on names a responsibility, that
         * settles it: the people carrying it, and nobody else. Only where the
         * step names none does the older order apply - whoever the
         * department/sub-office reaches, else the workspace's own team, else
         * whoever the workflow reaches by responsibility - each tier skipped
         * when empty, so filing is never blocked by a directory that is not
         * filled in yet.
         */
        assignableMembers() {
            // A step that names its own responsibility settles the question:
            // those people, and nobody else. An empty result is the honest
            // answer - the step has nobody to hand the document to yet - and
            // showing unrelated people in its place would only hide that.
            if (this.stepRoleCode) {
                const narrowed = this.stepDoers.filter((member) => this.sitsInPick(member));

                return this.department_id && narrowed.length ? narrowed : this.stepDoers;
            }

            if (this.sourceMatches.length) return this.sourceMatches;
            if (this.workspaceMembers.length) return this.workspaceMembers;
            return this.roleMembers;
        },
        /** Said under the search box: the list is not the one that was asked for. */
        membersFellBack() {
            if (this.stepRoleCode) return false;

            return Boolean(this.department_id) && !this.sourceMatches.length && this.workspaceMembers.length > 0;
        },
        /** Said in its place when the fallback went all the way to responsibilities. */
        membersFromRoles() {
            if (this.stepRoleCode) return false;

            return !this.sourceMatches.length && !this.workspaceMembers.length && this.roleMembers.length > 0;
        },
        /** The step names a responsibility, and somebody carries it. */
        membersAreStepDoers() {
            return Boolean(this.stepRoleCode) && this.stepDoers.length > 0;
        },
        /** The step names a responsibility nobody carries - so nobody is offered. */
        stepHasNoDoers() {
            return Boolean(this.stepRoleCode) && !this.stepDoers.length;
        },
        filteredMembers() {
            const query = this.member_search.trim().toLowerCase();
            const members = this.assignableMembers;
            if (!query) return members;
            return members.filter(
                (member) =>
                    (member.name || '').toLowerCase().includes(query) ||
                    (member.email || '').toLowerCase().includes(query) ||
                    (member.role || '').toLowerCase().includes(query)
            );
        },
        /**
         * Type and source are required here but stay optional server-side: an
         * installation that has not seeded its taxonomy yet must still be able
         * to file a document, so the rule is "required when there is something
         * to pick".
         */
        allStepsValid() {
            return this.steps.every((item, index) => this.stepIsValid(index));
        },
        fileServerError() {
            const key = Object.keys(this.form.errors).find((k) => k.startsWith('files'));
            return key ? this.form.errors[key] : '';
        },
        summaryRows() {
            return [
                { label: 'Title', value: this.form.title },
                { label: 'Document Type', value: this.nameOf(this.document_types, this.form.type_id) },
                // Only the workspaces that route by department carry a source,
                // so elsewhere the row would always read "not set".
                ...(this.document_sources.length ? [{ label: 'Source', value: this.sourceLabel }] : []),
                { label: 'Entry date', value: this.formatDate(this.form.entry_date) },
                { label: 'Due date', value: this.formatDate(this.form.due_date) },
                { label: 'Exit date', value: this.formatDate(this.form.exit_date) },
                { label: 'Priority', value: this.nameOf(this.priorities, this.form.priority_id) },
                {
                    label: 'Assign to',
                    value: this.form.assignees.length
                        ? this.$t(':count assignee(s)', { count: this.form.assignees.length })
                        : '',
                },
                {
                    label: 'Attachments',
                    value: this.form.files.length ? this.$t(':count files', { count: this.form.files.length }) : '',
                },
            ];
        },
        /** The board column the document is being filed into. */
        selectedList() {
            return this.lists.find((list) => Number(list.id) === Number(this.form.list_id)) || null;
        },
        /**
         * What the column expects of the document: null when the step asks for
         * none, 'standard' when it always carries the same one document, and
         * 'dynamic' when it carries whatever the case produced. Configured on
         * Settings -> Workflow Roles and sent with each column.
         */
        attachmentMode() {
            return this.selectedList ? this.selectedList.attachment_mode || null : null;
        },
        attachmentModeLabel() {
            if (this.attachmentMode === 'dynamic') return this.$t('This step takes the documents the case produces');
            if (this.attachmentMode === 'standard') return this.$t('This step takes one document');
            return this.$t('This step asks for no document');
        },
        /** Said in red beside the label, where what is attached does not fit it. */
        attachmentNote() {
            if (this.attachmentMode && !this.form.files.length) {
                return this.$t('This step expects a document, and none is attached.');
            }
            if (this.attachmentMode === 'standard' && this.form.files.length > 1) {
                return this.$t('This step holds one document, but :count are attached.', {
                    count: this.form.files.length,
                });
            }
            return '';
        },
        activeFileName() {
            const file = this.form.files[this.preview_index];
            return file ? file.name : '';
        },
        assigneeNames() {
            const pool = [...this.team_members, ...this.source_members, ...this.role_members];
            return this.form.assignees
                .map((id) => (pool.find((member) => Number(member.id) === Number(id)) || {}).name)
                .filter(Boolean)
                .join(', ');
        },
        linkedTitles() {
            const pool = this.parent_document
                ? [...this.linkable_documents, this.parent_document]
                : this.linkable_documents;
            return this.form.parent_task_ids
                .map((id) => (pool.find((doc) => Number(doc.id) === Number(id)) || {}).title)
                .filter(Boolean)
                .join(', ');
        },
        fileSummary() {
            return this.form.files.map((file) => file.name + ' (' + this.fileSize(file.size) + ')').join(', ');
        },
        /**
         * The review, grouped the way the form is. Each section carries the step
         * that owns it, so Edit reopens the document where the field lives
         * rather than making the popup a second form.
         */
        reviewSections() {
            return [
                {
                    step: 0,
                    label: 'Document Info',
                    rows: [
                        { label: 'Title', value: this.form.title },
                        { label: 'Document Type', value: this.nameOf(this.document_types, this.form.type_id) },
                        ...(this.document_sources.length ? [{ label: 'Source', value: this.sourceLabel }] : []),
                        { label: 'Status', value: this.selectedList ? this.selectedList.title : '' },
                    ],
                },
                {
                    step: 1,
                    label: 'Dates & Routing',
                    rows: [
                        { label: 'Entry date', value: this.formatDate(this.form.entry_date) },
                        { label: 'Due date', value: this.formatDate(this.form.due_date) },
                        { label: 'Exit date', value: this.formatDate(this.form.exit_date) },
                        { label: 'Priority', value: this.nameOf(this.priorities, this.form.priority_id) },
                        { label: 'Assign to', value: this.assigneeNames },
                        ...(this.form.parent_task_ids.length
                            ? [{ label: 'Linked documents', value: this.linkedTitles }]
                            : []),
                    ],
                },
                {
                    step: 2,
                    label: 'Content & Files',
                    rows: [
                        { label: 'Description', value: this.form.description, html: true },
                        { label: 'Attachments', value: this.fileSummary },
                    ],
                },
            ];
        },
        /** The department on its own, for when no sub-office is picked yet. */
        departmentLabel() {
            const dept = this.document_sources.find((item) => Number(item.id) === Number(this.department_id));
            return dept ? dept.name : '';
        },
        sourceLabel() {
            if (!this.form.document_source_id) return '';
            for (const dept of this.document_sources) {
                if (Number(dept.id) === Number(this.form.document_source_id)) return dept.name;
                const office = (dept.children || []).find(
                    (child) => Number(child.id) === Number(this.form.document_source_id)
                );
                if (office) return dept.name + ' / ' + office.name;
            }
            return '';
        },
    },
    watch: {
        form: {
            handler() {
                this.draft_saved = false;
                this.saveDraft(false);
            },
            deep: true,
        },
        /**
         * SelectInput emits update:modelValue only, so the dependent fields are
         * kept in step here rather than on a @change handler.
         *
         * Both clear the child only when it no longer belongs to the new parent.
         * Clearing unconditionally would have wiped a restored draft: mounted()
         * sets the parent, and the watcher fired straight after it.
         */
        department_id(value) {
            const belongs =
                this.offices.some((office) => Number(office.id) === Number(this.form.document_source_id)) ||
                // A department with no sub-office is the source itself, or step
                // one could never be completed for a flat department.
                (!this.offices.length && Number(this.form.document_source_id) === Number(value));

            if (belongs) return;

            this.form.document_source_id = this.offices.length ? null : value;
        },
        'form.project_id'() {
            const lists = this.projectLists;

            if (lists.some((list) => Number(list.id) === Number(this.form.list_id))) return;

            this.form.list_id = lists.length ? lists[0].id : null;
        },
        /**
         * Changing the column changes who the document is for, so picks the new
         * step is not handed to are dropped rather than carried over. Leaving
         * them would file the document to people that step never reaches, which
         * is exactly what the picker exists to prevent.
         *
         * Only where the step names a responsibility - a flow that names none
         * has nothing to judge a pick against, and the picks stand.
         */
        'form.list_id'() {
            if (!this.stepRoleCode) return;

            const doers = new Set(this.stepDoers.map((member) => member.id));

            this.form.assignees = this.form.assignees.filter((id) =>
                id === this.currentUserId ? this.canAssignToMe : doers.has(id)
            );

            // Not on the column mounted() resolves: a restored draft keeps
            // whatever it was saved with, which is what picker_ready guards.
            if (this.picker_ready) this.tickStepDoers();
        },
    },
    mounted() {
        const hadDraft = this.restoreDraft();

        // The link itself is never left to a draft - it is what the page was
        // opened for. The title is only suggested, so a restored draft keeps
        // whatever was typed.
        if (this.parent_document) {
            if (!this.form.parent_task_ids.includes(this.parent_document.id)) {
                this.form.parent_task_ids.push(this.parent_document.id);
            }

            if (!hadDraft && !this.form.title) {
                this.form.title = this.parent_document.title || '';
            }
        }

        if (!this.form.entry_date) {
            this.form.entry_date = new Date();
        }
        // The project/status pair is no longer asked for, so it is resolved
        // here: the workspace's own board, at its first open column. A restored
        // draft keeps what it was filed against, as long as it still exists.
        //
        // Before the default assignee below, not after: that default asks which
        // step the document lands on, and this is what answers it.
        this.resolveBoard();

        // A document you file is yours unless you say otherwise - without this
        // it never reaches My Tasks, which filters on assignee. A restored
        // draft keeps whatever was ticked when it was saved.
        //
        // Not pre-ticked for somebody the landing step is not handed to - the
        // document would sit on their plate with nothing to move it on, so the
        // pick is left to them and the row says why.
        if (!hadDraft && this.currentUserId && this.canAssignToMe) {
            this.assignToMe = true;
        }

        if (!hadDraft) {
            this.tickStepDoers();
        }

        // After the watcher on the column mounted() just resolved has run, so
        // that one does not tick over a restored draft.
        this.$nextTick(() => {
            this.picker_ready = true;
        });

        window.addEventListener('keydown', this.onKeydown);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.onKeydown);
        this.revokePreviewUrls();
    },
    methods: {
        /**
         * Picks the board the document is filed onto. Falls back to the first
         * project only when the draft did not name a usable one - the watcher
         * on project_id then lands list_id on that board's first open column.
         */
        resolveBoard() {
            const known = this.projects.some((project) => Number(project.id) === Number(this.form.project_id));

            if (!known) {
                this.form.project_id = this.projects.length ? this.projects[0].id : null;
            }

            if (!this.projectLists.some((list) => Number(list.id) === Number(this.form.list_id))) {
                this.form.list_id = this.projectLists.length ? this.projectLists[0].id : null;
            }
        },
        /**
         * Tick the people the step this document lands on is handed to.
         *
         * Filing a document is handing it to whoever does the next step, and
         * the workflow already says who that is - so the pick is made rather
         * than merely offered. It mirrors what forwarding does at every later
         * step: assignStepOwners() puts the document on all of the
         * responsibility's holders, not one of them.
         *
         * The filer's own row is left alone either way: it is pinned above the
         * list and has its own rule, the registry exemption included.
         */
        tickStepDoers() {
            if (!this.stepRoleCode) return;

            const mine = this.form.assignees.filter((id) => id === this.currentUserId);

            this.form.assignees = [...mine, ...this.stepDoers.map((member) => member.id)];
        },
        /**
         * Is this person filed under the department - and, once a sub-office is
         * picked, under that office? Someone filed on the department itself is
         * kept either way: they are that department's own staff, not any one
         * office's, so an office pick should not hide them.
         */
        sitsInPick(member) {
            const department = Number(this.department_id);
            const office = Number(member.office_id);
            const inDepartment = Number(member.department_id) === department || office === department;

            if (!inDepartment) return false;
            if (!this.form.document_source_id) return true;

            return office === Number(this.form.document_source_id) || office === department;
        },
        stepIsValid(index) {
            if (index === 0) {
                if (!this.form.title.trim() || !this.form.project_id || !this.form.list_id) return false;
                if (this.document_types.length && !this.form.type_id) return false;
                if (this.document_sources.length && !this.form.document_source_id) return false;
                return true;
            }
            if (index === 1) {
                return !!this.form.entry_date && !this.dateOrderError('due_date') && !this.dateOrderError('exit_date');
            }
            return true;
        },
        stepBadgeClass(index) {
            if (this.step === index) return 'bg-indigo-600 text-white';
            if (this.stepIsValid(index)) return 'bg-emerald-100 text-emerald-700';
            return 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400';
        },
        goToStep(index) {
            // Backwards is always allowed; forwards only over completed steps,
            // so the summary can never describe a half-filled document.
            if (index <= this.step) {
                this.step = index;
                return;
            }
            for (let i = this.step; i < index; i++) {
                if (!this.stepIsValid(i)) {
                    this.step = i;
                    this.show_blocking_hint = true;
                    return;
                }
            }
            this.step = index;
        },
        next() {
            if (!this.stepIsValid(this.step)) {
                this.show_blocking_hint = true;
                return;
            }
            this.show_blocking_hint = false;
            this.step = Math.min(this.step + 1, this.steps.length - 1);
        },
        /**
         * Dates are compared here as well as on the server so the step cannot be
         * left in a state the server will only reject after the upload finishes.
         */
        dateOrderError(field) {
            const value = this.form[field];
            if (!value || !this.form.entry_date) return '';
            if (moment(value).isBefore(moment(this.form.entry_date))) {
                return this.$t('Must be on or after the entry date.');
            }
            return '';
        },
        fieldError(field) {
            return this.form.errors[field] || '';
        },
        /** Server rejection first, then the local ordering check. */
        dateError(field) {
            return this.fieldError(field) || this.dateOrderError(field);
        },
        onFilePick(event) {
            this.addFiles(Array.from(event.target.files || []));
            event.target.value = '';
        },
        onDrop(event) {
            this.dragging = false;
            this.addFiles(Array.from(event.dataTransfer.files || []));
        },
        addFiles(incoming) {
            this.file_error = '';
            const maxBytes = this.limits.max_file_mb * 1024 * 1024;

            for (const file of incoming) {
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

                if (!isPdf) {
                    this.file_error = this.$t('Only PDF files are allowed.');
                    continue;
                }
                if (file.size > maxBytes) {
                    this.file_error = this.$t('":name" is larger than :size MB.', {
                        name: file.name,
                        size: this.limits.max_file_mb,
                    });
                    continue;
                }
                if (this.form.files.length >= this.limits.max_files) {
                    this.file_error = this.$t('You can attach at most :count files.', {
                        count: this.limits.max_files,
                    });
                    break;
                }
                const duplicate = this.form.files.some((f) => f.name === file.name && f.size === file.size);
                if (!duplicate) {
                    this.form.files.push(file);
                }
            }
        },
        removeFile(index) {
            this.form.files.splice(index, 1);
            this.file_error = '';
        },
        fileSize(bytes) {
            if (!bytes) return '0 KB';
            if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },
        nameOf(collection, id) {
            const found = collection.find((item) => Number(item.id) === Number(id));
            return found ? found.name : '';
        },
        formatDate(value) {
            if (!value) return '';
            const parsed = moment(value);
            return parsed.isValid() ? parsed.format('MMM D, YYYY HH:mm') : '';
        },
        dateForSave(value) {
            if (!value) return null;
            const parsed = moment(value);
            return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : null;
        },
        /**
         * Drafts hold the typed fields only - File objects cannot survive
         * localStorage, so attachments are always re-picked.
         */
        saveDraft(explicit) {
            try {
                window.localStorage.setItem(
                    this.draftKey,
                    JSON.stringify({
                        title: this.form.title,
                        project_id: this.form.project_id,
                        list_id: this.form.list_id,
                        type_id: this.form.type_id,
                        document_source_id: this.form.document_source_id,
                        department_id: this.department_id,
                        priority_id: this.form.priority_id,
                        entry_date: this.dateForSave(this.form.entry_date),
                        due_date: this.dateForSave(this.form.due_date),
                        exit_date: this.dateForSave(this.form.exit_date),
                        description: this.form.description,
                        assignees: this.form.assignees,
                        parent_task_ids: this.form.parent_task_ids,
                    })
                );
                if (explicit) {
                    this.draft_saved = true;
                }
            } catch (error) {
                // A full or disabled localStorage must not block the submission.
            }
        },
        restoreDraft() {
            let draft = null;
            try {
                draft = JSON.parse(window.localStorage.getItem(this.draftKey) || 'null');
            } catch (error) {
                draft = null;
            }
            if (!draft) return false;

            this.form.title = draft.title || '';
            this.form.project_id = draft.project_id || null;
            this.form.list_id = draft.list_id || null;
            this.form.type_id = draft.type_id || null;
            this.form.document_source_id = draft.document_source_id || null;
            this.department_id = draft.department_id || null;
            this.form.priority_id = draft.priority_id || null;
            this.form.entry_date = draft.entry_date ? new Date(draft.entry_date.replace(' ', 'T')) : null;
            this.form.due_date = draft.due_date ? new Date(draft.due_date.replace(' ', 'T')) : null;
            this.form.exit_date = draft.exit_date ? new Date(draft.exit_date.replace(' ', 'T')) : null;
            this.form.description = draft.description || '';
            this.form.assignees = Array.isArray(draft.assignees) ? draft.assignees : [];
            this.form.parent_task_ids = Array.isArray(draft.parent_task_ids) ? draft.parent_task_ids : [];

            this.draft_restored = !!draft.title || !!draft.description;

            return true;
        },
        discardDraft() {
            try {
                window.localStorage.removeItem(this.draftKey);
            } catch (error) {
                // Nothing to clean up.
            }
            this.form.reset();
            this.department_id = null;
            this.form.entry_date = new Date();
            this.resolveBoard();
            if (this.currentUserId && this.canAssignToMe) this.assignToMe = true;
            this.tickStepDoers();
            this.draft_restored = false;
            this.step = 0;
        },
        /**
         * Submitting no longer files the document - it opens the review. The
         * form is only posted from there, by save().
         */
        submit() {
            if (!this.allStepsValid) {
                this.show_blocking_hint = true;
                const firstBad = this.steps.findIndex((item, index) => !this.stepIsValid(index));
                if (firstBad !== -1) this.step = firstBad;
                return;
            }

            this.show_blocking_hint = false;
            this.openPreview();
        },
        onKeydown(event) {
            if (event.key === 'Escape' && this.preview_open) this.closePreview();
        },
        openPreview() {
            this.revokePreviewUrls();
            this.preview_urls = this.form.files.map((file) => URL.createObjectURL(file));
            this.preview_index = 0;
            this.preview_open = true;
        },
        closePreview() {
            this.preview_open = false;
            this.revokePreviewUrls();
        },
        /**
         * The popup holds the only reference to these URLs, so they are dropped
         * with it - left behind, each one pins its PDF in memory for the life of
         * the tab.
         */
        revokePreviewUrls() {
            this.preview_urls.forEach((url) => URL.revokeObjectURL(url));
            this.preview_urls = [];
        },
        /** Edit goes back to the form, at the step that owns the field. */
        editFrom(step) {
            this.closePreview();
            this.step = step;
        },
        save() {
            this.form
                .transform((data) => ({
                    ...data,
                    entry_date: this.dateForSave(data.entry_date),
                    due_date: this.dateForSave(data.due_date),
                    exit_date: this.dateForSave(data.exit_date),
                }))
                .post(this.route('workspace.documents.submit.store', this.workspace.slug || this.workspace.id), {
                    forceFormData: true,
                    onSuccess: () => {
                        this.closePreview();

                        try {
                            window.localStorage.removeItem(this.draftKey);
                        } catch (error) {
                            // Nothing to clean up.
                        }
                    },
                    onError: () => {
                        // Server-side failures point back at the step that owns
                        // them, which means leaving the review to get there.
                        this.closePreview();
                        const errors = Object.keys(this.form.errors);
                        const stepOne = ['title', 'project_id', 'list_id', 'type_id', 'document_source_id'];
                        const stepTwo = ['entry_date', 'due_date', 'exit_date', 'assignees'];
                        if (errors.some((key) => stepOne.includes(key))) this.step = 0;
                        else if (errors.some((key) => stepTwo.includes(key))) this.step = 1;
                        else this.step = 2;
                    },
                });
        },
    },
};
</script>
