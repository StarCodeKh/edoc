<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserGroupSeeder extends Seeder
{
    private const ROLE_GROUPS = [
        'admin' => 'ក្រុមការងារ Admin',
        'adsg' => 'ក្រុមការងារ ADSG',
        'asg' => 'ក្រុមការងារ ASG',
        'sg' => 'ក្រុមការងារ SG',
        'hd' => 'ក្រុមការងារ HD',
        'dsg' => 'ក្រុមការងារ DSG',
        'dpt' => 'ក្រុមការងារ Dpt',
    ];

    public function run(): void
    {
        if (!Schema::hasTable('user_groups') || !Schema::hasTable('user_group_members')) {
            $this->command->error("'user_groups' / 'user_group_members' don't exist yet — run the migrations first.");

            return;
        }

        if (!Schema::hasColumn('users', 'edoc_role')) {
            $this->command->error("users.edoc_role column doesn't exist — nothing to group by.");

            return;
        }

        foreach (self::ROLE_GROUPS as $role => $groupName) {
            $group = UserGroup::firstOrCreate(
                ['edoc_role' => $role],
                ['name' => $groupName, 'slug' => $role]
            );

            if ($group->name !== $groupName) {
                $group->update(['name' => $groupName]);
            }

            $userIds = User::where('edoc_role', $role)->pluck('id');

            $currentMemberIds = DB::table('user_group_members')
                ->where('user_group_id', $group->id)
                ->pluck('user_id');

            $toAdd = $userIds->diff($currentMemberIds);
            $toRemove = $currentMemberIds->diff($userIds);

            foreach ($toAdd as $userId) {
                DB::table('user_group_members')->insert([
                    'user_group_id' => $group->id,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($toRemove->isNotEmpty()) {
                DB::table('user_group_members')
                    ->where('user_group_id', $group->id)
                    ->whereIn('user_id', $toRemove)
                    ->delete();
            }

            $this->command->line("Group '{$groupName}' (#{$group->id}, edoc_role={$role}): {$userIds->count()} member(s) — added ".$toAdd->count().', removed '.$toRemove->count().'.');
        }

        $this->command->info('User groups seeded/synced.');
    }
}
