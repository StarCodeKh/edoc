<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EdocWorkflowRoleSeeder extends Seeder
{
    private const DEFINITIONS = [
        'external_ministry' => [
            ['title' => 'ទទួល Scan/Upload ឯកសារចូល', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'បង្កើតលេខកូដតាមដាន (Inward ID)', 'role' => 'admin', 'sla_hours' => 2, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ត្រួតពិនិត្យបឋមដោយ ADSG/ASG', 'role' => 'adsg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ចាត់តាំង/សម្រេចដោយ SG', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'កំពុងអនុវត្តភារកិច្ចដោយ Dpt', 'role' => 'dpt', 'sla_hours' => 72, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ត្រួតពិនិត្យសេចក្តីព្រាងឆ្លើយតបដោយ SG', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['title' => 'ចេញលេខ Outward និងផ្ញើលិខិតឆ្លើយតប', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'បិទសំណុំរឿង / រក្សាទុកបណ្ណសារ', 'role' => 'admin', 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => true],
        ],
        'casino_operator' => [
            ['title' => 'ទទួលឯកសារ និងផ្តល់លេខកូដតាមដាន', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ត្រួតពិនិត្យ និងកំណត់អាទិភាព/SLA', 'role' => 'asg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ចាត់តាំងការងារជូន HD', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ត្រួតពិនិត្យ និងព្រាងសេចក្តី', 'role' => 'hd', 'sla_hours' => 48, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ផ្ទៀងផ្ទាត់សេចក្តីព្រាង', 'role' => 'dsg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'រង់ចាំការអនុម័ត និងចុះហត្ថលេខា', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['title' => 'ចេញលេខផ្លូវការ និងបញ្ជូនទៅ CO', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'រក្សាទុកបណ្ណសារ / បិទរឿង', 'role' => 'admin', 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => true],
        ],
        'internal_cgmc' => [
            ['title' => 'ទទួល e-Form និងឯកសារភ្ជាប់', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'បង្កើតលេខសម្គាល់ (Tracking ID/QR)', 'role' => 'admin', 'sla_hours' => 2, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'ត្រួតពិនិត្យដោយ ADSG', 'role' => 'adsg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'រៀបចំ និងត្រួតពិនិត្យដោយ ASG', 'role' => 'asg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'SG ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'អនុម័ត និងចុះហត្ថលេខាឌីជីថលដោយ SG', 'role' => 'sg', 'sla_hours' => 24, 'requires_signature' => true, 'is_terminal' => false],
            ['title' => 'ចេញលិខិតផ្លូវការ និងជូនដំណឹង', 'role' => 'admin', 'sla_hours' => 4, 'requires_signature' => false, 'is_terminal' => false],
            ['title' => 'រក្សាទុក Audit Trail / បណ្ណសារ', 'role' => 'admin', 'sla_hours' => null, 'requires_signature' => false, 'is_terminal' => true],
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

            foreach ($columns as $index => $col) {
                $order = $index + 1;

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
                        $this->command->error("Failed to upsert {$roleTable} for [{$workflowType}] '{$col['title']}': " . $e->getMessage());
                        continue;
                    }
                }

                $this->command->line("[{$workflowType}] Column {$order}: {$col['title']} (role={$col['role']}, workspace_id={$workspaceId}, sla=" . ($col['sla_hours'] ?? 'n/a') . 'h)');
            }
        }

        $this->command->info('Workflow role/SLA config seeded.');
    }
}