<template>
    <div class="sec-cont">
        <Head :title="title" />
        <div class="bg-white rounded-md shadow overflow-hidden w-full">
            <form @submit.prevent="store">
                <div class="p-8 -mr-6 -mb-8 flex flex-wrap">
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
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center">
                    <loading-button :loading="form.processing" class="btn-indigo" type="submit">{{
                        $t('Create Role')
                    }}</loading-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { Link, Head, useForm } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import TextInput from '@/Shared/TextInput.vue';
import LoadingButton from '@/Shared/LoadingButton.vue';

export default {
    metaInfo: { title: 'Create a New Role' },
    components: {
        LoadingButton,
        TextInput,
        Link,
        Head,
    },
    layout: Layout,
    props: {
        title: String,
    },
    remember: 'form',
    data() {
        return {
            form: useForm({
                name: null,
                slug: null,
                create_workspace: null,
                create_project: null,
            }),
        };
    },
    methods: {
        store() {
            this.form.post(this.route('roles.store'));
        },
    },
    created() {},
};
</script>
