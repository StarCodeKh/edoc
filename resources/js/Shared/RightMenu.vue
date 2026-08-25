<template>
    <div
        class="right__menu fixed w-[320px] z-[200] h-[calc(100vh-45px)] shadow-2xl text-sm bg-white overflow-hidden rounded-l-2xl border-l border-gray-200/60 backdrop-blur-xl flex flex-col"
        :style="{ top, left, right }"
    >
        <!-- Enhanced Header -->
        <div class="relative bg-gradient-to-r from-white via-gray-50/50 to-white border-b border-gray-200/60">
            <div class="flex items-center justify-between px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div
                        v-if="show_back_button"
                        @click="goBack()"
                        class="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                    >
                        <icon name="arrow-left" class="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <icon name="menu" class="w-5 h-5 text-white" />
                        </div>
                        <h2 class="text-lg font-bold text-gray-900">{{ $t('Menu') }}</h2>
                    </div>
                </div>
                <button
                    @click="$emit('menuToggle')"
                    class="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                    <icon class="w-5 h-5 text-gray-600 group-hover:text-gray-900" name="close" />
                </button>
            </div>
        </div>
        <!-- Enhanced Menu Items -->
        <div class="flex-1 overflow-y-auto min-h-0" v-if="!show_back_button">
            <div class="p-4 space-y-2">
                <!-- Archive Section -->
                <div class="space-y-1">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Archive</h3>
                    <button
                        @click="showItems('tasks')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">
                            <icon name="archive" class="w-4 h-4 text-orange-600" />
                        </div>
                        {{ $t('Archived Tasks') }}
                    </button>
                    <button
                        @click="showItems('boards')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">
                            <icon name="archive" class="w-4 h-4 text-orange-600" />
                        </div>
                        {{ $t('Archived Board Items') }}
                    </button>
                </div>

                <!-- Export Section -->
                <div v-if="$page.props.auth.user.role.slug === 'admin'" class="space-y-1">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Export</h3>
                    <a
                        :href="'/project/csv/export/' + project.id"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                            <img class="w-4 h-4" src="/images/svg/csv.svg" alt="Export CSV" />
                        </div>
                        {{ $t('Export tasks as CSV') }}
                    </a>
                    <a
                        :href="'/project/excel/export/' + project.id"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                            <img class="w-4 h-4" src="/images/svg/excel.svg" alt="Export Excel" />
                        </div>
                        {{ $t('Export tasks as Excel') }}
                    </a>
                </div>

                <!-- Project Settings Section -->
                <div v-if="$page.props.auth.user.role.slug === 'admin'" class="space-y-1">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Project Settings
                    </h3>
                    <button
                        @click="showItems('backgrounds')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                            <span
                                class="icon w-4 h-4 rounded"
                                :style="[
                                    project && project.background
                                        ? { backgroundImage: 'url(' + project.background.image + ')' }
                                        : { backgroundColor: '#6366f1' },
                                ]"
                            />
                        </div>
                        {{ $t('Change Background') }}
                    </button>
                    <button
                        @click="showItems('workspaces')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                            <icon name="gear" class="w-4 h-4 text-blue-600" />
                        </div>
                        {{ $t('Change Workspace') }}
                    </button>
                    <button
                        @click="showItems('visibility')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-indigo-100 rounded-lg mr-3 group-hover:bg-indigo-200 transition-colors">
                            <icon name="display" class="w-4 h-4 text-indigo-600" />
                        </div>
                        {{ $t('Change Task Visibility') }}
                    </button>
                </div>

                <!-- Danger Zone -->
                <div v-if="$page.props.auth.user.role.slug === 'admin'" class="space-y-1">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Danger Zone</h3>
                    <button
                        @click="delete_project_confirmation = true"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                            <icon name="trash" class="w-4 h-4 text-red-600" />
                        </div>
                        {{ $t('Delete Project') }}
                    </button>
                </div>

                <!-- Global Settings -->
                <div v-if="$page.props.auth.user.role.slug === 'admin'" class="space-y-1">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">System</h3>
                    <Link
                        :href="route('global')"
                        class="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                        <div class="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                            <icon name="settings" class="w-4 h-4 text-gray-600" />
                        </div>
                        {{ $t('Global Settings') }}
                    </Link>
                </div>
            </div>
        </div>
        <!-- Enhanced Archived Tasks -->
        <div v-if="enable_options['tasks']" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('Archived Tasks') }}</h3>
                    <div class="text-sm text-gray-500">{{ menu_data.tasks.length }} {{ $t('tasks') }}</div>
                </div>

                <div class="space-y-3" v-if="menu_data.tasks.length">
                    <div
                        v-for="element in menu_data.tasks"
                        :key="element.id"
                        @click="$emit('openTask', element.slug || element.id)"
                        :data-id="element.id"
                        class="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 group hover:border-gray-300"
                        draggable="true"
                    >
                        <h4
                            class="text-sm font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors"
                        >
                            {{ element.title }}
                        </h4>
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                            <div
                                class="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                                v-if="element.due_date"
                            >
                                <icon class="w-3 h-3 mr-1" name="time" />
                                {{ moment(element.due_date).format('MMM D') }}
                            </div>
                            <div
                                class="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                                v-if="element.description"
                            >
                                <icon class="w-3 h-3 mr-1" name="details" />
                                Description
                            </div>
                            <div
                                class="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full"
                                v-if="element.comments_count"
                            >
                                <icon class="w-3 h-3 mr-1" name="comment" />
                                {{ element.comments_count }}
                            </div>
                            <div
                                class="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                                v-if="element.attachments_count"
                            >
                                <icon class="w-3 h-3 mr-1" name="attachment" />
                                {{ element.attachments_count }}
                            </div>
                            <div
                                class="flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                                v-if="element.checklists_count"
                            >
                                <icon class="w-3 h-3 mr-1" name="checklist" />
                                {{ element.checklist_done_count + '/' + element.checklists_count }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <div class="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <icon name="archive" class="w-6 h-6 text-gray-400" />
                    </div>
                    <p class="text-gray-500 text-sm">{{ $t('No archived tasks found') }}</p>
                </div>
            </div>
        </div>
        <!-- Enhanced Archived Boards -->
        <div v-if="enable_options['boards']" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('Archived Board Items') }}</h3>
                    <div class="text-sm text-gray-500">{{ menu_data.boards.length }} {{ $t('items') }}</div>
                </div>

                <div class="space-y-3" v-if="menu_data.boards.length">
                    <div
                        v-for="list in menu_data.boards"
                        :key="list.id"
                        class="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="p-2 bg-orange-100 rounded-lg">
                                    <icon name="archive" class="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <h4 class="text-sm font-semibold text-gray-900">{{ list.title }}</h4>
                                    <p class="text-xs text-gray-500">Archived board item</p>
                                </div>
                            </div>
                            <button
                                @click="sendToBoard(list.id)"
                                class="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            >
                                <icon class="w-4 h-4 mr-2" name="undo" />
                                {{ $t('Restore') }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <div class="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <icon name="archive" class="w-6 h-6 text-gray-400" />
                    </div>
                    <p class="text-gray-500 text-sm">{{ $t('No archived board items found') }}</p>
                </div>
            </div>
        </div>
        <!-- Enhanced Workspace Settings -->
        <div v-if="enable_options['workspaces']" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('Change Workspace') }}</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{
                            $t('Select a workspace')
                        }}</label>
                        <select-input v-model="selected_workspace" class="w-full">
                            <option :value="null">{{ $t('Select a workspace') }}</option>
                            <option v-for="(workspace, wi) in menu_data['workspaces']" :key="wi" :value="workspace.id">
                                {{ workspace.name }}
                            </option>
                        </select-input>
                    </div>
                    <button
                        @click="changeWorkSpace(selected_workspace)"
                        class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <icon name="save" class="w-4 h-4 mr-2" />
                        {{ $t('Save Changes') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Enhanced Visibility Settings -->
        <div v-if="enable_options['visibility']" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('Task Visibility') }}</h3>
                <div class="space-y-4">
                    <div class="p-4 bg-gray-50 rounded-xl">
                        <div class="flex items-start space-x-3">
                            <div class="flex items-center h-5 mt-0.5">
                                <input
                                    id="helper-checkbox"
                                    v-model="project.is_private"
                                    aria-describedby="helper-checkbox-text"
                                    type="checkbox"
                                    true-value="1"
                                    false-value="0"
                                    class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                            </div>
                            <div class="flex-1">
                                <label for="helper-checkbox" class="text-sm font-medium text-gray-900">
                                    {{ $t('Visible tasks only for the assigned people.') }}
                                </label>
                                <p id="helper-checkbox-text" class="text-xs text-gray-500 mt-1">
                                    {{
                                        $t(
                                            'Enabling this the tasks will be visible only for the admin and assigned people'
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        @click="changeProjectVisibility(project.is_private)"
                        class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <icon name="save" class="w-4 h-4 mr-2" />
                        {{ $t('Save Changes') }}
                    </button>
                </div>
            </div>
        </div>
        <!-- Enhanced Background Settings -->
        <div v-if="enable_options['backgrounds']" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('Change Background') }}</h3>

                <!-- Preset Backgrounds -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">{{ $t('Choose a background') }}</label>
                    <div class="grid grid-cols-4 gap-3">
                        <button
                            v-for="color in menu_data['backgrounds']"
                            :key="color.id"
                            @click="changeBackground(color)"
                            class="relative w-full h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-105"
                            :class="
                                selected_background && selected_background.id === color.id
                                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                                    : 'border-gray-200 hover:border-gray-300'
                            "
                            :style="{ backgroundImage: 'url(' + color.image + ')', backgroundColor: color.bg }"
                        >
                            <div
                                v-if="selected_background && selected_background.id === color.id"
                                class="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center"
                            >
                                <icon name="tick_check" class="text-white w-5 h-5" />
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Upload Custom Background -->
                <div class="border-t border-gray-200 pt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">{{
                        $t('Upload custom background')
                    }}</label>
                    <div class="space-y-3">
                        <div class="relative">
                            <input
                                @change="projectBgChange($event)"
                                ref="projectBgUpload"
                                id="projectBgUpload"
                                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                type="file"
                                accept="image/*"
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <icon name="upload" class="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <p class="text-xs text-gray-500">{{ $t('SVG, PNG, JPG or GIF (MAX. 2MB)') }}</p>
                        <button
                            v-if="upload_project_bg"
                            @click="uploadBackground($event)"
                            class="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <icon name="upload" class="w-4 h-4 mr-2" />
                            {{ $t('Upload Background') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <delete-confirmation
        v-if="delete_project_confirmation"
        @popup="delete_project_confirmation = false"
        @confirm="deleteProject()"
        details="Deleting project will delete all of the tasks including board list. Are you sure you want to delete this project?"
    />
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import { Link } from '@inertiajs/vue3';
import moment from 'moment';
import SelectInput from './SelectInput.vue';
import TaskDetails from './Modals/TaskDetails.vue';
import axios from 'axios';
import DeleteConfirmation from './DeleteConfirmation.vue';
export default {
    name: 'right-menu',
    props: {
        project: Object,
        top: { required: false, default: '45px' },
        left: { required: false, default: 'inherit' },
        right: { required: false, default: 0 },
    },
    emits: {
        openTask: null,
        menuToggle: null,
    },
    components: { DeleteConfirmation, TaskDetails, SelectInput, Icon, Link },
    data() {
        return {
            enable_options: { tasks: false, boards: false, workspaces: false, backgrounds: false, visibility: false },
            show_back_button: false,
            upload_project_bg: null,
            delete_project_confirmation: false,
            selected_workspace: this.project.workspace_id,
            selected_background: this.project.background,
            menu_data: { tasks: [], boards: [], workspaces: [], backgrounds: [] },
        };
    },
    methods: {
        projectBgChange(e) {
            if (e.target.files.length) {
                this.upload_project_bg = e.target.files[0];
            }
        },
        async uploadBackground(e) {
            e.preventDefault();
            if (!this.upload_project_bg) {
                return;
            }
            if (this.upload_project_bg.size / 1024 / 1024 > 2) {
                alert('Uploading file size less than 2MB is not allowed in the demo mode!');
                return;
            }
            let formData = new FormData();
            formData.append('file', this.upload_project_bg);
            const resp = await axios.post(this.route('project.background.upload', this.project.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (resp.data && resp.data.image) {
                const bg_resp = await axios.post(this.route('project.background.update', this.project.id), {
                    background_id: resp.data.id,
                });
                if (bg_resp && bg_resp.data) {
                    this.project.background = bg_resp.data;
                    if (this.$page.props.project) {
                        this.$page.props.project.background = bg_resp.data;
                        this.upload_project_bg = null;
                        this.$refs.projectBgUpload.value = null;
                    }
                }
            }
        },

        changeBackground(background) {
            this.selected_background = background;
            this.project.background = background;
            axios.post(this.route('project.background.update', this.project.id), {
                background_id: background.id,
                color: null,
            });
            if (this.$page.props.project) {
                this.$page.props.project.background = background;
            }
        },
        async changeProjectVisibility(is_private) {
            await axios.post(this.route('project.update', this.project.id), { is_private });
            window.location.href = this.route('projects.view.board', this.project.slug || this.project.id);
        },
        deleteProject() {
            this.delete_project_confirmation = false;
            this.$emit('menuToggle');
            this.$inertia.delete(this.route('project.destroy', this.project.id));
        },
        goBack() {
            const options = this.enable_options;
            Object.keys(options).forEach(function (key) {
                options[key] = false;
            });
            this.show_back_button = false;
        },
        showItems(type) {
            this.enable_options[type] = true;
            this.show_back_button = true;
            if (type !== 'visibility') {
                this.getItem(type);
            }
        },
        async getItem(type) {
            const archiveData = await axios.get(this.route('json.menu_data.' + type, this.project.id));
            this.menu_data[type] = archiveData.data;
        },
        async sendToBoard(id) {
            await axios.post(this.route('json.board.remove.archive', id));
            await this.getItem('boards');
        },
        async changeWorkSpace(workspace_id) {
            await axios.post(this.route('json.workspace.change'), { workspace_id, project_id: this.project.id });
            window.location.href = this.route('projects.view.board', this.project.slug || this.project.id);
        },
    },
    created() {
        this.moment = moment;
    },
};
</script>

<style scoped>
/* Enhanced Right Menu Styling */
.right__menu {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

/* Custom scrollbar */
.right__menu::-webkit-scrollbar {
    width: 6px;
}

.right__menu::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.right__menu::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.right__menu::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Enhanced button hover effects */
.group:hover .group-hover\:bg-orange-200 {
    background-color: rgb(254 215 170);
}

.group:hover .group-hover\:bg-green-200 {
    background-color: rgb(187 247 208);
}

.group:hover .group-hover\:bg-blue-200 {
    background-color: rgb(191 219 254);
}

.group:hover .group-hover\:bg-purple-200 {
    background-color: rgb(221 214 254);
}

.group:hover .group-hover\:bg-indigo-200 {
    background-color: rgb(199 210 254);
}

.group:hover .group-hover\:bg-red-200 {
    background-color: rgb(254 202 202);
}

.group:hover .group-hover\:bg-gray-200 {
    background-color: rgb(229 231 235);
}

/* Smooth transitions for all interactive elements */
button,
a,
input,
select {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus states */
button:focus,
a:focus,
input:focus,
select:focus {
    outline: none;
    ring: 2px;
    ring-color: rgb(99 102 241);
    ring-opacity: 0.5;
}

/* Background preview hover effects */
button[style*='background']:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* File input styling */
input[type='file']::-webkit-file-upload-button {
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

input[type='file']::-webkit-file-upload-button:hover {
    background: linear-gradient(to right, #4f46e5, #7c3aed);
    transform: translateY(-1px);
}

/* Enhanced checkbox styling */
input[type='checkbox'] {
    accent-color: #6366f1;
}

/* Gradient text animation */
@keyframes gradient-shift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.gradient-text {
    background: linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
    background-size: 400% 400%;
    animation: gradient-shift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Loading state animation */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Enhanced shadow effects */
.shadow-2xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
    .right__menu {
        width: 100vw;
        border-radius: 0;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .right__menu {
        background: rgba(17, 24, 39, 0.95);
        border-color: rgba(55, 65, 81, 0.6);
    }
}
</style>
