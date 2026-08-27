<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_sub_roles', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        // edoc_workflow_roles.responsible_role has been free text until now, so
        // whatever is already in there IS the list. Seeding from it means no
        // existing step points at a code the new dropdown cannot offer.
        $existing = DB::table('edoc_workflow_roles')
            ->whereNotNull('responsible_role')
            ->where('responsible_role', '!=', '')
            ->distinct()
            ->orderBy('responsible_role')
            ->pluck('responsible_role');

        $rows = [];
        $order = 0;

        foreach ($existing as $code) {
            $code = trim((string) $code);

            if ($code === '' || mb_strlen($code) > 50) {
                continue;
            }

            $rows[] = [
                'code' => $code,
                // No display name exists yet; the code doubles as one until an
                // administrator gives it a proper title.
                'name' => $code,
                'order' => $order++,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($rows) {
            DB::table('workflow_sub_roles')->insert($rows);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_sub_roles');
    }
};
