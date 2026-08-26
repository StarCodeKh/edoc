<template>
    <!-- Rendered on the body and placed from the trigger's own position, so it
         is not at the mercy of whatever it was declared inside: the sidebar is
         a 240px scroll box that clips its children, and the workspace headers
         are their own stacking contexts. It follows the trigger on scroll and
         flips to stay on screen. On a phone it is a sheet at the bottom
         instead, where there is room for it. -->
    <Teleport to="body">
        <!-- Phone only: the page behind is dimmed so the sheet reads as the one
             thing in front of you, rather than a card dropped on the layout. -->
        <div
            class="invite_w_member__scrim fixed inset-0 z-[9998] bg-black/50 sm:hidden"
            @click="$emit('inviteMember')"
        ></div>
        <div
            ref="panel"
            :style="panel_style"
            class="invite_w_member fixed z-[9999] w-[320px] max-w-[calc(100vw-24px)] rounded-2xl bg-white shadow-2xl border border-gray-200/60 overflow-hidden text-gray-900 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-auto max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 dark:bg-gray-800 dark:border-white/10 dark:text-gray-100"
        >
            <!-- Grab handle: the sheet is flush with the bottom of the screen,
                 and this is what says so. -->
            <div class="hidden max-sm:flex justify-center pt-2.5 pb-0.5 bg-gradient-to-r from-indigo-600 to-purple-600">
                <span class="h-1 w-10 rounded-full bg-white/50"></span>
            </div>
            <div
                class="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
                <div class="flex flex-col min-w-0">
                    <span class="font-semibold text-sm truncate">{{ $t('Invite Workspace') }}</span>
                    <span class="text-[11px] text-white/80"> {{ workspace_users.length }} {{ $t('selected') }} </span>
                </div>
                <button
                    type="button"
                    @click="$emit('inviteMember')"
                    class="shrink-0 flex w-8 h-8 justify-center items-center rounded-lg hover:bg-white/20 transition-colors"
                    :aria-label="$t('Close')"
                >
                    <icon class="w-4 h-4 text-white fill-white" name="close" />
                </button>
            </div>

            <div class="p-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <icon name="search" class="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        id="i_w_m_s_u"
                        ref="search"
                        name="user_search"
                        autocomplete="off"
                        v-model="user_search"
                        class="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-gray-50 transition-all hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                        :placeholder="$t('Search User')"
                    />
                </div>

                <div
                    v-if="loading"
                    class="flex h-48 max-sm:h-[45vh] items-center justify-center gap-2 text-sm text-gray-500"
                >
                    <icon name="spinner" class="w-4 h-4 animate-spin" />
                    <span>{{ $t('Loading...') }}</span>
                </div>

                <ul
                    v-else
                    class="mt-2 flex flex-col gap-0.5 h-48 max-h-48 overflow-y-auto overscroll-contain pr-1 max-sm:h-auto max-sm:max-h-[50vh]"
                >
                    <li v-for="(userObject, user_index) in filtered_users" :key="userObject.id">
                        <label
                            :for="'uid_' + user_index"
                            class="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors"
                            :class="
                                isMember(userObject.id)
                                    ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/10'
                            "
                        >
                            <input
                                :id="'uid_' + user_index"
                                class="w-4 h-4 shrink-0 accent-indigo-600 cursor-pointer"
                                type="checkbox"
                                :checked="isMember(userObject.id)"
                                @change="inviteMember($event.target.checked, userObject.id, 'normal')"
                            />
                            <img
                                :aria-label="userObject.name"
                                :alt="userObject.name"
                                class="w-7 h-7 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                                :src="userObject.photo_path || '/images/user.svg'"
                            />
                            <span class="flex flex-1 min-w-0 flex-col leading-tight">
                                <span class="truncate text-sm" :title="userObject.name">{{ userObject.name }}</span>
                                <span
                                    v-if="userObject.title"
                                    class="truncate text-[11px] text-gray-500 dark:text-gray-400"
                                    :title="userObject.title"
                                    >{{ userObject.title }}</span
                                >
                            </span>
                            <icon
                                v-if="isMember(userObject.id)"
                                name="check"
                                class="w-4 h-4 shrink-0 text-indigo-600 fill-indigo-600 dark:text-indigo-300 dark:fill-indigo-300"
                            />
                        </label>
                    </li>
                    <li v-if="!filtered_users.length" class="py-10 text-center text-sm text-gray-500">
                        {{ $t('No item found!') }}
                    </li>
                </ul>
            </div>
        </div>
    </Teleport>
</template>

<script>
import SelectInput from '@/Shared/SelectInput.vue';
import Icon from '@/Shared/Icon.vue';
import axios from 'axios';

/* Below this the panel is a sheet at the bottom of the screen and CSS places
   it; above it, it is pinned to the trigger. Matches Tailwind's sm breakpoint. */
