<?php

namespace Database\Seeders;

use App\Models\BoardList;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoardListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('board_lists')->truncate();
        $project = Project::first();
        if($project){
            BoardList::factory()->createMany([
                ['title' => 'Project Resources', 'order' => 0, 'project_id' => $project->id],
                ['title' => 'Questions For Next Meeting', 'order' => 1, 'project_id' => $project->id],
                ['title' => 'Todo', 'order' => 2, 'project_id' => $project->id],
                ['title' => 'Pending', 'order' => 3, 'project_id' => $project->id],
                ['title' => 'Blocked', 'order' => 4, 'project_id' => $project->id],
                ['title' => 'In Progress', 'order' => 5, 'project_id' => $project->id],
                ['title' => 'Review', 'order' => 6, 'project_id' => $project->id],
                ['title' => 'Done', 'order' => 7, 'project_id' => $project->id],
            ]);
        }
    }
}
