<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Mirrors the step list shown on Settings → Workflow Roles, transcribed from
 * the two document-flow charts.
 *
 * It is the starting point, not the ruling copy. Only steps that are
 * missing get written: a step already in the table is left exactly as it
 * stands, and a step this file no longer lists is not deleted. A flow is
 * changed on the settings screen, and re-seeding must never undo work done
 * there - which is what makes this safe to re-run on a live install.
 *
 * WORKFLOW_SEED_REPLACE=1 turns that around for the run, for the other
 * case: this file has been corrected and the table should be made to match
 * it again. See replacing().
 *
 * 'order' is explicit rather than derived from the array index because the
 * UI prints this value as the step number, and re-seeding after a step is
 * deleted must not renumber the ones around it. The gaps in these lists
 * are that rule at work rather than a transcription slip: 5, 7, 8 and 12
 * were dropped on the settings screen, and the steps around them kept the
 * numbers they were already carrying.
 *
 * 'mode' is 'dynamic' where the step's responsibility stands for several -
 * នាយកដ្ឋាន D1-D5 holds D1 through D5 - which makes whoever forwards the
 * document name the one department that gets it. Absent means 'standard':
 * everyone carrying the responsibility is assigned, as before.
 *
 * 'attachment' is null when the step expects no document, otherwise
 * 'standard' (the fixed form the step always takes — the incoming scan, the
 * numbered outgoing letter) or 'dynamic' (whatever the case produces rather
 * than a fixed form). No step lists it now that the flows are shortened,
 * but the settings screen still offers it.
 *
 * Neither chart is purely linear and this table has no branching, so the
 * main path is what gets stored: ការិយាល័យ រដ្ឋបាល may skip the
 * អគ្គលេខាធិការរង leg (steps 10-11) for D1 documents and others not
 * required to pass it.
 */
