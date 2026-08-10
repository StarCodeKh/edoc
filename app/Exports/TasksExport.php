<?php
namespace App\Exports;
use App\Models\Task;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TasksExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function forProject(int $project_id) {
        $this->project_id = $project_id;
        return $this;
    }

    public function query()
    {
        return Task::query()->where('project_id', $this->project_id);
    }

    public function headings(): array
    {
        return [
            'ID', 'Title', 'Slug', 'Description', 'Board', 'Project Name', 'Due Date', 'Order', 'User ID','List ID',
            'Created At'
        ];
    }

    public function map($row): array
    {
        return [
            $row->id, $row->title, $row->slug,
            $row->description, $row->list ? $row->list->title : null,
            $row->project ? $row->project->title: null, $row->due_date,
            $row->order, $row->user_id, $row->list_id, $row->created_at
        ];
    }
}
