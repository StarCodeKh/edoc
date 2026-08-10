import { Head, Link } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import "lodash/pickBy.js";
import "lodash/throttle.js";
import mapValues from "lodash/mapValues.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Workspace Type" },
  components: {
    Icon,
    Link,
    Head,
    Pagination
  },
  layout: Layout,
  props: {
    title: String,
    filters: Object,
    workspace_types: Object
  },
  data() {
    return {
      form: {
        search: this.filters.search
      }
    };
  },
  watch: {
    // form: {
    //   deep: true,
    //   handler: throttle(function() {
    //     this.$inertia.get(this.route('workspace_types.index'), pickBy(this.form), { preserveState: true })
    //   }, 150),
    // },
  },
  methods: {
    reset() {
      this.form = mapValues(this.form, () => null);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _component_pagination = resolveComponent("pagination");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "sec-cont" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="mb-6 flex justify-end items-center">`);
  _push(ssrRenderComponent(_component_Link, {
    class: "btn-indigo",
    href: this.route("workspace_types.create")
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<span${_scopeId}>${ssrInterpolate(_ctx.$t("Create a new Workspace type"))}</span>`);
      } else {
        return [
          createVNode("span", null, toDisplayString(_ctx.$t("Create a new Workspace type")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="bg-white rounded-md shadow overflow-x-auto"><table class="w-full whitespace-nowrap"><tbody><tr class="text-left font-bold"><th class="px-6 pt-6 pb-4">#${ssrInterpolate(_ctx.$t("ID"))}</th><th class="px-6 pt-6 pb-4">${ssrInterpolate(_ctx.$t("Name"))}</th></tr><!--[-->`);
  ssrRenderList($props.workspace_types.data, (workspace_type) => {
    _push(`<tr class="hover:bg-gray-100 focus-within:bg-gray-100"><td class="border-t">`);
    _push(ssrRenderComponent(_component_Link, {
      class: "px-6 py-4 flex items-center focus:text-indigo-500",
      href: this.route("workspace_types.edit", workspace_type.id)
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate(workspace_type.id)}`);
        } else {
          return [
            createTextVNode(toDisplayString(workspace_type.id), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</td><td class="border-t">`);
    _push(ssrRenderComponent(_component_Link, {
      class: "px-6 py-4 flex items-center focus:text-indigo-500",
      href: this.route("workspace_types.edit", workspace_type.id)
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate(workspace_type.name)}`);
        } else {
          return [
            createTextVNode(toDisplayString(workspace_type.name), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</td><td class="border-t w-px">`);
    _push(ssrRenderComponent(_component_Link, {
      class: "px-4 flex items-center",
      href: this.route("workspace_types.edit", workspace_type.id),
      tabindex: "-1"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_icon, {
            name: "cheveron-right",
            class: "block w-6 h-6 fill-gray-400"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_icon, {
              name: "cheveron-right",
              class: "block w-6 h-6 fill-gray-400"
            })
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</td></tr>`);
  });
  _push(`<!--]-->`);
  if ($props.workspace_types.data.length === 0) {
    _push(`<tr><td class="border-t px-6 py-4" colspan="4">No workspace type found.</td></tr>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</tbody></table></div>`);
  _push(ssrRenderComponent(_component_pagination, {
    class: "mt-6",
    links: $props.workspace_types.links
  }, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/WorkspaceTypes/Index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Index as default
};
