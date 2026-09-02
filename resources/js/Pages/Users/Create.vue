<template>
    <div class="sec-cont">
        <Head :title="$t(title)" />
        <div class="max-w-full bg-white rounded-md shadow overflow-hidden">
            <form @submit.prevent="store">
                <div class="flex flex-wrap -mb-8 -mr-6 p-8">
                    <text-input
                        v-model="form.first_name"
                        :error="form.errors.first_name"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('First name')"
                    />
                    <text-input
                        v-model="form.last_name"
                        :error="form.errors.last_name"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Last name')"
                    />
                    <text-input
                        v-model="form.email"
                        :error="form.errors.email"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Email')"
                    />
                    <text-input
                        v-model="form.phone"
                        :error="form.errors.phone"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Phone')"
                    />
                    <text-input
                        v-model="form.address"
                        :error="form.errors.address"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Address')"
                    />
                    <text-input
                        v-model="form.title"
                        :error="form.errors.title"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Title')"
                    />
                    <select-input
                        v-model="form.role_id"
                        :error="form.errors.role_id"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Role')"
                    >
                        <option :value="null" />
                        <option v-for="(r, ri) in roles" :key="ri" :value="r.id">{{ r.name }}</option>
                    </select-input>
                    <!-- Which workflow responsibility this person carries. The
                         options come from Settings > Workflow Roles, so the list
                         follows whatever is configured there. -->
                    <select-input
                        v-model="form.workflow_sub_role_id"
                        :error="form.errors.workflow_sub_role_id"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Responsibility')"
                    >
                        <option :value="null">{{ $t('None') }}</option>
                        <option v-for="sub in sub_roles" :key="sub.id" :value="sub.id">
                            {{ sub.name && sub.name !== sub.code ? sub.name + ' (' + sub.code + ')' : sub.code }}
                        </option>
                    </select-input>
                    <!-- Which office this person works in. The department is
                         only the narrowing pick - what is saved is the
                         sub-office, and its parent is the department. -->
                    <select-input v-model="department_id" class="pb-8 pr-6 w-full lg:w-1/3" :label="$t('Department')">
                        <option :value="null">{{ $t('None') }}</option>
                        <option v-for="dept in document_sources" :key="dept.id" :value="dept.id">
                            {{ dept.name }}
                        </option>
                    </select-input>
                    <select-input
                        v-model="form.document_source_id"
                        :error="form.errors.document_source_id"
                        :disabled="!offices.length"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Sub-office')"
                    >
                        <option :value="null">{{ $t('None') }}</option>
                        <option v-for="office in offices" :key="office.id" :value="office.id">
                            {{ office.name }}
                        </option>
                    </select-input>
                    <text-input
                        v-model="form.password"
                        :error="form.errors.password"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        type="password"
                        autocomplete="new-password"
                        :label="$t('Password')"
                    />
                    <file-input
                        v-model="form.photo"
                        :error="form.errors.photo"
                        class="pb-8 pr-6 w-full lg:w-1/2"
                        type="file"
                        accept="image/*"
                        :label="$t('Photo')"
                    />
                </div>
                <div class="flex items-center justify-end px-8 py-4 bg-gray-50 border-t border-gray-100">
                    <loading-button :loading="form.processing" class="btn-indigo" type="submit"
                        >{{ $t('Create') }} {{ $t('User') }}</loading-button
                    >
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { Head, Link, useForm } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import FileInput from '@/Shared/FileInput.vue';
import TextInput from '@/Shared/TextInput.vue';
import SelectInput from '@/Shared/SelectInput.vue';
import LoadingButton from '@/Shared/LoadingButton.vue';

export default {
    components: {
        FileInput,
        Head,
        Link,
        LoadingButton,
        SelectInput,
        TextInput,
    },
    layout: Layout,
    props: {
        countries: Array,
        cities: Array,
        title: String,
        roles: Array,
        sub_roles: { type: Array, default: () => [] },
        document_sources: { type: Array, default: () => [] },
    },
    remember: 'form',
    data() {
        return {
            // Only narrows the sub-office list; the user carries the office.
            department_id: null,
            form: useForm({
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                address: '',
                title: '',
                role_id: null,
                workflow_sub_role_id: null,
                document_source_id: null,
                password: '',
                photo: null,
            }),
        };
    },
    computed: {
        offices() {
            const dept = this.document_sources.find((item) => Number(item.id) === Number(this.department_id));
            return dept ? dept.children || [] : [];
        },
    },
    created() {
        // this.setDefaultValue(this.countries, 'country_id', 'United States')
    },
    watch: {
        // A department change drops an office that no longer belongs to it.
        department_id() {
            if (!this.offices.some((office) => Number(office.id) === Number(this.form.document_source_id))) {
                this.form.document_source_id = null;
            }
        },
    },
    methods: {
        setDefaultValue(arr, key, value) {
            const find = arr.find((i) => i.name.match(new RegExp(value + '.*')));
            if (find) {
                this.form[key] = find['id'];
            }
        },
        store() {
            this.form.post(this.route('users.store'));
        },
    },
};
</script>
