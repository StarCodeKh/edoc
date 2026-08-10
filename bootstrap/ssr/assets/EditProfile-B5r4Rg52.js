import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, S as SelectInput } from "./Layout-DXJEf-iu.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { F as FileInput } from "./FileInput-PDHMJZ8j.js";
import { resolveComponent, mergeProps, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  components: {
    FileInput,
    Head,
    Link,
    LoadingButton,
    SelectInput,
    TextInput
  },
  layout: Layout,
  props: {
    user: Object,
    auth: Object,
    languages: Object,
    countries: Array,
    cities: Array,
    title: String
  },
  remember: "form",
  data() {
    return {
      form: this.$inertia.form({
        _method: "put",
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        phone: this.user.phone,
        locale: this.user.locale,
        address: this.user.address,
        password: "",
        role: this.user.role,
        role_id: this.user.role_id,
        photo: null
      })
    };
  },
  created() {
  },
  methods: {
    setDefaultValue(arr, key, value) {
      const find = arr.find((i) => i.name.match(new RegExp(value + ".*")));
      if (find) {
        this.form[key] = find["id"];
      }
    },
    update() {
      this.form.post(this.route("users.edit.profile.update", this.user.id), {
        onSuccess: () => this.form.reset("password", "photo")
      });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_text_input = resolveComponent("text-input");
  const _component_select_input = resolveComponent("select-input");
  const _component_file_input = resolveComponent("file-input");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "sec-cont" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, { title: $props.title }, null, _parent));
  _push(`<div class="max-w-full bg-white rounded-md shadow overflow-hidden"><form><div class="flex flex-wrap -mb-8 -mr-6 p-8">`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.first_name,
    "onUpdate:modelValue": ($event) => $data.form.first_name = $event,
    error: $data.form.errors.first_name,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    label: _ctx.$t("First name")
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.last_name,
    "onUpdate:modelValue": ($event) => $data.form.last_name = $event,
    error: $data.form.errors.last_name,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    label: _ctx.$t("Last name")
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.email,
    "onUpdate:modelValue": ($event) => $data.form.email = $event,
    error: $data.form.errors.email,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    label: _ctx.$t("Email")
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.phone,
    "onUpdate:modelValue": ($event) => $data.form.phone = $event,
    error: $data.form.errors.phone,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    label: _ctx.$t("Phone")
  }, null, _parent));
  _push(ssrRenderComponent(_component_select_input, {
    modelValue: $data.form.locale,
    "onUpdate:modelValue": ($event) => $data.form.locale = $event,
    error: $data.form.errors.locale,
    class: "pr-6 pb-8 w-full lg:w-1/3",
    label: _ctx.$t("Language")
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<option${ssrRenderAttr("value", null)}${_scopeId}></option><!--[-->`);
        ssrRenderList($props.languages, (language) => {
          _push2(`<option${ssrRenderAttr("value", language.code)}${_scopeId}>${ssrInterpolate(_ctx.$t(language.name))}</option>`);
        });
        _push2(`<!--]-->`);
      } else {
        return [
          createVNode("option", { value: null }),
          (openBlock(true), createBlock(Fragment, null, renderList($props.languages, (language) => {
            return openBlock(), createBlock("option", {
              key: language.code,
              value: language.code
            }, toDisplayString(_ctx.$t(language.name)), 9, ["value"]);
          }), 128))
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.address,
    "onUpdate:modelValue": ($event) => $data.form.address = $event,
    error: $data.form.errors.address,
    class: "pb-8 pr-6 w-full",
    label: _ctx.$t("Address")
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password,
    "onUpdate:modelValue": ($event) => $data.form.password = $event,
    error: $data.form.errors.password,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    type: "password",
    autocomplete: "new-password",
    label: _ctx.$t("Password")
  }, null, _parent));
  _push(ssrRenderComponent(_component_file_input, {
    modelValue: $data.form.photo,
    "onUpdate:modelValue": ($event) => $data.form.photo = $event,
    error: $data.form.errors.photo,
    class: "pb-8 pr-6 w-full lg:w-1/3",
    type: "file",
    accept: "image/*",
    label: "Photo"
  }, null, _parent));
  _push(`<div class="w-full lg:w-1/3 flex items-center justify-start">`);
  if ($props.user.photo_path) {
    _push(`<img class="block mb-2 w-8 h-8 rounded-full"${ssrRenderAttr("src", $props.user.photo_path)}>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="flex items-center px-8 py-4 bg-gray-50 border-t border-gray-100">`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "btn-indigo ml-auto",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("Update User"))}`);
      } else {
        return [
          createTextVNode(toDisplayString(_ctx.$t("Update User")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Users/EditProfile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const EditProfile = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  EditProfile as default
};
