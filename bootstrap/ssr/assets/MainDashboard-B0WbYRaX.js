import { Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import JsBarcode from "jsbarcode";
import draggable from "vuedraggable";
import moment from "moment";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  name: "workspace-dashboard",
  components: { Head, Icon, draggable },
  layout: Layout,
  emits: ["add-document", "toggle-filter", "open-document"],
  props: {
    title: { type: String, default: "Dashboard" },
    workspace: { type: Object, default: null },
    lists: { type: Array, default: () => [] },
    statusCards: {
      type: Array,
      default: () => [
        {
          title: "Document Status",
          total: 233,
          items: [
            { label: "Submitted", value: 12, color: "#4a90d9" },
            { label: "Reviewing", value: 15, color: "#c9d94d" },
            { label: "Approved", value: 20, color: "#4caf50" },
            { label: "Rejected", value: 10, color: "#e0503a" }
          ]
        },
        {
          title: "Administrative Document",
          total: 233,
          items: [
            { label: "Submitted", value: 12, color: "#4a90d9" },
            { label: "Reviewing", value: 15, color: "#c9d94d" },
            { label: "Approved", value: 20, color: "#4caf50" },
            { label: "Rejected", value: 10, color: "#e0503a" }
          ]
        },
        {
          title: "Casino Operators Document",
          total: 233,
          items: [
            { label: "Submitted", value: 12, color: "#4a90d9" },
            { label: "Reviewing", value: 15, color: "#c9d94d" },
            { label: "Approved", value: 20, color: "#4caf50" },
            { label: "Rejected", value: 10, color: "#e0503a" }
          ]
        }
      ]
    },
    summary: {
      type: Object,
      default: () => ({
        percent: 65,
        segments: [
          { label: "ដាក់ស្នើ", value: 28, max: 134, percent: 40, color: "#4a90d9" },
          { label: "ពោះបង់", value: 16, percent: 5, color: "#f0a63a" },
          { label: "បដិសេធ", value: 30, percent: 20, color: "#e0503a" },
          { label: "ការអនុម័តបណ្ណសារ", value: 30, percent: 20, color: "#9b59b6" },
          { label: "អនុម័ត", value: 30, percent: 20, color: "#7cb342" }
        ]
      })
    },
    statistics: {
      type: Array,
      default: () => [
        { label: "នាយកដ្ឋានកិច្ចការទូទៅ", done: 13, total: 15, percent: 70 },
        { label: "នាយកដ្ឋានកិច្ចការគតិយុត្ត និងអាជ្ញាប័ណ្ណ", done: 10, total: 20, percent: 50 },
        { label: "នាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល", done: 17, total: 20, percent: 87 },
        { label: "នាយកដ្ឋានត្រួតពិនិត្យបច្ចេកទេសល្បែង", done: 18, total: 20, percent: 85 },
        { label: "នាយកដ្ឋានគ្រប់គ្រងសន្តិសុខ និងសណ្តាប់ធ្នាប់", done: 18, total: 20, percent: 90 },
        { label: "អង្គភាពសវនកម្មផ្ទៃក្នុង", done: 5, total: 20, percent: 20 }
      ]
    }
  },
  data() {
    return {
      barcodeRefs: {},
      taskRows: []
    };
  },
  computed: {
    donutCircumference() {
      return 2 * Math.PI * 80;
    },
    donutTotalPercent() {
      return this.summary.segments.reduce((sum, s) => sum + (s.percent || 0), 0) || 1;
    },
    donutSegments() {
      let cumulative = 0;
      return this.summary.segments.map((seg) => {
        const normalizedPercent = seg.percent / this.donutTotalPercent * 100;
        const dash = normalizedPercent / 100 * this.donutCircumference;
        const offset = -(cumulative / 100 * this.donutCircumference);
        cumulative += normalizedPercent;
        return { ...seg, dash, offset };
      });
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
  watch: {
    lists: {
      deep: true,
      handler() {
        this.syncTaskRows();
      }
    }
  },
  created() {
    this.moment = moment;
    this.syncTaskRows();
  },
  mounted() {
    this.$nextTick(() => this.renderBarcodes());
  },
  updated() {
    this.$nextTick(() => this.renderBarcodes());
  },
  methods: {
    ringDasharray(card, item) {
      const totalItems = card.items.reduce((sum, i) => sum + (i.value || 0), 0) || 1;
      const circumference = 2 * Math.PI * 32;
      const percent = item.value / totalItems * 100;
      const dash = percent / 100 * circumference;
      return dash + " " + (circumference - dash);
    },
    syncTaskRows() {
      this.taskRows = [...this.allTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    afterDrop() {
      const payload = this.taskRows.map((task, idx) => {
        task.order = idx + 1;
        return { id: task.id, order: task.order };
      });
      axios.post(this.route("task.update.order"), payload).catch((error) => {
        console.log(error);
      });
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
    taskDetailsPopup(element) {
      this.$emit("open-document", element.slug || element.id);
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
          JsBarcode(el, value, { format: "CODE128", width: 1, height: 32, fontSize: 10, margin: 0, displayValue: false });
        } catch (err) {
          console.error("Failed to render barcode for", value, err);
        }
      });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_icon = resolveComponent("icon");
  const _component_draggable = resolveComponent("draggable");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wdash" }, _attrs))} data-v-db70c8ad>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="wdash__cards" data-v-db70c8ad><!--[-->`);
  ssrRenderList($props.statusCards, (card, cIdx) => {
    _push(`<div class="wdash__card" data-v-db70c8ad><div class="wdash__card-title" data-v-db70c8ad>${ssrInterpolate(_ctx.$t(card.title))}</div><div class="wdash__card-total" data-v-db70c8ad>${ssrInterpolate(card.total)}</div><div class="wdash__rings" data-v-db70c8ad><!--[-->`);
    ssrRenderList(card.items, (item, iIdx) => {
      _push(`<div class="wdash__ring" data-v-db70c8ad><svg viewBox="0 0 76 76" class="wdash__ring-svg" data-v-db70c8ad><circle cx="38" cy="38" r="32" class="wdash__ring-bg" data-v-db70c8ad></circle><circle cx="38" cy="38" r="32" fill="none"${ssrRenderAttr("stroke", item.color)} stroke-width="6" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", $options.ringDasharray(card, item))} transform="rotate(-90 38 38)" data-v-db70c8ad></circle><text x="38" y="44" text-anchor="middle" class="wdash__ring-value" data-v-db70c8ad>${ssrInterpolate(item.value)}</text></svg><div class="wdash__ring-label" data-v-db70c8ad>${ssrInterpolate(_ctx.$t(item.label))}</div></div>`);
    });
    _push(`<!--]--></div></div>`);
  });
  _push(`<!--]--></div><div class="wdash__row" data-v-db70c8ad><div class="wdash__panel wdash__panel--summary" data-v-db70c8ad><div class="wdash__panel-title" data-v-db70c8ad>${ssrInterpolate(_ctx.$t("Summary"))}</div><div class="wdash__donut-wrap" data-v-db70c8ad><svg viewBox="0 0 200 200" class="wdash__donut" data-v-db70c8ad><circle cx="100" cy="100" r="80" class="wdash__donut-bg" data-v-db70c8ad></circle><!--[-->`);
  ssrRenderList($options.donutSegments, (seg, sIdx) => {
    _push(`<circle cx="100" cy="100" r="80" fill="none"${ssrRenderAttr("stroke", seg.color)} stroke-width="34"${ssrRenderAttr("stroke-dasharray", seg.dash + " " + ($options.donutCircumference - seg.dash))}${ssrRenderAttr("stroke-dashoffset", seg.offset)} transform="rotate(-90 100 100)" data-v-db70c8ad></circle>`);
  });
  _push(`<!--]--></svg><div class="wdash__donut-center" data-v-db70c8ad>${ssrInterpolate($props.summary.percent)}%</div></div><div class="wdash__legend" data-v-db70c8ad><!--[-->`);
  ssrRenderList($props.summary.segments, (seg, sIdx) => {
    _push(`<div class="wdash__legend-item" data-v-db70c8ad><span class="wdash__legend-dot" style="${ssrRenderStyle({ backgroundColor: seg.color })}" data-v-db70c8ad></span><span data-v-db70c8ad>${ssrInterpolate(_ctx.$t(seg.label))} ${ssrInterpolate(seg.max ? seg.value + "/" + seg.max : seg.value + " (" + seg.percent + "%)")}</span></div>`);
  });
  _push(`<!--]--></div></div><div class="wdash__panel wdash__panel--stats" data-v-db70c8ad><div class="wdash__panel-title" data-v-db70c8ad>${ssrInterpolate(_ctx.$t("Document Statistic"))}</div><div class="wdash__stat-list" data-v-db70c8ad><!--[-->`);
  ssrRenderList($props.statistics, (stat, stIdx) => {
    _push(`<div class="wdash__stat-row" data-v-db70c8ad><div class="wdash__stat-label" data-v-db70c8ad>${ssrInterpolate(_ctx.$t(stat.label))}</div><div class="wdash__stat-bar-wrap" data-v-db70c8ad><div class="wdash__stat-bar-track" data-v-db70c8ad><div class="wdash__stat-bar-fill" style="${ssrRenderStyle({ width: stat.percent + "%" })}" data-v-db70c8ad><span class="wdash__stat-bar-text" data-v-db70c8ad>${ssrInterpolate(stat.done)}/${ssrInterpolate(stat.total)}</span></div></div><span class="wdash__stat-percent" data-v-db70c8ad>${ssrInterpolate(stat.percent)}%</span></div></div>`);
  });
  _push(`<!--]--></div></div></div><div class="wdash__table-card" data-v-db70c8ad><div class="wdash__table-toolbar" data-v-db70c8ad><button type="button" class="wdash__icon-btn"${ssrRenderAttr("aria-label", _ctx.$t("Add document"))} data-v-db70c8ad>`);
  _push(ssrRenderComponent(_component_icon, {
    class: "w-4 h-4",
    name: "plus"
  }, null, _parent));
  _push(`</button><button type="button" class="wdash__icon-btn"${ssrRenderAttr("aria-label", _ctx.$t("Filter"))} data-v-db70c8ad><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" data-v-db70c8ad><path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" data-v-db70c8ad></path></svg></button></div><div class="wdash__doc-table" data-v-db70c8ad><div class="wdash__doc-row wdash__doc-row--head hidden md:grid" data-v-db70c8ad><div data-v-db70c8ad></div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("ល.រ."))}</div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("លេខកូដឯកសារ"))}</div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("កម្មវត្ថុ"))}</div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("កាលបរិច្ឆេទចូល"))}</div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("ស្ថានភាព"))}</div><div data-v-db70c8ad>${ssrInterpolate(_ctx.$t("បាកូដ"))}</div></div>`);
  _push(ssrRenderComponent(_component_draggable, {
    modelValue: $data.taskRows,
    "onUpdate:modelValue": ($event) => $data.taskRows = $event,
    tag: "div",
    class: "wdash__doc-rows",
    handle: ".wdash__drag-handle",
    "item-key": "id",
    onEnd: $options.afterDrop
  }, {
    item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="wdash__doc-row" data-v-db70c8ad${_scopeId}><div class="wdash__drag-handle hidden md:flex" data-v-db70c8ad${_scopeId}>`);
        _push2(ssrRenderComponent(_component_icon, {
          class: "w-5 h-5",
          name: "drag"
        }, null, _parent2, _scopeId));
        _push2(`</div><div${ssrRenderAttr("data-label", _ctx.$t("ល.រ."))} data-v-db70c8ad${_scopeId}>#${ssrInterpolate(index + 1)}</div><div${ssrRenderAttr("data-label", _ctx.$t("លេខកូដឯកសារ"))} data-v-db70c8ad${_scopeId}><span class="wdash__doc-code" data-v-db70c8ad${_scopeId}>${ssrInterpolate($options.documentCode(element))}</span></div><div${ssrRenderAttr("data-label", _ctx.$t("កម្មវត្ថុ"))} data-v-db70c8ad${_scopeId}><span class="wdash__doc-subject" data-v-db70c8ad${_scopeId}>${ssrInterpolate(element.title)}</span>`);
        if (element.attachments_count) {
          _push2(`<span class="wdash__doc-attach"${ssrRenderAttr("aria-label", _ctx.$t("Attachments"))} data-v-db70c8ad${_scopeId}>`);
          _push2(ssrRenderComponent(_component_icon, {
            class: "w-3.5 h-3.5",
            name: "attachment"
          }, null, _parent2, _scopeId));
          _push2(`${ssrInterpolate(element.attachments_count)}</span>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><div${ssrRenderAttr("data-label", _ctx.$t("កាលបរិច្ឆេទចូល"))} data-v-db70c8ad${_scopeId}>${ssrInterpolate(element.created_at ? _ctx.moment(element.created_at).format("DD MMM YYYY") : "")}</div><div${ssrRenderAttr("data-label", _ctx.$t("ស្ថានភាព"))} data-v-db70c8ad${_scopeId}><span class="wdash__status-pill" style="${ssrRenderStyle({ backgroundColor: $options.statusColorFor(element) })}" data-v-db70c8ad${_scopeId}>${ssrInterpolate(element.list ? element.list.title : "")}</span></div><div${ssrRenderAttr("data-label", _ctx.$t("បាកូដ"))} data-v-db70c8ad${_scopeId}><div class="wdash__barcode" data-v-db70c8ad${_scopeId}><svg${ssrRenderAttr("data-barcode-value", $options.documentCode(element))} data-v-db70c8ad${_scopeId}></svg></div></div></div>`);
      } else {
        return [
          createVNode("div", { class: "wdash__doc-row" }, [
            createVNode("div", { class: "wdash__drag-handle hidden md:flex" }, [
              createVNode(_component_icon, {
                class: "w-5 h-5",
                name: "drag"
              })
            ]),
            createVNode("div", {
              "data-label": _ctx.$t("ល.រ.")
            }, "#" + toDisplayString(index + 1), 9, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("លេខកូដឯកសារ")
            }, [
              createVNode("span", {
                class: "wdash__doc-code",
                onClick: ($event) => $options.taskDetailsPopup(element)
              }, toDisplayString($options.documentCode(element)), 9, ["onClick"])
            ], 8, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("កម្មវត្ថុ")
            }, [
              createVNode("span", {
                class: "wdash__doc-subject",
                onClick: ($event) => $options.taskDetailsPopup(element)
              }, toDisplayString(element.title), 9, ["onClick"]),
              element.attachments_count ? (openBlock(), createBlock("span", {
                key: 0,
                class: "wdash__doc-attach",
                "aria-label": _ctx.$t("Attachments")
              }, [
                createVNode(_component_icon, {
                  class: "w-3.5 h-3.5",
                  name: "attachment"
                }),
                createTextVNode(toDisplayString(element.attachments_count), 1)
              ], 8, ["aria-label"])) : createCommentVNode("", true)
            ], 8, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("កាលបរិច្ឆេទចូល")
            }, toDisplayString(element.created_at ? _ctx.moment(element.created_at).format("DD MMM YYYY") : ""), 9, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("ស្ថានភាព")
            }, [
              createVNode("span", {
                class: "wdash__status-pill",
                style: { backgroundColor: $options.statusColorFor(element) }
              }, toDisplayString(element.list ? element.list.title : ""), 5)
            ], 8, ["data-label"]),
            createVNode("div", {
              "data-label": _ctx.$t("បាកូដ")
            }, [
              createVNode("div", { class: "wdash__barcode" }, [
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
    _push(`<div class="wdash__doc-empty" data-v-db70c8ad>${ssrInterpolate(_ctx.$t("No documents found!"))}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/MainDashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MainDashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-db70c8ad"]]);
export {
  MainDashboard as default
};
