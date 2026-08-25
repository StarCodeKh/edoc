<?php

namespace Database\Seeders;

use App\Models\Priority;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PrioritySeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('priorities')->truncate();
        Schema::enableForeignKeyConstraints();

        $priorities = [
            ['name' => 'ធម្មតា', 'color' => '#9ca3af', 'order' => 1],
            ['name' => 'បន្ទាន់', 'color' => '#f59e0b', 'order' => 2],
            ['name' => 'បន្ទាន់ខ្លាំង', 'color' => '#ef4444', 'order' => 3],
        ];

        foreach ($priorities as $priority) {
            Priority::create($priority);
        }
    }
}
