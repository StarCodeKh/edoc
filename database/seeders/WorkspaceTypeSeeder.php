<?php

namespace Database\Seeders;

use App\Models\WorkspaceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WorkspaceTypeSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('workspace_types')->truncate();
        Schema::enableForeignKeyConstraints();

        $types = [
            ['name' => 'ប្រកាស', 'code' => 'ប្រក'],
            ['name' => 'សេចក្តីសម្រេច', 'code' => 'សសរ'],
            ['name' => 'សារាចរ', 'code' => 'សារ'],
            ['name' => 'សេចក្តីជូនដំណឹង', 'code' => 'សជណ'],
            ['name' => 'លិខិតបង្គាប់ការ', 'code' => 'លបក'],
            ['name' => 'សៀវភៅបន្ទុក', 'code' => 'សប'],
            ['name' => 'កំណត់ហេតុ', 'code' => 'កណហ'],
            ['name' => 'លិខិតអំពាវនាវ', 'code' => 'លអន'],
            ['name' => 'លិខិតកោតសរសើរ', 'code' => 'លកស'],
            ['name' => 'លិខិតថ្លែងអំណរគុណ', 'code' => 'លថអ'],
            ['name' => 'សេចក្តីប្រកាសព័ត៌មាន', 'code' => 'ប្រកព'],
            ['name' => 'សេចក្តីណែនាំ', 'code' => 'សណន'],
            ['name' => 'វិញ្ញាបនបត្រចុះបញ្ជី', 'code' => 'វិចប'],
            ['name' => 'លិខិតចាត់បញ្ជូន', 'code' => 'លចប'],
            ['name' => 'ប័ណ្ណសរសើរ', 'code' => 'បសស'],
            ['name' => 'លិខិតអនុញ្ញាតប៉ុស្តិ៍សេវារំលែកផ្សែងសំណាង', 'code' => 'លអប'],
            ['name' => 'លិខិតប្រគល់សិទ្ធិ', 'code' => 'លបស'],
            ['name' => 'លិខិតប្រគល់ភារកិច្ច', 'code' => 'លបភ'],
            ['name' => 'ឯកសារផ្សេងៗ', 'code' => null],
        ];

        foreach ($types as $type) {
            WorkspaceType::create([
                'name' => $type['name'],
                'code' => $type['code'],
            ]);
        }
    }
}
