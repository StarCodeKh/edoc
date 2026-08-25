<template>
  <div class="sec-cont">
    <div class="bg-white rounded-md shadow overflow-hidden max-w-full">
      <form @submit.prevent="update">
          <div class="p-8 -mr-6 -mb-8 flex flex-wrap">
              <div class="pr-6 pb-8 w-full lg:w-1/3">
                  <div class="font-bold text-sm mb-1">{{ $t('Name') }} </div>
                  <div class="font-light text-sm flex items-center gap-2">
                      {{ template.name }}
                      <span :class="[
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          isTelegram ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
                      ]">{{ isTelegram ? $t('Telegram') : $t('Email') }}</span>
                  </div>
              </div>
              <div class="pr-6 pb-8 w-full lg:w-2/3">
                  <div class="font-bold text-sm mb-1">{{ $t('Details') }} </div>
                  <div class="font-light text-sm"> {{ template.details }} </div>
              </div>

              <!-- Telegram: plain text with a small HTML subset -->
              <div v-if="isTelegram" class="pr-6 pb-8 w-full">
                  <div class="font-bold text-sm mb-1">{{ $t('Telegram Message') }}</div>
                  <p class="text-xs text-gray-500 mb-2">
                      {{ $t('Telegram renders a small HTML subset only: b, i, u, s, a, code, pre. Line breaks are kept exactly as typed.') }}
                  </p>
                  <textarea
                      v-model="form.html"
                      rows="14"
                      spellcheck="false"
                      class="w-full font-mono text-sm border border-gray-300 rounded-md p-3 focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  ></textarea>

                  <div v-if="placeholders.length" class="mt-4">
                      <div class="font-bold text-sm mb-2">{{ $t('Available placeholders') }}</div>
                      <div class="flex flex-wrap gap-2">
                          <button
                              v-for="token in placeholders"
                              :key="token"
                              type="button"
                              @click="insertPlaceholder(token)"
                              class="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-xs font-mono transition-colors"
                              :title="$t('Click to append to the message')"
                          >{{ token }}</button>
                      </div>
                  </div>

                  <div class="mt-6">
                      <div class="font-bold text-sm mb-2">{{ $t('Preview') }}</div>
                      <div class="rounded-xl bg-[#e7f0f7] p-4">
                          <div class="inline-block max-w-lg rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm text-sm leading-relaxed telegram-preview" v-html="preview"></div>
                      </div>
                  </div>
              </div>

              <!-- Email: rich HTML body -->
              <div v-else class="pr-6 pb-8 w-full">
                  <div class="font-bold text-sm mb-1">{{ $t('Email Html') }} </div>
                  <div class="editable-content" contenteditable="true" v-html="template.html" @input="onInput"></div>
              </div>
          </div>
          <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
              <loading-button :loading="form.processing" class="btn-indigo ml-auto" type="submit">{{ $t('Update') }}
                  {{ $t('Template') }}</loading-button>
          </div>
      </form>
    </div>
  </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue'
import { Link, useForm } from '@inertiajs/vue3'
import TextInput from '@/Shared/TextInput.vue'
import LoadingButton from '@/Shared/LoadingButton.vue'

// Sample values used purely to render the live preview.
const SAMPLE = {
    '{app_name}': 'eDoc',
    '{sent_at}': 'Aug 23, 2026 3:36 PM',
    '{actor_name}': 'Sok Dara',
    '{assignee_name}': 'Chan Nita',
    '{assigner_name}': 'Sok Dara',
    '{adder_name}': 'Sok Dara',
    '{member_name}': 'Chan Nita',
    '{task_name}': 'Prepare quarterly report',
    '{project_name}': 'Testing',
    '{board_name}': 'In Progress',
    '{workspace_name}': 'ឯកសារផ្ទៃក្នុង',
    '{comment}': 'Looks good — please add the signature page.',
    '{change_message}': 'Due date changed to Aug 30, 2026',
    '{due_date}': 'Aug 30, 2026',
    '{task_url}': '#',
    '{workspace_link}': '#',
    '{link}': '#',
}

export default {
  metaInfo() {
    return { title: this.form.name }
  },
  components: {
    LoadingButton,
    TextInput,
    Link,
  },
  layout: Layout,
  props: {
      template: Object,
  },
  remember: 'form',
  data() {
    return {
        editorOptions: {
            debug: 'info',
            modules: {
            },
        },
      form: useForm({
          html: this.template.html,
      }),
    }
  },
  computed: {
      isTelegram() {
          return this.template.channel === 'telegram'
      },
      /** Placeholder tokens listed in the template's details text. */
      placeholders() {
          const found = new Set()
          for (const source of [this.template.details, this.template.html]) {
              for (const match of String(source || '').matchAll(/\{[a-z_]+\}/g)) {
                  found.add(match[0])
              }
          }
          return [...found].sort()
      },
      preview() {
          let body = String(this.form.html || '')
          for (const [token, value] of Object.entries(SAMPLE)) {
              body = body.split(token).join(value)
          }
          // Telegram renders newlines literally; the preview mirrors that.
          return body.replace(/\n/g, '<br>')
      },
  },
  methods: {
      insertPlaceholder(token) {
          this.form.html = `${this.form.html || ''}${token}`
      },
      onInput(e) {
          this.form.html = e.target.innerHTML;
      },
    update() {
      this.form.put(this.route('templates.update', this.template.id))
    },
  },
}
</script>

<style scoped>
.telegram-preview :deep(a) {
    color: #2481cc;
    text-decoration: none;
}
.telegram-preview :deep(code),
.telegram-preview :deep(pre) {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: #f1f3f5;
    border-radius: 4px;
    padding: 0 4px;
}
</style>
