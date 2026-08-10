import { I as Icon, L as Layout } from "./Layout-DXJEf-iu.js";
import { Link, Head } from "@inertiajs/vue3";
import { W as WorkspaceViewMenu } from "./WorkspaceViewMenu-BWBCrjkx.js";
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
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
const _sfc_main = {
  metaInfo: { title: "Timeline" },
  layout: Layout,
  components: {
    Head,
    Link,
    WorkspaceViewMenu,
    Icon,
    TaskDetails
  },
  props: {
    title: String,
    workspace: Object,
    tasks: Array,
    filters: Object
  },
  data() {
    return {
      timelineReady: false,
      open_filter: false,
      currentView: "month",
      selectedDate: /* @__PURE__ */ new Date(),
      currentDate: /* @__PURE__ */ new Date(),
      availableViews: [
        { key: "month", label: "Month", icon: "calendar", description: "Monthly timeline view" },
        { key: "week", label: "Week", icon: "calendar-week", description: "Weekly timeline view" },
        { key: "day", label: "Day", icon: "calendar-day", description: "Daily timeline view" }
      ],
      moment: null,
      // Task details popup properties
      taskDetailsOpen: false,
      taskDetailsId: null,
      td_pop: true,
      // Form object for filters and task details
      form: {
        range: { start: "", end: "" },
        period: "timeline",
        task: null
      }
    };
  },
  computed: {
    currentPeriodTitle() {
      switch (this.currentView) {
        case "year":
          return this.moment(this.currentDate).format("YYYY");
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
    currentPeriodSubtitle() {
      switch (this.currentView) {
        case "year":
          return "Yearly timeline view";
        case "month":
          return "Monthly timeline view";
        case "week":
          return "Weekly timeline view";
        case "day":
          return "Daily timeline view";
        default:
          return "Timeline view";
      }
    },
    monthsInView() {
      const months = [];
      const startDate = this.moment(this.currentDate).startOf("month");
      const endDate = this.moment(this.currentDate).endOf("month");
      let current = this.moment(startDate);
      while (current.isSameOrBefore(endDate, "month")) {
        months.push({
          month: current.month(),
          year: current.year(),
          name: current.format("MMMM")
        });
        current.add(1, "month");
      }
      return months;
    },
    weeksInView() {
      const weeks = [];
      const startDate = this.moment(this.selectedDate).startOf("week");
      const endDate = this.moment(this.selectedDate).endOf("week");
      let current = this.moment(startDate);
      while (current.isSameOrBefore(endDate, "week")) {
        weeks.push({
          start: current.toDate(),
          end: this.moment(current).endOf("week").toDate()
        });
        current.add(1, "week");
      }
      return weeks;
    }
  },
  methods: {
    changeView(view) {
      this.currentView = view;
      this.updateFormRange();
    },
    navigatePeriod(direction) {
      switch (this.currentView) {
        case "year":
          this.currentDate = this.moment(this.currentDate).add(direction, "year").toDate();
          break;
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
    updateFormRange() {
      let start, end;
      switch (this.currentView) {
        case "year":
          start = this.moment(this.currentDate).startOf("year");
          end = this.moment(this.currentDate).endOf("year");
          break;
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
      this.form.period = "timeline";
    },
    getTasksForMonth(month, year) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.month() === month && taskDate.year() === year;
      });
    },
    getTasksForWeek(startDate, endDate) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isBetween(this.moment(startDate), this.moment(endDate), "day", "[]");
      });
    },
    getTasksForDay(date) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(date), "day");
      });
    },
    getTaskColorClass(task) {
      if (task.is_done) {
        return "bg-green-50 border-green-400 hover:bg-green-100";
      }
      if (this.isOverdue(task)) {
        return "bg-red-50 border-red-400 hover:bg-red-100";
      }
      if (this.isHighPriority(task)) {
        return "bg-orange-50 border-orange-400 hover:bg-orange-100";
      }
      return "bg-blue-50 border-blue-400 hover:bg-blue-100";
    },
    getTaskTooltip(task) {
      let tooltip = task.title;
      if (task.description) {
        tooltip += `
${task.description}`;
      }
      if (task.assignees && task.assignees.length) {
        tooltip += `
Assigned to: ${task.assignees.map((a) => a.user.name).join(", ")}`;
      }
      return tooltip;
    },
    isOverdue(task) {
      return task.due_date && this.moment(task.due_date).isBefore(this.moment()) && !task.is_done;
    },
    isHighPriority(task) {
      return task.taskLabels && task.taskLabels.some((label) => label.label.name.toLowerCase().includes("high"));
    },
    isToday(date) {
      return this.moment(date).isSame(this.moment(), "day");
    },
    formatFullDate(date) {
      return this.moment(date).format("dddd, MMMM Do, YYYY");
    },
    formatDate(date) {
      return this.moment(date).format("MMM D, YYYY");
    },
    formatWeekRange(start, end) {
      const startFormatted = this.moment(start).format("MMM D");
      const endFormatted = this.moment(end).format("MMM D, YYYY");
      return `${startFormatted} - ${endFormatted}`;
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
    initializeTimeline() {
      this.updateFormRange();
      this.timelineReady = true;
    }
  },
  mounted() {
    this.initializeTimeline();
  },
  created() {
    this.moment = moment_timezone;
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_workspace_view_menu = resolveComponent("workspace-view-menu");
  const _component_icon = resolveComponent("icon");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))} data-v-c12ab8ff>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-c12ab8ff>`);
  _push(ssrRenderComponent(_component_workspace_view_menu, {
    workspace: $props.workspace,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    filters: $props.filters,
    view: "timeline"
  }, null, _parent));
  _push(`<div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white" data-v-c12ab8ff>`);
  if ($data.timelineReady) {
    _push(`<div class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden" data-v-c12ab8ff><div class="timeline-header border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white" data-v-c12ab8ff><div class="px-6 py-5" data-v-c12ab8ff><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-v-c12ab8ff><div class="flex items-center justify-center lg:justify-start" data-v-c12ab8ff><div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200/60 p-1" data-v-c12ab8ff><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-c12ab8ff>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-left",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button><div class="px-6 text-center min-w-[200px]" data-v-c12ab8ff><h2 class="text-2xl font-bold text-gray-900 tracking-tight" data-v-c12ab8ff>${ssrInterpolate($options.currentPeriodTitle)}</h2><p class="text-sm text-gray-500 mt-0.5 font-medium" data-v-c12ab8ff>${ssrInterpolate($options.currentPeriodSubtitle)}</p></div><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-c12ab8ff>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-right",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button></div></div><div class="flex flex-col sm:flex-row items-center gap-4" data-v-c12ab8ff><div class="flex bg-gray-100/80 rounded-2xl p-1.5 shadow-sm border border-gray-200/40" data-v-c12ab8ff><!--[-->`);
    ssrRenderList($data.availableViews, (view) => {
      _push(`<button class="${ssrRenderClass([
        "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
        $data.currentView === view.key ? "bg-white text-indigo-600 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-100" : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
      ])}"${ssrRenderAttr("title", view.description)} data-v-c12ab8ff>`);
      _push(ssrRenderComponent(_component_icon, {
        name: view.icon,
        class: "w-4 h-4 mr-2"
      }, null, _parent));
      _push(` ${ssrInterpolate(view.label)}</button>`);
    });
    _push(`<!--]--></div><button class="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200/60 transition-all duration-200" data-v-c12ab8ff>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "calendar-today",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` Today </button></div></div></div></div><div class="timeline-content flex-1 overflow-hidden" data-v-c12ab8ff>`);
    if ($data.currentView === "month") {
      _push(`<div class="month-view h-full flex flex-col" data-v-c12ab8ff><div class="flex-1 overflow-y-auto p-6" data-v-c12ab8ff><div class="timeline-container" data-v-c12ab8ff><!--[-->`);
      ssrRenderList($options.monthsInView, (month) => {
        _push(`<div class="mb-8" data-v-c12ab8ff><div class="month-header mb-6" data-v-c12ab8ff><h3 class="text-xl font-bold text-gray-900" data-v-c12ab8ff>${ssrInterpolate(month.name)} ${ssrInterpolate(month.year)}</h3><div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2" data-v-c12ab8ff></div></div><div class="timeline-events space-y-4" data-v-c12ab8ff><!--[-->`);
        ssrRenderList($options.getTasksForMonth(month.month, month.year), (task) => {
          _push(`<div class="${ssrRenderClass([
            "timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
            $options.getTaskColorClass(task)
          ])}" data-v-c12ab8ff><div class="flex items-start justify-between" data-v-c12ab8ff><div class="flex-1" data-v-c12ab8ff><h4 class="font-semibold text-gray-900 mb-1" data-v-c12ab8ff>${ssrInterpolate(task.title)}</h4>`);
          if (task.description) {
            _push(`<p class="text-sm text-gray-600 mb-2 line-clamp-2" data-v-c12ab8ff>${ssrInterpolate(task.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center space-x-4 text-xs text-gray-500" data-v-c12ab8ff>`);
          if (task.project) {
            _push(`<span class="flex items-center" data-v-c12ab8ff><div class="project__color w-4 h-4 rounded-full inline-block mr-1"${ssrRenderAttr("aria-label", task.project.title)} style="${ssrRenderStyle([task.project.background ? { background: "url(" + task.project.background.image + ")" } : {}])}" data-v-c12ab8ff></div> ${ssrInterpolate(task.project.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.list) {
            _push(`<span class="flex items-center" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "list",
              class: "w-3 h-3 mr-1"
            }, null, _parent));
            _push(` ${ssrInterpolate(task.list.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.due_date) {
            _push(`<span class="flex items-center" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "calendar",
              class: "w-3 h-3 mr-1"
            }, null, _parent));
            _push(` ${ssrInterpolate($options.formatDate(task.due_date))}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.assignees && task.assignees.length) {
            _push(`<span class="flex items-center" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "user",
              class: "w-3 h-3 mr-1"
            }, null, _parent));
            _push(` ${ssrInterpolate(task.assignees.length)} assignee(s) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center space-x-2 ml-4" data-v-c12ab8ff>`);
          if (task.taskLabels && task.taskLabels.length) {
            _push(`<div class="flex space-x-1" data-v-c12ab8ff><!--[-->`);
            ssrRenderList(task.taskLabels.slice(0, 3), (label) => {
              _push(`<span style="${ssrRenderStyle({ backgroundColor: label.label.color + "20", color: label.label.color })}" class="px-2 py-1 rounded-full text-xs font-medium" data-v-c12ab8ff>${ssrInterpolate(label.label.name)}</span>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          if ($options.isOverdue(task)) {
            _push(`<div class="text-red-500" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "exclamation-triangle",
              class: "w-4 h-4"
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    } else if ($data.currentView === "week") {
      _push(`<div class="week-view h-full flex flex-col" data-v-c12ab8ff><div class="flex-1 overflow-y-auto p-6" data-v-c12ab8ff><div class="timeline-container" data-v-c12ab8ff><!--[-->`);
      ssrRenderList($options.weeksInView, (week) => {
        _push(`<div class="mb-8" data-v-c12ab8ff><div class="week-header mb-6" data-v-c12ab8ff><h3 class="text-lg font-bold text-gray-900" data-v-c12ab8ff>${ssrInterpolate($options.formatWeekRange(week.start, week.end))}</h3><div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2" data-v-c12ab8ff></div></div><div class="timeline-events space-y-3" data-v-c12ab8ff><!--[-->`);
        ssrRenderList($options.getTasksForWeek(week.start, week.end), (task) => {
          _push(`<div class="${ssrRenderClass([
            "timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
            $options.getTaskColorClass(task)
          ])}" data-v-c12ab8ff><div class="flex items-start justify-between" data-v-c12ab8ff><div class="flex-1" data-v-c12ab8ff><h4 class="font-semibold text-gray-900 mb-1" data-v-c12ab8ff>${ssrInterpolate(task.title)}</h4>`);
          if (task.description) {
            _push(`<p class="text-sm text-gray-600 mb-2 line-clamp-2" data-v-c12ab8ff>${ssrInterpolate(task.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center space-x-4 text-xs text-gray-500" data-v-c12ab8ff>`);
          if (task.list) {
            _push(`<span class="flex items-center" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "list",
              class: "w-3 h-3 mr-1"
            }, null, _parent));
            _push(` ${ssrInterpolate(task.list.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.due_date) {
            _push(`<span class="flex items-center" data-v-c12ab8ff>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "calendar",
              class: "w-3 h-3 mr-1"
            }, null, _parent));
            _push(` ${ssrInterpolate($options.formatDate(task.due_date))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center space-x-2 ml-4" data-v-c12ab8ff>`);
          if (task.taskLabels && task.taskLabels.length) {
            _push(`<div class="flex space-x-1" data-v-c12ab8ff><!--[-->`);
            ssrRenderList(task.taskLabels.slice(0, 2), (label) => {
              _push(`<span style="${ssrRenderStyle({ backgroundColor: label.label.color + "20", color: label.label.color })}" class="px-2 py-1 rounded-full text-xs font-medium" data-v-c12ab8ff>${ssrInterpolate(label.label.name)}</span>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    } else if ($data.currentView === "day") {
      _push(`<div class="day-view h-full flex flex-col" data-v-c12ab8ff><div class="flex-1 overflow-y-auto p-6" data-v-c12ab8ff><div class="timeline-container" data-v-c12ab8ff><div class="day-header mb-6" data-v-c12ab8ff><h3 class="text-xl font-bold text-gray-900" data-v-c12ab8ff>${ssrInterpolate($options.formatFullDate($data.selectedDate))}</h3><div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-2" data-v-c12ab8ff></div></div><div class="timeline-events space-y-3" data-v-c12ab8ff><!--[-->`);
      ssrRenderList($options.getTasksForDay($data.selectedDate), (task) => {
        _push(`<div class="${ssrRenderClass([
          "timeline-event p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
          $options.getTaskColorClass(task)
        ])}" data-v-c12ab8ff><div class="flex items-start justify-between" data-v-c12ab8ff><div class="flex-1" data-v-c12ab8ff><h4 class="font-semibold text-gray-900 mb-1" data-v-c12ab8ff>${ssrInterpolate(task.title)}</h4>`);
        if (task.description) {
          _push(`<p class="text-sm text-gray-600 mb-2 line-clamp-2" data-v-c12ab8ff>${ssrInterpolate(task.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center space-x-4 text-xs text-gray-500" data-v-c12ab8ff>`);
        if (task.list) {
          _push(`<span class="flex items-center" data-v-c12ab8ff>`);
          _push(ssrRenderComponent(_component_icon, {
            name: "list",
            class: "w-3 h-3 mr-1"
          }, null, _parent));
          _push(` ${ssrInterpolate(task.list.title)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (task.due_date) {
          _push(`<span class="flex items-center" data-v-c12ab8ff>`);
          _push(ssrRenderComponent(_component_icon, {
            name: "calendar",
            class: "w-3 h-3 mr-1"
          }, null, _parent));
          _push(` ${ssrInterpolate($options.formatDate(task.due_date))}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (task.assignees && task.assignees.length) {
          _push(`<span class="flex items-center" data-v-c12ab8ff>`);
          _push(ssrRenderComponent(_component_icon, {
            name: "user",
            class: "w-3 h-3 mr-1"
          }, null, _parent));
          _push(` ${ssrInterpolate(task.assignees.length)} assignee(s) </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex items-center space-x-2 ml-4" data-v-c12ab8ff>`);
        if (task.taskLabels && task.taskLabels.length) {
          _push(`<div class="flex space-x-1" data-v-c12ab8ff><!--[-->`);
          ssrRenderList(task.taskLabels.slice(0, 3), (label) => {
            _push(`<span style="${ssrRenderStyle({ backgroundColor: label.label.color + "20", color: label.label.color })}" class="px-2 py-1 rounded-full text-xs font-medium" data-v-c12ab8ff>${ssrInterpolate(label.label.name)}</span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($options.isOverdue(task)) {
          _push(`<div class="text-red-500" data-v-c12ab8ff>`);
          _push(ssrRenderComponent(_component_icon, {
            name: "exclamation-triangle",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div></div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<div class="flex-1 flex items-center justify-center" data-v-c12ab8ff><div class="text-center" data-v-c12ab8ff><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" data-v-c12ab8ff></div><p class="text-gray-600" data-v-c12ab8ff>Loading timeline...</p></div></div>`);
  }
  _push(`</div></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/Timeline.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Timeline = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-c12ab8ff"]]);
export {
  Timeline as default
};
