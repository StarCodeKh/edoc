import { Head, Link } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { S as SearchInput } from "./SearchInput-Br3HcA23.js";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Roles" },
  components: {
    Icon,
    Link,
    Head,
    Pagination,
    SearchInput
  },
  layout: Layout,
  props: {
    title: String,
    enable_list: { require: false },
    lists: { require: false }
  },
  data() {
    return {
      new_list: "",
      form: this.$inertia.form({
        enable_pre_made_board: this.enable_list,
        pre_made_board_list: this.lists
      })
    };
  },
  created() {
    console.log(this.enable_list);
  },
  methods: {
    updateList() {
      if (!!this.new_list) {
        this.form.pre_made_board_list.push(this.new_list);
      }
      this.new_list = "";
    },
    remove(index) {
      this.form.pre_made_board_list.splice(index, 1);
      this.update();
    },
    update() {
      this.updateList();
      this.form.post(this.route("global.update.pre_made_list"));
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Icon = resolveComponent("Icon");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "sec-cont" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="bg-white rounded-md shadow overflow-hidden mr-2"><div class="px-8 py-8 flex flex-wrap"><div class="assigned_user pr-6 pb-8 w-full lg:w-full flex flex-col"><div class="font-bold mb-1">${ssrInterpolate(_ctx.$t("Pre made list"))}</div><p class="pt-1 text-sm">If you enable pre made list option - this list will be available while create a new project</p></div><div class="flex items-center mb-4"><input id="enableRegistration" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.form.enable_pre_made_board) ? ssrLooseContain($data.form.enable_pre_made_board, null) : $data.form.enable_pre_made_board) ? " checked" : ""} class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"><label for="enableRegistration" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">${ssrInterpolate(_ctx.$t("Enable pre made board list"))}</label></div></div><div class="px-8 flex w-full"><input type="email"${ssrRenderAttr("value", $data.new_list)} aria-describedby="helper-text-explanation" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2" placeholder="e.g. To Do"><div class="inline-flex items-center px-2 ml-1 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"><button type="button" class="inline-flex items-center p-1 px-2 text-sm text-blue-400 rounded-sm">`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "plus",
    class: "w-4 h-4"
  }, null, _parent));
  _push(`<span class="pl-1">Add new</span></button></div></div><div class="px-8 pb-8 pt-4 flex w-full"><!--[-->`);
  ssrRenderList($props.lists, (list, li) => {
    _push(`<div${ssrRenderAttr("id", "list_" + li)} class="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300">${ssrInterpolate(list)} <button type="button" class="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"${ssrRenderAttr("data-dismiss-target", "#list_" + li)} aria-label="Remove">`);
    _push(ssrRenderComponent(_component_Icon, {
      name: "close",
      class: "w-2 h-2"
    }, null, _parent));
    _push(`</button></div>`);
  });
  _push(`<!--]--></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/PreMadeList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PreMadeList = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  PreMadeList as default
};
