import { I as Icon, L as Layout } from "./Layout-DXJEf-iu.js";
import { Link, Head } from "@inertiajs/vue3";
import moment_timezone from "moment-timezone";
import { resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
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
  metaInfo: { title: "Calendar" },
  layout: Layout,
  components: {
    Head,
    Link,
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
      calendarReady: false,
      open_filter: false,
      calendarView: "month",
      // Calendar view mode (month/week/day/year)
      pageView: "calendar",
      // Page view (board/calendar/timeline/table)
      viewOptions: [
        { name: "Board", slug: "board" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "List", slug: "table" }
      ],
      viewIcons: ["board", "calendar", "timeline", "table"],
      selectedDate: /* @__PURE__ */ new Date(),
      currentDate: /* @__PURE__ */ new Date(),
      availableViews: [
        { key: "month", label: "Month", icon: "calendar", description: "Monthly calendar view" },
        { key: "week", label: "Week", icon: "calendar-week", description: "Weekly calendar view" },
        { key: "day", label: "Day", icon: "calendar-day", description: "Daily calendar view" },
        { key: "year", label: "Year", icon: "calendar-year", description: "Yearly calendar view" }
      ],
      daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      timeSlots: Array.from({ length: 24 }, (_, i) => i),
      viewOptions: [
        { name: "Board", slug: "board" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "List", slug: "table" }
      ],
      viewIcons: ["board", "calendar", "timeline", "table"],
      form: {
        range: { start: "", end: "" },
        period: "calendar",
        task: null
      },
      moment: null,
      // Task details popup properties
      taskDetailsOpen: false,
      taskDetailsId: null,
      td_pop: true
    };
  },
  computed: {
    currentPeriodTitle() {
      switch (this.calendarView) {
        case "year":
          return this.currentDate.getFullYear().toString();
        case "month":
          return this.moment(this.currentDate).format("MMMM YYYY");
        case "week":
          const weekStart = this.moment(this.selectedDate).startOf("week");
          const weekEnd = this.moment(this.selectedDate).endOf("week");
          return `${weekStart.format("MMM D")} - ${weekEnd.format("MMM D, YYYY")}`;
        case "day":
          return this.moment(this.selectedDate).format("dddd, MMMM D, YYYY");
        default:
          return this.moment(this.currentDate).format("MMMM YYYY");
      }
    },
    currentPeriodSubtitle() {
      var _a;
      const totalTasks = ((_a = this.tasks) == null ? void 0 : _a.length) || 0;
      const completedTasks = (this.tasks || []).filter((task) => task.is_done).length;
      return `${totalTasks} tasks, ${completedTasks} completed`;
    },
    calendarDays() {
      const start = this.moment(this.currentDate).startOf("month").startOf("week");
      const end = this.moment(this.currentDate).endOf("month").endOf("week");
      const days = [];
      const current = start.clone();
      while (current.isSameOrBefore(end)) {
        days.push({
          date: current.toDate(),
          isCurrentMonth: current.month() === this.currentDate.getMonth(),
          isToday: current.isSame(this.moment(), "day")
        });
        current.add(1, "day");
      }
      return days;
    },
    weekDays() {
      const days = [];
      const startOfWeek = this.moment(this.selectedDate).startOf("week");
      for (let i = 0; i < 7; i++) {
        days.push(startOfWeek.clone().add(i, "day").toDate());
      }
      return days;
    },
    yearMonths() {
      const months = [];
      const currentYear = this.moment(this.currentDate).year();
      for (let i = 0; i < 12; i++) {
        const monthStart = this.moment().year(currentYear).month(i).startOf("month");
        const monthEnd = this.moment().year(currentYear).month(i).endOf("month");
        const startOfCalendar = monthStart.clone().startOf("week");
        const endOfCalendar = monthEnd.clone().endOf("week");
        const days = [];
        let current = startOfCalendar.clone();
        while (current.isSameOrBefore(endOfCalendar)) {
          const dayTasks = this.getTasksForDay(current.toDate());
          const hasOverdue = dayTasks.some((task) => this.isOverdue(task));
          days.push({
            date: current.toDate(),
            isCurrentMonth: current.isSame(monthStart, "month"),
            isToday: current.isSame(this.moment(), "day"),
            taskCount: dayTasks.length,
            hasOverdue
          });
          current.add(1, "day");
        }
        const monthTasks = this.getTasksForMonth(monthStart.toDate());
        months.push({
          month: i,
          name: monthStart.format("MMMM"),
          days,
          taskCount: monthTasks.length,
          completedTasks: monthTasks.filter((t) => t.is_done).length,
          overdueTasks: monthTasks.filter((t) => this.isOverdue(t)).length
        });
      }
      return months;
    }
  },
  methods: {
    navigatePeriod(direction) {
      const newDate = this.moment(this.currentDate);
      switch (this.calendarView) {
        case "year":
          newDate.add(direction, "year");
          break;
        case "month":
          newDate.add(direction, "month");
          break;
        case "week":
          newDate.add(direction, "week");
          this.selectedDate = newDate.toDate();
          break;
        case "day":
          newDate.add(direction, "day");
          this.selectedDate = newDate.toDate();
          break;
      }
      this.currentDate = newDate.toDate();
      this.updateFormRange();
    },
    changeView(view) {
      this.calendarView = view;
      this.updateFormRange();
    },
    goToToday() {
      this.currentDate = /* @__PURE__ */ new Date();
      this.selectedDate = /* @__PURE__ */ new Date();
      this.updateFormRange();
    },
    refreshCalendar() {
      this.$inertia.reload({ only: ["tasks"] });
    },
    selectDate(date) {
      this.selectedDate = date;
      if (this.calendarView === "month") {
        this.changeView("day");
      }
    },
    updateFormRange() {
      let start, end;
      switch (this.calendarView) {
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
      this.form.period = "calendar";
    },
    getTasksForDay(date) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(date), "day");
      });
    },
    getTasksForHour(date, hour) {
      return this.tasks.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = this.moment(task.due_date);
        return taskDate.isSame(this.moment(date), "day") && taskDate.hour() === hour;
      });
    },
    getAllDayTasks(date) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(date), "day") && !task.due_date;
      });
    },
    getTasksForMonth(date) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(date), "month");
      });
    },
    getCompletedTasksForDay(date) {
      return this.getTasksForDay(date).filter((task) => task.is_done).length;
    },
    getOverdueTasksForDay(date) {
      return this.getTasksForDay(date).filter((task) => this.isOverdue(task)).length;
    },
    getYearTaskCount() {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(this.currentDate), "year");
      }).length;
    },
    getYearCompletedTaskCount() {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(this.currentDate), "year") && task.is_done;
      }).length;
    },
    getYearPendingTaskCount() {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(this.currentDate), "year") && !task.is_done && !this.isOverdue(task);
      }).length;
    },
    getYearOverdueTaskCount() {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(this.currentDate), "year") && this.isOverdue(task);
      }).length;
    },
    getTaskColorClass(task) {
      if (task.is_done) {
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200";
      } else if (this.isOverdue(task)) {
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200";
      } else if (this.isHighPriority(task)) {
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200";
      } else {
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
      }
    },
    getTaskTooltip(task) {
      let tooltip = task.title;
      if (task.project) {
        tooltip += `
Project: ${task.project.title}`;
      }
      if (task.due_date) {
        tooltip += `
Due: ${this.moment(task.due_date).format("MMM D, YYYY HH:mm")}`;
      }
      if (task.assignees && task.assignees.length > 0) {
        tooltip += `
Assigned to: ${task.assignees.map((a) => a.user.name).join(", ")}`;
      }
      return tooltip;
    },
    isOverdue(task) {
      return task.due_date && this.moment(task.due_date).isBefore(this.moment()) && !task.is_done;
    },
    isHighPriority(task) {
      return task.labels && task.labels.some((label) => label.name.toLowerCase().includes("high"));
    },
    isToday(date) {
      return this.moment(date).isSame(this.moment(), "day");
    },
    formatFullDate(date) {
      return this.moment(date).format("dddd, MMMM Do, YYYY");
    },
    formatWeekDay(date) {
      return this.moment(date).format("ddd");
    },
    formatHour(hour) {
      return this.moment().hour(hour).minute(0).format("HH:mm");
    },
    selectMonth(month) {
      this.currentDate = this.moment().year(this.moment(this.currentDate).year()).month(month.month).toDate();
      this.changeView("month");
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
    initializeCalendar() {
      this.updateFormRange();
      this.calendarReady = true;
    }
  },
  mounted() {
    this.initializeCalendar();
  },
  created() {
    this.moment = moment_timezone;
    const url = this.$page.url || "";
    if (url.includes("/my-tasks/board")) this.pageView = "board";
    else if (url.includes("/my-tasks/calendar")) this.pageView = "calendar";
    else if (url.includes("/my-tasks/timeline")) this.pageView = "timeline";
    else if (url.includes("/my-tasks/table") || url.includes("/my-tasks")) this.pageView = "table";
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))} data-v-fbec6533>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-fbec6533><div class="project__view__menu w-full p-2 text-sm flex justify-first items-center" data-v-fbec6533><div class="inline-flex w-full flex-wrap items-center" data-v-fbec6533><div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap" data-v-fbec6533><h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1" data-v-fbec6533>${ssrInterpolate($props.workspace.name)}</h2><!--[-->`);
  ssrRenderList($data.viewOptions, (option, option_index) => {
    _push(ssrRenderComponent(_component_Link, {
      class: ["flex py-2 px-3 items-center cursor-pointer capitalize rounded", { "active": $data.pageView === option.slug }],
      href: _ctx.route("workspace.view.my-tasks." + option.slug, $props.workspace.slug || $props.workspace.id)
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_icon, {
            name: $data.viewIcons[option_index],
            class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
          }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate(_ctx.$t(option.name))}`);
        } else {
          return [
            createVNode(_component_icon, {
              name: $data.viewIcons[option_index],
              class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
            }, null, 8, ["name"]),
            createTextVNode(" " + toDisplayString(_ctx.$t(option.name)), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]--></div></div></div><div class="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white" data-v-fbec6533>`);
  if ($data.calendarReady) {
    _push(`<div class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden" data-v-fbec6533><div class="calendar-header border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white" data-v-fbec6533><div class="px-6 py-5" data-v-fbec6533><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-v-fbec6533><div class="flex items-center justify-center lg:justify-start" data-v-fbec6533><div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200/60 p-1" data-v-fbec6533><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-fbec6533>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-left",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button><div class="px-6 text-center min-w-[200px]" data-v-fbec6533><h2 class="text-2xl font-bold text-gray-900 tracking-tight" data-v-fbec6533>${ssrInterpolate($options.currentPeriodTitle)}</h2><p class="text-sm text-gray-500 mt-0.5 font-medium" data-v-fbec6533>${ssrInterpolate($options.currentPeriodSubtitle)}</p></div><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-fbec6533>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-right",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button></div></div><div class="flex flex-col sm:flex-row items-center gap-4" data-v-fbec6533><div class="flex bg-gray-100/80 rounded-2xl p-1.5 shadow-sm border border-gray-200/40" data-v-fbec6533><!--[-->`);
    ssrRenderList($data.availableViews, (view) => {
      _push(`<button class="${ssrRenderClass([
        "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
        $data.calendarView === view.key ? "bg-white text-indigo-600 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-100" : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
      ])}"${ssrRenderAttr("title", view.description)} data-v-fbec6533>`);
      _push(ssrRenderComponent(_component_icon, {
        name: view.icon,
        class: "w-4 h-4 mr-2"
      }, null, _parent));
      _push(` ${ssrInterpolate(view.label)}</button>`);
    });
    _push(`<!--]--></div><div class="flex items-center gap-2" data-v-fbec6533><button class="flex items-center px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-all duration-200 border border-indigo-200/60" data-v-fbec6533>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "calendar",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Today"))}</button><button class="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-200/60" title="Refresh" data-v-fbec6533>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "refresh",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div></div></div></div></div><div class="calendar-content flex-1 overflow-hidden bg-white" data-v-fbec6533>`);
    if ($data.calendarView === "month") {
      _push(`<div class="month-view h-full flex flex-col" data-v-fbec6533><div class="grid grid-cols-7 bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 border-b border-gray-200/60" data-v-fbec6533><!--[-->`);
      ssrRenderList($data.daysOfWeek, (day) => {
        _push(`<div class="px-4 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200/40 last:border-r-0 bg-white/60" data-v-fbec6533>${ssrInterpolate(day)}</div>`);
      });
      _push(`<!--]--></div><div class="grid grid-cols-7 flex-1" style="${ssrRenderStyle({ "grid-template-rows": "repeat(6, 1fr)" })}" data-v-fbec6533><!--[-->`);
      ssrRenderList($options.calendarDays, (day, index) => {
        _push(`<div class="${ssrRenderClass([
          "border-r border-b border-gray-200/40 last:border-r-0 p-3 min-h-[140px] relative overflow-hidden transition-all duration-300 group",
          day.isCurrentMonth ? "bg-white hover:bg-gray-50/80" : "bg-gray-50/60 hover:bg-gray-100/80",
          day.isToday ? "bg-gradient-to-br from-indigo-50 to-blue-50/60 ring-2 ring-indigo-200/60 shadow-inner" : "",
          "cursor-pointer"
        ])}" data-v-fbec6533><div class="flex items-center justify-between mb-3" data-v-fbec6533><div class="${ssrRenderClass([
          "text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
          day.isToday ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200" : "group-hover:bg-indigo-100 group-hover:text-indigo-600"
        ])}" data-v-fbec6533>${ssrInterpolate(day.date.getDate())}</div>`);
        if ($options.getTasksForDay(day.date).length > 0) {
          _push(`<div class="flex items-center" data-v-fbec6533><div class="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full shadow-sm" data-v-fbec6533>${ssrInterpolate($options.getTasksForDay(day.date).length)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-1.5 flex-1" data-v-fbec6533><!--[-->`);
        ssrRenderList($options.getTasksForDay(day.date).slice(0, 3), (task, taskIndex) => {
          _push(`<div class="${ssrRenderClass([
            "text-xs p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-white/60 backdrop-blur-sm",
            $options.getTaskColorClass(task)
          ])}"${ssrRenderAttr("title", $options.getTaskTooltip(task))} data-v-fbec6533><div class="flex items-center space-x-2" data-v-fbec6533><div class="flex items-center space-x-1" data-v-fbec6533>`);
          if (task.is_done) {
            _push(`<div class="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-emerald-200" data-v-fbec6533></div>`);
          } else if ($options.isOverdue(task)) {
            _push(`<div class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 animate-pulse shadow-sm ring-2 ring-red-200" data-v-fbec6533></div>`);
          } else if ($options.isHighPriority(task)) {
            _push(`<div class="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-amber-200" data-v-fbec6533></div>`);
          } else {
            _push(`<div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-blue-200" data-v-fbec6533></div>`);
          }
          _push(`</div><div class="flex-1 min-w-0" data-v-fbec6533><span class="truncate font-semibold leading-relaxed block" data-v-fbec6533>${ssrInterpolate(task.title)}</span>`);
          if (task.project) {
            _push(`<span class="text-xs text-gray-500 truncate block" data-v-fbec6533>${ssrInterpolate(task.project.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center justify-between mt-2" data-v-fbec6533>`);
          if (task.due_date) {
            _push(`<span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg" data-v-fbec6533>${ssrInterpolate($data.moment(task.due_date).format("HH:mm"))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center space-x-1.5" data-v-fbec6533>`);
          if (task.assignees && task.assignees.length > 0) {
            _push(`<div class="flex -space-x-1" data-v-fbec6533><!--[-->`);
            ssrRenderList(task.assignees.slice(0, 2), (assignee) => {
              _push(`<img${ssrRenderAttr("src", assignee.user.photo_path || "/images/user.svg")}${ssrRenderAttr("alt", assignee.user.name)} class="w-5 h-5 rounded-full border-2 border-white shadow-sm"${ssrRenderAttr("title", assignee.user.name)} data-v-fbec6533>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]-->`);
        if ($options.getTasksForDay(day.date).length > 3) {
          _push(`<div class="text-xs font-semibold text-indigo-600 text-center py-2 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 cursor-pointer border border-indigo-200/60 shadow-sm" data-v-fbec6533>`);
          _push(ssrRenderComponent(_component_icon, {
            name: "plus",
            class: "w-3 h-3 inline mr-1"
          }, null, _parent));
          _push(` ${ssrInterpolate($options.getTasksForDay(day.date).length - 3)} ${ssrInterpolate(_ctx.$t("more"))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    } else if ($data.calendarView === "week") {
      _push(`<div class="week-view h-full flex flex-col" data-v-fbec6533><div class="grid grid-cols-8 border-b bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 sticky top-0 z-10" data-v-fbec6533><div class="p-4 border-r border-gray-200/40 bg-white/60" data-v-fbec6533><span class="text-sm font-bold text-gray-700" data-v-fbec6533>Time</span></div><!--[-->`);
      ssrRenderList($options.weekDays, (day) => {
        _push(`<div class="p-4 text-center border-r border-gray-200/40 last:border-r-0 bg-white/60" data-v-fbec6533><div class="text-sm font-bold text-gray-700" data-v-fbec6533>${ssrInterpolate($options.formatWeekDay(day))}</div><div class="${ssrRenderClass([
          "text-xl font-bold mt-2 w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all duration-200",
          $options.isToday(day) ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200" : "text-gray-900 hover:bg-indigo-100"
        ])}" data-v-fbec6533>${ssrInterpolate(day.getDate())}</div><div class="text-xs text-indigo-600 mt-2 font-semibold bg-indigo-100 px-2 py-1 rounded-full" data-v-fbec6533>${ssrInterpolate($options.getTasksForDay(day).length)} tasks </div></div>`);
      });
      _push(`<!--]--></div><div class="flex-1 overflow-y-auto" data-v-fbec6533><div class="grid grid-cols-8 min-h-full" data-v-fbec6533><div class="border-r border-gray-200/40 bg-gray-50/60" data-v-fbec6533><!--[-->`);
      ssrRenderList($data.timeSlots, (hour) => {
        _push(`<div class="border-b border-gray-200/40 h-16 p-2 flex items-center" data-v-fbec6533><span class="text-xs text-gray-600 font-semibold" data-v-fbec6533>${ssrInterpolate($options.formatHour(hour))}</span></div>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList($options.weekDays, (day) => {
        _push(`<div class="border-r border-gray-200/40 last:border-r-0" data-v-fbec6533><!--[-->`);
        ssrRenderList($data.timeSlots, (hour) => {
          _push(`<div class="border-b border-gray-200/40 h-16 p-1 relative hover:bg-indigo-50/50 transition-all duration-200 group" data-v-fbec6533><div class="space-y-1" data-v-fbec6533><!--[-->`);
          ssrRenderList($options.getTasksForHour(day, hour), (task) => {
            _push(`<div class="${ssrRenderClass([
              "text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4",
              $options.getTaskColorClass(task)
            ])}"${ssrRenderAttr("title", $options.getTaskTooltip(task))} data-v-fbec6533><div class="font-semibold truncate" data-v-fbec6533>${ssrInterpolate(task.title)}</div>`);
            if (task.list) {
              _push(`<div class="text-xs opacity-75 mt-1 truncate" data-v-fbec6533>${ssrInterpolate(task.list.title)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    } else if ($data.calendarView === "day") {
      _push(`<div class="day-view h-full flex" data-v-fbec6533><div class="flex-1" data-v-fbec6533><div class="sticky top-0 bg-gradient-to-r from-indigo-50 to-blue-50/60 p-6 border-b border-gray-200/60 z-10 shadow-sm" data-v-fbec6533><h3 class="text-2xl font-bold text-gray-900" data-v-fbec6533>${ssrInterpolate($options.formatFullDate($data.selectedDate))}</h3><div class="flex items-center justify-between mt-2" data-v-fbec6533><p class="text-sm text-gray-600" data-v-fbec6533>${ssrInterpolate($options.getTasksForDay($data.selectedDate).length)} tasks scheduled</p><div class="flex items-center space-x-4 text-sm" data-v-fbec6533><span class="text-emerald-600 font-semibold" data-v-fbec6533>${ssrInterpolate($options.getCompletedTasksForDay($data.selectedDate))} completed</span><span class="text-red-600 font-semibold" data-v-fbec6533>${ssrInterpolate($options.getOverdueTasksForDay($data.selectedDate))} overdue</span></div></div></div><div class="relative" data-v-fbec6533><!--[-->`);
      ssrRenderList($data.timeSlots, (hour) => {
        _push(`<div class="border-b border-gray-200/40 h-20 p-4 hover:bg-indigo-50/30 transition-all duration-200 group" data-v-fbec6533><div class="text-xs text-gray-400 font-medium mb-2" data-v-fbec6533>${ssrInterpolate($options.formatHour(hour))}</div><div class="space-y-2" data-v-fbec6533><!--[-->`);
        ssrRenderList($options.getTasksForHour($data.selectedDate, hour), (task) => {
          _push(`<div class="${ssrRenderClass([
            "p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 backdrop-blur-sm",
            $options.getTaskColorClass(task)
          ])}" data-v-fbec6533><div class="flex items-start justify-between" data-v-fbec6533><div class="flex-1" data-v-fbec6533><h5 class="font-bold text-gray-900 mb-1" data-v-fbec6533>${ssrInterpolate(task.title)}</h5>`);
          if (task.description) {
            _push(`<p class="text-sm text-gray-600 mb-2 line-clamp-2" data-v-fbec6533>${ssrInterpolate(task.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center space-x-4 text-xs" data-v-fbec6533>`);
          if (task.due_date) {
            _push(`<span class="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium" data-v-fbec6533>${ssrInterpolate($data.moment(task.due_date).format("HH:mm"))}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.project) {
            _push(`<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-medium" data-v-fbec6533>${ssrInterpolate(task.project.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.list) {
            _push(`<span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-medium" data-v-fbec6533>${ssrInterpolate(task.list.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center space-x-2 ml-4" data-v-fbec6533>`);
          if (task.assignees && task.assignees.length > 0) {
            _push(`<div class="flex -space-x-1" data-v-fbec6533><!--[-->`);
            ssrRenderList(task.assignees.slice(0, 3), (assignee) => {
              _push(`<img${ssrRenderAttr("src", assignee.user.photo_path || "/images/user.svg")}${ssrRenderAttr("alt", assignee.user.name)} class="w-6 h-6 rounded-full border-2 border-white shadow-sm"${ssrRenderAttr("title", assignee.user.name)} data-v-fbec6533>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          if (task.is_done) {
            _push(`<span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-semibold" data-v-fbec6533>Done</span>`);
          } else if ($options.isOverdue(task)) {
            _push(`<span class="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse font-semibold" data-v-fbec6533>Overdue</span>`);
          } else {
            _push(`<span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold" data-v-fbec6533>Active</span>`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]-->`);
      if ($options.getAllDayTasks($data.selectedDate).length > 0) {
        _push(`<div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-t-2 border-yellow-200 p-6 mt-4" data-v-fbec6533><h4 class="font-bold text-gray-900 mb-4 flex items-center" data-v-fbec6533>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "calendar",
          class: "w-5 h-5 mr-2 text-amber-600"
        }, null, _parent));
        _push(` All Day Tasks </h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3" data-v-fbec6533><!--[-->`);
        ssrRenderList($options.getAllDayTasks($data.selectedDate), (task) => {
          _push(`<div class="${ssrRenderClass([
            "p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4",
            $options.getTaskColorClass(task)
          ])}" data-v-fbec6533><div class="flex items-center justify-between" data-v-fbec6533><h5 class="font-semibold text-gray-900 flex-1" data-v-fbec6533>${ssrInterpolate(task.title)}</h5>`);
          if (task.project) {
            _push(`<span class="text-xs text-gray-600 bg-white px-2 py-1 rounded-lg ml-2" data-v-fbec6533>${ssrInterpolate(task.project.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (task.list) {
            _push(`<span class="text-xs text-gray-600 bg-white px-2 py-1 rounded-lg ml-2" data-v-fbec6533>${ssrInterpolate(task.list.title)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    } else if ($data.calendarView === "year") {
      _push(`<div class="year-view h-full p-6" data-v-fbec6533><div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4" data-v-fbec6533><div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/60" data-v-fbec6533><div class="text-2xl font-bold text-blue-700" data-v-fbec6533>${ssrInterpolate($options.getYearTaskCount())}</div><div class="text-sm text-blue-600 font-medium" data-v-fbec6533>Total Tasks</div></div><div class="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200/60" data-v-fbec6533><div class="text-2xl font-bold text-emerald-700" data-v-fbec6533>${ssrInterpolate($options.getYearCompletedTaskCount())}</div><div class="text-sm text-emerald-600 font-medium" data-v-fbec6533>Completed</div></div><div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/60" data-v-fbec6533><div class="text-2xl font-bold text-amber-700" data-v-fbec6533>${ssrInterpolate($options.getYearPendingTaskCount())}</div><div class="text-sm text-amber-600 font-medium" data-v-fbec6533>Pending</div></div><div class="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-xl border border-red-200/60" data-v-fbec6533><div class="text-2xl font-bold text-red-700" data-v-fbec6533>${ssrInterpolate($options.getYearOverdueTaskCount())}</div><div class="text-sm text-red-600 font-medium" data-v-fbec6533>Overdue</div></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full overflow-y-auto" data-v-fbec6533><!--[-->`);
      ssrRenderList($options.yearMonths, (month) => {
        _push(`<div class="year-month-card bg-white rounded-2xl border border-gray-200/60 hover:shadow-xl transition-all duration-300 cursor-pointer group" data-v-fbec6533><div class="p-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-indigo-50/30" data-v-fbec6533><h4 class="font-bold text-gray-900 text-lg" data-v-fbec6533>${ssrInterpolate(month.name)}</h4><div class="flex items-center justify-between mt-2" data-v-fbec6533><p class="text-sm text-gray-600 font-medium" data-v-fbec6533>${ssrInterpolate(month.taskCount)} tasks</p><div class="flex items-center space-x-2" data-v-fbec6533><span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold" data-v-fbec6533>${ssrInterpolate(month.completedTasks)}</span><span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold" data-v-fbec6533>${ssrInterpolate(month.overdueTasks)}</span></div></div></div><div class="p-4" data-v-fbec6533><div class="grid grid-cols-7 gap-1 mb-2" data-v-fbec6533><!--[-->`);
        ssrRenderList(["S", "M", "T", "W", "T", "F", "S"], (day) => {
          _push(`<div class="text-xs text-gray-500 text-center font-bold" data-v-fbec6533>${ssrInterpolate(day)}</div>`);
        });
        _push(`<!--]--></div><div class="grid grid-cols-7 gap-1" data-v-fbec6533><!--[-->`);
        ssrRenderList(month.days, (day, index) => {
          _push(`<div class="${ssrRenderClass([
            "text-xs text-center p-2 rounded-lg transition-all duration-200 cursor-pointer",
            day.isCurrentMonth ? "text-gray-900 hover:bg-indigo-50" : "text-gray-300",
            day.isToday ? "bg-indigo-600 text-white font-bold shadow-lg ring-2 ring-indigo-200" : "",
            day.taskCount > 0 && !day.isToday ? "bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold" : "hover:bg-gray-100",
            day.hasOverdue ? "ring-2 ring-red-300" : ""
          ])}"${ssrRenderAttr("title", `${day.taskCount} tasks${day.hasOverdue ? ", has overdue" : ""}`)} data-v-fbec6533>${ssrInterpolate(day.date.getDate())} `);
          if (day.taskCount > 0) {
            _push(`<div class="flex justify-center mt-0.5" data-v-fbec6533><div class="${ssrRenderClass([
              "w-1.5 h-1.5 rounded-full",
              day.hasOverdue ? "bg-red-500" : day.isToday ? "bg-white" : "bg-blue-500"
            ])}" data-v-fbec6533></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div><div class="p-4 border-t border-gray-200/60 bg-gray-50/60" data-v-fbec6533><div class="grid grid-cols-3 gap-2 text-xs" data-v-fbec6533><div class="text-center" data-v-fbec6533><div class="font-bold text-emerald-600" data-v-fbec6533>${ssrInterpolate(month.completedTasks)}</div><div class="text-gray-500" data-v-fbec6533>Done</div></div><div class="text-center" data-v-fbec6533><div class="font-bold text-blue-600" data-v-fbec6533>${ssrInterpolate(month.taskCount - month.completedTasks - month.overdueTasks)}</div><div class="text-gray-500" data-v-fbec6533>Active</div></div><div class="text-center" data-v-fbec6533><div class="font-bold text-red-600" data-v-fbec6533>${ssrInterpolate(month.overdueTasks)}</div><div class="text-gray-500" data-v-fbec6533>Overdue</div></div></div></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
      view: "calendar",
      isPopup: $data.td_pop,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/MyTasksCalendar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MyTasksCalendar = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-fbec6533"]]);
export {
  MyTasksCalendar as default
};
