<template>
    <div ref="root" class="filter-select" :class="{ 'is-open': open }">
        <button type="button" class="filter-select__trigger" :aria-expanded="open" :disabled="disabled" @click="toggle">
            <icon v-if="icon" :name="icon" class="filter-select__icon" />
            <span class="filter-select__value" :class="{ 'is-placeholder': !selectedValues.length }">
                {{ triggerLabel }}
            </span>
            <span v-if="multiple && selectedValues.length > 1" class="filter-select__badge">{{
                selectedValues.length
            }}</span>
            <icon name="cheveron-down" class="filter-select__caret" :class="{ 'is-flipped': open }" />
        </button>

        <teleport to="body">
            <transition name="filter-select-fade">
                <div v-if="open" ref="panel" class="filter-select__panel" :style="panelStyle">
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
                        <li v-if="showAll">
                            <button
                                type="button"
                                class="filter-select__option"
                                :class="{ 'is-active': !selectedValues.length }"
                                @click="pick(null)"
                            >
                                <span
                                    v-if="multiple"
                                    class="filter-select__box"
                                    :class="{ 'is-checked': !selectedValues.length }"
                                >
                                    <icon v-if="!selectedValues.length" name="check" class="h-2.5 w-2.5" />
                                </span>
                                <span class="truncate">{{ allLabel }}</span>
                                <icon v-if="!multiple && !selectedValues.length" name="check" class="h-3.5 w-3.5" />
                            </button>
                        </li>
                        <li v-for="option in filtered" :key="option.value">
                            <button
                                type="button"
                                class="filter-select__option"
                                :class="{ 'is-active': isSelected(option.value) }"
                                @click="pick(option.value)"
                            >
                                <span
                                    v-if="multiple"
                                    class="filter-select__box"
                                    :class="{ 'is-checked': isSelected(option.value) }"
                                >
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
        </teleport>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';

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
        /** Filter bars want an "All" row; form selects supply their own blank option. */
        showAll: { type: Boolean, default: true },
        disabled: { type: Boolean, default: false },
        countLabel: { type: String, default: '' },
        clearLabel: { type: String, default: 'Clear' },
        /** Show the search box automatically once the list gets long. */
        searchAfter: { type: Number, default: 8 },
    },
    emits: ['update:modelValue'],
    data() {
        return { open: false, query: '', panelStyle: {} };
    },
    computed: {
        searchable() {
            return this.options.length > this.searchAfter;
        },
        /** Current selection as an array of strings, whatever the mode. */
        selectedValues() {
            if (this.modelValue === null || this.modelValue === undefined || this.modelValue === '') return [];
            return String(this.modelValue).split(',').filter(Boolean);
        },
        triggerLabel() {
            if (!this.selectedValues.length) return this.placeholder || this.allLabel;
            const first = this.options.find((o) => String(o.value) === this.selectedValues[0]);
            // A blank <option> carries no label; fall back rather than showing nothing.
            return first && first.label ? first.label : this.placeholder || this.allLabel;
        },
        filtered() {
            const q = this.query.trim().toLowerCase();
            if (!q) return this.options;
            return this.options.filter((o) => String(o.label).toLowerCase().includes(q));
        },
    },
    methods: {
        toggle() {
            if (this.disabled) return;
            this.open = !this.open;

            if (this.open) {
                this.positionPanel();
                // The panel is fixed to the viewport, so it has to follow the
                // trigger while anything behind it moves.
                window.addEventListener('scroll', this.positionPanel, true);
                window.addEventListener('resize', this.positionPanel);
                if (this.searchable) {
                    this.$nextTick(() => this.$refs.search && this.$refs.search.focus());
                }
            } else {
                this.stopTracking();
            }
        },
        close() {
            this.open = false;
            this.query = '';
            this.stopTracking();
        },
        stopTracking() {
            window.removeEventListener('scroll', this.positionPanel, true);
            window.removeEventListener('resize', this.positionPanel);
        },
        /**
         * The panel is teleported to <body> and positioned from the trigger's
         * box. Rendering it inside the component meant any ancestor with
         * `overflow: hidden` - a rounded form card, a scroll pane - cut the
         * options off, and the panel could not match the trigger's width.
         */
        positionPanel() {
            const trigger = this.$refs.root && this.$refs.root.querySelector('.filter-select__trigger');
            if (!trigger) return;

            const rect = trigger.getBoundingClientRect();
            const gap = 6;
            const below = window.innerHeight - rect.bottom - gap;
            const above = rect.top - gap;
            // Flip above the trigger when there is more room up there.
            const flip = below < 220 && above > below;

            this.panelStyle = {
                position: 'fixed',
                left: `${Math.round(rect.left)}px`,
                width: `${Math.round(rect.width)}px`,
                ...(flip
                    ? { bottom: `${Math.round(window.innerHeight - rect.top + gap)}px` }
                    : { top: `${Math.round(rect.bottom + gap)}px` }),
                '--filter-select-max-h': `${Math.max(160, Math.round((flip ? above : below) - 12))}px`,
            };
        },
        isSelected(value) {
            return this.selectedValues.includes(String(value));
        },
        pick(value) {
            if (value === null) {
                this.$emit('update:modelValue', null);
                this.close();
                return;
            }

            if (!this.multiple) {
                const option = this.options.find((o) => String(o.value) === String(value));
                this.$emit('update:modelValue', option ? option.value : value);
                this.close();
                return;
            }

            // Multi-select keeps the panel open so several can be ticked.
            const next = this.isSelected(value)
                ? this.selectedValues.filter((v) => v !== String(value))
                : [...this.selectedValues, String(value)];
            this.$emit('update:modelValue', next.length ? next.join(',') : null);
        },
        onDocumentClick(e) {
            if (!this.open) return;
            const inTrigger = this.$refs.root && this.$refs.root.contains(e.target);
            // The panel lives on <body> now, so it is not inside root any more.
            const inPanel = this.$refs.panel && this.$refs.panel.contains(e.target);
            if (!inTrigger && !inPanel) this.close();
        },
        onKeydown(e) {
            if (e.key === 'Escape') this.close();
        },
    },
    mounted() {
        // Handled here rather than with v-click-outside: that directive is only
        // registered in app.js, so it would warn during the SSR build.
        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('keydown', this.onKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('keydown', this.onKeydown);
        this.stopTracking();
    },
};
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
    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
}

