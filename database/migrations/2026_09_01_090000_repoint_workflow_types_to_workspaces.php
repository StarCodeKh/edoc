<?php

use Database\Seeders\EdocWorkflowRoleSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Puts every workflow on the workspace it actually describes.
 *
 * EdocWorkflowRoleSeeder used to bind a flow to a hardcoded workspace id, and
 * those ids depend on the order the workspaces were created in - so an install
 * ended up with the ministry flow on ឯកសារផ្ទៃក្នុង, the casino flow on
 * ឯកសារក្រសួង-ស្ថាប័ន and the internal flow on ឯកសារក្រុមហ៊ុន. The seeder now
 * resolves the workspace by name; this repoints the rows already stored.
 *
 * Only workspace_id is touched. The steps themselves are left exactly as they
 * are, so a step an administration deleted or renamed stays deleted or renamed.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('edoc_workflow_roles') || !Schema::hasTable('workspaces')) {
            return;
        }

        foreach (EdocWorkflowRoleSeeder::WORKSPACE_NAME_BY_TYPE as $workflowType => $name) {
            $workspaceId = DB::table('workspaces')->where('name', $name)->value('id');

            if (empty($workspaceId)) {
                continue;
            }

            DB::table('edoc_workflow_roles')
                ->where('workflow_type', $workflowType)
                ->where(function ($query) use ($workspaceId) {
                    $query->where('workspace_id', '!=', $workspaceId)->orWhereNull('workspace_id');
                })
                ->update(['workspace_id' => $workspaceId, 'updated_at' => now()]);
        }
    }

    /**
     * Which workspace a flow belonged to before is not recoverable - the old
     * ids were wrong by accident, not by configuration - so this is a one-way
     * correction rather than a reversible move.
     */
    public function down(): void
    {
        //
    }
};
