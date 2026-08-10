import { L as Logo, F as FlashMessages } from "./FlashMessages-DizfipYZ.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { Link, Head } from "@inertiajs/vue3";
import vueRecaptcha from "vue3-recaptcha2";
import { Users, User, Shield, Crown } from "lucide-vue-next";
import { resolveComponent, withCtx, createVNode, createTextVNode, openBlock, createBlock, resolveDynamicComponent, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderList, ssrRenderVNode } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "uuid";
const _sfc_main = {
  metaInfo: { title: "ចូលប្រើប្រាស់ - E-Document System" },
  components: {
    FlashMessages,
    LoadingButton,
    Logo,
    TextInput,
    Head,
    Link,
    vueRecaptcha,
    Crown,
    Shield,
    User,
    Users
  },
  props: {
    is_demo: Number,
    site_key: String,
    enable_registration: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loadingTimeout: 3e4,
      disable_login_button: true,
      isLoggingIn: false,
      loginError: null,
      form: this.$inertia.form({
        email: "",
        password: "",
        remember: false
      }),
      demoCredentials: {
        admin: {
          label: "អ្នកគ្រប់គ្រង",
          email: "john.due.helo@mail.com",
          icon: Crown
        },
        normal: {
          label: "អ្នកប្រើទូទៅ",
          email: "sabbir@example.com",
          icon: Shield
        }
      }
    };
  },
  methods: {
    login() {
      this.form.post(this.route("login.store"));
    },
    recaptchaVerified(response) {
      this.disable_login_button = false;
    },
    recaptchaExpired() {
      this.$refs.vueRecaptcha.reset();
    },
    recaptchaFailed() {
    },
    recaptchaError(reason) {
      console.log(reason);
    },
    clearError() {
      this.loginError = null;
    },
    autofillLogin(e, role, login = false) {
      e.preventDefault();
      const roleEmails = {
        "admin": { email: "john.due.helo@mail.com", password: "s6J5WQR9ZlpvG7" },
        "normal": { email: "sabbir@example.com", password: "SY7Ta85KTV2e0n" }
      };
      this.form.email = roleEmails[role]["email"];
      this.form.password = roleEmails[role]["password"];
      if (login) {
        this.login();
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_flash_messages = resolveComponent("flash-messages");
  const _component_Link = resolveComponent("Link");
  const _component_Logo = resolveComponent("Logo");
  const _component_text_input = resolveComponent("text-input");
  const _component_vue_recaptcha = resolveComponent("vue-recaptcha");
  const _component_loading_button = resolveComponent("loading-button");
  const _component_Crown = resolveComponent("Crown");
  const _component_Shield = resolveComponent("Shield");
  _push(`<!--[-->`);
  _push(ssrRenderComponent(_component_Head, { title: "ចូលប្រើប្រាស់ - E-Document System" }, null, _parent));
  _push(`<div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden" data-v-72d08b96><div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]" data-v-72d08b96></div><div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]" data-v-72d08b96></div><div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]" data-v-72d08b96></div><div class="pointer-events-none absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(#149954 0.6px, transparent 0.6px)", "background-size": "26px 26px", "opacity": "0.05" })}" data-v-72d08b96></div>`);
  _push(ssrRenderComponent(_component_flash_messages, null, null, _parent));
  _push(`<div class="relative w-full max-w-md" data-v-72d08b96><div class="text-center mb-8" data-v-72d08b96>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("home"),
    class: "inline-block group relative"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105" data-v-72d08b96${_scopeId}>`);
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
  _push(`<h1 class="mt-4 text-3xl font-bold text-[#0E4429]" data-v-72d08b96> ចូលប្រើប្រាស់ប្រព័ន្ធ </h1><p class="mt-2 text-[#149954]/70 text-sm" data-v-72d08b96> សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្តទៅកាន់ផ្ទាំងគ្រប់គ្រង </p><p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold" data-v-72d08b96> E-Document System </p></div><div class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]" data-v-72d08b96><form class="px-8 pt-8 pb-8" data-v-72d08b96><div class="mb-5" data-v-72d08b96><label class="block mb-2 text-sm font-semibold text-[#0E4429]" data-v-72d08b96>អ៊ីមែល</label>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.email,
    "onUpdate:modelValue": ($event) => $data.form.email = $event,
    error: $data.form.errors.email,
    type: "email",
    autofocus: "",
    autocapitalize: "off",
    placeholder: "បញ្ចូលអ៊ីមែលរបស់អ្នក",
    class: "w-full login-input",
    onInput: $options.clearError
  }, null, _parent));
  _push(`</div><div class="mb-5" data-v-72d08b96><label class="block mb-2 text-sm font-semibold text-[#0E4429]" data-v-72d08b96>លេខសម្ងាត់</label>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password,
    "onUpdate:modelValue": ($event) => $data.form.password = $event,
    error: $data.form.errors.password,
    type: "password",
    placeholder: "បញ្ចូលលេខសម្ងាត់",
    class: "w-full login-input",
    onInput: $options.clearError
  }, null, _parent));
  _push(`</div><div class="flex items-center justify-between mb-6 text-sm" data-v-72d08b96><label class="flex items-center cursor-pointer group" data-v-72d08b96><input id="remember"${ssrIncludeBooleanAttr(Array.isArray($data.form.remember) ? ssrLooseContain($data.form.remember, null) : $data.form.remember) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-[#149954] bg-white border-[#D4AF37]/50 rounded focus:ring-[#149954] focus:ring-2" data-v-72d08b96><span class="ml-2 text-[#0E4429]/70 group-hover:text-[#0E4429] transition-colors" data-v-72d08b96> ចងចាំខ្ញុំ </span></label>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("password.reset"),
    class: "text-[#B8901E] hover:text-[#149954] transition-colors font-medium"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` ភ្លេចលេខសម្ងាត់? `);
      } else {
        return [
          createTextVNode(" ភ្លេចលេខសម្ងាត់? ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
  if ($props.site_key) {
    _push(`<div class="flex justify-center mb-6" data-v-72d08b96>`);
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
  if ($data.loginError) {
    _push(`<div class="mb-5 p-3 bg-[#0E4429]/5 border border-[#0E4429]/20 text-[#0E4429] rounded-xl text-sm" data-v-72d08b96><div class="flex items-center" data-v-72d08b96><svg class="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20" data-v-72d08b96><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-72d08b96></path></svg> ${ssrInterpolate($data.loginError)}</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_loading_button, {
    disabled: $data.disable_login_button && $props.site_key || $data.isLoggingIn,
    loading: $data.isLoggingIn,
    class: "w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if (!$data.isLoggingIn) {
          _push2(`<span class="w-full inline-flex items-center justify-center gap-2" data-v-72d08b96${_scopeId}><svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-72d08b96${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" data-v-72d08b96${_scopeId}></path></svg> ចូលប្រើប្រាស់ </span>`);
        } else {
          _push2(`<span class="w-full inline-flex items-center justify-center" data-v-72d08b96${_scopeId}>កំពុងចូល...</span>`);
        }
      } else {
        return [
          !$data.isLoggingIn ? (openBlock(), createBlock("span", {
            key: 0,
            class: "w-full inline-flex items-center justify-center gap-2"
          }, [
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
                d: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              })
            ])),
            createTextVNode(" ចូលប្រើប្រាស់ ")
          ])) : (openBlock(), createBlock("span", {
            key: 1,
            class: "w-full inline-flex items-center justify-center"
          }, "កំពុងចូល..."))
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.enable_registration) {
    _push(`<div class="mt-6 text-center" data-v-72d08b96><p class="text-sm text-[#0E4429]/60" data-v-72d08b96> មិនទាន់មានគណនីមែនទេ? `);
    _push(ssrRenderComponent(_component_Link, {
      href: _ctx.route("register"),
      class: "font-semibold text-[#149954] hover:text-[#B8901E] transition-colors"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(` ចុះឈ្មោះ `);
        } else {
          return [
            createTextVNode(" ចុះឈ្មោះ ")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</form></div>`);
  if ($props.is_demo) {
    _push(`<div class="mt-6 rounded-[28px] bg-white border-2 border-[#149954] overflow-hidden" data-v-72d08b96><div class="px-6 py-4 border-b border-[#149954]/10" data-v-72d08b96><h3 class="text-sm font-semibold text-[#0E4429] text-center" data-v-72d08b96> ព័ត៌មានសម្គាល់សាកល្បង </h3><p class="text-xs text-[#0E4429]/60 text-center mt-1" data-v-72d08b96> សាកល្បងតួនាទីអ្នកប្រើផ្សេងៗភ្លាមៗ </p></div><div class="p-6" data-v-72d08b96><div class="grid grid-cols-2 gap-3 mb-6" data-v-72d08b96><button class="flex items-center justify-center text-center px-4 py-3 bg-[#D4AF37] hover:bg-[#B8901E] text-white font-medium rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-[#D4AF37]" data-v-72d08b96>`);
    _push(ssrRenderComponent(_component_Crown, { class: "w-4 h-4 mr-2" }, null, _parent));
    _push(` អ្នកគ្រប់គ្រង </button><button class="flex items-center justify-center text-center px-4 py-3 bg-[#149954] hover:bg-[#0E7A42] text-white font-medium rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-[#149954]" data-v-72d08b96>`);
    _push(ssrRenderComponent(_component_Shield, { class: "w-4 h-4 mr-2" }, null, _parent));
    _push(` អ្នកប្រើទូទៅ </button></div><div class="space-y-3" data-v-72d08b96><h4 class="text-sm font-semibold text-[#0E4429]/70 mb-3" data-v-72d08b96> ឬចម្លងព័ត៌មានដោយដៃ: </h4><div class="space-y-2" data-v-72d08b96><!--[-->`);
    ssrRenderList($data.demoCredentials, (credential, role) => {
      _push(`<div class="flex items-center justify-between p-3 bg-[#149954]/[0.04] rounded-2xl border border-[#149954]/10" data-v-72d08b96><div class="flex-1" data-v-72d08b96><div class="flex items-center space-x-2" data-v-72d08b96>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(credential.icon), { class: "w-4 h-4 text-[#D4AF37]" }, null), _parent);
      _push(`<span class="text-sm font-medium text-[#0E4429]" data-v-72d08b96>${ssrInterpolate(credential.label)}</span></div><div class="mt-1 text-xs text-[#0E4429]/60" data-v-72d08b96>${ssrInterpolate(credential.email)}</div></div><button class="ml-3 px-3 py-1 text-xs bg-white border border-[#149954]/20 hover:border-[#149954] text-[#149954] rounded-lg transition-colors" data-v-72d08b96> ចម្លង </button></div>`);
    });
    _push(`<!--]--></div></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<p class="mt-8 text-center text-xs text-[#0E4429]/40" data-v-72d08b96> មានសុវត្ថិភាព និងស្ថិតក្រោមការគ្រប់គ្រង </p></div></div><!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Login = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-72d08b96"]]);
export {
  Login as default
};
