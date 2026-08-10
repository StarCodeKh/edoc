<template>
    <Head title="ចុះឈ្មោះ - E-Document System" />

    <!-- Strict 2-color (green + gold) cool register -->
    <div class="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

        <!-- Ambient glow orbs — green + gold only -->
        <div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]"></div>
        <div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]"></div>
        <div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]"></div>

        <!-- Faint dot texture -->
        <div class="pointer-events-none absolute inset-0" style="background-image: radial-gradient(#149954 0.6px, transparent 0.6px); background-size: 26px 26px; opacity: 0.05;"></div>

        <div class="relative w-full max-w-xl">

            <!-- Emblem -->
            <div class="text-center mb-6">
                <Link :href="route('dashboard')" class="inline-block group">
                    <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)] transition-transform duration-300 group-hover:scale-105">
                        <Logo class="w-12 h-12 fill-[#149954]" />
                    </div>
                </Link>
                <h1 class="mt-4 text-3xl font-bold text-[#0E4429]">
                    ចុះឈ្មោះ
                </h1>
                <p class="mt-2 text-[#149954]/70 text-sm">
                    បង្កើតគណនីថ្មីដើម្បីចាប់ផ្តើមប្រើប្រាស់ប្រព័ន្ធ
                </p>
                <p class="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#B8901E] font-semibold">
                    E-Document System
                </p>
            </div>

            <!-- Register Card — single-color border -->
            <div class="relative rounded-[28px] bg-white border-2 border-[#149954] shadow-[0_25px_60px_-15px_rgba(20,153,84,0.25)]">
                <flash-messages />
                <form class="px-8 sm:px-10 pt-8 pb-8" @submit.prevent="login">
                    <div class="flex flex-wrap">
                        <text-input
                            v-model="form.first_name"
                            :error="form.errors.first_name"
                            class="pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input"
                            label="ឈ្មោះដើម"
                            type="text"
                            autofocus
                            autocapitalize="off"
                            :is_required="true"
                            required
                        />
                        <text-input
                            v-model="form.last_name"
                            :error="form.errors.last_name"
                            class="pb-5 w-full lg:w-1/2 login-input"
                            label="ត្រកូល"
                            type="text"
                            autocapitalize="off"
                            :is_required="true"
                            required
                        />
                        <text-input
                            v-model="form.email"
                            :error="form.errors.email"
                            class="pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input"
                            label="អ៊ីមែល"
                            type="email"
                            autocapitalize="off"
                            :is_required="true"
                            required
                        />
                        <text-input
                            v-model="form.phone"
                            :error="form.errors.phone"
                            class="pb-5 w-full lg:w-1/2 login-input"
                            label="លេខទូរស័ព្ទ"
                            type="text"
                            autocapitalize="off"
                        />
                        <text-input
                            v-model="form.address"
                            :error="form.errors.address"
                            class="pb-5 w-full login-input"
                            label="អាសយដ្ឋាន"
                            type="text"
                            autocapitalize="off"
                        />
                        <text-input
                            v-model="form.password"
                            :error="form.errors.password"
                            class="pb-5 pr-0 lg:pr-4 w-full lg:w-1/2 login-input"
                            label="លេខសម្ងាត់"
                            type="password"
                            :is_required="true"
                            required
                        />
                        <text-input
                            v-model="form.confirm_password"
                            :error="form.errors.confirm_password"
                            class="pb-5 w-full lg:w-1/2 login-input"
                            label="បញ្ជាក់លេខសម្ងាត់"
                            type="password"
                            :is_required="true"
                            required
                        />

                        <div v-if="site_key" class="flex justify-center items-center py-3 w-full">
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

                        <loading-button
                            :disabled="disable_button && site_key"
                            :loading="form.processing"
                            class="w-full bg-[#149954] hover:bg-[#0E7A42] text-white text-center font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#149954] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]"
                            type="submit"
                        >
                            <span class="w-full inline-flex items-center justify-center gap-2">
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                ដាក់ស្នើ
                            </span>
                        </loading-button>
                    </div>

                    <div class="mt-6 text-center text-sm text-[#0E4429]/60">
                        មានគណនីរួចហើយ?
                        <Link class="ml-1 font-semibold text-[#149954] hover:text-[#B8901E] transition-colors" :href="route('login')">
                            ចូលប្រើប្រាស់
                        </Link>
                    </div>
                </form>
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
import FlashMessages from '@/Shared/FlashMessages.vue'
import { Head, Link } from '@inertiajs/vue3'
import vueRecaptcha from "vue3-recaptcha2";

export default {
  metaInfo: { title: 'ចុះឈ្មោះ - E-Document System' },
  components: {
    LoadingButton,
    Logo,
    TextInput,
      Head,
      Link,
      FlashMessages,
      vueRecaptcha,
  },
    props: {
        is_demo: Number,
        site_key: String,
    },
  data() {
    return {
        disable_button: true,
      form: this.$inertia.form({
        first_name: '',
        last_name: '',
          email: '',
          phone: '',
        address: '',
        password: '',
        confirm_password: '',
      }),
    }
  },
  methods: {
      recaptchaVerified(response) {
          this.disable_button = false
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
          if(this.form.password !== this.form.confirm_password){
              alert('Your password is not matched correctly.')
              return
          }
          this.form.post(this.route('register.store'))
      },
      autofillLogin(e, role){
          e.preventDefault()
          const roleEmails = { 'admin': 'john.due.helo@mail.com', 'manager': 'robert.slaughter@mail.com', 'customer' : 'mmarks@example.com'}
          this.form.email = roleEmails[role]
          this.form.password = 'secret'
          this.login();
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

.login-input :deep(.form-label) {
    @apply text-[#0E4429] font-semibold text-sm;
}

.loading-button:disabled {
    @apply cursor-not-allowed;
}

input:focus,
button:focus {
    outline: none;
}
</style>