.filter-select__trigger:hover {
    border-color: #c7d2fe;
}

/* Form context (SelectInput). Filter bars want a compact pill sized to its
   label; a field in a form has to fill its column and line up with the
   .form-input beside it. */
.filter-select--block .filter-select__trigger {
    width: 100%;
    min-width: 0;
    max-width: none;
    height: 2.3rem;
    padding: 3px 10px;
    border-radius: 0.25rem;
    border-color: #d1d5db;
    font-size: 15px;
    font-weight: 400;
    color: #1f2937;
}

@media (max-width: 640px) {
    .filter-select--block .filter-select__trigger {
        height: 2.6rem;
        font-size: 16px;
    }
}

.filter-select--block.error .filter-select__trigger {
    border-color: #ef4444;
}

.filter-select__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.is-open .filter-select__trigger {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
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
    transition: transform 0.2s ease;
}

.filter-select__caret.is-flipped {
    transform: rotate(180deg);
}

.filter-select__panel {
    /* position / left / top / width are set inline from the trigger's box. */
    position: fixed;
    /* Above the task dialog, which sits at 9999. The panel is teleported to
       <body>, so it has to out-rank whatever it is opened from. */
    z-index: 10000;
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
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
    max-height: min(16rem, var(--filter-select-max-h, 16rem));
    overflow-y: auto;
    padding: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
}
.filter-select__list::-webkit-scrollbar {
    width: 8px;
}
.filter-select__list::-webkit-scrollbar-track {
    background: transparent;
}
.filter-select__list::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.28);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
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
    transition:
        background-color 0.12s ease,
        color 0.12s ease;
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
    transition:
        opacity 0.12s ease,
        transform 0.12s ease;
}

.filter-select-fade-enter-from,
.filter-select-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
