<?php

namespace App\Http\Controllers;

use App\Models\CheckList;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class CheckListsController extends Controller {
    public function update($id, Request $request){
        $checklist = CheckList::whereId($id)->first();
        $requestData = $request->all();
        foreach ($requestData as $itemKey => $itemValue){
            $checklist->{$itemKey} = $itemValue;
        }
        $checklist->save();
        return response()->json($checklist);
    }

    public function saveNew(Request $request){
        $requestData = $request->all();
        $checklist = CheckList::create($requestData);
        return response()->json($checklist);
    }

    public function deleteItem($id){
        $checklist = CheckList::whereId($id)->first();
        $checklist->delete();
        return response()->json(['success' => true]);
    }
}
