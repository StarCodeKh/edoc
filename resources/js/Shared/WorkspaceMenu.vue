<template>
    <div v-if="workspace" class="sidebar_wrapper">
        <Link
            :href="route('workspace.view', workspace.slug || workspace.id)"
            class="p-3 flex flex-wrap gap-2 items-center relative"
        >
            <div
                v-if="workspace.logo"
                class="logo has_bg flex justify-center items-center w-9 h-9 rounded-full text-white text-lg"
                :style="{ 'background-image': 'url(' + workspace.logo + ')' }"
            ></div>
            <div
                v-else
                class="logo flex justify-center items-center w-9 h-9 rounded-full bg-indigo-600 text-white text-lg"
            >
                {{ workspace.name.charAt(0) }}
            </div>
            <div class="name flex flex-wrap w-[140px] text-ellipsis leading-5 cursor-pointer">
                {{ workspace.name }}
            </div>
            <div
                @click="$emit('enableSidebar')"
                class="arrow right-2 absolute w-7 h-7 flex items-center hover:bg-[#a6c5e229] justify-center rounded cursor-pointer"
            >
                <icon class="w-4 h-4" name="arrow-left" />
            </div>
        </Link>
        <ul class="font-medium text-sm items">
            <li>
                <Link
                    :href="route('workspace.view.maindashboard', workspace.slug || workspace.id)"
                    class="flex items-center px-3 py-2 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group"
                    :class="{ active: isDashboardActive() }"
                >
                    <icon class="w-4 h-4" name="dashboard" />
                    <span class="ml-3">{{ $t('Dashboard') }}</span>
                </Link>
            </li>

            <li v-if="workspace.member?.role === 'admin'">
                <Link
                    :href="route('workspace.view.board', workspace.slug || workspace.id)"
                    class="flex items-center px-3 py-2 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group"
                    :class="{ active: isWorkspaceTasksActive() }"
                >
                    <icon class="w-4 h-4" name="table" />
                    <span class="flex-1 ml-3">
                        {{ $t('Workspace Tasks') }}
                    </span>
                    <span
                        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mr-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold"
                    >
                        {{ my_tasks_count }}
                    </span>
                </Link>
            </li>

            <li>
                <Link
                    :href="route('workspace.view.my-tasks.board', workspace.slug || workspace.id)"
                    class="flex items-center px-3 py-2 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group"
                    :class="{ active: isMyTasksActive() }"
                >
                    <icon class="w-4 h-4" name="list" />
                    <span class="flex-1 ml-3">
                        {{ $t('My Tasks') }}
                    </span>
                    <span
                        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mr-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold"
                    >
                        {{ assigned_tasks_count }}
                    </span>
                </Link>
            </li>

            <li>
                <Link
                    :href="route('workspace.view.documents', workspace.slug || workspace.id)"
                    class="flex items-center px-3 py-2 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group"
                    :class="{ active: isDocumentsActive() }"
                >
                    <icon class="w-4 h-4" name="book" />
                    <span class="flex-1 ml-3">
                        {{ $t('All Documents') }}
                    </span>
                </Link>
            </li>

            <!-- System-wide audit trail. Super Admin only; the route enforces the
                 same rule server-side (EnsureSuperAdmin). -->
            <li v-if="isSuperAdmin">
                <Link
                    :href="route('audit.log')"
                    class="flex items-center px-3 py-2 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group"
                    :class="{ active: isAuditLogActive() }"
                >
                    <icon class="w-4 h-4" name="security" />
                    <span class="flex-1 ml-3">
                        {{ $t('Audit Log') }}
                    </span>
                </Link>
            </li>

            <li class="relative" v-if="workspace.member?.role === 'admin'">
                <Link
                    class="flex items-center px-3 p-2 group workspace_members"
                    :href="route('workspace.members', workspace.id)"
                    :class="{ active: checkActiveClass('component', 'Workspaces_Members') }"
                >
                    <icon class="w-4 h-4" name="user" />
                    <span class="flex-1 ml-3 whitespace-nowrap">{{ $t('Team Members') }}</span>
                    <button
                        v-if="workspace.member?.role === 'admin'"
                        @click="toggleInviteMember($event)"
                        class="flex w-5 h-5 rounded justify-center items-center add__plus"
                        :aria-label="$t('Invite Members')"
                    >
                        <icon class="w-4 h-4" name="plus" />
                    </button>
                </Link>
            </li>
        </ul>
        <div
            class="flex cursor-pointer select-none text-[13px] text items-center justify-start gap-3 mt-4 font-bold px-2 pt-2 border-t border-[#ffffff29]"
            @click="hide_starred = !hide_starred"
        >
            <icon v-if="!hide_starred" name="arrow-down" class="w-4 h-4" />
            <icon v-if="hide_starred" name="arrow-right" class="w-4 h-4" />
            <div class="flex uppercase font-semibold">{{ $t('Favorites') }}</div>
        </div>

        <ul
            class="pt-1 text-sm side_p_list font-medium border-gray-200 dark:border-gray-700 max-h-[calc(100%-350px)] overflow-y-auto"
            v-show="!hide_starred && favorites.length"
        >
            <li v-for="(project, p_index) in favorites" class="flex group">
                <Link
                    :href="route('projects.view.board', project.slug || project.id)"
                    class="p-2 relative block w-full item"
                    :class="{ active: project.id === ($page.props.project ? $page.props.project.id : '') }"
                >
                    <div class="flex h-5 relative">
                        <div
                            v-if="project.background"
                            :style="{ 'background-image': 'url(' + project.background + ')' }"
                            class="flex bg-cover rounded-full w-5 h-5 border"
                        ></div>
                        <div
                            class="flex w-full flex-1 justify-center flex-col pl-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                            <div class="font-medium text-[13px] leading-[18px]">
                                {{ project.title }}
                            </div>
                        </div>
                        <button class="flex w-7 items-center justify-center" @click="saveProject($event, project)">
                            <icon
                                v-if="!!project.star"
                                name="star"
                                class="w-4 h-4 fill-yellow-500 text-yellow-500 hover:fill-none hover:scale-125"
                            />
                            <icon
                                v-else
                                name="star"
                                class="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-yellow-500 hover:scale-125"
                            />
                        </button>
                    </div>
                </Link>
            </li>
        </ul>

        <div
            class="flex text-[13px] text items-center justify-between mt-4 font-bold px-2 pt-2 border-t border-[#ffffff29]"
        >
            <div class="flex justify-start select-none gap-3" @click="hide_projects = !hide_projects">
                <icon v-if="!hide_projects" name="arrow-down" class="w-4 h-4" />
                <icon v-if="hide_projects" name="arrow-right" class="w-4 h-4" />
                <div class="flex items-center gap-1.5 cursor-pointer uppercase font-semibold">
                    {{ $t('Projects') }}
                </div>
            </div>
            <div class="flex">
                <Link
                    :href="route('workspace.view', workspace.id)"
                    class="flex w-7 h-7 cursor-pointer rounded justify-center items-center add__plus"
                >
                    <icon class="w-4 h-4" name="project" />
                </Link>
                <div
                    v-if="workspace.member?.role === 'admin'"
                    @click="visible.project_create = true"
                    class="flex w-7 h-7 cursor-pointer rounded justify-center items-center add__plus"
                >
                    <icon class="w-4 h-4" name="plus" />
                </div>
            </div>
        </div>
        <create-project
            v-if="visible.project_create"
            @create-project="visible.project_create = false"
            top="30%"
            left="240px"
        />
        <!-- Opens beside the row rather than under it: the sidebar is a 240px
             scroll box, so a panel laid out inside it would be clipped. -->
        <invite-workspace-member
            :workspace="workspace"
            :anchor="invite_anchor"
            placement="right-start"
            v-if="invite_workspace"
            @invite-member="closeInviteMember()"
        />

        <ul
            class="pt-1 text-sm side_p_list font-medium border-gray-200 dark:border-gray-700 max-h-[calc(100%-350px)] overflow-y-auto"
            v-if="!hide_projects && !loading && projects.length"
        >
            <li v-for="(project, p_index) in projects" class="flex group">
                <Link
                    :href="route('projects.view.board', project.slug || project.id)"
                    class="p-2 relative block w-full item"
                    :class="{ active: project.id === ($page.props.project ? $page.props.project.id : '') }"
                >
                    <div class="flex h-5 relative items-center">
                        <div
                            v-if="project.background"
                            :style="[
                                project.background && project.background.image
                                    ? {
                                          backgroundImage: 'url(' + project.background.image + ')',
                                          backgroundSize: 'cover',
                                      }
                                    : {},
                            ]"
                            class="flex bg-cover rounded-full w-5 h-5 border flex-shrink-0"
                        ></div>
                        <div
                            class="flex w-full flex-1 justify-center flex-col pl-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                            <div class="font-medium text-[13px] leading-[18px]">
                                {{ project.title }}
                            </div>
                        </div>
                        <span
                            class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mr-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex-shrink-0"
                        >
                            {{ project.tasks_count ?? 0 }}
                        </span>
                        <button
                            class="flex w-7 items-center justify-center flex-shrink-0"
                            @click="saveProject($event, project)"
                        >
                            <icon
                                v-if="!!project.star"
                                name="star"
                                class="w-4 h-4 fill-yellow-500 text-yellow-500 hover:fill-none hover:scale-125"
                            />
                            <icon
                                v-else
                                name="star"
                                class="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-yellow-500 hover:scale-125"
                            />
                        </button>
                    </div>
                </Link>
            </li>
        </ul>

        <div class="p-3 font-light text-center text-sm" v-if="!loading && !projects.length">{{ 'No project!' }}</div>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import { Link } from '@inertiajs/vue3';
