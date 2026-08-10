import { Head, Link } from "@inertiajs/vue3";
import { L as Layout } from "./Layout-DXJEf-iu.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { resolveComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Create a New Workspace type" },
  components: {
    LoadingButton,
    TextInput,
    Link,
    Head
  },
  layout: Layout,
  props: {
    title: String
  },
  remember: "form",
  data() {
    return {
      form: this.$inertia.form({
        name: null
      })
    };
  },
  methods: {
    store() {
      this.form.post(this.route("workspace_types.store"));
    }
  },
  created() {
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_text_input = resolveComponent("text-input");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "sec-cont" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, { title: $props.title }, null, _parent));
  _push(`<div class="bg-white rounded-md shadow overflow-hidden w-full"><form><div class="p-8 -mr-6 -mb-8 flex flex-wrap">`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.name,
    "onUpdate:modelValue": ($event) => $data.form.name = $event,
    error: $data.form.errors.name,
    class: "pr-6 pb-8 w-full lg:w-1/2",
    label: _ctx.$t("Name")
  }, null, _parent));
  _push(`</div><div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-start items-center">`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "btn-indigo",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("Create Workspace Type"))}`);
      } else {
        return [
          createTextVNode(toDisplayString(_ctx.$t("Create Workspace Type")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></form></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/WorkspaceTypes/Create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Create = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Create as default
};
