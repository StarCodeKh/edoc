<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BackgroundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('🎨 Creating gradient backgrounds...');

        DB::table('backgrounds')->truncate();

        // Original gradients (1-10)
        $backgrounds = [
            // Original gradients
            ['id' => 1, 'bg' => '#0C66E4', 'image' => '/images/gradients/1.svg', 'top' => '#08479e', 'side' => '#0a52b7e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 2, 'bg' => '#0C66E4', 'image' => '/images/gradients/2.svg', 'top' => '#08479e', 'side' => '#0a52b7e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 3, 'bg' => '#09326C', 'image' => '/images/gradients/3.svg', 'top' => '#072754', 'side' => '#09326ce6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 4, 'bg' => '#6E5DC6', 'image' => '/images/gradients/4.svg', 'top' => '#473699', 'side' => '#4f3dace6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 5, 'bg' => '#E34935', 'image' => '/images/gradients/5.svg', 'top' => '#872013', 'side' => '#971a67e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 6, 'bg' => '#E774BB', 'image' => '/images/gradients/6.svg', 'top' => '#821659', 'side' => '#971a67e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 7, 'bg' => '#1F845A', 'image' => '/images/gradients/7.svg', 'top' => '#14553a', 'side' => '#196a48e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 8, 'bg' => '#172B4D', 'image' => '/images/gradients/8.svg', 'top' => '#46536a', 'side' => '#505f79e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 9, 'bg' => '#43290F', 'image' => '/images/gradients/9.svg', 'top' => '#2e1c0a', 'side' => '#43290fe6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 10, 'bg' => '#624b66', 'image' => '/images/gradients/10.jpg', 'top' => '#624b66', 'side' => '#705675e6', 'type' => 'default', 'color' => '#ffffff'],

            // New modern gradients (11-35)
            ['id' => 11, 'bg' => '#667eea', 'image' => '/images/gradients/11.svg', 'top' => '#4c63d2', 'side' => '#5a73e8e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 12, 'bg' => '#f093fb', 'image' => '/images/gradients/12.svg', 'top' => '#e91e63', 'side' => '#f06292e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 13, 'bg' => '#4facfe', 'image' => '/images/gradients/13.svg', 'top' => '#0277bd', 'side' => '#0288d1e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 14, 'bg' => '#43e97b', 'image' => '/images/gradients/14.svg', 'top' => '#2e7d32', 'side' => '#388e3ce6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 15, 'bg' => '#fa709a', 'image' => '/images/gradients/15.svg', 'top' => '#c2185b', 'side' => '#e91e63e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 16, 'bg' => '#a8edea', 'image' => '/images/gradients/16.svg', 'top' => '#00695c', 'side' => '#00796be6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 17, 'bg' => '#ff9a9e', 'image' => '/images/gradients/17.svg', 'top' => '#d32f2f', 'side' => '#f44336e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 18, 'bg' => '#ffecd2', 'image' => '/images/gradients/18.svg', 'top' => '#e65100', 'side' => '#ff9800e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 19, 'bg' => '#a1c4fd', 'image' => '/images/gradients/19.svg', 'top' => '#1976d2', 'side' => '#2196f3e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 20, 'bg' => '#ff9a8b', 'image' => '/images/gradients/20.svg', 'top' => '#d84315', 'side' => '#ff5722e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 21, 'bg' => '#667eea', 'image' => '/images/gradients/21.svg', 'top' => '#4c63d2', 'side' => '#5a73e8e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 23, 'bg' => '#ff9a9e', 'image' => '/images/gradients/23.svg', 'top' => '#d32f2f', 'side' => '#f44336e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 24, 'bg' => '#ffecd2', 'image' => '/images/gradients/24.svg', 'top' => '#e65100', 'side' => '#ff9800e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 25, 'bg' => '#84fab0', 'image' => '/images/gradients/25.svg', 'top' => '#2e7d32', 'side' => '#388e3ce6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 29, 'bg' => '#ffecd2', 'image' => '/images/gradients/29.svg', 'top' => '#e65100', 'side' => '#ff9800e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 31, 'bg' => '#ff9a9e', 'image' => '/images/gradients/31.svg', 'top' => '#d32f2f', 'side' => '#f44336e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 32, 'bg' => '#a8edea', 'image' => '/images/gradients/32.svg', 'top' => '#00695c', 'side' => '#00796be6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 33, 'bg' => '#ffecd2', 'image' => '/images/gradients/33.svg', 'top' => '#e65100', 'side' => '#ff9800e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 34, 'bg' => '#a1c4fd', 'image' => '/images/gradients/34.svg', 'top' => '#1976d2', 'side' => '#2196f3e6', 'type' => 'default', 'color' => '#ffffff'],
            ['id' => 35, 'bg' => '#ff9a8b', 'image' => '/images/gradients/35.svg', 'top' => '#d84315', 'side' => '#ff5722e6', 'type' => 'default', 'color' => '#ffffff'],
        ];

        foreach ($backgrounds as $background) {
            DB::table('backgrounds')->insert($background);
        }

        $this->command->info("✅ Created " . count($backgrounds) . " gradient backgrounds!");
    }
}
