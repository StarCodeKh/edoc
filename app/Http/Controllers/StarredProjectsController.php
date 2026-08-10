<?php

namespace App\Http\Controllers;

use App\Models\StarredProject;
use Illuminate\Http\Request;

class StarredProjectsController extends Controller
{
    //

    public function makeFavorite($project_id){
        $data = ['user_id' => auth()->id(), 'project_id' => $project_id];
        $existingProject = StarredProject::where($data)->first();
        if(!empty($existingProject)){
            $existingProject->delete();
        }else{
            StarredProject::create($data);
        }
        return response()->json('done');
    }
}
