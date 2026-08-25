<?php

namespace App\Http\Controllers;

class InstallerController extends Controller
{
    public function welcome()
    {
        return view('vendor.installer.welcome');
    }
}
