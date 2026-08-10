<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FreshDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        $this->call([
            LanguageSeeder::class,
            UserSeeder::class,
            NoteSeeder::class,
        ]);
    }
}
