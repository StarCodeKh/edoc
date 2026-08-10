import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import draggable from "vuedraggable";
import moment from "moment";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";
import mapValues from "lodash/mapValues.js";
import { R as RightMenu } from "./RightMenu-BExBq8ZO.js";
import axios from "axios";
import { mergeProps, useSSRContext, resolveComponent, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, withDirectives, vModelText, vShow, createTextVNode, Fragment, renderList, withModifiers } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
import "./DeleteConfirmation-HVTZH6_Z.js";
const _sfc_main$1 = {
  name: "DocumentReceipt",
  props: {
    task: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    getTaskCode() {
      var _a, _b;
      return ((_a = this.task) == null ? void 0 : _a.task_code) || ((_b = this.task) == null ? void 0 : _b.id) || "N/A";
    }
  },
  mounted() {
    if (document.fonts) {
      document.fonts.load('700 20px "Moul"');
      document.fonts.load('700 20px "Battambang"');
      document.fonts.load('400 16px "Kantumruy Pro"');
      document.fonts.load('700 16px "Kantumruy Pro"');
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return "N/A";
      const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
      const khmerNumbers = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      const toKhmerNumber = (num) => String(num).replace(/\d/g, (d) => khmerNumbers[d]);
      const m = moment(date);
      const day = toKhmerNumber(m.format("DD"));
      const month = khmerMonths[m.month()];
      const year = toKhmerNumber(m.format("YYYY"));
      return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
    },
    getTrackingUrl() {
      return `${window.location.origin}/track/${this.getTaskCode}`;
    },
    printDocument() {
      window.print();
    },
    closeModal() {
      this.$emit("close");
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 transition-all" }, _attrs))} data-v-4c114123><div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col" data-v-4c114123><div class="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 rounded-t-2xl print:hidden" data-v-4c114123><div class="flex items-center gap-2 text-sm font-semibold text-gray-700" data-v-4c114123><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" data-v-4c114123></span><span class="hidden sm:inline font-kantumruy" data-v-4c114123>${ssrInterpolate(_ctx.$t ? _ctx.$t("ប័ណ្ណទទួលឯកសារ") : "Document Receipt")}</span></div><div class="flex items-center gap-2" data-v-4c114123><button type="button"${ssrRenderAttr("title", _ctx.$t ? _ctx.$t("Print") : "បោះពុម្ព")} class="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center" data-v-4c114123><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4c114123><polyline points="6 9 6 2 18 2 18 9" data-v-4c114123></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" data-v-4c114123></path><rect x="6" y="14" width="12" height="8" data-v-4c114123></rect></svg></button><button type="button"${ssrRenderAttr("title", _ctx.$t ? _ctx.$t("Close") : "បិទ")} class="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center" data-v-4c114123><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4c114123><line x1="18" y1="6" x2="6" y2="18" data-v-4c114123></line><line x1="6" y1="6" x2="18" y2="18" data-v-4c114123></line></svg></button></div></div><div class="p-3 sm:p-8 overflow-x-auto" data-v-4c114123><div id="printable-receipt" class="bg-white p-6 sm:p-12 border border-gray-200/80 rounded-xl shadow-sm text-gray-900 font-kantumruy relative min-h-[550px] sm:min-h-[650px] flex flex-col justify-between" data-v-4c114123><div class="pointer-events-none absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-t-4 border-l-4 border-emerald-600/20 rounded-tl-xl" style="${ssrRenderStyle({ "border-top-left-radius": "0.75rem" })}" data-v-4c114123></div><div class="pointer-events-none absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 border-b-4 border-r-4 border-emerald-600/20 rounded-br-xl" style="${ssrRenderStyle({ "border-bottom-right-radius": "0.75rem" })}" data-v-4c114123></div><div data-v-4c114123><div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b-2 border-emerald-600/30 pb-6 mb-6 sm:mb-8 text-center sm:text-left" data-v-4c114123><img src="/images/logo.png" alt="Logo" class="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" data-v-4c114123><div class="flex-1 sm:pr-12" data-v-4c114123><h2 class="font-battambang text-base sm:text-xl font-bold text-gray-900 tracking-wide leading-relaxed" data-v-4c114123> អគ្គលេខាធិការដ្ឋានគណៈកម្មាធិការគ្រប់គ្រងល្បែងពាណិជ្ជកម្មកម្ពុជា </h2><h3 class="font-moul text-lg sm:text-2xl text-emerald-600 tracking-wider mt-2 sm:mt-3" data-v-4c114123> លិខិតបញ្ជាក់ឯកសារ </h3></div></div><div class="space-y-3 text-sm sm:text-base text-gray-900 my-4 sm:my-6" data-v-4c114123><div class="flex flex-col sm:flex-row sm:items-baseline" data-v-4c114123><span class="font-semibold sm:min-w-[160px] text-gray-900" data-v-4c114123>លេខឯកសារ៖</span><span class="font-bold text-emerald-700 mt-0.5 sm:mt-0 tracking-wide" data-v-4c114123>${ssrInterpolate($options.getTaskCode)}</span></div><div class="flex flex-col sm:flex-row sm:items-baseline" data-v-4c114123><span class="font-semibold sm:min-w-[160px] text-gray-900" data-v-4c114123>កម្មវត្ថុ៖</span><span class="flex-1 mt-0.5 sm:mt-0" data-v-4c114123>${ssrInterpolate(((_a = $props.task) == null ? void 0 : _a.title) || "N/A")}</span></div>`);
  if ((_b = $props.task) == null ? void 0 : _b.project) {
    _push(`<div class="flex flex-col sm:flex-row sm:items-baseline" data-v-4c114123><span class="font-semibold sm:min-w-[160px] text-gray-900" data-v-4c114123>ប្រភពឯកសារ៖</span><span class="flex-1 mt-0.5 sm:mt-0" data-v-4c114123>${ssrInterpolate($props.task.project.name)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="flex flex-col sm:flex-row sm:items-baseline" data-v-4c114123><span class="font-semibold sm:min-w-[160px] text-gray-900" data-v-4c114123>កាលបរិច្ឆេទឯកសារចូល៖</span><span class="flex-1 mt-0.5 sm:mt-0" data-v-4c114123>${ssrInterpolate($options.formatDate((_c = $props.task) == null ? void 0 : _c.created_at))}</span></div></div></div><div class="mt-8 sm:mt-8 relative z-10 print-avoid-break" data-v-4c114123><div class="flex flex-col items-center justify-center my-4 sm:my-6 space-y-3 sm:space-y-4" data-v-4c114123><div class="p-2 bg-white flex justify-center items-center border border-gray-100 rounded-lg shadow-sm" data-v-4c114123>`);
  if ((_d = $props.task) == null ? void 0 : _d.qr_code) {
    _push(`<img${ssrRenderAttr("src", $props.task.qr_code)} alt="QR Code" class="w-28 h-28 sm:w-32 sm:h-32 object-contain" data-v-4c114123>`);
  } else {
    _push(`<img${ssrRenderAttr("src", `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent($options.getTrackingUrl())}`)} alt="QR Code" class="w-28 h-28 sm:w-32 sm:h-32 object-contain" data-v-4c114123>`);
  }
  _push(`</div><div class="flex flex-col items-center mt-2 w-full overflow-hidden" data-v-4c114123>`);
  if ((_e = $props.task) == null ? void 0 : _e.bar_code) {
    _push(`<img${ssrRenderAttr("src", $props.task.bar_code)} alt="Barcode" class="h-10 sm:h-12 max-w-full w-56 sm:w-64 object-contain" data-v-4c114123>`);
  } else {
    _push(`<img${ssrRenderAttr("src", `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent($options.getTaskCode)}&scale=2&height=10&includetext=false`)} alt="Barcode" class="h-10 sm:h-12 max-w-full w-56 sm:w-64 object-contain" data-v-4c114123>`);
  }
  _push(`<p class="text-[11px] sm:text-xs text-gray-800 mt-2 font-medium text-center" data-v-4c114123>សូមស្កេន ដើម្បីតាមដានឯកសារ</p><p class="text-[10px] sm:text-[11px] text-gray-500 font-sans tracking-wide text-center" data-v-4c114123>Please, scan here to track document.</p></div></div><div class="flex justify-end pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100" data-v-4c114123><span class="font-moul text-sm sm:text-lg text-gray-800 tracking-wider" data-v-4c114123>សូមអរគុណ</span></div></div></div></div></div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Modals/DocumentReceipt.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const DocumentReceipt = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-4c114123"]]);
const _sfc_main = {
  metaInfo: { title: "Dashboard" },
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
    }
  },
  remember: "form",
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
      firstResponse: [],
      lastResponse: [],
      new_task: {},
      new_list: {},
      taskDetailsOpen: false,
      activeTimerString: "",
      months: [],
      counter: { seconds: 0, timer: this.timer },
      drag: false,
      new_task_open: false,
      taskDetailsId: "",
      open_filter: false,
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
        this.$inertia.get(this.route("projects.view.board", this.project.slug || this.project.id), pickBy(this.form), { preserveState: true });
      }, 150)
    }
  },
  created() {
    this.moment = moment;
    let currentUrl = this.$page.url.substr(1);
    currentUrl.split("/");
    if (this.task) {
      this.taskDetailsId = this.task.slug || this.task.id;
      this.taskDetailsOpen = true;
    }
    if (!!this.filters.task) {
      this.taskDetailsPopup(this.filters.task);
    }
  },
  methods: {
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
    cardSwitchClick(e) {
      e.stopPropagation();
    },
    cardSwitchToggle(element, e) {
      e.preventDefault();
      e.stopPropagation();
      this.saveTask(element.id, { is_done: e.target.checked });
    },
    getDoneCount(list) {
      return list.tasks.filter((t) => !!t.is_done).length;
    },
    getDue(element) {
      return element.is_done ? "done" : moment().isAfter(element.due_date) ? "over_due" : moment(element.due_date).isBetween(moment(), moment().add(1, "day")) ? "due_soon" : "";
    },
    openNewTask(listItem) {
      for (let n = 0; n < this.lists.length; n++) {
        if (!!this.lists[n].new_task_open) {
          this.lists[n].new_task_open = false;
        }
      }
      listItem.new_task_open = true;
      this.new_task.title = "";
      this.setFocus(this.$refs["new_task_input_" + listItem.id][0]);
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
    openNewList() {
      this.new_list.title = "";
      this.new_list_open = true;
      this.setFocus(this.$refs["new_list_input_" + this.lists.length]);
    },
    setFocus(ref) {
      setTimeout(function() {
        if (ref) {
          ref.focus();
        }
      }, 10);
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
    submitNewList(e) {
      e.preventDefault();
      if (this.new_list.title) {
        axios.post(this.route("json.list.add"), { project_id: this.project.id, order: this.lists.length, title: this.new_list.title }).then((response) => {
          if (response.data) {
            const listItem = response.data;
            listItem.tasks = [];
            this.lists.push(listItem);
            this.openNewList();
          }
        });
      } else {
        this.new_list_open = false;
      }
    },
    async moveList(index, position) {
      position = position === "minus" ? index - 1 : index + 1;
      const lists = this.lists.map((l) => l.order);
      const newList = this.array_move(lists, index, position);
      let listObject = [];
      let i = 0, len = this.lists.length;
      while (i < len) {
        this.lists[i].order = newList[i];
        listObject.push({ id: this.lists[i].id, order: newList[i] });
        i++;
      }
      this.lists.sort((a, b) => a.order - b.order);
      await axios.post(this.route("json.list.order"), listObject);
    },
    array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
          arr.push(void 0);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    },
    makeListArchive(e, id, index) {
      e.preventDefault();
      axios.post(this.route("json.list.archive", id)).then((response) => {
        if (response.data) {
          this.lists.splice(index, 1);
        }
      });
    },
    makeArchive(e, id, tasks, index) {
      e.preventDefault();
      e.stopPropagation();
      this.saveTask(id, { is_archive: 1 });
      tasks.splice(index, 1);
    },
    visibleShowMore(e, element) {
      e.preventDefault();
      e.stopPropagation();
      element.show_more = !!element.show_more ? false : true;
    },
    visibleLabel(e) {
      e.preventDefault();
      e.stopPropagation();
      this.showLabelName = !this.showLabelName;
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
        if (response.data) {
          this.sendNotification("send.mail.board_update", id);
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    afterDrop(e) {
      const new_list = this.newSortedItems(e, "to");
      let previous_list = [];
      if (!!e.pullMode) {
        previous_list = this.newSortedItems(e, "from");
        this.saveTask(e.item.dataset.id, { list_id: e.to.dataset.id });
      }
      const list_items = new_list.concat(previous_list);
      this.saveOrder(list_items);
    },
    newSortedItems(e, selector) {
      const lists = e[selector].getElementsByClassName("t__box");
      const newOrder = [];
      for (let i = 0; i < lists.length; i++) {
        newOrder.push({ id: lists[i].dataset.id, order: i + 1 });
      }
      return newOrder;
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
        this.openNewTask(listItem);
      } else {
        listItem.new_task_open = false;
      }
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
    taskDetailsPopup(id) {
      this.form.task = id;
      this.td_pop = true;
      this.taskDetailsId = id;
      this.taskDetailsOpen = true;
    },
    goToLink(link) {
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
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_board_filter = resolveComponent("board-filter");
  const _component_icon = resolveComponent("icon");
  const _component_draggable = resolveComponent("draggable");
  const _component_task_details = resolveComponent("task-details");
  const _component_DocumentReceipt = resolveComponent("DocumentReceipt");
  const _component_right_menu = resolveComponent("right-menu");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["h-full", { "right_menu_enable": $data.show_right_menu }]
  }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    onMenuToggle: ($event) => $data.show_right_menu = !$data.show_right_menu,
    onFClear: ($event) => $options.reset(),
    filters: $props.filters,
    view: "board"
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
  _push(`<div class="task_board">`);
  if ($data.loading) {
    _push(`<div class="board_width animate-pulse"><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div></div>`);
  } else {
    _push(`<div class="${ssrRenderClass([{ "v_label": $data.showLabelName }, "board_width"])}"><!--[-->`);
    ssrRenderList($props.lists, (listItem, listIndex) => {
      _push(`<div class="top_list"><div class="b__list"><div class="flex w-full text-sm font-semibold"><span class="px-2 py-1 w-full" contenteditable="true">${ssrInterpolate(listItem.title)}</span></div><span class="inline-flex items-center justify-center px-2 py-1 ml-1 mr-1 text-xs cursor-default font-semibold text-indigo-500 bg-indigo-600 rounded-full bg-opacity-30" aria-label="Total Tasks">${ssrInterpolate($options.getDoneCount(listItem) + "/" + listItem.tasks.length)}</span><button class="flex items-center justify-center w-6 h-6 ml-auto text-indigo-500 rounded hover:bg-[#091e4224]">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-5 w-5",
        name: "more-h"
      }, null, _parent));
      _push(`</button>`);
      if (listItem.show_more) {
        _push(`<div class="absolute right-9 top-2 w-30 z-999 bg-white py-3 rounded shadow">`);
        if (listIndex !== 0) {
          _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">`);
          _push(ssrRenderComponent(_component_icon, {
            class: "mr-2 h-4 w-4",
            name: "move_left"
          }, null, _parent));
          _push(` ${ssrInterpolate(_ctx.$t("Move Left"))}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (listIndex !== $props.lists.length - 1) {
          _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">${ssrInterpolate(_ctx.$t("Move Right"))} `);
          _push(ssrRenderComponent(_component_icon, {
            class: "ml-2 h-4 w-4",
            name: "move_right"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">`);
        _push(ssrRenderComponent(_component_icon, {
          class: "mr-2 h-4 w-4",
          name: "archive"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Archive"))}</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_draggable, {
        "data-id": listItem.id,
        class: "dragArea",
        list: listItem.tasks,
        group: "task",
        "item-key": "id",
        onEnd: ($event) => $options.afterDrop($event)
      }, {
        item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${ssrRenderAttr("data-id", element.id)} class="t__box group hover:bg-opacity-100" draggable="true"${_scopeId}>`);
            if (element.show_more) {
              _push2(`<div class="absolute right-7 top-1 w-30 z-999 bg-gray-100"${_scopeId}>`);
              if (element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "archive"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Archive"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "incomplete"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Mark incomplete"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (!element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "complete"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Mark complete"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="hidden show__more group-hover:flex"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "more"
            }, null, _parent2, _scopeId));
            _push2(`</button>`);
            if (element.timer) {
              _push2(ssrRenderComponent(_component_icon, {
                name: "blink",
                class: "w-2 h-2 absolute top-2 right-2 z-20"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (element.cover) {
              _push2(`<div class="t__cover" style="${ssrRenderStyle({ backgroundImage: "url(" + element.cover.path + ")", height: element.cover.width ? element.cover.height / (element.cover.width / 246) + "px" : "auto" })}"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="t__details"${_scopeId}>`);
            if (element.task_labels.length) {
              _push2(`<div class="task__labels"${_scopeId}><!--[-->`);
              ssrRenderList(element.task_labels, (la, l_index) => {
                _push2(`<button class="color" style="${ssrRenderStyle({ backgroundColor: la.label.color })}"${ssrRenderAttr("aria-label", la.label.name)}${_scopeId}>${ssrInterpolate(la.label.name)}</button>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="t__title__area"${_scopeId}>`);
            if (element.is_done) {
              _push2(`<div class="checklist-box"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(!!element.is_done) ? " checked" : ""}${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, { name: "checklist_box" }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<h4 class="t__title"${_scopeId}>${ssrInterpolate(element.title)}</h4></div>`);
            if (element.task_code) {
              _push2(`<div class="__item text-xs font-mono text-gray-500 font-medium hover:text-indigo-600 cursor-pointer"${_scopeId}>${ssrInterpolate(element.task_code)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="card__footer"${_scopeId}>`);
            if (element.due_date) {
              _push2(`<div aria-label="Due date" class="${ssrRenderClass([$options.getDue(element), "__item due"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "time"
              }, null, _parent2, _scopeId));
              _push2(`<span class="pl-[2px] pr-[4px] leading-none"${_scopeId}>${ssrInterpolate(_ctx.moment(element.due_date).format("MMM D"))}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.description) {
              _push2(`<div class="__item" aria-label="This task has a description."${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "details"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.comments_count) {
              _push2(`<div class="relative __item" aria-label="Comments"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "comment"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.comments_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.attachments_count) {
              _push2(`<div class="__item" aria-label="Attachments"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "attachment"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.attachments_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.checklists_count) {
              _push2(`<div aria-label="Checklist items" class="${ssrRenderClass([{ "completed": element.checklist_done_count === element.checklists_count }, "__item check"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "checklist"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.checklist_done_count + "/" + element.checklists_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="pop__assignee"${_scopeId}><!--[-->`);
            ssrRenderList(element.assignees, (assignee) => {
              _push2(`<span${ssrRenderAttr("aria-label", assignee.user.name)} class="block rounded-full h-6 w-6"${_scopeId}>`);
              if (assignee.user.photo_path) {
                _push2(`<img class="h-full w-full rounded-full"${ssrRenderAttr("src", assignee.user.photo_path)}${ssrRenderAttr("alt", assignee.user.name)}${_scopeId}>`);
              } else {
                _push2(`<img class="h-full w-full rounded-full" src="/images/user.svg"${ssrRenderAttr("alt", assignee.user.name)}${_scopeId}>`);
              }
              _push2(`</span>`);
            });
            _push2(`<!--]--></div></div></div>`);
          } else {
            return [
              createVNode("div", {
                "data-id": element.id,
                class: "t__box group hover:bg-opacity-100",
                draggable: "true"
              }, [
                element.show_more ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "absolute right-7 top-1 w-30 z-999 bg-gray-100"
                }, [
                  element.is_done ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: ($event) => $options.makeArchive($event, element.id, listItem.tasks, index),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "archive"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Archive")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true),
                  element.is_done ? (openBlock(), createBlock("button", {
                    key: 1,
                    onClick: ($event) => $options.saveTask(element.id, { is_done: false }),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "incomplete"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Mark incomplete")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true),
                  !element.is_done ? (openBlock(), createBlock("button", {
                    key: 2,
                    onClick: ($event) => $options.saveTask(element.id, { is_done: true }),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "complete"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Mark complete")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                createVNode("button", {
                  onClick: ($event) => $options.visibleShowMore($event, element),
                  class: "hidden show__more group-hover:flex"
                }, [
                  createVNode(_component_icon, {
                    class: "w-4 h-4",
                    name: "more"
                  })
                ], 8, ["onClick"]),
                element.timer ? (openBlock(), createBlock(_component_icon, {
                  key: 1,
                  name: "blink",
                  class: "w-2 h-2 absolute top-2 right-2 z-20"
                })) : createCommentVNode("", true),
                element.cover ? (openBlock(), createBlock("div", {
                  key: 2,
                  onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id),
                  class: "t__cover",
                  style: { backgroundImage: "url(" + element.cover.path + ")", height: element.cover.width ? element.cover.height / (element.cover.width / 246) + "px" : "auto" }
                }, null, 12, ["onClick"])) : createCommentVNode("", true),
                createVNode("div", {
                  class: "t__details",
                  onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
                }, [
                  element.task_labels.length ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "task__labels"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(element.task_labels, (la, l_index) => {
                      return openBlock(), createBlock("button", {
                        onClick: ($event) => $options.visibleLabel($event),
                        class: "color",
                        style: { backgroundColor: la.label.color },
                        "aria-label": la.label.name
                      }, toDisplayString(la.label.name), 13, ["onClick", "aria-label"]);
                    }), 256))
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "t__title__area" }, [
                    element.is_done ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "checklist-box",
                      onClick: ($event) => $options.cardSwitchClick($event)
                    }, [
                      createVNode("input", {
                        type: "checkbox",
                        checked: !!element.is_done,
                        onChange: ($event) => $options.cardSwitchToggle(element, $event)
                      }, null, 40, ["checked", "onChange"]),
                      createVNode(_component_icon, { name: "checklist_box" })
                    ], 8, ["onClick"])) : createCommentVNode("", true),
                    createVNode("h4", { class: "t__title" }, toDisplayString(element.title), 1)
                  ]),
                  element.task_code ? (openBlock(), createBlock("div", {
                    key: 1,
                    onClick: withModifiers(($event) => $options.openReceiptModal(element, $event), ["stop"]),
                    class: "__item text-xs font-mono text-gray-500 font-medium hover:text-indigo-600 cursor-pointer"
                  }, toDisplayString(element.task_code), 9, ["onClick"])) : createCommentVNode("", true),
                  createVNode("div", {
                    class: "card__footer",
                    onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
                  }, [
                    element.due_date ? (openBlock(), createBlock("div", {
                      key: 0,
                      "aria-label": "Due date",
                      class: ["__item due", $options.getDue(element)]
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "time"
                      }),
                      createVNode("span", { class: "pl-[2px] pr-[4px] leading-none" }, toDisplayString(_ctx.moment(element.due_date).format("MMM D")), 1)
                    ], 2)) : createCommentVNode("", true),
                    element.description ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "__item",
                      "aria-label": "This task has a description."
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "details"
                      })
                    ])) : createCommentVNode("", true),
                    element.comments_count ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "relative __item",
                      "aria-label": "Comments"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "comment"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.comments_count), 1)
                    ])) : createCommentVNode("", true),
                    element.attachments_count ? (openBlock(), createBlock("div", {
                      key: 3,
                      class: "__item",
                      "aria-label": "Attachments"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "attachment"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.attachments_count), 1)
                    ])) : createCommentVNode("", true),
                    element.checklists_count ? (openBlock(), createBlock("div", {
                      key: 4,
                      class: ["__item check", { "completed": element.checklist_done_count === element.checklists_count }],
                      "aria-label": "Checklist items"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "checklist"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.checklist_done_count + "/" + element.checklists_count), 1)
                    ], 2)) : createCommentVNode("", true)
                  ], 8, ["onClick"]),
                  createVNode("div", { class: "pop__assignee" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(element.assignees, (assignee) => {
                      return openBlock(), createBlock("span", {
                        "aria-label": assignee.user.name,
                        class: "block rounded-full h-6 w-6"
                      }, [
                        assignee.user.photo_path ? (openBlock(), createBlock("img", {
                          key: 0,
                          class: "h-full w-full rounded-full",
                          src: assignee.user.photo_path,
                          alt: assignee.user.name
                        }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
                          key: 1,
                          class: "h-full w-full rounded-full",
                          src: "/images/user.svg",
                          alt: assignee.user.name
                        }, null, 8, ["alt"]))
                      ], 8, ["aria-label"]);
                    }), 256))
                  ])
                ], 8, ["onClick"])
              ], 8, ["data-id"])
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="add_new pt-1"${_scopeId}>`);
            if (!listItem.new_task_open) {
              _push2(`<div class="group mb-1.5 flex cursor-pointer items-center rounded py-2 hover:bg-white ltr:pl-2 rtl:pr-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-5 w-5 text-indigo-500",
                name: "add"
              }, null, _parent2, _scopeId));
              _push2(`<span class="block text-sm text-gray-500"${_scopeId}>${ssrInterpolate(_ctx.$t("Add a task"))}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mb-2" style="${ssrRenderStyle(listItem.new_task_open ? null : { display: "none" })}"${_scopeId}><input autofocus${ssrRenderAttr("id", "new_task_input_id_" + listItem.id)} type="text"${ssrRenderAttr("value", $data.new_task.title)} class="block text-sm font-medium w-full px-4 py-3 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"${ssrRenderAttr("placeholder", _ctx.$t("Enter a title for this task"))}${_scopeId}><div class="pl-1 mt-2 flex"${_scopeId}><button class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-2.5 py-1.5 text-xs rounded"${_scopeId}>${ssrInterpolate(_ctx.$t("Add task"))}</button><button class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 focus:ring-indigo-500 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "close"
            }, null, _parent2, _scopeId));
            _push2(`</button></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "add_new pt-1" }, [
                !listItem.new_task_open ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "group mb-1.5 flex cursor-pointer items-center rounded py-2 hover:bg-white ltr:pl-2 rtl:pr-2",
                  onClick: ($event) => $options.openNewTask(listItem)
                }, [
                  createVNode(_component_icon, {
                    class: "w-5 w-5 text-indigo-500",
                    name: "add"
                  }),
                  createVNode("span", { class: "block text-sm text-gray-500" }, toDisplayString(_ctx.$t("Add a task")), 1)
                ], 8, ["onClick"])) : createCommentVNode("", true),
                withDirectives(createVNode("div", { class: "mb-2" }, [
                  withDirectives(createVNode("input", {
                    autofocus: "",
                    id: "new_task_input_id_" + listItem.id,
                    ref_for: true,
                    ref: "new_task_input_" + listItem.id,
                    type: "text",
                    "onUpdate:modelValue": ($event) => $data.new_task.title = $event,
                    class: "block text-sm font-medium w-full px-4 py-3 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                    placeholder: _ctx.$t("Enter a title for this task"),
                    onKeyup: ($event) => $event.keyCode === 13 ? $options.submitNewTask(listItem, listIndex) : ""
                  }, null, 40, ["id", "onUpdate:modelValue", "placeholder", "onKeyup"]), [
                    [vModelText, $data.new_task.title]
                  ]),
                  createVNode("div", { class: "pl-1 mt-2 flex" }, [
                    createVNode("button", {
                      onClick: ($event) => $options.submitNewTask(listItem, listIndex),
                      class: "inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-2.5 py-1.5 text-xs rounded"
                    }, toDisplayString(_ctx.$t("Add task")), 9, ["onClick"]),
                    createVNode("button", {
                      onClick: ($event) => listItem.new_task_open = false,
                      class: "inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 focus:ring-indigo-500 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "close"
                      })
                    ], 8, ["onClick"])
                  ])
                ], 512), [
                  [vShow, listItem.new_task_open]
                ])
              ])
            ];
          }
        }),
        _: 2
      }, _parent));
      _push(`</div>`);
    });
    _push(`<!--]--><div class="flex flex-col w-72 add__new__list"><div class="${ssrRenderClass([{ "active": $data.new_list_open }, "add_new"])}">`);
    if (!$data.new_list_open) {
      _push(`<div class="group p-3 flex cursor-pointer items-center rounded">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-5 w-5",
        name: "add"
      }, null, _parent));
      _push(`<span class="block text-sm">${ssrInterpolate(_ctx.$t("Add a new list"))}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="p-3" style="${ssrRenderStyle($data.new_list_open ? null : { display: "none" })}"><input autofocus type="text"${ssrRenderAttr("id", "new_list_input_id_" + $props.lists.length)}${ssrRenderAttr("value", $data.new_list.title)} class="block text-sm font-medium w-full px-2 py-2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter list title..."><div class="mt-2 flex"><button class="inline-flex items-center border font-medium shadow-sm text-white border-transparent bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 text-xs rounded"> Add list </button><button class="inline-flex items-center border font-medium shadow-sm text-gray-700 border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"> Cancel </button></div></div></div></div><div class="flex-shrink-0 w-6"></div></div>`);
  }
  _push(`</div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
      view: "board",
      isPopup: $data.td_pop,
      onCloseModal: ($event) => $options.closeDetails()
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.receiptModalOpen) {
    _push(ssrRenderComponent(_component_DocumentReceipt, {
      task: $data.selectedReceiptTask,
      onClose: $options.closeReceiptModal
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/View.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const View = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  View as default
};
