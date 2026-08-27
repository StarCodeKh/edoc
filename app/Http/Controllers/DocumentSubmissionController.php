<?php

namespace App\Http\Controllers;

use App\Events\NewCommentAdded;
use App\Events\UserAssignedToTask;
use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Activity;
use App\Models\Assignee;
use App\Models\Attachment;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\DocumentSource;
use App\Models\EdocWorkflowRole;
use App\Models\Priority;
use App\Models\Project;
use App\Models\Task;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceType;
use App\Support\TaskAbility;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

/**
 * The standard document intake form.
 *
 * Documents used to be born as a title-only card on a board, with every field
 * that actually matters - source office, dates, type, priority, the PDF itself -
 * filled in afterwards from the task modal, one at a time. This controller backs
 * a single submit page that collects all of it up front, so a document exists in
 * its complete form from the moment it enters the system.
 */
class DocumentSubmissionController extends Controller
{
    use AuthorizesTasks;

    /**
     * Files are held to the same rule as the task modal's uploader: PDF only,
     * 50MB each. Keeping the numbers here means the form can state them.
     */
    private const MAX_FILE_KB = 51200;

    private const MAX_FILES = 10;

    public function create($uid)
    {
        $workspace = $this->resolveWorkspace($uid);

        $projects = Project::where('workspace_id', $workspace->id)
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        // Every board column for those projects, sent in one payload so the
        // project -> status pair narrows client-side without another round trip.
        $lists = BoardList::whereIn('project_id', $projects->pluck('id'))
            ->isOpen()
            ->orderByOrder()
            ->get(['id', 'title', 'project_id', 'order']);

        $documentSources = DocumentSource::departments()
            ->select('id', 'name')
            ->with(['children' => function ($query) {
                $query->select('id', 'name', 'parent_id')->orderBy('order');
            }])
            ->get();

        $teamMembers = TeamMember::with('user:id,first_name,last_name,email,photo_path')
            ->where('workspace_id', $workspace->id)
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->sortBy('first_name')
            ->values()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => trim($user->first_name.' '.$user->last_name) ?: $user->email,
                'email' => $user->email,
                'photo' => $user->photo_path,
            ]);

        return Inertia::render('Documents/Submit', [
            'title' => 'Submit Document | '.$workspace->name,
            'workspace' => $workspace,
            'projects' => $projects,
            'lists' => $lists,
            'document_sources' => $documentSources,
            'document_types' => WorkspaceType::select('id', 'name', 'code')->orderBy('name')->get(),
            'priorities' => Priority::orderBy('order')->get(['id', 'name', 'color']),
            'team_members' => $teamMembers,
            'limits' => [
                'max_files' => self::MAX_FILES,
                'max_file_mb' => (int) (self::MAX_FILE_KB / 1024),
            ],
        ]);
    }

    /**
     * The read-only twin of the intake form: the same field vocabulary, laid out
     * the same way, plus the two things a filed document has and a blank one
     * cannot - where it is in the workflow, and who moved it there.
     */
    public function show($uid, $taskUid)
    {
        $workspace = $this->resolveWorkspace($uid);

        $task = Task::where(function ($query) use ($taskUid) {
            $query->where('id', $taskUid)->orWhere('slug', $taskUid);
        })
            ->with([
                'project:id,title,slug,workspace_id',
                'list:id,title,order,project_id',
                'type:id,name',
                'priority:id,name,color',
                'documentSource.parent',
                'user:id,first_name,last_name,photo_path',
                'assignees.user:id,first_name,last_name,photo_path,email',
                'attachments' => fn ($query) => $query->orderByDesc('created_at'),
            ])
            ->first();

        if (empty($task)) {
            abort(404, 'Document not found.');
        }

        // Same rule the rest of the app enforces, not just a hidden button.
        $this->authorizeTaskModel($task->loadMissing('assignees'), 'view');

        if (empty($task->project) || (int) $task->project->workspace_id !== (int) $workspace->id) {
            abort(404, 'Document not found.');
        }

        $activities = Activity::where('task_id', $task->id)
            ->with('user:id,first_name,last_name,photo_path')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Documents/Show', [
            'title' => $task->task_code ? $task->task_code.' | '.$workspace->name : $task->title,
            'workspace' => $workspace,
            'document' => $this->documentPayload($task),
            'steps' => $this->workflowSteps($task, $workspace, $activities),
            'activities' => $this->activityTrail($activities),
            'comments' => $this->commentThread($task),
            'neighbours' => $this->neighbours($task, $workspace),
            'next_step' => $this->nextStepPayload($task),
            'can' => $this->pageAbilities($task),
        ]);
    }

    /**
     * Hand the document on to the next board in the workflow.
     *
     * The move is a plain list_id change, which is deliberate: the model's own
     * updating hook is what writes the activity row, so a document forwarded
     * here is indistinguishable from one dragged across the board, and the
     * tracker advances without a second source of truth.
     */
    public function forward($uid, $taskUid, Request $request)
    {
        $workspace = $this->resolveWorkspace($uid);
        $task = $this->authorizeTask($taskUid, 'move');

        $task->loadMissing('project');

        if (empty($task->project) || (int) $task->project->workspace_id !== (int) $workspace->id) {
            abort(404, 'Document not found.');
        }

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        $next = $this->nextStep($task);

        if (empty($next)) {
            return Redirect::back()->with('error', __('This document is already at the last step.'));
        }

        // The note is filed before the move, so the trail reads in the order it
        // happened: what the reviewer said, then where they sent it.
        if (!empty($validated['note']) && $this->userCan('comment', $task)) {
            $comment = Comment::create([
                'task_id' => $task->id,
                'user_id' => auth()->id(),
                'details' => $validated['note'],
            ]);

            event(new NewCommentAdded($comment));
        }

        $task->update(['list_id' => $next->id]);

        // Handing a document on takes it off your plate: My Tasks filters on
        // assignee, so this is what drops it out of the listing and the badge.
        Assignee::where('task_id', $task->id)->where('user_id', auth()->id())->delete();

        $message = __('Forwarded to :step.', ['step' => $next->title]);

        // Unassigning can cost a Normal User the right to open the document at
        // all, so going back to it would 403. They go back to their pile.
        $task->load('assignees');

        if (!$this->userCan('view', $task)) {
            return Redirect::route('workspace.view.my-tasks.documents', [
                'uid' => $workspace->slug ?: $workspace->id,
            ])->with('success', $message);
        }

        return Redirect::route('workspace.documents.show', [
            'uid' => $workspace->slug ?: $workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ])->with('success', $message);
    }

    /**
     * What this page offers, which is narrower than what the abilities allow.
     *
     * Everything here hangs off holding the document - being one of its
     * assignees. Forwarding, and attaching a file to something you are about to
     * forward, are acts of whoever currently has it; once they hand it on the
     * page has nothing left to offer them and says so by showing nothing. The
     * underlying endpoints keep their own, wider rules, so an admin working from
     * the board or the task modal is unaffected.
     */
    private function pageAbilities(Task $task): array
    {
        $holds = TaskAbility::isAssigned(auth()->user(), $task);

        return [
            'attach' => $holds && $this->userCan('attach', $task),
            'forward' => $holds && $this->userCan('move', $task),
        ];
    }

    /** The next board along, or null when the document is at the last one. */
    private function nextStep(Task $task): ?BoardList
    {
        $current = $task->list()->first();

        if (empty($current)) {
            return null;
        }

        return BoardList::where('project_id', $task->project_id)
            ->isOpen()
            ->where(function ($query) use ($current) {
                $query->where('order', '>', $current->order)
                    ->orWhere(function ($q) use ($current) {
                        // Two boards can share an order; the id keeps it decidable.
                        $q->where('order', $current->order)->where('id', '>', $current->id);
                    });
            })
            ->orderBy('order')
            ->orderBy('id')
            ->first();
    }

    private function nextStepPayload(Task $task): ?array
    {
        $next = $this->nextStep($task);

        return $next ? ['id' => $next->id, 'title' => $next->title] : null;
    }

    /**
     * The document before and after this one, so a reviewer can work through a
     * pile without going back to the listing between each.
     *
     * The order is the register's own - newest first - with the id breaking
     * ties, so two documents filed in the same second still have a stable
     * position rather than swapping places between requests.
     */
    private function neighbours(Task $task, Workspace $workspace): array
    {
        $projectIds = Project::where('workspace_id', $workspace->id)->pluck('id');

        $scope = fn () => Task::whereIn('project_id', $projectIds)->isOpen()->visibleTo();

        $isEarlier = function ($query) use ($task) {
            // "Earlier in the register" = further down the newest-first list.
            $query->where('created_at', '<', $task->created_at)
                ->orWhere(function ($q) use ($task) {
                    $q->where('created_at', $task->created_at)->where('id', '<', $task->id);
                });
        };

        $isLater = function ($query) use ($task) {
            $query->where('created_at', '>', $task->created_at)
                ->orWhere(function ($q) use ($task) {
                    $q->where('created_at', $task->created_at)->where('id', '>', $task->id);
                });
        };

        $next = $scope()->where($isEarlier)
            ->orderByDesc('created_at')->orderByDesc('id')
            ->first(['id', 'slug', 'title', 'task_code']);

        $previous = $scope()->where($isLater)
            ->orderBy('created_at')->orderBy('id')
            ->first(['id', 'slug', 'title', 'task_code']);

        return [
            'previous' => $this->neighbourPayload($previous),
            'next' => $this->neighbourPayload($next),
            'position' => $scope()->where($isLater)->count() + 1,
            'total' => $scope()->count(),
        ];
    }

    private function neighbourPayload(?Task $task): ?array
    {
        if (empty($task)) {
            return null;
        }

        return [
            'uid' => $task->slug ?: $task->id,
            'title' => $task->title,
            'code' => $task->task_code,
        ];
    }

    /** The conversation on the document, oldest first. */
    private function commentThread(Task $task): array
    {
        return Comment::where('task_id', $task->id)
            ->with('user:id,first_name,last_name,photo_path')
            ->orderBy('created_at')
            ->get()
            ->map(fn (Comment $comment) => [
                'id' => $comment->id,
                'details' => $comment->details,
                'at' => $this->isoOrNull($comment->created_at),
                'author' => $comment->user ? $this->personPayload($comment->user) : null,
                'is_mine' => (int) $comment->user_id === (int) auth()->id(),
            ])
            ->all();
    }

    /**
     * The document in the intake form's own vocabulary, so the detail page can
     * mirror it field for field.
     */
    private function documentPayload(Task $task): array
    {
        $source = $task->documentSource;

        return [
            'id' => $task->id,
            'code' => $task->task_code,
            'slug' => $task->slug,
            'title' => $task->title,
            'description' => $task->description,
            'is_done' => (bool) $task->is_done,
            'type' => optional($task->type)->name,
            'priority' => $task->priority ? ['name' => $task->priority->name, 'color' => $task->priority->color] : null,
            'department' => $source ? optional($source->parent)->name : null,
            'office' => optional($source)->name,
            'project' => $task->project ? ['title' => $task->project->title, 'slug' => $task->project->slug, 'id' => $task->project->id] : null,
            'status' => optional($task->list)->title,
            'entry_date' => $this->isoOrNull($task->entry_date),
            'due_date' => $this->isoOrNull($task->due_date),
            'exit_date' => $this->isoOrNull($task->exit_date),
            'created_at' => $this->isoOrNull($task->created_at),
            'qr_code' => $task->qr_code,
            'submitted_by' => $task->user ? $this->personPayload($task->user) : null,
            'assignees' => $task->assignees
                ->map(fn ($assignee) => $assignee->user ? $this->personPayload($assignee->user) : null)
                ->filter()
                ->values(),
            'files' => $task->attachments->map(fn ($file) => [
                'id' => $file->id,
                'name' => $file->name,
                'path' => $file->path,
                'size' => (int) $file->size,
            ])->values(),
        ];
    }

    private function personPayload($user): array
    {
        return [
            'id' => $user->id,
            'name' => trim($user->first_name.' '.$user->last_name) ?: ($user->email ?? ''),
            'photo' => $user->photo_path,
        ];
    }

    private function isoOrNull($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        return $value instanceof Carbon ? $value->toIso8601String() : Carbon::parse($value)->toIso8601String();
    }

    public function store($uid, Request $request)
    {
        $workspace = $this->resolveWorkspace($uid);

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'project_id' => 'required|integer|exists:projects,id',
            'list_id' => 'required|integer|exists:board_lists,id',
            'type_id' => 'nullable|integer|exists:workspace_types,id',
            'document_source_id' => 'nullable|integer|exists:document_sources,id',
            'priority_id' => 'nullable|integer|exists:priorities,id',
            'entry_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:entry_date',
            'exit_date' => 'nullable|date|after_or_equal:entry_date',
            'description' => 'nullable|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'integer|exists:users,id',
            'files' => 'nullable|array|max:'.self::MAX_FILES,
            'files.*' => 'file|mimes:pdf|max:'.self::MAX_FILE_KB,
        ], [
            'files.*.mimes' => __('Only PDF files are allowed.'),
            'files.*.max' => __('Each file may not be larger than :size MB.', ['size' => (int) (self::MAX_FILE_KB / 1024)]),
            'files.*.uploaded' => __('The file is larger than the server allows (upload_max_filesize: :limit).', ['limit' => ini_get('upload_max_filesize')]),
        ]);

        // exists: rules only prove the rows are real - these prove they belong
        // together, so a hand-edited payload cannot file a document into another
        // workspace's board.
        $project = Project::where('id', $validated['project_id'])
            ->where('workspace_id', $workspace->id)
            ->first();

        if (empty($project)) {
            return Redirect::back()
                ->withInput()
                ->withErrors(['project_id' => __('That project does not belong to this workspace.')]);
        }

        $list = BoardList::where('id', $validated['list_id'])->where('project_id', $project->id)->first();

        if (empty($list)) {
            return Redirect::back()
                ->withInput()
                ->withErrors(['list_id' => __('That status does not belong to the selected project.')]);
        }

        $task = DB::transaction(function () use ($validated, $project, $list, $request) {
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'project_id' => $project->id,
                'list_id' => $list->id,
                'user_id' => auth()->id(),
                'type_id' => $validated['type_id'] ?? null,
                'document_source_id' => $validated['document_source_id'] ?? null,
                'priority_id' => $validated['priority_id'] ?? null,
                'entry_date' => $this->toDateTime($validated['entry_date'] ?? null),
                'due_date' => $this->toDateTime($validated['due_date'] ?? null),
                'exit_date' => $this->toDateTime($validated['exit_date'] ?? null),
                'order' => (int) Task::where('list_id', $list->id)->max('order') + 1,
            ]);

            foreach (array_unique($validated['assignees'] ?? []) as $userId) {
                Assignee::create(['user_id' => $userId, 'task_id' => $task->id]);
            }

            foreach ($request->file('files', []) as $file) {
                $this->storeAttachment($task, $file);
            }

            return $task;
        });

        // Notifications go out after the transaction commits, so a listener can
        // never read a half-written document.
        $assigner = auth()->user();
        foreach (array_unique($validated['assignees'] ?? []) as $userId) {
            $user = User::find($userId);
            if ($user) {
                event(new UserAssignedToTask($user, $task, $assigner));
            }
        }

        // Straight to the document's own page: the code, the workflow position
        // and the trail are what you want to see the moment you have filed it.
        return Redirect::route('workspace.documents.show', [
            'uid' => $workspace->slug ?: $workspace->id,
            'taskUid' => $task->slug ?: $task->id,
        ])->with('success', __('Document :code submitted.', ['code' => $task->task_code]));
    }

    /**
     * The document's journey across the board, one step per column.
     *
     * Movements are only recorded as prose ("moved the Board from `A` to `B`"),
     * so the board a move landed on is read back out of the backticks. That is
     * the only handle there is - the activity row keeps no list id.
     */
    private function workflowSteps(Task $task, Workspace $workspace, $activities): array
    {
        $lists = BoardList::where('project_id', $task->project_id)
            ->isOpen()
            ->orderByOrder()
            ->get(['id', 'title', 'order']);

        // Who put the document on each board, and when. The first entry is the
        // filing itself, which leaves no activity row of its own.
        $arrivals = [];
        $originTitle = optional($lists->firstWhere('id', $task->origin_list_id ?: $task->list_id))->title;

        if ($originTitle !== null) {
            $arrivals[$originTitle] = [
                'at' => $this->isoOrNull($task->created_at),
                'by' => $task->user ? $this->personPayload($task->user) : null,
            ];
        }

        foreach ($activities as $activity) {
            if ($activity->field_changed !== 'list_id') {
                continue;
            }

            if (!preg_match('/`([^`]*)`/', (string) $activity->new_value, $matches)) {
                continue;
            }

            // Last arrival wins: a document that came back to a board is at that
            // board as of the most recent time it got there.
            $arrivals[$matches[1]] = [
                'at' => $this->isoOrNull($activity->created_at),
                'by' => $activity->user ? $this->personPayload($activity->user) : null,
            ];
        }

        // Who is meant to act at each step, where the workspace has a workflow.
        $roles = EdocWorkflowRole::where('workspace_id', $workspace->id)
            ->get(['list_title', 'responsible_role', 'requires_signature', 'is_terminal'])
            ->keyBy('list_title');

        $currentOrder = optional($task->list)->order;

        return $lists->map(function (BoardList $list) use ($arrivals, $roles, $task, $currentOrder) {
            $arrival = $arrivals[$list->title] ?? null;
            $role = $roles->get($list->title);

            $isCurrent = (int) $list->id === (int) $task->list_id;
            $isDone = !$isCurrent && $arrival !== null && $currentOrder !== null && $list->order < $currentOrder;

            return [
                'id' => $list->id,
                'title' => $list->title,
                'state' => $isCurrent ? 'current' : ($isDone ? 'done' : 'pending'),
                'entered_at' => $arrival['at'] ?? null,
                'actor' => $arrival['by'] ?? null,
                'responsible_role' => optional($role)->responsible_role,
                'requires_signature' => (bool) optional($role)->requires_signature,
                'is_terminal' => (bool) optional($role)->is_terminal,
            ];
        })->values()->all();
    }

    /**
     * The audit trail, oldest first. old_value and new_value already read as a
     * sentence ("changed the title from `x`" / "to `y`") - they are joined
     * rather than re-worded, so the page says exactly what was recorded.
     */
    private function activityTrail($activities): array
    {
        return $activities
            ->sortByDesc('created_at')
            ->values()
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'field' => $activity->field_changed,
                'text' => trim(($activity->old_value ?? '').' '.($activity->new_value ?? '')),
                'at' => $this->isoOrNull($activity->created_at),
                'actor' => $activity->user ? $this->personPayload($activity->user) : null,
            ])
            ->all();
    }

    private function resolveWorkspace($uid): Workspace
    {
        $workspace = Workspace::where('id', $uid)
            ->orWhere('slug', $uid)
            ->whereHas('member')
            ->with('member')
            ->first();

        if (empty($workspace)) {
            abort(404);
        }

        return $workspace;
    }

    private function toDateTime($value): ?string
    {
        if (is_null($value) || (is_string($value) && trim($value) === '')) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d H:i:s');
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Mirrors TasksController::clean - stored names stay ASCII-safe while the
     * original (often Khmer) name is kept on the attachment row.
     */
    private function clean($string)
    {
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
        $string = preg_replace('/-+/', '-', $string);

        return trim($string, '-');
    }

    /**
     * Same disk, naming and columns as TasksController::addAttachment, so a file
     * that arrives with the form is indistinguishable from one added later.
     */
    private function storeAttachment(Task $task, $file): void
    {
        $originalName = $file->getClientOriginalName();
        $fileName = uniqid().'-'.$this->clean(pathinfo($originalName, PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();

        $path = '/files/'.$file->storeAs('tasks', $fileName, ['disk' => 'file_uploads']);

        Attachment::create([
            'task_id' => $task->id,
            'name' => $originalName,
            'user_id' => auth()->id(),
            'size' => $file->getSize(),
            'path' => $path,
            'width' => null,
            'height' => null,
        ]);
    }
}
