<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;

class SubscriptionController extends Controller
{
    public function subscribe()
    {
        $request = Request::validate([
            'email' => ['required', 'email'],
        ]);
        Contact::create($request);

        return Redirect::back()->with('success', 'You just subscribed for the latest news. Thank You!');
    }
}
