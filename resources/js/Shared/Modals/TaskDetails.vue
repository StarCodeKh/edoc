<template>
    <Head v-if="!loading && !fetchFailed" :title="$t(task.title + ' | ' + task.project.title)" />
    <div class="task__details">
        <div class="wrapper" id="modal">
            <div role="alert" class="container">
                <div v-if="loading" class="content">
                    <div role="status" class="td__loader">
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                            <div class="i__r" />
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                        </div>
                        <div class="__f">
                            <div>
                                <div class="i__1" />
                                <div class="i__2" />
                            </div>
                        </div>
                        <span class="sr-only">{{ $t('Loading...') }}</span>
                    </div>
                </div>
                <div
                    v-else-if="fetchFailed"
                    class="content w-full flex flex-col items-center justify-center py-24 text-center"
                >
                    <icon class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" name="details" />
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {{ $t('This task could not be loaded.') }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                        {{ $t('It may have been deleted, or merged into another task.') }}
                    </p>
                    <button
                        type="button"
                        class="mt-5 inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
                        @click="closeOnError()"
                    >
                        {{ $t('Close') }}
                    </button>
                </div>
                <div v-else class="content w-full">
                    <div
                        v-if="task.cover"
                        ref="t__cover"
                        class="t__cover"
                        :style="{ backgroundImage: 'url(' + task.cover.path + ')' }"
                    ></div>
                    <div v-if="task.is_archive" class="archive___task dark:bg-yellow-900/30 dark:text-yellow-200">
                        <icon name="archive" />
                        {{ $t('This task is archived.') }}
                    </div>
                    <div
                        class="mv__card bg-white dark:bg-gray-800 dark:border-gray-700"
                        v-if="showMoveCard"
                        :class="{ '!left-auto right-6 top-23': is_move }"
                    >
                        <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Move Card') }}</h4>
                        <div
                            class="close__b absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                            @click="
                                showMoveCard = false;
                                is_move = false;
                            "
                        >
                            <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                        </div>
                        <span class="title mt-4 mb-1 font-bold dark:text-gray-200">{{
                            $t('Select a destination')
                        }}</span>
                        <!-- These were styled boxes with a transparent native
                             <select> laid over them: the box looked right and
                             the list that opened was the OS one, unstyled and
                             cramped around long Khmer step names. Same picker
                             the rest of the dialog uses now. -->
                        <div class="mb-3">
                            <span class="mb-1 block dark:text-gray-300">{{ $t('Project') }}</span>
                            <filter-select
                                :model-value="move_object.project_id"
                                :options="moveProjectOptions"
                                :show-all="false"
                                :placeholder="$t('Select Project')"
                                :search-placeholder="$t('Search') + '…'"
                                :empty-label="$t('No matches')"
                                class="w-full filter-select--block"
                                @update:model-value="selectMoveProject"
                            />
                        </div>
                        <div class="flex gap-2">
                            <div class="w-[70%]">
                                <span class="mb-1 block dark:text-gray-300">{{ $t('List') }}</span>
                                <filter-select
                                    :model-value="move_object.list_id"
                                    :options="moveListOptions"
                                    :show-all="false"
                                    :search-placeholder="$t('Search') + '…'"
                                    :empty-label="$t('No matches')"
                                    class="w-full filter-select--block"
                                    @update:model-value="selectMoveList"
                                />
                            </div>
                            <div class="w-[30%]">
                                <span class="mb-1 block dark:text-gray-300">{{ $t('Position') }}</span>
                                <filter-select
                                    v-model="move_object.order"
                                    :options="movePositionOptions"
                                    :show-all="false"
                                    :search-placeholder="$t('Search') + '…'"
                                    :empty-label="$t('No matches')"
                                    class="w-full filter-select--block"
                                />
                            </div>
                        </div>
                        <div class="flex justify-between items-center action__buttons mt-3">
                            <button type="button" class="small save" @click="moveTask()">{{ $t('Move') }}</button>
                        </div>
                    </div>

                    <div class="m__body w-full">
                        <main class="main">
                            <!-- Dialog header. It holds the top of the dialog while the body
                                 scrolls under it, so the title, the done box and the close
                                 button stay reachable however far down you go. -->
                            <div class="td__head">
                                <div class="checklist-box">
                                    <input
                                        type="checkbox"
                                        :disabled="!can.edit"
                                        :checked="!!task.is_done"
                                        @change="saveTask({ is_done: $event.target.checked })"
                                    />
                                    <icon name="checklist_box" />
                                </div>
                                <div class="td__head__text">
                                    <h2
                                        class="__t"
                                        :contenteditable="can.edit"
                                        @keyup.enter="saveTitle($event)"
                                        @blur="saveTitle($event)"
                                    >
                                        {{ task.title }}
                                    </h2>
                                    <span class="text-xs dark:text-gray-300"
                                        >in list
                                        <span
                                            :class="
                                                can.move
                                                    ? 'cursor-pointer underline dark:text-gray-200'
                                                    : 'dark:text-gray-200'
                                            "
                                            @click="can.move && displayMoveCard()"
                                            >{{ task.list.title }}</span
                                        >
                                    </span>
                                </div>
                                <div class="close_area">
                                    <div class="wrap">
                                        <span v-if="isPopup" @click="$emit('closeModal', true)" class="close__b">
                                            <icon class="h-6 w-6 dark:text-gray-300" name="close" />
                                        </span>
                                        <button
                                            v-else
                                            @click="
                                                goToLink(
                                                    route(
                                                        view === 'table'
                                                            ? 'projects.view.table'
                                                            : 'projects.view.board',
                                                        task.project.slug || task.project.id
                                                    )
                                                )
                                            "
                                            class="close__b"
                                        >
                                            <icon class="h-6 w-6 dark:text-gray-300" name="close" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="s__1">
                                <div class="t__l">
                                    <div class="flex flex-col mt-5">
                                        <span class="text-xs font-bold mb-1 dark:text-gray-300">{{
                                            $t('Labels')
                                        }}</span>
                                        <div class="list_labels flex flex-wrap gap-1">
                                            <button
                                                @click="can.edit && (showLabelBox = true)"
                                                class="label_button"
                                                v-for="(task_label, label_index) in task.task_labels"
                                                :style="{ background: task_label.label.color }"
                                                :aria-label="task_label.label.name"
                                                data-a=""
                                            >
                                                {{ task_label.label.name }}
                                            </button>
                                            <button
                                                v-if="can.edit"
                                                @click="showLabelBox = true"
                                                class="label_button bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                <icon class="dark:text-gray-300" name="plus" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                v-if="showLabelBox"
                            >
                                <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Labels') }}</h4>
                                <div
                                    class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                                    @click="showLabelBox = false"
                                >
                                    <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                </div>
                                <input
                                    v-model="label_search"
                                    class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                                    :placeholder="$t('Search labels')"
                                />
                                <ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto">
                                    <li v-for="(lab, lab_index) in searchLabel(label_search)">
                                        <label class="flex gap-1">
                                            <input
                                                class="w-5 mr-2 cursor-pointer"
                                                type="checkbox"
                                                :checked="task_label_ids().includes(lab.id)"
                                                @change="addLabelToTask($event.target.checked, lab.id)"
                                            />
                                            <span
                                                class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80"
                                                :style="{ background: lab.color }"
                                                :tabindex="lab_index"
                                                :aria-label="lab.name"
                                                data-color="orange"
                                                >{{ lab.name }}</span
                                            >
                                            <button
                                                class="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                type="button"
                                                :tabindex="lab_index"
                                                @click="
                                                    label = lab;
                                                    showLabelBox = false;
                                                    showEditLabelBox = true;
                                                "
                                            >
                                                <icon class="w-3 h-3 dark:text-gray-300" name="edit" />
                                            </button>
                                        </label>
                                    </li>
                                </ul>
                                <button
                                    class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 dark:bg-gray-700 dark:text-white hover:opacity-80 dark:hover:bg-gray-600"
                                    @click="
                                        showLabelBox = false;
                                        showEditLabelBox = true;
                                        label = {};
                                    "
                                >
                                    {{ $t('Create a new label') }}
                                </button>
                            </div>

                            <div
                                class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                v-if="showEditLabelBox"
                            >
                                <div
                                    class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 left-3 p-1.5 rounded"
                                    @click="
                                        showEditLabelBox = false;
                                        showLabelBox = true;
                                    "
                                >
                                    <icon class="w-4 h-4 dark:text-gray-300" name="arrow-left" />
                                </div>
                                <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Edit Labels') }}</h4>
                                <div
                                    class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                                    @click="showEditLabelBox = false"
                                >
                                    <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                </div>
                                <span
                                    class="w-full px-3 py-2 rounded cursor-pointer bg-gray-100 dark:bg-gray-700 hover:opacity-80"
                                    :style="{ background: label.color }"
                                    :tabindex="0"
                                    :aria-label="label.name"
                                    >{{ label.name }}</span
                                >
                                <span class="title mt-4 font-bold mb-2 dark:text-gray-200">{{ $t('Title') }}</span>
                                <input
                                    class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px]"
                                    placeholder=""
                                    v-model="label.name"
                                />
                                <span class="title mt-4 mb-1 font-bold dark:text-gray-200">{{
                                    $t('Select a color')
                                }}</span>
                                <div
                                    class="color__wrapper grid gap-1 mb-2 max-h-[120px] overflow-hidden overflow-y-auto"
                                >
                                    <div v-for="color in colors" class="h-8 box cursor-pointer">
                                        <div
                                            class="w-full h-full border-[2px] rounded border-transparent hover:border-red-600"
                                            :title="color.name"
                                            :aria-label="color.name"
                                            :style="{ backgroundColor: color.color }"
                                            @click="label.color = color.color"
                                        ></div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center action__buttons mt-2">
                                    <button type="button" class="small save" @click="saveLabel(label)">
                                        {{ $t('Save') }}
                                    </button>
                                    <button
                                        v-if="label.id"
                                        @click="
                                            deleteLabel(label.id);
                                            showEditLabelBox = false;
                                            showLabelBox = true;
                                        "
                                        type="button"
                                        class="small cancel"
                                    >
                                        {{ $t('Delete') }}
                                    </button>
                                </div>
                            </div>

                            <section class="s__2">
                                <div class="__details_top">
                                    <icon name="details" />
                                    <div class="flex-1">
                                        <span class="text-sm font-medium">{{ $t('Description') }}</span>
                                    </div>
                                    <icon @click="toggleDetails()" class="w-4 h-4 ml-auto cursor-pointer" name="edit" />
                                </div>
                                <div class="__details">
                                    <div
                                        v-if="!editDescription"
                                        class="prose pt-4 text-sm"
                                        :class="{ 'cursor-pointer': can.edit }"
                                        @click="can.edit ? onDescriptionClick($event) : null"
                                        v-html="task.description || 'Add more details...'"
                                    ></div>
                                    <section class="mt-4" v-if="editDescription">
                                        <CustomEditor
                                            ref="editDescription"
                                            v-model="task.description"
                                            :users="availableUsers"
                                            :show-status-bar="true"
                                            :enable-auto-save="true"
                                            :auto-save-interval="30000"
                                            @mention="onMention"
                                        />
                                        <div class="mt-2">
                                            <button
                                                type="button"
                                                class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                @click="saveDetails()"
                                            >
                                                {{ $t('Save') }}
                                            </button>
                                            <button
                                                @click="editDescription = false"
                                                type="button"
                                                class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1"
                                            >
                                                {{ $t('Cancel') }}
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            </section>

                            <section class="mt-6" id="checklist">
                                <div>
                                    <div class="flex">
                                        <Icon class="w-5 h-5 mr-3" name="checklist" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{
                                                $t('Checklist')
                                            }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400"
                                                >{{ checklistDoneCount(task.checklists) }}/{{
                                                    task.checklists.length
                                                }}</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div class="space-y-4">
                                        <div
                                            v-for="(check_list, c_index) in task.checklists"
                                            :key="check_list.id || c_index"
                                            class="group relative flex items-center"
                                        >
                                            <!-- View Mode -->
                                            <div class="checklist-box2" v-if="!check_list.modify">
                                                <input
                                                    class="inp-cbx"
                                                    :id="'cbx-' + check_list.id"
                                                    :checked="!!check_list.is_done"
                                                    :disabled="!can.edit"
                                                    @click="
                                                        check_list.is_done = $event.target.checked;
                                                        saveCheckList(check_list.id, { is_done: check_list.is_done });
                                                    "
                                                    type="checkbox"
                                                    style="display: none"
                                                />
                                                <label class="cbx" :for="'cbx-' + check_list.id">
                                                    <span>
                                                        <icon class="w-4 h-4" name="checklist_box_2" />
                                                    </span>
                                                    <span class="text-sm">{{ check_list.title }}</span>
                                                </label>
                                            </div>

                                            <!-- Edit Mode -->
                                            <div class="checklist-box2 pl-6 w-full" v-if="check_list.modify">
                                                <input
                                                    :id="'modify_' + check_list.id"
                                                    class="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm bg-white w-full"
                                                    v-model="check_list.title"
                                                    @keyup="
                                                        $event.keyCode === 13
                                                            ? modifyCheckListSubmit(
                                                                  check_list,
                                                                  c_index,
                                                                  task.checklists
                                                              )
                                                            : ''
                                                    "
                                                />
                                                <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                    <div class="flex items-center gap-2 action__buttons">
                                                        <button
                                                            type="button"
                                                            class="small save"
                                                            @click="
                                                                modifyCheckListSubmit(
                                                                    check_list,
                                                                    c_index,
                                                                    task.checklists
                                                                )
                                                            "
                                                        >
                                                            {{ $t('Save') }}
                                                        </button>
                                                        <button
                                                            @click="check_list.modify = false"
                                                            type="button"
                                                            class="small cancel"
                                                        >
                                                            {{ $t('Cancel') }}
                                                        </button>
                                                    </div>

                                                    <!-- NEW: Reassign Back & Attach File Buttons -->
                                                    <div class="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            class="px-2 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1"
                                                            @click="reassignBack(check_list)"
                                                        >
                                                            <icon class="w-3 h-3" name="undo" />
                                                            {{ $t('Reassign Back') }}
                                                        </button>

                                                        <label
                                                            class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1"
                                                        >
                                                            <icon class="w-3 h-3" name="paperclip" />
                                                            {{ $t('Attach New') }}
                                                            <input
                                                                type="file"
                                                                class="hidden"
                                                                @change="attachNewFile($event, check_list)"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Action Icons (Hover) -->
                                            <div
                                                class="absolute right-0 hidden pl-4 group-hover:flex"
                                                v-if="!check_list.modify"
                                            >
                                                <icon
                                                    class="w-4 h-4 mr-3 cursor-pointer"
                                                    name="edit"
                                                    @click="modifyCheck(check_list)"
                                                />
                                                <icon
                                                    class="w-4 h-4 cursor-pointer"
                                                    name="trash"
                                                    @click="deleteCheckList(check_list.id, c_index, task.checklists)"
                                                />
                                            </div>
                                        </div>

                                        <!-- Add New Checklist Item Form -->
                                        <div v-show="newCheckList" class="group relative flex">
                                            <div class="checklist-box2 pl-6 w-full">
                                                <input
                                                    class="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm bg-white w-full"
                                                    ref="ncl"
                                                    v-model="new_chek_list.title"
                                                    @keyup="inputNewChecklistAction(new_chek_list, $event)"
                                                />
                                                <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                    <div class="flex items-center gap-2 action__buttons">
                                                        <button
                                                            type="button"
                                                            class="small save"
                                                            @click="inputNewChecklistAction(new_chek_list)"
                                                        >
                                                            {{ $t('Save') }}
                                                        </button>
                                                        <button
                                                            @click="newCheckList = false"
                                                            type="button"
                                                            class="small cancel"
                                                        >
                                                            {{ $t('Cancel') }}
                                                        </button>
                                                    </div>

                                                    <!-- NEW: Attach File for New Checklist Item -->
                                                    <div class="flex items-center gap-2">
                                                        <label
                                                            class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1"
                                                        >
                                                            <icon class="w-3 h-3" name="paperclip" />
                                                            {{ $t('Attach New') }}
                                                            <input
                                                                type="file"
                                                                class="hidden"
                                                                @change="attachNewFile($event)"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        v-if="can.edit"
                                        class="group flex items-center mt-6"
                                        @click="openNewChecklist()"
                                    >
                                        <icon class="w-5 h-5 dark:text-gray-300" name="add" />
                                        <span class="pl-2 text-sm group-hover:opacity-70 dark:text-gray-300">{{
                                            $t('Add a new item')
                                        }}</span>
                                    </button>
                                </div>
                            </section>

                            <section class="mt-8">
                                <div>
                                    <div class="flex">
                                        <icon class="w-4 h-4 mr-3 mt-1" name="attachment" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{
                                                $t('Attachments')
                                            }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400">{{
                                                task.attachments.length
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div class="flex flex-col gap-2 text-sm">
                                        <!-- One file, one row: type tile, name, when it
                                             arrived, then the actions as icon buttons on the
                                             right. They used to sit on a line of their own
                                             under the name, which left a tall empty row and
                                             no clear edge between one file and the next. -->
                                        <div
                                            v-for="(attachment, a_index) in sortedAttachments"
                                            :key="attachment.id || a_index"
                                            class="__attachment group flex items-center gap-3 p-2.5 rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white/70 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                                        >
                                            <div class="preview flex-shrink-0" :aria-label="attachment.name">
                                                <div
                                                    v-if="isImage(attachment.name)"
                                                    class="w-11 h-11 bg-cover bg-center rounded-lg ring-1 ring-black/5"
                                                    :style="{ backgroundImage: `url(${attachment.path})` }"
                                                ></div>
                                                <!-- A page glyph tinted by type with the real
                                                     extension across it, so any file - pdf, docx,
                                                     xlsx, zip - gets its own mark without a
                                                     bitmap per format. -->
                                                <div
                                                    class="relative w-11 h-11 flex items-center justify-center rounded-lg"
                                                    :class="fileTypeClass(attachment.name)"
                                                    v-else
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        class="absolute w-6 h-6 opacity-30"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M6.5 2.75h6.75L18.5 8v13.25H6.5z"
                                                            stroke="currentColor"
                                                            stroke-width="1.6"
                                                            stroke-linejoin="round"
                                                        />
                                                        <path
                                                            d="M13.25 2.75V8h5.25"
                                                            stroke="currentColor"
                                                            stroke-width="1.6"
                                                            stroke-linejoin="round"
                                                        />
                                                    </svg>
                                                    <span
                                                        class="relative font-bold uppercase tracking-wide"
                                                        :class="
                                                            fileExt(attachment.name).length > 3
                                                                ? 'text-[8px]'
                                                                : 'text-[9.5px]'
                                                        "
                                                    >
                                                        {{ fileExt(attachment.name) }}
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="flex-1 min-w-0">
                                                <a
                                                    :href="attachment.path"
                                                    target="_blank"
                                                    class="block truncate font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                                    :title="attachment.name"
                                                >
                                                    {{ attachment.name }}
                                                </a>
                                                <div
                                                    class="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400"
                                                >
                                                    <span
                                                        :aria-label="
                                                            moment(attachment.created_at).format('MMMM D, YYYY h:mm A')
                                                        "
                                                    >
                                                        {{
                                                            moment(attachment.created_at).format(
                                                                'MMM D, YYYY [·] h:mm A'
                                                            )
                                                        }}
                                                    </span>
                                                    <template v-if="can.attach">
                                                        <span class="text-gray-300 dark:text-gray-600">·</span>
                                                        <button
                                                            type="button"
                                                            class="hover:text-red-600 dark:hover:text-red-400"
                                                            @click="deleteAttachment(attachment.id)"
                                                        >
                                                            {{ $t('Delete') }}
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-1 flex-shrink-0">
                                                <a
                                                    class="att-btn"
                                                    :href="attachment.path"
                                                    :download="attachment.name"
                                                    :title="$t('Download')"
                                                    :aria-label="$t('Download')"
                                                >
                                                    <icon name="download" class="w-4 h-4" />
                                                </a>

                                                <!-- Same tab on purpose: this panel gives way to the viewer,
                                                     and closing the viewer (or approving from it) comes back to
                                                     the board with this document's panel open again. -->
                                                <a
                                                    class="att-btn"
                                                    :href="
                                                        route('task.attachment.view', {
                                                            taskUid: task.id,
                                                            attachmentId: attachment.id,
                                                        })
                                                    "
                                                    :title="$t('View')"
                                                    :aria-label="$t('View')"
                                                >
                                                    <icon name="eye" class="w-4 h-4" />
                                                </a>

                                                <button
                                                    v-if="
                                                        isImage(attachment.name) &&
                                                        (!task.cover || task.cover.id !== attachment.id)
                                                    "
                                                    type="button"
                                                    class="att-btn"
                                                    :title="$t('Make Cover')"
                                                    @click="makeCover(task, attachment)"
                                                >
                                                    <icon name="image" class="w-4 h-4" />
                                                </button>
                                                <button
                                                    v-if="task.cover && task.cover.id === attachment.id"
                                                    type="button"
                                                    class="att-btn att-btn--active"
                                                    :title="$t('Remove Cover')"
                                                    @click="removeCover(task)"
                                                >
                                                    <icon name="image" class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="mt-8">
                                <div>
                                    <div class="flex">
                                        <icon class="w-4 h-4 mr-3 mt-1" name="comments" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{
                                                $t('Activities')
                                            }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400">{{
                                                filteredActivities.length
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div>
                                        <div
                                            v-if="!showCommentBox && can.comment"
                                            class="mt-1 mb-4 cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 hover:shadow dark:hover:shadow-lg"
                                        >
                                            <p
                                                @click="showCommentBox = true"
                                                class="px-3 py-2 text-sm dark:text-gray-300"
                                            >
                                                {{ $t('Write a comment...') }}
                                            </p>
                                        </div>

                                        <form
                                            v-if="showCommentBox && can.comment"
                                            class="mt-1 mb-4 rounded-md border border-gray-300 dark:border-gray-600"
                                            enctype="multipart/form-data"
                                        >
                                            <CustomEditor
                                                ref="newCommentEditor"
                                                v-model="new_comment.details"
                                                :placeholder="$t('Write a comment...')"
                                                :users="availableUsers"
                                                :show-status-bar="false"
                                                :enable-auto-save="false"
                                                @mention="onMention"
                                            />

                                            <div class="flex items-center px-3 pt-2 pb-3">
                                                <div class="flex items-center">
                                                    <button
                                                        @click="
                                                            saveNewComment(
                                                                {
                                                                    details: new_comment.details,
                                                                    task_id: task.id,
                                                                    user_id: $page.props.auth.user.id,
                                                                },
                                                                task.activities
                                                            )
                                                        "
                                                        type="button"
                                                        class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        {{ $t('Save') }}
                                                    </button>
                                                    <button
                                                        @click="showCommentBox = false"
                                                        type="button"
                                                        class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1"
                                                    >
                                                        {{ $t('Cancel') }}
                                                    </button>
                                                </div>

                                                <div class="ml-auto hidden flex">
                                                    <label class="cursor-pointer">
                                                        <input
                                                            :accept="allowed_file_types"
                                                            :disabled="!canUpload"
                                                            class="hidden"
                                                            type="file"
                                                            multiple
                                                            @change="uploadAttachment($event, true)"
                                                        />
                                                        <icon class="w-4 h-4" name="attachment" />
                                                    </label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div class="relative">
                                        <div
                                            v-if="filteredActivities.length === 0"
                                            class="flex flex-col items-center justify-center py-8 text-center"
                                        >
                                            <div
                                                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2"
                                            >
                                                <icon
                                                    class="w-4 h-4 text-gray-400 dark:text-gray-500"
                                                    name="comments"
                                                />
                                            </div>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                                {{ $t('No activity yet') }}
                                            </p>
                                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {{ $t('Comments and changes will show up here.') }}
                                            </p>
                                        </div>

                                        <ul v-else class="relative">
                                            <!-- connecting timeline line -->
                                            <div
                                                class="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"
                                            ></div>

                                            <li
                                                v-for="activity in filteredActivities"
                                                :key="activity.id"
                                                class="relative pl-10 pb-5 last:pb-0"
                                            >
                                                <!-- Comment activity -->
                                                <template
                                                    v-if="
                                                        ['comment', 'comment_edit'].includes(activity.field_changed) &&
                                                        activity.comment
                                                    "
                                                >
                                                    <span class="absolute left-0 top-0 z-10">
                                                        <img
                                                            v-if="activity.user?.photo_path"
                                                            class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                                                            :src="activity.user.photo_path"
                                                            alt=""
                                                        />
                                                        <img
                                                            v-else
                                                            class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                                                            src="/images/user.svg"
                                                            alt=""
                                                        />
                                                    </span>

                                                    <div class="group">
                                                        <div class="flex items-center gap-2">
                                                            <span
                                                                v-if="activity.user"
                                                                class="text-sm font-semibold dark:text-gray-100"
                                                            >
                                                                {{ activity.user?.first_name }}
                                                                {{ activity.user?.last_name }}
                                                            </span>
                                                            <span class="text-xs text-gray-400 dark:text-gray-500">
                                                                {{
                                                                    moment(activity.comment?.created_at).format(
                                                                        'MMM D [at] h:mm a'
                                                                    )
                                                                }}
                                                                <span
                                                                    v-if="
                                                                        moment(activity.comment?.updated_at).isAfter(
                                                                            moment(activity.comment?.created_at)
                                                                        )
                                                                    "
                                                                    class="italic"
                                                                    >· {{ $t('edited') }}</span
                                                                >
                                                            </span>
                                                            <div
                                                                class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5"
                                                                v-if="$page.props.auth.user.id === activity.user?.id"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    @click="activity.comment.modify = true"
                                                                >
                                                                    <icon
                                                                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                                                                        name="edit"
                                                                    />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                    @click="
                                                                        deleteComment(
                                                                            activity.comment.id,
                                                                            task.activities,
                                                                            activity.id
                                                                        )
                                                                    "
                                                                >
                                                                    <icon
                                                                        class="w-3 h-3 text-gray-400 hover:text-red-500"
                                                                        name="trash"
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div v-if="activity.comment.modify" class="mt-2">
                                                            <CustomEditor
                                                                :ref="'editComment' + activity.comment.id"
                                                                v-model="activity.comment.details"
                                                                :placeholder="$t('Edit comment...')"
                                                                :users="availableUsers"
                                                                :show-status-bar="false"
                                                                :enable-auto-save="false"
                                                                @mention="onMention"
                                                            />
                                                            <div class="flex items-center gap-2 mt-2">
                                                                <button
                                                                    type="button"
                                                                    class="px-2.5 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white"
                                                                    @click="
                                                                        saveComment(
                                                                            activity.comment.id,
                                                                            activity.comment
                                                                        );
                                                                        activity.comment.modify = false;
                                                                    "
                                                                >
                                                                    {{ $t('Save') }}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="px-2.5 py-1 text-xs font-medium rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    @click="activity.comment.modify = false"
                                                                >
                                                                    {{ $t('Cancel') }}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div
                                                            v-else
                                                            class="mt-1 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 prose prose-sm dark:prose-invert t_a_h max-w-none"
                                                            v-html="activity.comment.details"
                                                        ></div>
                                                    </div>
                                                </template>

                                                <!-- System / field-change activity -->
                                                <template
                                                    v-else-if="
                                                        [
                                                            'title',
                                                            'slug',
                                                            'list_id',
                                                            'order',
                                                            'due_date',
                                                            'priority_id',
                                                            'is_done',
                                                            'is_archive',
                                                            'comment_delete',
                                                            'description',
                                                            'cover',
                                                            'signature_requested',
                                                        ].includes(activity.field_changed)
                                                    "
                                                >
                                                    <span
                                                        class="absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
                                                        :class="activityIconBg(activity)"
                                                    >
                                                        <icon
                                                            class="w-3.5 h-3.5 text-white"
                                                            :name="activityIcon(activity)"
                                                        />
                                                    </span>

                                                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                                                        <strong
                                                            class="font-semibold text-gray-800 dark:text-gray-100 mr-1"
                                                            >{{ activity.user?.first_name }}
                                                            {{ activity.user?.last_name }}</strong
                                                        >

                                                        <!-- Task.php already stores these as one sentence split in two
                                                             ("moved the Board from `A`" + "to `B`"), so they are joined -
                                                             striking the first half through read as if it were undone. -->
                                                        <template
                                                            v-if="
                                                                [
                                                                    'title',
                                                                    'slug',
                                                                    'list_id',
                                                                    'order',
                                                                    'due_date',
                                                                    'priority_id',
                                                                ].includes(activity.field_changed)
                                                            "
                                                        >
                                                            {{ activity.old_value }}
                                                            <span
                                                                class="font-medium text-gray-800 dark:text-gray-100"
                                                                >{{ activity.new_value }}</span
                                                            >
                                                        </template>

                                                        <!-- new_value is the state it ended in; old_value is the one it
                                                             left, so showing old_value said "marked as not done" on the
                                                             very entry that marked it done. -->
                                                        <template
                                                            v-else-if="
                                                                ['is_done', 'is_archive'].includes(
                                                                    activity.field_changed
                                                                )
                                                            "
                                                        >
                                                            {{ activity.new_value }}
                                                        </template>

                                                        <template
                                                            v-else-if="activity.field_changed === 'description'"
                                                            >{{ $t('updated the description') }}</template
                                                        >
                                                        <template v-else-if="activity.field_changed === 'cover'">{{
                                                            $t('updated the cover image')
                                                        }}</template>
                                                        <template
                                                            v-else-if="activity.field_changed === 'comment_delete'"
                                                            >{{ $t('deleted a comment') }}</template
                                                        >
                                                        <template
                                                            v-else-if="activity.field_changed === 'signature_requested'"
                                                        >
                                                            {{
                                                                $t(
                                                                    'requested approval & signature from the Secretariat General'
                                                                )
                                                            }}
                                                            <span class="font-medium text-gray-800 dark:text-gray-100"
                                                                >{{ activity.old_value }} →
                                                                {{ activity.new_value }}</span
                                                            >
                                                        </template>
                                                    </p>
                                                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {{ moment(activity.created_at).format('MMM D [at] h:mm a') }}
                                                    </p>
                                                </template>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </main>

                        <div
                            v-if="showManualTimeOption"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                            @click.self="closeManualTimeModal"
                        >
                            <div
                                class="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
                            >
                                <!-- Header -->
                                <div
                                    class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600"
                                >
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <icon name="clock" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {{ $t('Add Time Manually') }}
                                                </h3>
                                                <p class="text-sm text-gray-600 dark:text-gray-300">
                                                    {{ $t('Log time spent on this task') }}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            @click="closeManualTimeModal"
                                            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            <icon name="close" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Content -->

                                <div class="p-6 space-y-6 relative overflow-visible">
                                    <!-- Memo Field -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <icon name="note" class="w-4 h-4 inline mr-1" />
                                            {{ $t('Description') }}
                                        </label>
                                        <textarea
                                            v-model="manual_time.title"
                                            :placeholder="$t('What did you work on? (optional)')"
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    <!-- Quick Time Presets -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            <icon name="zap" class="w-4 h-4 inline mr-1" />
                                            {{ $t('Quick Add') }}
                                        </label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <button
                                                v-for="preset in timePresets"
                                                :key="preset.label"
                                                @click="applyTimePreset(preset)"
                                                class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors"
                                            >
                                                {{ preset.label }}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Date Selection -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <icon name="calendar" class="w-4 h-4 inline mr-1" />
                                            {{ $t('Date') }}
                                        </label>
                                        <DatePicker
                                            v-model="manual_time.date"
                                            :placeholder="$t('Select Date')"
                                            class="w-full"
                                        />
                                    </div>

                                    <!-- Time Range -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            <icon name="clock" class="w-4 h-4 inline mr-1" />
                                            {{ $t('Time Range') }}
                                        </label>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                                    >{{ $t('Start Time') }}</label
                                                >
                                                <DateTimePicker
                                                    :modelValue="ensureDateObject(manual_time.start_time)"
                                                    @update:modelValue="manual_time.start_time = $event"
                                                    :is24Hour="is24HourFormat"
                                                    :placeholder="$t('Start')"
                                                    @change="updateManualStart"
                                                    class="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                                                    >{{ $t('End Time') }}</label
                                                >
                                                <DateTimePicker
                                                    :modelValue="ensureDateObject(manual_time.end_time)"
                                                    @update:modelValue="manual_time.end_time = $event"
                                                    :is24Hour="is24HourFormat"
                                                    :placeholder="$t('End')"
                                                    class="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Duration Display -->
                                    <div
                                        v-if="composedStart && composedEnd"
                                        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                                    >
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                <icon name="timer" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                                                    $t('Duration')
                                                }}</span>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {{ formatDuration(composedStart, composedEnd) }}
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{
                                                        Math.floor(
                                                            moment
                                                                .duration(
                                                                    moment(composedEnd).diff(moment(composedStart))
                                                                )
                                                                .asMinutes()
                                                        )
                                                    }}
                                                    {{ $t('minutes') }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Validation Messages -->
                                    <div
                                        v-if="manualTimeError"
                                        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                                    >
                                        <div class="flex items-center gap-2">
                                            <icon
                                                name="exclamation-triangle"
                                                class="w-4 h-4 text-red-600 dark:text-red-400"
                                            />
                                            <span class="text-sm text-red-700 dark:text-red-300">{{
                                                manualTimeError
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3">
                                    <button
                                        @click="closeManualTimeModal"
                                        class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                                    >
                                        {{ $t('Cancel') }}
                                    </button>
                                    <button
                                        @click="addTime"
                                        :disabled="!canAddTime"
                                        class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <icon name="plus" class="w-4 h-4" />
                                        {{ $t('Add Time') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <aside class="divide-y divide-gray-200 dark:divide-gray-700 px-6 py-6">
                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('Move Task') }}
                                </h2>

                                <div class="relative">
                                    <div>
                                        <div
                                            v-if="can.move"
                                            class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            @click="
                                                displayMoveCard();
                                                is_move = true;
                                            "
                                        >
                                            <span class="block h-3.5 text-xs leading-none dark:text-gray-200">{{
                                                task.list.title
                                            }}</span>
                                            <icon
                                                class="w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300"
                                                name="arrow-down"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('ប្រភពឯកសារ') }}
                                </h2>
                                <div class="relative">
                                    <div
                                        v-if="can.edit"
                                        class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        @click="showSourceBox = true"
                                    >
                                        <span class="block text-xs leading-tight dark:text-gray-200">{{
                                            selectedDocumentSourceName
                                        }}</span>
                                        <icon
                                            class="w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300 flex-shrink-0"
                                            name="arrow-down"
                                        />
                                    </div>

                                    <div
                                        class="absolute right-0 left-0 flex w-full z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                        v-if="showSourceBox"
                                    >
                                        <h4 class="text-center mb-3 font-bold dark:text-white">
                                            {{ $t('ជ្រើសរើសប្រភពឯកសារ') }}
                                        </h4>
                                        <div
                                            class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                                            @click="showSourceBox = false"
                                        >
                                            <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                        </div>
                                        <input
                                            v-model="source_search"
                                            class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                                            :placeholder="$t('ស្វែងរក')"
                                        />
                                        <ul class="flex flex-col mt-3 gap-0.5 h-56 max-h-56 overflow-y-auto">
                                            <li v-if="task.document_source_id">
                                                <label
                                                    class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="document_source"
                                                        class="w-4 h-4 flex-shrink-0"
                                                        :checked="false"
                                                        @change="selectDocumentSource(null)"
                                                    />
                                                    <span class="italic text-gray-500 dark:text-gray-400">{{
                                                        $t('Not set')
                                                    }}</span>
                                                </label>
                                            </li>
                                            <template
                                                v-for="dept in filteredDocumentSourceGroups"
                                                :key="'dept_' + dept.id"
                                            >
                                                <li
                                                    class="px-2 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500"
                                                >
                                                    {{ dept.name }}
                                                </li>
                                                <li v-for="office in dept.children" :key="'office_' + office.id">
                                                    <label
                                                        class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="document_source"
                                                            class="w-4 h-4 flex-shrink-0"
                                                            :checked="task.document_source_id === office.id"
                                                            @change="selectDocumentSource(office.id)"
                                                        />
                                                        <span class="dark:text-gray-200">{{ office.name }}</span>
                                                    </label>
                                                </li>
                                            </template>
                                            <li
                                                v-if="!filteredDocumentSourceGroups.length"
                                                class="px-2 py-4 text-center text-xs text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t('No item found!') }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('ប្រភេទឯកសារ') }}
                                </h2>
                                <div class="relative">
                                    <div
                                        v-if="can.edit"
                                        class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        @click="showTypeBox = true"
                                    >
                                        <span class="block text-xs leading-tight dark:text-gray-200">{{
                                            selectedDocumentTypeName
                                        }}</span>
                                        <icon
                                            class="w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300 flex-shrink-0"
                                            name="arrow-down"
                                        />
                                    </div>

                                    <div
                                        class="absolute right-0 left-0 flex w-full z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                        v-if="showTypeBox"
                                    >
                                        <h4 class="text-center mb-3 font-bold dark:text-white">
                                            {{ $t('ជ្រើសរើសប្រភេទឯកសារ') }}
                                        </h4>
                                        <div
                                            class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                                            @click="showTypeBox = false"
                                        >
                                            <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                        </div>
                                        <input
                                            v-model="type_search"
                                            class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                                            :placeholder="$t('ស្វែងរក')"
                                        />
                                        <ul class="flex flex-col mt-3 gap-0.5 h-56 max-h-56 overflow-y-auto">
                                            <li v-if="task.type_id">
                                                <label
                                                    class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="document_type"
                                                        class="w-4 h-4 flex-shrink-0"
                                                        :checked="false"
                                                        @change="selectDocumentType(null)"
                                                    />
                                                    <span class="italic text-gray-500 dark:text-gray-400">{{
                                                        $t('Not set')
                                                    }}</span>
                                                </label>
                                            </li>
                                            <li v-for="type in filteredDocumentTypes" :key="'type_' + type.id">
                                                <label
                                                    class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="document_type"
                                                        class="w-4 h-4 flex-shrink-0"
                                                        :checked="task.type_id === type.id"
                                                        @change="selectDocumentType(type.id)"
                                                    />
                                                    <span class="dark:text-gray-200">{{ type.name }}</span>
                                                </label>
                                            </li>
                                            <li
                                                v-if="!filteredDocumentTypes.length"
                                                class="px-2 py-4 text-center text-xs text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t('No item found!') }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('អាទិភាព') }}
                                </h2>
                                <div class="relative">
                                    <div
                                        v-if="can.edit"
                                        class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        @click="showPriorityBox = true"
                                    >
                                        <span
                                            v-if="selectedPriorityColor"
                                            class="w-2.5 h-2.5 mr-1.5 rounded-full flex-shrink-0"
                                            :style="{ backgroundColor: selectedPriorityColor }"
                                        ></span>
                                        <span class="block text-xs leading-tight dark:text-gray-200">{{
                                            selectedPriorityName
                                        }}</span>
                                        <icon
                                            class="w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300 flex-shrink-0"
                                            name="arrow-down"
                                        />
                                    </div>

                                    <div
                                        class="absolute right-0 left-0 flex w-full z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                        v-if="showPriorityBox"
                                    >
                                        <h4 class="text-center mb-3 font-bold dark:text-white">
                                            {{ $t('ជ្រើសរើសអាទិភាព') }}
                                        </h4>
                                        <div
                                            class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded"
                                            @click="showPriorityBox = false"
                                        >
                                            <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                        </div>
                                        <input
                                            v-model="priority_search"
                                            class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                                            :placeholder="$t('ស្វែងរក')"
                                        />
                                        <ul class="flex flex-col mt-3 gap-0.5 h-56 max-h-56 overflow-y-auto">
                                            <li v-if="task.priority_id">
                                                <label
                                                    class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="task_priority"
                                                        class="w-4 h-4 flex-shrink-0"
                                                        :checked="false"
                                                        @change="selectPriority(null)"
                                                    />
                                                    <span class="italic text-gray-500 dark:text-gray-400">{{
                                                        $t('Not set')
                                                    }}</span>
                                                </label>
                                            </li>
                                            <li v-for="priority in filteredPriorities" :key="'priority_' + priority.id">
                                                <label
                                                    class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="task_priority"
                                                        class="w-4 h-4 flex-shrink-0"
                                                        :checked="task.priority_id === priority.id"
                                                        @change="selectPriority(priority.id)"
                                                    />
                                                    <span
                                                        class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        :style="{ backgroundColor: priority.color }"
                                                    ></span>
                                                    <span class="dark:text-gray-200">{{ priority.name }}</span>
                                                </label>
                                            </li>
                                            <li
                                                v-if="!filteredPriorities.length"
                                                class="px-2 py-4 text-center text-xs text-gray-400 dark:text-gray-500"
                                            >
                                                {{ $t('No item found!') }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3.5">
                                <div class="flex items-center px-2">
                                    <h2 class="text-sm font-medium dark:text-gray-300">
                                        {{ $t('Assignees') }}
                                    </h2>

                                    <div class="relative ml-auto" modal="true" name="task-assign">
                                        <div>
                                            <span v-if="can.edit" class="cursor-pointer" @click="showAssigneeBox = true"
                                                ><icon class="h-5 w-5 hover:opacity-80 dark:text-gray-300" name="add"
                                            /></span>
                                        </div>

                                        <div
                                            class="absolute right-1 flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700"
                                            v-if="showAssigneeBox"
                                        >
                                            <div class="flex items-start gap-2.5 pr-7 mb-2.5">
                                                <span
                                                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                                                >
                                                    <icon class="h-4 w-4" name="users" />
                                                </span>
                                                <div class="min-w-0 flex-1">
                                                    <div class="flex items-center gap-1.5">
                                                        <h4 class="truncate font-bold leading-tight dark:text-white">
                                                            {{ $t('Assignee') }}
                                                        </h4>
                                                        <span
                                                            v-if="task_assignees().length"
                                                            class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold leading-none text-white"
                                                            >{{ task_assignees().length }}</span
                                                        >
                                                    </div>
                                                    <p
                                                        class="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400"
                                                    >
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
                                                id="t_d_s_u"
                                                v-model="user_search"
                                                class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"
                                                :placeholder="$t('Search User')"
                                            />
                                            <ul
                                                class="flex flex-col mt-3 gap-1 h-56 max-h-56 overflow-y-auto scroll-smooth overscroll-contain"
                                            >
                                                <li v-for="(userObject, user_index) in searchUser(user_search)">
                                                    <label
                                                        :for="'td_u_id_' + user_index"
                                                        class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    >
                                                        <input
                                                            :id="'td_u_id_' + user_index"
                                                            class="w-5 flex-shrink-0"
                                                            type="checkbox"
                                                            :checked="task_assignees().includes(userObject.user_id)"
                                                            @change="
                                                                assignUserToTask(
                                                                    $event.target.checked,
                                                                    userObject.user_id
                                                                )
                                                            "
                                                        />
                                                        <img
                                                            v-if="userObject.user.photo_path"
                                                            :aria-label="userObject.user.name"
                                                            :alt="userObject.user.name"
                                                            class="w-6 h-6 rounded-full flex-shrink-0"
                                                            :src="userObject.user.photo_path"
                                                        />
                                                        <img
                                                            v-else
                                                            :aria-label="userObject.user.name"
                                                            :alt="userObject.user.name"
                                                            class="w-6 h-6 rounded-full flex-shrink-0"
                                                            src="/images/user.svg"
                                                        />
                                                        <span
                                                            class="flex min-w-0 flex-col leading-tight"
                                                            :tabindex="user_index"
                                                        >
                                                            <span
                                                                class="truncate text-xs font-bold dark:text-gray-200"
                                                                >{{ userObject.user.name }}</span
                                                            >
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
                                </div>

                                <div class="flex flex-wrap gap-1 px-2 mb-1 pt-2">
                                    <span
                                        v-for="assignee in task.assignees"
                                        :aria-label="assignee.user.name"
                                        data-a=""
                                        class="block rounded-full h-8 w-8 border-2 border-white"
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
                            </section>

                            <section class="py-3.5">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('Assign Group') }}
                                </h2>

                                <div class="flex flex-col gap-2 px-2 mt-2">
                                    <filter-select
                                        v-model="selectedGroupId"
                                        :options="userGroupOptions"
                                        :placeholder="$t('Select a group...')"
                                        :search-placeholder="$t('Search') + '…'"
                                        :empty-label="$t('No matches')"
                                        :show-all="false"
                                        icon="users"
                                        class="w-full filter-select--block"
                                    />
                                    <button
                                        type="button"
                                        class="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0 transition-colors"
                                        :disabled="!selectedGroupId || assigningGroup"
                                        @click="assignGroupToTask(selectedGroupId)"
                                    >
                                        <svg
                                            v-if="assigningGroup"
                                            class="w-3.5 h-3.5 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                class="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                stroke-width="4"
                                            />
                                            <path
                                                class="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        <icon v-else class="w-3.5 h-3.5" name="add" />
                                        {{ assigningGroup ? $t('Assigning...') : $t('Assign') }}
                                    </button>
                                </div>

                                <div
                                    class="flex flex-wrap gap-1.5 px-2 mt-2.5"
                                    v-if="task.group_assignees && task.group_assignees.length"
                                >
                                    <span
                                        v-for="ga in task.group_assignees"
                                        :key="ga.id"
                                        class="inline-flex items-center gap-1.5 text-[11px] font-medium pl-1.5 pr-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-800"
                                        :title="(ga.user_group?.members || []).map((m) => m.name).join(', ')"
                                    >
                                        <span
                                            class="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0"
                                        >
                                            <icon class="w-2.5 h-2.5 text-white" name="users" />
                                        </span>
                                        {{
                                            ga.user_group?.name ||
                                            (userGroups.find((g) => g.id === ga.user_group_id) || {}).name ||
                                            ga.user_group_id
                                        }}
                                    </span>
                                </div>
                            </section>

                            <section class="py-4">
                                <div class="flex px-2 text-sm font-medium dark:text-gray-300 justify-between">
                                    {{ $t('Time Count') }}
                                    <span
                                        v-if="
                                            !this.activeTimerString &&
                                            task_assignees().includes($page.props.auth.user.id)
                                        "
                                        class="cursor-pointer items-center flex"
                                        @click="showManualTimeOption = true"
                                        ><icon class="h-4 w-4 hover:opacity-80 dark:text-gray-300" name="add" />
                                        <span class="text-xs dark:text-gray-300">Manual</span></span
                                    >
                                </div>

                                <div class="mt-3 flex justify-between items-center px-2">
                                    <div class="flex gap-1 items-center">
                                        <p class="dark:text-gray-200">
                                            {{ totalTime() }}
                                        </p>
                                    </div>
                                    <button
                                        v-if="
                                            !!this.activeTimerString &&
                                            task_assignees().includes(Number($page.props.auth.user.id))
                                        "
                                        class="py-2 w-[70px] bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 rounded text-[12px] text-white select-none"
                                        @click="stopTracker()"
                                    >
                                        {{ $t('STOP') }}
                                    </button>
                                    <button
                                        v-else-if="
                                            !existing_timer &&
                                            task_assignees().includes(Number($page.props.auth.user.id))
                                        "
                                        class="py-2 w-[70px] bg-blue-600 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-900 rounded text-[12px] text-white select-none"
                                        @click="startTracker()"
                                    >
                                        {{ $t('START') }}
                                    </button>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('ថ្ងៃឯកសារចូល') }}
                                </h2>
                                <div class="relative" modal="true">
                                    <div>
                                        <div class="group mt-2 flex cursor-pointer items-center rounded-md py-1.5">
                                            <DateTimePicker
                                                v-model="task.entry_date"
                                                @change="saveTask({ entry_date: dateForSave(task.entry_date) })"
                                                @update:is24Hour="is24HourFormat = $event"
                                                placeholder="Select Date & Time"
                                                :is24Hour="is24HourFormat"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('ថ្ងៃកំណត់យក') }}
                                </h2>
                                <div class="relative" modal="true">
                                    <div>
                                        <div class="group mt-2 flex cursor-pointer items-center rounded-md py-1.5">
                                            <DateTimePicker
                                                v-model="task.due_date"
                                                :disabled="!can.edit"
                                                @change="saveTask({ due_date: dateForSave(task.due_date) })"
                                                @update:is24Hour="is24HourFormat = $event"
                                                placeholder="Select Date & Time"
                                                :is24Hour="is24HourFormat"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('ថ្ងៃឯកសារចេញ') }}
                                </h2>
                                <div class="relative" modal="true">
                                    <div>
                                        <div class="group mt-2 flex cursor-pointer items-center rounded-md py-1.5">
                                            <DateTimePicker
                                                v-model="task.exit_date"
                                                @change="saveTask({ exit_date: dateForSave(task.exit_date) })"
                                                @update:is24Hour="is24HourFormat = $event"
                                                placeholder="Select Date & Time"
                                                :is24Hour="is24HourFormat"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="py-3">
                                <div class="mt-2 space-y-2 px-1">
                                    <label
                                        class="flex cursor-pointer w-full items-center rounded bg-gray-200 dark:bg-gray-700 td__btn hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0"
                                    >
                                        <input
                                            :accept="allowed_file_types"
                                            :disabled="!canUpload"
                                            @change="uploadAttachment($event)"
                                            class="hidden"
                                            type="file"
                                            multiple
                                        />
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="attachment" />
                                        {{ $t('Attachment') }}
                                    </label>
                                    <button
                                        v-if="!this.task.is_archive && can.edit"
                                        @click="
                                            saveTask({ is_archive: 1 });
                                            this.task.is_archive = true;
                                        "
                                        class="flex td__btn w-full items-center rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0"
                                    >
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="archive" />
                                        {{ $t('Archive') }}
                                    </button>
                                    <button
                                        v-else-if="can.edit"
                                        @click="
                                            saveTask({ is_archive: 0 });
                                            this.task.is_archive = false;
                                        "
                                        class="flex td__btn w-full items-center py-1.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 dark:text-gray-200"
                                    >
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="undo" />
                                        {{ $t('Revert Back') }}
                                    </button>
                                    <button
                                        v-if="this.task.is_archive && can.delete"
                                        @click="deleteTask()"
                                        class="flex w-full text-white items-center td__btn py-1.5 text-xs font-medium rounded bg-red-700 dark:bg-red-800 hover:bg-red-800 dark:hover:bg-red-900 px-3 py-2"
                                    >
                                        <icon class="mr-2 h-4 w-4 fill-white" name="dash" />
                                        {{ $t('Delete') }}
                                    </button>
                                </div>
                            </section>

                            <section class="py-3">
                                <WatchButton
                                    :watchable-id="task.id"
                                    watchable-type="Task"
                                    :is-watching="task.is_watched_by_user"
                                />
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Mention Popover -->
    <div v-if="showMentionPopup && clickedMentionUser" class="mention-popup" :style="mentionPopupStyle" @click.stop>
        <div class="mention-popup__header">
            <div class="mention-popup__avatar">
                <img v-if="clickedMentionUser.avatar" :src="clickedMentionUser.avatar" :alt="clickedMentionUser.name" />
                <div v-else class="mention-popup__avatar-placeholder">
                    {{ clickedMentionUser.name.charAt(0).toUpperCase() }}
                </div>
            </div>
            <div class="mention-popup__info">
                <div class="mention-popup__name">{{ clickedMentionUser.name }}</div>
                <div class="mention-popup__email">{{ clickedMentionUser.email }}</div>
            </div>
            <button @click="hideMentionPopup" class="mention-popup__close">
                <Icon name="times" class="w-4 h-4" />
            </button>
        </div>
        <div class="mention-popup__content">
            <div class="mention-popup__details">
                <div class="mention-popup__detail-item" v-if="clickedMentionUser.role">
                    <Icon name="user-tag" class="w-4 h-4" />
                    <span>{{ clickedMentionUser.role }}</span>
                </div>
                <div class="mention-popup__detail-item" v-if="clickedMentionUser.department">
                    <Icon name="building" class="w-4 h-4" />
                    <span>{{ clickedMentionUser.department }}</span>
                </div>
                <div class="mention-popup__detail-item" v-if="clickedMentionUser.lastActive">
                    <Icon name="clock" class="w-4 h-4" />
                    <span>Last active {{ clickedMentionUser.lastActive }}</span>
                </div>
            </div>
        </div>
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
import { Head, Link } from '@inertiajs/vue3';
import FilterSelect from '@/Shared/Components/FilterSelect.vue';
import Icon from '@/Shared/Icon.vue';
import Loader from '@/Shared/Loader.vue';
import DatePicker from '@/Shared/Components/DatePicker.vue';
import DateTimePicker from '@/Shared/Components/DateTimePicker.vue';
import moment from 'moment';
import 'moment-duration-format';
import CustomEditor from '@/Shared/Components/CustomEditor.vue';
import WatchButton from '@/Components/WatchButton.vue';
import axios from 'axios';
import { abilities as taskAbilities } from '@/Utils/taskAbility';

