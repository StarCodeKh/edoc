<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * An external document that needs work done inside CGMC spawns an internal
 * document, and the external one is not finished until that internal one is.
 * This is the link between the two.
 *
 * A join table rather than a column on tasks because one external document can
 * raise several internal ones, and all of them have to finish before it closes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_links', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_task_id')->index();
            $table->unsignedBigInteger('child_task_id')->index();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->timestamps();

            // A document is linked to another once, not twice.
            $table->unique(['parent_task_id', 'child_task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_links');
    }
};
