<template>
    <Head title="Login" />
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <flash-messages />

        <!-- Background Pattern -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div class="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div class="relative w-full max-w-md">
            <!-- Logo Section -->
            <div class="text-center mb-8">
                <Link :href="route('dashboard')" class="inline-block">
                    <logo class="w-16 h-16 mx-auto text-indigo-600 hover:text-indigo-700 transition-colors duration-200" />
                </Link>
                <h2 class="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
                <p class="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
            </div>

            <!-- Login Form -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <form @submit.prevent="login" class="px-8 py-10">
                    <!-- Email Field -->
                    <div class="mb-6">
                        <text-input
                            v-model="form.email"
                            :error="form.errors.email"
                            label="Email Address"
                            type="email"
                            autofocus
                            autocapitalize="off"
                            class="login-input"
                        />
                    </div>

                    <!-- Password Field -->
                    <div class="mb-6">
                        <text-input
                            v-model="form.password"
                            :error="form.errors.password"
                            label="Password"
                            type="password"
                            class="login-input"
                        />
                    </div>

                    <!-- Remember Me & Forgot Password -->
                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center">
                            <input
                                id="remember"
                                v-model="form.remember"
                                type="checkbox"
                                class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span class="ml-2 text-sm text-gray-700">Remember me</span>
                        </label>
                        <Link
                            :href="route('password.reset')"
                            class="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <!-- reCAPTCHA -->
                    <div v-if="site_key" class="flex justify-center mb-6">
                        <vue-recaptcha
                            :sitekey="site_key"
                            size="normal"
                            theme="light"
                            @verify="recaptchaVerified"
                            @expire="recaptchaExpired"
                            @fail="recaptchaFailed"
                            @error="recaptchaError"
                            ref="vueRecaptcha"
                            class="transform scale-90"
                        />
                    </div>

                    <!-- Login Button -->
                    <loading-button
                        :disabled="disable_login_button && site_key"
                        :loading="form.processing"
                        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        type="submit"
                    >
                        <span v-if="!form.processing" class="flex items-center justify-center">
                            <icon name="login" class="w-5 h-5 mr-2" />
                            {{ $t('Login') }}
                        </span>
                    </loading-button>

                    <!-- Register Link -->
                    <div v-if="enable_register" class="mt-6 text-center">
                        <p class="text-sm text-gray-600">
                            Don't have an account?
                            <Link
                                :href="route('register')"
                                class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                            >
                                {{ $t('Register') }}
                            </Link>
                        </p>
                    </div>
                </form>

                <!-- Demo Section -->
                <div v-if="is_demo" class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6">
                    <div class="text-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Demo Accounts</h3>
                        <p class="text-sm text-gray-600">Quick login for testing purposes</p>
                    </div>

                    <!-- Demo Account Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium text-gray-900">Admin</h4>
                                    <p class="text-xs text-gray-500 truncate">john.due.helo@mail.com</p>
                                </div>
                                <button
                                    @click="autofillLogin($event, 'admin', true)"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors duration-200"
                                >
                                    Login
                                </button>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium text-gray-900">User</h4>
                                    <p class="text-xs text-gray-500 truncate">sabbir@example.com</p>
                                </div>
                                <button
                                    @click="autofillLogin($event, 'normal', true)"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors duration-200"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Copy Credentials -->
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-2">Or copy credentials to fill manually:</p>
                        <div class="flex justify-center space-x-4">
                            <button
                                @click="autofillLogin($event, 'admin')"
                                class="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                            >
                                Copy Admin
                            </button>
                            <button
                                @click="autofillLogin($event, 'normal')"
                                class="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                            >
                                Copy User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Logo from '@/Shared/Logo.vue'
import TextInput from '@/Shared/TextInput.vue'
import LoadingButton from '@/Shared/LoadingButton.vue'
import { Head, Link } from '@inertiajs/vue3'
import FlashMessages from '@/Shared/FlashMessages.vue'
import vueRecaptcha from 'vue3-recaptcha2';

export default {
    metaInfo: { title: 'Login' },
    components: {
        FlashMessages,
        LoadingButton,
        Logo,
        TextInput,
        Head,
        Link,
        vueRecaptcha,
    },
    props: {
        is_demo: Number,
        site_key: String,
        enable_registration: Object
    },
    data() {
        return {
            enable_register: parseInt(this.enable_registration.value, 10),
            loadingTimeout: 30000,
            disable_login_button: true,
            form: this.$inertia.form({
                email: '',
                password: '',
                remember: false,
            }),
        }
    },
    methods: {
        recaptchaVerified(response) {
            this.disable_login_button = false
            console.log(response)
        },
        recaptchaExpired() {
            this.$refs.vueRecaptcha.reset();
        },
        recaptchaFailed() {
        },
        recaptchaError(reason) {
            console.log(reason)
        },
        login() {
            this.form.post(this.route('login.store'))
        },
        autofillLogin(e, role, login){
            e.preventDefault()
            const roleEmails = { 'admin': {email: 'john.due.helo@mail.com', password: 's6J5WQR9ZlpvG7'}, 'normal': {email: 'sabbir@example.com', password: 'SY7Ta85KTV2e0n'}}
            this.form.email = roleEmails[role]['email']
            this.form.password = roleEmails[role]['password']
            if(login){
                this.login();
            }
        }
    }
}
</script>

<style scoped>
/* Animated background blobs */
@keyframes blob {
    0% {
        transform: translate(0px, 0px) scale(1);
    }
    33% {
        transform: translate(30px, -50px) scale(1.1);
    }
    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
        transform: translate(0px, 0px) scale(1);
    }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}

/* Custom input styling */
.login-input :deep(.form-input) {
    @apply border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm transition-all duration-200;
}

.login-input :deep(.form-input):focus {
    @apply ring-2 ring-indigo-500/20 transform scale-105;
}

.login-input :deep(.form-label) {
    @apply text-gray-700 font-medium text-sm;
}

/* Enhanced button hover effects */
.loading-button:hover:not(:disabled) {
    @apply shadow-2xl;
}

/* Demo section enhancements */
.demo-card {
    @apply transition-all duration-200 hover:scale-105;
}

/* Custom scrollbar for demo section */
.demo-section::-webkit-scrollbar {
    width: 4px;
}

.demo-section::-webkit-scrollbar-track {
    @apply bg-gray-100 rounded-full;
}

.demo-section::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full hover:bg-gray-400;
}

/* Loading state animation */
.loading-button:disabled {
    @apply cursor-not-allowed;
}

/* Focus states */
input:focus,
button:focus {
    @apply outline-none ring-2 ring-indigo-500/20;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
    .animate-blob {
        animation-duration: 10s;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .bg-gradient-to-br {
        background: linear-gradient(to bottom right, #1e1b4b, #312e81, #581c87);
    }
}
</style>
