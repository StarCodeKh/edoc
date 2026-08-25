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
                </div>
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                    <button class="text-red-600 hover:underline" tabindex="-1" type="button" @click="destroy">
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
        workspace_type: Object,
    },
    remember: 'form',
    data() {
        return {
            form: useForm({
                name: this.workspace_type.name,
            }),
        };
    },
    methods: {
        update() {
            this.form.put(this.route('workspace_types.update', this.workspace_type.id));
        },
        destroy() {
            if (confirm('Are you sure you want to delete this workspace type?')) {
                this.$inertia.delete(this.route('workspace_types.destroy', this.workspace_type.id));
            }
        },
        restore() {
            if (confirm('Are you sure you want to restore this workspace type?')) {
                this.$inertia.put(this.route('workspace_types.restore', this.workspace_type.id));
            }
        },
    },
    created() {},
};
</script>
