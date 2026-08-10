import { resolveComponent, mergeProps, ref, reactive, watch, useSSRContext } from "vue";
import { ArrowRight, ArrowLeft, Info, X, Check, Shield } from "lucide-vue-next";
import { i as installerApiRequest, h as handleApiResponse } from "./InstallerApi-CD_R4xjX.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerLicense",
  components: {
    Shield,
    Check,
    X,
    Info,
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
    const verificationStatus = ref("");
    const verificationError = ref("");
    const errors = reactive({});
    const clearErrors = () => {
      Object.keys(errors).forEach((key) => delete errors[key]);
      verificationError.value = "";
    };
    const verifyLicense = async () => {
      if (!props.form.purchaseCode) {
        errors.purchaseCode = "Purchase code is required";
        return;
      }
      verificationStatus.value = "verifying";
      clearErrors();
      try {
        const response = await installerApiRequest("/install/verify-license", {
          body: JSON.stringify({
            purchase_code: props.form.purchaseCode
          })
        });
        const data = await handleApiResponse(response);
        if (data.success) {
          verificationStatus.value = "verified";
          emit("update:form", { ...props.form, verified: true });
        } else {
          verificationStatus.value = "failed";
          verificationError.value = data.message || "Invalid purchase code";
        }
      } catch (error) {
        verificationStatus.value = "failed";
        verificationError.value = "Network error. Please try again.";
        console.error("License verification error:", error);
      }
    };
    watch(() => props.form.purchaseCode, (newValue) => {
      emit("update:form", { ...props.form, purchaseCode: newValue });
    });
    return {
      verificationStatus,
      verificationError,
      errors,
      clearErrors,
      verifyLicense
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Shield = resolveComponent("Shield");
  const _component_Check = resolveComponent("Check");
  const _component_X = resolveComponent("X");
  const _component_Info = resolveComponent("Info");
  const _component_ArrowLeft = resolveComponent("ArrowLeft");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_Shield, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> License Verification </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Please enter your CodeCanyon purchase code to verify your license and continue with the installation. </p></div><div class="max-w-2xl mx-auto"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6"><div class="space-y-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Purchase Code <span class="text-red-500">*</span></label><div class="relative"><input${ssrRenderAttr("value", $props.form.purchaseCode)} type="text" placeholder="Enter your CodeCanyon purchase code" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.purchaseCode }, "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}">`);
  if ($setup.verificationStatus === "verifying") {
    _push(`<div class="absolute right-3 top-3"><div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div></div>`);
  } else if ($setup.verificationStatus === "verified") {
    _push(`<div class="absolute right-3 top-3">`);
    _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5 text-green-600 dark:text-green-400" }, null, _parent));
    _push(`</div>`);
  } else if ($setup.verificationStatus === "failed") {
    _push(`<div class="absolute right-3 top-3">`);
    _push(ssrRenderComponent(_component_X, { class: "w-5 h-5 text-red-600 dark:text-red-400" }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($setup.errors.purchaseCode) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.purchaseCode)}</p>`);
  } else {
    _push(`<p class="mt-1 text-sm text-slate-500 dark:text-slate-400"> You can find your purchase code in your CodeCanyon account under &quot;Downloads&quot; </p>`);
  }
  _push(`</div>`);
  if ($setup.verificationStatus === "verified") {
    _push(`<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"><div class="flex items-center">`);
    _push(ssrRenderComponent(_component_Check, { class: "w-5 h-5 text-green-600 dark:text-green-400 mr-3" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-green-800 dark:text-green-200">License Verified Successfully</h4><p class="text-sm text-green-700 dark:text-green-300 mt-1"> Your purchase code is valid and you can proceed with the installation. </p></div></div></div>`);
  } else if ($setup.verificationStatus === "failed") {
    _push(`<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"><div class="flex items-center">`);
    _push(ssrRenderComponent(_component_X, { class: "w-5 h-5 text-red-600 dark:text-red-400 mr-3" }, null, _parent));
    _push(`<div><h4 class="text-sm font-medium text-red-800 dark:text-red-200">License Verification Failed</h4><p class="text-sm text-red-700 dark:text-red-300 mt-1">${ssrInterpolate($setup.verificationError || "Please check your purchase code and try again.")}</p></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6"><div class="flex items-start">`);
  _push(ssrRenderComponent(_component_Info, { class: "w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" }, null, _parent));
  _push(`<div><h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Need Help Finding Your Purchase Code?</h4><ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1"><li>• Log in to your CodeCanyon account</li><li>• Go to &quot;Downloads&quot; section</li><li>• Find your ProTask purchase</li><li>• Copy the purchase code from the license details</li></ul></div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h4 class="text-sm font-medium text-slate-900 dark:text-white mb-3">License Information</h4><div class="space-y-2 text-sm text-slate-600 dark:text-slate-400"><p>• This is a single-use license for one domain</p><p>• You can use this code for development and production</p><p>• Support and updates are included for 6 months</p><p>• Please keep your purchase code secure and private</p></div></div></div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><button class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
  _push(ssrRenderComponent(_component_ArrowLeft, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
  _push(` Back </button><div class="flex space-x-3"><button${ssrIncludeBooleanAttr(!$props.form.purchaseCode || $setup.verificationStatus === "verifying") ? " disabled" : ""} class="${ssrRenderClass([
    "px-6 py-3 rounded-lg font-medium transition-all duration-200",
    $props.form.purchaseCode && $setup.verificationStatus !== "verifying" ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
  ])}">`);
  _push(ssrRenderComponent(_component_Shield, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
  _push(` ${ssrInterpolate($setup.verificationStatus === "verifying" ? "Verifying..." : "Verify License")}</button><button class="${ssrRenderClass([
    "px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform",
    $setup.verificationStatus === "verified" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
  ])}"> Continue `);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
  _push(`</button></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/License.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerLicense = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerLicense as default
};
