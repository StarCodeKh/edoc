<?php

namespace App\Http\Controllers;

use App\Events\NewMemberAddedToWorkspace;
use App\Http\Middleware\RedirectIfNotAdmin;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class WorkSpacesController extends Controller
{
    public function index()
    {
        $user_id = auth()->id();
        $workspaceIds = Workspace::where('user_id', $user_id)->orWhereHas('member')->pluck('id');
        $project = RecentProject::where('user_id', $user_id)->with('project')->has('project.workspace')->whereHas('project', function ($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->orderBy('opened', 'desc')->first();
        if(!empty($project)){
            return Redirect::route('projects.view.board', $project->project->slug?:$project->project->id);
        }
        $project = Project::whereIn('workspace_id', $workspaceIds)->orderBy('updated_at', 'desc')->first();
        if(!empty($project)){
            return Redirect::route('projects.view.board', $project->slug?:$project->id);
        }
        $assignee = Assignee::where('user_id', $user_id)->whereHas('task')->with('task')->first();
        if(!empty($assignee)){
            return Redirect::route('projects.view.board', ['uid' => $assignee->task->project_id, 'task' => $assignee->task->id]);
        }
        return Redirect::route('projects.view.na');
    }

    public function jsonAll()
    {
        $user_id = auth()->id();
        $user = auth()->user();
        $workSpaces = Workspace::where('user_id', $user_id)->orWhereHas('member')->with('member')->withCount('projects')->orderBy('name')->get();

        $workSpaces->each(function ($workspace) use ($user_id, $user) {
            $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
            $listIds = BoardList::whereIn('project_id', $projectIds)->isOpen()->pluck('id');

            $query = Task::whereIn('list_id', $listIds)
                ->where('is_done', 0)
                ->isOpen();

            if ($user->role_id != 1) {
                $query->whereHas('assignees', function ($q) use ($user_id) {
                    $q->where('user_id', $user_id);
                });
            }

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

        $projects = Project::where('workspace_id', $workspace->id)
            ->withCount(['tasks' => function ($query) {
                $query->where('is_done', 0);
            }])
            ->get(['id', 'tasks_count']);

        return response()->json($projects);
    }

    public function viewMainDashboard($uid, Request $request){
        $requests = $request->all();
        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        $user = auth()->user();

        $tasksQuery = Task::filter($requests)
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

        if ($user->role_id != 1) {
            $tasksQuery->whereHas('assignees', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

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
                    'list_ids' => []
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
        usort($board_lists, function($a, $b) {
            return ($a['order'] ?? 0) <=> ($b['order'] ?? 0);
        });

        return Inertia::render('Workspaces/MainDashboard', [
            'title' => 'Dashboard | '.$workspace->name,
            'workspace' => $workspace,
            'lists' => $board_lists,
            'list_index' => $list_index,
            'filters' => $requests,
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
        if(!empty($existingItem)){
            $slug = $slug . '-' . $workspace->id;
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
        if($request->file('logo') && !empty($workspace->logo) && File::exists(public_path($workspace->logo))){
            File::delete(public_path($workspace->logo));
        }
        foreach ($requestData as $itemKey => $itemValue){
            $workspace->{$itemKey} = $itemValue;
        }
        if($request->file('logo')){
            $workspace->logo = '/files/'.$request->file('logo')->store('users', ['disk' => 'file_uploads']);
        }

        $slug = $this->clean($workspace->name);
        $existingItem = Workspace::where('id', '!=', $workspace->id)->where('slug', $slug)->first();
        if(!empty($existingItem)){
            $slug = $slug . '-' . $workspace->id;
        }
        $workspace->slug = $slug;

        $workspace->save();

        return Redirect::route('workspace.view', ['uid' => $workspace->slug]);
    }

    public function jsonAddMember(Request $request)
    {
        $requestData = $request->all();
        $teamMember = TeamMember::where(['workspace_id' => $requestData['workspace_id'], 'user_id' => $requestData['user_id']])->first();
        if(!empty($teamMember)){
            $teamMember->delete();
            $teamMember = ['success' => true ];
        }else{
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
        if(empty($workspace)){
            return abort(404);
        }
        $projects = Project::where('workspace_id', $workspace->id)->with('star')->with('background')->get();
        return Inertia::render('Workspaces/View', [
            'title' => 'Projects | '.$workspace->name,
            'workspace' => $workspace,
            'projects' => $projects
        ]);
    }

    public function workspaceMembers($uid, Request $request)
    {
        $workspace = Workspace::whereId($uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if($workspace->member->role != 'admin'){
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
                        'photo' => $member->user? $member->user->photo_path : '',
                        'role' => $member->role,
                        'workspace_id' => $member->workspace_id,
                        'user_id' => $member->user_id,
                        'created_at' => $member->created_at,
                    ];
                } ),
        ]);
    }

    public function workspaceTables($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if(!empty($user->role)){
            if($user->role->slug != 'admin' && empty($requests['user'])){
                return Redirect::route('workspace.view.my-tasks', ['uid' => $uid]);
            }
        }else{
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $list_index = [];
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem){
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex+= 1;
        }

        $tasks = Task::filter($requests)->whereHas('project', function ($q) use ($workspace) {
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

        foreach ($tasks as $task){
            if(isset($list_index[$task['list_id']])){
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
        if(empty($workspace)){
            return abort(404);
        }
        $loopIndex = 0;
        foreach ($board_lists as &$listItem){
            $list_index[$listItem->id] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex+= 1;
        }
        return Inertia::render('Workspaces/MyTasks', [
            'title' => 'My Tasks | '.$workspace->name,
            'board_lists' => $board_lists,
            'filters' => $requests,
            'list_index' => $list_index,
            'workspace' => $workspace,
            'tasks' => Task::filter($requests)->whereHas('project', function ($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })->with('list')->with('taskLabels.label')->with('project.background')->with('assignees')->with('timer')->isOpen()->orderByOrder()->get()
        ]);
    }

    // WorkspaceMenu.vue
    public function workspaceMyTasksBoard($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        $requests['user'] = $user->id;

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        $list_index = [];
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem){
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex+= 1;
        }

        $tasks = Task::filter($requests)
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
                    'list_ids' => []
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
        usort($board_lists, function($a, $b) {
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

        if ($user->role_id != 1) {
            $query->whereHas('assignees', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

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
        if(empty($workspace)){
            return abort(404);
        }

        $list_index = [];
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem){
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex+= 1;
        }

        $tasks = Task::filter($requests)
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

        foreach ($tasks as $task){
            if(isset($list_index[$task['list_id']])){
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
            'tasks' => $tasks
        ]);
    }

    public function workspaceMyTasksTimeline($uid, Request $request)
    {
        $user = auth()->user();
        $requests = $request->all();
        // Force filter to current user
        $requests['user'] = $user->id;

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        $tasks = Task::filter($requests)
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
            'tasks' => $tasks
        ]);
    }

    public function workspaceBoard($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if(!empty($user->role)){
            if($user->role->slug != 'admin' && empty($requests['user'])){
                return Redirect::route('workspace.view.board', ['uid' => $uid, 'user' => $user->id]);
            }
        }else{
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
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
                    'list_ids' => [] // Track all list IDs with this title
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
        usort($board_lists, function($a, $b) {
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
        if(!empty($user->role)){
            if($user->role->slug != 'admin' && empty($requests['user'])){
                return Redirect::route('workspace.view.calendar', ['uid' => $uid, 'user' => $user->id]);
            }
        }else{
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        $list_index = [];
        // Get all board lists from all projects in workspace
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');
        $board_lists = BoardList::whereIn('project_id', $projectIds)->isOpen()->orderByOrder()->get()->toArray();
        $loopIndex = 0;
        foreach ($board_lists as &$listItem){
            $list_index[$listItem['id']] = $loopIndex;
            $listItem['tasks'] = [];
            $loopIndex+= 1;
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
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

        foreach ($tasks as $task){
            if(isset($list_index[$task['list_id']])){
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
            'tasks' => $tasks
        ]);
    }

    public function workspaceTimeline($uid, Request $request)
    {
        $user = auth()->user()->load('role');
        $requests = $request->all();
        if(!empty($user->role)){
            if($user->role->slug != 'admin' && empty($requests['user'])){
                return Redirect::route('workspace.view.timeline', ['uid' => $uid, 'user' => $user->id]);
            }
        }else{
            return abort(404);
        }

        $workspace = Workspace::where('id', $uid)->orWhere('slug', $uid)->whereHas('member')->with('member')->first();
        if(empty($workspace)){
            return abort(404);
        }

        // Get all tasks from all projects in workspace
        $tasks = Task::filter($requests)
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
            'tasks' => $tasks
        ]);
    }

    public function getOtherUsers($workspace_id)
    {
        $workspaceUsers = TeamMember::where('workspace_id', $workspace_id)->groupBy('user_id')->pluck('user_id');
        $users = User::select('id', 'first_name', 'last_name', 'photo_path')->where('id', '!=', auth()->id())->get();
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
        foreach ($projects as $project){
            BoardList::where('project_id', $project->id)->delete();
            RecentProject::where('project_id', $project->id)->delete();
            StarredProject::where('project_id', $project->id)->delete();
            $tasks = Task::where('project_id', $project->id)->get();
            foreach ($tasks as $task){
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
                $task->delete();
            }
            $project->delete();
        }
        return Redirect::route('dashboard');
    }
}