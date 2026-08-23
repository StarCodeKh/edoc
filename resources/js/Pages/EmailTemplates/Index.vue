<template>
  <div class="sec-cont">
    <Head :title="$t(title)" />
    <div class="mb-6 flex flex-wrap justify-between items-center gap-4">
      <search-input v-model="form.search" class="w-full max-w-md" @reset="reset"></search-input>

      <!-- Channel tabs -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        <button
          v-for="tab in channelTabs"
          :key="tab.key"
          type="button"
          @click="form.channel = tab.key"
          :class="[
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
            form.channel === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ $t(tab.label) }}
          <span :class="[
            'px-2 py-0.5 rounded-full text-xs font-bold',
            form.channel === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
          ]">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="bg-white rounded-md shadow overflow-x-auto">
      <table class="w-full whitespace-nowrap">
        <tbody>
        <tr class="text-left font-bold">
            <th class="px-6 pt-6 pb-4">{{ $t('Name') }}</th>
            <th class="px-6 pt-6 pb-4">{{ $t('Channel') }}</th>
            <th class="px-6 pt-6 pb-4">{{ $t('Slug') }}</th>
            <th class="px-6 pt-6 pb-4">{{ $t('Details') }}</th>
        </tr>
        <tr v-for="template in templates.data" :key="template.id" class="hover:bg-gray-100 focus-within:bg-gray-100">
            <td class="border-t">
                <Link class="px-6 py-4 flex items-center focus:text-indigo-500" :href="this.route('templates.edit', template.id)">
                    {{ template.name }}
                </Link>
            </td>
            <td class="border-t">
                <Link class="px-6 py-4 flex items-center" :href="this.route('templates.edit', template.id)">
                    <span :class="[
                        'px-2.5 py-1 rounded-full text-xs font-semibold',
                        template.channel === 'telegram' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
                    ]">
                        {{ $t(channelLabel(template.channel)) }}
                    </span>
                </Link>
            </td>
            <td class="border-t">
                <Link class="px-6 py-4 flex items-center focus:text-indigo-500" :href="this.route('templates.edit', template.id)">
                    {{ template.slug }}
                </Link>
            </td>
            <td class="border-t">
                <Link class="px-6 py-4 flex items-center focus:text-indigo-500 whitespace-normal max-w-xl" :href="this.route('templates.edit', template.id)">
                    {{ template.details }}
                </Link>
            </td>
            <td class="border-t w-px">
                <Link class="px-4 flex items-center" :href="this.route('templates.edit', template.id)" tabindex="-1">
                    <icon name="cheveron-right" class="block w-6 h-6 fill-gray-400" />
                </Link>
            </td>
        </tr>
        <tr v-if="templates.data.length === 0">
            <td class="border-t px-6 py-4" colspan="5">{{ $t('No templates found.') }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <pagination class="mt-6" :links="templates.links" />
  </div>
</template>

<script>
import { Link, Head } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import pickBy from 'lodash/pickBy'
import Layout from '@/Shared/Layout.vue'
import throttle from 'lodash/throttle'
import mapValues from 'lodash/mapValues'
import Pagination from '@/Shared/Pagination.vue'
import SearchInput from '@/Shared/SearchInput.vue'

export default {
  metaInfo: { title: 'Notification Templates' },
  components: {
    Icon,
    Link,
    Head,
    Pagination,
      SearchInput,
  },
  layout: Layout,
  props: {
    title: String,
    filters: Object,
      templates: Object,
    channels: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      form: {
        search: this.filters.search,
        channel: this.filters.channel || null,
      },
    }
  },
  computed: {
    channelTabs() {
      return [
        { key: null, label: 'All', count: this.channels.all || 0 },
        { key: 'email', label: 'Email', count: this.channels.email || 0 },
        { key: 'telegram', label: 'Telegram', count: this.channels.telegram || 0 },
      ]
    },
  },
  watch: {
    form: {
      deep: true,
      handler: throttle(function() {
        this.$inertia.get(this.route('templates'), pickBy(this.form), { preserveState: true })
      }, 150),
    },
  },
  methods: {
    channelLabel(channel) {
      return channel === 'telegram' ? 'Telegram' : 'Email'
    },
    reset() {
      this.form = mapValues(this.form, () => null)
    },
  },
}
</script>
