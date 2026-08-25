<?php

namespace App\Http\Controllers;

use App\Events\NewCommentAdded;
use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Activity;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentsController extends Controller
{
    use AuthorizesTasks;

    public function saveNew(Request $request)
    {
        $requestData = $request->all();

        if (!empty($requestData['task_id'])) {
            $this->authorizeTask($requestData['task_id'], 'comment');
        }

        $comment = Comment::create($requestData);
        event(new NewCommentAdded($comment));
        $activity = Activity::where('comment_id', $comment->id)->with('user', 'comment')->first();

        return response()->json($activity);
    }

    public function update($id, Request $request)
    {
        $comment = Comment::whereId($id)->first();

        if (!empty($comment->task_id)) {
            $this->authorizeTask($comment->task_id, 'comment');
        }

        $requestData = $request->all();
        foreach ($requestData as $itemKey => $itemValue) {
            $comment->{$itemKey} = $itemValue;
        }
        $comment->save();

        return response()->json($comment);
    }

    public function deleteItem($id)
    {
        $comment = Comment::whereId($id)->first();

        if (!empty($comment->task_id)) {
            $this->authorizeTask($comment->task_id, 'comment');
        }

        $comment->delete();
        $activity = Activity::where('comment_id', $id)->where('field_changed', 'comment_delete')->with('user')->first();

        return response()->json($activity);
    }
}
