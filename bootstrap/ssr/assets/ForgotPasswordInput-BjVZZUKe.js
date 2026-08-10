import { F as FlashMessages, L as Logo } from "./FlashMessages-DizfipYZ.js";
import { T as TextInput, L as LoadingButton } from "./LoadingButton-CYW6UWDJ.js";
import { Link, Head } from "@inertiajs/vue3";
import { resolveComponent, withCtx, createVNode, openBlock, createBlock, createTextVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "uuid";
const _sfc_main = {
  metaInfo: { title: "កំណត់លេខសម្ងាត់ថ្មី - E-Document System" },
  components: {
    LoadingButton,
    Logo,
    TextInput,
    Head,
    Link,
    FlashMessages
  },
  props: {
    is_demo: Number,
    token: String
  },
  data() {
    return {
      form: this.$inertia.form({
        email: "",
        password: "",
        password_confirmation: "",
        token: this.token
      })
    };
  },
  methods: {
    resetPassword() {
      this.form.post(this.route("password.reset.store"));
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_flash_messages = resolveComponent("flash-messages");
  const _component_Link = resolveComponent("Link");
  const _component_Logo = resolveComponent("Logo");
  const _component_text_input = resolveComponent("text-input");
  const _component_loading_button = resolveComponent("loading-button");
  _push(`<!--[-->`);
  _push(ssrRenderComponent(_component_Head, { title: "កំណត់លេខសម្ងាត់ថ្មី - E-Document System" }, null, _parent));
  _push(`<div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden" data-v-1269dba1><div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]" data-v-1269dba1></div><div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]" data-v-1269dba1></div><div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]" data-v-1269dba1></div><div class="pointer-events-none absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(#149954 0.6px, transparent 0.6px)", "background-size": "26px 26px", "opacity": "0.05" })}" data-v-1269dba1></div>`);
  _push(ssrRenderComponent(_component_flash_messages, null, null, _parent));
  _push(`<div class="relative w-full max-w-md" data-v-1269dba1><div class="text-center mb-8" data-v-1269dba1>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("home"),
    class: "inline-block group"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105" data-v-1269dba1${_scopeId}>`);
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
  _push(`<h1 class="mt-4 text-3xl font-bold text-[#0E4429]" data-v-1269dba1> កំណត់លេខសម្ងាត់ថ្មី </h1><p class="mt-2 text-[#149954]/70 text-sm" data-v-1269dba1> បញ្ចូលលេខសម្ងាត់ថ្មីរបស់អ្នកខាងក្រោម </p><p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold" data-v-1269dba1> E-Document System </p></div><div class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]" data-v-1269dba1><form class="px-8 pt-8 pb-8" autocomplete="off" data-v-1269dba1><div class="mb-5" data-v-1269dba1><label class="block mb-2 text-sm font-semibold text-[#0E4429]" data-v-1269dba1>អ៊ីមែល</label>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.email,
    "onUpdate:modelValue": ($event) => $data.form.email = $event,
    error: $data.form.errors.email,
    type: "email",
    autofocus: "",
    autocomplete: "off",
    "aria-autocomplete": "none",
    placeholder: "បញ្ចូលអ៊ីមែលរបស់អ្នក",
    class: "w-full login-input"
  }, null, _parent));
  _push(`</div><div class="mb-5" data-v-1269dba1><label class="block mb-2 text-sm font-semibold text-[#0E4429]" data-v-1269dba1>លេខសម្ងាត់ថ្មី</label>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password,
    "onUpdate:modelValue": ($event) => $data.form.password = $event,
    error: $data.form.errors.password,
    type: "password",
    autocomplete: "off",
    "aria-autocomplete": "none",
    placeholder: "បញ្ចូលលេខសម្ងាត់ថ្មី",
    class: "w-full login-input"
  }, null, _parent));
  _push(`</div><div class="mb-6" data-v-1269dba1><label class="block mb-2 text-sm font-semibold text-[#0E4429]" data-v-1269dba1>បញ្ជាក់លេខសម្ងាត់ថ្មី</label>`);
  _push(ssrRenderComponent(_component_text_input, {
    modelValue: $data.form.password_confirmation,
    "onUpdate:modelValue": ($event) => $data.form.password_confirmation = $event,
    error: $data.form.errors.password_confirmation,
    type: "password",
    autocomplete: "off",
    "aria-autocomplete": "none",
    placeholder: "បញ្ចូលលេខសម្ងាត់ថ្មីម្តងទៀត",
    class: "w-full login-input"
  }, null, _parent));
  _push(`</div>`);
  _push(ssrRenderComponent(_component_loading_button, {
    loading: $data.form.processing,
    class: "w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]",
    type: "submit"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<span class="w-full inline-flex items-center justify-center gap-2" data-v-1269dba1${_scopeId}><svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-1269dba1${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-v-1269dba1${_scopeId}></path></svg> កំណត់លេខសម្ងាត់ថ្មី </span>`);
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
                d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              })
            ])),
            createTextVNode(" កំណត់លេខសម្ងាត់ថ្មី ")
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<div class="mt-6 text-center text-sm text-[#0E4429]/60" data-v-1269dba1> ចងចាំលេខសម្ងាត់របស់អ្នកមែនទេ? `);
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
  _push(`</div></form></div><p class="mt-8 text-center text-xs text-[#0E4429]/40" data-v-1269dba1> មានសុវត្ថិភាព និងស្ថិតក្រោមការគ្រប់គ្រង </p></div></div><!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/ForgotPasswordInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ForgotPasswordInput = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-1269dba1"]]);
export {
  ForgotPasswordInput as default
};
