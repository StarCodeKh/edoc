import { Link, Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { T as TaskDetails } from "./TaskDetails-BYVxGJMD.js";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
import "./DatePicker-6Ds_7_ns.js";
import "pdf-lib";
import "pdfjs-dist/build/pdf.mjs";
const _sfc_main = {
  metaInfo: { title: "Dashboard" },
  components: {
    Head,
    Icon,
    Link,
    TaskDetails
  },
  layout: Layout,
  props: {
    auth: Object,
    tasks: Object,
    board_lists: Object,
    list_index: Array,
    title: String
  },
  data() {
    return {
      errors: [],
      loading: false,
      firstResponse: [],
      lastResponse: [],
      taskDetailsOpen: false,
      months: [],
      drag: false,
      taskDetailsId: "",
      tasks: [
        {
          title: "This is the title of the card for the thing that needs to be done.",
          id: 1,
          tag: "Design",
          date: "Dec 12",
          comment: 4,
          attachment: 1
        },
        {
          title: "This is the title of the card for the thing that needs to be done.",
          id: 2,
          tag: "Dev",
          date: "Dec 12",
          comment: 4,
          attachment: 1
        },
        {
          title: "This is the title of the card for the thing that needs to be done.",
          id: 3,
          tag: "UX",
          date: "Dec 12",
          comment: 4,
          attachment: 1
        },
        {
          title: "This is the title of the card for the thing that needs to be done.",
          id: 4,
          tag: "UI",
          date: "Dec 12",
          comment: 4,
          attachment: 1
        },
        {
          title: "This is the title of the card for the thing that needs to be done.",
          id: 5,
          tag: "Other",
          date: "Dec 12",
          comment: 4,
          attachment: 1
        }
      ],
      list: [
        {
          name: "Backlog",
          id: "list1",
          tasks: [
            {
              title: "Title 1",
              id: 1,
              tag: "Design",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 2,
              tag: "Dev",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "Title 3",
              id: 3,
              tag: "UX",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 4,
              tag: "UI",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 5,
              tag: "Other",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            }
          ]
        },
        {
          name: "Ready",
          id: "list2",
          tasks: [
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 6,
              tag: "Design",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 7,
              tag: "Dev",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 8,
              tag: "UX",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 9,
              tag: "UI",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 10,
              tag: "Other",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            }
          ]
        },
        {
          name: "Doing",
          id: "list3",
          tasks: [
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 11,
              tag: "Design",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 12,
              tag: "Dev",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 13,
              tag: "UX",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 14,
              tag: "UI",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            },
            {
              title: "This is the title of the card for the thing that needs to be done.",
              id: 15,
              tag: "Other",
              date: "Dec 12",
              comment: 4,
              attachment: 1
            }
          ]
        },
        {
          name: "Review",
          id: "list4",
          tasks: []
        },
        {
          name: "Blocked",
          id: "list5",
          tasks: []
        },
        {
          name: "Done",
          id: "list6",
          tasks: []
        }
      ]
    };
  },
  computed: {
    isModalVisible() {
      return this.taskDetailsOpen;
    }
  },
  created() {
    let currentUrl = this.$page.url.substr(1);
    currentUrl.split("/");
    console.log(this.board_lists);
  },
  methods: {
    taskDetails(id) {
      this.taskDetailsId = id;
      this.taskDetailsOpen = true;
    },
    goToLink(link) {
      window.location.href = link;
    },
    add: function() {
      this.list.push({ name: "Juan" });
    },
    replace: function() {
      this.list = [{ name: "Edgard" }];
    },
    clone: function(el) {
      return {
        name: el.name + " cloned"
      };
    },
    log: function(evt) {
      window.console.log(evt);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_task_details = resolveComponent("task-details");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="absolute flex h-full flex-col relative flex-1 overflow-y-auto task_board flex flex-col lg:flex-row gap-5"></div>`);
  if ($data.taskDetailsOpen) {
    _push(ssrRenderComponent(_component_task_details, {
      id: $data.taskDetailsId,
      onCloseModal: ($event) => $data.taskDetailsOpen = false
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Projects/Index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  Index as default
};
