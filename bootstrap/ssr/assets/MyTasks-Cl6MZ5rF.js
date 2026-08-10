import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { B as BoardFilter } from "./BoardFilter-BGdXhQL5.js";
import "lodash/mapValues.js";
import { D as DatePicker } from "./DatePicker-6Ds_7_ns.js";
import draggable from "vuedraggable";
import moment from "moment";
import throttle from "lodash/throttle.js";
import pickBy from "lodash/pickBy.js";
import axios from "axios";
import { resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "uuid";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  metaInfo: { title: "Dashboard" },
  components: { Head, Icon, Link, draggable, DatePicker, BoardFilter },
  layout: Layout,
  props: {
    auth: Object,
    title: String,
    tasks: Object,
    filters: Object,
    workspace: Object,
    list_index: Object,
    board_lists: Object
  },
  remember: "form",
  data() {
    var _a, _b, _c;
    return {
      errors: [],
      loading: false,
      showLabelBox: false,
      label_search: "",
      user_search: "",
      list_search: "",
      selected: { task_id: null, task_index: null, list_index: null, top: 0, left: 0 },
      showAssigneeBox: false,
      firstResponse: [],
      lastResponse: [],
      new_task: {},
      taskDetailsOpen: false,
      activeTimerString: "",
      months: [],
      counter: { seconds: 0, timer: this.timer },
      drag: false,
      new_task_open: false,
      taskDetailsId: "",
      labels: null,
      team_members: null,
      open_filter: false,
      currentView: "table",
      viewOptions: [
        { name: "Board", slug: "board" },
        { name: "Calendar", slug: "calendar" },
        { name: "Timeline", slug: "timeline" },
        { name: "List", slug: "table" }
      ],
      viewIcons: ["board", "calendar", "timeline", "table"],
      formInitialized: false,
      // Flag to prevent watcher from triggering on initial load
      form: {
        // Don't include user in form - it's handled by the backend
        due: ((_a = this.filters) == null ? void 0 : _a.due) || null,
        label: ((_b = this.filters) == null ? void 0 : _b.label) || null,
        task: ((_c = this.filters) == null ? void 0 : _c.task) ?? null
      }
    };
  },
  watch: {
    form: {
      deep: true,
      immediate: false,
      handler: throttle(function(newVal, oldVal) {
        if (!this.formInitialized) {
          return;
        }
        if (oldVal && oldVal.due === newVal.due && oldVal.label === newVal.label && oldVal.task === newVal.task) {
          return;
        }
        const filters = pickBy(this.form);
        this.$inertia.get(this.route("workspace.view.my-tasks.table", this.workspace.slug || this.workspace.id), filters, { preserveState: true });
      }, 150)
    }
  },
  computed: {
    isModalVisible() {
      return this.taskDetailsOpen;
    },
    lists() {
      const items = this.board_lists;
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i] && this.tasks[i].list_id) {
          items[this.list_index[this.tasks[i].list_id]]["tasks"].push(this.tasks[i]);
        }
      }
      return items;
    }
  },
  created() {
    this.moment = moment;
    const url = this.$page.url || "";
    if (url.includes("/my-tasks/board")) this.currentView = "board";
    else if (url.includes("/my-tasks/calendar")) this.currentView = "calendar";
    else if (url.includes("/my-tasks/timeline")) this.currentView = "timeline";
    else if (url.includes("/my-tasks/table") || url.includes("/my-tasks")) this.currentView = "table";
    if (this.filters) {
      this.form = {
        due: this.filters.due || null,
        label: this.filters.label || null,
        task: this.filters.task || null
      };
    }
    this.$nextTick(() => {
      this.formInitialized = true;
    });
    this.checkTaskUri();
    this.getOtherData();
  },
  methods: {
    addLabelToTask(checked, id) {
      axios.post(this.route("task.labels.add"), { task_id: this.selected.task_id, label_id: id }).then((response) => {
        if (response.data) {
          if (checked) {
            this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.push(response.data);
          } else {
            const findIndex = this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.findIndex((tl) => tl.label_id === id);
            if (findIndex > -1) {
              this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    assignUserToTask(checked, id) {
      axios.post(this.route("task.assignees.add"), { task_id: this.selected.task_id, user_id: id }).then((response) => {
        if (response.data) {
          const task_assignees = this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees;
          if (checked) {
            task_assignees.push(response.data);
          } else {
            const findIndex = task_assignees.findIndex((a) => a.user_id === id);
            if (findIndex > -1) {
              task_assignees.splice(findIndex, 1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    task_label_ids() {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].task_labels.map((item) => item.label_id);
    },
    task_assignees() {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].assignees.map((item) => item.user_id);
    },
    isCurrentLabel(id) {
      return this.lists[this.selected.list_index].tasks[this.selected.task_index].list_id === id;
    },
    addAction(e, task_id, task_index, list_index, visible) {
      this.getCurrentPosition(e);
      this.selected.task_id = task_id;
      this.selected.task_index = task_index;
      this.selected.list_index = list_index;
      this[visible] = true;
    },
    getCurrentPosition(e) {
      this.selected.left = e.clientX - 200 + "px";
      this.selected.top = (e.clientY > 450 ? 410 : e.clientY - 30) + "px";
      console.log(this.selected);
    },
    searchLabel(input) {
      return this.labels.filter((lab) => lab.name.toLowerCase().indexOf(input) > -1);
    },
    searchUser(input) {
      return this.team_members.filter((tm) => tm.user.name.toLowerCase().indexOf(input) > -1);
    },
    makeArchive(e, id, tasks, index) {
      e.preventDefault();
      this.saveTask(id, { is_archive: 1 });
      tasks.splice(index, 1);
    },
    visibleShowMore(e, element) {
      e.preventDefault();
      element.show_more = !!element.show_more ? false : true;
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
      axios.post(this.route("board.update", id), { title }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
    },
    newSortedItems(e, selector) {
      const lists = e[selector].getElementsByTagName("tr");
      const newOrder = [];
      for (let i = 0; i < lists.length; i++) {
        newOrder.push({ id: lists[i].dataset.id, order: i + 1 });
      }
      return newOrder;
    },
    saveTask(id, taskObject, listIndex) {
      axios.post(this.route("task.update", id), taskObject).then((response) => {
        if (response && response.data && listIndex) {
          const findIndex = this.lists[listIndex].tasks.findIndex((t) => t.id === parseInt(id));
          if (findIndex > -1) {
            this.lists[listIndex].tasks[findIndex] = response.data;
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    saveOrder(taskObject) {
      axios.post(this.route("task.update.order"), taskObject).catch((error) => {
        console.log(error);
      });
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
    clone: function(el) {
      return {
        name: el.name + " cloned"
      };
    },
    log: function(evt) {
      window.console.log(evt);
    },
    async getOtherData() {
      const dataResponse = await axios.get(this.route("workspace.other.data", { workspace_id: this.workspace.id }));
      const res = dataResponse.data;
      this.labels = res.labels || [];
      this.team_members = res.team_members || [];
    },
    checkTaskUri() {
      const url = this.$page.url;
      let splitUrl = url.split("/");
      splitUrl = splitUrl.filter((el) => !!el);
      if (splitUrl[splitUrl.length - 2] === "task") {
        this.taskDetailsId = splitUrl[splitUrl.length - 1];
        this.taskDetailsOpen = true;
      }
    },
    findFilters() {
      const filters = Object.keys(this.filters || {});
      return filters.some((r) => ["due", "label"].includes(r));
    },
    clearFilter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.reset();
    },
    reset() {
      this.form = {
        due: null,
        label: null,
        task: null
      };
      this.$inertia.get(this.route("workspace.view.my-tasks.table", this.workspace.slug || this.workspace.id), {}, { preserveState: true });
    },
    doFilter(form) {
      this.form = {
        due: form.due || null,
        label: form.label || null,
        task: form.task || null
      };
      const filters = pickBy(this.form);
      this.$inertia.get(this.route("workspace.view.my-tasks.table", this.workspace.slug || this.workspace.id), filters, { preserveState: true });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_Link = resolveComponent("Link");
  const _component_icon = resolveComponent("icon");
  const _component_board_filter = resolveComponent("board-filter");
  const _component_draggable = resolveComponent("draggable");
  const _component_DatePicker = resolveComponent("DatePicker");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  if ($props.workspace) {
    _push(`<div class="project__view__menu w-full p-2 text-sm flex justify-first items-center"><div class="inline-flex w-full flex-wrap items-center"><div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap"><h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">${ssrInterpolate($props.workspace.name)}</h2><!--[-->`);
    ssrRenderList($data.viewOptions, (option, option_index) => {
      _push(ssrRenderComponent(_component_Link, {
        key: option.slug,
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
  } else {
    _push(`<!---->`);
  }
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
  _push(`<div class="flex flex-col flex-grow-1 flex-shrink-1 h-full"><div class="flex flex-col task__table overflow-y-auto h-full"><div class="inline-block min-w-full h-full py-4 align-middle md:px-3 lg:px-4"><div class="table__view"><table><thead><tr><th scope="col" class="w-[20px]"></th><th scope="col" class=""><button class="flex items-center gap-x-3 focus:outline-none"><span>${ssrInterpolate(_ctx.$t("Task"))}</span></button></th><th scope="col" class="w-[17%]">${ssrInterpolate(_ctx.$t("List"))}</th><th scope="col" class="w-[17%]">${ssrInterpolate(_ctx.$t("Labels"))}</th><th scope="col" class="w-[17%]">${ssrInterpolate(_ctx.$t("Users"))}</th><th scope="col" class="w-[17%]">${ssrInterpolate(_ctx.$t("Due Date"))}</th><th scope="col" class="relative w-[50px]"><span class="sr-only">Edit</span></th></tr></thead><!--[-->`);
  ssrRenderList($options.lists, (listItem, listIndex) => {
    _push(ssrRenderComponent(_component_draggable, {
      key: listItem.id,
      "data-index": listIndex,
      "data-id": listItem.id,
      tag: "tbody",
      handle: ".handle",
      class: "t__drag",
      list: listItem.tasks,
      group: "task",
      "item-key": "id"
    }, {
      item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<tr class="list-group-item group"${ssrRenderAttr("data-id", element.id)}${_scopeId}><td class="pl-2 pr-1 py-2 border-none text-sm font-medium whitespace-nowrap w-[20px]"${_scopeId}><div class="project__color w-5 h-5 rounded-full"${ssrRenderAttr("aria-label", element.project.title)} style="${ssrRenderStyle([element.project.background ? { background: "url(" + element.project.background.image + ")" } : {}])}"${_scopeId}></div></td><td class="px-2 py-2 text-sm font-medium whitespace-nowrap w-[calc(32%-70px)] hover:bg-gray-100"${_scopeId}>`);
          _push2(ssrRenderComponent(_component_Link, {
            class: "cursor-pointer",
            href: this.route("projects.view.board", { uid: element.project.slug || element.project.id, task: element.slug || element.id }),
            "data-id": element.id,
            title: element.project.title
          }, {
            default: withCtx((_, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                if (element.timer) {
                  _push3(ssrRenderComponent(_component_icon, {
                    name: "blink",
                    class: "w-2 h-2"
                  }, null, _parent3, _scopeId2));
                } else {
                  _push3(`<!---->`);
                }
                _push3(`<h2 class="font-medium t__title text-pretty"${_scopeId2}>${ssrInterpolate(element.title)}</h2>`);
              } else {
                return [
                  element.timer ? (openBlock(), createBlock(_component_icon, {
                    key: 0,
                    name: "blink",
                    class: "w-2 h-2"
                  })) : createCommentVNode("", true),
                  createVNode("h2", { class: "font-medium t__title text-pretty" }, toDisplayString(element.title), 1)
                ];
              }
            }),
            _: 2
          }, _parent2, _scopeId));
          _push2(`</td><td class="px-2 hide_arrow py-2 text-sm font-medium whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100"${_scopeId}><div class="inline t__title text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800"${_scopeId}>${ssrInterpolate(element.list.title)}</div></td><td class="px-1 py-1 hide_arrow t_label text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100"${_scopeId}>`);
          if (element.task_labels.length) {
            _push2(`<div class="task__labels overflow-hidden"${_scopeId}><!--[-->`);
            ssrRenderList(element.task_labels, (la, l_index) => {
              _push2(`<button class="color" style="${ssrRenderStyle({ backgroundColor: la.label.color })}"${_scopeId}>${ssrInterpolate(la.label.name)}</button>`);
            });
            _push2(`<!--]--><div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "arrow-down"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            _push2(`<div${_scopeId}><div class="absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "plus"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          }
          _push2(`</td><td class="px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100"${_scopeId}>`);
          if (element.assignees.length) {
            _push2(`<div class="flex items-center"${_scopeId}><!--[-->`);
            ssrRenderList(element.assignees, (assignee) => {
              _push2(`<div${ssrRenderAttr("aria-label", assignee.user.name)} class="block rounded-full h-6 w-6"${_scopeId}><img class="h-full w-full border border-white rounded-full"${ssrRenderAttr("src", assignee.user.photo_path)}${ssrRenderAttr("alt", assignee.user.name)}${_scopeId}></div>`);
            });
            _push2(`<!--]--><div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "arrow-down"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            _push2(`<div${_scopeId}><div class="absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "plus"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          }
          _push2(`</td><td class="px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100"${_scopeId}>`);
          if (element.due_date) {
            _push2(`<div class="t__title"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_DatePicker, {
              modelValue: element.due_date,
              "onUpdate:modelValue": ($event) => element.due_date = $event,
              onChange: ($event) => $options.saveTask(element.id, { due_date: element.due_date }, listIndex)
            }, {
              trigger: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex t__title items-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_icon, {
                    class: "w-4 w-4",
                    name: "time"
                  }, null, _parent3, _scopeId2));
                  _push3(`<span class="ml-1 font-light leading-none" aria-label="Due date"${_scopeId2}>${ssrInterpolate(_ctx.moment(element.due_date).format("MMM D"))}</span></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex t__title items-center" }, [
                      createVNode(_component_icon, {
                        class: "w-4 w-4",
                        name: "time"
                      }),
                      createVNode("span", {
                        class: "ml-1 font-light leading-none",
                        "aria-label": "Due date"
                      }, toDisplayString(_ctx.moment(element.due_date).format("MMM D")), 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`<div class="absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              class: "w-4 h-4",
              name: "arrow-down"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            _push2(`<div class="w-full h-full"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_DatePicker, {
              modelValue: element.due_date,
              "onUpdate:modelValue": ($event) => element.due_date = $event,
              onChange: ($event) => $options.saveTask(element.id, { due_date: element.due_date }, listIndex)
            }, {
              trigger: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="show_arrow_hover top-0 left-0 w-full h-full flex justify-start items-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_icon, {
                    class: "w-4 h-4",
                    name: "plus"
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "show_arrow_hover top-0 left-0 w-full h-full flex justify-start items-center" }, [
                      createVNode(_component_icon, {
                        class: "w-4 h-4",
                        name: "plus"
                      })
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          }
          _push2(`</td><td class="px-2 py-2 text-sm whitespace-nowrap w-[50px] relative"${_scopeId}><button aria-label="Archive" data-a="" class="flex w-full items-center text-xs font-medium focus:outline-none focus:ring-0"${_scopeId}>`);
          _push2(ssrRenderComponent(_component_icon, {
            class: "mr-2 h-4 w-4",
            name: "archive"
          }, null, _parent2, _scopeId));
          _push2(`</button></td></tr>`);
        } else {
          return [
            createVNode("tr", {
              class: "list-group-item group",
              "data-id": element.id
            }, [
              createVNode("td", { class: "pl-2 pr-1 py-2 border-none text-sm font-medium whitespace-nowrap w-[20px]" }, [
                createVNode("div", {
                  class: "project__color w-5 h-5 rounded-full",
                  "aria-label": element.project.title,
                  style: [element.project.background ? { background: "url(" + element.project.background.image + ")" } : {}]
                }, null, 12, ["aria-label"])
              ]),
              createVNode("td", { class: "px-2 py-2 text-sm font-medium whitespace-nowrap w-[calc(32%-70px)] hover:bg-gray-100" }, [
                createVNode(_component_Link, {
                  class: "cursor-pointer",
                  href: this.route("projects.view.board", { uid: element.project.slug || element.project.id, task: element.slug || element.id }),
                  "data-id": element.id,
                  title: element.project.title
                }, {
                  default: withCtx(() => [
                    element.timer ? (openBlock(), createBlock(_component_icon, {
                      key: 0,
                      name: "blink",
                      class: "w-2 h-2"
                    })) : createCommentVNode("", true),
                    createVNode("h2", { class: "font-medium t__title text-pretty" }, toDisplayString(element.title), 1)
                  ]),
                  _: 2
                }, 1032, ["href", "data-id", "title"])
              ]),
              createVNode("td", { class: "px-2 hide_arrow py-2 text-sm font-medium whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100" }, [
                createVNode("div", { class: "inline t__title text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800" }, toDisplayString(element.list.title), 1)
              ]),
              createVNode("td", {
                class: "px-1 py-1 hide_arrow t_label text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100",
                onClick: ($event) => $options.addAction($event, element.id, index, listIndex, "showLabelBox")
              }, [
                element.task_labels.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "task__labels overflow-hidden"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(element.task_labels, (la, l_index) => {
                    return openBlock(), createBlock("button", {
                      class: "color",
                      style: { backgroundColor: la.label.color }
                    }, toDisplayString(la.label.name), 5);
                  }), 256)),
                  createVNode("div", { class: "absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center" }, [
                    createVNode(_component_icon, {
                      class: "w-4 h-4",
                      name: "arrow-down"
                    })
                  ])
                ])) : (openBlock(), createBlock("div", { key: 1 }, [
                  createVNode("div", { class: "absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center" }, [
                    createVNode(_component_icon, {
                      class: "w-4 h-4",
                      name: "plus"
                    })
                  ])
                ]))
              ], 8, ["onClick"]),
              createVNode("td", {
                class: "px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100",
                onClick: ($event) => $options.addAction($event, element.id, index, listIndex, "showAssigneeBox")
              }, [
                element.assignees.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex items-center"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(element.assignees, (assignee) => {
                    return openBlock(), createBlock("div", {
                      "aria-label": assignee.user.name,
                      class: "block rounded-full h-6 w-6"
                    }, [
                      createVNode("img", {
                        class: "h-full w-full border border-white rounded-full",
                        src: assignee.user.photo_path,
                        alt: assignee.user.name
                      }, null, 8, ["src", "alt"])
                    ], 8, ["aria-label"]);
                  }), 256)),
                  createVNode("div", { class: "absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center" }, [
                    createVNode(_component_icon, {
                      class: "w-4 h-4",
                      name: "arrow-down"
                    })
                  ])
                ])) : (openBlock(), createBlock("div", { key: 1 }, [
                  createVNode("div", { class: "absolute show_arrow_hover top-0 left-0 h-full flex justify-center w-9 items-center" }, [
                    createVNode(_component_icon, {
                      class: "w-4 h-4",
                      name: "plus"
                    })
                  ])
                ]))
              ], 8, ["onClick"]),
              createVNode("td", { class: "px-2 py-2 hide_arrow text-sm whitespace-nowrap w-[17%] cursor-pointer hover:bg-gray-100" }, [
                element.due_date ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "t__title"
                }, [
                  createVNode(_component_DatePicker, {
                    modelValue: element.due_date,
                    "onUpdate:modelValue": ($event) => element.due_date = $event,
                    onChange: ($event) => $options.saveTask(element.id, { due_date: element.due_date }, listIndex)
                  }, {
                    trigger: withCtx(() => [
                      createVNode("div", { class: "flex t__title items-center" }, [
                        createVNode(_component_icon, {
                          class: "w-4 w-4",
                          name: "time"
                        }),
                        createVNode("span", {
                          class: "ml-1 font-light leading-none",
                          "aria-label": "Due date"
                        }, toDisplayString(_ctx.moment(element.due_date).format("MMM D")), 1)
                      ])
                    ]),
                    _: 2
                  }, 1032, ["modelValue", "onUpdate:modelValue", "onChange"]),
                  createVNode("div", { class: "absolute show_arrow_hover top-0 right-0 h-full flex justify-center w-9 items-center" }, [
                    createVNode(_component_icon, {
                      class: "w-4 h-4",
                      name: "arrow-down"
                    })
                  ])
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "w-full h-full"
                }, [
                  createVNode(_component_DatePicker, {
                    modelValue: element.due_date,
                    "onUpdate:modelValue": ($event) => element.due_date = $event,
                    onChange: ($event) => $options.saveTask(element.id, { due_date: element.due_date }, listIndex)
                  }, {
                    trigger: withCtx(() => [
                      createVNode("div", { class: "show_arrow_hover top-0 left-0 w-full h-full flex justify-start items-center" }, [
                        createVNode(_component_icon, {
                          class: "w-4 h-4",
                          name: "plus"
                        })
                      ])
                    ]),
                    _: 2
                  }, 1032, ["modelValue", "onUpdate:modelValue", "onChange"])
                ]))
              ]),
              createVNode("td", { class: "px-2 py-2 text-sm whitespace-nowrap w-[50px] relative" }, [
                createVNode("button", {
                  "aria-label": "Archive",
                  "data-a": "",
                  onClick: ($event) => $options.makeArchive($event, element.id, listItem.tasks, index),
                  class: "flex w-full items-center text-xs font-medium focus:outline-none focus:ring-0"
                }, [
                  createVNode(_component_icon, {
                    class: "mr-2 h-4 w-4",
                    name: "archive"
                  })
                ], 8, ["onClick"])
              ])
            ], 8, ["data-id"])
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]-->`);
  if (!$props.tasks.length) {
    _push(`<tbody><tr><td class="border-t px-6 py-4 text-center" colspan="7">${ssrInterpolate(_ctx.$t("To tasks found!"))}</td></tr></tbody>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</table>`);
  if ($data.showAssigneeBox) {
    _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" style="${ssrRenderStyle({ top: $data.selected.top, left: $data.selected.left })}"><h4 class="text-center mb-3 font-bold">Assignee</h4><div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded">`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4",
      name: "close"
    }, null, _parent));
    _push(`</div><input id="w_t_s_u"${ssrRenderAttr("value", $data.user_search)} class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]" placeholder="Search users"><ul class="flex flex-col mt-3 gap-1 h-48 max-h-[200px] overflow-y-auto"><!--[-->`);
    ssrRenderList($options.searchUser($data.user_search), (userObject, user_index) => {
      _push(`<li><label${ssrRenderAttr("for", "w_u_id_" + user_index)} class="flex p-2 cursor-pointer hover:bg-gray-200 rounded"><input${ssrRenderAttr("id", "w_u_id_" + user_index)} class="w-5 ml-1 mr-2" type="checkbox"${ssrIncludeBooleanAttr($options.task_assignees().includes(userObject.user_id)) ? " checked" : ""}>`);
      if (userObject.user.photo_path) {
        _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full"${ssrRenderAttr("src", userObject.user.photo_path)}>`);
      } else {
        _push(`<img${ssrRenderAttr("aria-label", userObject.user.name)}${ssrRenderAttr("alt", userObject.user.name)} class="w-6 h-6 rounded-full" src="/images/user.svg">`);
      }
      _push(`<span data-a="" class="p-1" type="button"${ssrRenderAttr("tabindex", user_index)}>${ssrInterpolate(userObject.user.name)}</span></label></li>`);
    });
    _push(`<!--]--></ul></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showLabelBox) {
    _push(`<div class="absolute flex w-[300px] z-10 text-sm flex-col bg-white px-4 py-4 rounded shadow" style="${ssrRenderStyle({ top: $data.selected.top, left: $data.selected.left })}"><h4 class="text-center mb-3 font-bold">Labels</h4><div class="absolute cursor-pointer hover:bg-gray-200 top-3 right-3 p-1.5 rounded">`);
    _push(ssrRenderComponent(_component_icon, {
      class: "w-4 h-4",
      name: "close"
    }, null, _parent));
    _push(`</div><input${ssrRenderAttr("value", $data.label_search)} class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]"${ssrRenderAttr("placeholder", _ctx.$t("Search labels"))}><ul class="flex flex-col mt-3 gap-3 max-h-[200px] overflow-y-auto"><!--[-->`);
    ssrRenderList($options.searchLabel($data.label_search), (lab, lab_index) => {
      _push(`<li><label class="flex gap-1"><input class="w-5 mr-2 cursor-pointer" type="checkbox"${ssrIncludeBooleanAttr($options.task_label_ids().includes(lab.id)) ? " checked" : ""}><span class="w-full px-3 py-2 rounded cursor-pointer hover:opacity-80" style="${ssrRenderStyle({ background: lab.color })}"${ssrRenderAttr("tabindex", lab_index)} data-color="orange">${ssrInterpolate(lab.name)}</span><button class="p-3 hover:bg-gray-200 rounded" type="button"${ssrRenderAttr("tabindex", lab_index)}>`);
      _push(ssrRenderComponent(_component_icon, {
        class: "w-3 h-3",
        name: "edit"
      }, null, _parent));
      _push(`</button></label></li>`);
    });
    _push(`<!--]--></ul><button class="w-full mt-4 px-3 py-2 rounded cursor-pointer bg-gray-300 hover:opacity-80"> Create a new label </button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/MyTasks.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MyTasks = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  MyTasks as default
};
