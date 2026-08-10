<template>
    <Head title="ចូលប្រើប្រាស់ - E-Document System" />

    <!-- Strict 2-color (green + gold) cool login -->
    <div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">

        <!-- Ambient glow orbs — green + gold only -->
        <div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]"></div>
        <div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]"></div>
        <div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]"></div>

        <!-- Faint dot texture -->
        <div class="pointer-events-none absolute inset-0" style="background-image: radial-gradient(#149954 0.6px, transparent 0.6px); background-size: 26px 26px; opacity: 0.05;"></div>

        <!-- Flash Messages -->
        <flash-messages />

        <div class="relative w-full max-w-md">

            <!-- Emblem with spinning two-tone ring -->
            <div class="text-center mb-8">
                <Link :href="route('home')" class="inline-block group relative">
                    <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105">
                        <Logo class="w-12 h-12 fill-[#149954]" />
                    </div>
                </Link>
                <h1 class="mt-4 text-3xl font-bold text-[#0E4429]">
                    ចូលប្រើប្រាស់ប្រព័ន្ធ
                </h1>
                <p class="mt-2 text-[#149954]/70 text-sm">
                    សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្តទៅកាន់ផ្ទាំងគ្រប់គ្រង
                </p>
                <p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold">
                    E-Document System
                </p>
            </div>

            <!-- Login Card — single-color border -->
            <div class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]">
                    <form @submit.prevent="login" class="px-8 pt-8 pb-8">

                        <!-- Email Field -->
                        <div class="mb-5">
                            <label class="block mb-2 text-sm font-semibold text-[#0E4429]">អ៊ីមែល</label>
                            <text-input
                                v-model="form.email"
                                :error="form.errors.email"
                                type="email"
                                autofocus
                                autocapitalize="off"
                                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                                class="w-full login-input"
                                @input="clearError"
                            />
                        </div>

                        <!-- Password Field -->
                        <div class="mb-5">
                            <label class="block mb-2 text-sm font-semibold text-[#0E4429]">លេខសម្ងាត់</label>
                            <text-input
                                v-model="form.password"
                                :error="form.errors.password"
                                type="password"
                                placeholder="បញ្ចូលលេខសម្ងាត់"
                                class="w-full login-input"
                                @input="clearError"
                            />
                        </div>

                        <!-- Remember Me & Forgot Password -->
                        <div class="flex items-center justify-between mb-6 text-sm">
                            <label class="flex items-center cursor-pointer group">
                                <input
                                    id="remember"
                                    v-model="form.remember"
                                    type="checkbox"
                                    class="w-4 h-4 text-[#149954] bg-white border-[#D4AF37]/50 rounded focus:ring-[#149954] focus:ring-2"
                                />
                                <span class="ml-2 text-[#0E4429]/70 group-hover:text-[#0E4429] transition-colors">
                                    ចងចាំខ្ញុំ
                                </span>
                            </label>
                            <Link
                                :href="route('password.reset')"
                                class="text-[#B8901E] hover:text-[#149954] transition-colors font-medium"
                            >
                                ភ្លេចលេខសម្ងាត់?
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
                            />
                        </div>

                        <!-- Login Error Message (kept neutral to respect the 2-color rule) -->
                        <div v-if="loginError" class="mb-5 p-3 bg-[#0E4429]/5 border border-[#0E4429]/20 text-[#0E4429] rounded-xl text-sm">
                            <div class="flex items-center">
                                <svg class="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                </svg>
                                {{ loginError }}
                            </div>
                        </div>

                        <!-- Login Button -->
                        <loading-button
                            :disabled="(disable_login_button && site_key) || isLoggingIn"
                            :loading="isLoggingIn"
                            class="w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]"
                            type="submit"
                        >
                            <span v-if="!isLoggingIn" class="w-full inline-flex items-center justify-center gap-2">
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                                ចូលប្រើប្រាស់
                            </span>
                            <span v-else class="w-full inline-flex items-center justify-center">កំពុងចូល...</span>
                        </loading-button>

                        <!-- Registration Link -->
                        <div v-if="enable_registration" class="mt-6 text-center">
                            <p class="text-sm text-[#0E4429]/60">
                                មិនទាន់មានគណនីមែនទេ?
                                <Link
                                    :href="route('register')"
                                    class="font-semibold text-[#149954] hover:text-[#B8901E] transition-colors"
                                >
                                    ចុះឈ្មោះ
                                </Link>
                            </p>
                        </div>
                    </form>
            </div>

            <!-- Demo Credentials Section -->
            <div v-if="is_demo" class="mt-6 rounded-[28px] bg-white border-2 border-[#149954] overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#149954]/10">
                        <h3 class="text-sm font-semibold text-[#0E4429] text-center">
                            ព័ត៌មានសម្គាល់សាកល្បង
                        </h3>
                        <p class="text-xs text-[#0E4429]/60 text-center mt-1">
                            សាកល្បងតួនាទីអ្នកប្រើផ្សេងៗភ្លាមៗ
                        </p>
                    </div>

                    <div class="p-6">
                        <!-- Quick Login Buttons -->
                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <button
                                @click="autofillLogin($event, 'admin', true)"
                                class="flex items-center justify-center text-center px-4 py-3 bg-[#D4AF37] hover:bg-[#B8901E] text-white font-medium rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-[#D4AF37]"
                            >
                                <Crown class="w-4 h-4 mr-2" />
                                អ្នកគ្រប់គ្រង
                            </button>
                            <button
                                @click="autofillLogin($event, 'normal', true)"
                                class="flex items-center justify-center text-center px-4 py-3 bg-[#149954] hover:bg-[#0E7A42] text-white font-medium rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-[#149954]"
                            >
                                <Shield class="w-4 h-4 mr-2" />
                                អ្នកប្រើទូទៅ
                            </button>
                        </div>

                        <!-- Detailed Credentials Table -->
                        <div class="space-y-3">
                            <h4 class="text-sm font-semibold text-[#0E4429]/70 mb-3">
                                ឬចម្លងព័ត៌មានដោយដៃ:
                            </h4>

                            <div class="space-y-2">
                                <div
                                    v-for="(credential, role) in demoCredentials"
                                    :key="role"
                                    class="flex items-center justify-between p-3 bg-[#149954]/[0.04] rounded-2xl border border-[#149954]/10"
                                >
                                    <div class="flex-1">
                                        <div class="flex items-center space-x-2">
                                            <component :is="credential.icon" class="w-4 h-4 text-[#D4AF37]" />
                                            <span class="text-sm font-medium text-[#0E4429]">{{ credential.label }}</span>
                                        </div>
                                        <div class="mt-1 text-xs text-[#0E4429]/60">
                                            {{ credential.email }}
                                        </div>
                                    </div>
                                    <button
                                        @click="autofillLogin($event, role)"
                                        class="ml-3 px-3 py-1 text-xs bg-white border border-[#149954]/20 hover:border-[#149954] text-[#149954] rounded-lg transition-colors"
                                    >
                                        ចម្លង
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            <!-- Footer -->
            <p class="mt-8 text-center text-xs text-[#0E4429]/40">
                មានសុវត្ថិភាព និងស្ថិតក្រោមការគ្រប់គ្រង
            </p>
        </div>
    </div>
