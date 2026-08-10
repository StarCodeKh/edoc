import { I as Icon } from "./Layout-DXJEf-iu.js";
import { Link } from "@inertiajs/vue3";
import { resolveComponent, resolveDirective, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrGetDirectiveProps, ssrRenderTeleport, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "workspace-view-menu",
  props: {
    workspace: Object,
    filters: { required: false },
    view: {
      required: false
    }
  },
  components: { Icon, Link },
  data() {
    return {
      icons: ["board", "calendar", "timeline", "table"],
      options: [
        { name: "Board", slug: "board" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "List", slug: "table" }
      ],
      showMenu: false,
      dropdownPosition: { top: "0px", right: "0px" }
    };
  },
  computed: {
    dropdownStyle() {
      return this.dropdownPosition;
    }
  },
  watch: {
    showMenu(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.updateDropdownPosition();
        });
      }
    }
  },
  methods: {
    clearFilter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.$emit("fClear", true);
    },
    findFilters() {
      const filters = Object.keys(this.filters || {});
      return filters.some((r) => ["due", "label", "user", "project"].includes(r));
    },
    exportTasks() {
      this.showMenu = false;
      this.$emit("exportTasks");
    },
    showArchivedTasks() {
      this.showMenu = false;
      this.$emit("showArchived", "tasks");
    },
    showArchivedBoards() {
      this.showMenu = false;
      this.$emit("showArchived", "boards");
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
      if (this.showMenu) {
        this.$nextTick(() => {
          this.updateDropdownPosition();
        });
      }
    },
    updateDropdownPosition() {
      if (this.$refs.menuContainer) {
        const rect = this.$refs.menuContainer.getBoundingClientRect();
        this.dropdownPosition = {
          top: `${rect.bottom + 8}px`,
          right: `${window.innerWidth - rect.right}px`
        };
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _directive_click_outside = resolveDirective("click-outside");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "project__view__menu w-full p-2 text-sm flex justify-first items-center" }, _attrs))}><div class="inline-flex w-full flex-wrap items-center"><div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap"><h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">${ssrInterpolate($props.workspace.name)}</h2><!--[-->`);
  ssrRenderList($data.options, (option, option_index) => {
    _push(ssrRenderComponent(_component_Link, {
      class: ["flex py-2 px-3 items-center cursor-pointer capitalize rounded", { "active": $props.view === option.slug }],
      href: _ctx.route("workspace.view." + option.slug, $props.workspace.slug || $props.workspace.id)
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_icon, {
            name: $data.icons[option_index],
            class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
          }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate(_ctx.$t(option.name))}`);
        } else {
          return [
            createVNode(_component_icon, {
              name: $data.icons[option_index],
              class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
            }, null, 8, ["name"]),
            createTextVNode(" " + toDisplayString(_ctx.$t(option.name)), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]--></div><div class="flex items-center flex-start gap-1 ml-auto view__menus">`);
  if (["board", "table"].includes($props.view)) {
    _push(`<button class="${ssrRenderClass([{ "active": $options.findFilters() }, "flex pl-4 pr-2 items-center __filter cursor-pointer capitalize rounded hover:bg-[#a6c5e229]"])}">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "filter",
      class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
    }, null, _parent));
    _push(`<span>${ssrInterpolate(_ctx.$t("Filter"))}</span><span class="filter_clear">${ssrInterpolate(_ctx.$t("Clear All"))} `);
    _push(ssrRenderComponent(_component_icon, {
      name: "close",
      class: "w-4 h-4"
    }, null, _parent));
    _push(`</span></button>`);
  } else {
    _push(`<!---->`);
  }
  if (["board", "table"].includes($props.view)) {
    _push(`<div${ssrRenderAttrs(mergeProps({
      class: "relative",
      ref: "menuContainer"
    }, ssrGetDirectiveProps(_ctx, _directive_click_outside, () => $data.showMenu = false)))}><button class="${ssrRenderClass([{ "bg-[#a6c5e229]": $data.showMenu }, "flex px-2 h-8 items-center cursor-pointer capitalize rounded hover:bg-[#a6c5e229] transition-colors"])}">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "more-h",
      class: "w-6 fill-[#ffffff] h-6"
    }, null, _parent));
    _push(`</button>`);
    ssrRenderTeleport(_push, (_push2) => {
      if ($data.showMenu) {
        _push2(`<div class="fixed bg-white rounded-xl shadow-2xl border border-gray-200/60 overflow-hidden z-[99999] backdrop-blur-xl" style="${ssrRenderStyle($options.dropdownStyle)}"><div class="py-2 w-56"><button class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"><div class="p-1.5 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">`);
        _push2(ssrRenderComponent(_component_icon, {
          name: "download",
          class: "w-4 h-4 text-blue-600"
        }, null, _parent));
        _push2(`</div><span>${ssrInterpolate(_ctx.$t("Export Tasks"))}</span></button><button class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"><div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">`);
        _push2(ssrRenderComponent(_component_icon, {
          name: "archive",
          class: "w-4 h-4 text-orange-600"
        }, null, _parent));
        _push2(`</div><span>${ssrInterpolate(_ctx.$t("Archived Tasks"))}</span></button><button class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"><div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">`);
        _push2(ssrRenderComponent(_component_icon, {
          name: "archive",
          class: "w-4 h-4 text-orange-600"
        }, null, _parent));
        _push2(`</div><span>${ssrInterpolate(_ctx.$t("Archived Boards"))}</span></button></div></div>`);
      } else {
        _push2(`<!---->`);
      }
    }, "body", false, _parent);
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/WorkspaceViewMenu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const WorkspaceViewMenu = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  WorkspaceViewMenu as W
};
