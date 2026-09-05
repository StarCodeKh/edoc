<template>
    <div class="h-full">
        <Head :title="document.code || document.title" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 dark:from-white/5 to-white overflow-y-auto">
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
                                    class="flex items-center gap-2 rounded-xl bg-white dark:bg-[#262932] px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
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
                            <section
                                class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm sm:p-6"
                            >
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Document Info') }}
                                </h2>
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
                                                :style="{
                                                    backgroundColor: document.priority.color || 'var(--accent-fill)',
                                                }"
                                            >
                                                {{ document.priority.name }}
                                            </span>
                                            <span v-else class="text-gray-300">{{ $t('Not set') }}</span>
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            <section
                                class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm sm:p-6"
                            >
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Dates & Routing') }}
                                </h2>
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
                                            class="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 py-1 pl-1 pr-3"
                                        >
                                            <img
                                                v-if="person.photo"
                                                :src="person.photo"
                                                :alt="person.name"
                                                class="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span
                                                v-else
                                                class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
                                            >
                                                {{ person.name.charAt(0) }}
                                            </span>
                                            <span class="text-sm text-gray-700 dark:text-gray-200">{{
                                                person.name
                                            }}</span>
                                        </li>
                                    </ul>
                                    <p v-else class="text-sm text-gray-300">{{ $t('Not set') }}</p>
                                </div>
                            </section>

                            <section
                                class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm sm:p-6"
                            >
                                <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {{ $t('Content & Files') }}
                                </h2>

                                <div class="mt-4">
                                    <div class="form-label mb-1">{{ $t('Description') }}</div>
                                    <div
                                        v-if="document.description"
                                        class="prose prose-sm max-w-none text-gray-700 dark:text-gray-200"
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
                                            v-if="can.upload"
                                            type="button"
                                            class="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                                            :disabled="uploading"
                                            :title="
                                                replacesOnUpload
                                                    ? $t('This step holds one document — a new file replaces it.')
                                                    : ''
                                            "
                                            @click="$refs.fileInput.click()"
                                        >
                                            <icon
                                                :name="uploading ? 'spinner' : 'plus'"
                                                class="h-3.5 w-3.5"
                                                :class="{ 'animate-spin': uploading }"
                                            />
                                            {{ uploading ? $t('Submitting...') : addLabel }}
                                        </button>
                                        <input
                                            ref="fileInput"
                                            type="file"
                                            class="hidden"
                                            :multiple="!replacesOnUpload"
                                            accept="application/pdf,.pdf"
                                            @change="uploadFiles"
                                        />
                                    </div>

                                    <p v-if="notice" class="form-error">{{ notice }}</p>

                                    <!-- The step itself is the instruction: at a signature
                                         step the file is not just readable, it is waiting to
                                         be signed, and the row says so. -->
                                    <!-- The step is the instruction here too: it either
                                         wants a document from this desk or it does not. -->
                                    <p v-if="stepWantsDocument" class="doc-step-note">
                                        <icon name="attachment" class="h-3.5 w-3.5 shrink-0" />
                                        {{
                                            stepFiles.length
                                                ? $t('This step has filed its document.')
                                                : $t('This step must file its document before it can be sent on.')
                                        }}
                                    </p>

                                    <p
                                        v-if="canSign && attachments.length"
                                        class="mt-2 flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 px-3 py-2 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                    >
                                        <icon name="edit" class="h-3.5 w-3.5 shrink-0" />
                                        {{ $t('This step needs a signature — open the file to draw or type on it.') }}
                                    </p>

                                    <ul v-if="attachments.length" class="mt-2 space-y-2">
                                        <li
                                            v-for="file in attachments"
                                            :key="file.id"
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
                                            <a
                                                v-if="canSign"
                                                :href="annotatorUrl(file)"
                                                target="_blank"
                                                rel="noopener"
                                                class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                                :title="$t('Open the document to sign it')"
                                            >
                                                <icon name="edit" class="h-3.5 w-3.5" />
                                                {{ $t('Sign') }}
                                            </a>
                                            <a
                                                :href="annotatorUrl(file)"
                                                target="_blank"
                                                rel="noopener"
                                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600"
                                                :title="$t('Open')"
                                            >
                                                <icon name="eye" class="h-4 w-4" />
                                            </a>
                                            <button
                                                v-if="can.detach"
                                                type="button"
                                                class="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-rose-50 hover:text-rose-600"
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
                                <div
                                    class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] shadow-sm"
                                >
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
                                                    class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
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
                                                                    ? 'text-gray-400 dark:text-gray-500'
                                                                    : 'text-gray-900 dark:text-gray-100'
                                                            "
                                                        >
                                                            {{ step.title }}
                                                        </div>
                                                        <div
                                                            v-if="step.responsible_role"
                                                            class="text-[11px] text-gray-500 dark:text-gray-400"
                                                        >
                                                            {{ step.responsible_role_name || step.responsible_role }}
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
                                                                class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
                                                            >
                                                                {{ step.actor.name.charAt(0) }}
                                                            </span>
                                                            <span
                                                                class="truncate text-[11px] text-gray-600 dark:text-gray-300"
                                                            >
                                                                {{ step.actor.name }}
                                                            </span>
                                                        </div>
                                                        <div
                                                            v-if="step.entered_at"
                                                            class="text-[11px] text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{ formatDate(step.entered_at) }}
                                                        </div>
                                                        <div
                                                            v-else-if="step.state === 'pending'"
                                                            class="mt-1 text-[11px] text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{ $t('Not reached yet') }}
                                                        </div>

                                                        <div class="mt-1.5 flex flex-wrap gap-1">
                                                            <span v-if="step.requires_signature" class="step-chip">
                                                                {{ $t('Signature required') }}
                                                            </span>
                                                            <span v-if="step.requires_attachment" class="step-chip">
                                                                {{
                                                                    step.attachment_mode === 'dynamic'
                                                                        ? $t('Dynamic attachment required')
                                                                        : $t('Standard attachment required')
                                                                }}
                                                            </span>
                                                            <span v-if="step.is_terminal" class="step-chip">
                                                                {{ $t('Final step') }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400 dark:text-gray-500">
                                                {{ $t('This project has no open list') }}
                                            </p>
                                        </template>

                                        <!-- Activity -->
                                        <!-- Merge: the step asks for it, so the tab
                                             is only here for whoever holds that step.
                                             Only documents already linked to this one
                                             can be drawn on. -->
                                        <template v-else-if="active_tab === 'merge'">
                                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                                {{
                                                    $t(
                                                        'Combines the PDFs of the documents chosen below into one file on this document. Each of them keeps its own files.'
                                                    )
                                                }}
                                            </p>

                                            <ul v-if="mergeCandidates.length" class="mt-3 space-y-1">
                                                <li v-for="doc in mergeCandidates" :key="doc.id">
                                                    <label
                                                        class="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                                        :class="{ 'opacity-50': !doc.file_count }"
                                                    >
                                                        <input
                                                            v-model="merge_ids"
                                                            type="checkbox"
                                                            class="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                                                            :value="doc.id"
                                                            :disabled="!doc.file_count"
                                                        />
                                                        <span class="min-w-0 flex-1">
                                                            <span
                                                                class="block truncate text-sm text-gray-800 dark:text-gray-100"
                                                            >
                                                                {{ doc.code ? doc.code + ' · ' : '' }}{{ doc.title }}
                                                            </span>
                                                            <span
                                                                class="block truncate text-xs text-gray-400 dark:text-gray-500"
                                                            >
                                                                {{ doc.status }}
                                                            </span>
                                                        </span>
                                                        <span
                                                            class="shrink-0 text-[11px] font-medium text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{
                                                                doc.file_count
                                                                    ? $t(':count files', { count: doc.file_count })
                                                                    : $t('No PDF')
                                                            }}
                                                        </span>
                                                    </label>
                                                </li>
                                            </ul>
                                            <p v-else class="mt-3 text-sm text-gray-400 dark:text-gray-500">
                                                {{ $t('Nothing is linked to this document yet.') }}
                                            </p>

                                            <div
                                                v-if="mergeCandidates.length"
                                                class="mt-4 border-t border-gray-100 dark:border-white/10 pt-3"
                                            >
                                                <textarea
                                                    v-model="merge_note"
                                                    rows="3"
                                                    class="form-textarea"
                                                    :placeholder="$t('Write a comment...')"
                                                ></textarea>

                                                <button
                                                    type="button"
                                                    class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    :disabled="merging || !merge_ids.length || !mergeFileCount"
                                                    @click="mergeDocuments"
                                                >
                                                    <icon
                                                        :name="merging ? 'spinner' : 'attachment'"
                                                        class="h-4 w-4"
                                                        :class="{ 'animate-spin': merging }"
                                                    />
                                                    {{
                                                        mergeFileCount
                                                            ? $t('Merge :count file(s)', { count: mergeFileCount })
                                                            : $t('Merge documents')
                                                    }}
                                                </button>

                                                <p
                                                    class="mt-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ $t('The merged file is filed here, then sent on as usual.') }}
                                                </p>
                                            </div>
                                        </template>

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
                                                        <p class="text-sm text-gray-800 dark:text-gray-100">
                                                            <span class="font-semibold">
                                                                {{ entry.actor ? entry.actor.name : $t('System') }}
                                                            </span>
                                                            {{ ' ' }}{{ entry.text }}
                                                        </p>
                                                        <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                                            {{ formatDate(entry.at) }}
                                                        </p>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400 dark:text-gray-500">
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
                                                            <span
                                                                class="truncate text-sm font-semibold text-gray-800 dark:text-gray-100"
                                                            >
                                                                {{ note.author ? note.author.name : $t('System') }}
                                                            </span>
                                                            <span
                                                                class="shrink-0 text-[11px] text-gray-400 dark:text-gray-500"
                                                            >
                                                                {{ formatDate(note.at) }}
                                                            </span>
                                                        </div>
                                                        <div
                                                            class="prose prose-sm mt-0.5 max-w-none break-words text-sm text-gray-700 dark:text-gray-200"
                                                            v-html="note.details"
                                                        ></div>
                                                    </div>
                                                </li>
                                            </ol>
                                            <p v-else class="text-sm text-gray-400 dark:text-gray-500">
                                                {{ $t('No comments yet.') }}
                                            </p>

                                            <div
                                                v-if="canForward"
                                                class="mt-4 border-t border-gray-100 dark:border-white/10 pt-3"
                                            >
                                                <textarea
                                                    v-model="new_comment"
                                                    rows="3"
                                                    class="form-textarea"
                                                    :placeholder="$t('Write a comment...')"
                                                ></textarea>

                                                <!-- The next step names a group rather than one
                                                     responsibility, so it cannot be forwarded until
                                                     the department that gets it is named. -->
                                                <div v-if="mustChooseHandTo" class="mt-2">
                                                    <label
                                                        class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                                    >
                                                        {{ $t('Hand to') }}
                                                    </label>
                                                    <!-- Several at once: one document
                                                         commonly goes to D1 through D5
                                                         together. -->
                                                    <filter-select
                                                        v-model="hand_to"
                                                        multiple
                                                        :options="handToOptions"
                                                        :show-all="false"
                                                        :placeholder="$t('Choose a responsibility')"
                                                        :search-placeholder="$t('Search') + '…'"
                                                        :empty-label="$t('No matches')"
                                                        :count-label="$t(':count selected', { count: handToCount })"
                                                        :clear-label="$t('Clear All')"
                                                        icon="users"
                                                        class="w-full filter-select--block"
                                                    />
                                                </div>

                                                <!-- Who it reaches, by name. Forwarding used to name
                                                     only the responsibility, so the button was pressed
                                                     without knowing who would receive the document.
                                                     Left alone this is a statement; opened, it is the
                                                     place to hand it to somebody else. -->
                                                <div v-if="!finishes_here && nextStepPeople.length" class="mt-2">
                                                    <div class="flex items-center justify-between gap-2">
                                                        <span
                                                            class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                                        >
                                                            {{ $t('Goes to') }}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            class="text-[11px] font-medium text-indigo-600 dark:text-indigo-300 hover:underline"
                                                            @click="show_assignees = !show_assignees"
                                                        >
                                                            {{ show_assignees ? $t('Done') : $t('Change') }}
                                                        </button>
                                                    </div>

                                                    <p
                                                        v-if="!show_assignees"
                                                        class="mt-0.5 text-sm text-gray-700 dark:text-gray-200"
                                                    >
                                                        {{ nextStepSummary }}
                                                    </p>

                                                    <ul
                                                        v-else
                                                        class="mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 p-1"
                                                    >
                                                        <li v-for="person in nextStepPeople" :key="person.id">
                                                            <label
                                                                class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    class="h-4 w-4 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                                                                    :value="person.id"
                                                                    v-model="assign_to"
                                                                />
                                                                <span class="min-w-0">
                                                                    <span
                                                                        class="block truncate text-sm text-gray-800 dark:text-gray-100"
                                                                        >{{ person.name }}</span
                                                                    >
                                                                    <span
                                                                        v-if="person.role"
                                                                        class="block truncate text-[11px] text-gray-400 dark:text-gray-500"
                                                                        >{{ person.role }}</span
                                                                    >
                                                                </span>
                                                            </label>
                                                        </li>
                                                    </ul>

                                                    <!-- Ticking nobody is not "send it to nobody": it is
                                                         the default, which is everybody the step reaches. -->
                                                    <p
                                                        v-if="show_assignees"
                                                        class="mt-1 text-[11px] text-gray-400 dark:text-gray-500"
                                                    >
                                                        {{ $t('Tick nobody to send it to everyone listed.') }}
                                                    </p>
                                                </div>

                                                <div class="mt-2">
                                                    <!-- Hands the document to the next board. Anything
                                                         typed above rides along as the note. There is
                                                         no separate save: the box is the note. -->
                                                    <button
                                                        type="button"
                                                        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        :disabled="
                                                            forwarding ||
                                                            links.blocks_forward ||
                                                            needsDocumentFirst ||
                                                            !handToChosen
                                                        "
                                                        :title="
                                                            needsDocumentFirst
                                                                ? $t(
                                                                      'This step must file its document before it can be sent on.'
                                                                  )
                                                                : links.blocks_forward
                                                                  ? $t(
                                                                        'Waiting on the internal document(s) raised from this one.'
                                                                    )
                                                                  : finishes_here
                                                                    ? $t(
                                                                          'This is the last step — finish the document here.'
                                                                      )
                                                                    : $t('Forward to :step', { step: next_step.title })
                                                        "
                                                        @click="forward"
                                                    >
                                                        <icon
                                                            :name="
                                                                forwarding
                                                                    ? 'spinner'
                                                                    : finishes_here
                                                                      ? 'tick_check'
                                                                      : 'send'
                                                            "
                                                            class="h-4 w-4"
                                                            :class="{ 'animate-spin': forwarding }"
                                                        />
                                                        {{ forwardLabel }}
                                                    </button>
                                                </div>

                                                <p
                                                    v-if="needsDocumentFirst"
                                                    class="mt-1.5 text-center text-[11px] font-medium text-amber-600"
                                                >
                                                    {{
                                                        $t(
                                                            'Attach the document this step produces before sending it on.'
                                                        )
                                                    }}
                                                </p>
                                                <p
                                                    v-else-if="!links.blocks_forward && !handToChosen"
                                                    class="mt-1.5 text-center text-[11px] font-medium text-amber-600"
                                                >
                                                    {{ $t('Choose who it goes to first.') }}
                                                </p>
                                                <p
                                                    v-else-if="links.blocks_forward"
                                                    class="mt-1.5 text-center text-[11px] font-medium text-amber-600"
                                                >
                                                    {{
                                                        $t('Waiting on the internal document(s) raised from this one.')
                                                    }}
                                                </p>
                                                <p
                                                    v-else-if="finishes_here"
                                                    class="mt-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ $t('This is the last step — finish the document here.') }}
                                                </p>
                                                <p
                                                    v-else-if="canForward"
                                                    class="mt-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ $t('Next: :step', { step: next_step.title }) }}
                                                    <template v-if="nextStepSummary"> — {{ nextStepSummary }}</template>
                                                    <template v-else-if="next_step.responsible_role_name">
                                                        —
                                                        {{
                                                            $t('nobody carries :role yet', {
                                                                role: next_step.responsible_role_name,
                                                            })
                                                        }}
                                                    </template>
                                                </p>
                                                <p
                                                    v-else
                                                    class="mt-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ $t('This document is already at the last step.') }}
                                                </p>
                                            </div>

                                            <!-- Closed. The note box goes with the button:
                                                 it is only ever posted as the note that
                                                 rides along with the move. -->
                                            <p
                                                v-else-if="document.is_done"
                                                class="mt-4 flex items-center justify-center gap-1.5 border-t border-gray-100 dark:border-white/10 pt-3 text-center text-[11px] font-medium text-emerald-600"
                                            >
                                                <icon name="tick_check" class="h-3.5 w-3.5 shrink-0" />
                                                {{ $t('This document is finished.') }}
                                            </p>
                                        </template>
                                    </div>
                                </div>

                                <!-- The chain either side of this document. An external
                                     document is not finished until every internal one
                                     raised off it is, so both ends need to be visible
                                     from either page. -->
                                <div
                                    v-if="showLinksCard"
                                    class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 shadow-sm"
                                >
                                    <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {{ $t('Linked documents') }}
                                    </h3>

                                    <div v-if="links.parents.length" class="mt-3">
                                        <p
                                            class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                        >
                                            {{ $t('Raised from') }}
                                        </p>
                                        <ul class="mt-1.5 space-y-1.5">
                                            <li v-for="doc in links.parents" :key="'p-' + doc.id">
                                                <a
                                                    :href="linkedHref(doc)"
                                                    class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    <icon
                                                        name="file-text"
                                                        class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                                                    />
                                                    <span class="min-w-0 flex-1">
                                                        <span
                                                            class="block truncate text-xs font-semibold text-gray-800 dark:text-gray-100"
                                                            >{{ doc.code || doc.title }}</span
                                                        >
                                                        <span
                                                            class="block truncate text-[11px] text-gray-400 dark:text-gray-500"
                                                            >{{ doc.status }}</span
                                                        >
                                                    </span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <div v-if="links.children.length" class="mt-3">
                                        <p
                                            class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                        >
                                            {{ $t('Internal documents raised') }}
                                        </p>
                                        <ul class="mt-1.5 space-y-1.5">
                                            <li v-for="doc in links.children" :key="'c-' + doc.id">
                                                <a
                                                    :href="linkedHref(doc)"
                                                    class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    <icon
                                                        name="file-text"
                                                        class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                                                    />
                                                    <span class="min-w-0 flex-1">
                                                        <span
                                                            class="block truncate text-xs font-semibold text-gray-800 dark:text-gray-100"
                                                            >{{ doc.code || doc.title }}</span
                                                        >
                                                        <span
                                                            class="block truncate text-[11px] text-gray-400 dark:text-gray-500"
                                                            >{{ doc.status }}</span
                                                        >
                                                    </span>
                                                    <span
                                                        class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                        :class="
                                                            doc.is_complete
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700'
                                                        "
                                                    >
                                                        {{ doc.is_complete ? $t('Complete') : $t('In progress') }}
                                                    </span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <p
                                        v-if="links.held"
                                        class="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 px-3 py-2 text-[11px] font-medium text-amber-700"
                                    >
                                        <icon name="clock" class="mt-px h-3.5 w-3.5 shrink-0" />
                                        <span>{{
                                            $t('This document stays open until :count internal document(s) finish.', {
                                                count: links.pending_count,
                                            })
                                        }}</span>
                                    </p>

                                    <a
                                        v-if="canRaiseInternal"
                                        :href="raiseInternalHref"
                                        class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
                                    >
                                        <icon name="plus" class="h-4 w-4" />
                                        {{ $t('Create internal document') }}
                                    </a>
                                </div>

                                <div
                                    v-if="document.qr_code"
                                    class="rounded-2xl border border-gray-200/70 bg-white dark:bg-[#262932] p-4 text-center shadow-sm"
                                >
                                    <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {{ $t('Tracking') }}
                                    </h3>
                                    <img :src="document.qr_code" :alt="document.code" class="mx-auto mt-3 h-32 w-32" />
                                    <p
                                        v-if="document.code"
                                        class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400"
                                    >
                                        {{ document.code }}
                                    </p>

                                    <!-- The slip that travels with the paper. -->
                                    <button type="button" class="doc-track" @click="openReceiptModal">
                                        <printer-icon class="doc-track__icon" />
                                        <span class="doc-track__text">
                                            <span class="doc-track__label">{{ $t('Tracking Document') }}</span>
                                            <span class="doc-track__code">{{ document.code }}</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>

        <DocumentReceipt v-if="receiptModalOpen" :task="document.receipt || document" @close="closeReceiptModal" />
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import moment from 'moment';
import axios from 'axios';
import PrinterIcon from '@/Shared/Components/PrinterIcon.vue';
import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';

