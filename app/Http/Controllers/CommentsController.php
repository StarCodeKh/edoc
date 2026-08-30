<?php

namespace App\Http\Controllers;

use App\Events\NewCommentAdded;
use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\Activity;
use App\Models\Comment;
use Illuminate\Http\Request;
use Stevebauman\Purify\Facades\Purify;

class CommentsController extends Controller
{
    use AuthorizesTasks;

    public function saveNew(Request $request)
    {
        $requestData = $request->validate([
            'task_id' => ['required', 'integer'],
            'details' => ['nullable', 'string'],
        ]);

        $this->authorizeTask($requestData['task_id'], 'comment');

        // The comment is rendered with v-html on the document page, so the
        // markup is cleaned on the way in rather than trusted on the way out.
        $requestData['details'] = Purify::clean($requestData['details'] ?? '');
        $requestData['user_id'] = auth()->id();

        $comment = Comment::create($requestData);
        event(new NewCommentAdded($comment));
        $activity = Activity::where('comment_id', $comment->id)->with('user', 'comment')->first();

        return response()->json($activity);
    }

    public function update($id, Request $request)
    {
        $comment = Comment::findOrFail($id);

        $this->authorizeTask($comment->task_id, 'comment');

        // Only the text may change. Anything else posted - user_id above all,
        // which would re-attribute the comment to another person - is dropped.
        $requestData = $request->validate([
            'details' => ['nullable', 'string'],
        ]);

        $comment->details = Purify::clean($requestData['details'] ?? '');
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
