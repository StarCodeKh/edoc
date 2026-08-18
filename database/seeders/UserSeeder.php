<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    private const ADMIN_ROLE_ID = 2;
    private const USER_ROLE_ID = 3;

    private const ADMIN_TITLES = [
        'អគ្គលេខាធិការ គ.ល.ក.',
        'ប្រធាននាយកដ្ឋានកិច្ចការទូទៅ',
        'ជំនួយការ អគ្គលេខាធិការ គ.ល.ក.',
        'ប្រធានការិយាល័យរដ្ឋបាល',
    ];

    private const USER_TITLES = [
        'អគ្គលេខាធិការរង គ.ល.ក.',
        'ទីប្រឹក្សា',
        'ជំនួយការបច្ចេកទេស',
        'ប្រធាននាយកដ្ឋាន និងប្រធានអង្គភាព',
        'អនុប្រធាននាយកដ្ឋាន និងប្រធានអង្គភាព',
        'ប្រធានការិយាល័យ',
        'ជំនួយការ អគ្គលេខាធិការរង គ.ល.ក.',
        'មន្ត្រីរដ្ឋបាល',
        'មន្ត្រីបច្ចេកទេសនាយកដ្ឋាន',
        'ប្រតិបត្តិករ',
    ];

    public function run(): void
    {
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@system.com'],
            [
                'role_id'           => 1,
                'locale'            => 'kh',
                'address'           => 'Phnom Penh, Cambodia',
                'first_name'        => 'Admin',
                'last_name'         => 'System',
                'title'             => 'ក្រុមការងារ IT',
                'email_verified_at' => null,
                'password'          => Hash::make('Password@123'),
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]
        );

        $this->seedTitles(self::ADMIN_TITLES, self::ADMIN_ROLE_ID, 'admin');
        $this->seedTitles(self::USER_TITLES, self::USER_ROLE_ID, 'user');
    }

    private function seedTitles(array $titles, int $roleId, string $emailPrefix): void
    {
        foreach ($titles as $index => $title) {
            $n = $index + 1;
            $email = "{$emailPrefix}{$n}@system.com";

            DB::table('users')->updateOrInsert(
                ['email' => $email],
                [
                    'role_id'           => $roleId,
                    'locale'            => 'kh',
                    'address'           => 'Phnom Penh, Cambodia',
                    'first_name'        => ucfirst($emailPrefix),
                    'last_name'         => (string) $n,
                    'title'             => $title,
                    'email_verified_at' => null,
                    'password'          => Hash::make('Password@123'),
                    'created_at'        => Carbon::now(),
                    'updated_at'        => Carbon::now(),
                ]
            );

            if ($this->command) {
                $this->command->line("  Seeded {$email} — {$title}");
            }
        }
    }
}