</template>

<script>
import Logo from '@/Shared/Logo.vue'
import TextInput from '@/Shared/TextInput.vue'
import LoadingButton from '@/Shared/LoadingButton.vue'
import { Head, Link } from '@inertiajs/vue3'
import FlashMessages from '@/Shared/FlashMessages.vue'
import vueRecaptcha from 'vue3-recaptcha2'
import { Crown, Shield, User, Users } from 'lucide-vue-next'

export default {
    metaInfo: { title: 'ចូលប្រើប្រាស់ - E-Document System' },
    components: {
        FlashMessages,
        LoadingButton,
        Logo,
        TextInput,
        Head,
        Link,
        vueRecaptcha,
        Crown,
        Shield,
        User,
        Users,
    },
    props: {
        is_demo: Number,
        site_key: String,
        enable_registration: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loadingTimeout: 30000,
            disable_login_button: true,
            isLoggingIn: false,
            loginError: null,
            form: this.$inertia.form({
                email: '',
                password: '',
                remember: false,
            }),
            demoCredentials: {
                admin: {
                    label: 'អ្នកគ្រប់គ្រង',
                    email: 'john.due.helo@mail.com',
                    icon: Crown
                },
                normal: {
                    label: 'អ្នកប្រើទូទៅ',
                    email: 'sabbir@example.com',
                    icon: Shield
                },
            }
        }
    },
    methods: {
        login() {
            this.form.post(this.route('login.store'))
        },
        recaptchaVerified(response) {
            this.disable_login_button = false
        },
        recaptchaExpired() {
            this.$refs.vueRecaptcha.reset();
        },
        recaptchaFailed() {
            // Handle recaptcha failure
        },
        recaptchaError(reason) {
            console.log(reason)
        },
        clearError() {
            this.loginError = null
        },
        autofillLogin(e, role, login = false) {
            e.preventDefault()
            const roleEmails = {
                'admin': {email: 'john.due.helo@mail.com', password: 's6J5WQR9ZlpvG7'},
                'normal': {email: 'sabbir@example.com', password: 'SY7Ta85KTV2e0n'}
            };
            this.form.email = roleEmails[role]['email']
            this.form.password = roleEmails[role]['password']
            if (login) {
                this.login();
            }
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

* {
    font-family: 'Noto Sans Khmer', 'Kantumruy Pro', ui-sans-serif, sans-serif;
}

.login-input :deep(.form-input) {
    @apply border-[#149954]/20 focus:border-[#149954] focus:ring-[#149954] rounded-2xl shadow-sm transition-all duration-200 py-3;
}

.login-input :deep(.form-input):focus {
    box-shadow: 0 0 0 3px rgba(20, 153, 84, 0.12);
}

.loading-button:disabled {
    @apply cursor-not-allowed;
}

input:focus,
button:focus {
    outline: none;
}
</style>