import { resolveComponent, mergeProps, ref, reactive, computed, watch, useSSRContext } from "vue";
import { ArrowRight, ArrowLeft, Wifi, Info, X, Check, Database } from "lucide-vue-next";
import { i as installerApiRequest, h as handleApiResponse } from "./InstallerApi-CD_R4xjX.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerDatabase",
  components: {
    Database,
    Check,
    X,
    Info,
    Wifi,
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
    const connectionStatus = ref("");
    const connectionError = ref("");
    const form = reactive({
      connection: props.form.connection || "mysql",
      host: props.form.host || "localhost",
      port: props.form.port || 3306,
      name: props.form.name || "",
      username: props.form.username || "",
      password: props.form.password || ""
    });
    const canTestConnection = computed(() => {
      if (form.connection === "sqlite") return true;
      return form.host && form.port && form.name && form.username;
    });
    const updateForm = () => {
      emit("update:form", { ...form });
    };
    const testConnection = async () => {
      if (!canTestConnection.value) return;
      connectionStatus.value = "testing";
      connectionError.value = "";
      try {
        const response = await installerApiRequest("/install/test-database", {
          body: JSON.stringify(form)
        });
        const data = await handleApiResponse(response);
        if (data.success) {
          connectionStatus.value = "success";
          emit("update:form", { ...form, tested: true });
        } else {
          connectionStatus.value = "failed";
          connectionError.value = data.message || "Connection failed";
        }
      } catch (error) {
        connectionStatus.value = "failed";
        connectionError.value = "Network error. Please try again.";
        console.error("Database test error:", error);
      }
    };
    watch(form, () => {
      updateForm();
      if (connectionStatus.value) {
        connectionStatus.value = "";
        connectionError.value = "";
      }
    }, { deep: true });
    return {
      form,
      connectionStatus,
      connectionError,
      canTestConnection,
      updateForm,
      testConnection
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Database = resolveComponent("Database", true);
  const _component_Info = resolveComponent("Info");
  const _component_Wifi = resolveComponent("Wifi");
  const _component_Check = resolveComponent("Check");
  const _component_X = resolveComponent("X");
  const _component_ArrowLeft = resolveComponent("ArrowLeft");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_Database, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> Database Configuration </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Configure your database connection settings. Make sure your database is created and accessible. </p></div><div class="max-w-2xl mx-auto"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6"><div class="space-y-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Type <span class="text-red-500">*</span></label><select class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><option value="mysql"${ssrIncludeBooleanAttr(Array.isArray($setup.form.connection) ? ssrLooseContain($setup.form.connection, "mysql") : ssrLooseEqual($setup.form.connection, "mysql")) ? " selected" : ""}>MySQL</option><option value="pgsql"${ssrIncludeBooleanAttr(Array.isArray($setup.form.connection) ? ssrLooseContain($setup.form.connection, "pgsql") : ssrLooseEqual($setup.form.connection, "pgsql")) ? " selected" : ""}>PostgreSQL</option><option value="sqlite"${ssrIncludeBooleanAttr(Array.isArray($setup.form.connection) ? ssrLooseContain($setup.form.connection, "sqlite") : ssrLooseEqual($setup.form.connection, "sqlite")) ? " selected" : ""}>SQLite</option></select></div>`);
  if ($setup.form.connection === "sqlite") {
    _push(`<div class="space-y-4"><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"><div class="flex items-start">`);
    _push(ssrRenderComponent(_component_Info, { class: "w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">SQLite Database</h4><p class="text-sm text-blue-700 dark:text-blue-300 mt-1"> SQLite will create a database file automatically. No additional configuration needed. </p></div></div></div></div>`);
  } else {
    _push(`<div class="space-y-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Host <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.host)} type="text" placeholder="localhost" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Port <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.port)} type="number"${ssrRenderAttr("placeholder", $setup.form.connection === "mysql" ? "3306" : "5432")} class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Name <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.name)} type="text" placeholder="protask_db" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"><p class="mt-1 text-sm text-slate-500 dark:text-slate-400"> Make sure this database exists on your server </p></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Username <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.username)} type="text" placeholder="root" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Database Password </label><input${ssrRenderAttr("value", $setup.form.password)} type="password" placeholder="Your database password" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"></div></div>`);
  }
  _push(`</div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold text-slate-900 dark:text-white">Test Connection</h3><button${ssrIncludeBooleanAttr(!$setup.canTestConnection || $setup.connectionStatus === "testing") ? " disabled" : ""} class="${ssrRenderClass([
    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
    $setup.canTestConnection && $setup.connectionStatus !== "testing" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
  ])}">`);
  if ($setup.connectionStatus === "testing") {
    _push(`<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Testing... </div>`);
  } else {
    _push(`<div class="flex items-center">`);
    _push(ssrRenderComponent(_component_Wifi, { class: "w-4 h-4 mr-2" }, null, _parent));
    _push(` Test Connection </div>`);
  }
  _push(`</button></div>`);
  if ($setup.connectionStatus === "success") {
    _push(`<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"><div class="flex items-center">`);
    _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5 text-green-600 dark:text-green-400 mr-3" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-green-800 dark:text-green-200">Connection Successful</h4><p class="text-sm text-green-700 dark:text-green-300 mt-1"> Database connection is working properly. You can proceed with the installation. </p></div></div></div>`);
  } else if ($setup.connectionStatus === "failed") {
    _push(`<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"><div class="flex items-center">`);
    _push(ssrRenderComponent(_component_X, { class: "w-5 h-5 text-red-600 dark:text-red-400 mr-3" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-red-800 dark:text-red-200">Connection Failed</h4><p class="text-sm text-red-700 dark:text-red-300 mt-1">${ssrInterpolate($setup.connectionError || "Please check your database settings and try again.")}</p></div></div></div>`);
  } else if ($setup.connectionStatus === "") {
    _push(`<div class="text-center py-8">`);
    _push(ssrRenderComponent(_component_Database, { class: "w-12 h-12 text-slate-400 mx-auto mb-3" }, null, _parent));
    _push(`<p class="text-slate-500 dark:text-slate-400"> Click &quot;Test Connection&quot; to verify your database settings </p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"><div class="flex items-start">`);
  _push(ssrRenderComponent(_component_Info, { class: "w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" }, null, _parent));
  _push(`<div><h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Database Setup Tips</h4><ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1"><li>• Create a new database for your ProTask installation</li><li>• Use a dedicated database user with appropriate permissions</li><li>• Make sure your database server is running and accessible</li><li>• For shared hosting, use the credentials provided by your host</li></ul></div></div></div></div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><button class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
  _push(ssrRenderComponent(_component_ArrowLeft, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
  _push(` Back </button><button${ssrIncludeBooleanAttr($setup.connectionStatus !== "success") ? " disabled" : ""} class="${ssrRenderClass([
    "px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform",
    $setup.connectionStatus === "success" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
  ])}"> Continue `);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
  _push(`</button></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Database.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerDatabase = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerDatabase as default
};
