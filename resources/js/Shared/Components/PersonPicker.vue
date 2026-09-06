<template>
    <div>
        <!-- A short list reads faster than a search box does, so the box only
             appears once the list is long enough to be worth narrowing. -->
        <div v-if="searchable" class="relative mb-1">
            <icon
                name="search"
                class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
                v-model="query"
                type="text"
                autocomplete="off"
                class="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 py-1.5 pl-8 pr-7 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-0"
                :placeholder="placeholder || $t('Search name, title, department…')"
            />
            <button
                v-if="query"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                :aria-label="$t('Clear All')"
                @click="query = ''"
            >
                <icon name="close" class="h-3.5 w-3.5" />
            </button>
        </div>

        <ul
            v-if="matches.length"
            class="max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 p-1"
        >
            <li v-for="person in matches" :key="person.id">
                <label
                    class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                    <input
                        type="checkbox"
                        class="h-4 w-4 shrink-0 rounded border-gray-300 dark:border-white/15 text-indigo-600 dark:text-indigo-300"
                        :value="person.id"
                        :checked="modelValue.includes(person.id)"
                        @change="toggle(person.id)"
                    />
                    <span class="min-w-0">
                        <span class="block truncate text-sm text-gray-800 dark:text-gray-100">{{ person.name }}</span>
                        <!-- ចំណងជើង first: it is the one that says what somebody
                             does, where the office only says where they sit. -->
                        <span v-if="person.title" class="block truncate text-[11px] text-gray-500 dark:text-gray-400">{{
                            person.title
                        }}</span>
                        <span
                            v-if="placeLabel(person)"
                            class="block truncate text-[11px] text-gray-400 dark:text-gray-500"
                            >{{ placeLabel(person) }}</span
                        >
                    </span>
                </label>
            </li>
        </ul>

        <p
            v-else
            class="rounded-xl border border-dashed border-gray-200 dark:border-white/10 px-3 py-2 text-[11px] text-gray-400 dark:text-gray-500"
        >
            {{ $t('No matches') }}
        </p>

        <!-- Only while the list is actually narrowed: saying "18 of 18" tells
             the reader nothing they cannot already see. -->
        <p v-if="isNarrowed" class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            {{ $t(':count of :total', { count: matches.length, total: people.length }) }}
        </p>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';

/**
 * A checkbox list of people, narrowed by one search box.
 *
 * One box across name, ចំណងជើង, នាយកដ្ឋាន and ការិយាល័យរង rather than a select
 * per field: a sidebar has no width for three dropdowns, and you usually
 * remember one of the four without remembering which kind it was.
 */
export default {
    components: { Icon },
    props: {
        /** Chosen ids. Kept as ids so the parent posts them unchanged. */
        modelValue: { type: Array, default: () => [] },
        people: { type: Array, default: () => [] },
        placeholder: { type: String, default: '' },
        /** Below this many, the list is quicker to read than to search. */
        searchAfter: { type: Number, default: 5 },
    },
    emits: ['update:modelValue'],
    data() {
        return { query: '' };
    },
    computed: {
        searchable() {
            return this.people.length > this.searchAfter;
        },
        /** One lowercased haystack per person, built once per keystroke. */
        matches() {
            const needle = this.query.trim().toLowerCase();

            if (!needle) return this.people;

            return this.people.filter((person) =>
                [person.name, person.title, person.department, person.office, person.role]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(needle)
            );
        },
        isNarrowed() {
            return this.searchable && this.matches.length !== this.people.length;
        },
    },
    watch: {
        /**
         * Someone ticked, then filtered away, is still ticked and still posted
         * - which is the point. But a list that has shrunk under the search
         * threshold has no box left to clear, so the text goes with it.
         */
        searchable(value) {
            if (!value) this.query = '';
        },
    },
    methods: {
        /** នាយកដ្ឋាន · ការិយាល័យរង, or whichever of the two they have. */
        placeLabel(person) {
            return [person.department, person.office].filter(Boolean).join(' · ');
        },
        toggle(id) {
            const next = this.modelValue.includes(id)
                ? this.modelValue.filter((value) => value !== id)
                : [...this.modelValue, id];

            this.$emit('update:modelValue', next);
        },
    },
};
</script>
