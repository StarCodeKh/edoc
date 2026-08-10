<template>
  <div class="h-full ">
      <Head :title="$t(title)" />
      <div v-if="workspace" class="project__view__menu w-full p-2 text-sm flex justify-first items-center">
          <div class="inline-flex w-full flex-wrap items-center">
              <div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap">
                  <h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">{{ workspace.name }}</h2>
                  <Link v-for="(option, option_index) in viewOptions" :key="option.slug" class="flex py-2 px-3 items-center cursor-pointer capitalize rounded" :class="{ 'active': currentView === option.slug }" :href="route('workspace.view.my-tasks.'+option.slug, workspace.slug || workspace.id)">
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
      <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
          <div class="flex flex-col task__table overflow-y-auto h-full">
              <div class="inline-block min-w-full h-full py-4 align-middle md:px-3 lg:px-4">
                  <div class="table__view">
                      <table>
                          <thead>
                          <tr>
                              <th scope="col" class="w-[20px]">
                              </th>
                              <th scope="col" class="">
                                  <button class="flex items-center gap-x-3 focus:outline-none">
                                      <span>{{ $t('Task') }}</span>
                                  </button>
                              </th>

                              <th scope="col" class=" w-[17%]">
                                  {{ $t('List') }}
                              </th>

                              <th scope="col" class=" w-[17%]">
                                  {{ $t('Labels') }}
                              </th>

                              <th scope="col" class=" w-[17%]">
                                  {{ $t('Users') }}
                              </th>

                              <th scope="col" class="w-[17%]">
                                  {{ $t('Due Date') }}
                              </th>

                              <th scope="col" class="relative w-[50px]">
                                  <span class="sr-only">Edit</span>
                              </th>
                          </tr>
                          </thead>
                          <draggable v-for="(listItem, listIndex) in lists" :key="listItem.id" :data-index="listIndex" :data-id="listItem.id" tag="tbody" handle=".handle" class="t__drag" :list="listItem.tasks" group="task" item-key="id">
                              <template #item="{ element, index }">
                                  <tr class="list-group-item group" :data-id="element.id">
                                      <td class="pl-2 pr-1 py-2 border-none text-sm font-medium whitespace-nowrap w-[20px]">
                                          <div class="project__color w-5 h-5 rounded-full" :aria-label="element.project.title"
                                               :style="[element.project.background?{background: 'url('+element.project.background.image+')'}:{}]"
                                          ></div>
                                      </td>
                                      <td class="px-2 py-2 text-sm font-medium whitespace-nowrap w-[calc(32%-70px)] hover:bg-gray-100">
                                          <Link class="cursor-pointer" :href="this.route('projects.view.board',{uid: element.project.slug || element.project.id, task: element.slug || element.id})" :data-id="element.id" :title="element.project.title">
                                              <icon v-if="element.timer" name="blink" class="w-2 h-2" />
                                              <h2 class="font-medium t__title text-pretty">{{ element.title }}</h2>
                                          </Link>
                                      </td>
                                      <td class="px-2 hide_arrow py-2 text-sm font-medium whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100">
                                          <div class="inline t__title text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800">
                                              {{ element.list.title }}
                                          </div>
                                      </td>
                                      <td class="px-1 py-1 hide_arrow t_label text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100" @click="addAction($event, element.id, index, listIndex, 'showLabelBox')">
                                          <div class="task__labels overflow-hidden" v-if="element.task_labels.length">
                                              <button class="color" v-for="(la, l_index) in element.task_labels" :style="{backgroundColor: la.label.color}">{{ la.label.name }}</button>
                                              <div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center">
                                                  <icon class="w-4 h-4" name="arrow-down" />
                                              </div>
                                          </div>
                                          <div v-else>
                                              <div class="absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center">
                                                  <icon class="w-4 h-4" name="plus" />
                                              </div>
                                          </div>
                                      </td>
                                      <td class="px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100" @click="addAction($event, element.id, index, listIndex, 'showAssigneeBox')">
                                          <div class="flex items-center" v-if="element.assignees.length">
                                              <div v-for="assignee in element.assignees" :aria-label="assignee.user.name" class="block rounded-full h-6 w-6">
                                                  <img class="h-full w-full border border-white rounded-full" :src="assignee.user.photo_path" :alt="assignee.user.name">
                                              </div>
                                              <div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center">
                                                  <icon class="w-4 h-4" name="arrow-down" />
                                              </div>
                                          </div>
                                          <div v-else>
                                              <div class="absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center">
                                                  <icon class="w-4 h-4" name="plus" />
                                              </div>
                                          </div>
                                      </td>

                                      <td class="px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100">
                                          <div class="t__title" v-if="element.due_date">
                                              <DatePicker v-model="element.due_date" @change="saveTask(element.id, {due_date: element.due_date}, listIndex)">
                                                  <template #trigger>
                                                      <div class="flex t__title items-center">
                                                          <icon class="w-4 w-4" name="time" />
                                                          <span class="ml-1 font-light leading-none" aria-label="Due date"> {{ moment(element.due_date).format('MMM D') }} </span>
                                                      </div>
                                                  </template>
                                              </DatePicker>
                                              <div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center">
                                                  <icon class="w-4 h-4" name="arrow-down" />
                                              </div>
                                          </div>
                                          <div v-else class="w-full h-full">
                                              <DatePicker v-model="element.due_date" @change="saveTask(element.id, {due_date: element.due_date}, listIndex)">
                                                  <template #trigger>
                                                      <div class="show_arrow_hover top-0 left-0 w-full h-full flex justify-start items-center">
                                                          <icon class="w-4 h-4" name="plus" />
                                                      </div>
                                                  </template>
                                              </DatePicker>
                                          </div>
                                      </td>

                                      <td class="px-2 py-2 text-sm whitespace-nowrap w-[50px] relative">
                                          <button aria-label="Archive" data-a="" @click="makeArchive($event, element.id, listItem.tasks, index)" class="flex w-full items-center text-xs font-medium focus:outline-none focus:ring-0">
                                              <icon class="mr-2 h-4 w-4 " name="archive" />
                                          </button>
                                      </td>
                                  </tr>
                              </template>
                          </draggable>
                          <tbody v-if="!tasks.length">
                          <tr>
                              <td class="border-t px-6 py-4 text-center" colspan="7">{{ $t('To tasks found!') }}</td>
                          </tr>
                          </tbody>
                      </table>
                      <!-- List Popup Board -->
                      <!-- List Popup Assignee -->
                      <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" :style="{top: selected.top, left: selected.left}" v-if="showAssigneeBox">
                          <h4 class="text-center mb-3 font-bold">Assignee</h4>
                          <div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" @click="showAssigneeBox = false" >
                              <icon class=" w-4 h-4" name="close" />
                          </div>
                          <input id="w_t_s_u" v-model="user_search" class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search users" />
                          <ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto">
                              <li v-for="(userObject, user_index) in searchUser(user_search)">
                                  <label :for="'w_u_id_'+user_index" class="flex p-2 cursor-pointer hover:bg-gray-200 rounded">
                                      <input :id="'w_u_id_'+user_index" class="w-5 ml-1 mr-2" type="checkbox" :checked="task_assignees().includes(userObject.user_id)" @change="assignUserToTask($event.target.checked, userObject.user_id)">
                                      <img v-if="userObject.user.photo_path" :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" :src="userObject.user.photo_path" />
                                      <img v-else :aria-label="userObject.user.name" :alt="userObject.user.name" class="w-6 h-6 rounded-full" src="/images/user.svg" />
                                      <span data-a="" class="p-1" type="button" :tabindex="user_index">
                                                                {{ userObject.user.name }}
                                                            </span>
                                  </label>
                              </li>
                          </ul>
                      </div>
                      <!-- List Popup Assignee -->
                      <!-- Label Search -->
                      <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" :style="{top: selected.top, left: selected.left}" v-if="showLabelBox">
                          <h4 class="text-center mb-3 font-bold">Labels</h4>
                          <div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" @click="showLabelBox = false" >
                              <icon class=" w-4 h-4" name="close" />
                          </div>
                          <input v-model="label_search" class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" :placeholder="$t('Search labels')" />
                          <ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto">
                              <li v-for="(lab, lab_index) in searchLabel(label_search)">
                                  <label class="flex gap-1">
                                      <input class="w-5 mr-2 cursor-pointer" type="checkbox" :checked="task_label_ids().includes(lab.id)" @change="addLabelToTask($event.target.checked, lab.id)">
                                      <span class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80" :style="{background: lab.color}" :tabindex="lab_index" data-color="orange">{{ lab.name }}</span>
                                      <button class="p-3 hover:bg-gray-200 rounded" type="button" :tabindex="lab_index" @click="label = lab; showLabelBox = false; showEditLabelBox = true;">
                                          <icon class="w-3 h-3" name="edit" />
                                      </button>
                                  </label>
                              </li>
                          </ul>
                          <button class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 hover:opacity-80" @click="showLabelBox = false; showEditLabelBox = true; label = {}"> Create a new label </button>
                      </div>
                      <!-- Label Search -->
                  </div>
              </div>
          </div>

      </div>

  </div>
