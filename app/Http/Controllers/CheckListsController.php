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
        $checklist = CheckList::whereId($id)->first();

        if (!empty($checklist->task_id)) {
            $this->authorizeTask($checklist->task_id, 'edit');
        }

        $requestData = $request->all();
        foreach ($requestData as $itemKey => $itemValue) {
            $checklist->{$itemKey} = $itemValue;
        }
        $checklist->save();

        return response()->json($checklist);
    }

    public function saveNew(Request $request)
    {
        $requestData = $request->all();

        if (!empty($requestData['task_id'])) {
            $this->authorizeTask($requestData['task_id'], 'edit');
        }

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
