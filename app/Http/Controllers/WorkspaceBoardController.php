<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceBoard;
use App\Models\WorkspaceBoardList;
use Illuminate\Http\Request;

class WorkspaceBoardController extends Controller
{
    public function index()
    {
        $workspaces = Workspace::with('boards.lists')->orderBy('name')->get();

        return response()->json(['workspaces' => $workspaces]);
    }

    public function storeWorkspace(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace = Workspace::create(['name' => $request->input('name')]);
        $workspace->setRelation('boards', collect());

        return response()->json($workspace);
    }

    public function deleteWorkspace($id)
    {
        Workspace::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    public function storeBoard(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|integer|exists:workspaces,id',
            'name' => 'required|string|max:255',
        ]);

        $order = (int) WorkspaceBoard::where('workspace_id', $request->input('workspace_id'))->max('order') + 1;

        $board = WorkspaceBoard::create([
            'workspace_id' => $request->input('workspace_id'),
            'name' => $request->input('name'),
            'order' => $order,
        ]);
        $board->setRelation('lists', collect());

        return response()->json($board);
    }

    public function deleteBoard($id)
    {
        WorkspaceBoard::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    public function addListItem(Request $request)
    {
        $request->validate([
            'workspace_board_id' => 'required|integer|exists:workspace_boards,id',
            'name' => 'required|string|max:255',
        ]);

        $order = (int) WorkspaceBoardList::where('workspace_board_id', $request->input('workspace_board_id'))->max('order') + 1;

        $listItem = WorkspaceBoardList::create([
            'workspace_board_id' => $request->input('workspace_board_id'),
            'name' => $request->input('name'),
            'order' => $order,
        ]);

        return response()->json($listItem);
    }

    public function removeListItem($id)
    {
        WorkspaceBoardList::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}
