import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon, a as CreateProject, b as InviteWorkspaceMember } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { B as BoardViewMenu } from "./BoardViewMenu-Bs_9IDcq.js";
import moment from "moment";
import { S as SearchInput } from "./SearchInput-Br3HcA23.js";
import mapValues from "lodash/mapValues.js";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, openBlock, createBlock, toDisplayString, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./BoardFilter-BGdXhQL5.js";
const _sfc_main = {
  components: {
    InviteWorkspaceMember,
    CreateProject,
    Head,
    Icon,
    Link,
    BoardViewMenu,
    Pagination,
    SearchInput
  },
  layout: Layout,
  props: {
    title: String,
    auth: Object,
    projects: Object,
    workspace: Object,
    team_members: Object,
    filters: Object
  },
  data() {
    return {
      invite_workspace: false,
      form: {
        search: ""
      }
    };
  },
  watch: {
    form: {
      deep: true,
      handler: throttle(function() {
        this.$inertia.get(this.route("workspace.members", this.workspace.slug || this.workspace.id), pickBy(this.form), { preserveState: true });
      }, 150)
    }
  },
  computed: {},
  created() {
    this.moment = moment;
  },
  methods: {
    reset() {
      this.form = mapValues(this.form, () => null);
    },
    closeInviteMember() {
      this.invite_workspace = false;
      this.reset();
    },
    deleteMember(member, index) {
      this.team_members.data.splice(index, 1);
      axios.post(this.route("json.workspace.member.add"), { workspace_id: this.workspace.id, user_id: member.user_id });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _component_pagination = resolveComponent("pagination");
  const _component_invite_workspace_member = resolveComponent("invite-workspace-member");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="flex workspace__members flex-col task__table h-[calc(100%-52px)] overflow-hidden overflow-y-auto"><div class="relative bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 text-white overflow-hidden"><div class="absolute inset-0 opacity-10"><div class="absolute inset-0" style="${ssrRenderStyle({ "background-image": "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", "background-size": "40px 40px", "animation": "patternMove 20s linear infinite" })}"></div></div><div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div><div class="relative min-w-full py-8 px-4 md:px-6 lg:px-8"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"><div class="flex items-center gap-5">`);
  _push(ssrRenderComponent(_component_Link, {
    href: _ctx.route("workspace.view", $props.workspace.slug || $props.workspace.id),
    class: "relative group"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.workspace.logo) {
          _push2(`<div class="logo has_bg flex justify-center items-center w-20 h-20 rounded-3xl text-white text-2xl shadow-2xl ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105" style="${ssrRenderStyle({ "background-image": "url(" + $props.workspace.logo + ")" })}"${_scopeId}></div>`);
        } else {
          _push2(`<div class="logo flex justify-center items-center w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-md text-white text-3xl font-bold shadow-2xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-105"${_scopeId}>${ssrInterpolate($props.workspace.name.charAt(0).toUpperCase())}</div>`);
        }
        _push2(`<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"${_scopeId}></div>`);
      } else {
        return [
          $props.workspace.logo ? (openBlock(), createBlock("div", {
            key: 0,
            class: "logo has_bg flex justify-center items-center w-20 h-20 rounded-3xl text-white text-2xl shadow-2xl ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105",
            style: { "background-image": "url(" + $props.workspace.logo + ")" }
          }, null, 4)) : (openBlock(), createBlock("div", {
            key: 1,
            class: "logo flex justify-center items-center w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-md text-white text-3xl font-bold shadow-2xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-105"
          }, toDisplayString($props.workspace.name.charAt(0).toUpperCase()), 1)),
          createVNode("div", { class: "absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg" })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<div class="flex flex-col gap-1"><h1 class="text-4xl font-extrabold text-white drop-shadow-lg">${ssrInterpolate(_ctx.$t("Team Members"))}</h1><p class="text-white/90 text-base mt-1">${ssrInterpolate($props.workspace.name)} ${ssrInterpolate(_ctx.$t("workspace"))}</p></div></div><div class="flex items-center gap-3">`);
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
  _push(`</div></div></div></div><div class="min-w-full py-8 align-middle md:px-4 lg:px-6 xl:px-8"><div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div class="flex items-center gap-4"><div class="p-3 bg-indigo-100 rounded-xl">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "users",
    class: "w-6 h-6 text-indigo-600"
  }, null, _parent));
  _push(`</div><div><h2 class="text-2xl font-extrabold text-gray-900">${ssrInterpolate(_ctx.$t("All Members"))}</h2><p class="text-sm text-gray-600 mt-1"><span class="font-semibold text-indigo-600">${ssrInterpolate($props.team_members.data.length)}</span><span class="text-gray-500">${ssrInterpolate(_ctx.$t("of"))}</span><span class="font-semibold">${ssrInterpolate($props.team_members.total || 0)}</span><span class="text-gray-500">${ssrInterpolate(_ctx.$t("member" + ($props.team_members.total !== 1 ? "s" : "")))}</span></p></div></div><div class="relative flex-1 sm:flex-initial sm:w-80"><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "search",
    class: "w-5 h-5 text-gray-400"
  }, null, _parent));
  _push(`</div><input${ssrRenderAttr("value", $data.form.search)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("Search members..."))} class="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white text-sm font-medium shadow-sm">`);
  if ($data.form.search) {
    _push(`<button class="absolute inset-y-0 right-0 flex items-center pr-4 hover:bg-gray-100 rounded-r-xl transition-colors">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "close",
      class: "w-4 h-4 text-gray-400 hover:text-gray-600"
    }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
  if ($props.team_members.data.length > 0) {
    _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6"><!--[-->`);
    ssrRenderList($props.team_members.data, (member, member_index) => {
      _push(`<div class="bg-white rounded-2xl shadow-lg border-2 border-gray-200/60 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1" style="${ssrRenderStyle({ animationDelay: member_index * 50 + "ms" })}"><div class="p-6"><div class="flex items-start justify-between mb-4"><div class="relative">`);
      if (member.photo) {
        _push(`<div class="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all shadow-lg"><img class="h-full w-full object-cover"${ssrRenderAttr("src", member.photo)}${ssrRenderAttr("alt", member.name)}></div>`);
      } else {
        _push(`<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all shadow-lg">${ssrInterpolate(member.name.charAt(0).toUpperCase())}</div>`);
      }
      if (member.role === "admin") {
        _push(`<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_icon, {
          name: "star",
          class: "w-3 h-3 fill-yellow-600 text-yellow-600"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if ($props.workspace.member.id !== member.id && $props.workspace.member.role === "admin") {
        _push(`<button class="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100">`);
        _push(ssrRenderComponent(_component_icon, {
          name: "trash",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mb-4"><h3 class="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">${ssrInterpolate(member.name)}</h3><div class="flex items-center gap-2"><span class="${ssrRenderClass([{
        "bg-indigo-100 text-indigo-700": member.role === "admin",
        "bg-purple-100 text-purple-700": member.role === "member",
        "bg-gray-100 text-gray-700": !member.role || member.role !== "admin" && member.role !== "member"
      }, "inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold capitalize"])}">`);
      _push(ssrRenderComponent(_component_icon, {
        name: member.role === "admin" ? "shield" : "user",
        class: ["w-3 h-3 mr-1.5", {
          "text-indigo-600": member.role === "admin",
          "text-purple-600": member.role === "member",
          "text-gray-600": !member.role || member.role !== "admin" && member.role !== "member"
        }]
      }, null, _parent));
      _push(` ${ssrInterpolate(member.role || "Member")}</span></div></div><div class="pt-4 border-t border-gray-200"><div class="flex items-center gap-2 text-sm text-gray-600">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "clock",
        class: "w-4 h-4 text-gray-400"
      }, null, _parent));
      _push(`<span class="font-medium">${ssrInterpolate(_ctx.moment(member.created_at).format("MMM D, YYYY"))}</span></div></div></div></div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<div class="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl border-2 border-dashed border-indigo-300 p-16 text-center shadow-lg"><div class="relative inline-block mb-6"><div class="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center shadow-lg">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "users",
      class: "w-12 h-12 text-indigo-500"
    }, null, _parent));
    _push(`</div><div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full border-4 border-white shadow-lg animate-bounce"></div></div><h3 class="text-3xl font-extrabold text-gray-900 mb-3">${ssrInterpolate(_ctx.$t("No members found"))}</h3><p class="text-gray-600 mb-8 text-lg max-w-md mx-auto">`);
    if ($data.form.search) {
      _push(`<span>${ssrInterpolate(_ctx.$t("Try adjusting your search to find members"))}</span>`);
    } else {
      _push(`<span>${ssrInterpolate(_ctx.$t("Invite team members to collaborate on this workspace"))}</span>`);
    }
    _push(`</p>`);
    if ($props.workspace.member.role === "admin" && !$data.form.search) {
      _push(`<button class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "user_plus",
        class: "w-6 h-6 fill-white"
      }, null, _parent));
      _push(`<span class="text-lg">${ssrInterpolate(_ctx.$t("Invite Members"))}</span></button>`);
    } else if ($data.form.search) {
      _push(`<button class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">`);
      _push(ssrRenderComponent(_component_icon, {
        name: "close",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`<span class="text-lg">${ssrInterpolate(_ctx.$t("Clear Search"))}</span></button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  }
  if ($props.team_members.data.length > 0) {
    _push(`<div class="flex justify-center mt-8"><div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-4">`);
    _push(ssrRenderComponent(_component_pagination, {
      links: $props.team_members.links
    }, null, _parent));
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
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
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/Members.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Members = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Members as default
};
