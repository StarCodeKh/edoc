<?php

namespace Database\Seeders;

use App\Models\Timer;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TimerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('⏱️ Creating time tracking data...');
        
        $tasks = Task::with(['assignees.user', 'project.workspace.teamMembers'])->get();
        
        if ($tasks->count() === 0) {
            $this->command->error('❌ No tasks found. Please run TaskSeeder first.');
            return;
        }
        
        $createdTimers = 0;
        
        foreach ($tasks as $task) {
            // 50% of tasks get time tracking
            if (fake()->boolean(50)) {
                $timerCount = fake()->numberBetween(1, 5);
                
                // Get users who can track time (assignees + team members)
                $potentialUsers = collect();
                
                // Add assignees
                foreach ($task->assignees as $assignee) {
                    $potentialUsers->push($assignee->user);
                }
                
                // Add some team members if no assignees
                if ($potentialUsers->count() === 0) {
                    $teamMembers = $task->project->workspace->teamMembers->pluck('user_id');
                    $users = User::whereIn('id', $teamMembers)->take(2)->get();
                    $potentialUsers = $potentialUsers->merge($users);
                }
                
                if ($potentialUsers->count() === 0) continue;
                
                $taskStartDate = Carbon::parse($task->created_at);
                $taskEndDate = Carbon::parse($task->updated_at);
                
                // Ensure end date is not before start date
                if ($taskEndDate->lt($taskStartDate)) {
                    $taskEndDate = $taskStartDate->copy()->addDays(1);
                }
                
                for ($i = 0; $i < $timerCount; $i++) {
                    $user = $potentialUsers->random();
                    
                    // Generate realistic work sessions
                    $sessionDate = fake()->dateTimeBetween($taskStartDate, $taskEndDate);
                    $startedAt = Carbon::parse($sessionDate)->setTime(
                        fake()->numberBetween(8, 16), // Work hours
                        fake()->randomElement([0, 15, 30, 45])
                    );
                    
                    // Session duration (15 minutes to 4 hours)
                    $sessionDuration = fake()->numberBetween(15, 240);
                    $stoppedAt = $startedAt->copy()->addMinutes($sessionDuration);
                    
                    // Ensure stopped time doesn't exceed task end date
                    if ($stoppedAt->gt($taskEndDate)) {
                        $stoppedAt = $taskEndDate;
                    }
                    
                    // Calculate duration in minutes and seconds before potentially setting stoppedAt to null
                    $duration = $startedAt->diffInMinutes($stoppedAt);
                    $durationSeconds = $startedAt->diffInSeconds($stoppedAt);
                    
                    // All timers are stopped for demo purposes
                    $isRunning = false;
                    
                    // Generate realistic memo notes based on task type
                    $memo = $this->generateMemoNote($task->title, $isRunning);
                    
                    Timer::create([
                        'task_id' => $task->id,
                        'user_id' => $user->id,
                        'duration' => $duration,
                        'duration_seconds' => $durationSeconds,
                        'memo' => $memo,
                        'started_at' => $startedAt,
                        'stopped_at' => $stoppedAt,
                        'created_at' => $startedAt,
                        'updated_at' => $stoppedAt ?? $startedAt,
                    ]);
                    
                    $createdTimers++;
                }
            }
        }
        
        $this->command->info("🎉 Successfully created {$createdTimers} timer entries!");
    }
    
    private function generateMemoNote($taskTitle, $isRunning)
    {
        // Generate contextual memo notes based on task type and status
        $memoTemplates = [
            'development' => [
                'Working on implementation and testing',
                'Code review and debugging session',
                'Feature development and optimization',
                'Bug fixes and performance improvements',
                'API integration and testing',
                'Database optimization and queries',
                'Frontend development and UI updates',
                'Backend logic implementation',
                'Testing and quality assurance',
                'Code refactoring and cleanup'
            ],
            'design' => [
                'Creating mockups and wireframes',
                'Design review and iteration',
                'UI/UX improvements and testing',
                'Brand consistency and guidelines',
                'Responsive design implementation',
                'User interface prototyping',
                'Visual design and asset creation',
                'Design system updates',
                'Accessibility improvements',
                'Design feedback and revisions'
            ],
            'marketing' => [
                'Campaign planning and strategy',
                'Content creation and optimization',
                'Social media management',
                'SEO research and implementation',
                'Analytics review and reporting',
                'Email marketing campaign',
                'Content marketing and blogging',
                'Lead generation activities',
                'Brand awareness initiatives',
                'Marketing automation setup'
            ],
            'management' => [
                'Team coordination and planning',
                'Project status review and updates',
                'Stakeholder communication',
                'Resource allocation and planning',
                'Performance review and feedback',
                'Strategic planning session',
                'Budget review and analysis',
                'Risk assessment and mitigation',
                'Process improvement planning',
                'Team building and development'
            ],
            'general' => [
                'Research and analysis',
                'Documentation and reporting',
                'Meeting preparation and follow-up',
                'Administrative tasks and coordination',
                'Data collection and analysis',
                'Training and skill development',
                'Quality assurance and testing',
                'Client communication and support',
                'Project coordination and updates',
                'Process documentation and review'
            ]
        ];
        
        // Determine task category based on keywords in title
        $category = 'general';
        $titleLower = strtolower($taskTitle);
        
        $developmentKeywords = ['implement', 'develop', 'code', 'fix', 'bug', 'api', 'database', 'frontend', 'backend'];
        $designKeywords = ['design', 'mockup', 'wireframe', 'ui', 'ux', 'visual', 'brand', 'layout'];
        $marketingKeywords = ['marketing', 'campaign', 'social', 'seo', 'content', 'email', 'lead', 'brand'];
        $managementKeywords = ['planning', 'review', 'meeting', 'coordination', 'management', 'strategy', 'budget', 'team'];
        
        if ($this->containsAnyKeyword($titleLower, $developmentKeywords)) {
            $category = 'development';
        } elseif ($this->containsAnyKeyword($titleLower, $designKeywords)) {
            $category = 'design';
        } elseif ($this->containsAnyKeyword($titleLower, $marketingKeywords)) {
            $category = 'marketing';
        } elseif ($this->containsAnyKeyword($titleLower, $managementKeywords)) {
            $category = 'management';
        }
        
        $baseMemo = fake()->randomElement($memoTemplates[$category]);
        
        // Add status-specific context
        if ($isRunning) {
            $statusContext = [
                ' - Currently in progress',
                ' - Active work session',
                ' - Ongoing development',
                ' - Work in progress',
                ' - Active session'
            ];
            $baseMemo .= fake()->randomElement($statusContext);
        } else {
            $statusContext = [
                ' - Session completed',
                ' - Work completed successfully',
                ' - Task finished',
                ' - Session ended',
                ' - Work completed'
            ];
            $baseMemo .= fake()->randomElement($statusContext);
        }
        
        // Add some additional context (60% chance)
        if (fake()->boolean(60)) {
            $additionalContext = [
                ' - Good progress made',
                ' - Some challenges encountered',
                ' - Smooth workflow',
                ' - Productive session',
                ' - Minor issues resolved',
                ' - Excellent progress',
                ' - Need to follow up',
                ' - Ready for next phase'
            ];
            $baseMemo .= fake()->randomElement($additionalContext);
        }
        
        return $baseMemo;
    }
    
    private function containsAnyKeyword($text, $keywords)
    {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }
        return false;
    }
}
