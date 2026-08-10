import { I as Icon, L as Layout } from "./Layout-DXJEf-iu.js";
import { Link, Head } from "@inertiajs/vue3";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import moment_timezone from "moment-timezone";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./BoardFilter-BGdXhQL5.js";
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
const _sfc_main = {
  metaInfo: { title: "Gantt Chart" },
  layout: Layout,
  components: {
    Head,
    Link,
    BoardViewMenu,
    Icon,
    TaskDetails
  },
  props: {
    title: String,
    project: Object,
    tasks: Array,
    filters: Object
  },
  data() {
    return {
      ganttReady: false,
      open_filter: false,
      currentView: "month",
      selectedDate: /* @__PURE__ */ new Date(),
      currentDate: /* @__PURE__ */ new Date(),
      availableViews: [
        { key: "month", label: "Month", icon: "calendar", description: "Monthly Gantt view" },
        { key: "week", label: "Week", icon: "calendar-week", description: "Weekly Gantt view" },
        { key: "day", label: "Day", icon: "calendar-day", description: "Daily Gantt view" }
      ],
      form: {
        range: { start: "", end: "" },
        period: "gantt",
        task: null
      },
      moment: null,
      // Gantt chart specific data
      zoomLevel: 100,
      dayWidth: 30,
      timelineOffset: 0,
      selectedTask: null,
      showDependencies: true,
      // Task details popup properties
      taskDetailsOpen: false,
      taskDetailsId: null,
      td_pop: true
    };
  },
  computed: {
    currentPeriodTitle() {
      switch (this.currentView) {
        case "month":
          return this.moment(this.currentDate).format("MMMM YYYY");
        case "week":
          const weekStart = this.moment(this.selectedDate).startOf("week");
          const weekEnd = this.moment(this.selectedDate).endOf("week");
          return `${weekStart.format("MMM D")} - ${weekEnd.format("MMM D, YYYY")}`;
        case "day":
          return this.moment(this.selectedDate).format("dddd, MMMM Do, YYYY");
        default:
          return this.moment(this.currentDate).format("MMMM YYYY");
      }
    },
    sortedTasks() {
      return [...this.tasks].sort((a, b) => {
        const aStart = this.moment(a.start_date || a.created_at);
        const bStart = this.moment(b.start_date || b.created_at);
        return aStart.diff(bStart);
      });
    },
    timelineDates() {
      const dates = [];
      const startDate = this.getTimelineStartDate();
      const endDate = this.getTimelineEndDate();
      let current = this.moment(startDate);
      while (current.isSameOrBefore(endDate, "day")) {
        dates.push(current.toDate());
        current.add(1, "day");
      }
      return dates;
    },
    totalTimelineWidth() {
      return this.timelineDates.length * this.dayWidth;
    },
    todayPosition() {
      const today = this.moment();
      const startDate = this.getTimelineStartDate();
      const daysDiff = today.diff(startDate, "days");
      return daysDiff * this.dayWidth;
    },
    taskDependencies() {
      const dependencies = [];
      this.sortedTasks.forEach((task, taskIndex) => {
        if (task.dependencies && task.dependencies.length > 0) {
          task.dependencies.forEach((depId) => {
            const depTaskIndex = this.sortedTasks.findIndex((t) => t.id === depId);
            if (depTaskIndex >= 0) {
              const fromTask = this.sortedTasks[depTaskIndex];
              const toTask = task;
              const fromX = this.getTaskStartPosition(fromTask) + this.getTaskWidth(fromTask);
              const fromY = depTaskIndex * 70 + 35;
              const toX = this.getTaskStartPosition(toTask);
              const toY = taskIndex * 70 + 35;
              dependencies.push({
                from: fromTask.id,
                to: toTask.id,
                x1: fromX,
                y1: fromY,
                x2: toX,
                y2: toY
              });
            }
          });
        }
      });
      return dependencies;
    },
    completedTasksCount() {
      return this.sortedTasks.filter((task) => task.is_done).length;
    }
  },
  methods: {
    changeView(view) {
      this.currentView = view;
      this.updateFormRange();
      this.adjustDayWidth();
    },
    navigatePeriod(direction) {
      switch (this.currentView) {
        case "month":
          this.currentDate = this.moment(this.currentDate).add(direction, "month").toDate();
          break;
        case "week":
          this.selectedDate = this.moment(this.selectedDate).add(direction, "week").toDate();
          break;
        case "day":
          this.selectedDate = this.moment(this.selectedDate).add(direction, "day").toDate();
          break;
      }
      this.updateFormRange();
    },
    goToToday() {
      this.selectedDate = /* @__PURE__ */ new Date();
      this.currentDate = /* @__PURE__ */ new Date();
      this.updateFormRange();
    },
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 25, 300);
      this.dayWidth = Math.min(this.dayWidth + 5, 60);
    },
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 25, 50);
      this.dayWidth = Math.max(this.dayWidth - 5, 15);
    },
    adjustDayWidth() {
      switch (this.currentView) {
        case "day":
          this.dayWidth = 60;
          this.zoomLevel = 200;
          break;
        case "week":
          this.dayWidth = 40;
          this.zoomLevel = 133;
          break;
        case "month":
        default:
          this.dayWidth = 30;
          this.zoomLevel = 100;
          break;
      }
    },
    getTimelineStartDate() {
      switch (this.currentView) {
        case "month":
          return this.moment(this.currentDate).startOf("month").subtract(7, "days");
        case "week":
          return this.moment(this.selectedDate).startOf("week").subtract(3, "days");
        case "day":
          return this.moment(this.selectedDate).subtract(7, "days");
        default:
          return this.moment(this.currentDate).startOf("month");
      }
    },
    getTimelineEndDate() {
      switch (this.currentView) {
        case "month":
          return this.moment(this.currentDate).endOf("month").add(7, "days");
        case "week":
          return this.moment(this.selectedDate).endOf("week").add(3, "days");
        case "day":
          return this.moment(this.selectedDate).add(7, "days");
        default:
          return this.moment(this.currentDate).endOf("month");
      }
    },
    getTaskStartPosition(task) {
      const taskStart = this.moment(task.start_date || task.created_at);
      const timelineStart = this.getTimelineStartDate();
      const daysDiff = taskStart.diff(timelineStart, "days");
      return Math.max(0, daysDiff * this.dayWidth);
    },
    getTaskWidth(task) {
      const duration = task.duration_days || 1;
      return Math.max(duration * this.dayWidth, 20);
    },
    getTaskBarClass(task) {
      if (task.is_done) {
        return "bg-green-500 border-green-600";
      }
      if (this.isOverdue(task)) {
        return "bg-red-500 border-red-600";
      }
      if (this.isHighPriority(task)) {
        return "bg-orange-500 border-orange-600";
      }
      return "bg-blue-500 border-blue-600";
    },
    getTaskTooltip(task) {
      let tooltip = `${task.title}
`;
      tooltip += `Duration: ${task.duration_days || 1} days
`;
      if (task.start_date) {
        tooltip += `Start: ${this.moment(task.start_date).format("MMM D, YYYY")}
`;
      }
      if (task.end_date) {
        tooltip += `End: ${this.moment(task.end_date).format("MMM D, YYYY")}
`;
      }
      if (task.progress_percentage > 0) {
        tooltip += `Progress: ${task.progress_percentage}%
`;
      }
      if (task.assignees && task.assignees.length) {
        tooltip += `Assigned to: ${task.assignees.map((a) => a.user.name).join(", ")}`;
      }
      return tooltip;
    },
    selectTask(task) {
      this.selectedTask = task;
    },
    isOverdue(task) {
      if (!task.end_date) return false;
      return this.moment(task.end_date).isBefore(this.moment()) && !task.is_done;
    },
    isHighPriority(task) {
      return task.taskLabels && task.taskLabels.some((label) => label.label.name.toLowerCase().includes("high"));
    },
    formatDateHeader(date) {
      switch (this.currentView) {
        case "day":
          return this.moment(date).format("HH:mm");
        case "week":
          return this.moment(date).format("ddd D");
        case "month":
        default:
          return this.moment(date).format("D");
      }
    },
    formatWeekday(date) {
      return this.moment(date).format("ddd");
    },
    isWeekend(date) {
      const day = this.moment(date).day();
      return day === 0 || day === 6;
    },
    isToday(date) {
      return this.moment(date).isSame(this.moment(), "day");
    },
    isMilestone(task) {
      return task.duration_days === 0 || task.taskLabels && task.taskLabels.some(
        (label) => label.label.name.toLowerCase().includes("milestone")
      );
    },
    getTaskStatusColor(task) {
      if (task.is_done) {
        return "bg-gradient-to-b from-emerald-500 to-green-600";
      }
      if (this.isOverdue(task)) {
        return "bg-gradient-to-b from-red-500 to-red-600";
      }
      if (this.isHighPriority(task)) {
        return "bg-gradient-to-b from-orange-500 to-amber-600";
      }
      return "bg-gradient-to-b from-indigo-500 to-blue-600";
    },
    updateFormRange() {
      let start, end;
      switch (this.currentView) {
        case "month":
          start = this.moment(this.currentDate).startOf("month");
          end = this.moment(this.currentDate).endOf("month");
          break;
        case "week":
          start = this.moment(this.selectedDate).startOf("week");
          end = this.moment(this.selectedDate).endOf("week");
          break;
        case "day":
          start = this.moment(this.selectedDate).startOf("day");
          end = this.moment(this.selectedDate).endOf("day");
          break;
        default:
          start = this.moment(this.currentDate).startOf("month");
          end = this.moment(this.currentDate).endOf("month");
      }
      this.form.range = {
        start: start.format("YYYY-MM-DD"),
        end: end.format("YYYY-MM-DD")
      };
      this.form.period = "gantt";
    },
    openTask(task) {
      this.taskDetailsPopup(task.id);
    },
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
    initializeGantt() {
      this.updateFormRange();
      this.adjustDayWidth();
      this.ganttReady = true;
    }
  },
  mounted() {
    this.initializeGantt();
  },
  created() {
    this.moment = moment_timezone;
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_icon = resolveComponent("icon");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))} data-v-bf482995>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-bf482995>`);
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    filters: $props.filters,
    view: "timeline"
  }, null, _parent));
  _push(`<div class="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" data-v-bf482995>`);
  if ($data.ganttReady) {
    _push(`<div class="flex-1 flex flex-col m-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden" data-v-bf482995><div class="gantt-header border-b border-gray-200/40 bg-gradient-to-r from-white via-indigo-50/50 to-white backdrop-blur-sm" data-v-bf482995><div class="px-8 py-6" data-v-bf482995><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-v-bf482995><div class="flex items-center justify-center lg:justify-start" data-v-bf482995><div class="flex items-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-1.5" data-v-bf482995><button class="p-3.5 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-left",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button><div class="px-8 text-center min-w-[240px]" data-v-bf482995><h2 class="text-2xl font-bold text-gray-900 tracking-tight" data-v-bf482995>${ssrInterpolate($options.currentPeriodTitle)}</h2><p class="text-sm text-indigo-600 mt-1 font-medium flex items-center justify-center" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "chart-bar",
      class: "w-4 h-4 mr-1.5"
    }, null, _parent));
    _push(` Gantt Chart View </p></div><button class="p-3.5 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-right",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button></div></div><div class="flex flex-col sm:flex-row items-center gap-4" data-v-bf482995><div class="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30" data-v-bf482995><!--[-->`);
    ssrRenderList($data.availableViews, (view) => {
      _push(`<button class="${ssrRenderClass([
        "flex items-center px-5 py-3 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
        $data.currentView === view.key ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200/50" : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
      ])}"${ssrRenderAttr("title", view.description)} data-v-bf482995>`);
      _push(ssrRenderComponent(_component_icon, {
        name: view.icon,
        class: "w-4 h-4 mr-2"
      }, null, _parent));
      _push(` ${ssrInterpolate(view.label)}</button>`);
    });
    _push(`<!--]--></div><button class="flex items-center px-5 py-3 text-sm font-medium text-gray-600 hover:text-white bg-white/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 rounded-xl border border-white/30 shadow-lg transition-all duration-300 backdrop-blur-sm" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "calendar-today",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` Today </button><div class="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30" data-v-bf482995><button class="p-2.5 hover:bg-indigo-50 rounded-lg transition-all duration-200" title="Zoom Out" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "minus",
      class: "w-4 h-4 text-gray-600"
    }, null, _parent));
    _push(`</button><span class="px-4 py-2 text-sm font-medium text-gray-600" data-v-bf482995>${ssrInterpolate($data.zoomLevel)}%</span><button class="p-2.5 hover:bg-indigo-50 rounded-lg transition-all duration-200" title="Zoom In" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "plus",
      class: "w-4 h-4 text-gray-600"
    }, null, _parent));
    _push(`</button></div><button class="${ssrRenderClass([
      "flex items-center px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-300",
      $data.showDependencies ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-200/50" : "text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white/90 border-white/30 shadow-lg backdrop-blur-sm"
    ])}" title="Toggle Dependencies" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "link",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` Dependencies </button></div></div></div></div><div class="gantt-content flex-1 overflow-hidden" data-v-bf482995><div class="gantt-container h-full flex" data-v-bf482995><div class="task-list-panel w-80 border-r border-gray-200/40 bg-gradient-to-b from-white/90 to-gray-50/50 backdrop-blur-sm flex flex-col" data-v-bf482995><div class="task-list-header p-5 border-b border-gray-200/40 bg-gradient-to-r from-white to-indigo-50/30" data-v-bf482995><div class="flex items-center justify-between" data-v-bf482995><h3 class="font-bold text-gray-900 flex items-center" data-v-bf482995>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "list-bullet",
      class: "w-5 h-5 mr-2 text-indigo-600"
    }, null, _parent));
    _push(` Tasks (${ssrInterpolate($options.sortedTasks.length)}) </h3><div class="flex items-center space-x-2" data-v-bf482995><div class="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full" data-v-bf482995>${ssrInterpolate($options.completedTasksCount)} completed </div></div></div></div><div class="task-list-content flex-1 overflow-y-auto" data-v-bf482995><!--[-->`);
    ssrRenderList($options.sortedTasks, (task, index) => {
      var _a, _b;
      _push(`<div class="${ssrRenderClass([{
        "bg-gradient-to-r from-indigo-100/80 to-blue-100/60 border-indigo-200/50 shadow-sm": ((_a = $data.selectedTask) == null ? void 0 : _a.id) === task.id,
        "hover:shadow-md": ((_b = $data.selectedTask) == null ? void 0 : _b.id) !== task.id
      }, "task-row group p-4 border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/30 transition-all duration-300 cursor-pointer relative"])}" data-v-bf482995><div class="${ssrRenderClass([$options.getTaskStatusColor(task), "absolute left-0 top-0 bottom-0 w-1 rounded-r-full"])}" data-v-bf482995></div><div class="flex items-start justify-between" data-v-bf482995><div class="flex-1 min-w-0 pl-2" data-v-bf482995><div class="flex items-center space-x-2 mb-2" data-v-bf482995><h4 class="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors" data-v-bf482995>${ssrInterpolate(task.title)}</h4>`);
      if (task.is_done) {
        _push(`<div class="text-emerald-500" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "check-circle",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center space-x-2 mb-2" data-v-bf482995>`);
      if (task.list) {
        _push(`<span class="text-xs text-indigo-600 bg-indigo-100/60 px-2 py-1 rounded-full font-medium" data-v-bf482995>${ssrInterpolate(task.list.title)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (task.duration_days) {
        _push(`<span class="text-xs text-gray-600 bg-gray-100/60 px-2 py-1 rounded-full" data-v-bf482995>${ssrInterpolate(task.duration_days)}d </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (task.progress_percentage > 0) {
        _push(`<div class="mb-2" data-v-bf482995><div class="flex items-center justify-between text-xs text-gray-500 mb-1" data-v-bf482995><span data-v-bf482995>Progress</span><span data-v-bf482995>${ssrInterpolate(task.progress_percentage)}%</span></div><div class="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden" data-v-bf482995><div class="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${task.progress_percentage}%` })}" data-v-bf482995></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (task.assignees && task.assignees.length) {
        _push(`<div class="flex items-center space-x-1" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "user",
          class: "w-3 h-3 text-gray-400"
        }, null, _parent));
        _push(`<span class="text-xs text-gray-500" data-v-bf482995>${ssrInterpolate(task.assignees.length)} assignee(s)</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-col items-end space-y-1 ml-3" data-v-bf482995>`);
      if ($options.isHighPriority(task)) {
        _push(`<div class="text-orange-500" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "exclamation-triangle",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.isOverdue(task)) {
        _push(`<div class="text-red-500" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "clock",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    });
    _push(`<!--]--></div></div><div class="timeline-panel flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-white/95 to-gray-50/30" data-v-bf482995><div class="timeline-header bg-gradient-to-r from-white via-indigo-50/30 to-white border-b border-gray-200/40 backdrop-blur-sm" data-v-bf482995><div class="timeline-header-content h-16 flex items-center" style="${ssrRenderStyle({ transform: `translateX(${$data.timelineOffset}px)` })}" data-v-bf482995><!--[-->`);
    ssrRenderList($options.timelineDates, (date, index) => {
      _push(`<div class="timeline-date-cell flex-shrink-0 border-r border-gray-200/40 text-center relative" style="${ssrRenderStyle({ width: `${$data.dayWidth}px` })}" data-v-bf482995>`);
      if ($options.isWeekend(date)) {
        _push(`<div class="absolute inset-0 bg-orange-50/50" data-v-bf482995></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative z-10" data-v-bf482995><div class="text-xs font-semibold text-gray-700 py-1" data-v-bf482995>${ssrInterpolate($options.formatDateHeader(date))}</div>`);
      if ($data.currentView === "month") {
        _push(`<div class="text-xs text-gray-500" data-v-bf482995>${ssrInterpolate($options.formatWeekday(date))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if ($options.isToday(date)) {
        _push(`<div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1" data-v-bf482995></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    });
    _push(`<!--]--></div></div><div class="timeline-content flex-1 overflow-auto bg-gradient-to-b from-white/50 to-transparent" data-v-bf482995><div class="timeline-grid relative" style="${ssrRenderStyle({ width: `${$options.totalTimelineWidth}px`, height: `${$options.sortedTasks.length * 70 + 20}px` })}" data-v-bf482995><!--[-->`);
    ssrRenderList($options.timelineDates, (date, index) => {
      _push(`<div class="${ssrRenderClass([$options.isWeekend(date) ? "border-orange-200/40" : "border-gray-200/30", "absolute top-0 bottom-0 border-r transition-colors"])}" style="${ssrRenderStyle({ left: `${index * $data.dayWidth}px` })}" data-v-bf482995></div>`);
    });
    _push(`<!--]-->`);
    if ($options.isWeekend(_ctx.date)) {
      _push(`<!--[-->`);
      ssrRenderList($options.timelineDates, (date, index) => {
        _push(`<div class="absolute top-0 bottom-0 bg-orange-50/20" style="${ssrRenderStyle({ left: `${index * $data.dayWidth}px`, width: `${$data.dayWidth}px` })}" data-v-bf482995></div>`);
      });
      _push(`<!--]-->`);
    } else {
      _push(`<!---->`);
    }
    if ($options.todayPosition >= 0) {
      _push(`<div class="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 z-20 shadow-lg" style="${ssrRenderStyle({ left: `${$options.todayPosition}px` })}" data-v-bf482995><div class="absolute -top-2 -left-1 w-3 h-3 bg-red-500 rounded-full shadow-md" data-v-bf482995></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.sortedTasks, (task, index) => {
      _push(`<div class="absolute group" style="${ssrRenderStyle({ top: `${index * 70 + 15}px`, left: `${$options.getTaskStartPosition(task)}px` })}" data-v-bf482995><div class="task-bar-container relative" style="${ssrRenderStyle({ width: `${$options.getTaskWidth(task)}px` })}" data-v-bf482995><div class="${ssrRenderClass([$options.getTaskBarClass(task), "task-bar h-10 rounded-xl border-l-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"])}"${ssrRenderAttr("title", $options.getTaskTooltip(task))} data-v-bf482995><div class="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12" data-v-bf482995></div><div class="relative z-10 flex items-center h-full px-4" data-v-bf482995><div class="flex-1 min-w-0" data-v-bf482995><div class="text-xs font-semibold text-white truncate drop-shadow-sm" data-v-bf482995>${ssrInterpolate(task.title)}</div></div>`);
      if (task.progress_percentage > 0) {
        _push(`<div class="ml-3 text-xs text-white/90 font-medium" data-v-bf482995>${ssrInterpolate(task.progress_percentage)}% </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (task.progress_percentage > 0) {
        _push(`<div class="absolute top-0 left-0 h-full bg-white/25 rounded-xl transition-all duration-500" style="${ssrRenderStyle({ width: `${task.progress_percentage}%` })}" data-v-bf482995><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" data-v-bf482995></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="absolute top-1 right-1 flex space-x-1" data-v-bf482995>`);
      if (task.is_done) {
        _push(`<div class="text-white/90" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "check-circle",
          class: "w-3 h-3"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.isOverdue(task)) {
        _push(`<div class="text-white/90" data-v-bf482995>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "exclamation-triangle",
          class: "w-3 h-3"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if ($options.isMilestone(task)) {
        _push(`<div class="absolute -top-2 left-1/2 transform -translate-x-1/2" data-v-bf482995><div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white shadow-lg" data-v-bf482995></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.getTaskWidth(task) > 60) {
        _push(`<div class="absolute -bottom-5 left-0 text-xs text-gray-500 font-medium" data-v-bf482995>${ssrInterpolate(task.duration_days || 1)}d </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    });
    _push(`<!--]-->`);
    if ($data.showDependencies) {
      _push(`<svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style="${ssrRenderStyle({ width: `${$options.totalTimelineWidth}px`, height: `${$options.sortedTasks.length * 70 + 20}px` })}" data-v-bf482995><defs data-v-bf482995><marker id="arrowhead" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto" data-v-bf482995><polygon points="0 0, 12 4, 0 8" fill="#8b5cf6" data-v-bf482995></polygon></marker><linearGradient id="dependencyGradient" x1="0%" y1="0%" x2="100%" y2="0%" data-v-bf482995><stop offset="0%" style="${ssrRenderStyle({ "stop-color": "#8b5cf6", "stop-opacity": "0.8" })}" data-v-bf482995></stop><stop offset="100%" style="${ssrRenderStyle({ "stop-color": "#a855f7", "stop-opacity": "0.6" })}" data-v-bf482995></stop></linearGradient></defs><!--[-->`);
      ssrRenderList($options.taskDependencies, (dependency) => {
        _push(`<line${ssrRenderAttr("x1", dependency.x1)}${ssrRenderAttr("y1", dependency.y1)}${ssrRenderAttr("x2", dependency.x2)}${ssrRenderAttr("y2", dependency.y2)} stroke="url(#dependencyGradient)" stroke-width="3" marker-end="url(#arrowhead)" stroke-dasharray="8,4" opacity="0.8" data-v-bf482995></line>`);
      });
      _push(`<!--]--></svg>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div></div></div></div>`);
  } else {
    _push(`<div class="flex-1 flex items-center justify-center" data-v-bf482995><div class="text-center" data-v-bf482995><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" data-v-bf482995></div><p class="text-gray-600" data-v-bf482995>Loading Gantt chart...</p></div></div>`);
  }
  _push(`</div></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      "task-id": $data.taskDetailsId,
      project: $props.project,
      onClose: $options.closeDetails
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/GanttChart.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const GanttChart = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-bf482995"]]);
export {
  GanttChart as default
};
