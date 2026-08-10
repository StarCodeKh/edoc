import { resolveComponent, mergeProps, ref, reactive, computed, onMounted, useSSRContext } from "vue";
import { FileText, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, ChevronUp, X, Check, Download } from "lucide-vue-next";
import { i as installerApiRequest, h as handleApiResponse } from "./InstallerApi-CD_R4xjX.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerProgress",
  components: {
    Download,
    Check,
    X,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    FileText
  },
  props: {
    installData: {
      type: Object,
      required: true
    }
  },
  emits: ["complete", "error"],
  setup(props, { emit }) {
    const showLog = ref(false);
    const installationComplete = ref(false);
    const installationLog = ref([]);
    const installationSteps = reactive([
      {
        id: "environment",
        title: "Setting up environment",
        description: "Configuring application environment variables",
        status: "pending",
        error: null
      },
      {
        id: "database",
        title: "Creating database tables",
        description: "Running database migrations",
        status: "pending",
        error: null
      },
      {
        id: "seed",
        title: "Seeding database",
        description: "Creating default data and admin account",
        status: "pending",
        error: null
      },
      {
        id: "permissions",
        title: "Setting up permissions",
        description: "Configuring file permissions and directories",
        status: "pending",
        error: null
      },
      {
        id: "cache",
        title: "Optimizing application",
        description: "Clearing cache and optimizing performance",
        status: "pending",
        error: null
      },
      {
        id: "finalize",
        title: "Finalizing installation",
        description: "Completing setup and marking as installed",
        status: "pending",
        error: null
      }
    ]);
    const currentStepIndex = computed(() => {
      return installationSteps.findIndex((step) => step.status === "running");
    });
    const currentStepText = computed(() => {
      const currentStep = installationSteps[currentStepIndex.value];
      return currentStep ? currentStep.title : "Preparing installation...";
    });
    const overallProgress = computed(() => {
      const completedSteps = installationSteps.filter((step) => step.status === "completed").length;
      return completedSteps / installationSteps.length * 100;
    });
    const hasErrors = computed(() => {
      return installationSteps.some((step) => step.status === "error");
    });
    const addLog = (message, level = "info") => {
      installationLog.value.push({
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        message,
        level
      });
    };
    const getStatusText = (status) => {
      switch (status) {
        case "completed":
          return "Completed";
        case "running":
          return "Running";
        case "error":
          return "Failed";
        default:
          return "Pending";
      }
    };
    const getLogColor = (level) => {
      switch (level) {
        case "error":
          return "text-red-400";
        case "warning":
          return "text-yellow-400";
        case "success":
          return "text-green-400";
        default:
          return "text-slate-300";
      }
    };
    const updateStepStatus = (stepId, status, error = null) => {
      const step = installationSteps.find((s) => s.id === stepId);
      if (step) {
        step.status = status;
        step.error = error;
      }
    };
    const runInstallation = async () => {
      try {
        addLog("Starting ProTask installation...", "info");
        updateStepStatus("environment", "running");
        addLog("Setting up environment variables...", "info");
        try {
          const envResponse = await installerApiRequest("/install/save-environment", {
            body: JSON.stringify({
              app_name: props.installData.environment.appName,
              app_url: props.installData.environment.appUrl,
              app_env: props.installData.environment.appEnv,
              app_debug: props.installData.environment.appDebug,
              database_connection: props.installData.database.connection,
              database_hostname: props.installData.database.host,
              database_port: props.installData.database.port,
              database_name: props.installData.database.name,
              database_username: props.installData.database.username,
              database_password: props.installData.database.password,
              mail_driver: props.installData.environment.mailDriver || "smtp",
              mail_host: props.installData.environment.mailHost || "",
              mail_port: props.installData.environment.mailPort || 587,
              mail_username: props.installData.environment.mailUsername || "",
              mail_password: props.installData.environment.mailPassword || "",
              mail_encryption: props.installData.environment.mailEncryption || "tls",
              mail_from_address: props.installData.environment.mailFromAddress || "",
              pusher_app_id: props.installData.environment.pusherAppId || "",
              pusher_app_key: props.installData.environment.pusherAppKey || "",
              pusher_app_secret: props.installData.environment.pusherAppSecret || "",
              pusher_app_cluster: props.installData.environment.pusherAppCluster || "us2"
            })
          });
          await handleApiResponse(envResponse);
          updateStepStatus("environment", "completed");
          addLog("Environment setup completed", "success");
        } catch (error) {
          updateStepStatus("environment", "error", error.message);
          addLog(`Environment setup failed: ${error.message}`, "error");
          throw error;
        }
        updateStepStatus("database", "running");
        addLog("Running database migrations and installation...", "info");
        try {
          const installResponse = await installerApiRequest("/install/run-installation", {
            body: JSON.stringify({
              first_name: props.installData.admin.firstName,
              last_name: props.installData.admin.lastName,
              email: props.installData.admin.email,
              password: props.installData.admin.password
            })
          });
          const installData = await handleApiResponse(installResponse);
          updateStepStatus("database", "completed");
          addLog("Database migrations completed", "success");
          updateStepStatus("seed", "completed");
          addLog("Database seeding completed", "success");
          updateStepStatus("permissions", "completed");
          addLog("File permissions configured", "success");
          updateStepStatus("cache", "completed");
          addLog("Cache optimization completed", "success");
          updateStepStatus("finalize", "completed");
          addLog("Installation completed successfully!", "success");
          installationComplete.value = true;
          addLog("ProTask is ready to use!", "success");
          addLog(`Admin user created: ${installData.admin.email}`, "success");
        } catch (error) {
          updateStepStatus("database", "error", error.message);
          addLog(`Installation failed: ${error.message}`, "error");
          throw error;
        }
      } catch (error) {
        addLog(`Installation failed: ${error.message}`, "error");
        emit("error", error);
      }
    };
    const retryInstallation = () => {
      installationSteps.forEach((step) => {
        step.status = "pending";
        step.error = null;
      });
      installationComplete.value = false;
      installationLog.value = [];
      runInstallation();
    };
    onMounted(() => {
      setTimeout(() => {
        runInstallation();
      }, 1e3);
    });
    return {
      showLog,
      installationComplete,
      installationLog,
      installationSteps,
      currentStepIndex,
      currentStepText,
      overallProgress,
      hasErrors,
      addLog,
      getStatusText,
      getLogColor,
      retryInstallation
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Download = resolveComponent("Download");
  const _component_Check = resolveComponent("Check");
  const _component_X = resolveComponent("X");
  const _component_ChevronUp = resolveComponent("ChevronUp");
  const _component_AlertTriangle = resolveComponent("AlertTriangle");
  const _component_CheckCircle = resolveComponent("CheckCircle");
  const _component_ArrowLeft = resolveComponent("ArrowLeft");
  const _component_FileText = resolveComponent("FileText");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_Download, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> Installing ProTask </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Please wait while we set up your ProTask system. This may take a few minutes. </p></div><div class="max-w-3xl mx-auto"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold text-slate-900 dark:text-white">Installation Progress</h3><span class="text-sm font-medium text-slate-600 dark:text-slate-400">${ssrInterpolate(Math.round($setup.overallProgress))}% </span></div><div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-4"><div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" style="${ssrRenderStyle({ width: $setup.overallProgress + "%" })}"></div></div><div class="text-center"><p class="text-sm text-slate-600 dark:text-slate-400">${ssrInterpolate($setup.currentStepText)}</p></div></div><div class="space-y-4 mb-6"><!--[-->`);
  ssrRenderList($setup.installationSteps, (step, index) => {
    _push(`<div class="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"><div class="${ssrRenderClass([
      "w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-all duration-300",
      step.status === "completed" ? "bg-green-100 dark:bg-green-900/30" : step.status === "running" ? "bg-blue-100 dark:bg-blue-900/30" : step.status === "error" ? "bg-red-100 dark:bg-red-900/30" : "bg-slate-100 dark:bg-slate-700"
    ])}">`);
    if (step.status === "completed") {
      _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5 text-green-600 dark:text-green-400" }, null, _parent));
    } else if (step.status === "running") {
      _push(`<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>`);
    } else if (step.status === "error") {
      _push(ssrRenderComponent(_component_X, { class: "w-5 h-5 text-red-600 dark:text-red-400" }, null, _parent));
    } else {
      _push(`<span class="text-sm font-semibold text-slate-500 dark:text-slate-400">${ssrInterpolate(index + 1)}</span>`);
    }
    _push(`</div><div class="flex-1"><h4 class="${ssrRenderClass([
      "font-medium transition-colors",
      step.status === "completed" ? "text-green-800 dark:text-green-200" : step.status === "running" ? "text-blue-800 dark:text-blue-200" : step.status === "error" ? "text-red-800 dark:text-red-200" : "text-slate-700 dark:text-slate-300"
    ])}">${ssrInterpolate(step.title)}</h4><p class="${ssrRenderClass([
      "text-sm transition-colors",
      step.status === "completed" ? "text-green-600 dark:text-green-400" : step.status === "running" ? "text-blue-600 dark:text-blue-400" : step.status === "error" ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
    ])}">${ssrInterpolate(step.description)}</p>`);
    if (step.status === "error" && step.error) {
      _push(`<div class="mt-2 text-sm text-red-600 dark:text-red-400"> Error: ${ssrInterpolate(step.error)}</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="${ssrRenderClass([
      "px-3 py-1 rounded-full text-xs font-medium",
      step.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : step.status === "running" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : step.status === "error" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
    ])}">${ssrInterpolate($setup.getStatusText(step.status))}</div></div>`);
  });
  _push(`<!--]--></div>`);
  if ($setup.showLog) {
    _push(`<div class="bg-slate-900 dark:bg-slate-800 rounded-xl p-6 mb-6"><div class="flex items-center justify-between mb-4"><h4 class="text-sm font-medium text-slate-200">Installation Log</h4><button class="text-slate-400 hover:text-slate-200 transition-colors">`);
    _push(ssrRenderComponent(_component_ChevronUp, { class: "w-4 h-4" }, null, _parent));
    _push(`</button></div><div class="text-xs text-slate-300 font-mono max-h-40 overflow-y-auto"><!--[-->`);
    ssrRenderList($setup.installationLog, (log, index) => {
      _push(`<div class="mb-1"><span class="text-slate-500">[${ssrInterpolate(log.timestamp)}]</span><span class="${ssrRenderClass([$setup.getLogColor(log.level), "ml-2"])}">${ssrInterpolate(log.message)}</span></div>`);
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.hasErrors) {
    _push(`<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6"><div class="flex items-start">`);
    _push(ssrRenderComponent(_component_AlertTriangle, { class: "w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Installation Errors</h4><p class="text-sm text-red-700 dark:text-red-300 mb-3"> Some steps failed during installation. You can try to fix the issues and retry. </p><button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"> Retry Installation </button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($setup.installationComplete) {
    _push(`<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"><div class="flex items-center">`);
    _push(ssrRenderComponent(_component_CheckCircle, { class: "w-5 h-5 text-green-600 dark:text-green-400 mr-3" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-green-800 dark:text-green-200">Installation Complete!</h4><p class="text-sm text-green-700 dark:text-green-300 mt-1"> Your ProTask system has been successfully installed and configured. </p></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">`);
  if (!$setup.installationComplete && !$setup.hasErrors) {
    _push(`<button class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
    _push(ssrRenderComponent(_component_ArrowLeft, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
    _push(` Back </button>`);
  } else {
    _push(`<div class="flex space-x-3">`);
    if ($setup.hasErrors) {
      _push(`<button class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
      _push(ssrRenderComponent(_component_FileText, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
      _push(` ${ssrInterpolate($setup.showLog ? "Hide" : "Show")} Log </button>`);
    } else {
      _push(`<!---->`);
    }
    if ($setup.installationComplete) {
      _push(`<button class="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"> Complete Setup `);
      _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
      _push(`</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Progress.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerProgress = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerProgress as default
};
