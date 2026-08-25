<template>
    <Layout>
        <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Head title="Notification Settings" />

            <!-- Enhanced Header -->
            <div class="bg-white border-b border-gray-200/60 shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="py-5 sm:py-8">
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div class="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex-shrink-0">
                                <icon name="bell" class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div class="min-w-0">
                                <h1 class="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">{{ $t('Notification Settings') }}</h1>
                                <p class="text-sm sm:text-base text-gray-600 mt-1">{{ $t('Configure email, Slack and Telegram notification preferences') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                <div class="space-y-5 sm:space-y-8">
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

                    <!-- Channel tabs — horizontally scrollable so adding more channels (Telegram, etc.) never breaks the layout -->
                    <div class="flex flex-nowrap gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-1 px-1">
                        <button
                            v-for="channel in channels"
                            :key="channel.key"
                            type="button"
                            @click="selectChannel(channel.key)"
                            class="channel-tab shrink-0 snap-start whitespace-nowrap flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
                            :class="{ 'channel-tab--active': selectedChannel === channel.key }"
                            :style="channelTabStyle(channel)"
                        >
                            <span class="channel-icon" :style="{ backgroundColor: channel.color }">
                                <icon :name="channel.icon" class="w-3.5 h-3.5 text-white" />
                            </span>
                            <span class="text-sm">{{ $t(channel.label) }}</span>
                            <span
                                class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold bg-white/85"
                                :style="{ color: channel.color }"
                            >{{ enabledCount(channel) }}</span>
                        </button>
                    </div>

                    <!-- Active channel card — only the selected channel is ever rendered here -->
                    <div
                        v-if="activeChannel"
                        :key="'panel_' + activeChannel.key"
                        class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
                    >
                        <div class="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
                            <div class="flex items-center justify-between gap-3 flex-wrap">
                                <div class="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div class="p-2 rounded-lg" :style="{ backgroundColor: hexToRgba(activeChannel.color, 0.12) }">
                                        <icon :name="activeChannel.icon" class="w-5 h-5" :style="{ color: activeChannel.color }" />
                                    </div>
                                    <h2 class="text-base sm:text-xl font-semibold text-gray-900 truncate">{{ $t(activeChannel.label + ' Notifications') }}</h2>
                                </div>
                                <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                    <span class="text-xs sm:text-sm font-medium text-gray-700">{{ $t('Master Toggle') }}</span>
                                    <button
                                        @click="toggleAll(activeChannel)"
                                        :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2']"
                                        :style="{ backgroundColor: allEnabled(activeChannel) ? activeChannel.color : '#e5e7eb' }"
                                    >
                                        <span
                                            :class="[
                                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                allEnabled(activeChannel) ? 'translate-x-6' : 'translate-x-1'
                                            ]"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-3 sm:p-6">
                            <div class="space-y-3 sm:space-y-4">
                                <div v-for="setting in settings" :key="setting.id"
                                    class="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
                                    <div class="flex-1 min-w-0">
                                        <h3 class="text-sm font-medium text-gray-900">{{ setting.name }}</h3>
                                        <p class="text-xs text-gray-500 mt-1">{{ setting.description }}</p>
                                        <div v-if="activeChannel.capabilityField && !setting[activeChannel.capabilityField]" class="mt-2">
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                <icon name="info" class="w-3 h-3 mr-1" />
                                                {{ $t(activeChannel.label + ' not supported for this notification type') }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4 flex-shrink-0">
                                        <button
                                            v-if="!activeChannel.capabilityField || setting[activeChannel.capabilityField]"
                                            @click="updateSetting(setting, activeChannel.field)"
                                            :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2']"
                                            :style="{ backgroundColor: setting[activeChannel.field] ? activeChannel.color : '#e5e7eb' }"
                                        >
                                            <span
                                                :class="[
                                                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                    setting[activeChannel.field] ? 'translate-x-6' : 'translate-x-1'
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
                                    <p>{{ $t('• Telegram notifications require a bot token and chat ID configured in Global Settings') }}</p>
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
    import { computed, ref } from 'vue';

    const props = defineProps({
        settings: Array,
    });

    const flash = computed(() => usePage().props.flash);

    const channels = [
        { key: 'in_app', field: 'is_active', label: 'In-App', icon: 'bell', color: '#4f46e5', capabilityField: null },
        { key: 'email', field: 'email_is_active', label: 'Email', icon: 'mail', color: '#f97316', capabilityField: 'can_be_emailed' },
        { key: 'slack', field: 'slack_is_active', label: 'Slack', icon: 'slack', color: '#7c3aed', capabilityField: 'can_be_slacked' },
        { key: 'telegram', field: 'telegram_is_active', label: 'Telegram', icon: 'send', color: '#0ea5e9', capabilityField: 'can_be_telegrammed' },
    ];

    const selectedChannel = ref(channels[0].key);

    const activeChannel = computed(() => channels.find(c => c.key === selectedChannel.value) || channels[0]);

    const selectChannel = (key) => {
        selectedChannel.value = key;
    };

    const enabledCount = (channel) => {
        const relevant = channel.capabilityField ? props.settings.filter(s => s[channel.capabilityField]) : props.settings;
        return relevant.filter(s => s[channel.field]).length;
    };

    const allEnabled = (channel) => {
        const relevant = channel.capabilityField ? props.settings.filter(s => s[channel.capabilityField]) : props.settings;
        if (!relevant.length) return false;
        return relevant.every(s => s[channel.field]);
    };

    const hexToRgba = (hex, alpha) => {
        const clean = (hex || '').replace('#', '');
        const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
        const num = parseInt(full, 16) || 0;
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const channelTabStyle = (channel) => {
        const isActive = selectedChannel.value === channel.key;
        if (isActive) {
            return {
                backgroundColor: channel.color,
                borderColor: channel.color,
                color: '#ffffff',
                boxShadow: `0 4px 14px -4px ${hexToRgba(channel.color, 0.55)}`,
            };
        }
        return {
            backgroundColor: hexToRgba(channel.color, 0.08),
            borderColor: hexToRgba(channel.color, 0.22),
            color: channel.color,
            boxShadow: 'none',
        };
    };

    // Method to update a single setting
    const updateSetting = (setting, field) => {
        router.patch(route('notification-settings.update', setting.id), {
            [field]: !setting[field],
        }, {
            preserveScroll: true,
        });
    };

    // Method to handle a channel's master toggle
    const toggleAll = (channel) => {
        const field = channel.field;
        const newState = !allEnabled(channel);
        props.settings.forEach(setting => {
            if (channel.capabilityField && !setting[channel.capabilityField]) {
                return;
            }
            if (setting[field] !== newState) {
                router.patch(route('notification-settings.update', setting.id), {
                    [field]: newState
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        });
    };
</script>

<style scoped>
    /* Enhanced Notification Settings Styling */

    .channel-tab {
        background: rgba(100, 116, 139, 0.06);
        border-width: 1px;
    }
    .channel-tab--active {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6) inset;
    }
    .channel-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 9999px;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

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