<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EdocWorkflowRoleSeeder extends Seeder
{
    /**
     * Mirrors the step list shown on Settings → Workflow Roles.
     *
     * 'order' is explicit (not derived from the array index) because the live
     * boards have gaps where steps were deleted — External Ministry and
     * Internal CGMC both skip order 2, and the UI prints this value as the
     * step number.
     */
    private const DEFINITIONS = [
        'external_ministry' => [
            ['order' => 1, 'title' => 'ទទួល Scan/Upload ឯកសារចូល (Tracking ID/QR)', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 3, 'title' => 'ត្រួតពិនិត្យបឋមដោយ ADSG/ASG', 'role' => 'adsg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 4, 'title' => 'ចាត់តាំង/សម្រេចដោយ SG', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 5, 'title' => 'កំពុងអនុវត្តភារកិច្ចដោយ Dpt', 'role' => 'dpt', 'sla_hours' => 72, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 6, 'title' => 'ត្រួតពិនិត្យលិខិតឆ្លើយតបដោយ SG / អនុម័ត', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['order' => 7, 'title' => 'ចេញលេខ Outward និងផ្ញើលិខិតឆ្លើយតប', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 8, 'title' => 'រក្សាទុកបណ្ណសារ', 'role' => 'admin', 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => true],
        ],
        'casino_operator' => [
            ['order' => 1, 'title' => 'ទទួល Scan/Upload ឯកសារចូល (Tracking ID/QR)', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 2, 'title' => 'ត្រួតពិនិត្យដោយ ASG', 'role' => 'asg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 3, 'title' => 'SG ពិនិត្យ និងចាត់តាំងការងារជូន HD', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 4, 'title' => 'HD ពិនិត្យ និងចេញលេខិតឆ្លើយតប', 'role' => 'hd', 'sla_hours' => 48, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 5, 'title' => 'អនុម័ត និងចុះហត្ថលេខាដោយ SG', 'role' => 'dsg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['order' => 6, 'title' => 'ចេញលេខផ្លូវការ និងបញ្ជូនទៅ CO', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => true],
            ['order' => 7, 'title' => 'រក្សាទុកបណ្ណសារ / បិទរឿង', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
        ],
        'internal_cgmc' => [
            ['order' => 1, 'title' => 'ទទួល Scan/Upload ឯកសារចូល (Tracking ID/QR)', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 3, 'title' => 'ត្រួតពិនិត្យដោយ ADSG & DSG', 'role' => 'adsg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 4, 'title' => 'រៀបចំ និងត្រួតពិនិត្យដោយ ASG', 'role' => 'asg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 5, 'title' => 'SG ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['order' => 6, 'title' => 'អនុម័ត និងចុះហត្ថលេខាឌីជីថលដោយ SG', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['order' => 7, 'title' => 'ចេញលិខិតផ្លូវការ និងជូនដំណឹង', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 8, 'title' => 'រក្សាទុក Audit Trail / បណ្ណសារ', 'role' => 'admin', 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => true],
            ['order' => 9, 'title' => 'នាយកដ្ឋានទទួលឯកសារ និងចាប់ផ្តល់អនុវត្ត', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['order' => 10, 'title' => 'បញ្ជូនចេញបិទសំណុំរឿង / រក្សាទុកបណ្ណសារ', 'role' => null, 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => false],
        ],
    ];

    private const WORKSPACE_ID_BY_TYPE = [
        'external_ministry' => 1,
        'casino_operator' => 3,
        'internal_cgmc' => 2,
    ];

    public function run(): void
    {
        $roleTables = array_values(array_filter(
            ['edoc_workflow_roles'],
            fn ($table) => Schema::hasTable($table)
        ));

        if (empty($roleTables)) {
            $this->command->error("Neither 'edoc_workflow_roles' exists yet — run the migration first.");

            return;
        }

        foreach (self::DEFINITIONS as $workflowType => $columns) {
            $workspaceId = self::WORKSPACE_ID_BY_TYPE[$workflowType] ?? null;
            $orders = array_column($columns, 'order');

            foreach ($columns as $col) {
                $order = $col['order'];

                foreach ($roleTables as $roleTable) {
                    try {
                        DB::table($roleTable)->updateOrInsert(
                            ['workflow_type' => $workflowType, 'order' => $order],
                            [
                                'list_title' => $col['title'],
                                'workspace_id' => $workspaceId,
                                'responsible_role' => $col['role'],
                                'sla_hours' => $col['sla_hours'],
                                'requires_signature' => $col['requires_signature'],
                                'is_terminal' => $col['is_terminal'],
                                'updated_at' => now(),
                                'created_at' => now(),
                            ]
                        );
                    } catch (\Throwable $e) {
                        $this->command->error("Failed to upsert {$roleTable} for [{$workflowType}] '{$col['title']}': ".$e->getMessage());

                        continue;
                    }
                }

                $this->command->line("[{$workflowType}] Step {$order}: {$col['title']} (role=".($col['role'] ?? 'n/a').", workspace_id={$workspaceId}, sla=".($col['sla_hours'] ?? 'n/a').'h)');
            }

            // The definitions above are the source of truth: drop any step this
            // workflow no longer has, so deleted orders stay deleted on re-seed.
            foreach ($roleTables as $roleTable) {
                $removed = DB::table($roleTable)
                    ->where('workflow_type', $workflowType)
                    ->whereNotIn('order', $orders)
                    ->delete();

                if ($removed) {
                    $this->command->warn("[{$workflowType}] Removed {$removed} stale step(s) from {$roleTable}.");
                }
            }
        }

        $this->command->info('Workflow role/SLA config seeded.');
    }
}
