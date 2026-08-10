import { I as Icon, L as Layout } from "./Layout-DXJEf-iu.js";
import { Link, Head } from "@inertiajs/vue3";
import moment_timezone from "moment-timezone";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
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
const _sfc_main = {
  metaInfo: { title: "Calendar" },
  layout: Layout,
  components: {
    Head,
    Link,
    BoardViewMenu,
    Icon
  },
  props: {
    title: String,
    project: Object,
    tasks: Array,
    filters: Object
  },
  data() {
    return {
      calendarReady: false,
      open_filter: false,
      currentView: "month",
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
      form: {
        range: { start: "", end: "" },
        period: "calendar"
      },
      moment: null
    };
  },
  computed: {
    currentPeriodTitle() {
      switch (this.currentView) {
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
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter((task) => task.is_done).length;
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
    }
  },
  methods: {
    navigatePeriod(direction) {
      const newDate = this.moment(this.currentDate);
      switch (this.currentView) {
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
      this.currentView = view;
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
      if (this.currentView === "month") {
        this.changeView("day");
      }
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
      this.form.period = "calendar";
    },
    getTasksForDay(date) {
      return this.tasks.filter((task) => {
        const taskDate = task.due_date ? this.moment(task.due_date) : this.moment(task.created_at);
        return taskDate.isSame(this.moment(date), "day");
      });
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
    openTask(task) {
      this.$inertia.visit(this.route("tasks.show", task.id));
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
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_icon = resolveComponent("icon");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))} data-v-7101c612>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full" data-v-7101c612>`);
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    onFilterToggle: ($event) => $data.open_filter = !$data.open_filter,
    filters: $props.filters,
    view: "calendar"
  }, null, _parent));
  _push(`<div class="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white" data-v-7101c612>`);
  if ($data.calendarReady) {
    _push(`<div class="flex-1 flex flex-col m-4 bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden" data-v-7101c612><div class="calendar-header border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white" data-v-7101c612><div class="px-6 py-5" data-v-7101c612><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-v-7101c612><div class="flex items-center justify-center lg:justify-start" data-v-7101c612><div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200/60 p-1" data-v-7101c612><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-7101c612>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-left",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button><div class="px-6 text-center min-w-[200px]" data-v-7101c612><h2 class="text-2xl font-bold text-gray-900 tracking-tight" data-v-7101c612>${ssrInterpolate($options.currentPeriodTitle)}</h2><p class="text-sm text-gray-500 mt-0.5 font-medium" data-v-7101c612>${ssrInterpolate($options.currentPeriodSubtitle)}</p></div><button class="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-7101c612>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-right",
      class: "w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors"
    }, null, _parent));
    _push(`</button></div></div><div class="flex flex-col sm:flex-row items-center gap-4" data-v-7101c612><div class="flex bg-gray-100/80 rounded-2xl p-1.5 shadow-sm border border-gray-200/40" data-v-7101c612><!--[-->`);
    ssrRenderList($data.availableViews, (view) => {
      _push(`<button class="${ssrRenderClass([
        "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
        $data.currentView === view.key ? "bg-white text-indigo-600 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-100" : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
      ])}"${ssrRenderAttr("title", view.description)} data-v-7101c612>`);
      _push(ssrRenderComponent(_component_icon, {
        name: view.icon,
        class: "w-4 h-4 mr-2"
      }, null, _parent));
      _push(` ${ssrInterpolate(view.label)}</button>`);
    });
    _push(`<!--]--></div><div class="flex items-center gap-2" data-v-7101c612><button class="flex items-center px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-all duration-200 border border-indigo-200/60" data-v-7101c612>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "calendar",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Today"))}</button><button class="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-200/60" title="Refresh" data-v-7101c612>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "refresh",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div></div></div></div></div><div class="calendar-content flex-1 overflow-hidden bg-white" data-v-7101c612>`);
    if ($data.currentView === "month") {
      _push(`<div class="month-view h-full flex flex-col" data-v-7101c612><div class="grid grid-cols-7 bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 border-b border-gray-200/60" data-v-7101c612><!--[-->`);
      ssrRenderList($data.daysOfWeek, (day) => {
        _push(`<div class="px-4 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-200/40 last:border-r-0 bg-white/60" data-v-7101c612>${ssrInterpolate(day)}</div>`);
      });
      _push(`<!--]--></div><div class="grid grid-cols-7 flex-1" style="${ssrRenderStyle({ "grid-template-rows": "repeat(6, 1fr)" })}" data-v-7101c612><!--[-->`);
      ssrRenderList($options.calendarDays, (day, index) => {
        _push(`<div class="${ssrRenderClass([
          "border-r border-b border-gray-200/40 last:border-r-0 p-3 min-h-[140px] relative overflow-hidden transition-all duration-300 group",
          day.isCurrentMonth ? "bg-white hover:bg-gray-50/80" : "bg-gray-50/60 hover:bg-gray-100/80",
          day.isToday ? "bg-gradient-to-br from-indigo-50 to-blue-50/60 ring-2 ring-indigo-200/60 shadow-inner" : "",
          "cursor-pointer"
        ])}" data-v-7101c612><div class="flex items-center justify-between mb-3" data-v-7101c612><div class="${ssrRenderClass([
          "text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
          day.isToday ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200" : "group-hover:bg-indigo-100 group-hover:text-indigo-600"
        ])}" data-v-7101c612>${ssrInterpolate(day.date.getDate())}</div>`);
        if ($options.getTasksForDay(day.date).length > 0) {
          _push(`<div class="flex items-center" data-v-7101c612><div class="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full shadow-sm" data-v-7101c612>${ssrInterpolate($options.getTasksForDay(day.date).length)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-1.5 flex-1" data-v-7101c612><!--[-->`);
        ssrRenderList($options.getTasksForDay(day.date).slice(0, 3), (task, taskIndex) => {
          _push(`<div class="${ssrRenderClass([
            "text-xs p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-white/60 backdrop-blur-sm",
            $options.getTaskColorClass(task)
          ])}"${ssrRenderAttr("title", $options.getTaskTooltip(task))} data-v-7101c612><div class="flex items-center space-x-2" data-v-7101c612><div class="flex items-center space-x-1" data-v-7101c612>`);
          if (task.is_done) {
            _push(`<div class="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-emerald-200" data-v-7101c612></div>`);
          } else if ($options.isOverdue(task)) {
            _push(`<div class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 animate-pulse shadow-sm ring-2 ring-red-200" data-v-7101c612></div>`);
          } else if ($options.isHighPriority(task)) {
            _push(`<div class="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-amber-200" data-v-7101c612></div>`);
          } else {
            _push(`<div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 shadow-sm ring-2 ring-blue-200" data-v-7101c612></div>`);
          }
          _push(`</div><span class="truncate font-semibold leading-relaxed" data-v-7101c612>${ssrInterpolate(task.title)}</span></div><div class="flex items-center justify-between mt-2" data-v-7101c612>`);
          if (task.due_date) {
            _push(`<span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg" data-v-7101c612>${ssrInterpolate($data.moment(task.due_date).format("HH:mm"))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center space-x-1.5" data-v-7101c612>`);
          if (task.assignees && task.assignees.length > 0) {
            _push(`<div class="flex -space-x-1" data-v-7101c612><!--[-->`);
            ssrRenderList(task.assignees.slice(0, 2), (assignee) => {
              _push(`<img${ssrRenderAttr("src", assignee.user.photo_path || "/images/user.svg")}${ssrRenderAttr("alt", assignee.user.name)} class="w-5 h-5 rounded-full border-2 border-white shadow-sm"${ssrRenderAttr("title", assignee.user.name)} data-v-7101c612>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]-->`);
        if ($options.getTasksForDay(day.date).length > 3) {
          _push(`<div class="text-xs font-semibold text-indigo-600 text-center py-2 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 cursor-pointer border border-indigo-200/60 shadow-sm" data-v-7101c612>`);
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
    } else if ($data.currentView === "week") {
      _push(`<div class="week-view h-full flex flex-col" data-v-7101c612><div class="p-6 text-center" data-v-7101c612><h3 class="text-lg font-semibold text-gray-600" data-v-7101c612>Week View</h3><p class="text-sm text-gray-500 mt-2" data-v-7101c612>Week view implementation coming soon...</p></div></div>`);
    } else if ($data.currentView === "day") {
      _push(`<div class="day-view h-full flex flex-col" data-v-7101c612><div class="p-6 text-center" data-v-7101c612><h3 class="text-lg font-semibold text-gray-600" data-v-7101c612>Day View</h3><p class="text-sm text-gray-500 mt-2" data-v-7101c612>Day view implementation coming soon...</p></div></div>`);
    } else if ($data.currentView === "year") {
      _push(`<div class="year-view h-full flex flex-col" data-v-7101c612><div class="p-6 text-center" data-v-7101c612><h3 class="text-lg font-semibold text-gray-600" data-v-7101c612>Year View</h3><p class="text-sm text-gray-500 mt-2" data-v-7101c612>Year view implementation coming soon...</p></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Calendar_Clean.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Calendar_Clean = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-7101c612"]]);
export {
  Calendar_Clean as default
};
