<?php
namespace App\Events;

use App\Models\TeamMember;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMemberAddedToWorkspace
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TeamMember $teamMember)
    {
    }
}
