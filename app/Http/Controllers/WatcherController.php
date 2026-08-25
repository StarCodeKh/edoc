<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WatcherController extends Controller
{
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'watchable_id' => 'required|integer',
            'watchable_type' => 'required|string|in:Task,Project', // Whitelist models
        ]);

        $modelClass = 'App\\Models\\'.$validated['watchable_type'];

        if (!class_exists($modelClass)) {
            abort(404, 'Invalid type specified.');
        }

        $watchable = $modelClass::findOrFail($validated['watchable_id']);
        $user = auth()->user();

        // Use the relationship to toggle the watch state
        // Laravel's toggle() method attaches if not attached, and detaches if attached.
        $user->{'watched'.$validated['watchable_type'].'s'}()->toggle($watchable->id);

        // Check the current state to return to the frontend
        $isWatching = $user->{'watched'.$validated['watchable_type'].'s'}()->where('watchable_id', $watchable->id)->exists();

        return response()->json(['is_watching' => $isWatching]);
    }
}
