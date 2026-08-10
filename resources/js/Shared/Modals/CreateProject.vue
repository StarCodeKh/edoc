<template>
    <div class="fixed top-[52px] w-[260px] left-[30%] z-[200] rounded-[8px] bg-white shadow overflow-hidden create__project" :style="{top: top, left: left}">
        <div class="flex flex-col max-h-[calc(100vh-70px)]" v-if="!loading">

            <!-- Sticky header -->
            <div class="flex items-center justify-between gap-1 py-3 px-3 sticky top-0 bg-white z-10">
                <div class="flex"></div>
                <div class="flex text-center">
                    {{ $t('Create Project') }}
                </div>
                <div @click="$emit('createProject')" class="flex hover:bg-gray-200 cursor-pointer rounded w-7 h-7 justify-center items-center">
                    <icon class="w-4 h-4" name="close" />
                </div>
            </div>

            <!-- Scrollable body -->
            <div class="flex flex-col gap-3 overflow-y-auto px-3 pb-3">
                <div class="flex justify-center">
                    <div class="w-[70%] h-[100px] p-3 flex rounded justify-center" :style="{backgroundImage: 'url('+project.color.image+')', backgroundColor: project.color.bg}">
                        <img src="/images/board.svg" class="w-auto max-h-full" alt="Board" />
                    </div>
                </div>
                <div class="flex">
                    <label class=" flex flex-col">
                        <div class="title mb-2">{{ $t('Background') }}</div>
                        <div class="color__list">
                            <ul class="grid grid-cols-5 gap-2.5 auto-rows-max">
                                <li v-for="color in selected_backgrounds" :key="color.id" class="flex justify-center">
                                    <button @click="project.color = color" class="w-10 h-8 flex items-center justify-center rounded transition-opacity hover:opacity-80" :style="{backgroundImage: 'url('+color.image+')', backgroundColor: color.bg}">
                                        <icon v-if="project.color.id === color.id" name="tick_check" class="text-white w-4 h-4" />
                                    </button>
                                </li>
                                <li v-if="selected_backgrounds.length < backgrounds.length" class="flex justify-center">
                                    <button @click="showAllBackgrounds()" class="w-10 h-8 flex items-center justify-center rounded bg-black hover:bg-gray-800 transition-colors" type="button">
                                        <span class="text-white text-xs font-medium">more</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </label>
                </div>
                <div class="flex">
                    <label class="w-full flex flex-col text-left">
                        <div>{{ $t('Project name') }} *</div>
                        <input v-model="project.title" class="rounded border" type="text" required="" aria-required="true" autocomplete="off">
                    </label>
                </div>
                <div class="flex">
                    <label class="flex flex-col w-full">
                        <div>{{ $t('Workspace') }}</div>
                        <select-input v-model="project.workspace_id" class=" mr-2 w-full">
                            <option v-for="(workspace, wi) in workspaces" :key="wi" :value="workspace.id">{{ workspace.name }}</option>
                        </select-input>
                    </label>
                </div>
                <div class="flex">
                    <div class="flex items-center h-5">
                        <input id="helper-checkbox" v-model="project.is_private" true-value="1" false-value="0" aria-describedby="helper-checkbox-text" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                    </div>
                    <div class="ms-1 text-sm">
                        <label for="helper-checkbox" class="font-medium text-[13px] text-gray-900 dark:text-gray-300">Visible tasks for assigned people <small>(Enabling this the tasks will be visible only for the admin and assigned people)</small></label>
                    </div>
                </div>
                <div class="flex">
                    <label class="w-full flex flex-col">
                        <div>{{ $t('Project Details') }} <small>({{ $t('optional') }})</small></div>
                        <textarea v-model="project.description" class="rounded border" type="text" required="" aria-required="true" autocomplete="off" />
                    </label>
                </div>
            </div>

            <!-- Sticky footer with Create button -->
            <div class="flex px-3 py-3 sticky bottom-0 bg-white z-10 border-t border-gray-100">
                <button class="bg-indigo-600 w-full text-white p-[9px] rounded disabled:opacity-50" :disabled="!project.title" @click="createProject()">
                    {{ $t('Create') }}</button>
            </div>
        </div>

        <!-- Styled alert modal, replaces window.alert -->
        <div v-if="showAlert" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
            <div class="bg-white rounded-[8px] shadow-lg w-[280px] p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="font-medium text-[14px] text-gray-900">{{ $t('Notice') }}</div>
                    <div @click="closeAlert()" class="flex hover:bg-gray-200 cursor-pointer rounded w-6 h-6 justify-center items-center">
                        <icon class="w-3 h-3" name="close" />
                    </div>
                </div>
                <div class="text-[13px] text-gray-700">{{ alertMessage }}</div>
                <button class="bg-indigo-600 w-full text-white p-[8px] rounded text-sm" @click="closeAlert()">
                    {{ $t('OK') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import SelectInput from '@/Shared/SelectInput.vue'
    import Icon from '@/Shared/Icon.vue'
    import axios from 'axios'
    export default {
        name: "create-project",
        props: {
            top: {
                required: false,
                default: '50px'
            },
            left: {
                required: false,
                default: '390px'
            },
        },
        components: { SelectInput, Icon },
        data() {
            return {
                project: {},
                loading: true,
                workspaces: [],
                backgrounds: [],
                selected_backgrounds: [],
                showAlert: false,
                alertMessage: ''
            }
        },
        methods: {
            async getData(){
                const workspaceResp = await axios.get(this.route('json.workspaces.all'));
                this.workspaces = workspaceResp.data;
                const backgroundResp = await axios.get(this.route('json.backgrounds.all'));
                this.backgrounds = backgroundResp.data;
                this.project.color = this.backgrounds[0]
                this.selected_backgrounds = this.backgrounds.slice(0, 9)
                this.loading = false;
                if(this.$page.props.workspace || this.$page.props.project){
                    this.project.workspace_id = this.$page.props.workspace ? this.$page.props.workspace.id : this.$page.props.project? this.$page.props.project.workspace_id : '';
                }
                if(!this.workspaces.length){
                    this.openAlert('You must need to create/join a workspace first.')
                }
            },
            showAllBackgrounds(){
                this.selected_backgrounds = this.backgrounds;
            },
            openAlert(message){
                this.alertMessage = message;
                this.showAlert = true;
            },
            closeAlert(){
                this.showAlert = false;
                this.$emit('createProject')
            },
            createProject(){
                const project = { ...this.project }
                project.background_id = project.color.id;
                delete project.color;
                axios.post(this.route('json.project.create'), project).then((response) => {
                    if(response.data){
                        window.location = this.route('projects.view.board', response.data.slug || response.data.id);
                    }
                });
            }
        },
        created() {
            this.getData();
        },
    }
</script>