<?php

namespace Database\Seeders;

use App\Models\Background;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class SetWorkspaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = User::factory()->create(['email' => 'john.due@mail.com', 'password' => 'secret', 'role_id' => 1]);
        $backgrounds = Background::limit(50)->get();
        $workspace = Workspace::factory()->create(['name' => 'Sochara Dev Team', 'slug' => $this->clean('Sochara Dev Team'), 'user_id' => $user->id]);
        $projectTitles = ['Project Management', 'Remote Team Meetings', 'Meeting Agenda', 'Agile Board Template',
            'Company Overview', 'Design Huddle', 'Go To Market Strategy Template', 'Kanban Template',
            'Personal Productivity System', 'Simple Project Board', 'Weekly Planning'];

        $project = Project::factory()->create(['title' => 'Project Management', 'slug' => $this->clean('Project Management'),
            'user_id' => $user->id, 'background_id' => $backgrounds->random()->id, 'workspace_id' => $workspace->id]);


    }


    private function clean($string) {
        $string = str_replace(' ', '-', $string);
        $string = preg_match("/[a-z]/i", $string)?$string:'untitled';
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
        return preg_replace('/-+/', '-', $string);
    }
}
