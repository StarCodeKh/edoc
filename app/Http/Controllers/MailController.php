<?php

namespace App\Http\Controllers;

use App\Events\BoardUpdated;
use App\Events\NewCommentAdded;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\Task;

class MailController extends Controller
{
    public function comment($id)
    {
        $comment = Comment::whereId($id)->with('user')->first();
        $task = Task::where('id', $comment->task_id)->whereHas('assignees')->with('assignees.user')->whereHas('project')->with('project')->first();
        if (!empty($comment) and !empty($task)) {
            event(new NewCommentAdded($comment));
        }

        return response()->json(['success' => true, 'sent' => true]);
    }

    public function task_update($id)
    {
        $task = Task::where('id', $id)->whereHas('assignees')->with('assignees.user')->whereHas('project')->with('project')->first();
        if (!empty($task)) {
            event(new TaskUpdated($task));
        }

        return response()->json(['success' => true, 'sent' => true]);
    }

    public function board_update($id)
    {
        $board = BoardList::where('id', $id)->whereHas('project')->with('project')->first();
        if (!empty($board)) {
            event(new BoardUpdated($board));
        }

        return response()->json(['success' => true, 'sent' => true]);
    }
}
