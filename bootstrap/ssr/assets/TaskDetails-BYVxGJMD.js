import { Head, Link } from "@inertiajs/vue3";
import { I as Icon } from "./Layout-DXJEf-iu.js";
import { mergeProps, useSSRContext, resolveComponent, ref } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderTeleport } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { D as DatePicker } from "./DatePicker-6Ds_7_ns.js";
import moment from "moment";
import "moment-duration-format";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
const _sfc_main$4 = {
  name: "loader"
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "processing-overlay flex justify-center pt-20" }, _attrs))}><div class="background"></div><div class="loader"><svg width="80px" height="80px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style="${ssrRenderStyle({ "background": "none" })}"><circle cx="75" cy="50" fill="#ffffff" r="6.39718"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.875s"></animate></circle><circle cx="67.678" cy="67.678" fill="#ffffff" r="4.8"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.75s"></animate></circle><circle cx="50" cy="75" fill="#ffffff" r="4.8"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.625s"></animate></circle><circle cx="32.322" cy="67.678" fill="#ffffff" r="4.8"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate></circle><circle cx="25" cy="50" fill="#ffffff" r="4.8"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.375s"></animate></circle><circle cx="32.322" cy="32.322" fill="#ffffff" r="4.80282"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate></circle><circle cx="50" cy="25" fill="#ffffff" r="6.40282"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="-0.125s"></animate></circle><circle cx="67.678" cy="32.322" fill="#ffffff" r="7.99718"><animate attributeName="r" values="4.8;4.8;8;4.8;4.8" times="0;0.1;0.2;0.3;1" dur="1s" repeatCount="indefinite" begin="0s"></animate></circle></svg></div></div>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Loader.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const Loader = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$3]]);
const _sfc_main$3 = {
  name: "DateTimePicker",
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
      default: "Select date & time"
    },
    format: {
      type: String,
      default: "MMM D, YYYY h:mm A"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    is24Hour: {
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
  emits: ["update:modelValue", "change", "update:is24Hour"],
  data() {
    return {
      isOpen: false,
      currentMode: "date",
      showYearPicker: false,
      currentDate: moment(),
      selectedDate: null,
      selectedHour: 12,
      selectedMinute: 0,
      selectedPeriod: "AM",
      localIs24Hour: false
    };
  },
  computed: {
    displayValue() {
      if (!this.modelValue) return "";
      return moment(this.modelValue).format(this.format);
    },
    is24HourFormat() {
      return this.is24Hour !== void 0 ? this.is24Hour : this.localIs24Hour;
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
    },
    availableHours() {
      const hours = [];
      if (this.is24HourFormat) {
        for (let i = 0; i < 24; i++) {
          hours.push({
            value: i,
            display: i.toString().padStart(2, "0")
          });
        }
      } else {
        for (let i = 1; i <= 12; i++) {
          hours.push({
            value: i,
            display: i.toString()
          });
        }
      }
      return hours;
    },
    availableMinutes() {
      const minutes = [];
      for (let i = 0; i < 60; i += 5) {
        minutes.push(i);
      }
      return minutes;
    },
    timePresets() {
      return [
        { label: "9:00 AM", value: { hour: 9, minute: 0, period: "AM" } },
        { label: "12:00 PM", value: { hour: 12, minute: 0, period: "PM" } },
        { label: "1:00 PM", value: { hour: 1, minute: 0, period: "PM" } },
        { label: "5:00 PM", value: { hour: 5, minute: 0, period: "PM" } },
        { label: "6:00 PM", value: { hour: 6, minute: 0, period: "PM" } },
        { label: "9:00 PM", value: { hour: 9, minute: 0, period: "PM" } }
      ];
    },
    isInModal() {
      return this.$el && this.$el.closest(".fixed.inset-0");
    },
    dropdownStyle() {
      if (!this.isInModal || !this.isOpen) return {};
      const rect = this.$el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 500;
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
    }
  },
  watch: {
    is24Hour: {
      immediate: true,
      handler(newValue) {
        if (newValue !== void 0) {
          this.localIs24Hour = newValue;
        }
      }
    },
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const momentTime = moment(newValue);
          this.selectedDate = momentTime.toDate();
          this.selectedHour = momentTime.hour();
          this.selectedMinute = momentTime.minute();
          this.selectedPeriod = momentTime.format("A");
        } else {
          this.selectedDate = null;
          this.selectedHour = this.is24HourFormat ? 0 : 12;
          this.selectedMinute = 0;
          this.selectedPeriod = "AM";
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
    toggleFormat() {
      this.localIs24Hour = !this.localIs24Hour;
      if (this.localIs24Hour) {
        this.selectedHour = 0;
      } else {
        this.selectedHour = 12;
      }
      this.selectedPeriod = "AM";
      this.$emit("update:is24Hour", this.localIs24Hour);
    },
    toggleMode() {
      this.currentMode = this.currentMode === "date" ? "time" : "date";
    },
    setMode(mode) {
      this.currentMode = mode;
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
      this.emitDateTime();
    },
    selectHour(hour) {
      this.selectedHour = hour;
      this.emitDateTime();
    },
    selectMinute(minute) {
      this.selectedMinute = minute;
      this.emitDateTime();
    },
    selectPeriod(period) {
      this.selectedPeriod = period;
      this.emitDateTime();
    },
    selectPreset(preset) {
      this.selectedHour = preset.value.hour;
      this.selectedMinute = preset.value.minute;
      this.selectedPeriod = preset.value.period;
      this.emitDateTime();
    },
    selectNow() {
      const now = moment();
      this.selectedDate = now.toDate();
      this.selectedHour = now.hour();
      this.selectedMinute = now.minute();
      this.selectedPeriod = now.format("A");
      this.emitDateTime();
    },
    clearDateTime() {
      this.selectedDate = null;
      this.selectedHour = this.is24HourFormat ? 0 : 12;
      this.selectedMinute = 0;
      this.selectedPeriod = "AM";
      this.$emit("update:modelValue", null);
      this.$emit("change", null);
      this.isOpen = false;
    },
    confirmSelection() {
      this.isOpen = false;
    },
    emitDateTime() {
      if (!this.selectedDate) return;
      let hour = this.selectedHour;
      if (!this.is24HourFormat) {
        if (this.selectedPeriod === "AM" && hour === 12) {
          hour = 0;
        } else if (this.selectedPeriod === "PM" && hour !== 12) {
          hour += 12;
        }
      }
      const dateTime = moment(this.selectedDate).hour(hour).minute(this.selectedMinute).second(0).millisecond(0).toDate();
      this.$emit("update:modelValue", dateTime);
      this.$emit("change", dateTime);
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
          if (this.currentMode === "date") {
            event.preventDefault();
            this.previousMonth();
          }
          break;
        case "ArrowRight":
          if (this.currentMode === "date") {
            event.preventDefault();
            this.nextMonth();
          }
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
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["custom-datetime-picker", { "is-open": $data.isOpen }]
  }, _attrs))} data-v-80392d7c><div class="datetime-picker-trigger" tabindex="0" role="button"${ssrRenderAttr("aria-expanded", $data.isOpen)}${ssrRenderAttr("aria-label", $props.placeholder)} data-v-80392d7c><div class="trigger-content" data-v-80392d7c>`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "calendar",
    class: "w-4 h-4 text-gray-500"
  }, null, _parent));
  _push(`<span class="trigger-text" data-v-80392d7c>${ssrInterpolate($options.displayValue || $props.placeholder)}</span>`);
  _push(ssrRenderComponent(_component_Icon, {
    name: $data.isOpen ? "chevron-up" : "chevron-down",
    class: "w-4 h-4 text-gray-400 transition-transform duration-200"
  }, null, _parent));
  _push(`</div></div>`);
  if ($data.isOpen) {
    _push(`<div class="${ssrRenderClass(["datetime-picker-dropdown", { "modal-positioning": $options.isInModal }])}" style="${ssrRenderStyle($options.dropdownStyle)}" data-v-80392d7c><div class="datetime-picker-header" data-v-80392d7c><h3 class="datetime-picker-title" data-v-80392d7c>Select Date &amp; Time</h3><div class="header-actions" data-v-80392d7c><button class="format-toggle" type="button" data-v-80392d7c>${ssrInterpolate($options.is24HourFormat ? "24H" : "12H")}</button><button class="mode-toggle" type="button" data-v-80392d7c>${ssrInterpolate($data.currentMode === "date" ? "Time" : "Date")}</button></div></div><div class="mode-tabs" data-v-80392d7c><button class="${ssrRenderClass(["mode-tab", { "is-active": $data.currentMode === "date" }])}" type="button" data-v-80392d7c>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "calendar",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Date </button><button class="${ssrRenderClass(["mode-tab", { "is-active": $data.currentMode === "time" }])}" type="button" data-v-80392d7c>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "clock",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Time </button></div>`);
    if ($data.currentMode === "date") {
      _push(`<div class="date-section" data-v-80392d7c><div class="date-navigation" data-v-80392d7c><button class="nav-button" type="button" aria-label="Previous month" data-v-80392d7c>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "chevron-left",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><div class="month-year-display" data-v-80392d7c><button class="month-year-button" type="button" data-v-80392d7c>${ssrInterpolate($options.currentMonthYear)}</button></div><button class="nav-button" type="button" aria-label="Next month" data-v-80392d7c>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "chevron-right",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div>`);
      if ($data.showYearPicker) {
        _push(`<div class="year-picker" data-v-80392d7c><div class="year-grid" data-v-80392d7c><!--[-->`);
        ssrRenderList($options.yearRange, (year) => {
          _push(`<button class="${ssrRenderClass(["year-button", { "is-selected": year === $options.currentYear }])}" type="button" data-v-80392d7c>${ssrInterpolate(year)}</button>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="calendar-grid" data-v-80392d7c><div class="day-headers" data-v-80392d7c><!--[-->`);
        ssrRenderList($options.dayHeaders, (day) => {
          _push(`<div class="day-header" data-v-80392d7c>${ssrInterpolate(day)}</div>`);
        });
        _push(`<!--]--></div><div class="calendar-days" data-v-80392d7c><!--[-->`);
        ssrRenderList($options.calendarDays, (day) => {
          _push(`<button class="${ssrRenderClass([
            "calendar-day",
            {
              "is-today": day.isToday,
              "is-selected": day.isSelected,
              "is-other-month": day.isOtherMonth,
              "is-disabled": day.isDisabled
            }
          ])}"${ssrIncludeBooleanAttr(day.isDisabled) ? " disabled" : ""} type="button" data-v-80392d7c>${ssrInterpolate(day.date)}</button>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.currentMode === "time") {
      _push(`<div class="time-section" data-v-80392d7c><div class="time-selection" data-v-80392d7c><div class="time-column" data-v-80392d7c><label class="time-label" data-v-80392d7c>Hour</label><div class="time-scroll-container" data-v-80392d7c><div class="time-scroll-list" data-v-80392d7c><!--[-->`);
      ssrRenderList($options.availableHours, (hour) => {
        _push(`<button class="${ssrRenderClass([
          "time-option",
          { "is-selected": hour.value === $data.selectedHour }
        ])}" type="button" data-v-80392d7c>${ssrInterpolate(hour.display)}</button>`);
      });
      _push(`<!--]--></div></div></div><div class="time-column" data-v-80392d7c><label class="time-label" data-v-80392d7c>Minute</label><div class="time-scroll-container" data-v-80392d7c><div class="time-scroll-list" data-v-80392d7c><!--[-->`);
      ssrRenderList($options.availableMinutes, (minute) => {
        _push(`<button class="${ssrRenderClass([
          "time-option",
          { "is-selected": minute === $data.selectedMinute }
        ])}" type="button" data-v-80392d7c>${ssrInterpolate(minute.toString().padStart(2, "0"))}</button>`);
      });
      _push(`<!--]--></div></div></div>`);
      if (!$options.is24HourFormat) {
        _push(`<div class="time-column" data-v-80392d7c><label class="time-label" data-v-80392d7c>Period</label><div class="time-scroll-container" data-v-80392d7c><div class="time-scroll-list" data-v-80392d7c><button class="${ssrRenderClass([
          "time-option",
          { "is-selected": $data.selectedPeriod === "AM" }
        ])}" type="button" data-v-80392d7c> AM </button><button class="${ssrRenderClass([
          "time-option",
          { "is-selected": $data.selectedPeriod === "PM" }
        ])}" type="button" data-v-80392d7c> PM </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="time-presets" data-v-80392d7c><h4 class="presets-title" data-v-80392d7c>Quick Select</h4><div class="presets-grid" data-v-80392d7c><!--[-->`);
      ssrRenderList($options.timePresets, (preset) => {
        _push(`<button class="preset-button" type="button" data-v-80392d7c>${ssrInterpolate(preset.label)}</button>`);
      });
      _push(`<!--]--></div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="datetime-picker-footer" data-v-80392d7c><button class="now-button" type="button" data-v-80392d7c> Now </button><button class="clear-button" type="button" data-v-80392d7c> Clear </button><button class="confirm-button" type="button" data-v-80392d7c> Done </button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Components/DateTimePicker.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const DateTimePicker = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-80392d7c"]]);
const _sfc_main$2 = {
  name: "CustomEditor",
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "Start typing..."
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showStatusBar: {
      type: Boolean,
      default: true
    },
    enableAutoSave: {
      type: Boolean,
      default: true
    },
    autoSaveInterval: {
      type: Number,
      default: 3e4
      // 30 seconds
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  emits: ["update:modelValue", "focus", "blur", "mention"],
  data() {
    return {
      content: "",
      isFocused: false,
      showMentionDropdown: false,
      mentionQuery: "",
      selectedMentionIndex: 0,
      mentionStartPos: 0,
      history: [],
      historyIndex: -1,
      showEmojiPicker: false,
      showExportMenu: false,
      showKeyboardShortcuts: false,
      isFullscreen: false,
      isAutoSaving: false,
      lastSaved: null,
      autoSaveTimer: null,
      inputDebounceTimer: null,
      isTyping: false,
      selectedImage: null,
      showImageControls: false,
      imageControlsPosition: { x: 0, y: 0 },
      emojiPickerPosition: { top: 0, left: 0 },
      savedCursorPosition: null,
      isImageUploading: false,
      notification: { message: "", type: "", show: false },
      notificationTimer: null,
      toolbarStateCache: {},
      toolbarUpdateTimer: null,
      isExecutingCommand: false,
      emojiList: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "☹️",
        "😣",
        "😖",
        "😫",
        "😩",
        "🥺",
        "😢",
        "😭",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
        "😳",
        "🥵",
        "🥶",
        "😱",
        "😨",
        "😰",
        "😥",
        "😓",
        "🤗",
        "🤔",
        "🤭",
        "🤫",
        "🤥",
        "😶",
        "😐",
        "😑",
        "😬",
        "🙄",
        "😯",
        "😦",
        "😧",
        "😮",
        "😲",
        "🥱",
        "😴",
        "🤤",
        "😪",
        "😵",
        "🤐",
        "🥴",
        "🤢",
        "🤮",
        "🤧",
        "😷",
        "🤒",
        "🤕",
        "🤑",
        "🤠",
        "😈",
        "👿",
        "👹",
        "👺",
        "🤡",
        "💩",
        "👻",
        "💀",
        "☠️",
        "👽",
        "👾",
        "🤖",
        "🎃",
        "😺",
        "😸",
        "😹",
        "😻",
        "😼",
        "😽",
        "🙀",
        "😿",
        "😾",
        "👶",
        "🧒",
        "👦",
        "👧",
        "🧑",
        "👨",
        "👩",
        "🧓",
        "👴",
        "👵",
        "👤",
        "👥",
        "🫂",
        "👪",
        "👨‍👩‍👧",
        "👨‍👩‍👧‍👦",
        "👨‍👩‍👦‍👦",
        "👨‍👩‍👧‍👧",
        "👨‍👨‍👦",
        "👨‍👨‍👧",
        "👨‍👨‍👧‍👦",
        "👨‍👨‍👦‍👦",
        "👨‍👨‍👧‍👧",
        "👩‍👩‍👦",
        "👩‍👩‍👧",
        "👩‍👩‍👧‍👦",
        "👩‍👩‍👦‍👦",
        "👩‍👩‍👧‍👧",
        "👨‍👦",
        "👨‍👦‍👦",
        "👨‍👧",
        "👨‍👧‍👦",
        "👨‍👧‍👧",
        "👩‍👦",
        "👩‍👦‍👦",
        "👩‍👧",
        "👩‍👧‍👦",
        "👩‍👧‍👧",
        "🗣️",
        "👤",
        "👥",
        "🫂",
        "👋",
        "🤚",
        "🖐️",
        "✋",
        "🖖",
        "👌",
        "🤌",
        "🤏",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "🖕",
        "👇",
        "☝️",
        "👍",
        "👎",
        "✊",
        "👊",
        "🤛",
        "🤜",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "✍️",
        "💅",
        "🤳",
        "💪",
        "🦾",
        "🦿",
        "🦵",
        "🦶",
        "👂",
        "🦻",
        "👃",
        "🧠",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👅",
        "👄",
        "💋",
        "🩸",
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉️",
        "☸️",
        "✡️",
        "🔯",
        "🕎",
        "☯️",
        "☦️",
        "🛐",
        "⛎",
        "♈",
        "♉",
        "♊",
        "♋",
        "♌",
        "♍",
        "♎",
        "♏",
        "♐",
        "♑",
        "♒",
        "♓",
        "🆔",
        "⚛️",
        "🉑",
        "☢️",
        "☣️",
        "📴",
        "📳",
        "🈶",
        "🈚",
        "🈸",
        "🈺",
        "🈷️",
        "✴️",
        "🆚",
        "💮",
        "🉐",
        "㊙️",
        "㊗️",
        "🈴",
        "🈵",
        "🈹",
        "🈲",
        "🅰️",
        "🅱️",
        "🆎",
        "🆑",
        "🅾️",
        "🆘",
        "❌",
        "⭕",
        "🛑",
        "⛔",
        "📛",
        "🚫",
        "💯",
        "💢",
        "♨️",
        "🚷",
        "🚯",
        "🚳",
        "🚱",
        "🔞",
        "📵",
        "🚭",
        "❗",
        "❕",
        "❓",
        "❔",
        "‼️",
        "⁉️",
        "🔅",
        "🔆",
        "〽️",
        "⚠️",
        "🚸",
        "🔱",
        "⚜️",
        "🔰",
        "♻️",
        "✅",
        "🈯",
        "💹",
        "❇️",
        "✳️",
        "❎",
        "🌐",
        "💠",
        "Ⓜ️",
        "🌀",
        "💤",
        "🏧",
        "🚾",
        "♿",
        "🅿️",
        "🈳",
        "🈂️",
        "🛂",
        "🛃",
        "🛄",
        "🛅",
        "🚹",
        "🚺",
        "🚼",
        "🚻",
        "🚮",
        "🎦",
        "📶",
        "🈁",
        "🔣",
        "🔤",
        "🔡",
        "🔠",
        "🆖",
        "🆗",
        "🆙",
        "🆒",
        "🆕",
        "🆓",
        "0️⃣",
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "9️⃣",
        "🔟",
        "🔢",
        "#️⃣",
        "*️⃣",
        "⏏️",
        "▶️",
        "⏸️",
        "⏯️",
        "⏹️",
        "⏺️",
        "⏭️",
        "⏮️",
        "⏩",
        "⏪",
        "⏫",
        "⏬",
        "◀️",
        "🔼",
        "🔽",
        "➡️",
        "⬅️",
        "⬆️",
        "⬇️",
        "↗️",
        "↘️",
        "↙️",
        "↖️",
        "↕️",
        "↔️",
        "↩️",
        "↪️",
        "⤴️",
        "⤵️",
        "🔃",
        "🔄",
        "🔙",
        "🔚",
        "🔛",
        "🔜",
        "🔝",
        "🛐",
        "⚛️",
        "🕉️",
        "✡️",
        "☸️",
        "☯️",
        "✝️",
        "☦️",
        "☪️",
        "☮️",
        "🕎",
        "🔯",
        "♈",
        "♉",
        "♊",
        "♋",
        "♌",
        "♍",
        "♎",
        "♏",
        "♐",
        "♑",
        "♒",
        "♓",
        "⛎"
      ]
    };
  },
  computed: {
    filteredUsers() {
      if (!this.mentionQuery) return this.users.slice(0, 5);
      return this.users.filter(
        (user) => user.name.toLowerCase().includes(this.mentionQuery.toLowerCase()) || user.email.toLowerCase().includes(this.mentionQuery.toLowerCase())
      ).slice(0, 5);
    },
    emojiPickerStyle() {
      return {
        position: "absolute",
        top: `${this.emojiPickerPosition.top}px`,
        left: `${this.emojiPickerPosition.left}px`,
        zIndex: 1e3
      };
    },
    wordCount() {
      if (!this.content) return 0;
      const text = this.content.replace(/<[^>]*>/g, "").trim();
      return text ? text.split(/\s+/).length : 0;
    },
    charCount() {
      if (!this.content) return 0;
      return this.content.replace(/<[^>]*>/g, "").length;
    },
    readingTime() {
      const wordsPerMinute = 200;
      const minutes = Math.ceil(this.wordCount / wordsPerMinute);
      return minutes;
    }
  },
  mounted() {
    if (this.$refs.editor) {
      this.$refs.editor.innerHTML = this.content || "";
    }
    this.saveToHistory();
    this.startAutoSave();
    window.customEditorInstance = this;
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    document.addEventListener("keydown", this.handleGlobalKeydown);
    document.addEventListener("selectionchange", this.onSelectionChange);
  },
  beforeUnmount() {
    this.stopAutoSave();
    if (this.inputDebounceTimer) {
      clearTimeout(this.inputDebounceTimer);
    }
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    if (this.toolbarUpdateTimer) {
      clearTimeout(this.toolbarUpdateTimer);
    }
    document.removeEventListener("selectionchange", this.onSelectionChange);
    if (window.customEditorInstance === this) {
      window.customEditorInstance = null;
    }
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("keydown", this.handleGlobalKeydown);
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue !== this.content) {
          this.content = newValue || "";
          this.$nextTick(() => {
            if (this.$refs.editor && this.$refs.editor.innerHTML !== this.content) {
              this.$refs.editor.innerHTML = this.content;
            }
          });
        }
      }
    }
  },
  methods: {
    onInput(event) {
      this.content = event.target.innerHTML;
      this.isTyping = true;
      if (this.inputDebounceTimer) {
        clearTimeout(this.inputDebounceTimer);
      }
      this.inputDebounceTimer = setTimeout(() => {
        this.$emit("update:modelValue", this.content);
        this.saveToHistory();
        this.isTyping = false;
      }, 300);
      this.handleMentions();
    },
    onKeydown(event) {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "b":
            event.preventDefault();
            this.execCommand("bold");
            break;
          case "i":
            event.preventDefault();
            this.execCommand("italic");
            break;
          case "u":
            event.preventDefault();
            this.execCommand("underline");
            break;
          case "k":
            event.preventDefault();
            this.insertLink();
            break;
          case "z":
            if (event.shiftKey) {
              event.preventDefault();
              this.redo();
            } else {
              event.preventDefault();
              this.undo();
            }
            break;
          case "?":
            event.preventDefault();
            this.showKeyboardShortcuts = !this.showKeyboardShortcuts;
            break;
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key) {
          case "L":
            event.preventDefault();
            this.execCommand("justifyLeft");
            break;
          case "E":
            event.preventDefault();
            this.execCommand("justifyCenter");
            break;
          case "R":
            event.preventDefault();
            this.execCommand("justifyRight");
            break;
          case "J":
            event.preventDefault();
            this.execCommand("justifyFull");
            break;
          case "8":
            event.preventDefault();
            this.execCommand("insertUnorderedList");
            break;
          case "7":
            event.preventDefault();
            this.execCommand("insertOrderedList");
            break;
          case ">":
            event.preventDefault();
            this.execCommand("formatBlock", "<blockquote>");
            break;
          case "I":
            event.preventDefault();
            this.triggerImageUpload();
            break;
          case "N":
            event.preventDefault();
            this.clearFormatting();
            break;
        }
      }
      if (event.key === "Delete" && this.selectedImage) {
        event.preventDefault();
        this.deleteSelectedImage();
        return;
      }
      if (this.showMentionDropdown) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            this.selectedMentionIndex = Math.min(
              this.selectedMentionIndex + 1,
              this.filteredUsers.length - 1
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
            this.scrollToSelectedMention();
            break;
          case "ArrowDown":
            event.preventDefault();
            this.selectedMentionIndex = Math.min(this.selectedMentionIndex + 1, this.filteredUsers.length - 1);
            this.scrollToSelectedMention();
            break;
          case "Enter":
          case "Tab":
            event.preventDefault();
            if (this.filteredUsers[this.selectedMentionIndex]) {
              this.selectMention(this.filteredUsers[this.selectedMentionIndex]);
            }
            break;
          case "Escape":
            this.hideMentionDropdown();
            break;
        }
      }
    },
    onKeyup() {
      if (this.toolbarUpdateTimer) {
        clearTimeout(this.toolbarUpdateTimer);
      }
      this.toolbarUpdateTimer = setTimeout(() => {
        this.updateToolbarState();
      }, 50);
    },
    onPaste(event) {
      event.preventDefault();
      const clipboardData = event.clipboardData || window.clipboardData;
      const htmlData = clipboardData.getData("text/html");
      const textData = clipboardData.getData("text/plain");
      const files = clipboardData.files;
      if (files && files.length > 0) {
        const imageFile = Array.from(files).find((file) => file.type.startsWith("image/"));
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.insertImage(e.target.result);
            this.showNotification("Image pasted successfully", "success");
          };
          reader.onerror = () => {
            this.showNotification("Error pasting image", "error");
          };
          reader.readAsDataURL(imageFile);
          return;
        }
      }
      if (htmlData) {
        this.insertFormattedHTML(htmlData);
      } else if (textData) {
        this.insertPlainText(textData);
      }
    },
    onFocus() {
      this.isFocused = true;
      this.$emit("focus");
    },
    onBlur() {
      this.isFocused = false;
      this.hideMentionDropdown();
      this.$emit("blur");
    },
    onClick(event) {
      this.$nextTick(() => {
        this.updateToolbarState();
      });
      if (event.target.tagName === "IMG" && event.target.classList.contains("editable-image")) {
        event.preventDefault();
        event.stopPropagation();
        this.selectImage(event.target);
        return;
      }
      if (this.showImageControls && !event.target.closest(".image-controls")) {
        this.deselectImage();
      }
    },
    execCommand(command, value = null) {
      if (this.isExecutingCommand) {
        return;
      }
      this.isExecutingCommand = true;
      try {
        if (!this.isFocused && this.$refs.editor) {
          this.$refs.editor.focus();
        }
        this.$nextTick(() => {
          try {
            const success = document.execCommand(command, false, value);
            if (!success) {
              console.warn(`Command "${command}" failed to execute`);
              this.showNotification(`Unable to apply ${command} formatting`, "error", 2e3);
              this.isExecutingCommand = false;
              return;
            }
            this.content = this.$refs.editor.innerHTML;
            this.$emit("update:modelValue", this.content);
            this.saveToHistory();
            setTimeout(() => {
              this.updateToolbarState();
              this.isExecutingCommand = false;
            }, 10);
          } catch (error) {
            console.error("Error executing command:", error);
            this.showNotification("An error occurred while applying formatting", "error");
            this.isExecutingCommand = false;
          }
        });
      } catch (error) {
        console.error("Error in execCommand:", error);
        this.showNotification("An error occurred while applying formatting", "error");
        this.isExecutingCommand = false;
      }
    },
    formatBlock(event) {
      const value = event.target.value;
      if (value) {
        this.$refs.editor.focus();
        try {
          document.execCommand("formatBlock", false, value);
          this.content = this.$refs.editor.innerHTML;
          this.$emit("update:modelValue", this.content);
          this.saveToHistory();
          this.updateToolbarState();
        } catch (error) {
          console.error("Error formatting block:", error);
          this.showNotification("Unable to apply formatting", "error");
        }
      }
      this.$nextTick(() => {
        event.target.value = "";
      });
    },
    isActive(command) {
      var _a;
      if (this.toolbarStateCache.hasOwnProperty(command)) {
        return this.toolbarStateCache[command];
      }
      try {
        if (command === "blockquote") {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.commonAncestorContainer;
            const blockquote = node.nodeType === Node.ELEMENT_NODE ? node.closest("blockquote") : (_a = node.parentElement) == null ? void 0 : _a.closest("blockquote");
            const isActive2 = !!blockquote;
            this.toolbarStateCache[command] = isActive2;
            return isActive2;
          }
          return false;
        }
        const isActive = document.queryCommandState(command);
        this.toolbarStateCache[command] = isActive;
        return isActive;
      } catch (e) {
        this.toolbarStateCache[command] = false;
        return false;
      }
    },
    insertLink() {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      const url = prompt("Enter URL:", selectedText ? "" : "https://");
      if (url && url.trim()) {
        const linkUrl = url.trim();
        if (!linkUrl.match(/^https?:\/\//i) && !linkUrl.match(/^mailto:/i)) {
          if (confirm("URL should start with http:// or https://. Add https:// automatically?")) {
            this.execCommand("createLink", "https://" + linkUrl);
          } else {
            this.execCommand("createLink", linkUrl);
          }
        } else {
          this.execCommand("createLink", linkUrl);
        }
      }
    },
    onMouseUp() {
      this.$nextTick(() => {
        this.updateToolbarState();
      });
    },
    onSelectionChange(event) {
      if (this.isFocused && this.$refs.editor) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (this.$refs.editor.contains(range.commonAncestorContainer)) {
            if (this.toolbarUpdateTimer) {
              clearTimeout(this.toolbarUpdateTimer);
            }
            this.toolbarUpdateTimer = setTimeout(() => {
              this.updateToolbarState();
            }, 50);
          }
        }
      }
    },
    toggleBlockquote() {
      if (this.isActive("blockquote")) {
        this.execCommand("formatBlock", "<p>");
      } else {
        this.execCommand("formatBlock", "<blockquote>");
      }
    },
    clearFormatting() {
      this.execCommand("removeFormat");
    },
    insertFormattedHTML(html) {
      const cleanedHTML = this.sanitizeHTML(html);
      this.insertHTMLAtCursor(cleanedHTML);
    },
    insertPlainText(text) {
      this.execCommand("insertText", text);
    },
    sanitizeHTML(html) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const allowedElements = [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "s",
        "strike",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "div",
        "span",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "a"
      ];
      return this.cleanHTML(tempDiv, allowedElements);
    },
    cleanHTML(element, allowedElements) {
      const children = Array.from(element.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowedElements.includes(child.tagName.toLowerCase())) {
            const span = document.createElement("span");
            span.innerHTML = child.innerHTML;
            child.parentNode.replaceChild(span, child);
          } else {
            this.cleanHTML(child, allowedElements);
          }
        }
      });
      return element.innerHTML;
    },
    insertHTMLAtCursor(html) {
      const selection = window.getSelection();
      let savedRange = null;
      if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      this.$refs.editor.focus();
      if (savedRange && this.$refs.editor.contains(savedRange.commonAncestorContainer)) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      } else {
        const range2 = document.createRange();
        range2.selectNodeContents(this.$refs.editor);
        range2.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range2);
      }
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      this.content = this.$refs.editor.innerHTML;
      this.$emit("update:modelValue", this.content);
      this.saveToHistory();
    },
    handleMentions() {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent;
        const cursorPos = range.startOffset;
        const beforeCursor = text.substring(0, cursorPos);
        const atIndex = beforeCursor.lastIndexOf("@");
        if (atIndex !== -1) {
          const query = beforeCursor.substring(atIndex + 1);
          if (!query.includes(" ") && !query.includes("\n") && query.length >= 0) {
            const charBeforeAt = atIndex > 0 ? beforeCursor.charAt(atIndex - 1) : "";
            const isValidMentionContext = charBeforeAt === "" || charBeforeAt === " " || charBeforeAt === "\n";
            if (isValidMentionContext) {
              this.mentionQuery = query;
              this.mentionStartPos = atIndex;
              this.showMentionDropdown = true;
              this.selectedMentionIndex = 0;
              return;
            }
          }
        }
      }
      this.hideMentionDropdown();
    },
    selectMention(user) {
      this.$refs.editor.focus();
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        const range2 = document.createRange();
        range2.selectNodeContents(this.$refs.editor);
        range2.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range2);
      }
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent;
        const beforeAt = text.substring(0, this.mentionStartPos);
        const afterQuery = text.substring(range.startOffset);
        const mentionSpan = document.createElement("span");
        mentionSpan.className = "mention";
        mentionSpan.setAttribute("data-user-id", user.id);
        mentionSpan.setAttribute("data-user-name", user.name);
        mentionSpan.setAttribute("data-user-email", user.email);
        mentionSpan.setAttribute("contenteditable", "false");
        mentionSpan.style.cssText = `
                    background-color: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: default;
                    display: inline-block;
                    margin: 0 1px;
                `;
        mentionSpan.textContent = `@${user.name}`;
        const beforeNode = document.createTextNode(beforeAt);
        const afterNode = document.createTextNode(afterQuery);
        const parent = textNode.parentNode;
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(mentionSpan, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);
        const newRange = document.createRange();
        newRange.setStartAfter(mentionSpan);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.content = this.$refs.editor.innerHTML;
        this.$emit("update:modelValue", this.content);
        this.$emit("mention", user);
      } else {
        const mentionSpan = document.createElement("span");
        mentionSpan.className = "mention";
        mentionSpan.setAttribute("data-user-id", user.id);
        mentionSpan.setAttribute("data-user-name", user.name);
        mentionSpan.setAttribute("data-user-email", user.email);
        mentionSpan.setAttribute("contenteditable", "false");
        mentionSpan.style.cssText = `
                    background-color: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: default;
                    display: inline-block;
                    margin: 0 1px;
                `;
        mentionSpan.textContent = `@${user.name}`;
        range.deleteContents();
        range.insertNode(mentionSpan);
        const newRange = document.createRange();
        newRange.setStartAfter(mentionSpan);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.content = this.$refs.editor.innerHTML;
        this.$emit("update:modelValue", this.content);
        this.$emit("mention", user);
      }
      this.hideMentionDropdown();
    },
    hideMentionDropdown() {
      this.showMentionDropdown = false;
      this.mentionQuery = "";
      this.selectedMentionIndex = 0;
    },
    scrollToSelectedMention() {
      this.$nextTick(() => {
        const activeItem = this.$el.querySelector(".mention-item.active");
        if (activeItem) {
          activeItem.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }
      });
    },
    saveToHistory() {
      if (this.history.length > 50) {
        this.history.shift();
      }
      const currentContent = this.$refs.editor ? this.$refs.editor.innerHTML : this.content;
      if (this.history.length === 0 || this.history[this.history.length - 1] !== currentContent) {
        this.history.push(currentContent);
        this.historyIndex = this.history.length - 1;
      }
    },
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const content = this.history[this.historyIndex];
        this.content = content;
        this.$refs.editor.innerHTML = content;
        this.$emit("update:modelValue", content);
      }
    },
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const content = this.history[this.historyIndex];
        this.content = content;
        this.$refs.editor.innerHTML = content;
        this.$emit("update:modelValue", content);
      }
    },
    placeCursorAtEnd() {
      const editor = this.$refs.editor;
      if (!editor) return;
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    },
    updateToolbarState() {
      this.toolbarStateCache = {};
      if (this.$refs.editor && document.hasFocus()) {
        requestAnimationFrame(() => {
          this.$forceUpdate();
        });
      }
    },
    // New enhanced methods
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) {
        event.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        this.showNotification("Please select a valid image file", "error");
        event.target.value = "";
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showNotification(`Image size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, "error");
        event.target.value = "";
        return;
      }
      this.isImageUploading = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (this.imageToReplace) {
            this.imageToReplace.src = e.target.result;
            this.imageToReplace = null;
            this.updateContent();
            this.showNotification("Image replaced successfully", "success");
          } else {
            this.insertImage(e.target.result);
            this.showNotification("Image inserted successfully", "success");
          }
        } catch (error) {
          console.error("Error handling image:", error);
          this.showNotification("Error processing image", "error");
        } finally {
          this.isImageUploading = false;
        }
      };
      reader.onerror = () => {
        this.showNotification("Error reading image file", "error");
        this.isImageUploading = false;
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    insertImage(src) {
      const img = document.createElement("img");
      img.src = src;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.cursor = "pointer";
      img.style.display = "block";
      img.style.margin = "1rem auto";
      img.classList.add("editable-image");
      img.setAttribute("alt", "Inserted image");
      img.setAttribute("loading", "lazy");
      img.onerror = () => {
        this.showNotification("Failed to load image", "error");
      };
      this.insertHTMLAtCursor(img.outerHTML);
    },
    // Image management methods
    selectImage(img) {
      this.deselectImage();
      this.selectedImage = img;
      img.classList.add("selected-image");
      const rect = img.getBoundingClientRect();
      const editorRect = this.$refs.editor.getBoundingClientRect();
      this.imageControlsPosition = {
        x: rect.left - editorRect.left + rect.width / 2 - 100,
        // Center controls
        y: rect.top - editorRect.top - 60
        // Above image
      };
      this.showImageControls = true;
    },
    deselectImage() {
      if (this.selectedImage) {
        this.selectedImage.classList.remove("selected-image");
        this.selectedImage = null;
      }
      this.showImageControls = false;
    },
    closeImageControls() {
      this.deselectImage();
    },
    alignImage(alignment) {
      if (!this.selectedImage) return;
      this.selectedImage.style.float = alignment === "center" ? "none" : alignment;
      this.selectedImage.style.display = alignment === "center" ? "block" : "inline-block";
      this.selectedImage.style.margin = alignment === "center" ? "0 auto" : "0";
      this.updateContent();
    },
    resizeImage(size) {
      if (!this.selectedImage) return;
      const sizes = {
        small: "25%",
        medium: "50%",
        large: "75%"
      };
      this.selectedImage.style.maxWidth = sizes[size] || "100%";
      this.updateContent();
    },
    replaceImage() {
      if (!this.selectedImage) return;
      this.$refs.imageInput.click();
      this.imageToReplace = this.selectedImage;
    },
    deleteSelectedImage() {
      if (!this.selectedImage) return;
      this.selectedImage.remove();
      this.deselectImage();
      this.updateContent();
    },
    updateContent() {
      this.content = this.$refs.editor.innerHTML;
      this.$emit("update:modelValue", this.content);
      this.saveToHistory();
    },
    deleteTable(buttonElement) {
      const tableWrapper = buttonElement.closest(".table-wrapper");
      if (tableWrapper) {
        tableWrapper.remove();
        this.content = this.$refs.editor.innerHTML;
        this.$emit("update:modelValue", this.content);
        this.saveToHistory();
      }
    },
    insertTable() {
      const rows = prompt("Number of rows (2-10):", "3");
      const cols = prompt("Number of columns (2-10):", "3");
      const numRows = Math.min(Math.max(parseInt(rows) || 3, 2), 10);
      const numCols = Math.min(Math.max(parseInt(cols) || 3, 2), 10);
      let tableHTML = '<div class="table-wrapper" contenteditable="false"><table class="custom-table">';
      tableHTML += "<thead><tr>";
      for (let i = 0; i < numCols; i++) {
        tableHTML += `<th>Header ${i + 1}</th>`;
      }
      tableHTML += "</tr></thead>";
      tableHTML += "<tbody>";
      for (let r = 0; r < numRows; r++) {
        tableHTML += "<tr>";
        for (let c = 0; c < numCols; c++) {
          tableHTML += `<td>Cell ${r + 1}-${c + 1}</td>`;
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</tbody></table>";
      tableHTML += '<div class="table-controls">';
      tableHTML += '<button type="button" onclick="window.customEditorInstance.deleteTable(this)" class="table-delete-btn">';
      tableHTML += "🗑️ Delete Table";
      tableHTML += "</button>";
      tableHTML += "</div></div>";
      this.insertHTMLAtCursor(tableHTML);
      this.showNotification("Table inserted successfully", "success");
    },
    insertHorizontalRule() {
      this.insertHTMLAtCursor('<hr style="margin: 20px 0; border: none; border-top: 2px solid #e5e7eb;">');
      this.showNotification("Horizontal rule inserted", "success", 2e3);
    },
    toggleEmojiPicker() {
      if (!this.showEmojiPicker) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          this.savedCursorPosition = selection.getRangeAt(0).cloneRange();
        } else {
          this.savedCursorPosition = null;
        }
        this.$refs.editor.focus();
        this.$nextTick(() => {
          if (this.$refs.emojiButton) {
            const buttonRect = this.$refs.emojiButton.getBoundingClientRect();
            const editorRect = this.$refs.editor.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            let left = buttonRect.left - editorRect.left;
            let top = buttonRect.bottom - editorRect.top + 5;
            const pickerWidth = 320;
            if (left + pickerWidth > viewportWidth) {
              left = viewportWidth - pickerWidth - 10;
            }
            this.emojiPickerPosition = {
              top,
              left
            };
          }
        });
      }
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    insertEmoji(emoji) {
      this.$refs.editor.focus();
      this.$nextTick(() => {
        const selection = window.getSelection();
        if (this.savedCursorPosition && this.$refs.editor.contains(this.savedCursorPosition.commonAncestorContainer)) {
          selection.removeAllRanges();
          selection.addRange(this.savedCursorPosition);
        } else {
          const range = document.createRange();
          range.selectNodeContents(this.$refs.editor);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        this.insertHTMLAtCursor(emoji);
        this.showEmojiPicker = false;
        this.savedCursorPosition = null;
        this.$refs.editor.dispatchEvent(new Event("input", { bubbles: true }));
      });
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        document.body.style.overflow = "hidden";
        this.$nextTick(() => {
          var _a;
          const toolbar = (_a = this.$el) == null ? void 0 : _a.querySelector(".custom-editor__toolbar");
          if (toolbar) {
            toolbar.style.display = "flex";
            toolbar.style.visibility = "visible";
            toolbar.style.opacity = "1";
          }
          if (this.$refs.editor) {
            this.$refs.editor.focus();
          }
        });
      } else {
        document.body.style.overflow = "";
      }
    },
    startAutoSave() {
      if (this.enableAutoSave && this.autoSaveTimer === null) {
        this.autoSaveTimer = setInterval(() => {
          this.performAutoSave();
        }, this.autoSaveInterval);
      }
    },
    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    },
    performAutoSave() {
      if (this.content && this.content.trim() && !this.isTyping) {
        this.isAutoSaving = true;
        setTimeout(() => {
          this.isAutoSaving = false;
          this.lastSaved = this.formatTime(/* @__PURE__ */ new Date());
        }, 1e3);
      }
    },
    formatTime(date) {
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    },
    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement;
    },
    handleGlobalKeydown(event) {
    },
    // Export functionality
    exportContent(format) {
      this.showExportMenu = false;
      switch (format) {
        case "html":
          this.exportAsHTML();
          break;
        case "markdown":
          this.exportAsMarkdown();
          break;
        case "text":
          this.exportAsText();
          break;
        case "pdf":
          this.exportAsPDF();
          break;
      }
    },
    exportAsHTML() {
      const htmlContent = this.content;
      const blob = new Blob([htmlContent], { type: "text/html" });
      this.downloadFile(blob, "content.html");
    },
    exportAsMarkdown() {
      const markdown = this.htmlToMarkdown(this.content);
      const blob = new Blob([markdown], { type: "text/markdown" });
      this.downloadFile(blob, "content.md");
    },
    exportAsText() {
      const textContent = this.content.replace(/<[^>]*>/g, "");
      const blob = new Blob([textContent], { type: "text/plain" });
      this.downloadFile(blob, "content.txt");
    },
    exportAsPDF() {
      const printWindow = window.open("", "_blank");
      const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Exported Content</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                        h1, h2, h3, h4, h5, h6 { color: #333; }
                        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
                        blockquote { border-left: 4px solid #ddd; margin: 20px 0; padding: 10px 20px; background: #f9f9f9; }
                    </style>
                </head>
                <body>
                    ${this.content}
                </body>
                </html>
            `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    },
    downloadFile(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    showNotification(message, type = "info", duration = 3e3) {
      this.notification = { message, type, show: true };
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer);
      }
      this.notificationTimer = setTimeout(() => {
        this.notification.show = false;
      }, duration);
    },
    htmlToMarkdown(html) {
      let markdown = html;
      markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
      markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
      markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
      markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
      markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
      markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");
      markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
      markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
      markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
      markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
      markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
      markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
      });
      markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1
`) + "\n";
      });
      markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, "> $1\n\n");
      markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, "```\n$1\n```\n\n");
      markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
      markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
      markdown = markdown.replace(/<br[^>]*>/gi, "\n");
      markdown = markdown.replace(/<[^>]*>/g, "");
      markdown = markdown.replace(/\n\s*\n\s*\n/g, "\n\n");
      markdown = markdown.trim();
      return markdown;
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Icon = resolveComponent("Icon");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["custom-editor", { "custom-editor--focused": $data.isFocused, "custom-editor--fullscreen": $data.isFullscreen }]
  }, _attrs))} data-v-883fd9f7>`);
  if ($props.showToolbar) {
    _push(`<div class="custom-editor__toolbar" data-v-883fd9f7><div class="toolbar-group" data-v-883fd9f7><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("bold") }, "toolbar-btn"])}" title="Bold (Ctrl+B)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "bold",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("italic") }, "toolbar-btn"])}" title="Italic (Ctrl+I)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "italic",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("underline") }, "toolbar-btn"])}" title="Underline (Ctrl+U)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "underline",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("strikeThrough") }, "toolbar-btn"])}" title="Strikethrough" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "strikethrough",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><select class="toolbar-select" title="Heading" data-v-883fd9f7><option value="" data-v-883fd9f7>Normal</option><option value="h1" data-v-883fd9f7>Heading 1</option><option value="h2" data-v-883fd9f7>Heading 2</option><option value="h3" data-v-883fd9f7>Heading 3</option><option value="h4" data-v-883fd9f7>Heading 4</option><option value="h5" data-v-883fd9f7>Heading 5</option><option value="h6" data-v-883fd9f7>Heading 6</option><option value="p" data-v-883fd9f7>Paragraph</option></select></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("justifyLeft") }, "toolbar-btn"])}" title="Align Left (Ctrl+Shift+L)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-left",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("justifyCenter") }, "toolbar-btn"])}" title="Align Center (Ctrl+Shift+E)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-center",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("justifyRight") }, "toolbar-btn"])}" title="Align Right (Ctrl+Shift+R)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-right",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("justifyFull") }, "toolbar-btn"])}" title="Justify (Ctrl+Shift+J)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-justify",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("insertUnorderedList") }, "toolbar-btn"])}" title="Bullet List (Ctrl+Shift+8)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "list-ul",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("insertOrderedList") }, "toolbar-btn"])}" title="Numbered List (Ctrl+Shift+7)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "list-ol",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><button type="button"${ssrIncludeBooleanAttr($data.isImageUploading) ? " disabled" : ""} class="${ssrRenderClass(["toolbar-btn", { "loading": $data.isImageUploading }])}" title="Insert Image (Ctrl+Shift+I)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "image",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="toolbar-btn" title="Insert Table" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "table",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="toolbar-btn" title="Horizontal Rule" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "minus",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><button type="button" class="toolbar-btn" title="Insert Link (Ctrl+K)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "link",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="${ssrRenderClass([{ "active": $options.isActive("blockquote") }, "toolbar-btn"])}" title="Quote (Ctrl+Shift+&gt;)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "quote-left",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="toolbar-btn" title="Clear Formatting (Ctrl+Shift+N)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "eraser",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="toolbar-separator" data-v-883fd9f7></div><div class="toolbar-group" data-v-883fd9f7><button type="button" class="toolbar-btn" title="Export Content" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "download",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="toolbar-btn" title="Keyboard Shortcuts (Ctrl+?)" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "keyboard",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button type="button" class="toolbar-btn" title="Insert Emoji" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "smile",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.showStatusBar) {
    _push(`<div id="editor-status" class="custom-editor__status" role="status" aria-live="polite" data-v-883fd9f7><div class="status-left" data-v-883fd9f7><span class="status-item"${ssrRenderAttr("title", `${$options.wordCount} words`)} data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "file-text",
      class: "w-3 h-3"
    }, null, _parent));
    _push(` ${ssrInterpolate($options.wordCount)} ${ssrInterpolate($options.wordCount === 1 ? "word" : "words")}</span><span class="status-item"${ssrRenderAttr("title", `${$options.charCount} characters`)} data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "type",
      class: "w-3 h-3"
    }, null, _parent));
    _push(` ${ssrInterpolate($options.charCount)} ${ssrInterpolate($options.charCount === 1 ? "char" : "chars")}</span>`);
    if ($options.readingTime > 0) {
      _push(`<span class="status-item"${ssrRenderAttr("title", `Estimated reading time: ${$options.readingTime} minutes`)} data-v-883fd9f7>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "clock",
        class: "w-3 h-3"
      }, null, _parent));
      _push(` ${ssrInterpolate($options.readingTime)} min </span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="status-right" data-v-883fd9f7>`);
    if ($data.isAutoSaving) {
      _push(`<span class="auto-save-status" data-v-883fd9f7>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "spinner",
        class: "w-3 h-3 animate-spin"
      }, null, _parent));
      _push(`<span data-v-883fd9f7>Saving...</span></span>`);
    } else if ($data.lastSaved) {
      _push(`<span class="last-saved"${ssrRenderAttr("title", `Last saved: ${$data.lastSaved}`)} data-v-883fd9f7>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "check-circle",
        class: "w-3 h-3"
      }, null, _parent));
      _push(`<span data-v-883fd9f7>Saved ${ssrInterpolate($data.lastSaved)}</span></span>`);
    } else {
      _push(`<span class="status-ready" data-v-883fd9f7>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "edit",
        class: "w-3 h-3"
      }, null, _parent));
      _push(`<span data-v-883fd9f7>Ready</span></span>`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="custom-editor__content-wrapper" data-v-883fd9f7><div class="prose pt-4 text-sm custom-editor__content"${ssrRenderAttr("contenteditable", !$props.disabled)} role="textbox"${ssrRenderAttr("aria-label", $props.placeholder || "Rich text editor")}${ssrRenderAttr("aria-multiline", true)}${ssrRenderAttr("aria-describedby", $props.showStatusBar ? "editor-status" : void 0)} tabindex="0" data-v-883fd9f7></div></div>`);
  if ($data.showMentionDropdown) {
    _push(`<div class="custom-editor__mentions" data-v-883fd9f7><div class="mentions-list" data-v-883fd9f7><div class="mentions-header" data-v-883fd9f7><span class="mentions-title" data-v-883fd9f7>Mention someone</span><span class="mentions-count" data-v-883fd9f7>${ssrInterpolate($options.filteredUsers.length)} user${ssrInterpolate($options.filteredUsers.length !== 1 ? "s" : "")}</span></div><!--[-->`);
    ssrRenderList($options.filteredUsers, (user, index) => {
      _push(`<div class="${ssrRenderClass([{ "active": index === $data.selectedMentionIndex }, "mention-item"])}" data-v-883fd9f7><div class="mention-avatar-container" data-v-883fd9f7>`);
      if (user.avatar) {
        _push(`<img${ssrRenderAttr("src", user.avatar)}${ssrRenderAttr("alt", user.name)} class="mention-avatar" data-v-883fd9f7>`);
      } else {
        _push(`<div class="mention-avatar-placeholder" data-v-883fd9f7>${ssrInterpolate(user.name.charAt(0).toUpperCase())}</div>`);
      }
      _push(`</div><div class="mention-info" data-v-883fd9f7><div class="mention-name" data-v-883fd9f7>${ssrInterpolate(user.name)}</div><div class="mention-email" data-v-883fd9f7>${ssrInterpolate(user.email)}</div></div>`);
      if (index === $data.selectedMentionIndex) {
        _push(`<div class="mention-selected" data-v-883fd9f7>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "check",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    });
    _push(`<!--]-->`);
    if ($options.filteredUsers.length === 0) {
      _push(`<div class="mentions-empty" data-v-883fd9f7>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "user",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`<span data-v-883fd9f7>No users found</span></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showEmojiPicker) {
    _push(`<div class="emoji-picker" style="${ssrRenderStyle($options.emojiPickerStyle)}" data-v-883fd9f7><div class="emoji-picker__header" data-v-883fd9f7><span data-v-883fd9f7>Choose an emoji</span><button class="emoji-picker__close" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "times",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="emoji-picker__content" data-v-883fd9f7><!--[-->`);
    ssrRenderList($data.emojiList, (emoji) => {
      _push(`<div class="emoji-item" data-v-883fd9f7>${ssrInterpolate(emoji)}</div>`);
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showImageControls && $data.selectedImage) {
    _push(`<div class="image-controls" style="${ssrRenderStyle({
      left: $data.imageControlsPosition.x + "px",
      top: $data.imageControlsPosition.y + "px"
    })}" data-v-883fd9f7><div class="image-controls__header" data-v-883fd9f7><span data-v-883fd9f7>Image Options</span><button class="image-controls__close" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "times",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="image-controls__content" data-v-883fd9f7><button class="image-control-btn" title="Align Left" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-left",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button class="image-control-btn" title="Align Center" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-center",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button class="image-control-btn" title="Align Right" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "align-right",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><div class="image-control-separator" data-v-883fd9f7></div><button class="image-control-btn" title="Small Size" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "resize-small",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button class="image-control-btn" title="Medium Size" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "resize-medium",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button class="image-control-btn" title="Large Size" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "resize-large",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><div class="image-control-separator" data-v-883fd9f7></div><button class="image-control-btn" title="Replace Image" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "image",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button><button class="image-control-btn image-control-btn--danger" title="Delete Image" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "trash",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showExportMenu) {
    _push(`<div class="export-menu" data-v-883fd9f7><div class="export-menu__header" data-v-883fd9f7><span data-v-883fd9f7>Export Content</span><button class="export-menu__close" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "times",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="export-menu__content" data-v-883fd9f7><button class="export-btn" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "code",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Export as HTML </button><button class="export-btn" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "file-text",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Export as Markdown </button><button class="export-btn" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "file",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Export as Plain Text </button><button class="export-btn" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "file-pdf",
      class: "w-4 h-4"
    }, null, _parent));
    _push(` Export as PDF </button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showKeyboardShortcuts) {
    _push(`<div class="keyboard-shortcuts-overlay" data-v-883fd9f7><div class="keyboard-shortcuts-modal" data-v-883fd9f7><div class="keyboard-shortcuts__header" data-v-883fd9f7><h3 data-v-883fd9f7>Keyboard Shortcuts</h3><button class="keyboard-shortcuts__close" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "times",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="keyboard-shortcuts__content" data-v-883fd9f7><div class="shortcut-section" data-v-883fd9f7><h4 data-v-883fd9f7>Text Formatting</h4><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + B</kbd><span data-v-883fd9f7>Bold</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + I</kbd><span data-v-883fd9f7>Italic</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + U</kbd><span data-v-883fd9f7>Underline</span></div></div><div class="shortcut-section" data-v-883fd9f7><h4 data-v-883fd9f7>Alignment</h4><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + L</kbd><span data-v-883fd9f7>Align Left</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + E</kbd><span data-v-883fd9f7>Align Center</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + R</kbd><span data-v-883fd9f7>Align Right</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + J</kbd><span data-v-883fd9f7>Justify</span></div></div><div class="shortcut-section" data-v-883fd9f7><h4 data-v-883fd9f7>Lists &amp; Content</h4><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + 8</kbd><span data-v-883fd9f7>Bullet List</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + 7</kbd><span data-v-883fd9f7>Numbered List</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + K</kbd><span data-v-883fd9f7>Insert Link</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Shift + I</kbd><span data-v-883fd9f7>Insert Image</span></div></div><div class="shortcut-section" data-v-883fd9f7><h4 data-v-883fd9f7>Actions</h4><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Z</kbd><span data-v-883fd9f7>Undo</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + Y</kbd><span data-v-883fd9f7>Redo</span></div><div class="shortcut-item" data-v-883fd9f7><kbd data-v-883fd9f7>Ctrl + ?</kbd><span data-v-883fd9f7>Show Shortcuts</span></div></div></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-883fd9f7>`);
  if ($data.notification.show) {
    _push(`<div class="${ssrRenderClass(["notification", `notification--${$data.notification.type}`])}" data-v-883fd9f7>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: $data.notification.type === "success" ? "check-circle" : $data.notification.type === "error" ? "exclamation-circle" : "info",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`<span data-v-883fd9f7>${ssrInterpolate($data.notification.message)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Components/CustomEditor.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const CustomEditor = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-883fd9f7"]]);
const _sfc_main$1 = {
  __name: "WatchButton",
  __ssrInlineRender: true,
  props: {
    watchableId: { type: Number, required: true },
    watchableType: { type: String, required: true },
    // e.g., 'Task' or 'Project'
    isWatching: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const isWatchingState = ref(props.isWatching);
    const isLoading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        disabled: isLoading.value,
        class: "flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 text-sm font-medium text-gray-600"
      }, _attrs))}>`);
      if (isWatchingState.value) {
        _push(`<svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>`);
      } else {
        _push(`<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg>`);
      }
      _push(`<span>${ssrInterpolate(isWatchingState.value ? "Watching" : "Watch")}</span>`);
      if (isLoading.value) {
        _push(`<svg class="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/WatchButton.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
const _sfc_main = {
  props: {
    id: {
      required: true
    },
    isPopup: Boolean,
    view: { required: false }
  },
  emits: { closeModal: null },
  data() {
    return {
      manual_time: { date: null, start_time: null, end_time: null, start: null, end: null, seconds: 0, title: "" },
      showManualTimeOption: false,
      is24HourFormat: false,
      showAssigneeBox: false,
      availableUsers: [],
      editDescription: false,
      showCommentBox: false,
      showLabelBox: false,
      showMoveCard: false,
      is_move: false,
      label_search: "",
      user_search: "",
      showEditLabelBox: false,
      loading: true,
      newCheckList: false,
      labels: null,
      existing_timer: null,
      users: null,
      list_items: null,
      projects: null,
      counter: { seconds: 0, timer: null, duration: 0 },
      activeTimerString: "",
      new_chek_list: {},
      move_object: {},
      new_comment: {},
      label: {},
      task: {},
      allowed_file_types: (() => {
        var _a, _b, _c;
        const types = (_c = (_b = (_a = this == null ? void 0 : this.$page) == null ? void 0 : _a.props) == null ? void 0 : _b.settings) == null ? void 0 : _c.allowed_file_types;
        try {
          const parsed = Array.isArray(types) ? types : JSON.parse(types);
          const cleaned = parsed.map((t) => t.startsWith(".") ? t : "." + t).filter(Boolean);
          return cleaned.length ? cleaned.join(",") : ".jpg,.jpeg,.png,.gif,.webp,.svg";
        } catch {
          return ".jpg,.jpeg,.png,.gif,.webp,.svg";
        }
      })(),
      colors: [
        { "name": "subtle green", "color": "#baf3db" },
        { "name": "subtle yellow", "color": "#f8e6a0" },
        { "name": "subtle orange", "color": "#ffe2bd" },
        { "name": "subtle red", "color": "#ffd2cc" },
        { "name": "subtle purple", "color": "#dfd8fd" },
        { "name": "green", "color": "#4bce97" },
        { "name": "yellow", "color": "#e2b203" },
        { "name": "orange", "color": "#faa53d" },
        { "name": "red", "color": "#f87462" },
        { "name": "purple", "color": "#9f8fef" },
        { "name": "bold green", "color": "#1f845a" },
        { "name": "bold yellow", "color": "#946f00" },
        { "name": "bold orange", "color": "#b65c02" },
        { "name": "bold red", "color": "#ca3521" },
        { "name": "bold purple", "color": "#6e5dc6" },
        { "name": "subtle blue", "color": "#cce0ff" },
        { "name": "subtle sky", "color": "#c1f0f5" },
        { "name": "subtle lime", "color": "#D3F1A7" },
        { "name": "subtle pink", "color": "#fdd0ec" },
        { "name": "subtle black", "color": "#dcdfe4" },
        { "name": "blue", "color": "#579dff" },
        { "name": "sky", "color": "#60c6d2" },
        { "name": "lime", "color": "#94c748" },
        { "name": "pink", "color": "#e774bb" },
        { "name": "black", "color": "#8590a2" },
        { "name": "bold blue", "color": "#0c66e4" },
        { "name": "bold sky", "color": "#1d7f8c" },
        { "name": "bold lime", "color": "#5b7f24" },
        { "name": "bold pink", "color": "#ae4787" },
        { "name": "bold black", "color": "#626f86" }
      ],
      // Mention popup properties
      showMentionPopup: false,
      mentionPopupPosition: { top: 0, left: 0 },
      clickedMentionUser: null,
      // Enhanced manual time properties
      manualTimeError: null,
      timePresets: [
        { label: "15 min", hours: 0, minutes: 15 },
        { label: "30 min", hours: 0, minutes: 30 },
        { label: "1 hour", hours: 1, minutes: 0 },
        { label: "2 hours", hours: 2, minutes: 0 },
        { label: "4 hours", hours: 4, minutes: 0 },
        { label: "8 hours", hours: 8, minutes: 0 }
      ],
      viewModal: {
        open: false,
        attachment: null
      },
      drawSettings: {
        color: "#ef4444",
        size: 4
      },
      isDrawing: false,
      // Which tool is active in the single toolbar. 'view' lets
      // the native PDF viewer scroll through every page; picking
      // any other tool switches to drawing on page 1.
      drawTool: "view",
      // 'view' | 'pen' | 'highlighter' | 'eraser' | 'text'
      historyStack: [],
      redoStack: [],
      textInput: { visible: false, cssX: 0, cssY: 0, canvasX: 0, canvasY: 0, value: "" },
      // Placed text notes — kept as separate, draggable objects
      // (not baked into the canvas bitmap) so they can be moved
      // around after being added, like a standard PDF note tool.
      textNotes: [],
      textNoteIdCounter: 0,
      draggingNote: null,
      // Quick-pick color swatches for the redesigned markup
      // toolbar (black, red, yellow, green, blue, purple, gray).
      swatchColors: ["#000000", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#9ca3af"],
      // Multi-page notes: which page you're currently sketching/
      // noting on, how many pages the PDF has, a per-page store
      // of what's been drawn/noted so far (so switching pages
      // doesn't lose anything), and which pages actually have
      // real edits worth baking in on Save.
      currentDrawPage: 1,
      totalPdfPages: 1,
      pageAnnotations: {},
      // { [pageNum]: { canvasImage, notes } }
      dirtyPages: {},
      // { [pageNum]: true }
      // pdf.js document handle used to render the exact page
      // pixel-for-pixel while a drawing tool is active.
      pdfDocProxy: null,
      canvasCtx: null,
      autoSaving: false,
      // --- Toast notification state ---
      toasts: [],
      toastIdCounter: 0,
      showAssigneeBoxPreview: false,
      showAssigneeBoxDraw: false,
      showDocumentNotes: false,
      newDocumentNote: "",
      savingDocumentNote: false
    };
  },
  components: {
    Icon,
    Loader,
    Link,
    DatePicker,
    DateTimePicker,
    CustomEditor,
    Head,
    WatchButton: _sfc_main$1
  },
  computed: {
    sortedAttachments() {
      var _a;
      if (!((_a = this.task) == null ? void 0 : _a.attachments)) return [];
      return [...this.task.attachments].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    },
    filteredActivities() {
      if (!this.task.activities || !Array.isArray(this.task.activities)) {
        return [];
      }
      return this.task.activities.filter((activity) => {
        if (activity.field_changed === "comment" || activity.field_changed === "comment_edit") {
          return activity.comment && activity.comment.id;
        }
        const allowedFieldChanges = [
          "title",
          "slug",
          "list_id",
          "order",
          "due_date",
          "is_done",
          "is_archive",
          "comment_delete",
          "description",
          "cover"
        ];
        return allowedFieldChanges.includes(activity.field_changed);
      });
    },
    composedStart() {
      return this.composeDateTime(this.manual_time.start_time);
    },
    composedEnd() {
      return this.composeDateTime(this.manual_time.end_time);
    },
    mentionPopupStyle() {
      return {
        position: "fixed",
        top: `${this.mentionPopupPosition.top}px`,
        left: `${this.mentionPopupPosition.left}px`,
        zIndex: 1001
      };
    },
    canAddTime() {
      return this.composedStart && this.composedEnd && !this.manualTimeError;
    },
    // Only used in View mode now — drawing tools render the page
    // themselves via pdf.js instead (see renderDrawPage), which is
    // what makes notes land exactly where you drew them. This just
    // jumps the native viewer to currentDrawPage so the page
    // arrows still move what you're looking at while browsing.
    pdfIframeSrc() {
      var _a;
      const path = (_a = this.viewModal.attachment) == null ? void 0 : _a.path;
      if (!path) return path;
      return this.currentDrawPage > 1 ? `${path}#page=${this.currentDrawPage}` : path;
    },
    // "family" name shared by an original PDF and every annotated
    // copy saved from it, e.g. "annotated_annotated_report.pdf" and
    // "report.pdf" both resolve to "report" — used to group all
    // versions of the same document together.
    documentFamilyName() {
      var _a;
      const name = (_a = this.viewModal.attachment) == null ? void 0 : _a.name;
      if (!name) return null;
      return name.replace(/\.[^/.]+$/, "").replace(/^(annotated_)+/i, "");
    },
    // Every saved version of the document currently open in the
    // preview modal (the original plus each "Save" from Draw mode),
    // newest first.
    documentVersions() {
      var _a;
      if (!this.documentFamilyName || !((_a = this.task) == null ? void 0 : _a.attachments)) return [];
      return [...this.task.attachments].filter((a) => this.isPdf(a.name) && a.name.replace(/\.[^/.]+$/, "").replace(/^(annotated_)+/i, "") === this.documentFamilyName).map((a) => ({ ...a, isOriginal: !/^annotated_/i.test(a.name) })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    // Comments that were posted with this document attached (the
    // comment box embeds an <a href="..."> link to the uploaded
    // file — see uploadAttachment's is_comment branch), matched
    // against any version of this same document.
    documentComments() {
      if (!this.documentVersions.length) return [];
      const paths = this.documentVersions.map((v) => v.path);
      return this.filteredActivities.filter((a) => {
        var _a;
        return ["comment", "comment_edit"].includes(a.field_changed) && ((_a = a.comment) == null ? void 0 : _a.details);
      }).filter((a) => paths.some((p) => a.comment.details.includes(p))).map((a) => ({ ...a.comment, user: a.user })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    documentNotesCount() {
      return this.documentVersions.filter((v) => !v.isOriginal).length + this.documentComments.length;
    }
  },
  watch: {
    "manual_time.start_time"() {
      this.manualTimeError = null;
    },
    "manual_time.end_time"() {
      this.manualTimeError = null;
    },
    "manual_time.date"() {
      this.manualTimeError = null;
    },
    // Switching between View (native scrollable viewer) and any
    // drawing tool needs a different stage: View just resizes the
    // frame; a drawing tool needs the exact page rendered fresh.
    async drawTool(newTool) {
      if (newTool === "view") {
        this.$nextTick(() => this.initViewFrame());
        return;
      }
      await this.ensurePdfDocProxy();
      await this.renderDrawPage(this.currentDrawPage);
      const saved = this.pageAnnotations[this.currentDrawPage];
      if (saved == null ? void 0 : saved.canvasImage) {
        await this.restoreFromDataUrl(saved.canvasImage);
      }
    }
  },
  methods: {
    // ============================================================
    // Toast / Alert notification system
    // ============================================================
    /**
     * Show a toast notification.
     * @param {string} message - main message text
     * @param {'success'|'error'|'warning'|'info'} type - visual style
     * @param {object} opts - { title, duration }
     */
    showToast(message, type = "success", opts = {}) {
      const duration = opts.duration ?? (type === "error" ? 5e3 : 3500);
      const id = ++this.toastIdCounter;
      const toast = {
        id,
        type,
        message,
        title: opts.title || null,
        duration,
        paused: false,
        timer: null
      };
      this.toasts.push(toast);
      this.armToastTimer(toast);
      if (this.toasts.length > 5) {
        const oldest = this.toasts[0];
        this.removeToast(oldest.id);
      }
      return id;
    },
    armToastTimer(toast) {
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => this.removeToast(toast.id), toast.duration);
    },
    pauseToast(toast) {
      toast.paused = true;
      clearTimeout(toast.timer);
    },
    resumeToast(toast) {
      toast.paused = false;
      this.armToastTimer(toast);
    },
    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        clearTimeout(this.toasts[index].timer);
        this.toasts.splice(index, 1);
      }
    },
    toastSuccess(message, opts) {
      return this.showToast(message, "success", opts);
    },
    toastError(message, opts) {
      return this.showToast(message, "error", opts);
    },
    toastWarning(message, opts) {
      return this.showToast(message, "warning", opts);
    },
    toastInfo(message, opts) {
      return this.showToast(message, "info", opts);
    },
    // --- Helpers ---
    isImage(filename) {
      if (!filename) return false;
      const ext = filename.split(".").pop().toLowerCase();
      return ["jpeg", "png", "gif", "jpg", "svg", "webp", "bmp"].includes(ext);
    },
    isPdf(filename) {
      if (!filename) return false;
      const ext = filename.split(".").pop().toLowerCase();
      return ext === "pdf";
    },
    canDraw(filename) {
      return this.isImage(filename) || this.isPdf(filename);
    },
    // --- View Modal Methods ---
    // The PDF itself is shown via the iframe (native browser
    // rendering, not pdf.js), with a transparent canvas layered on
    // top sized to match — that's what captures the drawing.
    openViewModal(attachment) {
      this.viewModal.open = true;
      this.viewModal.attachment = attachment;
      this.drawTool = "view";
      this.historyStack = [];
      this.redoStack = [];
      this.textInput.visible = false;
      this.textNotes = [];
      this.draggingNote = null;
      this.currentDrawPage = 1;
      this.totalPdfPages = 1;
      this.pageAnnotations = {};
      this.dirtyPages = {};
      this.pdfDocProxy = null;
      this.$nextTick(async () => {
        if (this.isPdf(attachment.name)) {
          await this.ensurePdfDocProxy();
          this.initViewFrame();
          window.addEventListener("resize", this.handleResize);
        }
      });
    },
    closeViewModal() {
      this.viewModal.open = false;
      this.viewModal.attachment = null;
      this.isDrawing = false;
      this.pdfDocProxy = null;
      window.removeEventListener("resize", this.handleResize);
    },
    // Loads the PDF once via pdf.js so pages can be rendered
    // pixel-exact for drawing. Cheap to call repeatedly — it's a
    // no-op once already loaded for the current attachment.
    async ensurePdfDocProxy() {
      if (this.pdfDocProxy || !this.viewModal.attachment) return;
      try {
        const loadingTask = pdfjsLib.getDocument(this.viewModal.attachment.path);
        this.pdfDocProxy = await loadingTask.promise;
        this.totalPdfPages = this.pdfDocProxy.numPages;
      } catch (err) {
        console.error("Failed to load the PDF for rendering:", err);
        this.toastError(this.$t("Failed to load the PDF for drawing."));
      }
    },
    // Renders the given page as an actual <canvas> at the stage's
    // real pixel width. Because the drawing overlay is sized to
    // match this render exactly, a stroke always lands on the
    // exact spot you clicked once baked back into the real PDF —
    // no more guessing at the native viewer's toolbar/margins.
    async renderDrawPage(pageNumber) {
      if (!this.pdfDocProxy) return;
      const stage = this.$refs.drawStage;
      const renderCanvas = this.$refs.pdfRenderCanvas;
      const drawCanvas = this.$refs.drawCanvas;
      if (!stage || !renderCanvas || !drawCanvas) return;
      const page = await this.pdfDocProxy.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetWidth = Math.min(stage.clientWidth || 640, 640);
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });
      const w = Math.round(viewport.width);
      const h = Math.round(viewport.height);
      stage.style.height = h + "px";
      stage.style.overflow = "hidden";
      renderCanvas.width = w;
      renderCanvas.height = h;
      drawCanvas.width = w;
      drawCanvas.height = h;
      await page.render({ canvasContext: renderCanvas.getContext("2d"), viewport }).promise;
      this.canvasCtx = drawCanvas.getContext("2d");
    },
    // View mode's frame: tall and natively scrollable, so the
    // browser's own PDF viewer can handle paging/scrolling/zooming
    // through the whole document.
    initViewFrame() {
      const stage = this.$refs.drawStage;
      if (!stage) return;
      stage.style.height = Math.round(window.innerHeight * 0.72) + "px";
      stage.style.overflow = "auto";
    },
    handleResize() {
      if (this.drawTool === "view") {
        this.initViewFrame();
      } else {
        this.renderDrawPage(this.currentDrawPage);
      }
    },
    // Switches which page you're sketching/noting on. Stores the
    // page you're leaving into pageAnnotations (so it's not lost),
    // renders the new page fresh, then restores whatever was
    // previously drawn/noted there, if anything.
    async goToDrawPage(delta) {
      var _a, _b;
      if (!this.viewModal.attachment) return;
      const next = this.currentDrawPage + delta;
      if (next < 1 || next > this.totalPdfPages) return;
      this.saveCurrentPageAnnotationState();
      this.currentDrawPage = next;
      this.historyStack = [];
      this.redoStack = [];
      this.textNotes = (((_a = this.pageAnnotations[next]) == null ? void 0 : _a.notes) || []).map((n) => ({ ...n }));
      if (this.drawTool !== "view") {
        await this.ensurePdfDocProxy();
        await this.renderDrawPage(next);
        const saved = (_b = this.pageAnnotations[next]) == null ? void 0 : _b.canvasImage;
        if (saved) {
          await this.restoreFromDataUrl(saved);
        }
      }
    },
    // Snapshots whatever's currently drawn/noted so switching pages
    // (or saving) doesn't lose it.
    saveCurrentPageAnnotationState() {
      const canvas = this.$refs.drawCanvas;
      if (!canvas || !canvas.width || !canvas.height) return;
      this.pageAnnotations[this.currentDrawPage] = {
        canvasImage: canvas.toDataURL(),
        notes: this.textNotes.map((n) => ({ ...n }))
      };
    },
    // --- Drawing Coordinates & Events ---
    getCanvasCoordinates(e) {
      const canvas = this.$refs.drawCanvas;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    },
    startDrawing(e) {
      if (!this.canvasCtx || this.drawTool === "view") return;
      if (this.drawTool === "text") {
        this.placeTextAt(e);
        return;
      }
      this.pushHistory();
      this.isDrawing = true;
      const pos = this.getCanvasCoordinates(e);
      this.canvasCtx.beginPath();
      this.canvasCtx.moveTo(pos.x, pos.y);
    },
    draw(e) {
      if (!this.isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const pos = this.getCanvasCoordinates(e);
      const ctx = this.canvasCtx;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (this.drawTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 1;
        ctx.lineWidth = this.drawSettings.size * 5;
      } else if (this.drawTool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = this.drawSettings.color;
        ctx.lineWidth = this.drawSettings.size * 4;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.drawSettings.color;
        ctx.lineWidth = this.drawSettings.size;
      }
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    stopDrawing() {
      if (this.isDrawing) {
        this.canvasCtx.closePath();
        this.canvasCtx.globalCompositeOperation = "source-over";
        this.canvasCtx.globalAlpha = 1;
        this.isDrawing = false;
      }
    },
    clearCanvas() {
      if (!this.canvasCtx) return;
      this.pushHistory();
      const canvas = this.$refs.drawCanvas;
      this.canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    },
    // --- Text note tool: place a typed note on the canvas ---
    placeTextAt(e) {
      const canvas = this.$refs.drawCanvas;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const pos = this.getCanvasCoordinates(e);
      this.textInput.cssX = clientX - rect.left;
      this.textInput.cssY = clientY - rect.top;
      this.textInput.canvasX = pos.x;
      this.textInput.canvasY = pos.y;
      this.textInput.value = "";
      this.textInput.visible = true;
      this.$nextTick(() => {
        if (this.$refs.textInputBox) this.$refs.textInputBox.focus();
      });
    },
    confirmTextInput() {
      const text = (this.textInput.value || "").trim();
      if (text) {
        const canvas = this.$refs.drawCanvas;
        const scaleX = canvas.width / canvas.getBoundingClientRect().width;
        const fontSize = Math.max(14, this.drawSettings.size * 4) * scaleX;
        this.textNotes.push({
          id: ++this.textNoteIdCounter,
          x: this.textInput.canvasX,
          y: this.textInput.canvasY,
          text,
          color: this.drawSettings.color,
          fontSize
        });
        this.dirtyPages[this.currentDrawPage] = true;
      }
      this.textInput.visible = false;
      this.textInput.value = "";
    },
    cancelTextInput() {
      this.textInput.visible = false;
      this.textInput.value = "";
    },
    // --- Dragging placed text notes ---
    startNoteDrag(note, e) {
      if (e.type === "mousedown" && e.button !== 0) return;
      const point = e.touches ? e.touches[0] : e;
      this.draggingNote = {
        id: note.id,
        startClientX: point.clientX,
        startClientY: point.clientY,
        origX: note.x,
        origY: note.y
      };
      window.addEventListener("mousemove", this.onNoteDrag);
      window.addEventListener("mouseup", this.endNoteDrag);
      window.addEventListener("touchmove", this.onNoteDrag, { passive: false });
      window.addEventListener("touchend", this.endNoteDrag);
    },
    onNoteDrag(e) {
      if (!this.draggingNote) return;
      if (e.cancelable) e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - this.draggingNote.startClientX;
      const dy = point.clientY - this.draggingNote.startClientY;
      const note = this.textNotes.find((n) => n.id === this.draggingNote.id);
      if (note) {
        note.x = this.draggingNote.origX + dx;
        note.y = this.draggingNote.origY + dy;
      }
    },
    endNoteDrag() {
      this.draggingNote = null;
      window.removeEventListener("mousemove", this.onNoteDrag);
      window.removeEventListener("mouseup", this.endNoteDrag);
      window.removeEventListener("touchmove", this.onNoteDrag);
      window.removeEventListener("touchend", this.endNoteDrag);
    },
    removeTextNote(id) {
      const idx = this.textNotes.findIndex((n) => n.id === id);
      if (idx > -1) this.textNotes.splice(idx, 1);
    },
    // --- Bottom-bar tool toggles (Sketch groups Pen/Highlight/Eraser) ---
    toggleSketch() {
      if (["pen", "highlighter", "eraser"].includes(this.drawTool)) {
        this.drawTool = "view";
      } else {
        this.drawTool = "pen";
      }
    },
    toggleTextTool() {
      this.drawTool = this.drawTool === "text" ? "view" : "text";
    },
    // --- Undo / Redo: snapshot-based, matches the simplicity of
    // the rest of the draw feature (no per-stroke vector model). ---
    pushHistory() {
      const canvas = this.$refs.drawCanvas;
      if (!canvas) return;
      this.historyStack.push(canvas.toDataURL());
      if (this.historyStack.length > 25) this.historyStack.shift();
      this.redoStack = [];
      this.dirtyPages[this.currentDrawPage] = true;
    },
    restoreFromDataUrl(dataUrl) {
      return new Promise((resolve) => {
        const canvas = this.$refs.drawCanvas;
        const ctx = this.canvasCtx;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.src = dataUrl;
      });
    },
    async undoDraw() {
      if (!this.historyStack.length) return;
      const canvas = this.$refs.drawCanvas;
      this.redoStack.push(canvas.toDataURL());
      const prev = this.historyStack.pop();
      await this.restoreFromDataUrl(prev);
    },
    async redoDraw() {
      if (!this.redoStack.length) return;
      const canvas = this.$refs.drawCanvas;
      this.historyStack.push(canvas.toDataURL());
      const next = this.redoStack.pop();
      await this.restoreFromDataUrl(next);
    },
    // Explicit "Save" button: uploads the drawing as a brand new
    // attachment. Nothing saves automatically while drawing.
    async manualSaveAnnotation() {
      this.autoSaving = true;
      try {
        await this.saveAnnotatedImage();
      } finally {
        this.autoSaving = false;
      }
    },
    // Saves a free-text note about the document currently open in
    // the preview modal. Reuses the same "comments.new" endpoint as
    // the regular Activities comment box, but tags the comment with
    // a hidden reference to this document's path so it shows up in
    // the "Notes for this document" panel (via documentComments)
    // instead of only in the general Activities feed.
    saveDocumentNote() {
      const text = (this.newDocumentNote || "").trim();
      if (!text || !this.viewModal.attachment || this.savingDocumentNote) return;
      const path = this.viewModal.attachment.path;
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
      const details = `<span class="hidden" data-doc-ref="${path}"></span>${escaped}`;
      this.savingDocumentNote = true;
      axios.post(this.route("comments.new"), {
        details,
        task_id: this.task.id,
        user_id: this.$page.props.auth.user.id,
        created_at: this.moment().format("YYYY-MM-DD HH:mm:ss")
      }).then((response) => {
        if (response.data) {
          this.task.activities.unshift(response.data);
          this.newDocumentNote = "";
          this.toastSuccess(this.$t("Note saved."), { duration: 2e3 });
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to save the note."));
      }).finally(() => {
        this.savingDocumentNote = false;
      });
    },
    // Loads the REAL original PDF (all its pages, untouched) and
    // draws your annotation directly onto page 1 of it, then
    // uploads the result as a new attachment. This is plain
    // fetch + pdf-lib — no pdf.js, no worker, no rendering of the
    // original file involved, so it can't hit that earlier bug.
    // Composites one page's stored raster strokes (pen/highlighter/
    // eraser) together with its draggable text notes into one
    // flattened image — used per-page at Save time, without
    // touching the live canvas, so notes stay movable in the UI
    // even after you've saved.
    buildFinalDataUrlForEntry(entry) {
      return new Promise((resolve) => {
        if (!entry || !entry.canvasImage) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const temp = document.createElement("canvas");
          temp.width = img.naturalWidth;
          temp.height = img.naturalHeight;
          const tctx = temp.getContext("2d");
          tctx.drawImage(img, 0, 0);
          (entry.notes || []).forEach((note) => {
            tctx.globalCompositeOperation = "source-over";
            tctx.globalAlpha = 1;
            tctx.fillStyle = note.color;
            tctx.font = `${note.fontSize}px sans-serif`;
            tctx.textBaseline = "top";
            note.text.split("\n").forEach((line, i) => {
              tctx.fillText(line, note.x, note.y + i * note.fontSize * 1.2);
            });
          });
          resolve(temp.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
        img.src = entry.canvasImage;
      });
    },
    // Bakes every page you actually sketched or added a note on —
    // not just page 1 — back into a copy of the real PDF, each on
    // its own matching page, then uploads the result as a new
    // attachment. The original file itself is left untouched.
    async saveAnnotatedImage() {
      var _a;
      const canvas = this.$refs.drawCanvas;
      if (!canvas || !this.viewModal.attachment) return;
      this.saveCurrentPageAnnotationState();
      const attachment = this.viewModal.attachment;
      const originalName = attachment.name.replace(/\.[^/.]+$/, "");
      const pagesToApply = Object.keys(this.dirtyPages).map(Number).filter((pageNum) => this.dirtyPages[pageNum] && this.pageAnnotations[pageNum]);
      if (!pagesToApply.length) {
        this.toastWarning(this.$t("Nothing to save — sketch or add a note first."));
        return;
      }
      try {
        const fileRes = await fetch(attachment.path, { credentials: "same-origin" });
        if (!fileRes.ok) {
          throw new Error(`Failed to fetch the original file (status ${fileRes.status})`);
        }
        const originalBytes = await fileRes.arrayBuffer();
        const pdfDoc = await PDFDocument.load(originalBytes);
        for (const pageNum of pagesToApply) {
          const finalDataUrl = await this.buildFinalDataUrlForEntry(this.pageAnnotations[pageNum]);
          if (!finalDataUrl) continue;
          const pngImage = await pdfDoc.embedPng(finalDataUrl);
          const pageIndex = Math.min(pageNum - 1, pdfDoc.getPageCount() - 1);
          const page = pdfDoc.getPage(pageIndex);
          const { width, height } = page.getSize();
          page.drawImage(pngImage, { x: 0, y: 0, width, height });
        }
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const formData = new FormData();
        formData.append("file", blob, `annotated_${originalName}.pdf`);
        const res = await axios.post(this.route("task.attachment.add", this.task.id), formData);
        if (res.data && !res.data.error) {
          this.task.attachments.push(res.data);
          this.toastSuccess(this.$t("Annotated PDF attached."), { duration: 2e3 });
          this.dirtyPages = {};
        } else {
          this.toastError(((_a = res.data) == null ? void 0 : _a.message) || this.$t("Failed to save the annotated PDF."));
        }
      } catch (err) {
        console.error("Failed to save annotated PDF:", err);
        this.toastError(this.$t("Failed to save the annotated PDF."));
      }
    },
    composeDateTime(time) {
      if (!this.manual_time.date || !time) return null;
      const d = this.moment(this.manual_time.date);
      const t = this.moment(time);
      return d.clone().set({ hour: t.hour(), minute: t.minute(), second: 0, millisecond: 0 }).toDate();
    },
    ensureDateObject(value) {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (this.moment.isMoment(value)) return value.toDate();
      if (typeof value === "string") return new Date(value);
      return null;
    },
    onDescriptionClick(event) {
      const mentionElement = event.target.closest(".mention");
      if (mentionElement) {
        event.stopPropagation();
        const userId = mentionElement.getAttribute("data-user-id");
        const user = this.availableUsers.find((u) => u.id == userId);
        if (user) {
          this.clickedMentionUser = user;
          this.showMentionPopup = true;
          this.$nextTick(() => {
            const mentionRect = mentionElement.getBoundingClientRect();
            this.mentionPopupPosition = {
              top: mentionRect.top - 10,
              left: mentionRect.left
            };
          });
        }
      } else {
        this.toggleDetails();
      }
    },
    hideMentionPopup() {
      this.showMentionPopup = false;
      this.clickedMentionUser = null;
    },
    // Enhanced manual time methods
    closeManualTimeModal() {
      this.showManualTimeOption = false;
      this.manualTimeError = null;
      this.resetManualTime();
    },
    resetManualTime() {
      this.manual_time = {
        date: null,
        start_time: null,
        end_time: null,
        start: null,
        end: null,
        seconds: 0,
        title: ""
      };
    },
    applyTimePreset(preset) {
      const now = this.moment();
      this.manual_time.start_time = now.clone().subtract(preset.hours, "hours").subtract(preset.minutes, "minutes").toDate();
      this.manual_time.end_time = now.clone().toDate();
      this.manual_time.date = now.format("YYYY-MM-DD");
      this.manualTimeError = null;
    },
    formatDuration(start, end) {
      const duration = this.moment.duration(this.moment(end).diff(this.moment(start)));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    },
    validateManualTime() {
      this.manualTimeError = null;
      if (!this.manual_time.start || !this.manual_time.end) {
        this.manualTimeError = "Please select both start and end times.";
        return false;
      }
      if (this.moment(this.manual_time.end).isBefore(this.manual_time.start)) {
        this.manualTimeError = "End time must be after start time.";
        return false;
      }
      const duration = this.moment.duration(this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start)));
      const totalMinutes = duration.asMinutes();
      if (totalMinutes > 600) {
        this.manualTimeError = "You cannot add more than 10 hours at a time.";
        return false;
      }
      if (this.moment(this.manual_time.end).isAfter(this.moment())) {
        this.manualTimeError = "End time cannot be in the future.";
        return false;
      }
      const taskDate = this.moment(this.task.created_at).utc();
      if (this.moment(this.manual_time.start).isBefore(taskDate)) {
        this.manualTimeError = "Start time must be after task creation date.";
        return false;
      }
      return true;
    },
    addTime() {
      this.manual_time.start = this.composeDateTime(this.manual_time.start_time);
      this.manual_time.end = this.composeDateTime(this.manual_time.end_time);
      if (!this.validateManualTime()) {
        return;
      }
      this.manual_time.seconds = parseInt(
        this.moment.duration(this.moment(this.manual_time.end).diff(this.moment(this.manual_time.start))).asSeconds()
      );
      this.counter.duration = parseInt(this.counter.duration) + this.manual_time.seconds;
      this.manual_time.task_id = this.task.id;
      axios.post(this.route("task.timer.manual"), this.manual_time).then(() => {
        this.closeManualTimeModal();
        this.toastSuccess(this.$t("Time entry added."));
      }).catch((error) => {
        this.manualTimeError = "Failed to add time. Please try again.";
        console.error("Error adding manual time:", error);
        this.toastError(this.$t("Failed to add time. Please try again."));
      });
    },
    updateManualStart() {
      const t = this.manual_time.start_time;
      if (t && typeof t === "object" && "hours" in t) {
        const hours = ((t.hours ?? 0) + 1) % 24;
        const minutes = t.minutes ?? 0;
        const seconds = t.seconds ?? 0;
        const now = this.moment();
        this.manual_time.end_time = now.clone().hour(hours).minute(minutes).second(seconds).toDate();
        return;
      }
      if (t) {
        this.manual_time.end_time = this.moment(t).add(1, "hour").toDate();
      }
    },
    openNewChecklist() {
      this.newCheckList = true;
      const ref2 = this.$refs.ncl;
      setTimeout(function() {
        ref2.focus();
      }, 0);
    },
    async imageButtonClickHandler() {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.click();
      input.onchange = async () => {
        input.files[0];
        this.$refs.editDescription.focus();
      };
    },
    async get_average_rgb(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const colorCount = {};
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const key = `${r},${g},${b}`;
            colorCount[key] = (colorCount[key] || 0) + 1;
          }
          const dominantColor = Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0][0];
          resolve(`rgb(${dominantColor})`);
        };
        img.onerror = reject;
      });
    },
    async makeCover(task2, attachment) {
      task2.cover = attachment;
      await this.saveTask({ cover: attachment.id });
      this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(task2.cover.path);
    },
    removeCover(task2) {
      this.saveTask({ cover: null });
      task2.cover = null;
    },
    toggleDetails() {
      this.editDescription = true;
    },
    onEditorReady(editor) {
      editor.focus();
    },
    deleteAttachment(id, index) {
      if (this.task.cover && this.task.cover.id === id) {
        this.task.cover = null;
      }
      axios.post(this.route("task.attachment.delete", id), {}).then((response) => {
        if (response.data) {
          this.task.attachments.splice(index, 1);
          this.toastSuccess(this.$t("Attachment deleted."));
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to delete the attachment."));
      });
    },
    async uploadAttachment(e, is_comment) {
      e.preventDefault();
      if (!e.target.files.length) {
        return;
      }
      const file = e.target.files[0];
      const maxSizeBytes = 50 * 1024 * 1024;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        this.toastWarning(this.$t("Only PDF files are allowed."));
        e.target.value = "";
        return;
      }
      if (file.size > maxSizeBytes) {
        this.toastWarning(this.$t("File size exceeds the 50MB limit. Please select a smaller file."));
        e.target.value = "";
        return;
      }
      const obj = await this.uploadFile(file);
      if (obj && obj.error) {
        this.toastError((obj == null ? void 0 : obj.message) || this.$t("Upload failed."));
      } else {
        this.task.attachments.push(obj);
        this.toastSuccess(this.$t("Attachment uploaded."));
        if (is_comment) {
          const link = `<br/><a href="${obj.path}" target="_blank">${obj.name}</a><br/>`;
          this.new_comment.details = (this.new_comment.details || "") + link;
        }
      }
    },
    async uploadFile(file) {
      try {
        let formData = new FormData();
        formData.append("file", file);
        const resp = await axios.post(this.route("task.attachment.add", this.task.id), formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        return resp.data;
      } catch (error) {
        console.error("Error uploading file:", error);
        return { error: true, message: this.$t("Failed to upload the file.") };
      }
    },
    goToLink(link) {
      window.location.href = link;
    },
    startTimer(start_now) {
      let started = this.counter.timer.started_at ? this.moment.utc(this.counter.timer.started_at) : this.moment();
      let seconds = parseInt(this.moment.duration(this.moment().diff(started)).asSeconds());
      seconds = this.counter.timer.duration + seconds;
      this.counter.ticker = setInterval(() => {
        this.counter.seconds = ++seconds;
        this.activeTimerString = this.moment.utc(moment.duration(this.counter.seconds + parseInt(this.counter.duration), "seconds").as("milliseconds")).format("H[h] m[m] s[s]");
      }, 1e3);
      if (start_now) {
        this.eTimer(this.counter);
      }
    },
    eTimer(counter, stopped) {
      this.$page.props.counter = counter;
      this.$page.props.tracker = { started: true };
      if (stopped) {
        this.$page.props.tracker.started = false;
      }
    },
    startTracker() {
      axios.post(this.route("task.timer.start"), { task_id: this.task.id }).then((response) => {
        if (response.data) {
          this.counter.timer = response.data;
          this.startTimer(true);
          this.toastInfo(this.$t("Timer started."), { duration: 2e3 });
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to start the timer."));
      });
    },
    stopTracker() {
      axios.post(this.route("task.timer.stop"), { duration: this.counter.seconds, id: this.counter.timer.id, task_id: this.task.id }).then((response) => {
        if (response.data) {
          this.stopTimer();
          this.counter.duration = response.data;
          this.toastSuccess(this.$t("Timer stopped and time logged."), { duration: 2e3 });
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to stop the timer."));
      });
    },
    stopTimer() {
      clearInterval(this.counter.ticker);
      this.activeTimerString = "";
      this.eTimer(this.counter, true);
    },
    totalTime() {
      if (this.activeTimerString) {
        return this.activeTimerString;
      } else if (this.counter.duration) {
        return this.moment.utc(moment.duration(this.counter.duration, "seconds").as("milliseconds")).format("H[h] m[m] s[s]");
      }
      return "0:00:00";
    },
    calculateTimeSpent(timer) {
      if (timer.stopped_at) {
        const started = this.moment(timer.started_at);
        const stopped = this.moment(timer.stopped_at);
        return this.moment.duration(stopped.diff(started)).format();
      }
      return "";
    },
    async moveTask() {
      const project_id = this.move_object.project_id;
      const taskObject = { previous_list: this.task.list_id, new_list: this.move_object.list_id, from: this.task.order, to: this.move_object.order, task_id: this.task.id };
      if (taskObject.previous_list !== taskObject.new_list) {
        taskObject.is_move = true;
        await this.saveTask({ list_id: taskObject.new_list });
      }
      if (this.task.project_id !== project_id) {
        await this.saveTask({ project_id });
      }
      await this.saveList(project_id, taskObject);
      Object.assign(this.task, { project_id, order: taskObject.to, list_id: taskObject.new_list });
      this.task.project = this.getSelectedProject();
      this.task.list = this.getSelectedList();
      this.showMoveCard = false;
      this.is_move = false;
      this.toastSuccess(this.$t("Task moved."), { duration: 2e3 });
    },
    saveList(project_id, taskObject) {
      axios.post(this.route("task.update.list", project_id), taskObject).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to move the task."));
      });
    },
    getSelectedList() {
      let listItem = this.list_items.filter((l) => {
        return l.id === this.move_object.list_id && l.project_id === this.move_object.project_id;
      });
      if (!listItem.length) {
        listItem = this.list_items.filter((l) => l.project_id === this.move_object.project_id);
        this.move_object.list_id = listItem[0].id;
      }
      return listItem[0];
    },
    getSelectedProjectLists() {
      return this.list_items.filter((l) => l.project_id === this.move_object.project_id);
    },
    getSelectedListPostions() {
      return this.getSelectedList().id === this.task.list_id ? parseInt(this.getSelectedList().tasks_count, 10) : parseInt(this.getSelectedList().tasks_count, 10) + 1;
    },
    getSelectedProject() {
      return this.projects.filter((p) => p.id === this.move_object.project_id)[0];
    },
    displayMoveCard() {
      this.move_object.project_id = this.task.project.id;
      this.move_object.list_id = this.task.list.id;
      this.move_object.order = this.task.order;
      this.showMoveCard = true;
    },
    searchLabel(input) {
      return this.labels.filter((lab) => lab.name.toLowerCase().indexOf(input) > -1);
    },
    searchUser(input) {
      return this.team_members.filter((tm) => tm.user.name.toLowerCase().indexOf(input) > -1);
    },
    deleteLabel(id) {
      axios.post(this.route("labels.delete", id)).then(() => {
        this.toastSuccess(this.$t("Label deleted."));
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to delete the label."));
      });
      const findIndex = this.labels.findIndex((l) => l.id === id);
      this.labels.splice(findIndex, 1);
      const tlIndex = this.task.task_labels.findIndex((tl) => tl.label_id === id);
      if (tlIndex > -1) {
        this.task.task_labels.splice(tlIndex, 1);
      }
      this.label = {};
    },
    saveLabel(labelObject) {
      labelObject.project_id = this.task.project_id;
      axios.post(this.route("labels.save"), labelObject).then((response) => {
        if (response.data && !labelObject.id) {
          this.labels.push(response.data);
        } else if (labelObject.id) {
          const findIndex = this.labels.findIndex((l) => l.id === labelObject.id);
          const tlIndex = this.task.task_labels.findIndex((tl) => tl.label_id === labelObject.id);
          this.labels[findIndex] = labelObject;
          if (tlIndex > -1) {
            this.task.task_labels[tlIndex]["label"] = labelObject;
          }
        }
        this.showEditLabelBox = false;
        this.showLabelBox = true;
        this.toastSuccess(this.$t("Label saved."), { duration: 2e3 });
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to save the label."));
      });
      this.label = {};
    },
    addLabelToTask(checked, id) {
      axios.post(this.route("task.labels.add"), { task_id: this.task.id, label_id: id }).then((response) => {
        if (response.data) {
          if (checked) {
            this.task.task_labels.push(response.data);
          } else {
            const findIndex = this.task.task_labels.findIndex((tl) => tl.label_id === id);
            if (findIndex > -1) {
              this.task.task_labels.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to update labels."));
      });
    },
    assignUserToTask(checked, id) {
      axios.post(this.route("task.assignees.add"), { task_id: this.task.id, user_id: id }).then((response) => {
        if (response.data) {
          if (checked && response.data.assignee) {
            this.task.assignees.push(response.data.assignee);
          } else {
            const findIndex = this.task.assignees.findIndex((a) => Number(a.user_id) === Number(id));
            if (findIndex > -1) {
              this.task.assignees.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to update assignees."));
      });
    },
    task_label_ids() {
      return this.task.task_labels.map((item) => item.label_id);
    },
    task_assignees() {
      return this.task.assignees.map((item) => Number(item.user_id));
    },
    saveDetails() {
      if (this.task.description) {
        const desc = this.task.description;
        this.editDescription = false;
        this.saveTask({ description: desc });
      }
    },
    async deleteTask() {
      try {
        await axios.post(this.route("task.delete", this.task.id), {});
        this.goToLink(this.route(this.view === "table" ? "projects.view.table" : "projects.view.board", this.task.project_id));
      } catch (error) {
        console.error(error);
        this.toastError(this.$t("Failed to delete the task."));
      }
    },
    saveTask(taskObject) {
      return axios.post(this.route("task.update", this.task.id), taskObject).then((response) => {
        if (response.data) ;
        return response.data;
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to save changes."));
      });
    },
    checklistDoneCount(checkList) {
      return checkList.filter((item) => !!item.is_done).length;
    },
    modifyCheck(check_list) {
      check_list.modify = true;
      setTimeout(() => {
        document.getElementById("modify_" + check_list.id).focus();
      }, 10);
    },
    deleteCheckList(id, index, checkLists) {
      axios.post(this.route("check_list.delete", id)).then(() => {
        this.toastSuccess(this.$t("Checklist item deleted."), { duration: 2e3 });
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to delete the checklist item."));
      });
      checkLists.splice(index, 1);
    },
    deleteComment(id, comments, activity_id) {
      axios.post(this.route("comment.delete", id)).then((response) => {
        if (response.data) {
          comments.unshift(response.data);
          const findIndex = this.task.activities.findIndex((activity) => activity.id === activity_id);
          if (findIndex !== -1) {
            this.task.activities.splice(findIndex, 1);
          }
          this.toastSuccess(this.$t("Comment deleted."), { duration: 2e3 });
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to delete the comment."));
      });
    },
    modifyCheckListSubmit(check_list, c_index, checklist) {
      if (!check_list.title) {
        this.deleteCheckList(check_list.id, c_index, checklist);
      } else {
        this.saveCheckList(check_list.id, { title: check_list.title });
      }
      check_list.modify = false;
    },
    inputNewChecklistAction(check_list, e) {
      if (e && e.keyCode === 13 || !e) {
        if (!check_list.title) {
          this.newCheckList = false;
        } else {
          this.saveNewCheckList({ title: check_list.title, task_id: this.task.id }, this.task.checklists);
          this.openNewChecklist();
        }
      }
    },
    saveCheckList(id, checkListObject) {
      axios.post(this.route("check_list.update", id), checkListObject).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to update the checklist item."));
      });
    },
    saveComment(id, commentObject) {
      commentObject.updated_at = this.moment().format("YYYY-MM-DD HH:mm:ss");
      axios.post(this.route("comment.update", id), { details: commentObject.details, updated_at: commentObject.updated_at }).then(() => {
        this.toastSuccess(this.$t("Comment updated."), { duration: 2e3 });
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to update the comment."));
      });
    },
    saveNewCheckList(checkListObject, currentCheckList) {
      this.new_chek_list.title = "";
      axios.post(this.route("check_list.new"), checkListObject).then((response) => {
        if (response.data) {
          currentCheckList.push(response.data);
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to add the checklist item."));
      });
    },
    saveNewComment(commentObject, currentComments) {
      this.new_comment.details = "";
      commentObject.created_at = this.moment().format("YYYY-MM-DD HH:mm:ss");
      axios.post(this.route("comments.new"), commentObject).then((response) => {
        if (response.data) {
          this.showCommentBox = false;
          currentComments.unshift(response.data);
          this.toastSuccess(this.$t("Comment posted."), { duration: 2e3 });
        }
      }).catch((error) => {
        console.log(error);
        this.toastError(this.$t("Failed to post the comment."));
      });
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
    async getTask(id) {
      var _a, _b;
      try {
        const taskResponse = await axios.get(this.route("json.task.get", id));
        if (taskResponse.data && Object.keys(taskResponse.data).length) {
          this.task = taskResponse.data;
          this.counter.timer = this.task.timer || null;
          if (((_a = this.counter.timer) == null ? void 0 : _a.task_id) === ((_b = this.task) == null ? void 0 : _b.id)) {
            this.startTimer();
          }
          await this.getOtherData();
        } else {
          this.toastError(this.$t("Something went wrong loading this task."));
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        this.toastError(this.$t("Failed to fetch task data."));
      } finally {
        this.loading = false;
      }
    },
    saveTitle(e) {
      if (e.keyCode === 13 || e.type === "blur") {
        e.preventDefault();
        e.target.blur();
        if (e.target.innerText) {
          const title = e.target.innerText;
          axios.post(this.route("task.update", this.task.id), { title }).then((response) => {
            if (response.data) ;
          }).catch((error) => {
            console.log(error);
            this.toastError(this.$t("Failed to update the title."));
          });
        }
      }
    },
    async getOtherData() {
      const dataResponse = await axios.get(this.route("task.other.data", { task_id: this.task.id, project_id: this.task.project_id }));
      const res = dataResponse.data;
      this.labels = res.labels || [];
      this.list_items = res.lists || [];
      this.projects = res.projects || [];
      this.team_members = res.team_members || [];
      this.existing_timer = res.timer || null;
      this.counter.duration = res.duration || 0;
      this.move_object.order = this.task.order;
      this.loadAvailableUsers();
      setTimeout(async () => {
        if (this.task.cover && this.$refs.t__cover) {
          this.$refs.t__cover.style.backgroundColor = await this.get_average_rgb(this.task.cover.path);
        }
      });
    },
    // Custom Editor Methods
    loadAvailableUsers() {
      this.availableUsers = [];
      if (this.task && this.task.project && this.task.project.team_members) {
        this.availableUsers = this.task.project.team_members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar || member.user.photo_path
        }));
      } else if (this.team_members && this.team_members.length > 0) {
        this.availableUsers = this.team_members.map((member) => ({
          id: member.user ? member.user.id : member.id,
          name: member.user ? member.user.name : member.name,
          email: member.user ? member.user.email : member.email,
          avatar: member.user ? member.user.avatar || member.user.photo_path : member.avatar
        }));
      } else if (this.task && this.task.assignees && this.task.assignees.length > 0) {
        this.availableUsers = this.task.assignees.map((assignee) => ({
          id: assignee.user.id,
          name: assignee.user.name,
          email: assignee.user.email,
          avatar: assignee.user.avatar || assignee.user.photo_path
        }));
      } else if (this.$page.props.auth.user) {
        this.availableUsers = [{
          id: this.$page.props.auth.user.id,
          name: this.$page.props.auth.user.name,
          email: this.$page.props.auth.user.email,
          avatar: this.$page.props.auth.user.avatar || this.$page.props.auth.user.photo_path
        }];
      }
    },
    onMention(user) {
      this.$emit("mention", user);
    },
    onEditorReady(editor) {
      console.log("Editor ready (legacy method)");
    }
  },
  created() {
    this.moment = moment;
    this.getTask(this.id);
  },
  mounted() {
    let self = this;
    window.addEventListener("keyup", function(ev) {
      if (ev.key === "Escape") {
        if (self.isPopup) {
          self.$emit("closeModal", true);
        } else {
          self.goToLink(self.route(self.view === "table" ? "projects.view.table" : "projects.view.board", task.project.slug || task.project.id));
        }
      }
    });
  },
  beforeUnmount() {
    if (this.mentionTimeout) {
      clearTimeout(this.mentionTimeout);
      this.mentionTimeout = null;
    }
    this.toasts.forEach((t) => clearTimeout(t.timer));
    this.endNoteDrag();
  },
  name: "task-details"
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const _component_Head = resolveComponent("Head");
  const _component_icon = resolveComponent("icon");
  const _component_CustomEditor = resolveComponent("CustomEditor");
  const _component_Icon = resolveComponent("Icon");
  const _component_DatePicker = resolveComponent("DatePicker");
  const _component_DateTimePicker = resolveComponent("DateTimePicker");
  const _component_WatchButton = resolveComponent("WatchButton");
  _push(`<!--[-->`);
  if (!$data.loading) {
    _push(ssrRenderComponent(_component_Head, {
      title: _ctx.$t($data.task.title + " | " + $data.task.project.title)
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="task__details" data-v-a5b9f4ab><div class="wrapper" id="modal" data-v-a5b9f4ab><div role="alert" class="container" data-v-a5b9f4ab>`);
  if ($data.loading) {
    _push(`<div class="content" data-v-a5b9f4ab><div role="status" class="td__loader" data-v-a5b9f4ab><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div><div class="i__r" data-v-a5b9f4ab></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div></div><div class="__f" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="i__1" data-v-a5b9f4ab></div><div class="i__2" data-v-a5b9f4ab></div></div></div><span class="sr-only" data-v-a5b9f4ab>Loading...</span></div></div>`);
  } else {
    _push(`<div class="content w-full" data-v-a5b9f4ab>`);
    if ($data.task.cover) {
      _push(`<div class="t__cover" style="${ssrRenderStyle({ backgroundImage: "url(" + $data.task.cover.path + ")" })}" data-v-a5b9f4ab></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.task.is_archive) {
      _push(`<div class="archive___task dark:bg-yellow-900/30 dark:text-yellow-200" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, { name: "archive" }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("This task is archived."))}</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="close_area" data-v-a5b9f4ab><div class="wrap" data-v-a5b9f4ab>`);
    if ($props.isPopup) {
      _push(`<span class="close__b" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "h-6 w-6 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</span>`);
    } else {
      _push(`<button class="close__b" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "h-6 w-6 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</button>`);
    }
    _push(`</div></div>`);
    if ($data.showMoveCard) {
      _push(`<div class="${ssrRenderClass([{ "!left-auto right-6 top-23": $data.is_move }, "mv__card bg-white dark:bg-gray-800 dark:border-gray-700"])}" data-v-a5b9f4ab><h4 class="text-center mb-3 font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Move Card"))}</h4><div class="close__b absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</div><span class="title mt-4 mb-1 font-bold dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Select a destination"))}</span><div class="td__btn relative flex flex-col rounded bg-gray-100 dark:bg-gray-700 mb-3 px-3 py-2.5" data-v-a5b9f4ab><span class="mb-1 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Project"))}</span><span class="text-[14px] font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate($options.getSelectedProject().title)}</span><select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList(this.projects, (project) => {
        _push(`<option${ssrRenderAttr("value", project.id)} data-v-a5b9f4ab>${ssrInterpolate(project.title)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex gap-2" data-v-a5b9f4ab><div class="td__btn relative flex flex-col w-[70%] rounded bg-gray-100 dark:bg-gray-700 px-3 py-2.5" data-v-a5b9f4ab><span class="mb-1 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("List"))}</span><span class="text-[14px] font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate($options.getSelectedList().title)}</span><select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($options.getSelectedProjectLists(), (list_item) => {
        _push(`<option${ssrRenderAttr("value", list_item.id)} data-v-a5b9f4ab>${ssrInterpolate(list_item.title)}</option>`);
      });
      _push(`<!--]--></select></div><div class="td__btn relative flex flex-col w-[30%] rounded bg-gray-100 dark:bg-gray-700 px-3 py-2.5" data-v-a5b9f4ab><span class="mb-1 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Position"))}</span><span class="text-[14px] font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate($data.move_object.order)}</span><select class="absolute left-0 top-0 opacity-0 w-full cursor-pointer h-[50px] z-2" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList([...Array($options.getSelectedListPostions()).keys()].map((x) => ++x), (list_item) => {
        _push(`<option${ssrRenderAttr("value", list_item)} data-v-a5b9f4ab>${ssrInterpolate(list_item)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="flex justify-between items-center action__buttons mt-3" data-v-a5b9f4ab><button type="button" class="small save" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Move"))}</button></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="m__body w-full" data-v-a5b9f4ab><main class="main" data-v-a5b9f4ab><div class="s__1" data-v-a5b9f4ab><div class="checklist-box" data-v-a5b9f4ab><input type="checkbox"${ssrIncludeBooleanAttr(!!$data.task.is_done) ? " checked" : ""} data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, { name: "checklist_box" }, null, _parent));
    _push(`</div><div class="t__l" data-v-a5b9f4ab><h2 class="__t" contenteditable="true" data-v-a5b9f4ab>${ssrInterpolate($data.task.title)}</h2><span class="text-xs dark:text-gray-300" data-v-a5b9f4ab>in list <span class="cursor-pointer underline dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate($data.task.list.title)}</span></span><div class="flex flex-col mt-5" data-v-a5b9f4ab><span class="text-xs font-bold mb-1 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Labels"))}</span><div class="list_labels flex flex-wrap gap-1" data-v-a5b9f4ab><!--[-->`);
    ssrRenderList($data.task.task_labels, (task_label, label_index) => {
      _push(`<button class="label_button" style="${ssrRenderStyle({ background: task_label.label.color })}"${ssrRenderAttr("aria-label", task_label.label.name)} data-a="" data-v-a5b9f4ab>${ssrInterpolate(task_label.label.name)}</button>`);
    });
    _push(`<!--]--><button class="label_button bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "dark:text-gray-300",
      name: "plus"
    }, null, _parent));
    _push(`</button></div></div></div></div>`);
    if ($data.showLabelBox) {
      _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" data-v-a5b9f4ab><h4 class="text-center mb-3 font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Labels"))}</h4><div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</div><input${ssrRenderAttr("value", $data.label_search)} class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"${ssrRenderAttr("placeholder", _ctx.$t("Search labels"))} data-v-a5b9f4ab><ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($options.searchLabel($data.label_search), (lab, lab_index) => {
        _push(`<li data-v-a5b9f4ab><label class="flex gap-1" data-v-a5b9f4ab><input class="w-5 mr-2 cursor-pointer" type="checkbox"${ssrIncludeBooleanAttr($options.task_label_ids().includes(lab.id)) ? " checked" : ""} data-v-a5b9f4ab><span class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80" style="${ssrRenderStyle({ background: lab.color })}"${ssrRenderAttr("tabindex", lab_index)}${ssrRenderAttr("aria-label", lab.name)} data-color="orange" data-v-a5b9f4ab>${ssrInterpolate(lab.name)}</span><button class="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" type="button"${ssrRenderAttr("tabindex", lab_index)} data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-3 h-3 dark:text-gray-300",
          name: "edit"
        }, null, _parent));
        _push(`</button></label></li>`);
      });
      _push(`<!--]--></ul><button class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 dark:bg-gray-700 dark:text-white hover:opacity-80 dark:hover:bg-gray-600" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Create a new label"))}</button></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.showEditLabelBox) {
      _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" data-v-a5b9f4ab><div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 left-3 p-1.5 rounded" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 dark:text-gray-300",
        name: "arrow-left"
      }, null, _parent));
      _push(`</div><h4 class="text-center mb-3 font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Edit Labels"))}</h4><div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</div><span class="w-full px-3 py-2 rounded cursor-pointer bg-gray-100 dark:bg-gray-700 hover:opacity-80" style="${ssrRenderStyle({ background: $data.label.color })}"${ssrRenderAttr("tabindex", 0)}${ssrRenderAttr("aria-label", $data.label.name)} data-v-a5b9f4ab>${ssrInterpolate($data.label.name)}</span><span class="title mt-4 font-bold mb-2 dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Title"))}</span><input class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px]" placeholder=""${ssrRenderAttr("value", $data.label.name)} data-v-a5b9f4ab><span class="title mt-4 mb-1 font-bold dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Select a color"))}</span><div class="color__wrapper grid gap-1 mb-2 max-h-[120px] overflow-hidden overflow-y-auto" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($data.colors, (color) => {
        _push(`<div class="h-8 box cursor-pointer" data-v-a5b9f4ab><div class="w-full h-full border-[2px] rounded border-transparent hover:border-red-600"${ssrRenderAttr("title", color.name)}${ssrRenderAttr("aria-label", color.name)} style="${ssrRenderStyle({ backgroundColor: color.color })}" data-v-a5b9f4ab></div></div>`);
      });
      _push(`<!--]--></div><div class="flex justify-between items-center action__buttons mt-2" data-v-a5b9f4ab><button type="button" class="small save" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button>`);
      if ($data.label.id) {
        _push(`<button type="button" class="small cancel" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Delete"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<section class="s__2" data-v-a5b9f4ab><div class="__details_top" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, { name: "details" }, null, _parent));
    _push(`<div class="flex-1" data-v-a5b9f4ab><span class="text-sm font-medium" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Description"))}</span></div>`);
    _push(ssrRenderComponent(_component_icon, {
      onClick: ($event) => $options.toggleDetails(),
      class: "w-4 h-4 ml-auto cursor-pointer",
      name: "edit"
    }, null, _parent));
    _push(`</div><div class="__details" data-v-a5b9f4ab>`);
    if (!$data.editDescription) {
      _push(`<div class="prose pt-4 text-sm cursor-pointer" data-v-a5b9f4ab>${($data.task.description || "Add more details...") ?? ""}</div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.editDescription) {
      _push(`<section class="mt-4" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_CustomEditor, {
        ref: "editDescription",
        modelValue: $data.task.description,
        "onUpdate:modelValue": ($event) => $data.task.description = $event,
        users: $data.availableUsers,
        "show-status-bar": true,
        "enable-auto-save": true,
        "auto-save-interval": 3e4,
        onMention: $options.onMention
      }, null, _parent));
      _push(`<div class="mt-2" data-v-a5b9f4ab><button type="button" class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button><button type="button" class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button></div></section>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></section><section class="mt-6" id="checklist" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="flex" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_Icon, {
      class: "w-5 h-5 mr-3",
      name: "checklist"
    }, null, _parent));
    _push(`<div class="flex-1 border-b dark:border-gray-700 pb-2" data-v-a5b9f4ab><span class="text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Checklist"))}</span><span class="ml-2 text-sm font-light dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate($options.checklistDoneCount($data.task.checklists))}/${ssrInterpolate($data.task.checklists.length)}</span></div></div></div><div class="pl-8 pt-4" data-v-a5b9f4ab><div class="space-y-4" data-v-a5b9f4ab><!--[-->`);
    ssrRenderList($data.task.checklists, (check_list, c_index) => {
      _push(`<div class="group relative flex items-center" data-v-a5b9f4ab>`);
      if (!check_list.modify) {
        _push(`<div class="checklist-box2" data-v-a5b9f4ab><input class="inp-cbx"${ssrRenderAttr("id", "cbx-" + check_list.id)}${ssrIncludeBooleanAttr(!!check_list.is_done) ? " checked" : ""} type="checkbox" style="${ssrRenderStyle({ "display": "none" })}" data-v-a5b9f4ab><label class="cbx"${ssrRenderAttr("for", "cbx-" + check_list.id)} data-v-a5b9f4ab><span data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-4 h-4",
          name: "checklist_box_2"
        }, null, _parent));
        _push(`</span><span class="text-sm" data-v-a5b9f4ab>${ssrInterpolate(check_list.title)}</span></label></div>`);
      } else {
        _push(`<!---->`);
      }
      if (check_list.modify) {
        _push(`<div class="checklist-box2 pl-6 w-full" data-v-a5b9f4ab><input${ssrRenderAttr("id", "modify_" + check_list.id)} class="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm bg-white w-full"${ssrRenderAttr("value", check_list.title)} data-v-a5b9f4ab><div class="flex items-center justify-between mt-2 flex-wrap gap-2" data-v-a5b9f4ab><div class="flex items-center gap-2 action__buttons" data-v-a5b9f4ab><button type="button" class="small save" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button><button type="button" class="small cancel" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button></div><div class="flex items-center gap-2" data-v-a5b9f4ab><button type="button" class="px-2 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-3 h-3",
          name: "undo"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Reassign Back"))}</button><label class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-3 h-3",
          name: "paperclip"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Attach New"))} <input type="file" class="hidden" data-v-a5b9f4ab></label></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!check_list.modify) {
        _push(`<div class="absolute right-0 hidden pl-4 group-hover:flex" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-4 h-4 mr-3 cursor-pointer",
          name: "edit",
          onClick: ($event) => $options.modifyCheck(check_list)
        }, null, _parent));
        _push(ssrRenderComponent(_component_icon, {
          class: "w-4 h-4 cursor-pointer",
          name: "trash",
          onClick: ($event) => $options.deleteCheckList(check_list.id, c_index, $data.task.checklists)
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    });
    _push(`<!--]--><div style="${ssrRenderStyle($data.newCheckList ? null : { display: "none" })}" class="group relative flex" data-v-a5b9f4ab><div class="checklist-box2 pl-6 w-full" data-v-a5b9f4ab><input class="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm bg-white w-full"${ssrRenderAttr("value", $data.new_chek_list.title)} data-v-a5b9f4ab><div class="flex items-center justify-between mt-2 flex-wrap gap-2" data-v-a5b9f4ab><div class="flex items-center gap-2 action__buttons" data-v-a5b9f4ab><button type="button" class="small save" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button><button type="button" class="small cancel" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button></div><div class="flex items-center gap-2" data-v-a5b9f4ab><label class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer flex items-center gap-1" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-3 h-3",
      name: "paperclip"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Attach New"))} <input type="file" class="hidden" data-v-a5b9f4ab></label></div></div></div></div></div><button class="group flex items-center mt-6" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-5 h-5 dark:text-gray-300",
      name: "add"
    }, null, _parent));
    _push(`<span class="pl-2 text-sm group-hover:opacity-70 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Add a new item"))}</span></button></div></section><section class="mt-8" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="flex" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4 mr-3 mt-1",
      name: "attachment"
    }, null, _parent));
    _push(`<div class="flex-1 border-b dark:border-gray-700 pb-2" data-v-a5b9f4ab><span class="text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Attachments"))}</span><span class="ml-2 text-sm font-light dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate($data.task.attachments.length)}</span></div></div></div><div class="pl-8 pt-4" data-v-a5b9f4ab><div class="flex flex-col gap-2 text-sm" data-v-a5b9f4ab><!--[-->`);
    ssrRenderList($options.sortedAttachments, (attachment, a_index) => {
      _push(`<div class="__attachment flex gap-3 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" data-v-a5b9f4ab><div class="preview flex-shrink-0"${ssrRenderAttr("aria-label", attachment.name)} data-v-a5b9f4ab>`);
      if ($options.isImage(attachment.name)) {
        _push(`<div class="w-16 h-16 bg-cover bg-center rounded" style="${ssrRenderStyle({ "backgroundImage": `url(${attachment.path})` })}"${ssrRenderAttr("alt", attachment.name)} data-v-a5b9f4ab></div>`);
      } else {
        _push(`<div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-semibold uppercase rounded" data-v-a5b9f4ab>${ssrInterpolate(attachment.name.split(".").pop())}</div>`);
      }
      _push(`</div><div class="flex flex-col gap-2 w-full" data-v-a5b9f4ab><div class="font-bold truncate max-w-full dark:text-gray-200" data-v-a5b9f4ab><a${ssrRenderAttr("href", attachment.path)} target="_blank" class="block break-words truncate text-ellipsis max-w-[260px] dark:text-blue-400" data-v-a5b9f4ab>${ssrInterpolate(attachment.name)}</a></div><div class="flex gap-3 dark:text-gray-400" data-v-a5b9f4ab><span${ssrRenderAttr("aria-label", _ctx.moment(attachment.created_at).format("MMMM D, YYYY h:mm A"))} data-v-a5b9f4ab>${ssrInterpolate(_ctx.moment(attachment.created_at).format("[Added] MMM D, YYYY [at] h:mm A"))}</span> - <span class="flex underline cursor-pointer dark:text-gray-300 hover:text-red-500" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Delete"))}</span></div><div class="flex flex-wrap gap-2 pt-1" data-v-a5b9f4ab><a class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer"${ssrRenderAttr("href", attachment.path)}${ssrRenderAttr("download", attachment.name)} data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, { name: "download" }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Download"))}</a><button class="cover dark:text-gray-300 flex items-center gap-1" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, { name: "eye" }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("View"))}</button>`);
      if ($options.isImage(attachment.name) && (!$data.task.cover || $data.task.cover.id !== attachment.id)) {
        _push(`<div class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, { name: "image" }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Make Cover"))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if ($data.task.cover && $data.task.cover.id === attachment.id) {
        _push(`<div class="cover dark:text-gray-300 flex items-center gap-1 cursor-pointer" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, { name: "image" }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Remove Cover"))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    });
    _push(`<!--]--></div>`);
    if ($data.viewModal.open) {
      _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-v-a5b9f4ab><div class="relative max-w-4xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col p-4 shadow-xl w-full" data-v-a5b9f4ab><div class="flex justify-between items-center pb-2 border-b dark:border-gray-700" data-v-a5b9f4ab><h3 class="font-bold text-lg dark:text-gray-100 truncate pr-4" data-v-a5b9f4ab>${ssrInterpolate((_a = $data.viewModal.attachment) == null ? void 0 : _a.name)}</h3><div class="flex items-center gap-2 flex-shrink-0" data-v-a5b9f4ab><a${ssrRenderAttr("href", (_b = $data.viewModal.attachment) == null ? void 0 : _b.path)}${ssrRenderAttr("download", (_c = $data.viewModal.attachment) == null ? void 0 : _c.name)} class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "download",
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Download"))}</a><button class="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl px-2" data-v-a5b9f4ab>×</button></div></div><div class="flex-1 overflow-y-auto" data-v-a5b9f4ab>`);
      if ($options.isPdf((_d = $data.viewModal.attachment) == null ? void 0 : _d.name)) {
        _push(`<div class="pt-3" data-v-a5b9f4ab><div class="flex items-center px-2" data-v-a5b9f4ab><h2 class="text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Assignees"))}</h2><div class="relative ml-auto" modal="true" name="task-assign" data-v-a5b9f4ab><div data-v-a5b9f4ab><span class="cursor-pointer" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "h-5 w-5 hover:opacity-80 dark:text-gray-300",
          name: "add"
        }, null, _parent));
        _push(`</span></div>`);
        if ($data.showAssigneeBoxPreview) {
          _push(`<div class="absolute right-1 flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" data-v-a5b9f4ab><h4 class="text-center mb-3 font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Assignee"))}</h4><div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" data-v-a5b9f4ab>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-4 h-4 dark:text-gray-300",
            name: "close"
          }, null, _parent));
          _push(`</div><input id="t_d_s_u_preview"${ssrRenderAttr("value", $data.user_search)} class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"${ssrRenderAttr("placeholder", _ctx.$t("Search User"))} data-v-a5b9f4ab><ul class="flex flex-col mt-3 gap-1 h-48 max-h-48 overflow-y-auto" data-v-a5b9f4ab><!--[-->`);
          ssrRenderList($options.searchUser($data.user_search), (userObject, user_index) => {
            _push(`<li data-v-a5b9f4ab><label${ssrRenderAttr("for", "td_u_id_preview_" + user_index)} class="flex p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded" data-v-a5b9f4ab><input${ssrRenderAttr("id", "td_u_id_preview_" + user_index)} class="w-5 ml-1 mr-2" type="checkbox"${ssrIncludeBooleanAttr($options.task_assignees().includes(userObject.user_id)) ? " checked" : ""} data-v-a5b9f4ab>`);
            if (userObject.user.photo_path) {
              _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full"${ssrRenderAttr("src", userObject.user.photo_path)} data-v-a5b9f4ab>`);
            } else {
              _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full" src="/images/user.svg" data-v-a5b9f4ab>`);
            }
            _push(`<span data-a="" class="p-1 dark:text-gray-200" type="button"${ssrRenderAttr("tabindex", user_index)} data-v-a5b9f4ab>${ssrInterpolate(userObject.user.name)}</span></label></li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex flex-wrap gap-1 px-2 mt-2" data-v-a5b9f4ab><!--[-->`);
        ssrRenderList($data.task.assignees, (assignee) => {
          _push(`<span${ssrRenderAttr("aria-label", assignee.user.name)} class="block rounded-full h-8 w-8 border-2 border-white dark:border-gray-800" data-v-a5b9f4ab>`);
          if (assignee.user.photo_path) {
            _push(`<img class="h-full w-full rounded-full"${ssrRenderAttr("src", assignee.user.photo_path)}${ssrRenderAttr("alt", assignee.user.name)} data-v-a5b9f4ab>`);
          } else {
            _push(`<img class="h-full w-full rounded-full" src="/images/user.svg"${ssrRenderAttr("alt", assignee.user.name)} data-v-a5b9f4ab>`);
          }
          _push(`</span>`);
        });
        _push(`<!--]-->`);
        if (!$data.task.assignees || !$data.task.assignees.length) {
          _push(`<span class="text-xs text-gray-500 dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("No assignees yet."))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.isImage((_e = $data.viewModal.attachment) == null ? void 0 : _e.name)) {
        _push(`<div class="flex items-center justify-center p-4" data-v-a5b9f4ab><img${ssrRenderAttr("src", (_f = $data.viewModal.attachment) == null ? void 0 : _f.path)}${ssrRenderAttr("alt", (_g = $data.viewModal.attachment) == null ? void 0 : _g.name)} class="max-h-[65vh] object-contain rounded" data-v-a5b9f4ab></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.isPdf((_h = $data.viewModal.attachment) == null ? void 0 : _h.name)) {
        _push(`<div class="-mx-4 -mb-4 mt-3 rounded-b-lg overflow-hidden bg-gray-900" data-v-a5b9f4ab><div class="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-white/10" data-v-a5b9f4ab><div class="flex items-center gap-1.5" data-v-a5b9f4ab><button type="button" class="${ssrRenderClass([$data.drawTool === "view" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10", "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"])}"${ssrRenderAttr("title", _ctx.$t("View / scroll all pages"))} data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" data-v-a5b9f4ab><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="1.8" data-v-a5b9f4ab></path><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" data-v-a5b9f4ab></circle></svg></button><button type="button"${ssrIncludeBooleanAttr(!$data.historyStack.length) ? " disabled" : ""} class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"${ssrRenderAttr("title", _ctx.$t("Undo"))} data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" data-v-a5b9f4ab><path d="M9 7 4 12l5 5M4 12h10a6 6 0 010 12h-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg></button><button type="button"${ssrIncludeBooleanAttr(!$data.redoStack.length) ? " disabled" : ""} class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"${ssrRenderAttr("title", _ctx.$t("Redo"))} data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" data-v-a5b9f4ab><path d="M15 7l5 5-5 5M20 12H10a6 6 0 000 12h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg></button><button type="button" class="${ssrRenderClass([$data.showDocumentNotes ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10", "ml-1 h-8 px-3 rounded-full flex items-center gap-1 text-xs font-medium flex-shrink-0"])}" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "note",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Notes"))} `);
        if ($options.documentNotesCount) {
          _push(`<span class="px-1.5 rounded-full text-[10px] font-bold bg-blue-500 text-white" data-v-a5b9f4ab>${ssrInterpolate($options.documentNotesCount)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></div><button type="button"${ssrIncludeBooleanAttr($data.autoSaving) ? " disabled" : ""} class="px-5 py-1.5 rounded-full bg-white text-gray-900 text-xs font-semibold disabled:opacity-50 flex-shrink-0" data-v-a5b9f4ab>${ssrInterpolate($data.autoSaving ? _ctx.$t("Saving...") : _ctx.$t("Save"))}</button></div>`);
        if ($data.totalPdfPages > 1) {
          _push(`<div class="flex items-center justify-center gap-3 px-4 py-2 bg-gray-900 border-b border-white/10" data-v-a5b9f4ab><button type="button"${ssrIncludeBooleanAttr($data.currentDrawPage <= 1) ? " disabled" : ""} class="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed" data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5" data-v-a5b9f4ab><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg></button><span class="text-xs text-white/80 font-medium min-w-[70px] text-center" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Page"))} ${ssrInterpolate($data.currentDrawPage)} / ${ssrInterpolate($data.totalPdfPages)}</span><button type="button"${ssrIncludeBooleanAttr($data.currentDrawPage >= $data.totalPdfPages) ? " disabled" : ""} class="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed" data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5" data-v-a5b9f4ab><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg></button>`);
          if ($data.drawTool !== "view" && $data.dirtyPages[$data.currentDrawPage]) {
            _push(`<span class="w-1.5 h-1.5 rounded-full bg-blue-400"${ssrRenderAttr("title", _ctx.$t("This page has unsaved notes"))} data-v-a5b9f4ab></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.showDocumentNotes) {
          _push(`<div class="border-b border-white/10 bg-gray-800" data-v-a5b9f4ab><div class="px-3 py-2.5 border-b border-white/10 flex gap-2 items-start" data-v-a5b9f4ab><textarea rows="2"${ssrRenderAttr("placeholder", _ctx.$t("Write a note about this document..."))} class="flex-1 text-xs border border-white/20 bg-gray-900 text-white placeholder-white/40 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" data-v-a5b9f4ab>${ssrInterpolate($data.newDocumentNote)}</textarea><button type="button"${ssrIncludeBooleanAttr(!$data.newDocumentNote.trim() || $data.savingDocumentNote) ? " disabled" : ""} class="px-2.5 py-1.5 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex-shrink-0 self-stretch" data-v-a5b9f4ab>${ssrInterpolate($data.savingDocumentNote ? _ctx.$t("Saving...") : _ctx.$t("Save"))}</button></div><div class="max-h-[220px] overflow-y-auto divide-y divide-white/10" data-v-a5b9f4ab>`);
          if (!$options.documentVersions.length && !$options.documentComments.length) {
            _push(`<div class="px-3 py-4 text-xs text-white/50 text-center" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("No notes yet — pick Sketch or Text, add a note, then click Save."))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList($options.documentVersions, (version) => {
            _push(`<button type="button" class="${ssrRenderClass([{ "bg-blue-500/10": $data.viewModal.attachment && $data.viewModal.attachment.id === version.id }, "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"])}" data-v-a5b9f4ab>`);
            _push(ssrRenderComponent(_component_icon, {
              name: "edit",
              class: "w-3.5 h-3.5 flex-shrink-0 text-blue-400"
            }, null, _parent));
            _push(`<div class="flex-1 min-w-0" data-v-a5b9f4ab><div class="text-xs font-medium truncate text-white/90" data-v-a5b9f4ab>${ssrInterpolate(version.isOriginal ? _ctx.$t("Original document") : _ctx.$t("Annotated version"))}</div><div class="text-[11px] text-white/50" data-v-a5b9f4ab>${ssrInterpolate(_ctx.moment(version.created_at).format("MMM D, YYYY [at] h:mm A"))}</div></div>`);
            if ($data.viewModal.attachment && $data.viewModal.attachment.id === version.id) {
              _push(`<span class="text-[10px] font-semibold text-blue-400 flex-shrink-0" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Viewing"))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</button>`);
          });
          _push(`<!--]--><!--[-->`);
          ssrRenderList($options.documentComments, (comment) => {
            var _a2, _b2, _c2;
            _push(`<div class="flex gap-2.5 px-3 py-2.5" data-v-a5b9f4ab>`);
            if ((_a2 = comment.user) == null ? void 0 : _a2.photo_path) {
              _push(`<img class="w-6 h-6 rounded-full flex-shrink-0"${ssrRenderAttr("src", comment.user.photo_path)}${ssrRenderAttr("alt", comment.user.first_name)} data-v-a5b9f4ab>`);
            } else {
              _push(`<img class="w-6 h-6 rounded-full flex-shrink-0" src="/images/user.svg" alt="" data-v-a5b9f4ab>`);
            }
            _push(`<div class="flex-1 min-w-0" data-v-a5b9f4ab><div class="flex items-center gap-2" data-v-a5b9f4ab><span class="text-xs font-medium text-white/90" data-v-a5b9f4ab>${ssrInterpolate((_b2 = comment.user) == null ? void 0 : _b2.first_name)} ${ssrInterpolate((_c2 = comment.user) == null ? void 0 : _c2.last_name)}</span><span class="text-[11px] text-white/50" data-v-a5b9f4ab>${ssrInterpolate(_ctx.moment(comment.created_at).format("MMM D, YYYY [at] h:mm A"))}</span></div><div class="prose prose-sm prose-invert text-xs text-white/80 t_a_h" data-v-a5b9f4ab>${comment.details ?? ""}</div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center justify-center px-4 py-6" data-v-a5b9f4ab><div class="relative bg-white rounded shadow-2xl overflow-hidden mx-auto w-full" style="${ssrRenderStyle({ "max-width": "640px" })}" data-v-a5b9f4ab>`);
        if ($data.drawTool === "view") {
          _push(`<iframe${ssrRenderAttr("src", $options.pdfIframeSrc)} class="absolute inset-0 w-full h-full border-0" data-v-a5b9f4ab></iframe>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<canvas style="${ssrRenderStyle($data.drawTool !== "view" ? null : { display: "none" })}" class="absolute inset-0 w-full h-full" data-v-a5b9f4ab></canvas><canvas style="${ssrRenderStyle($data.drawTool !== "view" ? null : { display: "none" })}" class="${ssrRenderClass([$data.drawTool === "text" ? "cursor-text pointer-events-auto" : "cursor-crosshair pointer-events-auto", "absolute inset-0 w-full h-full touch-none"])}" data-v-a5b9f4ab></canvas>`);
        if ($data.textInput.visible) {
          _push(`<div class="absolute z-20 bg-white border border-blue-500 rounded shadow-lg p-1.5" style="${ssrRenderStyle({ left: $data.textInput.cssX + "px", top: $data.textInput.cssY + "px" })}" data-v-a5b9f4ab><textarea rows="2"${ssrRenderAttr("placeholder", _ctx.$t("Type a note..."))} class="text-xs w-40 border-0 focus:outline-none resize-none" data-v-a5b9f4ab>${ssrInterpolate($data.textInput.value)}</textarea><div class="flex justify-end gap-1 mt-1" data-v-a5b9f4ab><button type="button" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button><button type="button" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Add"))}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.drawTool !== "view") {
          _push(`<!--[-->`);
          ssrRenderList($data.textNotes, (note) => {
            _push(`<div class="absolute z-10 group select-none" style="${ssrRenderStyle({ left: note.x + "px", top: note.y + "px", color: note.color, fontSize: note.fontSize + "px", cursor: $data.draggingNote && $data.draggingNote.id === note.id ? "grabbing" : "grab", lineHeight: 1.2 })}" data-v-a5b9f4ab><span class="whitespace-pre" style="${ssrRenderStyle({ "font-family": "sans-serif" })}" data-v-a5b9f4ab>${ssrInterpolate(note.text)}</span><button type="button" class="absolute -top-2.5 -right-2.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-none"${ssrRenderAttr("title", _ctx.$t("Remove note"))} data-v-a5b9f4ab>×</button></div>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="px-4 py-4 bg-gray-900 border-t border-white/10" data-v-a5b9f4ab>`);
        if ($data.drawTool === "pen" || $data.drawTool === "highlighter") {
          _push(`<div class="flex items-center justify-center gap-3 mb-4" data-v-a5b9f4ab><!--[-->`);
          ssrRenderList($data.swatchColors, (c) => {
            _push(`<button type="button" class="w-6 h-6 rounded-full border-2" style="${ssrRenderStyle({ background: c, borderColor: $data.drawSettings.color === c ? "#fff" : "transparent" })}"${ssrRenderAttr("title", c)} data-v-a5b9f4ab></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.drawTool === "pen" || $data.drawTool === "highlighter" || $data.drawTool === "eraser") {
          _push(`<div class="flex items-center justify-center gap-2 mb-4 flex-wrap" data-v-a5b9f4ab><button type="button" class="${ssrRenderClass([$data.drawTool === "pen" ? "bg-white text-gray-900" : "bg-white/10 text-white/80", "px-3 py-1.5 rounded-full text-xs font-medium"])}" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Pen"))}</button><button type="button" class="${ssrRenderClass([$data.drawTool === "highlighter" ? "bg-white text-gray-900" : "bg-white/10 text-white/80", "px-3 py-1.5 rounded-full text-xs font-medium"])}" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Highlight"))}</button><button type="button" class="${ssrRenderClass([$data.drawTool === "eraser" ? "bg-white text-gray-900" : "bg-white/10 text-white/80", "px-3 py-1.5 rounded-full text-xs font-medium"])}" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Eraser"))}</button><button type="button" class="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Clear"))}</button><div class="flex items-center gap-2 ml-1" data-v-a5b9f4ab><label class="text-[11px] text-white/60" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Size"))}</label><input type="range" min="1" max="20"${ssrRenderAttr("value", $data.drawSettings.size)} class="w-20" data-v-a5b9f4ab></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center justify-center gap-10" data-v-a5b9f4ab><button type="button" class="flex flex-col items-center gap-1.5" data-v-a5b9f4ab><span class="${ssrRenderClass([["pen", "highlighter", "eraser"].includes($data.drawTool) ? "bg-white text-gray-900" : "bg-white/10 text-white", "w-12 h-12 rounded-full flex items-center justify-center"])}" data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" data-v-a5b9f4ab><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" data-v-a5b9f4ab></path></svg></span><span class="text-[11px] text-white/80" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Sketch"))}</span></button><button type="button" class="flex flex-col items-center gap-1.5" data-v-a5b9f4ab><span class="${ssrRenderClass([$data.drawTool === "text" ? "bg-white text-gray-900" : "bg-white/10 text-white", "w-12 h-12 rounded-full flex items-center justify-center"])}" data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" data-v-a5b9f4ab><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6" data-v-a5b9f4ab></rect><path d="M8 8h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" data-v-a5b9f4ab></path></svg></span><span class="text-[11px] text-white/80" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Text"))}</span></button></div><p class="text-center text-[11px] text-white/40 mt-3" data-v-a5b9f4ab>${ssrInterpolate($data.drawTool === "view" ? _ctx.$t("Scroll to browse every page. Pick Sketch or Text to add a note.") : _ctx.$t("Use the page arrows above to note a different page."))}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></section><section class="mt-8" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="flex" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4 mr-3 mt-1",
      name: "comments"
    }, null, _parent));
    _push(`<div class="flex-1 border-b dark:border-gray-700 pb-2" data-v-a5b9f4ab><span class="text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Activities"))}</span><span class="ml-2 text-sm font-light dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate($options.filteredActivities.length)}</span></div></div></div><div class="pl-8 pt-4" data-v-a5b9f4ab><div data-v-a5b9f4ab>`);
    if (!$data.showCommentBox) {
      _push(`<div class="mt-1 mb-4 cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 hover:shadow dark:hover:shadow-lg" data-v-a5b9f4ab><p class="px-3 py-2 text-sm dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Write a comment..."))}</p></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.showCommentBox) {
      _push(`<form class="mt-1 mb-4 rounded-md border border-gray-300 dark:border-gray-600" enctype="multipart/form-data" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_CustomEditor, {
        ref: "newCommentEditor",
        modelValue: $data.new_comment.details,
        "onUpdate:modelValue": ($event) => $data.new_comment.details = $event,
        placeholder: _ctx.$t("Write a comment..."),
        users: $data.availableUsers,
        "show-status-bar": false,
        "enable-auto-save": false,
        onMention: $options.onMention
      }, null, _parent));
      _push(`<div class="flex items-center px-3 pt-2 pb-3" data-v-a5b9f4ab><div class="flex items-center" data-v-a5b9f4ab><button type="button" class="inline-flex items-center rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button><button type="button" class="inline-flex items-center rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-0 ltr:ml-1 rtl:mr-1" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button></div><div class="ml-auto hidden flex" data-v-a5b9f4ab><label class="cursor-pointer" data-v-a5b9f4ab><input${ssrRenderAttr("accept", $data.allowed_file_types)} class="hidden" type="file" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4",
        name: "attachment"
      }, null, _parent));
      _push(`</label></div></div></form>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="space-y-4" data-v-a5b9f4ab>`);
    if ($options.filteredActivities.length === 0) {
      _push(`<div class="text-gray-500 dark:text-gray-400 text-sm" data-v-a5b9f4ab>No activities yet.</div>`);
    } else {
      _push(`<ul class="divide-y divide-gray-200 dark:divide-gray-700" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($options.filteredActivities, (activity) => {
        var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i, _j;
        _push(`<li class="py-2" data-v-a5b9f4ab>`);
        if (["comment", "comment_edit"].includes(activity.field_changed) && activity.comment) {
          _push(`<div class="comment__ group relative flex py-1" data-v-a5b9f4ab><div class="h-6 w-6" data-v-a5b9f4ab><span class="block rounded-full h-6 w-6" data-v-a5b9f4ab>`);
          if ((_a2 = activity.user) == null ? void 0 : _a2.photo_path) {
            _push(`<img class="h-full w-full rounded-full"${ssrRenderAttr("src", activity.user.photo_path)} alt="User Photo" data-v-a5b9f4ab>`);
          } else {
            _push(`<img class="h-full w-full rounded-full" src="/images/user.svg" alt="Default Avatar" data-v-a5b9f4ab>`);
          }
          _push(`</span></div><div class="group flex-1 ltr:pl-4 rtl:pr-4 w-full" data-v-a5b9f4ab><div class="flex" data-v-a5b9f4ab>`);
          if (activity.user) {
            _push(`<h2 class="flex text-sm font-medium leading-none dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate(((_b2 = activity.user) == null ? void 0 : _b2.first_name) + " " + ((_c2 = activity.user) == null ? void 0 : _c2.last_name))}</h2>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="text-xs font-normal text-gray-500 dark:text-gray-400 ltr:ml-3 rtl:mr-3" data-v-a5b9f4ab>${ssrInterpolate(_ctx.moment((_d2 = activity.comment) == null ? void 0 : _d2.created_at).format("MMMM D, YYYY [at] h:mm a"))} `);
          if (_ctx.moment((_e2 = activity.comment) == null ? void 0 : _e2.updated_at).isAfter(_ctx.moment((_f2 = activity.comment) == null ? void 0 : _f2.created_at))) {
            _push(`<small data-v-a5b9f4ab>(edited)</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><div class="ml-auto" data-v-a5b9f4ab>`);
          if (_ctx.$page.props.auth.user.id === ((_g2 = activity.user) == null ? void 0 : _g2.id)) {
            _push(`<div class="absolute right-0 hidden pl-4 group-hover:flex" data-v-a5b9f4ab>`);
            _push(ssrRenderComponent(_component_icon, {
              class: "w-3 h-3 mr-3 cursor-pointer",
              name: "edit",
              onClick: ($event) => activity.comment.modify = true
            }, null, _parent));
            _push(ssrRenderComponent(_component_icon, {
              class: "w-3 h-3 cursor-pointer",
              name: "trash",
              onClick: ($event) => $options.deleteComment(activity.comment.id, $data.task.activities, activity.id)
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (activity.comment.modify) {
            _push(`<div class="checklist-box2 pt-3 w-full" data-v-a5b9f4ab>`);
            _push(ssrRenderComponent(_component_CustomEditor, {
              ref_for: true,
              ref: "editComment" + activity.comment.id,
              modelValue: activity.comment.details,
              "onUpdate:modelValue": ($event) => activity.comment.details = $event,
              placeholder: _ctx.$t("Edit comment..."),
              users: $data.availableUsers,
              "show-status-bar": false,
              "enable-auto-save": false,
              onMention: $options.onMention
            }, null, _parent));
            _push(`<div class="flex items-center action__buttons mt-2" data-v-a5b9f4ab><button type="button" class="small save" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Save"))}</button><button type="button" class="small cancel" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!activity.comment.modify) {
            _push(`<div class="prose text-sm pt-1 t_a_h" data-v-a5b9f4ab>${activity.comment.details ?? ""}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (["title", "slug", "list_id", "order", "due_date", "is_done", "is_archive", "comment_delete", "description", "cover"].includes(activity.field_changed)) {
          _push(`<div class="flex items-center space-x-3" data-v-a5b9f4ab>`);
          if ((_h2 = activity.user) == null ? void 0 : _h2.photo_path) {
            _push(`<img${ssrRenderAttr("src", activity.user.photo_path)} alt="User Avatar" class="w-8 h-8 rounded-full" data-v-a5b9f4ab>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div data-v-a5b9f4ab><p class="text-sm text-gray-700 dark:text-gray-300" data-v-a5b9f4ab><strong class="pr-1 dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate((_i = activity.user) == null ? void 0 : _i.first_name)} ${ssrInterpolate((_j = activity.user) == null ? void 0 : _j.last_name)}</strong>`);
          if (["title", "slug", "list_id", "order", "due_date"].includes(activity.field_changed)) {
            _push(`<span data-v-a5b9f4ab>${ssrInterpolate(activity.old_value)} → ${ssrInterpolate(activity.new_value)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (["is_done", "is_archive"].includes(activity.field_changed)) {
            _push(`<span data-v-a5b9f4ab>${ssrInterpolate(activity.old_value)}. </span>`);
          } else {
            _push(`<!---->`);
          }
          if (activity.field_changed === "description") {
            _push(`<span data-v-a5b9f4ab> updated the description.</span>`);
          } else {
            _push(`<!---->`);
          }
          if (activity.field_changed === "cover") {
            _push(`<span data-v-a5b9f4ab> updated the cover image.</span>`);
          } else {
            _push(`<!---->`);
          }
          if (activity.field_changed === "comment_delete") {
            _push(`<span data-v-a5b9f4ab> deleted a comment.</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><p class="text-xs pt-1 text-gray-500 dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate(_ctx.moment(activity.created_at).format("MMMM D, YYYY [at] h:mm a"))}</p></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ul>`);
    }
    _push(`</div></div></section></main>`);
    if ($data.showManualTimeOption) {
      _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" data-v-a5b9f4ab><div class="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" data-v-a5b9f4ab><div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600" data-v-a5b9f4ab><div class="flex items-center justify-between" data-v-a5b9f4ab><div class="flex items-center gap-3" data-v-a5b9f4ab><div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "clock",
        class: "w-5 h-5 text-blue-600 dark:text-blue-400"
      }, null, _parent));
      _push(`</div><div data-v-a5b9f4ab><h3 class="text-lg font-semibold text-gray-900 dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Add Time Manually"))}</h3><p class="text-sm text-gray-600 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Log time spent on this task"))}</p></div></div><button class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "close",
        class: "w-5 h-5 text-gray-500 dark:text-gray-400"
      }, null, _parent));
      _push(`</button></div></div><div class="p-6 space-y-6 relative overflow-visible" data-v-a5b9f4ab><div data-v-a5b9f4ab><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "note",
        class: "w-4 h-4 inline mr-1"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Description"))}</label><textarea${ssrRenderAttr("placeholder", _ctx.$t("What did you work on? (optional)"))} class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" rows="2" data-v-a5b9f4ab>${ssrInterpolate($data.manual_time.title)}</textarea></div><div data-v-a5b9f4ab><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "zap",
        class: "w-4 h-4 inline mr-1"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Quick Add"))}</label><div class="grid grid-cols-2 gap-2" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($data.timePresets, (preset) => {
        _push(`<button class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors" data-v-a5b9f4ab>${ssrInterpolate(preset.label)}</button>`);
      });
      _push(`<!--]--></div></div><div data-v-a5b9f4ab><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "calendar",
        class: "w-4 h-4 inline mr-1"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Date"))}</label>`);
      _push(ssrRenderComponent(_component_DatePicker, {
        modelValue: $data.manual_time.date,
        "onUpdate:modelValue": ($event) => $data.manual_time.date = $event,
        placeholder: _ctx.$t("Select Date"),
        class: "w-full"
      }, null, _parent));
      _push(`</div><div data-v-a5b9f4ab><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "clock",
        class: "w-4 h-4 inline mr-1"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Time Range"))}</label><div class="grid grid-cols-2 gap-4" data-v-a5b9f4ab><div data-v-a5b9f4ab><label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Start Time"))}</label>`);
      _push(ssrRenderComponent(_component_DateTimePicker, {
        modelValue: $options.ensureDateObject($data.manual_time.start_time),
        "onUpdate:modelValue": ($event) => $data.manual_time.start_time = $event,
        is24Hour: $data.is24HourFormat,
        placeholder: _ctx.$t("Start"),
        onChange: $options.updateManualStart,
        class: "w-full"
      }, null, _parent));
      _push(`</div><div data-v-a5b9f4ab><label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("End Time"))}</label>`);
      _push(ssrRenderComponent(_component_DateTimePicker, {
        modelValue: $options.ensureDateObject($data.manual_time.end_time),
        "onUpdate:modelValue": ($event) => $data.manual_time.end_time = $event,
        is24Hour: $data.is24HourFormat,
        placeholder: _ctx.$t("End"),
        class: "w-full"
      }, null, _parent));
      _push(`</div></div></div>`);
      if ($options.composedStart && $options.composedEnd) {
        _push(`<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4" data-v-a5b9f4ab><div class="flex items-center justify-between" data-v-a5b9f4ab><div class="flex items-center gap-2" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "timer",
          class: "w-5 h-5 text-blue-600 dark:text-blue-400"
        }, null, _parent));
        _push(`<span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Duration"))}</span></div><div class="text-right" data-v-a5b9f4ab><div class="text-lg font-bold text-blue-600 dark:text-blue-400" data-v-a5b9f4ab>${ssrInterpolate($options.formatDuration($options.composedStart, $options.composedEnd))}</div><div class="text-xs text-gray-500 dark:text-gray-400" data-v-a5b9f4ab>${ssrInterpolate(Math.floor(_ctx.moment.duration(_ctx.moment($options.composedEnd).diff(_ctx.moment($options.composedStart))).asMinutes()))} ${ssrInterpolate(_ctx.$t("minutes"))}</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($data.manualTimeError) {
        _push(`<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3" data-v-a5b9f4ab><div class="flex items-center gap-2" data-v-a5b9f4ab>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "exclamation-triangle",
          class: "w-4 h-4 text-red-600 dark:text-red-400"
        }, null, _parent));
        _push(`<span class="text-sm text-red-700 dark:text-red-300" data-v-a5b9f4ab>${ssrInterpolate($data.manualTimeError)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3" data-v-a5b9f4ab><button class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Cancel"))}</button><button${ssrIncludeBooleanAttr(!$options.canAddTime) ? " disabled" : ""} class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "plus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Add Time"))}</button></div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<aside class="divide-y divide-gray-200 dark:divide-gray-700 px-6 py-6" data-v-a5b9f4ab><section class="py-3" data-v-a5b9f4ab><h2 class="px-2 text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Move Task"))}</h2><div class="relative" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="group mt-2 flex cursor-pointer items-center td__btn rounded-md px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" data-v-a5b9f4ab><span class="block h-3.5 text-xs leading-none dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate($data.task.list.title)}</span>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-3.5 h-3.5 ml-auto cursor-pointer dark:text-gray-300",
      name: "arrow-down"
    }, null, _parent));
    _push(`</div></div></div></section><section class="py-3" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_WatchButton, {
      "watchable-id": $data.task.id,
      "watchable-type": "Task",
      "is-watching": $data.task.is_watched_by_user
    }, null, _parent));
    _push(`</section><section class="py-3.5" data-v-a5b9f4ab><div class="flex items-center px-2" data-v-a5b9f4ab><h2 class="text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Assignees"))}</h2><div class="relative ml-auto" modal="true" name="task-assign" data-v-a5b9f4ab><div data-v-a5b9f4ab><span class="cursor-pointer" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "h-5 w-5 hover:opacity-80 dark:text-gray-300",
      name: "add"
    }, null, _parent));
    _push(`</span></div>`);
    if ($data.showAssigneeBox) {
      _push(`<div class="absolute right-1 flex w-[300px] z-10 text-sm flex-col bg-white dark:bg-gray-800 px-4 py-4 rounded shadow dark:border dark:border-gray-700" data-v-a5b9f4ab><h4 class="text-center mb-3 font-bold dark:text-white" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Assignee"))}</h4><div class="absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 top-3 right-3 p-1.5 rounded" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 dark:text-gray-300",
        name: "close"
      }, null, _parent));
      _push(`</div><input id="t_d_s_u"${ssrRenderAttr("value", $data.user_search)} class="border-[2px] px-2 py-1 border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-[3px] dark:placeholder-gray-400"${ssrRenderAttr("placeholder", _ctx.$t("Search User"))} data-v-a5b9f4ab><ul class="flex flex-col mt-3 gap-1 h-48 max-h-48 overflow-y-auto" data-v-a5b9f4ab><!--[-->`);
      ssrRenderList($options.searchUser($data.user_search), (userObject, user_index) => {
        _push(`<li data-v-a5b9f4ab><label${ssrRenderAttr("for", "td_u_id_" + user_index)} class="flex p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded" data-v-a5b9f4ab><input${ssrRenderAttr("id", "td_u_id_" + user_index)} class="w-5 ml-1 mr-2" type="checkbox"${ssrIncludeBooleanAttr($options.task_assignees().includes(userObject.user_id)) ? " checked" : ""} data-v-a5b9f4ab>`);
        if (userObject.user.photo_path) {
          _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full"${ssrRenderAttr("src", userObject.user.photo_path)} data-v-a5b9f4ab>`);
        } else {
          _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full" src="/images/user.svg" data-v-a5b9f4ab>`);
        }
        _push(`<span data-a="" class="p-1 dark:text-gray-200" type="button"${ssrRenderAttr("tabindex", user_index)} data-v-a5b9f4ab>${ssrInterpolate(userObject.user.name)}</span></label></li>`);
      });
      _push(`<!--]--></ul></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div><div class="flex flex-wrap gap-1 px-2 mb-1 pt-2" data-v-a5b9f4ab><!--[-->`);
    ssrRenderList($data.task.assignees, (assignee) => {
      _push(`<span${ssrRenderAttr("aria-label", assignee.user.name)} data-a="" class="block rounded-full h-8 w-8 border-2 border-white" data-v-a5b9f4ab>`);
      if (assignee.user.photo_path) {
        _push(`<img class="h-full w-full rounded-full"${ssrRenderAttr("src", assignee.user.photo_path)}${ssrRenderAttr("alt", assignee.user.name)} data-v-a5b9f4ab>`);
      } else {
        _push(`<img class="h-full w-full rounded-full" src="/images/user.svg"${ssrRenderAttr("alt", assignee.user.name)} data-v-a5b9f4ab>`);
      }
      _push(`</span>`);
    });
    _push(`<!--]--></div></section><section class="py-4" data-v-a5b9f4ab><div class="flex px-2 text-sm font-medium dark:text-gray-300 justify-between" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Time Count"))} `);
    if (!this.activeTimerString && $options.task_assignees().includes(_ctx.$page.props.auth.user.id)) {
      _push(`<span class="cursor-pointer items-center flex" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "h-4 w-4 hover:opacity-80 dark:text-gray-300",
        name: "add"
      }, null, _parent));
      _push(` <span class="text-xs dark:text-gray-300" data-v-a5b9f4ab>Manual</span></span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="mt-3 flex justify-between items-center px-2" data-v-a5b9f4ab><div class="flex gap-1 items-center" data-v-a5b9f4ab><p class="dark:text-gray-200" data-v-a5b9f4ab>${ssrInterpolate($options.totalTime())}</p></div>`);
    if (!!this.activeTimerString && $options.task_assignees().includes(Number(_ctx.$page.props.auth.user.id))) {
      _push(`<button class="py-2 w-[70px] bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 rounded text-[12px] text-white select-none" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("STOP"))}</button>`);
    } else if (!$data.existing_timer && $options.task_assignees().includes(Number(_ctx.$page.props.auth.user.id))) {
      _push(`<button class="py-2 w-[70px] bg-blue-600 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-900 rounded text-[12px] text-white select-none" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("START"))}</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></section><section class="py-3" data-v-a5b9f4ab><h2 class="px-2 text-sm font-medium dark:text-gray-300" data-v-a5b9f4ab>${ssrInterpolate(_ctx.$t("Due Date"))}</h2><div class="relative" modal="true" data-v-a5b9f4ab><div data-v-a5b9f4ab><div class="group mt-2 flex cursor-pointer items-center rounded-md py-1.5" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_DateTimePicker, {
      modelValue: $data.task.due_date,
      "onUpdate:modelValue": ($event) => $data.task.due_date = $event,
      onChange: ($event) => $options.saveTask({ due_date: _ctx.moment($data.task.due_date).format("YYYY-MM-DD HH:mm") }),
      "onUpdate:is24Hour": ($event) => $data.is24HourFormat = $event,
      placeholder: "Select Date & Time",
      is24Hour: $data.is24HourFormat
    }, null, _parent));
    _push(`</div></div></div></section><section class="py-3" data-v-a5b9f4ab><div class="mt-2 space-y-2 px-1" data-v-a5b9f4ab><label class="flex cursor-pointer w-full items-center rounded bg-gray-200 dark:bg-gray-700 td__btn hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0" data-v-a5b9f4ab><input${ssrRenderAttr("accept", $data.allowed_file_types)} class="hidden" type="file" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "mr-2 h-4 w-4 dark:text-gray-300",
      name: "attachment"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Attachment"))}</label>`);
    if (!this.task.is_archive) {
      _push(`<button class="flex td__btn w-full items-center rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 text-xs font-medium dark:text-gray-200 focus:outline-none focus:ring-0" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "mr-2 h-4 w-4 dark:text-gray-300",
        name: "archive"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Archive"))}</button>`);
    } else {
      _push(`<button class="flex td__btn w-full items-center py-1.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-2 dark:text-gray-200" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "mr-2 h-4 w-4 dark:text-gray-300",
        name: "undo"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Revert Back"))}</button>`);
    }
    if (this.task.is_archive) {
      _push(`<button class="flex w-full text-white items-center td__btn py-1.5 text-xs font-medium rounded bg-red-700 dark:bg-red-800 hover:bg-red-800 dark:hover:bg-red-900 px-3 py-2" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "mr-2 h-4 w-4 fill-white",
        name: "dash"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Delete"))}</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></section></aside></div></div>`);
  }
  _push(`</div></div></div>`);
  if ($data.showMentionPopup && $data.clickedMentionUser) {
    _push(`<div class="mention-popup" style="${ssrRenderStyle($options.mentionPopupStyle)}" data-v-a5b9f4ab><div class="mention-popup__header" data-v-a5b9f4ab><div class="mention-popup__avatar" data-v-a5b9f4ab>`);
    if ($data.clickedMentionUser.avatar) {
      _push(`<img${ssrRenderAttr("src", $data.clickedMentionUser.avatar)}${ssrRenderAttr("alt", $data.clickedMentionUser.name)} data-v-a5b9f4ab>`);
    } else {
      _push(`<div class="mention-popup__avatar-placeholder" data-v-a5b9f4ab>${ssrInterpolate($data.clickedMentionUser.name.charAt(0).toUpperCase())}</div>`);
    }
    _push(`</div><div class="mention-popup__info" data-v-a5b9f4ab><div class="mention-popup__name" data-v-a5b9f4ab>${ssrInterpolate($data.clickedMentionUser.name)}</div><div class="mention-popup__email" data-v-a5b9f4ab>${ssrInterpolate($data.clickedMentionUser.email)}</div></div><button class="mention-popup__close" data-v-a5b9f4ab>`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "times",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</button></div><div class="mention-popup__content" data-v-a5b9f4ab><div class="mention-popup__details" data-v-a5b9f4ab>`);
    if ($data.clickedMentionUser.role) {
      _push(`<div class="mention-popup__detail-item" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "user-tag",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`<span data-v-a5b9f4ab>${ssrInterpolate($data.clickedMentionUser.role)}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.clickedMentionUser.department) {
      _push(`<div class="mention-popup__detail-item" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "building",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`<span data-v-a5b9f4ab>${ssrInterpolate($data.clickedMentionUser.department)}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.clickedMentionUser.lastActive) {
      _push(`<div class="mention-popup__detail-item" data-v-a5b9f4ab>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "clock",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`<span data-v-a5b9f4ab>Last active ${ssrInterpolate($data.clickedMentionUser.lastActive)}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  ssrRenderTeleport(_push, (_push2) => {
    _push2(`<div class="toast-stack" aria-live="polite" aria-atomic="true" data-v-a5b9f4ab><!--[-->`);
    ssrRenderList($data.toasts, (toast) => {
      _push2(`<div class="${ssrRenderClass(["toast-item--" + toast.type, "toast-item"])}" role="alert" data-v-a5b9f4ab><div class="toast-item__icon" data-v-a5b9f4ab>`);
      if (toast.type === "success") {
        _push2(`<svg viewBox="0 0 24 24" fill="none" data-v-a5b9f4ab><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg>`);
      } else if (toast.type === "error") {
        _push2(`<svg viewBox="0 0 24 24" fill="none" data-v-a5b9f4ab><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg>`);
      } else if (toast.type === "warning") {
        _push2(`<svg viewBox="0 0 24 24" fill="none" data-v-a5b9f4ab><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg>`);
      } else {
        _push2(`<svg viewBox="0 0 24 24" fill="none" data-v-a5b9f4ab><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" data-v-a5b9f4ab></circle><path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg>`);
      }
      _push2(`</div><div class="toast-item__body" data-v-a5b9f4ab>`);
      if (toast.title) {
        _push2(`<div class="toast-item__title" data-v-a5b9f4ab>${ssrInterpolate(toast.title)}</div>`);
      } else {
        _push2(`<!---->`);
      }
      _push2(`<div class="toast-item__message" data-v-a5b9f4ab>${ssrInterpolate(toast.message)}</div></div><button class="toast-item__close"${ssrRenderAttr("aria-label", _ctx.$t("Dismiss"))} data-v-a5b9f4ab><svg viewBox="0 0 24 24" fill="none" data-v-a5b9f4ab><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a5b9f4ab></path></svg></button><div class="toast-item__bar" style="${ssrRenderStyle({ animationDuration: toast.duration + "ms", animationPlayState: toast.paused ? "paused" : "running" })}" data-v-a5b9f4ab></div></div>`);
    });
    _push2(`<!--]--></div>`);
  }, "body", false, _parent);
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/Modals/TaskDetails.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const TaskDetails = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-a5b9f4ab"]]);
export {
  TaskDetails as T
};
