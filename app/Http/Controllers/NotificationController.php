<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => auth()->user()->notifications()
                ->where('created_at', '>=', now()->subDays(30))
                ->paginate(20),
            // Layout picks the sidebar off this. Without it the page rendered
            // with no navigation at all for anyone who is not an admin, since
            // the fallback menu is the admin settings one.
            'workspace' => $this->sidebarWorkspace(),
        ]);
    }

    /**
     * The workspace whose menu this page borrows.
     *
     * The list spans every workspace, but the page still needs a way back.
     * First accessible by name, so it does not move as notifications arrive.
     */
    private function sidebarWorkspace(): ?Workspace
    {
        // WorkspaceMenu gates Board, Members and Settings on
        // workspace.member?.role === 'admin', so a workspace admin opening this
        // page without the relation loaded got a sidebar quietly missing them.
        return Workspace::accessibleTo()->with('member')->orderBy('name')->first();
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

        return back()->with('success', __('All notifications marked as read.'));
    }
}
