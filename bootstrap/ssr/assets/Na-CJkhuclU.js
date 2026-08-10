import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon, C as CreateWorkspace } from "./Layout-DXJEf-iu.js";
import "lodash/pickBy.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import "lodash/mapValues.js";
import "lodash/throttle.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import moment from "moment";
import { S as SearchInput } from "./SearchInput-Br3HcA23.js";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  components: {
    CreateWorkspace,
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
      create_workspace: false
    };
  },
  computed: {},
  created() {
    this.moment = moment;
  },
  methods: {}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_create_workspace = resolveComponent("create-workspace");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: "h-full no__workspace",
    style: { backgroundImage: "url(/images/bg/color_dark_red.svg)" }
  }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="welcome"><div class="message"><h1>${ssrInterpolate(_ctx.$t("No workspace found"))}!</h1>`);
  if (_ctx.$page.props.auth.user.role.slug === "admin") {
    _push(`<button class="create_new">Create New</button>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.$page.props.auth.user.role.slug !== "admin") {
    _push(`<p>You didn&#39;t joined on any workspace yet. Please contact with administrator.</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
  if ($data.create_workspace) {
    _push(ssrRenderComponent(_component_create_workspace, {
      onCreateWorkspace: ($event) => $data.create_workspace = false
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Na.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Na = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Na as default
};
