<?php

namespace App\Http\Controllers;

use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\CheckList;
use App\Models\Comment;
use App\Models\DocumentSource;
use App\Models\WorkspaceType;
use App\Models\Label;
use App\Models\Project;
use App\Models\Setting;
use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\TeamMember;
use App\Models\Timer;
use App\Models\UserGroup;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Mavinoo\Batch\Batch;

class TasksController extends Controller
{
    public function merge(Request $request)
    {
        $validated = $request->validate([
            'target_id' => 'required|integer|exists:tasks,id',
            'source_ids' => 'required|array|min:1',
            'source_ids.*' => 'integer|exists:tasks,id|different:target_id',
        ]);

        $target = Task::findOrFail($validated['target_id']);
        $sourceIds = array_unique($validated['source_ids']);

        DB::transaction(function () use ($target, $sourceIds) {
            Comment::whereIn('task_id', $sourceIds)->update(['task_id' => $target->id]);
            Attachment::whereIn('task_id', $sourceIds)->update(['task_id' => $target->id]);
            Checklist::whereIn('task_id', $sourceIds)->update(['task_id' => $target->id]);
            $existingLabelIds = $target->taskLabels()->pluck('label_id')->all();
            TaskLabel::whereIn('task_id', $sourceIds)
                ->whereNotIn('label_id', $existingLabelIds)
                ->update(['task_id' => $target->id]);
            TaskLabel::whereIn('task_id', $sourceIds)->delete();

            $history = collect($target->merged_history ?? []);
            $eventNumber = $history->pluck('merge_code')->filter()->unique()->count() + 1;
            $mergeCode = 'MRG-' . now()->format('Y') . '-' . str_pad($target->id, 4, '0', STR_PAD_LEFT) . '-' . str_pad($eventNumber, 2, '0', STR_PAD_LEFT);

            $sourceTasks = Task::whereIn('id', $sourceIds)->get(['id', 'title', 'task_code', 'slug']);
            foreach ($sourceTasks as $src) {
                $history->push([
                    'id' => $src->id,
                    'title' => $src->title,
                    'code' => $src->task_code ?: ('CGMC-' . str_pad($src->id, 9, '0', STR_PAD_LEFT)),
                    'slug' => $src->slug,
                    'merge_code' => $mergeCode,
                    'merged_at' => now()->toDateTimeString(),
                ]);
            }
            $target->merged_history = $history->values()->all();
            $target->saveQuietly();
            Task::whereIn('id', $sourceIds)->delete();
        });

        $target->load(['taskLabels.label', 'assignees', 'list', 'cover'])
            ->loadCount(['comments', 'attachments', 'checklists', 'checklistDone']);

        return response()->json($target);
    }

    public function unmerge(Request $request)
    {
        $validated = $request->validate([
            'target_id' => 'required|integer|exists:tasks,id',
            'history_id' => 'required',
        ]);

        $target = Task::findOrFail($validated['target_id']);
        $history = collect($target->merged_history ?? []);
        $entry = $history->first(fn ($h) => (string) $h['id'] === (string) $validated['history_id']);

        if (!$entry) {
            return response()->json(['message' => 'That item is not in this task\'s merge history.'], 404);
        }

        $restored = null;

        DB::transaction(function () use ($target, $history, $entry, &$restored) {
            $restored = Task::withTrashed()->find($entry['id']);

            if ($restored) {
                $restored->restore();
            } else {
                $restored = Task::create([
                    'title' => $entry['title'],
                    'task_code' => $entry['code'] ?? null,
                    'project_id' => $target->project_id,
                    'list_id' => $target->list_id,
                    'user_id' => auth()->id(),
                    'order' => 0,
                ]);
            }

            $remaining = $history->reject(fn ($h) => (string) $h['id'] === (string) $entry['id'])->values();
            $target->merged_history = $remaining->all();
            $target->saveQuietly();
        });

        return response()->json([
            'target' => $target->fresh(),
            'restored' => $restored,
        ]);
    }

