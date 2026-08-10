import { I as Icon } from "./Layout-DXJEf-iu.js";
import { Link } from "@inertiajs/vue3";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "board-view-menu",
  props: {
    project: Object,
    filters: { required: false },
    view: {
      required: false
    }
  },
  components: { BoardFilter, Icon, Link },
  data() {
    return {
      icons: ["board", "calendar", "timeline", "table", "dashboard", "time"],
      options: [
        { name: "Board", slug: "board" },
        { name: "List", slug: "table" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "Report", slug: "dashboard" },
        { name: "Time Logs", slug: "time_logs" }
      ],
      position: { top: 0, left: 0, right: "inherit" }
    };
  },
  methods: {
    clearFilter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.$emit("fClear", true);
    },
    findFilters() {
      const filters = Object.keys(this.filters);
      return filters.some((r) => ["due", "label", "user"].includes(r));
    },
    saveListTitle(e, id) {
      if (e.keyCode === 13 || e.type === "blur") {
        e.preventDefault();
        e.target.blur();
        if (e.target.innerText) {
          const title = e.target.innerText;
          axios.post(this.route("project.update", id), { title }).then((response) => {
            if (response.data) {
              this.project.title = response.data.title;
              if (this.project.slug !== response.data.slug) {
                window.location.href = this.route("projects.view.board", response.data.slug || response.data.id);
              }
            }
          });
        }
      }
    },
    starProject(e, id) {
      e.preventDefault();
      axios.post(this.route("json.p.starred.save", id));
      this.project.star = !this.project.star;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_icon = resolveComponent("icon");
  const _component_Link = resolveComponent("Link");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "project__view__menu w-full p-2 text-sm flex justify-first items-center" }, _attrs))}><div class="inline-flex w-full flex-wrap items-center"><div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap"><h2${ssrRenderAttr("title", _ctx.$t("Click to rename project"))} class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1" contenteditable="true">${ssrInterpolate($props.project.title)}</h2><div class="flex p-2 items-center cursor-pointer rounded hover:bg-[#a6c5e229]">`);
  if (!!$props.project.star) {
    _push(ssrRenderComponent(_component_icon, {
      name: "star",
      class: "w-5 h-5 fill-yellow-500 text-yellow-500 hover:fill-none hover:scale-125"
    }, null, _parent));
  } else {
    _push(ssrRenderComponent(_component_icon, {
      name: "star",
      class: "w-5 h-5 text-white hover:text-yellow-500 hover:scale-125"
    }, null, _parent));
  }
  _push(`</div><!--[-->`);
  ssrRenderList($data.options, (option, option_index) => {
    _push(ssrRenderComponent(_component_Link, {
      class: ["flex py-2 px-3 items-center cursor-pointer capitalize rounded", { "active": $props.view === option.slug }],
      href: _ctx.route("projects.view." + option.slug, $props.project.slug || $props.project.id)
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
  if (["board", "table", "time_logs"].includes($props.view)) {
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
    _push(`<button class="flex px-2 h-8 items-center cursor-pointer capitalize rounded hover:bg-[#a6c5e229]">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "more-h",
      class: "w-6 fill-[#ffffff] h-6"
    }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/BoardViewMenu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const BoardViewMenu = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  BoardViewMenu as B
};
