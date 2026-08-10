<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $companyTypes = [
            'Technology Startup', 'Digital Marketing Agency', 'Software Development', 
            'E-commerce Platform', 'Creative Studio', 'Consulting Firm',
            'Healthcare Solutions', 'Educational Technology', 'Financial Services',
            'Media & Entertainment'
        ];
        
        $companyNames = [
            'InnovateHub', 'TechForward', 'CreativeFlow', 'DataDriven Solutions',
            'NextGen Systems', 'CloudScale', 'DigitalCraft', 'SmartBuild',
            'ProActive Labs', 'FutureScope'
        ];
        
        $createdAt = $this->faker->dateTimeBetween('-6 months', '-1 month');
        
        return [
            'name' => $this->faker->randomElement($companyNames) . ' ' . $this->faker->randomElement(['Inc', 'LLC', 'Corp', 'Ltd']),
            'website' => 'https://' . strtolower(str_replace(' ', '', $this->faker->randomElement($companyNames))) . '.com',
            'description' => $this->faker->realText(200),
            'type_id' => $this->faker->numberBetween(1, 6),
            'created_at' => $createdAt,
            'updated_at' => $this->faker->dateTimeBetween($createdAt, 'now'),
        ];
    }
}
