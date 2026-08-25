<template>
    <div
        class="absolute top-[52px] w-[260px] left-[30%] z-[200] rounded-[8px] bg-white shadow overflow-hidden"
        :style="{ top, left, right }"
    >
        <div class="flex gap-3 flex-col py-3 px-3" v-if="!loading">
            <div class="flex items-center justify-between gap-1">
                <div class="flex"></div>
                <div class="flex text-center">
                    {{ $t('Invite Workspace') }}
                </div>
                <div
                    @click="$emit('inviteMember')"
                    class="flex hover:bg-gray-200 cursor-pointer rounded w-7 h-7 justify-center items-center"
                >
                    <icon class="w-4 h-4" name="close" />
                </div>
            </div>
            <input
                id="i_w_m_s_u"
                name="user_search"
                v-model="user_search"
                class="border-[2px] px-2 py-1 border-gray-400 rounded-[3px]"
                :placeholder="$t('Search User')"
            />
            <ul class="flex flex-col gap-1 h-48 max-h-48 overflow-y-auto">
                <li v-for="(userObject, user_index) in searchUser(user_search)">
                    <label :for="'uid_' + user_index" class="flex p-2 cursor-pointer hover:bg-gray-200 rounded">
                        <input
                            :id="'uid_' + user_index"
                            class="w-5 ml-1 mr-2"
                            type="checkbox"
                            :checked="workspace_users.includes(userObject.id)"
                            @change="inviteMember($event.target.checked, userObject.id, 'normal')"
                        />
                        <img
                            v-if="userObject.photo_path"
                            :aria-label="userObject.name"
                            :alt="userObject.name"
                            class="w-6 h-6 rounded-full"
                            :src="userObject.photo_path"
                        />
                        <img
                            v-else
                            :aria-label="userObject.name"
                            :alt="userObject.name"
                            class="w-6 h-6 rounded-full"
                            src="/images/user.svg"
                        />
                        <span data-a="" class="p-1" type="button" :tabindex="user_index">{{ userObject.name }}</span>
                    </label>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import SelectInput from '@/Shared/SelectInput.vue';
import Icon from '@/Shared/Icon.vue';
import axios from 'axios';
export default {
    name: 'invite-workspace-member',
    props: {
        top: {
            required: false,
            default: '132px',
        },
        left: {
            required: false,
            default: '390px',
        },
        right: {
            required: false,
            default: 'inherit',
        },
        workspace: Object,
    },
    components: { SelectInput, Icon },
    data() {
        return {
            project: {},
            loading: true,
            user_search: '',
            role: '',
            workspaces: [],
            users: [],
            workspace_users: [],
            backgrounds: [],
        };
    },
    methods: {
        inviteMember(checked, id, role) {
            axios
                .post(this.route('json.workspace.member.add'), { workspace_id: this.workspace.id, user_id: id, role })
                .then((response) => {
                    if (response.data) {
                        if (checked) {
                            this.workspace_users.push(id);
                        } else {
                            const findIndex = this.workspace_users.findIndex((a) => a === id);
                            if (findIndex > -1) {
                                this.workspace_users.splice(findIndex, 1);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        searchUser(input) {
            return this.users.filter((u) => u.name.toLowerCase().indexOf(input) > -1);
        },
        team__members() {
            return this.workspace_users.map((item) => item.id);
        },
        async getData() {
            const dataResponse = await axios.get(this.route('json.workspaces.users.other', this.workspace.id));
            const data = dataResponse.data;
            this.users = data.users;
            this.workspace_users = data.workspace_users;
            this.loading = false;
        },
    },
    created() {
        this.getData();
    },
};
</script>
