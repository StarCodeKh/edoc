<?php

namespace Database\Seeders;

use App\Events\NewCommentAdded;
use App\Models\Comment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommentNotificationSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Clear notifications table
        $this->command->warn('Truncating `notifications` table...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('notifications')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // 2) Fetch 50 random comments
        $comments = Comment::inRandomOrder()->take(50)->get();

        if ($comments->isEmpty()) {
            $this->command->warn('No comments found.');

            return;
        }

        // 3) Fire event for each comment
        $this->command->info("Firing NewCommentAdded for {$comments->count()} random comments...");
        foreach ($comments as $comment) {
            event(new NewCommentAdded($comment));
        }

        $this->command->info('✅ Done.');
    }
}
