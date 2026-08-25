<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $projectTypes = [
            'Mobile App Development', 'Website Redesign', 'API Integration',
            'Marketing Campaign', 'Product Launch', 'System Migration',
            'Brand Identity', 'User Research', 'Quality Assurance',
            'Content Strategy', 'Database Optimization', 'Security Audit',
        ];

        $projectPrefixes = [
            'Q1', 'Q2', 'Q3', 'Q4', '2024', '2025', 'Phase 1', 'Phase 2',
            'Beta', 'Alpha', 'MVP', 'V2', 'Next Gen', 'Advanced',
        ];

        $createdAt = $this->faker->dateTimeBetween('-4 months', '-2 weeks');

        return [
            'title' => $this->faker->randomElement($projectPrefixes).' '.$this->faker->randomElement($projectTypes),
            'slug' => null, // Will be auto-generated
            'description' => $this->faker->realText(300),
            'is_private' => $this->faker->boolean(20), // 20% private
            'background_id' => $this->faker->numberBetween(1, 10),
            'created_at' => $createdAt,
            'updated_at' => $this->faker->dateTimeBetween($createdAt, 'now'),
        ];
    }
}
