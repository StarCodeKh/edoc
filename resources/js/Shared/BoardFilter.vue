<template>
    <div class="absolute w-[320px] z-[9999] rounded-xl text-sm bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300" :style="{top, left, right}">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Filter Content -->
        <div v-else class="flex flex-col max-h-[80vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <div class="flex items-center gap-2">
                    <icon name="filter" class="w-5 h-5 text-indigo-600" />
                    <h3 class="font-semibold text-gray-900">{{ $t('Filter Tasks') }}</h3>
                    <span v-if="activeFiltersCount > 0" class="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                        {{ activeFiltersCount }}
                    </span>
                </div>
                <button @click="$emit('boardFilter')" class="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" :title="$t('Close')">
                    <icon class="w-5 h-5 text-gray-600" name="close" />
                </button>
            </div>

            <!-- Filter Content - Scrollable -->
            <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                <!-- Members Filter -->
                <div v-if="enable_options.includes('user')" class="filter-section">
                    <div class="flex items-center justify-between mb-2">
                        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <icon name="user" class="w-4 h-4 text-indigo-600" />
                            {{ $t('Members') }}
                        </label>
                        <button v-if="hasActiveUserFilters" @click="clearFilterType('user')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            {{ $t('Clear') }}
                        </button>
                    </div>
                    
                    <!-- Search Users -->
                    <div class="mb-3">
                        <div class="relative">
                            <icon name="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                v-model="user_search" 
                                type="text" 
                                :placeholder="$t('Search members...')"
                                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <ul class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__user__no">
                                <input 
                                    id="filter__user__no" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('user', 'null')" 
                                    @change="doFilter($event.target.checked, 'user', 'null')"
                                >
                                <icon class="w-4 h-4 text-gray-400" name="user" />
                                <span class="text-sm text-gray-700">{{ $t('No members') }}</span>
                            </label>
                        </li>
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__user__me">
                                <input 
                                    id="filter__user__me" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('user', $page.props.auth.user.id)" 
                                    @change="doFilter($event.target.checked, 'user', $page.props.auth.user.id)"
                                >
                                <img 
                                    v-if="$page.props.auth.user.photo" 
                                    class="w-6 h-6 rounded-full border-2 border-indigo-200" 
                                    :alt="$page.props.auth.user.first_name" 
                                    :src="$page.props.auth.user.photo" 
                                />
                                <img 
                                    v-else 
                                    src="/images/user.svg" 
                                    class="w-6 h-6 rounded-full border-2 border-indigo-200" 
                                    alt="user profile" 
                                />
                                <span class="text-sm font-medium text-gray-700">{{ $t('Tasks assigned to me') }}</span>
                            </label>
                        </li>
                        <li v-for="(userObject, user_index) in filteredUsers" :key="user_index">
                            <label :for="'uid_'+user_index" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input 
                                    :id="'uid_'+user_index" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('user', userObject.id)" 
                                    @change="doFilter($event.target.checked, 'user', userObject.id)"
                                >
                                <img 
                                    v-if="userObject.photo_path" 
                                    :aria-label="userObject.name" 
                                    :alt="userObject.name" 
                                    class="w-6 h-6 rounded-full border-2 border-gray-200" 
                                    :src="userObject.photo_path" 
                                />
                                <img 
                                    v-else 
                                    :aria-label="userObject.name" 
                                    :alt="userObject.name" 
                                    class="w-6 h-6 rounded-full border-2 border-gray-200" 
                                    src="/images/user.svg" 
                                />
                                <span class="text-sm text-gray-700">{{ userObject.name }}</span>
                            </label>
                        </li>
                        <li v-if="!filteredUsers || filteredUsers.length === 0" class="text-xs text-gray-500 text-center py-2">
                            {{ $t('No members found') }}
                        </li>
                    </ul>
                </div>

                <!-- Due Date Filter -->
                <div v-if="enable_options.includes('due')" class="filter-section">
                    <div class="flex items-center justify-between mb-2">
                        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <icon name="calendar" class="w-4 h-4 text-indigo-600" />
                            {{ $t('Due Date') }}
                        </label>
                        <button v-if="hasActiveDueFilters" @click="clearFilterType('due')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            {{ $t('Clear') }}
                        </button>
                    </div>
                    <ul class="flex flex-col gap-2">
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__no">
                                <input 
                                    id="filter__due__no" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('due', 'null')" 
                                    @change="doFilter($event.target.checked, 'due', 'null')"
                                >
                                <span class="flex items-center gap-2">
                                    <span class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <icon class="w-3 h-3 text-gray-600" name="calendar" />
                                    </span>
                                    <span class="text-sm text-gray-700">{{ $t('No dates') }}</span>
                                </span>
                            </label>
                        </li>
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__over">
                                <input 
                                    id="filter__due__over" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('due', 'over')" 
                                    @change="doFilter($event.target.checked, 'due', 'over')"
                                >
                                <span class="flex items-center gap-2">
                                    <span class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                        <icon class="w-3 h-3 text-red-600" name="clock" />
                                    </span>
                                    <span class="text-sm text-gray-700 font-medium">{{ $t('Overdue') }}</span>
                                </span>
                            </label>
                        </li>
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_day">
                                <input 
                                    id="filter__due__next_day" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('due', 'next_day')" 
                                    @change="doFilter($event.target.checked, 'due', 'next_day')"
                                >
                                <span class="flex items-center gap-2">
                                    <span class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                        <icon class="w-3 h-3 text-orange-600" name="clock" />
                                    </span>
                                    <span class="text-sm text-gray-700 font-medium">{{ $t('Due in the next day') }}</span>
                                </span>
                            </label>
                        </li>
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_week">
                                <input 
                                    id="filter__due__next_week" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('due', 'next_week')" 
                                    @change="doFilter($event.target.checked, 'due', 'next_week')"
                                >
                                <span class="flex items-center gap-2">
                                    <span class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <icon class="w-3 h-3 text-blue-600" name="calendar-week" />
                                    </span>
                                    <span class="text-sm text-gray-700 font-medium">{{ $t('Due this week') }}</span>
                                </span>
                            </label>
                        </li>
                        <li>
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" for="filter__due__next_month">
                                <input 
                                    id="filter__due__next_month" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('due', 'next_month')" 
                                    @change="doFilter($event.target.checked, 'due', 'next_month')"
                                >
                                <span class="flex items-center gap-2">
                                    <span class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <icon class="w-3 h-3 text-purple-600" name="calendar" />
                                    </span>
                                    <span class="text-sm text-gray-700 font-medium">{{ $t('Due this month') }}</span>
                                </span>
                            </label>
                        </li>
                    </ul>
                </div>

                <!-- Labels Filter -->
                <div v-if="enable_options.includes('label')" class="filter-section">
                    <div class="flex items-center justify-between mb-2">
                        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <icon name="tag" class="w-4 h-4 text-indigo-600" />
                            {{ $t('Labels') }}
                        </label>
                        <button v-if="hasActiveLabelFilters" @click="clearFilterType('label')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            {{ $t('Clear') }}
                        </button>
                    </div>
                    
                    <!-- Search Labels -->
                    <div class="mb-3">
                        <div class="relative">
                            <icon name="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                v-model="label_search" 
                                type="text" 
                                :placeholder="$t('Search labels...')"
                                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <ul class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        <li v-for="(lab, lab_index) in filteredLabels" :key="lab_index">
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" :for="'f_l_'+lab_index">
                                <input 
                                    :id="'f_l_'+lab_index" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('label', lab.id)" 
                                    @change="doFilter($event.target.checked, 'label', lab.id)"
                                >
                                <span 
                                    class="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm" 
                                    :style="{background: lab.color}"
                                >
                                    {{ lab.name }}
                                </span>
                            </label>
                        </li>
                        <li v-if="!filteredLabels || filteredLabels.length === 0" class="text-xs text-gray-500 text-center py-2">
                            {{ $t('No labels found') }}
                        </li>
                    </ul>
                </div>

                <!-- Project Filter (for workspace context) -->
                <div v-if="workspace && enable_options.includes('project')" class="filter-section">
                    <div class="flex items-center justify-between mb-2">
                        <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <icon name="project" class="w-4 h-4 text-indigo-600" />
                            {{ $t('Projects') }}
                        </label>
                        <button v-if="hasActiveProjectFilters" @click="clearFilterType('project')" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            {{ $t('Clear') }}
                        </button>
                    </div>
                    <ul class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        <li v-for="(project, project_index) in (workspaceProjects || [])" :key="project_index">
                            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" :for="'f_p_'+project_index">
                                <input 
                                    :id="'f_p_'+project_index" 
                                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                                    type="checkbox" 
                                    :checked="filterOptions('project', project.id)" 
                                    @change="doFilter($event.target.checked, 'project', project.id)"
                                >
                                <div class="project__color w-5 h-5 rounded-full flex-shrink-0" 
                                     :style="[project.background?{background: 'url('+project.background.image+')'}:{}]"
                                ></div>
                                <span class="text-sm text-gray-700">{{ project.title }}</span>
                            </label>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Footer with Clear All -->
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button 
                    v-if="activeFiltersCount > 0"
                    @click="clearAllFilters" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    {{ $t('Clear All') }}
                </button>
                <div v-else class="text-xs text-gray-500">
                    {{ $t('No active filters') }}
                </div>
                <div class="text-xs text-gray-500">
                    {{ activeFiltersCount }} {{ activeFiltersCount === 1 ? $t('filter') : $t('filters') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Icon from '@/Shared/Icon.vue'
    import { Link } from '@inertiajs/vue3'
    import axios from 'axios'

    export default {
        name: 'board-filter',
        props: {
            project: Object,
            workspace: Object,
            filters: { required: false },
            options: { required: false },
            top: { required: false, default: '95px' },
            left: { required: false, default: 'inherit' },
            right: { required: false, default: '20px' }
        },
        components: { Icon, Link },
        emits: {
            doFilter: null,
            boardFilter: null,
        },
        data() {
            return {
                open_filter: false,
                user_search: '',
                label_search: '',
                loading: true,
                users: [],
                labels: [],
                workspaceProjects: [],
                enable_options: [],
                form: {
                    user: this.filters?.user || null,
                    due: this.filters?.due || null,
                    label: this.filters?.label || null,
                    project: this.filters?.project || null,
                },
            }
        },
        computed: {
            filteredUsers() {
                if (!this.users || !Array.isArray(this.users)) return [];
                if (!this.user_search) return this.users;
                const search = this.user_search.toLowerCase();
                return this.users.filter(user => 
                    user && user.name && user.name.toLowerCase().includes(search)
                );
            },
            filteredLabels() {
                if (!this.labels || !Array.isArray(this.labels)) return [];
                if (!this.label_search) return this.labels;
                const search = this.label_search.toLowerCase();
                return this.labels.filter(label => 
                    label && label.name && label.name.toLowerCase().includes(search)
                );
            },
            activeFiltersCount() {
                let count = 0;
                if (this.form.user) {
                    const userValue = String(this.form.user);
                    count += userValue.split(',').filter(v => v && v !== 'null').length;
                }
                if (this.form.due) {
                    const dueValue = String(this.form.due);
                    count += dueValue.split(',').filter(v => v && v !== 'null').length;
                }
                if (this.form.label) {
                    const labelValue = String(this.form.label);
                    count += labelValue.split(',').filter(v => v && v !== 'null').length;
                }
                if (this.form.project) {
                    const projectValue = String(this.form.project);
                    count += projectValue.split(',').filter(v => v && v !== 'null').length;
                }
                return count;
            },
            hasActiveUserFilters() {
                return !!this.form.user && this.form.user !== 'null';
            },
            hasActiveDueFilters() {
                return !!this.form.due && this.form.due !== 'null';
            },
            hasActiveLabelFilters() {
                return !!this.form.label;
            },
            hasActiveProjectFilters() {
                return !!this.form.project;
            },
        },
        methods: {
            filterOptions(type, value) {
                if (this.filters && this.filters[type]) {
                    const filters = this.filters[type].split(',');
                    return filters.includes(String(value));
                }
                return false;
            },
            doFilter(bool, type, val) {
                this.addOrRemove(type, val)
            },
            addOrRemove(el, val) {
                val = String(val);
                if (!!this.form[el]) {
                    const arr = String(this.form[el]).split(',').filter(v => v);
                    if (!arr.includes(val)) {
                        arr.push(val);
                    } else {
                        const findIndex = arr.findIndex(u => u === val);
                        arr.splice(findIndex, 1);
                    }
                    this.form[el] = arr.length > 0 ? arr.join(',') : null;
                } else {
                    this.form[el] = val;
                }
                this.$emit('doFilter', this.form)
            },
            clearFilterType(type) {
                this.form[type] = null;
                this.$emit('doFilter', this.form);
            },
            clearAllFilters() {
                this.form = {
                    user: null,
                    due: null,
                    label: null,
                    project: null,
                };
                this.$emit('doFilter', this.form);
            },
            getData() {
                if (this.workspace) {
                    axios.get(this.route('workspace.other.data', { workspace_id: this.workspace.id })).then((response) => {
                        const data = response.data || {};
                        this.users = (data.team_members || []).map(tm => ({ 
                            name: tm.user?.name || '', 
                            id: tm.user_id, 
                            photo_path: tm.user?.photo_path || null 
                        }));
                        this.labels = data.labels || [];
                        
                        // Load workspace projects if project filter is enabled
                        if (this.enable_options.includes('project')) {
                            this.loadWorkspaceProjects();
                        }
                        
                        this.loading = false;
                    }).catch((error) => {
                        console.error('Error loading filter data:', error);
                        this.users = [];
                        this.labels = [];
                        this.loading = false;
                    });
                } else if (this.project) {
                    axios.get(this.route('json.project.filter.data', this.project.id)).then((response) => {
                        const data = response.data || {};
                        this.users = (data.assignees || []).map(user => ({ 
                            name: user.user?.name || '', 
                            id: user.user_id, 
                            photo_path: user.user?.photo_path || null 
                        }));
                        this.labels = data.labels || [];
                        this.loading = false;
                    }).catch((error) => {
                        console.error('Error loading filter data:', error);
                        this.users = [];
                        this.labels = [];
                        this.loading = false;
                    });
                } else {
                    this.loading = false;
                }
            },
            loadWorkspaceProjects() {
                if (this.workspace) {
                    axios.get(this.route('json.projects.all', this.workspace.id)).then((response) => {
                        if (response.data) {
                            this.workspaceProjects = Array.isArray(response.data) ? response.data : [];
                        } else {
                            this.workspaceProjects = [];
                        }
                    }).catch((error) => {
                        console.error('Error loading workspace projects:', error);
                        this.workspaceProjects = [];
                    });
                }
            },
        },
        created() {
            this.getData();
            this.enable_options = this.options ? this.options.split(',') : [];
        },
    }
</script>

<style scoped>
    .filter-section {
        @apply border-b border-gray-100 pb-4 last:border-b-0;
    }

    .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
</style>
