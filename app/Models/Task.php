<?php

namespace App\Models;

use App\Models\Concerns\Watchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Picqer\Barcode\BarcodeGeneratorSVG;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Task extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Watchable;

    protected $casts = [
        'is_done' => 'boolean',
        'is_archive' => 'boolean',
        'cover' => 'integer',
        'list_id' => 'integer',
        'origin_list_id' => 'integer',
        'order' => 'integer',
        'user_id' => 'integer',
        'project_id' => 'integer',
        'due_date' => 'datetime',
        'merged_history' => 'array',
    ];

    /**
     * True once the document has moved on from the board it was created in.
     * A Normal User's edit rights over their own document end at that point.
     */
    public function hasLeftOriginList(): bool
    {
        if (empty($this->origin_list_id)) {
            return false;
        }

        return (int) $this->list_id !== (int) $this->origin_list_id;
    }

    private function generateTaskCode()
    {
        $prefix = 'CGMC-';

        $latestTask = static::latest('id')->first();
        $nextNumber = $latestTask ? $latestTask->id + 1 : 1;

        $paddedNumber = str_pad($nextNumber, 9, '0', STR_PAD_LEFT);
        $code = "{$prefix}{$paddedNumber}";

        $counter = 1;
        while (static::where('task_code', $code)->exists()) {
            $paddedNumber = str_pad($nextNumber + $counter, 9, '0', STR_PAD_LEFT);
            $code = "{$prefix}{$paddedNumber}";
            $counter++;
        }

        return $code;
    }

    private function generateQrCode($title, $taskCode)
    {
        $taskUid = $this->slug ?: ($this->id ?: $taskCode);

        $qrData = route('projects.table.with.task', [
            'projectUid' => $this->project_id,
            'taskUid' => $taskUid,
        ]);

        $svg = QrCode::format('svg')->size(200)->generate($qrData);

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }

    private function generateBarCode($taskCode)
    {
        $generator = new BarcodeGeneratorSVG;
        $svg = $generator->getBarcode($taskCode, $generator::TYPE_CODE_128, 2, 60);

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }

    private function generateUniqueSlug($title, $ignoreId = null)
    {
        $slug = $this->slugify($title);

        if ($slug === '') {
            $slug = 'task';
        }

        $original = $slug;
        $i = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $original.'-'.$i++;
        }

        return $slug;
    }

    private function slugify($title, $separator = '-')
    {
        $title = mb_strtolower(trim((string) $title));
        $title = preg_replace('/[\s_]+/u', $separator, $title);
        $title = preg_replace('/[^'.preg_quote($separator, '/').'\pL\pN\p{M}]+/u', '', $title);
        $title = preg_replace('/'.preg_quote($separator, '/').'+/u', $separator, $title);

        return trim($title, $separator);
    }

    protected static function boot()
    {
        parent::boot();

        // --- CREATING EVENT ---
        static::creating(function ($task) {
            if (empty($task->slug) && !empty($task->title)) {
                $task->slug = $task->generateUniqueSlug($task->title);
            }

            // Auto-generate Task Code
            if (empty($task->task_code)) {
                $task->task_code = $task->generateTaskCode();
            }

            // Auto-generate QR Code
            if (empty($task->qr_code)) {
                $task->qr_code = $task->generateQrCode($task->title, $task->task_code);
            }

            // Auto-generate Barcode
            if (empty($task->bar_code)) {
                $task->bar_code = $task->generateBarCode($task->task_code);
            }
        });

        // --- UPDATING EVENT ---
        static::updating(function ($task) {
            if ($task->isDirty('title')) {
                $task->qr_code = $task->generateQrCode($task->title, $task->task_code);
            }

            foreach ($task->getDirty() as $field => $newValue) {
                $originalValue = $task->getOriginal($field);

                if ($field === 'title' && $originalValue != $newValue && empty($task->slug)) {
                    $task->slug = $task->generateUniqueSlug($newValue, $task->id);
                }

                if ($originalValue == $newValue) {
                    continue;
                }

                $userId = Auth::id();

                $activityData = [
                    'user_id' => $userId,
                    'task_id' => $task->id,
                    'field_changed' => $field,
                    'old_value' => $originalValue,
                    'new_value' => $newValue,
                ];

                switch ($field) {
                    case 'title':
                        $activityData['old_value'] = "changed the title from `{$originalValue}`";
                        $activityData['new_value'] = "to `{$newValue}`";
                        break;
                    case 'slug':
                        $activityData['old_value'] = "changed the slug from `{$originalValue}`";
                        $activityData['new_value'] = "to `{$newValue}`";
                        break;
                    case 'list_id':
                        $oldList = BoardList::find($originalValue)->title ?? 'Unknown List';
                        $newList = BoardList::find($newValue)->title ?? 'Unknown List';
                        $activityData['old_value'] = "moved the Board from `{$oldList}`";
                        $activityData['new_value'] = "to `{$newList}`";
                        break;
                    case 'priority_id':
                        $oldPriority = $originalValue ? (Priority::find($originalValue)->name ?? 'Unknown Priority') : 'none';
                        $newPriority = $newValue ? (Priority::find($newValue)->name ?? 'Unknown Priority') : 'none';
                        $activityData['old_value'] = "changed the priority from `{$oldPriority}`";
                        $activityData['new_value'] = "to `{$newPriority}`";
                        break;
                    case 'is_done':
                        $activityData['old_value'] = ($originalValue ? 'marked as done' : 'marked as not done');
                        $activityData['new_value'] = ($newValue ? 'marked as done' : 'marked as not done');
                        break;
                    case 'is_archive':
                        $activityData['old_value'] = ($originalValue ? 'archived the task' : 'unarchived the task');
                        $activityData['new_value'] = ($newValue ? 'archived the task' : 'unarchived the task');
                        break;
                    case 'cover':
                    case 'description':
                        $activityData['old_value'] = $originalValue;
                        $activityData['new_value'] = $newValue;
                        break;
                    case 'order':
                        $activityData['old_value'] = "changed the order from `{$originalValue}`";
                        $activityData['new_value'] = "to `{$newValue}`";
                        break;
                    case 'due_date':
                        $activityData['old_value'] = "updated the due date from `{$originalValue}`";
                        $activityData['new_value'] = "to `{$newValue}`";
                        break;
                }

                Activity::create($activityData);
            }
        });
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where($field ?? 'id', $value)->firstOrFail();
    }

    public function scopeByUser($query, $id)
    {
        if (!empty($id)) {
            $query->where('user_id', $id);
        }
    }

    public function scopeOrderByOrder($query)
    {
        $query->orderBy('order');
    }

    /**
     * Documents a user is allowed to see at all.
     *
     * Admins (and Super Admins) see every document. A Normal User sees what is
     * assigned to them, plus documents they created themselves - they have to
     * see their own document to review it before it enters the workflow - plus
     * anything they are merely related to, which lists and opens read-only.
     *
     * Every arm here has a twin in Support\TaskAbility::canView. The two have
     * to agree, or a document would list but refuse to open.
     */
    public function scopeVisibleTo($query, $user = null)
    {
        $user = $user ?: Auth::user();

        // A guest is nobody, not everybody. This used to share an arm with the
        // admin case and return the query unfiltered, so any endpoint that lost
        // its `auth` middleware handed the whole register to anonymous callers.
        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        // Admins by permission, and the registry office by responsibility -
        // ការិយាល័យ រដ្ឋបាល numbers every document in every flow, so it reads
        // the whole register. Reading is all it gets from here: the abilities
        // in Support\TaskAbility still ask whether the step the document is
        // waiting on is one of theirs before offering any action on it.
        if ($user->seesEveryDocument()) {
            return $query;
        }

        // Boards this user is responsible for, via their workflow responsibility.
        // A document sitting on one of them is theirs to look at whether or not
        // anyone remembered to assign it.
        $responsibleFor = $user->responsibleListTitles();

        return $query->where(function ($query) use ($user, $responsibleFor) {
            $query->where('tasks.user_id', $user->id)
                ->orWhereHas('assignees', function ($assignees) use ($user) {
                    $assignees->where('user_id', $user->id);
                });

            if (!empty($responsibleFor)) {
                $query->orWhereHas('list', function ($list) use ($responsibleFor) {
                    $list->whereIn('title', $responsibleFor);
                });
            }

            // Looser connections to the same document: a group they belong to
            // holds it, they follow it, they handled it at an earlier workflow
            // step, or they commented on it. These earn a place in the register
            // and a readable detail page, nothing more - canEdit, canMove,
            // canDelete and canAttach all deliberately omit this arm, so the
            // document opens with no actions on it.
            $query->orWhereHas('groupAssignees.userGroup.members', function ($members) use ($user) {
                $members->where('users.id', $user->id);
            })->orWhereHas('watchers', function ($watchers) use ($user) {
                $watchers->where('users.id', $user->id);
            })->orWhereHas('activities', function ($activities) use ($user) {
                $activities->where('user_id', $user->id);
            })->orWhereHas('comments', function ($comments) use ($user) {
                $comments->where('user_id', $user->id);
            });
        });
    }

    public function scopeIsOpen($query)
    {
        $query->where('is_archive', 0);
    }

    public function scopeByProject($query, $id)
    {
        if (!empty($id)) {
            $query->where('project_id', $id);
        }
    }

    public function list()
    {
        return $this->belongsTo(BoardList::class, 'list_id')->where('is_archive', 0);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function documentSource()
    {
        return $this->belongsTo(DocumentSource::class, 'document_source_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cover()
    {
        return $this->belongsTo(Attachment::class, 'cover');
    }

    public function checklists()
    {
        return $this->hasMany(CheckList::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function timers()
    {
        return $this->hasMany(Timer::class)->where('user_id', auth()->id());
    }

    public function timer()
    {
        return $this->hasOne(Timer::class, 'task_id')->where('user_id', auth()->id())->whereNull('stopped_at');
    }

    public function assignees()
    {
        return $this->hasMany(Assignee::class)->with('user');
    }

    public function lastAssignee()
    {
        return $this->hasMany(Assignee::class)->latest('id')->limit(1);
    }

    public function taskLabels()
    {
        return $this->hasMany(TaskLabel::class, 'task_id');
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function checklistDone()
    {
        return $this->hasMany(CheckList::class)->where('check_lists.is_done', '=', 1);
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('title', 'like', '%'.$search.'%')->orWhere('description', 'like', '%'.$search.'%');
            });
        })->when($filters['user'] ?? null, function ($query, $user) {
            $f_users = explode(',', $user);
            $includeTasks = Assignee::whereIn('user_id', $f_users)->groupBy('task_id')->pluck('task_id');
            if (in_array('null', $f_users)) {
                $excludeTask = Assignee::groupBy('task_id')->pluck('task_id');
                $query->whereNotIn('id', $excludeTask)->orWhereIn('id', $includeTasks);
            } else {
                $query->whereIn('id', $includeTasks);
            }
        })->when($filters['private_task'] ?? null, function ($query, $private_task) {
            $includeTasks = Assignee::where('user_id', $private_task)->groupBy('task_id')->pluck('task_id');
            $query->whereIn('id', $includeTasks);
        })->when($filters['label'] ?? null, function ($query, $label) {
            $f_labels = explode(',', $label);
            $includeTasks = TaskLabel::whereIn('label_id', $f_labels)->groupBy('task_id')->pluck('task_id');
            $query->whereIn('id', $includeTasks);
        })->when($filters['range'] ?? null, function ($query, $filters) {
            $start = $filters['range']['start'] ?? date('Y-m-d H:i:s', strtotime('monday this week'));
            $end = $filters['range']['end'] ?? date('Y-m-d H:i:s', strtotime('sunday this week 23:59'));
            $query->whereBetween('created_at', [$start, $end])->orWhereBetween('due_date', [$start, $end]);
        })->when($filters['due'] ?? null, function ($query, $due) {
            $due_dates = explode(',', $due);
            $hasConditions = false;

            if (in_array('over', $due_dates)) {
                $query->where(function ($q) {
                    $q->where('is_done', 0)
                        ->where('due_date', '<', Carbon::now());
                });
                $hasConditions = true;
            }
            if (in_array('next_day', $due_dates)) {
                if ($hasConditions) {
                    $query->orWhereBetween('due_date', [Carbon::now(), Carbon::now()->addDay()]);
                } else {
                    $query->whereBetween('due_date', [Carbon::now(), Carbon::now()->addDay()]);
                }
                $hasConditions = true;
            }
            if (in_array('next_week', $due_dates)) {
                $weekStart = Carbon::now()->startOfWeek();
                $weekEnd = Carbon::now()->endOfWeek();
                if ($hasConditions) {
                    $query->orWhereBetween('due_date', [$weekStart, $weekEnd]);
                } else {
                    $query->whereBetween('due_date', [$weekStart, $weekEnd]);
                }
                $hasConditions = true;
            }
            if (in_array('next_month', $due_dates)) {
                $monthStart = Carbon::now()->startOfMonth();
                $monthEnd = Carbon::now()->endOfMonth();
                if ($hasConditions) {
                    $query->orWhereBetween('due_date', [$monthStart, $monthEnd]);
                } else {
                    $query->whereBetween('due_date', [$monthStart, $monthEnd]);
                }
                $hasConditions = true;
            }
            if (in_array('null', $due_dates)) {
                if ($hasConditions) {
                    $query->orWhereNull('due_date');
                } else {
                    $query->whereNull('due_date');
                }
            }
        })->when($filters['project'] ?? null, function ($query, $project) {
            $f_projects = explode(',', $project);
            $query->whereIn('project_id', $f_projects);
        });
    }

    public function groupAssignees()
    {
        return $this->hasMany(GroupAssignee::class, 'task_id');
    }

    /**
     * Internal documents raised off this one, which it waits for before it can
     * finish. See App\Support\DocumentChain.
     */
    public function childDocuments()
    {
        return $this->belongsToMany(Task::class, 'document_links', 'parent_task_id', 'child_task_id')
            ->withTimestamps();
    }

    /** The external document(s) this one was raised from, if any. */
    public function parentDocuments()
    {
        return $this->belongsToMany(Task::class, 'document_links', 'child_task_id', 'parent_task_id')
            ->withTimestamps();
    }

    public function type()
    {
        return $this->belongsTo(WorkspaceType::class, 'type_id');
    }

    public function priority()
    {
        return $this->belongsTo(Priority::class, 'priority_id');
    }
}
