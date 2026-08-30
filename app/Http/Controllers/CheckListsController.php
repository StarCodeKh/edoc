<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Models\CheckList;
use Illuminate\Http\Request;

class CheckListsController extends Controller
{
    use AuthorizesTasks;

    public function update($id, Request $request)
    {
        $checklist = CheckList::findOrFail($id);

        $this->authorizeTask($checklist->task_id, 'edit');

        // task_id is deliberately absent: an item may be renamed or ticked, not
        // moved onto another document.
        $checklist->fill($request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'is_done' => ['sometimes', 'boolean'],
        ]));
        $checklist->save();

        return response()->json($checklist);
    }

    public function saveNew(Request $request)
    {
        $requestData = $request->validate([
            'task_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $this->authorizeTask($requestData['task_id'], 'edit');

        $checklist = CheckList::create($requestData);

        return response()->json($checklist);
    }

    public function deleteItem($id)
    {
        $checklist = CheckList::whereId($id)->first();

        if (!empty($checklist->task_id)) {
            $this->authorizeTask($checklist->task_id, 'edit');
        }

        $checklist->delete();

        return response()->json(['success' => true]);
    }
}
