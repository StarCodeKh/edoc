<template>
    <div class="h-full" :class="{'right_menu_enable': show_right_menu}">
        <Head :title="$t(title)" />
        <div class="flex flex-col flex-grow-1 flex-shrink-1 h-full">
            <board-view-menu :project="project" @filter-toggle="open_filter = !open_filter" @menu-toggle="show_right_menu = !show_right_menu" @fClear="reset()" :filters="filters" view="table" />
            <board-filter :project="project" @board-filter="open_filter = false" :filters="filters" v-if="open_filter" @do-filter="doFilter" options="user,due,label"  />
            <div class="flex flex-col task__table overflow-y-auto h-full">
                <div class="inline-block min-w-full h-full py-4 align-middle md:px-3 lg:px-4">
                    <div class="table__view">
                        <div class="flex flex-nowrap gap-2 md:gap-2 mb-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-1 px-1">
                            <button
                                v-for="(listItem, idx) in lists"
                                :key="'status_'+listItem.id"
                                type="button"
                                @click="selectStatus(listItem.id)"
                                class="doc-status-btn shrink-0 snap-start whitespace-nowrap px-4 py-2 text-xs md:px-6 md:py-2.5 md:text-sm rounded-lg border font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                                :class="{ 'doc-status-btn--active': !selectedStatus || selectedStatus === listItem.id }"
                                :style="statusButtonStyle(listItem.id, idx)"
                            >
                                {{ listItem.title }}
                                <span
                                    class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 ml-1.5 rounded-full text-[11px] font-bold bg-white/85 align-middle"
                                    :style="{ color: statusColor(idx) }"
                                >{{ (listItem.tasks || []).length }}</span>
                            </button>
                        </div>

                        <div class="doc-table rounded-xl shadow-sm overflow-x-auto">
                            <div class="doc-row doc-row--head hidden md:grid gap-3 px-4 py-3 text-sm font-semibold text-white">
                                <div></div>
                                <div>{{ $t('ល.រ.') }}</div>
                                <div>{{ $t('លេខកូដឯកសារ') }}</div>
                                <div>{{ $t('កម្មវត្ថុ') }}</div>
                                <div>{{ $t('កាលបរិច្ឆេទចូល') }}</div>
                                <div>{{ $t('ថ្ងៃឯកសារចូល') }}</div>
                                <div>{{ $t('ស្ថានភាព') }}</div>
                                <div>{{ $t('បាកូដ') }}</div>
                                <div>{{ $t('បោះពុម្ព') }}</div>
                            </div>
                            <draggable v-model="pageRows" tag="div" class="doc-rows flex flex-col gap-2 p-2" handle=".doc-drag-handle" item-key="id" @end="afterDrop">
                                <template #item="{ element, index }">
                                    <div class="doc-row md:grid gap-1.5 md:gap-2 md:items-center px-4 py-3 md:py-3.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:shadow-md transition-all duration-200 ease-out md:hover:-translate-y-0.5">
                                        <div class="doc-drag-handle hidden md:flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                            <icon class="w-5 h-5" name="drag" />
                                        </div>
                                        <div class="text-sm font-medium" :data-label="$t('ល.រ.')">
                                            #{{ (currentPage - 1) * pageSize + index + 1 }}
                                        </div>
                                        <div class="text-sm font-medium" :data-label="$t('លេខកូដឯកសារ')">
                                            <span class="cursor-pointer hover:text-blue-600 hover:underline underline-offset-2 transition-colors" @click="taskDetailsPopup(element.slug || element.id)">{{ documentCode(element) }}</span>
                                            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span v-if="element.description" class="inline-flex items-center text-gray-500 dark:text-gray-400" :aria-label="$t('This task has a description.')">
                                                    <icon class="w-3.5 h-3.5" name="details" />
                                                </span>
                                                <span v-if="element.comments_count" class="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5" :aria-label="$t('Comments')">
                                                    <icon class="w-3.5 h-3.5" name="comment" />{{ element.comments_count }}
                                                </span>
                                                <span v-if="element.attachments_count" class="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5" :aria-label="$t('Attachments')">
                                                    <icon class="w-3.5 h-3.5" name="attachment" />{{ element.attachments_count }}
                                                </span>
                                                <span v-if="element.checklists_count" class="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5" :class="element.checklist_done_count === element.checklists_count ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'" :aria-label="$t('Checklist items')">
                                                    <icon class="w-3.5 h-3.5" name="checklist" />{{ element.checklist_done_count + '/' + element.checklists_count }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="text-sm" :data-label="$t('កម្មវត្ថុ')">
                                            <span class="cursor-pointer hover:text-blue-600 hover:underline underline-offset-2 transition-colors" @click="taskDetailsPopup(element.slug || element.id)">{{ element.title }}</span>
                                        </div>
                                        <div class="text-sm" :data-label="$t('កាលបរិច្ឆេទចូល')">
                                            {{ element.created_at ? moment(element.created_at).format('DD MMM YYYY') : '' }}
                                        </div>
                                        <div class="text-sm" :data-label="$t('ថ្ងៃឯកសារចូល')">
                                            {{ element.entry_date ? moment(element.entry_date).format('DD MMM YYYY') : '' }}
                                        </div>
                                        <div :data-label="$t('ស្ថានភាព')">
                                            <span class="inline-block px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm" :style="{ backgroundColor: statusColorFor(element) }">
                                                {{ element.list ? element.list.title : '' }}
                                            </span>
                                        </div>
                                        <div :data-label="$t('បាកូដ')">
                                            <div class="doc-barcode bg-white rounded px-2 py-1.5 shadow-inner w-full max-w-[180px]">
                                                <svg :ref="setBarcodeRef(element.id)" :data-barcode-value="documentCode(element)"></svg>
                                            </div>
                                        </div>
                                        <div :data-label="$t('បោះពុម្ព')">
                                            <button
                                                type="button"
                                                @click.stop="openReceiptModal(element, $event)"
                                                class="doc-print-btn"
                                                :title="$t('បោះពុម្ពឯកសារតាមដាន')"
                                                :aria-label="$t('បោះពុម្ពឯកសារតាមដាន')"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M7 8.5V3.5h10v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="8.5" width="16" height="7.5" rx="1.4" stroke="currentColor" stroke-width="1.6"/><rect x="7" y="13.5" width="10" height="7" rx="0.6" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="11" r="0.9" fill="currentColor"/></svg>
                                                <span class="hidden md:inline">{{ $t('បោះពុម្ព') }}</span>
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </draggable>

                            <div v-if="!taskRows.length" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                {{ $t('No documents found!') }}
                            </div>
                        </div>

                        <div v-if="totalPages > 1" class="doc-pagination flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {{ $t('Showing') }} {{ paginationStart }}–{{ paginationEnd }} {{ $t('of') }} {{ taskRows.length }}
                            </div>
                            <div class="flex items-center gap-1">
                                <button type="button" class="doc-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" :aria-label="$t('Previous page')">
                                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                                <template v-for="(p, i) in paginationPages" :key="'pg_'+i">
                                    <span v-if="p === '...'" class="doc-page-ellipsis">…</span>
                                    <button v-else type="button" class="doc-page-btn" :class="{ 'doc-page-btn--active': p === currentPage }" @click="goToPage(p)">{{ p }}</button>
                                </template>
                                <button type="button" class="doc-page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" :aria-label="$t('Next page')">
                                    <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- List Popup Board -->
                        <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" :style="{top: selected.top, left: selected.left}" v-if="showListBox">
                            <h4 class="text-center mb-3 font-bold">Change List</h4>
                            <div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" @click="showListBox = false" >
                                <icon class=" w-4 h-4" name="close" />
                            </div>
                            <input v-model="list_search" class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search lists" />
                            <ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto">
                                <li v-for="(listObject, li_index) in searchList(list_search)">

                                    <label class="flex p-2 cursor-pointer hover:bg-gray-200 rounded">
                                        <input name="task_list" class="w-5 ml-1 mr-2" type="radio" :checked="isCurrentLabel(listObject.id)" @change="saveTask(selected.task_id, {list_id: listObject.id})">
                                        <span data-a="" class="p-1" type="button" :tabindex="li_index">{{ listObject.title }}</span>
                                    </label>
                                </li>
                            </ul>
                        </div>
                        <!-- List Popup Board -->
                        <!-- List Popup Assignee -->
                        <div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" :style="{top: selected.top, left: selected.left}" v-if="showAssigneeBox">
                            <h4 class="text-center mb-3 font-bold">Assignee</h4>
                            <div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" @click="showAssigneeBox = false" >
                                <icon class=" w-4 h-4" name="close" />
                            </div>
                            <input id="p_t_s_u" v-model="user_search" class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search users" />
                            <ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto">
                                <li v-for="(userObject, user_index) in searchUser(user_search)">
                                    <label :for="'t_u_id_'+user_index" class="flex p-2 cursor-pointer hover:bg-gray-200 rounded">
                                        <input :id="'t_u_id_'+user_index" class="w-5 ml-1 mr-2" type="checkbox" :checked="task_assignees().includes(userObject.user_id)" @change="assignUserToTask($event.target.checked, userObject.user_id)">
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

        <task-details v-if="taskDetailsOpen" :id="taskDetailsId" view="table" :isPopup="td_pop" @closeModal="closeDetails()"  />
        <right-menu v-if="show_right_menu" :project="project" @menu-toggle="show_right_menu = !show_right_menu" @openTask="(id)=>taskDetailsPopup(id)" />

        <!-- Same printable tracking document used on the board view. -->
        <DocumentReceipt
            v-if="receiptModalOpen"
            :task="selectedReceiptTask"
            @close="closeReceiptModal"
        />

    </div>
</template>

<script>
    import {Head, Link} from '@inertiajs/vue3'
    import Layout from '@/Shared/Layout.vue'
    import throttle from "lodash/throttle";
    import pickBy from "lodash/pickBy";
    import Icon from '@/Shared/Icon.vue'
    import TaskDetails from '@/Shared/Modals/TaskDetails.vue'
    import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
    import DatePicker from '@/Shared/Components/DatePicker.vue'
    import moment from 'moment'
    import mapValues from "lodash/mapValues";
    import BoardFilter from "@/Shared/BoardFilter.vue";
    import RightMenu from "@/Shared/RightMenu.vue";
    import axios from 'axios'
    import draggable from 'vuedraggable'
    import JsBarcode from 'jsbarcode';
    import DocumentReceipt from '@/Shared/Modals/DocumentReceipt.vue'

    export default {
    metaInfo: { title: 'Dashboard' },
        components: {RightMenu, BoardFilter, Head, Icon, Link, TaskDetails, DatePicker, BoardViewMenu, draggable, DocumentReceipt},
    layout: Layout,
        props: {
            auth: Object,
            title: String,
            tasks: Object,
            filters: Object,
            project: Object,
            list_index: Object,
            board_lists: Object,
            lists: {
                required: false,
            },
        },
        remember: 'form',
        data() {
            return {
                errors: [],
                loading: false,
                td_pop: false,
                show_right_menu: false,
                open_filter: false,
                showLabelBox: false,
                label_search: '',
                user_search: '',
                list_search: '',
                selected: {task_id: null, task_index: null, list_index: null, top: 0, left: 0},
                showAssigneeBox: false,
                showListBox: false,
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
                list_items: null,
                team_members: null,
                selectedStatus: null,
                barcodeRefs: {},
                taskRows: [],
                currentPage: 1,
                pageSize: 10,
                pageRows: [],

                receiptModalOpen: false,
                selectedReceiptTask: null,

                statusPalette: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'],
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
                    this.$inertia.get(this.route('projects.view.table', this.project.slug || this.project.id), pickBy(this.form), { preserveState: true })
                }, 150),
            },

            lists: {
                deep: true,
                handler() { this.syncTaskRows(); },
            },
        },
        computed: {
            isModalVisible() {
                return this.taskDetailsOpen;
            },

            isAdmin() {
                return this?.project?.member?.role === 'admin';
            },

            allTasks() {
                if (!this.lists) return [];
                const flattened = this.lists.flatMap(listItem =>
                    (listItem.tasks || []).map(task => {
                        if (!task.list) task.list = { id: listItem.id, title: listItem.title };
                        if (!task.list_id) task.list_id = listItem.id;
                        return task;
                    })
                );
                return this.isAdmin ? flattened : flattened.filter(t => this.isAssignedToMe(t));
            },

            totalPages() {
                return Math.max(1, Math.ceil(this.taskRows.length / this.pageSize));
            },

            paginationStart() {
                return this.taskRows.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
            },

            paginationEnd() {
                return Math.min(this.currentPage * this.pageSize, this.taskRows.length);
            },

            paginationPages() {
                const total = this.totalPages;
                const current = this.currentPage;
                const delta = 2;
                const range = [];
                for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
                    range.push(i);
                }
                const pages = [1];
                if (range[0] > 2) pages.push('...');
                pages.push(...range);
                if (range.length && range[range.length - 1] < total - 1) pages.push('...');
                if (total > 1) pages.push(total);
                return pages;
            },
        },
        created() {
            this.moment = moment
            let currentUrl = this.$page.url.substr(1)
            const currentUrlArray = currentUrl.split('/');
            this.checkTaskUri();
            this.getOtherData();
            this.syncTaskRows();
        },
        mounted() {
            this.$nextTick(() => this.renderBarcodes());
        },
        updated() {
            this.$nextTick(() => this.renderBarcodes());
        },
        methods: {
            openReceiptModal(task, e){
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.selectedReceiptTask = task;
                this.receiptModalOpen = true;
            },
            closeReceiptModal(){
                this.receiptModalOpen = false;
                this.selectedReceiptTask = null;
            },
            taskDetailsPopup(id){
                this.form.task = id;
                this.td_pop = true;
                this.taskDetailsId = id;
                this.taskDetailsOpen = true;
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

            selectStatus(listId){
                this.selectedStatus = this.selectedStatus === listId ? null : listId;
                this.currentPage = 1;
                this.syncTaskRows();
            },

            syncTaskRows(){
                const sorted = [...this.allTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
                if (!this.selectedStatus) {
                    this.taskRows = sorted;
                } else {
                    const activeList = (this.lists || []).find(l => l.id === this.selectedStatus);
                    const groupTasks = activeList ? (activeList.tasks || []) : [];
                    this.taskRows = [...groupTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
                }
                this.syncPageRows();
            },

            syncPageRows(){
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                const start = (this.currentPage - 1) * this.pageSize;
                this.pageRows = this.taskRows.slice(start, start + this.pageSize);
            },

            goToPage(page){
                if (page === '...' || page < 1 || page > this.totalPages || page === this.currentPage) return;
                this.currentPage = page;
                this.syncPageRows();
            },

            afterDrop(){
                const start = (this.currentPage - 1) * this.pageSize;
                const payload = this.pageRows.map((task, idx) => {
                    task.order = start + idx + 1;
                    return { id: task.id, order: task.order };
                });
                this.taskRows.splice(start, this.pageRows.length, ...this.pageRows);
                this.saveOrder(payload);
            },

            statusColor(idx){
                return this.statusPalette[((idx % this.statusPalette.length) + this.statusPalette.length) % this.statusPalette.length];
            },

            statusColorFor(element){
                if (!this.lists) return this.statusPalette[0];
                let idx = this.lists.findIndex(l => l.id === element.list_id);
                if (idx === -1) {
                    idx = this.lists.findIndex(l => (l.tasks || []).some(t => t.id === element.id));
                }
                return this.statusColor(idx === -1 ? 0 : idx);
            },

            hexToRgba(hex, alpha){
                const clean = (hex || '').replace('#', '');
                const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
                const num = parseInt(full, 16) || 0;
                const r = (num >> 16) & 255;
                const g = (num >> 8) & 255;
                const b = num & 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            },

            statusButtonStyle(listId, idx){
                const color = this.statusColor(idx);
                const isActive = !this.selectedStatus || this.selectedStatus === listId;
                if (isActive) {
                    return {
                        backgroundColor: color,
                        borderColor: color,
                        color: '#ffffff',
                        boxShadow: `0 4px 14px -4px ${this.hexToRgba(color, 0.55)}`,
                    };
                }
                return {
                    backgroundColor: this.hexToRgba(color, 0.12),
                    borderColor: this.hexToRgba(color, 0.25),
                    color: color,
                    boxShadow: 'none',
                };
            },

            documentCode(element){
                if (element.task_code) return element.task_code;
                return 'CGMC-' + String(element.id).padStart(9, '0');
            },

            isAssignedToMe(task){
                const userId = this.$page?.props?.auth?.user?.id;
                if (!userId) return false;
                return (task.assignees || []).some(a => Number(a.user_id) === Number(userId));
            },

            setBarcodeRef(id){
                return (el) => { if (el) this.barcodeRefs[id] = el; };
            },

            renderBarcodes(){
                Object.entries(this.barcodeRefs).forEach(([id, el]) => {
                    if (!el || !el.isConnected) {
                        delete this.barcodeRefs[id];
                        return;
                    }
                    const value = el.dataset.barcodeValue;
                    if (!value) return;
                    try {
                        JsBarcode(el, value, {
                            format: 'CODE128',
                            width: 1,
                            height: 32,
                            fontSize: 10,
                            margin: 0,
                            displayValue: false,
                        });
                    } catch (err) {
                        console.error('Failed to render barcode for', value, err);
                    }
                });
            },

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
            },
            searchLabel(input){
                return this.labels.filter(lab => lab.name.toLowerCase().indexOf(input) > -1);
            },
            searchUser(input){
                return this.team_members.filter(tm => tm.user.name.toLowerCase().indexOf(input) > -1);
            },
            searchList(input){
                return this.list_items.filter(list => list.title.toLowerCase().indexOf(input) > -1);
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
            updateTaskEntry(taskId, newData) {
                for (const list of this.lists) {
                    const task = list.tasks.find(t => t.id === taskId)
                    if (task) {
                        Object.assign(task, newData)  // merge updates
                        return task                   // return updated task
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
                    this.new_task.title = '';
                }
                listItem.new_task_open = false
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
            taskDetails(id){
                if(id){
                    window.location.href = this.route('projects.table.with.task', {projectUid: this.project.id, taskUid: id});
                }
            },
            goToLink(link){
                window.location.href = link;
            },
            log: function(evt) {
                window.console.log(evt);
            },
            async getOtherData(){
                const dataResponse = await axios.get(this.route('project.other.data', {project_id: this.project.id}));
                const res = dataResponse.data;
                this.labels = res.labels || [];
                this.list_items = res.lists || [];
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
        },
    }
</script>

<style scoped>
    @media (min-width: 768px) {
        .doc-row {
            grid-template-columns: 40px 60px minmax(150px, 1fr) minmax(220px, 1.6fr) 120px 120px 130px 190px 110px;
            min-width: 1080px;
        }
    }

    @media (max-width: 767px) {
        .doc-row > [data-label] {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            padding: 0.3rem 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .doc-row > [data-label]:last-child {
            border-bottom: none;
        }
        .doc-row > [data-label]::before {
            content: attr(data-label);
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            color: #64748b;
            flex-shrink: 0;
        }
    }

    .doc-row--head {
        background: linear-gradient(135deg, #2b6f80, #235a68);
        border-radius: 0.75rem 0.75rem 0 0;
    }

    .doc-table {
        background: transparent;
    }

    .doc-rows > .doc-row {
        animation: doc-row-in 0.25s ease-out backwards;
    }
    .doc-rows > .doc-row:nth-child(1) { animation-delay: 0.02s; }
    .doc-rows > .doc-row:nth-child(2) { animation-delay: 0.05s; }
    .doc-rows > .doc-row:nth-child(3) { animation-delay: 0.08s; }
    .doc-rows > .doc-row:nth-child(4) { animation-delay: 0.11s; }
    .doc-rows > .doc-row:nth-child(5) { animation-delay: 0.14s; }
    .doc-rows > .doc-row:nth-child(n+6) { animation-delay: 0.16s; }

    @keyframes doc-row-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .doc-status-btn--active {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6) inset;
    }

    .doc-barcode svg {
        width: 100%;
        height: 32px;
        display: block;
    }

    .doc-print-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 8px;
        background: #eef2ff;
        border: 1px solid #e0e7ff;
        color: #4f46e5;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    .doc-print-btn:hover {
        background: #e0e7ff;
        border-color: #c7d2fe;
        transform: translateY(-1px);
    }
    .doc-print-btn:active {
        transform: translateY(0);
    }
    .dark .doc-print-btn {
        background: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.25);
        color: #a5b4fc;
    }
    .dark .doc-print-btn:hover {
        background: rgba(99, 102, 241, 0.2);
    }

    /* Pagination controls */
    .doc-page-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 8px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: #475569;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .doc-page-btn:hover:not(:disabled) {
        background: #eef2ff;
        color: #4338ca;
    }
    .doc-page-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
    .doc-page-btn--active {
        background: #4f46e5;
        border-color: #4f46e5;
        color: #ffffff;
    }
    .doc-page-btn--active:hover {
        background: #4f46e5;
        color: #ffffff;
    }
    .doc-page-ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 32px;
        color: #94a3b8;
        font-size: 0.8rem;
    }
    .dark .doc-page-btn {
        color: #cbd5e1;
    }
    .dark .doc-page-btn:hover:not(:disabled) {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
    }
    .dark .doc-page-ellipsis {
        color: #64748b;
    }

    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

</style>