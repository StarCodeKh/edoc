<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />
        <div class="mb-6 flex flex-wrap justify-between items-center gap-4">
            <search-input v-model="form.search" class="w-full max-w-md" @reset="reset"></search-input>

            <!-- Channel tabs -->
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                    v-for="tab in channelTabs"
                    :key="tab.key"
                    type="button"
                    @click="form.channel = tab.key"
                    :class="[
                        'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                        form.channel === tab.key
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:hover:text-gray-200',
                    ]"
                >
                    {{ $t(tab.label) }}
                    <span
                        :class="[
                            'px-2 py-0.5 rounded-full text-xs font-bold',
                            form.channel === tab.key
                                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                        ]"
                        >{{ tab.count }}</span
                    >
                </button>
            </div>
        </div>

        <!-- One card that scrolls on its own, so the search and the channel tabs
         stay put and the header row never leaves the top of the list. -->
        <div
            class="tmpl-card bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
        >
            <div class="tmpl-scroll overflow-auto max-h-[68vh]">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left">
                            <th class="tmpl-th">{{ $t('Name') }}</th>
                            <th class="tmpl-th">{{ $t('Channel') }}</th>
                            <th class="tmpl-th">{{ $t('Slug') }}</th>
                            <th class="tmpl-th w-[42%]">{{ $t('Details') }}</th>
                            <th class="tmpl-th w-px"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr
                            v-for="template in templates.data"
                            :key="template.id"
                            class="group hover:bg-indigo-50/60 dark:hover:bg-gray-700/40 focus-within:bg-indigo-50/60 dark:focus-within:bg-gray-700/40 transition-colors"
                        >
                            <td class="align-middle">
                                <Link
                                    class="block px-6 py-3.5 font-medium text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                                    :href="this.route('templates.edit', template.id)"
                                >
                                    {{ template.name }}
                                </Link>
                            </td>
                            <td class="align-middle whitespace-nowrap">
                                <Link
                                    class="block px-6 py-3.5"
                                    :href="this.route('templates.edit', template.id)"
                                    tabindex="-1"
                                >
                                    <span
                                        :class="[
                                            'px-2.5 py-1 rounded-full text-xs font-semibold',
                                            template.channel === 'telegram'
                                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                                : 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
                                        ]"
                                    >
                                        {{ $t(channelLabel(template.channel)) }}
                                    </span>
                                </Link>
                            </td>
                            <td class="align-middle whitespace-nowrap">
                                <Link
                                    class="block px-6 py-3.5 font-mono text-[12px] text-gray-500 dark:text-gray-400"
                                    :href="this.route('templates.edit', template.id)"
                                    tabindex="-1"
                                >
                                    {{ template.slug }}
                                </Link>
                            </td>
                            <td class="align-middle">
                                <!-- Placeholder lists run long; two lines keeps every row the
                     same height and the whole text is one hover away. -->
                                <Link
                                    class="block px-6 py-3.5 text-gray-600 dark:text-gray-300"
                                    :href="this.route('templates.edit', template.id)"
                                    :title="template.details"
                                    tabindex="-1"
                                >
                                    <span class="tmpl-details">{{ template.details }}</span>
                                </Link>
                            </td>
                            <td class="align-middle w-px">
                                <Link
                                    class="flex items-center px-4 py-3.5"
                                    :href="this.route('templates.edit', template.id)"
                                    tabindex="-1"
                                >
                                    <icon
                                        name="cheveron-right"
                                        class="block w-5 h-5 fill-gray-300 dark:fill-gray-500 group-hover:fill-indigo-500"
                                    />
                                </Link>
                            </td>
                        </tr>
                        <tr v-if="templates.data.length === 0">
                            <td class="px-6 py-10 text-center text-gray-500 dark:text-gray-400" colspan="5">
                                {{ $t('No templates found.') }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <pagination class="mt-6" :links="templates.links" />
    </div>
</template>

<script>
import { Link, Head } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import pickBy from 'lodash/pickBy';
import Layout from '@/Shared/Layout.vue';
import throttle from 'lodash/throttle';
import mapValues from 'lodash/mapValues';
import Pagination from '@/Shared/Pagination.vue';
import SearchInput from '@/Shared/SearchInput.vue';

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
        };
    },
    computed: {
        channelTabs() {
            return [
                { key: null, label: 'All', count: this.channels.all || 0 },
                { key: 'email', label: 'Email', count: this.channels.email || 0 },
                { key: 'telegram', label: 'Telegram', count: this.channels.telegram || 0 },
            ];
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(this.route('templates'), pickBy(this.form), { preserveState: true });
            }, 150),
        },
    },
    methods: {
        channelLabel(channel) {
            return channel === 'telegram' ? 'Telegram' : 'Email';
        },
        reset() {
            this.form = mapValues(this.form, () => null);
        },
    },
};
</script>

<style scoped>
/* Header row rides along with the scroll instead of leaving with it. */
.tmpl-th {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 14px 24px;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--ink-muted);
    background: var(--surface);
    border-bottom: 1px solid var(--line);
}
:global(.dark) .tmpl-th {
    color: var(--ink-subtle);
    background: #1f2937;
    border-bottom-color: #374151;
}

/* Long placeholder lists are cut to two lines - the full text is in the title. */
.tmpl-details {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* A slim scrollbar that stays out of the way of the list. */
.tmpl-scroll {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
    overscroll-behavior: contain;
}
.tmpl-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.tmpl-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.tmpl-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: content-box;
}
.tmpl-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
    background-clip: content-box;
}
:global(.dark) .tmpl-scroll {
    scrollbar-color: #4b5563 transparent;
}
:global(.dark) .tmpl-scroll::-webkit-scrollbar-thumb {
    background: #4b5563;
    background-clip: content-box;
}
</style>
