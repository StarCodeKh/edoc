import { Head, Link } from "@inertiajs/vue3";
import { L as Layout, S as SelectInput, I as Icon } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { L as LoadingButton, T as TextInput } from "./LoadingButton-CYW6UWDJ.js";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Priorities" },
  components: {
    Icon,
    Link,
    Head,
    Pagination,
    TextInput,
    SelectInput,
    LoadingButton
  },
  layout: Layout,
  props: {
    title: String,
    demo: Boolean,
    current_version: { required: false }
  },
  remember: "form",
  data() {
    return {
      files: [],
      latest_version: "",
      form: this.$inertia.form({
        processing: false
      })
    };
  },
  methods: {
    update() {
      this.form.processing = true;
      axios.post(this.route("settings.update.check"), {}).then((response) => {
        const data = response.data;
        this.files = [].concat(data.files);
        if (data.version) {
          this.latest_version = data.version;
        }
        this.form.processing = false;
      }).catch((error) => {
        console.log(error);
      });
    }
  },
  created() {
    console.log(this.demo);
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "sec-cont" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, { title: $props.title }, null, _parent));
  _push(`<div class="bg-white rounded-md shadow overflow-hidden mr-2"><form><div class="py-8 px-6 flex m-auto flex-col gap-4"><div class="flex flex-col"><span class="">Your current version: ${ssrInterpolate($props.current_version)}</span></div><p class="leading-6"> Please click on the &quot;Check update&quot; button to get the latest update information. </p>`);
  if ($data.latest_version) {
    _push(`<div class="flex flex-col gap-2"><span class="">Latest Envato version: ${ssrInterpolate($data.latest_version)}</span><p class="leading-6"> We don&#39;t want to auto update all files to messed up your changes if you made your own. You will see here all of the files that made changes on the latest releases. Just download the latest files from the CodeCanyon and replace the following changed files from those downloaded files. After replace the file please set the version number to your \`.env\` file. </p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($data.files.length) {
    _push(`<div class="relative overflow-x-auto"><table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"><thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" class="px-6 py-3"> Changes files </th><th scope="col" class="px-6 py-3"> New file? </th><th scope="col" class="px-6 py-3"> Is the file deleted? </th></tr></thead><tbody><!--[-->`);
    ssrRenderList(this.files, (file, fi) => {
      _push(`<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"><th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${ssrInterpolate(file.new_path || file.old_path)}</th><td class="px-6 py-4">${ssrInterpolate(file.new_file)}</td><td class="px-6 py-4">${ssrInterpolate(file.deleted_file)}</td></tr>`);
    });
    _push(`<!--]--></tbody></table></div>`);
  } else {
    _push(`<div class="py-2 px-6">Nothing found!</div>`);
  }
  _push(`<div class="mt-5 px-8 py-4 bg-gray-50 border-t border-gray-100 flex gap-2 items-center">`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "btn-indigo",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("Check Update"))}`);
      } else {
        return [
          createTextVNode(toDisplayString(_ctx.$t("Check Update")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Update.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Update = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Update as default
};
