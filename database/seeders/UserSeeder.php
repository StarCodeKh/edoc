<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    private const SUPER_ADMIN_ROLE_ID = 1;
    private const ADMIN_ROLE_ID = 2;
    private const USER_ROLE_ID = 3;

    private const DEFAULT_PASSWORD = 'Password@123';

    /**
     * The CGMC roster as shown on the user management screen.
     *
     * Khmer names are stored family-name-first, matching how the list renders
     * them (first_name then last_name).
     */
    private const USERS = [
        ['first' => 'Admin', 'last' => 'System', 'email' => 'admin@system.com', 'title' => 'ក្រុមការងារ IT', 'role' => self::SUPER_ADMIN_ROLE_ID],

        ['first' => 'ទ្រី', 'last' => 'គីមហេង', 'email' => 'trykimheng@cgmc.gov.kh', 'title' => 'ប្រធាននាយកដ្ឋាន', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'ម៉ី', 'last' => 'ច័ន្ទវាសនា', 'email' => 'meychanveasna@cgmc.gov.kh', 'title' => 'ប្រធាននាយកដ្ឋាន', 'role' => self::USER_ROLE_ID],
        ['first' => 'ចូវ', 'last' => 'ឆេងលីម', 'email' => 'chovchhenglim@cgmc.gov.kh', 'title' => 'មន្ត្រីទទួលឯកសារចេញ', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'អ៊ុល', 'last' => 'ជីវិនជុតិមា', 'email' => 'oulchivinchutema@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល D1', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'លីម', 'last' => 'ដាណា', 'email' => 'limdana@cgmc.gov.kh', 'title' => 'ជំនួយការអគ្គលេខាធិការរង គ.ល.ក.', 'role' => self::USER_ROLE_ID],
        ['first' => 'វ៉ា', 'last' => 'ដារ៉ាវុធ', 'email' => 'vadaravuth@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល IAU', 'role' => self::USER_ROLE_ID],
        ['first' => 'ហ៊ុន', 'last' => 'តុលា', 'email' => 'huntola@cgmc.gov.kh', 'title' => 'ប្រធាននាយកដ្ឋាន', 'role' => self::USER_ROLE_ID],
        ['first' => 'គីរី', 'last' => 'នីវីរៈ', 'email' => 'kirynyvyrak@cgmc.gov.kh', 'title' => 'មន្ត្រីទទួលឯកសារចូល', 'role' => self::ADMIN_ROLE_ID],

        ['first' => 'ឃាន', 'last' => 'បូដារ៉ាវិទ្ធ', 'email' => 'kheanbodararith@cgmc.gov.kh', 'title' => 'មន្ត្រីរដ្ឋបាល', 'role' => self::USER_ROLE_ID],
        ['first' => 'ឃុន', 'last' => 'ពិសិដ្ឋ', 'email' => 'khunpisseth@cgmc.gov.kh', 'title' => 'ប្រធានអង្គភាព', 'role' => self::USER_ROLE_ID],
        ['first' => 'សុខ', 'last' => 'មករា', 'email' => 'sokmakara@cgmc.gov.kh', 'title' => 'ប្រធានការិយាល័យរដ្ឋបាល', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'ម៉ូ', 'last' => 'ម៉ារ៉ាកូស', 'email' => 'momaracoss@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល D5', 'role' => self::USER_ROLE_ID],
        ['first' => 'ហាក់', 'last' => 'មុនីនាថ', 'email' => 'hakmonineath@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល D1', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'ច្រែង', 'last' => 'រតនា', 'email' => 'chrengrortana@cgmc.gov.kh', 'title' => 'ប្រធាននាយកដ្ឋាន', 'role' => self::USER_ROLE_ID],
        ['first' => 'យ៉េត', 'last' => 'វិណែល', 'email' => 'yethvinel@cgmc.gov.kh', 'title' => 'អគ្គលេខាធិការ គ.ល.ក.', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'ម៉ិច', 'last' => 'វុឆ្នី', 'email' => 'mechvothy@cgmc.gov.kh', 'title' => 'ប្រធាននាយកដ្ឋាន', 'role' => self::USER_ROLE_ID],
        ['first' => 'ភិន', 'last' => 'សំបូរ', 'email' => 'phinsambo@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល D2', 'role' => self::USER_ROLE_ID],

        ['first' => 'ស៊ីម', 'last' => 'ស៊ីណេត', 'email' => 'simsineth@cgmc.gov.kh', 'title' => 'ជំនួយការអគ្គលេខាធិការ', 'role' => self::USER_ROLE_ID],
        ['first' => 'សេន', 'last' => 'សុភាព', 'email' => 'sensopheap@cgmc.gov.kh', 'title' => 'អគ្គលេខាធិការរង គ.ល.ក.', 'role' => self::USER_ROLE_ID],
        ['first' => 'ផល', 'last' => 'សុលី', 'email' => 'phalsoly@cgmc.gov.kh', 'title' => 'ជំនួយការអគ្គលេខាធិការ គ.ល.ក.', 'role' => self::ADMIN_ROLE_ID],
        ['first' => 'ជី', 'last' => 'ស៊ូអ៊ីម៉េង', 'email' => 'chysouimeng@cgmc.gov.kh', 'title' => 'មន្ត្រីបង្គោល D3', 'role' => self::USER_ROLE_ID],
    ];

    public function run(): void
    {
        foreach (self::USERS as $user) {
            $exists = DB::table('users')->where('email', $user['email'])->exists();

            $attributes = [
                'role_id'    => $user['role'],
                'locale'     => 'kh',
                'address'    => 'Phnom Penh, Cambodia',
                'first_name' => $user['first'],
                'last_name'  => $user['last'],
                'title'      => $user['title'],
                'updated_at' => Carbon::now(),
            ];

            // Only set the password on first insert, so re-seeding never resets
            // a password someone has already changed.
            if (! $exists) {
                $attributes['email_verified_at'] = null;
                $attributes['password'] = Hash::make(self::DEFAULT_PASSWORD);
                $attributes['created_at'] = Carbon::now();
            }

            DB::table('users')->updateOrInsert(['email' => $user['email']], $attributes);

            if ($this->command) {
                $verb = $exists ? 'Updated' : 'Created';
                $this->command->line("  {$verb} {$user['email']} — {$user['first']} {$user['last']} ({$user['title']})");
            }
        }

        if ($this->command) {
            $this->command->info(count(self::USERS) . ' users seeded.');
        }
    }
}
