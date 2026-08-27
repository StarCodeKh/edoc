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
use App\Models\DocumentLink;
use App\Models\DocumentSource;
use App\Models\EdocWorkflowRole;
use App\Models\Priority;
use App\Models\Project;
use App\Models\Task;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\WorkflowSubRole;
use App\Models\Workspace;
use App\Models\WorkspaceType;
use App\Support\DocumentChain;
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

    /**
     * How many external documents the link picker offers. Searching is
     * client-side, so this bounds the payload rather than the choice.
     */
    private const MAX_LINK_CANDIDATES = 200;

    public function create($uid, Request $request)
    {
        $workspace = $this->resolveWorkspace($uid);

        // Raised from an external document: the form is pre-filled from it and
        // the two are linked on save. Read through the same 'view' rule as the
        // parent's own page, so ?from= cannot be used to read a document.
        $parent = $this->resolveParentDocument($request->query('from'));

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
            'parent_document' => $parent ? $this->linkedDocumentPayload($parent) : null,
            'linkable_documents' => $this->linkableDocuments($workspace),
        ]);
    }

    /**
     * External documents this one can be filed against.
     *
     * "External" here means simply "not in the workspace being filed into" -
     * an internal document answers work that came from somewhere else, and
     * defining it by workspace rather than by a hardcoded workflow name keeps
     * it working for any flow an administration configures.
     *
     * Finished documents are left out: nothing is waiting on them. The list is
     * capped and searched client-side, which is the same shape the assignee
     * picker on this form already uses.
     */
    private function linkableDocuments(Workspace $workspace): array
    {
        $ownProjectIds = Project::where('workspace_id', $workspace->id)->pluck('id');

        return Task::whereNotIn('project_id', $ownProjectIds)
            ->isOpen()
            ->where('is_done', 0)
            ->visibleTo()
            ->with(['list', 'project.workspace'])
            ->latest('created_at')
            ->limit(self::MAX_LINK_CANDIDATES)
            ->get()
            ->reject(fn (Task $task) => DocumentChain::isComplete($task))
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'code' => $task->task_code,
                'title' => $task->title,
                'status' => optional($task->list)->title,
                'workspace' => optional(optional($task->project)->workspace)->name,
            ])
            ->values()
            ->all();
    }

    /**
     * The external document an internal one is being raised from, if the form
     * was opened that way. Anything the user may not view is treated as absent
     * rather than refused - the form still works, it just files nothing linked.
     */
    private function resolveParentDocument($from): ?Task
    {
        if (empty($from)) {
            return null;
        }

        $parent = Task::where('id', $from)->orWhere('slug', $from)->first();

        if (empty($parent) || !$this->userCan('view', $parent->loadMissing('assignees'))) {
            return null;
        }

        return $parent;
    }

    /** One linked document, in the shape both ends of the link render. */
    private function linkedDocumentPayload(Task $task): array
    {
        $task->loadMissing(['list', 'project']);

        return [
            'id' => $task->id,
            'uid' => $task->slug ?: $task->id,
            'code' => $task->task_code,
            'title' => $task->title,
            'status' => optional($task->list)->title,
            'is_done' => (bool) $task->is_done,
            'is_complete' => DocumentChain::isComplete($task),
            'workspace_uid' => $this->workspaceUidFor($task),
        ];
    }

    /** The workspace slug a linked document lives in, for its page link. */
    private function workspaceUidFor(Task $task): ?string
    {
        $workspace = optional($task->project)->workspace_id
            ? Workspace::find($task->project->workspace_id)
            : null;

        return $workspace ? (string) ($workspace->slug ?: $workspace->id) : null;
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
            'links' => $this->linksPayload($task),
        ]);
    }

    /**
     * The chain either side of this document: internal documents raised off it
     * (which hold it open) and the external document it answers.
     */
    private function linksPayload(Task $task): array
    {
        $children = $task->childDocuments()->with(['list', 'project'])->get();
        $parents = $task->parentDocuments()->with(['list', 'project'])->get();
        $pending = $children->reject(fn (Task $child) => DocumentChain::isComplete($child))->values();

        return [
            'children' => $children->map(fn (Task $child) => $this->linkedDocumentPayload($child))->all(),
            'parents' => $parents->map(fn (Task $parent) => $this->linkedDocumentPayload($parent))->all(),
            // Held means the finishing step is refused, not that the document
            // is stuck - it moves through everything before that normally.
            'held' => $pending->isNotEmpty(),
            'pending_count' => $pending->count(),
            // Exactly when forward() would refuse: the next step is the one
            // that finishes this document, and children are still running. The
            // button disables on the same condition the server enforces.
            'blocks_forward' => $pending->isNotEmpty()
                && DocumentChain::wouldComplete($task, $this->nextStep($task)),
            // Where "raise an internal document" goes. Null when the workspace
            // running the internal workflow is not configured or not reachable.
            'internal_workspace_uid' => $this->internalWorkspaceUid(),
        ];
    }

    /**
     * The workspace running the internal CGMC workflow, which is where an
     * internal document raised off an external one is filed.
     *
     * Resolved from Settings → Workflow Roles rather than hardcoded, and only
     * when exactly one workspace carries that workflow - otherwise there is no
     * single right answer and the button is not offered.
     */
    private function internalWorkspaceUid(): ?string
    {
        $workspaceIds = EdocWorkflowRole::where('workflow_type', 'internal_cgmc')
            ->pluck('workspace_id')
            ->filter()
            ->unique()
            ->values();

        if ($workspaceIds->count() !== 1) {
            return null;
        }

        $workspace = Workspace::where('id', $workspaceIds->first())
            ->whereHas('member')
            ->first();

        return $workspace ? (string) ($workspace->slug ?: $workspace->id) : null;
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

        // An external document is not finished until the internal work it
        // raised is. Only the step that would finish it is held - everything
        // before that moves normally.
        if (DocumentChain::wouldComplete($task, $next)) {
            $pending = DocumentChain::pendingChildren($task);

            if ($pending->isNotEmpty()) {
                return Redirect::back()->with('error', DocumentChain::heldMessage($pending));
            }
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

        // ...and puts it on the plate of whoever carries the next step's
        // responsibility, as configured in Settings > Workflow Roles.
        $handedTo = $this->assignStepOwners($task, $workspace, $next);

        $message = $handedTo->isEmpty()
            ? __('Forwarded to :step.', ['step' => $next->title])
            : __('Forwarded to :step, assigned to :count person(s).', [
                'step' => $next->title,
                'count' => $handedTo->count(),
            ]);

        // Finishing this document may be the last thing an external document was
        // waiting on, which closes it in turn.
        DocumentChain::releaseParents($task->fresh(['list']), auth()->user());

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
        // "Holding" a document is being assigned it, or being responsible for
        // the board it is waiting on - a reviewer who was never named still has
        // it on their desk.
        $user = auth()->user();
        $holds = TaskAbility::isAssigned($user, $task) || TaskAbility::isResponsibleForItsBoard($user, $task);

        return [
            'attach' => $holds && $this->userCan('attach', $task),
            'forward' => $holds && $this->userCan('move', $task),
        ];
    }

    /**
     * Assign the document to everyone carrying the responsibility the step it
     * just landed on calls for.
     *
     * The chain is board title -> workflow step -> responsible_role code ->
     * sub-role -> the users holding it. Any missing link simply means nobody is
     * assigned automatically: an administration that has not configured a step,
     * or has nobody in that responsibility yet, still gets a working forward.
     *
     * The forwarder is skipped even when they hold the next responsibility -
     * they have just handed the document on, and putting it straight back on
     * their list would make the hand-off look like it had not happened.
     */
    private function assignStepOwners(Task $task, Workspace $workspace, BoardList $step)
    {
        $code = EdocWorkflowRole::where('workspace_id', $workspace->id)
            ->where('list_title', $step->title)
            ->value('responsible_role');

        if (empty($code)) {
            return collect();
        }

        $subRole = WorkflowSubRole::where('code', $code)->first();

        if (empty($subRole)) {
            return collect();
        }

        $alreadyOn = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        $owners = User::where('workflow_sub_role_id', $subRole->id)
            ->where('id', '!=', auth()->id())
            ->whereNotIn('id', $alreadyOn)
            ->get();

        $assigner = auth()->user();

        foreach ($owners as $owner) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $owner->id]);
            event(new UserAssignedToTask($owner, $task, $assigner));
        }

        return $owners;
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
            'parent_task_id' => 'nullable|integer|exists:tasks,id',
            'parent_task_ids' => 'nullable|array',
            'parent_task_ids.*' => 'integer|exists:tasks,id',
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

        // Link it to every external document it answers, and say so on both
        // trails - those documents are now held open by this one, which is not
        // something either page should leave unexplained.
        //
        // The singular key is what the "create internal document" button sends;
        // the plural is what the picker on this form sends. Both are accepted so
        // one path does not have to know about the other.
        $parentIds = collect($validated['parent_task_ids'] ?? [])
            ->push($validated['parent_task_id'] ?? null)
            ->filter()
            ->unique();

        foreach ($parentIds as $parentId) {
            $parent = $this->resolveParentDocument($parentId);

            if ($parent && $parent->id !== $task->id) {
                $this->linkDocuments($parent, $task);
            }
        }

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
     * Record that an internal document was raised off an external one, on both
     * documents' trails.
     */
    private function linkDocuments(Task $parent, Task $child): void
    {
        DB::transaction(function () use ($parent, $child) {
            DocumentLink::firstOrCreate(
                ['parent_task_id' => $parent->id, 'child_task_id' => $child->id],
                ['created_by' => auth()->id()],
            );

            // Written as prose in the same shape as every other trail entry -
            // old_value and new_value are joined and read as one sentence.
            Activity::create([
                'user_id' => auth()->id(),
                'task_id' => $parent->id,
                'field_changed' => 'internal_document_raised',
                'old_value' => 'raised the internal document',
                'new_value' => '`'.DocumentChain::label($child).'`',
            ]);

            Activity::create([
                'user_id' => auth()->id(),
                'task_id' => $child->id,
                'field_changed' => 'raised_from_external_document',
                'old_value' => 'raised this document from the external document',
                'new_value' => '`'.DocumentChain::label($parent).'`',
            ]);
        });
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
