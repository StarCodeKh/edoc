<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('languages')->truncate();
        DB::table('languages')->insert(['name' => 'English', 'code' => 'en']);
        DB::table('languages')->insert(['name' => 'Khmer', 'code' => 'kh']);
        DB::table('languages')->insert(['name' => 'Chinese', 'code' => 'cn']);
    }
}
