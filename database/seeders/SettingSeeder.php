<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('settings')->truncate();
        DB::table('settings')->insert(['name' => 'eDoc', 'slug' => 'app_name', 'type' => 'text', 'value' => 'eDoc']);
        DB::table('settings')->insert(['name' => 'Enable Registration', 'slug' => 'enable_registration', 'type' => 'text', 'value' => '1']);
        DB::table('settings')->insert(['name' => 'Enable Pre-made Board', 'slug' => 'enable_pre_made_board', 'type' => 'text', 'value' => '1']);
        DB::table('settings')->insert(['name' => 'Default Language', 'slug' => 'default_language', 'type' => 'text', 'value' => 'en']);
        DB::table('settings')->insert(['name' => 'Pre-made Board Lists', 'slug' => 'pre_made_board_list', 'type' => 'text', 'value' => json_encode(['ទទួលឯកសារ','ត្រួតពិនិត្យ', 'ចាត់តាំងការងារជូន', 'ត្រួតពិនិត្យ និងព្រាងសេចក្តី','ផ្ទៀងផ្ទាត់សេចក្តីព្រាង','រង់ចាំការអនុម័ត និងចុះហត្ថលេខា','ចេញលេខផ្លូវការ និងបញ្ជូនទៅ CO','រក្សាទុកបណ្ណសារ / បិទរឿង'])]);

        DB::table('settings')->insert([
            'name' => 'Allowed Upload Types', 'slug' => 'allowed_file_types', 'type' => 'json',
            'value' => json_encode([
                'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
                'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
                'mp3', 'wav',
                'mp4', 'webm',
                'zip', 'rar', '7z'])
        ]);
    }
}
