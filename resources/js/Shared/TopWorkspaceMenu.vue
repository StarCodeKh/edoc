<template>
    <section class="top_project_menu">
        <div tabindex="-1" class="menu__wrapper">
            <ul role="menu" class="list">
                <li v-for="(workspace, p_index) in workspaces" class="item group" :key="workspace.id">
                    <div class="content">
                        <Link
                            class="flex w-full min-w-0"
                            :href="route('workspace.view', workspace.slug || workspace.id)"
                        >
                            <div class="p-2 flex gap-2 items-center w-full min-w-0">
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
                                <div class="name flex items-center gap-1.5 min-w-0">
                                    <span class="truncate" :title="workspace.name">{{ workspace.name }}</span>
                                    <span
                                        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold"
                                    >
                                        {{ workspaceTaskCount(workspace) }}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </li>
                <li v-if="!workspaces.length" class="flex">
                    <div class="flex px-2 py-2">{{ $t('No item found!') }}</div>
                </li>
            </ul>
        </div>
    </section>
</template>

<script>
import { Link } from '@inertiajs/vue3';
import Icon from '@/Shared/Icon.vue';
import axios from 'axios';

export default {
    name: 'top-workspace-menu',
    components: { Link, Icon },
    data() {
        return {
            loading: true,
            your_workspaces: [],
            guest_workspaces: [],
            workspaces: [],
        };
    },
    methods: {
        getWorkspaces() {
            axios.get(this.route('json.workspaces.all')).then((response) => {
                if (response.data) {
                    this.workspaces = response.data;
                    this.loading = false;
                }
            });
        },
        workspaceTaskCount(workspace) {
            if (typeof workspace.incomplete_tasks_count === 'number') return workspace.incomplete_tasks_count;
            if (typeof workspace.tasks_count === 'number') return workspace.tasks_count;

            if (Array.isArray(workspace.projects)) {
                let count = 0;
                workspace.projects.forEach((project) => {
                    const lists = project.lists || project.board_lists || [];
                    lists.forEach((list) => {
                        (list.tasks || []).forEach((task) => {
                            if (!task.is_done) count++;
                        });
                    });
                });
                return count;
            }

            return 0;
        },
    },
    created() {
        this.getWorkspaces();
    },
    mounted() {
        window.addEventListener('workspace-task-counts-changed', this.getWorkspaces);
    },
    beforeUnmount() {
        window.removeEventListener('workspace-task-counts-changed', this.getWorkspaces);
    },
};
</script>
