import { Head } from "@inertiajs/vue3";
import { L as Layout, I as Icon } from "./Layout-DXJEf-iu.js";
import { resolveComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./FlashMessages-DizfipYZ.js";
import "@popperjs/core";
import "axios";
import "uuid";
import "moment";
import "moment-duration-format";
import "laravel-vue-i18n";
const _sfc_main = {
  name: "document-workflow",
  components: { Head, Icon },
  layout: Layout,
  props: {
    title: { type: String, default: "Document Workflow" }
  },
  data() {
    return {
      search: "",
      activeSection: 0,
      openGroups: {},
      sections: [
        {
          roman: "I",
          title: "ឯកសារចូលពីក្រៅ",
          groups: [
            {
              letter: "ក",
              title: "ឯកសារមកពីក្រសួង-ស្ថាប័នរដ្ឋ",
              steps: [
                { text: "មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យ និងវាយក្តាចូលរបស់ អ.គ.ល.ក. រួចស្កេនរួចបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន ឡើយវាយបញ្ចូលក្នុង Excel File ដើម្បីធ្វើការតាមដានដំណើរការឯកសារ និងថតចម្លងរក្សាទុកជាឯកសាររដ្ឋបាល បន្ទាប់មកបញ្ជូនឯកសារទៅក្រុមការងារលេខាដើម្បីដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ តាមពេលវេលាកំណត់ និងជាក់ស្តែង" },
                { text: "នៅពេលឯកសារចេញពីឯកឧត្តមអគ្គលេខាធិការ មន្ត្រីរដ្ឋបាលធ្វើការស្កេនរក្សាទុក រួចប្រែងប្រែកទៅ នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ តាមចំណាត់របស់ ឯកឧត្តមអគ្គលេខាធិការ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន និងបញ្ចូលក្នុង Excel File ដើម្បីតាមដានដំណើរការឯកសារបន្ត។" }
              ]
            },
            {
              letter: "ខ.១",
              title: "ឯកសារមកពីក្រុមហ៊ុន/ស្ថាប័នឯកជន — ឯកសារសំណើទូទៅ",
              steps: [
                { text: "មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យ ករណីឯកសារត្រឹមត្រូវនឹងវាយក្តាចូលរបស់ អ.គ.ល.ក. រួចថតចម្លងឯកសារដែលមានក្តាចូលរបស់ អ.គ.ល.ក. ១ សន្លឹកជូនក្រុមហ៊ុន។ ប៉ុន្តែក្រណីបើឯកសារណាដែលមានភាពស្រពិចស្រពិល ឬមិនច្បាស់លាស់ ការិយាល័យរដ្ឋបាលនឹងស្នើសុំការបញ្ជាក់ពីប្រធាននាយកដ្ឋានកិច្ចការទូទៅ មុននឹងទទួលឯកសារនោះ" },
                { text: "បន្ទាប់ពីវាយក្តាចូលរបស់ អ.គ.ល.ក. ស្កេន និងរួចបញ្ចូលក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្នឡើយ វាយបញ្ចូលក្នុង Excel File ដើម្បីធ្វើការតាមដានដំណើរការឯកសារ រួចរាល់ត្រូវបញ្ជូនឯកសារទៅការិយាល័យក្រុមការងាររបស់ ឯកឧត្តមអគ្គលេខាធិការ តាមពេលវេលាកំណត់ និងជាក់ស្តែង" },
                { text: "នៅពេលឯកសារចេញពីឯកឧត្តមអគ្គលេខាធិការ មន្ត្រីរដ្ឋបាលធ្វើការស្កេនរក្សាទុក រួចប្រែងប្រែកទៅ នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ តាមចំណាត់របស់ ឯកឧត្តមអគ្គលេខាធិការ" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុករួចបញ្ជូលក្នុងប្រព័ន្ធនិងក្នុង Excel File ដើម្បីតាមដានដំណើរការឯកសារបន្ត។" }
              ]
            },
            {
              letter: "ខ.២",
              title: "ឯកសារប្រកាសចំណូលកិច្ចពិសព ល្បែងផ្សងសំណាង/កាស៊ីណូ និងបង់មូលនិធិសង្គមរបស់ គ.ល.ក. ប្រចាំខែ",
              steps: [
                { text: "ឯកសារចូលមក មន្ត្រីរដ្ឋបាលនឹងថតចម្លង ១ សន្លឹកដើម្បីថ្ងៃខែទទួលជូនក្រុមហ៊ុន រួចបញ្ជូនឯកសារទៅនាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល ដើម្បីចេញប័ណ្ណបង់ប្រាក់ជូនក្រុមហ៊ុន ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុក និងតាមដាន។" }
              ]
            },
            {
              letter: "ខ.៣",
              title: "ប្រភេទវិក្កយបត្រង់ប្រាក់របស់ក្រុមហ៊ុន",
              steps: [
                { text: "ឯកសារចូលមក មន្ត្រីរដ្ឋបាលធ្វើការត្រួតពិនិត្យលើច្បាប់ដើម ករណីត្រឹមត្រូវនឹងថតចម្លងចំនួន ៣ សន្លឹក ដោយ ១ សន្លឹកថ្ងៃខែទទួលពីក្រុមហ៊ុន និង ២ សន្លឹកទៀតវាយក្តាបញ្ជាក់ថតចម្លងត្រឹមត្រូវតាមច្បាប់ដើមនិងស្កេនរក្សាទុកជាឯកសារ រួចផ្តល់ច្បាប់ដើមជូនក្រុមហ៊ុនវិញ" },
                { text: "រួចបញ្ជូនឯកសារទៅនាយកដ្ឋានត្រួតពិនិត្យ និងគ្រប់គ្រងចំណូល និងនាយកដ្ឋានពាក់ព័ន្ធ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងតាមដាន។" }
              ]
            }
          ]
        },
        {
          roman: "II",
          title: "ឯកសារចូលពីនាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ",
          groups: [
            {
              letter: "ក",
              title: "ឯកសារឆ្លើយតបទៅក្រសួង-ស្ថាប័ន និង/ឬក្រុមហ៊ុន",
              steps: [
                { text: "នាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ មានរយៈពេល ៣ ថ្ងៃសម្រាប់ឯកសារធម្មតាដើម្បីរៀបចំនិងផ្តល់យោបល់ជូន ថ្នាក់ដឹកនាំ បន្ទាប់ពីទទួលបានចំណាត់ពីឯកឧត្តមអគ្គលេខាធិការលើឯកសារចូលពីក្រៅ ដោយដាក់មកតាមរយៈនាយកដ្ឋានកិច្ចការទូទៅ និងចំពោះឯកសារប្រញាប់ត្រូវរៀបចំបញ្ជូនមក ឯកឧត្តមអគ្គលេខាធិការ នៅក្នុងថ្ងៃតែមួយ ឬបន់ស្បែនតាមទំហំការងារ។" },
                { text: "បន្ទាប់ពីនាយកដ្ឋានកិច្ចការទូទៅ ទទួលបានឯកសារពីនាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ នាយកដ្ឋានកិច្ចការទូទៅត្រូវស្កេនទុកក្នុងប្រព័ន្ធគ្រប់គ្រងឯកសាររដ្ឋបាលបណ្ដោះអាសន្ន និងបញ្ចូលក្នុង Excel File ដើម្បីតាមដានដំណើរការ រួចបញ្ជូនទៅឯកឧត្តមអគ្គលេខាធិការរង ដើម្បីពិនិត្យ និងផ្តល់យោបល់ ដែលមានរយៈពេលចំនួន ១ ថ្ងៃ" },
                { text: "ករណីឯកសារមានការកែសម្រួល D1 បញ្ជូនទៅនាយកដ្ឋានជំនាញដើម្បីកែសម្រួលវិញ រួចដាក់មក D1 វិញ រួចអនុវត្តចំណុចទី២ខាងលើម្តងទៀត" },
                { text: "បន្ទាប់ពី ឯកឧត្តមអគ្គលេខាធិការរង បានពិនិត្យ និងផ្តល់យោបល់រួច ត្រូវបញ្ជូនឯកសារទៅក្រុមការងារលេខារបស់ ឯកឧត្តមអគ្គលេខាធិការ ដើម្បីពិនិត្យសម្រេច និងបច្ចុប្បន្នភាពដំណើរការក្នុង Excel File" },
                { text: "ករណីឯកសារមានការកែសម្រួល D1 បញ្ជូនទៅនាយកដ្ឋានជំនាញដើម្បីកែសម្រួលវិញ រួចដាក់មក D1 វិញ រួចអនុវត្តការងារពីចំណុចទី២ខាងលើតាមដំណាក់កាលឡើងវិញ" },
                { text: "បន្ទាប់ពីទទួលបានការពិនិត្យសម្រេចពី ឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមក D1 ករណីមានលិខិតភ្ជាប់ទៅក្រសួង-ស្ថាប័ន និង/ឬក្រុមហ៊ុន, D1 ត្រូវចុះលេខចេញ ប្រាប់ជូនក្រុមហ៊ុន ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងតាមដាន។" },
                { text: "ចំពោះឯកសារគោរពស្នើសុំការពិនិត្យ និងសម្រេចរបស់ ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យ ឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. នាយកដ្ឋានកិច្ចការទូទៅត្រូវចុះលេខចេញ និងបញ្ជូនទៅ ឯកឧត្តមរដ្ឋលេខាធិការក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុទទួលបន្ទុក ដើម្បីផ្តល់យោបល់រួចបញ្ជូនគោរពស្នើសុំការពិនិត្យ និងសម្រេចរបស់ ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. និងបញ្ចូលដំណើរការក្នុង Excel" },
                { text: "បន្ទាប់ពីទទួលបានការសម្រេចរបស់ឯកឧត្តមអគ្គបណ្ឌិតសភាចារ្យឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ និងជាប្រធាន គ.ល.ក. នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ ពិនិត្យ ករណីមានលិខិតភ្ជាប់ទៅក្រសួង-ស្ថាប័ននិង/ឬក្រុមហ៊ុន ត្រូវចុះលេខចេញ ប្រថាប់ត្រា គ.ល.ក. រួចស្កេនរក្សាទុក និងបញ្ចូលដំណើរការក្នុង Excel និងសុំការណែនាំបន្ថែមពីឯកឧត្តមអគ្គលេខាធិការ។" }
              ]
            },
            {
              letter: "ខ",
              title: "ឯកសារស្នើសុំទូទាត់ថវិកា និងឯកសារស្នើសុំលិខិតបញ្ជាក់រដ្ឋបាល",
              steps: [
                { text: "ឯកសារចូលមក មន្ត្រីរដ្ឋបាលស្កេនរក្សាទុកក្នុងប្រព័ន្ធរដ្ឋបាល រួចបញ្ជូនទៅប្រធាននាយកដ្ឋានកិច្ចការទូទៅ ដើម្បីចាត់ចែងបញ្ជូនទៅការិយាល័យជំនាញរៀបចំនីតិវិធីបន្ត" },
                { text: "ករណីឯកសារមិនត្រឹមត្រូវ នាយកដ្ឋានជំនាញត្រូវកែសម្រួល រួចដាក់មកនាយកដ្ឋានកិច្ចការទូទៅសារជាថ្មីរួច អនុវត្តចំណុចទី១ឡើងវិញ" },
                { text: "ករណីឯកសារត្រឹមត្រូវ នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវរៀបចំលើកសំណើសុំការពិនិត្យ និងសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ" },
                {
                  text: "បន្ទាប់ពីទទួលបានការសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមកនាយកដ្ឋានកិច្ចការទូទៅ",
                  sub: [
                    "ចំពោះឯកសារស្នើសុំទូទាត់ថវិកា បញ្ជូនឱ្យការិយាល័យហិរញ្ញវត្ថុ និងគណនេយ្យ បន្តនីតិវិធីគណនេយ្យជាមួយធនាគារ",
                    "ចំពោះលិខិតបញ្ជាក់រដ្ឋបាលរបស់មន្ត្រីត្រូវចុះលេខចេញ និងប្រថាប់ត្រា គ.ល.ក. រួចបញ្ជូនឱ្យសាមីខ្លួនដើម្បីប្រើប្រាស់តាមការចាំបាច់ ដោយឱ្យមន្ត្រីសាមីមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង។"
                  ]
                }
              ]
            },
            {
              letter: "ឃ.១",
              title: "ពាក្យស្នើសុំសម្ភារៈ",
              steps: [
                { text: "ឯកសារចូលមក មន្ត្រីរដ្ឋបាល ស្កេនរក្សាទុកជាឯកសារ រួចដាក់ជូនប្រធាននាយកដ្ឋានកិច្ចការទូទៅ ពិនិត្យ និងសម្រេចផ្តល់ជូនតាមតម្រូវការជាក់ស្តែង" },
                { text: "បើកផ្តល់សម្ភារៈជូននាយកដ្ឋាន/អង្គភាព/ក្រុមការងារ រួចមន្ត្រីទទួលសម្ភារៈកត់ថ្ងៃខែទទួល បញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលដើម្បីរក្សាទុក។" }
              ]
            },
            {
              letter: "ឃ.២",
              title: "ពាក្យស្នើសុំអនុញ្ញាតឈប់",
              steps: [
                { text: "ឯកសារចូលនាយកដ្ឋានកិច្ចការទូទៅស្កេនរក្សាទុកជាឯកសារ មន្ត្រីការិយាល័យធនធានមនុស្សពិនិត្យ និងផ្ទៀងផ្ទាត់" },
                { text: "ករណីស្នើសុំច្បាប់ឈប់សម្រាកចាប់ពី ៣ ថ្ងៃចុះក្រោម ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការរង ពិនិត្យ និងសម្រេច" },
                { text: "ករណីស្នើសុំច្បាប់ឈប់សម្រាកលើសពី ៣ ថ្ងៃ ត្រូវដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការរង ពិនិត្យ និងផ្តល់មតិខ្លីរួច ដាក់ជូន ឯកឧត្តមអគ្គលេខាធិការ ពិនិត្យ និងសម្រេច" },
                { text: "បន្ទាប់ពីទទួលបានការសម្រេចឯកភាពអនុញ្ញាតឈប់ នាយកដ្ឋានកិច្ចការទូទៅចុះថ្ងៃខែឆ្នាំ និងវាយក្តាឈ្មោះ រួចស្កេនរក្សាទុកជាឯកសារនិងបញ្ជូនទៅនាយកដ្ឋានជំនាញ ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុកនិងចម្លងជូនការិយាល័យធនធានមនុស្សដើម្បីតាមដាន។" }
              ]
            },
            {
              letter: "ង",
              title: "ឯកសារប័ណ្ណបង់ប្រាក់",
              steps: [
                { text: "ឯកសារចូលមក នាយកដ្ឋានកិច្ចការទូទៅ បញ្ជូនទៅក្រុមការងារលេខារបស់ ឯកឧត្តមអគ្គលេខាធិការ បញ្ជូនបន្តដើម្បីស្នើសុំការពិនិត្យ និងសម្រេច" },
                { text: "បន្ទាប់ពីទទួលបានការសម្រេចពីឯកឧត្តមអគ្គលេខាធិការ ឯកសារត្រូវបញ្ជូនមកនាយកដ្ឋានកិច្ចការទូទៅ រួចចុះលេខចេញ និងប្រថាប់ត្រារបស់ គ.ល.ក. រួចស្កេនរក្សាទុកជាឯកសារ រួចបញ្ជូនទៅនាយកដ្ឋានត្រួតពិនិត្យនិងគ្រប់គ្រងចំណូល ដោយឱ្យមន្ត្រីជំនាញមកទទួលឯកសារ និងចុះថ្ងៃខែទទួលលើច្បាប់ថតចម្លង" },
                { text: "ជាបញ្ចប់រៀបចំស្កេនឯកសារដែលមានថ្ងៃខែទទួលរបស់មន្ត្រីជំនាញ ដើម្បីរក្សាទុក។" }
              ]
            },
            {
              letter: "ច",
              title: "ឯកសារដែលត្រូវចម្លងជូនក្រសួង-ស្ថាប័ន និងរដ្ឋបាលរាជធានី-ខេត្ត",
              steps: [
                { text: "នាយកដ្ឋានកិច្ចការទូទៅ ត្រូវចម្លងឯកសារថតចម្លងក្រាក្រម និងបញ្ជូនឱ្យដល់គោលដៅតាមគ្រប់មធ្យោបាយ (នៅរាជធានីភ្នំពេញយកទៅផ្ទាល់ និងនៅតាមបណ្ដាខេត្តដាក់តាមរយៈប្រៃសណីយ៍កម្ពុជា)។" }
              ]
            }
          ]
        }
      ]
    };
  },
  methods: {
    groupKey(sIdx, gIdx) {
      return sIdx + "_" + gIdx;
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
      section.groups.forEach((g, gIdx) => {
        updated[this.groupKey(this.activeSection, gIdx)] = true;
      });
      this.openGroups = updated;
    },
    collapseAll() {
      const section = this.sections[this.activeSection];
      const updated = { ...this.openGroups };
      section.groups.forEach((g, gIdx) => {
        updated[this.groupKey(this.activeSection, gIdx)] = false;
      });
      this.openGroups = updated;
    },
    filteredGroups(section) {
      const query = this.search.trim().toLowerCase();
      if (!query) return section.groups;
      return section.groups.map((group) => {
        const matchesTitle = group.title.toLowerCase().includes(query);
        const steps = group.steps.filter((step) => {
          const inText = step.text.toLowerCase().includes(query);
          const inSub = (step.sub || []).some((s) => s.toLowerCase().includes(query));
          return inText || inSub;
        });
        if (matchesTitle || steps.length) {
          return { ...group, steps: matchesTitle ? group.steps : steps };
        }
        return null;
      }).filter(Boolean);
    },
    highlight(text) {
      const query = this.search.trim();
      if (!query) return text;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return text.replace(new RegExp("(" + escaped + ")", "gi"), "<mark>$1</mark>");
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = resolveComponent("Head");
  const _component_icon = resolveComponent("icon");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wflow" }, _attrs))} data-v-d32c5cfc>`);
  _push(ssrRenderComponent(_component_Head, {
    title: _ctx.$t($props.title)
  }, null, _parent));
  _push(`<div class="wflow__header" data-v-d32c5cfc><div data-v-d32c5cfc><h1 class="wflow__title" data-v-d32c5cfc>${ssrInterpolate(_ctx.$t("លំហូរការងារ នៃការគ្រប់គ្រងឯកសាររដ្ឋបាល"))}</h1><p class="wflow__subtitle" data-v-d32c5cfc>${ssrInterpolate(_ctx.$t("Administrative Document Management Workflow"))}</p></div><div class="wflow__actions" data-v-d32c5cfc><button type="button" class="wflow__btn" data-v-d32c5cfc>`);
  _push(ssrRenderComponent(_component_icon, {
    class: "w-4 h-4",
    name: "plus"
  }, null, _parent));
  _push(` ${ssrInterpolate(_ctx.$t("Expand All"))}</button><button type="button" class="wflow__btn wflow__btn--ghost" data-v-d32c5cfc>${ssrInterpolate(_ctx.$t("Collapse All"))}</button></div></div><div class="wflow__toolbar" data-v-d32c5cfc><div class="wflow__search" data-v-d32c5cfc><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" data-v-d32c5cfc><circle cx="11" cy="11" r="7" data-v-d32c5cfc></circle><path d="M21 21l-4.3-4.3" stroke-linecap="round" data-v-d32c5cfc></path></svg><input${ssrRenderAttr("value", $data.search)} type="text"${ssrRenderAttr("placeholder", _ctx.$t("Search steps..."))} data-v-d32c5cfc></div><div class="wflow__tabs" data-v-d32c5cfc><!--[-->`);
  ssrRenderList($data.sections, (section, sIdx) => {
    _push(`<button type="button" class="${ssrRenderClass([{ "wflow__tab--active": $data.activeSection === sIdx }, "wflow__tab"])}" data-v-d32c5cfc>${ssrInterpolate(section.roman)}. ${ssrInterpolate(_ctx.$t(section.title))}</button>`);
  });
  _push(`<!--]--></div></div><!--[-->`);
  ssrRenderList($data.sections, (section, sIdx) => {
    _push(`<div class="wflow__section" style="${ssrRenderStyle($data.activeSection === sIdx ? null : { display: "none" })}" data-v-d32c5cfc><!--[-->`);
    ssrRenderList($options.filteredGroups(section), (group, gIdx) => {
      _push(`<div class="wflow__group" data-v-d32c5cfc><button type="button" class="wflow__group-head" data-v-d32c5cfc><span class="wflow__group-badge" data-v-d32c5cfc>${ssrInterpolate(group.letter)}</span><span class="wflow__group-title" data-v-d32c5cfc>${ssrInterpolate(_ctx.$t(group.title))}</span><svg viewBox="0 0 24 24" class="${ssrRenderClass([{ "wflow__chevron--open": $options.isGroupOpen(sIdx, gIdx) }, "w-5 h-5 wflow__chevron"])}" fill="none" stroke="currentColor" stroke-width="2" data-v-d32c5cfc><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" data-v-d32c5cfc></path></svg></button>`);
      if ($options.isGroupOpen(sIdx, gIdx)) {
        _push(`<div class="wflow__steps" data-v-d32c5cfc><!--[-->`);
        ssrRenderList(group.steps, (step, stIdx) => {
          _push(`<div class="wflow__step" data-v-d32c5cfc><div class="wflow__step-marker" data-v-d32c5cfc><span class="wflow__step-num" data-v-d32c5cfc>${ssrInterpolate(stIdx + 1)}</span>`);
          if (stIdx < group.steps.length - 1) {
            _push(`<span class="wflow__step-line" data-v-d32c5cfc></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="wflow__step-body" data-v-d32c5cfc><p class="wflow__step-text" data-v-d32c5cfc>${$options.highlight(step.text) ?? ""}</p>`);
          if (step.sub && step.sub.length) {
            _push(`<ul class="wflow__step-sub" data-v-d32c5cfc><!--[-->`);
            ssrRenderList(step.sub, (subItem, subIdx) => {
              _push(`<li data-v-d32c5cfc>${$options.highlight(subItem) ?? ""}</li>`);
            });
            _push(`<!--]--></ul>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    });
    _push(`<!--]-->`);
    if (!$options.filteredGroups(section).length) {
      _push(`<div class="wflow__empty" data-v-d32c5cfc>${ssrInterpolate(_ctx.$t("No matching steps found."))}</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  });
  _push(`<!--]--></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Workspaces/Documentworkflow.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Documentworkflow = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d32c5cfc"]]);
export {
  Documentworkflow as default
};
