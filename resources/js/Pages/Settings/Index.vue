<template>
    <div class="settings-page">
        <Head :title="title" />

        <!-- Page header -->
        <header class="settings-header">
            <div class="settings-container">
                <div class="flex items-center gap-3 sm:gap-4 py-5 sm:py-6">
                    <span class="settings-header__icon">
                        <icon name="settings" class="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                    <div class="min-w-0">
                        <h1 class="settings-header__title">{{ $t('Global Settings') }}</h1>
                        <p class="settings-header__subtitle">{{ $t('Configure your application settings and preferences') }}</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="settings-container py-8">
            <form @submit.prevent="update" class="space-y-5 sm:space-y-6">

                <!-- Basic Application Settings -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--primary">
                            <icon name="app" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('Basic Application Settings') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            <text-input v-model="form.app_name" :error="form.errors.app_name" :label="$t('App Name')" />
                            <text-input v-model="form.site_key" :error="form.errors.site_key" :label="$t('Google ReCaptcha Site Key')" />
                            <select-input v-model="form.default_language" :error="form.errors.default_language" :label="$t('Default Language')">
                                <option v-for="l in languages" :key="l.id" :value="l.code">{{ l.name }}</option>
                            </select-input>
                        </div>
                        <div class="mt-5">
                            <text-input v-model="form.webhook_url" :error="form.errors.webhook_url" :label="$t('Slack webhook URL')" />
                        </div>
                    </div>
                </section>

                <!-- Branding & Assets -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--violet">
                            <icon name="image" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('Branding & Assets') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            <!-- Favicon -->
                            <div class="space-y-2">
                                <label class="settings-label">{{ $t('Favicon') }}</label>
                                <div class="flex items-center gap-3">
                                    <div class="flex-1 min-w-0">
                                        <file-input v-model="form.favicon" :error="form.errors.favicon" type="file" accept="image/png" />
                                    </div>
                                    <div class="settings-preview">
                                        <img v-if="form.main_favicon" class="w-8 h-8 object-contain" :src="form.main_favicon" alt="" />
                                        <icon v-else name="image" class="w-5 h-5 settings-preview__placeholder" />
                                    </div>
                                </div>
                            </div>

                            <!-- Logo -->
                            <div class="space-y-2">
                                <label class="settings-label">{{ $t('Logo') }}</label>
                                <div class="flex items-center gap-3">
                                    <div class="flex-1 min-w-0">
                                        <file-input v-model="form.logo" :error="form.errors.logo" type="file" accept="image/png" />
                                    </div>
                                    <div class="settings-preview">
                                        <img v-if="form.main_logo" class="w-8 h-8 object-contain" :src="form.main_logo" alt="" />
                                        <icon v-else name="image" class="w-5 h-5 settings-preview__placeholder" />
                                    </div>
                                </div>
                            </div>

                            <!-- White Logo -->
                            <div class="space-y-2">
                                <label class="settings-label">{{ $t('White Logo') }}</label>
                                <div class="flex items-center gap-3">
                                    <div class="flex-1 min-w-0">
                                        <file-input v-model="form.logo_white" :error="form.errors.logo_white" type="file" accept="image/png" />
                                    </div>
                                    <div class="settings-preview settings-preview--dark">
                                        <img v-if="form.main_logo_white" class="w-8 h-8 object-contain" :src="form.main_logo_white" alt="" />
                                        <icon v-else name="image" class="w-5 h-5 settings-preview__placeholder" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- User Registration -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--green">
                            <icon name="user-plus" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('User Registration') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <label for="enableRegistration" class="settings-toggle-row">
                            <input id="enableRegistration"
                                   type="checkbox"
                                   v-model="form.enable_registration"
                                   class="settings-checkbox" />
                            <span class="min-w-0">
                                <span class="settings-toggle-row__label">{{ $t('Enable Registration') }}</span>
                                <span class="settings-hint">{{ $t('Show Registration link on the login page') }}</span>
                            </span>
                        </label>
                    </div>
                </section>

                <!-- File Upload Settings -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--sky">
                            <icon name="attachment" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('File Upload Settings') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <label class="settings-label">{{ $t('Allowed File Types') }}</label>

                        <div v-if="form.allowed_file_types && form.allowed_file_types.length" class="flex flex-wrap gap-2 mt-3">
                            <span v-for="(file_type, ft_key) in form.allowed_file_types" :key="ft_key" class="settings-chip">
                                {{ file_type }}
                                <button type="button" class="settings-chip__remove" @click="removeFileType(ft_key)" :aria-label="$t('Remove')">
                                    <icon name="close" class="w-3 h-3" />
                                </button>
                            </span>
                        </div>

                        <div class="relative mt-3">
                            <input v-model="newFileType"
                                   @keydown.enter.prevent="addFileType"
                                   @keydown="checkDelimiter"
                                   class="settings-input pr-10"
                                   type="text"
                                   :placeholder="$t('Type file extensions and press enter or comma to add')" />
                            <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <icon name="plus" class="w-4 h-4 settings-input__adornment" />
                            </span>
                        </div>
                        <p v-if="form.errors.allowed_file_types" class="settings-error">{{ form.errors.allowed_file_types }}</p>
                    </div>
                </section>

                <!-- Cron Job Instructions -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--amber">
                            <icon name="clock" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('Cron Job Instructions') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <div class="settings-note">
                            <h3 class="settings-note__title">{{ $t('Email Queue Setup') }}</h3>
                            <p class="settings-note__text">
                                {{ $t('To send emails without delays, set up a cron job. First, enable the queue by adding') }}
                                <code class="settings-inline-code">QUEUE_ENABLE=true</code>
                                {{ $t('to your .env file.') }}
                            </p>
                        </div>

                        <div class="mt-5 space-y-4">
                            <div>
                                <label class="settings-label">{{ $t('Standard Server Cron Job') }}</label>
                                <pre class="settings-code"><code>*/3 * * * * /usr/bin/php artisan queue:work --queue=high,default --stop-when-empty</code></pre>
                                <p class="settings-hint">{{ $t('Runs every 3 minutes to process email queue') }}</p>
                            </div>
                            <div>
                                <label class="settings-label">{{ $t('Shared Hosting (cPanel) Cron Job') }}</label>
                                <pre class="settings-code"><code>*/3 * * * * wget -q -O - https://website.com/cron/queue_work >/dev/null 2>&1</code></pre>
                                <p class="settings-hint">{{ $t('Alternative method for shared hosting providers') }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Custom CSS -->
                <section class="settings-card">
                    <div class="settings-card__header">
                        <span class="settings-card__icon settings-card__icon--rose">
                            <icon name="code" class="w-4 h-4" />
                        </span>
                        <h2 class="settings-card__title">{{ $t('Custom CSS') }}</h2>
                    </div>
                    <div class="settings-card__body">
                        <textarea-input v-model="form.custom_css"
                                        :error="form.errors.custom_css"
                                        :rows="15"
                                        placeholder="/* Add your custom CSS here */"
                                        :label="$t('Custom CSS Code')" />
                    </div>
                </section>

                <!-- Save -->
                <div class="settings-actions">
                    <loading-button :loading="form.processing" class="settings-save" type="submit">
                        <icon name="save" class="w-4 h-4 mr-2" />
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
    /* One neutral ramp (slate) + one accent (primary blue), for both themes.
       Written as scoped classes rather than bg-white/text-gray-* utilities so the
       global `.dark .bg-white` override in dark_screen.scss cannot flatten the
       page into dark-text-on-dark-card. */

    .settings-page {
        @apply min-h-screen bg-slate-50;
    }
    .settings-container {
        @apply max-w-7xl mx-auto px-3 sm:px-6 lg:px-8;
    }

    /* Header */
    .settings-header {
        @apply bg-white border-b border-slate-200;
    }
    .settings-header__icon {
        @apply flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 text-white flex-shrink-0;
    }
    .settings-header__title {
        @apply text-xl sm:text-2xl font-semibold text-slate-900 leading-tight;
    }
    .settings-header__subtitle {
        @apply text-xs sm:text-sm text-slate-500 mt-0.5;
    }

    /* Cards */
    .settings-card {
        @apply bg-white rounded-xl border border-slate-200 overflow-hidden;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .settings-card__header {
        @apply flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 bg-slate-50;
    }
    .settings-card__icon {
        @apply flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0;
    }
    .settings-card__icon--primary  { @apply bg-primary-50 text-primary-600; }
    .settings-card__icon--violet  { @apply bg-violet-50 text-violet-600; }
    .settings-card__icon--green { @apply bg-green-50 text-green-600; }
    .settings-card__icon--sky     { @apply bg-sky-50 text-sky-600; }
    .settings-card__icon--amber   { @apply bg-amber-50 text-amber-600; }
    .settings-card__icon--rose    { @apply bg-rose-50 text-rose-600; }
    .settings-card__title {
        @apply text-sm sm:text-base font-semibold text-slate-900 min-w-0 truncate;
    }
    .settings-card__body {
        @apply p-4 sm:p-5;
    }

    /* Text */
    .settings-label {
        @apply block text-sm font-medium text-slate-700;
    }
    .settings-hint {
        @apply block text-xs text-slate-500 mt-1.5;
    }
    .settings-error {
        @apply text-xs text-red-600 mt-2;
    }

    /* Inputs owned by this page */
    .settings-input {
        @apply w-full text-sm rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2.5;
        @apply focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20;
    }
    .settings-input::placeholder {
        @apply text-slate-400;
    }
    .settings-input__adornment {
        @apply text-slate-400;
    }

    /* Logo previews */
    .settings-preview {
        @apply flex items-center justify-center w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0;
    }
    .settings-preview--dark {
        @apply bg-slate-800 border-slate-700;
    }
    .settings-preview__placeholder {
        @apply text-slate-400;
    }

    /* Registration toggle */
    .settings-toggle-row {
        @apply flex items-start gap-3 cursor-pointer;
    }
    .settings-toggle-row__label {
        @apply block text-sm font-medium text-slate-900;
    }
    .settings-checkbox {
        @apply w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-600 flex-shrink-0;
        @apply focus:ring-2 focus:ring-primary-500/40;
    }

    /* File-type chips */
    .settings-chip {
        @apply inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium;
        @apply bg-primary-50 text-primary-700 border border-primary-100;
    }
    .settings-chip__remove {
        @apply inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-500;
        @apply hover:bg-primary-200 hover:text-primary-800 transition-colors;
    }

    /* Cron note + code blocks */
    .settings-note {
        @apply rounded-lg border border-primary-100 bg-primary-50 px-4 py-3;
    }
    .settings-note__title {
        @apply text-sm font-semibold text-primary-900;
    }
    .settings-note__text {
        @apply text-sm text-primary-800 mt-1 leading-relaxed;
    }
    .settings-inline-code {
        @apply px-1.5 py-0.5 rounded bg-primary-100 text-primary-900 text-xs;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
    }
    .settings-code {
        @apply mt-2 rounded-lg bg-slate-900 text-slate-100 px-3 sm:px-4 py-3 text-xs overflow-x-auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
        -webkit-overflow-scrolling: touch;
    }
    .settings-code code {
        @apply text-green-300 whitespace-pre;
    }

    /* Save */
    .settings-actions {
        @apply flex justify-end pt-2 pb-2;
    }
    .settings-save {
        @apply inline-flex items-center justify-center w-full sm:w-auto px-5 rounded-lg bg-primary-600 text-white text-sm font-semibold;
        @apply hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors;
        min-height: 44px;
    }

    /* ---------------------------------------------------------------- dark */
    /* Class-based (`.dark`), matching tailwind.config darkMode: ['class'].
       The old block used @media (prefers-color-scheme: dark), which keyed off
       the OS instead of the app's own theme toggle. */
    .dark .settings-page {
        @apply bg-slate-900;
    }
    .dark .settings-header {
        @apply bg-slate-800 border-slate-700;
    }
    .dark .settings-header__title {
        @apply text-white;
    }
    .dark .settings-header__subtitle {
        @apply text-slate-400;
    }

    .dark .settings-card {
        @apply bg-slate-800 border-slate-700;
        box-shadow: none;
    }
    .dark .settings-card__header {
        @apply bg-slate-800/60 border-slate-700;
    }
    .dark .settings-card__title {
        @apply text-slate-100;
    }
    .dark .settings-card__icon--primary  { @apply bg-primary-500/15 text-primary-300; }
    .dark .settings-card__icon--violet  { @apply bg-violet-500/15 text-violet-300; }
    .dark .settings-card__icon--green { @apply bg-green-500/15 text-green-300; }
    .dark .settings-card__icon--sky     { @apply bg-sky-500/15 text-sky-300; }
    .dark .settings-card__icon--amber   { @apply bg-amber-500/15 text-amber-300; }
    .dark .settings-card__icon--rose    { @apply bg-rose-500/15 text-rose-300; }

    .dark .settings-label {
        @apply text-slate-300;
    }
    .dark .settings-hint {
        @apply text-slate-400;
    }
    .dark .settings-error {
        @apply text-red-400;
    }

    .dark .settings-input {
        @apply bg-slate-900 border-slate-600 text-slate-100;
    }
    .dark .settings-input::placeholder {
        @apply text-slate-500;
    }
    .dark .settings-input__adornment,
    .dark .settings-preview__placeholder {
        @apply text-slate-500;
    }

    .dark .settings-preview {
        @apply bg-slate-900 border-slate-700;
    }
    .dark .settings-preview--dark {
        @apply bg-slate-950 border-slate-700;
    }

    .dark .settings-toggle-row__label {
        @apply text-slate-100;
    }
    .dark .settings-checkbox {
        @apply bg-slate-900 border-slate-600;
    }

    .dark .settings-chip {
        @apply bg-primary-500/15 text-primary-200 border-primary-500/25;
    }
    .dark .settings-chip__remove {
        @apply text-primary-300 hover:bg-primary-500/30 hover:text-white;
    }

    .dark .settings-note {
        @apply bg-primary-500/10 border-primary-500/25;
    }
    .dark .settings-note__title {
        @apply text-primary-200;
    }
    .dark .settings-note__text {
        @apply text-primary-100/80;
    }
    .dark .settings-inline-code {
        @apply bg-primary-500/20 text-primary-100;
    }
    .dark .settings-code {
        @apply bg-slate-950 border border-slate-700;
    }

    /* Touch screens: give the small controls a 24px+ hit area. */
    @media (pointer: coarse) {
        .settings-chip {
            @apply py-1.5;
        }
        .settings-chip__remove {
            @apply w-5 h-5;
        }
        .settings-checkbox {
            @apply w-5 h-5;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .settings-save,
        .settings-chip__remove {
            transition: none;
        }
    }
</style>
