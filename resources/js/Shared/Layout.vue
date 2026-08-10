<template>
    <div class="layout-app" :class="[current_mode, $page.props.project?'project':'main', $page.component.replace('/', '_')]" :dir="dir" :style="[$page.props.project && $page.props.project.background?{backgroundColor: $page.props.project.background.bg, backgroundImage: 'url('+$page.props.project.background.image+')', backgroundSize: 'cover'}:{}]">
        <div id="dropdown" />
        <div class="md:flex md:flex-col">
            <div class="md:h-screen md:flex md:flex-col">
                <div class="md:flex md:shrink-0 ">
                    <div class="bg-white w-full p-4 md:py-2 md:pr-12 md:pl-8 text-sm flex justify-first items-center top_bar" :style="[$page.props.project && $page.props.project.background?{backgroundColor: $page.props.project.background.top}:getDefaultTopBarStyle()]">
                        <div class="placement-top-left w-full">
                            <div class="flex w-full lg:flex-row flex-col">
                                <div class="flex gap-3 select-none top_bar__menu">
                                    <Link class="mr-2" href="/">
                                        <logo class="site-logo white" name="white" />
                                        <logo class="site-logo color" />
                                    </Link>
                                    <div class="t__l__wrapper">
                                        <div class="mobile__menu__top bg-[#a6c5e229]" @click="show__menu__list = !show__menu__list">
                                            <span class="text-white">More</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                        </div>
                                        <div class="tl_menu_list hidden" :class="{'mobile': show__menu__list}">
                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_recent = false}" @click="visible['menu_recent'] = !visible['menu_recent']">
                                                <span class="text-white">{{ $t('Recently Viewed') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                                <top-project-menu v-if="visible.menu_recent" filter="recent" tabindex="-1" />
                                            </div>
                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_workspace = false}" @click="visible['menu_workspace'] = !visible['menu_workspace']">
                                                <span class="text-white">{{ $t('My Workspaces') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                                <top-workspace-menu v-if="visible.menu_workspace" tabindex="-1" />
                                            </div>
<!--                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_star = false}" @click="visible['menu_star'] = !visible['menu_star']">-->
<!--                                                <span class="text-white">{{ $t('Starred') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />-->
<!--                                                <top-project-menu v-if="visible.menu_star" filter="star" tabindex="-1" />-->
<!--                                            </div>-->
                                        </div>
                                        <div v-if="this.$page.props.auth.user.role.create_project || this.$page.props.auth.user.role.create_workspace" class="__creation" v-click-outside="()=>{visible.menu_create = false}" @click="visible['menu_create'] = !visible['menu_create']">
                                            {{ $t('Create') }}
                                            <section v-if="visible.menu_create" class="m__create">
                                                <div tabindex="-1" class="m__area">
                                                    <ul role="menu" class="">
                                                        <li v-for="create in creations" class="group">
                                                            <div v-if="create.condition" class="c__1" @click="visible[create.visible] = true">
                                                                <div class="c__2">
                                                                    <div class="c__3">
                                                                        <icon :name="create.icon" class="w-4 h-4" />
                                                                        <div>{{ create.name }}</div>
                                                                    </div>
                                                                    <div class="font-normal text-xs">{{ create.details }}</div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="placement-top-right gap-3">
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                    </svg>
                                </div>
                                <input @input="doSearch($event)" @keydown.esc="clearSearch" type="search" id="default-search" class="block w-auto p-2 ps-7 text-sm text-gray-900 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :placeholder="$t('Find tasks or projects')" required />
                            </div>
                            <div class="search_result w-48 absolute top-9 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                <div v-if="search_loading" class="bg-white flex justify-center items-center p-2 border border-gray-100 w-full mt-2">
                                    <svg aria-hidden="true" class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                </div>
                                <div class="search__result z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" v-if="!search_loading && (search_result.projects.length || search_result.tasks.length)">
                                    <div class="sr__projects" v-if="search_result.projects.length">
                                        <h4 class="sr__title px-3 py-2 font-bold border-b">Projects</h4>
                                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200 max-h-48 overflow-y-auto">
                                            <li v-for="(s_i, i) in search_result.projects" class="">
                                                <Link class="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" :href="this.route('projects.view.board', s_i.id)">{{ s_i.title.length < 20 ? s_i.title : s_i.title.substring(0,20) + "..." }}</Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="sr__tasks" v-if="search_result.tasks.length">
                                        <h4 class="sr__title px-3 py-2 font-bold border-b">Tasks</h4>
                                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200 max-h-48 overflow-y-auto">
                                            <li v-for="(s_i, i) in search_result.tasks" class="">
                                                <Link class="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" :href="this.route('projects.board.with.task', {projectUid: s_i.project_id, taskUid: s_i.id})">{{ s_i.title.length < 20 ? s_i.title : s_i.title.substring(0,20) + "..." }}</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="tracker" v-if="this.counter.timer && this.activeTimerString">
                                <p class="show">
                                    {{ activeTimerString }}
                                </p>
                                <button v-if="!!this.activeTimerString" @click="stopTracker()">STOP</button>
                                <Link :href="this.route('projects.view.board',{uid: this.counter.timer.task.project_id, task: this.counter.timer.task.slug || this.counter.timer.task.id})" aria-label="Task details"><icon class="" name="info" /></Link>
                            </div>
                            <notification-bell class="flex items-center" />
                            <button class="theme-toggle" id="theme-toggle" title="Toggles light & dark" :aria-label="current_mode" aria-live="polite" @click="switchMode">
                                <svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                                    <mask class="moon" id="moon-mask">
                                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                        <circle cx="24" cy="10" r="6" fill="black" />
                                    </mask>
                                    <circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
                                    <g class="sun-beams" stroke="currentColor">
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </g>
                                </svg>
                            </button>
                            <dropdown class="select_user" placement="bottom-end">
                                <template #default>
                                    <div class="flex items-center cursor-pointer group">
                                        <div class="mr-1 whitespace-nowrap">
                                            <img v-if="$page.props.auth.user.photo" class="user_photo" :alt="$page.props.auth.user.first_name" :src="$page.props.auth.user.photo" />
                                            <img v-else src="/images/svg/profile.svg" class="w-5 h-5" alt="user profile" />
                                        </div>
                                        <icon class="w-5 h-5 drop-down-caret-icon fill-white" name="cheveron-down" />
                                    </div>
                                </template>
                                <template #dropdown>
                                    <div class="shadow-xl bg-white rounded text-sm ">
                                        <div class="flex px-4 flex-col py-3">
                                            <div class="uppercase mb-2 font-bold">Account</div>
                                            <div class="flex gap-1 items-center">
                                                <div class="flex">
                                                    <img v-if="$page.props.auth.user.photo" class="user_photo w-10 h-10" :alt="$page.props.auth.user.first_name" :src="$page.props.auth.user.photo" />
                                                    <img v-else src="/images/svg/profile.svg" class="w-10 h-10" alt="user profile" />
                                                </div>
                                                <div class="flex flex-col gap-[1px]">
                                                    <span>{{ $page.props.auth.user.first_name +' ' + $page.props.auth.user.last_name}}</span>
                                                    <small>{{ $page.props.auth.user.email }}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <Link class="flex px-6 py-2 items-center hover:bg-indigo-500 hover:text-white hover:fill-white" :href="route('users.edit.profile')"><icon class="w-4 h-4 mr-2" name="user_edit" /> {{ $t('Edit Profile') }}</Link>
                                        <Link v-if="$page.props.auth.user.role.slug === 'admin'" class="flex px-6 py-2 items-center hover:bg-indigo-500 hover:text-white hover:fill-white" :href="route('global')"><icon class="w-4 h-4 mr-2" name="settings" /> {{ $t('Global Settings') }}</Link>
                                        <Link class="flex items-center px-6 py-2 hover:bg-indigo-500 hover:text-white hover:fill-white w-full" :href="route('logout')" method="delete" as="button"><icon class="w-4 h-4 mr-2" name="logout" />{{ $t('Logout') }}</Link>
                                    </div>
                                </template>
                            </dropdown>
                        </div>
                    </div>
                </div>
                <div class="md:flex md:flex-grow md:overflow-hidden">
                    <div v-if="!enable_sidebar" class="top-0 left-0 w-4 h-full left__bar" @click="enable_sidebar = true">
                        <div class="w-4 h-4 arr"><icon class="w-4 h-4" name="arrow-right" /></div>
                    </div>
                    <workspace-menu v-if="$page.props.project || $page.props.workspace" class="sidebar shrink-0 md:w-60 overflow-y-auto" @enableSidebar="enable_sidebar = false" :class="{'__hide':!enable_sidebar}" :style="[$page.props.project && $page.props.project.background?{backgroundColor: $page.props.project.background.side}:{}]" />
                    <main-menu v-else-if="$page.props.auth.user.role.slug === 'admin'" class="hidden md:block sidebar shrink-0 md:w-60 overflow-y-auto" />

                    <div class="md:flex-1 md:overflow-y-auto" scroll-region>
                        <flash-messages />
                        <slot />
                    </div>
                </div>
                <create-project v-if="visible.project_create" @create-project="visible.project_create = false" />
                <create-workspace v-if="visible.create_workspace" @create-workspace="visible.create_workspace = false" />
            </div>
        </div>
    </div>
</template>

<script>
import Icon from '../Shared/Icon.vue'
import Logo from '../Shared/Logo.vue'
import Dropdown from '../Shared/Dropdown.vue'
import MainMenu from './MainMenu.vue'
import FlashMessages from './FlashMessages.vue'
import TopProjectMenu from './TopProjectMenu.vue'
import CreateProject from './Modals/CreateProject.vue'
import { Link } from '@inertiajs/vue3'
import moment from 'moment'
import 'moment-duration-format';
import CreateWorkspace from "./Modals/CreateWorkspace.vue";
import TopWorkspaceMenu from "./TopWorkspaceMenu.vue";
import WorkspaceMenu from "./WorkspaceMenu.vue";
import NotificationBell from '../Shared/NotificationBell.vue';
import axios from 'axios'
import { loadLanguageAsync, getActiveLanguage } from 'laravel-vue-i18n';

export default {
    components: {
        WorkspaceMenu,
        TopWorkspaceMenu,
        CreateWorkspace,
        Dropdown,
        FlashMessages,
        Icon,
        Logo,
        Link,
        MainMenu,
        TopProjectMenu,
        CreateProject,
        NotificationBell,
    },
    props: {
        title: String,
        auth: Object,
    },
    data() {
        return{
            creations: [
                {name: 'Project', visible: 'project_create', icon: 'project',  condition: !!this.$page.props.auth.user.role.create_project, details: 'After creating project, you will be able to manage your tasks on board.'},
                {name: 'Workspace', visible: 'create_workspace', condition: !!this.$page.props.auth.user.role.create_workspace, icon: 'workspace', details: 'After creating project, you will be able to manage your tasks on board.'},
            ],
            time: '',
            search_timer: null,
            search_loading: false,
            search_result: { tasks:[], projects: [] },
            enable_sidebar: true,
            show__menu__list: false,
            current_mode: 'light',
            modes: ['dark', 'light'],
            visible: {project_create: false, create_workspace: false, menu_workspace: false, menu_recent: false, menu_star: false, menu_create: false},
            edit_route: '',
            current_page: 'dashboard',
            activeTimerString: '',
            counter: { seconds: 0, timer: this.auth?.timer || 0, duration: 0 },
            locale: this.$page.props.auth.user.locale,
            dir: ['sa','he','ur'].includes(this.$page.props.auth.user.locale)?'rtl':'ltr',
        }
    },
    computed: {

    },
    // $page.props.counter
    watch: {
        '$page.props.tracker': {
            handler() {
                if(this.$page.props.tracker){
                    if(!!this.$page.props.tracker.started && this.$page.props.counter){
                        this.startExistingTimer(this.$page.props.counter);
                    }else if(!this.$page.props.tracker.started && this.$page.props.counter){
                        this.stopTracker()
                    }
                }
            },
            deep: true,
        },
    },
    methods:{
        getDefaultTopBarStyle(){
            // Matching top bar with slight transparency and blur
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            };
        },
        startExistingTimer(counter){
            Object.assign(this.counter, counter)
            let seconds = this.counter.timer.duration;
            this.counter.ticker = setInterval(() => {
                this.counter.seconds = ++seconds;
                // this.activeTimerString = this.moment.duration(this.counter.seconds + parseInt(this.counter.duration), 'seconds').format()
                this.activeTimerString = this.moment.utc(moment.duration(this.counter.seconds + parseInt(this.counter.duration),'seconds').as('milliseconds')).format('H:mm:ss')

            }, 1000)
        },
        goToLink(link){ window.location.href = link;},
        startTimer(){
            let started = this.counter.timer.started_at ? this.moment.utc(this.counter.timer.started_at) : this.moment();
            let seconds = parseInt(this.moment.duration(this.moment().diff(started)).asSeconds())
            seconds = this.counter.timer.duration + seconds;
            this.counter.ticker = setInterval(() => {
                this.counter.seconds = ++seconds;
                // this.activeTimerString = this.moment.duration(this.counter.seconds + parseInt(this.counter.duration), 'seconds').format()
                this.activeTimerString = this.moment.utc(moment.duration(this.counter.seconds + parseInt(this.counter.duration),'seconds').as('milliseconds')).format('H:mm:ss')
            }, 1000)
        },
        stopTracker(){
            axios.post(this.route('task.timer.stop'), { duration: this.counter.seconds, id: this.counter.timer.id }).then((response) => {
                this.counter.duration = response.data;
                this.stopTimer();
            })
        },
        stopTimer(){
            clearInterval(this.counter.ticker)
            this.activeTimerString = ''
            if(this.$page.props.lists){
                const task = this.counter.timer.task;
                const listIndex = this.$page.props.lists.findIndex(l=>l.id === task.list_id);
                if(listIndex > -1){
                    const taskIndex = this.$page.props.lists[listIndex].tasks.findIndex(t=>t.id === task.id)
                    if(taskIndex > -1) this.$page.props.lists[listIndex].tasks[taskIndex].timer = null;
                }
            }
        },
        doSearch(e){
            const search = e.target.value
            const vm = this
            if(search.length > 2){
                vm.search_loading = true;
                clearTimeout(vm.search_timer);
                vm.search_timer = setTimeout(function() {
                    axios.post(this.route('json.task.search', { q:search })).then((response)=>{
                        vm.search_result = response.data;
                        vm.search_loading = false;
                    })
                }, 1500);
            }else{
                vm.clearSearch()
            }
        },
        clearSearch(){
            const vm = this;
            vm.search_result.projects = [];
            vm.search_result.tasks = [];
            vm.search_loading = false;
            clearTimeout(vm.search_timer);
        },
        switchMode(){
            this.current_mode = this.current_mode === 'light' ? 'dark' : 'light'
            localStorage.setItem('current_mode', this.current_mode)
        },
        async getDuration(task_id){
            const response = await axios.get(this.route('task.timer.duration', task_id));
            this.counter.duration = response.data;
            this.startTimer(this.counter.timer.started_at)
        },
    },
    created() {
        this.moment = moment;
        if(localStorage.getItem('current_mode')){
            this.current_mode = localStorage.getItem('current_mode')
        }

        if (this.counter.timer && this.counter.timer.started_at && !this.counter.timer.stopped_at){
            this.getDuration(this.counter.timer.task_id)
        }


        if(getActiveLanguage() !== this.locale){
            loadLanguageAsync(this.locale)
        }

    }
}
</script>
