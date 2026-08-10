import { computed, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createTextVNode, createCommentVNode, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { L as Layout } from "./Layout-DXJEf-iu.js";
import { P as Pagination } from "./Pagination-DBkwUgAS.js";
import { Head, Link, router } from "@inertiajs/vue3";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  __name: "Index",
  __ssrInlineRender: true,
  props: {
    notifications: Object
  },
  setup(__props) {
    const props = __props;
    const formatTimeAgo = (dateString) => {
    };
    const markAllAsRead = () => {
      router.post(route("notifications.markAllAsRead"), {}, {
        preserveScroll: true
      });
    };
    const groupedNotifications = computed(() => {
      return props.notifications.data.reduce((acc, notification) => {
        const date = new Date(notification.created_at);
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let groupKey;
        if (date.toDateString() === today.toDateString()) {
          groupKey = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          groupKey = "Yesterday";
        } else {
          groupKey = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        }
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(notification);
        return acc;
      }, {});
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "My Notifications" }, null, _parent));
      _push(ssrRenderComponent(Layout, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4 sm:p-6 md:p-8 bg-white border-b"${_scopeId}><div class="max-w-7xl mx-auto flex justify-between items-center"${_scopeId}><div${_scopeId}><h1 class="text-2xl font-bold text-gray-900"${_scopeId}>Notifications</h1><p class="mt-1 text-sm text-gray-500"${_scopeId}> A log of all important activity from the last 30 days. </p></div><button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0"${_scopeId}> Mark All as Read </button></div></div><div class="py-12"${_scopeId}><div class="max-w-7xl mx-auto sm:px-6 lg:px-8"${_scopeId}><!--[-->`);
            ssrRenderList(groupedNotifications.value, (group, date) => {
              _push2(`<div class="mb-8"${_scopeId}><div class="px-4 sm:px-0"${_scopeId}><h2 class="text-lg font-semibold text-gray-700"${_scopeId}>${ssrInterpolate(date)}</h2><hr class="mt-2 mb-4"${_scopeId}></div><div class="bg-white overflow-hidden shadow-sm sm:rounded-lg"${_scopeId}><ul class="divide-y divide-gray-200"${_scopeId}><!--[-->`);
              ssrRenderList(group, (notification) => {
                _push2(`<li${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: notification.data.url,
                  class: "block p-4 sm:p-5 hover:bg-gray-50 transition duration-150 ease-in-out"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    var _a, _b;
                    if (_push3) {
                      _push3(`<div class="flex items-start space-x-4"${_scopeId2}><div class="flex-shrink-0"${_scopeId2}>`);
                      if (notification.data.action_user_photo) {
                        _push3(`<img class="h-10 w-10 rounded-full object-cover"${ssrRenderAttr("src", notification.data.action_user_photo)}${ssrRenderAttr("alt", notification.data.action_user_name)}${_scopeId2}>`);
                      } else {
                        _push3(`<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg"${_scopeId2}>${ssrInterpolate((_a = notification.data.action_user_name) == null ? void 0 : _a.charAt(0))}</div>`);
                      }
                      _push3(`</div><div class="flex-1 min-w-0"${_scopeId2}><div class="flex justify-between items-start"${_scopeId2}><p class="text-sm text-gray-800 leading-snug"${_scopeId2}><strong class="font-medium"${_scopeId2}>${ssrInterpolate(notification.data.action_user_name)}</strong> ${ssrInterpolate(notification.data.message)}</p>`);
                      if (!notification.read_at) {
                        _push3(`<span class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0" title="Unread"${_scopeId2}></span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div><div class="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 space-y-1"${_scopeId2}><div class="flex items-center"${_scopeId2}><svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"${_scopeId2}></path></svg><span${_scopeId2}>Task: <strong class="font-medium text-gray-800"${_scopeId2}>${ssrInterpolate(notification.data.task_title)}</strong></span></div><div class="flex items-center"${_scopeId2}><svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"${_scopeId2}></path></svg><span${_scopeId2}>Project: <strong class="font-medium text-gray-800"${_scopeId2}>${ssrInterpolate(notification.data.project_name)}</strong></span></div><div class="flex items-center"${_scopeId2}><svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"${_scopeId2}></path></svg><span${_scopeId2}>Workspace: <strong class="font-medium text-gray-800"${_scopeId2}>${ssrInterpolate(notification.data.workspace_name)}</strong></span></div></div><p class="text-xs text-gray-500 mt-2"${_scopeId2}>${ssrInterpolate(formatTimeAgo(notification.created_at))}</p></div></div>`);
                    } else {
                      return [
                        createVNode("div", { class: "flex items-start space-x-4" }, [
                          createVNode("div", { class: "flex-shrink-0" }, [
                            notification.data.action_user_photo ? (openBlock(), createBlock("img", {
                              key: 0,
                              class: "h-10 w-10 rounded-full object-cover",
                              src: notification.data.action_user_photo,
                              alt: notification.data.action_user_name
                            }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg"
                            }, toDisplayString((_b = notification.data.action_user_name) == null ? void 0 : _b.charAt(0)), 1))
                          ]),
                          createVNode("div", { class: "flex-1 min-w-0" }, [
                            createVNode("div", { class: "flex justify-between items-start" }, [
                              createVNode("p", { class: "text-sm text-gray-800 leading-snug" }, [
                                createVNode("strong", { class: "font-medium" }, toDisplayString(notification.data.action_user_name), 1),
                                createTextVNode(" " + toDisplayString(notification.data.message), 1)
                              ]),
                              !notification.read_at ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0",
                                title: "Unread"
                              })) : createCommentVNode("", true)
                            ]),
                            createVNode("div", { class: "mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 space-y-1" }, [
                              createVNode("div", { class: "flex items-center" }, [
                                (openBlock(), createBlock("svg", {
                                  class: "h-4 w-4 mr-2 text-gray-400",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor"
                                }, [
                                  createVNode("path", {
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round",
                                    "stroke-width": "2",
                                    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                  })
                                ])),
                                createVNode("span", null, [
                                  createTextVNode("Task: "),
                                  createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.task_title), 1)
                                ])
                              ]),
                              createVNode("div", { class: "flex items-center" }, [
                                (openBlock(), createBlock("svg", {
                                  class: "h-4 w-4 mr-2 text-gray-400",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor"
                                }, [
                                  createVNode("path", {
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round",
                                    "stroke-width": "2",
                                    d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                                  })
                                ])),
                                createVNode("span", null, [
                                  createTextVNode("Project: "),
                                  createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.project_name), 1)
                                ])
                              ]),
                              createVNode("div", { class: "flex items-center" }, [
                                (openBlock(), createBlock("svg", {
                                  class: "h-4 w-4 mr-2 text-gray-400",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor"
                                }, [
                                  createVNode("path", {
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round",
                                    "stroke-width": "2",
                                    d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  })
                                ])),
                                createVNode("span", null, [
                                  createTextVNode("Workspace: "),
                                  createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.workspace_name), 1)
                                ])
                              ])
                            ]),
                            createVNode("p", { class: "text-xs text-gray-500 mt-2" }, toDisplayString(formatTimeAgo(notification.created_at)), 1)
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></div></div>`);
            });
            _push2(`<!--]-->`);
            if (__props.notifications.data.length === 0) {
              _push2(`<div class="text-center py-16"${_scopeId}><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"${_scopeId}><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"${_scopeId}></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900"${_scopeId}>No Notifications</h3><p class="mt-1 text-sm text-gray-500"${_scopeId}>You have no new activity from the last 30 days.</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.notifications.data.length > 0) {
              _push2(ssrRenderComponent(Pagination, {
                links: __props.notifications.links,
                class: "mt-8"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-4 sm:p-6 md:p-8 bg-white border-b" }, [
                createVNode("div", { class: "max-w-7xl mx-auto flex justify-between items-center" }, [
                  createVNode("div", null, [
                    createVNode("h1", { class: "text-2xl font-bold text-gray-900" }, "Notifications"),
                    createVNode("p", { class: "mt-1 text-sm text-gray-500" }, " A log of all important activity from the last 30 days. ")
                  ]),
                  createVNode("button", {
                    onClick: markAllAsRead,
                    class: "px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0"
                  }, " Mark All as Read ")
                ])
              ]),
              createVNode("div", { class: "py-12" }, [
                createVNode("div", { class: "max-w-7xl mx-auto sm:px-6 lg:px-8" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(groupedNotifications.value, (group, date) => {
                    return openBlock(), createBlock("div", {
                      key: date,
                      class: "mb-8"
                    }, [
                      createVNode("div", { class: "px-4 sm:px-0" }, [
                        createVNode("h2", { class: "text-lg font-semibold text-gray-700" }, toDisplayString(date), 1),
                        createVNode("hr", { class: "mt-2 mb-4" })
                      ]),
                      createVNode("div", { class: "bg-white overflow-hidden shadow-sm sm:rounded-lg" }, [
                        createVNode("ul", { class: "divide-y divide-gray-200" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(group, (notification) => {
                            return openBlock(), createBlock("li", {
                              key: notification.id
                            }, [
                              createVNode(unref(Link), {
                                href: notification.data.url,
                                class: "block p-4 sm:p-5 hover:bg-gray-50 transition duration-150 ease-in-out"
                              }, {
                                default: withCtx(() => {
                                  var _a;
                                  return [
                                    createVNode("div", { class: "flex items-start space-x-4" }, [
                                      createVNode("div", { class: "flex-shrink-0" }, [
                                        notification.data.action_user_photo ? (openBlock(), createBlock("img", {
                                          key: 0,
                                          class: "h-10 w-10 rounded-full object-cover",
                                          src: notification.data.action_user_photo,
                                          alt: notification.data.action_user_name
                                        }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                                          key: 1,
                                          class: "h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg"
                                        }, toDisplayString((_a = notification.data.action_user_name) == null ? void 0 : _a.charAt(0)), 1))
                                      ]),
                                      createVNode("div", { class: "flex-1 min-w-0" }, [
                                        createVNode("div", { class: "flex justify-between items-start" }, [
                                          createVNode("p", { class: "text-sm text-gray-800 leading-snug" }, [
                                            createVNode("strong", { class: "font-medium" }, toDisplayString(notification.data.action_user_name), 1),
                                            createTextVNode(" " + toDisplayString(notification.data.message), 1)
                                          ]),
                                          !notification.read_at ? (openBlock(), createBlock("span", {
                                            key: 0,
                                            class: "mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0",
                                            title: "Unread"
                                          })) : createCommentVNode("", true)
                                        ]),
                                        createVNode("div", { class: "mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 space-y-1" }, [
                                          createVNode("div", { class: "flex items-center" }, [
                                            (openBlock(), createBlock("svg", {
                                              class: "h-4 w-4 mr-2 text-gray-400",
                                              fill: "none",
                                              viewBox: "0 0 24 24",
                                              stroke: "currentColor"
                                            }, [
                                              createVNode("path", {
                                                "stroke-linecap": "round",
                                                "stroke-linejoin": "round",
                                                "stroke-width": "2",
                                                d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                              })
                                            ])),
                                            createVNode("span", null, [
                                              createTextVNode("Task: "),
                                              createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.task_title), 1)
                                            ])
                                          ]),
                                          createVNode("div", { class: "flex items-center" }, [
                                            (openBlock(), createBlock("svg", {
                                              class: "h-4 w-4 mr-2 text-gray-400",
                                              fill: "none",
                                              viewBox: "0 0 24 24",
                                              stroke: "currentColor"
                                            }, [
                                              createVNode("path", {
                                                "stroke-linecap": "round",
                                                "stroke-linejoin": "round",
                                                "stroke-width": "2",
                                                d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                                              })
                                            ])),
                                            createVNode("span", null, [
                                              createTextVNode("Project: "),
                                              createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.project_name), 1)
                                            ])
                                          ]),
                                          createVNode("div", { class: "flex items-center" }, [
                                            (openBlock(), createBlock("svg", {
                                              class: "h-4 w-4 mr-2 text-gray-400",
                                              fill: "none",
                                              viewBox: "0 0 24 24",
                                              stroke: "currentColor"
                                            }, [
                                              createVNode("path", {
                                                "stroke-linecap": "round",
                                                "stroke-linejoin": "round",
                                                "stroke-width": "2",
                                                d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                              })
                                            ])),
                                            createVNode("span", null, [
                                              createTextVNode("Workspace: "),
                                              createVNode("strong", { class: "font-medium text-gray-800" }, toDisplayString(notification.data.workspace_name), 1)
                                            ])
                                          ])
                                        ]),
                                        createVNode("p", { class: "text-xs text-gray-500 mt-2" }, toDisplayString(formatTimeAgo(notification.created_at)), 1)
                                      ])
                                    ])
                                  ];
                                }),
                                _: 2
                              }, 1032, ["href"])
                            ]);
                          }), 128))
                        ])
                      ])
                    ]);
                  }), 128)),
                  __props.notifications.data.length === 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-center py-16"
                  }, [
                    (openBlock(), createBlock("svg", {
                      class: "mx-auto h-12 w-12 text-gray-400",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      "aria-hidden": "true"
                    }, [
                      createVNode("path", {
                        "vector-effect": "non-scaling-stroke",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      })
                    ])),
                    createVNode("h3", { class: "mt-2 text-sm font-medium text-gray-900" }, "No Notifications"),
                    createVNode("p", { class: "mt-1 text-sm text-gray-500" }, "You have no new activity from the last 30 days.")
                  ])) : createCommentVNode("", true),
                  __props.notifications.data.length > 0 ? (openBlock(), createBlock(Pagination, {
                    key: 1,
                    links: __props.notifications.links,
                    class: "mt-8"
                  }, null, 8, ["links"])) : createCommentVNode("", true)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Notifications/Index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
