<template>
    <div class="main-menu">
        <!-- Menu Header -->
        <div class="menu-header">
            <div class="flex items-center space-x-3 px-4 py-3">
                <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <icon name="settings" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ $t('Settings') }}</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('System Configuration') }}</p>
                </div>
            </div>
        </div>

        <!-- Menu Items -->
        <div class="menu-content">
            <div
                v-for="(menu_item, m_index) in visibleMenuItems"
                :key="m_index"
                class="menu-item-group"
                :class="{ active: isUrl(menu_item.url) }"
            >
                <!-- Main Menu Item -->
                <div
                    class="menu-item"
                    :class="{ active: isUrl(menu_item.url), 'has-submenu': menu_item.submenu }"
                    @click="menu_item.submenu ? toggleSubmenu(m_index) : null"
                >
                    <Link
                        v-if="!menu_item.submenu"
                        class="menu-link"
                        :href="menu_item.route ? route(menu_item.route) : '#'"
                    >
                        <div class="menu-item-content">
                            <div class="menu-icon-wrapper" :class="getIconColor(menu_item.icon)">
                                <icon :name="menu_item.icon" class="w-5 h-5" />
                            </div>
                            <div class="menu-text">
                                <div class="menu-name">{{ $t(menu_item.name) }}</div>
                                <div v-if="getMenuDescription(menu_item.name)" class="menu-description">
                                    {{ $t(getMenuDescription(menu_item.name)) }}
                                </div>
                            </div>
                            <div class="menu-arrow" v-if="menu_item.submenu">
                                <icon
                                    name="chevron-right"
                                    class="w-4 h-4 transition-transform duration-200"
                                    :class="{ 'rotate-90': expandedMenus.includes(m_index) }"
                                />
                            </div>
                        </div>
                    </Link>

                    <div v-else class="menu-link cursor-pointer">
                        <div class="menu-item-content">
                            <div class="menu-icon-wrapper" :class="getIconColor(menu_item.icon)">
                                <icon :name="menu_item.icon" class="w-5 h-5" />
                            </div>
                            <div class="menu-text">
                                <div class="menu-name">{{ $t(menu_item.name) }}</div>
                                <div v-if="getMenuDescription(menu_item.name)" class="menu-description">
                                    {{ $t(getMenuDescription(menu_item.name)) }}
                                </div>
                            </div>
                            <div class="menu-arrow">
                                <icon
                                    name="chevron-right"
                                    class="w-4 h-4 transition-transform duration-200"
                                    :class="{ 'rotate-90': expandedMenus.includes(m_index) }"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Submenu Items -->
                    <div
                        v-if="menu_item.submenu"
                        class="submenu-container"
                        :class="{ expanded: expandedMenus.includes(m_index) }"
                    >
                        <div class="submenu-items">
                            <Link
                                v-for="(sub_menu_item, s_m_index) in menu_item.submenu"
                                :key="s_m_index"
                                class="submenu-item"
                                :class="{ active: isUrl(sub_menu_item.url) }"
                                :href="
                                    sub_menu_item.param
                                        ? route(sub_menu_item.route, sub_menu_item.param)
                                        : route(sub_menu_item.route)
                                "
                            >
                                <div class="submenu-item-content">
                                    <div class="submenu-icon">
                                        <icon v-if="sub_menu_item.icon" :name="sub_menu_item.icon" class="w-4 h-4" />
                                        <icon v-else name="dash" class="w-4 h-4" />
                                    </div>
                                    <div class="submenu-text">
                                        <div class="submenu-name">{{ $t(sub_menu_item.name) }}</div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import { Link } from '@inertiajs/vue3';

