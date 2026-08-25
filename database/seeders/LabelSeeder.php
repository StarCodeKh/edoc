<?php

namespace Database\Seeders;

use App\Models\Label;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('labels')->truncate();

        Project::select('id')->chunk(100, function ($projects) {
            foreach ($projects as $project) {
                Label::factory()->createMany([
                    ['name' => 'Copy Request', 'color' => '#7366FF', 'project_id' => $project->id],
                    ['name' => 'One More Step', 'color' => '#F97316', 'project_id' => $project->id],
                    ['name' => 'Priority', 'color' => '#EF4444', 'project_id' => $project->id],
                    ['name' => 'Design Team', 'color' => '#8B5CF6', 'project_id' => $project->id],
                    ['name' => 'Product Marketing', 'color' => '#0099ff', 'project_id' => $project->id],
                    ['name' => 'Help', 'color' => '#17e885', 'project_id' => $project->id],
                    ['name' => 'Production', 'color' => '#3B82F6', 'project_id' => $project->id],
                ]);
            }
        });
    }
}
