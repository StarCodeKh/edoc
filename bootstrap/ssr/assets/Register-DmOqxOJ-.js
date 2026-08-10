import { F as FlashMessages, L as Logo } from "./FlashMessages-DizfipYZ.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { Link, Head } from "@inertiajs/vue3";
import vueRecaptcha from "vue3-recaptcha2";
import { resolveComponent, withCtx, createVNode, openBlock, createBlock, createTextVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "uuid";
const _sfc_main = {
  metaInfo: { title: "ចុះឈ្មោះ - E-Document System" },
  components: {
    LoadingButton,
    Logo,
    TextInput,
    Head,
    Link,
    FlashMessages,
    vueRecaptcha
  },
  props: {
    is_demo: Number,
    site_key: String
  },
  data() {
    return {
      disable_button: true,
      form: this.$inertia.form({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirm_password: ""
      })
    };
  },
  methods: {
    recaptchaVerified(response) {
      this.disable_button = false;
      console.log(response);
    },
    recaptchaExpired() {
      this.$refs.vueRecaptcha.reset();
    },
    recaptchaFailed() {
    },
    recaptchaError(reason) {
      console.log(reason);
    },
    login() {
      if (this.form.password !== this.form.confirm_password) {
        alert("Your password is not matched correctly.");
        return;
      }
      this.form.post(this.route("register.store"));
    },
    autofillLogin(e, role) {
      e.preventDefault();
      const roleEmails = { "admin": "john.due.helo@mail.com", "manager": "robert.slaughter@mail.com", "customer": "mmarks@example.com" };
      this.form.email = roleEmails[role];
      this.form.password = "secret";
      this.login();
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_Logo = resolveComponent("Logo");
  const _component_flash_messages = resolveComponent("flash-messages");
  const _component_text_input = resolveComponent("text-input");
  const _component_vue_recaptcha = resolveComponent("vue-recaptcha");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<!--[-->`);
  _push(ssrRenderComponent(_component_Head, { title: "ចុះឈ្មោះ - E-Document System" }, null, _parent));
  _push(`<div class="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden" data-v-ad8576cb><div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]" data-v-ad8576cb></div><div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]" data-v-ad8576cb></div><div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]" data-v-ad8576cb></div><div class="pointer-events-none absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(#149954 0.6px, transparent 0.6px)", "background-size": "26px 26px", "opacity": "0.05" })}" data-v-ad8576cb></div><div class="relative w-full max-w-xl" data-v-ad8576cb><div class="text-center mb-6" data-v-ad8576cb>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("dashboard"),
    class: "inline-block group"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105" data-v-ad8576cb${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Logo, { class: "w-12 h-12 fill-[#149954]" }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105" }, [
            createVNode(_component_Logo, { class: "w-12 h-12 fill-[#149954]" })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h1 class="mt-4 text-3xl font-bold text-[#0E4429]" data-v-ad8576cb> ចុះឈ្មោះ </h1><p class="mt-2 text-[#149954]/70 text-sm" data-v-ad8576cb> បង្កើតគណនីថ្មីដើម្បីចាប់ផ្តើមប្រើប្រាស់ប្រព័ន្ធ </p><p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold" data-v-ad8576cb> E-Document System </p></div><div class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]" data-v-ad8576cb>`);
  _push(ssrRenderComponent(_component_flash_messages, null, null, _parent));
  _push(`<form class="px-8 sm:px-10 pt-8 pb-8" data-v-ad8576cb><div class="flex flex-wrap" data-v-ad8576cb>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.first_name,
    "onUpdate:modelValue": ($event) => $data.form.first_name = $event,
    error: $data.form.errors.first_name,
    class: "pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input",
    label: "ឈ្មោះដើម",
    type: "text",
    autofocus: "",
    autocapitalize: "off",
    is_required: true,
    required: ""
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.last_name,
    "onUpdate:modelValue": ($event) => $data.form.last_name = $event,
    error: $data.form.errors.last_name,
    class: "pb-5 w-full lg:w-1/2 login-input",
    label: "ត្រកូល",
    type: "text",
    autocapitalize: "off",
    is_required: true,
    required: ""
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.email,
    "onUpdate:modelValue": ($event) => $data.form.email = $event,
    error: $data.form.errors.email,
    class: "pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input",
    label: "អ៊ីមែល",
    type: "email",
    autocapitalize: "off",
    is_required: true,
    required: ""
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.phone,
    "onUpdate:modelValue": ($event) => $data.form.phone = $event,
    error: $data.form.errors.phone,
    class: "pb-5 w-full lg:w-1/2 login-input",
    label: "លេខទូរស័ព្ទ",
    type: "text",
    autocapitalize: "off"
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.address,
    "onUpdate:modelValue": ($event) => $data.form.address = $event,
    error: $data.form.errors.address,
    class: "pb-5 w-full login-input",
    label: "អាសយដ្ឋាន",
    type: "text",
    autocapitalize: "off"
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password,
    "onUpdate:modelValue": ($event) => $data.form.password = $event,
    error: $data.form.errors.password,
    class: "pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input",
    label: "លេខសម្ងាត់",
    type: "password",
    is_required: true,
    required: ""
  }, null, _parent));
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.confirm_password,
    "onUpdate:modelValue": ($event) => $data.form.confirm_password = $event,
    error: $data.form.errors.confirm_password,
    class: "pb-5 w-full lg:w-1/2 login-input",
    label: "បញ្ជាក់លេខសម្ងាត់",
    type: "password",
    is_required: true,
    required: ""
  }, null, _parent));
  if ($props.site_key) {
    _push(`<div class="flex justify-center items-center py-3 w-full" data-v-ad8576cb>`);
    _push(ssrRenderComponent(_component_vue_recaptcha, {
      sitekey: $props.site_key,
      size: "normal",
      theme: "light",
      onVerify: $options.recaptchaVerified,
      onExpire: $options.recaptchaExpired,
      onFail: $options.recaptchaFailed,
      onError: $options.recaptchaError,
      ref: "vueRecaptcha"
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_loading_button, {
    disabled: $data.disable_button && $props.site_key,
    loading: $data.form.processing,
    class: "w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<span class="w-full inline-flex items-center justify-center gap-2" data-v-ad8576cb${_scopeId}><svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-ad8576cb${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-v-ad8576cb${_scopeId}></path></svg> ដាក់ស្នើ </span>`);
      } else {
        return [
          createVNode("span", { class: "w-full inline-flex items-center justify-center gap-2" }, [
            (openBlock(), createBlock("svg", {
              class: "w-4 h-4 shrink-0",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24"
            }, [
              createVNode("path", {
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-width": "2",
                d: "M12 4v16m8-8H4"
              })
            ])),
            createTextVNode(" ដាក់ស្នើ ")
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="mt-6 text-center text-sm text-[#0E4429]/60" data-v-ad8576cb> មានគណនីរួចហើយ? `);
  _push(ssrRenderComponent(_component_Link, {
    class: "ml-1 font-semibold text-[#149954] hover:text-[#B8901E] transition-colors",
    href: _ctx.route("login")
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` ចូលប្រើប្រាស់ `);
      } else {
        return [
          createTextVNode(" ចូលប្រើប្រាស់ ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></form></div><p class="mt-8 text-center text-xs text-[#0E4429]/40" data-v-ad8576cb> មានសុវត្ថិភាព និងស្ថិតក្រោមការគ្រប់គ្រង </p></div></div><!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Register = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ad8576cb"]]);
export {
  Register as default
};