export default {
    metaInfo: { title: 'Document' },
    layout: Layout,
    components: { Head, Link, Icon, PrinterIcon, DocumentReceipt, FilterSelect },
    props: {
        title: String,
        workspace: Object,
        document: { type: Object, required: true },
        steps: { type: Array, default: () => [] },
        activities: { type: Array, default: () => [] },
        comments: { type: Array, default: () => [] },
        neighbours: { type: Object, default: () => ({ previous: null, next: null, position: 0, total: 0 }) },
        next_step: { type: Object, default: null },
        // The board it sits on is ជំហានចុងក្រោយ: the action closes the document
        // where it stands instead of sending it to another board.
        finishes_here: { type: Boolean, default: false },
        // next_step carries role_mode and hand_to_options: a 'dynamic' step
        // names a group, and the forwarder says which of its members gets it.
        can: { type: Object, default: () => ({ attach: false, forward: false }) },
        links: {
            type: Object,
            default: () => ({
                children: [],
                parents: [],
                held: false,
                pending_count: 0,
                blocks_forward: false,
                internal_workspace_uid: null,
                mergeable: [],
            }),
        },
    },
    data() {
        return {
            // The first tab, and the one with the note box and បញ្ជូនបន្ត in it.
            // ?tab= and the tab remembered across a forward both override this.
            active_tab: 'comments',
            // The printed tracking slip.
            receiptModalOpen: false,
            // Server props are the starting point; both lists grow in place as
            // the page is used, so nothing here waits on a round trip.
            thread: [...this.comments],
            attachments: [...this.document.files],
            new_comment: '',
            uploading: false,
            forwarding: false,
            // Only ever set for a step that names a group; a standard step
            // sends null and the server assigns its role as before.
            hand_to: null,
            // People named outright for the next step. Empty means "whoever the
            // step's responsibility reaches", which is what forwarding has
            // always done; naming anybody narrows it to exactly them.
            assign_to: [],
            show_assignees: false,
            notice: '',
            // The merge tab: which linked documents are ticked, and the note
            // filed with the merge. Kept apart from new_comment so a note typed
            // for a forward is not sent with a merge instead.
            merge_ids: [],
            merge_note: '',
            merging: false,
        };
    },
    computed: {
        /**
         * Comments comes first because it is the only tab you act from - the
         * note box and បញ្ជូនបន្ត both live in it. Opening a document should
         * land on the thing there is to do with it, not on a read-only summary.
         */
        tabs() {
            return [
                { key: 'comments', label: 'Comments', icon: 'comments', count: this.thread.length },
                // Only where the step asks for it and this is the person
                // holding that step - everywhere else the tab is not there to
                // be clicked. See TaskAbility::canMerge.
                ...(this.can.merge
                    ? [
                          {
                              key: 'merge',
                              label: 'Merge documents',
                              icon: 'attachment',
                              count: this.mergeCandidates.length,
                          },
                      ]
                    : []),
                { key: 'summary', label: 'Summary', icon: 'details', count: 0 },
                { key: 'tracking', label: 'Tracking', icon: 'timeline', count: this.steps.length },
                { key: 'activity', label: 'Activity', icon: 'time', count: this.activities.length },
            ];
        },
        /** The documents linked to this one, which is all a merge may draw on. */
        mergeCandidates() {
            return this.links.mergeable || [];
        },
        /** Pages a merge would produce, so the button can say what it will do. */
        mergeFileCount() {
            return this.mergeCandidates
                .filter((doc) => this.merge_ids.includes(doc.id))
                .reduce((total, doc) => total + (doc.file_count || 0), 0);
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
            // A terminal step has no next board and still needs its button.
            return !!(this.can.forward && (this.next_step || this.finishes_here));
        },

        /** Label, icon and hint all follow from which of the two this is. */
        forwardLabel() {
            return this.finishes_here ? this.$t('Finish') : this.$t('Forward');
        },
        /** A dynamic next step that actually has members to choose between. */
        mustChooseHandTo() {
            // Nothing to hand to when the document stops here.
            return !!(
                !this.finishes_here &&
                this.next_step &&
                this.next_step.role_mode === 'dynamic' &&
                (this.next_step.hand_to_options || []).length
            );
        },
        handToChosen() {
            return !this.mustChooseHandTo || this.handToCount > 0;
        },

        /** FilterSelect wants [{ value, label }] and returns them comma-joined. */
        handToOptions() {
            return ((this.next_step && this.next_step.hand_to_options) || []).map((option) => ({
                value: option.code,
                label: option.name,
            }));
        },

        handToCount() {
            return String(this.hand_to || '')
                .split(',')
                .filter(Boolean).length;
        },
        /** The codes chosen on a dynamic step, as a list. */
        handToCodes() {
            return String(this.hand_to || '')
                .split(',')
                .filter(Boolean);
        },
        /**
         * Who the next step reaches, narrowed to the departments chosen where
         * the step is dynamic and one has been. Someone filed on the group
         * itself is kept whatever is chosen - they are the group's own staff.
         */
        nextStepPeople() {
            const people = (this.next_step && this.next_step.people) || [];
            const codes = this.handToCodes;

            if (!this.mustChooseHandTo || !codes.length) return people;

            const groupCode = this.next_step.responsible_role;

            return people.filter((person) => codes.includes(person.role_code) || person.role_code === groupCode);
        },
        /** Named on the panel, so the button says who it is about to reach. */
        nextStepNames() {
            const chosen = this.assign_to.length
                ? this.nextStepPeople.filter((person) => this.assign_to.includes(person.id))
                : this.nextStepPeople;

            return chosen.map((person) => person.name);
        },
        /**
         * The one line under the button. Naming people beats naming a
         * responsibility: "Next: With the department" says nothing about who
         * has to act, and that is the only thing the forwarder needs to check.
         */
        nextStepSummary() {
            const names = this.nextStepNames;

            if (!names.length) return '';
            if (names.length <= 3) return names.join(', ');

            return this.$t(':names and :count more', {
                names: names.slice(0, 3).join(', '),
                count: names.length - 3,
            });
        },
        /**
         * Raising internal work is the administration's move, and only from a
         * document that is not itself internal - a document cannot be raised
         * off one already living in the internal workflow.
         */
        canRaiseInternal() {
            return !!(
                this.can.forward &&
                this.links.internal_workspace_uid &&
                this.links.internal_workspace_uid !== String(this.workspace.slug || this.workspace.id)
            );
        },
        raiseInternalHref() {
            if (!this.links.internal_workspace_uid) return '';
            return (
                this.route('workspace.documents.submit', { uid: this.links.internal_workspace_uid }) +
                '?from=' +
                encodeURIComponent(this.document.slug || this.document.id)
            );
        },
        /** The card is worth drawing only if it has something in it. */
        showLinksCard() {
            return !!(this.links.parents.length || this.links.children.length || this.canRaiseInternal);
        },
        /**
         * The step the document is sitting on, which is the one that decides
         * whether a signature is being asked for.
         */
        currentStep() {
            return this.steps.find((step) => step.state === 'current') || null;
        },
        /**
         * A signature step turns the attachment list into something to act on
         * rather than read. The answer comes from the server now - TaskAbility
         * checks the step and the responsibility together, so the button here
         * and the rule the annotator enforces cannot disagree.
         */
        canSign() {
            return !!this.can.sign;
        },

        /** Where the panel's chosen tab is parked across a forward. */
        tabMemoryKey() {
            return `edoc:doc-tab:${this.document.id}`;
        },

        /** True where the current step is configured to produce a document. */
        stepWantsDocument() {
            return !!(this.currentStep && this.currentStep.requires_attachment);
        },

        /**
         * The files this step filed itself, as opposed to the ones the document
         * arrived carrying. A row from before attachments recorded their board
         * has no list_id and counts as inherited.
         */
        stepFiles() {
            if (!this.document.list_id) return [];

            return this.attachments.filter((file) => file.list_id && file.list_id === this.document.list_id);
        },

        /**
         * The step is configured to produce a document and has not filed one
         * yet. Mirrors the server gate in DocumentSubmissionController::forward,
         * so the button says no for the same reason the server would.
         */
        needsDocumentFirst() {
            return this.stepWantsDocument && !this.stepFiles.length;
        },

        /** A 'standard' step holds one document, so the next upload replaces it. */
        replacesOnUpload() {
            return !!(this.stepWantsDocument && this.currentStep.attachment_mode !== 'dynamic');
        },

        addLabel() {
            return this.replacesOnUpload && this.stepFiles.length ? this.$t('Replace') : this.$t('Add');
        },
        sourceLabel() {
            if (this.document.department && this.document.office) {
                return this.document.department + ' / ' + this.document.office;
            }
            return this.document.office || this.document.department || '';
        },
    },
    mounted() {
        // Forwarding is a full Inertia visit, so this component is rebuilt and
        // active_tab falls back to 'summary' - dropping the reader on Summary
        // right after they wrote a note in Comments and pressed បញ្ជូនបន្ត.
        // The tab it was sent from is parked before the visit and picked up
        // here, so the note they just wrote is the first thing they see.
        // ?tab=comments wins: it is an explicit request from whoever built the
        // link, where the remembered tab is only a convenience.
        const requested = this.requestedTab() || this.readRememberedTab();

        if (requested && this.tabs.some((tab) => tab.key === requested)) {
            this.active_tab = requested;
        }
    },
    watch: {
        /**
         * Choosing a different department changes who the step reaches, so
         * anyone named from the old choice is dropped. Left in, they would be
         * posted as assign_to and receive a document their department was not
         * chosen for.
         */
        hand_to() {
            if (!this.assign_to.length) return;

            const reachable = new Set(this.nextStepPeople.map((person) => person.id));

            this.assign_to = this.assign_to.filter((id) => reachable.has(id));
        },
    },
    methods: {
        /** The tab named in the URL, for links that open the page on one. */
        requestedTab() {
            try {
                return new URL(window.location.href).searchParams.get('tab');
            } catch (error) {
                return null;
            }
        },

        readRememberedTab() {
            try {
                const value = window.sessionStorage.getItem(this.tabMemoryKey);
                window.sessionStorage.removeItem(this.tabMemoryKey);

                return value;
            } catch (error) {
                // Private browsing can refuse sessionStorage; the tab simply is
                // not remembered, which is what happened before this existed.
                return null;
            }
        },

        rememberTab() {
            try {
                window.sessionStorage.setItem(this.tabMemoryKey, this.active_tab);
            } catch (error) {
                // As above - not remembering is an acceptable outcome.
            }
        },

        /**
         * The annotator, not the raw file: it is the viewer for a PDF here, and
         * the only place a signature can be drawn onto one.
         */
        /** A linked document's own page, in whichever workspace it lives. */
        linkedHref(doc) {
            if (!doc.workspace_uid) return '#';
            return this.route('workspace.documents.show', [doc.workspace_uid, doc.uid]);
        },
        openReceiptModal() {
            this.receiptModalOpen = true;
        },
        closeReceiptModal() {
            this.receiptModalOpen = false;
        },
        annotatorUrl(file) {
            return this.route('task.attachment.view', {
                taskUid: this.document.id,
                attachmentId: file.id,
            });
        },
        formatDate(value) {
            if (!value) return '';
            const parsed = moment(value);
            return parsed.isValid() ? parsed.format('MMM D, YYYY HH:mm') : '';
        },
        valueClass(value) {
            return value ? 'text-gray-800 dark:text-gray-100' : 'text-gray-300';
        },
        stepBadgeClass(step) {
            if (step.state === 'current') return 'bg-indigo-600 text-white';
            if (step.state === 'done') return 'bg-emerald-100 text-emerald-700';
            return 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400';
        },
        neighbourHref(neighbour) {
            return this.route('workspace.documents.show', [this.workspace.slug || this.workspace.id, neighbour.uid]);
        },
        forward() {
            if (!this.canForward || this.forwarding || !this.handToChosen) return;
            if (this.needsDocumentFirst) return;

            this.forwarding = true;
            this.rememberTab();

            // A full visit, not axios: the move rewrites the tracker, the trail
            // and the neighbours, so the page is re-fetched rather than patched.
            router.post(
                this.route('workspace.documents.forward', [
                    this.workspace.slug || this.workspace.id,
                    this.document.slug || this.document.id,
                ]),
                {
                    note: this.new_comment.trim() || null,
                    hand_to: this.mustChooseHandTo ? this.hand_to : null,
                    // Sent only where the forwarder actually narrowed it; an
                    // empty list leaves the step's responsibility to answer.
                    assign_to: this.assign_to.length ? this.assign_to : null,
                },
                {
                    onFinish: () => {
                        this.forwarding = false;
                    },
                }
            );
        },
        /**
         * Combine the ticked documents' PDFs into one file on this document.
         *
         * A full visit like forward(): the merged file has to appear in the
         * attachments panel and the act has to appear in the trail, so the page
         * is re-fetched rather than patched.
         */
        mergeDocuments() {
            if (!this.can.merge || this.merging || !this.merge_ids.length || !this.mergeFileCount) return;

            this.merging = true;
            this.rememberTab();

            router.post(
                this.route('workspace.documents.merge', [
                    this.workspace.slug || this.workspace.id,
                    this.document.slug || this.document.id,
                ]),
                { task_ids: this.merge_ids, note: this.merge_note.trim() || null },
                {
                    onFinish: () => {
                        this.merging = false;
                    },
                    onSuccess: () => {
                        this.merge_ids = [];
                        this.merge_note = '';
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
                            // On a 'standard' step the server has just replaced
                            // this step's previous file, so drop it here too
                            // rather than leaving a row pointing at a deleted
                            // file until the next reload.
                            if (this.replacesOnUpload) {
                                const filed = this.stepFiles.map((file) => file.id);
                                this.attachments = this.attachments.filter((file) => !filed.includes(file.id));
                            }

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
/* What the step is asking of this desk, in the same register as the signature
   hint beside it. */
.doc-step-note {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    border-radius: 12px;
    background: #f1f5f9;
    font-size: 12px;
    font-weight: 500;
    color: #475569;
}

/* The tracking slip button, as it reads on the register too. */
.doc-track {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 12px;
    background: #eef2ff;
    color: var(--accent-ink);
    transition: background-color 0.12s ease;
}
.doc-track:hover {
    background: #e0e7ff;
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
    color: var(--accent-ink);
}

/* Solid fill, matching the active view in the workspace toolbar. */
.doc-tab.is-active {
    background: var(--accent-fill);
    color: #fff;
    box-shadow: 0 1px 3px rgba(79, 70, 229, 0.4);
}

.doc-tab.is-active:hover {
    background: var(--accent-fill-hover);
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
    color: var(--accent-ink);
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
    color: var(--accent-ink);
    font-size: 12px;
    font-weight: 700;
}
</style>
