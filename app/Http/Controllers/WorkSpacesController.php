<?php

namespace App\Http\Controllers;

use App\Events\NewMemberAddedToWorkspace;
use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\CheckList;
use App\Models\Comment;
use App\Models\Project;
use App\Models\RecentProject;
use App\Models\StarredProject;
use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\TeamMember;
use App\Models\Timer;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class WorkSpacesController extends Controller
{
    public function index()
    {
        $user_id = auth()->id();
        $workspaceIds = Workspace::accessibleTo()->pluck('id');
        $project = RecentProject::where('user_id', $user_id)->with('project')->has('project.workspace')->whereHas('project', function ($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->orderBy('opened', 'desc')->first();
        if (!empty($project)) {
            return Redirect::route('projects.view.board', $project->project->slug ?: $project->project->id);
        }
        $project = Project::whereIn('workspace_id', $workspaceIds)->orderBy('updated_at', 'desc')->first();
        if (!empty($project)) {
            return Redirect::route('projects.view.board', $project->slug ?: $project->id);
        }
        $assignee = Assignee::where('user_id', $user_id)->whereHas('task')->with('task')->first();
        if (!empty($assignee)) {
            return Redirect::route('projects.view.board', ['uid' => $assignee->task->project_id, 'task' => $assignee->task->id]);
        }

        return Redirect::route('projects.view.na');
    }

    public function jsonAll()
    {
        $user_id = auth()->id();
        $user = auth()->user();
        $workSpaces = Workspace::accessibleTo()->with('member')->withCount('projects')->orderBy('name')->get();

        $workSpaces->each(function ($workspace) use ($user) {
            $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
            $listIds = BoardList::whereIn('project_id', $projectIds)->isOpen()->pluck('id');

            $query = Task::whereIn('list_id', $listIds)
                ->where('is_done', 0)
                ->isOpen();

            // Admins see every document; a Normal User only their own and the
            // ones assigned to them (see Task::scopeVisibleTo).
            $query->visibleTo($user);

            $workspace->incomplete_tasks_count = $query->count();
        });

        return response()->json($workSpaces);
    }

    // WorkspaceMenu.vue (count assigned task count)
    public function jsonAssignedTasksCount($uid)
    {
        $user = auth()->user();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)
            ->whereHas('member')
            ->first();

        if (empty($workspace)) {
            return response()->json(['count' => 0]);
        }

        $count = Task::whereHas('assignees', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->where('is_done', 0)
            ->isOpen()
            ->whereHas('list')
            ->count();

        return response()->json(['count' => $count]);
    }

    // WorkspaceMenu.vue (count taks in project)
    public function jsonProjectsTaskCounts($uid)
    {
        $auth_id = auth()->id();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)
            ->whereHas('member')
            ->first();

        if (empty($workspace)) {
            return response()->json([]);
        }

        $user = auth()->user();

        $projects = Project::where('workspace_id', $workspace->id)
            // Admins count every document; a Normal User only their own and the
            // ones assigned to them (see Task::scopeVisibleTo).
            ->withCount(['tasks' => function ($query) use ($user) {
                // Same constraints the board itself uses, or the badge counts
                // documents the board will not show: archived ones, and ones
                // whose column has been archived.
                $query->where('is_done', 0)
                    ->where('is_archive', 0)
                    ->whereHas('list')
                    ->visibleTo($user);
            }])
            ->get(['id', 'tasks_count']);

        return response()->json($projects);
    }

    public function viewMainDashboard($uid, Request $request)
    {
        $requests = $request->all();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $user = auth()->user();

        $tasksQuery = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('cover')
            ->with('project.background')
            ->with('list')
            ->with('documentSource.parent')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->with('assignees')
            ->orderByOrder();

        $tasksQuery->visibleTo($user);

        $tasks = $tasksQuery->get()->toArray();

        $listsByTitle = [];
        $list_index = [];
        $orderCounter = 0;

        foreach ($tasks as $task) {
            if (!isset($task['list']) || empty($task['list'])) {
                continue;
            }

            $listTitle = $task['list']['title'];
            $listId = $task['list']['id'];

            if (!isset($listsByTitle[$listTitle])) {
                $listsByTitle[$listTitle] = [
                    'id' => $listId,
                    'title' => $listTitle,
                    'order' => $task['list']['order'] ?? $orderCounter,
                    'project_id' => $task['list']['project_id'] ?? null,
                    'tasks' => [],
                    'list_ids' => [],
                ];
                $list_index[$listTitle] = $orderCounter;
                $orderCounter++;
            }

            if (!in_array($listId, $listsByTitle[$listTitle]['list_ids'])) {
                $listsByTitle[$listTitle]['list_ids'][] = $listId;
            }

            $listsByTitle[$listTitle]['tasks'][] = $task;
        }

        $board_lists = array_values($listsByTitle);
        usort($board_lists, function ($a, $b) {
            return ($a['order'] ?? 0) <=> ($b['order'] ?? 0);
        });

        // Document statistics, counted per project rather than per board column,
        // so the panel lines up with the project list in the sidebar - including
        // projects that hold no documents yet, which a task-derived count can
        // never show. Same visibility rule as everywhere else.
        $statistics = Project::where('workspace_id', $workspace->id)
            ->withCount([
                'tasks as documents_total' => fn ($query) => $query
                    ->isOpen()->whereHas('list')->visibleTo($user),
                'tasks as documents_done' => fn ($query) => $query
                    ->isOpen()->whereHas('list')->where('is_done', 1)->visibleTo($user),
            ])
            ->get()
            ->map(fn (Project $project) => [
                'label' => $project->title,
                'done' => (int) $project->documents_done,
                'total' => (int) $project->documents_total,
                'percent' => $project->documents_total
                    ? (int) round($project->documents_done / $project->documents_total * 100)
                    : 0,
            ])
            ->values();

        return Inertia::render('Workspaces/MainDashboard', [
            'title' => 'Dashboard | '.$workspace->name,
            'workspace' => $workspace,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
            'statistics' => $statistics,
        ]);
    }

    public function jsonMineAll()
    {
        $myWorkspaces = Workspace::where('user_id', auth()->id())->limit(50)->get()->toArray();

        return response()->json($myWorkspaces);
    }

    public function jsonCreate(Request $request)
    {
        $requests = $request->all();
        $requests['user_id'] = auth()->id();
        $workspace = Workspace::create($requests);

        $slug = $this->clean($workspace->name);
        $existingItem = Workspace::where('slug', $slug)->first();
        if (!empty($existingItem)) {
            $slug = $slug.'-'.$workspace->id;
        }
        $workspace->slug = $slug;
        $workspace->save();

        TeamMember::create(['workspace_id' => $workspace->id, 'user_id' => $requests['user_id'], 'role' => 'admin', 'added_by' => $requests['user_id']]);

        return response()->json($workspace);
    }

    public function jsonChangeWorkspace(Request $request)
    {
        $requestData = $request->all();
        $project = Project::where('id', $requestData['project_id'])->first();
        $project->workspace_id = $requestData['workspace_id'];
        $project->save();

        return response()->json($project);
    }

    public function updateWorkspace($id, Request $request)
    {
        $requestData = $request->validate([
            'name' => ['required'],
            'website' => ['nullable'],
            'type_id' => ['nullable'],
            'description' => ['nullable'],
        ]);

        $workspace = Workspace::where('id', $id)->first();
        if ($request->file('logo') && !empty($workspace->logo) && File::exists(public_path($workspace->logo))) {
            File::delete(public_path($workspace->logo));
        }
        foreach ($requestData as $itemKey => $itemValue) {
            $workspace->{$itemKey} = $itemValue;
        }
        if ($request->file('logo')) {
            $workspace->logo = '/files/'.$request->file('logo')->store('users', ['disk' => 'file_uploads']);
        }

        $slug = $this->clean($workspace->name);
        $existingItem = Workspace::where('id', '!=', $workspace->id)->where('slug', $slug)->first();
        if (!empty($existingItem)) {
            $slug = $slug.'-'.$workspace->id;
        }
        $workspace->slug = $slug;

        $workspace->save();

        return Redirect::route('workspace.view', ['uid' => $workspace->slug])
            ->with('success', __('Workspace updated.'));
    }

    public function jsonAddMember(Request $request)
    {
        $requestData = $request->all();
        $teamMember = TeamMember::where(['workspace_id' => $requestData['workspace_id'], 'user_id' => $requestData['user_id']])->first();
        if (!empty($teamMember)) {
            $teamMember->delete();
            $teamMember = ['success' => true];
        } else {
            $requestData['added_by'] = auth()->id();
            $teamMember = TeamMember::create($requestData);
            $teamMember->load('user');
        }

        event(new NewMemberAddedToWorkspace($teamMember));

        return response()->json($teamMember);
    }

    public function workspaceView($uid)
    {
        $workspace = Workspace::whereId($uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }
        $projects = Project::where('workspace_id', $workspace->id)->with('star')->with('background')->get();

        return Inertia::render('Workspaces/View', [
            'title' => 'Projects | '.$workspace->name,
            'workspace' => $workspace,
            'projects' => $projects,
        ]);
    }

    public function workspaceMembers($uid, Request $request)
    {
        $workspace = Workspace::whereId($uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if ($workspace->member->role != 'admin') {
            return Redirect::route('workspace.view', $workspace->id);
        }
        $projects = Project::where('workspace_id', $workspace->id)->with('star')->with('background')->get();

        return Inertia::render('Workspaces/Members', [
            'title' => 'Members | '.$workspace->name,
            'workspace' => $workspace,
            'projects' => $projects,
            'team_members' => TeamMember::where('workspace_id', $workspace->id)
                ->filter($request->only('search'))
                ->orderBy('created_at', 'DESC')
                ->paginate(10)
                ->withQueryString()
                ->through(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->user ? $member->user->first_name.' '.$member->user->last_name : '',
                        'title' => $member->user ? $member->user->title : '',
                        'photo' => $member->user ? $member->user->photo_path : '',
                        'role' => $member->role,
                        'workspace_id' => $member->workspace_id,
                        'user_id' => $member->user_id,
                        'created_at' => $member->created_at,
                    ];
                }),
        ]);
    }

    public function workspaceTables($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if (!empty($user->role)) {
            if ($user->role->slug != 'admin' && empty($requests['user'])) {
                return Redirect::route('workspace.view.my-tasks', ['uid' => $uid]);
            }
        } else {
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $list_index = [];
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }

        $tasks = Task::filter($requests)
            ->visibleTo()->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->with('list')
            ->with('taskLabels.label')
            ->with('project.background')
            ->with('assignees')
            ->with('timer')
            ->with('documentSource.parent')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->isOpen()
            ->orderByOrder()
            ->get()
            ->toArray();

        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        return Inertia::render('Workspaces/Table', [
            'title' => 'Tasks | '.$workspace->name,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'filters' => $requests,
            'list_index' => $list_index,
            'workspace' => $workspace,
            'tasks' => $tasks,
        ]);
    }

    /**
     * Flat listing of every document record in the workspace, filterable by
     * who created it and when.
     */
    public function workspaceDocuments($uid, Request $request)
    {
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $filters = $request->only('uploader', 'type', 'period', 'from', 'to');
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        [$from, $to] = $this->documentDateRange($filters);

        $base = Task::whereIn('project_id', $projectIds)->isOpen()->visibleTo();

        $documents = (clone $base)
            ->when($filters['uploader'] ?? null, fn ($q, $uploader) => $q->whereIn('user_id', array_filter(explode(',', (string) $uploader))))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->whereIn('type_id', array_filter(explode(',', (string) $type))))
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('created_at', '<=', $to))
            ->with($this->documentListRelations())
            ->withCount('attachments')
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Task $task) => $this->documentListRow($task));

        $uploaderIds = (clone $base)->distinct()->pluck('user_id')->filter()->values();

        return Inertia::render('Workspaces/Documents', [
            'title' => 'Documents | '.$workspace->name,
            'workspace' => $workspace,
            'documents' => $documents,
            'filters' => $filters,
            'total' => (clone $base)->count(),
            'uploaders' => User::whereIn('id', $uploaderIds)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'photo_path'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => trim($user->first_name.' '.$user->last_name),
                    'photo' => $user->photo_path,
                ]),
            // The full taxonomy, in its official order — unlike uploaders these are
            // a fixed list, and most documents have no type set yet.
            'types' => WorkspaceType::orderBy('id')->get(['id', 'name']),
        ]);
    }

    /**
     * The same register as workspaceDocuments, narrowed to the documents the
     * signed-in user is actually on the hook for. My Tasks already offers four
     * shapes of the same data; this is the fifth, and the one that matches the
     * document register people are used to reading.
     */
    public function workspaceMyTasksDocuments($uid, Request $request)
    {
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $userId = auth()->id();
        $filters = $request->only('type', 'period', 'from', 'to');
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        [$from, $to] = $this->documentDateRange($filters);

        // Same four conditions as the sidebar badge (jsonAssignedTasksCount), so
        // the number on the menu and the number of rows here cannot disagree.
        // is_done and whereHas('list') are the two that matter: a finished
        // document, or one whose board was archived, is off your plate.
        $base = Task::whereIn('project_id', $projectIds)
            ->where('is_done', 0)
            ->isOpen()
            ->whereHas('list')
            ->visibleTo()
            ->whereHas('assignees', fn ($q) => $q->where('user_id', $userId));

        $documents = (clone $base)
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->whereIn('type_id', array_filter(explode(',', (string) $type))))
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('created_at', '<=', $to))
            ->with($this->documentListRelations())
            ->withCount('attachments')
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Task $task) => $this->documentListRow($task));

        return Inertia::render('Workspaces/MyTasksDocuments', [
            'title' => 'My Documents | '.$workspace->name,
            'workspace' => $workspace,
            'documents' => $documents,
            'filters' => $filters,
            'total' => (clone $base)->count(),
            'types' => WorkspaceType::orderBy('id')->get(['id', 'name']),
        ]);
    }

    /** Eager loads every document row in the register needs. */
    private function documentListRelations(): array
    {
        return [
            'user:id,first_name,last_name,photo_path',
            'project:id,title,slug',
            'documentSource:id,name',
            'list:id,title',
            'type:id,name',
            'attachments' => fn ($query) => $query
                ->select('id', 'task_id', 'name', 'path', 'size', 'created_at')
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ];
    }

    /** One row of the document register, in the shape both listings render. */
    private function documentListRow(Task $task): array
    {
        return [
            'id' => $task->id,
            'code' => $task->task_code,
            'title' => $task->title,
            'slug' => $task->slug,
            'is_done' => (bool) $task->is_done,
            'created_at' => optional($task->created_at)->toIso8601String(),
            'entry_date' => optional($task->entry_date)->toIso8601String(),
            'due_date' => optional($task->due_date)->toIso8601String(),
            'attachments_count' => $task->attachments_count,
            'files' => $task->attachments->map(fn ($file) => [
                'id' => $file->id,
                'name' => $file->name,
                'path' => $file->path,
                'size' => (int) $file->size,
                'ext' => strtolower(pathinfo($file->name, PATHINFO_EXTENSION)),
            ])->values(),
            'project' => $task->project ? ['id' => $task->project->id, 'title' => $task->project->title, 'slug' => $task->project->slug] : null,
            'source' => optional($task->documentSource)->name,
            'type' => optional($task->type)->name,
            'status' => optional($task->list)->title,
            'user' => $task->user ? [
                'id' => $task->user->id,
                'name' => trim($task->user->first_name.' '.$task->user->last_name),
                'photo' => $task->user->photo_path,
            ] : null,
        ];
    }

    /**
     * Turn the period filter into a concrete [from, to] pair. 'custom' uses the
     * supplied dates; anything unrecognised means no date restriction.
     */
    private function documentDateRange(array $filters): array
    {
        $period = $filters['period'] ?? null;

        switch ($period) {
            case 'today':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'week':
                return [now()->startOfWeek(), now()->endOfWeek()];
            case 'month':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'year':
                return [now()->startOfYear(), now()->endOfYear()];
            case 'custom':
                $from = !empty($filters['from']) ? Carbon::parse($filters['from'])->startOfDay() : null;
                $to = !empty($filters['to']) ? Carbon::parse($filters['to'])->endOfDay() : null;

                return [$from, $to];
            default:
                return [null, null];
        }
    }

    public function workspaceMyTasks($uid, Request $request)
    {
        return Redirect::route('workspace.view.my-tasks.board', $uid);
    }

    public function workspaceMyTasksTable($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        $requests['user'] = $user->id;

        $list_index = [];
        $board_lists = BoardList::orderByOrder()->get();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem->id] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }

        return Inertia::render('Workspaces/MyTasks', [
            'title' => 'My Tasks | '.$workspace->name,
            'board_lists' => $board_lists,
            'filters' => $requests,
            'list_index' => $list_index,
            'workspace' => $workspace,
            'tasks' => Task::filter($requests)
                ->visibleTo()->whereHas('project', function ($q) use ($workspace) {
                    $q->where('workspace_id', $workspace->id);
                })->with('list')->with('taskLabels.label')->with('project.background')->with('assignees')->with('timer')->isOpen()->orderByOrder()->get(),
        ]);
    }

    // WorkspaceMenu.vue
    public function workspaceMyTasksBoard($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        $requests['user'] = $user->id;

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $list_index = [];
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }

        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('list')
            ->with('cover')
            ->with('project.background')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->with('assignees')
            ->orderByOrder()
            ->get()
            ->toArray();

        $assignedTasksCount = Task::whereHas('assignees', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->whereHas('list')
            ->count();

        $listsByTitle = [];
        $orderCounter = 0;

        foreach ($tasks as $task) {
            if (!isset($task['list']) || empty($task['list'])) {
                continue;
            }

            $listTitle = $task['list']['title'];
            $listId = $task['list']['id'];

            if (!isset($listsByTitle[$listTitle])) {
                $listsByTitle[$listTitle] = [
                    'id' => $listId,
                    'title' => $listTitle,
                    'order' => $task['list']['order'] ?? $orderCounter,
                    'project_id' => $task['list']['project_id'] ?? null,
                    'tasks' => [],
                    'list_ids' => [],
                ];
                $list_index[$listTitle] = $orderCounter;
                $orderCounter++;
            }

            if (!in_array($listId, $listsByTitle[$listTitle]['list_ids'])) {
                $listsByTitle[$listTitle]['list_ids'][] = $listId;
            }

            $listsByTitle[$listTitle]['tasks'][] = $task;
        }

        $board_lists = array_values($listsByTitle);
        usort($board_lists, function ($a, $b) {
            return ($a['order'] ?? 0) <=> ($b['order'] ?? 0);
        });

        return Inertia::render('Workspaces/MyTasksBoard', [
            'title' => 'My Tasks - Board | '.$workspace->name,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
            'workspace' => $workspace,
            'tasks' => $tasks,
            'assigned_tasks_count' => $assignedTasksCount,
        ]);
    }

    public function jsonMyTasksCount($uid)
    {
        $user = auth()->user();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->first();
        if (empty($workspace)) {
            return response()->json(['count' => 0]);
        }

        $query = Task::whereHas('project', function ($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id);
        })
            ->where('is_done', 0)
            ->isOpen();

        $query->visibleTo($user);

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    public function workspaceMyTasksCalendar($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        // Force filter to current user
        $requests['user'] = $user->id;

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $list_index = [];
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }

        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('project.background')
            ->orderByOrder()
            ->get()
            ->toArray();

        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        return Inertia::render('Workspaces/MyTasksCalendar', [
            'title' => 'My Tasks - Calendar | '.$workspace->name,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'workspace' => $workspace,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function workspaceMyTasksTimeline($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        // Force filter to current user
        $requests['user'] = $user->id;

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('priority')
            ->with('project.background')
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
                    'project' => $task->project,
                ];
            })
            ->toArray();

        return Inertia::render('Workspaces/MyTasksTimeline', [
            'title' => 'My Tasks - Timeline | '.$workspace->name,
            'workspace' => $workspace,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function workspaceBoard($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if (!empty($user->role)) {
            if ($user->role->slug != 'admin' && empty($requests['user'])) {
                return Redirect::route('workspace.view.board', ['uid' => $uid, 'user' => $user->id]);
            }
        } else {
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('cover')
            ->with('project.background')
            ->with('list')
            ->withCount('checklistDone')
            ->withCount('comments')
            ->withCount('checklists')
            ->withCount('attachments')
            ->with('assignees')
            ->orderByOrder()
            ->get()
            ->toArray();

        // Group tasks by list title (combining lists with same name across projects)
        $listsByTitle = [];
        $list_index = [];
        $orderCounter = 0;

        foreach ($tasks as $task) {
            $listTitle = $task['list']['title'];
            $listId = $task['list']['id'];

            // Create a unique list entry by title if it doesn't exist
            if (!isset($listsByTitle[$listTitle])) {
                // Use the first list's ID and order as reference
                $listsByTitle[$listTitle] = [
                    'id' => $listId, // Keep first list's ID for operations
                    'title' => $listTitle,
                    'order' => $task['list']['order'] ?? $orderCounter,
                    'project_id' => $task['list']['project_id'] ?? null,
                    'tasks' => [],
                    'list_ids' => [], // Track all list IDs with this title
                ];
                $list_index[$listTitle] = $orderCounter;
                $orderCounter++;
            }

            // Track all list IDs with this title
            if (!in_array($listId, $listsByTitle[$listTitle]['list_ids'])) {
                $listsByTitle[$listTitle]['list_ids'][] = $listId;
            }

            // Add task to the combined list
            $listsByTitle[$listTitle]['tasks'][] = $task;
        }

        // Convert to array and sort by order
        $board_lists = array_values($listsByTitle);
        usort($board_lists, function ($a, $b) {
            return ($a['order'] ?? 0) <=> ($b['order'] ?? 0);
        });

        return Inertia::render('Workspaces/Board', [
            'title' => 'Board | '.$workspace->name,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
            'workspace' => $workspace,
            'tasks' => $tasks,
        ]);
    }

    public function workspaceCalendar($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if (!empty($user->role)) {
            if ($user->role->slug != 'admin' && empty($requests['user'])) {
                return Redirect::route('workspace.view.calendar', ['uid' => $uid, 'user' => $user->id]);
            }
        } else {
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        $list_index = [];
        // Get all board lists from all projects in workspace
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem) {
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex += 1;
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('project.background')
            ->orderByOrder()
            ->get()
            ->toArray();

        foreach ($tasks as $task) {
            if (isset($list_index[$task['list_id']])) {
                $board_lists[$list_index[$task['list_id']]]['tasks'][] = $task;
            }
        }

        return Inertia::render('Workspaces/Calendar', [
            'title' => 'Calendar | '.$workspace->name,
            'board_lists' => $board_lists,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'workspace' => $workspace,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function workspaceTimeline($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if (!empty($user->role)) {
            if ($user->role->slug != 'admin' && empty($requests['user'])) {
                return Redirect::route('workspace.view.timeline', ['uid' => $uid, 'user' => $user->id]);
            }
        } else {
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if (empty($workspace)) {
            return abort(404);
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
            ->visibleTo()
            ->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->isOpen()
            ->with('taskLabels.label')
            ->with('timer')
            ->whereHas('list')
            ->with('assignees')
            ->with('list')
            ->with('priority')
            ->with('project.background')
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
                    'project' => $task->project,
                ];
            })
            ->toArray();

        return Inertia::render('Workspaces/Timeline', [
            'title' => 'Timeline | '.$workspace->name,
            'workspace' => $workspace,
            'filters' => $requests,
            'tasks' => $tasks,
        ]);
    }

    public function getOtherUsers($workspace_id)
    {
        $workspaceUsers = TeamMember::where('workspace_id', $workspace_id)->groupBy('user_id')->pluck('user_id');
        $users = User::select('id', 'first_name', 'last_name', 'title', 'photo_path')->where('id', '!=', auth()->id())->get();

        return response()->json(['users' => $users, 'workspace_users' => $workspaceUsers]);
    }

    private function clean($string)
    {
        $string = str_replace(' ', '-', $string);
        $string = filter_var($string, FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        return preg_replace('/-+/', '-', $string);
    }

    public function destroy($id)
    {
        $workspace = Workspace::where('id', $id)->first();
        $workspace->delete();
        TeamMember::where('workspace_id', $id)->delete();
        $projects = Project::where('workspace_id', $id)->get();
        foreach ($projects as $project) {
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

        return Redirect::route('dashboard');
    }
}
