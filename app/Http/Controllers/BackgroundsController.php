<?php

namespace App\Http\Controllers;

use App\Models\Background;

class BackgroundsController extends Controller
{
    //

    public function jsonAll()
    {
        $backgrounds = Background::limit(50)->where('type', 'default')->get();

        return response()->json($backgrounds);
    }
}
