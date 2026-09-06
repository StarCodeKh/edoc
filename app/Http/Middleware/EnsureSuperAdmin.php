<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Super Admin only. Admin and Super Admin share the roles.slug 'admin' (see
 * App\Models\User), so slug alone cannot tell them apart - User::isSuperAdmin()
 * is the single place that rule lives.
 */
class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->isSuperAdmin()) {
            abort(403, __('This area is limited to the Super Admin.'));
        }

        return $next($request);
    }
}
