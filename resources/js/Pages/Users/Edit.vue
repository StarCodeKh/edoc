<template>
    <div class="sec-cont">
        <Head :title="title" />
        <div class="max-w-full bg-white rounded-md shadow overflow-hidden">
            <form @submit.prevent="update">
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
                    <text-input
                        v-model="form.password"
                        :error="form.errors.password"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        type="password"
                        autocomplete="new-password"
                        :label="$t('Password')"
                    />
                    <select-input
                        v-if="user.id !== auth.user.id"
                        v-model="form.role_id"
                        :error="form.errors.role"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        :label="$t('Role')"
                    >
                        <option :value="null" />
                        <option v-for="c in roles" :key="c.id" :value="c.id">{{ $t(c.name) }}</option>
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
                    <file-input
                        v-model="form.photo"
                        :error="form.errors.photo"
                        class="pb-8 pr-6 w-full lg:w-1/3"
                        type="file"
                        accept="image/*"
                        label="Photo"
                    />
                    <div class="w-full lg:w-1/3 flex items-center justify-start">
                        <img v-if="user.photo_path" class="block mb-2 w-8 h-8 rounded-full" :src="user.photo_path" />
                    </div>
                </div>
                <div class="flex items-center px-8 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        v-if="user.id !== auth.user.id && !user.deleted_at"
                        class="text-red-600 hover:underline"
                        tabindex="-1"
                        type="button"
                        @click="destroy"
                    >
                        {{ $t('Delete User') }}
                    </button>
                    <loading-button :loading="form.processing" class="btn-indigo ml-auto" type="submit"
                        >{{ $t('Update User') }}
                    </loading-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { Head, Link, useForm } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import TextInput from '@/Shared/TextInput.vue';
import FileInput from '@/Shared/FileInput.vue';
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
        user: Object,
        auth: Object,
        countries: Array,
        roles: Array,
        sub_roles: { type: Array, default: () => [] },
        document_sources: { type: Array, default: () => [] },
        cities: Array,
        title: String,
    },
    remember: 'form',
    data() {
        return {
            // Only narrows the sub-office list; the user carries the office.
            department_id: this.departmentOf(this.user.document_source_id),
            form: useForm({
                _method: 'put',
                first_name: this.user.first_name,
                last_name: this.user.last_name,
                email: this.user.email,
                phone: this.user.phone,
                address: this.user.address,
                title: this.user.title,
                country_id: this.user.country_id,
                password: '',
                role: this.user.role,
                role_id: this.user.role_id,
                workflow_sub_role_id: this.user.workflow_sub_role_id,
                document_source_id: this.user.document_source_id,
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
    async created() {
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
        /** The department a saved office sits under, so editing opens on it. */
        departmentOf(officeId) {
            if (!officeId) return null;
            const dept = this.document_sources.find((item) =>
                (item.children || []).some((office) => Number(office.id) === Number(officeId))
            );
            return dept ? dept.id : null;
        },
        setDefaultValue(arr, key, value) {
            const find = arr.find((i) => i.name.match(new RegExp(value + '.*')));
            if (find) {
                this.form[key] = find['id'];
            }
        },
        update() {
            this.form.post(this.route('users.update', this.user.id), {
                onSuccess: () => this.form.reset('password', 'photo'),
            });
        },
        async destroy() {
            if (
                await this.$confirm({
                    title: this.$t('Are you sure you want to delete this user?'),
                    confirmLabel: this.$t('Delete'),
                    tone: 'danger',
                })
            ) {
                this.$inertia.delete(route('users.destroy', this.user.id));
            }
        },
        async restore() {
            if (
                await this.$confirm({
                    title: this.$t('Are you sure you want to restore this user?'),
                    confirmLabel: this.$t('Restore'),
                    tone: 'default',
                })
            ) {
                this.$inertia.put(route('users.restore', this.user.id));
            }
        },
    },
};
</script>
