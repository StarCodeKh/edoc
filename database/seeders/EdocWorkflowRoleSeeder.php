<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EdocWorkflowRoleSeeder extends Seeder
{
    /**
     * Mirrors the step list shown on Settings → Workflow Roles, transcribed from
     * the two document-flow charts.
     *
     * 'order' is explicit rather than derived from the array index because the
     * UI prints this value as the step number, and re-seeding after a step is
     * deleted must not renumber the ones around it.
     *
     * 'mode' is 'dynamic' where the step's responsibility stands for several -
     * នាយកដ្ឋាន D1-D5 holds D1 through D5 - which makes whoever forwards the
     * document name the one department that gets it. Absent means 'standard':
     * everyone carrying the responsibility is assigned, as before.
     *
     * 'attachment' is null when the step expects no document, otherwise
     * 'standard' (the fixed form the step always takes — the incoming scan, the
     * numbered outgoing letter) or 'dynamic' (whatever the case produces, which
     * here is the reply a department drafts).
     *
     * Neither chart is purely linear and this table has no branching, so the
     * main path is what gets stored:
     *  - Incoming: the នាយកដ្ឋាន D1-D5 diamond can end the document at step 6
     *    ("ឃើញ និងសូមអរគុណ") instead of continuing into the reply at step 7.
     *  - Internal: ការិយាល័យ រដ្ឋបាល may skip the អគ្គលេខាធិការរង leg
     *    (steps 3-5) for D1 documents and others not required to pass it.
     */
    private const INCOMING_FLOW = [
        ['order' => 1, 'title' => 'LOBBY ទទួល Scan/Upload ឯកសារចូល (Tracking ID/QR)', 'role' => 'lobby', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 2, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យឯកសារចូល', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 3, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 4, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បញ្ជូនឯកសារត្រឡប់', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 5, 'title' => 'ការិយាល័យ រដ្ឋបាល បញ្ជូនទៅនាយកដ្ឋាន D1-D5', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 6, 'title' => 'នាយកដ្ឋាន D1-D5 សម្រេច៖ ឆ្លើយតប ឬបញ្ចប់ត្រឹមនេះ', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 7, 'title' => 'នាយកដ្ឋាន D1-D5 រៀបចំលិខិតឆ្លើយតបគោរពជូនអគ្គលេខាធិការ', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => 'dynamic', 'is_terminal' => false],
        ['order' => 8, 'title' => 'ការិយាល័យ រដ្ឋបាល ទទួល និងចុះលេខលិខិតឆ្លើយតប', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'dynamic', 'is_terminal' => false],
        ['order' => 9, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង ពិនិត្យលិខិតឆ្លើយតប', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 10, 'title' => 'អគ្គលេខាធិការរង ពិនិត្យឯកសាររួចរាល់', 'role' => 'dsg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 11, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង បញ្ជូនឯកសារត្រឡប់', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 12, 'title' => 'ការិយាល័យ រដ្ឋបាល បញ្ជូនបន្តទៅអគ្គលេខាធិការ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 13, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យលិខិតឆ្លើយតប', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 14, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងអនុម័ត', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 15, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បញ្ជូនឯកសារត្រឡប់', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 16, 'title' => 'ការិយាល័យ រដ្ឋបាល ចេញលេខផ្លូវការ និងបញ្ជូនចេញ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 17, 'title' => 'នាយកដ្ឋាន D1-D5 ទទួលដំណឹងបញ្ចប់', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 18, 'title' => 'បញ្ចប់ឯកសារ / រក្សាទុកបណ្ណសារ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => true],
    ];

    private const DEFINITIONS = [
        // Both start outside អ.គ.ល.ក and enter through the LOBBY, which is what
        // the chart titled "ក្រសួង/ស្ថាប័ន ក្រុមហ៊ុន" covers, so they run the
        // same path against their own workspace.
        'external_ministry' => self::INCOMING_FLOW,
        'casino_operator' => self::INCOMING_FLOW,

        'internal_cgmc' => [
            ['order' => 1, 'title' => 'នាយកដ្ឋាន D1-D5 / IAU បង្កើតឯកសារគោរពជូនអគ្គលេខាធិការ', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => 'dynamic', 'is_terminal' => false],
            ['order' => 2, 'title' => 'ការិយាល័យ រដ្ឋបាល ទទួល និងចុះលេខឯកសារ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
            ['order' => 3, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង ពិនិត្យឯកសារ', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 4, 'title' => 'អគ្គលេខាធិការរង ពិនិត្យឯកសាររួចរាល់', 'role' => 'dsg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
            ['order' => 5, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង បញ្ជូនឯកសារត្រឡប់', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 6, 'title' => 'ការិយាល័យ រដ្ឋបាល បញ្ជូនបន្តទៅអគ្គលេខាធិការ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 7, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យឯកសារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 8, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
            ['order' => 9, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បញ្ជូនឯកសារត្រឡប់', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 10, 'title' => 'ការិយាល័យ រដ្ឋបាល ចេញលេខ និងបញ្ជូនត្រឡប់', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
            ['order' => 11, 'title' => 'នាយកដ្ឋាន D1-D5 / IAU ទទួលឯកសារ និងអនុវត្ត', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
            ['order' => 12, 'title' => 'បញ្ចប់ឯកសារ / រក្សាទុកបណ្ណសារ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => true],
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
                $attachment = $col['attachment'] ?? null;

                foreach ($roleTables as $roleTable) {
                    try {
                        DB::table($roleTable)->updateOrInsert(
                            ['workflow_type' => $workflowType, 'order' => $order],
                            [
                                'list_title' => $col['title'],
                                'workspace_id' => $workspaceId,
                                'responsible_role' => $col['role'],
                                'role_mode' => $col['mode'] ?? 'standard',
                                'requires_signature' => $col['requires_signature'],
                                'requires_attachment' => $attachment !== null,
                                // The column always carries a value so the
                                // dropdown never renders an empty selection;
                                // it is only read when the box above is set.
                                'attachment_mode' => $attachment ?? 'standard',
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

                $this->command->line("[{$workflowType}] Step {$order}: {$col['title']} (role=".($col['role'] ?? 'n/a').'/'.($col['mode'] ?? 'standard').", workspace_id={$workspaceId}, attachment=".($attachment ?? 'none').')');
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

        $this->command->info('Workflow role config seeded.');
    }
}
