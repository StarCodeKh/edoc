<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />
        <div class="bg-white rounded-md shadow overflow-hidden max-w-3xl">
            <form @submit.prevent="update">
                <div class="p-8 -mb-6 flex">
                    <text-input
                        v-model="form.name"
                        :error="form.errors.name"
                        class="pr-6 pb-8 w-full lg:w-1/2"
                        :label="$t('Name')"
                    />
                </div>
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                    <button class="text-red-600 hover:underline" tabindex="-1" type="button" @click="destroy">
                        {{ $t('Delete') }} {{ $t('Label') }}
                    </button>
                    <loading-button :loading="form.processing" class="btn-indigo ml-auto" type="submit"
                        >{{ $t('Update') }} {{ $t('Label') }}</loading-button
                    >
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
    async metaInfo() {
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
        label: Object,
    },
    remember: 'form',
    async data() {
        return {
            form: useForm({
                name: this.label.name,
                color: this.label.color,
            }),
        };
    },
    methods: {
        update() {
            this.form.put(this.route('labels.update', this.label.id));
        },
        async destroy() {
            if (
                await this.$confirm({
                    title: this.$t('Are you sure you want to delete this label?'),
                    confirmLabel: this.$t('Delete'),
                    tone: 'danger',
                })
            ) {
                this.$inertia.delete(this.route('labels.destroy', this.label.id));
            }
        },
        async restore() {
            if (
                await this.$confirm({
                    title: this.$t('Are you sure you want to restore this label?'),
                    confirmLabel: this.$t('Restore'),
                    tone: 'default',
                })
            ) {
                this.$inertia.put(this.route('labels.restore', this.label.id));
            }
        },
    },
};
</script>
