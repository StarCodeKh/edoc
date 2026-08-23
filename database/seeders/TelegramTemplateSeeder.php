<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

/**
 * Message bodies sent to Telegram, one per notification type.
 *
 * They live in the same table as the email templates and are told apart by
 * `channel`. Telegram renders a small HTML subset (b, i, u, s, a, code, pre),
 * so keep the markup to those tags. Placeholders use the same {name} syntax as
 * the email templates and are substituted by the notification classes.
 */
class TelegramTemplateSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->templates() as $template) {
            EmailTemplate::updateOrCreate(
                ['slug' => $template['slug'], 'channel' => 'telegram'],
                $template + ['channel' => 'telegram', 'language' => 'en']
            );
        }
    }

    private function templates(): array
    {
        return [
            [
                'name' => 'Telegram — New comment',
                'slug' => 'new_comment',
                'details' => 'Sent to Telegram when a comment is added to a task. Placeholders: {actor_name}, {task_name}, {project_name}, {workspace_name}, {comment}, {task_url}, {sent_at}',
                'html' => "💬 <b>New Comment</b>\n"
                    ."<b>Task:</b> <a href=\"{task_url}\">{task_name}</a>\n"
                    ."<b>Project:</b> {project_name}\n"
                    ."<b>Workspace:</b> {workspace_name}\n"
                    ."<b>By:</b> {actor_name}\n\n"
                    ."{comment}\n\n"
                    ."<i>{app_name} • {sent_at}</i>",
            ],
            [
                'name' => 'Telegram — Assigned to a task',
                'slug' => 'user_assigned',
                'details' => 'Sent to Telegram when someone is assigned to a task. Placeholders: {assignee_name}, {assigner_name}, {task_name}, {project_name}, {workspace_name}, {due_date}, {task_url}, {sent_at}',
                'html' => "📌 <b>Task Assigned</b>\n"
                    ."<b>Task:</b> <a href=\"{task_url}\">{task_name}</a>\n"
                    ."<b>Project:</b> {project_name}\n"
                    ."<b>Workspace:</b> {workspace_name}\n"
                    ."<b>Assigned to:</b> {assignee_name}\n"
                    ."<b>Assigned by:</b> {assigner_name}\n"
                    ."<b>Due:</b> {due_date}\n\n"
                    ."<i>{app_name} • {sent_at}</i>",
            ],
            [
                'name' => 'Telegram — Task updated',
                'slug' => 'task_updated',
                'details' => 'Sent to Telegram when a task changes. Placeholders: {actor_name}, {task_name}, {project_name}, {workspace_name}, {change_message}, {task_url}, {sent_at}',
                'html' => "✏️ <b>Task Updated</b>\n"
                    ."<b>Task:</b> <a href=\"{task_url}\">{task_name}</a>\n"
                    ."<b>Project:</b> {project_name}\n"
                    ."<b>Workspace:</b> {workspace_name}\n"
                    ."<b>Updated by:</b> {actor_name}\n\n"
                    ."{change_message}\n\n"
                    ."<i>{app_name} • {sent_at}</i>",
            ],
            [
                'name' => 'Telegram — New workspace member',
                'slug' => 'new_workspace_member',
                'details' => 'Sent to Telegram when a member joins a workspace. Placeholders: {member_name}, {adder_name}, {workspace_name}, {workspace_link}, {sent_at}',
                'html' => "👥 <b>New Workspace Member</b>\n"
                    ."<b>Workspace:</b> <a href=\"{workspace_link}\">{workspace_name}</a>\n"
                    ."<b>Member:</b> {member_name}\n"
                    ."<b>Added by:</b> {adder_name}\n\n"
                    ."<i>{app_name} • {sent_at}</i>",
            ],
            [
                'name' => 'Telegram — Project updated',
                'slug' => 'project_update',
                'details' => 'Sent to Telegram when project or board details change. Placeholders: {board_name}, {project_name}, {link}, {sent_at}',
                'html' => "📋 <b>Project Updated</b>\n"
                    ."<b>Board:</b> <a href=\"{link}\">{board_name}</a>\n"
                    ."<b>Project:</b> {project_name}\n\n"
                    ."<i>{app_name} • {sent_at}</i>",
            ],
        ];
    }
}
