import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import pickBy from "lodash/pickBy.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import mapValues from "lodash/mapValues.js";
import throttle from "lodash/throttle.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import moment from "moment";
import { S as SearchInput } from "./SearchInput-Br3HcA23.js";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import { resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
const _sfc_main = {
  components: {
    TaskDetails,
    BoardFilter,
    Head,
    Icon,
    Link,
    BoardViewMenu,
    Pagination,
    SearchInput
  },
  layout: Layout,
  props: {
    title: String,
    auth: Object,
    project: Object,
    workspace: Object,
    time_logs: Object,
    total_duration: { required: false },
    filters: Object
  },
  data() {
    return {
      open_filter: false,
      selected_task: null,
      taskDetailsOpen: false,
      form: {
        search: this.filters.search,
        user: this.filters.user,
        due: this.filters.due,
        label: this.filters.label
      },
      canScrollLeft: false,
      canScrollRight: true
    };
  },
  watch: {
    form: {
      deep: true,
      handler: throttle(function() {
        this.$inertia.get(this.route("projects.view.time_logs", this.project.slug || this.project.id), pickBy(this.form), { preserveState: true });
      }, 150)
    }
  },
  computed: {},
  created() {
    this.moment = moment;
  },
  mounted() {
    this.$nextTick(() => {
      this.updateScrollState();
    });
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    formatDuration(duration, unit = "minutes") {
      const durationObj = moment.duration(duration, unit);
      const hours = Math.floor(durationObj.asHours());
      const minutes = Math.floor(durationObj.asMinutes()) % 60;
      const seconds = Math.floor(durationObj.asSeconds()) % 60;
      let result = "";
      if (hours > 0) {
        result += `${hours}h`;
        if (minutes > 0) {
          result += ` ${minutes}m`;
        }
      } else if (minutes > 0) {
        result += `${minutes}m`;
        if (seconds > 0) {
          result += ` ${seconds}s`;
        }
      } else {
        result += `${seconds}s`;
      }
      return result;
    },
    doFilter(form) {
      Object.assign(this.form, form);
    },
    openTask(task) {
      this.selected_task = task;
      this.taskDetailsOpen = true;
    },
    closeDetails() {
      this.selected_task = null;
      this.taskDetailsOpen = false;
    },
    reset() {
      this.form = mapValues(this.form, () => null);
    },
    scrollTable(direction) {
      const container = this.$refs.tableContainer;
      if (container) {
        const scrollAmount = 300;
        if (direction === "left") {
          container.scrollLeft -= scrollAmount;
        } else {
          container.scrollLeft += scrollAmount;
        }
        this.$nextTick(() => {
          this.updateScrollState();
        });
      }
    },
    scrollToStart() {
      const container = this.$refs.tableContainer;
      if (container) {
        container.scrollLeft = 0;
        this.updateScrollState();
      }
    },
    scrollToEnd() {
      const container = this.$refs.tableContainer;
      if (container) {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
        this.updateScrollState();
      }
    },
    updateScrollState() {
      const container = this.$refs.tableContainer;
      if (container) {
        const isLargeScreen = window.innerWidth >= 1200;
        if (isLargeScreen) {
          this.canScrollLeft = false;
          this.canScrollRight = false;
        } else {
          this.canScrollLeft = container.scrollLeft > 0;
          this.canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
        }
      }
    },
    handleScroll() {
      this.updateScrollState();
    },
    handleResize() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.updateScrollState();
      }, 150);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a;
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_board_filter = resolveComponent("board-filter");
  const _component_icon = resolveComponent("icon");
  const _component_search_input = resolveComponent("search-input");
  const _component_Link = resolveComponent("Link");
  const _component_pagination = resolveComponent("pagination");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))} data-v-2713c382>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    onFClear: ($event) => $options.reset(),
    filters: $props.filters,
    view: "time_logs"
  }, null, _parent));
  if ($data.open_filter) {
    _push(ssrRenderComponent(_component_board_filter, {
      project: $props.project,
      onBoardFilter: ($event) => $data.open_filter = false,
      filters: $props.filters,
      onDoFilter: $options.doFilter,
      options: "user"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white" data-v-2713c382><div class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden" data-v-2713c382><div class="time-logs-header border-b border-gray-200/60 bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden" data-v-2713c382><div class="absolute inset-0 opacity-5" data-v-2713c382><div class="absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)", "background-size": "20px 20px" })}" data-v-2713c382></div></div><div class="relative px-6 py-6" data-v-2713c382><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-v-2713c382><div class="flex flex-col lg:flex-row lg:items-center gap-6" data-v-2713c382><div class="flex items-center space-x-4" data-v-2713c382><div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "clock",
    class: "w-6 h-6 text-white"
  }, null, _parent));
  _push(`</div><div data-v-2713c382><h2 class="text-3xl font-bold text-gray-900 tracking-tight" data-v-2713c382>Time Logs</h2><p class="text-sm text-gray-500 mt-1 font-medium" data-v-2713c382>Track and manage time spent on tasks</p></div></div><div class="flex flex-col sm:flex-row gap-4" data-v-2713c382>`);
  if ($props.total_duration) {
    _push(`<div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-v-2713c382><div class="flex items-center" data-v-2713c382><div class="p-2 bg-white/20 rounded-xl mr-3" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "clock",
      class: "w-5 h-5"
    }, null, _parent));
    _push(`</div><div data-v-2713c382><p class="text-xs opacity-90 font-medium uppercase tracking-wide" data-v-2713c382>Total Duration</p><p class="text-lg font-bold" data-v-2713c382>${ssrInterpolate($options.formatDuration($props.total_duration, "minutes"))}</p></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-v-2713c382><div class="flex items-center" data-v-2713c382><div class="p-2 bg-white/20 rounded-xl mr-3" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "list",
    class: "w-5 h-5"
  }, null, _parent));
  _push(`</div><div data-v-2713c382><p class="text-xs opacity-90 font-medium uppercase tracking-wide" data-v-2713c382>Total Logs</p><p class="text-lg font-bold" data-v-2713c382>${ssrInterpolate($props.time_logs.total || $props.time_logs.data.length)}</p></div></div></div></div></div><div class="flex flex-col sm:flex-row items-center gap-4" data-v-2713c382><div class="relative" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_search_input, {
    modelValue: $data.form.search,
    "onUpdate:modelValue": ($event) => $data.form.search = $event,
    class: "w-full sm:w-80",
    onReset: $options.reset,
    placeholder: "Search time logs..."
  }, null, _parent));
  _push(`</div><div class="flex items-center space-x-3" data-v-2713c382><button class="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200/60 transition-all duration-200 shadow-sm hover:shadow-md" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "filter",
    class: "w-4 h-4 mr-2"
  }, null, _parent));
  _push(` Filter </button><button class="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "download",
    class: "w-4 h-4 mr-2"
  }, null, _parent));
  _push(` Export </button></div></div></div></div></div><div class="time-logs-content flex-1 overflow-hidden" data-v-2713c382><div class="h-full" data-v-2713c382><div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60 xl:hidden backdrop-blur-sm" data-v-2713c382><div class="flex items-center text-xs text-gray-600 font-medium" data-v-2713c382><div class="p-1.5 bg-indigo-100 rounded-lg mr-3" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "info",
    class: "w-3 h-3 text-indigo-600"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline" data-v-2713c382>Scroll horizontally to view all columns</span><span class="sm:hidden" data-v-2713c382>Swipe to view all columns</span></div><div class="flex items-center space-x-2" data-v-2713c382><button${ssrIncludeBooleanAttr(!$data.canScrollLeft) ? " disabled" : ""} class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "arrow-left",
    class: "w-4 h-4 text-gray-600"
  }, null, _parent));
  _push(`</button><button${ssrIncludeBooleanAttr(!$data.canScrollRight) ? " disabled" : ""} class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "arrow-right",
    class: "w-4 h-4 text-gray-600"
  }, null, _parent));
  _push(`</button><button class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md" title="Scroll to beginning" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "arrow-left-double",
    class: "w-4 h-4 text-gray-600"
  }, null, _parent));
  _push(`</button><button class="p-2 rounded-xl hover:bg-white transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md" title="Scroll to end" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "arrow-right-double",
    class: "w-4 h-4 text-gray-600"
  }, null, _parent));
  _push(`</button></div></div><div class="overflow-x-auto h-full scroll-smooth xl:overflow-x-visible" data-v-2713c382><table class="min-w-full divide-y divide-gray-200/60 responsive-table" data-v-2713c382><thead class="bg-gradient-to-r from-gray-50/80 to-gray-100/80 sticky top-0 backdrop-blur-sm" data-v-2713c382><tr data-v-2713c382><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider task-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-indigo-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-indigo-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "task",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Task</span><span class="sm:hidden font-semibold" data-v-2713c382>Task</span></div></th><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider member-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-blue-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-blue-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "user",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Member</span><span class="sm:hidden font-semibold" data-v-2713c382>User</span></div></th><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider started-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-green-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-green-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "play",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Started</span><span class="sm:hidden font-semibold" data-v-2713c382>Start</span></div></th><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider stopped-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-red-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-red-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "stop",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Stopped</span><span class="sm:hidden font-semibold" data-v-2713c382>End</span></div></th><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider duration-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-purple-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-purple-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "clock",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Duration</span><span class="sm:hidden font-semibold" data-v-2713c382>Time</span></div></th><th class="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider memo-column" data-v-2713c382><div class="flex items-center group" data-v-2713c382><div class="p-1.5 bg-yellow-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-yellow-200 transition-colors" data-v-2713c382>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "note",
    class: "w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0"
  }, null, _parent));
  _push(`</div><span class="hidden sm:inline font-semibold" data-v-2713c382>Memo</span><span class="sm:hidden font-semibold" data-v-2713c382>Note</span></div></th></tr></thead><tbody class="bg-white divide-y divide-gray-200/60" data-v-2713c382><!--[-->`);
  ssrRenderList($props.time_logs.data, (log) => {
    _push(`<tr class="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 focus-within:bg-gray-50 transition-all duration-200 group" data-v-2713c382><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 task-column" data-v-2713c382><button class="group flex items-center text-xs sm:text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-150" data-v-2713c382><div class="flex-1 min-w-0" data-v-2713c382><p class="truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none text-left" data-v-2713c382>${ssrInterpolate(log.task.title)}</p>`);
    if (log.task.description) {
      _push(`<p class="text-xs text-gray-500 truncate mt-1 max-w-[120px] sm:max-w-[200px] lg:max-w-none hidden sm:block" data-v-2713c382>${ssrInterpolate(log.task.description)}</p>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "external-link",
      class: "w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
    }, null, _parent));
    _push(`</button></td><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 member-column" data-v-2713c382><div class="flex items-center" data-v-2713c382><div class="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8" data-v-2713c382><img class="h-6 w-6 sm:h-8 sm:w-8 rounded-full border border-white shadow-sm"${ssrRenderAttr("src", log.user.photo_path)}${ssrRenderAttr("alt", log.user.name)} data-v-2713c382></div><div class="ml-2 sm:ml-3 min-w-0" data-v-2713c382><p class="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none" data-v-2713c382>${ssrInterpolate(log.user.name)}</p><p class="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none hidden sm:block" data-v-2713c382>${ssrInterpolate(log.user.email)}</p></div></div></td><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 started-column" data-v-2713c382><div class="text-xs sm:text-sm text-gray-900" data-v-2713c382><div class="font-medium hidden sm:block" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.started_at).format("MMM D, YYYY"))}</div><div class="font-medium sm:hidden" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.started_at).format("MMM D"))}</div><div class="text-gray-500" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.started_at).format("h:mm a"))}</div></div></td><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 stopped-column" data-v-2713c382><div class="text-xs sm:text-sm text-gray-900" data-v-2713c382><div class="font-medium hidden sm:block" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.stopped_at).format("MMM D, YYYY"))}</div><div class="font-medium sm:hidden" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.stopped_at).format("MMM D"))}</div><div class="text-gray-500" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.stopped_at).format("h:mm a"))}</div></div></td><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 duration-column" data-v-2713c382><div class="flex items-center" data-v-2713c382><div class="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105" data-v-2713c382><div class="flex items-center" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "clock",
      class: "w-3 h-3 mr-1"
    }, null, _parent));
    _push(` ${ssrInterpolate($options.formatDuration(log.duration, "minutes"))}</div></div></div></td><td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 memo-column" data-v-2713c382><div class="text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-[150px] lg:max-w-xs" data-v-2713c382>`);
    if (log.title) {
      _push(`<p class="truncate" data-v-2713c382>${ssrInterpolate(log.title)}</p>`);
    } else {
      _push(`<p class="text-gray-400 italic sm:hidden" data-v-2713c382>-</p>`);
    }
    _push(`</div></td></tr>`);
  });
  _push(`<!--]-->`);
  if ($props.time_logs.data.length === 0) {
    _push(`<tr data-v-2713c382><td colspan="6" class="px-6 py-12 text-center" data-v-2713c382><div class="flex flex-col items-center" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "clock",
      class: "w-12 h-12 text-gray-400 mb-4"
    }, null, _parent));
    _push(`<h3 class="text-lg font-medium text-gray-900 mb-2" data-v-2713c382>No time logs found</h3><p class="text-gray-500" data-v-2713c382>Start tracking time on your tasks to see logs here.</p></div></td></tr>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</tbody></table></div></div><div class="lg:hidden h-full overflow-y-auto" data-v-2713c382><div class="p-4 space-y-4" data-v-2713c382><!--[-->`);
  ssrRenderList($props.time_logs.data, (log) => {
    _push(`<div class="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" data-v-2713c382><div class="flex items-start justify-between mb-3" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_Link, {
      href: this.route("projects.board.with.task", { projectUid: $props.project.slug || $props.project.id, taskUid: log.task.slug || log.task.id }),
      class: "flex-1 min-w-0 group"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h3 class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate" data-v-2713c382${_scopeId}>${ssrInterpolate(log.task.title)}</h3>`);
          if (log.task.description) {
            _push2(`<p class="text-xs text-gray-500 mt-1 line-clamp-2" data-v-2713c382${_scopeId}>${ssrInterpolate(log.task.description)}</p>`);
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            createVNode("h3", { class: "text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate" }, toDisplayString(log.task.title), 1),
            log.task.description ? (openBlock(), createBlock("p", {
              key: 0,
              class: "text-xs text-gray-500 mt-1 line-clamp-2"
            }, toDisplayString(log.task.description), 1)) : createCommentVNode("", true)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`<div class="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ml-2 flex-shrink-0" data-v-2713c382><div class="flex items-center" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "clock",
      class: "w-3 h-3 mr-1"
    }, null, _parent));
    _push(` ${ssrInterpolate($options.formatDuration(log.duration, "seconds"))}</div></div></div><div class="flex items-center mb-3" data-v-2713c382><img class="h-6 w-6 rounded-full border border-white shadow-sm"${ssrRenderAttr("src", log.user.photo_path)}${ssrRenderAttr("alt", log.user.name)} data-v-2713c382><span class="ml-2 text-sm font-medium text-gray-900" data-v-2713c382>${ssrInterpolate(log.user.name)}</span></div><div class="grid grid-cols-2 gap-4 mb-3" data-v-2713c382><div data-v-2713c382><p class="text-xs text-gray-500 uppercase tracking-wide" data-v-2713c382>Started</p><p class="text-sm font-medium text-gray-900" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.started_at).format("MMM D, h:mm a"))}</p></div><div data-v-2713c382><p class="text-xs text-gray-500 uppercase tracking-wide" data-v-2713c382>Stopped</p><p class="text-sm font-medium text-gray-900" data-v-2713c382>${ssrInterpolate(_ctx.moment(log.stopped_at).format("MMM D, h:mm a"))}</p></div></div>`);
    if (log.title) {
      _push(`<div class="border-t border-gray-100 pt-3" data-v-2713c382><p class="text-xs text-gray-500 uppercase tracking-wide mb-1" data-v-2713c382>Memo</p><p class="text-sm text-gray-900" data-v-2713c382>${ssrInterpolate(log.title)}</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  });
  _push(`<!--]-->`);
  if ($props.time_logs.data.length === 0) {
    _push(`<div class="text-center py-12" data-v-2713c382>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "clock",
      class: "w-12 h-12 text-gray-400 mx-auto mb-4"
    }, null, _parent));
    _push(`<h3 class="text-lg font-medium text-gray-900 mb-2" data-v-2713c382>No time logs found</h3><p class="text-gray-500" data-v-2713c382>Start tracking time on your tasks to see logs here.</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
  if ($props.time_logs.data.length > 0) {
    _push(`<div class="border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 px-6 py-5 backdrop-blur-sm" data-v-2713c382><div class="flex items-center justify-between" data-v-2713c382><div class="text-sm text-gray-600 font-medium" data-v-2713c382> Showing ${ssrInterpolate($props.time_logs.from || 0)} to ${ssrInterpolate($props.time_logs.to || 0)} of ${ssrInterpolate($props.time_logs.total || $props.time_logs.data.length)} results </div>`);
    _push(ssrRenderComponent(_component_pagination, {
      links: $props.time_logs.links
    }, null, _parent));
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: (_a = $data.selected_task) == null ? void 0 : _a.id,
      view: "timeline",
      isPopup: true,
      onCloseModal: ($event) => $options.closeDetails()
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Timer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Timer = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-2713c382"]]);
export {
  Timer as default
};
