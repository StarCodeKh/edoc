<?php

namespace Database\Seeders;

use App\Models\NotificationSetting;
use Illuminate\Database\Seeder;

class NotificationSettingSeeder extends Seeder
{
    public function run()
    {
        NotificationSetting::updateOrCreate(['type' => 'new_comment'], [
            'name' => 'New Comment on a Task',
            'description' => 'Notify users when a new comment is added to a task they follow.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

        NotificationSetting::updateOrCreate(['type' => 'user_assigned'], [
            'name' => 'User Assigned to a Task',
            'description' => 'Notify a user when they are assigned to a new task.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

        NotificationSetting::updateOrCreate(['type' => 'task_updated'], [
            'name' => 'Task Updates',
            'description' => 'Notify followers when a task\'s title, due date, or status changes.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

        NotificationSetting::updateOrCreate(['type' => 'new_workspace_member'], [
            'name' => 'New Member Added to Workspace',
            'description' => 'Notify a user when they are added to a new workspace.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

        NotificationSetting::updateOrCreate(['type' => 'project_update'], [
            'name' => 'Project Updates',
            'description' => 'Notify users when project details are updated.',
            'can_be_emailed' => true,
            'can_be_slacked' => true,
            'is_active' => true,
            'email_is_active' => false,
            'slack_is_active' => false,
        ]);

    }
}
