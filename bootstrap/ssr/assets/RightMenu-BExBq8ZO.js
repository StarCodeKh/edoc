import { I as Icon, S as SelectInput } from "./Layout-DXJEf-iu.js";
import { Link } from "@inertiajs/vue3";
import moment from "moment";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import axios from "axios";
import { D as DeleteConfirmation } from "./DeleteConfirmation-HVTZH6_Z.js";
import { resolveComponent, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderClass } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {
  name: "right-menu",
  props: {
    project: Object,
    top: { required: false, default: "45px" },
    left: { required: false, default: "inherit" },
    right: { required: false, default: 0 }
  },
  emits: {
    openTask: null,
    menuToggle: null
  },
  components: { DeleteConfirmation, TaskDetails, SelectInput, Icon, Link },
  data() {
    return {
      enable_options: { tasks: false, boards: false, workspaces: false, backgrounds: false, visibility: false },
      show_back_button: false,
      upload_project_bg: null,
      delete_project_confirmation: false,
      selected_workspace: this.project.workspace_id,
      selected_background: this.project.background,
      menu_data: { tasks: [], boards: [], workspaces: [], backgrounds: [] }
    };
  },
  methods: {
    projectBgChange(e) {
      if (e.target.files.length) {
        this.upload_project_bg = e.target.files[0];
      }
    },
    async uploadBackground(e) {
      e.preventDefault();
      if (!this.upload_project_bg) {
        return;
      }
      if (this.upload_project_bg.size / 1024 / 1024 > 2) {
        alert("Uploading file size less than 2MB is not allowed in the demo mode!");
        return;
      }
      let formData = new FormData();
      formData.append("file", this.upload_project_bg);
      const resp = await axios.post(this.route("project.background.upload", this.project.id), formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (resp.data && resp.data.image) {
        const bg_resp = await axios.post(this.route("project.background.update", this.project.id), { background_id: resp.data.id });
        if (bg_resp && bg_resp.data) {
          this.project.background = bg_resp.data;
          if (this.$page.props.project) {
            this.$page.props.project.background = bg_resp.data;
            this.upload_project_bg = null;
            this.$refs.projectBgUpload.value = null;
          }
        }
      }
    },
    changeBackground(background) {
      this.selected_background = background;
      this.project.background = background;
      axios.post(this.route("project.background.update", this.project.id), { background_id: background.id, color: null });
      if (this.$page.props.project) {
        this.$page.props.project.background = background;
      }
    },
    async changeProjectVisibility(is_private) {
      await axios.post(this.route("project.update", this.project.id), { is_private });
      window.location.href = this.route("projects.view.board", this.project.slug || this.project.id);
    },
    deleteProject() {
      this.delete_project_confirmation = false;
      this.$emit("menuToggle");
      this.$inertia.delete(this.route("project.destroy", this.project.id));
    },
    goBack() {
      const options = this.enable_options;
      Object.keys(options).forEach(function(key) {
        options[key] = false;
      });
      this.show_back_button = false;
    },
    showItems(type) {
      this.enable_options[type] = true;
      this.show_back_button = true;
      if (type !== "visibility") {
        this.getItem(type);
      }
    },
    async getItem(type) {
      const archiveData = await axios.get(this.route("json.menu_data." + type, this.project.id));
      this.menu_data[type] = archiveData.data;
    },
    async sendToBoard(id) {
      await axios.post(this.route("json.board.remove.archive", id));
      await this.getItem("boards");
    },
    async changeWorkSpace(workspace_id) {
      await axios.post(this.route("json.workspace.change"), { workspace_id, project_id: this.project.id });
      window.location.href = this.route("projects.view.board", this.project.slug || this.project.id);
    }
  },
  created() {
    this.moment = moment;
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_icon = resolveComponent("icon");
  const _component_Link = resolveComponent("Link");
  const _component_select_input = resolveComponent("select-input");
  const _component_delete_confirmation = resolveComponent("delete-confirmation");
  _push(`<!--[--><div class="right__menu fixed w-[320px] z-[200] h-[calc(100vh-45px)] shadow-2xl text-sm bg-white overflow-hidden rounded-l-2xl border-l border-gray-200/60 backdrop-blur-xl flex flex-col" style="${ssrRenderStyle({ top: $props.top, left: $props.left, right: $props.right })}" data-v-6a138818><div class="relative bg-gradient-to-r from-white via-gray-50/50 to-white border-b border-gray-200/60" data-v-6a138818><div class="flex items-center justify-between px-6 py-4" data-v-6a138818><div class="flex items-center space-x-3" data-v-6a138818>`);
  if ($data.show_back_button) {
    _push(`<div class="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "arrow-left",
      class: "w-5 h-5 text-gray-600 group-hover:text-gray-900"
    }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="flex items-center space-x-2" data-v-6a138818><div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl" data-v-6a138818>`);
  _push(ssrRenderComponent(_component_icon, {
    name: "menu",
    class: "w-5 h-5 text-white"
  }, null, _parent));
  _push(`</div><h2 class="text-lg font-bold text-gray-900" data-v-6a138818>${ssrInterpolate(_ctx.$t("Menu"))}</h2></div></div><button class="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group" data-v-6a138818>`);
  _push(ssrRenderComponent(_component_icon, {
    class: "w-5 h-5 text-gray-600 group-hover:text-gray-900",
    name: "close"
  }, null, _parent));
  _push(`</button></div></div>`);
  if (!$data.show_back_button) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4 space-y-2" data-v-6a138818><div class="space-y-1" data-v-6a138818><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2" data-v-6a138818>Archive</h3><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "archive",
      class: "w-4 h-4 text-orange-600"
    }, null, _parent));
    _push(`</div> ${ssrInterpolate(_ctx.$t("Archived Tasks"))}</button><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "archive",
      class: "w-4 h-4 text-orange-600"
    }, null, _parent));
    _push(`</div> ${ssrInterpolate(_ctx.$t("Archived Board Items"))}</button></div>`);
    if (_ctx.$page.props.auth.user.role.slug === "admin") {
      _push(`<div class="space-y-1" data-v-6a138818><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2" data-v-6a138818>Export</h3><a${ssrRenderAttr("href", "/project/csv/export/" + $props.project.id)} class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors" data-v-6a138818><img class="w-4 h-4" src="/images/svg/csv.svg" alt="Export CSV" data-v-6a138818></div> ${ssrInterpolate(_ctx.$t("Export tasks as CSV"))}</a><a${ssrRenderAttr("href", "/project/excel/export/" + $props.project.id)} class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors" data-v-6a138818><img class="w-4 h-4" src="/images/svg/excel.svg" alt="Export Excel" data-v-6a138818></div> ${ssrInterpolate(_ctx.$t("Export tasks as Excel"))}</a></div>`);
    } else {
      _push(`<!---->`);
    }
    if (_ctx.$page.props.auth.user.role.slug === "admin") {
      _push(`<div class="space-y-1" data-v-6a138818><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2" data-v-6a138818>Project Settings</h3><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors" data-v-6a138818><span class="icon w-4 h-4 rounded" style="${ssrRenderStyle([$props.project && $props.project.background ? { backgroundImage: "url(" + $props.project.background.image + ")" } : { backgroundColor: "#6366f1" }])}" data-v-6a138818></span></div> ${ssrInterpolate(_ctx.$t("Change Background"))}</button><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "gear",
        class: "w-4 h-4 text-blue-600"
      }, null, _parent));
      _push(`</div> ${ssrInterpolate(_ctx.$t("Change Workspace"))}</button><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-indigo-100 rounded-lg mr-3 group-hover:bg-indigo-200 transition-colors" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "display",
        class: "w-4 h-4 text-indigo-600"
      }, null, _parent));
      _push(`</div> ${ssrInterpolate(_ctx.$t("Change Task Visibility"))}</button></div>`);
    } else {
      _push(`<!---->`);
    }
    if (_ctx.$page.props.auth.user.role.slug === "admin") {
      _push(`<div class="space-y-1" data-v-6a138818><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2" data-v-6a138818>Danger Zone</h3><button class="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group" data-v-6a138818><div class="p-1.5 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "trash",
        class: "w-4 h-4 text-red-600"
      }, null, _parent));
      _push(`</div> ${ssrInterpolate(_ctx.$t("Delete Project"))}</button></div>`);
    } else {
      _push(`<!---->`);
    }
    if (_ctx.$page.props.auth.user.role.slug === "admin") {
      _push(`<div class="space-y-1" data-v-6a138818><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2" data-v-6a138818>System</h3>`);
      _push(ssrRenderComponent(_component_Link, {
        href: _ctx.route("global"),
        class: "w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors" data-v-6a138818${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "settings",
              class: "w-4 h-4 text-gray-600"
            }, null, _parent2, _scopeId));
            _push2(`</div> ${ssrInterpolate(_ctx.$t("Global Settings"))}`);
          } else {
            return [
              createVNode("div", { class: "p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors" }, [
                createVNode(_component_icon, {
                  name: "settings",
                  class: "w-4 h-4 text-gray-600"
                })
              ]),
              createTextVNode(" " + toDisplayString(_ctx.$t("Global Settings")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.enable_options["tasks"]) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4" data-v-6a138818><div class="flex items-center justify-between mb-4" data-v-6a138818><h3 class="text-lg font-semibold text-gray-900" data-v-6a138818>${ssrInterpolate(_ctx.$t("Archived Tasks"))}</h3><div class="text-sm text-gray-500" data-v-6a138818>${ssrInterpolate($data.menu_data.tasks.length)} ${ssrInterpolate(_ctx.$t("tasks"))}</div></div>`);
    if ($data.menu_data.tasks.length) {
      _push(`<div class="space-y-3" data-v-6a138818><!--[-->`);
      ssrRenderList($data.menu_data.tasks, (element) => {
        _push(`<div${ssrRenderAttr("data-id", element.id)} class="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 group hover:border-gray-300" draggable="true" data-v-6a138818><h4 class="text-sm font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors" data-v-6a138818>${ssrInterpolate(element.title)}</h4><div class="flex flex-wrap items-center gap-2 text-xs" data-v-6a138818>`);
        if (element.due_date) {
          _push(`<div class="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full" data-v-6a138818>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-3 h-3 mr-1",
            name: "time"
          }, null, _parent));
          _push(` ${ssrInterpolate(_ctx.moment(element.due_date).format("MMM D"))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (element.description) {
          _push(`<div class="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full" data-v-6a138818>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-3 h-3 mr-1",
            name: "details"
          }, null, _parent));
          _push(` Description </div>`);
        } else {
          _push(`<!---->`);
        }
        if (element.comments_count) {
          _push(`<div class="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full" data-v-6a138818>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-3 h-3 mr-1",
            name: "comment"
          }, null, _parent));
          _push(` ${ssrInterpolate(element.comments_count)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (element.attachments_count) {
          _push(`<div class="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full" data-v-6a138818>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-3 h-3 mr-1",
            name: "attachment"
          }, null, _parent));
          _push(` ${ssrInterpolate(element.attachments_count)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (element.checklists_count) {
          _push(`<div class="flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full" data-v-6a138818>`);
          _push(ssrRenderComponent(_component_icon, {
            class: "w-3 h-3 mr-1",
            name: "checklist"
          }, null, _parent));
          _push(` ${ssrInterpolate(element.checklist_done_count + "/" + element.checklists_count)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div>`);
    } else {
      _push(`<div class="text-center py-8" data-v-6a138818><div class="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "archive",
        class: "w-6 h-6 text-gray-400"
      }, null, _parent));
      _push(`</div><p class="text-gray-500 text-sm" data-v-6a138818>${ssrInterpolate(_ctx.$t("No archived tasks found"))}</p></div>`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.enable_options["boards"]) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4" data-v-6a138818><div class="flex items-center justify-between mb-4" data-v-6a138818><h3 class="text-lg font-semibold text-gray-900" data-v-6a138818>${ssrInterpolate(_ctx.$t("Archived Board Items"))}</h3><div class="text-sm text-gray-500" data-v-6a138818>${ssrInterpolate($data.menu_data.boards.length)} ${ssrInterpolate(_ctx.$t("items"))}</div></div>`);
    if ($data.menu_data.boards.length) {
      _push(`<div class="space-y-3" data-v-6a138818><!--[-->`);
      ssrRenderList($data.menu_data.boards, (list) => {
        _push(`<div class="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200" data-v-6a138818><div class="flex items-center justify-between" data-v-6a138818><div class="flex items-center space-x-3" data-v-6a138818><div class="p-2 bg-orange-100 rounded-lg" data-v-6a138818>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "archive",
          class: "w-4 h-4 text-orange-600"
        }, null, _parent));
        _push(`</div><div data-v-6a138818><h4 class="text-sm font-semibold text-gray-900" data-v-6a138818>${ssrInterpolate(list.title)}</h4><p class="text-xs text-gray-500" data-v-6a138818>Archived board item</p></div></div><button class="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200" data-v-6a138818>`);
        _push(ssrRenderComponent(_component_icon, {
          class: "w-4 h-4 mr-2",
          name: "undo"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Restore"))}</button></div></div>`);
      });
      _push(`<!--]--></div>`);
    } else {
      _push(`<div class="text-center py-8" data-v-6a138818><div class="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "archive",
        class: "w-6 h-6 text-gray-400"
      }, null, _parent));
      _push(`</div><p class="text-gray-500 text-sm" data-v-6a138818>${ssrInterpolate(_ctx.$t("No archived board items found"))}</p></div>`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.enable_options["workspaces"]) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4" data-v-6a138818><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-6a138818>${ssrInterpolate(_ctx.$t("Change Workspace"))}</h3><div class="space-y-4" data-v-6a138818><div data-v-6a138818><label class="block text-sm font-medium text-gray-700 mb-2" data-v-6a138818>${ssrInterpolate(_ctx.$t("Select a workspace"))}</label>`);
    _push(ssrRenderComponent(_component_select_input, {
      modelValue: $data.selected_workspace,
      "onUpdate:modelValue": ($event) => $data.selected_workspace = $event,
      class: "w-full"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<option${ssrRenderAttr("value", null)} data-v-6a138818${_scopeId}>${ssrInterpolate(_ctx.$t("Select a workspace"))}</option><!--[-->`);
          ssrRenderList($data.menu_data["workspaces"], (workspace, wi) => {
            _push2(`<option${ssrRenderAttr("value", workspace.id)} data-v-6a138818${_scopeId}>${ssrInterpolate(workspace.name)}</option>`);
          });
          _push2(`<!--]-->`);
        } else {
          return [
            createVNode("option", { value: null }, toDisplayString(_ctx.$t("Select a workspace")), 1),
            (openBlock(true), createBlock(Fragment, null, renderList($data.menu_data["workspaces"], (workspace, wi) => {
              return openBlock(), createBlock("option", {
                key: wi,
                value: workspace.id
              }, toDisplayString(workspace.name), 9, ["value"]);
            }), 128))
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div><button class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "save",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Save Changes"))}</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.enable_options["visibility"]) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4" data-v-6a138818><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-6a138818>${ssrInterpolate(_ctx.$t("Task Visibility"))}</h3><div class="space-y-4" data-v-6a138818><div class="p-4 bg-gray-50 rounded-xl" data-v-6a138818><div class="flex items-start space-x-3" data-v-6a138818><div class="flex items-center h-5 mt-0.5" data-v-6a138818><input id="helper-checkbox"${ssrIncludeBooleanAttr(ssrLooseEqual($props.project.is_private, "1")) ? " checked" : ""} aria-describedby="helper-checkbox-text" type="checkbox" class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2" data-v-6a138818></div><div class="flex-1" data-v-6a138818><label for="helper-checkbox" class="text-sm font-medium text-gray-900" data-v-6a138818>${ssrInterpolate(_ctx.$t("Visible tasks only for the assigned people."))}</label><p id="helper-checkbox-text" class="text-xs text-gray-500 mt-1" data-v-6a138818>${ssrInterpolate(_ctx.$t("Enabling this the tasks will be visible only for the admin and assigned people"))}</p></div></div></div><button class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "save",
      class: "w-4 h-4 mr-2"
    }, null, _parent));
    _push(` ${ssrInterpolate(_ctx.$t("Save Changes"))}</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.enable_options["backgrounds"]) {
    _push(`<div class="flex-1 overflow-y-auto min-h-0" data-v-6a138818><div class="p-4" data-v-6a138818><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-6a138818>${ssrInterpolate(_ctx.$t("Change Background"))}</h3><div class="mb-6" data-v-6a138818><label class="block text-sm font-medium text-gray-700 mb-3" data-v-6a138818>${ssrInterpolate(_ctx.$t("Choose a background"))}</label><div class="grid grid-cols-4 gap-3" data-v-6a138818><!--[-->`);
    ssrRenderList($data.menu_data["backgrounds"], (color) => {
      _push(`<button class="${ssrRenderClass([$data.selected_background && $data.selected_background.id === color.id ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200 hover:border-gray-300", "relative w-full h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-105"])}" style="${ssrRenderStyle({ backgroundImage: "url(" + color.image + ")", backgroundColor: color.bg })}" data-v-6a138818>`);
      if ($data.selected_background && $data.selected_background.id === color.id) {
        _push(`<div class="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center" data-v-6a138818>`);
        _push(ssrRenderComponent(_component_icon, {
          name: "tick_check",
          class: "text-white w-5 h-5"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
    });
    _push(`<!--]--></div></div><div class="border-t border-gray-200 pt-6" data-v-6a138818><label class="block text-sm font-medium text-gray-700 mb-3" data-v-6a138818>${ssrInterpolate(_ctx.$t("Upload custom background"))}</label><div class="space-y-3" data-v-6a138818><div class="relative" data-v-6a138818><input id="projectBgUpload" class="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" type="file" accept="image/*" data-v-6a138818><div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" data-v-6a138818>`);
    _push(ssrRenderComponent(_component_icon, {
      name: "upload",
      class: "w-4 h-4 text-gray-400"
    }, null, _parent));
    _push(`</div></div><p class="text-xs text-gray-500" data-v-6a138818>${ssrInterpolate(_ctx.$t("SVG, PNG, JPG or GIF (MAX. 2MB)"))}</p>`);
    if ($data.upload_project_bg) {
      _push(`<button class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl" data-v-6a138818>`);
      _push(ssrRenderComponent(_component_icon, {
        name: "upload",
        class: "w-4 h-4 mr-2"
      }, null, _parent));
      _push(` ${ssrInterpolate(_ctx.$t("Upload Background"))}</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($data.delete_project_confirmation) {
    _push(ssrRenderComponent(_component_delete_confirmation, {
      onPopup: ($event) => $data.delete_project_confirmation = false,
      onConfirm: ($event) => $options.deleteProject(),
      details: "Deleting project will delete all of the tasks including board list. Are you sure you want to delete this project?"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Shared/RightMenu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RightMenu = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-6a138818"]]);
export {
  RightMenu as R
};
