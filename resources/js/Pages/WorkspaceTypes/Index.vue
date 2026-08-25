<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />
        <div class="mb-6 flex justify-end items-center">
            <Link class="btn-indigo" :href="this.route('workspace_types.create')">
                <span>{{ $t('Create a new Workspace type') }}</span>
            </Link>
        </div>
        <div class="bg-white rounded-md shadow overflow-x-auto">
            <table class="w-full whitespace-nowrap">
                <tbody>
                    <tr class="text-left font-bold">
                        <th class="px-6 pt-6 pb-4">#{{ $t('ID') }}</th>
                        <th class="px-6 pt-6 pb-4">{{ $t('Name') }}</th>
                    </tr>
                    <tr
                        v-for="workspace_type in workspace_types.data"
                        :key="workspace_type.id"
                        class="hover:bg-gray-100 focus-within:bg-gray-100"
                    >
                        <td class="border-t">
                            <Link
                                class="px-6 py-4 flex items-center focus:text-indigo-500"
                                :href="this.route('workspace_types.edit', workspace_type.id)"
                            >
                                {{ workspace_type.id }}
                            </Link>
                        </td>
                        <td class="border-t">
                            <Link
                                class="px-6 py-4 flex items-center focus:text-indigo-500"
                                :href="this.route('workspace_types.edit', workspace_type.id)"
                            >
                                {{ workspace_type.name }}
                            </Link>
                        </td>
                        <td class="border-t w-px">
                            <Link
                                class="px-4 flex items-center"
                                :href="this.route('workspace_types.edit', workspace_type.id)"
                                tabindex="-1"
                            >
                                <icon name="cheveron-right" class="block w-6 h-6 fill-gray-400" />
                            </Link>
                        </td>
                    </tr>
                    <tr v-if="workspace_types.data.length === 0">
                        <td class="border-t px-6 py-4" colspan="4">No workspace type found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <pagination class="mt-6" :links="workspace_types.links" />
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

export default {
    metaInfo: { title: 'Workspace Type' },
    components: {
        Icon,
        Link,
        Head,
        Pagination,
    },
    layout: Layout,
    props: {
        title: String,
        filters: Object,
        workspace_types: Object,
    },
    data() {
        return {
            form: {
                search: this.filters.search,
            },
        };
    },
    watch: {
        // form: {
        //   deep: true,
        //   handler: throttle(function() {
        //     this.$inertia.get(this.route('workspace_types.index'), pickBy(this.form), { preserveState: true })
        //   }, 150),
        // },
    },
    methods: {
        reset() {
            this.form = mapValues(this.form, () => null);
        },
    },
};
</script>
