<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $taskTypes = [
            // Development
            'Implement user authentication', 'Fix login bug', 'Add payment integration',
            'Optimize database queries', 'Create API endpoints', 'Write unit tests',
            'Update documentation', 'Code review', 'Deploy to staging',
            
            // Design
            'Design landing page', 'Create wireframes', 'Update brand guidelines',
            'Design mobile mockups', 'Create icons', 'User interface improvements',
            
            // Marketing
            'Plan social media campaign', 'Write blog post', 'Create marketing materials',
            'Analyze campaign performance', 'SEO optimization', 'Email newsletter',
            
            // Management
            'Sprint planning meeting', 'Client presentation', 'Team standup',
            'Performance review', 'Budget planning', 'Stakeholder update',
            
            // General
            'Research competitors', 'Gather requirements', 'Schedule meetings',
            'Update project timeline', 'Prepare reports', 'Training session'
        ];
        
        $createdAt = $this->faker->dateTimeBetween('-3 months', '-1 day');
        $dueDate = $this->faker->optional(0.7)->dateTimeBetween('-1 month', '+2 months');
        
        return [
            'title' => $this->faker->randomElement($taskTypes),
            'slug' => null, // Will be auto-generated
            'description' => $this->faker->optional(0.6)->realText(150),
            'is_done' => $this->faker->boolean(30), // 30% completed
            'is_archive' => $this->faker->boolean(5), // 5% archived
            'order' => $this->faker->numberBetween(1, 100),
            'due_date' => $dueDate,
            'created_at' => $createdAt,
            'updated_at' => $this->faker->dateTimeBetween($createdAt, 'now'),
        ];
    }
}
