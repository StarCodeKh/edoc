<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@system.com'], 
            
            [
                'role_id'           => 1,
                'locale'            => 'en',
                'address'           => 'Phnom Penh, Cambodia',
                'first_name'        => 'Admin',
                'last_name'         => 'System',
                'email_verified_at' => null,
                'password'          => Hash::make('Password@123'),
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]
        );
    }
}