<template>
    <div :class="$attrs.class">
        <label v-if="label" class="form-label" :for="id">{{ label }}</label>

        <!-- Escape hatch: anything the vnode parsing can't express stays native. -->
        <select
            v-if="native"
            :id="id"
            ref="input"
            v-model="selected"
            v-bind="{ ...$attrs, class: null }"
            class="form-select"
            :class="{ error: error }"
            :required="required"
        >
            <slot />
        </select>

        <filter-select
            v-else
            v-model="selected"
            :options="parsedOptions"
            :show-all="false"
            :placeholder="placeholder"
            :disabled="$attrs.disabled !== undefined && $attrs.disabled !== false"
            :search-placeholder="searchPlaceholder"
            :class="{ error: error }"
            class="w-full filter-select--block"
        />

        <!-- Keeps native form validation and any name-based submission working. -->
        <input v-if="!native && required" type="hidden" :name="$attrs.name" :value="selected ?? ''" />

        <div v-if="error" class="form-error">{{ error }}</div>
    </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
import FilterSelect from '@/Shared/Components/FilterSelect.vue'

/**
 * Callers still write `<select-input><option :value="x">…</option></select-input>`;
 * the slotted options are read out of the vnode tree and handed to FilterSelect,
 * so every select in the app gets the same styled dropdown without touching a
 * single call site. Pass `native` to fall back to a real <select>.
 */
export default {
    inheritAttrs: false,
    components: { FilterSelect },
    props: {
        id: {
            type: String,
            default() {
                return `select-input-${uuid()}`
            },
        },
        error: String,
        label: String,
        placeholder: { type: String, default: '' },
        searchPlaceholder: { type: String, default: 'Search…' },
        native: { type: Boolean, default: false },
        required: {
            type: Boolean,
            default() {
                return false;
            }
        },
        modelValue: [String, Number, Boolean, null],
    },
    emits: ['update:modelValue'],
    data() {
        return {
            selected: this.modelValue,
        }
    },
    computed: {
        parsedOptions() {
            return this.flattenOptions(this.$slots.default ? this.$slots.default() : [])
        },
    },
    watch: {
        selected(selected) {
            this.$emit('update:modelValue', selected)
        },
        modelValue(value) {
            this.selected = value
        },
    },
    methods: {
        /**
         * Pull { value, label } out of slotted <option> vnodes. v-for produces a
         * Fragment whose children are the real options, hence the recursion.
         */
        flattenOptions(nodes, acc = []) {
            for (const node of nodes) {
                if (!node) continue

                // v-for normally yields a Fragment, but a slot can also hand back
                // a plain nested array before normalisation.
                if (Array.isArray(node)) {
                    this.flattenOptions(node, acc)
                    continue
                }

                if (node.type === 'option') {
                    const value = node.props ? node.props.value : undefined
                    acc.push({
                        value: value === undefined ? null : value,
                        label: this.nodeText(node.children),
                    })
                    continue
                }

                if (Array.isArray(node.children)) {
                    this.flattenOptions(node.children, acc)
                }
            }
            return acc
        },
        nodeText(children) {
            if (children == null) return ''
            if (typeof children === 'string') return children.trim()
            if (Array.isArray(children)) return children.map((c) => this.nodeText(c && c.children !== undefined ? c.children : c)).join('').trim()
            if (typeof children === 'object' && children.default) return this.nodeText(children.default())
            return String(children).trim()
        },
        focus() {
            if (this.$refs.input) this.$refs.input.focus()
        },
        select() {
            if (this.$refs.input) this.$refs.input.select()
        },
    },
}
</script>