const SHEET_BREAKPOINT = 640;
const GAP = 12;
const EDGE = 8;

export default {
    name: 'invite-workspace-member',
    props: {
        workspace: Object,
        /** The element the panel hangs off - usually the button that opened it. */
        anchor: {
            required: false,
            default: null,
        },
        /**
         * 'bottom-end' puts it under the trigger, right edges aligned - what a
         * button in a page header wants. 'right-start' puts it beside the
         * trigger, top edges aligned - what a row in the sidebar wants. Either
         * one flips or slides to stay on screen.
         */
        placement: {
            type: String,
            required: false,
            default: 'bottom-end',
        },
    },
    components: { SelectInput, Icon },
    data() {
        return {
            project: {},
            loading: true,
            user_search: '',
            role: '',
            workspaces: [],
            users: [],
            workspace_users: [],
            backgrounds: [],
            position: null,
        };
    },
    computed: {
        /** Both sides lowercased - typing a capital used to match nothing. */
        filtered_users() {
            const needle = this.user_search.trim().toLowerCase();
            if (!needle) return this.users;
            return this.users.filter(
                (u) => u.name.toLowerCase().indexOf(needle) > -1 || (u.title || '').toLowerCase().indexOf(needle) > -1
            );
        },
        panel_style() {
            return this.position || {};
        },
    },
    methods: {
        isMember(id) {
            return this.workspace_users.includes(id);
        },
        inviteMember(checked, id, role) {
            axios
                .post(this.route('json.workspace.member.add'), { workspace_id: this.workspace.id, user_id: id, role })
                .then((response) => {
                    if (response.data) {
                        if (checked) {
                            this.workspace_users.push(id);
                        } else {
                            const findIndex = this.workspace_users.findIndex((a) => a === id);
                            if (findIndex > -1) {
                                this.workspace_users.splice(findIndex, 1);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        team__members() {
            return this.workspace_users.map((item) => item.id);
        },

        place() {
            const panel = this.$refs.panel;
            const anchor = this.anchor;

            // Sheet mode, or nothing to hang off: CSS has it covered.
            if (!panel || !anchor || window.innerWidth < SHEET_BREAKPOINT) {
                this.position = null;
                return;
            }

            const a = anchor.getBoundingClientRect();
            const w = panel.offsetWidth;
            const h = panel.offsetHeight;
            let left;
            let top;

            if (this.placement === 'right-start') {
                left = a.right + GAP;
                top = a.top;
                // No room to the right - the sidebar is narrow but the window
                // may be too - so it goes to the left of the trigger instead.
                if (left + w > window.innerWidth - EDGE) left = a.left - GAP - w;
            } else {
                left = a.right - w;
                top = a.bottom + GAP;
                // Not enough room below: sit above the trigger.
                if (top + h > window.innerHeight - EDGE && a.top - GAP - h > EDGE) top = a.top - GAP - h;
            }

            this.position = {
                left: Math.min(Math.max(EDGE, left), Math.max(EDGE, window.innerWidth - w - EDGE)) + 'px',
                top: Math.min(Math.max(EDGE, top), Math.max(EDGE, window.innerHeight - h - EDGE)) + 'px',
                right: 'auto',
                bottom: 'auto',
            };
        },

        closeOnEscape(e) {
            if (e.key === 'Escape') this.$emit('inviteMember');
        },
        /**
         * The panel lives on the body, so a click-outside directive on the
         * trigger's wrapper would count clicks inside the panel as outside.
         * Clicks on the trigger are left alone - it closes itself by toggling.
         */
        closeOnOutsideClick(e) {
            const panel = this.$refs.panel;
            if (!panel || panel.contains(e.target)) return;
            if (this.anchor && this.anchor.contains(e.target)) return;
            this.$emit('inviteMember');
        },

        async getData() {
            const dataResponse = await axios.get(this.route('json.workspaces.users.other', this.workspace.id));
            const data = dataResponse.data;
            this.users = data.users;
            this.workspace_users = data.workspace_users;
            this.loading = false;
            // The list replaces the spinner, so the panel changed height.
            this.$nextTick(this.place);
        },
    },
    created() {
        this.getData();
    },
    mounted() {
        this.$nextTick(() => {
            this.place();
            if (this.$refs.search) this.$refs.search.focus();
        });
        document.addEventListener('keydown', this.closeOnEscape);
        document.addEventListener('mousedown', this.closeOnOutsideClick);
        window.addEventListener('resize', this.place);
        // Capture: the trigger may sit in any of the app's scroll boxes.
        window.addEventListener('scroll', this.place, true);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.closeOnEscape);
        document.removeEventListener('mousedown', this.closeOnOutsideClick);
        window.removeEventListener('resize', this.place);
        window.removeEventListener('scroll', this.place, true);
    },
};
</script>

<style scoped>
.invite_w_member {
    animation: invite-panel-in 140ms ease-out;
}

@keyframes invite-panel-in {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