export default {
    props: {
        id: {
            required: true,
        },
        isPopup: Boolean,
        view: { required: false },
    },
    emits: { closeModal: null },
    data() {
        return {
            manual_time: {
                date: null,
                start_time: null,
                end_time: null,
                start: null,
                end: null,
                seconds: 0,
                title: '',
            },
            showManualTimeOption: false,
            is24HourFormat: false,
            showAssigneeBox: false,
            availableUsers: [],
            editDescription: false,
            showCommentBox: false,
            showLabelBox: false,
            showMoveCard: false,
            is_move: false,
            label_search: '',
            user_search: '',
            showEditLabelBox: false,
            loading: true,
            fetchFailed: false,
            newCheckList: false,
            labels: null,
            existing_timer: null,
            users: null,
            list_items: null,
            projects: null,
            counter: { seconds: 0, timer: null, duration: 0 },
            activeTimerString: '',
            new_chek_list: {},
            move_object: {},
            new_comment: {},
            label: {},
            task: {},
            allowed_file_types: (() => {
                const base = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                const types = this?.$page?.props?.settings?.allowed_file_types;
                try {
                    const parsed = Array.isArray(types) ? types : JSON.parse(types);
                    const cleaned = parsed.map((t) => (t.startsWith('.') ? t : '.' + t)).filter(Boolean);

                    return Array.from(new Set([...base, ...cleaned])).join(',');
                } catch {
                    return base.join(',');
                }
            })(),
            colors: [
                { name: 'subtle green', color: '#baf3db' },
                { name: 'subtle yellow', color: '#f8e6a0' },
                { name: 'subtle orange', color: '#ffe2bd' },
                { name: 'subtle red', color: '#ffd2cc' },
                { name: 'subtle purple', color: '#dfd8fd' },
                { name: 'green', color: '#4bce97' },
                { name: 'yellow', color: '#e2b203' },
                { name: 'orange', color: '#faa53d' },
                { name: 'red', color: '#f87462' },
                { name: 'purple', color: '#9f8fef' },
                { name: 'bold green', color: '#1f845a' },
                { name: 'bold yellow', color: '#946f00' },
                { name: 'bold orange', color: '#b65c02' },
                { name: 'bold red', color: '#ca3521' },
                { name: 'bold purple', color: '#6e5dc6' },
                { name: 'subtle blue', color: '#cce0ff' },
                { name: 'subtle sky', color: '#c1f0f5' },
                { name: 'subtle lime', color: '#D3F1A7' },
                { name: 'subtle pink', color: '#fdd0ec' },
                { name: 'subtle black', color: '#dcdfe4' },
                { name: 'blue', color: '#579dff' },
                { name: 'sky', color: '#60c6d2' },
                { name: 'lime', color: '#94c748' },
                { name: 'pink', color: '#e774bb' },
                { name: 'black', color: '#8590a2' },
                { name: 'bold blue', color: '#0c66e4' },
                { name: 'bold sky', color: '#1d7f8c' },
                { name: 'bold lime', color: '#5b7f24' },
                { name: 'bold pink', color: '#ae4787' },
                { name: 'bold black', color: '#626f86' },
            ],
            showMentionPopup: false,
            mentionPopupPosition: { top: 0, left: 0 },
            clickedMentionUser: null,
            manualTimeError: null,
            timePresets: [
                { label: '15 min', hours: 0, minutes: 15 },
                { label: '30 min', hours: 0, minutes: 30 },
                { label: '1 hour', hours: 1, minutes: 0 },
                { label: '2 hours', hours: 2, minutes: 0 },
                { label: '4 hours', hours: 4, minutes: 0 },
                { label: '8 hours', hours: 8, minutes: 0 },
            ],

            toasts: [],
            toastIdCounter: 0,

            documentSources: [],
            documentTypes: [],
            showSourceBox: false,
            source_search: '',
            showTypeBox: false,
            type_search: '',
            priorities: [],
            showPriorityBox: false,
            priority_search: '',

            // Group assignment
            userGroups: [],
            selectedGroupId: null,
            assigningGroup: false,
        };
    },
    components: {
        FilterSelect,
        Icon,
        Loader,
        Link,
        DatePicker,
        DateTimePicker,
        CustomEditor,
        Head,
        WatchButton,
    },
    computed: {
        /** FilterSelect takes [{ value, label }]. */
        userGroupOptions() {
            return (this.availableUserGroups || []).map((g) => ({ value: g.id, label: g.name }));
        },

        moveProjectOptions() {
            return (this.projects || []).map((p) => ({ value: p.id, label: p.title }));
        },
        moveListOptions() {
            return this.getSelectedProjectLists().map((l) => ({ value: l.id, label: l.title }));
        },
        movePositionOptions() {
            return [...Array(this.getSelectedListPostions()).keys()].map((i) => ({
                value: i + 1,
                label: String(i + 1),
            }));
        },

        /**
         * What the signed-in user may do with this document. Mirrors
         * App\Support\TaskAbility, which every endpoint enforces anyway - this
         * only keeps controls that would be refused off the screen.
         */
        can() {
            return taskAbilities(this.$page.props.auth.user, this.task || {});
        },

        /**
         * Attaching is the person's right and the step's business both. A board
         * whose workflow step has no ឯកសារភ្ជាប់ takes no document, so the card
         * does not offer to file one. Deleting stays on can.attach - a file put
         * somewhere by mistake still has to come off.
         */
        canUpload() {
            return this.can.attach && this.task?.accepts_attachment !== false;
        },

        // Real ceiling PHP will accept (upload_max_filesize / post_max_size), capped at 50MB.
        maxUploadSize() {
            return this.$page.props.max_upload_size || 50 * 1024 * 1024;
        },

        sortedAttachments() {
            if (!this.task?.attachments) return [];
            return [...this.task.attachments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        },

        filteredActivities() {
            if (!this.task.activities || !Array.isArray(this.task.activities)) {
                return [];
            }

            return this.task.activities.filter((activity) => {
                if (activity.field_changed === 'comment' || activity.field_changed === 'comment_edit') {
                    return activity.comment && activity.comment.id;
                }

                const allowedFieldChanges = [
                    'title',
                    'slug',
                    'list_id',
                    'order',
                    'due_date',
                    'is_done',
                    'is_archive',
                    'comment_delete',
                    'description',
                    'cover',
                    'signature_requested',
                ];

                return allowedFieldChanges.includes(activity.field_changed);
            });
        },

        composedStart() {
            return this.composeDateTime(this.manual_time.start_time);
        },
        composedEnd() {
            return this.composeDateTime(this.manual_time.end_time);
        },

        mentionPopupStyle() {
            return {
                position: 'fixed',
                top: `${this.mentionPopupPosition.top}px`,
                left: `${this.mentionPopupPosition.left}px`,
                zIndex: 1001,
            };
        },

        canAddTime() {
            return this.composedStart && this.composedEnd && !this.manualTimeError;
        },

        selectedDocumentSourceName() {
            if (!this.task.document_source_id) return this.$t('Not set');
            for (const dept of this.documentSources) {
                const office = (dept.children || []).find((o) => o.id === this.task.document_source_id);
                if (office) return office.name;
            }
            return this.$t('Not set');
        },

        selectedDocumentTypeName() {
            if (!this.task.type_id) return this.$t('Not set');
            const found = this.documentTypes.find((t) => t.id === this.task.type_id);
            return found ? found.name : this.$t('Not set');
        },

        filteredDocumentTypes() {
            const q = (this.type_search || '').trim().toLowerCase();
            if (!q) return this.documentTypes;
            return this.documentTypes.filter((t) => t.name.toLowerCase().includes(q));
        },

        selectedPriorityName() {
            if (!this.task.priority_id) return this.$t('Not set');
            const found = this.priorities.find((p) => p.id === this.task.priority_id);
            return found ? found.name : this.$t('Not set');
        },

        selectedPriorityColor() {
            if (!this.task.priority_id) return null;
            const found = this.priorities.find((p) => p.id === this.task.priority_id);
            return found ? found.color : null;
        },

        filteredPriorities() {
            const q = (this.priority_search || '').trim().toLowerCase();
            if (!q) return this.priorities;
            return this.priorities.filter((p) => p.name.toLowerCase().includes(q));
        },

        availableUserGroups() {
            const assignedIds = (this.task.group_assignees || []).map((ga) => Number(ga.user_group_id));
            return this.userGroups.filter((g) => !assignedIds.includes(Number(g.id)));
        },

        filteredDocumentSourceGroups() {
            const q = (this.source_search || '').trim().toLowerCase();
            if (!q) return this.documentSources;
            return this.documentSources
                .map((dept) => ({
                    ...dept,
                    children: (dept.children || []).filter((o) => o.name.toLowerCase().includes(q)),
                }))
                .filter((dept) => dept.children.length || dept.name.toLowerCase().includes(q));
        },
    },
    watch: {
        'manual_time.start_time'() {
            this.manualTimeError = null;
        },
        'manual_time.end_time'() {
            this.manualTimeError = null;
        },
        'manual_time.date'() {
            this.manualTimeError = null;
        },
    },
    methods: {
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

        // --- Activity timeline helpers ---
        /** Did this entry end in the "on" state? "marked as done" and "marked
         *  as not done" are one field but opposite events, so the icon has to
         *  read the value, not just the field name. */
        activityTurnedOn(activity) {
            const value = String(activity.new_value || '');
            if (activity.field_changed === 'is_done') return !/not done/i.test(value);
            return !/^\s*unarchived/i.test(value);
        },

        activityIcon(activity) {
            const field = activity.field_changed;
            if (field === 'is_done') return this.activityTurnedOn(activity) ? 'complete' : 'incomplete';
            if (field === 'is_archive') return this.activityTurnedOn(activity) ? 'archive' : 'undo';

            const map = {
                title: 'edit',
                slug: 'edit',
                order: 'drag',
                list_id: 'move_right',
                priority_id: 'priorities',
                due_date: 'calendar',
                description: 'details',
                cover: 'image',
                comment_delete: 'trash',
                signature_requested: 'send_plan',
            };
            return map[field] || 'edit';
        },

        activityIconBg(activity) {
            const field = activity.field_changed;
            if (field === 'is_done') return this.activityTurnedOn(activity) ? 'bg-green-500' : 'bg-gray-400';
            if (field === 'is_archive') return this.activityTurnedOn(activity) ? 'bg-amber-500' : 'bg-gray-400';

            const map = {
                title: 'bg-blue-500',
                slug: 'bg-blue-500',
                order: 'bg-sky-500',
                list_id: 'bg-sky-500',
                priority_id: 'bg-rose-500',
                due_date: 'bg-orange-500',
                description: 'bg-indigo-500',
                cover: 'bg-purple-500',
                comment_delete: 'bg-red-500',
                signature_requested: 'bg-indigo-600',
            };
            return map[field] || 'bg-gray-400';
        },

        // --- Helpers ---
        /** The extension as it goes on the tile: up to four characters. */
        fileExt(filename) {
            const name = filename || '';
            if (!name.includes('.')) return 'FILE';
            return name.split('.').pop().slice(0, 4);
        },

        /** Tile colour by file type, so a list of files is scannable. */
        fileTypeClass(filename) {
            const ext = (filename || '').split('.').pop().toLowerCase();
            if (ext === 'pdf') return 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300';
            if (['doc', 'docx', 'rtf', 'odt'].includes(ext))
                return 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300';
            if (['xls', 'xlsx', 'csv'].includes(ext))
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300';
            if (['ppt', 'pptx'].includes(ext))
                return 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300';
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
                return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
            return 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-200';
        },

        isImage(filename) {
            if (!filename) return false;
            const ext = filename.split('.').pop().toLowerCase();
            return ['jpeg', 'png', 'gif', 'jpg', 'svg', 'webp', 'bmp'].includes(ext);
        },

        isPdf(filename) {
            if (!filename) return false;
            const ext = filename.split('.').pop().toLowerCase();
            return ext === 'pdf';
        },

        composeDateTime(time) {
            if (!this.manual_time.date || !time) return null;
            const d = this.moment(this.manual_time.date);
            const t = this.moment(time);
            return d.clone().set({ hour: t.hour(), minute: t.minute(), second: 0, millisecond: 0 }).toDate();
        },

        ensureDateObject(value) {
            if (!value) return null;
            if (value instanceof Date) return value;
            if (this.moment.isMoment(value)) return value.toDate();
            if (typeof value === 'string') return new Date(value);
            return null;
        },

        onDescriptionClick(event) {
            const mentionElement = event.target.closest('.mention');
            if (mentionElement) {
                event.stopPropagation();
                const userId = mentionElement.getAttribute('data-user-id');
                const user = this.availableUsers.find((u) => u.id == userId);
                if (user) {
                    this.clickedMentionUser = user;
                    this.showMentionPopup = true;

                    this.$nextTick(() => {
                        const mentionRect = mentionElement.getBoundingClientRect();

                        this.mentionPopupPosition = {
                            top: mentionRect.top - 10,
                            left: mentionRect.left,
                        };
                    });
                }
            } else {
                this.toggleDetails();
            }
        },

        hideMentionPopup() {
            this.showMentionPopup = false;
            this.clickedMentionUser = null;
        },

        // Enhanced manual time methods
        closeManualTimeModal() {
            this.showManualTimeOption = false;
            this.manualTimeError = null;
            this.resetManualTime();
        },

        resetManualTime() {
            this.manual_time = {
                date: null,
                start_time: null,
                end_time: null,
                start: null,
                end: null,
                seconds: 0,
                title: '',
            };
        },

        applyTimePreset(preset) {
            const now = this.moment();
            this.manual_time.start_time = now
                .clone()
                .subtract(preset.hours, 'hours')
                .subtract(preset.minutes, 'minutes')
                .toDate();
            this.manual_time.end_time = now.clone().toDate();
            this.manual_time.date = now.format('YYYY-MM-DD');
            this.manualTimeError = null;
        },

        formatDuration(start, end) {
            const duration = this.moment.duration(this.moment(end).diff(this.moment(start)));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();

            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        },

        validateManualTime() {
            this.manualTimeError = null;

            if (!this.manual_time.start || !this.manual_time.end) {
                this.manualTimeError = 'Please select both start and end times.';
                return false;
            }

            if (this.moment(this.manual_time.end).isBefore(this.manual_time.start)) {
                this.manualTimeError = 'End time must be after start time.';
                return false;
            }

            const duration = this.moment.duration(
                this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start))
            );
            const totalMinutes = duration.asMinutes();

            if (totalMinutes > 600) {
                this.manualTimeError = 'You cannot add more than 10 hours at a time.';
                return false;
            }

            if (this.moment(this.manual_time.end).isAfter(this.moment())) {
                this.manualTimeError = 'End time cannot be in the future.';
                return false;
            }

            const taskDate = this.moment(this.task.created_at).utc();
            if (this.moment(this.manual_time.start).isBefore(taskDate)) {
                this.manualTimeError = 'Start time must be after task creation date.';
                return false;
            }

            return true;
        },
        addTime() {
            this.manual_time.start = this.composeDateTime(this.manual_time.start_time);
            this.manual_time.end = this.composeDateTime(this.manual_time.end_time);

            if (!this.validateManualTime()) {
                return;
            }

            this.manual_time.seconds = parseInt(
                this.moment
                    .duration(this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start)))
                    .asSeconds()
            );

            this.counter.duration = parseInt(this.counter.duration) + this.manual_time.seconds;
            this.manual_time.task_id = this.task.id;

            axios
                .post(this.route('task.timer.manual'), this.manual_time)
                .then(() => {
                    this.closeManualTimeModal();
                    this.toastSuccess(this.$t('Time entry added.'));
                })
                .catch((error) => {
                    this.manualTimeError = 'Failed to add time. Please try again.';
                    console.error('Error adding manual time:', error);
                    this.toastError(this.$t('Failed to add time. Please try again.'));
                });
        },
        updateManualStart() {
            const t = this.manual_time.start_time;
            if (t && typeof t === 'object' && 'hours' in t) {
                const hours = ((t.hours ?? 0) + 1) % 24;
                const minutes = t.minutes ?? 0;
                const seconds = t.seconds ?? 0;
                const now = this.moment();
                this.manual_time.end_time = now.clone().hour(hours).minute(minutes).second(seconds).toDate();
                return;
            }
            if (t) {
                this.manual_time.end_time = this.moment(t).add(1, 'hour').toDate();
            }
        },
        openNewChecklist() {
            this.newCheckList = true;
            const ref = this.$refs.ncl;
            setTimeout(function () {
                ref.focus();
            }, 0);
        },
        async imageButtonClickHandler() {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.click();
            input.onchange = async () => {
                const file = input.files[0];
                this.$refs.editDescription.focus();
            };
        },
        async get_average_rgb(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = src;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    const colorCount = {};
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const key = `${r},${g},${b}`;

                        colorCount[key] = (colorCount[key] || 0) + 1;
                    }

                    const dominantColor = Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0][0];
                    resolve(`rgb(${dominantColor})`);
                };

                img.onerror = reject;
            });
        },
        async makeCover(task, attachment) {
            task.cover = attachment;
            await this.saveTask({ cover: attachment.id });
            this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(task.cover.path);
        },
        removeCover(task) {
            this.saveTask({ cover: null });
            task.cover = null;
        },
        toggleDetails() {
            this.editDescription = true;
        },
        onEditorReady(editor) {
            editor.focus();
        },
        deleteAttachment(id) {
            const realIndex = this.task.attachments.findIndex((a) => a.id === id);
            if (realIndex === -1) return;

            if (this.task.cover && this.task.cover.id === id) {
                this.task.cover = null;
            }

            const removed = this.task.attachments.splice(realIndex, 1)[0];
            this.toastSuccess(this.$t('Attachment deleted.'));

            axios.post(this.route('task.attachment.delete', id), {}).catch((error) => {
                console.log(error);
                // Roll back only if the delete actually failed server-side.
                this.task.attachments.splice(realIndex, 0, removed);
                this.toastError(this.$t('Failed to delete the attachment.'));
            });
        },
        async uploadAttachment(e, is_comment) {
            e.preventDefault();
            const files = Array.from(e.target.files || []);
            if (!files.length) {
                return;
            }

            const maxSizeBytes = this.maxUploadSize;
            let uploadedCount = 0;
            let failedCount = 0;

            for (const file of files) {
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                const isImageFile = file.type.startsWith('image/') || this.isImage(file.name);

                // 1. Validate File Type (PDF or image)
                if (!isPdf && !isImageFile) {
                    this.toastWarning(
                        this.$t('{name}: only PDF or image files are allowed.').replace('{name}', file.name)
                    );
                    failedCount++;
                    continue;
                }

                // 2. Validate File Size (server limit, see max_upload_size prop)
                if (file.size > maxSizeBytes) {
                    this.toastWarning(
                        this.$t('{name}: exceeds the {limit} limit.')
                            .replace('{name}', file.name)
                            .replace('{limit}', this.formatBytes(maxSizeBytes))
                    );
                    failedCount++;
                    continue;
                }

                // 3. Process Upload
                const obj = await this.uploadFile(file);
                if (obj && obj.error) {
                    this.toastError(obj?.message || this.$t('Upload failed.'));
                    failedCount++;
                    continue;
                }

                this.task.attachments.push(obj);
                uploadedCount++;
                if (is_comment) {
                    const link = `<br/><a href="${obj.path}" target="_blank">${obj.name}</a><br/>`;
                    this.new_comment.details = (this.new_comment.details || '') + link;
                }
            }

            if (uploadedCount) {
                this.toastSuccess(
                    uploadedCount === 1
                        ? this.$t('Attachment uploaded.')
                        : this.$t('{count} attachments uploaded.').replace('{count}', uploadedCount),
                    { duration: 2000 }
                );
            }
            e.target.value = '';
        },
        formatBytes(bytes) {
            if (!bytes) return '0 MB';
            if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`;
            return `${Math.round(bytes / 1024)}KB`;
        },
        uploadErrorMessage(error, file) {
            const status = error?.response?.status;
            const data = error?.response?.data;

            // 413 (or a dropped connection) means PHP/the web server refused the
            // body before Laravel saw it - almost always upload_max_filesize.
            if (status === 413 || !status) {
                return this.$t('{name}: too large for the server (max {limit}).')
                    .replace('{name}', file.name)
                    .replace('{limit}', this.formatBytes(this.maxUploadSize));
            }

            if (status === 422) {
                const fileErrors = data?.errors?.file;
                if (fileErrors && fileErrors.length) return fileErrors[0];
                if (data?.message) return data.message;
            }

            if (data?.message) return data.message;

            return this.$t('Failed to upload the file.');
        },
        async uploadFile(file) {
            try {
                let formData = new FormData();
                formData.append('file', file);
                const resp = await axios.post(this.route('task.attachment.add', this.task.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return resp.data;
            } catch (error) {
                console.error('Error uploading file:', error);
                return { error: true, message: this.uploadErrorMessage(error, file) };
            }
        },
        goToLink(link) {
            window.location.href = link;
        },
        startTimer(start_now) {
            let started = this.counter.timer.started_at
                ? this.moment.utc(this.counter.timer.started_at)
                : this.moment();
            let seconds = parseInt(this.moment.duration(this.moment().diff(started)).asSeconds());

            seconds = this.counter.timer.duration + seconds;
            this.counter.ticker = setInterval(() => {
                this.counter.seconds = ++seconds;
                this.activeTimerString = this.moment
                    .utc(
                        moment
                            .duration(this.counter.seconds + parseInt(this.counter.duration), 'seconds')
                            .as('milliseconds')
                    )
                    .format('H[h] m[m] s[s]');
            }, 1000);
            if (start_now) {
                this.eTimer(this.counter);
            }
        },
        eTimer(counter, stopped) {
            this.$page.props.counter = counter;
            this.$page.props.tracker = { started: true };
            if (stopped) {
                this.$page.props.tracker.started = false;
            }
        },
        startTracker() {
            axios
                .post(this.route('task.timer.start'), { task_id: this.task.id })
                .then((response) => {
                    if (response.data) {
                        this.counter.timer = response.data;
                        this.startTimer(true);
                        this.toastInfo(this.$t('Timer started.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to start the timer.'));
                });
        },
        stopTracker() {
            axios
                .post(this.route('task.timer.stop'), {
                    duration: this.counter.seconds,
                    id: this.counter.timer.id,
                    task_id: this.task.id,
                })
                .then((response) => {
                    if (response.data) {
                        this.stopTimer();
                        this.counter.duration = response.data;
                        this.toastSuccess(this.$t('Timer stopped and time logged.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to stop the timer.'));
                });
        },
        stopTimer() {
            clearInterval(this.counter.ticker);
            this.activeTimerString = '';
            this.eTimer(this.counter, true);
        },
        totalTime() {
            if (this.activeTimerString) {
                return this.activeTimerString;
            } else if (this.counter.duration) {
                return this.moment
                    .utc(moment.duration(this.counter.duration, 'seconds').as('milliseconds'))
                    .format('H[h] m[m] s[s]');
            }
            return '0:00:00';
        },
        calculateTimeSpent(timer) {
            if (timer.stopped_at) {
                const started = this.moment(timer.started_at);
                const stopped = this.moment(timer.stopped_at);
                return this.moment.duration(stopped.diff(started)).format();
            }
            return '';
        },
        async moveTask() {
            const project_id = this.move_object.project_id;
            const taskObject = {
                previous_list: this.task.list_id,
                new_list: this.move_object.list_id,
                from: this.task.order,
                to: this.move_object.order,
                task_id: this.task.id,
            };
            if (taskObject.previous_list !== taskObject.new_list) {
                taskObject.is_move = true;
                await this.saveTask({ list_id: taskObject.new_list });
            }
            if (this.task.project_id !== project_id) {
                await this.saveTask({ project_id });
            }
            await this.saveList(project_id, taskObject);
            Object.assign(this.task, { project_id, order: taskObject.to, list_id: taskObject.new_list });
            this.task.project = this.getSelectedProject();
            this.task.list = this.getSelectedList();
            this.showMoveCard = false;
            this.is_move = false;
            this.toastSuccess(this.$t('Task moved.'), { duration: 2000 });
        },
        saveList(project_id, taskObject) {
            axios.post(this.route('task.update.list', project_id), taskObject).catch((error) => {
                console.log(error);
                this.toastError(this.$t('Failed to move the task.'));
            });
        },
        /**
         * Read-only: it used to repair move_object.list_id on its own, which is
         * a write during render now that the options come from a computed.
         * selectMoveProject does the repair instead, when the project changes.
         */
        getSelectedList() {
            const lists = this.getSelectedProjectLists();
            const exact = lists.find((l) => l.id === this.move_object.list_id);

            return exact || lists[0] || { id: null, title: '', tasks_count: 0 };
        },

        /** Picking another project moves the card to that project's first list. */
        selectMoveProject(project_id) {
            this.move_object.project_id = project_id;

            const lists = this.getSelectedProjectLists();
            if (!lists.some((l) => l.id === this.move_object.list_id)) {
                this.move_object.list_id = lists.length ? lists[0].id : null;
                this.move_object.order = 1;
            }
        },

        selectMoveList(list_id) {
            this.move_object.list_id = list_id;
            // Back where it was if this is the card's own list; first place otherwise.
            this.move_object.order = list_id === this.task.list_id ? this.task.order : 1;
        },
        getSelectedProjectLists() {
            return this.list_items.filter((l) => l.project_id === this.move_object.project_id);
        },
        getSelectedListPostions() {
            const list = this.getSelectedList();
            const count = parseInt(list.tasks_count, 10) || 0;

            // Moving within the same list keeps the same number of slots;
            // arriving from another one adds a slot at the end.
            return Math.max(1, list.id === this.task.list_id ? count : count + 1);
        },
        getSelectedProject() {
            return this.projects.filter((p) => p.id === this.move_object.project_id)[0];
        },
        displayMoveCard() {
            this.move_object.project_id = this.task.project.id;
            this.move_object.list_id = this.task.list.id;
            this.move_object.order = this.task.order;
            this.showMoveCard = true;
        },
        searchLabel(input) {
            return this.labels.filter((lab) => lab.name.toLowerCase().indexOf(input) > -1);
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
        deleteLabel(id) {
            axios
                .post(this.route('labels.delete', id))
                .then(() => {
                    this.toastSuccess(this.$t('Label deleted.'));
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to delete the label.'));
                });
            const findIndex = this.labels.findIndex((l) => l.id === id);
            this.labels.splice(findIndex, 1);
            const tlIndex = this.task.task_labels.findIndex((tl) => tl.label_id === id);
            if (tlIndex > -1) {
                this.task.task_labels.splice(tlIndex, 1);
            }
            this.label = {};
        },
        saveLabel(labelObject) {
            labelObject.project_id = this.task.project_id;
            axios
                .post(this.route('labels.save'), labelObject)
                .then((response) => {
                    if (response.data && !labelObject.id) {
                        this.labels.push(response.data);
                    } else if (labelObject.id) {
                        const findIndex = this.labels.findIndex((l) => l.id === labelObject.id);
                        const tlIndex = this.task.task_labels.findIndex((tl) => tl.label_id === labelObject.id);
                        this.labels[findIndex] = labelObject;
                        if (tlIndex > -1) {
                            this.task.task_labels[tlIndex]['label'] = labelObject;
                        }
                    }
                    this.showEditLabelBox = false;
                    this.showLabelBox = true;
                    this.toastSuccess(this.$t('Label saved.'), { duration: 2000 });
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to save the label.'));
                });
            this.label = {};
        },
        addLabelToTask(checked, id) {
            axios
                .post(this.route('task.labels.add'), { task_id: this.task.id, label_id: id })
                .then((response) => {
                    if (response.data) {
                        if (checked) {
                            this.task.task_labels.push(response.data);
                        } else {
                            const findIndex = this.task.task_labels.findIndex((tl) => tl.label_id === id);
                            if (findIndex > -1) {
                                this.task.task_labels.splice(findIndex, 1);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to update labels.'));
                });
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

        // --- Group assignment ---
        assignGroupToTask(groupId) {
            if (!groupId || this.assigningGroup) return;
            const alreadyAssigned = (this.task.group_assignees || []).some(
                (ga) => Number(ga.user_group_id) === Number(groupId)
            );
            if (alreadyAssigned) {
                this.selectedGroupId = null;
                this.toastWarning(this.$t('This group is already assigned.'), { duration: 2500 });
                return;
            }

            this.assigningGroup = true;

            axios
                .post(this.route('task.group.assign'), { task_id: this.task.id, user_group_id: groupId })
                .then((response) => {
                    if (response.data) {
                        const existingIds = this.task_assignees();
                        (response.data.assignees || []).forEach((assignee) => {
                            if (!existingIds.includes(Number(assignee.user_id))) {
                                this.task.assignees.push(assignee);
                            }
                        });

                        if (!this.task.group_assignees) {
                            this.task.group_assignees = [];
                        }
                        if (response.data.group_assignee) {
                            const idx = this.task.group_assignees.findIndex(
                                (ga) => Number(ga.user_group_id) === Number(response.data.group_assignee.user_group_id)
                            );
                            if (idx > -1) {
                                this.task.group_assignees.splice(idx, 1, response.data.group_assignee);
                            } else {
                                this.task.group_assignees.push(response.data.group_assignee);
                            }
                        }

                        this.selectedGroupId = null;
                        this.toastSuccess(this.$t('Group assigned.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to assign the group.'));
                })
                .finally(() => {
                    this.assigningGroup = false;
                });
        },

        task_label_ids() {
            return this.task.task_labels.map((item) => item.label_id);
        },
        task_assignees() {
            return this.task.assignees.map((item) => Number(item.user_id));
        },
        saveDetails() {
            if (this.task.description) {
                const desc = this.task.description;
                this.editDescription = false;
                this.saveTask({ description: desc });
            }
        },
        async deleteTask() {
            try {
                await axios.post(this.route('task.delete', this.task.id), {});
                this.goToLink(
                    this.route(
                        this.view === 'table' ? 'projects.view.table' : 'projects.view.board',
                        this.task.project_id
                    )
                );
            } catch (error) {
                console.error(error);
                this.toastError(this.$t('Failed to delete the task.'));
            }
        },
        /**
         * A cleared date has to reach the server as null: moment() on an empty
         * value formats to the literal string "Invalid date", which Carbon then
         * refuses to parse and the save comes back a 500.
         */
        dateForSave(value) {
            if (!value) return null;
            const parsed = this.moment(value);
            return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : null;
        },

        saveTask(taskObject) {
            return axios
                .post(this.route('task.update', this.task.id), taskObject)
                .then((response) => {
                    if (response.data) {
                        // this.sendNotification('send.mail.task_update', response.data.id)
                    }
                    return response.data;
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to save changes.'));
                });
        },
        checklistDoneCount(checkList) {
            return checkList.filter((item) => !!item.is_done).length;
        },
        modifyCheck(check_list) {
            check_list.modify = true;
            setTimeout(() => {
                document.getElementById('modify_' + check_list.id).focus();
            }, 10);
        },
        deleteCheckList(id, index, checkLists) {
            axios
                .post(this.route('check_list.delete', id))
                .then(() => {
                    this.toastSuccess(this.$t('Checklist item deleted.'), { duration: 2000 });
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to delete the checklist item.'));
                });
            checkLists.splice(index, 1);
        },
        deleteComment(id, comments, activity_id) {
            axios
                .post(this.route('comment.delete', id))
                .then((response) => {
                    if (response.data) {
                        comments.unshift(response.data);
                        const findIndex = this.task.activities.findIndex((activity) => activity.id === activity_id);
                        if (findIndex !== -1) {
                            this.task.activities.splice(findIndex, 1);
                        }
                        this.toastSuccess(this.$t('Comment deleted.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to delete the comment.'));
                });
        },
        modifyCheckListSubmit(check_list, c_index, checklist) {
            if (!check_list.title) {
                this.deleteCheckList(check_list.id, c_index, checklist);
            } else {
                this.saveCheckList(check_list.id, { title: check_list.title });
            }
            check_list.modify = false;
        },
        inputNewChecklistAction(check_list, e) {
            if ((e && e.keyCode === 13) || !e) {
                if (!check_list.title) {
                    this.newCheckList = false;
                } else {
                    this.saveNewCheckList({ title: check_list.title, task_id: this.task.id }, this.task.checklists);
                    this.openNewChecklist();
                }
            }
        },
        saveCheckList(id, checkListObject) {
            axios.post(this.route('check_list.update', id), checkListObject).catch((error) => {
                console.log(error);
                this.toastError(this.$t('Failed to update the checklist item.'));
            });
        },
        saveComment(id, commentObject) {
            commentObject.updated_at = this.moment().format('YYYY-MM-DD HH:mm:ss');
            axios
                .post(this.route('comment.update', id), {
                    details: commentObject.details,
                    updated_at: commentObject.updated_at,
                })
                .then(() => {
                    this.toastSuccess(this.$t('Comment updated.'), { duration: 2000 });
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to update the comment.'));
                });
        },
        saveNewCheckList(checkListObject, currentCheckList) {
            this.new_chek_list.title = '';
            axios
                .post(this.route('check_list.new'), checkListObject)
                .then((response) => {
                    if (response.data) {
                        currentCheckList.push(response.data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to add the checklist item.'));
                });
        },
        saveNewComment(commentObject, currentComments) {
            this.new_comment.details = '';
            commentObject.created_at = this.moment().format('YYYY-MM-DD HH:mm:ss');
            axios
                .post(this.route('comments.new'), commentObject)
                .then((response) => {
                    if (response.data) {
                        this.showCommentBox = false;
                        currentComments.unshift(response.data);
                        this.toastSuccess(this.$t('Comment posted.'), { duration: 2000 });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to post the comment.'));
                });
        },
        sendNotification(uri, id, user_id) {
            const data = { id };
            if (!!user_id) {
                data.user_id = user_id;
            }
            axios.post(this.route(uri, data)).catch((error) => {
                console.log(error);
            });
        },
        closeOnError() {
            if (this.isPopup) {
                this.$emit('closeModal', true);
            } else if (window.history.length > 1) {
                window.history.back();
            }
        },
        async getTask(id) {
            this.fetchFailed = false;
            try {
                const taskResponse = await axios.get(this.route('json.task.get', id));

                if (taskResponse.data && Object.keys(taskResponse.data).length) {
                    this.task = taskResponse.data;
                    this.counter.timer = this.task.timer || null;

                    if (this.counter.timer?.task_id === this.task?.id) {
                        this.startTimer();
                    }

                    await this.getOtherData();
                } else {
                    this.fetchFailed = true;
                    this.toastError(this.$t('Something went wrong loading this task.'));
                }
            } catch (error) {
                console.error('Error fetching task:', error);
                this.fetchFailed = true;
                this.toastError(this.$t('This task could not be found.'));
            } finally {
                this.loading = false;
            }
        },
        saveTitle(e) {
            if (e.keyCode === 13 || e.type === 'blur') {
                e.preventDefault();
                e.target.blur();
                if (e.target.innerText) {
                    const title = e.target.innerText;
                    axios
                        .post(this.route('task.update', this.task.id), { title })
                        .then((response) => {
                            if (response.data) {
                                // this.sendNotification('send.mail.task_update', response.data.id)
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            this.toastError(this.$t('Failed to update the title.'));
                        });
                }
            }
        },
        async getOtherData() {
            const dataResponse = await axios.get(
                this.route('task.other.data', { task_id: this.task.id, project_id: this.task.project_id })
            );
            const res = dataResponse.data;
            this.labels = res.labels || [];
            this.list_items = res.lists || [];
            this.projects = res.projects || [];
            this.team_members = res.team_members || [];
            this.existing_timer = res.timer || null;
            this.counter.duration = res.duration || 0;
            this.move_object.order = this.task.order;

            this.documentSources = res.document_sources || [];
            this.documentTypes = res.document_types || [];
            this.priorities = res.priorities || [];
            this.userGroups = res.user_groups || [];

            this.loadAvailableUsers();

            setTimeout(async () => {
                if (this.task.cover && this.$refs.t__cover) {
                    this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(this.task.cover.path);
                }
            });
        },

        selectDocumentSource(id) {
            this.task.document_source_id = id;
            this.showSourceBox = false;
            this.source_search = '';
            this.saveTask({ document_source_id: id }).then(() => {
                this.toastSuccess(this.$t('Document source updated.'), { duration: 2000 });
            });
        },

        selectDocumentType(id) {
            this.task.type_id = id;
            this.showTypeBox = false;
            this.type_search = '';
            this.saveTask({ type_id: id }).then(() => {
                this.toastSuccess(this.$t('Document type updated.'), { duration: 2000 });
            });
        },

        selectPriority(id) {
            this.task.priority_id = id;
            this.showPriorityBox = false;
            this.priority_search = '';
            this.saveTask({ priority_id: id }).then(() => {
                this.toastSuccess(this.$t('Priority updated.'), { duration: 2000 });
            });
        },

        // Custom Editor Methods
        loadAvailableUsers() {
            this.availableUsers = [];

            if (this.task && this.task.project && this.task.project.team_members) {
                this.availableUsers = this.task.project.team_members.map((member) => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    avatar: member.user.avatar || member.user.photo_path,
                }));
            } else if (this.team_members && this.team_members.length > 0) {
                this.availableUsers = this.team_members.map((member) => ({
                    id: member.user ? member.user.id : member.id,
                    name: member.user ? member.user.name : member.name,
                    email: member.user ? member.user.email : member.email,
                    avatar: member.user ? member.user.avatar || member.user.photo_path : member.avatar,
                }));
            } else if (this.task && this.task.assignees && this.task.assignees.length > 0) {
                this.availableUsers = this.task.assignees.map((assignee) => ({
                    id: assignee.user.id,
                    name: assignee.user.name,
                    email: assignee.user.email,
                    avatar: assignee.user.avatar || assignee.user.photo_path,
                }));
            } else if (this.$page.props.auth.user) {
                this.availableUsers = [
                    {
                        id: this.$page.props.auth.user.id,
                        name: this.$page.props.auth.user.name,
                        email: this.$page.props.auth.user.email,
                        avatar: this.$page.props.auth.user.avatar || this.$page.props.auth.user.photo_path,
                    },
                ];
            }
        },

        onMention(user) {
            this.$emit('mention', user);
        },

        onEditorReady(editor) {
            console.log('Editor ready (legacy method)');
        },
    },
    created() {
        this.moment = moment;
        this.getTask(this.id);
    },
    mounted() {
        let self = this;
        window.addEventListener('keyup', function (ev) {
            if (ev.key === 'Escape') {
                if (self.isPopup) {
                    self.$emit('closeModal', true);
                } else {
                    self.goToLink(
                        self.route(
                            self.view === 'table' ? 'projects.view.table' : 'projects.view.board',
                            task.project.slug || task.project.id
                        )
                    );
                }
            }
        });
    },
    beforeUnmount() {
        if (this.mentionTimeout) {
            clearTimeout(this.mentionTimeout);
            this.mentionTimeout = null;
        }
        // Clear any pending toast timers
        this.toasts.forEach((t) => clearTimeout(t.timer));
    },
    name: 'task-details',
};
</script>

<style scoped>
.mention-popup {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 280px;
    max-width: 90vw;
    overflow: hidden;
    animation: slideUp 0.2s ease-out;
}

.dark .mention-popup {
    background: #1f2937;
    border: 1px solid #374151;
}

.mention-popup__header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    background: #f8fafc;
}

.dark .mention-popup__header {
    border-bottom: 1px solid #374151;
    background: #111827;
}

.mention-popup__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    flex-shrink: 0;
}

.mention-popup__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.mention-popup__avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
}

.mention-popup__info {
    flex: 1;
    min-width: 0;
}

.mention-popup__name {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dark .mention-popup__name {
    color: #f3f4f6;
}

.mention-popup__email {
    color: #64748b;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dark .mention-popup__email {
    color: #9ca3af;
}

.mention-popup__close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.dark .mention-popup__close {
    color: #9ca3af;
}

.mention-popup__close:hover {
    background: #e2e8f0;
    color: #374151;
}

.dark .mention-popup__close:hover {
    background: #374151;
    color: #f3f4f6;
}

.mention-popup__content {
    padding: 12px 16px;
}

.mention-popup__details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mention-popup__detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 12px;
}

.dark .mention-popup__detail-item {
    color: #9ca3af;
}

.mention-popup__detail-item svg {
    color: #94a3b8;
    flex-shrink: 0;
}

.dark .mention-popup__detail-item svg {
    color: #6b7280;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.prose .mention {
    background: #dbeafe;
    color: #1d4ed8;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dark .prose .mention {
    background: #1e3a8a;
    color: #93c5fd;
}

.prose .mention:hover {
    background: #bfdbfe;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .prose .mention:hover {
    background: #1e40af;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.custom-date-picker,
.custom-datetime-picker,
.custom-time-picker {
    position: relative;
    z-index: 1;
}

.custom-date-picker .calendar-dropdown,
.custom-datetime-picker .datetime-picker-dropdown,
.custom-time-picker .time-picker-dropdown {
    position: fixed !important;
    z-index: 10000 !important;
    max-height: 400px;
    overflow-y: auto;
}

.custom-date-picker .calendar-dropdown {
    min-width: 280px;
    max-width: 320px;
}

.custom-datetime-picker .datetime-picker-dropdown {
    min-width: 400px;
    max-width: 450px;
}

.custom-time-picker .time-picker-dropdown {
    min-width: 320px;
    max-width: 360px;
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
</style>
