<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DemoController extends Controller
{
    //

    public function import(){
        try {
            Artisan::call('db:seed', ['--class' => 'TestDataSeeder', '--force'=> true]);
        } catch (\Exception $e) {
            return $this->response($e->getMessage(), 'error');
        }
        dd('done!');
    }
}
