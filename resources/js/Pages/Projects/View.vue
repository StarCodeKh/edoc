<template>
    <div class="h-full" :class="{'right_menu_enable': show_right_menu}">
        <Head :title="$t(title)" />
        <board-view-menu :project="project" @filter-toggle="open_filter = !open_filter" @menu-toggle="show_right_menu = !show_right_menu" @fClear="reset()" :filters="filters" view="board" />
        <board-filter :project="project" @board-filter="open_filter = false" :filters="filters" v-if="open_filter" @do-filter="doFilter" options="user,due,label"  />
        <div class="task_board">

            <div v-if="loading" class="board_width animate-pulse">
                <div role="status" class="l__b"><div class="__img"><icon name="pulse_image" class="__i" /></div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1" /><div class="__t_l_2"></div></div><icon class="__t_l_r" name="user" /></div><span class="sr-only">Loading...</span></div>
                <div role="status" class="l__b"><div class="__img"><icon name="pulse_image" class="__i" /></div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1" /><div class="__t_l_2"></div></div><icon class="__t_l_r" name="user" /></div><span class="sr-only">Loading...</span></div>
                <div role="status" class="l__b"><div class="__img"><icon name="pulse_image" class="__i" /></div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1" /><div class="__t_l_2"></div></div><icon class="__t_l_r" name="user" /></div><span class="sr-only">Loading...</span></div>
                <div role="status" class="l__b"><div class="__img"><icon name="pulse_image" class="__i" /></div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1" /><div class="__t_l_2"></div></div><icon class="__t_l_r" name="user" /></div><span class="sr-only">Loading...</span></div>
                <div role="status" class="l__b"><div class="__img"><icon name="pulse_image" class="__i" /></div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1" /><div class="__t_l_2"></div></div><icon class="__t_l_r" name="user" /></div><span class="sr-only">Loading...</span></div>
            </div>
            <div v-else class="board_width" :class="{'v_label': showLabelName}">
                <div v-for="(listItem, listIndex) in lists" class="top_list" :key="listItem.id">
                    <div class="b__list">
                        <div class="flex w-full text-sm font-semibold">
                            <span class="px-2 py-1 w-full" contenteditable="true" @keypress="saveListTitle($event, listItem.id)" @blur="saveListTitle($event, listItem.id)">{{ listItem.title }}</span>
                        </div>
                        <span class="inline-flex items-center justify-center px-2 py-1 ml-1 mr-1 text-xs cursor-default font-semibold text-indigo-500 bg-indigo-600 rounded-full bg-opacity-30" aria-label="Total Tasks">{{ getDoneCount(listItem)+'/'+listItem.tasks.length }}</span>
                        <button @click="listItem.show_more = !listItem.show_more" class="flex items-center justify-center w-6 h-6 ml-auto text-indigo-500 rounded hover:bg-[#091e4224]">
                            <icon class="w-5 w-5" name="more-h" />
                        </button>
                        <div v-if="listItem.show_more" class="absolute right-9 top-2 w-30 z-999 bg-white py-3 rounded shadow">
                            <button v-if="listIndex!==0" @click="moveList(listIndex, 'minus');listItem.show_more = false;" class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">
                                <icon class="mr-2 h-4 w-4 " name="move_left" />
                                {{ $t('Move Left') }}
                            </button>
                            <button v-if="listIndex !== lists.length - 1" @click="moveList(listIndex, 'plus');listItem.show_more = false;" class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">
                                {{ $t('Move Right') }}
                                <icon class="ml-2 h-4 w-4 " name="move_right" />
                            </button>
                            <button @click="makeListArchive($event, listItem.id, listIndex)" class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">
                                <icon class="mr-2 h-4 w-4 " name="archive" />
                                {{ $t('Archive') }}
                            </button>
                        </div>
                    </div>
                    <draggable :data-id="listItem.id" class="dragArea" :list="listItem.tasks" group="task" item-key="id" @end="afterDrop($event)">
                        <template #item="{ element, index }">
                            <div :data-id="element.id" class="t__box group hover:bg-opacity-100" draggable="true" :class="{ 'is-selected-for-merge': selectedTaskIds.includes(element.id) }">
                                <label class="task-select-checkbox" :class="{ 'task-select-checkbox--checked': selectedTaskIds.includes(element.id) }" @click.stop>
                                    <input type="checkbox" :checked="selectedTaskIds.includes(element.id)" @change="toggleTaskSelect(element.id)">
                                    <icon name="tick_check" class="w-3 h-3" />
                                </label>
                                <div v-if="element.show_more" class="absolute right-7 top-1 w-30 z-999 bg-gray-100">
                                    <button v-if="element.is_done" @click="makeArchive($event, element.id, listItem.tasks, index)" class="m__archive">
                                        <icon class="mr-2 h-4 w-4 " name="archive" />
                                        {{ $t('Archive') }}
                                    </button>
                                    <button v-if="element.is_done" @click="saveTask(element.id, {is_done: false})" class="m__archive">
                                        <icon class="mr-2 h-4 w-4 " name="incomplete" />
                                        {{ $t('Mark incomplete') }}
                                    </button>
                                    <button v-if="!element.is_done" @click="saveTask(element.id, {is_done: true})" class="m__archive">
                                        <icon class="mr-2 h-4 w-4 " name="complete" />
                                        {{ $t('Mark complete') }}
                                    </button>
                                </div>
                                <button @click="visibleShowMore($event, element)" class="hidden show__more group-hover:flex">
                                    <icon class="w-4 h-4" name="more" />
                                </button>
                                <icon v-if="element.timer" name="blink" class="w-2 h-2 absolute top-2 right-2 z-20" />
                                <div v-if="element.cover" @click="taskDetailsPopup(element.slug || element.id)" class="t__cover" :style="{backgroundImage: 'url('+element.cover.path+')', height: element.cover.width?element.cover.height/(element.cover.width/246)+'px':'auto'}"></div>

                                <div class="t__details" @click="taskDetailsPopup(element.slug || element.id)">
                                    <div class="task__labels" v-if="element.task_labels.length">
                                        <button @click="visibleLabel($event)" class="color" v-for="(la, l_index) in element.task_labels" :style="{backgroundColor: la.label.color}" :aria-label="la.label.name">{{ la.label.name }}</button>
                                    </div>
                                    <div class="t__title__area">
                                        <div v-if="element.is_done" class="checklist-box" @click="cardSwitchClick($event)">
                                            <input type="checkbox" :checked="!!element.is_done" @change="cardSwitchToggle(element, $event)" />
                                            <icon name="checklist_box" />
                                        </div>
                                        <h4 class="t__title">{{ element.title }}</h4>
                                    </div>

                                    <div class="doc-track-row">
                                        <div
                                            @click.stop="openReceiptModal(element, $event)"
                                            class="doc-track-chip"
                                            :title="$t('Print tracking document')"
                                        >
                                            <span class="doc-track-chip__icon">
                                                <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M7 8.5V3.5h10v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="8.5" width="16" height="7.5" rx="1.4" stroke="currentColor" stroke-width="1.6"/><rect x="7" y="13.5" width="10" height="7" rx="0.6" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="11" r="0.9" fill="currentColor"/></svg>
                                            </span>
                                            <span class="doc-track-chip__text">
                                                <span class="doc-track-chip__label">{{ $t('Tracking Document') }}</span>
                                                <span class="doc-track-chip__code">{{ documentCode(element) }}</span>
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            @click.stop="openDrawer(element)"
                                            class="doc-view-btn"
                                            :title="$t('View detail')"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/></svg>
                                        </button>
                                    </div>

                                    <!-- Note shown once a task has absorbed other tasks via
                                         merge — the merge code + how many were combined in.
                                         Clicking it opens the same drawer/popup as the icon above. -->
                                    <div v-if="hasBeenMerged(element)" class="merged-note" :title="$t('This task has been merged — click to view')" @click.stop="openDrawer(element)">
                                        <svg viewBox="0 0 24 24" fill="none" class="merged-note__icon w-3 h-3"><path d="M6 3v10a4 4 0 0 0 4 4h4M6 3L3 6m3-3l3 3M18 21v-4M18 21l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                        <span>{{ $t('Has been merged') }} · {{ latestMergeCode(element) }}</span>
                                    </div>

                                    <div class="card__footer" @click="taskDetailsPopup(element.slug || element.id)">
                                        <div v-if="element.due_date" aria-label="Due date" class="__item due" :class="getDue(element)">
                                            <icon class="w-4 h-4" name="time" />
                                            <span class="pl-[2px] pr-[4px] leading-none"> {{ moment(element.due_date).format('MMM D') }} </span>
                                        </div>
                                        <div class="__item" v-if="element.description" aria-label="This task has a description.">
                                            <icon class="w-4 h-4" name="details" />
                                        </div>
                                        <div class="relative __item" v-if="element.comments_count" aria-label="Comments">
                                            <icon class="w-4 h-4" name="comment" />
                                            <span class="ml-1 leading-none"> {{ element.comments_count }} </span>
                                        </div>
                                        <div class="__item" v-if="element.attachments_count" aria-label="Attachments">
                                            <icon class="w-4 h-4" name="attachment" />
                                            <span class="ml-1 leading-none"> {{ element.attachments_count }} </span>
                                        </div>
                                        <div class="__item check" v-if="element.checklists_count" aria-label="Checklist items" :class="{'completed': element.checklist_done_count === element.checklists_count}">
                                            <icon class="w-4 h-4" name="checklist" />
                                            <span class="ml-1 leading-none"> {{ element.checklist_done_count+'/'+element.checklists_count }} </span>
                                        </div>
                                    </div>
                                    <div class="pop__assignee">
                                        <span v-for="assignee in element.assignees" :aria-label="assignee.user.name" class="block rounded-full h-6 w-6">
                                            <img v-if="assignee.user.photo_path" class="h-full w-full rounded-full" :src="assignee.user.photo_path" :alt="assignee.user.name">
                                            <img v-else class="h-full w-full rounded-full" src="/images/user.svg" :alt="assignee.user.name">
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </template>
                        <template #footer>
                            <div class="add_new pt-1">
                                <div v-if="!listItem.new_task_open" class="group mb-1.5 flex cursor-pointer items-center rounded py-2 hover:bg-white ltr:pl-2 rtl:pr-2" @click="openNewTask(listItem)">
                                    <icon class="w-5 w-5 text-indigo-500" name="add" />
                                    <span class="block text-sm text-gray-500">{{ $t('Add a task') }}</span>
                                </div>
                                <div class="mb-2" v-show="listItem.new_task_open">
                                    <input autofocus :id="'new_task_input_id_'+listItem.id" :ref="'new_task_input_'+listItem.id" type="text" v-model="new_task.title" class="block text-sm font-medium w-full px-4 py-3 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" :placeholder="$t('Enter a title for this task')" @keyup="$event.keyCode === 13?submitNewTask(listItem, listIndex):''">
                                    <div class="pl-1 mt-2 flex">
                                        <button @click="submitNewTask(listItem, listIndex)" class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-2.5 py-1.5 text-xs rounded">
                                            {{ $t('Add task') }}
                                        </button>
                                        <button @click="listItem.new_task_open = false" class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 focus:ring-indigo-500 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1">
                                            <icon class="w-4 h-4" name="close" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </draggable>
                </div>
                <div class="flex flex-col w-72 add__new__list">
                    <div class="add_new" :class="{'active': new_list_open}">
                        <div v-if="!new_list_open" class="group p-3 flex cursor-pointer items-center rounded" @click="openNewList()">
                            <icon class="w-5 w-5" name="add" />
                            <span class="block text-sm">{{ $t('Add a new list') }}</span>
                        </div>
                        <div class="p-3" v-show="new_list_open">
                            <input autofocus type="text" :id="'new_list_input_id_'+lists.length" :ref="'new_list_input_'+lists.length" v-model="new_list.title" class="block text-sm font-medium w-full px-2 py-2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter list title..." @keyup="$event.keyCode === 13?submitNewList($event):''">
                            <div class="mt-2 flex">
                                <button @click="submitNewList($event)" class="inline-flex items-center border font-medium shadow-sm text-white border-transparent bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 text-xs rounded">
                                    Add list
                                </button>
                                <button @click="new_list_open = false" class="inline-flex items-center border font-medium shadow-sm text-gray-700 border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex-shrink-0 w-6"></div>
            </div>
        </div>

        <!-- Modals at the root level -->
        <task-details v-if="taskDetailsOpen" :id="taskDetailsId" view="board" :isPopup="td_pop" @closeModal="closeDetails()" />

        <DocumentReceipt
            v-if="receiptModalOpen"
            :task="selectedReceiptTask"
            @close="closeReceiptModal"
        />

        <right-menu v-if="show_right_menu" :project="project" @menu-toggle="show_right_menu = !show_right_menu" @openTask="(id)=>taskDetailsPopup(id)" />

        <!-- Floating bar: appears once 2+ cards are checked -->
        <transition name="fade-slide-up">
            <div v-if="selectedTaskIds.length >= 2" class="merge-bar">
                <span class="merge-bar__count">{{ selectedTaskIds.length }} {{ $t('selected') }}</span>
                <button type="button" class="merge-bar__cancel" @click="clearSelection()">{{ $t('Cancel') }}</button>
                <button type="button" class="merge-bar__merge" @click="openMergeModal()">
                    <icon name="tick_check" class="w-3.5 h-3.5" />
                    {{ $t('Merge') }}
                </button>
            </div>
        </transition>

        <!-- Merge confirmation popup — "system-generated document preview" style -->
        <div v-if="mergeModalOpen" class="doc-preview-backdrop" @click.self="closeMergeModal()">
            <div class="doc-preview-shell">
                <div class="doc-preview-shell__topbar">
                    <span>{{ $t('System-generated document preview') }}</span>
                    <button type="button" class="doc-preview-shell__close" @click="closeMergeModal()">
                        <icon name="close" class="w-4 h-4" />
                    </button>
                </div>
                <div class="doc-preview-shell__body">
                    <div class="doc-preview-card">
                        <div class="doc-preview-card__eyebrow">{{ $t('Task board') }} · {{ $t('Merge consolidation') }}</div>
                        <div class="doc-preview-card__title">{{ $t('Task Merge Document') }}</div>
                        <div class="doc-preview-card__rule"></div>

                        <div class="doc-preview-card__meta">
                            <div><span class="doc-preview-card__meta-label">{{ $t('Ref. No.') }}</span> <span class="doc-preview-card__meta-value">{{ mergeRefNo }}</span></div>
                            <div>{{ $t('Date') }}: <span class="doc-preview-card__meta-value">{{ moment().format('DD MMM, HH:mm') }}</span></div>
                        </div>

                        <table class="doc-preview-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{{ $t('Task') }}</th>
                                    <th>{{ $t('Code') }}</th>
                                    <th>{{ $t('List') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(t, i) in selectedTasksDetails" :key="t.id" :class="{ 'doc-preview-table__row--kept': mergeTargetId === t.id }">
                                    <td>{{ i + 1 }}</td>
                                    <td>{{ t.title }}</td>
                                    <td class="doc-preview-table__code">{{ documentCode(t) }}</td>
                                    <td>
                                        <label class="doc-preview-radio">
                                            <input type="radio" name="merge_target" :value="t.id" v-model="mergeTargetId">
                                            <span>{{ mergeTargetId === t.id ? $t('Keep this one') : $t('Merge away') }}</span>
                                        </label>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="doc-preview-card__field">
                            <span class="doc-preview-card__field-label">{{ $t('Consolidated subject line') }}</span>
                            <input type="text" v-model="mergeSubject" class="doc-preview-card__field-input">
                        </div>

                        <p class="doc-preview-card__note">
                            {{ $t('Generated automatically by the task board. Consolidates') }} {{ selectedTasksDetails.length }} {{ $t('task(s) into one record — comments, attachments and checklist items combine into the kept task.') }}
                        </p>

                        <div class="doc-preview-barcode">
                            <div class="doc-preview-barcode__bars">
                                <span v-for="n in 46" :key="n" :style="{ width: (n % 5 === 0 ? 3 : 1.5) + 'px' }"></span>
                            </div>
                            <div class="doc-preview-barcode__code">{{ mergeTargetId ? documentCode(findTaskById(mergeTargetId) || {}) : mergeRefNo }}</div>
                        </div>
                    </div>
                </div>
                <div class="doc-preview-shell__footer">
                    <button type="button" class="doc-preview-btn doc-preview-btn--ghost" @click="closeMergeModal()">{{ $t('Cancel') }}</button>
                    <button type="button" class="doc-preview-btn doc-preview-btn--primary" :disabled="!mergeTargetId || merging" @click="confirmMerge()">
                        <icon name="tick_check" class="w-3.5 h-3.5" />
                        {{ merging ? $t('Merging...') : $t('Merge & Register') }}
                    </button>
                </div>
            </div>
        </div>

        <transition name="drawer-slide">
            <div v-if="drawerOpen" class="doc-drawer-backdrop" @click.self="closeDrawer()">
                <div class="doc-drawer">
                    <div class="doc-drawer__header">
                        <button type="button" class="doc-drawer__close" @click="closeDrawer()">
                            <icon name="close" class="w-4 h-4" />
                        </button>
                        <div class="doc-drawer__ref">{{ drawerTask ? documentCode(drawerTask) : '' }} · {{ $t('Task Document') }}</div>
                        <div class="doc-drawer__title">{{ drawerTask ? drawerTask.title : '' }}</div>
                        <span v-if="drawerTask && hasBeenMerged(drawerTask)" class="doc-drawer__badge">
                            {{ $t('Has been merged') }} · {{ drawerTask.merged_history.length }} {{ $t('combined') }}
                        </span>
                        <span v-else class="doc-drawer__badge">{{ $t('Not merged') }}</span>
                        <span v-if="drawerTask && latestMergeCode(drawerTask)" class="doc-drawer__badge doc-drawer__badge--code">{{ latestMergeCode(drawerTask) }}</span>
                    </div>

                    <div class="doc-drawer__body">
                        <div class="doc-drawer__section-label">{{ $t('Particulars') }}</div>
                        <div class="doc-drawer__grid">
                            <div class="doc-drawer__field">
                                <span class="doc-drawer__field-label">{{ $t('Received') }}</span>
                                <span class="doc-drawer__field-value">{{ drawerTask && drawerTask.created_at ? moment(drawerTask.created_at).format('DD MMM, HH:mm') : 'N/A' }}</span>
                            </div>
                            <div class="doc-drawer__field">
                                <span class="doc-drawer__field-label">{{ $t('Updated') }}</span>
                                <span class="doc-drawer__field-value">{{ drawerTask && drawerTask.updated_at ? moment(drawerTask.updated_at).format('DD MMM, HH:mm') : 'N/A' }}</span>
                            </div>
                            <div class="doc-drawer__field">
                                <span class="doc-drawer__field-label">{{ $t('Priority') }}</span>
                                <span class="doc-drawer__field-value">{{ (drawerTask && drawerTask.priority) || $t('Normal') }}</span>
                            </div>
                            <div class="doc-drawer__field">
                                <span class="doc-drawer__field-label">{{ $t('Assigned') }}</span>
                                <span class="doc-drawer__field-value">{{ drawerAssigneeNames || '— ' + $t('not yet assigned') + ' —' }}</span>
                            </div>
                        </div>

                        <div class="doc-drawer__section-label-row">
                            <span class="doc-drawer__section-label">
                                {{ (drawerTask && hasBeenMerged(drawerTask)) ? $t('Combined from') : $t('Document') }} · {{ drawerDocuments.length }}
                            </span>
                            <span class="doc-drawer__hint">{{ $t('Click an item to view its detail') }}</span>
                        </div>

                        <div class="doc-drawer__doclist">
                            <div v-for="(doc, i) in drawerDocuments" :key="doc.id" class="doc-drawer__docrow">
                                <button type="button" class="doc-drawer__docrow-main" @click="openDocDetail(i)">
                                    <span class="doc-drawer__app-index">{{ i + 1 }}</span>
                                    <span class="doc-drawer__docrow-title">{{ doc.title }}</span>
                                    <svg viewBox="0 0 24 24" fill="none" class="doc-drawer__docrow-chevron doc-drawer__docrow-chevron--arrow"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <button
                                    type="button"
                                    class="doc-drawer__docrow-open"
                                    :title="$t('Open full task')"
                                    @click.stop="openTaskFromDoc(doc)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>

                        <div class="doc-drawer__section-label">{{ $t('Audit trail') }}</div>
                        <div v-if="drawerLoadingActivities" class="doc-drawer__timeline-loading">
                            <span class="doc-drawer__timeline-spinner"></span>
                            {{ $t('Loading...') }}
                        </div>
                        <div v-else class="doc-drawer__timeline">
                            <div v-if="!drawerActivities.length" class="doc-drawer__timeline-empty">
                                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/></svg>
                                <span>{{ $t('No activity recorded yet.') }}</span>
                            </div>
                            <div class="doc-drawer__timeline-item" v-for="a in drawerActivities" :key="a.id">
                                <span class="doc-drawer__timeline-icon" :class="auditIconBg(a.field_changed)">
                                    <icon :name="auditIcon(a.field_changed)" class="w-3 h-3" />
                                </span>
                                <div class="doc-drawer__timeline-card">
                                    <div class="doc-drawer__timeline-top">
                                        <span class="doc-drawer__timeline-text">{{ auditText(a) }}</span>
                                        <span class="doc-drawer__timeline-time">{{ moment(a.created_at).fromNow() }}</span>
                                    </div>
                                    <div class="doc-drawer__timeline-bottom">
                                        <span v-if="a.user && a.user.name" class="doc-drawer__timeline-user">
                                            <span class="doc-drawer__timeline-avatar">{{ (a.user.name || '?').charAt(0).toUpperCase() }}</span>
                                            {{ a.user.name }}
                                        </span>
                                        <span class="doc-drawer__timeline-abs">{{ moment(a.created_at).format('DD MMM, HH:mm') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <div v-if="docDetailOpen && currentDocDetail" class="fixed inset-0 z-[560] bg-black/40 flex items-center justify-center p-4" @click.self="closeDocDetail()">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div class="flex items-start justify-between px-5 pt-5 pb-3">
                    <div class="flex items-start gap-3 min-w-0">
                        <span class="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0"></span>
                        <div class="min-w-0">
                            <h3 class="text-base font-bold text-gray-900 leading-snug truncate">{{ currentDocDetail.title }}</h3>
                            <p class="text-xs text-gray-500 mt-0.5">{{ $t('Document') }} {{ drawerExpandedIndex + 1 }} {{ $t('of') }} {{ drawerDocuments.length }}</p>
                        </div>
                    </div>
                    <button type="button" @click="closeDocDetail()" class="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex-shrink-0">
                        <icon name="close" class="w-4 h-4" />
                    </button>
                </div>

                <div class="px-5 pb-2 divide-y divide-gray-100">
                    <div class="flex items-center justify-between py-2.5">
                        <span class="text-xs text-gray-500">{{ $t('Tracking code') }}</span>
                        <span class="text-sm font-medium text-gray-900">{{ currentDocDetail.code }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2.5">
                        <span class="text-xs text-gray-500">{{ $t('Status') }}</span>
                        <span class="text-sm font-medium text-gray-900">{{ currentDocDetail.kept ? $t('Kept task') : $t('Merged in') }}</span>
                    </div>
                    <div v-if="currentDocDetail.merge_code" class="flex items-center justify-between py-2.5">
                        <span class="text-xs text-gray-500">{{ $t('Merge code') }}</span>
                        <span class="text-sm font-medium text-gray-900">{{ currentDocDetail.merge_code }}</span>
                    </div>
                    <div v-if="currentDocDetail.merged_at" class="flex items-center justify-between py-2.5">
                        <span class="text-xs text-gray-500">{{ $t('Merged at') }}</span>
                        <span class="text-sm font-medium text-gray-900">{{ moment(currentDocDetail.merged_at).format('DD MMM, HH:mm') }}</span>
                    </div>
                </div>

                <div class="px-5 pb-2">
                    <button
                        type="button"
                        @click="openTaskFromDoc(currentDocDetail)"
                        class="w-full inline-flex items-center justify-center gap-1.5 border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-sm font-medium rounded-lg py-2"
                    >
                        {{ $t('Open full task') }} →
                    </button>
                </div>

                <div v-if="!currentDocDetail.kept" class="px-5 pb-2">
                    <button
                        type="button"
                        :disabled="unmerging"
                        @click="unmergeItem(currentDocDetail)"
                        class="w-full inline-flex items-center justify-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m18 0V5a2 2 0 0 0-2-2h-4M9 21H5a2 2 0 0 1-2-2v-4m18 0v4a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        {{ unmerging ? $t('Unmerging...') : $t('Unmerge this task') }}
                    </button>
                </div>

                <div class="flex gap-2 px-5 pb-5 pt-2">
                    <button
                        type="button"
                        :disabled="drawerDocuments.length < 2"
                        @click="pagerStep(-1)"
                        class="flex-1 inline-flex items-center justify-center gap-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← {{ $t('Prev') }}
                    </button>
                    <button
                        type="button"
                        :disabled="drawerDocuments.length < 2"
                        @click="pagerStep(1)"
                        class="flex-1 inline-flex items-center justify-center gap-1 border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {{ $t('Next') }} →
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {Head, Link} from '@inertiajs/vue3'
    import Layout from '@/Shared/Layout.vue'
    import Icon from '@/Shared/Icon.vue'
    import TaskDetails from '@/Shared/Modals/TaskDetails.vue'
    import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
    import draggable from 'vuedraggable'
    import moment from 'moment'
    import BoardFilter from "@/Shared/BoardFilter.vue";
    import throttle from "lodash/throttle";
    import pickBy from "lodash/pickBy";
    import mapValues from "lodash/mapValues";
    import RightMenu from "@/Shared/RightMenu.vue";
    import axios from 'axios'

    import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue'

    export default {
    metaInfo: { title: 'Dashboard' },
        components: {
            RightMenu,
            BoardFilter,
            Head,
            Icon,
            Link,
            draggable,
            TaskDetails,
            BoardViewMenu,
            DocumentReceipt
        },
    layout: Layout,
        props: {
            auth: Object,
            title: String,
            tasks: Object,
            project: Object,
            list_index: Object,
            filters: Object,
            lists: {
                required: false
            },
            task: {
                required: false
            },
        },
        remember: 'form',
        data() {
            return {
                errors: [],
                loading: false,
                show_right_menu: false,
                new_list_open: false,
                td_pop: false,
                showLabelName: false,

                // State for Document Receipt Modal
                receiptModalOpen: false,
                selectedReceiptTask: null,

                // Multi-select + merge
                selectedTaskIds: [],
                mergeModalOpen: false,
                mergeTargetId: null,
                merging: false,
                mergeSubject: '',
                mergeRefNo: '',

                // Right-side drawer shown after a merge completes
                drawerOpen: false,
                drawerTask: null,
                drawerActivities: [],
                drawerLoadingActivities: false,
                drawerExpandedIndex: 0,
                docDetailOpen: false,
                unmerging: false,

                firstResponse: [],
                lastResponse: [],
                new_task: {},
                new_list: {},
                taskDetailsOpen: false,
                activeTimerString: '',
                months: [],
                counter: { seconds: 0, timer: this.timer },
                drag: false,
                new_task_open: false,
                taskDetailsId: '',
                open_filter: false,
                form: {
                    user: this.filters.user,
                    due: this.filters.due,
                    label: this.filters.label,
                    task: this.filters.task ?? null,
                },
            }
        },
        watch: {
            form: {
                deep: true,
                handler: throttle(function() {
                    this.$inertia.get(this.route('projects.view.board', this.project.slug || this.project.id), pickBy(this.form), { preserveState: true })
                }, 150),
            },
        },
        computed: {
            selectedTasksDetails() {
                return this.selectedTaskIds
                    .map(id => this.findTaskById(id))
                    .filter(Boolean);
            },
            drawerAssigneeNames() {
                if (!this.drawerTask || !Array.isArray(this.drawerTask.assignees) || !this.drawerTask.assignees.length) return '';
                return this.drawerTask.assignees.map(a => a.user && a.user.name).filter(Boolean).join(', ');
            },
            drawerDocuments() {
                if (!this.drawerTask) return [];
                const docs = [{
                    id: 'kept-' + this.drawerTask.id,
                    taskId: this.drawerTask.id,
                    slug: this.drawerTask.slug || null,
                    code: this.documentCode(this.drawerTask),
                    title: this.drawerTask.title,
                    kept: true,
                    merged_at: null,
                }];
                (this.drawerTask.merged_history || []).forEach((m) => {
                    docs.push({
                        id: m.id,
                        taskId: m.id,
                        slug: m.slug || null,
                        code: m.code,
                        title: m.title,
                        kept: false,
                        merged_at: m.merged_at,
                        merge_code: m.merge_code,
                    });
                });
                return docs;
            },
            currentDocDetail() {
                return this.drawerDocuments[this.drawerExpandedIndex] || null;
            },
        },
        created() {
            this.moment = moment

            let currentUrl = this.$page.url.substr(1)
            const currentUrlArray = currentUrl.split('/');

            if(this.task){
                this.taskDetailsId = this.task.slug || this.task.id;
                this.taskDetailsOpen = true;
            }
            if(!!this.filters.task){
                this.taskDetailsPopup(this.filters.task)
            }
        },
        methods: {
        documentCode(element){
            if (element.task_code) return element.task_code;
            return 'CGMC-' + String(element.id).padStart(9, '0');
        },
        hasBeenMerged(element) {
            return !!(element && Array.isArray(element.merged_history) && element.merged_history.length);
        },
        latestMergeCode(element) {
            if (!this.hasBeenMerged(element)) return '';
            const last = element.merged_history[element.merged_history.length - 1];
            return (last && last.merge_code) || '';
        },

        // --- Audit trail — icon, colored badge, and human-readable text
        // per activity, keyed off the same `field_changed` values the
        // task's own detail page (TaskDetails.vue) already uses.
        auditIcon(field) {
            const map = {
                title: 'edit', slug: 'edit', list_id: 'edit', order: 'edit',
                due_date: 'time', is_done: 'checklist_box', is_archive: 'archive',
                description: 'details', cover: 'pulse_image',
                comment: 'comment', comment_edit: 'comment', comment_delete: 'comment',
            };
            return map[field] || 'edit';
        },
        auditIconBg(field) {
            const map = {
                title: 'doc-drawer__timeline-icon--blue', slug: 'doc-drawer__timeline-icon--blue',
                list_id: 'doc-drawer__timeline-icon--sky', order: 'doc-drawer__timeline-icon--sky',
                due_date: 'doc-drawer__timeline-icon--orange', is_done: 'doc-drawer__timeline-icon--green',
                is_archive: 'doc-drawer__timeline-icon--amber', description: 'doc-drawer__timeline-icon--indigo',
                cover: 'doc-drawer__timeline-icon--purple',
                comment: 'doc-drawer__timeline-icon--gold', comment_edit: 'doc-drawer__timeline-icon--gold',
                comment_delete: 'doc-drawer__timeline-icon--red',
            };
            return map[field] || 'doc-drawer__timeline-icon--gray';
        },
        auditText(a) {
            const field = a.field_changed;
            switch (field) {
                case 'title':
                case 'slug':
                case 'list_id':
                case 'order':
                case 'due_date':
                    return (a.old_value || '—') + ' → ' + (a.new_value || '—');
                case 'is_done':
                    return a.old_value || this.$t('Marked done / undone');
                case 'is_archive':
                    return a.old_value || this.$t('Archive status changed');
                case 'description':
                    return this.$t('Updated the description');
                case 'cover':
                    return this.$t('Updated the cover image');
                case 'comment':
                    return this.$t('Posted a comment');
                case 'comment_edit':
                    return this.$t('Edited a comment');
                case 'comment_delete':
                    return this.$t('Deleted a comment');
                default:
                    return field + ' ' + this.$t('updated');
            }
        },

        openReceiptModal(task, e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectedReceiptTask = task;
            this.receiptModalOpen = true;
        },
        closeReceiptModal() {
            this.receiptModalOpen = false;
            this.selectedReceiptTask = null;
        },

        // --- Multi-select + merge -------------------------------------
        findTaskById(id) {
            for (const list of this.lists) {
                const task = list.tasks.find(t => t.id === id);
                if (task) return task;
            }
            return null;
        },
        toggleTaskSelect(id) {
            const idx = this.selectedTaskIds.indexOf(id);
            if (idx > -1) {
                this.selectedTaskIds.splice(idx, 1);
            } else {
                this.selectedTaskIds.push(id);
            }
        },
        clearSelection() {
            this.selectedTaskIds = [];
        },
        openMergeModal() {
            this.mergeTargetId = this.selectedTaskIds[0];
            this.mergeRefNo = 'MRG-' + moment().format('YYYY') + '-' + String(this.mergeTargetId).padStart(4, '0');
            this.mergeSubject = this.buildDefaultSubject();
            this.mergeModalOpen = true;
        },
        buildDefaultSubject() {
            const titles = this.selectedTasksDetails.map(t => t.title).filter(Boolean);
            if (!titles.length) return '';
            const initials = titles.map(t => (t.trim()[0] || '').toUpperCase()).join(' & ');
            return 'Consolidated task — ' + initials + ' (' + titles.length + ' tasks)';
        },
        closeMergeModal() {
            this.mergeModalOpen = false;
        },
        removeTaskFromLists(id) {
            for (const list of this.lists) {
                const idx = list.tasks.findIndex(t => t.id === id);
                if (idx > -1) {
                    list.tasks.splice(idx, 1);
                    return;
                }
            }
        },
        confirmMerge() {
            if (!this.mergeTargetId) return;
            const sourceIds = this.selectedTaskIds.filter(id => id !== this.mergeTargetId);
            if (!sourceIds.length) {
                this.closeMergeModal();
                this.clearSelection();
                return;
            }

            this.merging = true;
            axios.post(this.route('task.merge'), {
                target_id: this.mergeTargetId,
                source_ids: sourceIds,
                subject: this.mergeSubject,
            }).then((response) => {
                sourceIds.forEach(id => this.removeTaskFromLists(id));
                let keptTask = null;
                if (response.data) {
                    keptTask = this.updateTaskEntry(this.mergeTargetId, response.data);
                }
                this.closeMergeModal();
                this.clearSelection();
                this.openDrawer(keptTask || response.data);
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                this.merging = false;
            });
        },
        openDrawer(task) {
            if (!task) return;
            this.drawerTask = task;
            this.drawerOpen = true;
            this.drawerExpandedIndex = 0;
            this.fetchDrawerActivities(task.id);
        },
        closeDrawer() {
            this.drawerOpen = false;
            this.drawerTask = null;
            this.drawerActivities = [];
            this.drawerExpandedIndex = 0;
            this.docDetailOpen = false;
        },
        openDocDetail(index) {
            this.drawerExpandedIndex = index;
            this.docDetailOpen = true;
        },
        closeDocDetail() {
            this.docDetailOpen = false;
        },
        pagerStep(delta) {
            const total = this.drawerDocuments.length;
            if (!total) return;
            let next = this.drawerExpandedIndex + delta;
            if (next < 0) next = total - 1;
            if (next >= total) next = 0;
            this.drawerExpandedIndex = next;
        },
        unmergeItem(doc) {
            if (!doc || doc.kept || !this.drawerTask || this.unmerging) return;
            this.unmerging = true;
            axios.post(this.route('task.unmerge'), {
                target_id: this.drawerTask.id,
                history_id: doc.id,
            }).then((response) => {
                const target = response.data && response.data.target;
                const restored = response.data && response.data.restored;

                if (target) {
                    this.updateTaskEntry(this.drawerTask.id, target);
                    this.drawerTask = target;
                }
                if (restored) {
                    const normalized = Object.assign({
                        task_labels: [],
                        assignees: [],
                        comments_count: 0,
                        attachments_count: 0,
                        checklists_count: 0,
                        checklist_done_count: 0,
                        show_more: false,
                    }, restored);
                    const list = this.lists.find(l => l.id === normalized.list_id);
                    if (list) list.tasks.push(normalized);
                }

                if (!this.drawerTask || !this.hasBeenMerged(this.drawerTask)) {
                    this.closeDocDetail();
                    this.closeDrawer();
                } else {
                    const total = this.drawerDocuments.length;
                    if (this.drawerExpandedIndex >= total) {
                        this.drawerExpandedIndex = total - 1;
                    }
                }
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                this.unmerging = false;
            });
        },
        fetchDrawerActivities(taskId) {
            this.drawerLoadingActivities = true;
            this.drawerActivities = [];
            axios.get(this.route('task.activities', taskId)).then((response) => {
                this.drawerActivities = response.data || [];
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                this.drawerLoadingActivities = false;
            });
        },

        openTaskFromDoc(doc) {
            if (!doc || !doc.taskId) return;
            this.closeDocDetail();
            this.closeDrawer();
            this.taskDetailsPopup(doc.slug || doc.taskId);
        },
        // ----------------------------------------------------------------
        cardSwitchClick(e){
            e.stopPropagation();
        },
        cardSwitchToggle(element, e){
            e.preventDefault();
            e.stopPropagation();
            this.saveTask(element.id, {is_done: e.target.checked})
        },
            getDoneCount(list){
                return list.tasks.filter((t) => !!t.is_done).length;
            },
            getDue(element){
                return element.is_done ? 'done' : moment().isAfter(element.due_date)?'over_due' : moment(element.due_date).isBetween(moment(), moment().add(1, 'day')) ? 'due_soon' : '';
            },
            openNewTask(listItem){
                for (let n = 0; n < this.lists.length; n++) {
                    if(!!this.lists[n].new_task_open){
                        this.lists[n].new_task_open = false;
                    }
                }
                listItem.new_task_open = true
                this.new_task.title = '';
                this.setFocus(this.$refs['new_task_input_'+listItem.id][0]);
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
            openNewList(){
                this.new_list.title = '';
                this.new_list_open = true
                this.setFocus(this.$refs['new_list_input_'+this.lists.length]);
            },
            setFocus(ref){
                setTimeout(function(){
                    if(ref){
                        ref.focus();
                    }
                },10);
            },
            closeDetails(){
                this.form.task = null;
                this.taskDetailsOpen = false
            },
            reset() {
                this.form = mapValues(this.form, () => null)
            },
            doFilter(form){
                Object.assign(this.form, form);
            },
            submitNewList(e){
                e.preventDefault();
                if(this.new_list.title){
                    axios.post(this.route('json.list.add'), {project_id: this.project.id, order: this.lists.length, title: this.new_list.title}).then((response) => {
                        if(response.data){
                            const listItem = response.data;
                            listItem.tasks = [];
                            this.lists.push(listItem)
                            this.openNewList()
                        }
                    })
                }else{
                    this.new_list_open = false;
                }
            },
            async moveList(index, position){
                position = position === 'minus'? index - 1 : index + 1;
                const lists = this.lists.map(l=>l.order);
                const newList = this.array_move(lists, index, position);
                let listObject = [];

                let i = 0, len = this.lists.length;
                while (i < len) {
                    this.lists[i].order = newList[i];
                    listObject.push({id: this.lists[i].id, order: newList[i]});
                    i++
                }
                this.lists.sort((a, b) => a.order -  b.order);
                await axios.post(this.route('json.list.order'), listObject);
            },
            array_move(arr, old_index, new_index) {
                if (new_index >= arr.length) {
                    let k = new_index - arr.length + 1;
                    while (k--) {
                        arr.push(undefined);
                    }
                }
                arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
                return arr;
            },
            makeListArchive(e, id, index){
                e.preventDefault();
                axios.post(this.route('json.list.archive', id)).then((response) => {
                    if(response.data){
                        this.lists.splice(index, 1)
                    }
                })
            },
            makeArchive(e, id, tasks, index){
                e.preventDefault();
                e.stopPropagation();
                this.saveTask(id, { is_archive: 1 });
                tasks.splice(index, 1)
            },
            visibleShowMore(e, element){ e.preventDefault(); e.stopPropagation(); element.show_more = !!element.show_more?false:true },
            visibleLabel(e){
                e.preventDefault();
                e.stopPropagation();
                this.showLabelName = !this.showLabelName;
            },
            saveListTitle(e, board_id){
                if (e.keyCode === 13 || e.type === 'blur'){
                    e.preventDefault();
                    e.target.blur();
                    if (e.target.innerText){
                        const title = e.target.innerText;
                        this.changeBoardTitle(board_id, title);
                    }
                }
            },
            changeBoardTitle(id, title){
                axios.post(this.route('board.update', id),{ title }).then((response) => {
                    if(response.data){
                        this.sendNotification('send.mail.board_update', id)
                    }
                }).catch((error) => {
                    console.log(error)
                })
            },
            afterDrop(e){
                const new_list = this.newSortedItems(e, 'to');
                let previous_list = [];
                if(!!e.pullMode){
                    previous_list = this.newSortedItems(e, 'from');
                    this.saveTask(e.item.dataset.id, { list_id: e.to.dataset.id })
                }
                const list_items = new_list.concat(previous_list);
                this.saveOrder(list_items)
            },
            newSortedItems(e, selector){
                const lists = e[selector].getElementsByClassName("t__box");
                const newOrder = [];
                for (let i = 0; i < lists.length; i++) {
                    newOrder.push({id: lists[i].dataset.id, order: i+1})
                }
                return newOrder;
            },
            updateTaskEntry(taskId, newData) {
                for (const list of this.lists) {
                    const task = list.tasks.find(t => t.id === taskId)
                    if (task) {
                        Object.assign(task, newData)
                        return task
                    }
                }
                return null
            },
            saveTask(id, taskObject){
                axios.post(this.route('task.update', id), taskObject).then((response) => {
                    this.updateTaskEntry(id, taskObject)
                }).catch((error) => {
                    console.log(error)
                })
            },
            saveOrder(taskObject){
                axios.post(this.route('task.update.order'), taskObject).catch((error) => {
                    console.log(error)
                })
            },
            submitNewTask( listItem, listIndex ){
                if(this.new_task.title){
                    let task = { title: this.new_task.title, project_id: this.project.id, list_id: listItem.id, order: listItem.tasks.length+1 };
                    this.saveNewTask(task, listIndex);
                    this.openNewTask(listItem)
                }else{
                    listItem.new_task_open = false
                }
            },
            saveNewTask(taskObject, listIndex){
                const tasks = this.lists[listIndex].tasks;
                axios.post(this.route('task.new'), taskObject).then((response) => {
                    if(response && response.data){
                        tasks.push(response.data)
                        // Auto pop up the task details modal right after creation,
                        // so the tracking code / ID is immediately visible.
                        this.taskDetailsPopup(response.data.slug || response.data.id)
                    }
                }).catch((error) => {
                    console.log(error)
                })
            },
            taskDetailsPopup(id){
                this.form.task = id;
                this.td_pop = true;
                this.taskDetailsId = id;
                this.taskDetailsOpen = true;
            },
            goToLink(link){
                window.location.href = link;
            },
            add: function() {
                this.list.push({ name: "Juan" });
            },
            replace: function() {
                this.list = [{ name: "Edgard" }];
            },
            clone: function(el) {
                return {
                    name: el.name + " cloned"
                };
            },
            log: function(evt) {
                window.console.log(evt);
            },
        },
    }
</script>

<style scoped>

    :deep(.dragArea) {
        display: flex;
        flex-direction: column;
    }
    .doc-track-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
    }
    .doc-track-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 6px;
        background: #eef2ff;
        border: 1px solid #e0e7ff;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        width: fit-content;
    }
    .doc-view-btn {
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: #eef2ff;
        border: 1px solid #e0e7ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .doc-view-btn:hover {
        background: #e0e7ff;
        border-color: #c7d2fe;
    }
    .dark .doc-view-btn {
        background: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.25);
        color: #a5b4fc;
    }

    .doc-track-chip:hover {
        background: #e0e7ff;
        border-color: #c7d2fe;
        transform: translateY(-1px);
    }

    .doc-track-chip__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4f46e5;
        flex-shrink: 0;
    }

    .doc-track-chip__text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
    }

    .doc-track-chip__label {
        font-size: 8.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #6366f1;
    }

    .doc-track-chip__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
    }

    .dark .doc-track-chip {
        background: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.25);
    }
    .dark .doc-track-chip:hover {
        background: rgba(99, 102, 241, 0.2);
    }
    .dark .doc-track-chip__code {
        color: #e5e7eb;
    }

    /* "Has been merged" note under the tracking chip */
    .merged-note {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin: 0 0 4px;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(184, 134, 11, 0.1);
        border: 1px solid rgba(184, 134, 11, 0.25);
        color: #92660a;
        font-size: 10px;
        font-weight: 700;
        width: fit-content;
    }
    .merged-note__icon {
        flex-shrink: 0;
    }
    .dark .merged-note {
        background: rgba(184, 134, 11, 0.16);
        color: #e6b95c;
        border-color: rgba(184, 134, 11, 0.3);
    }

    /* Multi-select checkbox on each card */
    .t__box {
        position: relative;
    }
    .task-select-checkbox {
        position: absolute;
        top: 6px;
        left: 6px;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 5px;
        background: #ffffff;
        border: 1.5px solid #d1d5db;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
    }
    .task-select-checkbox input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        cursor: pointer;
    }
    .task-select-checkbox :deep(svg) {
        display: none;
        color: #ffffff;
    }
    .t__box:hover .task-select-checkbox,
    .task-select-checkbox--checked {
        opacity: 1;
    }
    .task-select-checkbox--checked {
        background: #4f46e5;
        border-color: #4f46e5;
        transform: scale(1.05);
    }
    .task-select-checkbox--checked :deep(svg) {
        display: block;
    }
    .t__box.is-selected-for-merge {
        outline: 2px solid #4f46e5;
        outline-offset: -2px;
        border-radius: 6px;
    }

    /* Floating merge bar */
    .merge-bar {
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        z-index: 400;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px 10px 16px;
        border-radius: 999px;
        background: #1f2937;
        color: #ffffff;
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.4);
    }
    .merge-bar__count {
        font-size: 13px;
        font-weight: 600;
        margin-right: 4px;
    }
    .merge-bar__cancel {
        background: transparent;
        border: none;
        color: #cbd5e1;
        font-size: 13px;
        cursor: pointer;
        padding: 6px 10px;
    }
    .merge-bar__cancel:hover {
        color: #ffffff;
    }
    .merge-bar__merge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #4f46e5;
        border: none;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: 999px;
        cursor: pointer;
        transition: background-color 0.15s ease;
    }
    .merge-bar__merge:hover {
        background: #4338ca;
    }

    .fade-slide-up-enter-active,
    .fade-slide-up-leave-active {
        transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .fade-slide-up-enter-from,
    .fade-slide-up-leave-to {
        opacity: 0;
        transform: translate(-50%, 12px);
    }

    /* ---------------------------------------------------------------- */
    /* Merge preview — "system-generated document" style                */
    /* ---------------------------------------------------------------- */
    .doc-preview-backdrop {
        position: fixed;
        inset: 0;
        z-index: 500;
        background: rgba(31, 41, 34, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
    }
    .doc-preview-shell {
        width: 100%;
        max-width: 620px;
        max-height: 88vh;
        background: #faf9f1;
        border-radius: 16px;
        box-shadow: 0 28px 60px -14px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #e7e3d3;
    }
    .doc-preview-shell__topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #1f3d2b;
        border-bottom: 1px solid #e7e3d3;
        flex-shrink: 0;
    }
    .doc-preview-shell__close {
        background: #ffffff;
        border: 1px solid #e7e3d3;
        border-radius: 8px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #1f3d2b;
    }
    .doc-preview-shell__body {
        padding: 20px;
        overflow-y: auto;
    }
    .doc-preview-card {
        background: #ffffff;
        border: 1px solid #e7e3d3;
        border-radius: 12px;
        padding: 22px;
    }
    .doc-preview-card__eyebrow {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        text-align: center;
        color: #6b7d70;
    }
    .doc-preview-card__title {
        font-size: 19px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        text-align: center;
        color: #16241a;
        margin-top: 4px;
    }
    .doc-preview-card__rule {
        height: 2px;
        background: #16241a;
        margin: 14px 0;
    }
    .doc-preview-card__meta {
        display: flex;
        justify-content: space-between;
        font-size: 12.5px;
        color: #4b5563;
        margin-bottom: 14px;
    }
    .doc-preview-card__meta-label {
        font-weight: 600;
    }
    .doc-preview-card__meta-value {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-weight: 700;
        color: #1f3d2b;
    }
    .doc-preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
        margin-bottom: 16px;
    }
    .doc-preview-table th {
        text-align: left;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #4b5563;
        background: #f2f0e4;
        padding: 8px 10px;
        border: 1px solid #e7e3d3;
    }
    .doc-preview-table td {
        padding: 8px 10px;
        border: 1px solid #e7e3d3;
        color: #1f2937;
        vertical-align: middle;
    }
    .doc-preview-table__row--kept {
        background: rgba(184, 134, 11, 0.08);
    }
    .doc-preview-table__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-weight: 600;
        color: #1f3d2b;
    }
    .doc-preview-radio {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        white-space: nowrap;
        font-size: 11.5px;
    }
    .doc-preview-radio input {
        accent-color: #b8860b;
    }
    .doc-preview-card__field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
    }
    .doc-preview-card__field-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #6b7d70;
    }
    .doc-preview-card__field-input {
        border: 1px solid #d8d3bd;
        border-radius: 8px;
        padding: 9px 11px;
        font-size: 13px;
        color: #1f2937;
        background: #fffdf7;
    }
    .doc-preview-card__field-input:focus {
        outline: none;
        border-color: #b8860b;
    }
    .doc-preview-card__note {
        font-size: 11.5px;
        font-style: italic;
        color: #6b7280;
        line-height: 1.5;
        border-top: 1px dashed #e7e3d3;
        padding-top: 12px;
        margin: 0 0 16px;
    }
    .doc-preview-barcode {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .doc-preview-barcode__bars {
        display: flex;
        align-items: flex-end;
        gap: 1.5px;
        height: 42px;
    }
    .doc-preview-barcode__bars span {
        display: block;
        height: 100%;
        background: #16241a;
    }
    .doc-preview-barcode__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11.5px;
        letter-spacing: 0.08em;
        color: #1f2937;
    }
    .doc-preview-shell__footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 14px 20px;
        border-top: 1px solid #e7e3d3;
        background: #ffffff;
        flex-shrink: 0;
    }
    .doc-preview-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border: none;
    }
    .doc-preview-btn--ghost {
        background: #ffffff;
        color: #4b5563;
        border: 1px solid #d8d3bd;
    }
    .doc-preview-btn--ghost:hover {
        background: #f2f0e4;
    }
    .doc-preview-btn--primary {
        background: #b8860b;
        color: #ffffff;
    }
    .doc-preview-btn--primary:hover {
        background: #a1750a;
    }
    .doc-preview-btn--primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* ---------------------------------------------------------------- */
    /* Right-side drawer — merged document detail, one by one            */
    /* ---------------------------------------------------------------- */
    .doc-drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 520;
        background: rgba(15, 23, 42, 0.4);
        display: flex;
        justify-content: flex-end;
    }
    .doc-drawer {
        width: 100%;
        max-width: 400px;
        height: 100%;
        background: #ffffff;
        box-shadow: -18px 0 40px -18px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }
    .doc-drawer__header {
        position: relative;
        background: linear-gradient(135deg, #1f3d2b, #16241a);
        color: #ffffff;
        padding: 22px 44px 18px 20px;
        flex-shrink: 0;
    }
    .doc-drawer__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.12);
        border: none;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .doc-drawer__close:hover {
        background: rgba(255, 255, 255, 0.22);
    }
    .doc-drawer__ref {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #d4c88a;
    }
    .doc-drawer__title {
        font-size: 17px;
        font-weight: 700;
        margin-top: 6px;
        line-height: 1.35;
    }
    .doc-drawer__badge {
        display: inline-block;
        margin-top: 10px;
        margin-right: 6px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.14);
        padding: 4px 9px;
        border-radius: 999px;
    }
    .doc-drawer__badge--code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.02em;
        background: rgba(216, 172, 65, 0.22);
        color: #f3dfa4;
    }
    .doc-drawer__body {
        padding: 18px 20px 28px;
    }
    .doc-drawer__section-label {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #6b7280;
        margin: 18px 0 8px;
    }
    .doc-drawer__section-label:first-child {
        margin-top: 0;
    }
    .doc-drawer__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .doc-drawer__field {
        border: 1px solid #e5e7eb;
        border-radius: 9px;
        padding: 9px 11px;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .doc-drawer__field-label {
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #9ca3af;
    }
    .doc-drawer__field-value {
        font-size: 12.5px;
        font-weight: 600;
        color: #111827;
    }
    .doc-drawer__app-index {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #f2f0e4;
        color: #1f3d2b;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .doc-drawer__section-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 18px 0 8px;
    }
    .doc-drawer__section-label-row .doc-drawer__section-label {
        margin: 0;
    }
    .doc-drawer__hint {
        font-size: 10.5px;
        color: #9ca3af;
    }
    .doc-drawer__doclist {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .doc-drawer__docrow {
        width: 100%;
        display: flex;
        align-items: stretch;
        gap: 6px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        transition: border-color 0.15s ease, background-color 0.15s ease;
        overflow: hidden;
    }
    .doc-drawer__docrow:hover {
        border-color: #b8860b;
        background: rgba(184, 134, 11, 0.06);
    }
    .doc-drawer__docrow-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
    }
    .doc-drawer__docrow-open {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        border: none;
        border-left: 1px solid #e5e7eb;
        background: #f9fafb;
        color: #4b5563;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
    }
    .doc-drawer__docrow-open:hover {
        background: #eef2ff;
        color: #4f46e5;
    }
    .doc-drawer__docrow-title {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        color: #1f2937;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .doc-drawer__docrow-tag {
        flex-shrink: 0;
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #1f3d2b;
        background: #f2f0e4;
        padding: 2px 7px;
        border-radius: 999px;
    }
    .doc-drawer__docrow-chevron {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        color: #9ca3af;
    }
    .doc-drawer__docrow:hover .doc-drawer__docrow-chevron--arrow {
        color: #b8860b;
    }

    /* --- Audit trail — "cool" one-by-one vertical timeline --- */
    .doc-drawer__timeline-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #9ca3af;
        padding: 12px 0;
    }
    .doc-drawer__timeline-spinner {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        border: 2px solid #e5e7eb;
        border-top-color: #b8860b;
        animation: doc-drawer-spin 0.7s linear infinite;
    }
    @keyframes doc-drawer-spin {
        to { transform: rotate(360deg); }
    }
    .doc-drawer__timeline {
        position: relative;
        padding-left: 2px;
    }
    .doc-drawer__timeline-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 26px 0;
        color: #9ca3af;
        font-size: 12px;
        text-align: center;
    }
    .doc-drawer__timeline-item {
        display: flex;
        gap: 10px;
        position: relative;
        padding-bottom: 12px;
    }
    .doc-drawer__timeline-item::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 24px;
        bottom: -2px;
        width: 1px;
        background: #e5e7eb;
    }
    .doc-drawer__timeline-item:last-child::before {
        display: none;
    }
    .doc-drawer__timeline-icon {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        margin-top: 1px;
        box-shadow: 0 0 0 3px #ffffff;
    }
    .doc-drawer__timeline-icon :deep(svg) {
        width: 11px;
        height: 11px;
    }
    .doc-drawer__timeline-icon--blue { background: #3b82f6; }
    .doc-drawer__timeline-icon--sky { background: #0ea5e9; }
    .doc-drawer__timeline-icon--orange { background: #f97316; }
    .doc-drawer__timeline-icon--green { background: #22c55e; }
    .doc-drawer__timeline-icon--amber { background: #f59e0b; }
    .doc-drawer__timeline-icon--indigo { background: #6366f1; }
    .doc-drawer__timeline-icon--purple { background: #a855f7; }
    .doc-drawer__timeline-icon--gold { background: #b8860b; }
    .doc-drawer__timeline-icon--red { background: #ef4444; }
    .doc-drawer__timeline-icon--gray { background: #9ca3af; }
    .doc-drawer__timeline-card {
        flex: 1;
        min-width: 0;
        background: #f9fafb;
        border: 1px solid #f0f1f3;
        border-radius: 10px;
        padding: 8px 10px;
        transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .doc-drawer__timeline-item:hover .doc-drawer__timeline-card {
        border-color: #e5e7eb;
        background: #ffffff;
    }
    .doc-drawer__timeline-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
    }
    .doc-drawer__timeline-text {
        font-size: 12.5px;
        color: #1f2937;
        font-weight: 500;
        line-height: 1.4;
    }
    .doc-drawer__timeline-time {
        flex-shrink: 0;
        font-size: 10px;
        color: #9ca3af;
        white-space: nowrap;
    }
    .doc-drawer__timeline-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
    }
    .doc-drawer__timeline-user {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: #16a34a;
        font-weight: 600;
    }
    .doc-drawer__timeline-avatar {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: #16a34a;
        color: #ffffff;
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .doc-drawer__timeline-abs {
        font-size: 10px;
        color: #d1d5db;
    }

    .drawer-slide-enter-active,
    .drawer-slide-leave-active {
        transition: opacity 0.2s ease;
    }
    .drawer-slide-enter-from,
    .drawer-slide-leave-to {
        opacity: 0;
    }
    .drawer-slide-enter-active .doc-drawer,
    .drawer-slide-leave-active .doc-drawer {
        transition: transform 0.25s ease;
    }
    .drawer-slide-enter-from .doc-drawer,
    .drawer-slide-leave-to .doc-drawer {
        transform: translateX(100%);
    }
</style>