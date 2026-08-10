<template>
    <section class="top_project_menu">
        <div tabindex="-1" class="menu__wrapper">
            <ul role="menu" class="list">
                <li v-for="(workspace, p_index) in workspaces" class="item group" :key="workspace.id">
                    <div class="content">
                        <Link class="flex" :href="route('workspace.view', workspace.slug || workspace.id)">
                            <div class="p-2 flex gap-2 items-center">
                                <div v-if="workspace.logo" class="logo has_bg flex justify-center items-center w-9 h-9 rounded-full text-white text-lg" :style="{ 'background-image' : 'url('+ workspace.logo +')' }">
                                </div>
                                <div v-else class="logo flex justify-center items-center w-9 h-9 rounded-full bg-indigo-600 text-white text-lg">
                                    {{ workspace.name.charAt(0) }}
                                </div>
                                <div class="name">
                                    {{ workspace.name }}
                                </div>
                            </div>
                        </Link>
                    </div>
                </li>
                <li v-if="!workspaces.length" class="flex"><div class="flex px-2 py-2">{{ $t('No item found!') }}</div></li>
            </ul>
        </div>
    </section>
</template>

<script>
import { Link } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import axios from 'axios'

export default {
    name: "top-workspace-menu",
    components: { Link, Icon },
    data() {
        return {
            loading: true,
            your_workspaces: [],
            guest_workspaces: [],
            workspaces: [],
        }
    },
    methods: {
        getWorkspaces(){
            axios.get(this.route('json.workspaces.all')).then((response) => {
                if(response.data){
                    this.workspaces = response.data
                    this.loading = false;
                }
            });
        },
    },
    created() {
        this.getWorkspaces()
    },
}
</script>
