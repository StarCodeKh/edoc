import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, S as SelectInput, I as Icon, a as CreateProject, b as InviteWorkspaceMember } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import moment from "moment";
import { S as SearchInput } from "./SearchInput-Br3HcA23.js";
import axios from "axios";
import { D as DeleteConfirmation } from "./DeleteConfirmation-HVTZH6_Z.js";
import { F as FileInput } from "./FileInput-PDHMJZ8j.js";
import { resolveComponent, resolveDirective, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, withModifiers, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrGetDirectiveProps, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderClass } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./BoardFilter-BGdXhQL5.js";
const _sfc_main = {
  components: {
    FileInput,
    DeleteConfirmation,
    InviteWorkspaceMember,
    CreateProject,
    Head,
    Icon,
    Link,
    BoardViewMenu,
    Pagination,
    SearchInput,
    SelectInput
  },
  layout: Layout,
  props: {
    title: String,
    auth: Object,
    projects: Object,
    workspace: Object,
    filters: Object
  },
  data() {
    return {
      create_project: false,
      delete_workspace_popup: false,
      edit_workspace_option: false,
      invite_workspace: false,
      show_more: false,
      showSortMenu: false,
      types: [],
      searchQuery: "",
      sortBy: "recent",
      viewMode: "grid",
      // 'grid' or 'list'
      sortOptions: [
        { value: "recent", label: "Recently Updated", icon: "clock" },
        { value: "name", label: "Name (A-Z)", icon: "sort-alpha" },
        { value: "name_desc", label: "Name (Z-A)", icon: "sort-alpha-desc" },
        { value: "starred", label: "Starred First", icon: "star" }
      ],
      form: this.$inertia.form({
        name: this.workspace.name,
        type_id: this.workspace.type_id,
        website: this.workspace.website,
        description: this.workspace.description,
        logo: null
      })
    };
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects || [];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (project) => project.title.toLowerCase().includes(query) || project.description && project.description.toLowerCase().includes(query)
        );
      }
      const sorted = [...filtered];
      switch (this.sortBy) {
        case "name":
          sorted.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name_desc":
          sorted.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "starred":
          sorted.sort((a, b) => {
            if (a.star && !b.star) return -1;
            if (!a.star && b.star) return 1;
            return 0;
          });
          break;
      }
      return sorted;
    }
  },
  methods: {
    getDetails(text) {
      if (text && text.length > 50) text = text.substring(0, 50) + "...";
      return text;
    },
    deleteWorkspace() {
      this.$inertia.delete(this.route("workspace.destroy", this.workspace.id));
    },
    closeInviteMember() {
      this.invite_workspace = false;
      window.location.href = this.route("workspace.members", this.workspace.slug || this.workspace.id);
    },
    updateWorkspace() {
      this.form.post(this.route("workspace.update", this.workspace.id));
    },
    saveProject(e, project) {
      project.star = !project.star;
      e.preventDefault();
      axios.post(this.route("json.p.starred.save", project.id)).then((resp) => {
        window.location.reload();
      });
    },
    getWorkspaceTypes() {
      axios.post(this.route("json.workspace.types.get")).then((response) => {
        if (response.data) {
          this.types = response.data.types;
        }
      });
    },
    getSortLabel() {
      const option = this.sortOptions.find((opt) => opt.value === this.sortBy);
      return option ? this.$t(option.label) : this.$t("Sort");
    }
  },
  created() {
    this.moment = moment;
    this.getWorkspaceTypes();
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a, _b, _c;
  const _component_Head = resolveComponent("Head");
  const _component_icon = resolveComponent("icon");
  const _component_Link = resolveComponent("Link");
  const _component_select_input = resolveComponent("select-input");
  const _component_file_input = resolveComponent("file-input");
  const _component_create_project = resolveComponent("create-project");
  const _component_invite_workspace_member = resolveComponent("invite-workspace-member");
  const _component_delete_confirmation = resolveComponent("delete-confirmation");
  const _directive_click_outside = resolveDirective("click-outside");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex workspace__view flex-col task__table overflow-hidden overflow-y-auto"><div class="relative bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 text-white overflow-hidden"><div class="absolute inset-0 opacity-10"><div class="absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", "background-size": "40px 40px", "animation": "patternMove 20s linear infinite" })}"></div></div><div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div><div class="relative min-w-full py-8 px-4 md:px-6 lg:px-8"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"><div class="flex items-center gap-5"><div class="relative">`);
  if ($props.workspace.logo) {
    _push(`<div class="logo has_bg flex justify-center items-center w-20 h-20 rounded-3xl text-white text-2xl shadow-2xl ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-105" style="${ssrRenderStyle({ "background-image": "url(" + $props.workspace.logo + ")" })}"></div>`);
  } else {
    _push(`<div class="logo flex justify-center items-center w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-md text-white text-3xl font-bold shadow-2xl ring-4 ring-white/30 transition-transform duration-300 hover:scale-105">${ssrInterpolate($props.workspace.name.charAt(0).toUpperCase())}</div>`);
  }
  _push(`<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div></div><div class="flex flex-col gap-1"><h1 class="text-4xl font-extrabold text-white drop-shadow-lg">${ssrInterpolate($props.workspace.name)}</h1>`);
  if ($props.workspace.description) {
    _push(`<p class="text-white/90 text-base mt-1 max-w-2xl leading-relaxed">${ssrInterpolate($props.workspace.description)}</p>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.workspace.website) {
    _push(`<div class="flex items-center gap-2 mt-3"><div class="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "link",
      class: "w-4 h-4 text-white"
    }, null, _parent));
    _push(`</div><a${ssrRenderAttr("href", $props.workspace.website)} target="_blank" class="text-white/90 text-sm hover:text-white font-medium underline decoration-2 underline-offset-2 transition-colors">${ssrInterpolate($props.workspace.website)}</a></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="flex items-center gap-3">`);
  if ($props.workspace.member.role === "admin") {
    _push(`<button class="flex gap-2 bg-white/25 hover:bg-white/35 backdrop-blur-md h-11 items-center text-white rounded-xl px-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold border border-white/30">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "user_plus",
      class: "w-5 h-5 fill-white"
    }, null, _parent));
    _push(`<span>${ssrInterpolate(_ctx.$t("Invite Members"))}</span></button>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.workspace.member.role === "admin") {
    _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, () => {
      $data.show_more = false;
    })))}><button class="flex items-center justify-center w-11 h-11 bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/30">`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-5 h-5 text-white",
      name: "more"
    }, null, _parent));
    _push(`</button>`);
    if ($data.show_more) {
      _push(`<div class="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-[9999] backdrop-blur-xl"><div class="p-2"><button class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"><div class="p-2 bg-indigo-100 rounded-xl mr-3 group-hover:bg-indigo-200 transition-colors">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 text-indigo-600",
        name: "edit"
      }, null, _parent));
      _push(`</div><span>${ssrInterpolate(_ctx.$t("Edit Workspace"))}</span></button><button class="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"><div class="p-2 bg-red-100 rounded-xl mr-3 group-hover:bg-red-200 transition-colors">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-4 h-4 text-red-600",
        name: "trash"
      }, null, _parent));
      _push(`</div><span>${ssrInterpolate(_ctx.$t("Delete Workspace"))}</span></button></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div><div class="min-w-full py-8 align-middle md:px-4 lg:px-6 xl:px-8"><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"><div class="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden"><div class="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div><div class="relative flex items-center justify-between"><div class="flex-1"><p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Total Projects"))}</p><p class="text-4xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">${ssrInterpolate(((_a = $props.projects) == null ? void 0 : _a.length) || 0)}</p><p class="text-xs text-gray-500">${ssrInterpolate(_ctx.$t("Active projects"))}</p></div><div class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl group-hover:from-indigo-200 group-hover:to-indigo-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "folder",
    class: "w-7 h-7 text-indigo-600"
  }, null, _parent));
  _push(`</div></div></div>`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("workspace.view.board", $props.workspace.slug || $props.workspace.id),
    class: "relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group block overflow-hidden"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"${_scopeId}></div><div class="relative flex items-center justify-between"${_scopeId}><div class="flex-1"${_scopeId}><p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide"${_scopeId}>${ssrInterpolate(_ctx.$t("Workspace Tasks"))}</p><p class="text-xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors mb-1"${_scopeId}>${ssrInterpolate(_ctx.$t("View All"))}</p><p class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(_ctx.$t("All workspace tasks"))}</p></div><div class="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:from-purple-200 group-hover:to-purple-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_icon, {
          name: "table",
          class: "w-7 h-7 text-purple-600"
        }, null, _parent2, _scopeId));
        _push2(`</div></div>`);
      } else {
        return [
          createVNode("div", { class: "absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" }),
          createVNode("div", { class: "relative flex items-center justify-between" }, [
            createVNode("div", { class: "flex-1" }, [
              createVNode("p", { class: "text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide" }, toDisplayString(_ctx.$t("Workspace Tasks")), 1),
              createVNode("p", { class: "text-xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors mb-1" }, toDisplayString(_ctx.$t("View All")), 1),
              createVNode("p", { class: "text-xs text-gray-500" }, toDisplayString(_ctx.$t("All workspace tasks")), 1)
            ]),
            createVNode("div", { class: "p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:from-purple-200 group-hover:to-purple-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md" }, [
              createVNode(_component_icon, {
                name: "table",
                class: "w-7 h-7 text-purple-600"
              })
            ])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("workspace.view.my-tasks.board", $props.workspace.slug || $props.workspace.id),
    class: "relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group block overflow-hidden"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"${_scopeId}></div><div class="relative flex items-center justify-between"${_scopeId}><div class="flex-1"${_scopeId}><p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide"${_scopeId}>${ssrInterpolate(_ctx.$t("My Tasks"))}</p><p class="text-xl font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors mb-1"${_scopeId}>${ssrInterpolate(_ctx.$t("View All"))}</p><p class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(_ctx.$t("Your assigned tasks"))}</p></div><div class="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl group-hover:from-pink-200 group-hover:to-pink-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_icon, {
          name: "list",
          class: "w-7 h-7 text-pink-600"
        }, null, _parent2, _scopeId));
        _push2(`</div></div>`);
      } else {
        return [
          createVNode("div", { class: "absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" }),
          createVNode("div", { class: "relative flex items-center justify-between" }, [
            createVNode("div", { class: "flex-1" }, [
              createVNode("p", { class: "text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide" }, toDisplayString(_ctx.$t("My Tasks")), 1),
              createVNode("p", { class: "text-xl font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors mb-1" }, toDisplayString(_ctx.$t("View All")), 1),
              createVNode("p", { class: "text-xs text-gray-500" }, toDisplayString(_ctx.$t("Your assigned tasks")), 1)
            ]),
            createVNode("div", { class: "p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl group-hover:from-pink-200 group-hover:to-pink-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md" }, [
              createVNode(_component_icon, {
                name: "list",
                class: "w-7 h-7 text-pink-600"
              })
            ])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
  if ($data.edit_workspace_option) {
    _push(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn"><div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slideUp"><div class="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-8 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "edit",
      class: "w-6 h-6 text-white"
    }, null, _parent));
    _push(`</div><h3 class="text-2xl font-extrabold">${ssrInterpolate(_ctx.$t("Edit Workspace"))}</h3></div><button class="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "close",
      class: "w-6 h-6 text-white"
    }, null, _parent));
    _push(`</button></div></div><div class="p-8 space-y-6 bg-gradient-to-br from-white to-gray-50"><div><label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Workspace name"))} <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", $data.form.name)} class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md" type="text" required="required" aria-required="true" autocomplete="off" placeholder="Enter workspace name"></div><div><label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Workspace Type"))}</label>`);
    _push(ssrRenderComponent(_component_select_input, {
      modelValue: $data.form.type_id,
      "onUpdate:modelValue": ($event) => $data.form.type_id = $event,
      class: "w-full"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<!--[-->`);
          ssrRenderList($data.types, (type, ti) => {
            _push2(`<option${ssrRenderAttr("value", type.id)}${_scopeId}>${ssrInterpolate(type.name)}</option>`);
          });
          _push2(`<!--]-->`);
        } else {
          return [
            (openBlock(true), createBlock(Fragment, null, renderList($data.types, (type, ti) => {
              return openBlock(), createBlock("option", {
                key: ti,
                value: type.id
              }, toDisplayString(type.name), 9, ["value"]);
            }), 128))
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div><div><label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Workspace Logo"))}</label>`);
    _push(ssrRenderComponent(_component_file_input, {
      modelValue: $data.form.logo,
      "onUpdate:modelValue": ($event) => $data.form.logo = $event,
      class: "w-full",
      type: "file",
      accept: "image/*",
      label: "Upload Logo"
    }, null, _parent));
    _push(`</div><div><label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Website"))} <span class="text-gray-500 text-xs font-normal normal-case">(${ssrInterpolate(_ctx.$t("optional"))})</span></label><input${ssrRenderAttr("value", $data.form.website)} class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md" type="text" autocomplete="off" placeholder="https://example.com"></div><div><label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">${ssrInterpolate(_ctx.$t("Workspace Description"))} <span class="text-gray-500 text-xs font-normal normal-case">(${ssrInterpolate(_ctx.$t("optional"))})</span></label><textarea class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md h-32 resize-none" autocomplete="off" placeholder="Describe your workspace...">${ssrInterpolate($data.form.description)}</textarea></div><div class="flex gap-4 pt-6 border-t border-gray-200"><button class="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(!$data.form.name) ? " disabled" : ""}><span class="flex items-center justify-center gap-2">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "save",
      class: "w-5 h-5 fill-white"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Update Workspace"))}</span></button><button class="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">${ssrInterpolate(_ctx.$t("Cancel"))}</button></div></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="mb-8"><div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"><div class="flex-1"><div class="flex items-center gap-3 mb-2"><div class="p-2 bg-indigo-100 rounded-xl">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "folder",
    class: "w-6 h-6 text-indigo-600"
  }, null, _parent));
  _push(`</div><div><h2 class="text-3xl font-extrabold text-gray-900">${ssrInterpolate(_ctx.$t("Projects"))}</h2><p class="text-sm text-gray-600 mt-1"><span class="font-semibold text-indigo-600">${ssrInterpolate($options.filteredProjects.length)}</span><span class="text-gray-500">${ssrInterpolate(_ctx.$t("of"))}</span><span class="font-semibold">${ssrInterpolate(((_b = $props.projects) == null ? void 0 : _b.length) || 0)}</span><span class="text-gray-500">${ssrInterpolate(_ctx.$t("project" + (((_c = $props.projects) == null ? void 0 : _c.length) !== 1 ? "s" : "")))}</span></p></div></div></div><div class="flex flex-wrap items-center gap-3"><div class="relative flex-1 sm:flex-initial sm:w-72"><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "search",
    class: "w-5 h-5 text-gray-400"
  }, null, _parent));
  _push(`</div><input${ssrRenderAttr("value", $data.searchQuery)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("Search projects..."))} class="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white text-sm font-medium shadow-sm">`);
  if ($data.searchQuery) {
    _push(`<button class="absolute inset-y-0 right-0 flex items-center pr-4 hover:bg-gray-100 rounded-r-xl transition-colors">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "close",
      class: "w-4 h-4 text-gray-400 hover:text-gray-600"
    }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div${ssrRenderAttrs(mergeProps({ class: "relative" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, () => $data.showSortMenu = false)))}><button class="${ssrRenderClass([{ "border-indigo-500 bg-indigo-50": $data.showSortMenu }, "flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all bg-white text-sm font-semibold text-gray-700 shadow-sm min-w-[140px]"])}">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "sort",
    class: "w-4 h-4"
  }, null, _parent));
  _push(`<span class="flex-1 text-left">${ssrInterpolate($options.getSortLabel())}</span>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "cheveron-down",
    class: ["w-4 h-4 transition-transform", { "rotate-180": $data.showSortMenu }]
  }, null, _parent));
  _push(`</button>`);
  if ($data.showSortMenu) {
    _push(`<div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-[9999] backdrop-blur-xl"><div class="p-2"><!--[-->`);
    ssrRenderList($data.sortOptions, (option) => {
      _push(`<button class="${ssrRenderClass([{ "bg-indigo-50 text-indigo-600 font-semibold": $data.sortBy === option.value }, "w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-200"])}"><div class="${ssrRenderClass([$data.sortBy === option.value ? "bg-indigo-100" : "bg-gray-100", "p-1.5 rounded-lg mr-3"])}">`);
      _push(ssrRenderComponent(_component_icon, {
        name: option.icon,
        class: ["w-4 h-4", $data.sortBy === option.value ? "text-indigo-600" : "text-gray-600"]
      }, null, _parent));
      _push(`</div><span class="flex-1">${ssrInterpolate(_ctx.$t(option.label))}</span>`);
      if ($data.sortBy === option.value) {
        _push(ssrRenderComponent(_component_icon, {
          name: "check",
          class: "w-5 h-5 text-indigo-600"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"><button class="${ssrRenderClass([$data.viewMode === "grid" ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50", "p-3 transition-all duration-200"])}"${ssrRenderAttr("title", _ctx.$t("Grid View"))}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></button><button class="${ssrRenderClass([$data.viewMode === "list" ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50", "p-3 transition-all duration-200 border-l-2 border-gray-200"])}"${ssrRenderAttr("title", _ctx.$t("List View"))}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button></div>`);
  if (!!this.$page.props.auth.user.role.create_project && !$data.create_project) {
    _push(`<button class="flex gap-2 items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 whitespace-nowrap">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "plus",
      class: "w-5 h-5 fill-white"
    }, null, _parent));
    _push(`<span class="hidden sm:inline">${ssrInterpolate(_ctx.$t("New Project"))}</span><span class="sm:hidden">${ssrInterpolate(_ctx.$t("New"))}</span></button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div>`);
  if ($data.create_project) {
    _push(ssrRenderComponent(_component_create_project, {
      onCreateProject: ($event) => $data.create_project = false
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.viewMode === "grid") {
    _push(`<ul class="project__list">`);
    if (!!this.$page.props.auth.user.role.create_project && !$data.create_project) {
      _push(`<li class="w-full"><button class="group w-full rounded-3xl border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gradient-to-br from-gray-50 via-white to-gray-50 hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-500 p-8 flex flex-col items-center justify-center relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div><div class="relative z-10 p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 transform shadow-lg">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "plus",
        class: "w-8 h-8 text-indigo-600"
      }, null, _parent));
      _push(`</div><div class="relative z-10 text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1">${ssrInterpolate(_ctx.$t("Create new project"))}</div><div class="relative z-10 text-sm text-gray-500 group-hover:text-indigo-500 font-medium">${ssrInterpolate(_ctx.$t("Start organizing your work"))}</div></button></li>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.filteredProjects, (project, project_index) => {
      _push(`<li class="w-full" style="${ssrRenderStyle({ animationDelay: project_index * 50 + "ms" })}">`);
      _push(ssrRenderComponent(_component_Link, {
        href: _ctx.route("projects.view.board", project.slug || project.id),
        style: [project.background ? { backgroundColor: project.background.bg, backgroundImage: "url(" + project.background.image + ")", backgroundSize: "cover" } : { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }],
        class: "p__item group block rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 overflow-hidden relative"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35 group-hover:from-black/10 group-hover:via-black/5 group-hover:to-black/20 transition-all duration-500"${_scopeId}></div><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"${_scopeId}></div><div class="content relative z-10 h-full flex flex-col justify-between p-6"${_scopeId}><div class="element flex-1"${_scopeId}><div class="flex items-start justify-between mb-3"${_scopeId}><div class="title text-2xl font-extrabold text-white line-clamp-1 flex-1 pr-3 drop-shadow-lg group-hover:drop-shadow-xl transition-all"${_scopeId}>${ssrInterpolate(project.title)}</div><button class="flex w-9 h-9 items-center justify-center rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all flex-shrink-0 shadow-lg"${_scopeId}>`);
            if (!!project.star) {
              _push2(ssrRenderComponent(_component_icon, {
                name: "star",
                class: "w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg"
              }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_icon, {
                name: "star",
                class: "w-5 h-5 opacity-0 group-hover:opacity-100 text-white/70 hover:text-yellow-400 transition-all"
              }, null, _parent2, _scopeId));
            }
            _push2(`</button></div>`);
            if (project.description) {
              _push2(`<p class="details text-sm text-white/95 line-clamp-2 mb-4 leading-relaxed drop-shadow-md"${_scopeId}>${ssrInterpolate(project.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex items-center justify-between mt-auto pt-4 border-t border-white/30"${_scopeId}><div class="flex items-center gap-2.5"${_scopeId}><div class="p-2 bg-white/25 backdrop-blur-md rounded-xl shadow-md"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "folder",
              class: "w-4 h-4 text-white"
            }, null, _parent2, _scopeId));
            _push2(`</div><span class="text-xs text-white/95 font-semibold uppercase tracking-wide"${_scopeId}>${ssrInterpolate(_ctx.$t("Project"))}</span></div><div class="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg group-hover:bg-white/30 transition-all"${_scopeId}><span class="text-xs text-white/90 font-medium"${_scopeId}>${ssrInterpolate(_ctx.$t("Open"))}</span>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "arrow-right",
              class: "w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
            }, null, _parent2, _scopeId));
            _push2(`</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35 group-hover:from-black/10 group-hover:via-black/5 group-hover:to-black/20 transition-all duration-500" }),
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" }),
              createVNode("div", { class: "content relative z-10 h-full flex flex-col justify-between p-6" }, [
                createVNode("div", { class: "element flex-1" }, [
                  createVNode("div", { class: "flex items-start justify-between mb-3" }, [
                    createVNode("div", { class: "title text-2xl font-extrabold text-white line-clamp-1 flex-1 pr-3 drop-shadow-lg group-hover:drop-shadow-xl transition-all" }, toDisplayString(project.title), 1),
                    createVNode("button", {
                      class: "flex w-9 h-9 items-center justify-center rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all flex-shrink-0 shadow-lg",
                      onClick: withModifiers(($event) => $options.saveProject($event, project), ["stop"])
                    }, [
                      !!project.star ? (openBlock(), createBlock(_component_icon, {
                        key: 0,
                        name: "star",
                        class: "w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg"
                      })) : (openBlock(), createBlock(_component_icon, {
                        key: 1,
                        name: "star",
                        class: "w-5 h-5 opacity-0 group-hover:opacity-100 text-white/70 hover:text-yellow-400 transition-all"
                      }))
                    ], 8, ["onClick"])
                  ]),
                  project.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "details text-sm text-white/95 line-clamp-2 mb-4 leading-relaxed drop-shadow-md"
                  }, toDisplayString(project.description), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex items-center justify-between mt-auto pt-4 border-t border-white/30" }, [
                  createVNode("div", { class: "flex items-center gap-2.5" }, [
                    createVNode("div", { class: "p-2 bg-white/25 backdrop-blur-md rounded-xl shadow-md" }, [
                      createVNode(_component_icon, {
                        name: "folder",
                        class: "w-4 h-4 text-white"
                      })
                    ]),
                    createVNode("span", { class: "text-xs text-white/95 font-semibold uppercase tracking-wide" }, toDisplayString(_ctx.$t("Project")), 1)
                  ]),
                  createVNode("div", { class: "flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg group-hover:bg-white/30 transition-all" }, [
                    createVNode("span", { class: "text-xs text-white/90 font-medium" }, toDisplayString(_ctx.$t("Open")), 1),
                    createVNode(_component_icon, {
                      name: "arrow-right",
                      class: "w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
                    })
                  ])
                ])
              ])
            ];
          }
        }),
        _: 2
      }, _parent));
      _push(`</li>`);
    });
    _push(`<!--]-->`);
    if ($options.filteredProjects.length === 0 && $data.searchQuery) {
      _push(`<li class="w-full col-span-full"><div class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center"><div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "search",
        class: "w-10 h-10 text-gray-400"
      }, null, _parent));
      _push(`</div><h3 class="text-lg font-semibold text-gray-900 mb-2">${ssrInterpolate(_ctx.$t("No projects found"))}</h3><p class="text-gray-600 mb-6">${ssrInterpolate(_ctx.$t("Try adjusting your search or filters"))}</p><button class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "close",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`<span>${ssrInterpolate(_ctx.$t("Clear Search"))}</span></button></div></li>`);
    } else {
      _push(`<!---->`);
    }
    if (!$props.projects || $props.projects.length === 0) {
      _push(`<li class="w-full col-span-full"><div class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center"><div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "folder",
        class: "w-10 h-10 text-gray-400"
      }, null, _parent));
      _push(`</div><h3 class="text-lg font-semibold text-gray-900 mb-2">${ssrInterpolate(_ctx.$t("No projects yet"))}</h3><p class="text-gray-600 mb-6">${ssrInterpolate(_ctx.$t("Create your first project to get started"))}</p>`);
      if (!!this.$page.props.auth.user.role.create_project) {
        _push(`<button class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">`);
        _push(ssrRenderComponent(_component_icon, {
          name: "plus",
          class: "w-5 h-5 fill-white"
        }, null, _parent));
        _push(`<span>${ssrInterpolate(_ctx.$t("Create Project"))}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></li>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</ul>`);
  } else {
    _push(`<div class="space-y-3">`);
    if (!!this.$page.props.auth.user.role.create_project && !$data.create_project) {
      _push(`<button class="group w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 p-6 flex items-center justify-center gap-4"><div class="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "plus",
        class: "w-6 h-6 text-indigo-600"
      }, null, _parent));
      _push(`</div><div class="text-left"><div class="text-lg font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">${ssrInterpolate(_ctx.$t("Create new project"))}</div><div class="text-sm text-gray-500">${ssrInterpolate(_ctx.$t("Start organizing your work"))}</div></div></button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.filteredProjects, (project, project_index) => {
      _push(ssrRenderComponent(_component_Link, {
        key: project.id,
        href: _ctx.route("projects.view.board", project.slug || project.id),
        class: "group block bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200/60 hover:border-indigo-300 transition-all duration-500 overflow-hidden hover:-translate-y-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-5 p-6"${_scopeId}><div class="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-gray-100 group-hover:ring-indigo-100 transition-all duration-300 group-hover:scale-110" style="${ssrRenderStyle([project.background ? { backgroundColor: project.background.bg, backgroundImage: "url(" + project.background.image + ")", backgroundSize: "cover" } : { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }])}"${_scopeId}></div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><h3 class="text-xl font-extrabold text-gray-900 truncate pr-3 group-hover:text-indigo-600 transition-colors"${_scopeId}>${ssrInterpolate(project.title)}</h3><button class="flex w-9 h-9 items-center justify-center rounded-xl hover:bg-indigo-50 transition-all flex-shrink-0"${_scopeId}>`);
            if (!!project.star) {
              _push2(ssrRenderComponent(_component_icon, {
                name: "star",
                class: "w-5 h-5 fill-yellow-400 text-yellow-400"
              }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_icon, {
                name: "star",
                class: "w-5 h-5 text-gray-400 hover:text-yellow-400"
              }, null, _parent2, _scopeId));
            }
            _push2(`</button></div>`);
            if (project.description) {
              _push2(`<p class="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed"${_scopeId}>${ssrInterpolate(project.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex items-center gap-4"${_scopeId}><div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "folder",
              class: "w-4 h-4 text-indigo-600"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-xs text-indigo-600 font-semibold"${_scopeId}>${ssrInterpolate(_ctx.$t("Project"))}</span></div></div></div><div class="flex-shrink-0 p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "arrow-right",
              class: "w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-5 p-6" }, [
                createVNode("div", {
                  class: "flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-gray-100 group-hover:ring-indigo-100 transition-all duration-300 group-hover:scale-110",
                  style: [project.background ? { backgroundColor: project.background.bg, backgroundImage: "url(" + project.background.image + ")", backgroundSize: "cover" } : { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }]
                }, null, 4),
                createVNode("div", { class: "flex-1 min-w-0" }, [
                  createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                    createVNode("h3", { class: "text-xl font-extrabold text-gray-900 truncate pr-3 group-hover:text-indigo-600 transition-colors" }, toDisplayString(project.title), 1),
                    createVNode("button", {
                      class: "flex w-9 h-9 items-center justify-center rounded-xl hover:bg-indigo-50 transition-all flex-shrink-0",
                      onClick: withModifiers(($event) => $options.saveProject($event, project), ["stop"])
                    }, [
                      !!project.star ? (openBlock(), createBlock(_component_icon, {
                        key: 0,
                        name: "star",
                        class: "w-5 h-5 fill-yellow-400 text-yellow-400"
                      })) : (openBlock(), createBlock(_component_icon, {
                        key: 1,
                        name: "star",
                        class: "w-5 h-5 text-gray-400 hover:text-yellow-400"
                      }))
                    ], 8, ["onClick"])
                  ]),
                  project.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed"
                  }, toDisplayString(project.description), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "flex items-center gap-4" }, [
                    createVNode("div", { class: "flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg" }, [
                      createVNode(_component_icon, {
                        name: "folder",
                        class: "w-4 h-4 text-indigo-600"
                      }),
                      createVNode("span", { class: "text-xs text-indigo-600 font-semibold" }, toDisplayString(_ctx.$t("Project")), 1)
                    ])
                  ])
                ]),
                createVNode("div", { class: "flex-shrink-0 p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors" }, [
                  createVNode(_component_icon, {
                    name: "arrow-right",
                    class: "w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform"
                  })
                ])
              ])
            ];
          }
        }),
        _: 2
      }, _parent));
    });
    _push(`<!--]-->`);
    if ($options.filteredProjects.length === 0 && $data.searchQuery) {
      _push(`<div class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"><div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "search",
        class: "w-10 h-10 text-gray-400"
      }, null, _parent));
      _push(`</div><h3 class="text-lg font-semibold text-gray-900 mb-2">${ssrInterpolate(_ctx.$t("No projects found"))}</h3><p class="text-gray-600 mb-6">${ssrInterpolate(_ctx.$t("Try adjusting your search or filters"))}</p><button class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "close",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`<span>${ssrInterpolate(_ctx.$t("Clear Search"))}</span></button></div>`);
    } else {
      _push(`<!---->`);
    }
    if (!$props.projects || $props.projects.length === 0) {
      _push(`<div class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"><div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "folder",
        class: "w-10 h-10 text-gray-400"
      }, null, _parent));
      _push(`</div><h3 class="text-lg font-semibold text-gray-900 mb-2">${ssrInterpolate(_ctx.$t("No projects yet"))}</h3><p class="text-gray-600 mb-6">${ssrInterpolate(_ctx.$t("Create your first project to get started"))}</p>`);
      if (!!this.$page.props.auth.user.role.create_project) {
        _push(`<button class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">`);
        _push(ssrRenderComponent(_component_icon, {
          name: "plus",
          class: "w-5 h-5 fill-white"
        }, null, _parent));
        _push(`<span>${ssrInterpolate(_ctx.$t("Create Project"))}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  }
  _push(`</div></div>`);
  if ($data.invite_workspace) {
    _push(ssrRenderComponent(_component_invite_workspace_member, {
      workspace: $props.workspace,
      onInviteMember: ($event) => $options.closeInviteMember(),
      top: "50px",
      right: "0px"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.delete_workspace_popup) {
    _push(ssrRenderComponent(_component_delete_confirmation, {
      onPopup: ($event) => $data.delete_workspace_popup = false,
      onConfirm: ($event) => $options.deleteWorkspace(),
      details: "Deleting workspace will delete all of the projects including board list. Are you sure you want to delete this workspace?"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/View.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const View = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  View as default
};
