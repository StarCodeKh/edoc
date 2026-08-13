<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){

        DB::table('email_templates')->truncate();
        $logo = URL::to('/images/logo.png');
        $html = File::get(public_path('html/email_templates/new_workspace_member.html'));
        EmailTemplate::factory()->create([
            'name' => 'Adding user to Workspace',
            'slug' => 'new_workspace_member',
            'details' => 'When customer add user to a workspace',
            'subject' => 'Welcome to {workspace_name} workspace',
            'language' => 'en',
            'html' => str_replace('/images/logo.png', $logo, $html)
        ]);

        $html = File::get(public_path('html/email_templates/user_assigned.html'));
        EmailTemplate::factory()->create([
            'name' => 'Assign to a task',
            'slug' => 'user_assigned',
            'details' => 'When an user got assigned on a task',
            'subject' => 'You have been assigned to task: {task_name}',
            'language' => 'en',
            'html' => str_replace('/images/logo.png', $logo, $html)
        ]);

        $html = File::get(public_path('html/email_templates/task_updated.html'));
        EmailTemplate::factory()->create([
            'name' => 'Task update',
            'slug' => 'task_updated',
            'details' => 'When a task has been updated.',
            'subject' => 'Task updated: {task_name}',
            'language' => 'en',
            'html' => str_replace('/images/logo.png', $logo, $html)
        ]);

        $html = File::get(public_path('html/email_templates/custom_mail.html'));
        EmailTemplate::factory()->create([
            'name' => 'General Mail',
            'slug' => 'custom_mail',
            'details' => 'It will use to send any email general purpose.',
            'subject' => 'ProTask Notification',
            'language' => 'en',
            'html' => str_replace('/images/logo.png', $logo, $html)
        ]);

        $html = File::get(public_path('html/email_templates/new_comment.html'));
        EmailTemplate::factory()->create([
            'name' => 'New comment',
            'slug' => 'new_comment',
            'details' => 'When a comment has been added on a task.',
            'subject' => 'New comment on task: {task_name}',
            'language' => 'en',
            'html' => str_replace('/images/logo.png', $logo, $html)
        ]);
    }
}
