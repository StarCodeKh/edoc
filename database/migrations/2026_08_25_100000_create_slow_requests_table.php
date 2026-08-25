<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slow_requests', function (Blueprint $table) {
            $table->id();
            $table->string('route')->nullable()->index();
            $table->string('method', 10);
            $table->string('path', 500);
            $table->unsignedInteger('status')->nullable();
            // Milliseconds; an unsigned int covers ~24 days of request time.
            $table->unsignedInteger('duration_ms')->index();
            $table->unsignedInteger('query_count')->default(0);
            $table->unsignedInteger('query_ms')->default(0);
            $table->unsignedInteger('memory_kb')->default(0);
            $table->foreignId('user_id')->nullable()->index();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slow_requests');
    }
};
