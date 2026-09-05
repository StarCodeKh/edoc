<template>
    <!--
        Teleported to <body> on purpose. Rendered in place, the overlay sat
        inside the page's scroll region next to a `position: sticky` aside, and
        any ancestor with overflow, a transform or its own stacking context
        could clip it or paint over it - the same trap FilterSelect documents.
        As a child of <body> it answers to nothing but the viewport.
    -->
    <teleport to="body">
        <div
            class="receipt-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 transition-all"
            role="dialog"
            aria-modal="true"
            @click.self="closeModal"
        >
            <div
                class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col"
            >
                <!-- Modern Action Buttons Bar (Standard professional colors and sizing) -->
                <div
                    class="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 rounded-t-2xl print:hidden"
                >
                    <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="hidden sm:inline font-kantumruy">{{
                            $t ? $t('ប័ណ្ណទទួលឯកសារ') : 'Document Receipt'
                        }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <!-- Print Button (Icon Only - Clean Professional Slate/Blue Theme) -->
                        <button
                            type="button"
                            @click="printDocument"
                            :title="$t ? $t('Print') : 'បោះពុម្ព'"
                            class="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-5 h-5 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path
                                    d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                                ></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>

                        <!-- Close / Cancel Button (Icon Only) -->
                        <button
                            type="button"
                            @click="closeModal"
                            :title="$t ? $t('Close') : 'បិទ'"
                            class="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-5 h-5 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- Modal Content Body -->
                <div class="p-3 sm:p-8 overflow-x-auto">
                    <div
                        id="printable-receipt"
                        class="bg-white p-6 sm:p-10 border-2 border-gray-300 rounded-xl shadow-sm text-gray-900 font-kantumruy relative"
                    >
                        <!-- Subtle corner accents for an "official seal" feel -->
                        <div
                            class="pointer-events-none absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-t-4 border-l-4 border-emerald-600/20 rounded-tl-xl"
                            style="border-top-left-radius: 0.75rem"
                        ></div>
                        <div
                            class="pointer-events-none absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 border-b-4 border-r-4 border-emerald-600/20 rounded-br-xl"
                            style="border-bottom-right-radius: 0.75rem"
                        ></div>

                        <div class="text-center border-b-2 border-emerald-600/30 pb-5 mb-6">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                class="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto"
                            />
                            <h2
                                class="font-battambang text-sm sm:text-lg font-bold text-gray-900 tracking-wide leading-relaxed mt-3"
                            >
                                អគ្គលេខាធិការដ្ឋានគណៈកម្មាធិការគ្រប់គ្រងល្បែងពាណិជ្ជកម្មកម្ពុជា
                            </h2>
                            <h3 class="font-moul text-base sm:text-xl text-emerald-600 tracking-wider mt-2">
                                លិខិតបញ្ជាក់ឯកសារ
                            </h3>
                            <div v-if="latestMergeCode" class="mt-3 flex justify-center">
                                <span
                                    class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="w-3 h-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path
                                            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                                        ></path>
                                    </svg>
                                    {{ latestMergeCode }}
                                </span>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-6 sm:gap-10">
                            <!-- Left column: document details -->
                            <div class="flex-1 space-y-3 text-sm sm:text-base text-gray-900">
                                <div class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">លេខឯកសារ៖</span>
                                    <span class="font-bold text-emerald-700 mt-0.5 sm:mt-0 tracking-wide">{{
                                        getTaskCode
                                    }}</span>
                                </div>
                                <div v-if="latestMergeCode" class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">កូដបញ្ចូលរួម៖</span>
                                    <span class="font-bold text-emerald-700 mt-0.5 sm:mt-0 tracking-wide">{{
                                        latestMergeCode
                                    }}</span>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">កម្មវត្ថុ៖</span>
                                    <span class="flex-1 mt-0.5 sm:mt-0">{{ task?.title || 'N/A' }}</span>
                                </div>
                                <div v-if="task?.project" class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">គម្រោង៖</span>
                                    <span class="flex-1 mt-0.5 sm:mt-0">{{
                                        task.project.name || task.project.title
                                    }}</span>
                                </div>

                                <div class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">ប្រភពឯកសារ៖</span>
                                    <span class="flex-1 mt-0.5 sm:mt-0">{{ documentSourceLabel }}</span>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900">ប្រភេទឯកសារ៖</span>
                                    <span class="flex-1 mt-0.5 sm:mt-0">{{ documentTypeLabel }}</span>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-baseline">
                                    <span class="font-semibold sm:min-w-[150px] text-gray-900"
                                        >កាលបរិច្ឆេទឯកសារចូល៖</span
                                    >
                                    <span class="flex-1 mt-0.5 sm:mt-0">{{
                                        formatDate(task?.entry_date || task?.created_at)
                                    }}</span>
                                </div>
                            </div>

                            <!-- Right column: QR on top, Barcode below it -->
                            <div
                                class="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-4 flex-shrink-0"
                            >
                                <div class="flex flex-col items-center w-full overflow-hidden">
                                    <div
                                        class="p-2 bg-white flex justify-center items-center border border-gray-200 rounded-lg shadow-sm"
                                    >
                                        <img
                                            v-if="task?.qr_code"
                                            :src="task.qr_code"
                                            alt="QR Code"
                                            class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                        />
                                        <img
                                            v-else
                                            :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getTrackingUrl())}`"
                                            alt="QR Code"
                                            class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                        />
                                    </div>
                                    <p
                                        class="text-[10px] sm:text-[11px] text-gray-600 mt-1.5 font-medium text-center leading-snug max-w-[140px] sm:max-w-none mx-auto"
                                    >
                                        សូមស្កេន ដើម្បីតាមដានឯកសារ
                                    </p>
                                </div>

                                <div class="flex flex-col items-center w-full overflow-hidden">
                                    <img
                                        v-if="task?.bar_code"
                                        :src="task.bar_code"
                                        alt="Barcode"
                                        class="h-8 sm:h-10 max-w-full w-32 sm:w-40 object-contain"
                                    />
                                    <img
                                        v-else
                                        :src="`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(getTaskCode)}&scale=2&height=10&includetext=false`"
                                        alt="Barcode"
                                        class="h-8 sm:h-10 max-w-full w-32 sm:w-40 object-contain"
                                    />
                                    <p
                                        class="text-[12px] sm:text-[12px] text-gray-600 mt-1 font-medium text-center leading-snug max-w-[140px] sm:max-w-none mx-auto"
                                    >
                                        {{ getTaskCode }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div v-if="mergedHistory.length" class="mt-6 pt-5 border-t border-gray-100 print-avoid-break">
                            <div class="flex items-center justify-between mb-3">
                                <p class="font-semibold">បញ្ចូលពីឯកសារផ្សេងទៀត ៖</p>
                                <span
                                    class="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5"
                                >
                                    ត្រូវបានបញ្ចូលរួម
                                </span>
                            </div>
                            <div class="space-y-2">
                                <div
                                    v-for="(m, i) in mergedHistory"
                                    :key="m.id"
                                    class="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2"
                                >
                                    <span
                                        class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600/10 text-emerald-700 text-[11px] font-bold flex items-center justify-center"
                                        >{{ i + 1 }}</span
                                    >
                                    <div class="min-w-0 flex-1">
                                        <p class="text-sm sm:text-base text-gray-800 truncate">{{ m.title }}</p>
                                        <p class="text-[11px] text-gray-500 mt-0.5">
                                            <span v-if="m.merged_at">{{ formatDate(m.merged_at) }}</span>
                                            <span v-if="m.merge_code"> · {{ m.merge_code }}</span>
                                        </p>
                                    </div>
                                    <span
                                        class="flex-shrink-0 text-xs sm:text-sm font-semibold text-emerald-700 tracking-wide"
                                        >{{ m.code }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 pt-5 border-t border-gray-100 print-avoid-break">
                            <p class="font-semibold mb-3">ជម្រាបជូន ៖</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-base">
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>នាយកដ្ឋានកិច្ចការទូទៅ</span>
                                </label>
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>នាយកដ្ឋានកិច្ចការគតិយុត្ត និងគ្រប់គ្រងអាជ្ញាបណ្ណ</span>
                                </label>
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>នាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល</span>
                                </label>
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>នាយកដ្ឋានគ្រប់គ្រងបច្ចេកទេសល្បែង</span>
                                </label>
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>នាយកដ្ឋានគ្រប់គ្រងសន្តិសុខ និងសណ្តាប់ធ្នាប់</span>
                                </label>
                                <label class="flex items-start gap-2">
                                    <span class="receipt-checkbox"></span>
                                    <span>អង្គភាពសវនកម្មផ្ទៃក្នុង</span>
                                </label>
                            </div>
                            <label class="flex items-center gap-2 mt-4 text-sm sm:text-base">
                                <span class="receipt-checkbox"></span>
                                <span class="flex-shrink-0">ផ្សេងៗ</span>
                                <span class="flex-1 border border-gray-400 rounded h-8"></span>
                            </label>
                        </div>

                        <div class="mt-6 pt-5 border-t border-gray-100 print-avoid-break">
                            <p class="font-semibold mb-3">ដើម្បី ៖</p>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm sm:text-base">
                                <div class="space-y-3">
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ចាត់ចែងតាមមុខការ</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ពិនិត្យ និងផ្តល់យោបល់</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>រៀបចំលិខិតឆ្លើយតប</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ចុះស៊ើបអង្កេត និងស្រាវជ្រាវ</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ចុះបញ្ជី និងធ្វើឯកសារពត៌មាន</span>
                                    </label>
                                </div>
                                <div class="space-y-3">
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>អនុវត្ត</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ធ្វើរបាយការណ៍</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ចូលរួម</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ចុះរួម</span>
                                    </label>
                                    <label class="flex items-start flex-wrap gap-x-3 gap-y-1.5">
                                        <span class="flex items-center gap-2"
                                            ><span class="receipt-checkbox"></span><span>ធ្វើសន្លឹក ÷</span></span
                                        >
                                        <span class="flex items-center gap-1.5"
                                            ><span class="receipt-checkbox"></span><span>មានកម្រិត</span></span
                                        >
                                        <span class="flex items-center gap-1.5"
                                            ><span class="receipt-checkbox"></span><span>ពេញលេញ</span></span
                                        >
                                        <span class="flex items-center gap-1.5"
                                            ><span class="receipt-checkbox"></span><span>ពិសេស</span></span
                                        >
                                    </label>
                                </div>
                                <div class="space-y-3">
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ដើម្បីទទួលជួប</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>ពិនិត្យលទ្ធភាព</span>
                                    </label>
                                    <label class="flex items-start gap-2">
                                        <span class="receipt-checkbox"></span>
                                        <span>បានយើញ</span>
                                    </label>
                                </div>
                            </div>
                            <label class="flex items-center gap-2 mt-4 text-sm sm:text-base">
                                <span class="receipt-checkbox"></span>
                                <span class="flex-shrink-0">ផ្សេងៗ</span>
                                <span class="flex-1 border border-gray-400 rounded h-8"></span>
                            </label>
                        </div>

                        <!-- Response-deadline note — also static print-only markup. -->
                        <div class="mt-6 text-sm sm:text-base">
                            <p>
                                ខ្ញុំសូមស្នើសុំឯកសារនេះត្រូវរៀបចំចម្លើយតបចាំតាមចំណារខាងលើ
                                ហើយបញ្ជូនត្រឡប់មកវិញក្នុងរយៈពេលៈ
                            </p>
                            <div class="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>១ ថ្ងៃ</span>
                                </label>
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>២ ថ្ងៃ</span>
                                </label>
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>៣ ថ្ងៃ</span>
                                </label>
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>៤ ថ្ងៃ</span>
                                </label>
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>៥ ថ្ងៃ នៃថ្ងៃធ្វើការ</span>
                                </label>
                                <label class="flex items-center gap-1.5">
                                    <span class="receipt-checkbox"></span>
                                    <span>ឬឱ្យបានឆាប់រហ័សតាមដែលអាចធ្វើបាន។</span>
                                </label>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex justify-end pt-4 mt-6 border-t border-gray-100">
                            <div class="inline-flex flex-col items-center text-center">
                                <span class="text-xs sm:text-sm text-gray-800 mb-[25px]">
                                    រាជធានីភ្នំពេញ ថ្ងៃទី........ ខែ........ ឆ្នាំ ២០...
                                </span>
                                <span class="font-moul text-sm sm:text-lg text-gray-800 tracking-wider">
                                    អគ្គលេខាធិការ គ.ល.ក.
                                </span>
                                <div class="h-28 my-2"></div>
                                <span class="font-moul text-sm sm:text-base text-gray-800"> </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import moment from 'moment';
import { statusColor } from '@/Utils/palette';

export default {
    name: 'DocumentReceipt',
    props: {
        task: {
            type: Object,
            required: true,
            default: () => ({}),
        },

        presetStatusLabel: {
            type: String,
            default: null,
        },
        presetStatusColor: {
            type: String,
            default: null,
        },

        lists: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            // Restored on close, so a page that had its own overflow set keeps it.
            previousBodyOverflow: '',
        };
    },
    computed: {
        getTaskCode() {
            return this.task?.task_code || this.task?.id || 'N/A';
        },

        documentSourceLabel() {
            const source = this.task?.document_source;
            if (!source) return 'N/A';
            const department = source.parent?.name;
            return department ? `${department} — ${source.name}` : source.name;
        },

        documentTypeLabel() {
            return this.task?.type?.name || 'N/A';
        },

        matchedList() {
            if (!Array.isArray(this.lists) || !this.lists.length || !this.task) return null;
            const listId = this.task.list_id;
            let idx = this.lists.findIndex(
                (l) => l.id === listId || (Array.isArray(l.list_ids) && l.list_ids.includes(listId))
            );
            if (idx === -1) {
                idx = this.lists.findIndex((l) => (l.tasks || []).some((t) => t.id === this.task.id));
            }
            return idx === -1 ? null : { index: idx, list: this.lists[idx] };
        },

        statusLabel() {
            if (this.presetStatusLabel) return this.presetStatusLabel;
            if (this.task?.list?.title) return this.task.list.title;
            if (this.matchedList) return this.matchedList.list.title;
            return 'N/A';
        },

        /**
         * Always the light steps: this sheet is printed, and the dark steps are
         * chosen for a dark card rather than for paper. By the status name, so
         * the pill here is the colour the same document wears on the register
         * and on the dashboard.
         */
        statusColor() {
            if (this.presetStatusColor) return this.presetStatusColor;

            const column = this.task?.list || (this.matchedList ? this.matchedList.list : null);

            return statusColor(column || this.statusLabel, false);
        },

        // One-by-one list of tasks that were merged into this one
        // (set server-side in task.merge — see merge_history_backend.md).
        // Each entry already carries its own tracking code, so nothing
        // needs to be recomputed here.
        mergedHistory() {
            return Array.isArray(this.task?.merged_history) ? this.task.merged_history : [];
        },

        // The merge code of the most recent merge event into this task
        // (e.g. "MRG-2026-0023-01"). Shown as a badge near the top and
        // as its own row next to លេខឯកសារ, so it always reflects
        // whatever this task's real merge history is — not hardcoded.
        latestMergeCode() {
            if (!this.mergedHistory.length) return null;
            const last = this.mergedHistory[this.mergedHistory.length - 1];
            return (last && last.merge_code) || null;
        },
    },
    mounted() {
        // user clicks Print or Download PDF.
        if (document.fonts) {
            document.fonts.load('700 20px "Moul"');
            document.fonts.load('700 20px "Battambang"');
            document.fonts.load('400 16px "Kantumruy Pro"');
            document.fonts.load('700 16px "Kantumruy Pro"');
        }

        document.addEventListener('keydown', this.onKeydown);
        // Without this the page behind scrolls under the slip, which reads as
        // the modal drifting rather than the page moving.
        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown);
        document.body.style.overflow = this.previousBodyOverflow || '';
    },
    methods: {
        formatDate(date) {
            if (!date) return 'N/A';

            const khmerMonths = [
                'មករា',
                'កុម្ភៈ',
                'មីនា',
                'មេសា',
                'ឧសភា',
                'មិថុនា',
                'កក្កដា',
                'សីហា',
                'កញ្ញា',
                'តុលា',
                'វិច្ឆិកា',
                'ធ្នូ',
            ];
            const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

            const toKhmerNumber = (num) => String(num).replace(/\d/g, (d) => khmerNumbers[d]);

            const m = moment(date);
            const day = toKhmerNumber(m.format('DD'));
            const month = khmerMonths[m.month()];
            const year = toKhmerNumber(m.format('YYYY'));

            return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
        },

        getTrackingUrl() {
            return `${window.location.origin}/track/${this.getTaskCode}`;
        },

        printDocument() {
            window.print();
        },

        onKeydown(event) {
            if (event.key === 'Escape') this.closeModal();
        },

        closeModal() {
            this.$emit('close');
        },
    },
};
</script>

<style scoped>
.font-kantumruy {
    font-family: 'Kantumruy Pro', sans-serif;
}

.font-battambang {
    font-family: 'Battambang', serif;
}

.font-moul {
    font-family: 'Moul', cursive;
}

.print-avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
}

.receipt-checkbox {
    display: inline-block;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    border: 1.5px solid #4b5563;
    border-radius: 2px;
}

.receipt-radio {
    display: inline-block;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1.5px solid #4b5563;
    border-radius: 50%;
}
</style>

<style>
@media print {
    .receipt-overlay {
        position: static !important;
        display: block !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background: none !important;
        padding: 0 !important;
        overflow: visible !important;
    }

    .receipt-overlay > div {
        position: static !important;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
    }

    body * {
        visibility: hidden !important;
    }

    #printable-receipt,
    #printable-receipt * {
        visibility: visible !important;
    }

    #printable-receipt {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        border: none !important;
        box-shadow: none !important;
        padding: 15mm !important;
        margin: 0 !important;
        background: white !important;
        overflow: visible !important;
    }

    #printable-receipt > div {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    @page {
        size: A4 portrait;
        margin: 0;
    }
}
</style>
