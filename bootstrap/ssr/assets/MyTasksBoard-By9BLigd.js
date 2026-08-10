import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import draggable from "vuedraggable";
import moment from "moment";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";
import "lodash/mapValues.js";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, withDirectives, vModelText, vShow, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
const _sfc_main = {
  metaInfo: { title: "Dashboard" },
  components: { BoardFilter, Head, Icon, Link, draggable, TaskDetails },
  layout: Layout,
  props: {
    auth: Object,
    title: String,
    tasks: Object,
    workspace: Object,
    list_index: Object,
    filters: Object,
    board_lists: {
      required: false
    },
    task: {
      required: false
    }
  },
  remember: "form",
  data() {
    var _a, _b, _c, _d, _e;
    return {
      errors: [],
      loading: false,
      show_right_menu: false,
      new_list_open: false,
      td_pop: false,
      showLabelName: false,
      firstResponse: [],
      lastResponse: [],
      new_task: {},
      new_list: { project_id: null },
      taskDetailsOpen: false,
      activeTimerString: "",
      months: [],
      counter: { seconds: 0, timer: this.timer },
      drag: false,
      new_task_open: false,
      taskDetailsId: "",
      open_filter: false,
      workspaceProjects: [],
      currentView: "board",
      viewOptions: [
        { name: "Board", slug: "board" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "List", slug: "table" }
      ],
      viewIcons: ["board", "calendar", "timeline", "table"],
      form: {
        user: ((_b = (_a = this.$page.props.auth) == null ? void 0 : _a.user) == null ? void 0 : _b.id) || null,
        // Always filter by current user
        due: ((_c = this.filters) == null ? void 0 : _c.due) || null,
        label: ((_d = this.filters) == null ? void 0 : _d.label) || null,
        task: ((_e = this.filters) == null ? void 0 : _e.task) ?? null
      }
    };
  },
  watch: {
    form: {
      deep: true,
      handler: throttle(function() {
        const filters = { ...pickBy(this.form), user: this.$page.props.auth.user.id };
        this.$inertia.get(this.route("workspace.view.my-tasks.board", this.workspace.slug || this.workspace.id), filters, { preserveState: true });
      }, 150)
    }
  },
  created() {
    this.moment = moment;
    const url = this.$page.url || "";
    if (url.includes("/my-tasks/board")) this.currentView = "board";
    else if (url.includes("/my-tasks/calendar")) this.currentView = "calendar";
    else if (url.includes("/my-tasks/timeline")) this.currentView = "timeline";
    else if (url.includes("/my-tasks/table") || url.includes("/my-tasks")) this.currentView = "table";
    if (this.task) {
      this.taskDetailsId = this.task.slug || this.task.id;
      this.taskDetailsOpen = true;
    }
    if (!!this.filters.task) {
      this.taskDetailsPopup(this.filters.task);
    }
    this.loadWorkspaceProjects();
  },
  methods: {
    cardSwitchClick(e) {
      e.stopPropagation();
    },
    cardSwitchToggle(element, e) {
      e.preventDefault();
      e.stopPropagation();
      this.saveTask(element.id, { is_done: e.target.checked });
    },
    getDoneCount(list) {
      return list.tasks.filter((t) => !!t.is_done).length;
    },
    getDue(element) {
      return element.is_done ? "done" : moment().isAfter(element.due_date) ? "over_due" : moment(element.due_date).isBetween(moment(), moment().add(1, "day")) ? "due_soon" : "";
    },
    openNewTask(listItem) {
      for (let n = 0; n < this.lists.length; n++) {
        if (!!this.lists[n].new_task_open) {
          this.lists[n].new_task_open = false;
        }
      }
      listItem.new_task_open = true;
      this.new_task.title = "";
      this.setFocus(this.$refs["new_task_input_" + listItem.id][0]);
    },
    sendNotification(uri, id, user_id) {
      const data = { id };
      if (!!user_id) {
        data.user_id = user_id;
      }
      axios.post(this.route(uri, data)).catch((error) => {
        console.log(error);
      });
    },
    openNewList() {
      this.new_list.title = "";
      this.new_list.project_id = null;
      this.new_list_open = true;
      this.setFocus(this.$refs["new_list_input_" + this.lists.length]);
    },
    setFocus(ref) {
      setTimeout(function() {
        if (ref) {
          ref.focus();
        }
      }, 10);
    },
    closeDetails() {
      this.form.task = null;
      this.taskDetailsOpen = false;
    },
    reset() {
      this.form = {
        user: this.$page.props.auth.user.id,
        // Always keep user filter
        due: null,
        label: null,
        task: null
      };
    },
    findFilters() {
      const filters = Object.keys(this.filters || {});
      return filters.some((r) => ["due", "label"].includes(r));
    },
    clearFilter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.reset();
      this.$inertia.get(this.route("workspace.view.my-tasks.board", this.workspace.slug || this.workspace.id), { user: this.$page.props.auth.user.id }, { preserveState: true });
    },
    doFilter(form) {
      Object.assign(this.form, form);
    },
    loadWorkspaceProjects() {
      axios.get(this.route("json.projects.all", this.workspace.id)).then((response) => {
        if (response.data) {
          this.workspaceProjects = response.data;
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    submitNewList(e) {
      e.preventDefault();
      if (this.new_list.title && this.new_list.project_id) {
        axios.post(this.route("json.list.add"), { project_id: this.new_list.project_id, order: this.lists.length, title: this.new_list.title }).then((response) => {
          if (response.data) {
            const listItem = response.data;
            listItem.tasks = [];
            this.lists.push(listItem);
            this.openNewList();
          }
        });
      } else {
        this.new_list_open = false;
      }
    },
    async moveList(index, position) {
      position = position === "minus" ? index - 1 : index + 1;
      const lists = this.lists.map((l) => l.order);
      const newList = this.array_move(lists, index, position);
      let listObject = [];
      let i = 0, len = this.lists.length;
      while (i < len) {
        this.lists[i].order = newList[i];
        listObject.push({ id: this.lists[i].id, order: newList[i] });
        i++;
      }
      this.lists.sort((a, b) => a.order - b.order);
      await axios.post(this.route("json.list.order"), listObject);
    },
    array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
          arr.push(void 0);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    },
    makeListArchive(e, id, index) {
      e.preventDefault();
      const listItem = this.lists[index];
      if (listItem && listItem.list_ids && listItem.list_ids.length > 1) {
        Promise.all(listItem.list_ids.map(
          (listId) => axios.post(this.route("json.list.archive", listId))
        )).then(() => {
          this.lists.splice(index, 1);
        }).catch((error) => {
          console.log(error);
        });
      } else {
        axios.post(this.route("json.list.archive", id)).then((response) => {
          if (response.data) {
            this.lists.splice(index, 1);
          }
        });
      }
    },
    makeArchive(e, id, tasks, index) {
      e.preventDefault();
      e.stopPropagation();
      this.saveTask(id, { is_archive: 1 });
      tasks.splice(index, 1);
    },
    visibleShowMore(e, element) {
      e.preventDefault();
      e.stopPropagation();
      element.show_more = !!element.show_more ? false : true;
    },
    visibleLabel(e) {
      e.preventDefault();
      e.stopPropagation();
      this.showLabelName = !this.showLabelName;
    },
    saveListTitle(e, board_id) {
      if (e.keyCode === 13 || e.type === "blur") {
        e.preventDefault();
        e.target.blur();
        if (e.target.innerText) {
          const title = e.target.innerText;
          this.changeBoardTitle(board_id, title);
        }
      }
    },
    changeBoardTitle(id, title) {
      const listItem = this.lists.find((l) => l.id === id);
      if (listItem && listItem.list_ids && listItem.list_ids.length > 1) {
        Promise.all(listItem.list_ids.map(
          (listId) => axios.post(this.route("board.update", listId), { title })
        )).then(() => {
          listItem.title = title;
        }).catch((error) => {
          console.log(error);
        });
      } else {
        axios.post(this.route("board.update", id), { title }).then((response) => {
          if (response.data) {
            this.sendNotification("send.mail.board_update", id);
            const listItem2 = this.lists.find((l) => l.id === id);
            if (listItem2) listItem2.title = title;
          }
        }).catch((error) => {
          console.log(error);
        });
      }
    },
    afterDrop(e) {
      const new_list = this.newSortedItems(e, "to");
      let previous_list = [];
      if (!!e.pullMode) {
        previous_list = this.newSortedItems(e, "from");
        const targetListId = e.to.dataset.id;
        const targetList = this.lists.find((l) => l.id == targetListId);
        const actualListId = targetList && targetList.list_ids && targetList.list_ids.length > 0 ? targetList.list_ids[0] : targetListId;
        this.saveTask(e.item.dataset.id, { list_id: actualListId });
      }
      const list_items = new_list.concat(previous_list);
      this.saveOrder(list_items);
    },
    newSortedItems(e, selector) {
      const lists = e[selector].getElementsByClassName("t__box");
      const newOrder = [];
      for (let i = 0; i < lists.length; i++) {
        newOrder.push({ id: lists[i].dataset.id, order: i + 1 });
      }
      return newOrder;
    },
    updateTaskEntry(taskId, newData) {
      for (const list of this.lists) {
        const task = list.tasks.find((t) => t.id === taskId);
        if (task) {
          Object.assign(task, newData);
          return task;
        }
      }
      return null;
    },
    saveTask(id, taskObject) {
      axios.post(this.route("task.update", id), taskObject).then((response) => {
        this.updateTaskEntry(id, taskObject);
      }).catch((error) => {
        console.log(error);
      });
    },
    saveOrder(taskObject) {
      axios.post(this.route("task.update.order"), taskObject).catch((error) => {
        console.log(error);
      });
    },
    submitNewTask(listItem, listIndex) {
      if (this.new_task.title) {
        const projectId = listItem.project_id;
        const actualListId = listItem.list_ids && listItem.list_ids.length > 0 ? listItem.list_ids[0] : listItem.id;
        let task = { title: this.new_task.title, project_id: projectId, list_id: actualListId, order: listItem.tasks.length + 1 };
        this.saveNewTask(task, listIndex);
        this.openNewTask(listItem);
      } else {
        listItem.new_task_open = false;
      }
    },
    saveNewTask(taskObject, listIndex) {
      const tasks = this.lists[listIndex].tasks;
      axios.post(this.route("task.new"), taskObject).then((response) => {
        if (response && response.data) {
          tasks.push(response.data);
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    taskDetailsPopup(id) {
      this.form.task = id;
      this.td_pop = true;
      this.taskDetailsId = id;
      this.taskDetailsOpen = true;
    }
  },
  computed: {
    lists() {
      return this.board_lists || [];
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _component_board_filter = resolveComponent("board-filter");
  const _component_draggable = resolveComponent("draggable");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["h-full", { "right_menu_enable": $data.show_right_menu }]
  }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="project__view__menu w-full p-2 text-sm flex justify-first items-center"><div class="inline-flex w-full flex-wrap items-center"><div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap"><h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">${ssrInterpolate($props.workspace.name)}</h2><!--[-->`);
  ssrRenderList($data.viewOptions, (option, option_index) => {
    _push(ssrRenderComponent(_component_Link, {
      class: ["flex py-2 px-3 items-center cursor-pointer capitalize rounded", { "active": $data.currentView === option.slug }],
      href: _ctx.route("workspace.view.my-tasks." + option.slug, $props.workspace.slug || $props.workspace.id)
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_icon, {
            name: $data.viewIcons[option_index],
            class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
          }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate(_ctx.$t(option.name))}`);
        } else {
          return [
            createVNode(_component_icon, {
              name: $data.viewIcons[option_index],
              class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
            }, null, 8, ["name"]),
            createTextVNode(" " + toDisplayString(_ctx.$t(option.name)), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]--></div><div class="flex items-center flex-start gap-1 ml-auto view__menus"><button class="${ssrRenderClass([{ "active": $options.findFilters() }, "flex pl-4 pr-2 items-center __filter cursor-pointer capitalize rounded hover:bg-[#a6c5e229]"])}">`);
  _push(ssrRenderComponent(_component_icon, {
    name: "filter",
    class: "w-4 fill-[#ffffff] h-4 mr-[5px]"
  }, null, _parent));
  _push(`<span>${ssrInterpolate(_ctx.$t("Filter"))}</span><span class="filter_clear">${ssrInterpolate(_ctx.$t("Clear All"))} `);
  _push(ssrRenderComponent(_component_icon, {
    name: "close",
    class: "w-4 h-4"
  }, null, _parent));
  _push(`</span></button></div></div></div>`);
  if ($data.open_filter) {
    _push(ssrRenderComponent(_component_board_filter, {
      workspace: $props.workspace,
      onBoardFilter: ($event) => $data.open_filter = false,
      filters: $props.filters,
      onDoFilter: $options.doFilter,
      options: "due,label"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="task_board">`);
  if ($data.loading) {
    _push(`<div class="board_width animate-pulse"><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div><div role="status" class="l__b"><div class="__img">`);
    _push(ssrRenderComponent(_component_icon, {
      name: "pulse_image",
      class: "__i"
    }, null, _parent));
    _push(`</div><div class="__t1"></div><div class="__t2"><div><div class="__t_l_1"></div><div class="__t_l_2"></div></div>`);
    _push(ssrRenderComponent(_component_icon, {
      class: "__t_l_r",
      name: "user"
    }, null, _parent));
    _push(`</div><span class="sr-only">Loading...</span></div></div>`);
  } else {
    _push(`<div class="${ssrRenderClass([{ "v_label": $data.showLabelName }, "board_width"])}"><!--[-->`);
    ssrRenderList($options.lists, (listItem, listIndex) => {
      _push(`<div class="top_list"><div class="b__list"><div class="flex w-full text-sm font-semibold"><span class="px-2 py-1 w-full" contenteditable="true">${ssrInterpolate(listItem.title)}</span></div><span class="inline-flex items-center justify-center px-2 py-1 ml-1 mr-1 text-xs cursor-default font-semibold text-indigo-500 bg-indigo-600 rounded-full bg-opacity-30" aria-label="Total Tasks">${ssrInterpolate($options.getDoneCount(listItem) + "/" + listItem.tasks.length)}</span><button class="flex items-center justify-center w-6 h-6 ml-auto text-indigo-500 rounded hover:bg-[#091e4224]">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-5 w-5",
        name: "more-h"
      }, null, _parent));
      _push(`</button>`);
      if (listItem.show_more) {
        _push(`<div class="absolute right-9 top-2 w-30 z-999 bg-white py-3 rounded shadow">`);
        if (listIndex !== 0) {
          _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">`);
          _push(ssrRenderComponent(_component_icon, {
            class: "mr-2 h-4 w-4",
            name: "move_left"
          }, null, _parent));
          _push(` ${ssrInterpolate(_ctx.$t("Move Left"))}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (listIndex !== $options.lists.length - 1) {
          _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">${ssrInterpolate(_ctx.$t("Move Right"))} `);
          _push(ssrRenderComponent(_component_icon, {
            class: "ml-2 h-4 w-4",
            name: "move_right"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="flex w-full items-center hover:bg-gray-200 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-0">`);
        _push(ssrRenderComponent(_component_icon, {
          class: "mr-2 h-4 w-4",
          name: "archive"
        }, null, _parent));
        _push(` ${ssrInterpolate(_ctx.$t("Archive"))}</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_draggable, {
        "data-id": listItem.id,
        class: "dragArea",
        list: listItem.tasks,
        group: "task",
        "item-key": "id",
        onEnd: ($event) => $options.afterDrop($event)
      }, {
        item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${ssrRenderAttr("data-id", element.id)} class="t__box group hover:bg-opacity-100" draggable="true"${_scopeId}>`);
            if (element.show_more) {
              _push2(`<div class="absolute right-7 top-1 w-30 z-999 bg-gray-100"${_scopeId}>`);
              if (element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "archive"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Archive"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "incomplete"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Mark incomplete"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (!element.is_done) {
                _push2(`<button class="m__archive"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  class: "mr-2 h-4 w-4",
                  name: "complete"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Mark complete"))}</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="hidden show__more group-hover:flex"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "more"
            }, null, _parent2, _scopeId));
            _push2(`</button>`);
            if (element.timer) {
              _push2(ssrRenderComponent(_component_icon, {
                name: "blink",
                class: "w-2 h-2 absolute top-2 right-2 z-20"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (element.cover) {
              _push2(`<div class="t__cover" style="${ssrRenderStyle({ backgroundImage: "url(" + element.cover.path + ")", height: element.cover.width ? element.cover.height / (element.cover.width / 246) + "px" : "auto" })}"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="t__details"${_scopeId}>`);
            if (element.project) {
              _push2(`<div class="mb-1"${_scopeId}><div class="project__color w-5 h-5 rounded-full inline-block"${ssrRenderAttr("aria-label", element.project.title)} style="${ssrRenderStyle([element.project.background ? { background: "url(" + element.project.background.image + ")" } : {}])}"${_scopeId}></div><span class="ml-1 text-xs text-gray-500"${_scopeId}>${ssrInterpolate(element.project.title)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.task_labels && element.task_labels.length) {
              _push2(`<div class="task__labels"${_scopeId}><!--[-->`);
              ssrRenderList(element.task_labels, (la, l_index) => {
                _push2(`<button class="color" style="${ssrRenderStyle({ backgroundColor: la.label.color })}"${ssrRenderAttr("aria-label", la.label.name)}${_scopeId}>${ssrInterpolate(la.label.name)}</button>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="t__title__area"${_scopeId}>`);
            if (element.is_done) {
              _push2(`<div class="checklist-box"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(!!element.is_done) ? " checked" : ""}${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, { name: "checklist_box" }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<h4 class="t__title"${_scopeId}>${ssrInterpolate(element.title)}</h4></div><div class="card__footer"${_scopeId}>`);
            if (element.due_date) {
              _push2(`<div aria-label="Due date" class="${ssrRenderClass([$options.getDue(element), "__item due"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "time"
              }, null, _parent2, _scopeId));
              _push2(`<span class="pl-[2px] pr-[4px] leading-none"${_scopeId}>${ssrInterpolate(_ctx.moment(element.due_date).format("MMM D"))}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.description) {
              _push2(`<div class="__item" aria-label="This task has a description."${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "details"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.comments_count) {
              _push2(`<div class="relative __item" aria-label="Comments"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "comment"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.comments_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.attachments_count) {
              _push2(`<div class="__item" aria-label="Attachments"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "attachment"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.attachments_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (element.checklists_count) {
              _push2(`<div aria-label="Checklist items" class="${ssrRenderClass([{ "completed": element.checklist_done_count === element.checklists_count }, "__item check"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-4 h-4",
                name: "checklist"
              }, null, _parent2, _scopeId));
              _push2(`<span class="ml-1 leading-none"${_scopeId}>${ssrInterpolate(element.checklist_done_count + "/" + element.checklists_count)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="pop__assignee"${_scopeId}><!--[-->`);
            ssrRenderList(element.assignees, (assignee) => {
              _push2(`<span${ssrRenderAttr("aria-label", assignee.user.name)} class="block rounded-full h-6 w-6"${_scopeId}>`);
              if (assignee.user.photo_path) {
                _push2(`<img class="h-full w-full rounded-full"${ssrRenderAttr("src", assignee.user.photo_path)}${ssrRenderAttr("alt", assignee.user.name)}${_scopeId}>`);
              } else {
                _push2(`<img class="h-full w-full rounded-full" src="/images/user.svg"${ssrRenderAttr("alt", assignee.user.name)}${_scopeId}>`);
              }
              _push2(`</span>`);
            });
            _push2(`<!--]--></div></div></div>`);
          } else {
            return [
              createVNode("div", {
                "data-id": element.id,
                class: "t__box group hover:bg-opacity-100",
                draggable: "true"
              }, [
                element.show_more ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "absolute right-7 top-1 w-30 z-999 bg-gray-100"
                }, [
                  element.is_done ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: ($event) => $options.makeArchive($event, element.id, listItem.tasks, index),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "archive"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Archive")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true),
                  element.is_done ? (openBlock(), createBlock("button", {
                    key: 1,
                    onClick: ($event) => $options.saveTask(element.id, { is_done: false }),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "incomplete"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Mark incomplete")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true),
                  !element.is_done ? (openBlock(), createBlock("button", {
                    key: 2,
                    onClick: ($event) => $options.saveTask(element.id, { is_done: true }),
                    class: "m__archive"
                  }, [
                    createVNode(_component_icon, {
                      class: "mr-2 h-4 w-4",
                      name: "complete"
                    }),
                    createTextVNode(" " + toDisplayString(_ctx.$t("Mark complete")), 1)
                  ], 8, ["onClick"])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                createVNode("button", {
                  onClick: ($event) => $options.visibleShowMore($event, element),
                  class: "hidden show__more group-hover:flex"
                }, [
                  createVNode(_component_icon, {
                    class: "w-4 h-4",
                    name: "more"
                  })
                ], 8, ["onClick"]),
                element.timer ? (openBlock(), createBlock(_component_icon, {
                  key: 1,
                  name: "blink",
                  class: "w-2 h-2 absolute top-2 right-2 z-20"
                })) : createCommentVNode("", true),
                element.cover ? (openBlock(), createBlock("div", {
                  key: 2,
                  onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id),
                  class: "t__cover",
                  style: { backgroundImage: "url(" + element.cover.path + ")", height: element.cover.width ? element.cover.height / (element.cover.width / 246) + "px" : "auto" }
                }, null, 12, ["onClick"])) : createCommentVNode("", true),
                createVNode("div", {
                  class: "t__details",
                  onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
                }, [
                  element.project ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mb-1"
                  }, [
                    createVNode("div", {
                      class: "project__color w-5 h-5 rounded-full inline-block",
                      "aria-label": element.project.title,
                      style: [element.project.background ? { background: "url(" + element.project.background.image + ")" } : {}]
                    }, null, 12, ["aria-label"]),
                    createVNode("span", { class: "ml-1 text-xs text-gray-500" }, toDisplayString(element.project.title), 1)
                  ])) : createCommentVNode("", true),
                  element.task_labels && element.task_labels.length ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "task__labels"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(element.task_labels, (la, l_index) => {
                      return openBlock(), createBlock("button", {
                        onClick: ($event) => $options.visibleLabel($event),
                        class: "color",
                        style: { backgroundColor: la.label.color },
                        "aria-label": la.label.name
                      }, toDisplayString(la.label.name), 13, ["onClick", "aria-label"]);
                    }), 256))
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "t__title__area" }, [
                    element.is_done ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "checklist-box",
                      onClick: ($event) => $options.cardSwitchClick($event)
                    }, [
                      createVNode("input", {
                        type: "checkbox",
                        checked: !!element.is_done,
                        onChange: ($event) => $options.cardSwitchToggle(element, $event)
                      }, null, 40, ["checked", "onChange"]),
                      createVNode(_component_icon, { name: "checklist_box" })
                    ], 8, ["onClick"])) : createCommentVNode("", true),
                    createVNode("h4", { class: "t__title" }, toDisplayString(element.title), 1)
                  ]),
                  createVNode("div", {
                    class: "card__footer",
                    onClick: ($event) => $options.taskDetailsPopup(element.slug || element.id)
                  }, [
                    element.due_date ? (openBlock(), createBlock("div", {
                      key: 0,
                      "aria-label": "Due date",
                      class: ["__item due", $options.getDue(element)]
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "time"
                      }),
                      createVNode("span", { class: "pl-[2px] pr-[4px] leading-none" }, toDisplayString(_ctx.moment(element.due_date).format("MMM D")), 1)
                    ], 2)) : createCommentVNode("", true),
                    element.description ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "__item",
                      "aria-label": "This task has a description."
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "details"
                      })
                    ])) : createCommentVNode("", true),
                    element.comments_count ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "relative __item",
                      "aria-label": "Comments"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "comment"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.comments_count), 1)
                    ])) : createCommentVNode("", true),
                    element.attachments_count ? (openBlock(), createBlock("div", {
                      key: 3,
                      class: "__item",
                      "aria-label": "Attachments"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "attachment"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.attachments_count), 1)
                    ])) : createCommentVNode("", true),
                    element.checklists_count ? (openBlock(), createBlock("div", {
                      key: 4,
                      class: ["__item check", { "completed": element.checklist_done_count === element.checklists_count }],
                      "aria-label": "Checklist items"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "checklist"
                      }),
                      createVNode("span", { class: "ml-1 leading-none" }, toDisplayString(element.checklist_done_count + "/" + element.checklists_count), 1)
                    ], 2)) : createCommentVNode("", true)
                  ], 8, ["onClick"]),
                  createVNode("div", { class: "pop__assignee" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(element.assignees, (assignee) => {
                      return openBlock(), createBlock("span", {
                        "aria-label": assignee.user.name,
                        class: "block rounded-full h-6 w-6"
                      }, [
                        assignee.user.photo_path ? (openBlock(), createBlock("img", {
                          key: 0,
                          class: "h-full w-full rounded-full",
                          src: assignee.user.photo_path,
                          alt: assignee.user.name
                        }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
                          key: 1,
                          class: "h-full w-full rounded-full",
                          src: "/images/user.svg",
                          alt: assignee.user.name
                        }, null, 8, ["alt"]))
                      ], 8, ["aria-label"]);
                    }), 256))
                  ])
                ], 8, ["onClick"])
              ], 8, ["data-id"])
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="add_new pt-1"${_scopeId}>`);
            if (!listItem.new_task_open) {
              _push2(`<div class="group mb-1.5 flex cursor-pointer items-center rounded py-2 hover:bg-white ltr:pl-2 rtl:pr-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                class: "w-5 w-5 text-indigo-500",
                name: "add"
              }, null, _parent2, _scopeId));
              _push2(`<span class="block text-sm text-gray-500"${_scopeId}>${ssrInterpolate(_ctx.$t("Add a task"))}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mb-2" style="${ssrRenderStyle(listItem.new_task_open ? null : { display: "none" })}"${_scopeId}><input autofocus${ssrRenderAttr("id", "new_task_input_id_" + listItem.id)} type="text"${ssrRenderAttr("value", $data.new_task.title)} class="block text-sm font-medium w-full px-4 py-3 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"${ssrRenderAttr("placeholder", _ctx.$t("Enter a title for this task"))}${_scopeId}><div class="pl-1 mt-2 flex"${_scopeId}><button class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-2.5 py-1.5 text-xs rounded"${_scopeId}>${ssrInterpolate(_ctx.$t("Add task"))}</button><button class="inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 focus:ring-indigo-500 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "close"
            }, null, _parent2, _scopeId));
            _push2(`</button></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "add_new pt-1" }, [
                !listItem.new_task_open ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "group mb-1.5 flex cursor-pointer items-center rounded py-2 hover:bg-white ltr:pl-2 rtl:pr-2",
                  onClick: ($event) => $options.openNewTask(listItem)
                }, [
                  createVNode(_component_icon, {
                    class: "w-5 w-5 text-indigo-500",
                    name: "add"
                  }),
                  createVNode("span", { class: "block text-sm text-gray-500" }, toDisplayString(_ctx.$t("Add a task")), 1)
                ], 8, ["onClick"])) : createCommentVNode("", true),
                withDirectives(createVNode("div", { class: "mb-2" }, [
                  withDirectives(createVNode("input", {
                    autofocus: "",
                    id: "new_task_input_id_" + listItem.id,
                    ref_for: true,
                    ref: "new_task_input_" + listItem.id,
                    type: "text",
                    "onUpdate:modelValue": ($event) => $data.new_task.title = $event,
                    class: "block text-sm font-medium w-full px-4 py-3 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                    placeholder: _ctx.$t("Enter a title for this task"),
                    onKeyup: ($event) => $event.keyCode === 13 ? $options.submitNewTask(listItem, listIndex) : ""
                  }, null, 40, ["id", "onUpdate:modelValue", "placeholder", "onKeyup"]), [
                    [vModelText, $data.new_task.title]
                  ]),
                  createVNode("div", { class: "pl-1 mt-2 flex" }, [
                    createVNode("button", {
                      onClick: ($event) => $options.submitNewTask(listItem, listIndex),
                      class: "inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-2.5 py-1.5 text-xs rounded"
                    }, toDisplayString(_ctx.$t("Add task")), 9, ["onClick"]),
                    createVNode("button", {
                      onClick: ($event) => listItem.new_task_open = false,
                      class: "inline-flex items-center border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 focus:ring-indigo-500 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"
                    }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "close"
                      })
                    ], 8, ["onClick"])
                  ])
                ], 512), [
                  [vShow, listItem.new_task_open]
                ])
              ])
            ];
          }
        }),
        _: 2
      }, _parent));
      _push(`</div>`);
    });
    _push(`<!--]--><div class="flex flex-col w-72 add__new__list"><div class="${ssrRenderClass([{ "active": $data.new_list_open }, "add_new"])}">`);
    if (!$data.new_list_open) {
      _push(`<div class="group p-3 flex cursor-pointer items-center rounded">`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-5 w-5",
        name: "add"
      }, null, _parent));
      _push(`<span class="block text-sm">${ssrInterpolate(_ctx.$t("Add a new list"))}</span></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="p-3" style="${ssrRenderStyle($data.new_list_open ? null : { display: "none" })}"><select class="block text-sm font-medium w-full px-2 py-2 mb-2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"><option value=""${ssrIncludeBooleanAttr(Array.isArray($data.new_list.project_id) ? ssrLooseContain($data.new_list.project_id, "") : ssrLooseEqual($data.new_list.project_id, "")) ? " selected" : ""}>${ssrInterpolate(_ctx.$t("Select Project"))}</option><!--[-->`);
    ssrRenderList($data.workspaceProjects, (project) => {
      _push(`<option${ssrRenderAttr("value", project.id)}>${ssrInterpolate(project.title)}</option>`);
    });
    _push(`<!--]--></select><input autofocus type="text"${ssrRenderAttr("id", "new_list_input_id_" + $options.lists.length)}${ssrRenderAttr("value", $data.new_list.title)} class="block text-sm font-medium w-full px-2 py-2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter list title..."><div class="mt-2 flex"><button class="inline-flex items-center border font-medium shadow-sm text-white border-transparent bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 text-xs rounded"> Add list </button><button class="inline-flex items-center border font-medium shadow-sm text-gray-700 border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1 text-xs rounded ltr:ml-1 rtl:mr-1"> Cancel </button></div></div></div></div><div class="flex-shrink-0 w-6"></div></div>`);
  }
  _push(`</div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
      view: "board",
      isPopup: $data.td_pop,
      onCloseModal: ($event) => $options.closeDetails()
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/MyTasksBoard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MyTasksBoard = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  MyTasksBoard as default
};