    public function activities($id)
    {
        $rows = Activity::where('task_id', $id)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'task_id', 'field_changed', 'old_value', 'new_value', 'created_at']);

        return response()->json($rows);
    }

    public function updateTaskOrder(Request $request)
    {
        $requestData = $request->all();
        $result = \Batch::update(new Task, $requestData, 'id');
        return response()->json($result);
    }

    public function jsonTaskSearch(Request $request)
    {
        $search = $request->input('q');
        $result = [];
        $result['tasks'] = Task::where('title', 'like', '%'.$search.'%')
            ->orWhere('task_code', 'like', '%'.$search.'%')
            ->orWhere('description', 'like', '%'.$search.'%')
            ->select('id', 'project_id', 'title')->get();

        $result['projects'] = Project::where('title', 'like', '%'.$search.'%')
            ->select('id', 'title')->get();
        return response()->json($result);
    }

    public function updateTask($taskId, Request $request)
    {
        $task = Task::whereId($taskId)->first();
        $requestData = $request->all();
        foreach ($requestData as $itemKey => $itemValue){
            $task->{$itemKey} = $itemValue;
        }
        $task->save();
        $task->load('list')->load('taskLabels.label')->load('project.background')->load('assignees')->load('timer')->load('documentSource.parent');
        return response()->json($task);
    }

    public function jsonArchiveTasks($project_id)
    {
        $archiveTasks = Task::where('is_archive', 1)
            ->byProject($project_id)
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->with('assignees')
            ->with('list')
            ->has('list')
            ->get();
        return response()->json($archiveTasks);
    }

    public function updateTaskListByProjectId($projectId, Request $request)
    {
        $data = $request->all();
        $from_lists = [];
        $new_list = [];
        if (!empty($data['is_move'])){
            $from_lists = Task::where('list_id', $data['previous_list'])->orderBy('order')->select(['id', 'order'])->get()->toArray();
            $to_lists = Task::where('list_id', $data['new_list'])->orderBy('order')->pluck('id')->toArray();
            $previous_order = array_search($data['task_id'], $to_lists);
            $out = array_splice($to_lists, $previous_order, 1);
            array_splice($to_lists, $data['to'] - 1, 0, $out);
        }else{
            $to_lists = Task::where('list_id', $data['new_list'])->orderBy('order')->pluck('id')->toArray();
            $out = array_splice($to_lists, $data['from'] - 1, 1);
            array_splice($to_lists, $data['to'] - 1, 0, $out);
        }
        foreach ($to_lists as $item_k => $item_v){
            $new_list[$item_k] = ['id' => $item_v, 'order' => $item_k + 1];
        }
        $result = \Batch::update(new Task, $from_lists + $new_list, 'id');
        return response()->json($result);
    }

    private function moveElement(&$array, $a, $b)
    {
        $out = array_splice($array, $a, 1);
        array_splice($array, $b, 0, $out);
        return $array;
    }

    public function newTask(Request $request)
    {
        $user_id = auth()->id();
        $requestData = $request->all();
        $requestData['user_id'] = $user_id;
        $task = Task::create($requestData);

        $task->load('lastAssignee')->load('taskLabels.label')->loadCount('checklistDone')->loadCount('comments')->loadCount('checklists')->loadCount('attachments')->loadCount('assignees');
        return response()->json($task);
    }

    public function deleteDask($id)
    {
        $result = null;
        $task = Task::where('id', $id)->first();
        if(!empty($task)){
            $attachments = Attachment::where('task_id', $task->id)->get();
            foreach ($attachments as $attachment){
                if(!empty($attachment->path) && File::exists(public_path($attachment->path))){
                    File::delete(public_path($attachment->path));
                }
                $attachment->delete();
            }
            CheckList::where('task_id', $task->id)->delete();
            Timer::where('task_id', $task->id)->delete();
            Comment::where('task_id', $task->id)->delete();
            Assignee::where('task_id', $task->id)->delete();
            TaskLabel::where('task_id', $task->id)->delete();
            $result = $task->delete();
        }
        return response()->json($result);
    }

    public function getJsonTask($taskUid)
    {
        $task = Task::withTrashed()
            ->when(is_numeric($taskUid), function ($query) use ($taskUid) {
                $query->where('id', $taskUid);
            }, function ($query) use ($taskUid) {
                $query->where('slug', $taskUid);
            })
            ->with([
                'project',
                'timer',
                'cover',
                'list',
                'checklists',
                'activities' => function ($query) {
                    $query->with(['user', 'comment'])->orderBy('created_at', 'desc');
                },
                'attachments',
                'assignees',
                'taskLabels.label',
                'documentSource.parent',
            ])
            ->withCount('checklistDone')
            ->first();

        if (empty($task)) {
            abort(404, 'Task not found.');
        }

        $task->is_demo = (int) config('app.demo');
        $task->load('watchers');
        $task->is_watched_by_user = $task->watchers->contains(auth()->user());

        return response()->json($task);
    }

    public function countListItemsById($id)
    {
        $taskCount = Task::where('list_id', $id)->count();
        return response()->json($taskCount);
    }

    public function taskOtherData($task_id, $project_id)
    {
        $project = Project::where('id', $project_id)->first();
        $labels = Label::where('project_id', $project_id)->get();
        $lists = BoardList::withCount('tasks')->get();
        $projects = Project::get();
        $teamMembers = TeamMember::with('user')->groupBy('user_id')->where('workspace_id', $project->workspace_id)->get();
        $timer = Timer::running()->mine()->where('task_id', '!=', $task_id)->first() ?? null;
        $duration = Timer::where('task_id', $task_id)->sum('duration');

        $documentSources = DocumentSource::departments()
            ->select('id', 'name')
            ->with(['children' => function ($query) {
                $query->select('id', 'name', 'parent_id')->orderBy('order');
            }])
            ->get();

        $documentTypes = WorkspaceType::select('id', 'name', 'code')->orderBy('name')->get();

        $userGroups = UserGroup::select('id', 'name', 'edoc_role')->orderBy('name')->get();

        return response()->json([
            'labels' => $labels,
            'lists' => $lists,
            'timer' => $timer,
            'duration' => $duration,
            'projects' => $projects,
            'team_members' => $teamMembers,
            'document_sources' => $documentSources,
            'document_types' => $documentTypes,
            'user_groups' => $userGroups,
        ]);
    }

    public function addAttachment($id, Request $request)
    {
        $attachment = [];
        if($request->file('file')){
            $file = $request->file('file');

            $settingValue = optional(Setting::where('slug', 'allowed_file_types')->first())->value;
            $allowed_file_types = is_string($settingValue) ? json_decode($settingValue, true) : $settingValue;

            // Force only PDF
            $allowed_file_types = ['pdf'];

            // Request validation rule example
            $request->validate([
                'file' => 'required|file|mimes:pdf|max:51200',
            ]);

            if(! in_array($file->extension(), $allowed_file_types) ){
                $supportedExtensions = implode(', ', $allowed_file_types);
                return response()->json([
                    'error' => true,
                    'message' => "The uploaded file type is not allowed. Supported formats: {$supportedExtensions}."
                ]);
            }
            list($width, $height) = getimagesize($file);
            $file_name_origin = $file->getClientOriginalName();
            $file_name = uniqid().'-'.$this->clean(pathinfo($file_name_origin, PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $size = $file->getSize();
            $file_path = '/files/'.$file->storeAs('tasks', $file_name, ['disk' => 'file_uploads']);
            $attachment = Attachment::create(['task_id' => $id, 'name' => $file_name_origin, 'user_id' => auth()->id(), 'size' => $size, 'path' => $file_path, 'width' => $width, 'height' => $height]);
        }
        return response()->json($attachment);
    }

    public function removeAttachment($id)
    {
        $attachment = Attachment::find($id);
        if(!empty($attachment) && !empty($attachment->path) && File::exists(public_path($attachment->path))){
            File::delete(public_path($attachment->path));
        }
        $result = $attachment->delete();
        return response()->json($result);
    }

    private function clean($string)
    {
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
        $string = preg_replace('/-+/', '-', $string);
        return trim($string, '-');
    }
}