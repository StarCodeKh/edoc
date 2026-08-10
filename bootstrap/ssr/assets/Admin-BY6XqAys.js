import { resolveComponent, mergeProps, ref, reactive, computed, watch, useSSRContext } from "vue";
import { ArrowRight, ArrowLeft, Shield, EyeOff, Eye, User } from "lucide-vue-next";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderDynamicModel, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "InstallerAdmin",
  components: {
    User,
    Eye,
    EyeOff,
    Shield,
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
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const errors = reactive({});
    const form = reactive({
      firstName: props.form.firstName || "",
      lastName: props.form.lastName || "",
      email: props.form.email || "",
      password: props.form.password || "",
      confirmPassword: props.form.confirmPassword || ""
    });
    const passwordStrength = computed(() => {
      const password = form.password;
      if (!password) return 0;
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return Math.min(strength, 3);
    });
    const passwordStrengthText = computed(() => {
      switch (passwordStrength.value) {
        case 0:
        case 1:
          return "Weak";
        case 2:
          return "Medium";
        case 3:
          return "Strong";
        default:
          return "Very Strong";
      }
    });
    const isFormValid = computed(() => {
      return form.firstName && form.lastName && form.email && form.password && form.confirmPassword && form.password === form.confirmPassword && passwordStrength.value >= 2;
    });
    const clearErrors = () => {
      Object.keys(errors).forEach((key) => delete errors[key]);
    };
    const validateForm = () => {
      clearErrors();
      if (!form.firstName) {
        errors.firstName = "First name is required";
      }
      if (!form.lastName) {
        errors.lastName = "Last name is required";
      }
      if (!form.email) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (!form.password) {
        errors.password = "Password is required";
      } else if (form.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      } else if (passwordStrength.value < 2) {
        errors.password = "Password is too weak. Please use a stronger password.";
      }
      if (!form.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      return Object.keys(errors).length === 0;
    };
    const validateAndContinue = () => {
      if (validateForm()) {
        emit("update:form", { ...form });
        emit("next");
      }
    };
    const updateForm = () => {
      emit("update:form", { ...form });
    };
    watch(form, () => {
      updateForm();
    }, { deep: true });
    return {
      form,
      showPassword,
      showConfirmPassword,
      errors,
      passwordStrength,
      passwordStrengthText,
      isFormValid,
      clearErrors,
      validateAndContinue
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_User = resolveComponent("User");
  const _component_Eye = resolveComponent("Eye");
  const _component_EyeOff = resolveComponent("EyeOff");
  const _component_Shield = resolveComponent("Shield");
  const _component_ArrowLeft = resolveComponent("ArrowLeft");
  const _component_ArrowRight = resolveComponent("ArrowRight");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "animate-fade-in-up" }, _attrs))}><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">`);
  _push(ssrRenderComponent(_component_User, { class: "w-10 h-10 text-white" }, null, _parent));
  _push(`</div><h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4"> Admin Account Setup </h2><p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"> Create your administrator account to access the ProTask dashboard. </p></div><div class="max-w-2xl mx-auto"><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6"><div class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> First Name <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.firstName)} type="text" placeholder="John" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.firstName }, "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}">`);
  if ($setup.errors.firstName) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.firstName)}</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Last Name <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.lastName)} type="text" placeholder="Doe" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.lastName }, "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}">`);
  if ($setup.errors.lastName) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.lastName)}</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Email Address <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $setup.form.email)} type="email" placeholder="admin@yourdomain.com" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.email }, "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}">`);
  if ($setup.errors.email) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.email)}</p>`);
  } else {
    _push(`<p class="mt-1 text-sm text-slate-500 dark:text-slate-400"> This will be your login email address </p>`);
  }
  _push(`</div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Password <span class="text-red-500">*</span></label><div class="relative"><input${ssrRenderDynamicModel($setup.showPassword ? "text" : "password", $setup.form.password, null)}${ssrRenderAttr("type", $setup.showPassword ? "text" : "password")} placeholder="Enter a strong password" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.password }, "w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}"><button type="button" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">`);
  if (!$setup.showPassword) {
    _push(ssrRenderComponent(_component_Eye, { class: "w-5 h-5" }, null, _parent));
  } else {
    _push(ssrRenderComponent(_component_EyeOff, { class: "w-5 h-5" }, null, _parent));
  }
  _push(`</button></div>`);
  if ($setup.errors.password) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.password)}</p>`);
  } else {
    _push(`<div class="mt-1"><div class="flex items-center space-x-2"><div class="${ssrRenderClass([
      "w-2 h-2 rounded-full",
      $setup.passwordStrength >= 1 ? "bg-red-500" : "bg-slate-200 dark:bg-slate-600"
    ])}"></div><div class="${ssrRenderClass([
      "w-2 h-2 rounded-full",
      $setup.passwordStrength >= 2 ? "bg-yellow-500" : "bg-slate-200 dark:bg-slate-600"
    ])}"></div><div class="${ssrRenderClass([
      "w-2 h-2 rounded-full",
      $setup.passwordStrength >= 3 ? "bg-green-500" : "bg-slate-200 dark:bg-slate-600"
    ])}"></div><span class="text-xs text-slate-500 dark:text-slate-400">${ssrInterpolate($setup.passwordStrengthText)}</span></div></div>`);
  }
  _push(`</div><div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Confirm Password <span class="text-red-500">*</span></label><div class="relative"><input${ssrRenderDynamicModel($setup.showConfirmPassword ? "text" : "password", $setup.form.confirmPassword, null)}${ssrRenderAttr("type", $setup.showConfirmPassword ? "text" : "password")} placeholder="Confirm your password" class="${ssrRenderClass([{ "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500": $setup.errors.confirmPassword }, "w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"])}"><button type="button" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">`);
  if (!$setup.showConfirmPassword) {
    _push(ssrRenderComponent(_component_Eye, { class: "w-5 h-5" }, null, _parent));
  } else {
    _push(ssrRenderComponent(_component_EyeOff, { class: "w-5 h-5" }, null, _parent));
  }
  _push(`</button></div>`);
  if ($setup.errors.confirmPassword) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400">${ssrInterpolate($setup.errors.confirmPassword)}</p>`);
  } else if ($setup.form.confirmPassword && $setup.form.password !== $setup.form.confirmPassword) {
    _push(`<p class="mt-1 text-sm text-red-600 dark:text-red-400"> Passwords do not match </p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div><div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6"><div class="flex items-start">`);
  _push(ssrRenderComponent(_component_Shield, { class: "w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" }, null, _parent));
  _push(`<div><h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Security Best Practices</h4><ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1"><li>• Use a strong, unique password with at least 8 characters</li><li>• Include uppercase, lowercase, numbers, and special characters</li><li>• Avoid using personal information or common words</li><li>• Consider using a password manager to generate and store passwords</li></ul></div></div></div><div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"><h4 class="text-sm font-medium text-slate-900 dark:text-white mb-3">Account Preview</h4><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-slate-600 dark:text-slate-400">Name:</span><span class="text-slate-900 dark:text-white font-medium">${ssrInterpolate($setup.form.firstName)} ${ssrInterpolate($setup.form.lastName)}</span></div><div class="flex justify-between"><span class="text-slate-600 dark:text-slate-400">Email:</span><span class="text-slate-900 dark:text-white font-medium">${ssrInterpolate($setup.form.email)}</span></div><div class="flex justify-between"><span class="text-slate-600 dark:text-slate-400">Role:</span><span class="text-slate-900 dark:text-white font-medium">Administrator</span></div></div></div></div><div class="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"><button class="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">`);
  _push(ssrRenderComponent(_component_ArrowLeft, { class: "w-4 h-4 mr-2 inline" }, null, _parent));
  _push(` Back </button><button${ssrIncludeBooleanAttr(!$setup.isFormValid) ? " disabled" : ""} class="${ssrRenderClass([
    "px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform",
    $setup.isFormValid ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
  ])}"> Start Installation `);
  _push(ssrRenderComponent(_component_ArrowRight, { class: "w-4 h-4 ml-2 inline" }, null, _parent));
  _push(`</button></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Installer/Steps/Admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstallerAdmin = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  InstallerAdmin as default
};
