import { resolveComponent, mergeProps, ref, reactive, useSSRContext } from "vue";
import { Check } from "lucide-vue-next";
import InstallerWelcome from "./Welcome-BbNVvZOY.js";
import InstallerLicense from "./License-BTTvQ5mb.js";
import InstallerEnvironment from "./Environment-B9VIwaWc.js";
import InstallerDatabase from "./Database-CaDizekc.js";
import InstallerAdmin from "./Admin-BY6XqAys.js";
import InstallerProgress from "./Progress-BEqXIgcf.js";
import InstallerComplete from "./Complete-B7-8BqnV.js";
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./InstallerApi-CD_R4xjX.js";
const _sfc_main = {
  name: "InstallerIndex",
  components: {
    Check,
    InstallerWelcome,
    InstallerLicense,
    InstallerEnvironment,
    InstallerDatabase,
    InstallerAdmin,
    InstallerProgress,
    InstallerComplete
  },
  setup() {
    const currentStep = ref(0);
    const steps = [
      { id: "welcome", title: "Welcome" },
      { id: "license", title: "License" },
      { id: "environment", title: "Environment" },
      { id: "database", title: "Database" },
      { id: "admin", title: "Admin Setup" },
      { id: "install", title: "Installing" },
      { id: "complete", title: "Complete" }
    ];
    const installData = reactive({
      license: {
        purchaseCode: "",
        verified: false
      },
      environment: {
        appName: "ProTask",
        appUrl: window.location.origin,
        appEnv: "production",
        appDebug: false
      },
      database: {
        connection: "mysql",
        host: "localhost",
        port: 3306,
        name: "",
        username: "",
        password: "",
        tested: false
      },
      admin: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      }
    });
    const getStepStatus = (index) => {
      if (index < currentStep.value) return "completed";
      if (index === currentStep.value) return "current";
      return "pending";
    };
    const nextStep = () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
      }
    };
    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    };
    const handleInstallationError = (error) => {
      console.error("Installation error:", error);
      const errorMessage = error.message || "An unexpected error occurred during installation";
      const errorDiv = document.createElement("div");
      errorDiv.className = "fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md";
      errorDiv.innerHTML = `
        <div class="flex items-start">
          <div class="flex-1">
            <h4 class="font-semibold">Installation Error</h4>
            <p class="text-sm mt-1">${errorMessage}</p>
            <p class="text-xs mt-2 opacity-75">Please check the browser console for more details.</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        if (errorDiv.parentElement) {
          errorDiv.remove();
        }
      }, 1e4);
    };
    const finishInstallation = () => {
      window.location.href = "/login";
    };
    return {
      currentStep,
      steps,
      installData,
      getStepStatus,
      nextStep,
      prevStep,
      handleInstallationError,
      finishInstallation
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Check = resolveComponent("Check");
  const _component_InstallerWelcome = resolveComponent("InstallerWelcome");
  const _component_InstallerLicense = resolveComponent("InstallerLicense");
  const _component_InstallerEnvironment = resolveComponent("InstallerEnvironment");
  const _component_InstallerDatabase = resolveComponent("InstallerDatabase");
  const _component_InstallerAdmin = resolveComponent("InstallerAdmin");
  const _component_InstallerProgress = resolveComponent("InstallerProgress");
  const _component_InstallerComplete = resolveComponent("InstallerComplete");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" }, _attrs))} data-v-16d8cb75><div class="absolute inset-0 overflow-hidden" data-v-16d8cb75><div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" data-v-16d8cb75></div><div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl" data-v-16d8cb75></div></div><div class="relative min-h-screen flex items-center justify-center p-4" data-v-16d8cb75><div class="w-full max-w-4xl" data-v-16d8cb75><div class="text-center mb-8" data-v-16d8cb75><div class="inline-block" data-v-16d8cb75><img src="/images/logo.png" alt="ProTask Logo" class="h-16 w-auto mx-auto mb-4" data-v-16d8cb75></div><h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2" data-v-16d8cb75> Welcome to ProTask </h1><p class="text-lg text-slate-600 dark:text-slate-400" data-v-16d8cb75> Let&#39;s get your task management system up and running in just a few steps </p></div><div class="mb-8" data-v-16d8cb75><div class="flex items-center justify-center space-x-4" data-v-16d8cb75><!--[-->`);
  ssrRenderList($setup.steps, (step, index) => {
    _push(`<div class="flex items-center" data-v-16d8cb75><div class="${ssrRenderClass([
      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
      $setup.getStepStatus(index) === "completed" ? "bg-green-500 text-white" : $setup.getStepStatus(index) === "current" ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
    ])}" data-v-16d8cb75>`);
    if ($setup.getStepStatus(index) === "completed") {
      _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5" }, null, _parent));
    } else {
      _push(`<span data-v-16d8cb75>${ssrInterpolate(index + 1)}</span>`);
    }
    _push(`</div><div class="ml-3 hidden sm:block" data-v-16d8cb75><p class="${ssrRenderClass([
      "text-sm font-medium transition-colors",
      $setup.getStepStatus(index) === "current" ? "text-blue-600 dark:text-blue-400" : $setup.getStepStatus(index) === "completed" ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
    ])}" data-v-16d8cb75>${ssrInterpolate(step.title)}</p></div>`);
    if (index < $setup.steps.length - 1) {
      _push(`<div class="${ssrRenderClass([
        "w-16 h-1 mx-4 transition-colors duration-300 self-center",
        $setup.getStepStatus(index) === "completed" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
      ])}" data-v-16d8cb75></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  });
  _push(`<!--]--></div></div><div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden" data-v-16d8cb75><div class="p-8" data-v-16d8cb75>`);
  if ($setup.currentStep === 0) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerWelcome, { onNext: $setup.nextStep }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 1) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerLicense, {
      form: $setup.installData.license,
      "onUpdate:form": ($event) => $setup.installData.license = $event,
      onNext: $setup.nextStep,
      onBack: $setup.prevStep
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 2) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerEnvironment, {
      form: $setup.installData.environment,
      "onUpdate:form": ($event) => $setup.installData.environment = $event,
      onNext: $setup.nextStep,
      onBack: $setup.prevStep
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 3) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerDatabase, {
      form: $setup.installData.database,
      "onUpdate:form": ($event) => $setup.installData.database = $event,
      onNext: $setup.nextStep,
      onBack: $setup.prevStep
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 4) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerAdmin, {
      form: $setup.installData.admin,
      "onUpdate:form": ($event) => $setup.installData.admin = $event,
      onNext: $setup.nextStep,
      onBack: $setup.prevStep
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 5) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerProgress, {
      "install-data": $setup.installData,
      onComplete: $setup.nextStep,
      onError: $setup.handleInstallationError
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.currentStep === 6) {
    _push(`<div data-v-16d8cb75>`);
    _push(ssrRenderComponent(_component_InstallerComplete, { onFinish: $setup.finishInstallation }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="text-center mt-8" data-v-16d8cb75><p class="text-sm text-slate-500 dark:text-slate-400" data-v-16d8cb75> Need help? Check our <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline" data-v-16d8cb75>installation guide</a></p></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-16d8cb75"]]);
export {
  Index as default
};
