<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The responsibilities shown on Settings → Workflow Roles, taken from the two
 * document-flow charts: every box in "លំហូរឯកសារផ្ទៃក្នុង អ.គ.ល.ក" and
 * "លំហូរឯកសារចូលពីក្រសួង/ស្ថាប័ន ក្រុមហ៊ុន" is one of these.
 *
 * Rows are upserted by code and never deleted: users and steps point at these
 * codes, so a code that is no longer on a chart is left alone rather than
 * pulled out from under whoever still carries it.
 */
class WorkflowSubRoleSeeder extends Seeder
{
    private const RESPONSIBILITIES = [
        ['code' => 'lobby', 'name' => 'LOBBY (គីរី នីរវៈ)'],
        ['code' => 'admin', 'name' => 'ការិយាល័យ រដ្ឋបាល'],
        ['code' => 'asg', 'name' => 'ជំនួយការ អគ្គលេខាធិការ'],
        ['code' => 'sg', 'name' => 'អគ្គលេខាធិការ'],
        ['code' => 'adsg', 'name' => 'ជំនួយការ អគ្គលេខាធិការរង'],
        ['code' => 'dsg', 'name' => 'អគ្គលេខាធិការរង'],
        // The chart's one box is five departments. 'dpt' stays as the group a
        // step names; 'under' says which group a row belongs to, and a step
        // marked dynamic is handed to exactly one of them when forwarded.
        ['code' => 'dpt', 'name' => 'នាយកដ្ឋាន D1-D5'],
        ['code' => 'd1', 'name' => 'នាយកដ្ឋាន D1', 'under' => 'dpt'],
        ['code' => 'd2', 'name' => 'នាយកដ្ឋាន D2', 'under' => 'dpt'],
        ['code' => 'd3', 'name' => 'នាយកដ្ឋាន D3', 'under' => 'dpt'],
        ['code' => 'd4', 'name' => 'នាយកដ្ឋាន D4', 'under' => 'dpt'],
        ['code' => 'd5', 'name' => 'នាយកដ្ឋាន D5', 'under' => 'dpt'],
        ['code' => 'iau', 'name' => 'IAU'],
        // Not on either chart, but the casino-operator steps and existing user
        // records still name it.
        ['code' => 'hd', 'name' => 'ប្រធាននាយកដ្ឋាន'],
    ];

    public function run(): void
    {
        if (!Schema::hasTable('workflow_sub_roles')) {
            $this->command->error("'workflow_sub_roles' does not exist yet — run the migrations first.");

            return;
        }

        // Parents are inserted before the rows pointing at them, which the
        // order of the list above already guarantees.
        $idsByCode = [];

        foreach (self::RESPONSIBILITIES as $order => $row) {
            $parentCode = $row['under'] ?? null;
            $parentId = $parentCode ? ($idsByCode[$parentCode] ?? null) : null;

            DB::table('workflow_sub_roles')->updateOrInsert(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'parent_id' => $parentId,
                    'order' => $order,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $idsByCode[$row['code']] = DB::table('workflow_sub_roles')
                ->where('code', $row['code'])
                ->value('id');

            $this->command->line("[responsibility] {$row['code']} — {$row['name']}".($parentCode ? " (under {$parentCode})" : ''));
        }

        $this->command->info('Workflow responsibilities seeded.');
    }
}
