<template>
    <div class="h-full">
        <Head :title="$t(title)" />
        <div class="flex workspace__view flex-col task__table overflow-hidden overflow-y-auto">
            <!-- Enhanced Workspace Header -->
            <div class="relative bg-gradient-to-br from-indigo-600 via-purple-600 via-pink-500 to-orange-500 text-white overflow-hidden">
                <!-- Animated Background Pattern -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 40px 40px; animation: patternMove 20s linear infinite;"></div>
                </div>
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                <div class="relative min-w-full py-8 px-4 md:px-6 lg:px-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div class="flex items-center gap-5">
                            <div class="relative">
                                <div v-if="workspace.logo" class="logo has_bg flex justify-center items-center w-20 h-20 rounded-3xl text-white text-2xl shadow-2xl ring-4 ring-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-105" :style="{ 'background-image' : 'url('+ workspace.logo +')' }">
                                </div>
                                <div v-else class="logo flex justify-center items-center w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-md text-white text-3xl font-bold shadow-2xl ring-4 ring-white/30 transition-transform duration-300 hover:scale-105">
                                    {{ workspace.name.charAt(0).toUpperCase() }}
                                </div>
                                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <h1 class="text-4xl font-extrabold text-white drop-shadow-lg">{{ workspace.name }}</h1>
                                <p v-if="workspace.description" class="text-white/90 text-base mt-1 max-w-2xl leading-relaxed">{{ workspace.description }}</p>
                                <div v-if="workspace.website" class="flex items-center gap-2 mt-3">
                                    <div class="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <icon name="link" class="w-4 h-4 text-white" />
                                    </div>
                                    <a :href="workspace.website" target="_blank" class="text-white/90 text-sm hover:text-white font-medium underline decoration-2 underline-offset-2 transition-colors">{{ workspace.website }}</a>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button v-if="workspace.member.role === 'admin'" @click="invite_workspace = true" class="flex gap-2 bg-white/25 hover:bg-white/35 backdrop-blur-md h-11 items-center text-white rounded-xl px-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold border border-white/30">
                                <icon name="user_plus" class="w-5 h-5 fill-white" />
                                <span>{{ $t('Invite Members') }}</span>
                            </button>
                            <div v-if="workspace.member.role === 'admin'" class="relative" v-click-outside="()=>{show_more = false}">
                                <button @click="show_more = !show_more" class="flex items-center justify-center w-11 h-11 bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/30">
                                    <icon class="w-5 h-5 text-white" name="more" />
                                </button>
                                <div v-if="show_more" class="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-[9999] backdrop-blur-xl">
                                    <div class="p-2">
                                        <button @click="edit_workspace_option = true; show_more = false" class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group">
                                            <div class="p-2 bg-indigo-100 rounded-xl mr-3 group-hover:bg-indigo-200 transition-colors">
                                                <icon class="w-4 h-4 text-indigo-600" name="edit" />
                                            </div>
                                            <span>{{ $t('Edit Workspace') }}</span>
                                        </button>
                                        <button @click="delete_workspace_popup = true; show_more = false" class="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                                            <div class="p-2 bg-red-100 rounded-xl mr-3 group-hover:bg-red-200 transition-colors">
                                                <icon class="w-4 h-4 text-red-600" name="trash" />
                                            </div>
                                            <span>{{ $t('Delete Workspace') }}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="min-w-full py-8 align-middle md:px-4 lg:px-6 xl:px-8">
                <!-- Quick Stats Section -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative flex items-center justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{{ $t('Total Projects') }}</p>
                                <p class="text-4xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{{ projects?.length || 0 }}</p>
                                <p class="text-xs text-gray-500">{{ $t('Active projects') }}</p>
                            </div>
                            <div class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl group-hover:from-indigo-200 group-hover:to-indigo-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                                <icon name="folder" class="w-7 h-7 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <Link :href="route('workspace.view.board', workspace.slug || workspace.id)" class="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group block overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative flex items-center justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{{ $t('Workspace Tasks') }}</p>
                                <p class="text-xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">{{ $t('View All') }}</p>
                                <p class="text-xs text-gray-500">{{ $t('All workspace tasks') }}</p>
                            </div>
                            <div class="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:from-purple-200 group-hover:to-purple-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                                <icon name="table" class="w-7 h-7 text-purple-600" />
                            </div>
                        </div>
                    </Link>
                    <Link :href="route('workspace.view.my-tasks.board', workspace.slug || workspace.id)" class="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group block overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative flex items-center justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{{ $t('My Tasks') }}</p>
                                <p class="text-xl font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors mb-1">{{ $t('View All') }}</p>
                                <p class="text-xs text-gray-500">{{ $t('Your assigned tasks') }}</p>
                            </div>
                            <div class="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl group-hover:from-pink-200 group-hover:to-pink-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                                <icon name="list" class="w-7 h-7 text-pink-600" />
                            </div>
                        </div>
                    </Link>
                </div>
                <!-- Edit Workspace Modal -->
                <div v-if="edit_workspace_option" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn" @click="edit_workspace_option = false">
                    <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slideUp" @click.stop>
                        <div class="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-8 py-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <icon name="edit" class="w-6 h-6 text-white" />
                                    </div>
                                    <h3 class="text-2xl font-extrabold">{{ $t('Edit Workspace') }}</h3>
                                </div>
                                <button @click="edit_workspace_option = false" class="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110">
                                    <icon name="close" class="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                        <div class="p-8 space-y-6 bg-gradient-to-br from-white to-gray-50">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {{ $t('Workspace name') }} <span class="text-red-500">*</span>
                                </label>
                                <input v-model="form.name" class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md" type="text" required="required" aria-required="true" autocomplete="off" placeholder="Enter workspace name">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {{ $t('Workspace Type') }}
                                </label>
                                <select-input v-model="form.type_id" class="w-full">
                                    <option v-for="(type, ti) in types" :key="ti" :value="type.id">{{ type.name }}</option>
                                </select-input>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {{ $t('Workspace Logo') }}
                                </label>
                                <file-input v-model="form.logo" class="w-full" type="file" accept="image/*" label="Upload Logo" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {{ $t('Website') }} <span class="text-gray-500 text-xs font-normal normal-case">({{ $t('optional') }})</span>
                                </label>
                                <input v-model="form.website" class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md" type="text" autocomplete="off" placeholder="https://example.com">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {{ $t('Workspace Description') }} <span class="text-gray-500 text-xs font-normal normal-case">({{ $t('optional') }})</span>
                                </label>
                                <textarea v-model="form.description" class="w-full rounded-xl border-2 border-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900 font-medium shadow-sm hover:shadow-md h-32 resize-none" autocomplete="off" placeholder="Describe your workspace..."></textarea>
                            </div>
                            <div class="flex gap-4 pt-6 border-t border-gray-200">
                                <button class="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!form.name" @click="updateWorkspace()">
                                    <span class="flex items-center justify-center gap-2">
                                        <icon name="save" class="w-5 h-5 fill-white" />
                                        {{ $t('Update Workspace') }}
                                    </span>
                                </button>
                                <button class="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg" @click="edit_workspace_option = false">
                                    {{ $t('Cancel') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Projects Section Header -->
                <div class="mb-8">
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="p-2 bg-indigo-100 rounded-xl">
                                        <icon name="folder" class="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 class="text-3xl font-extrabold text-gray-900">{{ $t('Projects') }}</h2>
                                        <p class="text-sm text-gray-600 mt-1">
                                            <span class="font-semibold text-indigo-600">{{ filteredProjects.length }}</span>
                                            <span class="text-gray-500">{{ $t('of') }}</span>
                                            <span class="font-semibold">{{ projects?.length || 0 }}</span>
                                            <span class="text-gray-500">{{ $t('project' + (projects?.length !== 1 ? 's' : '')) }}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-3">
                                <!-- Search Bar -->
                                <div class="relative flex-1 sm:flex-initial sm:w-72">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <icon name="search" class="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        v-model="searchQuery"
                                        type="text"
                                        :placeholder="$t('Search projects...')"
                                        class="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white text-sm font-medium shadow-sm"
                                    />
                                    <button
                                        v-if="searchQuery"
                                        @click="searchQuery = ''"
                                        class="absolute inset-y-0 right-0 flex items-center pr-4 hover:bg-gray-100 rounded-r-xl transition-colors"
                                    >
                                        <icon name="close" class="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                                <!-- Sort Dropdown -->
                                <div class="relative" v-click-outside="() => showSortMenu = false">
                                    <button
                                        @click="showSortMenu = !showSortMenu"
                                        class="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all bg-white text-sm font-semibold text-gray-700 shadow-sm min-w-[140px]"
                                        :class="{'border-indigo-500 bg-indigo-50': showSortMenu}"
                                    >
                                        <icon name="sort" class="w-4 h-4" />
                                        <span class="flex-1 text-left">{{ getSortLabel() }}</span>
                                        <icon name="cheveron-down" class="w-4 h-4 transition-transform" :class="{'rotate-180': showSortMenu}" />
                                    </button>
                                    <div v-if="showSortMenu" class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden z-[9999] backdrop-blur-xl">
                                        <div class="p-2">
                                            <button
                                                v-for="option in sortOptions"
                                                :key="option.value"
                                                @click="sortBy = option.value; showSortMenu = false"
                                                class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all duration-200"
                                                :class="{'bg-indigo-50 text-indigo-600 font-semibold': sortBy === option.value}"
                                            >
                                                <div class="p-1.5 rounded-lg mr-3" :class="sortBy === option.value ? 'bg-indigo-100' : 'bg-gray-100'">
                                                    <icon :name="option.icon" class="w-4 h-4" :class="sortBy === option.value ? 'text-indigo-600' : 'text-gray-600'" />
                                                </div>
                                                <span class="flex-1">{{ $t(option.label) }}</span>
                                                <icon v-if="sortBy === option.value" name="check" class="w-5 h-5 text-indigo-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <!-- View Toggle -->
                                <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <button
                                        @click="viewMode = 'grid'"
                                        class="p-3 transition-all duration-200"
                                        :class="viewMode === 'grid' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'"
                                        :title="$t('Grid View')"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        @click="viewMode = 'list'"
                                        class="p-3 transition-all duration-200 border-l-2 border-gray-200"
                                        :class="viewMode === 'list' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'"
                                        :title="$t('List View')"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                        </svg>
                                    </button>
                                </div>
                                <!-- New Project Button -->
                                <button
                                    v-if="!!this.$page.props.auth.user.role.create_project && !create_project"
                                    @click="create_project = true"
                                    class="flex gap-2 items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 whitespace-nowrap"
                                >
                                    <icon name="plus" class="w-5 h-5 fill-white" />
                                    <span class="hidden sm:inline">{{ $t('New Project') }}</span>
                                    <span class="sm:hidden">{{ $t('New') }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <create-project v-if="create_project" @create-project="create_project = false" />

                <!-- Projects Grid/List View -->
                <ul v-if="viewMode === 'grid'" class="project__list">
                    <li v-if="!!this.$page.props.auth.user.role.create_project && !create_project" class="w-full">
                        <button @click="create_project = true" class="group w-full rounded-3xl border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gradient-to-br from-gray-50 via-white to-gray-50 hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-500 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                            <div class="relative z-10 p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 transform shadow-lg">
                                <icon name="plus" class="w-8 h-8 text-indigo-600" />
                            </div>
                            <div class="relative z-10 text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1">
                                {{ $t('Create new project') }}
                            </div>
                            <div class="relative z-10 text-sm text-gray-500 group-hover:text-indigo-500 font-medium">
                                {{ $t('Start organizing your work') }}
                            </div>
                        </button>
                    </li>
                    <li v-for="(project, project_index) in filteredProjects" :key="project.id" class="w-full" :style="{ animationDelay: (project_index * 50) + 'ms' }">
                        <Link :href="route('projects.view.board', project.slug || project.id)"
                              :style="[project.background?{backgroundColor: project.background.bg, backgroundImage: 'url('+project.background.image+')', backgroundSize: 'cover'}:{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}]"
                              class="p__item group block rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 overflow-hidden relative">
                            <!-- Animated Gradient Overlay -->
                            <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35 group-hover:from-black/10 group-hover:via-black/5 group-hover:to-black/20 transition-all duration-500"></div>
                            <!-- Shine Effect -->
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            <div class="content relative z-10 h-full flex flex-col justify-between p-6">
                                <div class="element flex-1">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="title text-2xl font-extrabold text-white line-clamp-1 flex-1 pr-3 drop-shadow-lg group-hover:drop-shadow-xl transition-all">{{ project.title }}</div>
                                        <button class="flex w-9 h-9 items-center justify-center rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all flex-shrink-0 shadow-lg" @click.stop="saveProject($event, project)">
                                            <icon v-if="!!project.star" name="star" class="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                                            <icon v-else name="star" class="w-5 h-5 opacity-0 group-hover:opacity-100 text-white/70 hover:text-yellow-400 transition-all" />
                                        </button>
                                    </div>
                                    <p v-if="project.description" class="details text-sm text-white/95 line-clamp-2 mb-4 leading-relaxed drop-shadow-md">{{ project.description }}</p>
                                </div>
                                <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/30">
                                    <div class="flex items-center gap-2.5">
                                        <div class="p-2 bg-white/25 backdrop-blur-md rounded-xl shadow-md">
                                            <icon name="folder" class="w-4 h-4 text-white" />
                                        </div>
                                        <span class="text-xs text-white/95 font-semibold uppercase tracking-wide">{{ $t('Project') }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg group-hover:bg-white/30 transition-all">
                                        <span class="text-xs text-white/90 font-medium">{{ $t('Open') }}</span>
                                        <icon name="arrow-right" class="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                    <li v-if="filteredProjects.length === 0 && searchQuery" class="w-full col-span-full">
                        <div class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                            <div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <icon name="search" class="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('No projects found') }}</h3>
                            <p class="text-gray-600 mb-6">{{ $t('Try adjusting your search or filters') }}</p>
                            <button @click="searchQuery = ''" class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200">
                                <icon name="close" class="w-5 h-5" />
                                <span>{{ $t('Clear Search') }}</span>
                            </button>
                        </div>
                    </li>
                    <li v-if="!projects || projects.length === 0" class="w-full col-span-full">
                        <div class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                            <div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <icon name="folder" class="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('No projects yet') }}</h3>
                            <p class="text-gray-600 mb-6">{{ $t('Create your first project to get started') }}</p>
                            <button v-if="!!this.$page.props.auth.user.role.create_project" @click="create_project = true" class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                                <icon name="plus" class="w-5 h-5 fill-white" />
                                <span>{{ $t('Create Project') }}</span>
                            </button>
                        </div>
                    </li>
                </ul>

                <!-- List View -->
                <div v-else class="space-y-3">
                    <button
                        v-if="!!this.$page.props.auth.user.role.create_project && !create_project"
                        @click="create_project = true"
                        class="group w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 p-6 flex items-center justify-center gap-4"
                    >
                        <div class="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                            <icon name="plus" class="w-6 h-6 text-indigo-600" />
                        </div>
                        <div class="text-left">
                            <div class="text-lg font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                {{ $t('Create new project') }}
                            </div>
                            <div class="text-sm text-gray-500">
                                {{ $t('Start organizing your work') }}
                            </div>
                        </div>
                    </button>
                    <Link
                        v-for="(project, project_index) in filteredProjects"
                        :key="project.id"
                        :href="route('projects.view.board', project.slug || project.id)"
                        class="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200/60 hover:border-indigo-300 transition-all duration-500 overflow-hidden hover:-translate-y-1"
                    >
                        <div class="flex items-center gap-5 p-6">
                            <div
                                class="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-gray-100 group-hover:ring-indigo-100 transition-all duration-300 group-hover:scale-110"
                                :style="[project.background?{backgroundColor: project.background.bg, backgroundImage: 'url('+project.background.image+')', backgroundSize: 'cover'}:{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}]"
                            ></div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between mb-2">
                                    <h3 class="text-xl font-extrabold text-gray-900 truncate pr-3 group-hover:text-indigo-600 transition-colors">{{ project.title }}</h3>
                                    <button class="flex w-9 h-9 items-center justify-center rounded-xl hover:bg-indigo-50 transition-all flex-shrink-0" @click.stop="saveProject($event, project)">
                                        <icon v-if="!!project.star" name="star" class="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <icon v-else name="star" class="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                                    </button>
                                </div>
                                <p v-if="project.description" class="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{{ project.description }}</p>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                                        <icon name="folder" class="w-4 h-4 text-indigo-600" />
                                        <span class="text-xs text-indigo-600 font-semibold">{{ $t('Project') }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-shrink-0 p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                <icon name="arrow-right" class="w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                    <div v-if="filteredProjects.length === 0 && searchQuery" class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <icon name="search" class="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('No projects found') }}</h3>
                        <p class="text-gray-600 mb-6">{{ $t('Try adjusting your search or filters') }}</p>
                        <button @click="searchQuery = ''" class="inline-flex gap-2 items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200">
                            <icon name="close" class="w-5 h-5" />
                            <span>{{ $t('Clear Search') }}</span>
                        </button>
                    </div>
                    <div v-if="!projects || projects.length === 0" class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div class="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <icon name="folder" class="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('No projects yet') }}</h3>
                        <p class="text-gray-600 mb-6">{{ $t('Create your first project to get started') }}</p>
                        <button v-if="!!this.$page.props.auth.user.role.create_project" @click="create_project = true" class="inline-flex gap-2 items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                            <icon name="plus" class="w-5 h-5 fill-white" />
                            <span>{{ $t('Create Project') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <invite-workspace-member :workspace="workspace" v-if="invite_workspace" @invite-member="closeInviteMember()" top="50px" right="0px" />

        <delete-confirmation
            v-if="delete_workspace_popup" @popup="delete_workspace_popup = false" @confirm="deleteWorkspace()"
            details="Deleting workspace will delete all of the projects including board list. Are you sure you want to delete this workspace?"
        />
    </div>
</template>

<script>
import {Head, Link} from '@inertiajs/vue3'
import Layout from '@/Shared/Layout.vue'
import Icon from '@/Shared/Icon.vue'
import Pagination from '@/Shared/Pagination.vue'
import BoardViewMenu from '@/Shared/BoardViewMenu.vue'
import moment from 'moment'
import SearchInput from '@/Shared/SearchInput.vue'
import CreateProject from "@/Shared/Modals/CreateProject.vue";
import InviteWorkspaceMember from "@/Shared/Modals/InviteWorkspaceMember.vue";
import axios from 'axios'
import DeleteConfirmation from "@/Shared/DeleteConfirmation.vue";
import FileInput from '@/Shared/FileInput.vue'
import SelectInput from '@/Shared/SelectInput.vue'


export default {
    components: {
        FileInput,
        DeleteConfirmation,
        InviteWorkspaceMember,
        CreateProject,
        Head,
        Icon,
        Link,
        BoardViewMenu,
        Pagination,
        SearchInput,
        SelectInput,
    },
    layout: Layout,
    props: {
        title: String,
        auth: Object,
        projects: Object,
        workspace: Object,
        filters: Object,
    },
    data() {
        return {
            create_project: false,
            delete_workspace_popup: false,
            edit_workspace_option: false,
            invite_workspace: false,
            show_more: false,
            showSortMenu: false,
            types: [],
            searchQuery: '',
            sortBy: 'recent',
            viewMode: 'grid', // 'grid' or 'list'
            sortOptions: [
                { value: 'recent', label: 'Recently Updated', icon: 'clock' },
                { value: 'name', label: 'Name (A-Z)', icon: 'sort-alpha' },
                { value: 'name_desc', label: 'Name (Z-A)', icon: 'sort-alpha-desc' },
                { value: 'starred', label: 'Starred First', icon: 'star' },
            ],
            form: this.$inertia.form({
                name: this.workspace.name,
                type_id: this.workspace.type_id,
                website: this.workspace.website,
                description: this.workspace.description,
                logo: null,
            })
        }
    },
    computed: {
        filteredProjects() {
            let filtered = this.projects || [];

            // Apply search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(project =>
                    project.title.toLowerCase().includes(query) ||
                    (project.description && project.description.toLowerCase().includes(query))
                );
            }

            // Apply sorting
            const sorted = [...filtered];
            switch (this.sortBy) {
                case 'name':
                    sorted.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'name_desc':
                    sorted.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                case 'starred':
                    sorted.sort((a, b) => {
                        if (a.star && !b.star) return -1;
                        if (!a.star && b.star) return 1;
                        return 0;
                    });
                    break;
                case 'recent':
                default:
                    // Keep original order (most recent first from backend)
                    break;
            }

            return sorted;
        },
    },
    methods: {
        getDetails(text){
            if(text && text.length > 50)text = text.substring(0,50)+'...';
            return text;
        },
        deleteWorkspace(){
            this.$inertia.delete(this.route('workspace.destroy', this.workspace.id))
        },
        closeInviteMember(){
            this.invite_workspace = false
            window.location.href = this.route('workspace.members',this.workspace.slug || this.workspace.id);
        },
        updateWorkspace(){
            this.form.post(this.route('workspace.update', this.workspace.id))
        },
        saveProject(e, project){
            project.star = !project.star;
            e.preventDefault();
            axios.post(this.route('json.p.starred.save', project.id)).then((resp) => {
                window.location.reload();
            });
        },
        getWorkspaceTypes(){
            axios.post(this.route('json.workspace.types.get')).then((response) => {
                if(response.data){
                    this.types = response.data.types
                }
            });
        },
        getSortLabel(){
            const option = this.sortOptions.find(opt => opt.value === this.sortBy);
            return option ? this.$t(option.label) : this.$t('Sort');
        }
    },
    created() {
        this.moment = moment
        this.getWorkspaceTypes();
    },
}
</script>