class EdocWorkflowRoleSeeder extends Seeder
{
    /**
     * ឯកសារក្រសួង-ស្ថាប័ន and ឯកសារក្រុមហ៊ុន, which run the same thirteen
     * steps: the document arrives from outside, អគ្គលេខាធិការ writes the ចំណារ,
     * it is handed out along that ចំណារ, and from the department it climbs back
     * up for the សម្រេច and goes out.
     */
    private const EXTERNAL_FLOW = [
        ['order' => 1, 'title' => 'ឯកសារចូល (មកពីក្រៅ)', 'role' => 'lobby', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 2, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យឯកសារចូល', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 3, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងផ្តល់ចំណារ', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 4, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បែងចែកឯកសារតាមចំណារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 6, 'title' => 'នាយកដ្ឋាន / អង្គភាព / បុគ្គល', 'role' => 'hd', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 9, 'title' => 'ការិយាល័យ រដ្ឋបាល ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 10, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 11, 'title' => 'អគ្គលេខាធិការរង ពិនិត្យ និងផ្តល់យោបល់', 'role' => 'dsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 13, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 14, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 15, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បញ្ជូនឯកសារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 16, 'title' => 'ការិយាល័យ រដ្ឋបាល ពិនិត្យ និងមុខការ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => true],
        ['order' => 17, 'title' => 'នាយកដ្ឋាន / អង្គភាព / បុគ្គល ទទួលដំណឹងបញ្ចប់', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
    ];

    /**
     * ឯកសារផ្ទៃក្នុង. The department raises the document itself, so there is
     * nothing to arrive and nothing to hand out: the flow opens where the
     * external one reaches step 6 and is otherwise the same steps under the
     * same numbers.
     */
    private const INTERNAL_FLOW = [
        ['order' => 1, 'title' => 'នាយកដ្ឋាន / អង្គភាព / បុគ្គល', 'role' => 'hd', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => false],
        ['order' => 2, 'title' => 'ការិយាល័យ រដ្ឋបាល ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 3, 'title' => 'ជំនួយការ អគ្គលេខាធិការរង ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'adsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 4, 'title' => 'អគ្គលេខាធិការរង ពិនិត្យ និងផ្តល់យោបល់', 'role' => 'dsg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 5, 'title' => 'ជំនួយការ អគ្គលេខាធិការ ពិនិត្យ និងបញ្ជូនឯកសារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 6, 'title' => 'អគ្គលេខាធិការ ពិនិត្យ និងសម្រេច', 'role' => 'sg', 'requires_signature' => true, 'attachment' => null, 'is_terminal' => false],
        ['order' => 7, 'title' => 'ជំនួយការ អគ្គលេខាធិការ បញ្ជូនឯកសារ', 'role' => 'asg', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
        ['order' => 8, 'title' => 'ការិយាល័យ រដ្ឋបាល ពិនិត្យ និងមុខការ', 'role' => 'admin', 'requires_signature' => false, 'attachment' => 'standard', 'is_terminal' => true],
        ['order' => 9, 'title' => 'នាយកដ្ឋាន / អង្គភាព / បុគ្គល ទទួលដំណឹងបញ្ចប់', 'role' => 'dpt', 'mode' => 'dynamic', 'requires_signature' => false, 'attachment' => null, 'is_terminal' => false],
    ];

    private const DEFINITIONS = [
        // Both start outside អ.គ.ល.ក and enter through the LOBBY, which is what
        // the chart titled "ក្រសួង/ស្ថាប័ន ក្រុមហ៊ុន" covers, so they run the
        // same path against their own workspace.
        'external_ministry' => self::EXTERNAL_FLOW,
        'casino_operator' => self::EXTERNAL_FLOW,

        'internal_cgmc' => self::INTERNAL_FLOW,
    ];

    /**
     * The workspace each flow runs in, by the name WorkspacesInsertSeeder gives
     * it. Held by name rather than by id: the ids depend on the order the
     * workspaces happened to be created in, and hardcoding them is what put
     * every flow on the wrong workspace before.
     */
    public const WORKSPACE_NAME_BY_TYPE = [
        'external_ministry' => 'ឯកសារក្រសួង-ស្ថាប័ន',
        'casino_operator' => 'ឯកសារក្រុមហ៊ុន',
        'internal_cgmc' => 'ឯកសារផ្ទៃក្នុង',
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

        $workspaceIds = $this->workspaceIdsByType();
        $replacing = $this->replacing();
        $kept = 0;

        foreach (self::DEFINITIONS as $workflowType => $columns) {
            $workspaceId = $workspaceIds[$workflowType] ?? null;
            $orders = array_column($columns, 'order');

            if (empty($workspaceId)) {
                $this->command->warn("[{$workflowType}] No workspace named '".self::WORKSPACE_NAME_BY_TYPE[$workflowType]."' — its steps are seeded unlinked. Run WorkspacesInsertSeeder first.");
            }

            foreach ($columns as $col) {
                $order = $col['order'];
                $attachment = $col['attachment'] ?? null;

                foreach ($roleTables as $roleTable) {
                    $exists = DB::table($roleTable)
                        ->where('workflow_type', $workflowType)
                        ->where('order', $order)
                        ->exists();

                    // Configured on the settings screen beats configured in
                    // this file: a step that is already there keeps its title,
                    // its responsibility, its boxes and its workspace.
                    if ($exists && !$replacing) {
                        $kept++;
                        $this->command->line("[{$workflowType}] Step {$order}: left as configured.");

                        continue;
                    }

                    $values = [
                        'list_title' => $col['title'],
                        'workspace_id' => $workspaceId,
                        'responsible_role' => $col['role'],
                        'role_mode' => $col['mode'] ?? 'standard',
                        'requires_signature' => $col['requires_signature'],
                        'requires_attachment' => $attachment !== null,
                        // The column always carries a value so the dropdown
                        // never renders an empty selection; it is only read
                        // when the box above is set.
                        'attachment_mode' => $attachment ?? 'standard',
                        'is_terminal' => $col['is_terminal'],
                        'updated_at' => now(),
                    ];

                    // Set on the way in only: a step being rewritten keeps the
                    // date it first appeared.
                    if (!$exists) {
                        $values['created_at'] = now();
                    }

                    try {
                        DB::table($roleTable)->updateOrInsert(
                            ['workflow_type' => $workflowType, 'order' => $order],
                            $values
                        );
                    } catch (\Throwable $e) {
                        $this->command->error("Failed to write {$roleTable} for [{$workflowType}] '{$col['title']}': ".$e->getMessage());

                        continue;
                    }

                    $this->command->line("[{$workflowType}] Step {$order} ".($exists ? 'replaced' : 'added').": {$col['title']} (role=".($col['role'] ?? 'n/a').'/'.($col['mode'] ?? 'standard').", workspace_id={$workspaceId}, attachment=".($attachment ?? 'none').')');
                }
            }

            // Replacing means this file wins outright, so a step it no longer
            // lists goes as well - otherwise a flow that was shortened here
            // would keep its old tail for ever.
            if (!$replacing) {
                continue;
            }

            foreach ($roleTables as $roleTable) {
                $removed = DB::table($roleTable)
                    ->where('workflow_type', $workflowType)
                    ->whereNotIn('order', $orders)
                    ->delete();

                if ($removed) {
                    $this->command->warn("[{$workflowType}] Removed {$removed} step(s) this file no longer lists.");
                }
            }
        }

        if ($kept) {
            $this->command->info("{$kept} step(s) left as configured. Re-run with WORKFLOW_SEED_REPLACE=1 to make the table match this file instead.");
        }

        $this->command->info('Workflow role config seeded.');
    }

    /**
     * Whether this run may overwrite steps that are already there.
     *
     * Off by default: the settings screen is where a flow is normally changed,
     * and a re-seed must not undo that. Turn it on for the run when this file
     * is the version you want back, which also deletes the steps it no longer
     * lists:
     *
     *   WORKFLOW_SEED_REPLACE=1 php artisan db:seed --class=EdocWorkflowRoleSeeder
     */
    private function replacing(): bool
    {
        return filter_var(env('WORKFLOW_SEED_REPLACE', false), FILTER_VALIDATE_BOOLEAN);
    }

    /** Resolves WORKSPACE_NAME_BY_TYPE to ids, dropping the names that no workspace carries. */
    private function workspaceIdsByType(): array
    {
        if (!Schema::hasTable('workspaces')) {
            return [];
        }

        $idsByName = DB::table('workspaces')
            ->whereIn('name', array_values(self::WORKSPACE_NAME_BY_TYPE))
            ->pluck('id', 'name');

        $resolved = [];

        foreach (self::WORKSPACE_NAME_BY_TYPE as $workflowType => $name) {
            $resolved[$workflowType] = $idsByName[$name] ?? null;
        }

        return $resolved;
    }
}
