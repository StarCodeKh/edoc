<template>
    <div ref="root" class="filter-select" :class="{ 'is-open': open }">
        <button type="button" class="filter-select__trigger" :aria-expanded="open" @click="toggle">
            <icon v-if="icon" :name="icon" class="filter-select__icon" />
            <span class="filter-select__value" :class="{ 'is-placeholder': !selectedValues.length }">
                {{ triggerLabel }}
            </span>
            <span v-if="multiple && selectedValues.length > 1" class="filter-select__badge">{{ selectedValues.length }}</span>
            <icon name="cheveron-down" class="filter-select__caret" :class="{ 'is-flipped': open }" />
        </button>

        <transition name="filter-select-fade">
            <div v-if="open" class="filter-select__panel">
                <div v-if="searchable" class="filter-select__search">
                    <icon name="search" class="h-3.5 w-3.5 text-gray-400" />
                    <input
                        ref="search"
                        v-model="query"
                        type="text"
                        :placeholder="searchPlaceholder"
                        @keydown.esc.stop="close"
                    />
                </div>

                <ul class="filter-select__list">
                    <li>
                        <button type="button" class="filter-select__option" :class="{ 'is-active': !selectedValues.length }" @click="pick(null)">
                            <span v-if="multiple" class="filter-select__box" :class="{ 'is-checked': !selectedValues.length }">
                                <icon v-if="!selectedValues.length" name="check" class="h-2.5 w-2.5" />
                            </span>
                            <span class="truncate">{{ allLabel }}</span>
                            <icon v-if="!multiple && !selectedValues.length" name="check" class="h-3.5 w-3.5" />
                        </button>
                    </li>
                    <li v-for="option in filtered" :key="option.value">
                        <button type="button" class="filter-select__option" :class="{ 'is-active': isSelected(option.value) }" @click="pick(option.value)">
                            <span v-if="multiple" class="filter-select__box" :class="{ 'is-checked': isSelected(option.value) }">
                                <icon v-if="isSelected(option.value)" name="check" class="h-2.5 w-2.5" />
                            </span>
                            <span class="truncate">{{ option.label }}</span>
                            <icon v-if="!multiple && isSelected(option.value)" name="check" class="h-3.5 w-3.5" />
                        </button>
                    </li>
                    <li v-if="searchable && !filtered.length" class="filter-select__empty">
                        {{ emptyLabel }}
                    </li>
                </ul>

                <div v-if="multiple && selectedValues.length" class="filter-select__footer">
                    <span>{{ countLabel }}</span>
                    <button type="button" @click="pick(null)">{{ clearLabel }}</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue'

/**
 * Styled replacement for a native <select> in filter bars. Native selects
 * render as an OS-drawn list that ignores the app's styling entirely, which
 * looks especially out of place with long Khmer option lists.
 */
