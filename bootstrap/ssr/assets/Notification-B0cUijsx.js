import { computed, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { L as Layout } from "./Layout-DXJEf-iu.js";
import { usePage, Head, router } from "@inertiajs/vue3";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  __name: "Notification",
  __ssrInlineRender: true,
  props: {
    settings: Array
  },
  setup(__props) {
    const props = __props;
    const flash = computed(() => usePage().props.flash);
    const allInAppEnabled = computed(() => props.settings.every((s) => s.is_active));
    const allEmailEnabled = computed(() => {
      const emailableSettings = props.settings.filter((s) => s.can_be_emailed);
      if (emailableSettings.length === 0) return false;
      return emailableSettings.every((s) => s.email_is_active);
    });
    const updateSetting = (setting, field) => {
      router.patch(route("notification-settings.update", setting.id), {
        [field]: !setting[field]
      }, {
        preserveScroll: true
      });
    };
    const toggleAll = (field, currentMasterState) => {
      const newState = !currentMasterState;
      props.settings.forEach((setting) => {
        if (setting[field] !== newState) {
          if (field === "email_is_active" && !setting.can_be_emailed) {
            return;
          }
          router.patch(route("notification-settings.update", setting.id), {
            [field]: newState
          }, {
            preserveState: true,
            // preserveState helps manage multiple rapid updates
            preserveScroll: true
          });
        }
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Notification Settings" }, null, _parent));
      _push(ssrRenderComponent(Layout, null, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="font-semibold text-xl text-gray-800 leading-tight"${_scopeId}> Notification Settings </h2>`);
          } else {
            return [
              createVNode("h2", { class: "font-semibold text-xl text-gray-800 leading-tight" }, " Notification Settings ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="py-12"${_scopeId}><div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8"${_scopeId}>`);
            if (flash.value.success) {
              _push2(`<div class="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert"${_scopeId}><p${_scopeId}>${ssrInterpolate(flash.value.success)}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="bg-white overflow-hidden shadow-sm sm:rounded-lg"${_scopeId}><div class="p-6 border-b border-gray-200"${_scopeId}><div class="flex justify-between items-center"${_scopeId}><div${_scopeId}><h3 class="text-lg font-medium leading-6 text-gray-900"${_scopeId}>In-App Notifications</h3><p class="mt-1 text-sm text-gray-500"${_scopeId}>Control real-time notifications that appear inside the application.</p></div><button type="button" class="${ssrRenderClass([allInAppEnabled.value ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"])}" role="switch"${_scopeId}><span class="${ssrRenderClass([allInAppEnabled.value ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"])}"${_scopeId}></span></button></div></div><ul class="divide-y divide-gray-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.settings, (setting) => {
              _push2(`<li class="flex justify-between items-center p-6 hover:bg-gray-50"${_scopeId}><div${_scopeId}><p class="font-medium text-gray-900"${_scopeId}>${ssrInterpolate(setting.name)}</p><p class="text-sm text-gray-500"${_scopeId}>${ssrInterpolate(setting.description)}</p></div><button type="button" class="${ssrRenderClass([setting.is_active ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"])}" role="switch"${_scopeId}><span class="${ssrRenderClass([setting.is_active ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"])}"${_scopeId}></span></button></li>`);
            });
            _push2(`<!--]--></ul></div><div class="bg-white overflow-hidden shadow-sm sm:rounded-lg"${_scopeId}><div class="p-6 border-b border-gray-200"${_scopeId}><div class="flex justify-between items-center"${_scopeId}><div${_scopeId}><h3 class="text-lg font-medium leading-6 text-gray-900"${_scopeId}>Email Notifications</h3><p class="mt-1 text-sm text-gray-500"${_scopeId}>Manage which notifications are sent to users&#39; email inboxes.</p></div><button type="button" class="${ssrRenderClass([allEmailEnabled.value ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"])}" role="switch"${_scopeId}><span class="${ssrRenderClass([allEmailEnabled.value ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"])}"${_scopeId}></span></button></div></div><ul class="divide-y divide-gray-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.settings, (setting) => {
              _push2(`<li class="flex justify-between items-center p-6 hover:bg-gray-50"${_scopeId}><div${_scopeId}><p class="font-medium text-gray-900"${_scopeId}>${ssrInterpolate(setting.name)}</p>`);
              if (!setting.can_be_emailed) {
                _push2(`<p class="text-xs text-gray-400 italic mt-1"${_scopeId}>Email not available for this notification type.</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button type="button"${ssrIncludeBooleanAttr(!setting.can_be_emailed) ? " disabled" : ""} class="${ssrRenderClass([setting.email_is_active ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200", { "opacity-50 cursor-not-allowed": !setting.can_be_emailed }])}" role="switch"${_scopeId}><span class="${ssrRenderClass([setting.email_is_active ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"])}"${_scopeId}></span></button></li>`);
            });
            _push2(`<!--]--></ul></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "py-12" }, [
                createVNode("div", { class: "max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8" }, [
                  flash.value.success ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md",
                    role: "alert"
                  }, [
                    createVNode("p", null, toDisplayString(flash.value.success), 1)
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "bg-white overflow-hidden shadow-sm sm:rounded-lg" }, [
                    createVNode("div", { class: "p-6 border-b border-gray-200" }, [
                      createVNode("div", { class: "flex justify-between items-center" }, [
                        createVNode("div", null, [
                          createVNode("h3", { class: "text-lg font-medium leading-6 text-gray-900" }, "In-App Notifications"),
                          createVNode("p", { class: "mt-1 text-sm text-gray-500" }, "Control real-time notifications that appear inside the application.")
                        ]),
                        createVNode("button", {
                          onClick: ($event) => toggleAll("is_active", allInAppEnabled.value),
                          type: "button",
                          class: [allInAppEnabled.value ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"],
                          role: "switch"
                        }, [
                          createVNode("span", {
                            class: [allInAppEnabled.value ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"]
                          }, null, 2)
                        ], 10, ["onClick"])
                      ])
                    ]),
                    createVNode("ul", { class: "divide-y divide-gray-200" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.settings, (setting) => {
                        return openBlock(), createBlock("li", {
                          key: setting.id + "-app",
                          class: "flex justify-between items-center p-6 hover:bg-gray-50"
                        }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "font-medium text-gray-900" }, toDisplayString(setting.name), 1),
                            createVNode("p", { class: "text-sm text-gray-500" }, toDisplayString(setting.description), 1)
                          ]),
                          createVNode("button", {
                            onClick: ($event) => updateSetting(setting, "is_active"),
                            type: "button",
                            class: [setting.is_active ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"],
                            role: "switch"
                          }, [
                            createVNode("span", {
                              class: [setting.is_active ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"]
                            }, null, 2)
                          ], 10, ["onClick"])
                        ]);
                      }), 128))
                    ])
                  ]),
                  createVNode("div", { class: "bg-white overflow-hidden shadow-sm sm:rounded-lg" }, [
                    createVNode("div", { class: "p-6 border-b border-gray-200" }, [
                      createVNode("div", { class: "flex justify-between items-center" }, [
                        createVNode("div", null, [
                          createVNode("h3", { class: "text-lg font-medium leading-6 text-gray-900" }, "Email Notifications"),
                          createVNode("p", { class: "mt-1 text-sm text-gray-500" }, "Manage which notifications are sent to users' email inboxes.")
                        ]),
                        createVNode("button", {
                          onClick: ($event) => toggleAll("email_is_active", allEmailEnabled.value),
                          type: "button",
                          class: [allEmailEnabled.value ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200"],
                          role: "switch"
                        }, [
                          createVNode("span", {
                            class: [allEmailEnabled.value ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"]
                          }, null, 2)
                        ], 10, ["onClick"])
                      ])
                    ]),
                    createVNode("ul", { class: "divide-y divide-gray-200" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.settings, (setting) => {
                        return openBlock(), createBlock("li", {
                          key: setting.id + "-email",
                          class: "flex justify-between items-center p-6 hover:bg-gray-50"
                        }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "font-medium text-gray-900" }, toDisplayString(setting.name), 1),
                            !setting.can_be_emailed ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-xs text-gray-400 italic mt-1"
                            }, "Email not available for this notification type.")) : createCommentVNode("", true)
                          ]),
                          createVNode("button", {
                            onClick: ($event) => updateSetting(setting, "email_is_active"),
                            type: "button",
                            disabled: !setting.can_be_emailed,
                            class: [setting.email_is_active ? "bg-blue-600" : "bg-gray-200", "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200", { "opacity-50 cursor-not-allowed": !setting.can_be_emailed }],
                            role: "switch"
                          }, [
                            createVNode("span", {
                              class: [setting.email_is_active ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition"]
                            }, null, 2)
                          ], 10, ["onClick", "disabled"])
                        ]);
                      }), 128))
                    ])
                  ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Notification.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
