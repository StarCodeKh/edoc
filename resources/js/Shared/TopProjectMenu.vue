<template>
    <section class="top_project_menu">
        <div tabindex="-1" class="menu__wrapper">
            <ul role="menu" class="list">
                <li v-for="(project, p_index) in projects" class="item group" :key="project.id">
                    <div class="content">
                        <Link class="flex px-1 py-2" :href="route('projects.view.board', project.slug || project.id)">
                            <div v-if="project.background" :style="{ 'background-image' : 'url('+ project.background +')' }" class="flex bg-cover rounded-full w-6 h-6"></div>
                            <div class="flex w-full flex-1 justify-center flex-col pl-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <div class="font-medium text-sm leading-[18px]">{{ project.title }}</div>
                                <div class="font-normal text-xs">{{ project.workspace }}</div>
                            </div>
                            <button class="flex w-7 items-center justify-center" @click="saveProject($event, project)">
                                <icon v-if="!!project.star" name="star" class="w-4 h-4 fill-yellow-500 text-yellow-500 hover:fill-none hover:scale-125" />
                                <icon v-else name="star" class="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-yellow-500 hover:scale-125" />
                            </button>
                        </Link>
                    </div>
                </li>
                <li v-if="!projects.length" class="flex"><div class="flex px-2 py-2">{{ $t('No item found!') }}</div></li>
            </ul>
        </div>
    </section>
</template>

<script>
import { Link } from '@inertiajs/vue3'
import Icon from '@/Shared/Icon.vue'
import axios from 'axios'

export default {
    name: "top-project-menu",
    props: {
        filter: {
            required: false
        }
    },
    components: { Link, Icon },
    data() {
        return {
            projects: [],
            loading: true,
        }
    },
    methods: {
        saveProject(e, project){
            e.preventDefault();
            axios.post(this.route('json.p.starred.save', project.id)).then((resp) => {
                window.location.reload();
            });
        },
        getProjects(){
            const workspace_id = this.$page.props.project?this.$page.props.project.workspace_id:this.$page.props.workspace?this.$page.props.workspace.id:null;
            const routString = this.filter?'json.projects.'+this.filter : 'json.projects.all';
            axios.get(this.route(routString, workspace_id)).then((response) => {
                if(Object.keys(response.data).length){
                    this.projects = response.data.data
                    this.loading = false;
                }
            });
        },
    },
    created() {
        this.getProjects()
    },
}
</script>
