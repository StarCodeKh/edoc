import { I as Icon } from "./Layout-DXJEf-iu.js";
import { Link } from "@inertiajs/vue3";
import axios from "axios";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "board-filter",
  props: {
    project: Object,
    workspace: Object,
    filters: { required: false },
    options: { required: false },
    top: { required: false, default: "95px" },
    left: { required: false, default: "inherit" },
    right: { required: false, default: "20px" }
  },
  components: { Icon, Link },
  emits: {
    doFilter: null,
    boardFilter: null
  },
  data() {
    var _a, _b, _c, _d;
    return {
      open_filter: false,
      user_search: "",
      label_search: "",
      loading: true,
      users: [],
      labels: [],
      workspaceProjects: [],
      enable_options: [],
      form: {
        user: ((_a = this.filters) == null ? void 0 : _a.user) || null,
        due: ((_b = this.filters) == null ? void 0 : _b.due) || null,
        label: ((_c = this.filters) == null ? void 0 : _c.label) || null,
        project: ((_d = this.filters) == null ? void 0 : _d.project) || null
      }
    };
  },
  computed: {
    filteredUsers() {
      if (!this.users || !Array.isArray(this.users)) return [];
      if (!this.user_search) return this.users;
      const search = this.user_search.toLowerCase();
      return this.users.filter(
        (user) => user && user.name && user.name.toLowerCase().includes(search)
      );
    },
    filteredLabels() {
      if (!this.labels || !Array.isArray(this.labels)) return [];
      if (!this.label_search) return this.labels;
      const search = this.label_search.toLowerCase();
      return this.labels.filter(
        (label) => label && label.name && label.name.toLowerCase().includes(search)
      );
    },
    activeFiltersCount() {
      let count = 0;
      if (this.form.user) {
        const userValue = String(this.form.user);
        count += userValue.split(",").filter((v) => v && v !== "null").length;
      }
      if (this.form.due) {
        const dueValue = String(this.form.due);
        count += dueValue.split(",").filter((v) => v && v !== "null").length;
      }
      if (this.form.label) {
        const labelValue = String(this.form.label);
        count += labelValue.split(",").filter((v) => v && v !== "null").length;
      }
      if (this.form.project) {
        const projectValue = String(this.form.project);
        count += projectValue.split(",").filter((v) => v && v !== "null").length;
      }
      return count;
    },
    hasActiveUserFilters() {
      return !!this.form.user && this.form.user !== "null";
    },
    hasActiveDueFilters() {
      return !!this.form.due && this.form.due !== "null";
    },
    hasActiveLabelFilters() {
      return !!this.form.label;
    },
    hasActiveProjectFilters() {
      return !!this.form.project;
    }
  },
  methods: {
    filterOptions(type, value) {
      if (this.filters && this.filters[type]) {
        const filters = this.filters[type].split(",");
        return filters.includes(String(value));
      }
      return false;
    },
    doFilter(bool, type, val) {
      this.addOrRemove(type, val);
    },
    addOrRemove(el, val) {
      val = String(val);
      if (!!this.form[el]) {
        const arr = String(this.form[el]).split(",").filter((v) => v);
        if (!arr.includes(val)) {
          arr.push(val);
        } else {
          const findIndex = arr.findIndex((u) => u === val);
          arr.splice(findIndex, 1);
        }
        this.form[el] = arr.length > 0 ? arr.join(",") : null;
      } else {
        this.form[el] = val;
      }
      this.$emit("doFilter", this.form);
    },
    clearFilterType(type) {
      this.form[type] = null;
      this.$emit("doFilter", this.form);
    },
    clearAllFilters() {
      this.form = {
        user: null,
        due: null,
        label: null,
        project: null
      };
      this.$emit("doFilter", this.form);
    },
    getData() {
      if (this.workspace) {
        axios.get(this.route("workspace.other.data", { workspace_id: this.workspace.id })).then((response) => {
          const data = response.data || {};
          this.users = (data.team_members || []).map((tm) => {
            var _a, _b;
            return {
              name: ((_a = tm.user) == null ? void 0 : _a.name) || "",
              id: tm.user_id,
              photo_path: ((_b = tm.user) == null ? void 0 : _b.photo_path) || null
            };
          });
          this.labels = data.labels || [];
          if (this.enable_options.includes("project")) {
            this.loadWorkspaceProjects();
          }
          this.loading = false;
        }).catch((error) => {
          console.error("Error loading filter data:", error);
          this.users = [];
          this.labels = [];
          this.loading = false;
        });
      } else if (this.project) {
        axios.get(this.route("json.project.filter.data", this.project.id)).then((response) => {
          const data = response.data || {};
          this.users = (data.assignees || []).map((user) => {
            var _a, _b;
            return {
              name: ((_a = user.user) == null ? void 0 : _a.name) || "",
              id: user.user_id,
              photo_path: ((_b = user.user) == null ? void 0 : _b.photo_path) || null
            };
          });
          this.labels = data.labels || [];
          this.loading = false;
        }).catch((error) => {
          console.error("Error loading filter data:", error);
          this.users = [];
          this.labels = [];
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    },
    loadWorkspaceProjects() {
      if (this.workspace) {
        axios.get(this.route("json.projects.all", this.workspace.id)).then((response) => {
          if (response.data) {
            this.workspaceProjects = Array.isArray(response.data) ? response.data : [];
          } else {
            this.workspaceProjects = [];
          }
        }).catch((error) => {
          console.error("Error loading workspace projects:", error);
          this.workspaceProjects = [];
        });
      }
    }
  },
  created() {
    this.getData();
    this.enable_options = this.options ? this.options.split(",") : [];
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_icon = resolveComponent("icon");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: "absolute w-[320px] z-[9999] rounded-xl text-sm bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300",
    style: { top: $props.top, left: $props.left, right: $props.right }
  }, _attrs))} data-v-d9a5daea>`);
  if ($data.loading) {
    _push(`<div class="flex items-center justify-center py-12" data-v-d9a5daea><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" data-v-d9a5daea></div></div>`);
  } else {
    _push(`<div class="flex flex-col max-h-[80vh] overflow-hidden" data-v-d9a5daea><div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200" data-v-d9a5daea><div class="flex items-center gap-2" data-v-d9a5daea>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "filter",
      class: "w-5 h-5 text-indigo-600"
    }, null, _parent));
    _push(`<h3 class="font-semibold text-gray-900" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Filter Tasks"))}</h3>`);
    if ($options.activeFiltersCount > 0) {
      _push(`<span class="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full" data-v-d9a5daea>${ssrInterpolate($options.activeFiltersCount)}</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><button class="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"${ssrRenderAttr("title", _ctx.$t("Close"))} data-v-d9a5daea>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-5 h-5 text-gray-600",
      name: "close"
    }, null, _parent));
    _push(`</button></div><div class="flex-1 overflow-y-auto px-4 py-3 space-y-4" data-v-d9a5daea>`);
    if ($data.enable_options.includes("user")) {
      _push(`<div class="filter-section" data-v-d9a5daea><div class="flex items-center justify-between mb-2" data-v-d9a5daea><label class="flex items-center gap-2 text-sm font-semibold text-gray-700" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "user",
        class: "w-4 h-4 text-indigo-600"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Members"))}</label>`);
      if ($options.hasActiveUserFilters) {
        _push(`<button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Clear"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mb-3" data-v-d9a5daea><div class="relative" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "search",
        class: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
      }, null, _parent));
      _push(`<input${ssrRenderAttr("value", $data.user_search)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("Search members..."))} class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" data-v-d9a5daea></div></div><ul class="flex flex-col gap-2 max-h-48 overflow-y-auto" data-v-d9a5daea><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__user__no" data-v-d9a5daea><input id="filter__user__no" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("user", "null")) ? " checked" : ""} data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 text-gray-400",
        name: "user"
      }, null, _parent));
      _push(`<span class="text-sm text-gray-700" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("No members"))}</span></label></li><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__user__me" data-v-d9a5daea><input id="filter__user__me" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("user", _ctx.$page.props.auth.user.id)) ? " checked" : ""} data-v-d9a5daea>`);
      if (_ctx.$page.props.auth.user.photo) {
        _push(`<img class="w-6 h-6 rounded-full border-2 border-indigo-200"${ssrRenderAttr("alt", _ctx.$page.props.auth.user.first_name)}${ssrRenderAttr("src", _ctx.$page.props.auth.user.photo)} data-v-d9a5daea>`);
      } else {
        _push(`<img src="/images/user.svg" class="w-6 h-6 rounded-full border-2 border-indigo-200" alt="user profile" data-v-d9a5daea>`);
      }
      _push(`<span class="text-sm font-medium text-gray-700" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Tasks assigned to me"))}</span></label></li><!--[-->`);
      ssrRenderList($options.filteredUsers, (userObject, user_index) => {
        _push(`<li data-v-d9a5daea><label${ssrRenderAttr("for", "uid_" + user_index)} class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" data-v-d9a5daea><input${ssrRenderAttr("id", "uid_" + user_index)} class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("user", userObject.id)) ? " checked" : ""} data-v-d9a5daea>`);
        if (userObject.photo_path) {
          _push(`<img${ssrRenderAttr("aria-label", userObject.name)}${ssrRenderAttr("alt", userObject.name)} class="w-6 h-6 rounded-full border-2 border-gray-200"${ssrRenderAttr("src", userObject.photo_path)} data-v-d9a5daea>`);
        } else {
          _push(`<img${ssrRenderAttr("aria-label", userObject.name)}${ssrRenderAttr("alt", userObject.name)} class="w-6 h-6 rounded-full border-2 border-gray-200" src="/images/user.svg" data-v-d9a5daea>`);
        }
        _push(`<span class="text-sm text-gray-700" data-v-d9a5daea>${ssrInterpolate(userObject.name)}</span></label></li>`);
      });
      _push(`<!--]-->`);
      if (!$options.filteredUsers || $options.filteredUsers.length === 0) {
        _push(`<li class="text-xs text-gray-500 text-center py-2" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("No members found"))}</li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</ul></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.enable_options.includes("due")) {
      _push(`<div class="filter-section" data-v-d9a5daea><div class="flex items-center justify-between mb-2" data-v-d9a5daea><label class="flex items-center gap-2 text-sm font-semibold text-gray-700" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "calendar",
        class: "w-4 h-4 text-indigo-600"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Due Date"))}</label>`);
      if ($options.hasActiveDueFilters) {
        _push(`<button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Clear"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><ul class="flex flex-col gap-2" data-v-d9a5daea><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__no" data-v-d9a5daea><input id="filter__due__no" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("due", "null")) ? " checked" : ""} data-v-d9a5daea><span class="flex items-center gap-2" data-v-d9a5daea><span class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3 text-gray-600",
        name: "calendar"
      }, null, _parent));
      _push(`</span><span class="text-sm text-gray-700" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("No dates"))}</span></span></label></li><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__over" data-v-d9a5daea><input id="filter__due__over" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("due", "over")) ? " checked" : ""} data-v-d9a5daea><span class="flex items-center gap-2" data-v-d9a5daea><span class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3 text-red-600",
        name: "clock"
      }, null, _parent));
      _push(`</span><span class="text-sm text-gray-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Overdue"))}</span></span></label></li><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_day" data-v-d9a5daea><input id="filter__due__next_day" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("due", "next_day")) ? " checked" : ""} data-v-d9a5daea><span class="flex items-center gap-2" data-v-d9a5daea><span class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3 text-orange-600",
        name: "clock"
      }, null, _parent));
      _push(`</span><span class="text-sm text-gray-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Due in the next day"))}</span></span></label></li><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_week" data-v-d9a5daea><input id="filter__due__next_week" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("due", "next_week")) ? " checked" : ""} data-v-d9a5daea><span class="flex items-center gap-2" data-v-d9a5daea><span class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3 text-blue-600",
        name: "calendar-week"
      }, null, _parent));
      _push(`</span><span class="text-sm text-gray-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Due this week"))}</span></span></label></li><li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_month" data-v-d9a5daea><input id="filter__due__next_month" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("due", "next_month")) ? " checked" : ""} data-v-d9a5daea><span class="flex items-center gap-2" data-v-d9a5daea><span class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3 text-purple-600",
        name: "calendar"
      }, null, _parent));
      _push(`</span><span class="text-sm text-gray-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Due this month"))}</span></span></label></li></ul></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($data.enable_options.includes("label")) {
      _push(`<div class="filter-section" data-v-d9a5daea><div class="flex items-center justify-between mb-2" data-v-d9a5daea><label class="flex items-center gap-2 text-sm font-semibold text-gray-700" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "tag",
        class: "w-4 h-4 text-indigo-600"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Labels"))}</label>`);
      if ($options.hasActiveLabelFilters) {
        _push(`<button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Clear"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mb-3" data-v-d9a5daea><div class="relative" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "search",
        class: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
      }, null, _parent));
      _push(`<input${ssrRenderAttr("value", $data.label_search)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("Search labels..."))} class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" data-v-d9a5daea></div></div><ul class="flex flex-col gap-2 max-h-48 overflow-y-auto" data-v-d9a5daea><!--[-->`);
      ssrRenderList($options.filteredLabels, (lab, lab_index) => {
        _push(`<li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"${ssrRenderAttr("for", "f_l_" + lab_index)} data-v-d9a5daea><input${ssrRenderAttr("id", "f_l_" + lab_index)} class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("label", lab.id)) ? " checked" : ""} data-v-d9a5daea><span class="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm" style="${ssrRenderStyle({ background: lab.color })}" data-v-d9a5daea>${ssrInterpolate(lab.name)}</span></label></li>`);
      });
      _push(`<!--]-->`);
      if (!$options.filteredLabels || $options.filteredLabels.length === 0) {
        _push(`<li class="text-xs text-gray-500 text-center py-2" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("No labels found"))}</li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</ul></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($props.workspace && $data.enable_options.includes("project")) {
      _push(`<div class="filter-section" data-v-d9a5daea><div class="flex items-center justify-between mb-2" data-v-d9a5daea><label class="flex items-center gap-2 text-sm font-semibold text-gray-700" data-v-d9a5daea>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "project",
        class: "w-4 h-4 text-indigo-600"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Projects"))}</label>`);
      if ($options.hasActiveProjectFilters) {
        _push(`<button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Clear"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><ul class="flex flex-col gap-2 max-h-48 overflow-y-auto" data-v-d9a5daea><!--[-->`);
      ssrRenderList($data.workspaceProjects || [], (project, project_index) => {
        _push(`<li data-v-d9a5daea><label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"${ssrRenderAttr("for", "f_p_" + project_index)} data-v-d9a5daea><input${ssrRenderAttr("id", "f_p_" + project_index)} class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" type="checkbox"${ssrIncludeBooleanAttr($options.filterOptions("project", project.id)) ? " checked" : ""} data-v-d9a5daea><div class="project__color w-5 h-5 rounded-full flex-shrink-0" style="${ssrRenderStyle([project.background ? { background: "url(" + project.background.image + ")" } : {}])}" data-v-d9a5daea></div><span class="text-sm text-gray-700" data-v-d9a5daea>${ssrInterpolate(project.title)}</span></label></li>`);
      });
      _push(`<!--]--></ul></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between" data-v-d9a5daea>`);
    if ($options.activeFiltersCount > 0) {
      _push(`<button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("Clear All"))}</button>`);
    } else {
      _push(`<div class="text-xs text-gray-500" data-v-d9a5daea>${ssrInterpolate(_ctx.$t("No active filters"))}</div>`);
    }
    _push(`<div class="text-xs text-gray-500" data-v-d9a5daea>${ssrInterpolate($options.activeFiltersCount)} ${ssrInterpolate($options.activeFiltersCount === 1 ? _ctx.$t("filter") : _ctx.$t("filters"))}</div></div></div>`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/BoardFilter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const BoardFilter = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d9a5daea"]]);
export {
  BoardFilter as B
};
