<template>
    <Head title="កំណត់លេខសម្ងាត់ឡើងវិញ - E-Document System" />

    <!-- Strict 2-color (green + gold) cool reset password — building photo background -->
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

        <!-- Background photo -->
        <img
            src="/images/hero-building.jpg"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- Brand tint overlay -->
        <div class="absolute inset-0" style="background: linear-gradient(180deg, rgba(6,20,12,0.65) 0%, rgba(11,92,50,0.45) 45%, rgba(6,20,12,0.75) 100%);"></div>

        <!-- Faint dot texture -->
        <div class="pointer-events-none absolute inset-0" style="background-image: radial-gradient(#D4AF37 0.6px, transparent 0.6px); background-size: 26px 26px; opacity: 0.12;"></div>

        <!-- Flash Messages -->
        <flash-messages />

        <div class="relative w-full max-w-md">

            <!-- Emblem -->
            <div class="text-center mb-8">
                <Link :href="route('home')" class="inline-block group">
                    <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#D4AF37] shadow-[0_8px_25px_-8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
                        <Logo class="w-12 h-12 fill-[#149954]" />
                    </div>
                </Link>
                <p class="mt-6 text-[11px] tracking-[0.3em] uppercase text-[#F1C74F] font-semibold">
                    E-Document System
                </p>
                <h1 class="mt-2 text-3xl font-bold text-white drop-shadow-md">
                    កំណត់លេខសម្ងាត់ឡើងវិញ
                </h1>
                <p class="mt-2 text-white/80 text-sm">
                    បញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលតំណកំណត់លេខសម្ងាត់ឡើងវិញ
                </p>
            </div>

            <!-- Reset Card — frosted glass -->
            <div class="relative rounded-[10px] bg-white/10 border-1 border-white/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)]">
                <form class="px-8 pt-8 pb-8" @submit.prevent="sendLink">
                    <div class="mb-6">
                        <label class="block mb-2 text-sm font-semibold text-[#ffffff]">អ៊ីមែល</label>
                        <text-input
                            v-model="form.email"
                            :error="form.errors.email"
                            type="email"
                            autofocus
                            autocapitalize="off"
                            placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                            class="w-full login-input"
                        />
                    </div>

                    <loading-button
                        :loading="form.processing"
                        class="w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]"
                        type="submit"
                    >
                        <span class="w-full inline-flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            ផ្ញើតំណកំណត់លេខសម្ងាត់ឡើងវិញ
                        </span>
                    </loading-button>

                    <div class="mt-6 text-center text-sm text-[#ffffff]">
                        ចងចាំលេខសម្ងាត់របស់អ្នកមែនទេ?
                        <Link class="ml-1 font-semibold text-[#149954] hover:text-[#B8901E] transition-colors" :href="route('login')">
                            ចូលប្រើប្រាស់
                        </Link>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <p class="mt-8 text-center text-xs text-white/80">
                គណៈកម្មការគ្រប់គ្រងល្បែងពាណិជ្ជកម្មកម្ពុជា អគ្គលេខាធិការដ្ឋាន
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

    export default {
    metaInfo: { title: 'កំណត់លេខសម្ងាត់ឡើងវិញ - E-Document System' },
    components: {
        LoadingButton,
        Logo,
        TextInput,
        Head,
        Link,
        FlashMessages,
    },
        props: {
            is_demo: Number
        },
    data() {
        return {
        form: this.$inertia.form({
            email: '',
        }),
        }
    },
    methods: {
        sendLink() {
            this.form.post(this.route('password.reset.email'))
        },
    }
    }
</script>

<style scoped>

    * {
        font-family: 'Noto Sans Khmer', 'Kantumruy Pro', ui-sans-serif, sans-serif;
    }

    .login-input :deep(.form-input) {
        @apply border-[#149954]/25 focus:border-[#149954] focus:ring-[#149954] rounded-2xl shadow-sm transition-all duration-200 py-3;
        background-color: rgba(255, 255, 255, 0.436);
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