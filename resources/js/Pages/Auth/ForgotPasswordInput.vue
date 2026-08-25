<template>
    <Head title="កំណត់លេខសម្ងាត់ថ្មី - E-Document System" />

    <!-- Strict 2-color (green + gold) cool set-new-password -->
    <div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Ambient glow orbs — green + gold only -->
        <div
            class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]"
        ></div>
        <div
            class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]"
        ></div>
        <div
            class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]"
        ></div>

        <!-- Faint dot texture -->
        <div
            class="pointer-events-none absolute inset-0"
            style="
                background-image: radial-gradient(#149954 0.6px, transparent 0.6px);
                background-size: 26px 26px;
                opacity: 0.05;
            "
        ></div>

        <!-- Flash Messages -->
        <flash-messages />

        <div class="relative w-full max-w-md">
            <!-- Emblem -->
            <div class="text-center mb-8">
                <Link :href="route('home')" class="inline-block group">
                    <div
                        class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105"
                    >
                        <Logo class="w-12 h-12 fill-[#149954]" />
                    </div>
                </Link>
                <h1 class="mt-4 text-3xl font-bold text-[#0E4429]">កំណត់លេខសម្ងាត់ថ្មី</h1>
                <p class="mt-2 text-[#149954]/70 text-sm">បញ្ចូលលេខសម្ងាត់ថ្មីរបស់អ្នកខាងក្រោម</p>
                <p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold">
                    E-Document System
                </p>
            </div>

            <!-- Reset Card — single-color border -->
            <div
                class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]"
            >
                <form class="px-8 pt-8 pb-8" @submit.prevent="resetPassword" autocomplete="off">
                    <div class="mb-5">
                        <label class="block mb-2 text-sm font-semibold text-[#0E4429]">អ៊ីមែល</label>
                        <text-input
                            v-model="form.email"
                            :error="form.errors.email"
                            type="email"
                            autofocus
                            autocomplete="off"
                            aria-autocomplete="none"
                            placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                            class="w-full login-input"
                        />
                    </div>

                    <div class="mb-5">
                        <label class="block mb-2 text-sm font-semibold text-[#0E4429]">លេខសម្ងាត់ថ្មី</label>
                        <text-input
                            v-model="form.password"
                            :error="form.errors.password"
                            type="password"
                            autocomplete="off"
                            aria-autocomplete="none"
                            placeholder="បញ្ចូលលេខសម្ងាត់ថ្មី"
                            class="w-full login-input"
                        />
                    </div>

                    <div class="mb-6">
                        <label class="block mb-2 text-sm font-semibold text-[#0E4429]">បញ្ជាក់លេខសម្ងាត់ថ្មី</label>
                        <text-input
                            v-model="form.password_confirmation"
                            :error="form.errors.password_confirmation"
                            type="password"
                            autocomplete="off"
                            aria-autocomplete="none"
                            placeholder="បញ្ចូលលេខសម្ងាត់ថ្មីម្តងទៀត"
                            class="w-full login-input"
                        />
                    </div>

                    <loading-button
                        :loading="form.processing"
                        class="w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]"
                        type="submit"
                    >
                        <span class="w-full inline-flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            កំណត់លេខសម្ងាត់ថ្មី
                        </span>
                    </loading-button>

                    <div class="mt-6 text-center text-sm text-[#0E4429]/60">
                        ចងចាំលេខសម្ងាត់របស់អ្នកមែនទេ?
                        <Link
                            class="ml-1 font-semibold text-[#149954] hover:text-[#B8901E] transition-colors"
                            :href="route('login')"
                        >
                            ចូលប្រើប្រាស់
                        </Link>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <p class="mt-8 text-center text-xs text-[#0E4429]/40">មានសុវត្ថិភាព និងស្ថិតក្រោមការគ្រប់គ្រង</p>
        </div>
    </div>
</template>

<script>
import Logo from '@/Shared/Logo.vue';
import TextInput from '@/Shared/TextInput.vue';
import LoadingButton from '@/Shared/LoadingButton.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import FlashMessages from '@/Shared/FlashMessages.vue';

export default {
    metaInfo: { title: 'កំណត់លេខសម្ងាត់ថ្មី - E-Document System' },
    components: {
        LoadingButton,
        Logo,
        TextInput,
        Head,
        Link,
        FlashMessages,
    },
    props: {
        is_demo: Number,
        token: String,
    },
    data() {
        return {
            form: useForm({
                email: '',
                password: '',
                password_confirmation: '',
                token: this.token,
            }),
        };
    },
    methods: {
        resetPassword() {
            this.form.post(this.route('password.reset.store'));
        },
    },
};
</script>

<style scoped>
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
