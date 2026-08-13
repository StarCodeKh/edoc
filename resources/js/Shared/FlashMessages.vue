<template>
  <div>
      <div class="flex justify-center w-full flash-message">
          <!-- Success -->
          <div
              v-if="$page.props.flash && $page.props.flash.success && show"
              class="mt-3 mb-3 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.45)] max-w-3xl"
          >
              <span class="shrink-0 w-5 h-5 rounded-full bg-[#149954] flex items-center justify-center">
                  <svg class="w-3 h-3 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polygon points="0 11 2 9 7 14 18 3 20 5 7 18" /></svg>
              </span>
              <div class="text-[15px] font-semibold text-[#149954]">{{ $page.props.flash.success }}</div>
              <button type="button" class="group shrink-0 text-[#149954]/80 hover:text-[#0E7A42] transition-colors" @click="show = false">
                  <svg class="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" width="235.908" height="235.908" viewBox="278.046 126.846 235.908 235.908"><path d="M506.784 134.017c-9.56-9.56-25.06-9.56-34.62 0L396 210.18l-76.164-76.164c-9.56-9.56-25.06-9.56-34.62 0-9.56 9.56-9.56 25.06 0 34.62L361.38 244.8l-76.164 76.165c-9.56 9.56-9.56 25.06 0 34.62 9.56 9.56 25.06 9.56 34.62 0L396 279.42l76.164 76.165c9.56 9.56 25.06 9.56 34.62 0 9.56-9.56 9.56-25.06 0-34.62L430.62 244.8l76.164-76.163c9.56-9.56 9.56-25.06 0-34.62z" /></svg>
              </button>
          </div>

          <!-- Error -->
          <div
              v-if="$page.props.flash && ($page.props.flash.error || Object.keys($page.props.errors).length > 0) && show"
              class="mb-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.45)] max-w-3xl"
              :class="{ 'items-start': Object.keys($page.props.errors).length > 1 }"
          >
              <span class="shrink-0 w-5 h-5 rounded-full bg-[#B3261E] flex items-center justify-center" :class="{ 'mt-0.5': Object.keys($page.props.errors).length > 1 }">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4m0 4h.01" />
                  </svg>
              </span>

              <div v-if="$page.props.flash.error" class="text-[15px] font-semibold text-[#B3261E]">{{ $page.props.flash.error }}</div>
              <div v-else class="text-[15px] font-semibold text-[#B3261E] flex flex-col leading-relaxed">
                  <span v-if="Object.keys($page.props.errors).length === 1">{{ Object.values($page.props.errors)[0] }}</span>
                  <template v-else>
                      <span>There are {{ Object.keys($page.props.errors).length }} form errors.</span>
                      <span v-for="(error, ei) in $page.props.errors" :key="ei" class="font-normal">* {{ error }}</span>
                  </template>
              </div>

              <button
                  type="button"
                  class="group shrink-0 text-[#B3261E]/80 hover:text-[#8f1e18] transition-colors"
                  :class="{ 'mt-0.5': Object.keys($page.props.errors).length > 1 }"
                  @click="show = false"
              >
                  <svg class="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" width="235.908" height="235.908" viewBox="278.046 126.846 235.908 235.908"><path d="M506.784 134.017c-9.56-9.56-25.06-9.56-34.62 0L396 210.18l-76.164-76.164c-9.56-9.56-25.06-9.56-34.62 0-9.56 9.56-9.56 25.06 0 34.62L361.38 244.8l-76.164 76.165c-9.56 9.56-9.56 25.06 0 34.62 9.56 9.56 25.06 9.56 34.62 0L396 279.42l76.164 76.165c9.56 9.56 25.06 9.56 34.62 0 9.56-9.56 9.56-25.06 0-34.62L430.62 244.8l76.164-76.163c9.56-9.56 9.56-25.06 0-34.62z" /></svg>
              </button>
          </div>
      </div>
  </div>
</template>

<script>
    export default {
    data() {
        return {
        show: true,
        }
    },
    watch: {
        '$page.props.flash': {
        handler() {
            this.show = true
        },
        deep: true,
        },
    },
        mounted() {
        }
    }
</script>