<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 transition-all">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col">
            <!-- Modern Action Buttons Bar (Standard professional colors and sizing) -->
            <div class="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 rounded-t-2xl print:hidden">
                <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="hidden sm:inline font-kantumruy">{{ $t ? $t('ប័ណ្ណទទួលឯកសារ') : 'Document Receipt' }}</span>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Print Button (Icon Only - Clean Professional Slate/Blue Theme) -->
                    <button
                        type="button"
                        @click="printDocument"
                        :title="$t ? $t('Print') : 'បោះពុម្ព'"
                        class="p-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <!-- Modal Content Body -->
            <div class="p-3 sm:p-8 overflow-x-auto">
                <!-- Printable Document Receipt Area -->
                <div id="printable-receipt" class="bg-white p-6 sm:p-12 border border-gray-200/80 rounded-xl shadow-sm text-gray-900 font-kantumruy relative min-h-[550px] sm:min-h-[650px] flex flex-col justify-between">

                    <!-- Subtle corner accents for an "official seal" feel -->
                    <div class="pointer-events-none absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-t-4 border-l-4 border-emerald-600/20 rounded-tl-xl" style="border-top-left-radius: 0.75rem;"></div>
                    <div class="pointer-events-none absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 border-b-4 border-r-4 border-emerald-600/20 rounded-br-xl" style="border-bottom-right-radius: 0.75rem;"></div>

                    <div>
                        <!-- Header with Logo & Title -->
                        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b-2 border-emerald-600/30 pb-6 mb-6 sm:mb-8 text-center sm:text-left">
                            <img src="/images/logo.png" alt="Logo" class="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" />

                            <div class="flex-1 sm:pr-12">
                                <h2 class="font-battambang text-base sm:text-xl font-bold text-gray-900 tracking-wide leading-relaxed">
                                    អគ្គលេខាធិការដ្ឋានគណៈកម្មាធិការគ្រប់គ្រងល្បែងពាណិជ្ជកម្មកម្ពុជា
                                </h2>
                                <h3 class="font-moul text-lg sm:text-2xl text-emerald-600 tracking-wider mt-2 sm:mt-3">
                                    លិខិតបញ្ជាក់ឯកសារ
                                </h3>
                            </div>
                        </div>

                        <!-- Document Details Layout -->
                        <div class="space-y-3 text-sm sm:text-base text-gray-900 my-4 sm:my-6">
                            <div class="flex flex-col sm:flex-row sm:items-baseline">
                                <span class="font-semibold sm:min-w-[160px] text-gray-900">លេខឯកសារ៖</span>
                                <span class="font-bold text-emerald-700 mt-0.5 sm:mt-0 tracking-wide">{{ getTaskCode }}</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-baseline">
                                <span class="font-semibold sm:min-w-[160px] text-gray-900">កម្មវត្ថុ៖</span>
                                <span class="flex-1 mt-0.5 sm:mt-0">{{ task?.title || 'N/A' }}</span>
                            </div>
                            <div v-if="task?.project" class="flex flex-col sm:flex-row sm:items-baseline">
                                <span class="font-semibold sm:min-w-[160px] text-gray-900">គម្រោង៖</span>
                                <span class="flex-1 mt-0.5 sm:mt-0">{{ task.project.name || task.project.title }}</span>
                            </div>
                            <!-- ប្រភពឯកសារ (Document Source): the actual office/department
                                 picked in the TaskDetails.vue org-chart picker
                                 (task.document_source_id), shown as
                                 "department — office". Falls back to "N/A" when
                                 no source has been set on the task yet, so the
                                 line is always present on the printed receipt. -->
                            <div class="flex flex-col sm:flex-row sm:items-baseline">
                                <span class="font-semibold sm:min-w-[160px] text-gray-900">ប្រភពឯកសារ៖</span>
                                <span class="flex-1 mt-0.5 sm:mt-0">{{ documentSourceLabel }}</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-baseline">
                                <span class="font-semibold sm:min-w-[160px] text-gray-900">កាលបរិច្ឆេទឯកសារចូល៖</span>
                                <span class="flex-1 mt-0.5 sm:mt-0">{{ formatDate(task?.entry_date || task?.created_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Center QR and Bottom Barcode / Footer Layout -->
                    <div class="mt-8 sm:mt-8 relative z-10 print-avoid-break">
                        <!-- Codes Section (QR & Barcode Centered) -->
                        <div class="flex flex-col items-center justify-center my-4 sm:my-6 space-y-3 sm:space-y-4">
                            <!-- QR Code -->
                            <div class="p-2 bg-white flex justify-center items-center border border-gray-100 rounded-lg shadow-sm">
                                <img v-if="task?.qr_code" :src="task.qr_code" alt="QR Code" class="w-28 h-28 sm:w-32 sm:h-32 object-contain" />
                                <img
                                    v-else
                                    :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getTrackingUrl())}`"
                                    alt="QR Code"
                                    class="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                                />
                            </div>

                            <!-- 1D Barcode -->
                            <div class="flex flex-col items-center mt-2 w-full overflow-hidden">
                                <img v-if="task?.bar_code" :src="task.bar_code" alt="Barcode" class="h-10 sm:h-12 max-w-full w-56 sm:w-64 object-contain" />
                                <img
                                    v-else
                                    :src="`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(getTaskCode)}&scale=2&height=10&includetext=false`"
                                    alt="Barcode"
                                    class="h-10 sm:h-12 max-w-full w-56 sm:w-64 object-contain"
                                />
                                <p class="text-[11px] sm:text-xs text-gray-800 mt-2 font-medium text-center">សូមស្កេន ដើម្បីតាមដានឯកសារ</p>
                                <p class="text-[10px] sm:text-[11px] text-gray-500 font-sans tracking-wide text-center">Please, scan here to track document.</p>
                            </div>
                        </div>

                        <!-- Footer / Thank you positioned precisely to the bottom right -->
                        <div class="flex justify-end pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100">
                            <span class="font-moul text-sm sm:text-lg text-gray-800 tracking-wider">សូមអរគុណ</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        name: 'DocumentReceipt',
        props: {
            task: {
                type: Object,
                required: true,
                default: () => ({})
            }
        },
        computed: {
            getTaskCode() {
                return this.task?.task_code || this.task?.id || 'N/A';
            },

            // ប្រភពឯកសារ (Document Source): built from the office picked on
            // the task (task.document_source_id) plus its parent department
            // — loaded via the `documentSource.parent` relation on the
            // backend (TasksController::getJsonTask/updateTask). Shown as
            // "department — office" so the receipt reads the same way the
            // TaskDetails.vue picker groups them.
            documentSourceLabel() {
                const source = this.task?.document_source;
                if (!source) return 'N/A';
                const department = source.parent?.name;
                return department ? `${department} — ${source.name}` : source.name;
            }
        },
        mounted() {
            // user clicks Print or Download PDF.
            if (document.fonts) {
                document.fonts.load('700 20px "Moul"');
                document.fonts.load('700 20px "Battambang"');
                document.fonts.load('400 16px "Kantumruy Pro"');
                document.fonts.load('700 16px "Kantumruy Pro"');
            }
        },
        methods: {
            formatDate(date) {
                if (!date) return 'N/A';

                const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
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

            closeModal() {
                this.$emit('close');
            }
        }
    }
</script>

<style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Battambang:wght@400;700&family=Moul&display=swap');

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
</style>

<style>
    @media print {
        .fixed.inset-0.z-50 {
            position: static !important;
            display: block !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: none !important;
            padding: 0 !important;
            overflow: visible !important;
        }

        .fixed.inset-0.z-50 > div {
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

        #printable-receipt, #printable-receipt * {
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

        /* Keep the QR/barcode/footer block intact instead of letting a page
        break slice through the middle of it */
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