export default {
    components: {
        Icon,
        Link,
    },
    data() {
        return {
            user: null,
            expandedMenus: [],
            menu_items: [
                {
                    name: 'Global',
                    route: 'global',
                    url: 'settings/global',
                    icon: 'settings',
                    category: 'system',
                },
                {
                    name: 'Manage Users',
                    route: 'users',
                    url: 'settings/users',
                    icon: 'users',
                    category: 'users',
                },
                {
                    name: 'Notification Settings',
                    route: 'notification-settings.index',
                    url: 'settings/notifications',
                    icon: 'notification',
                    category: 'communication',
                },
                {
                    name: 'Pre-made Boards',
                    route: 'pre-made-boards',
                    url: 'settings/pre-made-boards',
                    icon: 'table',
                    category: 'content',
                },
                {
                    name: 'Workflow Roles',
                    route: 'workflow-roles',
                    url: 'settings/workflow-roles',
                    icon: 'checklist',
                    category: 'workflow',
                },
                {
                    name: 'Workspace Types',
                    route: 'workspace_types.index',
                    url: 'settings/workspace_types',
                    icon: 'building',
                    category: 'organization',
                },
                {
                    name: 'User Roles',
                    route: 'roles',
                    url: 'settings/roles',
                    icon: 'user_role',
                    category: 'security',
                },
                {
                    name: 'Languages',
                    route: 'languages',
                    url: 'settings/languages',
                    icon: 'globe',
                    category: 'localization',
                },
                {
                    name: 'Email Templates',
                    route: 'templates',
                    url: 'settings/templates',
                    icon: 'email',
                    category: 'communication',
                },
                {
                    name: 'SMTP Mail',
                    route: 'settings.smtp',
                    url: 'settings/smtp',
                    icon: 'server',
                    category: 'communication',
                },
                {
                    name: 'Performance',
                    route: 'settings.performance',
                    url: 'settings/performance',
                    icon: 'timeline',
                    category: 'system',
                    superAdminOnly: true,
                },
                {
                    name: 'Error Log',
                    route: 'settings.error-log',
                    url: 'settings/error-log',
                    icon: 'info',
                    category: 'system',
                    // Stack traces carry paths, SQL and payloads; the route
                    // enforces the same rule server-side (EnsureSuperAdmin).
                    superAdminOnly: true,
                },
            ],
            enable_option: {},
        };
    },
    computed: {
        /** Hide what the signed-in user may not open. `is_super_admin` is
         *  answered once by the server in HandleInertiaRequests, because
         *  Admin and Super Admin share roles.slug 'admin'. */
        visibleMenuItems() {
            const isSuperAdmin = this.$page.props.auth?.user?.is_super_admin === true;
            return this.menu_items.filter((item) => !item.superAdminOnly || isSuperAdmin);
        },
    },
    methods: {
        isUrl(...urls) {
            let currentUrl = this.$page.url.substr(1);
            currentUrl = currentUrl.replace('dashboard/', '');
            if (urls[0] === '') {
                return currentUrl === '';
            }
            return urls.filter((url) => currentUrl.startsWith(url)).length;
        },

        toggleSubmenu(index) {
            const expandedIndex = this.expandedMenus.indexOf(index);
            if (expandedIndex > -1) {
                this.expandedMenus.splice(expandedIndex, 1);
            } else {
                this.expandedMenus.push(index);
            }
        },

        getIconColor(iconName) {
            const colorMap = {
                settings: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
                users: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
                table: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300',
                checklist: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300',
                building: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
                shield: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
                globe: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300',
                mail: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
                server: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
                key: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-300',
                download: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300',
                info: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
                timeline: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300',
            };
            return colorMap[iconName] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300';
        },

        getMenuDescription(menuName) {
            const descriptions = {
                Global: 'System-wide configuration',
                'Manage Users': 'User accounts and permissions',
                'Pre-made Boards': 'Template board configurations',
                'Workflow Roles': 'Document workflow steps and roles',
                'Workspace Types': 'Organization structure settings',
                'User Roles': 'Permission and access control',
                Languages: 'Multi-language support',
                'Email Templates': 'Custom email designs',
                'SMTP Mail': 'Email server configuration',
                'Notification Settings': 'Email, Slack and Telegram alerts',
                'Latest Update': 'System updates and patches',
                'Error Log': 'Application errors and warnings',
                Performance: 'Server health and slow pages',
            };
            // Never undefined: the template hands this straight to $t(), which
            // calls .replace() on it.
            return descriptions[menuName] ?? '';
        },
    },
    created() {
        this.user = this.$page.props.auth.user;
    },
};
</script>
