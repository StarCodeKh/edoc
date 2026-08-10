<template>

    <Layout>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <Head title="Notification Settings" />

    <!-- Enhanced Header -->
    <div class="bg-white border-b border-gray-200/60 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-8">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
              <icon name="bell" class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ $t('Notification Settings') }}</h1>
              <p class="text-gray-600 mt-1">Configure email and Slack notification preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Flash Messages -->
        <div v-if="flash.success" class="bg-green-50 border border-green-200 rounded-xl p-4">
          <div class="flex items-center">
            <icon name="check-circle" class="w-5 h-5 text-green-600 mr-2" />
            <p class="text-green-800 font-medium">{{ flash.success }}</p>
          </div>
        </div>

        <div v-if="flash.error" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center">
            <icon name="exclamation-circle" class="w-5 h-5 text-red-600 mr-2" />
            <p class="text-red-800 font-medium">{{ flash.error }}</p>
          </div>
        </div>

        <!-- In-App Notifications -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <icon name="bell" class="w-5 h-5 text-blue-600" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900">{{ $t('In-App Notifications') }}</h2>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">{{ $t('Master Toggle') }}</span>
                <button
                  @click="toggleAll('is_active', allInAppEnabled)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    allInAppEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      allInAppEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="setting in settings" :key="setting.id" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ setting.name }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ setting.description }}</p>
                </div>
                <div class="flex items-center space-x-4">
                  <button
                    @click="updateSetting(setting, 'is_active')"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                      setting.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        setting.is_active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Notifications -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-orange-100 rounded-lg">
                  <icon name="mail" class="w-5 h-5 text-orange-600" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900">{{ $t('Email Notifications') }}</h2>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">{{ $t('Master Toggle') }}</span>
                <button
                  @click="toggleAll('email_is_active', allEmailEnabled)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                    allEmailEnabled ? 'bg-orange-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      allEmailEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="setting in settings" :key="setting.id" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ setting.name }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ setting.description }}</p>
                  <div v-if="!setting.can_be_emailed" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <icon name="info" class="w-3 h-3 mr-1" />
                      {{ $t('Email not supported for this notification type') }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <button
                    v-if="setting.can_be_emailed"
                    @click="updateSetting(setting, 'email_is_active')"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                      setting.email_is_active ? 'bg-orange-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        setting.email_is_active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                  <div v-else class="flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full">
                    <icon name="minus" class="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slack Notifications -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <icon name="slack" class="w-5 h-5 text-purple-600" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900">{{ $t('Slack Notifications') }}</h2>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">{{ $t('Master Toggle') }}</span>
                <button
                  @click="toggleAll('slack_is_active', allSlackEnabled)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                    allSlackEnabled ? 'bg-purple-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      allSlackEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="setting in settings" :key="setting.id" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ setting.name }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ setting.description }}</p>
                  <div v-if="!setting.can_be_slacked" class="mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <icon name="info" class="w-3 h-3 mr-1" />
                      {{ $t('Slack not supported for this notification type') }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <button
                    v-if="setting.can_be_slacked"
                    @click="updateSetting(setting, 'slack_is_active')"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                      setting.slack_is_active ? 'bg-purple-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        setting.slack_is_active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                  <div v-else class="flex items-center justify-center w-11 h-6 bg-gray-100 rounded-full">
                    <icon name="minus" class="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div class="flex items-start space-x-3">
            <icon name="information-circle" class="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-blue-900 mb-2">{{ $t('Configuration Information') }}</h3>
              <div class="text-sm text-blue-800 space-y-2">
                <p>{{ $t('• In-App notifications are always enabled when the notification type is active') }}</p>
                <p>{{ $t('• Email notifications require SMTP configuration in Global Settings') }}</p>
                <p>{{ $t('• Slack notifications require a webhook URL configured in Global Settings') }}</p>
                <p>{{ $t('• Some notification types may not support all delivery methods') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
        </Layout>
</template>

<script setup>
import Layout from '@/Shared/Layout.vue'
import { Head, router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    settings: Array,
});

const flash = computed(() => usePage().props.flash);

// Computed properties to check the state of all toggles in a group
const allInAppEnabled = computed(() => props.settings.every(s => s.is_active));
const allEmailEnabled = computed(() => {
    // Only consider settings that *can* be emailed
    const emailableSettings = props.settings.filter(s => s.can_be_emailed);
    if (emailableSettings.length === 0) return false;
    return emailableSettings.every(s => s.email_is_active);
});
const allSlackEnabled = computed(() => {
    // Only consider settings that *can* be slacked
    const slackableSettings = props.settings.filter(s => s.can_be_slacked);
    if (slackableSettings.length === 0) return false;
    return slackableSettings.every(s => s.slack_is_active);
});

// Method to update a single setting
const updateSetting = (setting, field) => {
    router.patch(route('notification-settings.update', setting.id), {
        [field]: !setting[field],
    }, {
        preserveScroll: true,
    });
};

// Method to handle the master toggles
const toggleAll = (field, currentMasterState) => {
    const newState = !currentMasterState;
    props.settings.forEach(setting => {
        // Only update if the setting's state is different from the new desired state
        if (setting[field] !== newState) {
            // For email, only toggle settings that support it
            if (field === 'email_is_active' && !setting.can_be_emailed) {
                return;
            }
            // For slack, only toggle settings that support it
            if (field === 'slack_is_active' && !setting.can_be_slacked) {
                return;
            }
            // Note: This makes multiple requests. For a large number of settings,
            // a dedicated bulk update endpoint would be more performant.
            router.patch(route('notification-settings.update', setting.id), {
                [field]: newState
            }, {
                preserveState: true, // preserveState helps manage multiple rapid updates
                preserveScroll: true,
            });
        }
    });
};
</script>

<style scoped>
/* Enhanced Notification Settings Styling */

/* Custom scrollbar for the page */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Standard toggle switch styling */
.relative.inline-flex.h-6.w-11 {
    transition: background-color 0.2s ease-in-out;
}

/* Disabled state styling */
.flex.items-center.justify-center.w-11.h-6.bg-gray-100 {
    transition: background-color 0.2s ease-in-out;
}

/* Enhanced card hover effects */
.bg-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Animation for form sections */
.bg-white {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Staggered animation for cards */
.bg-white:nth-child(1) { animation-delay: 0.1s; }
.bg-white:nth-child(2) { animation-delay: 0.2s; }
.bg-white:nth-child(3) { animation-delay: 0.3s; }
.bg-white:nth-child(4) { animation-delay: 0.4s; }

/* Enhanced shadow effects */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Smooth transitions for all interactive elements */
* {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
.relative.inline-flex.h-6.w-11:focus {
    outline: none;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .flex.items-center.justify-between {
        flex-direction: column;
        align-items: flex-start;
        space-y: 1rem;
    }
    
}
</style>
