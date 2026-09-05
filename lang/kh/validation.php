<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute ត្រូវតែទទួលយក។',
    'active_url' => ':attribute មិនមែនជា URL ត្រឹមត្រូវទេ។',
    'after' => ':attribute ត្រូវតែជាកាលបរិច្ឆេទក្រោយ :date។',
    'after_or_equal' => ':attribute ត្រូវតែជាកាលបរិច្ឆេទក្រោយ ឬស្មើនឹង :date។',
    'alpha' => ':attribute អាចមានតែអក្សរប៉ុណ្ណោះ។',
    'alpha_dash' => ':attribute អាចមានតែអក្សរ លេខ សញ្ញាដាច់ និងសញ្ញាគូសក្រោមប៉ុណ្ណោះ។',
    'alpha_num' => ':attribute អាចមានតែអក្សរ និងលេខប៉ុណ្ណោះ។',
    'array' => ':attribute ត្រូវតែជាអារេ។',
    'before' => ':attribute ត្រូវតែជាកាលបរិច្ឆេទមុន :date។',
    'before_or_equal' => ':attribute ត្រូវតែជាកាលបរិច្ឆេទមុន ឬស្មើនឹង :date។',
    'between' => [
        'numeric' => ':attribute ត្រូវតែនៅចន្លោះ :min និង :max។',
        'file' => ':attribute ត្រូវតែនៅចន្លោះ :min និង :max គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែនៅចន្លោះ :min និង :max តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមានចន្លោះពី :min ដល់ :max ធាតុ។',
    ],
    'boolean' => 'វាល :attribute ត្រូវតែជា true ឬ false។',
    'confirmed' => 'ការបញ្ជាក់ :attribute មិនត្រូវគ្នាទេ។',
    'date' => ':attribute មិនមែនជាកាលបរិច្ឆេទត្រឹមត្រូវទេ។',
    'date_equals' => ':attribute ត្រូវតែជាកាលបរិច្ឆេទស្មើនឹង :date។',
    'date_format' => ':attribute មិនត្រូវនឹងទម្រង់ :format ទេ។',
    'different' => ':attribute និង :other ត្រូវតែខុសគ្នា។',
    'digits' => ':attribute ត្រូវតែមាន :digits ខ្ទង់។',
    'digits_between' => ':attribute ត្រូវតែមានចន្លោះពី :min ដល់ :max ខ្ទង់។',
    'dimensions' => ':attribute មានទំហំរូបភាពមិនត្រឹមត្រូវ។',
    'distinct' => 'វាល :attribute មានតម្លៃស្ទួន។',
    'email' => ':attribute ត្រូវតែជាអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។',
    'exists' => ':attribute ដែលបានជ្រើសរើស មិនត្រឹមត្រូវទេ។',
    'file' => ':attribute ត្រូវតែជាឯកសារ។',
    'filled' => 'វាល :attribute ត្រូវតែមានតម្លៃ។',
    'gt' => [
        'numeric' => ':attribute ត្រូវតែធំជាង :value។',
        'file' => ':attribute ត្រូវតែធំជាង :value គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែវែងជាង :value តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមានច្រើនជាង :value ធាតុ។',
    ],
    'gte' => [
        'numeric' => ':attribute ត្រូវតែធំជាង ឬស្មើនឹង :value។',
        'file' => ':attribute ត្រូវតែធំជាង ឬស្មើនឹង :value គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែវែងជាង ឬស្មើនឹង :value តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមាន :value ធាតុ ឬច្រើនជាងនេះ។',
    ],
    'image' => ':attribute ត្រូវតែជារូបភាព។',
    'in' => ':attribute ដែលបានជ្រើសរើស មិនត្រឹមត្រូវទេ។',
    'in_array' => 'វាល :attribute មិនមាននៅក្នុង :other ទេ។',
    'integer' => ':attribute ត្រូវតែជាចំនួនគត់។',
    'ip' => ':attribute ត្រូវតែជាអាសយដ្ឋាន IP ត្រឹមត្រូវ។',
    'ipv4' => ':attribute ត្រូវតែជាអាសយដ្ឋាន IPv4 ត្រឹមត្រូវ។',
    'ipv6' => ':attribute ត្រូវតែជាអាសយដ្ឋាន IPv6 ត្រឹមត្រូវ។',
    'json' => ':attribute ត្រូវតែជាខ្សែអក្សរ JSON ត្រឹមត្រូវ។',
    'lt' => [
        'numeric' => ':attribute ត្រូវតែតូចជាង :value។',
        'file' => ':attribute ត្រូវតែតូចជាង :value គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែខ្លីជាង :value តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមានតិចជាង :value ធាតុ។',
    ],
    'lte' => [
        'numeric' => ':attribute ត្រូវតែតូចជាង ឬស្មើនឹង :value។',
        'file' => ':attribute ត្រូវតែតូចជាង ឬស្មើនឹង :value គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែខ្លីជាង ឬស្មើនឹង :value តួអក្សរ។',
        'array' => ':attribute មិនត្រូវមានលើសពី :value ធាតុទេ។',
    ],
    'max' => [
        'numeric' => ':attribute មិនត្រូវធំជាង :max ទេ។',
        'file' => ':attribute មិនត្រូវធំជាង :max គីឡូបៃទេ។',
        'string' => ':attribute មិនត្រូវវែងជាង :max តួអក្សរទេ។',
        'array' => ':attribute មិនត្រូវមានលើសពី :max ធាតុទេ។',
    ],
    'mimes' => ':attribute ត្រូវតែជាឯកសារប្រភេទ៖ :values។',
    'mimetypes' => ':attribute ត្រូវតែជាឯកសារប្រភេទ៖ :values។',
    'min' => [
        'numeric' => ':attribute ត្រូវតែយ៉ាងតិច :min។',
        'file' => ':attribute ត្រូវតែយ៉ាងតិច :min គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែយ៉ាងតិច :min តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមានយ៉ាងតិច :min ធាតុ។',
    ],
    'not_in' => ':attribute ដែលបានជ្រើសរើស មិនត្រឹមត្រូវទេ។',
    'not_regex' => 'ទម្រង់ :attribute មិនត្រឹមត្រូវទេ។',
    'numeric' => ':attribute ត្រូវតែជាលេខ។',
    'present' => 'វាល :attribute ត្រូវតែមានវត្តមាន។',
    'regex' => 'ទម្រង់ :attribute មិនត្រឹមត្រូវទេ។',
    'required' => 'វាល :attribute ត្រូវតែបំពេញ។',
    'required_if' => 'វាល :attribute ត្រូវតែបំពេញ នៅពេល :other គឺ :value។',
    'required_unless' => 'វាល :attribute ត្រូវតែបំពេញ លុះត្រាតែ :other នៅក្នុង :values។',
    'required_with' => 'វាល :attribute ត្រូវតែបំពេញ នៅពេលមាន :values។',
    'required_with_all' => 'វាល :attribute ត្រូវតែបំពេញ នៅពេលមាន :values ទាំងអស់។',
    'required_without' => 'វាល :attribute ត្រូវតែបំពេញ នៅពេលគ្មាន :values។',
    'required_without_all' => 'វាល :attribute ត្រូវតែបំពេញ នៅពេលគ្មាន :values ណាមួយឡើយ។',
    'same' => ':attribute និង :other ត្រូវតែដូចគ្នា។',
    'size' => [
        'numeric' => ':attribute ត្រូវតែជា :size។',
        'file' => ':attribute ត្រូវតែមាន :size គីឡូបៃ។',
        'string' => ':attribute ត្រូវតែមាន :size តួអក្សរ។',
        'array' => ':attribute ត្រូវតែមាន :size ធាតុ។',
    ],
    'starts_with' => ':attribute ត្រូវតែចាប់ផ្តើមដោយមួយក្នុងចំណោម៖ :values',
    'string' => ':attribute ត្រូវតែជាខ្សែអក្សរ។',
    'timezone' => ':attribute ត្រូវតែជាតំបន់ពេលវេលាត្រឹមត្រូវ។',
    'unique' => ':attribute នេះត្រូវបានប្រើរួចហើយ។',
    'uploaded' => ':attribute បរាជ័យក្នុងការផ្ទុកឡើង។',
    'url' => 'ទម្រង់ :attribute មិនត្រឹមត្រូវទេ។',
    'uuid' => ':attribute ត្រូវតែជា UUID ត្រឹមត្រូវ។',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
