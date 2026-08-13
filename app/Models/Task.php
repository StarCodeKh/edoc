<?php

namespace App\Models;

use App\Models\Concerns\Watchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Picqer\Barcode\BarcodeGeneratorSVG;

class Task extends Model
{
    use HasFactory;
    use Watchable;

    protected $casts = [
        'is_done'       => 'boolean',
        'is_archive'    => 'boolean',
        'cover'         => 'integer',
        'list_id'       => 'integer',
        'order'         => 'integer',
        'user_id'       => 'integer',
        'project_id'    => 'integer',
        'due_date'      => 'datetime',
    ];

    /**
     * Generate Unique Task Code in the format: CGM-D-DD-MM-YYYY
     */
    private function generateTaskCode()
    {
        $prefix = "CGMC-";

        // Get the highest current numeric ID/count to calculate the next sequence number
        $latestTask = static::latest('id')->first();
        $nextNumber = $latestTask ? $latestTask->id + 1 : 1;

        // Pad the number to 9 digits (e.g. 001234567)
        $paddedNumber = str_pad($nextNumber, 9, '0', STR_PAD_LEFT);
        $code = "{$prefix}{$paddedNumber}";

        // Ensure uniqueness as a fallback
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
        // Prefer the slug (always set by this point — see boot()'s
        // creating() handler, which generates it before the QR code),
        // matching how the rest of the app links to a task
        // (`element.slug || element.id` in Table.vue/Board.vue). Falls
        // back to the task code itself only in the unlikely case neither
        // a slug nor an id is available yet.
        $taskUid = $this->slug ?: ($this->id ?: $taskCode);

        $qrData = route('projects.table.with.task', [
            'projectUid' => $this->project_id,
            'taskUid'    => $taskUid,
        ]);

        $svg = QrCode::format('svg')->size(200)->generate($qrData);

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Generate 1D Barcode containing ONLY TASK_CODE (Code 128)
     */
    private function generateBarCode($taskCode)
    {
        $generator = new BarcodeGeneratorSVG();
        $svg = $generator->getBarcode($taskCode, $generator::TYPE_CODE_128, 2, 60);

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Generate Unique Slug
     */
    private function generateUniqueSlug($title, $ignoreId = null)
    {
        $slug = $this->slugify($title);

        // A title that's only symbols/whitespace (or that otherwise still
        // slugs down to nothing) would otherwise start the uniqueness
        // loop below on an empty string.
        if ($slug === '') {
            $slug = 'task';
        }

        $original = $slug;
        $i = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $original . '-' . $i++;
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
            // Auto-generate Slug if missing
            if (empty($task->slug) && !empty($task->title)) {
                $task->slug = $task->generateUniqueSlug($task->title);
            }

            // Auto-generate Task Code (CGM-D-DD-MM-YYYY)
            if (empty($task->task_code)) {
                $task->task_code = $task->generateTaskCode();
            }

            // Auto-generate QR Code (Title + Task Code)
            if (empty($task->qr_code)) {
                $task->qr_code = $task->generateQrCode($task->title, $task->task_code);
            }

            // Auto-generate Barcode (Task Code only)
            if (empty($task->bar_code)) {
                $task->bar_code = $task->generateBarCode($task->task_code);
            }
        });

        // --- UPDATING EVENT ---
        static::updating(function ($task) {
            // Regenerate QR Code if Title changes
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
                    'user_id'       => $userId,
                    'task_id'       => $task->id,
                    'field_changed' => $field,
                    'old_value'     => $originalValue,
                    'new_value'     => $newValue,
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

    public function resolveRouteBinding($value, $field = null) {
        return $this->where($field ?? 'id', $value)->firstOrFail();
    }

    public function scopeByUser($query, $id) {
        if(!empty($id)){
            $query->where('user_id', $id);
        }
    }

    public function scopeOrderByOrder($query) {
        $query->orderBy('order');
    }

    public function scopeIsOpen($query) {
        $query->where('is_archive', 0);
    }

    public function scopeByProject($query, $id) {
        if(!empty($id)){
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

    /**
     * ប្រភពឯកសារ (Document Source): the office picked in the
     * TaskDetails.vue picker (org-chart department/office tree).
     */
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

    public function checklists() {
        return $this->hasMany(CheckList::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function activities() {
        return $this->hasMany(Activity::class);
    }

    public function timers() {
        return $this->hasMany(Timer::class)->where('user_id', auth()->id());
    }

    public function timer() {
        return $this->hasOne(Timer::class, 'task_id')->where('user_id', auth()->id())->whereNull('stopped_at');
    }

    public function assignees() {
        return $this->hasMany(Assignee::class)->with('user');
    }

    public function lastAssignee() {
        return $this->hasMany(Assignee::class)->latest('id')->limit(1);
    }

    public function taskLabels() {
        return $this->hasMany(TaskLabel::class, 'task_id');
    }

    public function attachments() {
        return $this->hasMany(Attachment::class);
    }

    public function checklistDone(){
        return $this->hasMany(CheckList::class)->where('check_lists.is_done', '=', 1);
    }

    public function scopeFilter($query, array $filters){
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('title', 'like', '%'.$search.'%')->orWhere('description', 'like', '%'.$search.'%');
            });
        })->when($filters['user'] ?? null, function ($query, $user) {
            $f_users = explode(',', $user);
            $includeTasks = Assignee::whereIn('user_id', $f_users)->groupBy('task_id')->pluck('task_id');
            if(in_array('null', $f_users)){
                $excludeTask = Assignee::groupBy('task_id')->pluck('task_id');
                $query->whereNotIn('id', $excludeTask)->orWhereIn('id', $includeTasks);
            }else{
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
            $start = $filters['range']['start'] ?? date("Y-m-d H:i:s", strtotime('monday this week'));
            $end = $filters['range']['end'] ?? date("Y-m-d H:i:s", strtotime('sunday this week 23:59'));
            $query->whereBetween('created_at', [$start, $end])->orWhereBetween('due_date', [$start, $end]);
        })->when($filters['due'] ?? null, function ($query, $due) {
            $due_dates = explode(',', $due);
            $hasConditions = false;

            if(in_array('over', $due_dates)){
                $query->where(function($q) {
                    $q->where('is_done', 0)
                      ->where('due_date', '<', Carbon::now());
                });
                $hasConditions = true;
            }
            if(in_array('next_day', $due_dates)){
                if($hasConditions){
                    $query->orWhereBetween('due_date', [Carbon::now(), Carbon::now()->addDay()]);
                }else{
                    $query->whereBetween('due_date', [Carbon::now(), Carbon::now()->addDay()]);
                }
                $hasConditions = true;
            }
            if(in_array('next_week', $due_dates)){
                $weekStart = Carbon::now()->startOfWeek();
                $weekEnd = Carbon::now()->endOfWeek();
                if($hasConditions){
                    $query->orWhereBetween('due_date', [$weekStart, $weekEnd]);
                }else{
                    $query->whereBetween('due_date', [$weekStart, $weekEnd]);
                }
                $hasConditions = true;
            }
            if(in_array('next_month', $due_dates)){
                $monthStart = Carbon::now()->startOfMonth();
                $monthEnd = Carbon::now()->endOfMonth();
                if($hasConditions){
                    $query->orWhereBetween('due_date', [$monthStart, $monthEnd]);
                }else{
                    $query->whereBetween('due_date', [$monthStart, $monthEnd]);
                }
                $hasConditions = true;
            }
            if(in_array('null', $due_dates)){
                if($hasConditions){
                    $query->orWhereNull('due_date');
                }else{
                    $query->whereNull('due_date');
                }
            }
        })->when($filters['project'] ?? null, function ($query, $project) {
            $f_projects = explode(',', $project);
            $query->whereIn('project_id', $f_projects);
        });
    }
}