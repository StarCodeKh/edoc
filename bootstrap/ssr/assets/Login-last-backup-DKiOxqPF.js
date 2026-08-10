import { L as Logo, F as FlashMessages } from "./FlashMessages-DizfipYZ.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { Link, Head } from "@inertiajs/vue3";
import vueRecaptcha from "vue3-recaptcha2";
import { resolveComponent, withCtx, createVNode, createTextVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "uuid";
const _sfc_main = {
  metaInfo: { title: "Login" },
  components: {
    FlashMessages,
    LoadingButton,
    Logo,
    TextInput,
    Head,
    Link,
    vueRecaptcha
  },
  props: {
    is_demo: Number,
    site_key: String,
    enable_registration: Object
  },
  data() {
    return {
      enable_register: parseInt(this.enable_registration.value, 10),
      loadingTimeout: 3e4,
      disable_login_button: true,
      form: this.$inertia.form({
        email: "",
        password: "",
        remember: false
      })
    };
  },
  methods: {
    recaptchaVerified(response) {
      this.disable_login_button = false;
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
      this.form.post(this.route("login.store"));
    },
    autofillLogin(e, role, login) {
      e.preventDefault();
      const roleEmails = { "admin": { email: "john.due.helo@mail.com", password: "s6J5WQR9ZlpvG7" }, "normal": { email: "sabbir@example.com", password: "SY7Ta85KTV2e0n" } };
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
  const _component_logo = resolveComponent("logo");
  const _component_text_input = resolveComponent("text-input");
  const _component_vue_recaptcha = resolveComponent("vue-recaptcha");
  const _component_loading_button = resolveComponent("loading-button");
  const _component_icon = resolveComponent("icon");
  _push(`<!--[-->`);
  _push(ssrRenderComponent(_component_Head, { title: "Login" }, null, _parent));
  _push(`<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-v-84533cff>`);
  _push(ssrRenderComponent(_component_flash_messages, null, null, _parent));
  _push(`<div class="absolute inset-0 overflow-hidden" data-v-84533cff><div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" data-v-84533cff></div><div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" data-v-84533cff></div><div class="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" data-v-84533cff></div></div><div class="relative w-full max-w-md" data-v-84533cff><div class="text-center mb-8" data-v-84533cff>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("dashboard"),
    class: "inline-block"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_logo, { class: "w-16 h-16 mx-auto text-indigo-600 hover:text-indigo-700 transition-colors duration-200" }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_logo, { class: "w-16 h-16 mx-auto text-indigo-600 hover:text-indigo-700 transition-colors duration-200" })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h2 class="mt-6 text-3xl font-bold text-gray-900" data-v-84533cff>Welcome back</h2><p class="mt-2 text-sm text-gray-600" data-v-84533cff>Sign in to your account to continue</p></div><div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden" data-v-84533cff><form class="px-8 py-10" data-v-84533cff><div class="mb-6" data-v-84533cff>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.email,
    "onUpdate:modelValue": ($event) => $data.form.email = $event,
    error: $data.form.errors.email,
    label: "Email Address",
    type: "email",
    autofocus: "",
    autocapitalize: "off",
    class: "login-input"
  }, null, _parent));
  _push(`</div><div class="mb-6" data-v-84533cff>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password,
    "onUpdate:modelValue": ($event) => $data.form.password = $event,
    error: $data.form.errors.password,
    label: "Password",
    type: "password",
    class: "login-input"
  }, null, _parent));
  _push(`</div><div class="flex items-center justify-between mb-6" data-v-84533cff><label class="flex items-center" data-v-84533cff><input id="remember"${ssrIncludeBooleanAttr(Array.isArray($data.form.remember) ? ssrLooseContain($data.form.remember, null) : $data.form.remember) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2" data-v-84533cff><span class="ml-2 text-sm text-gray-700" data-v-84533cff>Remember me</span></label>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("password.reset"),
    class: "text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Forgot password? `);
      } else {
        return [
          createTextVNode(" Forgot password? ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
  if ($props.site_key) {
    _push(`<div class="flex justify-center mb-6" data-v-84533cff>`);
    _push(ssrRenderComponent(_component_vue_recaptcha, {
      sitekey: $props.site_key,
      size: "normal",
      theme: "light",
      onVerify: $options.recaptchaVerified,
      onExpire: $options.recaptchaExpired,
      onFail: $options.recaptchaFailed,
      onError: $options.recaptchaError,
      ref: "vueRecaptcha",
      class: "transform scale-90"
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_loading_button, {
    disabled: $data.disable_login_button && $props.site_key,
    loading: $data.form.processing,
    class: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if (!$data.form.processing) {
          _push2(`<span class="flex items-center justify-center" data-v-84533cff${_scopeId}>`);
          _push2(ssrRenderComponent(_component_icon, {
            name: "login",
            class: "w-5 h-5 mr-2"
          }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate(_ctx.$t("Login"))}</span>`);
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          !$data.form.processing ? (openBlock(), createBlock("span", {
            key: 0,
            class: "flex items-center justify-center"
          }, [
            createVNode(_component_icon, {
              name: "login",
              class: "w-5 h-5 mr-2"
            }),
            createTextVNode(" " + toDisplayString(_ctx.$t("Login")), 1)
          ])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($data.enable_register) {
    _push(`<div class="mt-6 text-center" data-v-84533cff><p class="text-sm text-gray-600" data-v-84533cff> Don&#39;t have an account? `);
    _push(ssrRenderComponent(_component_Link, {
      href: _ctx.route("register"),
      class: "font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate(_ctx.$t("Register"))}`);
        } else {
          return [
            createTextVNode(toDisplayString(_ctx.$t("Register")), 1)
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</form>`);
  if ($props.is_demo) {
    _push(`<div class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6" data-v-84533cff><div class="text-center mb-4" data-v-84533cff><h3 class="text-lg font-semibold text-gray-800 mb-2" data-v-84533cff>Demo Accounts</h3><p class="text-sm text-gray-600" data-v-84533cff>Quick login for testing purposes</p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4" data-v-84533cff><div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200" data-v-84533cff><div class="flex items-center justify-between" data-v-84533cff><div data-v-84533cff><h4 class="font-medium text-gray-900" data-v-84533cff>Admin</h4><p class="text-xs text-gray-500 truncate" data-v-84533cff>john.due.helo@mail.com</p></div><button class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors duration-200" data-v-84533cff> Login </button></div></div><div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200" data-v-84533cff><div class="flex items-center justify-between" data-v-84533cff><div data-v-84533cff><h4 class="font-medium text-gray-900" data-v-84533cff>User</h4><p class="text-xs text-gray-500 truncate" data-v-84533cff>sabbir@example.com</p></div><button class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors duration-200" data-v-84533cff> Login </button></div></div></div><div class="text-center" data-v-84533cff><p class="text-xs text-gray-500 mb-2" data-v-84533cff>Or copy credentials to fill manually:</p><div class="flex justify-center space-x-4" data-v-84533cff><button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200" data-v-84533cff> Copy Admin </button><button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200" data-v-84533cff> Copy User </button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div><!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Login-last-backup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const LoginLastBackup = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-84533cff"]]);
export {
  LoginLastBackup as default
};
