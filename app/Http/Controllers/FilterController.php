<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class FilterController extends Controller {
    //
    public function customers(){
        $customerRole = Role::where('slug', 'customer')->first();
        $customers = User::where('role_id', $customerRole ? $customerRole->id: 0)
            ->filter(Request::only('search'))
            ->limit(6)
            ->get()
            ->map
            ->only('id', 'name');

        return response()->json($customers);
    }


    public function usersExceptCustomer(){
        $customerRole = Role::where('slug', 'customer')->first();
        $customers = User::where('role_id', '!=', $customerRole ? $customerRole->id : 0)
            ->filter(Request::only('search'))
            ->limit(6)
            ->get()
            ->map
            ->only('id', 'name');
        return response()->json($customers);
    }
}
