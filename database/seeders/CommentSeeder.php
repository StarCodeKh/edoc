<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('💬 Creating task comments...');
        
        $tasks = Task::with(['assignees.user', 'project.workspace.teamMembers'])->get();
        
        if ($tasks->count() === 0) {
            $this->command->error('❌ No tasks found. Please run TaskSeeder first.');
            return;
        }
        
        $commentTemplates = [
            'updates' => [
                'Updated the implementation based on the latest requirements.',
                'Made progress on this task. Should be completed by end of week.',
                'Ran into some technical challenges, but found a workaround.',
                'This is ready for review. Please take a look when you have time.',
                'Completed the initial version. Testing in progress.',
                'Added the requested changes. Let me know if you need anything else.',
            ],
            'questions' => [
                'Can you clarify the requirements for this feature?',
                'Do we have the necessary resources to complete this?',
                'Should we prioritize this over the other pending tasks?',
                'What\'s the expected timeline for this deliverable?',
                'Are there any specific design guidelines I should follow?',
                'Can someone review the technical approach before I proceed?',
            ],
            'blockers' => [
                'Blocked by the API integration task. Waiting for completion.',
                'Need design approval before moving forward.',
                'Waiting for client feedback on the proposed solution.',
                'Dependencies not yet available. Will resume once ready.',
                'External service is down. Will retry tomorrow.',
                'Need additional information from the stakeholder.',
            ],
            'completions' => [
                'Task completed successfully. Ready for deployment.',
                'All requirements have been implemented and tested.',
                'Finished ahead of schedule. Moving to the next task.',
                'Completed with all edge cases handled.',
                'Done! Documentation has been updated as well.',
                'Task completed. Added some performance optimizations too.',
            ],
            'collaboration' => [
                'Great work on this! Really impressed with the solution.',
                'Thanks for the quick turnaround on this task.',
                'I can help with testing if you need an extra pair of eyes.',
                'This looks good to me. Approving for the next phase.',
                'Nice implementation! I learned something new from your approach.',
                'Excellent attention to detail. This will work perfectly.',
            ]
        ];
        
        $createdComments = 0;
        
        foreach ($tasks as $task) {
            // 40% of tasks get comments
            if (fake()->boolean(40)) {
                $commentCount = fake()->numberBetween(1, 5);
                
                // Get potential commenters (assignees + project team members)
                $potentialCommenters = collect();
                
                // Add assignees
                foreach ($task->assignees as $assignee) {
                    $potentialCommenters->push($assignee->user);
                }
                
                // Add some team members
                $teamMembers = $task->project->workspace->teamMembers->pluck('user_id');
                $additionalUsers = User::whereIn('id', $teamMembers)->get();
                $potentialCommenters = $potentialCommenters->merge($additionalUsers)->unique('id');
                
                if ($potentialCommenters->count() === 0) continue;
                
                for ($i = 0; $i < $commentCount; $i++) {
                    $category = fake()->randomElement(array_keys($commentTemplates));
                    $commentText = fake()->randomElement($commentTemplates[$category]);
                    
                    // Add some variation
                    if (fake()->boolean(30)) {
                        $commentText .= ' ' . fake()->sentence();
                    }
                    
                    Comment::create([
                        'task_id' => $task->id,
                        'user_id' => $potentialCommenters->random()->id,
                        'details' => $commentText,
                        'created_at' => fake()->dateTimeBetween($task->created_at, 'now'),
                        'updated_at' => fake()->dateTimeBetween($task->created_at, 'now'),
                    ]);
                    
                    $createdComments++;
                }
            }
        }
        
        $this->command->info("🎉 Successfully created {$createdComments} task comments!");
    }
}
