import { resolveComponent, mergeProps, ref, onMounted, useSSRContext } from "vue";
import { ArrowRight, Mail, MessageSquare, HelpCircle, Lightbulb, Settings, BookOpen, LogIn, Zap, Clipboard, CheckCircle } from "lucide-vue-next";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerComplete",
  components: {
    CheckCircle,
    Clipboard,
    Zap,
    LogIn,
    BookOpen,
    Settings,
    Lightbulb,
    HelpCircle,
    MessageSquare,
    Mail,
    ArrowRight
  },
  emits: ["finish"],
  setup() {
    const installationTime = ref("2 minutes 30 seconds");
    const goToLogin = () => {
      window.location.href = "/login";
    };
    const viewDocumentation = () => {
      window.open("https://protask-docs.example.com", "_blank");
    };
    const configureSettings = () => {
      window.location.href = "/dashboard/settings";
    };
    onMounted(() => {
      const startTime = localStorage.getItem("installationStartTime");
      if (startTime) {
        const duration = Date.now() - parseInt(startTime);
        const minutes = Math.floor(duration / 6e4);
        const seconds = Math.floor(duration % 6e4 / 1e3);
        installationTime.value = `${minutes} minutes ${seconds} seconds`;
        localStorage.removeItem("installationStartTime");
      }
    });
    return {
      installationTime,
      goToLogin,
      viewDocumentation,
      configureSettings
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_CheckCircle = resolveComponent("CheckCircle");
  const _component_Clipboard = resolveComponent("Clipboard");
  const _component_Zap = resolveComponent("Zap");
  const _component_LogIn = resolveComponent("LogIn");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  const _component_BookOpen = resolveComponent("BookOpen");
  const _component_Settings = resolveComponent("Settings");
  const _component_Lightbulb = resolveComponent("Lightbulb");
  const _component_HelpCircle = resolveComponent("HelpCircle");
  const _component_MessageSquare = resolveComponent("MessageSquare");
  const _component_Mail = resolveComponent("Mail");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">`);
  _push(ssrRenderComponent(_component_CheckCircle, { class: "w-12 h-12 text-white" }, null, _parent));
  _push(`</div><h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4"> 🎉 Installation Complete! </h2><p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Congratulations! Your ProTask system has been successfully installed and is ready to use. </p></div><div class="max-w-4xl mx-auto"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Clipboard, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Installation Summary </h3><div class="space-y-3"><div class="flex items-center justify-between"><span class="text-slate-600 dark:text-slate-400">Application Name:</span><span class="font-medium text-slate-900 dark:text-white">ProTask</span></div><div class="flex items-center justify-between"><span class="text-slate-600 dark:text-slate-400">Environment:</span><span class="font-medium text-slate-900 dark:text-white">Production</span></div><div class="flex items-center justify-between"><span class="text-slate-600 dark:text-slate-400">Database:</span><span class="font-medium text-slate-900 dark:text-white">Configured</span></div><div class="flex items-center justify-between"><span class="text-slate-600 dark:text-slate-400">Admin Account:</span><span class="font-medium text-slate-900 dark:text-white">Created</span></div><div class="flex items-center justify-between"><span class="text-slate-600 dark:text-slate-400">Installation Time:</span><span class="font-medium text-slate-900 dark:text-white">${ssrInterpolate($setup.installationTime)}</span></div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Zap, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Quick Actions </h3><div class="space-y-3"><button class="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"><div class="flex items-center">`);
  _push(ssrRenderComponent(_component_LogIn, { class: "w-4 h-4 mr-3 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" }, null, _parent));
  _push(`<span class="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Access Admin Dashboard</span></div>`);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" }, null, _parent));
  _push(`</button><button class="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-colors group"><div class="flex items-center">`);
  _push(ssrRenderComponent(_component_BookOpen, { class: "w-4 h-4 mr-3 text-slate-500 group-hover:text-green-600 dark:group-hover:text-green-400" }, null, _parent));
  _push(`<span class="text-slate-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400">View Documentation</span></div>`);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400" }, null, _parent));
  _push(`</button><button class="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"><div class="flex items-center">`);
  _push(ssrRenderComponent(_component_Settings, { class: "w-4 h-4 mr-3 text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400" }, null, _parent));
  _push(`<span class="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Configure Settings</span></div>`);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" }, null, _parent));
  _push(`</button></div></div></div><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6"><h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_Lightbulb, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Next Steps </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-3"><h4 class="font-medium text-blue-800 dark:text-blue-200">Immediate Actions</h4><ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1"><li>• Log in to your admin dashboard</li><li>• Configure your email settings</li><li>• Set up your first department</li><li>• Create user roles and permissions</li></ul></div><div class="space-y-3"><h4 class="font-medium text-blue-800 dark:text-blue-200">Recommended Setup</h4><ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1"><li>• Configure ticket categories and priorities</li><li>• Set up email templates</li><li>• Enable real-time notifications</li><li>• Customize your protask appearance</li></ul></div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">`);
  _push(ssrRenderComponent(_component_HelpCircle, { class: "w-5 h-5 mr-2" }, null, _parent));
  _push(` Need Help? </h3><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="text-center"><div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">`);
  _push(ssrRenderComponent(_component_BookOpen, { class: "w-6 h-6 text-blue-600 dark:text-blue-400" }, null, _parent));
  _push(`</div><h4 class="font-medium text-slate-900 dark:text-white mb-1">Documentation</h4><p class="text-sm text-slate-600 dark:text-slate-400">Comprehensive guides and tutorials</p></div><div class="text-center"><div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">`);
  _push(ssrRenderComponent(_component_MessageSquare, { class: "w-6 h-6 text-green-600 dark:text-green-400" }, null, _parent));
  _push(`</div><h4 class="font-medium text-slate-900 dark:text-white mb-1">Support Forum</h4><p class="text-sm text-slate-600 dark:text-slate-400">Community support and discussions</p></div><div class="text-center"><div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">`);
  _push(ssrRenderComponent(_component_Mail, { class: "w-6 h-6 text-purple-600 dark:text-purple-400" }, null, _parent));
  _push(`</div><h4 class="font-medium text-slate-900 dark:text-white mb-1">Email Support</h4><p class="text-sm text-slate-600 dark:text-slate-400">Direct support via email</p></div></div></div></div><div class="flex justify-center items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><button class="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg">`);
  _push(ssrRenderComponent(_component_LogIn, { class: "w-5 h-5 mr-2 inline" }, null, _parent));
  _push(` Go to Dashboard </button></div><div class="text-center mt-8"><p class="text-sm text-slate-500 dark:text-slate-400"> Thank you for choosing ProTask! We hope you enjoy using our system. </p></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Complete.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerComplete = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerComplete as default
};
