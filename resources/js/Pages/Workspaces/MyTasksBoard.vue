<template>
  <div class="h-full" :class="{'right_menu_enable': show_right_menu}">
      <Head :title="$t(title)" />
      <div class="project__view__menu w-full p-2 text-sm flex justify-first items-center">
          <div class="inline-flex w-full flex-wrap items-center">
              <div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap">
                  <h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">{{ workspace.name }}</h2>
                  <Link v-for="(option, option_index) in viewOptions" class="flex py-2 px-3 items-center cursor-pointer capitalize rounded" :class="{ 'active': currentView === option.slug }" :href="route('workspace.view.my-tasks.'+option.slug, workspace.slug || workspace.id)">
                      <icon :name="viewIcons[option_index]" class="w-4 fill-[#ffffff] h-4 mr-[5px]" />
                      {{ $t(option.name) }}
                  </Link>
              </div>
              <div class="flex items-center flex-start gap-1 ml-auto view__menus">
                  <button class="flex pl-4 pr-2 items-center __filter cursor-pointer capitalize rounded hover:bg-[#a6c5e229]" @click="open_filter = !open_filter" :class="{'active': findFilters()}"> 
                      <icon name="filter" class="w-4 fill-[#ffffff] h-4 mr-[5px]" />
                      <span>{{ $t('Filter') }} </span>
                      <span class="filter_clear" @click="clearFilter($event)">{{ $t('Clear All') }} <icon name="close" class="w-4 h-4" /></span>
                  </button>
              </div>
          </div>
      </div>
      <board-filter :workspace="workspace" @board-filter="open_filter = false" :filters="filters" v-if="open_filter" @do-filter="doFilter" options="due,label"  />
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
                          <div :data-id="element.id" class="t__box group hover:bg-opacity-100" draggable="true">
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
                                  <!-- Project indicator for workspace context -->
                                  <div v-if="element.project" class="mb-1">
                                      <div class="project__color w-5 h-5 rounded-full inline-block" :aria-label="element.project.title"
                                           :style="[element.project.background?{background: 'url('+element.project.background.image+')'}:{}]"
                                      ></div>
                                      <span class="ml-1 text-xs text-gray-500">{{ element.project.title }}</span>
                                  </div>
                                  <div class="task__labels" v-if="element.task_labels && element.task_labels.length">
                                      <button @click="visibleLabel($event)" class="color" v-for="(la, l_index) in element.task_labels" :style="{backgroundColor: la.label.color}" :aria-label="la.label.name">{{ la.label.name }}</button>
                                  </div>
                                  <div class="t__title__area">
                                      <div v-if="element.is_done" class="checklist-box" @click="cardSwitchClick($event)">
                                          <input type="checkbox" :checked="!!element.is_done" @change="cardSwitchToggle(element, $event)" />
                                          <icon name="checklist_box" />
                                      </div>
                                      <h4 class="t__title">{{ element.title }}</h4>
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
                          <select v-model="new_list.project_id" class="block text-sm font-medium w-full px-2 py-2 mb-2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                              <option value="">{{ $t('Select Project') }}</option>
                              <option v-for="project in workspaceProjects" :key="project.id" :value="project.id">{{ project.title }}</option>
                          </select>
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
      <task-details v-if="taskDetailsOpen" :id="taskDetailsId" view="board" :isPopup="td_pop" @closeModal="closeDetails()"  />
  </div>
</template>

<script>
import {Head, Link} from '@inertiajs/vue3'
import Layout from '@/Shared/Layout.vue'
import Icon from '@/Shared/Icon.vue'
import TaskDetails from '@/Shared/Modals/TaskDetails.vue'
import draggable from 'vuedraggable'
import moment from 'moment'
import BoardFilter from "@/Shared/BoardFilter.vue";
import throttle from "lodash/throttle";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import axios from 'axios'


