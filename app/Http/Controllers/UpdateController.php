<?php

namespace App\Http\Controllers;

use App\Helpers\DatabaseManager;
use App\Helpers\InstalledFileManager;
use App\Helpers\MigrationsHelper;
use Illuminate\Routing\Controller;
use Illuminate\View\View;

class UpdateController extends Controller
{
    use MigrationsHelper;

    /**
     * Display the updater welcome page.
     *
     * @return View
     */
    public function welcome()
    {
        return view('vendor.installer.update.welcome');
    }

    /**
     * Display the updater overview page.
     *
     * @return View
     */
    public function overview()
    {
        $migrations = $this->getMigrations();
        $dbMigrations = $this->getExecutedMigrations();

        return view('vendor.installer.update.overview', ['numberOfUpdatesPending' => count($migrations) - count($dbMigrations)]);
    }

    /**
     * Migrate and seed the database.
     *
     * @return View
     */
    public function database()
    {
        $databaseManager = new DatabaseManager;
        $response = $databaseManager->migrateAndSeed();

        return redirect()->route('LaravelUpdater::final')
            ->with(['message' => $response]);
    }

    /**
     * Update installed file and display finished view.
     *
     * @return View
     */
    public function finish(InstalledFileManager $fileManager)
    {
        dd('ok');
        $fileManager->update();

        return view('vendor.installer.update.finished');
    }
}
