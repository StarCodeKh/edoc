<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Comment extends Model {
    use HasFactory;

    protected $casts = [
        'task_id' => 'integer',
        'user_id' => 'integer',
    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    public function task(){
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function getCreatedAtAttribute($date){
        return Carbon::parse($date)->format('Y-m-d H:i:s');
    }

    public function getUpdatedAtAttribute($date){
        return Carbon::parse($date)->format('Y-m-d H:i:s');
    }

    protected static function boot()
    {
        parent::boot();

        // Log activity when a comment is created
        static::created(function ($comment) {
            // Use the comment's user_id if Auth::id() is null (during seeding)
            $userId = Auth::id() ?? $comment->user_id;
            
            if ($userId) {
                Activity::create([
                    'user_id' => $userId,
                    'task_id' => $comment->task_id,
                    'comment_id' => $comment->id,
                    'field_changed' => 'comment',
                    'old_value' => null,
                    'new_value' => $comment->details,
                ]);
            }
        });

//        static::updating(function ($comment) {
//            Activity::create([
//                'user_id' => Auth::id(),
//                'task_id' => $comment->task_id,
//                'comment_id' => $comment->id,
//                'field_changed' => 'comment',
//                'old_value' => null,
//                'new_value' => $comment->details,
//            ]);
//        });

        // Log activity when a comment is deleted
        static::deleting(function ($comment) {
            Activity::create([
                'user_id' => Auth::id(),
                'task_id' => $comment->task_id,
                'comment_id' => $comment->id,
                'field_changed' => 'comment_delete',
                'old_value' => "deleted a comment",
                'new_value' => null,
            ]);
        });
    }
}
