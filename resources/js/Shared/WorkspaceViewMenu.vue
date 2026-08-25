<template>
    <div class="project__view__menu w-full p-2 text-sm flex justify-first items-center">
        <div class="inline-flex w-full flex-wrap items-center">
            <div class="view__menus flex items-center flex-start gap-1 flex-wrap lg:flex-nowrap">
                <h2 class="text-lg font-bold hover:bg-[#a6c5e229] rounded px-3 mr-1 py-1">{{ workspace.name }}</h2>

                <Link
                    v-for="(option, option_index) in options"
                    class="flex py-2 px-3 items-center cursor-pointer capitalize rounded"
                    :class="{ active: view === option.slug }"
                    :href="route('workspace.view.' + option.slug, workspace.slug || workspace.id)"
                >
                    <icon :name="icons[option_index]" class="w-4 fill-[#ffffff] h-4 mr-[5px]" />
                    {{ $t(option.name) }}
                </Link>
            </div>
            <div class="flex items-center flex-start gap-1 ml-auto view__menus">
                <button
                    v-if="['board', 'table'].includes(view)"
                    class="flex pl-4 pr-2 items-center __filter cursor-pointer capitalize rounded hover:bg-[#a6c5e229]"
                    @click="$emit('filterToggle')"
                    :class="{ active: findFilters() }"
                >
                    <icon name="filter" class="w-4 fill-[#ffffff] h-4 mr-[5px]" />
                    <span>{{ $t('Filter') }} </span>
                    <span class="filter_clear" @click="clearFilter($event)"
                        >{{ $t('Clear All') }} <icon name="close" class="w-4 h-4"
                    /></span>
                </button>
                <div
                    v-if="['board', 'table'].includes(view)"
                    class="relative"
                    v-click-outside="() => (showMenu = false)"
                    ref="menuContainer"
                >
                    <button
                        @click="toggleMenu"
                        class="flex px-2 h-8 items-center cursor-pointer capitalize rounded hover:bg-[#a6c5e229] transition-colors"
                        :class="{ 'bg-[#a6c5e229]': showMenu }"
                    >
                        <icon name="more-h" class="w-6 fill-[#ffffff] h-6" />
                    </button>
                    <teleport to="body">
                        <div
                            v-if="showMenu"
                            class="fixed bg-white rounded-xl shadow-2xl border border-gray-200/60 overflow-hidden z-[99999] backdrop-blur-xl"
                            :style="dropdownStyle"
                            @click.stop
                        >
                            <div class="py-2 w-56">
                                <button
                                    @click="exportTasks"
                                    class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"
                                >
                                    <div
                                        class="p-1.5 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors"
                                    >
                                        <icon name="download" class="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span>{{ $t('Export Tasks') }}</span>
                                </button>
                                <button
                                    @click="showArchivedTasks"
                                    class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"
                                >
                                    <div
                                        class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors"
                                    >
                                        <icon name="archive" class="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>{{ $t('Archived Tasks') }}</span>
                                </button>
                                <button
                                    @click="showArchivedBoards"
                                    class="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group"
                                >
                                    <div
                                        class="p-1.5 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors"
                                    >
                                        <icon name="archive" class="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>{{ $t('Archived Boards') }}</span>
                                </button>
                            </div>
                        </div>
                    </teleport>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Icon from '@/Shared/Icon.vue';
import { Link } from '@inertiajs/vue3';

export default {
    name: 'workspace-view-menu',
    props: {
        workspace: Object,
        filters: { required: false },
        view: {
            required: false,
        },
    },
    components: { Icon, Link },
    data() {
        return {
            icons: ['board', 'calendar', 'timeline', 'table'],
            options: [
                { name: 'Board', slug: 'board' },
                { name: 'List', slug: 'table' },
                { name: 'Calendar', slug: 'calendar' },
                { name: 'Timeline', slug: 'timeline' },
            ],
            showMenu: false,
            dropdownPosition: { top: '0px', right: '0px' },
        };
    },
    computed: {
        dropdownStyle() {
            return this.dropdownPosition;
        },
    },
    watch: {
        showMenu(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.updateDropdownPosition();
                });
            }
        },
    },
    methods: {
        clearFilter(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$emit('fClear', true);
        },
        findFilters() {
            const filters = Object.keys(this.filters || {});
            return filters.some((r) => ['due', 'label', 'user', 'project'].includes(r));
        },
        exportTasks() {
            this.showMenu = false;
            // Emit event for parent to handle export
            this.$emit('exportTasks');
        },
        showArchivedTasks() {
            this.showMenu = false;
            this.$emit('showArchived', 'tasks');
        },
        showArchivedBoards() {
            this.showMenu = false;
            this.$emit('showArchived', 'boards');
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
            if (this.showMenu) {
                this.$nextTick(() => {
                    this.updateDropdownPosition();
                });
            }
        },
        updateDropdownPosition() {
            if (this.$refs.menuContainer) {
                const rect = this.$refs.menuContainer.getBoundingClientRect();
                this.dropdownPosition = {
                    top: `${rect.bottom + 8}px`,
                    right: `${window.innerWidth - rect.right}px`,
                };
            }
        },
    },
};
</script>
