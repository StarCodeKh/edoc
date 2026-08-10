<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <Head :title="title" />
    
    <!-- Enhanced Header -->
    <div class="bg-white border-b border-gray-200/60 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-8">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
              <icon name="settings" class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ $t('Global Settings') }}</h1>
              <p class="text-gray-600 mt-1">Configure your application settings and preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="update" class="space-y-8">
        <!-- Basic Application Settings -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <icon name="app" class="w-5 h-5 text-indigo-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('Basic Application Settings') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <text-input v-model="form.app_name" :error="form.errors.app_name" :label="$t('App Name')" />
              <text-input v-model="form.site_key" :error="form.errors.site_key" :label="$t('Google ReCaptcha Site Key')" />
              <select-input v-model="form.default_language" :error="form.errors.default_language" :label="$t('Default Language')">
                <option v-for="l in languages" :key="l.id" :value="l.code">{{ l.name }}</option>
              </select-input>
            </div>
            <div class="mt-6">
              <text-input v-model="form.webhook_url" :error="form.errors.webhook_url" :label="$t('Slack webhook URL')" />
            </div>
          </div>
        </div>
        <!-- Branding & Assets -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <icon name="image" class="w-5 h-5 text-purple-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('Branding & Assets') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Favicon Upload -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">{{ $t('Favicon') }}</label>
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <file-input v-model="form.favicon" :error="form.errors.favicon" type="file" accept="image/png" />
                  </div>
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img v-if="form.main_favicon" class="w-8 h-8 object-contain" :src="form.main_favicon" />
                      <icon v-else name="image" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Logo Upload -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">{{ $t('Logo') }}</label>
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <file-input v-model="form.logo" :error="form.errors.logo" type="file" accept="image/png" />
                  </div>
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img v-if="form.main_logo" class="w-8 h-8 object-contain" :src="form.main_logo" />
                      <icon v-else name="image" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- White Logo Upload -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">{{ $t('White Logo') }}</label>
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <file-input v-model="form.logo_white" :error="form.errors.logo_white" type="file" accept="image/png" />
                  </div>
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                      <img v-if="form.main_logo_white" class="w-8 h-8 object-contain" :src="form.main_logo_white" />
                      <icon v-else name="image" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- User Registration Settings -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <icon name="user-plus" class="w-5 h-5 text-green-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('User Registration') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <div class="flex items-center space-x-3">
              <div class="flex items-center h-5">
                <input id="enableRegistration" 
                       type="checkbox" 
                       v-model="form.enable_registration" 
                       class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2">
              </div>
              <div class="flex-1">
                <label for="enableRegistration" class="text-sm font-medium text-gray-900">
                  {{ $t('Enable Registration') }}
                </label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('Show Registration link on the login page') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- File Upload Settings -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <icon name="attachment" class="w-5 h-5 text-blue-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('File Upload Settings') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">{{ $t('Allowed File Types') }}</label>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="(file_type, ft_key) in form.allowed_file_types" :key="ft_key" 
                        class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                    {{ file_type }}
                    <button type="button" 
                            @click="removeFileType(ft_key)" 
                            class="inline-flex items-center p-0.5 ml-2 text-white hover:bg-white/20 rounded-full transition-colors" 
                            aria-label="Remove">
                      <icon name="close" class="w-3 h-3" />
                    </button>
                  </span>
                </div>
                <div class="relative">
                  <input v-model="newFileType" 
                         @keydown.enter.prevent="addFileType" 
                         @keydown="checkDelimiter"
                         class="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                         type="text" 
                         :placeholder="$t('Type file extensions and press enter or comma to add')" />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <icon name="plus" class="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div v-if="form.errors.allowed_file_types" class="text-red-500 text-xs mt-2">{{ form.errors.allowed_file_types }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cron Job Instructions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <icon name="clock" class="w-5 h-5 text-yellow-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('Cron Job Instructions') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 class="text-sm font-semibold text-blue-900 mb-2">{{ $t('Email Queue Setup') }}</h3>
                <p class="text-sm text-blue-800 mb-4">
                  {{ $t('To send emails without delays, set up a cron job. First, enable the queue by adding') }} 
                  <code class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">QUEUE_ENABLE=true</code> 
                  {{ $t('to your .env file.') }}
                </p>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-blue-700 mb-1">{{ $t('Standard Server Cron Job') }}</label>
                    <div class="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>*/3 * * * * /usr/bin/php artisan queue:work --queue=high,default --stop-when-empty</code>
                    </div>
                    <p class="text-xs text-blue-600 mt-1">{{ $t('Runs every 3 minutes to process email queue') }}</p>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-blue-700 mb-1">{{ $t('Shared Hosting (cPanel) Cron Job') }}</label>
                    <div class="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>*/3 * * * * wget -q -O - https://website.com/cron/queue_work >/dev/null 2>&1</code>
                    </div>
                    <p class="text-xs text-blue-600 mt-1">{{ $t('Alternative method for shared hosting providers') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom CSS -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/60">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-pink-100 rounded-lg">
                <icon name="code" class="w-5 h-5 text-pink-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('Custom CSS') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <textarea-input v-model="form.custom_css" 
                           :error="form.errors.custom_css" 
                           :rows="15" 
                           placeholder="/* Add your custom CSS here */"
                           :label="$t('Custom CSS Code')" />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <loading-button :loading="form.processing" 
                         class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                         type="submit">
            <icon name="save" class="w-5 h-5 mr-2" />
            {{ $t('Save Settings') }}
          </loading-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { Link, Head } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import Layout from '@/Shared/Layout.vue'
import Pagination from '@/Shared/Pagination.vue'
import TextInput from '@/Shared/TextInput.vue'
import TextareaInput from '@/Shared/TextareaInput.vue'
import SelectInput from '@/Shared/SelectInput.vue'
import LoadingButton from '@/Shared/LoadingButton.vue'
import FileInput from '@/Shared/FileInput.vue'

export default {
  metaInfo: { title: 'Priorities' },
  components: {
    Icon,
    Link,
      Head,
      FileInput,
    Pagination,
      TextInput,
      TextareaInput,
      SelectInput,
      LoadingButton,
  },
  layout: Layout,
  props: {
      title: String,
      settings: Object,
      languages: Array,
      pusher: Boolean,
      site_key: String,
      webhook_url: String,
  },
    remember: 'form',
  data() {
    return {
        availableFileTypes: [
          'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
          'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
          'mp3', 'wav',
          'mp4', 'webm',
          'zip', 'rar', '7z'
        ],
        newFileType: '',
        form: this.$inertia.form({
            app_name: this.settings.app_name.value,
            enable_registration: Boolean(parseInt(this.settings.enable_registration.value, 10)),
            logo: null,
            logo_white: null,
            favicon: null,
            site_key: this.site_key,
            webhook_url: this.webhook_url || '',
            main_logo: '/images/logo.png',
            main_logo_white: '/images/logo_white.png',
            main_favicon: '/favicon.png',
            default_language: this.settings.default_language.value,
            custom_css: typeof this.settings.custom_css !== 'undefined' && this.settings.custom_css ? this.settings.custom_css.value : null,
            allowed_file_types: this.settings.allowed_file_types ? this.settings.allowed_file_types.value : [],
        }),
    }
  },
    created() {
      // console.log(this.form)
    },
    methods: {
      update() {
          const vm = this;
          this.form.post(this.route('global.update'), {
              onSuccess: () => {
                  const successMessage = vm.$page.props.flash.success
                  this.form.logo = null
                  this.form.logo_white = null
                  if(successMessage){
                      window.location.reload()
                  }
              }
          })
      },
      addFileType() {
        const val = this.newFileType.trim().replace(/,/g, '');
        if (val && !this.form.allowed_file_types.includes(val)) {
          this.form.allowed_file_types.push(val);
        }
        this.newFileType = '';
      },
      checkDelimiter(e) {
        if (e.key === ',' || e.key === ' ') {
          e.preventDefault();
          this.addFileType();
        }
      },
      removeFileType(index) {
        this.form.allowed_file_types.splice(index, 1);
      }
  },
}
</script>

<style scoped>
/* Enhanced Global Settings Styling */

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

/* Enhanced form input styling */
input[type="text"], 
input[type="email"], 
input[type="password"], 
select, 
textarea {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

input[type="text"]:focus, 
input[type="email"]:focus, 
input[type="password"]:focus, 
select:focus, 
textarea:focus {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.1);
}

/* Enhanced checkbox styling */
input[type="checkbox"] {
    accent-color: #6366f1;
    transition: all 0.2s ease;
}

input[type="checkbox"]:checked {
    transform: scale(1.1);
}

/* File input styling */
input[type="file"]::-webkit-file-upload-button {
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

input[type="file"]::-webkit-file-upload-button:hover {
    background: linear-gradient(to right, #4f46e5, #7c3aed);
    transform: translateY(-1px);
}

/* Enhanced card hover effects */
.bg-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Gradient text animation */
@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.gradient-text {
    background: linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
    background-size: 400% 400%;
    animation: gradient-shift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Loading state animation */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Enhanced button hover effects */
button:hover {
    transform: translateY(-1px);
}

/* Code block styling */
code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
}

/* File type badge animations */
.inline-flex:hover {
    transform: scale(1.05);
}

/* Notification toggle hover effects */
.flex.items-center.space-x-3:hover {
    background-color: rgba(99, 102, 241, 0.05);
}

/* Enhanced focus states */
button:focus, 
input:focus, 
select:focus, 
textarea:focus {
    outline: none;
    ring: 2px;
    ring-color: rgb(99 102 241);
    ring-opacity: 0.5;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .bg-white {
        background-color: rgba(17, 24, 39, 0.95);
        border-color: rgba(55, 65, 81, 0.6);
    }
    
    .text-gray-900 {
        color: #f9fafb;
    }
    
    .text-gray-600 {
        color: #d1d5db;
    }
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
.bg-white:nth-child(5) { animation-delay: 0.5s; }
.bg-white:nth-child(6) { animation-delay: 0.6s; }
.bg-white:nth-child(7) { animation-delay: 0.7s; }

/* Enhanced shadow effects */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth transitions for all interactive elements */
* {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced backdrop blur */
.backdrop-blur-xl {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
}
</style>
