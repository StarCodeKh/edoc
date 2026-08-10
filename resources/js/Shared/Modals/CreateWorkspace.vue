<template>
    <div class="fixed top-[52px] w-[260px] left-[30%] z-[200] rounded-[8px] bg-white shadow overflow-hidden create__project" :style="{top: top, left: left}">
        <div class="flex gap-3 flex-col py-3 px-5" v-if="!loading">
            <div class="flex items-center justify-between gap-1">
                <div class="flex"></div>
                <div class="flex text-center">
                    {{ $t('Create Workspace') }}
                </div>
                <div @click="$emit('createWorkspace')" class="flex hover:bg-gray-200 cursor-pointer rounded w-7 h-7 justify-center items-center">
                    <icon class="w-4 h-4" name="close" />
                </div>
            </div>

            <div class="flex">
                <label class="w-full flex flex-col text-left">
                    <div>{{ $t('Workspace name') }} *</div>
                    <input v-model="workspace.name" class="rounded border" type="text" required="" aria-required="true" autocomplete="off">
                </label>
            </div>
            <div class="flex">
                <label class="flex flex-col w-full text-left">
                    <div>{{ $t('Workspace Type') }}</div>
                    <select-input v-model="workspace.type_id" class=" mr-2 w-full">
                        <option v-for="(type, ti) in types" :key="ti" :value="type.id">{{ type.name }}</option>
                    </select-input>
                </label>
            </div>
            <div class="flex">
                <label class="w-full flex flex-col text-left">
                    <div>{{ $t('Website') }} <small>({{ $t('optional') }})</small></div>
                    <input v-model="workspace.website" class="rounded border" type="text" autocomplete="off">
                </label>
            </div>
            <div class="flex">
                <label class="w-full flex flex-col text-left">
                    <div>{{ $t('Workspace Description') }} <small>({{ $t('optional') }})</small></div>
                    <textarea v-model="workspace.description" class="rounded border" autocomplete="off" />
                </label>
            </div>
            <div class="flex">
                <button class="bg-indigo-600 w-full text-white p-[9px] rounded disabled:opacity-50" :disabled="!workspace.name" @click="createWorkspace()">
                    {{ $t('Create') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
import SelectInput from '@/Shared/SelectInput.vue'
import Icon from '@/Shared/Icon.vue'
import axios from 'axios'
export default {
    name: "create-workspace",
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
    emits: {
        createWorkspace: null
    },
    data() {
        return {
            workspace: {},
            loading: false,
            workspaces: [],
            backgrounds: [],
            types: [],
            // types: ['Operation', 'Education', 'Marketing', 'Engineering-IT', 'Small Business', 'Other'],
        }
    },
    methods: {
        createWorkspace(){
            const workspace = { ...this.workspace }
            axios.post(this.route('json.workspace.create'), workspace).then((response) => {
                if(response.data){
                    window.location = this.route('workspace.view', response.data.slug || response.data.id);
                }
            });
        },
        getWorkspaceTypes(){
            axios.post(this.route('json.workspace.types.get')).then((response) => {
                if(response.data){
                    this.types = response.data.types
                }
            });
        }
    },
    created() {
        this.getWorkspaceTypes();
    },
}
</script>
