<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('📊 Creating task activities...');
        
        $tasks = Task::with(['assignees.user', 'project.workspace.teamMembers', 'user'])->get();
        
        if ($tasks->count() === 0) {
            $this->command->error('❌ No tasks found. Please run TaskSeeder first.');
            return;
        }
        
        $activityTypes = [
            'created' => 'created this task',
            'updated' => 'updated the task details',
            'assigned' => 'was assigned to this task',
            'commented' => 'added a comment',
            'completed' => 'marked this task as complete',
            'reopened' => 'reopened this task',
            'moved' => 'moved this task to {list_name}',
            'due_date_set' => 'set the due date to {due_date}',
            'due_date_changed' => 'changed the due date to {due_date}',
            'label_added' => 'added label {label_name}',
            'attachment_added' => 'added an attachment',
            'description_updated' => 'updated the task description',
        ];
        
        $createdActivities = 0;
        
        foreach ($tasks as $task) {
            // Always create a "created" activity
            $this->createActivity($task, $task->user, 'created', $task->created_at);
            $createdActivities++;
            
            // Create 2-8 additional activities per task
            $activityCount = fake()->numberBetween(2, 8);
            
            // Get potential activity users
            $potentialUsers = collect([$task->user]);
            foreach ($task->assignees as $assignee) {
                $potentialUsers->push($assignee->user);
            }
            
            // Add some team members
            $teamMembers = $task->project->workspace->teamMembers->pluck('user_id');
            $additionalUsers = User::whereIn('id', $teamMembers)->take(3)->get();
            $potentialUsers = $potentialUsers->merge($additionalUsers)->unique('id');
            
            // Generate activities chronologically
            $activityDate = Carbon::parse($task->created_at);
            $endDate = Carbon::parse($task->updated_at);
            
            for ($i = 0; $i < $activityCount && $activityDate->lt($endDate); $i++) {
                $activityType = fake()->randomElement([
                    'updated', 'commented', 'assigned', 'moved', 
                    'due_date_set', 'label_added', 'description_updated'
                ]);
                
                // Add some time between activities
                $activityDate = $activityDate->addMinutes(fake()->numberBetween(30, 1440)); // 30 min to 24 hours
                
                if ($activityDate->gt($endDate)) {
                    $activityDate = $endDate;
                }
                
                $this->createActivity(
                    $task, 
                    $potentialUsers->random(), 
                    $activityType, 
                    $activityDate
                );
                $createdActivities++;
            }
            
            // If task is completed, add completion activity
            if ($task->is_done && fake()->boolean(80)) {
                $this->createActivity(
                    $task, 
                    $potentialUsers->random(), 
                    'completed', 
                    fake()->dateTimeBetween($activityDate, $task->updated_at)
                );
                $createdActivities++;
            }
        }
        
        $this->command->info("🎉 Successfully created {$createdActivities} task activities!");
    }
    
    private function createActivity($task, $user, $activityType, $timestamp)
    {
        $activityTexts = [
            'created' => 'created this task',
            'updated' => 'updated the task details',
            'assigned' => 'was assigned to this task',
            'commented' => 'added a comment',
            'completed' => 'marked this task as complete',
            'reopened' => 'reopened this task',
            'moved' => 'moved this task to ' . fake()->randomElement(['In Progress', 'Review', 'Testing', 'Done']),
            'due_date_set' => 'set the due date to ' . fake()->dateTimeThisMonth()->format('M j, Y'),
            'due_date_changed' => 'changed the due date to ' . fake()->dateTimeThisMonth()->format('M j, Y'),
            'label_added' => 'added label "' . fake()->randomElement(['Bug', 'Feature', 'High Priority', 'Enhancement']) . '"',
            'attachment_added' => 'added an attachment',
            'description_updated' => 'updated the task description',
        ];
        
        Activity::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'field_changed' => $activityType,
            'new_value' => $activityTexts[$activityType],
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }
}
