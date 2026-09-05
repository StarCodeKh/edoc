<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

/*
 * Every function here is guarded.
 *
 * Composer loads this file once through its `files` autoload, and normally that
 * is the end of it. It is not always the end of it: the installer boots the
 * framework a second time, and a `composer dump-autoload` that rewrites
 * autoload_files.php while autoload_static.php is still cached leaves the two
 * disagreeing about the include key that is supposed to make the load
 * idempotent. Either way the file gets read twice, and an unguarded
 * declaration is a fatal error rather than a no-op.
 *
 * static_asset() was already written this way; translations() and isActive()
 * were not, which is why translations() - the first declaration in the file -
 * was the one that blew up.
 */

if (!function_exists('translations')) {
    /**
     * Read a language JSON file into an array.
     *
     * @param  string  $json  Absolute path to the file.
     * @return array
     */
    function translations($json)
    {
        if (!file_exists($json)) {
            return [];
        }

        $contents = file_get_contents($json);

        return is_string($contents) ? json_decode($contents, true) : $contents;
    }
}

if (!function_exists('static_asset')) {
    /**
     * Generate an asset path for the application.
     *
     * @param  string  $path
     * @param  bool|null  $secure
     * @return string
     */
    function static_asset($path, $secure = null)
    {
        return app('url')->asset('public/'.$path, $secure);
    }
}

if (!function_exists('isActive')) {
    /**
     * The class name to put on a nav item when it points at the current route.
     *
     * @param  array|string  $route
     * @param  string  $className
     * @return string
     */
    function isActive($route, $className = 'active')
    {
        if (is_array($route)) {
            return in_array(Route::currentRouteName(), $route) ? $className : '';
        }

        if (Route::currentRouteName() == $route) {
            return $className;
        }

        if (strpos(URL::current(), $route)) {
            return $className;
        }

        return '';
    }
}
