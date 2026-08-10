<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $this->call([
            ComprehensiveDataSeeder::class
        ]);
    }

    private function copyDemoFiles()
    {
        $sourcePath = public_path('files/tasks_demo');
        $targetPath = public_path('files/tasks');

        // Create source directory if it doesn't exist
        if (!File::exists($sourcePath)) {
            File::makeDirectory($sourcePath, 0755, true);
            $this->command->warn("🛈 Created missing source directory: '{$sourcePath}'");
            return;
        }

        // Create target directory if it doesn't exist
        if (!File::exists($targetPath)) {
            File::makeDirectory($targetPath, 0755, true);
        }

        array_filter(File::allFiles($sourcePath), function ($item) use ($targetPath) {
            $newPath = $targetPath . '/' . $item->getFilename();
            if (!File::exists($newPath)) {
                File::copy($item->getRealPath(), $newPath);
            }
        });
    }
}
