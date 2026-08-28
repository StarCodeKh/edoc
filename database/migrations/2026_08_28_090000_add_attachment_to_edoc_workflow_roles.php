<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            // Whether the step cannot be passed on without a document on it.
            $table->boolean('requires_attachment')->default(false)->after('requires_signature');
            // Which kind: 'standard' is the fixed form the step always expects,
            // 'dynamic' is whatever the case produces. Only read when
            // requires_attachment is set, but always carries a value so the
            // dropdown never has to render an empty selection.
            $table->string('attachment_mode', 20)->default('standard')->after('requires_attachment');
        });
    }

    public function down(): void
    {
        Schema::table('edoc_workflow_roles', function (Blueprint $table) {
            $table->dropColumn(['requires_attachment', 'attachment_mode']);
        });
    }
};
