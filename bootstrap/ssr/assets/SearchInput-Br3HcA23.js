import { D as Dropdown } from "./Layout-DXJEf-iu.js";
import { mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  components: {
    Dropdown
  },
  props: {
    modelValue: String,
    disableTrash: String,
    maxWidth: {
      type: Number,
      default: 300
    },
    disableReset: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "reset"]
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center" }, _attrs))}><div class="flex w-full bg-white rounded shadow"><input class="relative px-6 py-3 w-full rounded focus:shadow-outline" autocomplete="off" type="text" name="search"${ssrRenderAttr("placeholder", _ctx.$t("Search..."))}${ssrRenderAttr("value", $props.modelValue)}></div>`);
  if (!$props.disableReset) {
    _push(`<button class="ml-3 rtl:mr-3 text-gray-500 hover:text-gray-700 focus:text-indigo-500 text-sm" type="button">${ssrInterpolate(_ctx.$t("Reset"))}</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/SearchInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SearchInput = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  SearchInput as S
};
