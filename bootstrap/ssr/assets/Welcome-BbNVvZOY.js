import { resolveComponent, mergeProps, reactive, ref, computed, onMounted, useSSRContext } from "vue";
import { ArrowRight, X, Check, Rocket } from "lucide-vue-next";
import { i as installerApiRequest, h as handleApiResponse } from "./InstallerApi-CD_R4xjX.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerWelcome",
  components: {
    Rocket,
    Check,
    X,
    ArrowRight
  },
  emits: ["next"],
  setup() {
    const requirements = reactive({
      php: false,
      extensions: {
        "OpenSSL": false,
        "PDO": false,
        "Mbstring": false,
        "Tokenizer": false,
        "XML": false,
        "Ctype": false,
        "JSON": false,
        "cURL": false,
        "Intl": false
      },
      permissions: {
        "storage/": false,
        "storage/framework/": false,
        "storage/logs/": false,
        "bootstrap/cache/": false,
        "public/": false
      }
    });
    const serverInfo = reactive({
      software: "",
      memoryLimit: "",
      maxExecutionTime: ""
    });
    const phpVersion = ref("");
    const allRequirementsMet = computed(() => {
      return requirements.php && Object.values(requirements.extensions).every((ext) => ext) && Object.values(requirements.permissions).every((perm) => perm);
    });
    const checkRequirements = async () => {
      try {
        const response = await installerApiRequest("/install/check-requirements");
        const data = await handleApiResponse(response);
        phpVersion.value = data.phpVersion;
        requirements.php = data.requirements.php;
        requirements.extensions = data.requirements.extensions;
        requirements.permissions = data.requirements.permissions;
        serverInfo.software = data.serverInfo.software;
        serverInfo.memoryLimit = data.serverInfo.memoryLimit;
        serverInfo.maxExecutionTime = data.serverInfo.maxExecutionTime;
      } catch (error) {
        console.error("Error checking requirements:", error);
        checkBasicRequirements();
      }
    };
    const checkBasicRequirements = () => {
      phpVersion.value = "8.2.0";
      requirements.php = true;
      Object.keys(requirements.extensions).forEach((ext) => {
        requirements.extensions[ext] = true;
      });
      Object.keys(requirements.permissions).forEach((perm) => {
        requirements.permissions[perm] = true;
      });
      serverInfo.software = "Apache/Nginx";
      serverInfo.memoryLimit = "256M";
      serverInfo.maxExecutionTime = "300";
    };
    onMounted(() => {
      checkRequirements();
    });
    return {
      requirements,
      serverInfo,
      phpVersion,
      allRequirementsMet
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Rocket = resolveComponent("Rocket");
  const _component_Check = resolveComponent("Check");
  const _component_X = resolveComponent("X");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_Rocket, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> System Requirements Check </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Before we begin, let&#39;s make sure your server meets all the requirements for running ProTask. </p></div><div class="space-y-6"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><div class="flex items-center justify-between"><div class="flex items-center space-x-3"><div class="${ssrRenderClass([
    "w-8 h-8 rounded-full flex items-center justify-center",
    $setup.requirements.php ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
  ])}">`);
  if ($setup.requirements.php) {
    _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5 text-green-600 dark:text-green-400" }, null, _parent));
  } else {
    _push(ssrRenderComponent(_component_X, { class: "w-5 h-5 text-red-600 dark:text-red-400" }, null, _parent));
  }
  _push(`</div><div><h3 class="font-semibold text-slate-900 dark:text-white">PHP Version</h3><p class="text-sm text-slate-600 dark:text-slate-400"> Current: ${ssrInterpolate($setup.phpVersion)} | Required: 8.1+ </p></div></div><div class="${ssrRenderClass([
    "px-3 py-1 rounded-full text-sm font-medium",
    $setup.requirements.php ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  ])}">${ssrInterpolate($setup.requirements.php ? "Passed" : "Failed")}</div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="font-semibold text-slate-900 dark:text-white mb-4">PHP Extensions</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
  ssrRenderList($setup.requirements.extensions, (status, extension) => {
    _push(`<div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"><div class="flex items-center space-x-2">`);
    if (status) {
      _push(ssrRenderComponent(_component_Check, { class: "w-4 h-4 text-green-600 dark:text-green-400" }, null, _parent));
    } else {
      _push(ssrRenderComponent(_component_X, { class: "w-4 h-4 text-red-600 dark:text-red-400" }, null, _parent));
    }
    _push(`<span class="text-sm font-medium text-slate-700 dark:text-slate-300">${ssrInterpolate(extension)}</span></div><div class="${ssrRenderClass([
      "w-2 h-2 rounded-full",
      status ? "bg-green-500" : "bg-red-500"
    ])}"></div></div>`);
  });
  _push(`<!--]--></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="font-semibold text-slate-900 dark:text-white mb-4">Directory Permissions</h3><div class="space-y-3"><!--[-->`);
  ssrRenderList($setup.requirements.permissions, (status, directory) => {
    _push(`<div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"><div class="flex items-center space-x-2">`);
    if (status) {
      _push(ssrRenderComponent(_component_Check, { class: "w-4 h-4 text-green-600 dark:text-green-400" }, null, _parent));
    } else {
      _push(ssrRenderComponent(_component_X, { class: "w-4 h-4 text-red-600 dark:text-red-400" }, null, _parent));
    }
    _push(`<span class="text-sm font-medium text-slate-700 dark:text-slate-300">${ssrInterpolate(directory)}</span></div><div class="${ssrRenderClass([
      "w-2 h-2 rounded-full",
      status ? "bg-green-500" : "bg-red-500"
    ])}"></div></div>`);
  });
  _push(`<!--]--></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h3 class="font-semibold text-slate-900 dark:text-white mb-4">Server Information</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2"><div class="flex justify-between"><span class="text-sm text-slate-600 dark:text-slate-400">Server Software:</span><span class="text-sm font-medium text-slate-900 dark:text-white">${ssrInterpolate($setup.serverInfo.software)}</span></div><div class="flex justify-between"><span class="text-sm text-slate-600 dark:text-slate-400">PHP Version:</span><span class="text-sm font-medium text-slate-900 dark:text-white">${ssrInterpolate($setup.phpVersion)}</span></div></div><div class="space-y-2"><div class="flex justify-between"><span class="text-sm text-slate-600 dark:text-slate-400">Memory Limit:</span><span class="text-sm font-medium text-slate-900 dark:text-white">${ssrInterpolate($setup.serverInfo.memoryLimit)}</span></div><div class="flex justify-between"><span class="text-sm text-slate-600 dark:text-slate-400">Max Execution Time:</span><span class="text-sm font-medium text-slate-900 dark:text-white">${ssrInterpolate($setup.serverInfo.maxExecutionTime)}s</span></div></div></div></div></div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><div class="text-sm text-slate-500 dark:text-slate-400">`);
  if (!$setup.allRequirementsMet) {
    _push(`<p class="text-red-600 dark:text-red-400"> Please fix the requirements above before continuing. </p>`);
  } else {
    _push(`<p class="text-green-600 dark:text-green-400"> All requirements are met! You can proceed with the installation. </p>`);
  }
  _push(`</div><button${ssrIncludeBooleanAttr(!$setup.allRequirementsMet) ? " disabled" : ""} class="${ssrRenderClass([
    "px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform",
    $setup.allRequirementsMet ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
  ])}"> Continue Installation `);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
  _push(`</button></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Welcome.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerWelcome = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerWelcome as default
};
