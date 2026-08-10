import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import { D as DatePicker } from "./DatePicker-6Ds_7_ns.js";
import moment from "moment";
import mapValues from "lodash/mapValues.js";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import { R as RightMenu } from "./RightMenu-BExBq8ZO.js";
import axios from "axios";
import draggable from "vuedraggable";
import JsBarcode from "jsbarcode";
import { resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
import "./DeleteConfirmation-HVTZH6_Z.js";
const _sfc_main = {
  metaInfo: { title: "Dashboard" },
  components: { RightMenu, BoardFilter, Head, Icon, Link, TaskDetails, DatePicker, BoardViewMenu, draggable },
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
      required: false
    }
  },
  remember: "form",
  data() {
    return {
      errors: [],
      loading: false,
      td_pop: false,
      show_right_menu: false,
      open_filter: false,
      showLabelBox: false,
      label_search: "",
      user_search: "",
      list_search: "",
      selected: { task_id: null, task_index: null, list_index: null, top: 0, left: 0 },
      showAssigneeBox: false,
      showListBox: false,
      firstResponse: [],
      lastResponse: [],
      new_task: {},
      taskDetailsOpen: false,
      activeTimerString: "",
      months: [],
      counter: { seconds: 0, timer: this.timer },
      drag: false,
      new_task_open: false,
      taskDetailsId: "",
      labels: null,
      list_items: null,
      team_members: null,
      selectedStatus: null,
      barcodeRefs: {},
      taskRows: [],
      form: {
        user: this.filters.user,
        due: this.filters.due,
        label: this.filters.label,
        task: this.filters.task ?? null
      }
    };
  },
  watch: {
    form: {
      deep: true,
      handler: throttle(function() {
        this.$inertia.get(this.route("projects.view.table", this.project.slug || this.project.id), pickBy(this.form), { preserveState: true });
      }, 150)
    },
    lists: {
      deep: true,
      handler() {
        this.syncTaskRows();
      }
    }
  },
  computed: {
    isModalVisible() {
      return this.taskDetailsOpen;
    },
    allTasks() {
      if (!this.lists) return [];
      return this.lists.flatMap(
        (listItem) => (listItem.tasks || []).map((task) => {
          if (!task.list) task.list = { id: listItem.id, title: listItem.title };
          if (!task.list_id) task.list_id = listItem.id;
          return task;
        })
      );
    }
  },
  created() {
    this.moment = moment;
    let currentUrl = this.$page.url.substr(1);
    currentUrl.split("/");
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
    taskDetailsPopup(id) {
      this.form.task = id;
      this.td_pop = true;
      this.taskDetailsId = id;
      this.taskDetailsOpen = true;
    },
    closeDetails() {
      this.form.task = null;
      this.taskDetailsOpen = false;
    },
    reset() {
      this.form = mapValues(this.form, () => null);
    },
    doFilter(form) {
      Object.assign(this.form, form);
    },
    selectStatus(listId) {
      this.selectedStatus = this.selectedStatus === listId ? null : listId;
      this.syncTaskRows();
    },
    syncTaskRows() {
      const sorted = [...this.allTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
      this.taskRows = this.selectedStatus ? sorted.filter((t) => t.list_id === this.selectedStatus) : sorted;
    },
    afterDrop() {
      const payload = this.taskRows.map((task, idx) => {
        task.order = idx + 1;
        return { id: task.id, order: task.order };
      });
      this.saveOrder(payload);
    },
    statusColorFor(element) {
      if (!this.lists || !element.list_id) return "#3b82f6";
      const idx = this.lists.findIndex((l) => l.id === element.list_id);
      return idx === 0 ? "#10b981" : "#3b82f6";
    },
    documentCode(element) {
      if (element.task_code) return element.task_code;
      return "CGMC-" + String(element.id).padStart(9, "0");
    },
    setBarcodeRef(id) {
      return (el) => {
        if (el) this.barcodeRefs[id] = el;
      };
    },
    renderBarcodes() {
      Object.entries(this.barcodeRefs).forEach(([id, el]) => {
        if (!el || !el.isConnected) {
          delete this.barcodeRefs[id];
          return;
        }
        const value = el.dataset.barcodeValue;
        if (!value) return;
        try {
          JsBarcode(el, value, {
            format: "CODE128",
            width: 1,
            height: 32,
            fontSize: 10,
            margin: 0,
            displayValue: false
          });
        } catch (err) {
          console.error("Failed to render barcode for", value, err);
        }
      });
    },
    addLabelToTask(checked, id) {
      axios.post(this.route("task.labels.add"), { task_id: this.selected.task_id, label_id: id }).then((response) => {
        if (response.data) {
          if (checked) {
            this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.push(response.data);
          } else {
            const findIndex = this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.findIndex((tl) => tl.label_id === id);
            if (findIndex > -1) {
              this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    assignUserToTask(checked, id) {
      axios.post(this.route("task.assignees.add"), { task_id: this.selected.task_id, user_id: id }).then((response) => {
        if (response.data) {
          const task_assignees = this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees;
          if (checked) {
            task_assignees.push(response.data);
          } else {
            const findIndex = task_assignees.findIndex((a) => a.user_id === id);
            if (findIndex > -1) {
              task_assignees.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    task_label_ids() {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.map((item) => item.label_id);
    },
    task_assignees() {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees.map((item) => item.user_id);
    },
    isCurrentLabel(id) {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].list_id === id;
    },
    addAction(e, task_id, task_index, list_index, visible) {
      this.getCurrentPosition(e);
      this.selected.task_id = task_id;
      this.selected.task_index = task_index;
      this.selected.list_index = list_index;
      this[visible] = true;
    },
    getCurrentPosition(e) {
      this.selected.left = e.clientX - 200 + "px";
      this.selected.top = (e.clientY > 450 ? 410 : e.clientY - 30) + "px";
    },
    searchLabel(input) {
      return this.labels.filter((lab) => lab.name.toLowerCase().indexOf(input) > -1);
    },
    searchUser(input) {
      return this.team_members.filter((tm) => tm.user.name.toLowerCase().indexOf(input) > -1);
    },
    searchList(input) {
      return this.list_items.filter((list) => list.title.toLowerCase().indexOf(input) > -1);
    },
    makeArchive(e, id, tasks, index) {
      e.preventDefault();
      this.saveTask(id, { is_archive: 1 });
      tasks.splice(index, 1);
    },
    visibleShowMore(e, element) {
      e.preventDefault();
      element.show_more = !!element.show_more ? false : true;
    },
    saveListTitle(e, board_id) {
      if (e.keyCode === 13 || e.type === "blur") {
        e.preventDefault();
        e.target.blur();
        if (e.target.innerText) {
          const title = e.target.innerText;
          this.changeBoardTitle(board_id, title);
        }
      }
    },
    changeBoardTitle(id, title) {
      axios.post(this.route("board.update", id), { title }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
    },
    updateTaskEntry(taskId, newData) {
      for (const list of this.lists) {
        const task = list.tasks.find((t) => t.id === taskId);
        if (task) {
          Object.assign(task, newData);
          return task;
        }
      }
      return null;
    },
    saveTask(id, taskObject) {
      axios.post(this.route("task.update", id), taskObject).then((response) => {
        this.updateTaskEntry(id, taskObject);
      }).catch((error) => {
        console.log(error);
      });
    },
    saveOrder(taskObject) {
      axios.post(this.route("task.update.order"), taskObject).catch((error) => {
        console.log(error);
      });
    },
    submitNewTask(listItem, listIndex) {
      if (this.new_task.title) {
        let task = { title: this.new_task.title, project_id: this.project.id, list_id: listItem.id, order: listItem.tasks.length + 1 };
        this.saveNewTask(task, listIndex);
        this.new_task.title = "";
      }
      listItem.new_task_open = false;
    },
    saveNewTask(taskObject, listIndex) {
      const tasks = this.lists[listIndex].tasks;
      axios.post(this.route("task.new"), taskObject).then((response) => {
        if (response && response.data) {
          tasks.push(response.data);
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    taskDetails(id) {
      if (id) {
        window.location.href = this.route("projects.table.with.task", { projectUid: this.project.id, taskUid: id });
      }
    },
    goToLink(link) {
      window.location.href = link;
    },
    log: function(evt) {
      window.console.log(evt);
    },
    async getOtherData() {
      const dataResponse = await axios.get(this.route("project.other.data", { project_id: this.project.id }));
      const res = dataResponse.data;
      this.labels = res.labels || [];
      this.list_items = res.lists || [];
      this.team_members = res.team_members || [];
    },
    checkTaskUri() {
      const url = this.$page.url;
      let splitUrl = url.split("/");
      splitUrl = splitUrl.filter((el) => !!el);
      if (splitUrl[splitUrl.length - 2] === "task") {
        this.taskDetailsId = splitUrl[splitUrl.length - 1];
        this.taskDetailsOpen = true;
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_board_filter = resolveComponent("board-filter");
  const _component_draggable = resolveComponent("draggable");
  const _component_icon = resolveComponent("icon");
  const _component_task_details = resolveComponent("task-details");
  const _component_right_menu = resolveComponent("right-menu");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["h-full", { "right_menu_enable": $data.show_right_menu }]
  }, _attrs))} data-v-3fe8ca7e>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-3fe8ca7e>`);
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    onMenuToggle: ($event) => $data.show_right_menu = !$data.show_right_menu,
    onFClear: ($event) => $options.reset(),
    filters: $props.filters,
    view: "table"
  }, null, _parent));
  if ($data.open_filter) {
    _push(ssrRenderComponent(_component_board_filter, {
      project: $props.project,
      onBoardFilter: ($event) => $data.open_filter = false,
      filters: $props.filters,
      onDoFilter: $options.doFilter,
      options: "user,due,label"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="flex flex-col task__table overflow-y-auto h-full" data-v-3fe8ca7e><div class="inline-block min-w-full h-full py-4 align-middle md:px-2 lg:px-4" data-v-3fe8ca7e><div class="table__view" data-v-3fe8ca7e><div class="flex flex-wrap gap-2 md:gap-2 py-2" data-v-3fe8ca7e><!--[-->`);
  ssrRenderList($props.lists, (listItem, idx) => {
    _push(`<button type="button" class="${ssrRenderClass([$data.selectedStatus && $data.selectedStatus !== listItem.id ? "opacity-45 hover:opacity-80" : "opacity-100 doc-status-btn--active", "doc-status-btn px-4 py-2 text-xs md:px-6 md:py-2.5 md:text-sm rounded-lg text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"])}" style="${ssrRenderStyle({ backgroundColor: idx === 0 ? "#10b981" : "#3b82f6" })}" data-v-3fe8ca7e>${ssrInterpolate(listItem.title)}</button>`);
  });
  _push(`<!--]--></div><div class="doc-table rounded-xl overflow-hidden shadow-sm" data-v-3fe8ca7e><div class="doc-row doc-row--head hidden md:grid gap-3 px-4 py-3 text-sm font-semibold text-white" data-v-3fe8ca7e><div data-v-3fe8ca7e></div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("ល.រ."))}</div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("លេខកូដឯកសារ"))}</div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("កម្មវត្ថុ"))}</div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("កាលបរិច្ឆេទចូល"))}</div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("ស្ថានភាព"))}</div><div data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("បាកូដ"))}</div></div>`);
  _push(ssrRenderComponent(_component_draggable, {
    modelValue: $data.taskRows,
    "onUpdate:modelValue": ($event) => $data.taskRows = $event,
    tag: "div",
    class: "doc-rows flex flex-col gap-2 p-2",
    handle: ".doc-drag-handle",
    "item-key": "id",
    onEnd: $options.afterDrop
  }, {
    item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="doc-row md:grid gap-1.5 md:gap-3 md:items-center px-4 py-3 md:py-3 rounded-lg bg-slate-200/70 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:shadow-md transition-all duration-200 ease-out md:hover:-translate-y-0.5" data-v-3fe8ca7e${_scopeId}><div class="doc-drag-handle hidden md:flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" data-v-3fe8ca7e${_scopeId}>`);
        _push2(ssrRenderComponent(_component_icon, {
          class: "w-5 h-5",
          name: "drag"
        }, null, _parent2, _scopeId));
        _push2(`</div><div class="text-sm font-medium"${ssrRenderAttr("data-label", _ctx.$t("ល.រ."))} data-v-3fe8ca7e${_scopeId}> #${ssrInterpolate(index + 1)}</div><div class="text-sm font-medium"${ssrRenderAttr("data-label", _ctx.$t("លេខកូដឯកសារ"))} data-v-3fe8ca7e${_scopeId}><span class="cursor-pointer hover:text-blue-600 underline-offset-2 transition-colors" data-v-3fe8ca7e${_scopeId}>${ssrInterpolate($options.documentCode(element))}</span></div><div class="text-sm"${ssrRenderAttr("data-label", _ctx.$t("កម្មវត្ថុ"))} data-v-3fe8ca7e${_scopeId}><span class="cursor-pointer hover:text-blue-600 underline-offset-2 transition-colors" data-v-3fe8ca7e${_scopeId}>${ssrInterpolate(element.title)}</span>`);
        if (element.attachments_count) {
          _push2(`<span class="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 ml-1.5 align-middle" data-v-3fe8ca7e${_scopeId}>`);
          _push2(ssrRenderComponent(_component_icon, {
            class: "w-3.5 h-3.5",
            name: "attachment"
          }, null, _parent2, _scopeId));
          _push2(`${ssrInterpolate(element.attachments_count)}</span>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><div class="text-sm"${ssrRenderAttr("data-label", _ctx.$t("កាលបរិច្ឆេទចូល"))} data-v-3fe8ca7e${_scopeId}>${ssrInterpolate(element.created_at ? _ctx.moment(element.created_at).format("DD MMM YYYY") : "")}</div><div${ssrRenderAttr("data-label", _ctx.$t("ស្ថានភាព"))} data-v-3fe8ca7e${_scopeId}><span class="inline-block px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm" style="${ssrRenderStyle({ backgroundColor: $options.statusColorFor(element) })}" data-v-3fe8ca7e${_scopeId}>${ssrInterpolate(element.list ? element.list.title : "")}</span></div><div${ssrRenderAttr("data-label", _ctx.$t("បាកូដ"))} data-v-3fe8ca7e${_scopeId}><div class="doc-barcode bg-white rounded px-2 py-1 shadow-inner w-full max-w-[180px]" data-v-3fe8ca7e${_scopeId}><svg${ssrRenderAttr("data-barcode-value", $options.documentCode(element))} data-v-3fe8ca7e${_scopeId}></svg></div></div></div>`);
      } else {
        return [
          createVNode("div", { class: "doc-row md:grid gap-1.5 md:gap-3 md:items-center px-4 py-3 md:py-3 rounded-lg bg-slate-200/70 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:shadow-md transition-all duration-200 ease-out md:hover:-translate-y-0.5" }, [
            createVNode("div", { class: "doc-drag-handle hidden md:flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" }, [
              createVNode(_component_icon, {
                class: "w-5 h-5",
                name: "drag"
              })
            ]),
            createVNode("div", {
              class: "text-sm font-medium",
              "data-label": _ctx.$t("ល.រ.")
            }, " #" + toDisplayString(index + 1), 9, ["data-label"]),
            createVNode("div", {
              class: "text-sm font-medium",
              "data-label": _ctx.$t("លេខកូដឯកសារ")
            }, [
              createVNode("span", {
                class: "cursor-pointer hover:text-blue-600 underline-offset-2 transition-colors",
                onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
              }, toDisplayString($options.documentCode(element)), 9, ["onClick"])
            ], 8, ["data-label"]),
            createVNode("div", {
              class: "text-sm",
              "data-label": _ctx.$t("កម្មវត្ថុ")
            }, [
              createVNode("span", {
                class: "cursor-pointer hover:text-blue-600 underline-offset-2 transition-colors",
                onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
              }, toDisplayString(element.title), 9, ["onClick"]),
              element.attachments_count ? (openBlock(), createBlock("span", {
                key: 0,
                class: "inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 ml-1.5 align-middle"
              }, [
                createVNode(_component_icon, {
                  class: "w-3.5 h-3.5",
                  name: "attachment"
                }),
                createTextVNode(toDisplayString(element.attachments_count), 1)
              ])) : createCommentVNode("", true)
            ], 8, ["data-label"]),
            createVNode("div", {
              class: "text-sm",
              "data-label": _ctx.$t("កាលបរិច្ឆេទចូល")
            }, toDisplayString(element.created_at ? _ctx.moment(element.created_at).format("DD MMM YYYY") : ""), 9, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("ស្ថានភាព")
            }, [
              createVNode("span", {
                class: "inline-block px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm",
                style: { backgroundColor: $options.statusColorFor(element) }
              }, toDisplayString(element.list ? element.list.title : ""), 5)
            ], 8, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("បាកូដ")
            }, [
              createVNode("div", { class: "doc-barcode bg-white rounded px-2 py-1 shadow-inner w-full max-w-[180px]" }, [
                (openBlock(), createBlock("svg", {
                  ref: $options.setBarcodeRef(element.id),
                  "data-barcode-value": $options.documentCode(element)
                }, null, 8, ["data-barcode-value"]))
              ])
            ], 8, ["data-label"])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  if (!$data.taskRows.length) {
    _push(`<div class="text-center py-8 text-sm text-gray-500 dark:text-gray-400" data-v-3fe8ca7e>${ssrInterpolate(_ctx.$t("No documents found!"))}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($data.showListBox) {
    _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" style="${ssrRenderStyle({ top: $data.selected.top, left: $data.selected.left })}" data-v-3fe8ca7e><h4 class="text-center mb-3 font-bold" data-v-3fe8ca7e>Change List</h4><div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" data-v-3fe8ca7e>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4",
      name: "close"
    }, null, _parent));
    _push(`</div><input${ssrRenderAttr("value", $data.list_search)} class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search lists" data-v-3fe8ca7e><ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto" data-v-3fe8ca7e><!--[-->`);
    ssrRenderList($options.searchList($data.list_search), (listObject, li_index) => {
      _push(`<li data-v-3fe8ca7e><label class="flex p-2 cursor-pointer hover:bg-gray-200 rounded" data-v-3fe8ca7e><input name="task_list" class="w-5 ml-1 mr-2" type="radio"${ssrIncludeBooleanAttr($options.isCurrentLabel(listObject.id)) ? " checked" : ""} data-v-3fe8ca7e><span data-a="" class="p-1" type="button"${ssrRenderAttr("tabindex", li_index)} data-v-3fe8ca7e>${ssrInterpolate(listObject.title)}</span></label></li>`);
    });
    _push(`<!--]--></ul></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showAssigneeBox) {
    _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" style="${ssrRenderStyle({ top: $data.selected.top, left: $data.selected.left })}" data-v-3fe8ca7e><h4 class="text-center mb-3 font-bold" data-v-3fe8ca7e>Assignee</h4><div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" data-v-3fe8ca7e>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4",
      name: "close"
    }, null, _parent));
    _push(`</div><input id="p_t_s_u"${ssrRenderAttr("value", $data.user_search)} class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search users" data-v-3fe8ca7e><ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto" data-v-3fe8ca7e><!--[-->`);
    ssrRenderList($options.searchUser($data.user_search), (userObject, user_index) => {
      _push(`<li data-v-3fe8ca7e><label${ssrRenderAttr("for", "t_u_id_" + user_index)} class="flex p-2 cursor-pointer hover:bg-gray-200 rounded" data-v-3fe8ca7e><input${ssrRenderAttr("id", "t_u_id_" + user_index)} class="w-5 ml-1 mr-2" type="checkbox"${ssrIncludeBooleanAttr($options.task_assignees().includes(userObject.user_id)) ? " checked" : ""} data-v-3fe8ca7e>`);
      if (userObject.user.photo_path) {
        _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full"${ssrRenderAttr("src", userObject.user.photo_path)} data-v-3fe8ca7e>`);
      } else {
        _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full" src="/images/user.svg" data-v-3fe8ca7e>`);
      }
      _push(`<span data-a="" class="p-1" type="button"${ssrRenderAttr("tabindex", user_index)} data-v-3fe8ca7e>${ssrInterpolate(userObject.user.name)}</span></label></li>`);
    });
    _push(`<!--]--></ul></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showLabelBox) {
    _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" style="${ssrRenderStyle({ top: $data.selected.top, left: $data.selected.left })}" data-v-3fe8ca7e><h4 class="text-center mb-3 font-bold" data-v-3fe8ca7e>Labels</h4><div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded" data-v-3fe8ca7e>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4",
      name: "close"
    }, null, _parent));
    _push(`</div><input${ssrRenderAttr("value", $data.label_search)} class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]"${ssrRenderAttr("placeholder", _ctx.$t("Search labels"))} data-v-3fe8ca7e><ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto" data-v-3fe8ca7e><!--[-->`);
    ssrRenderList($options.searchLabel($data.label_search), (lab, lab_index) => {
      _push(`<li data-v-3fe8ca7e><label class="flex gap-1" data-v-3fe8ca7e><input class="w-5 mr-2 cursor-pointer" type="checkbox"${ssrIncludeBooleanAttr($options.task_label_ids().includes(lab.id)) ? " checked" : ""} data-v-3fe8ca7e><span class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80" style="${ssrRenderStyle({ background: lab.color })}"${ssrRenderAttr("tabindex", lab_index)} data-color="orange" data-v-3fe8ca7e>${ssrInterpolate(lab.name)}</span><button class="p-3 hover:bg-gray-200 rounded" type="button"${ssrRenderAttr("tabindex", lab_index)} data-v-3fe8ca7e>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3",
        name: "edit"
      }, null, _parent));
      _push(`</button></label></li>`);
    });
    _push(`<!--]--></ul><button class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 hover:opacity-80" data-v-3fe8ca7e> Create a new label </button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
      view: "table",
      isPopup: $data.td_pop,
      onCloseModal: ($event) => $options.closeDetails()
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.show_right_menu) {
    _push(ssrRenderComponent(_component_right_menu, {
      project: $props.project,
      onMenuToggle: ($event) => $data.show_right_menu = !$data.show_right_menu,
      onOpenTask: (id) => $options.taskDetailsPopup(id)
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Table.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Table = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-3fe8ca7e"]]);
export {
  Table as default
};
