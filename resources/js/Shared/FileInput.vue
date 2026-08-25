<template>
    <div>
        <label v-if="label" class="form-label">{{ label }}</label>
        <div class="form-input p-0" :class="{ error: errors.length }">
            <input ref="file" type="file" :accept="accept" class="hidden" @change="change" />
            <div v-if="!modelValue" class="p-1">
                <button type="button" class="file-input__btn" @click="browse">{{ $t('Browse') }}</button>
            </div>
            <div v-else class="flex items-center justify-between p-2">
                <div class="flex-1 pr-1 truncate text-sm">
                    {{ modelValue.name }} <span class="text-xs opacity-60">({{ filesize(modelValue.size) }})</span>
                </div>
                <button type="button" class="file-input__btn" @click="remove">
                    {{ $t('Remove') }}
                </button>
            </div>
        </div>
        <div v-if="errors.length" class="form-error">{{ errors[0] }}</div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: File,
        label: String,
        accept: String,
        errors: {
            type: Array,
            default: () => [],
        },
    },
    emits: ['update:modelValue'],
    watch: {
        modelValue(value) {
            if (!value) {
                this.$refs.file.value = '';
            }
        },
    },
    methods: {
        filesize(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
        browse() {
            this.$refs.file.click();
        },
        change(e) {
            this.$emit('update:modelValue', e.target.files[0]);
        },
        remove() {
            this.$emit('update:modelValue', null);
        },
    },
};
</script>

<style scoped>
.file-input__btn {
    @apply px-3 py-1 text-xs font-medium rounded-md transition-colors;
    @apply bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200;
}
.dark .file-input__btn {
    @apply bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600;
}
</style>
