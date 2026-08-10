<template>
    <div class="wflow">
        <Head :title="$t(title)" />

        <div class="wflow__header">
            <div>
                <h1 class="wflow__title">{{ $t('លំហូរការងារ នៃការគ្រប់គ្រងឯកសាររដ្ឋបាល') }}</h1>
                <p class="wflow__subtitle">{{ $t('Administrative Document Management Workflow') }}</p>
            </div>
            <div class="wflow__actions">
                <div class="wflow__view-toggle">
                    <button type="button" class="wflow__view-btn" :class="{ 'wflow__view-btn--active': viewMode === 'flow' }" @click="viewMode = 'flow'">
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h16" stroke-linecap="round" /></svg>
                        {{ $t('Flow') }}
                    </button>
                    <button type="button" class="wflow__view-btn" :class="{ 'wflow__view-btn--active': viewMode === 'table' }" @click="viewMode = 'table'">
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></svg>
                        {{ $t('Table') }}
                    </button>
                </div>
                <button v-if="viewMode === 'flow'" type="button" class="wflow__btn" @click="expandAll">
                    <icon class="w-4 h-4" name="plus" />
                    {{ $t('Expand All') }}
                </button>
                <button v-if="viewMode === 'flow'" type="button" class="wflow__btn wflow__btn--ghost" @click="collapseAll">
                    {{ $t('Collapse All') }}
                </button>
            </div>
        </div>

        <div class="wflow__toolbar">
            <div class="wflow__search">
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
                </svg>
                <input v-model="search" type="text" :placeholder="$t('Search steps...')" />
            </div>
            <div class="wflow__tabs" v-if="viewMode === 'flow'">
                <button
                    v-for="(section, sIdx) in sections"
                    :key="'tab_'+sIdx"
                    type="button"
                    class="wflow__tab"
                    :class="{ 'wflow__tab--active': activeSection === sIdx }"
                    @click="activeSection = sIdx"
                >
                    {{ section.roman }}. {{ $t(section.title) }}
                </button>
            </div>
        </div>

        <template v-if="viewMode === 'flow'">
            <!-- Whole-process flowchart: every group in the active section
                 as a connected node, in order, so the end-to-end process is
                 visible at a glance before drilling into individual steps
                 below. Clicking a node opens (and scrolls to) that group. -->
            <div class="wflow__diagram">
                <template v-for="(group, gIdx) in sections[activeSection].groups" :key="'flow_'+activeSection+'_'+gIdx">
                    <button type="button" class="wflow__diagram-node" @click="focusGroup(activeSection, gIdx)">
                        <span class="wflow__diagram-badge">{{ group.letter }}</span>
                        <span class="wflow__diagram-title">{{ $t(group.title) }}</span>
                    </button>
                    <svg v-if="gIdx < sections[activeSection].groups.length - 1" viewBox="0 0 24 24" class="wflow__diagram-arrow" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12h13M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </template>
            </div>

            <div class="wflow__section" v-for="(section, sIdx) in sections" :key="'section_'+sIdx" v-show="activeSection === sIdx">
                <div class="wflow__group" :id="'group-'+sIdx+'-'+group._gIdx" v-for="group in filteredGroups(section)" :key="'group_'+sIdx+'_'+group._gIdx">
                    <button type="button" class="wflow__group-head" @click="toggleGroup(sIdx, group._gIdx)">
                        <span class="wflow__group-badge">{{ group.letter }}</span>
                        <span class="wflow__group-title">{{ $t(group.title) }}</span>
                        <svg viewBox="0 0 24 24" class="w-5 h-5 wflow__chevron" :class="{ 'wflow__chevron--open': isGroupOpen(sIdx, group._gIdx) }" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>

                    <transition name="wflow-collapse">
                        <div class="wflow__steps" v-if="isGroupOpen(sIdx, group._gIdx)">
                            <div
                                class="wflow__step"
                                v-for="(step, stIdx) in group.steps"
                                :key="'step_'+sIdx+'_'+group._gIdx+'_'+stIdx"
                                :class="{ 'wflow__step--start': stIdx === 0, 'wflow__step--end': stIdx === group.steps.length - 1 }"
                            >
                                <div class="wflow__step-marker">
                                    <span v-if="stIdx === 0" class="wflow__step-flag">{{ $t('ចាប់ផ្ដើម') }}</span>
                                    <span class="wflow__step-num" :class="{ 'wflow__step-num--end': stIdx === group.steps.length - 1 }">
                                        <svg v-if="stIdx === group.steps.length - 1" viewBox="0 0 24 24" class="wflow__step-check" fill="none" stroke="currentColor" stroke-width="3">
                                            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <template v-else>{{ stIdx + 1 }}</template>
                                    </span>
                                    <span class="wflow__step-line" v-if="stIdx < group.steps.length - 1">
                                        <svg viewBox="0 0 24 24" class="wflow__step-arrow" fill="currentColor">
                                            <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" />
                                        </svg>
                                    </span>
                                    <span v-if="stIdx === group.steps.length - 1" class="wflow__step-flag wflow__step-flag--end">{{ $t('បញ្ចប់') }}</span>
                                </div>
                                <div class="wflow__step-body">
                                    <p class="wflow__step-text" v-html="highlight(step.text)"></p>
                                    <ul class="wflow__step-sub" v-if="step.sub && step.sub.length">
                                        <li v-for="(subItem, subIdx) in step.sub" :key="'sub_'+subIdx" v-html="highlight(subItem)"></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <div v-if="!filteredGroups(section).length" class="wflow__empty">
                    {{ $t('No matching steps found.') }}
                </div>
            </div>
        </template>

        <!-- Table view: every step across every section, flattened into one
             sortable, filterable table (reuses the same search box above). -->
        <div class="wflow__table-wrap" v-else>
            <table class="wflow__table" v-if="filteredTableRows.length">
                <thead>
                    <tr>
                        <th @click="sortBy('sIdx')">
                            {{ $t('Section') }}
                            <span class="wflow__sort-icon" v-if="tableSort.key === 'sIdx'">{{ tableSort.dir === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('gIdx')">
                            {{ $t('Group') }}
                            <span class="wflow__sort-icon" v-if="tableSort.key === 'gIdx'">{{ tableSort.dir === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th @click="sortBy('stepNum')" class="wflow__table-num-col">
                            {{ $t('Step') }}
                            <span class="wflow__sort-icon" v-if="tableSort.key === 'stepNum'">{{ tableSort.dir === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th>{{ $t('Description') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in filteredTableRows" :key="row.id" @click="viewMode = 'flow'; activeSection = row.sIdx; focusGroup(row.sIdx, row.gIdx)">
                        <td>
                            <span class="wflow__table-tag">{{ row.sectionRoman }}</span>
                            <span class="wflow__table-subtext">{{ $t(row.sectionTitle) }}</span>
                        </td>
                        <td>
                            <span class="wflow__table-tag wflow__table-tag--group">{{ row.groupLetter }}</span>
                            <span class="wflow__table-subtext">{{ $t(row.groupTitle) }}</span>
                        </td>
                        <td class="wflow__table-num-col">{{ row.stepNum }}</td>
                        <td>
                            <p v-html="highlight(row.text)"></p>
                            <ul class="wflow__step-sub" v-if="row.sub.length">
                                <li v-for="(subItem, subIdx) in row.sub" :key="'trsub_'+row.id+'_'+subIdx" v-html="highlight(subItem)"></li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="wflow__empty">
                {{ $t('No matching steps found.') }}
            </div>
        </div>
    </div>
</template>

<script>
import { Head } from '@inertiajs/vue3'
import Layout from '@/Shared/Layout.vue'
import Icon from '@/Shared/Icon.vue'

export default {
    name: 'document-workflow',
    components: { Head, Icon },
    layout: Layout,
    props: {
        title: { type: String, default: 'Document Workflow' },
    },
    data() {
        return {
            search: '',
            activeSection: 0,
            openGroups: {},
            viewMode: 'flow', // 'flow' | 'table'
            tableSort: { key: 'sIdx', dir: 'asc' },
            sections: [
                {
                    roman: 'I',
                    title: 'ឯកសារចូលពីក្រៅ',
                    groups: [
                        {
                            letter: 'ក',
                            title: 'ឯកសារមកពីក្រសួង-ស្ថាប័នរដ្ឋ',
                            steps: [
                                { text: 'មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យ និងវាយក្តាចូលរបស់ អ.គ.ល.ក. រួចស្កេនរួចបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន ឡើយវាយបញ្ចូលក្នុង Excel File ដើម្បីធ្វើការតាមដានដំណើរការឯកសារ និងថតចម្លងរក្សាទុកជាឯកសាររដ្ឋបាល បន្ទាប់មកបញ្ជូនឯកសារទៅក្រុមការងារលេខាដើម្បីដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ តាមពេលវេលាកំណត់ និងជាក់ស្តែង' },
                                { text: 'នៅពេលឯកសារចេញពីឯកឧត្តមអគ្គលេខាធិការ មន្ត្រីរដ្ឋបាលធ្វើការស្កេនរក្សាទុក រួចប្រែងប្រែកទៅ នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ តាមចំណាត់របស់ ឯកឧត្តមអគ្គលេខាធិការ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន និងបញ្ចូលក្នុង Excel File ដើម្បីតាមដានដំណើរការឯកសារបន្ត។' },
                            ],
                        },
                        {
                            letter: 'ខ.១',
                            title: 'ឯកសារមកពីក្រុមហ៊ុន/ស្ថាប័នឯកជន — ឯកសារសំណើទូទៅ',
                            steps: [
                                { text: 'មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យ ករណីឯកសារត្រឹមត្រូវនឹងវាយក្តាចូលរបស់ អ.គ.ល.ក. រួចថតចម្លងឯកសារដែលមានក្តាចូលរបស់ អ.គ.ល.ក. ១ សន្លឹកជូនក្រុមហ៊ុន។ ប៉ុន្តែក្រណីបើឯកសារណាដែលមានភាពស្រពិចស្រពិល ឬមិនច្បាស់លាស់ ការិយាល័យរដ្ឋបាលនឹងស្នើសុំការបញ្ជាក់ពីប្រធាននាយកដ្ឋានកិច្ចការទូទៅ មុននឹងទទួលឯកសារនោះ' },
                                { text: 'បន្ទាប់ពីវាយក្តាចូលរបស់ អ.គ.ល.ក. ស្កេន និងរួចបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្នឡើយ វាយបញ្ចូលក្នុង Excel File ដើម្បីធ្វើការតាមដានដំណើរការឯកសារ រួចរាល់ត្រូវបញ្ជូនឯកសារទៅការិយាល័យក្រុមការងាររបស់ ឯកឧត្តមអគ្គលេខាធិការ តាមពេលវេលាកំណត់ និងជាក់ស្តែង' },
                                { text: 'នៅពេលឯកសារចេញពីឯកឧត្តមអគ្គលេខាធិការ មន្ត្រីរដ្ឋបាលធ្វើការស្កេនរក្សាទុក រួចប្រែងប្រែកទៅ នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ តាមចំណាត់របស់ ឯកឧត្តមអគ្គលេខាធិការ' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុករួចបញ្ជូលក្នុងប្រព័ន្ធនិងក្នុង Excel File ដើម្បីតាមដានដំណើរការឯកសារបន្ត។' },
                            ],
                        },
                        {
                            letter: 'ខ.២',
                            title: 'ឯកសារប្រកាសចំណូលកិច្ចពិសព ល្បែងផ្សងសំណាង/កាស៊ីណូ និងបង់មូលនិធិសង្គមរបស់ គ.ល.ក. ប្រចាំខែ',
                            steps: [
                                { text: 'ឯកសារចូលមក មន្ត្រីរដ្ឋបាលនឹងថតចម្លង ១ សន្លឹកដើម្បីថ្ងៃខែទទួលជូនក្រុមហ៊ុន រួចបញ្ជូនឯកសារទៅនាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល ដើម្បីចេញប័ណ្ណបង់ប្រាក់ជូនក្រុមហ៊ុន ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុក និងតាមដាន។' },
                            ],
                        },
                        {
                            letter: 'ខ.៣',
                            title: 'ប្រភេទវិក្កយបត្រង់ប្រាក់របស់ក្រុមហ៊ុន',
                            steps: [
                                { text: 'ឯកសារចូលមក មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យលើច្បាប់ដើម ករណីត្រឹមត្រូវនឹងថតចម្លងចំនួន ៣ សន្លឹក ដោយ ១ សន្លឹកថ្ងៃខែទទួលពីក្រុមហ៊ុន និង ២ សន្លឹកទៀតវាយក្តាបញ្ជាក់ថតចម្លងត្រឹមត្រូវតាមច្បាប់ដើមនិងស្កេនរក្សាទុកជាឯកសារ រួចផ្តល់ច្បាប់ដើមជូនក្រុមហ៊ុនវិញ' },
                                { text: 'រួចបញ្ជូនឯកសារទៅនាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល និងនាយកដ្ឋានពាក់ព័ន្ធ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងតាមដាន។' },
                            ],
                        },
                    ],
                },
                {
                    roman: 'II',
                    title: 'ឯកសារចូលពីនាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ',
                    groups: [
                        {
                            letter: 'ក',
                            title: 'ឯកសារឆ្លើយតបទៅក្រសួង-ស្ថាប័ន និង/ឬក្រុមហ៊ុន',
                            steps: [
                                { text: 'នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ មានរយៈពេល ៣ ថ្ងៃសម្រាប់ឯកសារធម្មតាដើម្បីរៀបចំនិងផ្តល់យោបល់ជូន ថ្នាក់ដឹកនាំ បន្ទាប់ពីទទួលបានចំណាត់ពីឯកឧត្តមអគ្គលេខាធិការលើឯកសារចូលពីក្រៅ ដោយដាក់មកតាមរយៈនាយកដ្ឋានកិច្ចការទូទៅ និងចំពោះឯកសារប្រញាប់ត្រូវរៀបចំបញ្ជូនមក ឯកឧត្តមអគ្គលេខាធិការ នៅក្នុងថ្ងៃតែមួយ ឬបន់ស្បែនតាមទំហំការងារ។' },
                                { text: 'បន្ទាប់ពីនាយកដ្ឋានកិច្ចការទូទៅ ទទួលបានឯកសារពីនាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ នាយកដ្ឋានកិច្ចការទូទៅត្រូវស្កេនទុកក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន និងបញ្ចូលក្នុង Excel File ដើម្បីតាមដានដំណើរការ រួចបញ្ជូនទៅឯកឧត្តមអគ្គលេខាធិការរង ដើម្បីពិនិត្យ និងផ្តល់យោបល់ ដែលមានរយៈពេលចំនួន ១ ថ្ងៃ' },
                                { text: 'ករណីឯកសារមានការកែសម្រួល D1 បញ្ជូនទៅនាយកដ្ឋានជំនាញដើម្បីកែសម្រួលវិញ រួចដាក់មក D1 វិញ រួចអនុវត្តចំណុចទី២ខាងលើម្តងទៀត' },
                                { text: 'បន្ទាប់ពី ឯកឧត្តមអគ្គលេខាធិការរង បានពិនិត្យ និងផ្តល់យោបល់រួច ត្រូវបញ្ជូនឯកសារទៅក្រុមការងារលេខារបស់ ឯកឧត្តមអគ្គលេខាធិការ ដើម្បីពិនិត្យសម្រេច និងបច្ចុប្បន្នភាពដំណើរការក្នុង Excel File' },
                                { text: 'ករណីឯកសារមានការកែសម្រួល D1 បញ្ជូនទៅនាយកដ្ឋានជំនាញដើម្បីកែសម្រួលវិញ រួចដាក់មក D1 វិញ រួចអនុវត្តការងារពីចំណុចទី២ខាងលើតាមដំណាក់កាលឡើងវិញ' },
                                { text: 'បន្ទាប់ពីទទួលបានការពិនិត្យសម្រេចពី ឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមក D1 ករណីមានលិខិតភ្ជាប់ទៅក្រសួង-ស្ថាប័ន និង/ឬក្រុមហ៊ុន, D1 ត្រូវចុះលេខចេញ ប្រាប់ជូនក្រុមហ៊ុន ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងតាមដាន។' },
                                { text: 'ចំពោះឯកសារគោរពស្នើសុំការពិនិត្យ និងសម្រេចរបស់ ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យ ឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. នាយកដ្ឋានកិច្ចការទូទៅត្រូវចុះលេខចេញ និងបញ្ជូនទៅ ឯកឧត្តមរដ្ឋលេខាធិការក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុទទួលបន្ទុក ដើម្បីផ្តល់យោបល់រួចបញ្ជូនគោរពស្នើសុំការពិនិត្យ និងសម្រេចរបស់ ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. និងបញ្ចូលដំណើរការក្នុង Excel' },
                                { text: 'បន្ទាប់ពីទទួលបានការសម្រេចរបស់ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ ពិនិត្យ ករណីមានលិខិតភ្ជាប់ទៅក្រសួង-ស្ថាប័ននិង/ឬក្រុមហ៊ុន ត្រូវចុះលេខចេញ ប្រថាប់ត្រា គ.ល.ក. រួចស្កេនរក្សាទុក និងបញ្ចូលដំណើរការក្នុង Excel និងសុំការណែនាំបន្ថែមពីឯកឧត្តមអគ្គលេខាធិការ។' },
                            ],
                        },
                        {
                            letter: 'ខ',
                            title: 'ឯកសារស្នើសុំទូទាត់ថវិកា និងឯកសារស្នើសុំលិខិតបញ្ជាក់រដ្ឋបាល',
                            steps: [
                                { text: 'ឯកសារចូលមក មន្ត្រីរដ្ឋបាលស្កេនរក្សាទុកក្នុងប្រព័ន្ធរដ្ឋបាល រួចបញ្ជូនទៅប្រធាននាយកដ្ឋានកិច្ចការទូទៅ ដើម្បីចាត់ចែងបញ្ជូនទៅការិយាល័យជំនាញរៀបចំនីតិវិធីបន្ត' },
                                { text: 'ករណីឯកសារមិនត្រឹមត្រូវ នាយកដ្ឋានជំនាញត្រូវកែសម្រួល រួចដាក់មកនាយកដ្ឋានកិច្ចការទូទៅសារជាថ្មីរួច អនុវត្តចំណុចទី១ឡើងវិញ' },
                                { text: 'ករណីឯកសារត្រឹមត្រូវ នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវរៀបចំលើកសំណើសុំការពិនិត្យ និងសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ' },
                                {
                                    text: 'បន្ទាប់ពីទទួលបានការសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមកនាយកដ្ឋានកិច្ចការទូទៅ',
                                    sub: [
                                        'ចំពោះឯកសារស្នើសុំទូទាត់ថវិកា បញ្ជូនឱ្យការិយាល័យហិរញ្ញវត្ថុ និងគណនេយ្យ បន្តនីតិវិធីគណនេយ្យជាមួយធនាគារ',
                                        'ចំពោះលិខិតបញ្ជាក់រដ្ឋបាលរបស់មន្ត្រីត្រូវចុះលេខចេញ និងប្រថាប់ត្រា គ.ល.ក. រួចបញ្ជូនឱ្យសាមីខ្លួនដើម្បីប្រើប្រាស់តាមការចាំបាច់ ដោយឱ្យមន្ត្រីសាមីមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង។',
                                    ],
                                },
                            ],
                        },
                        {
                            letter: 'ឃ.១',
                            title: 'ពាក្យស្នើសុំសម្ភារៈ',
                            steps: [
                                { text: 'ឯកសារចូលមក មន្ត្រីរដ្ឋបាល ស្កេនរក្សាទុកជាឯកសារ រួចដាក់ជូនប្រធាននាយកដ្ឋានកិច្ចការទូទៅ ពិនិត្យ និងសម្រេចផ្តល់ជូនតាមតម្រូវការជាក់ស្តែង' },
                                { text: 'បើកផ្តល់សម្ភារៈជូននាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ រួចមន្ត្រីទទួលសម្ភារៈកត់ថ្ងៃខែទទួល បញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលដើម្បីរក្សាទុក។' },
                            ],
                        },
                        {
                            letter: 'ឃ.២',
                            title: 'ពាក្យស្នើសុំអនុញ្ញាតឈប់',
                            steps: [
                                { text: 'ឯកសារចូលនាយកដ្ឋានកិច្ចការទូទៅស្កេនរក្សាទុកជាឯកសារ មន្ត្រីការិយាល័យធនធានមនុស្សពិនិត្យ និងផ្ទៀងផ្ទាត់' },
                                { text: 'ករណីស្នើសុំច្បាប់ឈប់សម្រាកចាប់ពី ៣ ថ្ងៃចុះក្រោម ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការរង ពិនិត្យ និងសម្រេច' },
                                { text: 'ករណីស្នើសុំច្បាប់ឈប់សម្រាកលើសពី ៣ ថ្ងៃ ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការរង ពិនិត្យ និងផ្តល់មតិខ្លីរួច ដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ ពិនិត្យ និងសម្រេច' },
                                { text: 'បន្ទាប់ពីទទួលបានការសម្រេចឯកភាពអនុញ្ញាតឈប់ នាយកដ្ឋានកិច្ចការទូទៅចុះថ្ងៃខែឆ្នាំ និងវាយក្តាឈ្មោះ រួចស្កេនរក្សាទុកជាឯកសារនិងបញ្ជូនទៅនាយកដ្ឋានជំនាញ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងចម្លងជូនការិយាល័យធនធានមនុស្សដើម្បីតាមដាន។' },
                            ],
                        },
                        {
                            letter: 'ង',
                            title: 'ឯកសារប័ណ្ណបង់ប្រាក់',
                            steps: [
                                { text: 'ឯកសារចូលមក នាយកដ្ឋានកិច្ចការទូទៅ បញ្ជូនទៅក្រុមការងារលេខារបស់ ឯកឧត្តមអគ្គលេខាធិការ បញ្ជូនបន្តដើម្បីស្នើសុំការពិនិត្យ និងសម្រេច' },
                                { text: 'បន្ទាប់ពីទទួលបានការសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមកនាយកដ្ឋានកិច្ចការទូទៅ រួចចុះលេខចេញ និងប្រថាប់ត្រារបស់ គ.ល.ក. រួចស្កេនរក្សាទុកជាឯកសារ រួចបញ្ជូនទៅនាយកដ្ឋានត្រួតពិនិត្យនិងគ្រប់គ្រងចំណូល ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង' },
                                { text: 'ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុក។' },
                            ],
                        },
                        {
                            letter: 'ច',
                            title: 'ឯកសារដែលត្រូវចម្លងជូនក្រសួង-ស្ថាប័ន និងរដ្ឋបាលរាជធានី-ខេត្ត',
                            steps: [
                                { text: 'នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវចម្លងឯកសារថតចម្លងក្រាក្រម និងបញ្ជូនឱ្យដល់គោលដៅតាមគ្រប់មធ្យោបាយ (នៅរាជធានីភ្នំពេញយកទៅផ្ទាល់ និងនៅតាមបណ្ដាខេត្តដាក់តាមរយៈប្រៃសណីយ៍កម្ពុជា)។' },
                            ],
                        },
                    ],
                },
            ],
        }
    },
    computed: {
        // Every step in every section/group flattened into rows, for the
        // table view. Keeps sIdx/gIdx so sorting and "jump back to flow
        // view" both stay tied to the real, stable position in the data
        // (not to a possibly-reordered display index).
        tableRows() {
            const rows = [];
            this.sections.forEach((section, sIdx) => {
                section.groups.forEach((group, gIdx) => {
                    group.steps.forEach((step, stIdx) => {
                        rows.push({
                            id: sIdx + '_' + gIdx + '_' + stIdx,
                            sIdx,
                            gIdx,
                            sectionRoman: section.roman,
                            sectionTitle: section.title,
                            groupLetter: group.letter,
                            groupTitle: group.title,
                            stepNum: stIdx + 1,
                            text: step.text,
                            sub: step.sub || [],
                        });
                    });
                });
            });
            return rows;
        },

        filteredTableRows() {
            const query = this.search.trim().toLowerCase();
            let rows = this.tableRows;
            if (query) {
                rows = rows.filter(row =>
                    row.groupTitle.toLowerCase().includes(query) ||
                    row.sectionTitle.toLowerCase().includes(query) ||
                    row.text.toLowerCase().includes(query) ||
                    row.sub.some(s => s.toLowerCase().includes(query))
                );
            }

            const { key, dir } = this.tableSort;
            const sorted = [...rows].sort((a, b) => {
                let av = a[key];
                let bv = b[key];
                if (typeof av === 'string') {
                    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
                }
                return dir === 'asc' ? av - bv : bv - av;
            });
            return sorted;
        },
    },
    methods: {
        sortBy(key) {
            if (this.tableSort.key === key) {
                this.tableSort = { key, dir: this.tableSort.dir === 'asc' ? 'desc' : 'asc' };
            } else {
                this.tableSort = { key, dir: 'asc' };
            }
        },

        // Opens a group (used by both the flowchart nodes and table rows)
        // and scrolls it into view, since it may be off-screen or still
        // collapsed.
        focusGroup(sIdx, gIdx) {
            const key = this.groupKey(sIdx, gIdx);
            this.openGroups = { ...this.openGroups, [key]: true };
            this.$nextTick(() => {
                const el = document.getElementById('group-' + sIdx + '-' + gIdx);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },

        groupKey(sIdx, gIdx) {
            return sIdx + '_' + gIdx;
        },
        isGroupOpen(sIdx, gIdx) {
            return !!this.openGroups[this.groupKey(sIdx, gIdx)];
        },
        toggleGroup(sIdx, gIdx) {
            const key = this.groupKey(sIdx, gIdx);
            this.openGroups = { ...this.openGroups, [key]: !this.openGroups[key] };
        },
        expandAll() {
            const section = this.sections[this.activeSection];
            const updated = { ...this.openGroups };
            section.groups.forEach((g, gIdx) => { updated[this.groupKey(this.activeSection, gIdx)] = true; });
            this.openGroups = updated;
        },
        collapseAll() {
            const section = this.sections[this.activeSection];
            const updated = { ...this.openGroups };
            section.groups.forEach((g, gIdx) => { updated[this.groupKey(this.activeSection, gIdx)] = false; });
            this.openGroups = updated;
        },
        filteredGroups(section) {
            const query = this.search.trim().toLowerCase();
            // Tag every group with its real index in section.groups (_gIdx).
            // Filtering can drop earlier groups, which would otherwise shift
            // everything after them — so the v-for position can't be used
            // as "the" group index for opening/toggling/scrolling to it.
            if (!query) return section.groups.map((group, gIdx) => ({ ...group, _gIdx: gIdx }));
            return section.groups
                .map((group, gIdx) => {
                    const matchesTitle = group.title.toLowerCase().includes(query);
                    const steps = group.steps.filter(step => {
                        const inText = step.text.toLowerCase().includes(query);
                        const inSub = (step.sub || []).some(s => s.toLowerCase().includes(query));
                        return inText || inSub;
                    });
                    if (matchesTitle || steps.length) {
                        return { ...group, steps: matchesTitle ? group.steps : steps, _gIdx: gIdx };
                    }
                    return null;
                })
                .filter(Boolean);
        },
        highlight(text) {
            const query = this.search.trim();
            if (!query) return text;
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
        },
    },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');

.wflow {
    font-family: 'Kantumruy Pro', 'KHMER OS Battambang', 'Segoe UI', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.25rem 2.5rem;
}

.wflow__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
}
.wflow__title { font-size: 1.35rem; font-weight: 700; color: #1f4b58; margin: 0; }
.wflow__subtitle { font-size: 0.85rem; color: #64748b; margin: 0.15rem 0 0; }
.wflow__actions { display: flex; gap: 0.5rem; }
.wflow__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 0.6rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.wflow__btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.wflow__btn--ghost {
    background: #fff;
    color: #235567;
    border: 1px solid #dbe4e8;
    box-shadow: none;
}
.wflow__btn--ghost:hover { background: #f1f5f9; }

.wflow__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
}
.wflow__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 1px solid #dbe4e8;
    border-radius: 0.6rem;
    padding: 0.5rem 0.85rem;
    color: #94a3b8;
    flex: 1;
    min-width: 220px;
    max-width: 340px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.wflow__search:focus-within { border-color: #235567; box-shadow: 0 0 0 3px rgba(35,85,103,0.12); }
.wflow__search input { border: none; outline: none; font-size: 0.85rem; width: 100%; color: #1e293b; background: transparent; }

.wflow__tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.wflow__tab {
    padding: 0.55rem 1.1rem;
    border-radius: 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    background: #eef2f5;
    transition: all 0.2s ease;
}
.wflow__tab:hover { background: #e2e8ee; color: #1f4b58; }
.wflow__tab--active {
    color: #fff;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    box-shadow: 0 2px 8px rgba(35,85,103,0.25);
}

.wflow__section { display: flex; flex-direction: column; gap: 0.75rem; }

.wflow__group {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    overflow: hidden;
}
.wflow__group-head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1.1rem;
    text-align: left;
    transition: background-color 0.15s ease;
}
.wflow__group-head:hover { background: #f8fafc; }
.wflow__group-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.2rem;
    height: 2.2rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
}
.wflow__group-title { flex: 1; font-weight: 600; color: #1e293b; font-size: 0.95rem; }
.wflow__chevron { color: #94a3b8; transition: transform 0.25s ease; flex-shrink: 0; }
.wflow__chevron--open { transform: rotate(180deg); color: #235567; }

.wflow__steps { padding: 0.25rem 1.25rem 1.25rem 1.5rem; }
.wflow__step { display: flex; gap: 0.9rem; }
.wflow__step-marker { display: flex; flex-direction: column; align-items: center; position: relative; }

/* Small "Start" / "End" pills that sit right above/below the first and
   last node of each group, so the flow's boundaries are unmistakable at
   a glance instead of just being "the first/last numbered circle". */
.wflow__step-flag {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #2b6f80;
    background: #eaf3f5;
    border: 1px solid #cfe3e7;
    border-radius: 999px;
    padding: 0.12rem 0.5rem;
    margin-bottom: 0.4rem;
    white-space: nowrap;
    flex-shrink: 0;
}
.wflow__step-flag--end {
    margin-bottom: 0;
    margin-top: 0.4rem;
    color: #16875a;
    background: #eafaf3;
    border-color: #c9ecdd;
}

.wflow__step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    box-shadow: 0 3px 8px rgba(35,85,103,0.35), 0 0 0 4px rgba(43,111,128,0.12);
    transition: transform 0.15s ease;
}
.wflow__step-num--end {
    background: linear-gradient(135deg, #22a06b, #16875a);
    box-shadow: 0 3px 8px rgba(22,135,90,0.35), 0 0 0 4px rgba(34,160,107,0.14);
}
.wflow__step-check { width: 0.9rem; height: 0.9rem; }

/* The connecting line now visibly "flows" downward (moving dashes)
   toward the next step, with a small arrow riding on it, instead of a
   plain static bar. */
.wflow__step-line {
    position: relative;
    flex: 1;
    width: 3px;
    margin: 0.3rem 0;
    min-height: 1.15rem;
    border-radius: 999px;
    background-image: repeating-linear-gradient(180deg, #2b6f80 0, #2b6f80 6px, transparent 6px, transparent 13px);
    background-size: 3px 26px;
    background-repeat: repeat-y;
    animation: wflow-flow 1.1s linear infinite;
    display: flex;
    align-items: center;
    justify-content: center;
}
@keyframes wflow-flow {
    from { background-position: 0 0; }
    to { background-position: 0 26px; }
}
.wflow__step-arrow {
    position: relative;
    width: 0.95rem;
    height: 0.95rem;
    padding: 0.2rem;
    box-sizing: content-box;
    color: #2b6f80;
    background: #eaf3f5;
    border: 1px solid #cfe3e7;
    border-radius: 999px;
}

.wflow__step-body { padding-bottom: 1.15rem; flex: 1; }
.wflow__step--end .wflow__step-body { padding-bottom: 0.4rem; }
.wflow__step-text { margin: 0.05rem 0 0; font-size: 0.88rem; line-height: 1.7; color: #334155; }
.wflow__step-sub { margin: 0.5rem 0 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.wflow__step-sub li { font-size: 0.84rem; line-height: 1.6; color: #475569; list-style: disc; }
.wflow__step-text :deep(mark), .wflow__step-sub :deep(mark) { background: #fde68a; border-radius: 0.2rem; padding: 0 0.1rem; }

.wflow__empty { text-align: center; padding: 2rem; font-size: 0.85rem; color: #94a3b8; }

.wflow-collapse-enter-active, .wflow-collapse-leave-active { transition: all 0.2s ease; overflow: hidden; }
.wflow-collapse-enter-from, .wflow-collapse-leave-to { max-height: 0; opacity: 0; }
.wflow-collapse-enter-to, .wflow-collapse-leave-from { max-height: 2000px; opacity: 1; }

/* Flow / Table view toggle */
.wflow__view-toggle {
    display: inline-flex;
    background: #eef2f5;
    border-radius: 0.6rem;
    padding: 0.2rem;
    gap: 0.2rem;
}
.wflow__view-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border-radius: 0.45rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    transition: all 0.15s ease;
}
.wflow__view-btn:hover { color: #1f4b58; }
.wflow__view-btn--active {
    color: #fff;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    box-shadow: 0 2px 6px rgba(35,85,103,0.25);
}

/* Whole-process flowchart: wraps to as many rows as needed, boxes
   connected by arrows in process order. */
.wflow__diagram {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    padding: 1rem 1.1rem;
}
.wflow__diagram-node {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.9rem;
    border-radius: 0.6rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    max-width: 220px;
    text-align: left;
    transition: all 0.15s ease;
}
.wflow__diagram-node:hover {
    border-color: #2b6f80;
    background: #eaf3f5;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(35,85,103,0.15);
}
.wflow__diagram-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.7rem;
    height: 1.7rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #2b6f80, #235a68);
    color: #fff;
    font-weight: 700;
    font-size: 0.72rem;
    flex-shrink: 0;
}
.wflow__diagram-title {
    font-size: 0.76rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.wflow__diagram-arrow {
    width: 1.1rem;
    height: 1.1rem;
    color: #94a3b8;
    flex-shrink: 0;
}

/* Table view */
.wflow__table-wrap {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    overflow: auto;
}
.wflow__table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.wflow__table thead th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    color: #475569;
    text-align: left;
    font-weight: 700;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
}
.wflow__table thead th:hover { color: #235567; }
.wflow__sort-icon { font-size: 0.6rem; margin-left: 0.2rem; color: #2b6f80; }
.wflow__table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background-color 0.12s ease;
}
.wflow__table tbody tr:hover { background: #f8fafc; }
.wflow__table tbody tr:last-child { border-bottom: none; }
.wflow__table td { padding: 0.75rem 1rem; vertical-align: top; color: #334155; }
.wflow__table-num-col { width: 3.5rem; text-align: center; }
.wflow__table-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.6rem;
    height: 1.4rem;
    padding: 0 0.4rem;
    border-radius: 999px;
    background: #eaf3f5;
    color: #235567;
    font-weight: 700;
    font-size: 0.68rem;
    margin-right: 0.4rem;
}
.wflow__table-tag--group { background: #eafaf3; color: #16875a; }
.wflow__table-subtext { font-size: 0.78rem; color: #64748b; }
.wflow__table td:first-child, .wflow__table td:nth-child(2) { white-space: nowrap; }
.wflow__table p { margin: 0; line-height: 1.6; }
.wflow__table :deep(mark) { background: #fde68a; border-radius: 0.2rem; padding: 0 0.1rem; }

@media (max-width: 640px) {
    .wflow__header { flex-direction: column; }
    .wflow__toolbar { flex-direction: column; align-items: stretch; }
    .wflow__search { max-width: none; }
    .wflow__actions { width: 100%; justify-content: space-between; }
    .wflow__table td:first-child, .wflow__table td:nth-child(2) { white-space: normal; }
}
</style>