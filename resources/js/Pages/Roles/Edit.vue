<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />
        <div class="bg-white rounded-md shadow overflow-hidden w-full">
            <form @submit.prevent="update">
                <div class="p-8 flex flex-wrap">
                    <text-input
                        v-model="form.name"
                        :error="form.errors.name"
                        class="pr-6 pb-8 w-full lg:w-1/2"
                        :label="$t('Name')"
                    />
                    <text-input
                        v-model="form.slug"
                        :error="form.errors.slug"
                        class="pr-6 pb-8 w-full lg:w-1/2"
                        :label="$t('Slug')"
                    />
                </div>
                <div class="p-8 flex flex-col gap-10">
                    <label for="create__workspace" class="flex toggle_swtich items-center cursor-pointer">
                        <div class="mr-3 text-sm">
                            {{ $t('Create workspace') }}
                        </div>
                        <div class="relative">
                            <input
                                id="create__workspace"
                                type="checkbox"
                                class="sr-only"
                                v-model="form.create_workspace"
                            />
                            <div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                            <div
                                class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"
                            ></div>
                        </div>
                    </label>
                    <label for="create__project" class="flex toggle_swtich items-center cursor-pointer">
                        <div class="mr-3 text-sm">
                            {{ $t('Create Project') }}
                        </div>
                        <div class="relative">
                            <input id="create__project" type="checkbox" class="sr-only" v-model="form.create_project" />
                            <div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                            <div
                                class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"
                            ></div>
                        </div>
                    </label>
                </div>
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                    <button
                        v-if="!['admin', 'normal'].includes(role.slug)"
                        class="text-red-600 hover:underline"
                        tabindex="-1"
                        type="button"
                        @click="destroy"
                    >
                        {{ $t('Delete') }}
                    </button>
                    <loading-button :loading="form.processing" class="btn-indigo ml-auto" type="submit">{{
                        $t('Update')
                    }}</loading-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import Layout from '@/Shared/Layout.vue';
import { Link, Head, useForm } from '@inertiajs/vue3';
import TextInput from '@/Shared/TextInput.vue';
import LoadingButton from '@/Shared/LoadingButton.vue';

export default {
    metaInfo() {
        return { title: this.form.name };
    },
    components: {
        LoadingButton,
        TextInput,
        Link,
        Head,
    },
    layout: Layout,
    props: {
        title: String,
        role: Object,
    },
    remember: 'form',
    data() {
        return {
            form: useForm({
                name: this.role.name,
                slug: this.role.slug,
                create_workspace: !!this.role.create_workspace,
                create_project: !!this.role.create_project,
            }),
        };
    },
    methods: {
        update() {
            this.form.put(this.route('roles.update', this.role.id));
        },
        destroy() {
            if (confirm('Are you sure you want to delete this role?')) {
                this.$inertia.delete(this.route('roles.destroy', this.role.id));
            }
        },
        restore() {
            if (confirm('Are you sure you want to restore this role?')) {
                this.$inertia.put(this.route('roles.restore', this.role.id));
            }
        },
    },
    created() {},
};
</script>
