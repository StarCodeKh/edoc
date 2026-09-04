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
use App\Support\DocumentMerge;
use App\Support\DocumentMergeException;
use App\Support\TaskAbility;
use App\Support\WorkflowStep;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $workspace = $this->resolveWorkspaceForFiling($uid);

        // Raised from an external document: the form is pre-filled from it and
        // the two are linked on save. Read through the same 'view' rule as the
        // parent's own page, so ?from= cannot be used to read a document.
        $parent = $this->resolveParentDocument($request->query('from'));

        $projects = Project::where('workspace_id', $workspace->id)
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        // Responsibility names, by the code the steps carry, so a column can
        // say whose step it is rather than showing a bare code.
        $stepRoles = WorkflowSubRole::pluck('name', 'code');

        // Every board column for those projects, sent in one payload so the
        // project -> status pair narrows client-side without another round trip.
        // Each carries what the workflow step behind it expects of the document,
        // so the review the form shows before saving can say so.
        $lists = BoardList::whereIn('project_id', $projects->pluck('id'))
            ->isOpen()
            ->orderByOrder()
            ->get(['id', 'title', 'project_id', 'order'])
            ->map(function (BoardList $list) use ($workspace, $stepRoles) {
                $code = WorkflowStep::responsibleRoleForTitle($workspace->id, $list->title);

                return [
                    'id' => $list->id,
                    'title' => $list->title,
                    'project_id' => $list->project_id,
                    'order' => $list->order,
                    'attachment_mode' => WorkflowStep::attachmentModeForTitle($workspace->id, $list->title),
                    // Who the document is for once it lands here. The picker
                    // offers exactly these people, so a document is never
                    // handed to somebody the step will not reach.
                    'responsible_role' => $code,
                    'responsible_role_name' => $code ? ($stepRoles[$code] ?? null) : null,
                ];
            });

        // Department -> sub-office is the internal flow's own routing, so the
        // pair is only offered there. Everywhere else the list is sent empty
        // and the form drops the whole row rather than showing it disabled.
        $documentSources = $this->routesByDepartment($workspace)
            ? DocumentSource::departments()
                ->select('id', 'name')
                ->with(['children' => function ($query) {
                    $query->select('id', 'name', 'parent_id')->orderBy('order');
                }])
                ->get()
            : collect();

        $teamMembers = TeamMember::with([
            'user:id,first_name,last_name,email,photo_path,document_source_id,workflow_sub_role_id',
            'user.documentSource:id,parent_id',
            'user.workflowSubRole:id,name,code,parent_id',
            'user.workflowSubRole.parent:id,code',
        ])
            ->where('workspace_id', $workspace->id)
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->sortBy('first_name')
            ->values()
            ->map(fn (User $user) => $this->memberPayload($user));

        // People filed under an office, offered on top of the workspace's own
        // team so that picking a department actually reaches that department -
        // its officers are rarely members of the workspace being filed into.
        // Only where the form asks for a source at all; nowhere else is there
        // anything to narrow by.
        $sourceMembers = $this->routesByDepartment($workspace)
            ? User::whereNotNull('document_source_id')
                ->whereNotIn('id', $teamMembers->pluck('id'))
                ->with(['documentSource:id,parent_id', 'workflowSubRole:id,name,code,parent_id', 'workflowSubRole.parent:id,code'])
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'email', 'photo_path', 'document_source_id', 'workflow_sub_role_id'])
                ->map(fn (User $user) => $this->memberPayload($user))
            : collect();

        // Last resort for the picker: the people this workspace's workflow
        // actually reaches. An administration that hands out a responsibility
        // instead of a team-member row leaves both lists above empty, and the
        // picker would have nobody to offer at all.
        $roleMembers = $this->membersByResponsibility(
            $workspace,
            $teamMembers->pluck('id')->merge($sourceMembers->pluck('id'))
        );

        return Inertia::render('Documents/Submit', [
            'title' => 'Submit Document | '.$workspace->name,
            'me' => $this->filerStanding($workspace, $request->user()),
            'workspace' => $workspace,
            'projects' => $projects,
            'lists' => $lists,
            'document_sources' => $documentSources,
            'document_types' => WorkspaceType::select('id', 'name', 'code')->orderBy('name')->get(),
            'priorities' => Priority::orderBy('order')->get(['id', 'name', 'color']),
            'team_members' => $teamMembers,
            'source_members' => $sourceMembers,
            'role_members' => $roleMembers,
            'limits' => [
                'max_files' => self::MAX_FILES,
                'max_file_mb' => (int) (self::MAX_FILE_KB / 1024),
            ],
            'parent_document' => $parent ? $this->linkedDocumentPayload($parent) : null,
            'linkable_documents' => $this->linkableDocuments($workspace),
        ]);
    }

    /**
     * One person in the assignee picker, carrying where they are filed so the
     * form can narrow the list to the department and sub-office being picked.
     */
    private function memberPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => trim($user->first_name.' '.$user->last_name) ?: $user->email,
            'email' => $user->email,
            'photo' => $user->photo_path,
            'office_id' => $user->document_source_id,
            'department_id' => optional($user->documentSource)->parent_id,
            // Shown in place of the office when someone is reached by their
            // workflow responsibility rather than by where they are filed.
            'role' => optional($user->workflowSubRole)->name,
            // The codes the picker matches a step against. The group is
            // carried too: a step naming a group means all of it, which is the
            // same rule assignStepOwners() falls back on when it hands a
            // document over.
            'role_code' => optional($user->workflowSubRole)->code,
            'role_parent_code' => optional(optional($user->workflowSubRole)->parent)->code,
        ];
    }

    /**
     * The filer's own standing in this workflow, for the pinned "assign this
     * to me" row.
     *
     * That row is how a document reaches My Tasks, so it is worth saying who
     * it would actually reach. Someone carrying a responsibility this
     * workspace's steps name is a doer here, and the row names the
     * responsibility. Someone carrying none is not: nothing in this flow would
     * ever hand them the document, so the row is left unticked and points at
     * the list below instead of quietly filing the document to a plate the
     * workflow does not reach.
     *
     * It stays a suggestion rather than a rule - keeping your own document is
     * still allowed, the same as it always was - and the registry office is
     * exempt from it outright.
     */
    private function filerStanding(Workspace $workspace, ?User $user): array
    {
        if (empty($user)) {
            return [
                'id' => null,
                'role' => null,
                'role_code' => null,
                'role_parent_code' => null,
                'is_doer' => false,
                'is_registry' => false,
            ];
        }

        $role = $user->workflowSubRole;

        return [
            'id' => $user->id,
            'role' => optional($role)->name,
            // Matched against the step the document lands on, the same way
            // every other row in the picker is.
            'role_code' => optional($role)->code,
            'role_parent_code' => optional(optional($role)->parent)->code,
            // The broader answer, for a flow whose steps name no responsibility
            // at all: does any step here reach them?
            'is_doer' => in_array($workspace->id, $user->responsibleWorkspaceIds(), true),
            // The registry office is exempt from that match. Every document
            // passes through it on the way in and on the way out, so keeping
            // one it has just filed is its ordinary work rather than a
            // mis-file - see User::isRegistryOffice().
            'is_registry' => $user->isRegistryOffice(),
        ];
    }

    /**
     * Everyone this workspace's workflow can put a document on, by
     * responsibility rather than by team membership.
     *
     * The chain is the same one a forward walks - workflow step ->
     * responsible_role code -> sub-role -> the users holding it - read across
     * every step of the workspace at once instead of just the next one.
     * Standard and dynamic steps alike: both name a responsibility, and the
     * difference between them is only how many of its holders end up on the
     * document, which is the filer's choice to make here.
     *
     * A step naming a group (នាយកដ្ឋាន D1-D5) means all of it, so the offices
     * filed under that group are named too - the same rule
     * User::responsibleStepsQuery() reads from the other end.
     */
    private function membersByResponsibility(Workspace $workspace, Collection $exclude): Collection
    {
        $codes = EdocWorkflowRole::where('workspace_id', $workspace->id)
            ->whereNotNull('responsible_role')
            ->where('responsible_role', '!=', '')
            ->pluck('responsible_role')
            ->unique();

        if ($codes->isEmpty()) {
            return collect();
        }

        $roleIds = WorkflowSubRole::whereIn('code', $codes)->pluck('id');

        if ($roleIds->isEmpty()) {
            return collect();
        }

        $roleIds = $roleIds
            ->merge(WorkflowSubRole::whereIn('parent_id', $roleIds)->pluck('id'))
            ->unique()
            ->values();

        return User::whereIn('workflow_sub_role_id', $roleIds)
            ->whereNotIn('id', $exclude)
            ->with(['documentSource:id,parent_id', 'workflowSubRole:id,name,code,parent_id', 'workflowSubRole.parent:id,code'])
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'photo_path', 'document_source_id', 'workflow_sub_role_id'])
            ->map(fn (User $user) => $this->memberPayload($user))
            ->values();
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

    /** The linked documents the merge tab lists, with what each brings to it. */
    private function mergeablePayload(Task $task): array
    {
        return $this->linkedDocuments($task)
            ->filter(fn (Task $source) => $this->userCan('view', $source->loadMissing('assignees')))
            ->map(fn (Task $source) => $this->linkedDocumentPayload($source) + [
                'file_count' => DocumentMerge::countFor($source),
            ])
            ->values()
            ->all();
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
            // Whether the board it is on is ជំហានចុងក្រោយ, so the page knows the
            // action closes the document rather than moving it.
            'finishes_here' => WorkflowStep::isTerminal($task->list),
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
            // What the merge tab offers, with the page count each contributes -
            // a linked document holding no PDF is shown, and shown as empty,
            // rather than quietly left out of a list the reader expects.
            'mergeable' => $this->mergeablePayload($task),
        ];
    }

    /**
     * Whether this workspace runs the internal CGMC flow (ឯកសារផ្ទៃក្នុង), the
     * only one whose documents are routed by department.
     *
     * Read from Settings -> Workflow Roles rather than matched on the name, so
     * a renamed workspace keeps its behaviour.
     */
    private function routesByDepartment(Workspace $workspace): bool
    {
        return EdocWorkflowRole::where('workflow_type', 'internal_cgmc')
            ->where('workspace_id', $workspace->id)
            ->exists();
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
            ->accessibleTo()
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
            // One or several responsibility codes, comma-joined - which is what
            // the multi-select posts. A single code is just a list of one.
            'hand_to' => 'nullable|string|max:255',
            // Named people, where the forwarder picked them rather than leaving
            // the step's responsibility to answer for itself.
            'assign_to' => 'nullable|array',
            'assign_to.*' => 'integer|exists:users,id',
        ]);

        if ((bool) $task->is_done) {
            return Redirect::back()->with('error', __('This document is already finished.'));
        }

        $current = $task->relationLoaded('list') ? $task->list : $task->list()->first();

        // ជំហានចុងក្រោយ. The step is where the document stops, so the button on
        // it closes the document instead of moving it to another board - even
        // where a later board exists. Which of the two it is is configuration,
        // not code: Settings → Workflow Roles.
        if (WorkflowStep::isTerminal($current)) {
            return $this->finishHere($task, $current, $validated['note'] ?? null);
        }

        $next = $this->nextStep($task);

        if (empty($next)) {
            return Redirect::back()->with('error', __('This document is already at the last step.'));
        }

        // A dynamic step names a group, not a person's responsibility. Refuse
        // rather than guess: forwarding without a choice would either assign
        // every department at once or nobody at all.
        $handTo = collect(explode(',', (string) ($validated['hand_to'] ?? '')))
            ->map(fn ($code) => trim($code))
            ->filter()
            ->unique()
            ->values();

        $assignTo = collect($validated['assign_to'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $options = $this->handToOptions($this->stepConfig($task, $next));

        // Naming people outright answers the same question the department
        // choice does, and more precisely - so it stands in for it.
        if ($options->isNotEmpty() && $assignTo->isEmpty()) {
            if ($handTo->isEmpty()) {
                return Redirect::back()->with('error', __('Choose who :step goes to.', ['step' => $next->title]));
            }

            if ($handTo->diff($options->pluck('code'))->isNotEmpty()) {
                return Redirect::back()->with('error', __(':step cannot be handed to that responsibility.', ['step' => $next->title]));
            }
        } elseif ($options->isEmpty()) {
            $handTo = collect();
        }

        // A step that asks for a document does not pass it on without one. The
        // check is scoped to this step's own files: the document almost always
        // arrives carrying the original scan, and that is not this step's work.
        if ($this->stepIsMissingItsDocument($task, $current)) {
            return Redirect::back()->with('error', __('Attach the document this step produces before sending it on.'));
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
        $handedTo = $this->assignStepOwners($task, $workspace, $next, $handTo, $assignTo);

        // Landing on nobody's plate is a dead end: the document sits on the
        // board and shows in no one's My Documents until somebody is given the
        // responsibility. Say so rather than reporting a clean hand-off.
        $message = $handedTo->isEmpty()
            ? __('Forwarded to :step, but nobody carries :role yet — assign it in Settings → Workflow Roles.', [
                'step' => $next->title,
                'role' => $this->stepResponsibilityName($task, $next),
            ])
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
     * Combine the documents linked to this one into a single PDF filed here.
     *
     * The sources are copied from, never emptied: each keeps its own files and
     * its own trail, and this document gains one attachment holding all of
     * their pages. Which is why the step has to ask for it - see
     * WorkflowStep::allowsMerge - and why only what is already linked can be
     * chosen. A document is not merged with whatever the merger can find.
     */
    public function merge($uid, $taskUid, Request $request)
    {
        $workspace = $this->resolveWorkspace($uid);
        $task = $this->authorizeTask($taskUid, 'merge');

        $task->loadMissing('project');

        if (empty($task->project) || (int) $task->project->workspace_id !== (int) $workspace->id) {
            abort(404, 'Document not found.');
        }

        $validated = $request->validate([
            'task_ids' => 'required|array|min:1',
            'task_ids.*' => 'integer|exists:tasks,id',
            'note' => 'nullable|string',
        ]);

        // Only what this document is already linked to, and only what the
        // merger may read: an id posted by hand cannot pull in a document from
        // somewhere else in the register.
        $linked = $this->linkedDocuments($task)->keyBy('id');
        $chosen = collect($validated['task_ids'])
            ->unique()
            ->map(fn ($id) => $linked->get((int) $id))
            ->filter()
            ->filter(fn (Task $source) => $this->userCan('view', $source->loadMissing('assignees')))
            ->values();

        if ($chosen->isEmpty()) {
            return Redirect::back()->with('error', __('None of the documents chosen are linked to this one.'));
        }

        try {
            $attachment = DocumentMerge::run($task, $chosen, auth()->id());
        } catch (DocumentMergeException $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }

        // The note is filed the same way forwarding files one, so the trail
        // reads as one act: what was merged, and what the merger said about it.
        if (!empty($validated['note']) && $this->userCan('comment', $task)) {
            $comment = Comment::create([
                'task_id' => $task->id,
                'user_id' => auth()->id(),
                'details' => $validated['note'],
            ]);

            event(new NewCommentAdded($comment));
        }

        Activity::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'field_changed' => 'merged_documents',
            'old_value' => 'merged '.$chosen->count().' linked document(s) into',
            'new_value' => $attachment->name,
        ]);

        return Redirect::back()->with('success', __(':count document(s) merged into one file.', [
            'count' => $chosen->count(),
        ]));
    }

    /**
     * Everything this document is linked to, either way along the chain - the
     * internal documents raised off it and the external ones it answers.
     *
     * @return Collection<int, Task>
     */
    private function linkedDocuments(Task $task)
    {
        return $task->childDocuments()->get()
            ->concat($task->parentDocuments()->get())
            ->unique('id')
            ->values();
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

        $list = $task->relationLoaded('list') ? $task->list : $task->list()->first();

        return [
            // Who may touch the document's files at all - this still governs
            // deleting one that was filed by mistake.
            'attach' => $holds && $this->userCan('attach', $task),
            // Whether a new file may be added here, which is the step's call as
            // well as the person's. See WorkflowStep::acceptsAttachment.
            'upload' => $holds
                && $this->userCan('attach', $task)
                && WorkflowStep::acceptsAttachment($list),
            // Taking a file off stops when the document is finished, which is
            // its own rule rather than part of `attach`.
            'detach' => $holds && $this->userCan('detach', $task),
            // Nothing more to do with a document that is finished: the button
            // that closed it must not still be offering to close it again.
            'forward' => $holds && !$task->is_done && $this->userCan('move', $task),
            // Signing has its own rule - the step has to ask for a signature and
            // this has to be the person holding it. See TaskAbility::canSign.
            'sign' => $this->userCan('sign', $task),
            // Merging has the step's own flag behind it as well as the person's
            // standing, the same shape as signing. See TaskAbility::canMerge.
            'merge' => $this->userCan('merge', $task),
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
     *
     * $handTo holds the responsibilities chosen while forwarding into a dynamic
     * step, already checked by the caller against what that step offers. It may
     * name several: one document often goes to D1 through D5 at once.
     *
     * $assignTo is the forwarder naming people outright. Where it is given it
     * settles the question - the responsibility decided who *could* receive the
     * document, and this says who does. It is the only arm that works on a step
     * carrying no responsibility at all, which is how a document moves through
     * a flow whose steps have not been configured yet.
     */
    private function assignStepOwners(
        Task $task,
        Workspace $workspace,
        BoardList $step,
        ?Collection $handTo = null,
        ?Collection $assignTo = null
    ) {
        $alreadyOn = Assignee::where('task_id', $task->id)->pluck('user_id')->all();

        if ($assignTo && $assignTo->isNotEmpty()) {
            return $this->putOnPlates(
                $task,
                User::whereIn('id', $assignTo->all())
                    ->where('id', '!=', auth()->id())
                    ->whereNotIn('id', $alreadyOn)
                    ->get()
            );
        }

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

        $chosen = $handTo && $handTo->isNotEmpty()
            ? WorkflowSubRole::whereIn('code', $handTo->all())->get()
            : collect();

        $holders = function (WorkflowSubRole $role) use ($alreadyOn) {
            return User::where('workflow_sub_role_id', $role->id)
                ->where('id', '!=', auth()->id())
                ->whereNotIn('id', $alreadyOn)
                ->get();
        };

        // Several departments can be picked at once, and one person can only be
        // put on the document once however many of them they carry.
        $owners = $chosen
            ->flatMap(fn (WorkflowSubRole $role) => $holders($role))
            ->unique('id')
            ->values();

        // Nobody carries the chosen department yet - people may still be filed
        // under the group it sits in. Falling back to the group beats handing
        // the document to nobody, and the step is still recorded as the choice.
        if ($owners->isEmpty()) {
            $owners = $holders($subRole);
        }

        return $this->putOnPlates($task, $owners);
    }

    /** Files the assignee rows and tells each person, in one place. */
    private function putOnPlates(Task $task, Collection $owners): Collection
    {
        $assigner = auth()->user();

        foreach ($owners as $owner) {
            Assignee::create(['task_id' => $task->id, 'user_id' => $owner->id]);
            event(new UserAssignedToTask($owner, $task, $assigner));
        }

        return $owners;
    }

    /** Has this step failed to file the document it is configured to produce? */
    private function stepIsMissingItsDocument(Task $task, ?BoardList $current): bool
    {
        if (!WorkflowStep::requiresAttachment($current)) {
            return false;
        }

        return !Attachment::where('task_id', $task->id)
            ->where('list_id', optional($current)->id)
            ->exists();
    }

    /**
     * Close the document where it stands.
     *
     * A terminal step has nowhere to send anything, so the same button that
     * forwards elsewhere finishes here: the note is filed, is_done is set, and
     * the document leaves everyone's plate. The board it sits on does not
     * change - that is the record of where it ended.
     */
    private function finishHere(Task $task, ?BoardList $current, ?string $note)
    {
        if ($this->stepIsMissingItsDocument($task, $current)) {
            return Redirect::back()->with('error', __('Attach the document this step produces before sending it on.'));
        }

        // Closing is exactly the move the chain hold protects: an external
        // document is not finished until the internal work it raised is.
        $pending = DocumentChain::pendingChildren($task);

        if ($pending->isNotEmpty()) {
            return Redirect::back()->with('error', DocumentChain::heldMessage($pending));
        }

        if (!empty($note) && $this->userCan('comment', $task)) {
            $comment = Comment::create([
                'task_id' => $task->id,
                'user_id' => auth()->id(),
                'details' => $note,
            ]);

            event(new NewCommentAdded($comment));
        }

        $task->update(['is_done' => 1]);

        // Finishing this document may be the last thing an external document
        // was waiting on, which closes that one in turn.
        DocumentChain::releaseParents($task->fresh(['list']), auth()->user());

        return Redirect::back()->with('success', __('Document finished at :step.', [
            'step' => optional($current)->title,
        ]));
    }

    /** The readable name of the responsibility a step names, for messages. */
    private function stepResponsibilityName(Task $task, BoardList $step): string
    {
        $code = EdocWorkflowRole::where('workspace_id', $task->project?->workspace_id)
            ->where('list_title', $step->title)
            ->value('responsible_role');

        if (empty($code)) {
            return __('a responsibility');
        }

        return WorkflowSubRole::where('code', $code)->value('name') ?: $code;
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

        if (empty($next)) {
            return null;
        }

        $step = $this->stepConfig($task, $next);
        $options = $this->handToOptions($step);

        $workspaceId = optional($task->project)->workspace_id;

        return [
            'id' => $next->id,
            'title' => $next->title,
            'responsible_role' => $step->responsible_role ?? null,
            'responsible_role_name' => $this->stepResponsibilityName($task, $next),
            // 'dynamic' means the step names a group and the forwarder has to
            // say which of its members actually gets the document.
            'role_mode' => $options->isEmpty() ? 'standard' : 'dynamic',
            'hand_to_options' => $options->all(),
            // Who the step reaches, by name. A hand-off used to be described
            // only by the responsibility it named, which meant the forwarder
            // pressed the button without being told who would actually receive
            // the document.
            'people' => $this->stepCandidates($step, $workspaceId)->all(),
        ];
    }

    /**
     * The people a step can be handed to, named.
     *
     * The responsibility the step carries, plus every responsibility filed
     * under it - the same reach assignStepOwners() has when it hands the
     * document over, so the names shown before the button is pressed are the
     * people who will actually receive it.
     *
     * Each carries the responsibility code it was reached by, which is what
     * lets the forward panel narrow the list as a dynamic step's departments
     * are chosen.
     */
    private function stepCandidates(?EdocWorkflowRole $step, ?int $workspaceId): Collection
    {
        if (empty($step) || empty($step->responsible_role)) {
            return collect();
        }

        $role = WorkflowSubRole::where('code', $step->responsible_role)->first();

        if (empty($role)) {
            return collect();
        }

        $roleIds = collect([$role->id])
            ->merge(WorkflowSubRole::where('parent_id', $role->id)->pluck('id'))
            ->unique()
            ->values();

        return User::whereIn('workflow_sub_role_id', $roleIds)
            ->where('id', '!=', auth()->id())
            ->with('workflowSubRole:id,name,code')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'photo_path', 'workflow_sub_role_id'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => trim($user->first_name.' '.$user->last_name) ?: $user->email,
                'email' => $user->email,
                'photo' => $user->photo_path,
                'role' => optional($user->workflowSubRole)->name,
                'role_code' => optional($user->workflowSubRole)->code,
            ])
            ->values();
    }

    /** The configured step behind a board list, by workspace and title. */
    private function stepConfig(Task $task, BoardList $list): ?EdocWorkflowRole
    {
        $workspaceId = optional($task->project)->workspace_id;

        if (empty($workspaceId)) {
            return null;
        }

        return EdocWorkflowRole::where('workspace_id', $workspaceId)
            ->where('list_title', $list->title)
            ->first();
    }

    /**
     * Who a dynamic step can be handed to: the responsibilities sitting under
     * the one it names - D1 through D5 under នាយកដ្ឋាន D1-D5.
     *
     * Empty for a standard step, and equally empty for a step marked dynamic
     * whose responsibility stands for nobody. Both cases mean the same thing to
     * the caller: there is no choice to make, assign the step's own role.
     */
    private function handToOptions(?EdocWorkflowRole $step): Collection
    {
        if (empty($step) || $step->role_mode !== 'dynamic' || empty($step->responsible_role)) {
            return collect();
        }

        $parent = WorkflowSubRole::where('code', $step->responsible_role)->first();

        if (empty($parent)) {
            return collect();
        }

        return WorkflowSubRole::where('parent_id', $parent->id)
            ->ordered()
            ->get()
            ->map(fn (WorkflowSubRole $child) => [
                'code' => $child->code,
                'name' => $child->name,
            ]);
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
            // The printed tracking slip is fed a task, not this payload, so the
            // fields it reads travel alongside in the shape it expects.
            'receipt' => [
                'id' => $task->id,
                'task_code' => $task->task_code,
                'title' => $task->title,
                'qr_code' => $task->qr_code,
                'bar_code' => $task->bar_code,
                'merged_history' => $task->merged_history,
                'list_id' => $task->list_id,
                'list' => $task->list ? ['id' => $task->list->id, 'title' => $task->list->title] : null,
                'type' => $task->type ? ['name' => $task->type->name] : null,
                'document_source' => $source ? [
                    'name' => $source->name,
                    'parent' => optional($source->parent)->name ? ['name' => $source->parent->name] : null,
                ] : null,
                'project' => $task->project ? ['id' => $task->project->id, 'title' => $task->project->title] : null,
            ],
            'submitted_by' => $task->user ? $this->personPayload($task->user) : null,
            'assignees' => $task->assignees
                ->map(fn ($assignee) => $assignee->user ? $this->personPayload($assignee->user) : null)
                ->filter()
                ->values(),
            // The board a document sits on, and the board each file was filed
            // against: together they let the page say which files are this
            // step's own work rather than what it inherited.
            'list_id' => $task->list_id,
            'files' => $task->attachments->map(fn ($file) => [
                'id' => $file->id,
                'name' => $file->name,
                'path' => $file->path,
                'size' => (int) $file->size,
                'list_id' => $file->list_id,
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
        $workspace = $this->resolveWorkspaceForFiling($uid);

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
            ->get(['list_title', 'responsible_role', 'requires_signature', 'requires_attachment', 'attachment_mode', 'is_terminal'])
            ->keyBy('list_title');

        // The step carries the responsibility's code; the trail reads better
        // with its name, so the codes in play are looked up in one query.
        $roleNames = WorkflowSubRole::whereIn('code', $roles->pluck('responsible_role')->filter()->unique()->all())
            ->pluck('name', 'code');

        $currentOrder = optional($task->list)->order;

        return $lists->map(function (BoardList $list) use ($arrivals, $roles, $roleNames, $task, $currentOrder) {
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
                'responsible_role_name' => optional($role)->responsible_role
                    ? ($roleNames[$role->responsible_role] ?? $role->responsible_role)
                    : null,
                'requires_signature' => (bool) optional($role)->requires_signature,
                'requires_attachment' => (bool) optional($role)->requires_attachment,
                'attachment_mode' => optional($role)->attachment_mode ?: 'standard',
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

    /**
     * The workspace a document route is addressed to.
     *
     * No access check of its own: on these routes it is the document that
     * decides, through TaskAbility, and a document you may not read answers 403
     * rather than pretending its workspace does not exist. What used to stand
     * here looked like a membership gate and was not one - written as
     * `where('id', $uid)->orWhere('slug', $uid)->whereHas('member')`, SQL binds
     * the AND tighter than the OR, so the check only ever applied to the slug
     * arm and every workspace addressed by its id walked straight past it.
     */
    private function resolveWorkspace($uid): Workspace
    {
        $workspace = Workspace::where(function ($query) use ($uid) {
            $query->where('id', $uid)->orWhere('slug', $uid);
        })
            ->with('member')
            ->first();

        if (empty($workspace)) {
            abort(404);
        }

        return $workspace;
    }

    /**
     * The workspace a document is being filed into.
     *
     * Filing is the one thing here that is not answered by a document that
     * already exists, so this is where access is actually decided: the
     * administration, the registry office, and whoever owns, belongs to or
     * carries a responsibility in the workspace (Workspace::scopeAccessibleTo).
     */
    private function resolveWorkspaceForFiling($uid): Workspace
    {
        $workspace = Workspace::where(function ($query) use ($uid) {
            $query->where('id', $uid)->orWhere('slug', $uid);
        })
            ->accessibleTo()
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
