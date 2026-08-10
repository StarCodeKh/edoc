import { Head, Link } from "@inertiajs/vue3";
import { L as Layout } from "./Layout-DXJEf-iu.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { resolveComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Create a New Role" },
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
        name: null,
        slug: null,
        create_workspace: null,
        create_project: null
      })
    };
  },
  methods: {
    store() {
      this.form.post(this.route("roles.store"));
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
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.slug,
    "onUpdate:modelValue": ($event) => $data.form.slug = $event,
    error: $data.form.errors.slug,
    class: "pr-6 pb-8 w-full lg:w-1/2",
    label: _ctx.$t("Slug")
  }, null, _parent));
  _push(`</div><div class="p-8 flex flex-col gap-10"><label for="create__workspace" class="flex toggle_swtich items-center cursor-pointer"><div class="mr-3 text-sm">${ssrInterpolate(_ctx.$t("Create workspace"))}</div><div class="relative"><input id="create__workspace" type="checkbox" class="sr-only"${ssrIncludeBooleanAttr(Array.isArray($data.form.create_workspace) ? ssrLooseContain($data.form.create_workspace, null) : $data.form.create_workspace) ? " checked" : ""}><div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div><div class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div></div></label><label for="create__project" class="flex toggle_swtich items-center cursor-pointer"><div class="mr-3 text-sm">${ssrInterpolate(_ctx.$t("Create Project"))}</div><div class="relative"><input id="create__project" type="checkbox" class="sr-only"${ssrIncludeBooleanAttr(Array.isArray($data.form.create_project) ? ssrLooseContain($data.form.create_project, null) : $data.form.create_project) ? " checked" : ""}><div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div><div class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div></div></label></div><div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center">`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "btn-indigo",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("Create Role"))}`);
      } else {
        return [
          createTextVNode(toDisplayString(_ctx.$t("Create Role")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Roles/Create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Create = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Create as default
};