</template>

<script>
import {Head, Link} from '@inertiajs/vue3'
import Layout from '@/Shared/Layout.vue'
import Icon from '@/Shared/Icon.vue'
import BoardFilter from "@/Shared/BoardFilter.vue";
import mapValues from "lodash/mapValues";
import DatePicker from '@/Shared/Components/DatePicker.vue'
import draggable from 'vuedraggable'
import moment from 'moment'
import throttle from "lodash/throttle";
import pickBy from "lodash/pickBy";
import axios from 'axios'


export default {
  metaInfo: { title: 'Dashboard' },
    components: { Head, Icon, Link, draggable, DatePicker, BoardFilter },
  layout: Layout,
    props: {
        auth: Object,
        title: String,
        tasks: Object,
        filters: Object,
        workspace: Object,
        list_index: Object,
        board_lists: Object,
    },
    remember: 'form',
    data() {
        return {
            errors: [],
            loading: false,
            showLabelBox: false,
            label_search: '',
            user_search: '',
            list_search: '',
            selected: {task_id: null, task_index: null, list_index: null, top: 0, left: 0},
            showAssigneeBox: false,
            firstResponse: [],
            lastResponse: [],
            new_task: {},
            taskDetailsOpen: false,
            activeTimerString: '',
            months: [],
            counter: { seconds: 0, timer: this.timer },
            drag: false,
            new_task_open: false,
            taskDetailsId: '',
            labels: null,
            team_members: null,
            open_filter: false,
            currentView: 'table',
            viewOptions: [
                {name: 'Board', slug: 'board'},
                {name: 'Calendar', slug: 'calendar'},
                {name: 'Timeline', slug: 'timeline'},
                {name: 'List', slug: 'table'},
            ],
            viewIcons: ['board', 'calendar', 'timeline', 'table'],
            formInitialized: false, // Flag to prevent watcher from triggering on initial load
            form: {
                // Don't include user in form - it's handled by the backend
                due: this.filters?.due || null,
                label: this.filters?.label || null,
                task: this.filters?.task ?? null,
            },
        }
    },
    watch: {
        form: {
            deep: true,
            immediate: false,
            handler: throttle(function(newVal, oldVal) {
                // Skip if form hasn't been initialized yet (prevents initial load trigger)
                if (!this.formInitialized) {
                    return;
                }
                // Skip if values haven't actually changed
                if (oldVal && oldVal.due === newVal.due && oldVal.label === newVal.label && oldVal.task === newVal.task) {
                    return;
                }
                // Only navigate if filters actually changed (excluding user which is handled by backend)
                const filters = pickBy(this.form);
                this.$inertia.get(this.route('workspace.view.my-tasks.table', this.workspace.slug || this.workspace.id), filters, { preserveState: true })
            }, 150),
        },
    },
    computed: {
        isModalVisible() {
            return this.taskDetailsOpen;
        },
        lists(){
            const items = this.board_lists;
            for (let i = 0; i < this.tasks.length; i++) {
                if (this.tasks[i] && this.tasks[i].list_id){
                    // items[this.list_index[this.tasks[i].list_id]]['tasks'].splice(this.tasks[i].order, 0, this.tasks[i]);
                    items[this.list_index[this.tasks[i].list_id]]['tasks'].push(this.tasks[i]);
                }
            }
            return items;
        }
    },
    created() {
        this.moment = moment
        // Set current view based on route
        const url = this.$page.url || '';
        if (url.includes('/my-tasks/board')) this.currentView = 'board';
        else if (url.includes('/my-tasks/calendar')) this.currentView = 'calendar';
        else if (url.includes('/my-tasks/timeline')) this.currentView = 'timeline';
        else if (url.includes('/my-tasks/table') || url.includes('/my-tasks')) this.currentView = 'table';

        // Initialize form with filters from props (excluding user - handled by backend)
        if (this.filters) {
            this.form = {
                due: this.filters.due || null,
                label: this.filters.label || null,
                task: this.filters.task || null,
            };
        }
        
        // Mark form as initialized after a short delay to prevent watcher from triggering
        this.$nextTick(() => {
            this.formInitialized = true;
        });

        this.checkTaskUri();
        this.getOtherData();
    },
    methods: {
        addLabelToTask(checked, id){
            axios.post(this.route('task.labels.add'), {task_id: this.selected.task_id, label_id: id}).then((response) => {
                if(response.data){
                    if(checked){
                        this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.push(response.data);
                    }else{
                        const findIndex = this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.findIndex(tl=>tl.label_id === id);
                        if(findIndex > -1){
                            this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.splice(findIndex, 1);
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
        },
        assignUserToTask(checked, id){
            axios.post(this.route('task.assignees.add'), {task_id: this.selected.task_id, user_id: id}).then((response) => {
                if(response.data){
                    const task_assignees = this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees;
                    if(checked){
                        task_assignees.push(response.data);
                    }else{
                        const findIndex = task_assignees.findIndex(a => a.user_id === id);
                        if(findIndex > -1){
                            task_assignees.splice(findIndex, 1);
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
        },
        task_label_ids(){
            return this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.map(item => item.label_id);
        },
        task_assignees(){
            return this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees.map(item => item.user_id);
        },
        isCurrentLabel(id){
            return this.lists[this.selected.list_index].tasks[this.selected.task_index].list_id === id;
        },
        addAction(e, task_id, task_index, list_index, visible){
            this.getCurrentPosition(e);
            this.selected.task_id = task_id;
            this.selected.task_index = task_index;
            this.selected.list_index = list_index;
            this[visible] = true;
        },
        getCurrentPosition(e){
            this.selected.left = (e.clientX - 200) + 'px';
            this.selected.top = (e.clientY > 450? 410 : e.clientY - 30) + 'px';
            console.log(this.selected)
        },
        searchLabel(input){
            return this.labels.filter(lab => lab.name.toLowerCase().indexOf(input) > -1);
        },
        searchUser(input){
            return this.team_members.filter(tm => tm.user.name.toLowerCase().indexOf(input) > -1);
        },
        makeArchive(e, id, tasks, index){
            e.preventDefault();
            this.saveTask(id, { is_archive: 1 });
            tasks.splice(index, 1)
        },
        visibleShowMore(e, element){ e.preventDefault();element.show_more = !!element.show_more?false:true },
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
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
        },
        newSortedItems(e, selector){
            const lists = e[selector].getElementsByTagName("tr");
            const newOrder = [];
            for (let i = 0; i < lists.length; i++) {
                newOrder.push({id: lists[i].dataset.id, order: i+1})
            }
            return newOrder;
        },
        saveTask(id, taskObject, listIndex){
            axios.post(this.route('task.update', id), taskObject).then((response) => {
                if(response && response.data && listIndex){
                    const findIndex = this.lists[listIndex].tasks.findIndex(t => t.id === parseInt(id));
                    if (findIndex > -1){
                        this.lists[listIndex].tasks[findIndex] = response.data;
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
        },
        saveOrder(taskObject){
            axios.post(this.route('task.update.order'), taskObject).catch((error) => {
                console.log(error)
            })
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
        clone: function(el) {
            return {
                name: el.name + " cloned"
            };
        },
        log: function(evt) {
            window.console.log(evt);
        },
        async getOtherData(){
            const dataResponse = await axios.get(this.route('workspace.other.data', {workspace_id: this.workspace.id}));
            const res = dataResponse.data;
            this.labels = res.labels || [];
            this.team_members = res.team_members || [];
        },
        checkTaskUri(){
            const url = this.$page.url;
            let splitUrl = url.split('/');
            splitUrl = splitUrl.filter(el=>!!el)
            if(splitUrl[splitUrl.length - 2] === 'task'){
                this.taskDetailsId = splitUrl[splitUrl.length - 1];
                this.taskDetailsOpen = true;
            }
        },
        findFilters(){
            const filters = Object.keys(this.filters || {});
            return filters.some(r=> ['due', 'label'].includes(r))
        },
        clearFilter(e){
            e.preventDefault();
            e.stopPropagation();
            this.reset();
        },
        reset() {
            this.form = {
                due: null,
                label: null,
                task: null,
            };
            // Backend handles user filter, so we don't need to pass it
            this.$inertia.get(this.route('workspace.view.my-tasks.table', this.workspace.slug || this.workspace.id), {}, { preserveState: true });
        },
        doFilter(form){
            // Update local form state (excluding user - handled by backend)
            this.form = {
                due: form.due || null,
                label: form.label || null,
                task: form.task || null,
            };
            // Trigger navigation with the new filters (user is handled by backend)
            const filters = pickBy(this.form);
            this.$inertia.get(this.route('workspace.view.my-tasks.table', this.workspace.slug || this.workspace.id), filters, { preserveState: true });
        },
    },
}
</script>
