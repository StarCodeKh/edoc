<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspacesInsertSeeder extends Seeder
{
    private const WORKSPACES = [
        'ឯកសារផ្ទៃក្នុង' => 'លំហូការងារផ្ទៃក្នុងតាមប្រព័ន្ធឯកសារអេឡិចត្រូនិក',
        'ឯកសារខាងក្រៅ' => 'លំហូការងារឯកសារខាងក្រៅតាមប្រព័ន្ធ e-Document',
        'ឯកសារកាស៊ីណូ' => 'លំហូការងារ និងប្រព័ន្ធតាមដានឯកសារ សម្រាប់ការដាក់ពាក្យស្នើសុំពីប្រតិបត្តិការស៊ីណូ',
    ];

    public function run(): void
    {
        $owner = User::where('role_id', 1)->first() ?? User::first();

        if (!$owner) {
            $this->command->error('No users exist yet — create/seed at least one user first, then re-run this seeder.');
            return;
        }

        foreach (self::WORKSPACES as $name => $description) {
            $workspace = Workspace::firstOrCreate(
                ['name' => $name],
                [
                    'user_id' => $owner->id,
                    'slug' => $this->slugify($name),
                    'description' => $description,
                    'type_id' => 19,
                    'website' => 'https://edoc.cgmc.gov.kh',
                ]
            );

            $backfill = [];
            if (empty($workspace->slug)) {
                $backfill['slug'] = $this->slugify($name);
            }
            if (empty($workspace->description)) {
                $backfill['description'] = $description;
            }
            if (!empty($backfill)) {
                $workspace->update($backfill);
            }

            if ($workspace->wasRecentlyCreated) {
                DB::table('team_members')->insert([
                    'workspace_id' => $workspace->id,
                    'user_id' => $owner->id,
                    'added_by' => $owner->id,
                    'role' => 'admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("Created workspace '{$workspace->name}' (#{$workspace->id}), owner #{$owner->id} ({$owner->name}). slug={$workspace->slug}");
            } else {
                $fresh = $workspace->fresh();
                $this->command->line("Workspace '{$fresh->name}' (#{$fresh->id}) already exists, slug={$fresh->slug}.");
            }
        }

        $this->command->info('Pre-made board list setting seeded.');
    }

    private function slugify(string $name): string
    {
        $slug = trim($name);
        $slug = preg_replace('/\s+/u', '-', $slug);

        if ($slug === '' || $slug === null) {
            $slug = 'workspace-' . Str::random(6);
        }

        $base = $slug;
        $i = 2;
        while (Workspace::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i;
            $i++;
        }

        return $slug;
    }
}