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
                                    <!-- Phones and small tablets have no room for a
                                         permanent sidebar, so it becomes a drawer this
                                         button pulls open. -->
                                    <button
                                        v-if="hasSidebar"
                                        type="button"
                                        class="app-nav-toggle md:hidden"
                                        @click="toggleDrawer()"
                                        :aria-expanded="mobile_nav ? 'true' : 'false'"
                                        :aria-label="$t('Menu')"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" aria-hidden="true">
                                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                    <Link class="mr-2" href="/">
                                        <logo class="site-logo white" name="white" />
                                        <logo class="site-logo color" />
                                    </Link>
                                    <div class="t__l__wrapper" v-click-outside="closeTopMenus">
                                        <div class="mobile__menu__top bg-[#a6c5e229]" @click="togglePanel('more')">
                                            <span class="text-white">More</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                        </div>
                                        <div class="tl_menu_list hidden" :class="{'mobile': show__menu__list}">
                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_recent = false}" @click="toggleSubMenu('menu_recent')">
                                                <span class="text-white">{{ $t('Recently Viewed') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                                <top-project-menu v-if="visible.menu_recent" filter="recent" tabindex="-1" />
                                            </div>
                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_workspace = false}" @click="toggleSubMenu('menu_workspace')">
                                                <span class="text-white">{{ $t('My Workspaces') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />
                                                <top-workspace-menu v-if="visible.menu_workspace" tabindex="-1" />
                                            </div>
<!--                                            <div class="flex t__menu relative items-center cursor-pointer rounded py-1 px-3 hover:bg-[#a6c5e229]" v-click-outside="()=>{visible.menu_star = false}" @click="visible['menu_star'] = !visible['menu_star']">-->
<!--                                                <span class="text-white">{{ $t('Starred') }}</span> <icon class="ml-2 w-4 h-4 text-white" name="arrow-down" />-->
<!--                                                <top-project-menu v-if="visible.menu_star" filter="star" tabindex="-1" />-->
<!--                                            </div>-->
                                        </div>
                                        <div v-if="this.$page.props.auth.user.role.create_project || this.$page.props.auth.user.role.create_workspace" class="__creation" v-click-outside="()=>{visible.menu_create = false}" @click="togglePanel('create')">
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

                        <!-- Global search. A child of the bar in its own right, not
                             part of the icon cluster: on a phone that lets it drop to
                             a full-width line of its own instead of fighting the bell
                             and the avatar for room. The wrapper is positioned so the
                             results panel lines up under the field. -->
                        <div class="top-search relative" v-click-outside="clearSearch">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-400 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input
                                ref="globalSearch"
                                v-model="search_query"
                                @input="doSearch($event)"
                                @keydown.esc="clearSearch"
                                type="search"
                                id="default-search"
                                autocomplete="off"
                                class="top-search__input block w-full h-10 ps-9 pe-14 text-sm rounded-xl border border-transparent bg-white/95 text-gray-900 placeholder-gray-400 shadow-sm transition focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                                :placeholder="$t('Find tasks or projects')"
                            />
                            <kbd class="hidden lg:block absolute end-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-[10px] font-sans font-semibold text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {{ searchShortcutLabel }}
                            </kbd>

                            <div v-if="search_loading || hasSearchResults || noSearchResults" class="search_result absolute left-0 right-0 top-full mt-2 z-30">
                                <div v-if="search_loading" class="flex justify-center items-center p-3 rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-700 dark:ring-white/10">
                                    <svg aria-hidden="true" class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                </div>

                                <div v-else-if="hasSearchResults" class="search__result overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 divide-y divide-gray-100 dark:bg-gray-700 dark:ring-white/10 dark:divide-gray-600">
                                    <div class="sr__projects" v-if="search_result.projects.length">
                                        <h4 class="sr__title px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-400">{{ $t('Projects') }}</h4>
                                        <ul class="pb-2 text-sm text-gray-700 dark:text-gray-200 max-h-56 overflow-y-auto">
                                            <li v-for="s_i in search_result.projects" :key="'p_' + s_i.id">
                                                <Link class="block px-3 py-2 truncate hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" :href="this.route('projects.view.board', s_i.id)" @click="clearSearch">{{ s_i.title }}</Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="sr__tasks" v-if="search_result.tasks.length">
                                        <h4 class="sr__title px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-400">{{ $t('Tasks') }}</h4>
                                        <ul class="pb-2 text-sm text-gray-700 dark:text-gray-200 max-h-56 overflow-y-auto">
                                            <li v-for="s_i in search_result.tasks" :key="'t_' + s_i.id">
                                                <Link class="block px-3 py-2 truncate hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" :href="this.route('projects.board.with.task', {projectUid: s_i.project_id, taskUid: s_i.id})" @click="clearSearch">{{ s_i.title }}</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div v-else class="px-3 py-4 text-center text-sm rounded-xl bg-white text-gray-500 shadow-lg ring-1 ring-black/5 dark:bg-gray-700 dark:text-gray-300 dark:ring-white/10">
                                    {{ $t('No results found.') }}
                                </div>
                            </div>
                        </div>
                        <div class="placement-top-right gap-3">
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
                            <!-- Language switcher -->
                            <dropdown v-if="availableLanguages.length > 1" class="select_language" class-name="lang-dropdown" placement="bottom-end" :dim="false" :offset="8">
                                <template #default>
                                    <div class="flex items-center cursor-pointer group" :title="$t('Language')">
                                        <icon :name="activeLanguage.code" class="lang-flag lang-flag--lg" />
                                        <icon class="w-5 h-5 drop-down-caret-icon fill-white" name="cheveron-down" />
                                    </div>
                                </template>
                                <template #dropdown>
                                    <div class="lang-menu">
                                        <Link
                                            v-for="language in availableLanguages"
                                            :key="language.code"
                                            class="lang-menu__item"
                                            :class="{ 'is-active': language.code === locale }"
                                            :href="route('language', language.code)"
                                        >
                                            <icon :name="language.code" class="lang-flag" />
                                            <span class="lang-menu__name">{{ $t(language.name) }}</span>
                                            <icon v-if="language.code === locale" name="check" class="lang-menu__check" />
                                        </Link>
                                    </div>
                                </template>
                            </dropdown>
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
                    <!-- Drawer scrim. Tapping it puts the menu away again. -->
                    <div v-if="mobile_nav" class="app-drawer-backdrop md:hidden" @click="mobile_nav = false"></div>
                    <!-- The menus are shared with the desktop layout and carry no
                         close control of their own, so the drawer brings one. -->
                    <button
                        v-if="mobile_nav"
                        type="button"
                        class="app-drawer-close md:hidden"
                        @click="mobile_nav = false"
                        :aria-label="$t('Close')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div v-if="!enable_sidebar" class="top-0 left-0 w-4 h-full left__bar hidden md:block" @click="enable_sidebar = true">
                        <div class="w-4 h-4 arr"><icon class="w-4 h-4" name="arrow-right" /></div>
                    </div>
                    <workspace-menu v-if="$page.props.project || $page.props.workspace" class="sidebar app-sidebar shrink-0 md:w-60 overflow-y-auto" @enableSidebar="enable_sidebar = false" :class="{'__hide':!enable_sidebar, 'is-open': mobile_nav}" :style="[$page.props.project && $page.props.project.background?{backgroundColor: $page.props.project.background.side}:{}]" />
                    <!-- Was hidden outright below md, which left an admin on a phone
                         with no navigation at all; it rides in the drawer now. -->
                    <main-menu v-else-if="$page.props.auth.user.role.slug === 'admin'" class="sidebar app-sidebar shrink-0 md:w-60 overflow-y-auto" :class="{'is-open': mobile_nav}" />

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
            search_query: '',
            enable_sidebar: true,
            mobile_nav: false,
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
        /** Is there anything for the drawer button to open on this page? */
        hasSidebar(){
            return !!(this.$page.props.project || this.$page.props.workspace)
                || this.$page.props.auth?.user?.role?.slug === 'admin';
        },
        hasSearchResults(){
            return !!(this.search_result.projects.length || this.search_result.tasks.length);
        },
        /** Searched, waited, found nothing - say so instead of showing nothing. */
        noSearchResults(){
            return !this.search_loading && !this.hasSearchResults && (this.search_query || '').length > 2;
        },
        searchShortcutLabel(){
            if (typeof navigator === 'undefined') return 'Ctrl K';
            const mac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');
            return mac ? '⌘K' : 'Ctrl K';
        },
        /** Languages offered by the switcher, shared from the backend. */
        availableLanguages() {
            return this.$page.props.languages || []
        },
        activeLanguage() {
            return this.availableLanguages.find(l => l.code === this.locale)
                || { code: 'en', name: 'English' }
        },
    },
    // $page.props.counter
    watch: {
        // Following a link should leave the drawer and the bar's menus behind.
        '$page.component'() {
            this.mobile_nav = false;
            this.closeTopMenus();
        },
        mobile_nav(open) {
            if (typeof document === 'undefined') return;
            document.body.classList.toggle('has-drawer-open', !!open);
        },
        '$page.props.auth.user.locale': {
            handler(locale) {
                if (!locale || locale === this.locale) return
                this.locale = locale
                this.dir = ['sa', 'he', 'ur'].includes(locale) ? 'rtl' : 'ltr'
                if (getActiveLanguage() !== locale) {
                    loadLanguageAsync(locale)
                }
            },
        },
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
            vm.search_query = search
            if(search.length > 2){
                vm.search_loading = true;
                clearTimeout(vm.search_timer);
                // A second and a half felt like the search had not heard you.
                vm.search_timer = setTimeout(function() {
                    axios.post(vm.route('json.task.search', { q:search })).then((response)=>{
                        vm.search_result = response.data;
                        vm.search_loading = false;
                    }).catch(()=>{
                        vm.search_loading = false;
                    })
                }, 300);
            }else{
                vm.clearSearch(false)
            }
        },
        /** Empty the panel. Pass false to leave what was typed in the field. */
        clearSearch(resetQuery = true){
            const vm = this;
            vm.search_result.projects = [];
            vm.search_result.tasks = [];
            vm.search_loading = false;
            if (resetQuery === true) vm.search_query = '';
            clearTimeout(vm.search_timer);
        },
        /**
         * Only one thing is open at a time. Opening More puts Create away, the
         * drawer puts both away, and a click anywhere else closes the lot -
         * they overlap each other on a narrow bar, so two at once is a mess.
         */
        togglePanel(name) {
            const opening = name === 'more' ? !this.show__menu__list : !this.visible.menu_create;

            this.show__menu__list = name === 'more' ? opening : false;
            this.visible.menu_create = name === 'create' ? opening : false;

            if (opening) this.mobile_nav = false;
            // Closing More collapses the lists inside it, so it does not reopen
            // with a workspace list already hanging off it.
            if (name !== 'more' || !opening) this.closeTopSubMenus();
        },

        toggleDrawer() {
            this.mobile_nav = !this.mobile_nav;
            if (this.mobile_nav) this.closeTopMenus();
        },

        toggleSubMenu(name) {
            const opening = !this.visible[name];
            this.closeTopSubMenus();
            this.visible[name] = opening;
            this.visible.menu_create = false;
        },

        closeTopSubMenus() {
            this.visible.menu_recent = false;
            this.visible.menu_workspace = false;
            this.visible.menu_star = false;
        },

        closeTopMenus() {
            this.show__menu__list = false;
            this.visible.menu_create = false;
            this.closeTopSubMenus();
        },

        /** ⌘K / Ctrl+K puts the cursor in the search box, as everywhere else. */
        focusSearchShortcut(e){
            if (e.key === 'Escape') {
                if (this.mobile_nav) this.mobile_nav = false;
                this.closeTopMenus();
                return;
            }
            if (e.key !== 'k' && e.key !== 'K') return;
            if (!(e.metaKey || e.ctrlKey)) return;
            e.preventDefault();
            const input = this.$refs.globalSearch;
            if (input) { input.focus(); input.select(); }
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

    },
    mounted() {
        window.addEventListener('keydown', this.focusSearchShortcut);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.focusSearchShortcut);
        clearTimeout(this.search_timer);
        if (typeof document !== 'undefined') document.body.classList.remove('has-drawer-open');
    }
}
</script>
