<template>
    <div class="sec-cont">
        <Head :title="$t('Users')" />

        <page-header
            :title="$t('Manage Users')"
            :subtitle="$t('Everyone with an account')"
            icon="users"
            :count="users.total"
        >
            <template #actions>
                <Link class="btn-indigo shrink-0 text-center" :href="route('users.create')">
                    <span>{{ $t('Create New') }}</span>
                </Link>
            </template>
        </page-header>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center ticket-filters">
            <search-input
                v-model="form.search"
                class="w-full sm:max-w-md"
                :placeholder="$t('Search name, email, title, department…')"
                @reset="reset"
            />
            <select-input v-model="form.role_id" class="w-full sm:w-56">
                <option :value="null">{{ $t('Filter by role') }}</option>
                <option v-for="(r, ri) in roles" :key="ri" :value="r.id">{{ r.name }}</option>
            </select-input>
        </div>

        <div
            class="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#262932]"
        >
            <!-- Six columns do not survive a phone, and nobody scrolls a table
                 sideways. Below sm the rows are cards; above, phone and title
                 drop out first as the thinnest columns. -->
            <table class="hidden w-full sm:table">
                <thead>
                    <tr class="border-b border-gray-100 text-left dark:border-white/5">
                        <th class="th-cell">{{ $t('Name') }}</th>
                        <th class="th-cell">{{ $t('Email') }}</th>
                        <th class="th-cell hidden lg:table-cell">{{ $t('Phone') }}</th>
                        <th class="th-cell hidden md:table-cell">{{ $t('Title') }}</th>
                        <th class="th-cell" colspan="2">{{ $t('Role') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr
                        v-for="user in users.data"
                        :key="user.id"
                        class="group transition-colors hover:bg-gray-50 focus-within:bg-gray-50 dark:hover:bg-white/5 dark:focus-within:bg-white/5"
                    >
                        <td class="px-5 py-3">
                            <Link
                                class="flex items-center gap-3 text-sm font-medium text-gray-800 focus:text-indigo-500 dark:text-gray-100"
                                :href="route('users.edit', user.id)"
                            >
                                <img
                                    v-if="user.photo"
                                    class="h-8 w-8 shrink-0 rounded-full object-cover"
                                    :src="user.photo"
                                    alt=""
                                />
                                <span
                                    v-else
                                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300"
                                >
                                    {{ initial(user.name) }}
                                </span>
                                <span class="truncate">{{ user.name }}</span>
                            </Link>
                        </td>
                        <td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                            <Link :href="route('users.edit', user.id)" tabindex="-1" class="block truncate">
                                {{ user.email }}
                            </Link>
                        </td>
                        <td class="hidden px-5 py-3 text-sm text-gray-600 dark:text-gray-300 lg:table-cell">
                            <span v-if="user.phone">{{ user.phone }}</span>
                            <span v-else class="text-gray-300 dark:text-gray-600">—</span>
                        </td>
                        <td class="hidden px-5 py-3 text-sm text-gray-600 dark:text-gray-300 md:table-cell">
                            <span v-if="user.title" class="block truncate">{{ user.title }}</span>
                            <span v-else class="text-gray-300 dark:text-gray-600">—</span>
                        </td>
                        <td class="px-5 py-3">
                            <span v-if="user.role" :class="['role-pill', roleTone(user.role)]">{{
                                user.role.name
                            }}</span>
                            <span v-else class="text-gray-300 dark:text-gray-600">—</span>
                        </td>
                        <td class="w-px px-3 py-3">
                            <Link :href="route('users.edit', user.id)" tabindex="-1" class="block">
                                <icon
                                    name="cheveron-right"
                                    class="h-5 w-5 fill-gray-300 transition-colors group-hover:fill-gray-500 dark:fill-gray-600"
                                />
                            </Link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <ul class="divide-y divide-gray-100 dark:divide-white/5 sm:hidden">
                <li v-for="user in users.data" :key="user.id">
                    <Link class="flex items-center gap-3 px-4 py-3" :href="route('users.edit', user.id)">
                        <img
                            v-if="user.photo"
                            class="h-9 w-9 shrink-0 rounded-full object-cover"
                            :src="user.photo"
                            alt=""
                        />
                        <span
                            v-else
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        >
                            {{ initial(user.name) }}
                        </span>
                        <span class="min-w-0 flex-1">
                            <span class="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">{{
                                user.name
                            }}</span>
                            <span class="block truncate text-xs text-gray-500 dark:text-gray-400">{{
                                user.email
                            }}</span>
                            <span v-if="user.title" class="block truncate text-xs text-gray-400 dark:text-gray-500">{{
                                user.title
                            }}</span>
                        </span>
                        <span v-if="user.role" :class="['role-pill shrink-0', roleTone(user.role)]">{{
                            user.role.name
                        }}</span>
                    </Link>
                </li>
            </ul>

            <div v-if="!users.data.length" class="px-5 py-16 text-center">
                <icon name="users" class="mx-auto h-10 w-10 fill-gray-300 dark:fill-gray-600" />
                <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('No users found.') }}</h3>
                <p v-if="isFiltered" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('Try a different search, or clear the filters.') }}
                </p>
            </div>
        </div>

        <pagination class="mt-6" :links="users.links" />
    </div>
