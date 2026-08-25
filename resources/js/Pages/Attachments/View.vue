<template>
    <Head :title="attachment ? attachment.name : $t('Attachment')" />

    <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
        <!-- ================= Header ================= -->
        <header
            class="flex items-center gap-3 px-3 sm:px-5 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
            <a
                v-if="backUrl"
                :href="backUrl"
                class="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0"
                :title="$t('Back to task')"
            >
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5">
                    <path
                        d="M15 6l-6 6 6 6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </a>

            <span
                class="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-[10px] font-bold tracking-wide text-red-600 dark:text-red-400 flex-shrink-0"
            >
                {{ fileExtension }}
            </span>

            <div class="min-w-0 flex-1">
                <h1 class="truncate text-sm sm:text-base font-bold dark:text-gray-100">
                    {{ attachment ? attachment.name : $t('Loading...') }}
                </h1>
                <p class="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    <span v-if="task && task.title">{{ task.title }}</span>
                    <span v-if="attachment">
                        &middot; {{ moment(attachment.created_at).format('MMM D, YYYY [at] h:mm A') }}</span
                    >
                    <span v-if="attachment && attachment.size"> &middot; {{ formatBytes(attachment.size) }}</span>
                </p>
            </div>

            <!-- Assignees: the same control the in-task preview used to carry. -->
            <div
                v-if="task && task.id"
                class="relative hidden md:flex items-center gap-2 flex-shrink-0"
                v-click-outside="closeAssigneeBox"
            >
                <div class="flex -space-x-2">
                    <span
                        v-for="assignee in task.assignees || []"
                        :key="assignee.id"
                        :title="assignee.user.name"
                        class="block rounded-full h-8 w-8 border-2 border-white dark:border-gray-800"
                    >
                        <img
                            v-if="assignee.user.photo_path"
                            class="h-full w-full rounded-full"
                            :src="assignee.user.photo_path"
                            :alt="assignee.user.name"
                        />
                        <img
                            v-else
                            class="h-full w-full rounded-full"
                            src="/images/user.svg"
                            :alt="assignee.user.name"
                        />
                    </span>
                </div>

                <button
                    type="button"
                    @click="showAssigneeBox = !showAssigneeBox"
                    class="w-8 h-8 rounded-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    :title="$t('Assignees')"
                >
                    <icon class="h-4 w-4" name="add" />
                </button>

                <div
                    v-if="showAssigneeBox"
                    class="absolute right-0 top-11 z-30 flex w-[300px] text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                >
                    <div class="flex items-start gap-2.5 pr-7 mb-2.5">
                        <span
                            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                        >
                            <icon class="h-4 w-4" name="users" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5">
                                <h4 class="truncate font-bold leading-tight dark:text-white">{{ $t('Assignee') }}</h4>
                                <span
                                    v-if="task_assignees().length"
                                    class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold leading-none text-white"
                                    >{{ task_assignees().length }}</span
                                >
                            </div>
                            <p class="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                                {{ $t('Select who is responsible') }}
                            </p>
                        </div>
                    </div>
                    <div
                        class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                        @click="showAssigneeBox = false"
                    >
                        <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                    </div>
                    <div class="-mx-4 mb-3 border-t border-gray-200 dark:border-gray-700"></div>
                    <input
                        v-model="user_search"
                        class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                        :placeholder="$t('Search User')"
                    />
                    <ul class="flex flex-col mt-3 gap-1 h-56 max-h-56 overflow-y-auto scroll-smooth overscroll-contain">
                        <li v-for="(userObject, user_index) in searchUser(user_search)" :key="'assignee_' + user_index">
                            <label
                                :for="'doc_u_id_' + user_index"
                                class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                                <input
                                    :id="'doc_u_id_' + user_index"
                                    class="w-5 flex-shrink-0"
                                    type="checkbox"
                                    :checked="task_assignees().includes(userObject.user_id)"
                                    @change="assignUserToTask($event.target.checked, userObject.user_id)"
                                />
                                <img
                                    v-if="userObject.user.photo_path"
                                    :alt="userObject.user.name"
                                    class="w-6 h-6 rounded-full flex-shrink-0"
                                    :src="userObject.user.photo_path"
                                />
                                <img
                                    v-else
                                    :alt="userObject.user.name"
                                    class="w-6 h-6 rounded-full flex-shrink-0"
                                    src="/images/user.svg"
                                />
                                <span class="flex min-w-0 flex-col leading-tight">
                                    <span class="truncate text-xs font-bold dark:text-gray-200">{{
                                        userObject.user.name
                                    }}</span>
                                    <span
                                        v-if="userObject.user.title"
                                        class="truncate text-[10px] font-semibold text-gray-500 dark:text-gray-400"
                                        >{{ userObject.user.title }}</span
                                    >
                                </span>
                            </label>
                        </li>
                    </ul>
                </div>
            </div>

            <a
                v-if="attachment"
                :href="attachment.path"
                :download="attachment.name"
                class="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            >
                <icon name="download" class="w-4 h-4" />
                <span class="hidden sm:inline">{{ $t('Download') }}</span>
            </a>

            <!-- The annotation toolbar below only exists for PDFs, so non-PDF
                 files get the same action up here. -->
            <button
                v-if="canApproveAndSign && attachment && !isPdf(attachment.name)"
                type="button"
                @click="approveAndSign"
                :disabled="signatureSubmitting"
                class="approve-sign-btn approve-sign-btn--header"
            >
                <span v-if="signatureSubmitting" class="approve-sign-btn__spinner"></span>
                {{ $t('Approve & Sign from Secretariat General') }}
            </button>

            <button
                type="button"
                @click="closeViewer"
                class="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0"
                :aria-label="$t('Close')"
                :title="$t('Close')"
            >
                <icon class="w-4 h-4" name="close" />
            </button>
        </header>

        <!-- ================= Loading / empty states ================= -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div
                class="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-gray-700 dark:border-t-gray-200 animate-spin"
            ></div>
        </div>

        <div v-else-if="!attachment" class="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <icon name="attachment" class="w-10 h-10 text-gray-400" />
            <p class="text-sm font-medium dark:text-gray-200">{{ $t('This file could not be found.') }}</p>
            <a
                v-if="backUrl"
                :href="backUrl"
                class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >{{ $t('Back to task') }}</a
            >
        </div>

        <!-- ================= Image preview ================= -->
        <div v-else-if="isImage(attachment.name)" class="flex-1 overflow-auto flex items-center justify-center p-6">
            <img
                :src="attachment.path"
                :alt="attachment.name"
                class="max-w-full max-h-full object-contain rounded shadow-lg"
            />
        </div>

        <!-- ================= Anything we cannot preview ================= -->
        <div
            v-else-if="!isPdf(attachment.name)"
            class="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center"
        >
            <icon name="attachment" class="w-10 h-10 text-gray-400" />
            <p class="text-sm font-medium dark:text-gray-200">{{ $t('This file type cannot be previewed here.') }}</p>
            <a
                :href="attachment.path"
                :download="attachment.name"
                class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >{{ $t('Download') }}</a
            >
        </div>

        <!-- ================= PDF viewer / annotator ================= -->
        <template v-else>
            <!-- Toolbar -->
            <div
                class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 border-b border-white/10 flex-shrink-0 overflow-x-auto"
            >
                <div class="flex items-center gap-1 p-1 rounded-full bg-white/5 flex-shrink-0">
                    <button
                        type="button"
                        @click="drawTool = 'view'"
                        :class="drawTool === 'view' ? 'bg-white text-gray-900' : 'text-white/70 hover:bg-white/10'"
                        class="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors"
                        :title="$t('View / scroll all pages')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                            <path
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                stroke="currentColor"
                                stroke-width="1.8"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
                        </svg>
                        <span class="hidden sm:inline">{{ $t('Read') }}</span>
                    </button>
                    <button
                        type="button"
                        @click="toggleSketch"
                        :class="
                            ['pen', 'highlighter', 'eraser'].includes(drawTool)
                                ? 'bg-white text-gray-900'
                                : 'text-white/70 hover:bg-white/10'
                        "
                        class="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors"
                        :title="$t('Sketch')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                            <path
                                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                fill="currentColor"
                            />
                        </svg>
                        <span class="hidden sm:inline">{{ $t('Sketch') }}</span>
                    </button>
                    <button
                        type="button"
                        @click="toggleTextTool"
                        :class="drawTool === 'text' ? 'bg-white text-gray-900' : 'text-white/70 hover:bg-white/10'"
                        class="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors"
                        :title="$t('Text')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6" />
                            <path d="M8 8h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                        </svg>
                        <span class="hidden sm:inline">{{ $t('Text') }}</span>
                    </button>
                </div>

                <span class="w-px h-6 bg-white/10 flex-shrink-0"></span>

                <button
                    type="button"
                    @click="undoDraw"
                    :disabled="!historyStack.length"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"
                    :title="$t('Undo')"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                        <path
                            d="M9 7 4 12l5 5M4 12h10a6 6 0 010 12h-1"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    @click="redoDraw"
                    :disabled="!redoStack.length"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"
                    :title="$t('Redo')"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                        <path
                            d="M15 7l5 5-5 5M20 12H10a6 6 0 000 12h1"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>

                <p
                    class="hidden lg:block ml-2 min-w-0 text-[11px] truncate"
                    :class="drawTool === 'view' && hasUnsavedAnnotations ? 'text-blue-300' : 'text-white/40'"
                >
                    {{ annotationHint }}
                </p>

                <div class="flex items-center gap-2 ml-auto flex-shrink-0 sticky right-0 pl-3 bg-gray-900">
                    <button
                        type="button"
                        @click="showDocumentNotes = !showDocumentNotes"
                        class="h-8 px-3 rounded-full flex items-center gap-1 text-xs font-medium"
                        :class="showDocumentNotes ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
                            <path
                                d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5V14l-6 6H5.5A1.5 1.5 0 014 18.5v-13z"
                                stroke="currentColor"
                                stroke-width="1.7"
                            />
                            <path d="M20 14h-4.5a1.5 1.5 0 00-1.5 1.5V20" stroke="currentColor" stroke-width="1.7" />
                            <path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                        </svg>
                        <span class="hidden sm:inline">{{ $t('Notes') }}</span>
                        <span
                            v-if="documentNotesCount"
                            class="px-1.5 rounded-full text-[10px] font-bold bg-blue-500 text-white"
                            >{{ documentNotesCount }}</span
                        >
                    </button>
                    <!-- While the document sits at a signature step, the primary
                         action here becomes the request itself; it saves any
                         pending notes on the way through. -->
                    <button
                        v-if="canApproveAndSign"
                        type="button"
                        @click="approveAndSign"
                        :disabled="signatureSubmitting || autoSaving"
                        class="approve-sign-btn"
                    >
                        <span v-if="signatureSubmitting || autoSaving" class="approve-sign-btn__spinner"></span>
                        {{
                            signatureSubmitting || autoSaving
                                ? $t('Saving...')
                                : $t('Approve & Sign from Secretariat General')
                        }}
                    </button>
                    <button
                        v-else-if="drawTool !== 'view' || hasUnsavedAnnotations"
                        type="button"
                        @click="manualSaveAnnotation"
                        :disabled="autoSaving"
                        class="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-white text-gray-900 text-xs font-semibold disabled:opacity-50"
                        :title="
                            hasUnsavedAnnotations ? $t('You have notes that are not saved yet.') : $t('Save & Close')
                        "
                    >
                        <span
                            v-if="hasUnsavedAnnotations && !autoSaving"
                            class="w-1.5 h-1.5 rounded-full bg-blue-600"
                        ></span>
                        {{ autoSaving ? $t('Saving...') : $t('Save & Close') }}
                    </button>
                </div>
            </div>

            <!-- Sketch sub-tools -->
            <div
                v-if="drawTool === 'pen' || drawTool === 'highlighter' || drawTool === 'eraser'"
                class="flex items-center justify-center gap-2 flex-wrap px-4 py-2 bg-gray-900 border-b border-white/10 flex-shrink-0"
            >
                <button
                    type="button"
                    @click="drawTool = 'pen'"
                    class="px-3 py-1.5 rounded-full text-xs font-medium"
                    :class="drawTool === 'pen' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'"
                >
                    {{ $t('Pen') }}
                </button>
                <button
                    type="button"
                    @click="drawTool = 'highlighter'"
                    class="px-3 py-1.5 rounded-full text-xs font-medium"
                    :class="drawTool === 'highlighter' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'"
                >
                    {{ $t('Highlight') }}
                </button>
                <button
                    type="button"
                    @click="drawTool = 'eraser'"
                    class="px-3 py-1.5 rounded-full text-xs font-medium"
                    :class="drawTool === 'eraser' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'"
                >
                    {{ $t('Eraser') }}
                </button>
                <button
                    type="button"
                    @click="clearCanvas"
                    class="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80"
                >
                    {{ $t('Clear') }}
                </button>

                <span class="w-px h-5 bg-white/10 mx-1"></span>

                <template v-if="drawTool === 'pen' || drawTool === 'highlighter'">
                    <button
                        v-for="c in swatchColors"
                        :key="c"
                        type="button"
                        @click="drawSettings.color = c"
                        class="w-6 h-6 rounded-full border-2"
                        :style="{ background: c, borderColor: drawSettings.color === c ? '#fff' : 'transparent' }"
                        :title="c"
                    ></button>
                </template>

                <div class="flex items-center gap-2 ml-1">
                    <label class="text-[11px] text-white/60">{{ $t('Size') }}</label>
                    <input type="range" min="1" max="20" v-model.number="drawSettings.size" class="w-20" />
                </div>
            </div>

            <!-- Stage + notes panel -->
            <div class="flex-1 flex min-h-0">
                <div class="flex-1 min-w-0 flex flex-col bg-gray-900">
                    <div
                        class="flex-1 min-h-0"
                        :class="drawTool === 'view' ? '' : 'px-2 sm:px-4 py-3 sm:py-6'"
                        @wheel="handleDrawWheel"
                    >
                        <div
                            ref="drawScroll"
                            class="pdf-stage-scroll mx-auto w-full h-full"
                            :style="drawTool === 'view' ? '' : 'max-width: 880px;'"
                        >
                            <div
                                ref="drawStage"
                                class="modal-pop__stage relative bg-white overflow-hidden mx-auto w-full"
                                :class="[
                                    { 'stage-transitioning': pageTransitioning },
                                    drawTool === 'view' ? '' : 'rounded shadow-2xl',
                                ]"
                            >
                                <iframe
                                    v-if="drawTool === 'view'"
                                    :key="'view-' + currentDrawPage"
                                    :src="pdfIframeSrc"
                                    class="absolute inset-0 w-full h-full border-0"
                                ></iframe>
                                <canvas
                                    v-show="drawTool !== 'view'"
                                    ref="pdfRenderCanvas"
                                    class="absolute inset-0 w-full h-full"
                                ></canvas>
                                <!-- Live stroke layer: the in-progress stroke lands here at full
                                     opacity and is composited onto drawCanvas once, on release.
                                     Keeps the highlighter from darkening where it overlaps itself. -->
                                <canvas
                                    v-show="drawTool !== 'view'"
                                    ref="strokeCanvas"
                                    class="absolute inset-0 w-full h-full pointer-events-none"
                                    :style="{ opacity: strokeLayerOpacity }"
                                ></canvas>
                                <canvas
                                    v-show="drawTool !== 'view'"
                                    ref="drawCanvas"
                                    class="absolute inset-0 w-full h-full touch-none"
                                    :class="
                                        drawTool === 'text'
                                            ? 'cursor-text pointer-events-auto'
                                            : 'cursor-crosshair pointer-events-auto'
                                    "
                                    @pointerdown="onDrawPointerDown"
                                    @pointermove="onDrawPointerMove"
                                    @pointerup="onDrawPointerUp"
                                    @pointercancel="onDrawPointerCancel"
                                ></canvas>

                                <transition name="modal-fade">
                                    <div
                                        v-if="isRenderingPage && drawTool !== 'view'"
                                        class="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                                    >
                                        <div
                                            class="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin"
                                        ></div>
                                    </div>
                                </transition>

                                <div
                                    v-if="textInput.visible"
                                    class="absolute z-20 bg-white border border-blue-500 rounded shadow-lg p-1.5"
                                    :style="{ left: textInput.cssX + 'px', top: textInput.cssY + 'px' }"
                                >
                                    <textarea
                                        ref="textInputBox"
                                        v-model="textInput.value"
                                        rows="2"
                                        :placeholder="$t('Type a note...')"
                                        class="text-xs w-40 border-0 focus:outline-none resize-none"
                                        @keydown.enter.exact.prevent="confirmTextInput"
                                        @keydown.esc.prevent="cancelTextInput"
                                    ></textarea>
                                    <div class="flex justify-end gap-1 mt-1">
                                        <button
                                            type="button"
                                            @click="cancelTextInput"
                                            class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700"
                                        >
                                            {{ $t('Cancel') }}
                                        </button>
                                        <button
                                            type="button"
                                            @click="confirmTextInput"
                                            class="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white"
                                        >
                                            {{ $t('Add') }}
                                        </button>
                                    </div>
                                </div>

                                <template v-if="drawTool !== 'view'">
                                    <div
                                        v-for="note in textNotes"
                                        :key="'tn_' + note.id"
                                        class="absolute z-10 group select-none"
                                        :style="{
                                            left: note.x + 'px',
                                            top: note.y + 'px',
                                            color: note.color,
                                            fontSize: note.fontSize + 'px',
                                            cursor: draggingNote && draggingNote.id === note.id ? 'grabbing' : 'grab',
                                            lineHeight: 1.2,
                                        }"
                                        @pointerdown.stop.prevent="startNoteDrag(note, $event)"
                                    >
                                        <span class="whitespace-pre" style="font-family: sans-serif">{{
                                            note.text
                                        }}</span>
                                        <button
                                            type="button"
                                            class="absolute -top-2.5 -right-2.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-none"
                                            @pointerdown.stop
                                            @click.stop="removeTextNote(note.id)"
                                            :title="$t('Remove note')"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Page navigation -->
                    <div
                        v-if="totalPdfPages > 1"
                        class="flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900 border-t border-white/10 flex-shrink-0"
                    >
                        <button
                            type="button"
                            @click="goToDrawPage(-1)"
                            :disabled="currentDrawPage <= 1"
                            class="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                                <path
                                    d="M15 6l-6 6 6 6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <span class="text-xs text-white/80 font-medium min-w-[80px] text-center"
                            >{{ $t('Page') }} {{ currentDrawPage }} / {{ totalPdfPages }}</span
                        >
                        <button
                            type="button"
                            @click="goToDrawPage(1)"
                            :disabled="currentDrawPage >= totalPdfPages"
                            class="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4">
                                <path
                                    d="M9 6l6 6-6 6"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <span
                            v-if="dirtyPages[currentDrawPage]"
                            class="w-1.5 h-1.5 rounded-full bg-blue-400"
                            :title="$t('This page has unsaved notes')"
                        ></span>
                    </div>
                </div>

                <!-- Notes for this document: every saved annotated version of this
                     PDF (from clicking Save), plus any comments that reference it. -->
                <aside
                    v-if="showDocumentNotes"
                    class="w-full max-w-[340px] flex-shrink-0 flex flex-col bg-gray-800 border-l border-white/10"
                >
                    <div class="px-3 py-2.5 border-b border-white/10 flex gap-2 items-start">
                        <textarea
                            v-model="newDocumentNote"
                            rows="2"
                            :placeholder="$t('Write a note about this document...')"
                            class="flex-1 text-xs border border-white/20 bg-gray-900 text-white placeholder-white/40 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                            @keydown.enter.exact.prevent="saveDocumentNote"
                        ></textarea>
                        <button
                            type="button"
                            @click="saveDocumentNote"
                            :disabled="!newDocumentNote.trim() || savingDocumentNote"
                            class="px-2.5 py-1.5 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex-shrink-0 self-stretch"
                        >
                            {{ savingDocumentNote ? $t('Saving...') : $t('Save') }}
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto divide-y divide-white/10">
                        <div
                            v-if="!documentVersions.length && !documentComments.length"
                            class="px-3 py-4 text-xs text-white/50 text-center"
                        >
                            {{ $t('No notes yet — pick Sketch or Text, add a note, then click Save.') }}
                        </div>

                        <button
                            v-for="version in documentVersions"
                            :key="'note_v_' + version.id"
                            type="button"
                            class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                            :class="{ 'bg-blue-500/10': attachment && attachment.id === version.id }"
                            @click="openAttachment(version)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5 flex-shrink-0 text-blue-400">
                                <path
                                    d="M4 20h4l10-10-4-4L4 16v4z"
                                    stroke="currentColor"
                                    stroke-width="1.7"
                                    stroke-linejoin="round"
                                />
                                <path d="M14 6l4 4" stroke="currentColor" stroke-width="1.7" />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <div class="text-xs font-medium truncate text-white/90">
                                    {{
                                        version.isOriginal
                                            ? $t('Original document')
                                            : annotatedVersionLabel(version.name)
                                    }}
                                </div>
                                <div class="text-[11px] text-white/50">
                                    {{ moment(version.created_at).format('MMM D, YYYY [at] h:mm A') }}
                                </div>
                            </div>
                            <span
                                v-if="attachment && attachment.id === version.id"
                                class="text-[10px] font-semibold text-blue-400 flex-shrink-0"
                                >{{ $t('Viewing') }}</span
                            >
                        </button>

                        <div
                            v-for="comment in documentComments"
                            :key="'note_c_' + comment.id"
                            class="flex gap-2.5 px-3 py-2.5"
                        >
                            <img
                                v-if="comment.user?.photo_path"
                                class="w-6 h-6 rounded-full flex-shrink-0"
                                :src="comment.user.photo_path"
                                :alt="comment.user.first_name"
                            />
                            <img v-else class="w-6 h-6 rounded-full flex-shrink-0" src="/images/user.svg" alt="" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-medium text-white/90"
                                        >{{ comment.user?.first_name }} {{ comment.user?.last_name }}</span
                                    >
                                    <span class="text-[11px] text-white/50">{{
                                        moment(comment.created_at).format('MMM D, YYYY [at] h:mm A')
                                    }}</span>
                                </div>
                                <div
                                    class="prose prose-sm prose-invert text-xs text-white/80 t_a_h"
                                    v-html="comment.details"
                                ></div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </template>
    </div>
    <!-- Toast / Alert Notifications   -->
    <teleport to="body">
        <div class="toast-stack" aria-live="polite" aria-atomic="true">
            <transition-group name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast-item"
                    :class="'toast-item--' + toast.type"
                    role="alert"
                    @mouseenter="pauseToast(toast)"
                    @mouseleave="resumeToast(toast)"
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
                        <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <path
                                d="M12 16v-4m0-4h.01"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                    <div class="toast-item__body">
                        <div v-if="toast.title" class="toast-item__title">{{ toast.title }}</div>
                        <div class="toast-item__message">{{ toast.message }}</div>
                    </div>
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
                    <div
                        class="toast-item__bar"
                        :style="{
                            animationDuration: toast.duration + 'ms',
                            animationPlayState: toast.paused ? 'paused' : 'running',
                        }"
                    ></div>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script>
