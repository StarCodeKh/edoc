<?php

namespace App\Http\Controllers;

use App\Exports\TasksExport;
use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\Background;
use App\Models\BoardList;
use App\Models\CheckList;
use App\Models\Comment;
use App\Models\EdocWorkflowRole;
use App\Models\Label;
use App\Models\Project;
use App\Models\RecentProject;
use App\Models\StarredProject;
use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\TeamMember;
use App\Models\Timer;
use App\Models\Workspace;
use App\Support\WorkflowStep;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Maatwebsite\Excel\Excel;

class ProjectsController extends Controller
{
    public function index()
    {
        return Inertia::render('Projects/Index', [
            'title' => 'Projects',
        ]);
    }

    public function uploadBackground($id, Request $request)
    {
        $background = null;
        if ($request->file('file')) {
            $file = $request->file('file');
            $allowedMimeTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml', 'image/webp'];
            $contentType = $file->getClientmimeType();

            if (!in_array($contentType, $allowedMimeTypes)) {
                return response()->json(['error' => true, 'message' => 'File type is not supported!']);
            }
            $file_name_origin = $file->getClientOriginalName();
            $file_name = uniqid().'-'.$this->clean(pathinfo($file_name_origin, PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $file_path = '/files/'.$file->storeAs('projects', $file_name, ['disk' => 'file_uploads']);
            $background = Background::create(['image' => $file_path, 'bg' => '#624b66', 'top' => '#624b66', 'side' => '#705675e6', 'type' => 'custom']);
        }

        return response()->json($background);
    }

    public function updateBackground($projectId, Request $request)
    {
        $background = null;
        $requests = $request->all();
        if (!empty($requests['background_id'])) {
            $background = Background::where('id', $requests['background_id'])->first();
            if (!empty($background)) {
                $project = Project::where('id', $projectId)->first();
                if (!empty($project)) {
                    if (!empty($project->background_id)) {
                        $previous_background = Background::where('id', $project->background_id)->first();
                        if (!empty($previous_background) && $previous_background->type == 'custom') {
                            if (!empty($previous_background->image) && File::exists(public_path($previous_background->image))) {
                                File::delete(public_path($previous_background->image));
                            }
                            $previous_background->delete();
                        }
                    }
                    $project->background_id = $background->id;
                    $project->save();
                }
            }
        }

        return response()->json($background);
    }

    public function jsonCreate(Request $request)
    {
        $requests = $request->all();
        $requests['user_id'] = auth()->id();
        unset($requests['board_list_names']);

        $project = Project::create($requests);

        $io = 0;

        if (!empty($project->workspace_id)) {
            $workflowRoleTitles = EdocWorkflowRole::where('workspace_id', $project->workspace_id)
                ->orderBy('order')
                ->pluck('list_title');

            foreach ($workflowRoleTitles as $item) {
                BoardList::create(['user_id' => $requests['user_id'], 'order' => $io, 'project_id' => $project->id, 'title' => $item]);
                $io += 1;
            }
        }

        $slug = $this->clean($project->title);
        $existingItem = Project::where('slug', $slug)->first();
        if (!empty($existingItem)) {
            $slug = $slug.'-'.$project->id;
        }
        $project->slug = $slug;
        $project->save();

        return response()->json($project);
    }

    public function jsonMembers($project_id)
    {
        $assignees = Assignee::whereHas('task', function ($q) use ($project_id) {
            $q->where('project_id', $project_id);
        })->where('user_id', '!=', auth()->id())->groupBy('user_id')->with('user:id,first_name,last_name,photo_path')->get();

        return response()->json($assignees);
    }

    public function jsonFilterData($project_id)
    {
        $assignees = Assignee::whereHas('task', function ($q) use ($project_id) {
            $q->where('project_id', $project_id);
        })->where('user_id', '!=', auth()->id())->groupBy('user_id')->with('user:id,first_name,last_name,photo_path')->get();
        $labels = Label::where('project_id', $project_id)->orderBy('name')->get();

        return response()->json(['assignees' => $assignees, 'labels' => $labels]);
    }

    public function all()
    {
        $projects = Project::get();

        return response()->json($projects);
    }

    public function jsonAll($workspace_id)
    {
        $projects = Project::where('workspace_id', $workspace_id)->with('background')->with('star')->get();

        return response()->json($projects);
    }

    public function jsonRecent()
    {
        $user_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $projects = RecentProject::where('user_id', $user_id)->with('project')->has('project.workspace')->whereHas('project', function ($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->orderBy('opened', 'desc')->paginate(10)
            ->through(function ($project) {
                return [
                    'id' => $project->project->id,
                    'title' => $project->project->title,
                    'slug' => $project->project->slug,
                    'star' => (bool) $project->project->star,
                    'workspace' => $project->project->workspace->name,
                    'background' => $project->project->background ? $project->project->background->image : null,
                ];
            });

        return response()->json($projects);
    }

    public function jsonStar()
    {
        $user_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $projects = StarredProject::where('user_id', $user_id)->with('project')->has('project.workspace')->whereHas('project', function ($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->orderBy('updated_at', 'desc')->paginate(100)
            ->through(function ($project) {
                return [
                    'id' => $project->project->id,
                    'title' => $project->project->title,
                    'slug' => $project->project->slug,
                    'star' => (bool) $project->project->star,
                    'workspace' => $project->project->workspace->name,
                    'background' => $project->project->background ? $project->project->background->image : null,
                ];
            });

        return response()->json($projects);
    }

    public function update($id, Request $request)
    {
        $project = Project::whereId($id)->first();
        $requestData = $request->all();
        foreach ($requestData as $itemKey => $itemValue) {
            $project->{$itemKey} = $itemValue;
        }

        $slug = $this->clean($project->title);
        $existingItem = Project::where('id', '!=', $project->id)->where('slug', $slug)->first();
        if (!empty($existingItem)) {
            $slug = $slug.'-'.$project->id;
        }
        $project->slug = $slug;

        $project->save();

        return response()->json($project);
    }

    public function noProject()
    {
        return Inertia::render('Projects/Na', [
            'title' => 'No Workspace',
            'notice' => 'You did not assigned any workspace yet. Please contact with admin',
        ]);
    }

    // DocumentReceipt.vue / WorkspaceMenu.vue
    public function view($uid, Request $request)
    {
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $requests = $request->all();
        $project = Project::bySlugOrId($uid)
            ->whereIn('workspace_id', $workspaceIds)
            ->with('workspace.member')
            ->with('star')
            ->with('background')
            ->withCount(['tasks' => function ($query) {
                $query->where('is_done', 0)
                    ->where('is_archive', 0)
                    ->whereHas('list')
                    ->visibleTo();
            }])
            ->first();
        if (empty($project)) {
            return abort(404);
        }
        RecentProject::updateOrCreate(['user_id' => $auth_id, 'project_id' => $project->id], ['opened' => Carbon::now()]);
        $list_index = [];
        $board_lists = BoardList::where('project_id', $project->id)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }
        unset($listItem);

        // Tells the board which of its columns are signature steps, per
        // Settings → Workflow Roles.
        $board_lists = WorkflowStep::decorate($board_lists, $project->workspace_id);

        // Who sees what is Task::scopeVisibleTo's job alone - admins see every
        // document, a Normal User only their own and the ones assigned to them.
        // A private project used to add `private_task` on top of that for anyone
        // but role_id 1, which quietly cut an Admin down to a Normal User and
        // hid a Normal User's *own* documents (private_task matches assignees
        // only). The board then disagreed with the sidebar count, which never
        // had that extra filter.
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('cover')
            ->with('documentSource.parent')
            ->with('type')
            ->with('priority')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')->with('assignees')
            ->orderByOrder()->get()->toArray();
        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        $palette = ['#4a90d9', '#c9d94d', '#4caf50', '#e0503a', '#9b59b6', '#f0a63a', '#7cb342', '#26a69a'];
        $totalTasks = count($tasks);

        $statusItems = [];
        $summarySegments = [];
        $statistics = [];
        foreach ($board_lists as $idx => $listItem) {
            $color = $palette[$idx % count($palette)];
            $listTaskCount = count($listItem['tasks']);

            $statusItems[] = [
                'label' => $listItem['title'],
                'value' => $listTaskCount,
                'color' => $color,
            ];

            $summarySegments[] = [
                'label' => $listItem['title'],
                'value' => $listTaskCount,
                'percent' => $totalTasks > 0 ? round(($listTaskCount / $totalTasks) * 100) : 0,
                'color' => $color,
            ];

            $doneCount = collect($listItem['tasks'])->where('is_done', 1)->count();
            $statistics[] = [
                'label' => $listItem['title'],
                'done' => $doneCount,
                'total' => $listTaskCount,
                'percent' => $listTaskCount > 0 ? round(($doneCount / $listTaskCount) * 100) : 0,
            ];
        }

        $doneTotal = collect($tasks)->where('is_done', 1)->count();

        $statusCards = [[
            'title' => $project->title,
            'total' => $totalTasks,
            'items' => $statusItems,
        ]];

        $summary = [
            'percent' => $totalTasks > 0 ? round(($doneTotal / $totalTasks) * 100) : 0,
            'segments' => $summarySegments,
        ];

        return Inertia::render('Projects/View', [
            'title' => 'Board | '.$project->title,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
            'project' => $project,
            'tasks' => $tasks,
            'statusCards' => $statusCards,
            'summary' => $summary,
            'statistics' => $statistics,
        ]);
    }

    public function viewWithTask($projectUid, $taskUid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($projectUid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $list_index = [];
        $board_lists = BoardList::where('project_id', $project->id)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }
        unset($listItem);

        $board_lists = WorkflowStep::decorate($board_lists, $project->workspace_id);

        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->whereHas('list')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->with('assignees')
            ->orderByOrder()
            ->get()->toArray();
        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }
        $task = Task::visibleTo()->where(function ($q) use ($taskUid) {
            $q->where('id', $taskUid)->orWhere('slug', $taskUid);
        })->first();

        return Inertia::render('Projects/View', [
            'title' => 'Projects',
            'filters' => $requests,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'project' => $project,
            'task' => $task,
            'tasks' => $tasks,
        ]);
    }

    public function viewTable($uid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($uid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $list_index = [];
        $board_lists = BoardList::where('project_id', $project->id)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('documentSource.parent')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->orderByOrder()
            ->get()->toArray();
        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        return Inertia::render('Projects/Table', [
            'title' => 'Table | '.$project->title,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'project' => $project,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function viewTableWithTask($uid, $taskUid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($uid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $list_index = [];
        $board_lists = BoardList::where('project_id', $project->id)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->orderByOrder()
            ->get()->toArray();
        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }
        $task = Task::visibleTo()->where(function ($q) use ($taskUid) {
            $q->where('id', $taskUid)->orWhere('slug', $taskUid);
        })->first();

        return Inertia::render('Projects/Table', [
            'title' => 'Projects',
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
            'project' => $project,
            'task' => $task,
            'timer' => Timer::with('task')->mine()->running()->first() ?? null,
            'tasks' => $tasks,
        ]);
    }

    public function viewDashboard($uid)
    {
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($uid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $taskIds = Task::where('project_id', $project->id)->pluck('id')->toArray();
        $per_list = Task::select('list_id', DB::raw('count(*) as total'))->where('project_id', $project->id)->groupBy('list_id')->whereHas('list')->with('list')->get()->toArray();
        $per_assignee = Assignee::select('user_id', DB::raw('count(*) as total'))->whereIn('task_id', $taskIds)->groupBy('user_id')->with('user')->get()->toArray();
        $per_label = TaskLabel::select('label_id', DB::raw('count(*) as total'))->whereIn('task_id', $taskIds)->groupBy('label_id')->with('label')->get()->toArray();
        $due_done = Task::where('project_id', $project->id)->where('is_done', 1)->count();
        $no_due = Task::where('project_id', $project->id)->whereNull('due_date')->count();
        $due_over = Task::where('project_id', $project->id)->where('due_date', '<', Carbon::now())->count();
        $due_later = Task::where('project_id', $project->id)->where('due_date', '>', Carbon::now()->addDay())->count();
        $due_soon = Task::where('project_id', $project->id)->whereBetween('due_date', [Carbon::now(), Carbon::now()->addDay()])->count();

        return Inertia::render('Projects/Dashboard', [
            'title' => 'Dashboard | '.$project->title,
            'per_list' => $per_list,
            'project' => $project,
            'per_assignee' => $per_assignee,
            'per_label' => $per_label,
            'due_data' => [
                ['due' => ['name' => 'Complete', 'color' => '#22A06B'], 'total' => $due_done],
                ['due' => ['name' => 'Due soon', 'color' => '#B38600'], 'total' => $due_soon],
                ['due' => ['name' => 'Due later', 'color' => '#E56910'], 'total' => $due_later],
                ['due' => ['name' => 'Overdue', 'color' => '#C9372C'], 'total' => $due_over],
                ['due' => ['name' => 'No due date', 'color' => '#607d8b'], 'total' => $no_due],
            ],
        ]);
    }

    public function viewCalendar($uid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($uid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $list_index = [];
        $board_lists = BoardList::where('project_id', $project->id)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->orderByOrder()
            ->get()->toArray();
        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        return Inertia::render('Projects/Calendar', [
            'title' => 'Calendar | '.$project->title,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'project' => $project,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function viewTimeline($uid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($uid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();

        // Get tasks with their relationships for timeline view
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->isOpen()
            ->byProject($project->id)
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('priority')
            ->orderBy('created_at', 'DESC')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'due_date' => $task->due_date,
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                    'is_done' => $task->is_done,
                    'priority' => $task->priority,
                    'list' => $task->list,
                    'assignees' => $task->assignees,
                    'taskLabels' => $task->taskLabels,
                    'timer' => $task->timer,
                ];
            })
            ->toArray();

        return Inertia::render('Projects/Timeline', [
            'title' => 'Timeline | '.$project->title,
            'project' => $project,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function viewTimeLogs($projectUid, Request $request)
    {
        $requests = $request->all();
        $auth_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = Project::bySlugOrId($projectUid)->whereIn('workspace_id', $workspaceIds)->with('workspace.member')->with('star')->with('background')->first();
        $timerQuery = Timer::whereHas('task', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        })->filter($requests);

        return Inertia::render('Projects/Timer', [
            'title' => 'Time Logs | '.$project->title,
            'project' => $project,
            'filters' => $requests,
            'total_duration' => $timerQuery->sum('duration'),
            'time_logs' => $timerQuery->with('task')
                ->with('user')
                ->orderBy('created_at', 'DESC')
                ->paginate(9)
                ->withQueryString()
                ->through(function ($log) {
                    return [
                        'id' => $log->id,
                        'title' => $log->title,
                        'user' => $log->user,
                        'task' => $log->task,
                        'task_id' => $log->task_id,
                        'duration' => $log->duration,
                        'started_at' => $log->started_at,
                        'stopped_at' => $log->stopped_at,
                        'created_at' => $log->created_at,
                    ];
                }),
        ]);
    }

    public function projectOtherData($project_id)
    {
        $project = Project::where('id', $project_id)->first();
        $labels = Label::where('project_id', $project_id)->get();
        $lists = BoardList::withCount('tasks')->get();
        $teamMembers = TeamMember::with('user')->where('workspace_id', $project->workspace_id)->get();

        return response()->json(['labels' => $labels, 'lists' => $lists, 'team_members' => $teamMembers]);
    }

    public function workspaceOtherData($workspace_id)
    {
        $labels = Label::get();
        $teamMembers = TeamMember::with('user')->where('workspace_id', $workspace_id)->get();

        return response()->json(['labels' => $labels, 'team_members' => $teamMembers]);
    }

    private function clean($string)
    {
        $string = str_replace(' ', '-', $string);
        $string = filter_var($string, FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        return preg_replace('/-+/', '-', $string);
    }

    public function destroy($id)
    {
        $project = Project::where('id', $id)->first();
        $workspace_id = $project->workspace_id;
        if (!empty($project)) {
            BoardList::where('project_id', $project->id)->delete();
            RecentProject::where('project_id', $project->id)->delete();
            StarredProject::where('project_id', $project->id)->delete();
            $tasks = Task::where('project_id', $project->id)->get();
            foreach ($tasks as $task) {
                $attachments = Attachment::where('task_id', $task->id)->get();
                foreach ($attachments as $attachment) {
                    if (!empty($attachment->path) && File::exists(public_path($attachment->path))) {
                        File::delete(public_path($attachment->path));
                    }
                    $attachment->delete();
                }
                CheckList::where('task_id', $task->id)->delete();
                Timer::where('task_id', $task->id)->delete();
                Comment::where('task_id', $task->id)->delete();
                Assignee::where('task_id', $task->id)->delete();
                TaskLabel::where('task_id', $task->id)->delete();
                $task->delete();
            }
            $project->delete();
        }

        return Redirect::route('workspace.view', $workspace_id);
    }

    public function excelExport($project_id)
    {
        return (new TasksExport)->forProject($project_id)->download('tasks.xlsx', Excel::XLSX);
    }

    public function csvExport($project_id)
    {
        return (new TasksExport)->forProject($project_id)->download('tasks.csv', Excel::CSV);
    }
}
