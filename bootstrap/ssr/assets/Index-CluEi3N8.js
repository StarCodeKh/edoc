import { Head, Link } from "@inertiajs/vue3";
import { L as Layout, S as SelectInput, I as Icon } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { L as LoadingButton, T as TextInput } from "./LoadingButton-CYW6UWDJ.js";
import { v4 } from "uuid";
import { mergeProps, useSSRContext, resolveComponent, withCtx, openBlock, createBlock, Fragment, renderList, toDisplayString, createVNode, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { F as FileInput } from "./FileInput-PDHMJZ8j.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main$1 = {
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default() {
        return `textarea-input-${v4()}`;
      }
    },
    error: String,
    label: String,
    modelValue: String,
    rows: {
      type: Number,
      default: 3
    }
  },
  emits: ["update:modelValue"],
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    select() {
      this.$refs.input.select();
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  let _temp0;
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: _ctx.$attrs.class
  }, _attrs))}>`);
  if ($props.label) {
    _push(`<label class="form-label"${ssrRenderAttr("for", $props.id)}>${ssrInterpolate($props.label)}</label>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<textarea${ssrRenderAttrs(_temp0 = mergeProps({
    id: $props.id,
    ref: "input"
  }, { ..._ctx.$attrs, class: null }, {
    class: ["form-textarea", { error: $props.error }],
    rows: $props.rows,
    value: $props.modelValue
  }), "textarea")}>${ssrInterpolate("value" in _temp0 ? _temp0.value : "")}</textarea>`);
  if ($props.error) {
    _push(`<div class="form-error">${ssrInterpolate($props.error)}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/TextareaInput.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TextareaInput = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main = {
  metaInfo: { title: "Priorities" },
  components: {
    Icon,
    Link,
    Head,
    FileInput,
    Pagination,
    TextInput,
    TextareaInput,
    SelectInput,
    LoadingButton
  },
  layout: Layout,
  props: {
    title: String,
    settings: Object,
    languages: Array,
    pusher: Boolean,
    site_key: String,
    webhook_url: String
  },
  remember: "form",
  data() {
    return {
      availableFileTypes: [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "csv",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "mp3",
        "wav",
        "mp4",
        "webm",
        "zip",
        "rar",
        "7z"
      ],
      newFileType: "",
      form: this.$inertia.form({
        app_name: this.settings.app_name.value,
        enable_registration: Boolean(parseInt(this.settings.enable_registration.value, 10)),
        logo: null,
        logo_white: null,
        favicon: null,
        site_key: this.site_key,
        webhook_url: this.webhook_url || "",
        main_logo: "/images/logo.png",
        main_logo_white: "/images/logo_white.png",
        main_favicon: "/favicon.png",
        default_language: this.settings.default_language.value,
        custom_css: typeof this.settings.custom_css !== "undefined" && this.settings.custom_css ? this.settings.custom_css.value : null,
        allowed_file_types: this.settings.allowed_file_types ? this.settings.allowed_file_types.value : []
      })
    };
  },
  created() {
  },
  methods: {
    update() {
      const vm = this;
      this.form.post(this.route("global.update"), {
        onSuccess: () => {
          const successMessage = vm.$page.props.flash.success;
          this.form.logo = null;
          this.form.logo_white = null;
          if (successMessage) {
            window.location.reload();
          }
        }
      });
    },
    addFileType() {
      const val = this.newFileType.trim().replace(/,/g, "");
      if (val && !this.form.allowed_file_types.includes(val)) {
        this.form.allowed_file_types.push(val);
      }
      this.newFileType = "";
    },
    checkDelimiter(e) {
      if (e.key === "," || e.key === " ") {
        e.preventDefault();
        this.addFileType();
      }
    },
    removeFileType(index) {
      this.form.allowed_file_types.splice(index, 1);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_icon = resolveComponent("icon");
  const _component_text_input = resolveComponent("text-input");
  const _component_select_input = resolveComponent("select-input");
  const _component_file_input = resolveComponent("file-input");
  const _component_textarea_input = resolveComponent("textarea-input");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" }, _attrs))} data-v-c463310b>`);
  _push(ssrRenderComponent(_component_Head, { title: $props.title }, null, _parent));
  _push(`<div class="bg-white border-b border-gray-200/60 shadow-sm" data-v-c463310b><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-c463310b><div class="py-8" data-v-c463310b><div class="flex items-center space-x-4" data-v-c463310b><div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "settings",
    class: "w-8 h-8 text-white"
  }, null, _parent));
  _push(`</div><div data-v-c463310b><h1 class="text-3xl font-bold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Global Settings"))}</h1><p class="text-gray-600 mt-1" data-v-c463310b>Configure your application settings and preferences</p></div></div></div></div></div><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-v-c463310b><form class="space-y-8" data-v-c463310b><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-indigo-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "app",
    class: "w-5 h-5 text-indigo-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Basic Application Settings"))}</h2></div></div><div class="p-6" data-v-c463310b><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.app_name,
    "onUpdate:modelValue": ($event) => $data.form.app_name = $event,
    error: $data.form.errors.app_name,
    label: _ctx.$t("App Name")
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.site_key,
    "onUpdate:modelValue": ($event) => $data.form.site_key = $event,
    error: $data.form.errors.site_key,
    label: _ctx.$t("Google ReCaptcha Site Key")
  }, null, _parent));
  _push(ssrRenderComponent(_component_select_input, {
    modelValue: $data.form.default_language,
    "onUpdate:modelValue": ($event) => $data.form.default_language = $event,
    error: $data.form.errors.default_language,
    label: _ctx.$t("Default Language")
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<!--[-->`);
        ssrRenderList($props.languages, (l) => {
          _push2(`<option${ssrRenderAttr("value", l.code)} data-v-c463310b${_scopeId}>${ssrInterpolate(l.name)}</option>`);
        });
        _push2(`<!--]-->`);
      } else {
        return [
          (openBlock(true), createBlock(Fragment, null, renderList($props.languages, (l) => {
            return openBlock(), createBlock("option", {
              key: l.id,
              value: l.code
            }, toDisplayString(l.name), 9, ["value"]);
          }), 128))
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="mt-6" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.webhook_url,
    "onUpdate:modelValue": ($event) => $data.form.webhook_url = $event,
    error: $data.form.errors.webhook_url,
    label: _ctx.$t("Slack webhook URL")
  }, null, _parent));
  _push(`</div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-purple-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "image",
    class: "w-5 h-5 text-purple-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Branding & Assets"))}</h2></div></div><div class="p-6" data-v-c463310b><div class="grid grid-cols-1 md:grid-cols-3 gap-6" data-v-c463310b><div class="space-y-3" data-v-c463310b><label class="block text-sm font-medium text-gray-700" data-v-c463310b>${ssrInterpolate(_ctx.$t("Favicon"))}</label><div class="flex items-center space-x-4" data-v-c463310b><div class="flex-1" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_file_input, {
    modelValue: $data.form.favicon,
    "onUpdate:modelValue": ($event) => $data.form.favicon = $event,
    error: $data.form.errors.favicon,
    type: "file",
    accept: "image/png"
  }, null, _parent));
  _push(`</div><div class="flex-shrink-0" data-v-c463310b><div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden" data-v-c463310b>`);
  if ($data.form.main_favicon) {
    _push(`<img class="w-8 h-8 object-contain"${ssrRenderAttr("src", $data.form.main_favicon)} data-v-c463310b>`);
  } else {
    _push(ssrRenderComponent(_component_icon, {
      name: "image",
      class: "w-6 h-6 text-gray-400"
    }, null, _parent));
  }
  _push(`</div></div></div></div><div class="space-y-3" data-v-c463310b><label class="block text-sm font-medium text-gray-700" data-v-c463310b>${ssrInterpolate(_ctx.$t("Logo"))}</label><div class="flex items-center space-x-4" data-v-c463310b><div class="flex-1" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_file_input, {
    modelValue: $data.form.logo,
    "onUpdate:modelValue": ($event) => $data.form.logo = $event,
    error: $data.form.errors.logo,
    type: "file",
    accept: "image/png"
  }, null, _parent));
  _push(`</div><div class="flex-shrink-0" data-v-c463310b><div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden" data-v-c463310b>`);
  if ($data.form.main_logo) {
    _push(`<img class="w-8 h-8 object-contain"${ssrRenderAttr("src", $data.form.main_logo)} data-v-c463310b>`);
  } else {
    _push(ssrRenderComponent(_component_icon, {
      name: "image",
      class: "w-6 h-6 text-gray-400"
    }, null, _parent));
  }
  _push(`</div></div></div></div><div class="space-y-3" data-v-c463310b><label class="block text-sm font-medium text-gray-700" data-v-c463310b>${ssrInterpolate(_ctx.$t("White Logo"))}</label><div class="flex items-center space-x-4" data-v-c463310b><div class="flex-1" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_file_input, {
    modelValue: $data.form.logo_white,
    "onUpdate:modelValue": ($event) => $data.form.logo_white = $event,
    error: $data.form.errors.logo_white,
    type: "file",
    accept: "image/png"
  }, null, _parent));
  _push(`</div><div class="flex-shrink-0" data-v-c463310b><div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden" data-v-c463310b>`);
  if ($data.form.main_logo_white) {
    _push(`<img class="w-8 h-8 object-contain"${ssrRenderAttr("src", $data.form.main_logo_white)} data-v-c463310b>`);
  } else {
    _push(ssrRenderComponent(_component_icon, {
      name: "image",
      class: "w-6 h-6 text-gray-400"
    }, null, _parent));
  }
  _push(`</div></div></div></div></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-green-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "user-plus",
    class: "w-5 h-5 text-green-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("User Registration"))}</h2></div></div><div class="p-6" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="flex items-center h-5" data-v-c463310b><input id="enableRegistration" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.form.enable_registration) ? ssrLooseContain($data.form.enable_registration, null) : $data.form.enable_registration) ? " checked" : ""} class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2" data-v-c463310b></div><div class="flex-1" data-v-c463310b><label for="enableRegistration" class="text-sm font-medium text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Enable Registration"))}</label><p class="text-xs text-gray-500 mt-1" data-v-c463310b>${ssrInterpolate(_ctx.$t("Show Registration link on the login page"))}</p></div></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-blue-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "attachment",
    class: "w-5 h-5 text-blue-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("File Upload Settings"))}</h2></div></div><div class="p-6" data-v-c463310b><div class="space-y-4" data-v-c463310b><div data-v-c463310b><label class="block text-sm font-medium text-gray-700 mb-3" data-v-c463310b>${ssrInterpolate(_ctx.$t("Allowed File Types"))}</label><div class="flex flex-wrap gap-2 mb-4" data-v-c463310b><!--[-->`);
  ssrRenderList($data.form.allowed_file_types, (file_type, ft_key) => {
    _push(`<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600" data-v-c463310b>${ssrInterpolate(file_type)} <button type="button" class="inline-flex items-center p-0.5 ml-2 text-white hover:bg-white/20 rounded-full transition-colors" aria-label="Remove" data-v-c463310b>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "close",
      class: "w-3 h-3"
    }, null, _parent));
    _push(`</button></span>`);
  });
  _push(`<!--]--></div><div class="relative" data-v-c463310b><input${ssrRenderAttr("value", $data.newFileType)} class="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" type="text"${ssrRenderAttr("placeholder", _ctx.$t("Type file extensions and press enter or comma to add"))} data-v-c463310b><div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "plus",
    class: "w-4 h-4 text-gray-400"
  }, null, _parent));
  _push(`</div></div>`);
  if ($data.form.errors.allowed_file_types) {
    _push(`<div class="text-red-500 text-xs mt-2" data-v-c463310b>${ssrInterpolate($data.form.errors.allowed_file_types)}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-yellow-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "clock",
    class: "w-5 h-5 text-yellow-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Cron Job Instructions"))}</h2></div></div><div class="p-6" data-v-c463310b><div class="space-y-6" data-v-c463310b><div class="p-4 bg-blue-50 rounded-xl border border-blue-200" data-v-c463310b><h3 class="text-sm font-semibold text-blue-900 mb-2" data-v-c463310b>${ssrInterpolate(_ctx.$t("Email Queue Setup"))}</h3><p class="text-sm text-blue-800 mb-4" data-v-c463310b>${ssrInterpolate(_ctx.$t("To send emails without delays, set up a cron job. First, enable the queue by adding"))} <code class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono" data-v-c463310b>QUEUE_ENABLE=true</code> ${ssrInterpolate(_ctx.$t("to your .env file."))}</p><div class="space-y-3" data-v-c463310b><div data-v-c463310b><label class="block text-xs font-medium text-blue-700 mb-1" data-v-c463310b>${ssrInterpolate(_ctx.$t("Standard Server Cron Job"))}</label><div class="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto" data-v-c463310b><code data-v-c463310b>*/3 * * * * /usr/bin/php artisan queue:work --queue=high,default --stop-when-empty</code></div><p class="text-xs text-blue-600 mt-1" data-v-c463310b>${ssrInterpolate(_ctx.$t("Runs every 3 minutes to process email queue"))}</p></div><div data-v-c463310b><label class="block text-xs font-medium text-blue-700 mb-1" data-v-c463310b>${ssrInterpolate(_ctx.$t("Shared Hosting (cPanel) Cron Job"))}</label><div class="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto" data-v-c463310b><code data-v-c463310b>*/3 * * * * wget -q -O - https://website.com/cron/queue_work &gt;/dev/null 2&gt;&amp;1</code></div><p class="text-xs text-blue-600 mt-1" data-v-c463310b>${ssrInterpolate(_ctx.$t("Alternative method for shared hosting providers"))}</p></div></div></div></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-c463310b><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-c463310b><div class="flex items-center space-x-3" data-v-c463310b><div class="p-2 bg-pink-100 rounded-lg" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "code",
    class: "w-5 h-5 text-pink-600"
  }, null, _parent));
  _push(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-c463310b>${ssrInterpolate(_ctx.$t("Custom CSS"))}</h2></div></div><div class="p-6" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_textarea_input, {
    modelValue: $data.form.custom_css,
    "onUpdate:modelValue": ($event) => $data.form.custom_css = $event,
    error: $data.form.errors.custom_css,
    rows: 15,
    placeholder: "/* Add your custom CSS here */",
    label: _ctx.$t("Custom CSS Code")
  }, null, _parent));
  _push(`</div></div><div class="flex justify-end" data-v-c463310b>`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_icon, {
          name: "save",
          class: "w-5 h-5 mr-2"
        }, null, _parent2, _scopeId));
        _push2(` ${ssrInterpolate(_ctx.$t("Save Settings"))}`);
      } else {
        return [
          createVNode(_component_icon, {
            name: "save",
            class: "w-5 h-5 mr-2"
          }),
          createTextVNode(" " + toDisplayString(_ctx.$t("Save Settings")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-c463310b"]]);
export {
  Index as default
};
