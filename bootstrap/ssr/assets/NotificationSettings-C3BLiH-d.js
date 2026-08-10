import { computed, resolveComponent, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, createTextVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import { L as Layout } from "./Layout-DXJEf-iu.js";
import { usePage, Head, router } from "@inertiajs/vue3";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  __name: "NotificationSettings",
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
    const allSlackEnabled = computed(() => {
      const slackableSettings = props.settings.filter((s) => s.can_be_slacked);
      if (slackableSettings.length === 0) return false;
      return slackableSettings.every((s) => s.slack_is_active);
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
          if (field === "slack_is_active" && !setting.can_be_slacked) {
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
      const _component_icon = resolveComponent("icon");
      _push(ssrRenderComponent(Layout, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Head), { title: "Notification Settings" }, null, _parent2, _scopeId));
            _push2(`<div class="bg-white border-b border-gray-200/60 shadow-sm" data-v-0f8c574e${_scopeId}><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-0f8c574e${_scopeId}><div class="py-8" data-v-0f8c574e${_scopeId}><div class="flex items-center space-x-4" data-v-0f8c574e${_scopeId}><div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "bell",
              class: "w-8 h-8 text-white"
            }, null, _parent2, _scopeId));
            _push2(`</div><div data-v-0f8c574e${_scopeId}><h1 class="text-3xl font-bold text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Notification Settings"))}</h1><p class="text-gray-600 mt-1" data-v-0f8c574e${_scopeId}>Configure email and Slack notification preferences</p></div></div></div></div></div><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-v-0f8c574e${_scopeId}><div class="space-y-8" data-v-0f8c574e${_scopeId}>`);
            if (flash.value.success) {
              _push2(`<div class="bg-green-50 border border-green-200 rounded-xl p-4" data-v-0f8c574e${_scopeId}><div class="flex items-center" data-v-0f8c574e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                name: "check-circle",
                class: "w-5 h-5 text-green-600 mr-2"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-green-800 font-medium" data-v-0f8c574e${_scopeId}>${ssrInterpolate(flash.value.success)}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (flash.value.error) {
              _push2(`<div class="bg-red-50 border border-red-200 rounded-xl p-4" data-v-0f8c574e${_scopeId}><div class="flex items-center" data-v-0f8c574e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_icon, {
                name: "exclamation-circle",
                class: "w-5 h-5 text-red-600 mr-2"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-red-800 font-medium" data-v-0f8c574e${_scopeId}>${ssrInterpolate(flash.value.error)}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-0f8c574e${_scopeId}><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-0f8c574e${_scopeId}><div class="flex items-center justify-between" data-v-0f8c574e${_scopeId}><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><div class="p-2 bg-blue-100 rounded-lg" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "bell",
              class: "w-5 h-5 text-blue-600"
            }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("In-App Notifications"))}</h2></div><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><span class="text-sm font-medium text-gray-700" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Master Toggle"))}</span><button class="${ssrRenderClass([
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              allInAppEnabled.value ? "bg-indigo-600" : "bg-gray-200"
            ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              allInAppEnabled.value ? "translate-x-6" : "translate-x-1"
            ])}" data-v-0f8c574e${_scopeId}></span></button></div></div></div><div class="p-6" data-v-0f8c574e${_scopeId}><div class="space-y-4" data-v-0f8c574e${_scopeId}><!--[-->`);
            ssrRenderList(__props.settings, (setting) => {
              _push2(`<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200" data-v-0f8c574e${_scopeId}><div class="flex-1" data-v-0f8c574e${_scopeId}><h3 class="text-sm font-medium text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.name)}</h3><p class="text-xs text-gray-500 mt-1" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.description)}</p></div><div class="flex items-center space-x-4" data-v-0f8c574e${_scopeId}><button class="${ssrRenderClass([
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                setting.is_active ? "bg-indigo-600" : "bg-gray-200"
              ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                setting.is_active ? "translate-x-6" : "translate-x-1"
              ])}" data-v-0f8c574e${_scopeId}></span></button></div></div>`);
            });
            _push2(`<!--]--></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-0f8c574e${_scopeId}><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-0f8c574e${_scopeId}><div class="flex items-center justify-between" data-v-0f8c574e${_scopeId}><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><div class="p-2 bg-orange-100 rounded-lg" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "mail",
              class: "w-5 h-5 text-orange-600"
            }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Email Notifications"))}</h2></div><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><span class="text-sm font-medium text-gray-700" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Master Toggle"))}</span><button class="${ssrRenderClass([
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
              allEmailEnabled.value ? "bg-orange-600" : "bg-gray-200"
            ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              allEmailEnabled.value ? "translate-x-6" : "translate-x-1"
            ])}" data-v-0f8c574e${_scopeId}></span></button></div></div></div><div class="p-6" data-v-0f8c574e${_scopeId}><div class="space-y-4" data-v-0f8c574e${_scopeId}><!--[-->`);
            ssrRenderList(__props.settings, (setting) => {
              _push2(`<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200" data-v-0f8c574e${_scopeId}><div class="flex-1" data-v-0f8c574e${_scopeId}><h3 class="text-sm font-medium text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.name)}</h3><p class="text-xs text-gray-500 mt-1" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.description)}</p>`);
              if (!setting.can_be_emailed) {
                _push2(`<div class="mt-2" data-v-0f8c574e${_scopeId}><span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" data-v-0f8c574e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  name: "info",
                  class: "w-3 h-3 mr-1"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Email not supported for this notification type"))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex items-center space-x-4" data-v-0f8c574e${_scopeId}>`);
              if (setting.can_be_emailed) {
                _push2(`<button class="${ssrRenderClass([
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                  setting.email_is_active ? "bg-orange-600" : "bg-gray-200"
                ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  setting.email_is_active ? "translate-x-6" : "translate-x-1"
                ])}" data-v-0f8c574e${_scopeId}></span></button>`);
              } else {
                _push2(`<div class="flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full" data-v-0f8c574e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  name: "minus",
                  class: "w-3 h-3 text-gray-400"
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]--></div></div></div><div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" data-v-0f8c574e${_scopeId}><div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" data-v-0f8c574e${_scopeId}><div class="flex items-center justify-between" data-v-0f8c574e${_scopeId}><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><div class="p-2 bg-purple-100 rounded-lg" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "slack",
              class: "w-5 h-5 text-purple-600"
            }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-xl font-semibold text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Slack Notifications"))}</h2></div><div class="flex items-center space-x-3" data-v-0f8c574e${_scopeId}><span class="text-sm font-medium text-gray-700" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Master Toggle"))}</span><button class="${ssrRenderClass([
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              allSlackEnabled.value ? "bg-purple-600" : "bg-gray-200"
            ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              allSlackEnabled.value ? "translate-x-6" : "translate-x-1"
            ])}" data-v-0f8c574e${_scopeId}></span></button></div></div></div><div class="p-6" data-v-0f8c574e${_scopeId}><div class="space-y-4" data-v-0f8c574e${_scopeId}><!--[-->`);
            ssrRenderList(__props.settings, (setting) => {
              _push2(`<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200" data-v-0f8c574e${_scopeId}><div class="flex-1" data-v-0f8c574e${_scopeId}><h3 class="text-sm font-medium text-gray-900" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.name)}</h3><p class="text-xs text-gray-500 mt-1" data-v-0f8c574e${_scopeId}>${ssrInterpolate(setting.description)}</p>`);
              if (!setting.can_be_slacked) {
                _push2(`<div class="mt-2" data-v-0f8c574e${_scopeId}><span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" data-v-0f8c574e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  name: "info",
                  class: "w-3 h-3 mr-1"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(_ctx.$t("Slack not supported for this notification type"))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex items-center space-x-4" data-v-0f8c574e${_scopeId}>`);
              if (setting.can_be_slacked) {
                _push2(`<button class="${ssrRenderClass([
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                  setting.slack_is_active ? "bg-purple-600" : "bg-gray-200"
                ])}" data-v-0f8c574e${_scopeId}><span class="${ssrRenderClass([
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  setting.slack_is_active ? "translate-x-6" : "translate-x-1"
                ])}" data-v-0f8c574e${_scopeId}></span></button>`);
              } else {
                _push2(`<div class="flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full" data-v-0f8c574e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_icon, {
                  name: "minus",
                  class: "w-3 h-3 text-gray-400"
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]--></div></div></div><div class="bg-blue-50 border border-blue-200 rounded-xl p-6" data-v-0f8c574e${_scopeId}><div class="flex items-start space-x-3" data-v-0f8c574e${_scopeId}>`);
            _push2(ssrRenderComponent(_component_icon, {
              name: "information-circle",
              class: "w-6 h-6 text-blue-600 mt-0.5"
            }, null, _parent2, _scopeId));
            _push2(`<div data-v-0f8c574e${_scopeId}><h3 class="text-sm font-semibold text-blue-900 mb-2" data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("Configuration Information"))}</h3><div class="text-sm text-blue-800 space-y-2" data-v-0f8c574e${_scopeId}><p data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("• In-App notifications are always enabled when the notification type is active"))}</p><p data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("• Email notifications require SMTP configuration in Global Settings"))}</p><p data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("• Slack notifications require a webhook URL configured in Global Settings"))}</p><p data-v-0f8c574e${_scopeId}>${ssrInterpolate(_ctx.$t("• Some notification types may not support all delivery methods"))}</p></div></div></div></div></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" }, [
                createVNode(unref(Head), { title: "Notification Settings" }),
                createVNode("div", { class: "bg-white border-b border-gray-200/60 shadow-sm" }, [
                  createVNode("div", { class: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, [
                    createVNode("div", { class: "py-8" }, [
                      createVNode("div", { class: "flex items-center space-x-4" }, [
                        createVNode("div", { class: "p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl" }, [
                          createVNode(_component_icon, {
                            name: "bell",
                            class: "w-8 h-8 text-white"
                          })
                        ]),
                        createVNode("div", null, [
                          createVNode("h1", { class: "text-3xl font-bold text-gray-900" }, toDisplayString(_ctx.$t("Notification Settings")), 1),
                          createVNode("p", { class: "text-gray-600 mt-1" }, "Configure email and Slack notification preferences")
                        ])
                      ])
                    ])
                  ])
                ]),
                createVNode("div", { class: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" }, [
                  createVNode("div", { class: "space-y-8" }, [
                    flash.value.success ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "bg-green-50 border border-green-200 rounded-xl p-4"
                    }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode(_component_icon, {
                          name: "check-circle",
                          class: "w-5 h-5 text-green-600 mr-2"
                        }),
                        createVNode("p", { class: "text-green-800 font-medium" }, toDisplayString(flash.value.success), 1)
                      ])
                    ])) : createCommentVNode("", true),
                    flash.value.error ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "bg-red-50 border border-red-200 rounded-xl p-4"
                    }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode(_component_icon, {
                          name: "exclamation-circle",
                          class: "w-5 h-5 text-red-600 mr-2"
                        }),
                        createVNode("p", { class: "text-red-800 font-medium" }, toDisplayString(flash.value.error), 1)
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" }, [
                      createVNode("div", { class: "px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" }, [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("div", { class: "p-2 bg-blue-100 rounded-lg" }, [
                              createVNode(_component_icon, {
                                name: "bell",
                                class: "w-5 h-5 text-blue-600"
                              })
                            ]),
                            createVNode("h2", { class: "text-xl font-semibold text-gray-900" }, toDisplayString(_ctx.$t("In-App Notifications")), 1)
                          ]),
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("span", { class: "text-sm font-medium text-gray-700" }, toDisplayString(_ctx.$t("Master Toggle")), 1),
                            createVNode("button", {
                              onClick: ($event) => toggleAll("is_active", allInAppEnabled.value),
                              class: [
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                allInAppEnabled.value ? "bg-indigo-600" : "bg-gray-200"
                              ]
                            }, [
                              createVNode("span", {
                                class: [
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  allInAppEnabled.value ? "translate-x-6" : "translate-x-1"
                                ]
                              }, null, 2)
                            ], 10, ["onClick"])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "p-6" }, [
                        createVNode("div", { class: "space-y-4" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.settings, (setting) => {
                            return openBlock(), createBlock("div", {
                              key: setting.id,
                              class: "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                            }, [
                              createVNode("div", { class: "flex-1" }, [
                                createVNode("h3", { class: "text-sm font-medium text-gray-900" }, toDisplayString(setting.name), 1),
                                createVNode("p", { class: "text-xs text-gray-500 mt-1" }, toDisplayString(setting.description), 1)
                              ]),
                              createVNode("div", { class: "flex items-center space-x-4" }, [
                                createVNode("button", {
                                  onClick: ($event) => updateSetting(setting, "is_active"),
                                  class: [
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                    setting.is_active ? "bg-indigo-600" : "bg-gray-200"
                                  ]
                                }, [
                                  createVNode("span", {
                                    class: [
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      setting.is_active ? "translate-x-6" : "translate-x-1"
                                    ]
                                  }, null, 2)
                                ], 10, ["onClick"])
                              ])
                            ]);
                          }), 128))
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" }, [
                      createVNode("div", { class: "px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" }, [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("div", { class: "p-2 bg-orange-100 rounded-lg" }, [
                              createVNode(_component_icon, {
                                name: "mail",
                                class: "w-5 h-5 text-orange-600"
                              })
                            ]),
                            createVNode("h2", { class: "text-xl font-semibold text-gray-900" }, toDisplayString(_ctx.$t("Email Notifications")), 1)
                          ]),
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("span", { class: "text-sm font-medium text-gray-700" }, toDisplayString(_ctx.$t("Master Toggle")), 1),
                            createVNode("button", {
                              onClick: ($event) => toggleAll("email_is_active", allEmailEnabled.value),
                              class: [
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                                allEmailEnabled.value ? "bg-orange-600" : "bg-gray-200"
                              ]
                            }, [
                              createVNode("span", {
                                class: [
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  allEmailEnabled.value ? "translate-x-6" : "translate-x-1"
                                ]
                              }, null, 2)
                            ], 10, ["onClick"])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "p-6" }, [
                        createVNode("div", { class: "space-y-4" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.settings, (setting) => {
                            return openBlock(), createBlock("div", {
                              key: setting.id,
                              class: "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                            }, [
                              createVNode("div", { class: "flex-1" }, [
                                createVNode("h3", { class: "text-sm font-medium text-gray-900" }, toDisplayString(setting.name), 1),
                                createVNode("p", { class: "text-xs text-gray-500 mt-1" }, toDisplayString(setting.description), 1),
                                !setting.can_be_emailed ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "mt-2"
                                }, [
                                  createVNode("span", { class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" }, [
                                    createVNode(_component_icon, {
                                      name: "info",
                                      class: "w-3 h-3 mr-1"
                                    }),
                                    createTextVNode(" " + toDisplayString(_ctx.$t("Email not supported for this notification type")), 1)
                                  ])
                                ])) : createCommentVNode("", true)
                              ]),
                              createVNode("div", { class: "flex items-center space-x-4" }, [
                                setting.can_be_emailed ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  onClick: ($event) => updateSetting(setting, "email_is_active"),
                                  class: [
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                                    setting.email_is_active ? "bg-orange-600" : "bg-gray-200"
                                  ]
                                }, [
                                  createVNode("span", {
                                    class: [
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      setting.email_is_active ? "translate-x-6" : "translate-x-1"
                                    ]
                                  }, null, 2)
                                ], 10, ["onClick"])) : (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full"
                                }, [
                                  createVNode(_component_icon, {
                                    name: "minus",
                                    class: "w-3 h-3 text-gray-400"
                                  })
                                ]))
                              ])
                            ]);
                          }), 128))
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden" }, [
                      createVNode("div", { class: "px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60" }, [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("div", { class: "p-2 bg-purple-100 rounded-lg" }, [
                              createVNode(_component_icon, {
                                name: "slack",
                                class: "w-5 h-5 text-purple-600"
                              })
                            ]),
                            createVNode("h2", { class: "text-xl font-semibold text-gray-900" }, toDisplayString(_ctx.$t("Slack Notifications")), 1)
                          ]),
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("span", { class: "text-sm font-medium text-gray-700" }, toDisplayString(_ctx.$t("Master Toggle")), 1),
                            createVNode("button", {
                              onClick: ($event) => toggleAll("slack_is_active", allSlackEnabled.value),
                              class: [
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                                allSlackEnabled.value ? "bg-purple-600" : "bg-gray-200"
                              ]
                            }, [
                              createVNode("span", {
                                class: [
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  allSlackEnabled.value ? "translate-x-6" : "translate-x-1"
                                ]
                              }, null, 2)
                            ], 10, ["onClick"])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "p-6" }, [
                        createVNode("div", { class: "space-y-4" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.settings, (setting) => {
                            return openBlock(), createBlock("div", {
                              key: setting.id,
                              class: "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                            }, [
                              createVNode("div", { class: "flex-1" }, [
                                createVNode("h3", { class: "text-sm font-medium text-gray-900" }, toDisplayString(setting.name), 1),
                                createVNode("p", { class: "text-xs text-gray-500 mt-1" }, toDisplayString(setting.description), 1),
                                !setting.can_be_slacked ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "mt-2"
                                }, [
                                  createVNode("span", { class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" }, [
                                    createVNode(_component_icon, {
                                      name: "info",
                                      class: "w-3 h-3 mr-1"
                                    }),
                                    createTextVNode(" " + toDisplayString(_ctx.$t("Slack not supported for this notification type")), 1)
                                  ])
                                ])) : createCommentVNode("", true)
                              ]),
                              createVNode("div", { class: "flex items-center space-x-4" }, [
                                setting.can_be_slacked ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  onClick: ($event) => updateSetting(setting, "slack_is_active"),
                                  class: [
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                                    setting.slack_is_active ? "bg-purple-600" : "bg-gray-200"
                                  ]
                                }, [
                                  createVNode("span", {
                                    class: [
                                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                      setting.slack_is_active ? "translate-x-6" : "translate-x-1"
                                    ]
                                  }, null, 2)
                                ], 10, ["onClick"])) : (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full"
                                }, [
                                  createVNode(_component_icon, {
                                    name: "minus",
                                    class: "w-3 h-3 text-gray-400"
                                  })
                                ]))
                              ])
                            ]);
                          }), 128))
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "bg-blue-50 border border-blue-200 rounded-xl p-6" }, [
                      createVNode("div", { class: "flex items-start space-x-3" }, [
                        createVNode(_component_icon, {
                          name: "information-circle",
                          class: "w-6 h-6 text-blue-600 mt-0.5"
                        }),
                        createVNode("div", null, [
                          createVNode("h3", { class: "text-sm font-semibold text-blue-900 mb-2" }, toDisplayString(_ctx.$t("Configuration Information")), 1),
                          createVNode("div", { class: "text-sm text-blue-800 space-y-2" }, [
                            createVNode("p", null, toDisplayString(_ctx.$t("• In-App notifications are always enabled when the notification type is active")), 1),
                            createVNode("p", null, toDisplayString(_ctx.$t("• Email notifications require SMTP configuration in Global Settings")), 1),
                            createVNode("p", null, toDisplayString(_ctx.$t("• Slack notifications require a webhook URL configured in Global Settings")), 1),
                            createVNode("p", null, toDisplayString(_ctx.$t("• Some notification types may not support all delivery methods")), 1)
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/NotificationSettings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const NotificationSettings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0f8c574e"]]);
export {
  NotificationSettings as default
};