</template>

<script>
import { Head, Link } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import pickBy from 'lodash/pickBy';
import Layout from '@/Shared/Layout.vue';
import throttle from 'lodash/throttle';
import mapValues from 'lodash/mapValues';
import Pagination from '@/Shared/Pagination.vue';
import PageHeader from '@/Shared/Components/PageHeader.vue';
import SearchInput from '@/Shared/SearchInput.vue';
import SelectInput from '@/Shared/SelectInput.vue';

export default {
    components: {
        SearchInput,
        Head,
        Icon,
        Link,
        PageHeader,
        SelectInput,
        Pagination,
    },
    layout: Layout,
    props: {
        filters: Object,
        users: Object,
        roles: Array,
    },
    data() {
        return {
            form: {
                search: this.filters.search,
                role_id: this.filters.role_id ?? null,
            },
        };
    },
    computed: {
        /** An empty list means something different once a filter is on. */
        isFiltered() {
            return Boolean(this.form.search || this.form.role_id);
        },
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(this.route('users'), pickBy(this.form), { preserveState: true });
            }, 150),
        },
    },
    methods: {
        reset() {
            this.form = mapValues(this.form, () => null);
        },
        initial(name) {
            return (name || '').trim().charAt(0);
        },
        /**
         * Told apart at a glance, because the three roles differ in how much
         * they can do and Super Admin should not read as decoration.
         *
         * On the name first: Super Admin and Admin share roles.slug 'admin', so
         * the slug alone cannot separate them - which is how the rest of the
         * app tells them apart too.
         */
        roleTone(role) {
            const name = (role.name || '').toLowerCase();
            const slug = (role.slug || '').toLowerCase();

            if (name.includes('super')) return 'role-pill--super';
            if (slug === 'admin' || name.includes('admin')) return 'role-pill--admin';

            return 'role-pill--normal';
        },
    },
};
</script>

<style scoped>
.th-cell {
    padding: 0.75rem 1.25rem;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(156 163 175);
}
.role-pill {
    display: inline-block;
    border-radius: 9999px;
    padding: 0.125rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
}
.role-pill--super {
    background: rgb(238 242 255);
    color: rgb(67 56 202);
}
.role-pill--admin {
    background: rgb(240 253 244);
    color: rgb(21 128 61);
}
.role-pill--normal {
    background: rgb(243 244 246);
    color: rgb(75 85 99);
}

/* Vue scopes the last compound selector, so `.dark .th-cell` compiles to
   `.dark .th-cell[data-v-x]` and still matches the root class Layout sets. */
.dark .th-cell {
    color: rgb(107 114 128);
}
.dark .role-pill--super {
    background: rgb(99 102 241 / 0.15);
    color: rgb(165 180 252);
}
.dark .role-pill--admin {
    background: rgb(34 197 94 / 0.15);
    color: rgb(134 239 172);
}
.dark .role-pill--normal {
    background: rgb(255 255 255 / 0.08);
    color: rgb(209 213 219);
}
</style>
