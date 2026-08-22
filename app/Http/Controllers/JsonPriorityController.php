<?php

namespace App\Http\Controllers;

use App\Models\Priority;
use Illuminate\Http\Request;

class JsonPriorityController extends Controller
{
    public function all(Request $request)
    {
        $priorities = Priority::orderBy('order')->get(['id', 'name', 'color']);

        return response()->json($priorities);
    }
}