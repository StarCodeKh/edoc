import { resolveComponent, mergeProps, reactive, watch, useSSRContext } from "vue";
import { ArrowRight, ArrowLeft, Zap, Mail, Globe, Settings } from "lucide-vue-next";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerEnvironment",
  components: {
    Settings,
    Globe,
    Mail,
    Zap,
    ArrowLeft,
    ArrowRight
  },
  props: {
    form: {
      type: Object,
      required: true
    }
  },
  emits: ["next", "back", "update:form"],
  setup(props, { emit }) {
    const form = reactive({
      appName: props.form.appName || "ProTask",
      appUrl: props.form.appUrl || window.location.origin,
      appEnv: props.form.appEnv || "production",
      appDebug: props.form.appDebug || false,
      mailDriver: "smtp",
      mailHost: "",
      mailPort: 587,
      mailEncryption: "tls",
      mailUsername: "",
      mailPassword: "",
      mailFromAddress: "",
      pusherAppId: "",
      pusherAppKey: "",
      pusherAppSecret: "",
      pusherAppCluster: "us2"
    });
    const updateForm = () => {
      emit("update:form", { ...form });
    };
    watch(form, () => {
      updateForm();
    }, { deep: true });
    return {
      form,
      updateForm
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Settings = resolveComponent("Settings");
  const _component_Globe = resolveComponent("Globe");
  const _component_Mail = resolveComponent("Mail");
  const _component_Zap = resolveComponent("Zap");
  const _component_ArrowLeft = resolveComponent("ArrowLeft");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_Settings, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> Environment Configuration </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Configure your application settings and environment variables. </p></div><div class="max-w-3xl mx-auto"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Globe, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Application Settings </h3><div class="space-y-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Application Name <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.appName)} type="text" placeholder="ProTask" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Application URL <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.appUrl)} type="url" placeholder="https://yourdomain.com" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><p class="mt-1 text-sm text-slate-500 dark:text-slate-400"> The full URL where your application will be accessible </p></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Environment <span class="text-red-500">*</span></label><select class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><option value="production"${ssrIncludeBooleanAttr(Array.isArray($setup.form.appEnv) ? ssrLooseContain($setup.form.appEnv, "production") : ssrLooseEqual($setup.form.appEnv, "production")) ? " selected" : ""}>Production</option><option value="staging"${ssrIncludeBooleanAttr(Array.isArray($setup.form.appEnv) ? ssrLooseContain($setup.form.appEnv, "staging") : ssrLooseEqual($setup.form.appEnv, "staging")) ? " selected" : ""}>Staging</option><option value="local"${ssrIncludeBooleanAttr(Array.isArray($setup.form.appEnv) ? ssrLooseContain($setup.form.appEnv, "local") : ssrLooseEqual($setup.form.appEnv, "local")) ? " selected" : ""}>Local Development</option></select></div><div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"><div><h4 class="font-medium text-slate-900 dark:text-white">Debug Mode</h4><p class="text-sm text-slate-600 dark:text-slate-400"> Enable detailed error messages (not recommended for production) </p></div><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray($setup.form.appDebug) ? ssrLooseContain($setup.form.appDebug, null) : $setup.form.appDebug) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div></label></div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Mail, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Mail Configuration </h3><div class="space-y-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Mail Driver </label><select class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><option value="smtp"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailDriver) ? ssrLooseContain($setup.form.mailDriver, "smtp") : ssrLooseEqual($setup.form.mailDriver, "smtp")) ? " selected" : ""}>SMTP</option><option value="mailgun"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailDriver) ? ssrLooseContain($setup.form.mailDriver, "mailgun") : ssrLooseEqual($setup.form.mailDriver, "mailgun")) ? " selected" : ""}>Mailgun</option><option value="ses"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailDriver) ? ssrLooseContain($setup.form.mailDriver, "ses") : ssrLooseEqual($setup.form.mailDriver, "ses")) ? " selected" : ""}>Amazon SES</option><option value="mail"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailDriver) ? ssrLooseContain($setup.form.mailDriver, "mail") : ssrLooseEqual($setup.form.mailDriver, "mail")) ? " selected" : ""}>PHP Mail</option></select></div>`);
  if ($setup.form.mailDriver === "smtp") {
    _push(`<div class="space-y-3"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> SMTP Host </label><input${ssrRenderAttr("value", $setup.form.mailHost)} type="text" placeholder="smtp.gmail.com" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Port </label><input${ssrRenderAttr("value", $setup.form.mailPort)} type="number" placeholder="587" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Encryption </label><select class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><option value="tls"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailEncryption) ? ssrLooseContain($setup.form.mailEncryption, "tls") : ssrLooseEqual($setup.form.mailEncryption, "tls")) ? " selected" : ""}>TLS</option><option value="ssl"${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailEncryption) ? ssrLooseContain($setup.form.mailEncryption, "ssl") : ssrLooseEqual($setup.form.mailEncryption, "ssl")) ? " selected" : ""}>SSL</option><option value=""${ssrIncludeBooleanAttr(Array.isArray($setup.form.mailEncryption) ? ssrLooseContain($setup.form.mailEncryption, "") : ssrLooseEqual($setup.form.mailEncryption, "")) ? " selected" : ""}>None</option></select></div></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Username </label><input${ssrRenderAttr("value", $setup.form.mailUsername)} type="text" placeholder="your-email@gmail.com" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Password </label><input${ssrRenderAttr("value", $setup.form.mailPassword)} type="password" placeholder="Your email password or app password" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> From Address </label><input${ssrRenderAttr("value", $setup.form.mailFromAddress)} type="email" placeholder="noreply@yourdomain.com" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div></div></div></div><div class="mt-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Zap, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Real-time Features (Pusher) </h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> App ID </label><input${ssrRenderAttr("value", $setup.form.pusherAppId)} type="text" placeholder="Your Pusher App ID" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> App Key </label><input${ssrRenderAttr("value", $setup.form.pusherAppKey)} type="text" placeholder="Your Pusher App Key" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> App Secret </label><input${ssrRenderAttr("value", $setup.form.pusherAppSecret)} type="password" placeholder="Your Pusher App Secret" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> App Cluster </label><input${ssrRenderAttr("value", $setup.form.pusherAppCluster)} type="text" placeholder="us2, eu, ap-southeast-1" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><p class="mt-1 text-xs text-slate-500 dark:text-slate-400"> Default: us2 </p></div></div><p class="mt-3 text-sm text-slate-500 dark:text-slate-400"> Pusher is optional but recommended for real-time notifications and chat features. You can configure it later in the admin panel. </p></div></div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><button class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
  _push(ssrRenderComponent(_component_ArrowLeft, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
  _push(` Back </button><button class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"> Continue `);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
  _push(`</button></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Environment.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerEnvironment = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerEnvironment as default
};
