<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex workspace__members flex-col task__table h-[calc(100%-52px)] overflow-hidden overflow-y-auto">
            <!-- Enhanced Header -->
            <!-- Not clipped: the panels the buttons in here open (invite, the
                 more menu) drop below the header's bottom edge. The decorative
                 layers below are all inset-0, so nothing needs clipping. -->
            <div
                class="relative bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 text-white"
            >
                <!-- Animated Background Pattern -->
                <div class="absolute inset-0 opacity-10">
                    <div
                        class="absolute inset-0"
                        style="
                            background-image: radial-gradient(
                                circle at 2px 2px,
                                rgba(255, 255, 255, 0.15) 1px,
                                transparent 0
                            );
                            background-size: 40px 40px;
                            animation: patternMove 20s linear infinite;
                        "
                    ></div>
                </div>
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                <div class="relative min-w-full py-8 px-4 md:px-6 lg:px-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div class="flex items-center gap-5">
                            <Link
                                :href="route('workspace.view', workspace.slug || workspace.id)"
                                class="relative group"
                            >
                                <div
                                    v-if="workspace.logo"
                                    class="logo has_bg flex justify-center items-center w-20 h-20 rounded-3xl text-white text-2xl shadow-2xl ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
                                    :style="{ 'background-image': 'url(' + workspace.logo + ')' }"
                                ></div>
                                <div
                                    v-else
                                    class="logo flex justify-center items-center w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-md text-white text-3xl font-bold shadow-2xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-105"
                                >
                                    {{ workspace.name.charAt(0).toUpperCase() }}
                                </div>
                                <div
                                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"
                                ></div>
                            </Link>
                            <div class="flex flex-col gap-1">
                                <h1 class="text-4xl font-extrabold text-white drop-shadow-lg">
                                    {{ $t('Team Members') }}
                                </h1>
                                <p class="text-white/90 text-base mt-1">{{ workspace.name }} {{ $t('workspace') }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button
                                v-if="workspace.member.role === 'admin'"
                                @click="toggleInviteMember($event)"
                                class="flex gap-2 bg-white/25 hover:bg-white/35 backdrop-blur-md h-11 items-center text-white rounded-xl px-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold border border-white/30"
                            >
                                <icon name="user_plus" class="w-5 h-5 fill-white" />
                                <span>{{ $t('Invite Members') }}</span>
                            </button>

                            <!-- Placed from the button it was opened from; it
                                 renders on the body, so it is not clipped by
                                 the header it sits in. -->
                            <invite-workspace-member
                                :workspace="workspace"
                                :anchor="invite_anchor"
                                v-if="invite_workspace"
                                @invite-member="closeInviteMember()"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="min-w-full py-8 align-middle md:px-4 lg:px-6 xl:px-8">
                <!-- Search and Stats Section -->
                <div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="p-3 bg-indigo-100 rounded-xl">
                                <icon name="users" class="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-extrabold text-gray-900">{{ $t('All Members') }}</h2>
                                <p class="text-sm text-gray-600 mt-1">
                                    <span class="font-semibold text-indigo-600">{{ team_members.data.length }}</span>
                                    <span class="text-gray-500"> {{ $t('of') }} </span>
                                    <span class="font-semibold">{{ team_members.total || 0 }}</span>
                                    <span class="text-gray-500">
                                        {{ $t('member' + (team_members.total !== 1 ? 's' : '')) }}</span
                                    >
                                </p>
                            </div>
                        </div>
                        <div class="relative flex-1 sm:flex-initial sm:w-80">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <icon name="search" class="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                v-model="form.search"
                                type="text"
                                :placeholder="$t('Search members...')"
                                class="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white text-sm font-medium shadow-sm"
                            />
                            <button
                                v-if="form.search"
                                @click="reset"
                                class="absolute inset-y-0 right-0 flex items-center pr-4 hover:bg-gray-100 rounded-r-xl transition-colors"
                            >
                                <icon name="close" class="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Members Grid -->
                <div
                    v-if="team_members.data.length > 0"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6"
                >
                    <div
                        v-for="(member, member_index) in team_members.data"
                        :key="member.id"
                        class="bg-white rounded-2xl shadow-lg border-2 border-gray-200/60 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                        :style="{ animationDelay: member_index * 50 + 'ms' }"
                    >
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="relative">
                                    <div
                                        v-if="member.photo"
                                        class="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all shadow-lg"
                                    >
                                        <img
                                            class="h-full w-full object-cover"
                                            :src="member.photo"
                                            :alt="member.name"
                                        />
                                    </div>
                                    <div
                                        v-else
                                        class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all shadow-lg"
                                    >
                                        {{ member.name.charAt(0).toUpperCase() }}
                                    </div>
                                    <div
                                        v-if="member.role === 'admin'"
                                        class="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                                    >
                                        <icon name="star" class="w-3 h-3 fill-yellow-600 text-yellow-600" />
                                    </div>
                                </div>
                                <button
                                    v-if="workspace.member.id !== member.id && workspace.member.role === 'admin'"
                                    @click="deleteMember(member, member_index)"
                                    class="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <icon name="trash" class="w-5 h-5" />
                                </button>
                            </div>
                            <div class="mb-4">
                                <h3
                                    class="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors"
                                >
                                    {{ member.name }}
                                </h3>
                                <p
                                    v-if="member.title"
                                    class="text-sm text-gray-500 mb-2 truncate"
                                    :title="member.title"
                                >
                                    {{ member.title }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold capitalize"
                                        :class="{
                                            'bg-indigo-100 text-indigo-700': member.role === 'admin',
                                            'bg-purple-100 text-purple-700': member.role === 'member',
                                            'bg-gray-100 text-gray-700':
                                                !member.role || (member.role !== 'admin' && member.role !== 'member'),
                                        }"
                                    >
                                        <icon
                                            :name="member.role === 'admin' ? 'shield' : 'user'"
                                            class="w-3 h-3 mr-1.5"
                                            :class="{
                                                'text-indigo-600': member.role === 'admin',
                                                'text-purple-600': member.role === 'member',
                                                'text-gray-600':
                                                    !member.role ||
                                                    (member.role !== 'admin' && member.role !== 'member'),
                                            }"
                                        />
                                        {{ member.role || 'Member' }}
                                    </span>
                                </div>
                            </div>
                            <div class="pt-4 border-t border-gray-200">
                                <div class="flex items-center gap-2 text-sm text-gray-600">
                                    <icon name="clock" class="w-4 h-4 text-gray-400" />
                                    <span class="font-medium">{{
                                        moment(member.created_at).format('MMM D, YYYY')
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-else
                    class="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl border-2 border-dashed border-indigo-300 p-16 text-center shadow-lg"
                >
                    <div class="relative inline-block mb-6">
                        <div
                            class="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center shadow-lg"
                        >
                            <icon name="users" class="w-12 h-12 text-indigo-500" />
                        </div>
                        <div
                            class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full border-4 border-white shadow-lg animate-bounce"
                        ></div>
                    </div>
                    <h3 class="text-3xl font-extrabold text-gray-900 mb-3">{{ $t('No members found') }}</h3>
                    <p class="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        <span v-if="form.search">{{ $t('Try adjusting your search to find members') }}</span>
                        <span v-else>{{ $t('Invite team members to collaborate on this workspace') }}</span>
                    </p>
                    <button
                        v-if="workspace.member.role === 'admin' && !form.search"
                        @click="invite_workspace = true"
                        class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                        <icon name="user_plus" class="w-6 h-6 fill-white" />
                        <span class="text-lg">{{ $t('Invite Members') }}</span>
                    </button>
                    <button
                        v-else-if="form.search"
                        @click="reset"
                        class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        <icon name="close" class="w-5 h-5" />
                        <span class="text-lg">{{ $t('Clear Search') }}</span>
                    </button>
                </div>

                <!-- Pagination -->
                <div v-if="team_members.data.length > 0" class="flex justify-center mt-8">
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-4">
                        <pagination :links="team_members.links" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Head, Link } from '@inertiajs/vue3';
import Layout from '@/Shared/Layout.vue';
import Icon from '@/Shared/Icon.vue';
import Pagination from '@/Shared/Pagination.vue';
import BoardViewMenu from '@/Shared/BoardViewMenu.vue';
import moment from 'moment';
import SearchInput from '@/Shared/SearchInput.vue';
import CreateProject from '@/Shared/Modals/CreateProject.vue';
import InviteWorkspaceMember from '@/Shared/Modals/InviteWorkspaceMember.vue';
import mapValues from 'lodash/mapValues';
import throttle from 'lodash/throttle';
import pickBy from 'lodash/pickBy';
import axios from 'axios';

export default {
    components: {
        InviteWorkspaceMember,
        CreateProject,
        Head,
        Icon,
        Link,
        BoardViewMenu,
        Pagination,
        SearchInput,
    },
    layout: Layout,
    props: {
        title: String,
        auth: Object,
        projects: Object,
        workspace: Object,
        team_members: Object,
        filters: Object,
    },
    data() {
        return {
            invite_workspace: false,
            invite_anchor: null,
            form: {
                search: '',
            },
        };
    },
    watch: {
        form: {
            deep: true,
            handler: throttle(function () {
                this.$inertia.get(
                    this.route('workspace.members', this.workspace.slug || this.workspace.id),
                    pickBy(this.form),
                    { preserveState: true }
                );
            }, 150),
        },
    },
    computed: {},
    created() {
        this.moment = moment;
    },
    methods: {
        reset() {
            this.form = mapValues(this.form, () => null);
        },
        toggleInviteMember(event) {
            this.invite_anchor = event.currentTarget;
            this.invite_workspace = !this.invite_workspace;
        },
        closeInviteMember() {
            this.invite_workspace = false;
            // Members may have been ticked on or off while the panel was open,
            // so the grid is refetched - without clearing the search the way
            // reset() used to.
            this.$inertia.reload({ only: ['team_members'], preserveState: true, preserveScroll: true });
        },
        deleteMember(member, index) {
            this.team_members.data.splice(index, 1);
            axios.post(this.route('json.workspace.member.add'), {
                workspace_id: this.workspace.id,
                user_id: member.user_id,
            });
        },
    },
};
</script>