export default {
  metaInfo: { title: 'Dashboard' },
    components: { BoardFilter, Head, Icon, Link, draggable, TaskDetails },
  layout: Layout,
    props: {
        auth: Object,
        title: String,
        tasks: Object,
        workspace: Object,
        list_index: Object,
        filters: Object,
        board_lists: {
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
            firstResponse: [],
            lastResponse: [],
            new_task: {},
            new_list: { project_id: null },
            taskDetailsOpen: false,
            activeTimerString: '',
            months: [],
            counter: { seconds: 0, timer: this.timer },
            drag: false,
            new_task_open: false,
            taskDetailsId: '',
            open_filter: false,
            workspaceProjects: [],
            currentView: 'board',
            viewOptions: [
                {name: 'Board', slug: 'board'},
                {name: 'Calendar', slug: 'calendar'},
                {name: 'Timeline', slug: 'timeline'},
                {name: 'List', slug: 'table'},
            ],
            viewIcons: ['board', 'calendar', 'timeline', 'table'],
            form: {
                user: this.$page.props.auth?.user?.id || null, // Always filter by current user
                due: this.filters?.due || null,
                label: this.filters?.label || null,
                task: this.filters?.task ?? null,
            },
        }
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function() {
                // Always include user filter for My Tasks
                const filters = { ...pickBy(this.form), user: this.$page.props.auth.user.id };
                this.$inertia.get(this.route('workspace.view.my-tasks.board', this.workspace.slug || this.workspace.id), filters, { preserveState: true })
            }, 150),
        },
    },
    created() {
        this.moment = moment
        // Set current view based on route
        const url = this.$page.url || '';
        if (url.includes('/my-tasks/board')) this.currentView = 'board';
        else if (url.includes('/my-tasks/calendar')) this.currentView = 'calendar';
        else if (url.includes('/my-tasks/timeline')) this.currentView = 'timeline';
        else if (url.includes('/my-tasks/table') || url.includes('/my-tasks')) this.currentView = 'table';
        
        if(this.task){
            this.taskDetailsId = this.task.slug || this.task.id;
            this.taskDetailsOpen = true;
        }
        if(!!this.filters.task){
            this.taskDetailsPopup(this.filters.task)
        }
        this.loadWorkspaceProjects();
    },
    methods: {
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
            this.new_list.project_id = null;
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
            this.form = {
                user: this.$page.props.auth.user.id, // Always keep user filter
                due: null,
                label: null,
                task: null,
            };
        },
        findFilters(){
            const filters = Object.keys(this.filters || {});
            return filters.some(r=> ['due', 'label'].includes(r))
        },
        clearFilter(e){
            e.preventDefault();
            e.stopPropagation();
            this.reset();
            this.$inertia.get(this.route('workspace.view.my-tasks.board', this.workspace.slug || this.workspace.id), { user: this.$page.props.auth.user.id }, { preserveState: true });
        },
        doFilter(form){
            Object.assign(this.form, form);
        },
        loadWorkspaceProjects(){
            axios.get(this.route('json.projects.all', this.workspace.id)).then((response) => {
                if(response.data){
                    this.workspaceProjects = response.data;
                }
            }).catch((error) => {
                console.log(error)
            })
        },
        submitNewList(e){
            e.preventDefault();
            if(this.new_list.title && this.new_list.project_id){
                axios.post(this.route('json.list.add'), {project_id: this.new_list.project_id, order: this.lists.length, title: this.new_list.title}).then((response) => {
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
            const listItem = this.lists[index];
            // If this is a combined list (multiple lists with same title), archive all
            if(listItem && listItem.list_ids && listItem.list_ids.length > 1){
                Promise.all(listItem.list_ids.map(listId => 
                    axios.post(this.route('json.list.archive', listId))
                )).then(() => {
                    this.lists.splice(index, 1)
                }).catch((error) => {
                    console.log(error)
                })
            } else {
                // Single list, archive normally
                axios.post(this.route('json.list.archive', id)).then((response) => {
                    if(response.data){
                        this.lists.splice(index, 1)
                    }
                })
            }
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
            // For workspace view, we might have multiple lists with same title
            // Find the list and update it
            const listItem = this.lists.find(l => l.id === id);
            if(listItem && listItem.list_ids && listItem.list_ids.length > 1){
                // If multiple lists share this title, update all of them
                Promise.all(listItem.list_ids.map(listId => 
                    axios.post(this.route('board.update', listId), { title })
                )).then(() => {
                    // Update local list title
                    listItem.title = title;
                }).catch((error) => {
                    console.log(error)
                })
            } else {
                // Single list, update normally
                axios.post(this.route('board.update', id),{ title }).then((response) => {
                    if(response.data){
                        this.sendNotification('send.mail.board_update', id)
                        // Update local list title
                        const listItem = this.lists.find(l => l.id === id);
                        if(listItem) listItem.title = title;
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        },
        afterDrop(e){
            const new_list = this.newSortedItems(e, 'to');
            let previous_list = [];
            if(!!e.pullMode){
                previous_list = this.newSortedItems(e, 'from');
                // For workspace view, use the first list ID from the combined list
                const targetListId = e.to.dataset.id;
                const targetList = this.lists.find(l => l.id == targetListId);
                const actualListId = (targetList && targetList.list_ids && targetList.list_ids.length > 0) 
                    ? targetList.list_ids[0] 
                    : targetListId;
                this.saveTask(e.item.dataset.id, { list_id: actualListId })
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
                    Object.assign(task, newData)  // merge updates
                    return task                   // return updated task
                }
            }
            return null // not found
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
                // Get project_id from the list (use first project if multiple)
                const projectId = listItem.project_id;
                // Use the first list ID if this is a combined list
                const actualListId = (listItem.list_ids && listItem.list_ids.length > 0) 
                    ? listItem.list_ids[0] 
                    : listItem.id;
                let task = { title: this.new_task.title, project_id: projectId, list_id: actualListId, order: listItem.tasks.length+1 };
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
    },
    computed: {
        lists() {
            return this.board_lists || [];
        }
    }
}
</script>

