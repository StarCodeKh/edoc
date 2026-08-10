<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Policies\NotificationPolicy; // Import the policy

class NotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => auth()->user()->notifications()
                ->where('created_at', '>=', now()->subDays(30))
                ->paginate(20)
        ]);
    }

    public function update(DatabaseNotification $notification)
    {
        $this->authorize('update', $notification);
        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return response()->json([
            'id' => $notification->id,
            'read_at' => $notification->read_at,
        ]);
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back()->with('success', 'All notifications marked as read.');
    }
}