import CreateProject from '@/Shared/Modals/CreateProject.vue';
import InviteWorkspaceMember from './Modals/InviteWorkspaceMember.vue';
import axios from 'axios';

export default {
    name: 'workspace-menu',
    components: {
        InviteWorkspaceMember,
        Icon,
        Link,
        CreateProject,
    },
    emits: {
        enableSidebar: null,
    },
    data() {
        return {
            projects: [],
            favorites: [],
            workspace: null,
            loading: true,
            hide_projects: false,
            hide_starred: false,
            invite_workspace: false,
            invite_anchor: null,
            loading_items: [1, 2, 3, 4, 5],
            visible: { project_create: false },
            user: null,
            my_tasks_count: 0,
            assigned_tasks_count: 0,
            menu_items: [
                { name: 'Dashboard', route: 'dashboard', url: 'dashboard', icon: 'dashboard' },
                { name: 'Projects', route: 'projects.index', url: 'projects', icon: 'project' },
            ],
            enable_option: {},
        };
    },
    computed: {
        /**
         * Admin and Super Admin share roles.slug 'admin', so the role alone
         * cannot separate them - the server answers it once in
         * HandleInertiaRequests and the menu just reads the answer.
         */
        isSuperAdmin() {
            return this.$page.props.auth?.user?.is_super_admin === true;
        },
    },
    watch: {
        '$page.props.project': {
            handler() {
                if (this.$page.props.project) {
                    if (this.$page.props.project.workspace.id !== this.workspace.id) {
                        this.loading = true;
                        this.workspace = this.$page.props.project.workspace;
                        this.projects = [];
                        this.getProjects();
                        this.getMyTasksCount();
                        this.getProjectTaskCounts();
                        this.getAssignedTasksCount();
                    } else {
                        const projectIndex = this.projects.findIndex((p) => p.id === this.$page.props.project.id);
                        this.projects[projectIndex] = this.$page.props.project;
                    }
                    this.getStarredProjects();
                }
            },
            deep: true,
        },
        '$page.props.workspace.id': {
            handler() {
                if (this.$page.props.workspace) {
                    this.loading = true;
                    this.workspace = this.$page.props.workspace;
                    this.projects = [];
                    this.getProjects();
                    this.getMyTasksCount();
                    this.getProjectTaskCounts();
                    this.getAssignedTasksCount();
                }
            },
            deep: true,
        },
    },
    methods: {
        checkActiveClass(type, name) {
            if (
                type === 'filter' &&
                this.$page.props.filters &&
                parseInt(this.$page.props.filters.user, 10) === this.$page.props.auth.user.id
            ) {
                return 'active';
            } else if (
                type === 'component' &&
                this.$page.component &&
                this.$page.component.replace('/', '_') === name
            ) {
                return 'active';
            }
        },
        isWorkspaceTasksActive() {
            const component = this.$page.component;
            const url = this.$page.url || '';

            if (component === 'Workspaces/MyTasks' || url.includes('/tasks/my-tasks')) {
                return false;
            }

            if (!component) return false;

            const workspaceTaskComponents = [
                'Workspaces/Board',
                'Workspaces/Calendar',
                'Workspaces/Timeline',
                'Workspaces/Table',
            ];

            if (workspaceTaskComponents.some((comp) => component.includes(comp))) {
                return true;
            }

            if (
                url.includes('/tasks/board') ||
                url.includes('/tasks/calendar') ||
                url.includes('/tasks/timeline') ||
                url.includes('/tasks/table')
            ) {
                return true;
            }

            return false;
        },
        isMyTasksActive() {
            const component = this.$page.component;
            const url = this.$page.url || '';

            return component === 'Workspaces/MyTasks' || url.includes('/tasks/my-tasks');
        },
        isDocumentsActive() {
            return this.$page.component === 'Workspaces/Documents';
        },
        isAuditLogActive() {
            return this.$page.component === 'AuditLog/Index';
        },
        isDashboardActive() {
            const component = this.$page.component;
            const url = this.$page.url || '';

            return component === 'Workspaces/MainDashboard' || url.includes('/main-dashboard');
        },
        toggleInviteMember(event) {
            // The button sits inside the Team Members link.
            event.preventDefault();
            this.invite_anchor = event.currentTarget;
            this.invite_workspace = !this.invite_workspace;
        },
        closeInviteMember() {
            this.invite_workspace = false;
        },
        saveProject(e, project) {
            e.preventDefault();
            axios.post(this.route('json.p.starred.save', project.id)).then((resp) => {
                this.getProjects();
                this.getStarredProjects();
            });
        },
        getProjects() {
            axios.get(this.route('json.projects.all', this.workspace.id)).then((response) => {
                if (response.data) {
                    this.projects = response.data;
                }
                this.loading = false;
            });
        },
        getStarredProjects() {
            axios.get(this.route('json.projects.star', this.workspace.id)).then((response) => {
                if (response.data) {
                    this.favorites = response.data.data;
                }
                this.loading = false;
            });
        },
        getMyTasksCount() {
            axios.get(this.route('json.workspace.my-tasks.count', this.workspace.id)).then((response) => {
                if (response.data) {
                    this.my_tasks_count = response.data.count;
                }
            });
        },

        getAssignedTasksCount() {
            axios.get(this.route('json.workspace.assigned-count', this.workspace.id)).then((response) => {
                if (response.data) {
                    this.assigned_tasks_count = response.data.count;
                }
            });
        },

        getProjectTaskCounts() {
            axios.get(this.route('json.workspace.projects.count', this.workspace.id)).then((response) => {
                if (response.data) {
                    response.data.forEach((item) => {
                        const project = this.projects.find((p) => Number(p.id) === Number(item.id));
                        if (project) {
                            project.tasks_count = item.tasks_count;
                        }
                    });
                }
            });
        },
    },
    created() {
        this.workspace = this.$page.props.project ? this.$page.props.project.workspace : this.$page.props.workspace;
        this.getProjects();
        this.getStarredProjects();
        this.getMyTasksCount();
        this.getAssignedTasksCount();
        this.getProjectTaskCounts();
    },
    mounted() {
        window.addEventListener('workspace-task-counts-changed', this.getProjects);
        window.addEventListener('workspace-task-counts-changed', this.getMyTasksCount);
    },
    beforeUnmount() {
        window.removeEventListener('workspace-task-counts-changed', this.getProjects);
        window.removeEventListener('workspace-task-counts-changed', this.getMyTasksCount);
    },
};
</script>
