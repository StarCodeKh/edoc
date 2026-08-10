import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
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
  components: {
    Head,
    Icon,
    Link,
    BoardViewMenu
  },
  layout: Layout,
  props: {
    title: String,
    auth: Object,
    project: Object,
    per_list: Object,
    per_assignee: Object,
    per_label: Object,
    due_data: {
      required: true
    }
  },
  data() {
    return {
      errors: [],
      loading: false,
      firstResponse: [],
      lastResponse: [],
      taskDetailsOpen: false,
      months: [],
      drag: false,
      taskDetailsId: "",
      co_per_list: {},
      series_per_list: [],
      co_per_assignee: {},
      series_per_assignee: [],
      co_per_label: {},
      series_per_label: [],
      co_per_due: {},
      series_per_due: []
    };
  },
  computed: {
    isModalVisible() {
      return this.taskDetailsOpen;
    }
  },
  created() {
    this.getPerListReady("co_per_list", "series_per_list", "per_list", "list", "title");
    this.getPerListReady("co_per_assignee", "series_per_assignee", "per_assignee", "user", "name");
    this.getPerListReady("co_per_label", "series_per_label", "per_label", "label", "name");
    this.getPerListReady("co_per_due", "series_per_due", "due_data", "due", "name");
    this.co_per_label.colors = this.per_label.map((pl) => pl.label.color);
    this.co_per_label.plotOptions.bar.distributed = true;
    this.co_per_due.colors = this.due_data.map((pl) => pl.due.color);
    this.co_per_due.plotOptions.bar.distributed = true;
  },
  methods: {
    getPerListReady(co_prop, series_prop, props, prop_c, prop_v) {
      const co = {
        colors: ["#7366ff"],
        plotOptions: {
          bar: {
            borderRadius: 2
          }
        },
        xaxis: {
          labels: {
            rotate: -45
          },
          categories: [],
          tickPlacement: "on"
        },
        chart: {
          toolbar: {
            tools: {
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          }
        }
      };
      const series = [{
        name: "Total",
        data: []
      }];
      if (this[props]) {
        this[co_prop] = Object.assign({}, co);
        this[series_prop] = [...series];
        this[co_prop].xaxis.categories = this[props].map((pl) => pl[prop_c][prop_v]);
        this[series_prop][0].data = this[props].map((pl) => pl.total);
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_board_view_menu = resolveComponent("board-view-menu");
  const _component_apexchart = resolveComponent("apexchart");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(ssrRenderComponent(_component_board_view_menu, {
    project: $props.project,
    view: "dashboard"
  }, null, _parent));
  _push(`<div class="flex flex-col task__dashboard px-4 py-4 gap-4 h-[calc(100%-52px)] overflow-hidden overflow-y-auto"><div class="flex gap-5 flex-col lg:flex-row w-full"><div class="w-full bg-white rounded-lg shadow-lg p-10"><div class="w-full">`);
  _push(ssrRenderComponent(_component_apexchart, {
    type: "bar",
    options: $data.co_per_list,
    height: "400",
    series: $data.series_per_list
  }, null, _parent));
  _push(`</div></div><div class="w-full bg-white rounded-lg shadow-lg p-10"><div class="w-full">`);
  _push(ssrRenderComponent(_component_apexchart, {
    type: "bar",
    options: $data.co_per_label,
    height: "400",
    series: $data.series_per_label
  }, null, _parent));
  _push(`</div></div></div><div class="flex gap-5 flex-col lg:flex-row w-full"><div class="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-10"><div class="w-full">`);
  _push(ssrRenderComponent(_component_apexchart, {
    type: "bar",
    options: $data.co_per_assignee,
    height: "400",
    series: $data.series_per_assignee
  }, null, _parent));
  _push(`</div></div><div class="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-10"><div class="w-full">`);
  _push(ssrRenderComponent(_component_apexchart, {
    type: "bar",
    options: $data.co_per_due,
    height: "400",
    series: $data.series_per_due
  }, null, _parent));
  _push(`</div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Dashboard as default
};
