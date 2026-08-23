<template>
    <div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">

        <!-- Ambient glow orbs — green + gold only -->
        <div class="pointer-events-none absolute -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-[#149954] opacity-[0.22] blur-[110px]"></div>
        <div class="pointer-events-none absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full bg-[#D4AF37] opacity-[0.22] blur-[120px]"></div>
        <div class="pointer-events-none absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-[#149954] opacity-[0.12] blur-[100px]"></div>

        <!-- Faint dot texture -->
        <div class="pointer-events-none absolute inset-0" style="background-image: radial-gradient(#149954 0.6px, transparent 0.6px); background-size: 26px 26px; opacity: 0.05;"></div>

        <div class="relative w-full max-w-lg text-center">

            <!-- Icon badge -->
            <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white border-2 border-[#149954] shadow-[0_8px_25px_-8px_rgba(20,153,84,0.4)]">
                <svg v-if="status === 403" class="w-11 h-11 text-[#149954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <svg v-else-if="status === 404" class="w-11 h-11 text-[#149954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                <svg v-else-if="status === 503" class="w-11 h-11 text-[#149954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else class="w-11 h-11 text-[#149954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>

            <!-- Status code mark -->
            <p class="mt-4 text-6xl font-extrabold tracking-tight" style="background: linear-gradient(135deg, #149954, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                {{ status }}
            </p>

            <h1 class="mt-4 text-3xl font-bold text-[#0E4429]">
                {{ title }}
            </h1>
            <p class="mt-2 text-[#0E4429]/60 text-sm max-w-sm mx-auto">
                {{ description }}
            </p>

            <div class="mt-8">
                <a :href="route('home')" class="inline-flex items-center justify-center gap-2 bg-[#149954] hover:bg-[#0E7A42] text-white font-semibold py-3.5 px-8 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-[0_15px_35px_-10px_rgba(20,153,84,0.5)] border-2 border-[#149954]">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    ត្រឡប់ទៅទំព័រដើម
                </a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        status: Number,
    },
    computed: {
        title() {
            return {
                503: 'សេវាកម្មមិនអាចប្រើប្រាស់បានទេ',
                500: 'មានបញ្ហាម៉ាស៊ីនមេ',
                404: 'រកមិនឃើញទំព័រនេះទេ',
                403: 'អ្នកមិនមានសិទ្ធិចូលប្រើទេ',
            }[this.status]
        },
        description() {
            return {
                503: 'សូមអភ័យទោស ប្រព័ន្ធកំពុងធ្វើការថែទាំ។ សូមព្យាយាមម្តងទៀតក្នុងពេលឆាប់ៗនេះ។',
                500: 'សូមអភ័យទោស មានបញ្ហាកើតឡើងនៅលើម៉ាស៊ីនមេរបស់យើង។',
                404: 'ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាននៅលើប្រព័ន្ធរបស់យើងទេ។',
                403: 'សូមអភ័យទោស អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ។',
            }[this.status]
        },
    },
}
</script>

<style scoped>

* {
    font-family: 'Noto Sans Khmer', 'Kantumruy Pro', ui-sans-serif, sans-serif;
}
</style>