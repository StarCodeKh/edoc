<template>
    <Head title="ចូលប្រើប្រាស់ - E-Document System" />

    <!-- Centered login, building photo as full background -->
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background photo -->
        <img src="/images/hero-building.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />

        <!-- Brand tint overlay so the photo reads as background, not a distraction -->
        <div
            class="absolute inset-0"
            style="
                background: linear-gradient(
                    180deg,
                    rgba(6, 20, 12, 0.65) 0%,
                    rgba(11, 92, 50, 0.45) 45%,
                    rgba(6, 20, 12, 0.75) 100%
                );
            "
        ></div>

        <!-- Faint dot texture on top of the tint -->
        <div
            class="pointer-events-none absolute inset-0"
            style="
                background-image: radial-gradient(#d4af37 0.6px, transparent 0.6px);
                background-size: 26px 26px;
                opacity: 0.12;
            "
        ></div>

        <!-- Flash Messages -->
        <flash-messages />

        <!-- Toast / snackbar notification -->
        <Transition name="toast-fade">
            <div
                v-if="toast.show"
                class="fixed top-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.45)] max-w-[92vw]"
                role="alert"
            >
                <span class="shrink-0 w-5 h-5 rounded-full bg-[#B3261E] flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4m0 4h.01" />
                    </svg>
                </span>
                <span class="text-[15px] font-semibold text-[#B3261E] whitespace-nowrap">{{ toast.message }}</span>
            </div>
        </Transition>

        <div class="relative w-full max-w-md">
            <!-- Emblem -->
            <div class="text-center mb-8">
                <Link :href="route('home')" class="inline-block group relative">
                    <div
                        class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#D4AF37] shadow-[0_8px_25px_-8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                    >
                        <Logo class="w-12 h-12 fill-[#149954]" />
                    </div>
                </Link>
                <h1 class="mt-4 text-3xl font-bold text-white drop-shadow-md">ចូលប្រើប្រាស់ប្រព័ន្ធ</h1>
                <p class="mt-2 text-white/80 text-sm">សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្តទៅកាន់ផ្ទាំងគ្រប់គ្រង</p>
                <p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#F1C74F] font-semibold">
                    E-Document System
                </p>
            </div>

            <!-- Login Card — frosted glass so the photo shows through -->
            <div
                class="relative rounded-[10px] bg-white/10 border-1 border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)]"
            >
                <form @submit.prevent="login" class="px-8 pt-8 pb-8">
                    <!-- Email Field -->
                    <div class="mb-5">
                        <label class="block mb-2 text-sm font-semibold text-[#ffffff]">អ៊ីមែល</label>
                        <div class="grid">
                            <svg
                                class="col-start-1 row-start-1 self-center justify-self-start ml-4 z-10 pointer-events-none w-5 h-5 text-[#ffffff]"
                                style="filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.6"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <text-input
                                v-model="form.email"
                                type="email"
                                autofocus
                                autocapitalize="off"
                                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                                class="col-start-1 row-start-1 w-full login-input has-icon"
                                @input="clearError"
                            />
                        </div>
                    </div>

                    <!-- Password Field -->
                    <div class="mb-5">
                        <label class="block mb-2 text-sm font-semibold text-[#ffffff]">លេខសម្ងាត់</label>
                        <div class="grid">
                            <svg
                                class="col-start-1 row-start-1 self-center justify-self-start ml-4 z-10 pointer-events-none w-5 h-5 text-[#ffffff]"
                                style="filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.6"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <text-input
                                v-model="form.password"
                                type="password"
                                placeholder="បញ្ចូលលេខសម្ងាត់"
                                class="col-start-1 row-start-1 w-full login-input has-icon"
                                @input="clearError"
                            />
                        </div>
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
                            <span class="ml-2 text-[#ffffff] group-hover:text-[#0E4429] transition-colors">
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

                    <!-- Login Error Message -->
                    <div
                        v-if="loginError"
                        class="mb-5 p-3 bg-[#0E4429]/5 border border-[#0E4429]/20 text-[#0E4429] rounded-xl text-sm"
                    >
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            {{ loginError }}
                        </div>
                    </div>

                    <!-- Login Button -->
                    <loading-button
                        :disabled="(disable_login_button && site_key) || form.processing"
                        :loading="form.processing"
                        class="w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]"
                        type="submit"
                    >
                        <span v-if="!form.processing" class="w-full inline-flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                            </svg>
                            ចូលប្រើប្រាស់
                        </span>
                        <span v-else class="w-full inline-flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="3"
                                ></circle>
                                <path
                                    class="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                            </svg>
                            កំពុងចូល...
                        </span>
                    </loading-button>

                    <!-- Registration Link -->
                    <!-- <div v-if="enable_registration" class="mt-6 text-center">
                            <p class="text-sm text-white/80">
                                មិនទាន់មានគណនីមែនទេ?
                                <Link
                                    :href="route('register')"
                                    class="font-semibold text-[#149954] hover:text-[#B8901E] transition-colors"
                                >
                                    ចុះឈ្មោះ
                                </Link>
                            </p>
                        </div> -->
                </form>
            </div>

            <!-- Demo Credentials Section -->
            <div
                v-if="is_demo"
                class="mt-6 rounded-[28px] bg-white/75 backdrop-blur-xl border-2 border-white/40 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
            >
                <div class="px-6 py-4 border-b border-white/30">
                    <h3 class="text-sm font-semibold text-[#0E4429] text-center">ព័ត៌មានសម្គាល់សាកល្បង</h3>
                    <p class="text-xs text-[#0E4429]/60 text-center mt-1">សាកល្បងតួនាទីអ្នកប្រើផ្សេងៗភ្លាមៗ</p>
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
                        <h4 class="text-sm font-semibold text-[#0E4429]/70 mb-3">ឬចម្លងព័ត៌មានដោយដៃ:</h4>

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
            <p class="mt-8 text-center text-xs text-white/80">
                គណៈកម្មការគ្រប់គ្រងល្បែងពាណិជ្ជកម្មកម្ពុជា អគ្គលេខាធិការដ្ឋាន
            </p>
        </div>
    </div>
</template>

<script>
import Logo from '@/Shared/Logo.vue';
import TextInput from '@/Shared/TextInput.vue';
import LoadingButton from '@/Shared/LoadingButton.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import FlashMessages from '@/Shared/FlashMessages.vue';
import vueRecaptcha from 'vue3-recaptcha2';
import { Crown, Shield, User, Users } from 'lucide-vue-next';

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
            default: true,
        },
    },
    data() {
        return {
            loadingTimeout: 30000,
            disable_login_button: true,
            loginError: null,
            toast: {
                show: false,
                message: '',
            },
            toastTimer: null,
            form: useForm({
                email: '',
                password: '',
                remember: false,
            }),
            demoCredentials: {
                admin: {
                    label: 'អ្នកគ្រប់គ្រង',
                    email: 'john.due.helo@mail.com',
                    icon: Crown,
                },
                normal: {
                    label: 'អ្នកប្រើទូទៅ',
                    email: 'sabbir@example.com',
                    icon: Shield,
                },
            },
        };
    },
    methods: {
        login() {
            if (!this.validateForm()) {
                return;
            }
            this.form.post(this.route('login.store'));
        },
        // Client-side check for required fields before hitting the server.
        // Returns true when the form is OK to submit, false otherwise
        // (and shows a toast explaining what's missing).
        validateForm() {
            const emailEmpty = !this.form.email || !this.form.email.trim();
            const passwordEmpty = !this.form.password || !this.form.password.trim();

            if (!emailEmpty && !passwordEmpty) {
                return true;
            }

            let message;
            if (emailEmpty && passwordEmpty) {
                message = 'សូមបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់';
            } else if (emailEmpty) {
                message = 'សូមបញ្ចូលអ៊ីមែល';
            } else {
                message = 'សូមបញ្ចូលលេខសម្ងាត់';
            }

            this.showToast(message);
            return false;
        },
        showToast(message, duration = 3500) {
            clearTimeout(this.toastTimer);
            this.toast.message = message;
            this.toast.show = true;
            this.toastTimer = setTimeout(() => {
                this.toast.show = false;
            }, duration);
        },
        recaptchaVerified(response) {
            this.disable_login_button = false;
        },
        recaptchaExpired() {
            this.$refs.vueRecaptcha.reset();
        },
        recaptchaFailed() {
            // Handle recaptcha failure
        },
        recaptchaError(reason) {
            console.log(reason);
        },
        clearError() {
            this.loginError = null;
        },
        autofillLogin(e, role, login = false) {
            e.preventDefault();
            const roleEmails = {
                admin: { email: 'john.due.helo@mail.com', password: 's6J5WQR9ZlpvG7' },
                normal: { email: 'sabbir@example.com', password: 'SY7Ta85KTV2e0n' },
            };
            this.form.email = roleEmails[role]['email'];
            this.form.password = roleEmails[role]['password'];
            if (login) {
                this.login();
            }
        },
    },
};
</script>

<style scoped>
* {
    font-family: 'Noto Sans Khmer', 'Kantumruy Pro', ui-sans-serif, sans-serif;
}

.login-input :deep(.form-input) {
    @apply border-[#149954]/25 focus:border-[#149954] focus:ring-[#149954] rounded-2xl shadow-sm transition-all duration-200 py-3.5 text-[15px];
    background-color: rgba(255, 255, 255, 0.451);
}

.login-input.has-icon :deep(.form-input) {
    padding-left: 2.75rem;
}

.login-input :deep(.form-input):focus {
    box-shadow: 0 0 0 4px rgba(20, 153, 84, 0.14);
    transform: translateY(-1px);
}

.login-input :deep(.form-input::placeholder) {
    @apply text-[#ffffff];
}

.loading-button:disabled {
    @apply cursor-not-allowed;
}

input:focus,
button:focus {
    outline: none;
}

/* Toast transition */
.toast-fade-enter-active,
.toast-fade-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -12px);
}
</style>