import { Head } from '@inertiajs/vue3';
import { markRaw } from 'vue';
import Icon from '@/Shared/Icon.vue';
import moment from 'moment';
import axios from 'axios';
import { loadLanguageAsync, getActiveLanguage } from 'laravel-vue-i18n';

import { PDFDocument } from 'pdf-lib';

import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Standalone, full-page document viewer / annotator.
 *
 * Opened in its own tab from the attachment list ("View"). It loads the task
 * over JSON so the notes panel can list every annotated version of this file
 * plus the comments that reference it - exactly what the old in-task modal
 * showed, only with the whole window to work in.
 */
export default {
    components: { Head, Icon },

    props: {
        taskUid: { required: true },
        attachmentId: { required: true },
    },

    data() {
        return {
            loading: true,
            task: {},
            attachment: null,
            team_members: [],
            user_search: '',
            showAssigneeBox: false,

            // "Approve & Sign from Secretariat General". The server decides
            // whether this document is at a signature step and the signed-in
            // user may act on it — see SignatureRequestController::show.
            signatureContext: null,
            signatureSubmitting: false,

            drawSettings: {
                color: '#ef4444',
                size: 4,
            },
            isDrawing: false,
            drawTool: 'view',
            historyStack: [],
            redoStack: [],
            textInput: { visible: false, cssX: 0, cssY: 0, value: '' },
            textNotes: [],
            textNoteIdCounter: 0,
            draggingNote: null,
            swatchColors: ['#000000', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#9ca3af'],
            currentDrawPage: 1,
            totalPdfPages: 1,
            wheelCooldown: false,
            overscrollAmount: 0,

            // Stroke engine state (kept raw - it is touched on every pointer move).
            activePointers: markRaw(new Map()),
            pendingPoints: [],
            strokeRaf: null,
            strokeCtx: null,
            strokeMode: null,
            lastPoint: null,
            lastMid: null,
            touchScroll: null,
            pageTransitioning: false,
            pageAnnotations: {},
            dirtyPages: {},

            pdfDocProxy: null,
            canvasCtx: null,
            autoSaving: false,
            isRenderingPage: false,
            canvasPixelRatio: 1,
            renderedPage: null,

            showDocumentNotes: false,
            newDocumentNote: '',
            savingDocumentNote: false,

            toasts: [],
            toastIdCounter: 0,
        };
    },

    computed: {
        // Live highlighter strokes are previewed translucent, then baked in at
        // the same alpha when the stroke ends.
        strokeLayerOpacity() {
            return this.drawTool === 'highlighter' ? 0.35 : 1;
        },

        fileExtension() {
            const name = this.attachment?.name;
            if (!name || !name.includes('.')) return 'FILE';
            return name.split('.').pop().toUpperCase().slice(0, 4);
        },

        /** May this document be approved & signed from here, right now? */
        canApproveAndSign() {
            return !!(this.signatureContext && this.signatureContext.eligible);
        },

        backUrl() {
            if (!this.task?.id || !this.task?.project) return null;
            return this.route('projects.board.with.task', {
                projectUid: this.task.project.slug || this.task.project.id,
                taskUid: this.task.slug || this.task.id,
            });
        },

        pdfIframeSrc() {
            const path = this.attachment?.path;
            if (!path) return path;
            return this.currentDrawPage > 1 ? `${path}#page=${this.currentDrawPage}` : path;
        },

        filteredActivities() {
            if (!this.task.activities || !Array.isArray(this.task.activities)) {
                return [];
            }

            return this.task.activities.filter((activity) => {
                if (activity.field_changed === 'comment' || activity.field_changed === 'comment_edit') {
                    return activity.comment && activity.comment.id;
                }
                return false;
            });
        },

        documentFamilyName() {
            const name = this.attachment?.name;
            if (!name) return null;
            return this.documentBaseName(name);
        },

        documentVersions() {
            if (!this.documentFamilyName || !this.task?.attachments) return [];
            return [...this.task.attachments]
                .filter((a) => this.isPdf(a.name) && this.documentBaseName(a.name) === this.documentFamilyName)
                .map((a) => ({ ...a, isOriginal: !/^annotated_/i.test(a.name) }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        },

        documentComments() {
            if (!this.documentVersions.length) return [];
            const paths = this.documentVersions.map((v) => v.path);
            return this.filteredActivities
                .filter((a) => ['comment', 'comment_edit'].includes(a.field_changed) && a.comment?.details)
                .filter((a) => paths.some((p) => a.comment.details.includes(p)))
                .map((a) => ({ ...a.comment, user: a.user }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        },

        documentNotesCount() {
            return this.documentVersions.filter((v) => !v.isOriginal).length + this.documentComments.length;
        },

        hasUnsavedAnnotations() {
            return Object.values(this.dirtyPages).some(Boolean);
        },

        annotationHint() {
            if (this.drawTool !== 'view') {
                return this.$t('Use the page arrows below to note a different page.');
            }
            return this.hasUnsavedAnnotations
                ? this.$t('You have notes that are not saved yet — click Save & Close.')
                : this.$t('Scroll to browse every page. Pick Sketch or Text to add a note.');
        },
    },

    watch: {
        async drawTool(newTool, oldTool) {
            if (oldTool) {
                this.saveCurrentPageAnnotationState();
            }

            if (newTool === 'view') {
                this.$nextTick(() => this.initViewFrame());
                return;
            }

            // Swapping pen -> highlighter -> eraser -> text must not re-render
            // the page; only a different page or a return from view mode does.
            if (newTool !== 'view' && oldTool !== 'view' && this.renderedPage === this.currentDrawPage) {
                return;
            }

            await this.ensurePdfDocProxy();
            await this.renderDrawPage(this.currentDrawPage);
            const saved = this.pageAnnotations[this.currentDrawPage];
            if (saved?.canvasImage) {
                await this.restoreFromDataUrl(saved.canvasImage);
            }
            if (this.$refs.drawScroll) this.$refs.drawScroll.scrollTop = 0;
        },
    },

    methods: {
        /**
         * The viewer is a standalone page with no Layout, and Layout is what
         * loads the signed-in user's language everywhere else. Without this
         * the whole screen - toolbar, assignee picker, the sign action -
         * falls back to the 'en' default set in app.js.
         */
        applyUserLocale() {
            const locale = this.$page.props.auth?.user?.locale;
            if (!locale) return;

            document.documentElement.setAttribute('dir', ['sa', 'he', 'ur'].includes(locale) ? 'rtl' : 'ltr');
            if (getActiveLanguage() !== locale) {
                loadLanguageAsync(locale);
            }
        },

        async loadTask() {
            try {
                const { data } = await axios.get(this.route('json.task.get', this.taskUid));
                if (!data || !Object.keys(data).length) {
                    this.toastError(this.$t('This task could not be found.'));
                    return;
                }
                this.task = data;

                const found = (this.task.attachments || []).find((a) => String(a.id) === String(this.attachmentId));
                if (!found) {
                    this.toastError(this.$t('This file could not be found.'));
                    return;
                }
                this.openAttachment(found, false);
                this.loadTeamMembers();
                this.loadSignatureContext();
            } catch (error) {
                console.error('Error loading the document:', error);
                this.toastError(this.$t('This file could not be found.'));
            } finally {
                this.loading = false;
            }
        },

        async loadSignatureContext() {
            try {
                const { data } = await axios.get(this.route('task.signature.request.show', { taskUid: this.task.id }));
                this.signatureContext = data;

                // A document opened to be signed is opened to be marked up,
                // so start on Sketch rather than Read. Only for PDFs — the
                // annotator does not exist for anything else.
                if (this.canApproveAndSign && this.attachment && this.isPdf(this.attachment.name)) {
                    this.drawTool = 'pen';
                }
            } catch (error) {
                // Not being able to ask just means the action stays hidden.
                this.signatureContext = null;
            }
        },

        /**
         * Confirm the request. Any notes drawn on the page are saved first —
         * this button stands in for Save & Close while the document is at a
         * signature step, so nothing the reviewer wrote may be lost.
         */
        async approveAndSign() {
            if (!this.canApproveAndSign || this.signatureSubmitting) return;

            this.signatureSubmitting = true;
            try {
                if (this.hasUnsavedAnnotations) {
                    await this.manualSaveAnnotation();
                }

                await axios.post(this.route('task.signature.request.store', { taskUid: this.task.id }));
                this.leaveViewer();
            } catch (error) {
                const message =
                    (error.response && error.response.data && error.response.data.message) ||
                    this.$t('Failed to send the request.');
                this.toastError(message);
            } finally {
                this.signatureSubmitting = false;
            }
        },

        async loadTeamMembers() {
            try {
                const { data } = await axios.get(
                    this.route('task.other.data', {
                        task_id: this.task.id,
                        project_id: this.task.project_id,
                    })
                );
                this.team_members = data.team_members || [];
            } catch (error) {
                console.error('Could not load the assignable users:', error);
            }
        },

        /**
         * Point the viewer at an attachment. Called on load and whenever a
         * different version is picked in the notes panel - the address bar
         * follows along so a refresh (or a shared link) lands on the same file.
         */
        openAttachment(attachment, pushUrl = true) {
            if (!attachment) return;

            this.attachment = attachment;
            this.drawTool = 'view';
            this.historyStack = [];
            this.redoStack = [];
            this.textInput.visible = false;
            this.textNotes = [];
            this.draggingNote = null;
            this.currentDrawPage = 1;
            this.totalPdfPages = 1;
            this.pageAnnotations = {};
            this.dirtyPages = {};
            this.pdfDocProxy = null;
            this.renderedPage = null;

            if (pushUrl && typeof window !== 'undefined' && window.history?.replaceState) {
                window.history.replaceState(
                    {},
                    '',
                    this.route('task.attachment.view', {
                        taskUid: this.taskUid,
                        attachmentId: attachment.id,
                    })
                );
            }

            this.$nextTick(async () => {
                if (this.isPdf(attachment.name)) {
                    await this.ensurePdfDocProxy();
                    this.initViewFrame();
                }
            });
        },

        /**
         * The name a document keeps across its whole life: no extension, no
         * annotated_ prefixes (however many earlier saves piled on) and no
         * _v2 / _v3 suffix. Everything that shares one is one document.
         */
        documentBaseName(filename) {
            if (!filename) return '';
            return filename
                .replace(/\.[^/.]+$/, '')
                .replace(/^(annotated_)+/i, '')
                .replace(/_v\d+$/i, '');
        },

        annotatedVersionNumber(filename) {
            if (!filename || !/^annotated_/i.test(filename)) return 0;
            const match = filename.replace(/\.[^/.]+$/, '').match(/_v(\d+)$/i);
            return match ? Number(match[1]) : 1;
        },

        annotatedVersionLabel(filename) {
            return `${this.$t('Annotated version')} v${this.annotatedVersionNumber(filename) || 1}`;
        },

        /**
         * Next free name in the series: annotated_<doc>.pdf, then
         * annotated_<doc>_v2.pdf, _v3 and so on. Never annotated_annotated_.
         */
        nextAnnotatedFileName() {
            const base = this.documentBaseName(this.attachment?.name) || 'document';
            const used = (this.task.attachments || [])
                .filter((a) => this.isPdf(a.name) && this.documentBaseName(a.name) === base)
                .map((a) => this.annotatedVersionNumber(a.name))
                .filter(Boolean);

            const next = used.length ? Math.max(...used) + 1 : 1;
            return next === 1 ? `annotated_${base}.pdf` : `annotated_${base}_v${next}.pdf`;
        },

        isImage(filename) {
            if (!filename) return false;
            const ext = filename.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
        },

        isPdf(filename) {
            if (!filename) return false;
            const ext = filename.split('.').pop().toLowerCase();
            return ext === 'pdf';
        },

        formatBytes(bytes) {
            if (!bytes) return '';
            const units = ['B', 'KB', 'MB', 'GB'];
            let i = 0;
            let value = bytes;
            while (value >= 1024 && i < units.length - 1) {
                value /= 1024;
                i++;
            }
            return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
        },

        closeAssigneeBox() {
            this.showAssigneeBox = false;
        },

        searchUser(input) {
            const q = (input || '').trim().toLowerCase();
            if (!q) return this.team_members;
            return this.team_members.filter((tm) => {
                const name = (tm.user && tm.user.name) || '';
                const title = (tm.user && tm.user.title) || '';
                return name.toLowerCase().includes(q) || title.toLowerCase().includes(q);
            });
        },

        task_assignees() {
            return (this.task.assignees || []).map((item) => Number(item.user_id));
        },

        assignUserToTask(checked, id) {
            axios
                .post(this.route('task.assignees.add'), { task_id: this.task.id, user_id: id })
                .then((response) => {
                    if (response.data) {
                        if (checked && response.data.assignee) {
                            this.task.assignees.push(response.data.assignee);
                        } else {
                            const findIndex = this.task.assignees.findIndex((a) => Number(a.user_id) === Number(id));
                            if (findIndex > -1) {
                                this.task.assignees.splice(findIndex, 1);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to update assignees.'));
                });
        },

        /**
         * Close the viewer. The tab was opened from the attachment list, so
         * closing it is the natural exit - but a browser is free to refuse
         * window.close(), in which case we walk back to the task instead.
         */
        closeViewer() {
            if (
                this.hasUnsavedAnnotations &&
                !window.confirm(this.$t('You have notes that were never saved. Leave anyway?'))
            ) {
                return;
            }
            this.leaveViewer();
        },

        leaveViewer() {
            // Clear first, or our own beforeunload guard blocks the exit.
            this.dirtyPages = {};

            // Only a tab we were opened into by script can be closed. When
            // the viewer was navigated to in place - from the attachment
            // list or the drawer's sign action - go straight back instead of
            // waiting out a window.close() the browser will refuse.
            if (window.opener && !window.opener.closed) {
                window.close();
                setTimeout(() => {
                    if (!window.closed) {
                        window.location.href = this.backUrl || '/';
                    }
                }, 200);
                return;
            }

            window.location.href = this.backUrl || '/';
        },

        warnBeforeUnload(e) {
            if (!this.hasUnsavedAnnotations) return;
            e.preventDefault();
            e.returnValue = '';
        },

        // ============================================================
        // Toast / Alert notification system
        // ============================================================
        /**
         * Show a toast notification.
         * @param {string} message - main message text
         * @param {'success'|'error'|'warning'|'info'} type - visual style
         * @param {object} opts - { title, duration }
         */
        showToast(message, type = 'success', opts = {}) {
            const duration = opts.duration ?? (type === 'error' ? 5000 : 3500);
            const id = ++this.toastIdCounter;
            const toast = {
                id,
                type,
                message,
                title: opts.title || null,
                duration,
                paused: false,
                timer: null,
            };
            this.toasts.push(toast);
            this.armToastTimer(toast);

            // Cap the stack so it never grows unbounded
            if (this.toasts.length > 5) {
                const oldest = this.toasts[0];
                this.removeToast(oldest.id);
            }
            return id;
        },
        armToastTimer(toast) {
            clearTimeout(toast.timer);
            toast.timer = setTimeout(() => this.removeToast(toast.id), toast.duration);
        },
        pauseToast(toast) {
            toast.paused = true;
            clearTimeout(toast.timer);
        },
        resumeToast(toast) {
            toast.paused = false;
            this.armToastTimer(toast);
        },
        removeToast(id) {
            const index = this.toasts.findIndex((t) => t.id === id);
            if (index > -1) {
                clearTimeout(this.toasts[index].timer);
                this.toasts.splice(index, 1);
            }
        },
        toastSuccess(message, opts) {
            return this.showToast(message, 'success', opts);
        },
        toastError(message, opts) {
            return this.showToast(message, 'error', opts);
        },
        toastWarning(message, opts) {
            return this.showToast(message, 'warning', opts);
        },
        toastInfo(message, opts) {
            return this.showToast(message, 'info', opts);
        },

        async ensurePdfDocProxy() {
            if (this.pdfDocProxy || !this.attachment) return;

            const url = this.attachment.path;
            if (!url) {
                console.error('PDF render: attachment has no usable path/url. attachment =', this.attachment);
                this.toastError(this.$t('Failed to load the PDF for drawing.'));
                return;
            }

            this.isRenderingPage = true;
            try {
                const fileRes = await fetch(url, { credentials: 'same-origin' });
                if (!fileRes.ok) {
                    throw new Error(`HTTP ${fileRes.status} while downloading the PDF`);
                }
                const bytes = await fileRes.arrayBuffer();

                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                this.pdfDocProxy = markRaw(await loadingTask.promise);
                this.totalPdfPages = this.pdfDocProxy.numPages;
            } catch (err) {
                console.error('Failed to load the PDF for rendering. url was:', url, 'error:', err);
                const reason = err?.message || String(err);
                this.toastError(this.$t('Failed to load the PDF for drawing') + ': ' + reason);
            } finally {
                this.isRenderingPage = false;
            }
        },

        async renderDrawPage(pageNumber) {
            if (!this.pdfDocProxy) return;
            const stage = this.$refs.drawStage;
            const renderCanvas = this.$refs.pdfRenderCanvas;
            const drawCanvas = this.$refs.drawCanvas;
            const strokeCanvas = this.$refs.strokeCanvas;
            if (!stage || !renderCanvas || !drawCanvas) return;

            this.isRenderingPage = true;
            try {
                const page = await this.pdfDocProxy.getPage(pageNumber);
                const baseViewport = page.getViewport({ scale: 1 });
                const targetWidth = Math.min(stage.clientWidth || 880, 880);
                const bgPixelRatio = Math.min((window.devicePixelRatio || 1) * 1.5, 3);
                const bgScale = (targetWidth * bgPixelRatio) / baseViewport.width;
                const bgViewport = page.getViewport({ scale: bgScale });
                const bw = Math.round(bgViewport.width);
                const bh = Math.round(bgViewport.height);
                const displayHeight = bh / bgPixelRatio;

                stage.style.height = displayHeight + 'px';
                stage.style.overflow = 'hidden';

                renderCanvas.width = bw;
                renderCanvas.height = bh;
                renderCanvas.style.width = '100%';
                renderCanvas.style.height = displayHeight + 'px';

                const overlayPixelRatio = Math.min((window.devicePixelRatio || 1) * 2, 3);
                this.canvasPixelRatio = overlayPixelRatio;
                const overlayScale = (targetWidth * overlayPixelRatio) / baseViewport.width;
                const overlayViewport = page.getViewport({ scale: overlayScale });

                drawCanvas.width = Math.round(overlayViewport.width);
                drawCanvas.height = Math.round(overlayViewport.height);
                drawCanvas.style.width = '100%';
                drawCanvas.style.height = displayHeight + 'px';

                if (strokeCanvas) {
                    strokeCanvas.width = drawCanvas.width;
                    strokeCanvas.height = drawCanvas.height;
                    strokeCanvas.style.width = '100%';
                    strokeCanvas.style.height = displayHeight + 'px';
                }

                const renderTask = page.render({ canvasContext: renderCanvas.getContext('2d'), viewport: bgViewport });
                await renderTask.promise;
                this.canvasCtx = drawCanvas.getContext('2d');
                this.renderedPage = pageNumber;
            } catch (err) {
                console.error('Failed to render PDF page', pageNumber, ':', err);
                this.toastError(this.$t('Failed to render the page for drawing.'));
            } finally {
                this.isRenderingPage = false;
            }
        },

        initViewFrame() {
            const stage = this.$refs.drawStage;
            if (!stage) return;
            // In view mode the iframe fills the stage and scrolls itself, so the
            // stage takes whatever height the viewport left for it.
            const scroll = this.$refs.drawScroll;
            const available = scroll?.clientHeight || Math.round(window.innerHeight * 0.78);
            stage.style.height = Math.max(available, 320) + 'px';
            stage.style.overflow = 'hidden';
            if (scroll) scroll.scrollTop = 0;
        },

        handleResize() {
            if (this.drawTool === 'view') {
                this.initViewFrame();
            } else {
                this.renderDrawPage(this.currentDrawPage);
            }
        },

        handleDrawWheel(e) {
            if (this.drawTool === 'view') return;

            const container = this.$refs.drawScroll;
            if (!container) return;

            const down = e.deltaY > 0;
            const atTop = container.scrollTop <= 0;
            const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

            // Normal scrolling inside the page: never hijack it.
            if ((down && !atBottom) || (!down && !atTop)) {
                this.overscrollAmount = 0;
                return;
            }

            if (this.isDrawing || this.textInput.visible || this.draggingNote) return;

            const direction = down ? 1 : -1;
            const next = this.currentDrawPage + direction;
            if (next < 1 || next > this.totalPdfPages) return;

            e.preventDefault();
            if (this.wheelCooldown) return;

            // Require a deliberate extra push past the edge before flipping,
            // so momentum scrolling doesn't skip pages on its own.
            this.overscrollAmount += Math.abs(e.deltaY);
            if (this.overscrollAmount < 120) return;

            this.overscrollAmount = 0;
            this.wheelCooldown = true;
            this.goToDrawPage(direction);
            setTimeout(() => {
                this.wheelCooldown = false;
            }, 450);
        },

        async goToDrawPage(delta) {
            if (!this.attachment) return;
            const next = this.currentDrawPage + delta;
            if (next < 1 || next > this.totalPdfPages) return;

            this.saveCurrentPageAnnotationState();
            this.pageTransitioning = true;

            this.currentDrawPage = next;
            this.historyStack = [];
            this.redoStack = [];
            this.textNotes = (this.pageAnnotations[next]?.notes || []).map((n) => ({ ...n }));

            if (this.drawTool !== 'view') {
                await this.ensurePdfDocProxy();
                await this.renderDrawPage(next);
                const saved = this.pageAnnotations[next]?.canvasImage;
                if (saved) {
                    await this.restoreFromDataUrl(saved);
                }
            }

            this.$nextTick(() => {
                const container = this.$refs.drawScroll;
                if (container) {
                    // Arriving from below? start at the bottom, like a real reader.
                    container.scrollTop = delta < 0 ? container.scrollHeight : 0;
                }
                this.pageTransitioning = false;
            });
        },

        saveCurrentPageAnnotationState() {
            const canvas = this.$refs.drawCanvas;
            if (!canvas || !canvas.width || !canvas.height) return;
            this.pageAnnotations[this.currentDrawPage] = {
                canvasImage: canvas.toDataURL(),
                notes: this.textNotes.map((n) => ({ ...n })),
                pixelRatio: this.canvasPixelRatio || 1,
            };
        },

        // --- Drawing Coordinates & Events ---
        getCanvasCoordinates(e) {
            const canvas = this.$refs.drawCanvas;
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        },

        // --- Pointer input: one code path for mouse, finger and stylus ------
        onDrawPointerDown(e) {
            if (this.drawTool === 'view') return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // A second finger means "scroll", not "draw" - drop the stroke
            // that just started and pan the page instead.
            if (this.activePointers.size > 1) {
                this.cancelStroke();
                this.beginTouchScroll();
                return;
            }

            if (this.drawTool === 'text') {
                this.placeTextAt(e);
                return;
            }

            if (e.cancelable) e.preventDefault();
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (err) {
                /* not supported */
            }
            this.startStroke(e);
        },

        onDrawPointerMove(e) {
            if (this.activePointers.has(e.pointerId)) {
                this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }

            if (this.touchScroll) {
                if (e.cancelable) e.preventDefault();
                this.updateTouchScroll();
                return;
            }

            if (!this.isDrawing) return;
            if (e.cancelable) e.preventDefault();

            // Stylus and high-rate mice report several positions per frame;
            // getCoalescedEvents gives us all of them so fast strokes keep
            // their shape instead of turning into long straight segments.
            const batch = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
            const moves = batch && batch.length ? batch : [e];
            for (const move of moves) {
                this.pendingPoints.push(this.getCanvasCoordinates(move));
            }
            this.scheduleStrokeFlush();
        },

        onDrawPointerUp(e) {
            this.activePointers.delete(e.pointerId);
            if (this.touchScroll && this.activePointers.size < 2) this.touchScroll = null;
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (err) {
                /* noop */
            }
            this.commitStroke();
        },

        onDrawPointerCancel(e) {
            this.activePointers.delete(e.pointerId);
            this.touchScroll = null;
            this.cancelStroke();
        },

        startStroke(e) {
            if (!this.canvasCtx) return;

            this.pushHistory();
            this.isDrawing = true;
            this.strokeMode = this.drawTool;
            this.pendingPoints = [];

            const pos = this.getCanvasCoordinates(e);
            this.lastPoint = pos;
            this.lastMid = pos;
            this.strokeCtx = markRaw(this.configureStrokeContext());

            // A tap with no movement should still leave a dot.
            this.strokeCtx.beginPath();
            this.strokeCtx.moveTo(pos.x, pos.y);
            this.strokeCtx.lineTo(pos.x + 0.01, pos.y);
            this.strokeCtx.stroke();
        },

        configureStrokeContext() {
            const pr = this.canvasPixelRatio || 1;

            // The eraser has to bite into the real canvas; pen and highlighter
            // draw on the scratch layer first.
            if (this.strokeMode === 'eraser') {
                const ctx = this.canvasCtx;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.globalAlpha = 1;
                ctx.lineWidth = this.drawSettings.size * 5 * pr;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                return ctx;
            }

            const layer = this.$refs.strokeCanvas;
            const ctx = layer.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.strokeStyle = this.drawSettings.color;
            ctx.lineWidth = this.drawSettings.size * (this.strokeMode === 'highlighter' ? 4 : 1) * pr;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            return ctx;
        },

        scheduleStrokeFlush() {
            if (this.strokeRaf) return;
            this.strokeRaf = requestAnimationFrame(() => {
                this.strokeRaf = null;
                this.flushStroke();
            });
        },

        // Draw the queued points as a quadratic curve through their midpoints -
        // that is what turns a jagged list of samples into a smooth line.
        flushStroke() {
            if (!this.strokeCtx || !this.pendingPoints.length) return;

            const ctx = this.strokeCtx;
            ctx.beginPath();
            ctx.moveTo(this.lastMid.x, this.lastMid.y);

            for (const point of this.pendingPoints) {
                const mid = {
                    x: (this.lastPoint.x + point.x) / 2,
                    y: (this.lastPoint.y + point.y) / 2,
                };
                ctx.quadraticCurveTo(this.lastPoint.x, this.lastPoint.y, mid.x, mid.y);
                this.lastPoint = point;
                this.lastMid = mid;
            }

            ctx.stroke();
            this.pendingPoints = [];
        },

        commitStroke() {
            if (!this.isDrawing) return;

            if (this.strokeRaf) {
                cancelAnimationFrame(this.strokeRaf);
                this.strokeRaf = null;
            }
            this.flushStroke();
            this.isDrawing = false;

            const layer = this.$refs.strokeCanvas;
            if (this.strokeMode !== 'eraser' && layer && this.canvasCtx) {
                const ctx = this.canvasCtx;
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = this.strokeMode === 'highlighter' ? 0.35 : 1;
                ctx.drawImage(layer, 0, 0);
                ctx.restore();
                layer.getContext('2d').clearRect(0, 0, layer.width, layer.height);
            }

            this.canvasCtx.globalCompositeOperation = 'source-over';
            this.canvasCtx.globalAlpha = 1;
            this.strokeCtx = null;
            this.strokeMode = null;
        },

        async cancelStroke() {
            if (!this.isDrawing) return;

            if (this.strokeRaf) {
                cancelAnimationFrame(this.strokeRaf);
                this.strokeRaf = null;
            }
            this.pendingPoints = [];
            this.isDrawing = false;

            const layer = this.$refs.strokeCanvas;
            if (this.strokeMode !== 'eraser' && layer) {
                layer.getContext('2d').clearRect(0, 0, layer.width, layer.height);
            }

            // Undo the snapshot startStroke pushed. The eraser already bit into
            // the canvas, so put that snapshot back before dropping it.
            const snapshot = this.historyStack.pop();
            if (this.strokeMode === 'eraser' && snapshot) {
                this.canvasCtx.globalCompositeOperation = 'source-over';
                this.canvasCtx.globalAlpha = 1;
                await this.restoreFromDataUrl(snapshot);
            }

            this.strokeCtx = null;
            this.strokeMode = null;
        },

        // --- Two-finger panning (the canvas swallows native touch scrolling) ---
        pointerCentroid() {
            let x = 0,
                y = 0;
            this.activePointers.forEach((p) => {
                x += p.x;
                y += p.y;
            });
            const count = this.activePointers.size || 1;
            return { x: x / count, y: y / count };
        },

        beginTouchScroll() {
            if (!this.$refs.drawScroll) return;
            const centroid = this.pointerCentroid();
            this.touchScroll = { lastX: centroid.x, lastY: centroid.y };
        },

        updateTouchScroll() {
            const container = this.$refs.drawScroll;
            if (!container || !this.touchScroll) return;

            const centroid = this.pointerCentroid();
            container.scrollTop -= centroid.y - this.touchScroll.lastY;
            container.scrollLeft -= centroid.x - this.touchScroll.lastX;
            this.touchScroll = { lastX: centroid.x, lastY: centroid.y };
        },

        clearCanvas() {
            if (!this.canvasCtx) return;
            this.pushHistory();
            const canvas = this.$refs.drawCanvas;
            this.canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = this.$refs.strokeCanvas;
            if (layer) layer.getContext('2d').clearRect(0, 0, layer.width, layer.height);
        },

        placeTextAt(e) {
            const canvas = this.$refs.drawCanvas;
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            this.textInput.cssX = clientX - rect.left;
            this.textInput.cssY = clientY - rect.top;
            this.textInput.value = '';
            this.textInput.visible = true;

            this.$nextTick(() => {
                if (this.$refs.textInputBox) this.$refs.textInputBox.focus();
            });
        },

        confirmTextInput() {
            const text = (this.textInput.value || '').trim();
            if (text) {
                const fontSize = Math.max(14, this.drawSettings.size * 4);

                this.textNotes.push({
                    id: ++this.textNoteIdCounter,
                    x: this.textInput.cssX,
                    y: this.textInput.cssY,
                    text,
                    color: this.drawSettings.color,
                    fontSize,
                });
                this.dirtyPages[this.currentDrawPage] = true;
            }
            this.textInput.visible = false;
            this.textInput.value = '';
        },

        cancelTextInput() {
            this.textInput.visible = false;
            this.textInput.value = '';
        },

        // --- Dragging placed text notes ---
        startNoteDrag(note, e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            this.draggingNote = {
                id: note.id,
                startClientX: e.clientX,
                startClientY: e.clientY,
                origX: note.x,
                origY: note.y,
            };
            window.addEventListener('pointermove', this.onNoteDrag, { passive: false });
            window.addEventListener('pointerup', this.endNoteDrag);
            window.addEventListener('pointercancel', this.endNoteDrag);
        },

        onNoteDrag(e) {
            if (!this.draggingNote) return;
            if (e.cancelable) e.preventDefault();
            const dx = e.clientX - this.draggingNote.startClientX;
            const dy = e.clientY - this.draggingNote.startClientY;
            const note = this.textNotes.find((n) => n.id === this.draggingNote.id);
            if (note) {
                note.x = this.draggingNote.origX + dx;
                note.y = this.draggingNote.origY + dy;
            }
        },

        endNoteDrag() {
            if (this.draggingNote) this.dirtyPages[this.currentDrawPage] = true;
            this.draggingNote = null;
            window.removeEventListener('pointermove', this.onNoteDrag);
            window.removeEventListener('pointerup', this.endNoteDrag);
            window.removeEventListener('pointercancel', this.endNoteDrag);
        },

        removeTextNote(id) {
            const idx = this.textNotes.findIndex((n) => n.id === id);
            if (idx > -1) {
                this.textNotes.splice(idx, 1);
                this.dirtyPages[this.currentDrawPage] = true;
            }
        },

        // --- Bottom-bar tool toggles (Sketch groups Pen/Highlight/Eraser) ---
        toggleSketch() {
            if (['pen', 'highlighter', 'eraser'].includes(this.drawTool)) {
                this.drawTool = 'view';
            } else {
                this.drawTool = 'pen';
            }
        },

        toggleTextTool() {
            this.drawTool = this.drawTool === 'text' ? 'view' : 'text';
        },

        pushHistory() {
            const canvas = this.$refs.drawCanvas;
            if (!canvas) return;
            this.historyStack.push(canvas.toDataURL());
            if (this.historyStack.length > 25) this.historyStack.shift();
            this.redoStack = [];
            this.dirtyPages[this.currentDrawPage] = true;
        },

        restoreFromDataUrl(dataUrl) {
            return new Promise((resolve) => {
                const canvas = this.$refs.drawCanvas;
                const ctx = this.canvasCtx;
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                img.src = dataUrl;
            });
        },

        async undoDraw() {
            if (!this.historyStack.length) return;
            const canvas = this.$refs.drawCanvas;
            this.redoStack.push(canvas.toDataURL());
            const prev = this.historyStack.pop();
            await this.restoreFromDataUrl(prev);
            this.dirtyPages[this.currentDrawPage] = true;
            this.saveCurrentPageAnnotationState();
        },

        async redoDraw() {
            if (!this.redoStack.length) return;
            const canvas = this.$refs.drawCanvas;
            this.historyStack.push(canvas.toDataURL());
            const next = this.redoStack.pop();
            await this.restoreFromDataUrl(next);
            this.dirtyPages[this.currentDrawPage] = true;
            this.saveCurrentPageAnnotationState();
        },

        async manualSaveAnnotation() {
            this.autoSaving = true;
            try {
                await this.saveAnnotatedImage();
            } finally {
                this.autoSaving = false;
            }
        },

        saveDocumentNote() {
            const text = (this.newDocumentNote || '').trim();
            if (!text || !this.attachment || this.savingDocumentNote) return;

            const path = this.attachment.path;
            const escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br/>');
            const details = `<span class="hidden" data-doc-ref="${path}"></span>${escaped}`;

            this.savingDocumentNote = true;
            axios
                .post(this.route('comments.new'), {
                    details,
                    task_id: this.task.id,
                    user_id: this.$page.props.auth.user.id,
                    created_at: this.moment().format('YYYY-MM-DD HH:mm:ss'),
                })
                .then((response) => {
                    if (response.data) {
                        this.task.activities.unshift(response.data);
                        this.newDocumentNote = '';
                        this.toastSuccess(this.$t('Note saved.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to save the note.'));
                })
                .finally(() => {
                    this.savingDocumentNote = false;
                });
        },

        buildFinalDataUrlForEntry(entry) {
            return new Promise((resolve) => {
                if (!entry || !entry.canvasImage) {
                    resolve(null);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    const temp = document.createElement('canvas');
                    temp.width = img.naturalWidth;
                    temp.height = img.naturalHeight;
                    const tctx = temp.getContext('2d');
                    tctx.drawImage(img, 0, 0);

                    const ratio = entry.pixelRatio || 1;
                    (entry.notes || []).forEach((note) => {
                        tctx.globalCompositeOperation = 'source-over';
                        tctx.globalAlpha = 1;
                        tctx.fillStyle = note.color;
                        const scaledFontSize = note.fontSize * ratio;
                        tctx.font = `${scaledFontSize}px sans-serif`;
                        tctx.textBaseline = 'top';
                        note.text.split('\n').forEach((line, i) => {
                            tctx.fillText(line, note.x * ratio, note.y * ratio + i * scaledFontSize * 1.2);
                        });
                    });

                    resolve(temp.toDataURL('image/png'));
                };
                img.onerror = () => resolve(null);
                img.src = entry.canvasImage;
            });
        },

        async saveAnnotatedImage() {
            const canvas = this.$refs.drawCanvas;
            if (!canvas || !this.attachment) return;

            // Make sure the page you're currently on is captured too.
            this.saveCurrentPageAnnotationState();

            const attachment = this.attachment;
            const savedFileName = this.nextAnnotatedFileName();

            const pagesToApply = Object.keys(this.dirtyPages)
                .map(Number)
                .filter((pageNum) => this.dirtyPages[pageNum] && this.pageAnnotations[pageNum]);

            if (!pagesToApply.length) {
                this.toastWarning(this.$t('Nothing to save — sketch or add a note first.'));
                return;
            }

            try {
                const fileRes = await fetch(attachment.path, { credentials: 'same-origin' });
                if (!fileRes.ok) {
                    throw new Error(`Failed to fetch the original file (status ${fileRes.status})`);
                }
                const originalBytes = await fileRes.arrayBuffer();
                const pdfDoc = await PDFDocument.load(originalBytes);

                for (const pageNum of pagesToApply) {
                    const finalDataUrl = await this.buildFinalDataUrlForEntry(this.pageAnnotations[pageNum]);
                    if (!finalDataUrl) continue;

                    const pngImage = await pdfDoc.embedPng(finalDataUrl);

                    const pageIndex = Math.min(pageNum - 1, pdfDoc.getPageCount() - 1);
                    const page = pdfDoc.getPage(pageIndex);
                    const { width, height } = page.getSize();
                    page.drawImage(pngImage, { x: 0, y: 0, width, height });
                }

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                const formData = new FormData();
                formData.append('file', blob, savedFileName);

                const res = await axios.post(this.route('task.attachment.add', this.task.id), formData);
                if (res.data && !res.data.error) {
                    this.task.attachments.push(res.data);
                    this.toastSuccess(this.$t('Annotated PDF attached.'), { duration: 2000 });
                    this.dirtyPages = {};
                    // Same finish as the old in-task modal: the notes are filed,
                    // so hand the reader back to the task.
                    setTimeout(() => this.leaveViewer(), 700);
                } else {
                    this.toastError(res.data?.message || this.$t('Failed to save the annotated PDF.'));
                }
            } catch (err) {
                console.error('Failed to save annotated PDF:', err);
                this.toastError(this.$t('Failed to save the annotated PDF.'));
            }
        },
    },

    created() {
        this.moment = moment;
        this.applyUserLocale();
        this.loadTask();
    },

    mounted() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('beforeunload', this.warnBeforeUnload);
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('beforeunload', this.warnBeforeUnload);
        this.toasts.forEach((t) => clearTimeout(t.timer));
        this.endNoteDrag();
        if (this.strokeRaf) {
            cancelAnimationFrame(this.strokeRaf);
            this.strokeRaf = null;
        }
    },

    name: 'attachment-view',
};
</script>

<style scoped>
/* "Approve & Sign from Secretariat General" — stands in for Save & Close
       while the document is at a signature step. */
.approve-sign-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
    max-width: 34rem;
    padding: 8px 20px;
    border-radius: 999px;
    background: #4f46e5;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
    transition:
        background 0.15s ease,
        box-shadow 0.15s ease;
}
.approve-sign-btn:hover:not(:disabled) {
    background: #4338ca;
    box-shadow: 0 8px 20px rgba(67, 56, 202, 0.4);
}
.approve-sign-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.approve-sign-btn--header {
    border-radius: 10px;
    font-size: 12px;
}
.approve-sign-btn__spinner {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: transparent;
    border-radius: 999px;
    animation: approve-sign-spin 0.7s linear infinite;
}
@keyframes approve-sign-spin {
    to {
        transform: rotate(360deg);
    }
}

.toast-stack {
    position: fixed;
    top: max(20px, env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 380px;
    max-width: calc(100vw - 24px);
    pointer-events: none;
}

/* Phones: dock to the bottom, full width, clear of the notch and home bar. */
@media (max-width: 640px) {
    .toast-stack {
        top: auto;
        bottom: max(16px, env(safe-area-inset-bottom));
        left: 12px;
        right: 12px;
        width: auto;
        max-width: none;
        transform: none;
        flex-direction: column-reverse;
    }
    .toast-item {
        padding: 12px 14px;
        border-radius: 12px;
    }
}

.toast-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 13px 15px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow:
        0 12px 32px -8px rgba(15, 23, 42, 0.22),
        0 2px 6px rgba(15, 23, 42, 0.06);
    overflow: hidden;
    pointer-events: auto;
}

/* Accent hairline down the leading edge - `currentColor` is set per type
       below, so the edge, the icon badge and the countdown bar stay in step. */
.toast-item::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: currentColor;
}

:global(.dark) .toast-item {
    background: #1e293b;
    border-color: rgba(148, 163, 184, 0.16);
    box-shadow:
        0 12px 32px -8px rgba(0, 0, 0, 0.6),
        0 2px 6px rgba(0, 0, 0, 0.35);
}

.toast-item--success {
    color: #16a34a;
}
.toast-item--error {
    color: #dc2626;
}
.toast-item--warning {
    color: #d97706;
}
.toast-item--info {
    color: #2563eb;
}

.toast-item__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: currentColor;
    margin-top: 1px;
}
.toast-item__icon svg {
    width: 15px;
    height: 15px;
    color: #ffffff;
}

.toast-item__body {
    flex: 1;
    min-width: 0;
}

.toast-item__title {
    font-weight: 600;
    font-size: 13.5px;
    color: #0f172a;
    margin-bottom: 2px;
}
:global(.dark) .toast-item__title {
    color: #f1f5f9;
}

.toast-item__message {
    font-size: 13px;
    line-height: 1.4;
    color: #334155;
    word-break: break-word;
}
:global(.dark) .toast-item__message {
    color: #cbd5e1;
}

.toast-item__close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 4px;
    transition:
        color 0.15s ease,
        background 0.15s ease;
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

.toast-item__bar {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: currentColor;
    opacity: 0.35;
    transform-origin: left;
    animation-name: toast-progress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}
.toast-item--success .toast-item__bar {
    color: #16a34a;
}
.toast-item--error .toast-item__bar {
    color: #dc2626;
}
.toast-item--warning .toast-item__bar {
    color: #d97706;
}
.toast-item--info .toast-item__bar {
    color: #2563eb;
}

@keyframes toast-progress {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}

.toast-enter-active {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
    transition: all 0.2s ease-in;
    position: absolute;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(-16px) scale(0.95);
}
.toast-leave-to {
    opacity: 0;
    transform: translateY(-16px) scale(0.95);
}
.toast-move {
    transition: transform 0.2s ease;
}

/* Bottom-docked on phones (see the 640px block above), so the toast should
       rise from below rather than drop from above. */
@media (max-width: 640px) {
    .toast-enter-from,
    .toast-leave-to {
        transform: translateY(16px) scale(0.95);
    }
}

@media (prefers-reduced-motion: reduce) {
    .toast-enter-active,
    .toast-leave-active,
    .toast-move {
        transition: opacity 0.15s ease;
    }
    .toast-enter-from,
    .toast-leave-to {
        transform: none;
    }
    .toast-item__bar {
        animation: none;
    }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-pop__stage {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}
.stage-transitioning {
    opacity: 0.35;
    transform: scale(0.985);
}

/* Scroll container for the annotated page. The canvas eats native touch
       scrolling (touch-action: none) so one finger can draw; two fingers are
       panned by hand in updateTouchScroll(). */
.pdf-stage-scroll {
    max-height: 78vh;
    overflow: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}
.pdf-stage-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.pdf-stage-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.22);
    border-radius: 999px;
}
.pdf-stage-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
}
.pdf-stage-scroll::-webkit-scrollbar-track {
    background: transparent;
}

/* Phones: give the page more of the screen and keep the canvas crisp. */
@media (max-width: 640px) {
    .pdf-stage-scroll {
        max-height: 68vh;
    }
}

@media (prefers-reduced-motion: reduce) {
    .modal-pop__stage {
        transition: none;
    }
}

/* Comment bodies arrive as HTML - keep long words inside the notes panel. */
.t_a_h {
    width: auto;
    max-width: 100%;
    word-wrap: break-word;
}

/* The stage owns the full height of the tab here, not a slice of a modal. */
.pdf-stage-scroll {
    max-height: 100%;
}

@media (max-width: 640px) {
    .pdf-stage-scroll {
        max-height: 100%;
    }
}
</style>
