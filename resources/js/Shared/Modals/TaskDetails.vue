<template>
    <Head v-if="!loading" :title="$t(task.title + ' | ' + task.project.title)" />
    <div class="task__details">
        <div class="wrapper" id="modal">
            <div role="alert" class="container">
                <div v-if="loading" class="content">
                    <div role="status" class="td__loader">
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div><div class="i__r" /></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div></div>
                        <div class="__f"><div><div class="i__1" /><div class="i__2" /></div></div>
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div v-else class="content w-full">
                    <div v-if="task.cover" ref="t__cover" class="t__cover" :style="{backgroundImage: 'url('+task.cover.path+')'}"></div>
                    <div v-if="task.is_archive" class="archive___task dark:bg-yellow-900/30 dark:text-yellow-200">
                        <icon name="archive" />
                        {{ $t('This task is archived.') }}
                    </div>
                    <div class="close_area">
                        <div class="wrap">
                                <span v-if="isPopup" @click="$emit('closeModal', true)" class="close__b">
                                    <icon class="h-6 w-6 dark:text-gray-300" name="close" />
                                </span>
                            <button v-else @click="goToLink(route(view === 'table'?'projects.view.table':'projects.view.board', task.project.slug || task.project.id))" class="close__b">
                                <icon class="h-6 w-6 dark:text-gray-300" name="close" />
                            </button>
                        </div>
                    </div>
                    <div class="mv__card bg-white dark:bg-gray-800 dark:border-gray-700" v-if="showMoveCard" :class="{'!left-auto right-6 top-23':is_move}">
                        <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Move Card') }}</h4>
                        <div class="close__b absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" @click="showMoveCard = false;is_move = false"><icon class=" w-4 h-4 dark:text-gray-300" name="close" /></div>
                        <span class="title mt-4 mb-1 font-bold dark:text-gray-200">{{ $t('Select a destination') }}</span>
                        <div class="td__btn relative flex flex-col rounded bg-gray-100 dark:bg-gray-700 mb-3 px-3 py-2.5">
                            <span class="mb-1 dark:text-gray-300">{{ $t('Project') }}</span>
                            <span class="text-[14px] font-bold dark:text-white">{{ getSelectedProject().title }}</span>
                            <select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" v-model="move_object.project_id">
                                <option v-for="project in this.projects" :value="project.id">{{ project.title }}</option>
                            </select>
                        </div>
                        <div class="flex gap-2">
                            <div class="td__btn relative flex flex-col w-[70%] rounded bg-gray-100 dark:bg-gray-700 px-3 py-2.5">
                                <span class="mb-1 dark:text-gray-300">{{ $t('List') }}</span>
                                <span class="text-[14px] font-bold dark:text-white">{{ getSelectedList().title }}</span>
                                <select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" v-model="move_object.list_id" @change="move_object.order=move_object.list_id === this.task.list_id?this.task.order: 1">
                                    <option v-for="list_item in getSelectedProjectLists()" :value="list_item.id">{{ list_item.title }}</option>
                                </select>
                            </div>
                            <div class="td__btn relative flex flex-col w-[30%] rounded bg-gray-100 dark:bg-gray-700 px-3 py-2.5">
                                <span class="mb-1 dark:text-gray-300">{{ $t('Position') }}</span>
                                <span class="text-[14px] font-bold dark:text-white">{{ move_object.order }}</span>
                                <select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" v-model="move_object.order">
                                    <option v-for="list_item in [...Array(getSelectedListPostions()).keys()].map(x => ++x)" :value="list_item">{{ list_item }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-between items-center action__buttons mt-3">
                            <button type="button" class="small save" @click="moveTask()">{{ $t('Move') }}</button>
                        </div>
                    </div>
                    <div class="m__body w-full">
                        <main class="main">
                            <div class="s__1">
                                <div class="checklist-box">
                                    <input type="checkbox" :checked="!!task.is_done" @change="saveTask({is_done: $event.target.checked})" />
                                    <icon name="checklist_box" />
                                </div>
                                <div class="t__l">
                                    <h2 class="__t" contenteditable="true" @keyup.enter="saveTitle($event)" @blur="saveTitle($event)">
                                        {{ task.title }}
                                    </h2>
                                    <span class="text-xs dark:text-gray-300">in list <span class="cursor-pointer underline dark:text-gray-200" @click="displayMoveCard()">{{ task.list.title }}</span> </span>

                                    <div class="flex flex-col mt-5">
                                        <span class="text-xs font-bold mb-1 dark:text-gray-300">{{ $t('Labels') }}</span>
                                        <div class="list_labels flex flex-wrap gap-1">
                                            <button @click="showLabelBox = true" class="label_button" v-for="(task_label, label_index) in task.task_labels" :style="{ background: task_label.label.color }" :aria-label="task_label.label.name" data-a="">{{ task_label.label.name }}</button>
                                            <button @click="showLabelBox = true" class="label_button bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"><icon class="dark:text-gray-300" name="plus" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" v-if="showLabelBox">
                                <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Labels') }}</h4>
                                <div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" @click="showLabelBox = false" >
                                    <icon class=" w-4 h-4 dark:text-gray-300" name="close" />
                                </div>
                                <input v-model="label_search" class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400" :placeholder="$t('Search labels')" />
                                <ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto">
                                    <li v-for="(lab, lab_index) in searchLabel(label_search)">
                                        <label class="flex gap-1">
                                            <input class="w-5 mr-2 cursor-pointer" type="checkbox" :checked="task_label_ids().includes(lab.id)" @change="addLabelToTask($event.target.checked, lab.id)">
                                            <span class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80" :style="{background: lab.color}" :tabindex="lab_index" :aria-label="lab.name" data-color="orange">{{ lab.name }}</span>
                                            <button class="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" type="button" :tabindex="lab_index" @click="label = lab; showLabelBox = false; showEditLabelBox = true;">
                                                <icon class="w-3 h-3 dark:text-gray-300" name="edit" />
                                            </button>
                                        </label>
                                    </li>
                                </ul>
                                <button class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 dark:bg-gray-700 dark:text-white hover:opacity-80 dark:hover:bg-gray-600" @click="showLabelBox = false; showEditLabelBox = true; label = {}"> {{ $t('Create a new label') }} </button>
                            </div>
                            <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" v-if="showEditLabelBox">
                                <div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 left-3 p-1.5 rounded" @click="showEditLabelBox = false;showLabelBox = true"><icon class=" w-4 h-4 dark:text-gray-300" name="arrow-left" /></div>
                                <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Edit Labels') }}</h4>
                                <div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" @click="showEditLabelBox = false"><icon class=" w-4 h-4 dark:text-gray-300" name="close" /></div>
                                <span class="w-full px-3 py-2 rounded cursor-pointer bg-gray-100 dark:bg-gray-700 hover:opacity-80" :style="{background: label.color}" :tabindex="0" :aria-label="label.name">{{ label.name }}</span>
                                <span class="title mt-4 font-bold mb-2 dark:text-gray-200">{{ $t('Title') }}</span>
                                <input class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px]" placeholder="" v-model="label.name" />
                                <span class="title mt-4 mb-1 font-bold dark:text-gray-200">{{ $t('Select a color') }}</span>
                                <div class="color__wrapper grid gap-1 mb-2 max-h-[120px] overflow-hidden overflow-y-auto">
                                    <div v-for="color in colors" class="h-8 box cursor-pointer">
                                        <div class="w-full h-full border-[2px] rounded border-transparent hover:border-red-600" :title="color.name" :aria-label="color.name" :style="{backgroundColor:color.color}" @click="label.color = color.color"></div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center action__buttons mt-2">
                                    <button type="button" class="small save" @click="saveLabel(label)">{{ $t('Save') }}</button>
                                    <button v-if="label.id" @click="deleteLabel(label.id);showEditLabelBox=false;showLabelBox=true" type="button" class="small cancel">{{ $t('Delete') }}</button>
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
                                    <div v-if="!editDescription" class="prose pt-4 text-sm cursor-pointer" @click="onDescriptionClick" v-html="task.description || 'Add more details...'"></div>
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
                                            <button type="button" class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" @click="saveDetails();">{{ $t('Save') }}</button>
                                            <button @click="editDescription = false" type="button" class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1">{{ $t('Cancel') }}</button>
                                        </div>
                                    </section>
                                </div>

                            </section>

                            <section class="mt-6" id="checklist">
                                <div>
                                    <div class="flex">
                                        <Icon class="w-5 h-5 mr-3" name="checklist" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{ $t('Checklist') }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400">{{ checklistDoneCount(task.checklists) }}/{{ task.checklists.length }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div class="space-y-4">
                                        <div v-for="(check_list, c_index) in task.checklists" :key="check_list.id || c_index" class="group relative flex items-center">

                                            <!-- View Mode -->
                                            <div class="checklist-box2" v-if="!check_list.modify">
                                                <input
                                                    class="inp-cbx"
                                                    :id="'cbx-' + check_list.id"
                                                    :checked="!!check_list.is_done"
                                                    @click="check_list.is_done = $event.target.checked; saveCheckList(check_list.id, {is_done: check_list.is_done})"
                                                    type="checkbox"
                                                    style="display: none;"
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
                                                    :id="'modify_'+check_list.id"
                                                    class="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm bg-white w-full"
                                                    v-model="check_list.title"
                                                    @keyup="$event.keyCode === 13 ? modifyCheckListSubmit(check_list, c_index, task.checklists) : ''"
                                                />
                                                <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                    <div class="flex items-center gap-2 action__buttons">
                                                        <button type="button" class="small save" @click="modifyCheckListSubmit(check_list, c_index, task.checklists)">
                                                            {{ $t('Save') }}
                                                        </button>
                                                        <button @click="check_list.modify = false" type="button" class="small cancel">
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

                                                        <label class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1">
                                                            <icon class="w-3 h-3" name="paperclip" />
                                                            {{ $t('Attach New') }}
                                                            <input type="file" class="hidden" @change="attachNewFile($event, check_list)" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Action Icons (Hover) -->
                                            <div class="absolute right-0 hidden pl-4 group-hover:flex" v-if="!check_list.modify">
                                                <icon class="w-4 h-4 mr-3 cursor-pointer" name="edit" @click="modifyCheck(check_list)" />
                                                <icon class="w-4 h-4 cursor-pointer" name="trash" @click="deleteCheckList(check_list.id, c_index, task.checklists)" />
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
                                                        <button type="button" class="small save" @click="inputNewChecklistAction(new_chek_list)">
                                                            {{ $t('Save') }}
                                                        </button>
                                                        <button @click="newCheckList = false" type="button" class="small cancel">
                                                            {{ $t('Cancel') }}
                                                        </button>
                                                    </div>

                                                    <!-- NEW: Attach File for New Checklist Item -->
                                                    <div class="flex items-center gap-2">
                                                        <label class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1">
                                                            <icon class="w-3 h-3" name="paperclip" />
                                                            {{ $t('Attach New') }}
                                                            <input type="file" class="hidden" @change="attachNewFile($event)" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button class="group flex items-center mt-6" @click="openNewChecklist()">
                                        <icon class="w-5 h-5 dark:text-gray-300" name="add" />
                                        <span class="pl-2 text-sm group-hover:opacity-70 dark:text-gray-300">{{ $t('Add a new item') }}</span>
                                    </button>
                                </div>

                            </section>

                            <section class="mt-8">
                                <div>
                                    <div class="flex">
                                        <icon class="w-4 h-4 mr-3 mt-1" name="attachment" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{ $t('Attachments') }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400">{{ task.attachments.length }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div class="flex flex-col gap-2 text-sm">
                                        <div v-for="(attachment, a_index) in sortedAttachments" :key="attachment.id || a_index" class="__attachment flex gap-3 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                            <div class="preview flex-shrink-0" :aria-label="attachment.name">
                                                <div v-if="isImage(attachment.name)" class="w-16 h-16 bg-cover bg-center rounded" :style="{'backgroundImage': `url(${attachment.path})`}" :alt="attachment.name" />
                                                <div v-else class="w-16 h-16 bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-semibold uppercase rounded">
                                                    {{ attachment.name.split('.').pop() }}
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-2 w-full">
                                                <div class="font-bold truncate max-w-full dark:text-gray-200">
                                                    <a :href="attachment.path" target="_blank" class="block break-words truncate text-ellipsis max-w-[260px] dark:text-blue-400">
                                                        {{ attachment.name }}
                                                    </a>
                                                </div>
                                                <div class="flex gap-3 dark:text-gray-400">
                                                    <span :aria-label="moment(attachment.created_at).format('MMMM D, YYYY h:mm A')">
                                                        {{ moment(attachment.created_at).format('[Added] MMM D, YYYY [at] h:mm A') }}
                                                    </span>
                                                    -
                                                    <span class="flex underline cursor-pointer dark:text-gray-300 hover:text-red-500" @click="deleteAttachment(attachment.id)">
                                                        {{ $t('Delete') }}
                                                    </span>
                                                </div>
                                                <div class="flex flex-wrap gap-2 pt-1">
                                                    <!-- Download -->
                                                    <a class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer" :href="attachment.path" :download="attachment.name">
                                                        <icon name="download" /> {{ $t('Download') }}
                                                    </a>

                                                    <!-- View Modal Trigger -->
                                                    <button class="cover dark:text-gray-300 flex items-center gap-1" @click="openViewModal(attachment)">
                                                        <icon name="eye" /> {{ $t('View') }}
                                                    </button>

                                                    <!-- Make/Remove Cover (Images Only) -->
                                                    <div v-if="isImage(attachment.name) && (!task.cover || task.cover.id !== attachment.id)" class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer" @click="makeCover(task, attachment)">
                                                        <icon name="image" /> {{ $t('Make Cover') }}
                                                    </div>
                                                    <div v-if="task.cover && task.cover.id === attachment.id" class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer" @click="removeCover(task)">
                                                        <icon name="image" /> {{ $t('Remove Cover') }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Modal 1: Image / File Preview Modal -->
                                    <transition name="modal-pop" appear>
                                    <div v-if="viewModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click.self="closeViewModal">
                                        <div class="modal-pop__panel relative max-w-5xl xl:max-w-6xl max-h-[94vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col p-4 shadow-xl w-full">

                                            <!-- Modal Header -->
                                            <div class="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                                <h3 class="font-bold text-lg dark:text-gray-100 truncate pr-4">{{ viewModal.attachment?.name }}</h3>
                                                <div class="flex items-center gap-2 flex-shrink-0">
                                                    <a :href="viewModal.attachment?.path" :download="viewModal.attachment?.name" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                                        <icon name="download" class="w-3.5 h-3.5" /> {{ $t('Download') }}
                                                    </a>
                                                    <button @click="closeViewModal" class="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl px-2">&times;</button>
                                                </div>
                                            </div>

                                            <!-- Scrollable body: assignees + draw/preview -->
                                            <div class="flex-1 overflow-y-auto">

                                                <!-- Assignees (PDF only) -->
                                                <div v-if="isPdf(viewModal.attachment?.name)" class="pt-3">
                                                    <div class="flex items-center px-2">
                                                        <h2 class="text-sm font-medium dark:text-gray-300">
                                                            {{ $t('Assignees') }}
                                                        </h2>

                                                        <div class="relative ml-auto" modal="true" name="task-assign">
                                                            <div>
                                                                <span class="cursor-pointer" @click="showAssigneeBoxPreview = true"><icon class="h-5 w-5 hover:opacity-80 dark:text-gray-300" name="add" /></span>
                                                            </div>

                                                            <div class="absolute right-1 flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" v-if="showAssigneeBoxPreview">
                                                                <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Assignee') }}</h4>
                                                                <div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" @click="showAssigneeBoxPreview = false">
                                                                    <icon class="w-4 h-4 dark:text-gray-300" name="close" />
                                                                </div>
                                                                <input id="t_d_s_u_preview" v-model="user_search" class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400" :placeholder="$t('Search User')" />
                                                                <ul class="flex flex-col mt-3 gap-1 h-48 max-h-48 overflow-y-auto">
                                                                    <li v-for="(userObject, user_index) in searchUser(user_search)" :key="'preview_'+user_index">
                                                                        <label :for="'td_u_id_preview_'+user_index" class="flex p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                                                            <input :id="'td_u_id_preview_'+user_index" class="w-5 ml-1 mr-2" type="checkbox" :checked="task_assignees().includes(userObject.user_id)" @change="assignUserToTask($event.target.checked, userObject.user_id)">
                                                                            <img v-if="userObject.user.photo_path" :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" :src="userObject.user.photo_path" />
                                                                            <img v-else :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" src="/images/user.svg" />
                                                                            <span data-a="" class="p-1 dark:text-gray-200" type="button" :tabindex="user_index">
                                                                                {{ userObject.user.name }}
                                                                            </span>
                                                                        </label>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="flex flex-wrap gap-1 px-2 mt-2">
                                                        <span v-for="assignee in task.assignees" :key="assignee.id" :aria-label="assignee.user.name" class="block rounded-full h-8 w-8 border-2 border-white dark:border-gray-800">
                                                            <img v-if="assignee.user.photo_path" class="h-full w-full rounded-full" :src="assignee.user.photo_path" :alt="assignee.user.name">
                                                            <img v-else class="h-full w-full rounded-full" src="/images/user.svg" :alt="assignee.user.name">
                                                        </span>
                                                        <span v-if="!task.assignees || !task.assignees.length" class="text-xs text-gray-500 dark:text-gray-400">{{ $t('No assignees yet.') }}</span>
                                                    </div>
                                                </div>

                                                <!-- Preview Container (images) -->
                                                <div v-if="isImage(viewModal.attachment?.name)" class="flex items-center justify-center p-4">
                                                    <img :src="viewModal.attachment?.path" :alt="viewModal.attachment?.name" class="max-h-[65vh] object-contain rounded" />
                                                </div>

                                                <!-- Draw / Add Note (PDF only): a standard, self-contained markup
                                                     editor — dark canvas with the page floating in the center,
                                                     Undo/Redo/Save pinned to a top bar, and a bottom control bar
                                                     with color swatches + big Sketch/Text tool buttons, matching a
                                                     standard mobile markup tool. Real PDF shown via iframe (native
                                                     browser rendering — no pdf.js, so no worker/version issues). -->
                                                <div v-if="isPdf(viewModal.attachment?.name)" class="-mx-4 -mb-4 mt-3 rounded-b-lg overflow-hidden bg-gray-900">

                                                    <!-- Top bar: View toggle + Undo/Redo (left), Save (right) -->
                                                    <div class="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-white/10">
                                                        <div class="flex items-center gap-1.5">
                                                            <button type="button" @click="drawTool = 'view'" :class="drawTool === 'view' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :title="$t('View / scroll all pages')">
                                                                <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>
                                                            </button>
                                                            <button type="button" @click="undoDraw" :disabled="!historyStack.length" class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0" :title="$t('Undo')">
                                                                <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M9 7 4 12l5 5M4 12h10a6 6 0 010 12h-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                            </button>
                                                            <button type="button" @click="redoDraw" :disabled="!redoStack.length" class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0" :title="$t('Redo')">
                                                                <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M15 7l5 5-5 5M20 12H10a6 6 0 000 12h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                            </button>
                                                            <button type="button" @click="showDocumentNotes = !showDocumentNotes" class="ml-1 h-8 px-3 rounded-full flex items-center gap-1 text-xs font-medium flex-shrink-0" :class="showDocumentNotes ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'">
                                                                <icon name="note" class="w-3.5 h-3.5" />
                                                                {{ $t('Notes') }}
                                                                <span v-if="documentNotesCount" class="px-1.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">{{ documentNotesCount }}</span>
                                                            </button>
                                                        </div>
                                                        <button v-if="drawTool !== 'view' || hasUnsavedAnnotations" type="button" @click="manualSaveAnnotation" :disabled="autoSaving" class="px-5 py-1.5 rounded-full bg-white text-gray-900 text-xs font-semibold disabled:opacity-50 flex-shrink-0">
                                                            {{ autoSaving ? $t('Saving...') : $t('Save') }}
                                                        </button>
                                                    </div>

                                                    <!-- Page navigator: the browser's native PDF viewer doesn't let
                                                         scripts read what page you've scrolled to, so free scrolling
                                                         in View can't be tracked automatically — use these arrows
                                                         instead and both View and any note tool stay on the same
                                                         page, with sketches/notes always following this page number. -->
                                                    <div v-if="totalPdfPages > 1" class="flex items-center justify-center gap-3 px-4 py-2 bg-gray-900 border-b border-white/10">
                                                        <button type="button" @click="goToDrawPage(-1)" :disabled="currentDrawPage <= 1" class="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                                            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                        </button>
                                                        <span class="text-xs text-white/80 font-medium min-w-[70px] text-center">{{ $t('Page') }} {{ currentDrawPage }} / {{ totalPdfPages }}</span>
                                                        <button type="button" @click="goToDrawPage(1)" :disabled="currentDrawPage >= totalPdfPages" class="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                                            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                        </button>
                                                        <span v-if="drawTool !== 'view' && dirtyPages[currentDrawPage]" class="w-1.5 h-1.5 rounded-full bg-blue-400" :title="$t('This page has unsaved notes')"></span>
                                                    </div>

                                                    <!-- Notes for this document: every saved annotated version of this
                                                         PDF (from clicking Save), plus any comments that reference it. -->
                                                    <div v-if="showDocumentNotes" class="border-b border-white/10 bg-gray-800">
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

                                                        <div class="max-h-[220px] overflow-y-auto divide-y divide-white/10">
                                                            <div v-if="!documentVersions.length && !documentComments.length" class="px-3 py-4 text-xs text-white/50 text-center">
                                                                {{ $t('No notes yet — pick Sketch or Text, add a note, then click Save.') }}
                                                            </div>

                                                            <button
                                                                v-for="version in documentVersions"
                                                                :key="'note_v_'+version.id"
                                                                type="button"
                                                                class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                                                                :class="{ 'bg-blue-500/10': viewModal.attachment && viewModal.attachment.id === version.id }"
                                                                @click="openViewModal(version)"
                                                            >
                                                                <icon name="edit" class="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                                                                <div class="flex-1 min-w-0">
                                                                    <div class="text-xs font-medium truncate text-white/90">
                                                                        {{ version.isOriginal ? $t('Original document') : $t('Annotated version') }}
                                                                    </div>
                                                                    <div class="text-[11px] text-white/50">
                                                                        {{ moment(version.created_at).format('MMM D, YYYY [at] h:mm A') }}
                                                                    </div>
                                                                </div>
                                                                <span v-if="viewModal.attachment && viewModal.attachment.id === version.id" class="text-[10px] font-semibold text-blue-400 flex-shrink-0">{{ $t('Viewing') }}</span>
                                                            </button>

                                                            <div v-for="comment in documentComments" :key="'note_c_'+comment.id" class="flex gap-2.5 px-3 py-2.5">
                                                                <img v-if="comment.user?.photo_path" class="w-6 h-6 rounded-full flex-shrink-0" :src="comment.user.photo_path" :alt="comment.user.first_name" />
                                                                <img v-else class="w-6 h-6 rounded-full flex-shrink-0" src="/images/user.svg" alt="" />
                                                                <div class="flex-1 min-w-0">
                                                                    <div class="flex items-center gap-2">
                                                                        <span class="text-xs font-medium text-white/90">{{ comment.user?.first_name }} {{ comment.user?.last_name }}</span>
                                                                        <span class="text-[11px] text-white/50">{{ moment(comment.created_at).format('MMM D, YYYY [at] h:mm A') }}</span>
                                                                    </div>
                                                                    <div class="prose prose-sm prose-invert text-xs text-white/80 t_a_h" v-html="comment.details"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- Page stage: dark canvas, page centered with shadow.
                                                         View mode uses the browser's native PDF viewer (fine for
                                                         free scrolling). Any drawing tool instead renders the exact
                                                         page as a real <canvas> via pdf.js — that's what fixes notes
                                                         landing in the wrong spot: the native viewer's own toolbar/
                                                         margins never lined up pixel-for-pixel with our overlay, but
                                                         a page we render ourselves always matches exactly. -->
                                                    <div class="flex items-center justify-center px-4 py-6">
                                                        <div ref="drawStage" class="modal-pop__stage relative bg-white rounded shadow-2xl overflow-hidden mx-auto w-full" style="max-width: 880px;">
                                                            <iframe v-if="drawTool === 'view'" :key="'view-' + currentDrawPage" :src="pdfIframeSrc" class="absolute inset-0 w-full h-full border-0"></iframe>
                                                            <canvas v-show="drawTool !== 'view'" ref="pdfRenderCanvas" class="absolute inset-0 w-full h-full"></canvas>
                                                            <canvas
                                                                v-show="drawTool !== 'view'"
                                                                ref="drawCanvas"
                                                                class="absolute inset-0 w-full h-full touch-none"
                                                                :class="drawTool === 'text' ? 'cursor-text pointer-events-auto' : 'cursor-crosshair pointer-events-auto'"
                                                                @mousedown="startDrawing"
                                                                @mousemove="draw"
                                                                @mouseup="stopDrawing"
                                                                @mouseleave="stopDrawing"
                                                                @touchstart="startDrawing"
                                                                @touchmove="draw"
                                                                @touchend="stopDrawing"
                                                            ></canvas>

                                                            <!-- Loading overlay: shown while pdf.js is opening the
                                                                 document or rendering a page, so tool/page switches
                                                                 never look like a silent blank freeze. -->
                                                            <transition name="modal-fade">
                                                                <div v-if="isRenderingPage && drawTool !== 'view'" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                                                                    <div class="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin"></div>
                                                                </div>
                                                            </transition>

                                                            <!-- Floating input for the Text tool: appears where you
                                                                 clicked; confirming adds it as a new draggable note
                                                                 below (not baked onto the canvas until Save). -->
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
                                                                    <button type="button" @click="cancelTextInput" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">{{ $t('Cancel') }}</button>
                                                                    <button type="button" @click="confirmTextInput" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{{ $t('Add') }}</button>
                                                                </div>
                                                            </div>

                                                            <!-- Placed text notes: draggable, like a standard PDF note
                                                                 tool — grab and move anywhere on the page, or delete
                                                                 via the × that appears on hover. Hidden in View mode
                                                                 since they're positioned relative to the draw frame. -->
                                                            <template v-if="drawTool !== 'view'">
                                                                <div
                                                                    v-for="note in textNotes"
                                                                    :key="'tn_' + note.id"
                                                                    class="absolute z-10 group select-none"
                                                                    :style="{ left: note.x + 'px', top: note.y + 'px', color: note.color, fontSize: note.fontSize + 'px', cursor: draggingNote && draggingNote.id === note.id ? 'grabbing' : 'grab', lineHeight: 1.2 }"
                                                                    @mousedown.stop.prevent="startNoteDrag(note, $event)"
                                                                    @touchstart.stop.prevent="startNoteDrag(note, $event)"
                                                                >
                                                                    <span class="whitespace-pre" style="font-family: sans-serif;">{{ note.text }}</span>
                                                                    <button
                                                                        type="button"
                                                                        class="absolute -top-2.5 -right-2.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-none"
                                                                        @mousedown.stop
                                                                        @click.stop="removeTextNote(note.id)"
                                                                        :title="$t('Remove note')"
                                                                    >×</button>
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </div>

                                                    <!-- Bottom bar: color swatches + big Sketch/Text tool buttons -->
                                                    <div class="px-4 py-4 bg-gray-900 border-t border-white/10">
                                                        <div v-if="drawTool === 'pen' || drawTool === 'highlighter'" class="flex items-center justify-center gap-3 mb-4">
                                                            <button v-for="c in swatchColors" :key="c" type="button" @click="drawSettings.color = c" class="w-6 h-6 rounded-full border-2" :style="{ background: c, borderColor: drawSettings.color === c ? '#fff' : 'transparent' }" :title="c"></button>
                                                        </div>

                                                        <!-- Sub-tool row for Sketch: Pen / Highlight / Eraser + size + clear -->
                                                        <div v-if="drawTool === 'pen' || drawTool === 'highlighter' || drawTool === 'eraser'" class="flex items-center justify-center gap-2 mb-4 flex-wrap">
                                                            <button type="button" @click="drawTool = 'pen'" class="px-3 py-1.5 rounded-full text-xs font-medium" :class="drawTool === 'pen' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'">{{ $t('Pen') }}</button>
                                                            <button type="button" @click="drawTool = 'highlighter'" class="px-3 py-1.5 rounded-full text-xs font-medium" :class="drawTool === 'highlighter' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'">{{ $t('Highlight') }}</button>
                                                            <button type="button" @click="drawTool = 'eraser'" class="px-3 py-1.5 rounded-full text-xs font-medium" :class="drawTool === 'eraser' ? 'bg-white text-gray-900' : 'bg-white/10 text-white/80'">{{ $t('Eraser') }}</button>
                                                            <button type="button" @click="clearCanvas" class="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80">{{ $t('Clear') }}</button>
                                                            <div class="flex items-center gap-2 ml-1">
                                                                <label class="text-[11px] text-white/60">{{ $t('Size') }}</label>
                                                                <input type="range" min="1" max="20" v-model.number="drawSettings.size" class="w-20" />
                                                            </div>
                                                        </div>

                                                        <div class="flex items-center justify-center gap-10">
                                                            <button type="button" @click="toggleSketch" class="flex flex-col items-center gap-1.5">
                                                                <span class="w-12 h-12 rounded-full flex items-center justify-center" :class="['pen','highlighter','eraser'].includes(drawTool) ? 'bg-white text-gray-900' : 'bg-white/10 text-white'">
                                                                    <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                                                                </span>
                                                                <span class="text-[11px] text-white/80">{{ $t('Sketch') }}</span>
                                                            </button>
                                                            <button type="button" @click="toggleTextTool" class="flex flex-col items-center gap-1.5">
                                                                <span class="w-12 h-12 rounded-full flex items-center justify-center" :class="drawTool === 'text' ? 'bg-white text-gray-900' : 'bg-white/10 text-white'">
                                                                    <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M8 8h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                                                                </span>
                                                                <span class="text-[11px] text-white/80">{{ $t('Text') }}</span>
                                                            </button>
                                                        </div>

                                                        <p class="text-center text-[11px] text-white/40 mt-3">
                                                            {{ drawTool === 'view' ? $t('Scroll to browse every page. Pick Sketch or Text to add a note.') : $t('Use the page arrows above to note a different page.') }}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                    </transition>

                                </div>


                            </section>

                            <section class="mt-8">
                                <div>
                                    <div class="flex">
                                        <icon class="w-4 h-4 mr-3 mt-1" name="comments" />
                                        <div class="flex-1 border-b dark:border-gray-700 pb-2">
                                            <span class="text-sm font-medium dark:text-gray-300">{{ $t('Activities') }}</span>
                                            <span class="ml-2 text-sm font-light dark:text-gray-400">{{ filteredActivities.length }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="pl-8 pt-4">
                                    <div>
                                        <div v-if="!showCommentBox" class="mt-1 mb-4 cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 hover:shadow dark:hover:shadow-lg">
                                            <p @click="showCommentBox = true" class="px-3 py-2 text-sm dark:text-gray-300">
                                                {{ $t('Write a comment...') }}
                                            </p>
                                        </div>

                                        <form v-if="showCommentBox" class="mt-1 mb-4 rounded-md border border-gray-300 dark:border-gray-600" enctype="multipart/form-data">
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
                                                    <button @click="saveNewComment({details: new_comment.details, task_id: task.id, user_id: $page.props.auth.user.id}, task.activities)" type="button" class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                                        {{ $t('Save') }}</button>
                                                    <button @click="showCommentBox = false" type="button" class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1">{{ $t('Cancel') }}</button>
                                                </div>

                                                <div class="ml-auto hidden flex">
                                                    <label class="cursor-pointer">
                                                        <input :accept="allowed_file_types" class="hidden" type="file" multiple @change="uploadAttachment($event, true)">
                                                        <icon class="w-4 h-4" name="attachment" />
                                                    </label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div class="space-y-4">
                                        <div v-if="filteredActivities.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">No activities yet.</div>

                                        <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                                            <li v-for="activity in filteredActivities" :key="activity.id" class="py-2">
                                                <div v-if="['comment', 'comment_edit'].includes(activity.field_changed) && activity.comment" class="comment__ group relative flex py-1">
                                                    <div class="h-6 w-6">
                                                        <span class="block rounded-full h-6 w-6">
                                                            <img v-if="activity.user?.photo_path" class="h-full w-full rounded-full" :src="activity.user.photo_path" alt="User Photo">
                                                            <img v-else class="h-full w-full rounded-full" src="/images/user.svg" alt="Default Avatar">
                                                        </span>
                                                    </div>

                                                    <div class="group flex-1 ltr:pl-4 rtl:pr-4 w-full">
                                                        <div class="flex">
                                                            <h2 v-if="activity.user" class="flex text-sm font-medium leading-none dark:text-gray-200">
                                                                {{ activity.user?.first_name + ' ' + activity.user?.last_name }}
                                                            </h2>
                                                            <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ltr:ml-3 rtl:mr-3">
                                                                {{ moment(activity.comment?.created_at).format('MMMM D, YYYY [at] h:mm a') }}
                                                                <small v-if="moment(activity.comment?.updated_at).isAfter(moment(activity.comment?.created_at))">(edited)</small>
                                                            </span>
                                                            <div class="ml-auto">
                                                                <div class="absolute right-0 hidden pl-4 group-hover:flex" v-if="$page.props.auth.user.id === activity.user?.id">
                                                                    <icon class="w-3 h-3 mr-3 cursor-pointer" name="edit" @click="activity.comment.modify = true" />
                                                                    <icon class="w-3 h-3 cursor-pointer" name="trash" @click="deleteComment(activity.comment.id, task.activities, activity.id)" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div v-if="activity.comment.modify" class="checklist-box2 pt-3 w-full">
                                                            <CustomEditor
                                                                :ref="'editComment' + activity.comment.id"
                                                                v-model="activity.comment.details"
                                                                :placeholder="$t('Edit comment...')"
                                                                :users="availableUsers"
                                                                :show-status-bar="false"
                                                                :enable-auto-save="false"
                                                                @mention="onMention"
                                                            />
                                                            <div class="flex items-center action__buttons mt-2">
                                                                <button type="button" class="small save" @click="saveComment(activity.comment.id, activity.comment); activity.comment.modify = false">
                                                                    {{ $t('Save') }}
                                                                </button>
                                                                <button @click="activity.comment.modify = false" type="button" class="small cancel">
                                                                    {{ $t('Cancel') }}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div class="prose text-sm pt-1 t_a_h" v-if="!activity.comment.modify" v-html="activity.comment.details"></div>
                                                    </div>
                                                </div>

                                                <div v-if="['title', 'slug', 'list_id', 'order', 'due_date', 'is_done', 'is_archive', 'comment_delete', 'description', 'cover'].includes(activity.field_changed)" class="flex items-center space-x-3">
                                                    <img v-if="activity.user?.photo_path" :src="activity.user.photo_path" alt="User Avatar" class="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <p class="text-sm text-gray-700 dark:text-gray-300">
                                                            <strong class="pr-1 dark:text-gray-200">{{ activity.user?.first_name }} {{ activity.user?.last_name }}</strong>
                                                            <span v-if="['title', 'slug', 'list_id', 'order', 'due_date'].includes(activity.field_changed)">
                                                                {{ activity.old_value }} → {{ activity.new_value }}
                                                            </span>
                                                            <span v-if="['is_done', 'is_archive'].includes(activity.field_changed)">
                                                                {{ activity.old_value }}.
                                                            </span>
                                                            <span v-if="activity.field_changed === 'description'"> updated the description.</span>
                                                            <span v-if="activity.field_changed === 'cover'"> updated the cover image.</span>
                                                            <span v-if="activity.field_changed === 'comment_delete'"> deleted a comment.</span>
                                                        </p>
                                                        <p class="text-xs pt-1 text-gray-500 dark:text-gray-400">{{ moment(activity.created_at).format('MMMM D, YYYY [at] h:mm a') }}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </main>

                        <div v-if="showManualTimeOption" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="closeManualTimeModal">
                            <div class="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                                <!-- Header -->
                                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <icon name="clock" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('Add Time Manually') }}</h3>
                                                <p class="text-sm text-gray-600 dark:text-gray-300">{{ $t('Log time spent on this task') }}</p>
                                            </div>
                                        </div>
                                        <button @click="closeManualTimeModal" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
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
                                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('Start Time') }}</label>
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
                                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('End Time') }}</label>
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
                                    <div v-if="composedStart && composedEnd" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                <icon name="timer" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('Duration') }}</span>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {{ formatDuration(composedStart, composedEnd) }}
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{ Math.floor(moment.duration(moment(composedEnd).diff(moment(composedStart))).asMinutes()) }} {{ $t('minutes') }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Validation Messages -->
                                    <div v-if="manualTimeError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                        <div class="flex items-center gap-2">
                                            <icon name="exclamation-triangle" class="w-4 h-4 text-red-600 dark:text-red-400" />
                                            <span class="text-sm text-red-700 dark:text-red-300">{{ manualTimeError }}</span>
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
                                        <div class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" @click="displayMoveCard();is_move=true;">
                                            <span class="block h-3.5 text-xs leading-none dark:text-gray-200">{{ task.list.title }}</span>
                                            <icon class="w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300" name="arrow-down" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section class="py-3">
                                <WatchButton :watchable-id="task.id" watchable-type="Task" :is-watching="task.is_watched_by_user" />
                            </section>
                            <section class="py-3.5">
                                <div class="flex items-center px-2">
                                    <h2 class="text-sm font-medium dark:text-gray-300">
                                        {{ $t('Assignees') }}
                                    </h2>

                                    <div class="relative ml-auto" modal="true" name="task-assign">
                                        <div>
                                            <span class="cursor-pointer" @click="showAssigneeBox = true"><icon class="h-5 w-5 hover:opacity-80 dark:text-gray-300" name="add" /></span>
                                        </div>

                                        <div class="absolute right-1 flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" v-if="showAssigneeBox">
                                            <h4 class="text-center mb-3 font-bold dark:text-white">{{ $t('Assignee') }}</h4>
                                            <div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" @click="showAssigneeBox = false" >
                                                <icon class=" w-4 h-4 dark:text-gray-300" name="close" />
                                            </div>
                                            <input id="t_d_s_u" v-model="user_search" class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400" :placeholder="$t('Search User')" />
                                            <ul class="flex flex-col mt-3 gap-1 h-48 max-h-48 overflow-y-auto">
                                                <li v-for="(userObject, user_index) in searchUser(user_search)">
                                                    <label :for="'td_u_id_'+user_index" class="flex p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                                        <input :id="'td_u_id_'+user_index" class="w-5 ml-1 mr-2" type="checkbox" :checked="task_assignees().includes(userObject.user_id)" @change="assignUserToTask($event.target.checked, userObject.user_id)">
                                                        <img v-if="userObject.user.photo_path" :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" :src="userObject.user.photo_path" />
                                                        <img v-else :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" src="/images/user.svg" />
                                                        <span data-a="" class="p-1 dark:text-gray-200" type="button" :tabindex="user_index">
                                                                {{ userObject.user.name }}
                                                            </span>
                                                    </label>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-wrap gap-1 px-2 mb-1 pt-2">
                                      <span v-for="assignee in task.assignees" :aria-label="assignee.user.name" data-a="" class="block rounded-full h-8 w-8 border-2 border-white">
                                          <img v-if="assignee.user.photo_path" class="h-full w-full rounded-full" :src="assignee.user.photo_path" :alt="assignee.user.name">
                                          <img v-else class="h-full w-full rounded-full" src="/images/user.svg" :alt="assignee.user.name">
                                      </span>
                                </div>
                            </section>

                            <section class="py-4">
                                <div class="flex px-2 text-sm font-medium dark:text-gray-300 justify-between">
                                    {{ $t('Time Count') }}
                                    <span v-if="!this.activeTimerString && task_assignees().includes($page.props.auth.user.id)" class="cursor-pointer items-center flex" @click="showManualTimeOption = true"><icon class="h-4 w-4 hover:opacity-80 dark:text-gray-300" name="add" /> <span class="text-xs dark:text-gray-300">Manual</span></span>
                                </div>

                                <div class="mt-3 flex justify-between items-center px-2">
                                    <div class="flex gap-1 items-center">
                                        <p class="dark:text-gray-200">
                                            {{ totalTime() }}
                                        </p>
                                    </div>
                                    <button v-if="!!this.activeTimerString && task_assignees().includes(Number($page.props.auth.user.id))" class="py-2 w-[70px] bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 rounded text-[12px] text-white select-none" @click="stopTracker()">{{ $t('STOP') }}</button>
                                    <button v-else-if="!existing_timer && task_assignees().includes(Number($page.props.auth.user.id))" class="py-2 w-[70px] bg-blue-600 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-900 rounded text-[12px] text-white select-none" @click="startTracker()">{{ $t('START') }}</button>
                                </div>
                            </section>
                            <section class="py-3">
                                <h2 class="px-2 text-sm font-medium dark:text-gray-300">
                                    {{ $t('Due Date') }}
                                </h2>
                                <div class="relative" modal="true">
                                    <div>
                                        <div class="group mt-2 flex cursor-pointer items-center rounded-md py-1.5">
                                            <DateTimePicker
                                                v-model="task.due_date"
                                                @change="saveTask({due_date: moment(task.due_date).format('YYYY-MM-DD HH:mm')})"
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
                                    <label class="flex cursor-pointer w-full items-center rounded bg-gray-200 dark:bg-gray-700 td__btn hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0">
                                        <input :accept="allowed_file_types" @change="uploadAttachment($event)" class="hidden" type="file" multiple/>
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="attachment" />
                                        {{ $t('Attachment') }}
                                    </label>
                                    <button v-if="!this.task.is_archive" @click="saveTask({ is_archive: 1 });this.task.is_archive = true" class="flex td__btn w-full items-center rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0">
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="archive" />
                                        {{ $t('Archive') }}
                                    </button>
                                    <button v-else @click="saveTask({ is_archive: 0 });this.task.is_archive = false" class="flex td__btn w-full items-center py-1.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 dark:text-gray-200">
                                        <icon class="mr-2 h-4 w-4 dark:text-gray-300" name="undo" />
                                        {{ $t('Revert Back') }}
                                    </button>
                                    <button v-if="this.task.is_archive" @click="deleteTask()" class="flex w-full text-white items-center td__btn py-1.5 text-xs font-medium rounded bg-red-700 dark:bg-red-800 hover:bg-red-800 dark:hover:bg-red-900 px-3 py-2">
                                        <icon class="mr-2 h-4 w-4 fill-white" name="dash" />
                                        {{ $t('Delete') }}
                                    </button>
                                </div>
                            </section>

                        </aside>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Mention Popover -->
    <div
        v-if="showMentionPopup && clickedMentionUser"
        class="mention-popup"
        :style="mentionPopupStyle"
        @click.stop
    >
        <div class="mention-popup__header">
            <div class="mention-popup__avatar">
                <img v-if="clickedMentionUser.avatar" :src="clickedMentionUser.avatar" :alt="clickedMentionUser.name">
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

    <!-- ============================= -->
    <!-- Toast / Alert Notifications   -->
    <!-- ============================= -->
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
                        <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="toast-item__body">
                        <div v-if="toast.title" class="toast-item__title">{{ toast.title }}</div>
                        <div class="toast-item__message">{{ toast.message }}</div>
                    </div>
                    <button class="toast-item__close" @click="removeToast(toast.id)" :aria-label="$t('Dismiss')">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="toast-item__bar" :style="{ animationDuration: toast.duration + 'ms', animationPlayState: toast.paused ? 'paused' : 'running' }"></div>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script>
    import {Head, Link} from '@inertiajs/vue3'
    import { markRaw } from 'vue'
    import Icon from '@/Shared/Icon.vue'
    import Loader from '@/Shared/Loader.vue'
    import DatePicker from '@/Shared/Components/DatePicker.vue'
    import DateTimePicker from '@/Shared/Components/DateTimePicker.vue'
    import moment from 'moment'
    import 'moment-duration-format';
    import CustomEditor from '@/Shared/Components/CustomEditor.vue';
    import WatchButton from '@/Components/WatchButton.vue';
    import axios from 'axios'

    // Used only to build a brand-new standalone PDF from your drawing when
    // saving — no pdfjs-dist here, so no worker/version bundling issues.
    import { PDFDocument } from 'pdf-lib';

    // Renders the real page as a <canvas> so the drawing overlay lines up
    // pixel-for-pixel with it (the native browser PDF viewer used for
    // View mode doesn't expose enough control over its own margins/toolbar
    // to guarantee that — this is what actually fixes notes landing in the
    // wrong spot). The worker is resolved locally from the installed
    // pdfjs-dist package via Vite's asset URL handling, so it always
    // matches the installed version exactly (no CDN version mismatch).
    // Requires `npm install pdfjs-dist` if not already a dependency.
    import * as pdfjsLib from 'pdfjs-dist';
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();

    export default {
        props: {
            id: {
                required: true,
            },
            isPopup: Boolean,
            view: { required: false },
        },
        emits: {closeModal: null},
        data() {
            return {
                manual_time: { date: null, start_time: null, end_time: null, start: null, end: null, seconds: 0, title: '' },
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
                    // Always keep PDF + common screenshot/image formats in the
                    // picker's filter, on top of whatever the backend
                    // "allowed_file_types" setting adds — otherwise, if that
                    // setting only lists ".pdf", screenshots can't even be
                    // selected in the native file dialog.
                    const base = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    const types = this?.$page?.props?.settings?.allowed_file_types;
                    try {
                        const parsed = Array.isArray(types) ? types : JSON.parse(types);
                        const cleaned = parsed
                            .map(t => t.startsWith('.') ? t : '.' + t)
                            .filter(Boolean);

                        return Array.from(new Set([...base, ...cleaned])).join(',');
                    } catch {
                        return base.join(',');
                    }
                })(),
                colors: [
                    {'name': 'subtle green', 'color': '#baf3db'}, {'name': 'subtle yellow', 'color': '#f8e6a0'}, {'name': 'subtle orange', 'color': '#ffe2bd'}, {'name': 'subtle red', 'color': '#ffd2cc'}, {'name': 'subtle purple', 'color': '#dfd8fd'},
                    {'name': 'green', 'color': '#4bce97'}, {'name': 'yellow', 'color': '#e2b203'}, {'name': 'orange', 'color': '#faa53d'}, {'name': 'red', 'color': '#f87462'}, {'name': 'purple', 'color': '#9f8fef'},
                    {'name': 'bold green', 'color': '#1f845a'}, {'name': 'bold yellow', 'color': '#946f00'}, {'name': 'bold orange', 'color': '#b65c02'}, {'name': 'bold red', 'color': '#ca3521'}, {'name': 'bold purple', 'color': '#6e5dc6'},
                    {'name': 'subtle blue', 'color': '#cce0ff'}, {'name': 'subtle sky', 'color': '#c1f0f5'}, {'name': 'subtle lime', 'color': '#D3F1A7'}, {'name': 'subtle pink', 'color': '#fdd0ec'}, {'name': 'subtle black', 'color': '#dcdfe4'},
                    {'name': 'blue', 'color': '#579dff'}, {'name': 'sky', 'color': '#60c6d2'}, {'name': 'lime', 'color': '#94c748'}, {'name': 'pink', 'color': '#e774bb'}, {'name': 'black', 'color': '#8590a2'},
                    {'name': 'bold blue', 'color': '#0c66e4'}, {'name': 'bold sky', 'color': '#1d7f8c'}, {'name': 'bold lime', 'color': '#5b7f24'}, {'name': 'bold pink', 'color': '#ae4787'}, {'name': 'bold black', 'color': '#626f86'},
                ],
                // Mention popup properties
                showMentionPopup: false,
                mentionPopupPosition: { top: 0, left: 0 },
                clickedMentionUser: null,
                // Enhanced manual time properties
                manualTimeError: null,
                timePresets: [
                    { label: '15 min', hours: 0, minutes: 15 },
                    { label: '30 min', hours: 0, minutes: 30 },
                    { label: '1 hour', hours: 1, minutes: 0 },
                    { label: '2 hours', hours: 2, minutes: 0 },
                    { label: '4 hours', hours: 4, minutes: 0 },
                    { label: '8 hours', hours: 8, minutes: 0 }
                ],

                viewModal: {
                    open: false,
                    attachment: null,
                },
                drawSettings: {
                    color: '#ef4444',
                    size: 4
                },
                isDrawing: false,
                // Which tool is active in the single toolbar. 'view' lets
                // the native PDF viewer scroll through every page; picking
                // any other tool switches to drawing on page 1.
                drawTool: 'view', // 'view' | 'pen' | 'highlighter' | 'eraser' | 'text'
                historyStack: [],
                redoStack: [],
                textInput: { visible: false, cssX: 0, cssY: 0, canvasX: 0, canvasY: 0, value: '' },
                // Placed text notes — kept as separate, draggable objects
                // (not baked into the canvas bitmap) so they can be moved
                // around after being added, like a standard PDF note tool.
                textNotes: [],
                textNoteIdCounter: 0,
                draggingNote: null,
                // Quick-pick color swatches for the redesigned markup
                // toolbar (black, red, yellow, green, blue, purple, gray).
                swatchColors: ['#000000', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#9ca3af'],
                // Multi-page notes: which page you're currently sketching/
                // noting on, how many pages the PDF has, a per-page store
                // of what's been drawn/noted so far (so switching pages
                // doesn't lose anything), and which pages actually have
                // real edits worth baking in on Save.
                currentDrawPage: 1,
                totalPdfPages: 1,
                pageAnnotations: {}, // { [pageNum]: { canvasImage, notes } }
                dirtyPages: {}, // { [pageNum]: true }
                // pdf.js document handle used to render the exact page
                // pixel-for-pixel while a drawing tool is active.
                pdfDocProxy: null,
                canvasCtx: null,
                autoSaving: false,
                // Shows a spinner over the page stage while pdf.js is
                // loading the document or rendering a page, so switching
                // tools/pages never looks like a silent blank freeze.
                isRenderingPage: false,

                // --- Toast notification state ---
                toasts: [],
                toastIdCounter: 0,

                showAssigneeBoxPreview: false,
                showAssigneeBoxDraw: false,
                showDocumentNotes: false,
                newDocumentNote: '',
                savingDocumentNote: false,
            }

        },
        components: {
            Icon, Loader, Link, DatePicker, DateTimePicker, CustomEditor, Head, WatchButton
        },
        computed: {
            sortedAttachments() {
                if (!this.task?.attachments) return [];
                return [...this.task.attachments].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
            },

            filteredActivities() {
                if (!this.task.activities || !Array.isArray(this.task.activities)) {
                    return [];
                }

                return this.task.activities.filter(activity => {
                    if (activity.field_changed === 'comment' || activity.field_changed === 'comment_edit') {
                        return activity.comment && activity.comment.id;
                    }

                    const allowedFieldChanges = [
                        'title', 'slug', 'list_id', 'order', 'due_date',
                        'is_done', 'is_archive', 'comment_delete', 'description', 'cover'
                    ];

                    return allowedFieldChanges.includes(activity.field_changed);
                });
            },

            composedStart(){
                return this.composeDateTime(this.manual_time.start_time);
            },
            composedEnd(){
                return this.composeDateTime(this.manual_time.end_time);
            },

            mentionPopupStyle() {
                return {
                    position: 'fixed',
                    top: `${this.mentionPopupPosition.top}px`,
                    left: `${this.mentionPopupPosition.left}px`,
                    zIndex: 1001
                };
            },

            canAddTime() {
                return this.composedStart && this.composedEnd && !this.manualTimeError;
            },

            // Only used in View mode now — drawing tools render the page
            // themselves via pdf.js instead (see renderDrawPage), which is
            // what makes notes land exactly where you drew them. This just
            // jumps the native viewer to currentDrawPage so the page
            // arrows still move what you're looking at while browsing.
            pdfIframeSrc() {
                const path = this.viewModal.attachment?.path;
                if (!path) return path;
                return this.currentDrawPage > 1 ? `${path}#page=${this.currentDrawPage}` : path;
            },

            // "family" name shared by an original PDF and every annotated
            // copy saved from it, e.g. "annotated_annotated_report.pdf" and
            // "report.pdf" both resolve to "report" — used to group all
            // versions of the same document together.
            documentFamilyName() {
                const name = this.viewModal.attachment?.name;
                if (!name) return null;
                return name.replace(/\.[^/.]+$/, '').replace(/^(annotated_)+/i, '');
            },

            // Every saved version of the document currently open in the
            // preview modal (the original plus each "Save" from Draw mode),
            // newest first.
            documentVersions() {
                if (!this.documentFamilyName || !this.task?.attachments) return [];
                return [...this.task.attachments]
                    .filter(a => this.isPdf(a.name) && a.name.replace(/\.[^/.]+$/, '').replace(/^(annotated_)+/i, '') === this.documentFamilyName)
                    .map(a => ({ ...a, isOriginal: !/^annotated_/i.test(a.name) }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            },

            // Comments that were posted with this document attached (the
            // comment box embeds an <a href="..."> link to the uploaded
            // file — see uploadAttachment's is_comment branch), matched
            // against any version of this same document.
            documentComments() {
                if (!this.documentVersions.length) return [];
                const paths = this.documentVersions.map(v => v.path);
                return this.filteredActivities
                    .filter(a => ['comment', 'comment_edit'].includes(a.field_changed) && a.comment?.details)
                    .filter(a => paths.some(p => a.comment.details.includes(p)))
                    .map(a => ({ ...a.comment, user: a.user }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            },

            documentNotesCount() {
                // Annotated versions (excluding the original itself) plus
                // related comments — i.e. everything that counts as a
                // "note" someone added to this document.
                return this.documentVersions.filter(v => !v.isOriginal).length + this.documentComments.length;
            },

            // True once any page has an actual unsaved sketch/note on it.
            // Used to hide the Save button until there's something to save —
            // no point showing it while just browsing in View mode.
            hasUnsavedAnnotations() {
                return Object.values(this.dirtyPages).some(Boolean);
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
            // Switching between View (native scrollable viewer) and any
            // drawing tool needs a different stage: View just resizes the
            // frame; a drawing tool needs the exact page rendered fresh.
            async drawTool(newTool) {
                if (newTool === 'view') {
                    this.$nextTick(() => this.initViewFrame());
                    return;
                }
                await this.ensurePdfDocProxy();
                await this.renderDrawPage(this.currentDrawPage);
                const saved = this.pageAnnotations[this.currentDrawPage];
                if (saved?.canvasImage) {
                    await this.restoreFromDataUrl(saved.canvasImage);
                }
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
                const index = this.toasts.findIndex(t => t.id === id);
                if (index > -1) {
                    clearTimeout(this.toasts[index].timer);
                    this.toasts.splice(index, 1);
                }
            },
            toastSuccess(message, opts) { return this.showToast(message, 'success', opts); },
            toastError(message, opts) { return this.showToast(message, 'error', opts); },
            toastWarning(message, opts) { return this.showToast(message, 'warning', opts); },
            toastInfo(message, opts) { return this.showToast(message, 'info', opts); },

            // --- Helpers ---
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

            canDraw(filename) {
                return this.isImage(filename) || this.isPdf(filename);
            },

            // --- View Modal Methods ---
            // The PDF itself is shown via the iframe (native browser
            // rendering, not pdf.js), with a transparent canvas layered on
            // top sized to match — that's what captures the drawing.
            openViewModal(attachment) {
                this.viewModal.open = true;
                this.viewModal.attachment = attachment;
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

                this.$nextTick(async () => {
                    if (this.isPdf(attachment.name)) {
                        // Loads page-count metadata now so the page
                        // navigator works immediately; the actual page
                        // render only happens once a drawing tool is
                        // picked (View mode uses the native viewer).
                        await this.ensurePdfDocProxy();
                        this.initViewFrame();
                        window.addEventListener('resize', this.handleResize);
                    }
                });
            },

            closeViewModal() {
                this.viewModal.open = false;
                this.viewModal.attachment = null;
                this.isDrawing = false;
                this.pdfDocProxy = null;
                window.removeEventListener('resize', this.handleResize);
            },

            // Loads the PDF once via pdf.js so pages can be rendered
            // pixel-exact for drawing. Cheap to call repeatedly — it's a
            // no-op once already loaded for the current attachment.
            async ensurePdfDocProxy() {
                if (this.pdfDocProxy || !this.viewModal.attachment) return;

                const url = this.viewModal.attachment.path;
                if (!url) {
                    // Surfaces exactly what's missing next time this
                    // happens, instead of a generic pdf.js validation error.
                    console.error('PDF render: attachment has no usable path/url. attachment =', this.viewModal.attachment);
                    this.toastError(this.$t('Failed to load the PDF for drawing.'));
                    return;
                }

                this.isRenderingPage = true;
                try {
                    const loadingTask = pdfjsLib.getDocument({ url });
                    // markRaw is required here — pdf.js's internal classes
                    // use native JS private fields (#foo), which break with
                    // "Cannot read from private field" the moment Vue's
                    // reactivity system wraps the object in a Proxy.
                    this.pdfDocProxy = markRaw(await loadingTask.promise);
                    this.totalPdfPages = this.pdfDocProxy.numPages;
                } catch (err) {
                    console.error('Failed to load the PDF for rendering. url was:', url, 'error:', err);
                    this.toastError(this.$t('Failed to load the PDF for drawing.'));
                } finally {
                    this.isRenderingPage = false;
                }
            },

            // Renders the given page as an actual <canvas> at the stage's
            // real pixel width. Because the drawing overlay is sized to
            // match this render exactly, a stroke always lands on the
            // exact spot you clicked once baked back into the real PDF —
            // no more guessing at the native viewer's toolbar/margins.
            async renderDrawPage(pageNumber) {
                if (!this.pdfDocProxy) return;
                const stage = this.$refs.drawStage;
                const renderCanvas = this.$refs.pdfRenderCanvas;
                const drawCanvas = this.$refs.drawCanvas;
                if (!stage || !renderCanvas || !drawCanvas) return;

                this.isRenderingPage = true;
                try {
                    const page = await this.pdfDocProxy.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const targetWidth = Math.min(stage.clientWidth || 880, 880);
                    const scale = targetWidth / baseViewport.width;
                    const viewport = page.getViewport({ scale });

                    const w = Math.round(viewport.width);
                    const h = Math.round(viewport.height);

                    stage.style.height = h + 'px';
                    stage.style.overflow = 'hidden';
                    renderCanvas.width = w;
                    renderCanvas.height = h;
                    drawCanvas.width = w;
                    drawCanvas.height = h;

                    const renderTask = page.render({ canvasContext: renderCanvas.getContext('2d'), viewport });
                    await renderTask.promise;
                    this.canvasCtx = drawCanvas.getContext('2d');
                } catch (err) {
                    console.error('Failed to render PDF page', pageNumber, ':', err);
                    this.toastError(this.$t('Failed to render the page for drawing.'));
                } finally {
                    this.isRenderingPage = false;
                }
            },

            // View mode's frame: tall and natively scrollable, so the
            // browser's own PDF viewer can handle paging/scrolling/zooming
            // through the whole document.
            initViewFrame() {
                const stage = this.$refs.drawStage;
                if (!stage) return;
                stage.style.height = Math.round(window.innerHeight * 0.78) + 'px';
                stage.style.overflow = 'auto';
            },

            handleResize() {
                if (this.drawTool === 'view') {
                    this.initViewFrame();
                } else {
                    this.renderDrawPage(this.currentDrawPage);
                }
            },

            // Switches which page you're sketching/noting on. Stores the
            // page you're leaving into pageAnnotations (so it's not lost),
            // renders the new page fresh, then restores whatever was
            // previously drawn/noted there, if anything.
            async goToDrawPage(delta) {
                if (!this.viewModal.attachment) return;
                const next = this.currentDrawPage + delta;
                if (next < 1 || next > this.totalPdfPages) return;

                this.saveCurrentPageAnnotationState();
                this.currentDrawPage = next;
                this.historyStack = [];
                this.redoStack = [];
                this.textNotes = (this.pageAnnotations[next]?.notes || []).map(n => ({ ...n }));

                if (this.drawTool !== 'view') {
                    await this.ensurePdfDocProxy();
                    await this.renderDrawPage(next);
                    const saved = this.pageAnnotations[next]?.canvasImage;
                    if (saved) {
                        await this.restoreFromDataUrl(saved);
                    }
                }
            },

            // Snapshots whatever's currently drawn/noted so switching pages
            // (or saving) doesn't lose it.
            saveCurrentPageAnnotationState() {
                const canvas = this.$refs.drawCanvas;
                if (!canvas || !canvas.width || !canvas.height) return;
                this.pageAnnotations[this.currentDrawPage] = {
                    canvasImage: canvas.toDataURL(),
                    notes: this.textNotes.map(n => ({ ...n })),
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
                    y: (clientY - rect.top) * scaleY
                };
            },

            startDrawing(e) {
                if (!this.canvasCtx || this.drawTool === 'view') return;

                // Text tool doesn't drag a stroke — a single click/tap
                // opens the floating note input instead.
                if (this.drawTool === 'text') {
                    this.placeTextAt(e);
                    return;
                }

                this.pushHistory();
                this.isDrawing = true;
                const pos = this.getCanvasCoordinates(e);
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(pos.x, pos.y);
            },

            draw(e) {
                if (!this.isDrawing) return;
                // Only swallow the touch gesture once a stroke is actually
                // in progress — that's what let a Text-tool tap (or any
                // idle touch) fall through as a normal scroll before.
                if (e.cancelable) e.preventDefault();
                const pos = this.getCanvasCoordinates(e);
                const ctx = this.canvasCtx;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (this.drawTool === 'eraser') {
                    // destination-out punches transparent holes instead of
                    // painting, so it actually removes ink rather than
                    // drawing white over it.
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = this.drawSettings.size * 5;
                } else if (this.drawTool === 'highlighter') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = 0.35;
                    ctx.strokeStyle = this.drawSettings.color;
                    ctx.lineWidth = this.drawSettings.size * 4;
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = this.drawSettings.color;
                    ctx.lineWidth = this.drawSettings.size;
                }

                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            },

            stopDrawing() {
                if (this.isDrawing) {
                    this.canvasCtx.closePath();
                    this.canvasCtx.globalCompositeOperation = 'source-over';
                    this.canvasCtx.globalAlpha = 1;
                    this.isDrawing = false;
                }
            },

            clearCanvas() {
                if (!this.canvasCtx) return;
                this.pushHistory();
                const canvas = this.$refs.drawCanvas;
                this.canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            },

            // --- Text note tool: place a typed note on the canvas ---
            placeTextAt(e) {
                const canvas = this.$refs.drawCanvas;
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const pos = this.getCanvasCoordinates(e);

                this.textInput.cssX = clientX - rect.left;
                this.textInput.cssY = clientY - rect.top;
                this.textInput.canvasX = pos.x;
                this.textInput.canvasY = pos.y;
                this.textInput.value = '';
                this.textInput.visible = true;

                this.$nextTick(() => {
                    if (this.$refs.textInputBox) this.$refs.textInputBox.focus();
                });
            },

            confirmTextInput() {
                const text = (this.textInput.value || '').trim();
                if (text) {
                    const canvas = this.$refs.drawCanvas;
                    const scaleX = canvas.width / canvas.getBoundingClientRect().width;
                    const fontSize = Math.max(14, this.drawSettings.size * 4) * scaleX;

                    // Kept as a separate, draggable object rather than
                    // baked straight onto the canvas — that's what lets it
                    // be moved around afterwards like a standard PDF note.
                    this.textNotes.push({
                        id: ++this.textNoteIdCounter,
                        x: this.textInput.canvasX,
                        y: this.textInput.canvasY,
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
                if (e.type === 'mousedown' && e.button !== 0) return;
                const point = e.touches ? e.touches[0] : e;
                this.draggingNote = {
                    id: note.id,
                    startClientX: point.clientX,
                    startClientY: point.clientY,
                    origX: note.x,
                    origY: note.y,
                };
                window.addEventListener('mousemove', this.onNoteDrag);
                window.addEventListener('mouseup', this.endNoteDrag);
                window.addEventListener('touchmove', this.onNoteDrag, { passive: false });
                window.addEventListener('touchend', this.endNoteDrag);
            },

            onNoteDrag(e) {
                if (!this.draggingNote) return;
                if (e.cancelable) e.preventDefault();
                const point = e.touches ? e.touches[0] : e;
                const dx = point.clientX - this.draggingNote.startClientX;
                const dy = point.clientY - this.draggingNote.startClientY;
                const note = this.textNotes.find(n => n.id === this.draggingNote.id);
                if (note) {
                    note.x = this.draggingNote.origX + dx;
                    note.y = this.draggingNote.origY + dy;
                }
            },

            endNoteDrag() {
                this.draggingNote = null;
                window.removeEventListener('mousemove', this.onNoteDrag);
                window.removeEventListener('mouseup', this.endNoteDrag);
                window.removeEventListener('touchmove', this.onNoteDrag);
                window.removeEventListener('touchend', this.endNoteDrag);
            },

            removeTextNote(id) {
                const idx = this.textNotes.findIndex(n => n.id === id);
                if (idx > -1) this.textNotes.splice(idx, 1);
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

            // --- Undo / Redo: snapshot-based, matches the simplicity of
            // the rest of the draw feature (no per-stroke vector model). ---
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
            },

            async redoDraw() {
                if (!this.redoStack.length) return;
                const canvas = this.$refs.drawCanvas;
                this.historyStack.push(canvas.toDataURL());
                const next = this.redoStack.pop();
                await this.restoreFromDataUrl(next);
            },

            // Explicit "Save" button: uploads the drawing as a brand new
            // attachment. Nothing saves automatically while drawing.
            async manualSaveAnnotation() {
                this.autoSaving = true;
                try {
                    await this.saveAnnotatedImage();
                } finally {
                    this.autoSaving = false;
                }
            },

            // Saves a free-text note about the document currently open in
            // the preview modal. Reuses the same "comments.new" endpoint as
            // the regular Activities comment box, but tags the comment with
            // a hidden reference to this document's path so it shows up in
            // the "Notes for this document" panel (via documentComments)
            // instead of only in the general Activities feed.
            saveDocumentNote(){
                const text = (this.newDocumentNote || '').trim();
                if (!text || !this.viewModal.attachment || this.savingDocumentNote) return;

                const path = this.viewModal.attachment.path;
                const escaped = text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br/>');
                const details = `<span class="hidden" data-doc-ref="${path}"></span>${escaped}`;

                this.savingDocumentNote = true;
                axios.post(this.route('comments.new'), {
                    details,
                    task_id: this.task.id,
                    user_id: this.$page.props.auth.user.id,
                    created_at: this.moment().format('YYYY-MM-DD HH:mm:ss'),
                }).then((response) => {
                    if (response.data) {
                        this.task.activities.unshift(response.data);
                        this.newDocumentNote = '';
                        this.toastSuccess(this.$t('Note saved.'), { duration: 2000 });
                    }
                }).catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to save the note.'));
                }).finally(() => {
                    this.savingDocumentNote = false;
                });
            },

            // Loads the REAL original PDF (all its pages, untouched) and
            // draws your annotation directly onto page 1 of it, then
            // uploads the result as a new attachment. This is plain
            // fetch + pdf-lib — no pdf.js, no worker, no rendering of the
            // original file involved, so it can't hit that earlier bug.
            // Composites one page's stored raster strokes (pen/highlighter/
            // eraser) together with its draggable text notes into one
            // flattened image — used per-page at Save time, without
            // touching the live canvas, so notes stay movable in the UI
            // even after you've saved.
            buildFinalDataUrlForEntry(entry) {
                return new Promise((resolve) => {
                    if (!entry || !entry.canvasImage) { resolve(null); return; }
                    const img = new Image();
                    img.onload = () => {
                        const temp = document.createElement('canvas');
                        temp.width = img.naturalWidth;
                        temp.height = img.naturalHeight;
                        const tctx = temp.getContext('2d');
                        tctx.drawImage(img, 0, 0);

                        (entry.notes || []).forEach(note => {
                            tctx.globalCompositeOperation = 'source-over';
                            tctx.globalAlpha = 1;
                            tctx.fillStyle = note.color;
                            tctx.font = `${note.fontSize}px sans-serif`;
                            tctx.textBaseline = 'top';
                            note.text.split('\n').forEach((line, i) => {
                                tctx.fillText(line, note.x, note.y + i * note.fontSize * 1.2);
                            });
                        });

                        resolve(temp.toDataURL('image/png'));
                    };
                    img.onerror = () => resolve(null);
                    img.src = entry.canvasImage;
                });
            },

            // Bakes every page you actually sketched or added a note on —
            // not just page 1 — back into a copy of the real PDF, each on
            // its own matching page, then uploads the result as a new
            // attachment. The original file itself is left untouched.
            async saveAnnotatedImage() {
                const canvas = this.$refs.drawCanvas;
                if (!canvas || !this.viewModal.attachment) return;

                // Make sure the page you're currently on is captured too.
                this.saveCurrentPageAnnotationState();

                const attachment = this.viewModal.attachment;
                const originalName = attachment.name.replace(/\.[^/.]+$/, "");

                const pagesToApply = Object.keys(this.dirtyPages)
                    .map(Number)
                    .filter(pageNum => this.dirtyPages[pageNum] && this.pageAnnotations[pageNum]);

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

                        // Stretch the drawing over the full page — the
                        // canvas covered the same visible area that page
                        // was shown in, so this lines up with what you saw
                        // while drawing on it.
                        const pageIndex = Math.min(pageNum - 1, pdfDoc.getPageCount() - 1);
                        const page = pdfDoc.getPage(pageIndex);
                        const { width, height } = page.getSize();
                        page.drawImage(pngImage, { x: 0, y: 0, width, height });
                    }

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                    const formData = new FormData();
                    // Uploads as a brand new attachment on the task, using the
                    // same "add attachment" endpoint as the regular attachment
                    // uploader.
                    formData.append('file', blob, `annotated_${originalName}.pdf`);

                    const res = await axios.post(this.route('task.attachment.add', this.task.id), formData);
                    if (res.data && !res.data.error) {
                        this.task.attachments.push(res.data);
                        this.toastSuccess(this.$t('Annotated PDF attached.'), { duration: 2000 });
                        this.dirtyPages = {};
                        // The toast is teleported to <body>, so it stays
                        // visible even after the modal itself closes.
                        this.closeViewModal();
                    } else {
                        this.toastError(res.data?.message || this.$t('Failed to save the annotated PDF.'));
                    }
                } catch (err) {
                    console.error('Failed to save annotated PDF:', err);
                    this.toastError(this.$t('Failed to save the annotated PDF.'));
                }
            },

            composeDateTime(time){
                if(!this.manual_time.date || !time) return null;
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
                    const user = this.availableUsers.find(u => u.id == userId);
                    if (user) {
                        this.clickedMentionUser = user;
                        this.showMentionPopup = true;

                        this.$nextTick(() => {
                            const mentionRect = mentionElement.getBoundingClientRect();

                            this.mentionPopupPosition = {
                                top: mentionRect.top - 10,
                                left: mentionRect.left
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
                    title: ''
                };
            },

            applyTimePreset(preset) {
                const now = this.moment();
                this.manual_time.start_time = now.clone().subtract(preset.hours, 'hours').subtract(preset.minutes, 'minutes').toDate();
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

                const duration = this.moment.duration(this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start)));
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
            addTime(){
                this.manual_time.start = this.composeDateTime(this.manual_time.start_time);
                this.manual_time.end = this.composeDateTime(this.manual_time.end_time);

                if (!this.validateManualTime()) {
                    return;
                }

                this.manual_time.seconds = parseInt(
                    this.moment.duration(this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start))).asSeconds()
                );

                this.counter.duration = parseInt(this.counter.duration) + this.manual_time.seconds;
                this.manual_time.task_id = this.task.id;

                axios.post(this.route('task.timer.manual'), this.manual_time)
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
            updateManualStart(){
                const t = this.manual_time.start_time;
                if (t && typeof t === 'object' && 'hours' in t) {
                    const hours = ((t.hours ?? 0) + 1) % 24;
                    const minutes = t.minutes ?? 0;
                    const seconds = t.seconds ?? 0;
                    const now = this.moment();
                    this.manual_time.end_time = now.clone()
                        .hour(hours)
                        .minute(minutes)
                        .second(seconds)
                        .toDate();
                    return;
                }
                if (t) {
                    this.manual_time.end_time = this.moment(t).add(1, 'hour').toDate();
                }
            },
            openNewChecklist(){
                this.newCheckList = true;
                const ref = this.$refs.ncl;
                setTimeout(function(){ ref.focus();},0);
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
                    img.crossOrigin = "anonymous";
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
            async makeCover(task, attachment){
                task.cover = attachment;
                await this.saveTask({cover: attachment.id});
                this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(task.cover.path)
            },
            removeCover(task){
                this.saveTask({cover: null});
                task.cover = null;
            },
            toggleDetails(){
                this.editDescription = true
            },
            onEditorReady(editor){editor.focus();},
            deleteAttachment(id){
                // `index` used to be the position inside the *sorted* display
                // list (sortedAttachments), but we splice the real
                // this.task.attachments array — those two orders don't match,
                // so the wrong item (or nothing) got removed and it looked
                // like delete "wasn't real time". Look the item up by id in
                // the real array instead, and remove it immediately (optimistic
                // UI) rather than waiting on the response.
                const realIndex = this.task.attachments.findIndex(a => a.id === id);
                if (realIndex === -1) return;

                if(this.task.cover && (this.task.cover.id === id)){
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

                const maxSizeBytes = 50 * 1024 * 1024; // 50MB in bytes
                let uploadedCount = 0;
                let failedCount = 0;

                // Upload every selected file (the input now allows picking
                // more than one at a time), one after another so attachments
                // land in the order they were picked and the file input
                // isn't reset mid-batch.
                for (const file of files) {
                    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                    // Screenshots/images are valid attachments too — the file
                    // picker's accept filter previously only advertised PDFs
                    // (plus whatever the backend "allowed_file_types" setting
                    // listed), so screenshots didn't even show up as
                    // selectable in some browsers' file dialogs.
                    const isImageFile = file.type.startsWith('image/') || this.isImage(file.name);

                    // 1. Validate File Type (PDF or image)
                    if (!isPdf && !isImageFile) {
                        this.toastWarning(this.$t('{name}: only PDF or image files are allowed.').replace('{name}', file.name));
                        failedCount++;
                        continue;
                    }

                    // 2. Validate File Size (Max 50MB)
                    if (file.size > maxSizeBytes) {
                        this.toastWarning(this.$t('{name}: exceeds the 50MB limit.').replace('{name}', file.name));
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
            async uploadFile(file){
                try {
                    let formData = new FormData();
                    formData.append("file", file);
                    const resp = await axios.post(this.route('task.attachment.add', this.task.id), formData,{
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                    return resp.data;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    return { error: true, message: this.$t('Failed to upload the file.') };
                }
            },
            goToLink(link){ window.location.href = link; },
            startTimer(start_now){
                let started = this.counter.timer.started_at ? this.moment.utc(this.counter.timer.started_at) : this.moment();
                let seconds = parseInt(this.moment.duration(this.moment().diff(started)).asSeconds())

                seconds = this.counter.timer.duration + seconds;
                this.counter.ticker = setInterval(() => {
                    this.counter.seconds = ++seconds;
                    this.activeTimerString = this.moment.utc(moment.duration(this.counter.seconds + parseInt(this.counter.duration),'seconds').as('milliseconds')).format('H[h] m[m] s[s]')
                }, 1000)
                if(start_now){
                    this.eTimer(this.counter)
                }
            },
            eTimer(counter, stopped){
                this.$page.props.counter = counter
                this.$page.props.tracker = {started: true}
                if(stopped){
                    this.$page.props.tracker.started = false;
                }
            },
            startTracker(){
                axios.post(this.route('task.timer.start'), {task_id: this.task.id}).then((response) => {
                    if(response.data){
                        this.counter.timer = response.data;
                        this.startTimer(true);
                        this.toastInfo(this.$t('Timer started.'), { duration: 2000 });
                    }
                }).catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to start the timer.'));
                });
            },
            stopTracker(){
                axios.post(this.route('task.timer.stop'), { duration: this.counter.seconds, id: this.counter.timer.id, task_id: this.task.id }).then((response) => {
                    if(response.data){
                        this.stopTimer();
                        this.counter.duration = response.data;
                        this.toastSuccess(this.$t('Timer stopped and time logged.'), { duration: 2000 });
                    }
                }).catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to stop the timer.'));
                });
            },
            stopTimer(){
                clearInterval(this.counter.ticker)
                this.activeTimerString = ''
                this.eTimer(this.counter, true)
            },
            totalTime(){
                if(this.activeTimerString){
                    return this.activeTimerString;
                }else if(this.counter.duration){
                    return this.moment.utc(moment.duration(this.counter.duration,'seconds').as('milliseconds')).format('H[h] m[m] s[s]');
                }
                return '0:00:00'
            },
            calculateTimeSpent(timer){
                if (timer.stopped_at) {
                    const started = this.moment(timer.started_at)
                    const stopped = this.moment(timer.stopped_at)
                    return this.moment.duration(stopped.diff(started)).format();
                }
                return ''
            },
            async moveTask(){
                const project_id = this.move_object.project_id;
                const taskObject = { previous_list: this.task.list_id, new_list: this.move_object.list_id, from: this.task.order, to: this.move_object.order, task_id: this.task.id };
                if(taskObject.previous_list !== taskObject.new_list){
                    taskObject.is_move = true;
                    await this.saveTask({ list_id: taskObject.new_list })
                }
                if(this.task.project_id !== project_id){
                    await this.saveTask({ project_id })
                }
                await this.saveList(project_id, taskObject);
                Object.assign(this.task, { project_id, order: taskObject.to, list_id: taskObject.new_list });
                this.task.project = this.getSelectedProject()
                this.task.list = this.getSelectedList()
                this.showMoveCard = false;
                this.is_move = false;
                this.toastSuccess(this.$t('Task moved.'), { duration: 2000 });
            },
            saveList(project_id, taskObject){
                axios.post(this.route('task.update.list', project_id),taskObject).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to move the task.'));
                })
            },
            getSelectedList(){
                let listItem =  this.list_items.filter(l=> {
                    return l.id === this.move_object.list_id && l.project_id === this.move_object.project_id
                });
                if(!listItem.length){
                    listItem = this.list_items.filter(l=> l.project_id === this.move_object.project_id)
                    this.move_object.list_id = listItem[0].id
                }
                return listItem[0];
            },
            getSelectedProjectLists(){
                return this.list_items.filter(l=>l.project_id === this.move_object.project_id);
            },
            getSelectedListPostions(){
                return this.getSelectedList().id === this.task.list_id ? parseInt(this.getSelectedList().tasks_count, 10) : parseInt(this.getSelectedList().tasks_count, 10) + 1;
            },
            getSelectedProject(){
                return this.projects.filter(p=>p.id === this.move_object.project_id)[0];
            },
            displayMoveCard(){
                this.move_object.project_id = this.task.project.id;
                this.move_object.list_id = this.task.list.id;
                this.move_object.order = this.task.order;
                this.showMoveCard = true;
            },
            searchLabel(input){
                return this.labels.filter(lab => lab.name.toLowerCase().indexOf(input) > -1);
            },
            searchUser(input){
                return this.team_members.filter(tm => tm.user.name.toLowerCase().indexOf(input) > -1);
            },
            deleteLabel(id){
                axios.post(this.route('labels.delete', id)).then(() => {
                    this.toastSuccess(this.$t('Label deleted.'));
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to delete the label.'));
                })
                const findIndex = this.labels.findIndex(l=>l.id === id);
                this.labels.splice(findIndex, 1);
                const tlIndex = this.task.task_labels.findIndex(tl=>tl.label_id === id);
                if(tlIndex > -1){
                    this.task.task_labels.splice(tlIndex, 1);
                }
                this.label = {};
            },
            saveLabel(labelObject){
                labelObject.project_id = this.task.project_id;
                axios.post(this.route('labels.save'), labelObject).then((response) => {
                    if(response.data && !labelObject.id){
                        this.labels.push(response.data);
                    }else if(labelObject.id){
                        const findIndex = this.labels.findIndex(l=>l.id === labelObject.id);
                        const tlIndex = this.task.task_labels.findIndex(tl=>tl.label_id === labelObject.id);
                        this.labels[findIndex] = labelObject;
                        if(tlIndex > -1){
                            this.task.task_labels[tlIndex]['label'] = labelObject;
                        }
                    }
                    this.showEditLabelBox = false;
                    this.showLabelBox = true;
                    this.toastSuccess(this.$t('Label saved.'), { duration: 2000 });
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to save the label.'));
                })
                this.label = {};
            },
            addLabelToTask(checked, id){
                axios.post(this.route('task.labels.add'), {task_id: this.task.id, label_id: id}).then((response) => {
                    if(response.data){
                        if(checked){
                            this.task.task_labels.push(response.data);
                        }else{
                            const findIndex = this.task.task_labels.findIndex(tl=>tl.label_id === id);
                            if(findIndex > -1){
                                this.task.task_labels.splice(findIndex, 1);
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to update labels.'));
                })
            },
            assignUserToTask(checked, id){
                axios.post(this.route('task.assignees.add'), {task_id: this.task.id, user_id: id}).then((response) => {
                    if(response.data){
                        if(checked && response.data.assignee){
                            this.task.assignees.push(response.data.assignee);
                        }else{
                            const findIndex = this.task.assignees.findIndex(a => Number(a.user_id) === Number(id));
                            if(findIndex > -1){
                                this.task.assignees.splice(findIndex, 1);
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to update assignees.'));
                })
            },
            task_label_ids(){
                return this.task.task_labels.map(item => item.label_id);
            },
            task_assignees(){
                return this.task.assignees.map(item => Number(item.user_id));
            },
            saveDetails(){
                if(this.task.description){
                    const desc = this.task.description;
                    this.editDescription = false;
                    this.saveTask({ description: desc });
                }
            },
            async deleteTask(){
                try {
                    await axios.post(this.route('task.delete', this.task.id), {});
                    this.goToLink(this.route(this.view === 'table'?'projects.view.table':'projects.view.board', this.task.project_id));
                } catch (error) {
                    console.error(error);
                    this.toastError(this.$t('Failed to delete the task.'));
                }
            },
            saveTask(taskObject){
                return axios.post(this.route('task.update', this.task.id), taskObject).then((response) => {
                    if(response.data){
                        // this.sendNotification('send.mail.task_update', response.data.id)
                    }
                    return response.data;
                }).catch((error) => {
                    console.log(error);
                    this.toastError(this.$t('Failed to save changes.'));
                });
            },
            checklistDoneCount(checkList){
                return checkList.filter(item => !!item.is_done).length;
            },
            modifyCheck(check_list){
                check_list.modify = true;
                setTimeout(()=> {
                    document.getElementById('modify_'+check_list.id).focus()
                }, 10)
            },
            deleteCheckList(id, index, checkLists){
                axios.post(this.route('check_list.delete', id)).then(() => {
                    this.toastSuccess(this.$t('Checklist item deleted.'), { duration: 2000 });
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to delete the checklist item.'));
                })
                checkLists.splice(index, 1);
            },
            deleteComment(id, comments, activity_id){
                axios.post(this.route('comment.delete', id)).then((response) => {
                    if(response.data){
                        comments.unshift(response.data)
                        const findIndex = this.task.activities.findIndex(activity => activity.id === activity_id);
                        if (findIndex !== -1) {
                            this.task.activities.splice(findIndex, 1);
                        }
                        this.toastSuccess(this.$t('Comment deleted.'), { duration: 2000 });
                    }
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to delete the comment.'));
                })
            },
            modifyCheckListSubmit(check_list, c_index, checklist){
                if(!check_list.title){
                    this.deleteCheckList(check_list.id, c_index, checklist)
                }else{
                    this.saveCheckList(check_list.id, {title: check_list.title});
                }
                check_list.modify = false
            },
            inputNewChecklistAction(check_list, e){
                if((e && e.keyCode === 13) || !e){
                    if(!check_list.title){
                        this.newCheckList = false;
                    }else{
                        this.saveNewCheckList({title: check_list.title, task_id: this.task.id}, this.task.checklists);
                        this.openNewChecklist()
                    }
                }
            },
            saveCheckList(id, checkListObject){
                axios.post(this.route('check_list.update', id), checkListObject).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to update the checklist item.'));
                })
            },
            saveComment(id, commentObject){
                commentObject.updated_at = this.moment().format('YYYY-MM-DD HH:mm:ss');
                axios.post(this.route('comment.update', id), { details: commentObject.details, updated_at: commentObject.updated_at }).then(() => {
                    this.toastSuccess(this.$t('Comment updated.'), { duration: 2000 });
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to update the comment.'));
                })
            },
            saveNewCheckList(checkListObject, currentCheckList){
                this.new_chek_list.title = '';
                axios.post(this.route('check_list.new'), checkListObject).then((response) => {
                    if(response.data){
                        currentCheckList.push(response.data);
                    }
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to add the checklist item.'));
                })
            },
            saveNewComment(commentObject, currentComments){
                this.new_comment.details = '';
                commentObject.created_at = this.moment().format('YYYY-MM-DD HH:mm:ss')
                axios.post(this.route('comments.new'), commentObject).then((response) => {
                    if(response.data){
                        this.showCommentBox = false;
                        currentComments.unshift(response.data)
                        this.toastSuccess(this.$t('Comment posted.'), { duration: 2000 });
                    }
                }).catch((error) => {
                    console.log(error)
                    this.toastError(this.$t('Failed to post the comment.'));
                })
            },
            sendNotification(uri, id, user_id){
                const data = {id}
                if(!!user_id){
                    data.user_id = user_id;
                }
                axios.post(this.route(uri, data)).catch((error) => {
                    console.log(error);
                })
            },
            async getTask(id){
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
                        this.toastError(this.$t('Something went wrong loading this task.'));
                    }
                } catch (error) {
                    console.error('Error fetching task:', error);
                    this.toastError(this.$t('Failed to fetch task data.'));
                } finally {
                    this.loading = false;
                }
            },
            saveTitle(e){
                if (e.keyCode === 13 || e.type === 'blur'){
                    e.preventDefault();
                    e.target.blur();
                    if (e.target.innerText){
                        const title = e.target.innerText;
                        axios.post(this.route('task.update', this.task.id),{ title }).then((response) => {
                            if(response.data){
                                // this.sendNotification('send.mail.task_update', response.data.id)
                            }
                        }).catch((error) => {
                            console.log(error);
                            this.toastError(this.$t('Failed to update the title.'));
                        })
                    }
                }
            },
            async getOtherData(){
                const dataResponse = await axios.get(this.route('task.other.data', {task_id: this.task.id, project_id: this.task.project_id}));
                const res = dataResponse.data;
                this.labels = res.labels || [];
                this.list_items = res.lists || [];
                this.projects = res.projects || [];
                this.team_members = res.team_members || [];
                this.existing_timer = res.timer || null;
                this.counter.duration = res.duration || 0;
                this.move_object.order = this.task.order;

                this.loadAvailableUsers();

                setTimeout(async ()=>{
                    if(this.task.cover && this.$refs.t__cover){
                        this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(this.task.cover.path)
                    }
                })

            },

            // Custom Editor Methods
            loadAvailableUsers() {
                this.availableUsers = [];

                if (this.task && this.task.project && this.task.project.team_members) {
                    this.availableUsers = this.task.project.team_members.map(member => ({
                        id: member.user.id,
                        name: member.user.name,
                        email: member.user.email,
                        avatar: member.user.avatar || member.user.photo_path
                    }));
                } else if (this.team_members && this.team_members.length > 0) {
                    this.availableUsers = this.team_members.map(member => ({
                        id: member.user ? member.user.id : member.id,
                        name: member.user ? member.user.name : member.name,
                        email: member.user ? member.user.email : member.email,
                        avatar: member.user ? (member.user.avatar || member.user.photo_path) : member.avatar
                    }));
                } else if (this.task && this.task.assignees && this.task.assignees.length > 0) {
                    this.availableUsers = this.task.assignees.map(assignee => ({
                        id: assignee.user.id,
                        name: assignee.user.name,
                        email: assignee.user.email,
                        avatar: assignee.user.avatar || assignee.user.photo_path
                    }));
                } else if (this.$page.props.auth.user) {
                    this.availableUsers = [{
                        id: this.$page.props.auth.user.id,
                        name: this.$page.props.auth.user.name,
                        email: this.$page.props.auth.user.email,
                        avatar: this.$page.props.auth.user.avatar || this.$page.props.auth.user.photo_path
                    }];
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
            this.moment = moment
            this.getTask(this.id)
        },
        mounted() {
            let self = this;
            window.addEventListener('keyup', function(ev) {
                if(ev.key === "Escape"){
                    if(self.isPopup){
                        self.$emit('closeModal', true)
                    }else{
                        self.goToLink(self.route(self.view === 'table'?'projects.view.table':'projects.view.board', task.project.slug || task.project.id))
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
            this.toasts.forEach(t => clearTimeout(t.timer));
            this.endNoteDrag();
        },
        name: "task-details"
    };
</script>

<style scoped>
    /* Mention Popup Styles */
    .mention-popup {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

    /* Mention styles for task description */
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

    /* Enhanced Date/Time Picker positioning in modal */
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

    /* ============================================================ */
    /* Toast / Alert Notifications                                  */
    /* ============================================================ */
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
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
        border-left: 4px solid #64748b;
        overflow: hidden;
        pointer-events: auto;
    }

    :global(.dark) .toast-item {
        background: #1f2937;
        box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .toast-item--success { border-left-color: #16a34a; }
    .toast-item--error { border-left-color: #dc2626; }
    .toast-item--warning { border-left-color: #d97706; }
    .toast-item--info { border-left-color: #2563eb; }

    .toast-item__icon {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        margin-top: 1px;
    }
    .toast-item__icon svg { width: 100%; height: 100%; }

    .toast-item--success .toast-item__icon { color: #16a34a; }
    .toast-item--error .toast-item__icon { color: #dc2626; }
    .toast-item--warning .toast-item__icon { color: #d97706; }
    .toast-item--info .toast-item__icon { color: #2563eb; }

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
    :global(.dark) .toast-item__title { color: #f1f5f9; }

    .toast-item__message {
        font-size: 13px;
        line-height: 1.4;
        color: #334155;
        word-break: break-word;
    }
    :global(.dark) .toast-item__message { color: #cbd5e1; }

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
        transition: color 0.15s ease, background 0.15s ease;
    }
    .toast-item__close svg { width: 100%; height: 100%; }
    .toast-item__close:hover { color: #334155; background: rgba(100,116,139,0.12); }
    :global(.dark) .toast-item__close:hover { color: #e2e8f0; background: rgba(148,163,184,0.15); }

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
    .toast-item--success .toast-item__bar { color: #16a34a; }
    .toast-item--error .toast-item__bar { color: #dc2626; }
    .toast-item--warning .toast-item__bar { color: #d97706; }
    .toast-item--info .toast-item__bar { color: #2563eb; }

    @keyframes toast-progress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
    }

    /* Enter / leave transitions for transition-group */
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

    @media (max-width: 480px) {
        .toast-stack {
            top: 12px;
            left: 12px;
            right: 12px;
            width: auto;
            transform: none;
        }
    }

    /* Preview / draw modal: fade the backdrop in, pop the panel in
       slightly scaled + lifted, so opening it feels intentional rather
       than an instant hard cut. Reverses on close. */
    .modal-pop-enter-active {
        transition: opacity 0.2s ease-out;
    }
    .modal-pop-enter-active .modal-pop__panel {
        transition: opacity 0.22s ease-out, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .modal-pop-leave-active {
        transition: opacity 0.15s ease-in;
    }
    .modal-pop-leave-active .modal-pop__panel {
        transition: opacity 0.15s ease-in, transform 0.15s ease-in;
    }
    .modal-pop-enter-from,
    .modal-pop-leave-to {
        opacity: 0;
    }
    .modal-pop-enter-from .modal-pop__panel,
    .modal-pop-leave-to .modal-pop__panel {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
    }

    /* Simple cross-fade used for the page-render loading spinner. */
    .modal-fade-enter-active,
    .modal-fade-leave-active {
        transition: opacity 0.15s ease;
    }
    .modal-fade-enter-from,
    .modal-fade-leave-to {
        opacity: 0;
    }
</style>