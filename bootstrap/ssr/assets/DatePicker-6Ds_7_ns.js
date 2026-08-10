import { I as Icon } from "./Layout-DXJEf-iu.js";
import moment from "moment";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "DatePicker",
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: [Date, String, null],
      default: null
    },
    placeholder: {
      type: String,
      default: "Select date"
    },
    format: {
      type: String,
      default: "MMM D, YYYY"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minDate: {
      type: [Date, String, null],
      default: null
    },
    maxDate: {
      type: [Date, String, null],
      default: null
    },
    disabledDates: {
      type: Array,
      default: () => []
    }
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      isOpen: false,
      showYearPicker: false,
      currentDate: moment(),
      selectedDate: null
    };
  },
  computed: {
    displayValue() {
      if (!this.selectedDate) return "";
      return moment(this.selectedDate).format(this.format);
    },
    currentMonthYear() {
      return this.currentDate.format("MMMM YYYY");
    },
    currentYear() {
      return this.currentDate.year();
    },
    yearRange() {
      const currentYear = this.currentDate.year();
      const years = [];
      for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        years.push(i);
      }
      return years;
    },
    isInModal() {
      return this.$el && this.$el.closest(".fixed.inset-0");
    },
    dropdownStyle() {
      if (!this.isInModal || !this.isOpen) return {};
      const rect = this.$el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 400;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top = rect.bottom + 4;
      let left = rect.left;
      let width = rect.width;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top - dropdownHeight - 4;
      }
      if (left + width > window.innerWidth) {
        left = window.innerWidth - width - 16;
      }
      if (left < 16) {
        left = 16;
      }
      return {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        right: "auto",
        width: `${width}px`,
        zIndex: 1e4
      };
    },
    dayHeaders() {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    },
    calendarDays() {
      const startOfMonth = this.currentDate.clone().startOf("month");
      const endOfMonth = this.currentDate.clone().endOf("month");
      const startOfCalendar = startOfMonth.clone().startOf("week");
      const endOfCalendar = endOfMonth.clone().endOf("week");
      const days = [];
      const current = startOfCalendar.clone();
      const today = moment();
      while (current.isSameOrBefore(endOfCalendar)) {
        const isToday = current.isSame(today, "day");
        const isSelected = this.selectedDate && current.isSame(this.selectedDate, "day");
        const isOtherMonth = !current.isSame(this.currentDate, "month");
        const isDisabled = this.isDateDisabled(current);
        days.push({
          date: current.date(),
          month: current.month(),
          year: current.year(),
          moment: current.clone(),
          isToday,
          isSelected,
          isOtherMonth,
          isDisabled
        });
        current.add(1, "day");
      }
      return days;
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.selectedDate = moment(newValue).toDate();
        } else {
          this.selectedDate = null;
        }
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("resize", this.updatePosition);
    window.addEventListener("scroll", this.updatePosition, true);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("resize", this.updatePosition);
    window.removeEventListener("scroll", this.updatePosition, true);
  },
  methods: {
    togglePicker() {
      if (this.disabled) return;
      this.isOpen = !this.isOpen;
      this.showYearPicker = false;
    },
    previousMonth() {
      this.currentDate = this.currentDate.clone().subtract(1, "month");
      this.$nextTick(() => {
      });
    },
    nextMonth() {
      this.currentDate = this.currentDate.clone().add(1, "month");
      this.$nextTick(() => {
      });
    },
    selectYear(year) {
      this.currentDate = this.currentDate.clone().year(year);
      this.showYearPicker = false;
    },
    selectDate(day) {
      if (day.isDisabled) return;
      this.selectedDate = day.moment.toDate();
      this.$emit("update:modelValue", this.selectedDate);
      this.$emit("change", this.selectedDate);
      this.isOpen = false;
    },
    selectToday() {
      const today = moment().toDate();
      this.selectedDate = today;
      this.currentDate = moment();
      this.$emit("update:modelValue", today);
      this.$emit("change", today);
      this.isOpen = false;
    },
    clearDate() {
      this.selectedDate = null;
      this.$emit("update:modelValue", null);
      this.$emit("change", null);
      this.isOpen = false;
    },
    isDateDisabled(date) {
      if (this.minDate && date.isBefore(this.minDate, "day")) return true;
      if (this.maxDate && date.isAfter(this.maxDate, "day")) return true;
      return this.disabledDates.some(
        (disabledDate) => date.isSame(moment(disabledDate), "day")
      );
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false;
        this.showYearPicker = false;
      }
    },
    handleKeydown(event) {
      if (!this.isOpen) return;
      switch (event.key) {
        case "Escape":
          this.isOpen = false;
          this.showYearPicker = false;
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.previousMonth();
          break;
        case "ArrowRight":
          event.preventDefault();
          this.nextMonth();
          break;
      }
    },
    updatePosition() {
      if (this.isInModal && this.isOpen) {
        this.$forceUpdate();
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["custom-date-picker", { "is-open": $data.isOpen }]
  }, _attrs))} data-v-65cc1255><div class="date-picker-trigger" tabindex="0" role="button"${ssrRenderAttr("aria-expanded", $data.isOpen)}${ssrRenderAttr("aria-label", $props.placeholder)} data-v-65cc1255><div class="trigger-content" data-v-65cc1255>`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "calendar",
    class: "w-4 h-4 text-gray-500"
  }, null, _parent));
  _push(`<span class="trigger-text" data-v-65cc1255>${ssrInterpolate($options.displayValue || $props.placeholder)}</span>`);
  _push(ssrRenderComponent(_component_Icon, {
    name: $data.isOpen ? "chevron-up" : "chevron-down",
    class: "w-4 h-4 text-gray-400 transition-transform duration-200"
  }, null, _parent));
  _push(`</div></div>`);
  if ($data.isOpen) {
    _push(`<div class="${ssrRenderClass(["calendar-dropdown", { "modal-positioning": $options.isInModal }])}" style="${ssrRenderStyle($options.dropdownStyle)}" data-v-65cc1255><div class="calendar-header" data-v-65cc1255><button class="nav-button" type="button" aria-label="Previous month" data-v-65cc1255>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "chevron-left",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><div class="month-year-display" data-v-65cc1255><button class="month-year-button" type="button" data-v-65cc1255>${ssrInterpolate($options.currentMonthYear)}</button></div><button class="nav-button" type="button" aria-label="Next month" data-v-65cc1255>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "chevron-right",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div>`);
    if ($data.showYearPicker) {
      _push(`<div class="year-picker" data-v-65cc1255><div class="year-grid" data-v-65cc1255><!--[-->`);
      ssrRenderList($options.yearRange, (year) => {
        _push(`<button class="${ssrRenderClass(["year-button", { "is-selected": year === $options.currentYear }])}" type="button" data-v-65cc1255>${ssrInterpolate(year)}</button>`);
      });
      _push(`<!--]--></div></div>`);
    } else {
      _push(`<div class="calendar-grid" data-v-65cc1255><div class="day-headers" data-v-65cc1255><!--[-->`);
      ssrRenderList($options.dayHeaders, (day) => {
        _push(`<div class="day-header" data-v-65cc1255>${ssrInterpolate(day)}</div>`);
      });
      _push(`<!--]--></div><div class="calendar-days" data-v-65cc1255><!--[-->`);
      ssrRenderList($options.calendarDays, (day) => {
        _push(`<button class="${ssrRenderClass([
          "calendar-day",
          {
            "is-today": day.isToday,
            "is-selected": day.isSelected,
            "is-other-month": day.isOtherMonth,
            "is-disabled": day.isDisabled
          }
        ])}"${ssrIncludeBooleanAttr(day.isDisabled) ? " disabled" : ""} type="button" data-v-65cc1255>${ssrInterpolate(day.date)}</button>`);
      });
      _push(`<!--]--></div></div>`);
    }
    _push(`<div class="calendar-footer" data-v-65cc1255><button class="today-button" type="button" data-v-65cc1255> Today </button><button class="clear-button" type="button" data-v-65cc1255> Clear </button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Components/DatePicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const DatePicker = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-65cc1255"]]);
export {
  DatePicker as D
};
