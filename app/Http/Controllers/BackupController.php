<?php

namespace App\Http\Controllers;

use App\Events\DueTaskReminder;
use App\Models\BoardList;
use App\Models\Comment;
use App\Models\Role;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BackupController extends Controller
{
    public function restore()
    {
        //        if(!Schema::hasColumn('users', 'role_id')){
        //            $this->role();
        //        }

        //        Artisan::call('optimize');
        //        Artisan::call('cache:clear');
        //        Artisan::call('route:cache');
        //        Artisan::call('view:clear');
        //        Artisan::call('config:cache');
        //        Artisan::call('clear-compiled');

        //        $role = Role::whereSlug('admin')->first();
        //        $user = User::whereEmail('sapradeep123@gmail.com')->first();
        //        if(!empty($user) && !empty($role)){
        //            $user->role_id = $role->id;
        //            $user->save();
        //        }
        $tickets = Ticket::limit(100)->get();
        dd($tickets);
    }

    private function role()
    {
        $users = User::pluck('role', 'id')->all();
        Artisan::call('migrate');
        $this->import_sql('role');
        $userRoles = Role::pluck('id', 'slug')->all();
        foreach ($users as $k => $v) {
            User::where('id', $k)->update(['role_id' => $userRoles[$v]]);
        }
    }

    private function import_sql($file)
    {
        $sql_path = base_path('database/backup/'.$file.'.sql');
        DB::unprepared(file_get_contents($sql_path));
    }

    public function test()
    {

        $comment = Comment::latest()->first();
        $comment = $comment->load(['user', 'task.project.workspace.teamMembers', 'task.assignees']);
        $task = $comment->task;
        $commenter = $comment->user;

        $usersToNotify = $task->assignees->pluck('user') // assuming Assignee has a `user` relation
            ->merge($task->project->workspace->teamMembers)
            ->push($task->user)
            ->unique('id')
            ->reject(fn ($user) => $user->id === $commenter->id);

        dd($usersToNotify);

        //        $tasks = Task::whereBetween('due_date', [Carbon::now(), Carbon::now()->addDays(3)])->get()->toArray();
        //        event(new DueTaskReminder($tasks));

        //        $start = Carbon::now()->subMonths(2);
        //        $end = Carbon::now();
        //
        //        $comments = Comment::all();
        //        foreach ($comments as $comment){
        //            $randomTimestamp = rand($start->timestamp, $end->timestamp);
        //            $date = Carbon::createFromTimestamp($randomTimestamp)->format('Y-m-d H:i:s');
        //            $comment->created_at = $date;
        //            $comment->updated_at = $date;
        //            $comment->save();
        //        }
        //        dd($comments);

        // Check Lifetime
        $sessionLifetime = config('session.lifetime'); // Default session lifetime in minutes
        $rememberLifetime = config('session.remember_lifetime'); // Remember Me lifetime (if set)
        echo "Session Lifetime: $sessionLifetime minutes";
        echo 'Remember Me Lifetime: '.($rememberLifetime ?? 'Not Set');
        // Check Lifetime

        dd('ok');

        //        $tasks = Task::has('comments')->get();
        //        foreach ($tasks as $task){
        //            $previous_order = $task->order;
        //            $previous_list = $task->list_id;
        //            $boards = BoardList::where('project_id', $task->project_id)->where('is_archive', 0)->orderBy('order')->pluck('id')->toArray();
        //            $task->list_id = Arr::random($boards);
        //            $task->save();
        //
        //            $task->list_id = $previous_list;
        //            $task->save();
        //        }
        //        dd($tasks);
    }
}