export default {
    name: 'FilterSelect',
    components: { Icon },
    props: {
        modelValue: { type: [String, Number, null], default: null },
        /** [{ value, label }] */
        options: { type: Array, default: () => [] },
        placeholder: { type: String, default: '' },
        allLabel: { type: String, default: 'All' },
        searchPlaceholder: { type: String, default: 'Search…' },
        emptyLabel: { type: String, default: 'No matches' },
        icon: { type: String, default: '' },
        /** Allow several options at once. modelValue becomes a comma-joined string. */
        multiple: { type: Boolean, default: false },
        countLabel: { type: String, default: '' },
        clearLabel: { type: String, default: 'Clear' },
        /** Show the search box automatically once the list gets long. */
        searchAfter: { type: Number, default: 8 },
    },
    emits: ['update:modelValue'],
    data() {
        return { open: false, query: '' }
    },
    computed: {
        searchable() {
            return this.options.length > this.searchAfter
        },
        /** Current selection as an array of strings, whatever the mode. */
        selectedValues() {
            if (this.modelValue === null || this.modelValue === undefined || this.modelValue === '') return []
            return String(this.modelValue).split(',').filter(Boolean)
        },
        triggerLabel() {
            if (!this.selectedValues.length) return this.placeholder || this.allLabel
            const first = this.options.find((o) => String(o.value) === this.selectedValues[0])
            return first ? first.label : this.placeholder || this.allLabel
        },
        filtered() {
            const q = this.query.trim().toLowerCase()
            if (!q) return this.options
            return this.options.filter((o) => String(o.label).toLowerCase().includes(q))
        },
    },
    methods: {
        toggle() {
            this.open = !this.open
            if (this.open && this.searchable) {
                this.$nextTick(() => this.$refs.search && this.$refs.search.focus())
            }
        },
        close() {
            this.open = false
            this.query = ''
        },
        isSelected(value) {
            return this.selectedValues.includes(String(value))
        },
        pick(value) {
            if (value === null) {
                this.$emit('update:modelValue', null)
                this.close()
                return
            }

            if (!this.multiple) {
                this.$emit('update:modelValue', String(value))
                this.close()
                return
            }

            // Multi-select keeps the panel open so several can be ticked.
            const next = this.isSelected(value)
                ? this.selectedValues.filter((v) => v !== String(value))
                : [...this.selectedValues, String(value)]
            this.$emit('update:modelValue', next.length ? next.join(',') : null)
        },
        onDocumentClick(e) {
            if (this.open && this.$refs.root && !this.$refs.root.contains(e.target)) this.close()
        },
        onKeydown(e) {
            if (e.key === 'Escape') this.close()
        },
    },
    mounted() {
        // Handled here rather than with v-click-outside: that directive is only
        // registered in app.js, so it would warn during the SSR build.
        document.addEventListener('click', this.onDocumentClick)
        document.addEventListener('keydown', this.onKeydown)
    },
    beforeUnmount() {
        document.removeEventListener('click', this.onDocumentClick)
        document.removeEventListener('keydown', this.onKeydown)
    },
}
</script>

<style scoped>
.filter-select {
    position: relative;
}

.filter-select__trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 11rem;
    max-width: 18rem;
    padding: 7px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    transition: border-color .15s ease, box-shadow .15s ease;
}

.filter-select__trigger:hover {
    border-color: #c7d2fe;
}

.is-open .filter-select__trigger {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}

.filter-select__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #9ca3af;
}

.filter-select__option .truncate {
    flex: 1;
}

.filter-select__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.filter-select__value.is-placeholder {
    color: #9ca3af;
    font-weight: 500;
}

.filter-select__caret {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    fill: #9ca3af;
    transition: transform .2s ease;
}

.filter-select__caret.is-flipped {
    transform: rotate(180deg);
}

.filter-select__panel {
    position: absolute;
    z-index: 50;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    max-width: 22rem;
    background: #fff;
    border: 1px solid rgba(15, 23, 42, .08);
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, .16);
    overflow: hidden;
}

.filter-select__search {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
}

.filter-select__search input {
    flex: 1;
    border: 0;
    padding: 0;
    font-size: 12px;
    background: transparent;
}

.filter-select__search input:focus {
    outline: none;
    box-shadow: none;
}

.filter-select__list {
    max-height: 16rem;
    overflow-y: auto;
    padding: 6px;
}

.filter-select__option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 9px;
    border-radius: 8px;
    font-size: 12.5px;
    line-height: 1.6;
    color: #1f2937;
    text-align: left;
    transition: background-color .12s ease, color .12s ease;
}

.filter-select__option:hover {
    background: #eef2ff;
    color: #4338ca;
}

.filter-select__option.is-active {
    background: #eef2ff;
    color: #4338ca;
    font-weight: 600;
}

.filter-select__box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border: 1.5px solid #cbd5e1;
    border-radius: 4px;
    color: #fff;
}

.filter-select__box.is-checked {
    background: #4f46e5;
    border-color: #4f46e5;
}

.filter-select__badge {
    flex-shrink: 0;
    min-width: 18px;
    padding: 1px 5px;
    border-radius: 9999px;
    background: #4f46e5;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
}

.filter-select__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid #f1f5f9;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
}

.filter-select__footer button {
    color: #4f46e5;
}

.filter-select__footer button:hover {
    text-decoration: underline;
}

.filter-select__empty {
    padding: 12px 10px;
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
}

.filter-select-fade-enter-active,
.filter-select-fade-leave-active {
    transition: opacity .12s ease, transform .12s ease;
}

.filter-select-fade-enter-from,
.filter-select-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
