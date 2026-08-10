<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\Project;
use App\Models\BoardList;
use App\Models\Label;
use App\Models\Assignee;
use App\Models\TaskLabel;
use App\Models\TeamMember;
use App\Models\Attachment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    /**
     * Track used attachments per project to avoid duplicates
     */
    private $usedAttachmentsPerProject = [];
    
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('📋 Creating tasks with assignees and labels...');
        
        $projects = Project::with(['workspace.teamMembers', 'boards', 'labels'])->get();
        
        if ($projects->count() === 0) {
            $this->command->error('❌ No projects found. Please run ProjectSeeder first.');
            return;
        }
        
        $createdTasks = collect();
        
        foreach ($projects as $project) {
            // Initialize used attachments array for this project
            $this->usedAttachmentsPerProject[$project->id] = [];
            $taskCount = fake()->numberBetween(20, 30); // 20-30 tasks per project
            
            for ($i = 0; $i < $taskCount; $i++) {
                $task = $this->createTask($project);
                $createdTasks->push($task);
                
                // Assign task to team members
                $this->assignTaskToUsers($task, $project);
                
                // Add labels to task
                $this->addLabelsToTask($task, $project);
                
                // Add attachments to task and set cover photo
                $coverAttachmentId = $this->addAttachmentsToTask($task, $project);
                if ($coverAttachmentId) {
                    // Update cover directly in database to avoid triggering observers during seeding
                    DB::table('tasks')->where('id', $task->id)->update(['cover' => $coverAttachmentId]);
                }
            }
            
            $this->command->info("✅ Created {$taskCount} tasks for project: {$project->title}");
        }
        
        $this->command->info("🎉 Successfully created {$createdTasks->count()} tasks with assignments and labels!");
        
        // Store task IDs for other seeders
        cache()->put('seeded_task_ids', $createdTasks->pluck('id')->toArray(), 3600);
    }
    
    private function createTask($project)
    {
        // Get workspace-specific task templates
        $workspaceName = $project->workspace->name;
        
        $taskTemplates = [
            'Adobe Creative Cloud' => [
                'Implement AI-powered selection tools in Photoshop',
                'Add new brush presets for digital painting',
                'Optimize memory usage for large file processing',
                'Create tutorial videos for new features',
                'Fix layer blending mode rendering issues',
                'Add support for new RAW camera formats',
                'Implement cloud sync for custom presets',
                'Update user interface for better accessibility',
                'Create automated backup system for projects',
                'Add collaborative editing capabilities',
                'Optimize export performance for 4K videos',
                'Implement smart object linking system',
                'Add new filter effects and adjustments',
                'Create mobile companion app features',
                'Fix cross-platform compatibility issues',
                'Implement advanced masking tools',
                'Add support for HDR color spaces',
                'Create plugin API documentation',
                'Optimize startup time for applications',
                'Implement version control for design files',
                'Add new typography features',
                'Create automated color correction tools',
                'Implement batch processing capabilities',
                'Add support for 3D model import',
                'Create performance monitoring dashboard',
                'Implement smart content-aware fill',
                'Add new animation keyframe tools',
                'Create cloud storage integration',
                'Implement advanced selection algorithms',
                'Add support for vector graphics editing'
            ],
            'Amazon Web Services' => [
                'Implement auto-scaling for EC2 instances',
                'Add new monitoring metrics to CloudWatch',
                'Create automated backup policies for RDS',
                'Implement security group automation',
                'Add support for new instance types',
                'Create cost optimization recommendations',
                'Implement automated patching system',
                'Add new load balancing algorithms',
                'Create disaster recovery procedures',
                'Implement automated scaling policies',
                'Add support for container orchestration',
                'Create performance benchmarking tools',
                'Implement automated security scanning',
                'Add new storage tier options',
                'Create automated deployment pipelines',
                'Implement cross-region replication',
                'Add support for serverless functions',
                'Create automated testing frameworks',
                'Implement automated compliance checks',
                'Add new networking features',
                'Create automated backup verification',
                'Implement automated failover systems',
                'Add support for hybrid cloud connections',
                'Create automated capacity planning',
                'Implement automated security updates',
                'Add new database optimization features',
                'Create automated monitoring alerts',
                'Implement automated scaling triggers',
                'Add support for edge computing',
                'Create automated cost analysis reports'
            ],
            'Google Chrome Team' => [
                'Implement new privacy protection features',
                'Add support for WebAssembly optimizations',
                'Create automated security vulnerability scanning',
                'Implement new tab management features',
                'Add support for progressive web apps',
                'Create automated performance monitoring',
                'Implement new extension security model',
                'Add support for advanced CSS features',
                'Create automated memory leak detection',
                'Implement new developer tools features',
                'Add support for WebRTC improvements',
                'Create automated compatibility testing',
                'Implement new bookmark synchronization',
                'Add support for advanced JavaScript features',
                'Create automated crash reporting system',
                'Implement new download management features',
                'Add support for hardware acceleration',
                'Create automated security updates',
                'Implement new user interface improvements',
                'Add support for advanced networking protocols',
                'Create automated performance optimization',
                'Implement new accessibility features',
                'Add support for advanced graphics APIs',
                'Create automated testing infrastructure',
                'Implement new synchronization features',
                'Add support for advanced security policies',
                'Create automated update distribution',
                'Implement new developer debugging tools',
                'Add support for advanced web standards',
                'Create automated quality assurance testing'
            ],
            'Figma Design Platform' => [
                'Implement real-time collaborative editing',
                'Add new vector editing tools',
                'Create automated design system generation',
                'Implement advanced prototyping features',
                'Add support for 3D design elements',
                'Create automated accessibility checking',
                'Implement new animation capabilities',
                'Add support for advanced typography',
                'Create automated design validation',
                'Implement new plugin architecture',
                'Add support for advanced color management',
                'Create automated design handoff features',
                'Implement new version control system',
                'Add support for advanced grid systems',
                'Create automated design consistency checking',
                'Implement new team collaboration features',
                'Add support for advanced export options',
                'Create automated design optimization',
                'Implement new component library features',
                'Add support for advanced masking tools',
                'Create automated design documentation',
                'Implement new mobile app features',
                'Add support for advanced layer management',
                'Create automated design testing tools',
                'Implement new cloud synchronization',
                'Add support for advanced text features',
                'Create automated design review system',
                'Implement new performance optimizations',
                'Add support for advanced shape tools',
                'Create automated design analytics'
            ],
            'Microsoft Windows' => [
                'Implement new security features for Windows 11',
                'Add support for advanced hardware acceleration',
                'Create automated system optimization',
                'Implement new accessibility improvements',
                'Add support for advanced networking features',
                'Create automated driver management',
                'Implement new user interface enhancements',
                'Add support for advanced virtualization',
                'Create automated system monitoring',
                'Implement new developer tools integration',
                'Add support for advanced cloud services',
                'Create automated system maintenance',
                'Implement new performance optimizations',
                'Add support for advanced security policies',
                'Create automated system backup features',
                'Implement new user experience improvements',
                'Add support for advanced hardware features',
                'Create automated system diagnostics',
                'Implement new compatibility features',
                'Add support for advanced networking protocols',
                'Create automated system updates',
                'Implement new developer platform features',
                'Add support for advanced graphics capabilities',
                'Create automated system recovery features',
                'Implement new user interface customization',
                'Add support for advanced security scanning',
                'Create automated system performance tuning',
                'Implement new cloud integration features',
                'Add support for advanced hardware management',
                'Create automated system health monitoring'
            ]
        ];
        
        // Get workspace-specific tasks or fallback to general
        $workspaceTasks = $taskTemplates[$workspaceName] ?? [
            'Implement new feature requirements',
            'Fix critical bug in production',
            'Add automated testing coverage',
            'Optimize application performance',
            'Update user interface design',
            'Implement security enhancements',
            'Add new API endpoints',
            'Create user documentation',
            'Implement automated deployment',
            'Add monitoring and logging',
            'Fix cross-browser compatibility',
            'Implement data validation',
            'Add error handling improvements',
            'Create automated backup system',
            'Implement user authentication',
            'Add new configuration options',
            'Create automated testing suite',
            'Implement caching mechanisms',
            'Add new reporting features',
            'Create automated maintenance tasks',
            'Implement data migration tools',
            'Add new integration capabilities',
            'Create automated quality checks',
            'Implement performance monitoring',
            'Add new user management features',
            'Create automated deployment pipeline',
            'Implement security scanning',
            'Add new analytics features',
            'Create automated testing framework',
            'Implement system optimization'
        ];
        
        $title = fake()->randomElement($workspaceTasks);
        
        // Get random board list, create default if none exist
        if ($project->boards->count() === 0) {
            // Create a default board list if none exist
            $boardList = \App\Models\BoardList::create([
                'title' => 'To Do',
                'project_id' => $project->id,
                'order' => 1,
                'is_archive' => 0,
                'user_id' => $project->user_id,
            ]);
        } else {
            $boardList = $project->boards->random();
        }
        
        // Create realistic due dates - some past, some future, some none
        $dueDate = null;
        if (fake()->boolean(70)) { // 70% of tasks have due dates
            $dueDate = $this->generateRealisticDueDate();
        }
        
        // Task completion based on board list
        $isDone = $this->determineTaskCompletion($boardList->title);
        
        return Task::create([
            'title' => $title,
            'slug' => Str::slug($title . '-' . fake()->randomNumber(4)),
            'description' => fake()->optional(0.6)->realText(200),
            'project_id' => $project->id,
            'list_id' => $boardList->id,
            'user_id' => $project->workspace->teamMembers && $project->workspace->teamMembers->count() > 0 
                ? $project->workspace->teamMembers->random()->user_id 
                : $project->user_id,
            'is_done' => $isDone,
            'is_archive' => fake()->boolean(3), // 3% archived
            'order' => fake()->numberBetween(1, 100),
            'due_date' => $dueDate,
            'created_at' => $createdAt = fake()->dateTimeBetween('-3 months', '-1 day'),
            'updated_at' => fake()->dateTimeBetween($createdAt, 'now'),
        ]);
    }
    
    private function generateRealisticDueDate()
    {
        // Generate dates that are good for calendar testing
        $scenarios = [
            'past_overdue' => 0.15,    // 15% overdue tasks
            'this_week' => 0.25,       // 25% due this week
            'next_week' => 0.20,       // 20% due next week
            'this_month' => 0.25,      // 25% due this month
            'future' => 0.15           // 15% due in the future
        ];
        
        $scenario = fake()->randomElement(array_keys($scenarios));
        
        switch ($scenario) {
            case 'past_overdue':
                return fake()->dateTimeBetween('-2 months', '-1 day');
            
            case 'this_week':
                $start = Carbon::now()->startOfWeek();
                $end = Carbon::now()->endOfWeek();
                return fake()->dateTimeBetween($start, $end)->setTime(
                    fake()->numberBetween(9, 17), // Business hours
                    fake()->randomElement([0, 30]) // On the hour or half hour
                );
            
            case 'next_week':
                $start = Carbon::now()->addWeek()->startOfWeek();
                $end = Carbon::now()->addWeek()->endOfWeek();
                return fake()->dateTimeBetween($start, $end)->setTime(
                    fake()->numberBetween(9, 17),
                    fake()->randomElement([0, 30])
                );
            
            case 'this_month':
                $start = Carbon::now()->addWeeks(2);
                $end = Carbon::now()->endOfMonth();
                
                // Ensure start date is not after end date
                if ($start->gt($end)) {
                    $start = Carbon::now()->addDays(1);
                }
                
                return fake()->dateTimeBetween($start, $end)->setTime(
                    fake()->numberBetween(9, 17),
                    fake()->randomElement([0, 30])
                );
            
            case 'future':
                return fake()->dateTimeBetween('+1 month', '+6 months')->setTime(
                    fake()->numberBetween(9, 17),
                    fake()->randomElement([0, 30])
                );
        }
    }
    
    private function determineTaskCompletion($boardListTitle)
    {
        // Determine completion based on board list
        $completedLists = ['Done', 'Deployed', 'Completed', 'Finished'];
        
        if (in_array($boardListTitle, $completedLists)) {
            return true;
        }
        
        // Some tasks in other lists might be completed too
        return fake()->boolean(10); // 10% chance
    }
    
    private function assignTaskToUsers($task, $project)
    {
        $teamMembers = $project->workspace->teamMembers;
        
        if (!$teamMembers || $teamMembers->count() === 0) return;
        
        // 70% of tasks get assigned, some get multiple assignees
        if (fake()->boolean(70)) {
            $assigneeCount = fake()->randomElement([1, 1, 1, 2, 2, 3]); // Weighted towards single assignee
            $assignees = $teamMembers->random(min($assigneeCount, $teamMembers->count()));
            
            foreach ($assignees as $teamMember) {
                Assignee::create([
                    'task_id' => $task->id,
                    'user_id' => $teamMember->user_id,
                ]);
            }
        }
    }
    
    private function addLabelsToTask($task, $project)
    {
        if ($project->labels->count() === 0) return;
        
        // 60% of tasks get labels
        if (fake()->boolean(60)) {
            $labelCount = fake()->randomElement([1, 1, 2, 2, 3]); // Weighted towards fewer labels
            $labels = $project->labels->random(min($labelCount, $project->labels->count()));
            
            foreach ($labels as $label) {
                TaskLabel::create([
                    'task_id' => $task->id,
                    'label_id' => $label->id,
                ]);
            }
        }
    }
    
    private function addAttachmentsToTask($task, $project)
    {
        // Dynamically scan for demo task images
        $demoImagesPath = public_path('images/demo/tasks');
        $demoImages = [];
        
        if (is_dir($demoImagesPath)) {
            $files = scandir($demoImagesPath);
            foreach ($files as $file) {
                // Skip directories and hidden files
                if ($file !== '.' && $file !== '..' && !str_starts_with($file, '.')) {
                    $demoImages[] = $file;
                }
            }
        }
        
        // Fallback to empty array if directory doesn't exist or is empty
        if (empty($demoImages)) {
            $this->command->warn("⚠️ No images found in {$demoImagesPath}. Skipping attachments for this task.");
            return null;
        }
        
        $firstAttachmentId = null;
        
        // 40% of tasks get attachments (1-3 attachments per task)
        if (fake()->boolean(40)) {
            $attachmentCount = fake()->numberBetween(1, 3);
            
            // Get available images that haven't been used in this project yet
            $usedInProject = $this->usedAttachmentsPerProject[$project->id] ?? [];
            $availableImages = array_diff($demoImages, $usedInProject);
            
            // If we don't have enough available images, reduce attachment count to available images
            if (count($availableImages) < $attachmentCount) {
                $attachmentCount = count($availableImages);
            }
            
            // If no available images, skip attachments for this task
            if ($attachmentCount <= 0) {
                return null;
            }
            
            // Select random images from available ones
            $selectedImages = fake()->randomElements($availableImages, $attachmentCount);
            
            foreach ($selectedImages as $index => $imageName) {
                // Track this image as used in this project
                $this->usedAttachmentsPerProject[$project->id][] = $imageName;
                
                // Get file extension
                $extension = pathinfo($imageName, PATHINFO_EXTENSION);
                
                // Generate realistic file sizes
                $fileSize = fake()->numberBetween(50000, 5000000); // 50KB to 5MB
                
                // Generate realistic dimensions for images
                $width = null;
                $height = null;
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    $width = fake()->numberBetween(800, 4000);
                    $height = fake()->numberBetween(600, 3000);
                }
                
                $attachment = Attachment::create([
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'name' => $imageName,
                    'path' => '/images/demo/tasks/' . $imageName,
                    'size' => $fileSize,
                    'width' => $width,
                    'height' => $height,
                    'created_at' => fake()->dateTimeBetween($task->created_at, 'now'),
                ]);
                
                // Store the first attachment ID for cover photo
                if ($index === 0) {
                    $firstAttachmentId = $attachment->id;
                }
            }
        }
        
        return $firstAttachmentId;
    }
}
