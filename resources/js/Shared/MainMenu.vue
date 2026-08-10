<template>
  <div class="main-menu">
    <!-- Menu Header -->
    <div class="menu-header">
      <div class="flex items-center space-x-3 px-4 py-3">
        <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <icon name="settings" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('Settings') }}</h2>
          <p class="text-xs text-gray-500">{{ $t('System Configuration') }}</p>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="menu-content">
      <div v-for="(menu_item, m_index) in menu_items" :key="m_index"
           class="menu-item-group"
           :class="{ 'active': isUrl(menu_item.url) }">

        <!-- Main Menu Item -->
        <div class="menu-item"
             :class="{ 'active': isUrl(menu_item.url), 'has-submenu': menu_item.submenu }"
             @click="menu_item.submenu ? toggleSubmenu(m_index) : null">

          <Link v-if="!menu_item.submenu"
                class="menu-link"
                :href="menu_item.route ? route(menu_item.route) : '#'">
            <div class="menu-item-content">
              <div class="menu-icon-wrapper" :class="getIconColor(menu_item.icon)">
                <icon :name="menu_item.icon" class="w-5 h-5" />
              </div>
              <div class="menu-text">
                <div class="menu-name">{{ $t(menu_item.name) }}</div>
                <div class="menu-description">{{ getMenuDescription(menu_item.name) }}</div>
              </div>
              <div class="menu-arrow" v-if="menu_item.submenu">
                <icon name="chevron-right" class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-90': expandedMenus.includes(m_index) }" />
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
                <div class="menu-description">{{ getMenuDescription(menu_item.name) }}</div>
              </div>
              <div class="menu-arrow">
                <icon name="chevron-right" class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-90': expandedMenus.includes(m_index) }" />
              </div>
            </div>
          </div>

          <!-- Submenu Items -->
          <div v-if="menu_item.submenu"
               class="submenu-container"
               :class="{ 'expanded': expandedMenus.includes(m_index) }">
            <div class="submenu-items">
              <Link v-for="(sub_menu_item, s_m_index) in menu_item.submenu"
                    :key="s_m_index"
                    class="submenu-item"
                    :class="{ 'active': isUrl(sub_menu_item.url) }"
                    :href="sub_menu_item.param ? route(sub_menu_item.route, sub_menu_item.param) : route(sub_menu_item.route)">
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
import Icon from '@/Shared/Icon.vue'
import { Link } from '@inertiajs/vue3'

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
          'name': 'Global',
          'route': 'global',
          'url': 'settings/global',
          'icon': 'settings',
          'category': 'system'
        },
        {
          'name': 'Manage Users',
          'route': 'users',
          'url': 'settings/users',
          'icon': 'users',
          'category': 'users'
        },
          {
              'name': 'Notification Settings',
              'route': 'notification-settings.index',
              'url': 'settings/notifications',
              'icon': 'notification',
              'category': 'communication'
          },
        {
          'name': 'Pre-made Boards',
          'route': 'pre-made-boards',
          'url': 'settings/pre-made-boards',
          'icon': 'table',
          'category': 'content'
        },
        {
          'name': 'Workspace Types',
          'route': 'workspace_types.index',
          'url': 'settings/workspace_types',
          'icon': 'building',
          'category': 'organization'
        },
        {
          'name': 'User Roles',
          'route': 'roles',
          'url': 'settings/roles',
          'icon': 'user_role',
          'category': 'security'
        },
        {
          'name': 'Languages',
          'route': 'languages',
          'url': 'settings/languages',
          'icon': 'globe',
          'category': 'localization'
        },
        {
          'name': 'Email Templates',
          'route': 'templates',
          'url': 'settings/templates',
          'icon': 'email',
          'category': 'communication'
        },
        {
          'name': 'SMTP Mail',
          'route': 'settings.smtp',
          'url': 'settings/smtp',
          'icon': 'server',
          'category': 'communication'
        },

        {
          'name': 'License',
          'route': 'license.settings',
          'url': 'settings/license',
          'icon': 'key',
          'category': 'system'
        },
        {
          'name': 'Latest Update',
          'route': 'settings.update',
          'url': 'settings/update',
          'icon': 'download',
          'category': 'system'
        }
      ],
      enable_option: {}
    }
  },
  methods: {
    isUrl(...urls) {
      let currentUrl = this.$page.url.substr(1)
      currentUrl = currentUrl.replace('dashboard/', '')
      if (urls[0] === '') {
        return currentUrl === ''
      }
      return urls.filter(url => currentUrl.startsWith(url)).length
    },

    toggleSubmenu(index) {
      const expandedIndex = this.expandedMenus.indexOf(index)
      if (expandedIndex > -1) {
        this.expandedMenus.splice(expandedIndex, 1)
      } else {
        this.expandedMenus.push(index)
      }
    },

    getIconColor(iconName) {
      const colorMap = {
        'settings': 'bg-indigo-100 text-indigo-600',
        'users': 'bg-blue-100 text-blue-600',
        'table': 'bg-green-100 text-green-600',
        'building': 'bg-purple-100 text-purple-600',
        'shield': 'bg-red-100 text-red-600',
        'globe': 'bg-cyan-100 text-cyan-600',
        'mail': 'bg-orange-100 text-orange-600',
        'server': 'bg-gray-100 text-gray-600',
        'key': 'bg-yellow-100 text-yellow-600',
        'download': 'bg-pink-100 text-pink-600'
      }
      return colorMap[iconName] || 'bg-gray-100 text-gray-600'
    },

    getMenuDescription(menuName) {
      const descriptions = {
        'Global': 'System-wide configuration',
        'Manage Users': 'User accounts and permissions',
        'Pre-made Boards': 'Template board configurations',
        'Workspace Types': 'Organization structure settings',
        'User Roles': 'Permission and access control',
        'Languages': 'Multi-language support',
        'Email Templates': 'Custom email designs',
        'SMTP Mail': 'Email server configuration',
        'Latest Update': 'System updates and patches'
      }
      return descriptions[menuName] || 'Configuration option'
    }
  },
  created() {
    this.user = this.$page.props.auth.user
  }
}
</script>
