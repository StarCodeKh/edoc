<?php

namespace App\Http\Controllers;

use App\Helpers\DatabaseManager;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;

class DatabaseController extends Controller
{
    /**
     * @var DatabaseManager
     */
    private $databaseManager;

    /**
     * @param DatabaseManager $databaseManager
     */
    public function __construct(DatabaseManager $databaseManager)
    {
        $this->databaseManager = $databaseManager;
    }

    /**
     * Migrate and seed the database.
     *
     * @return \Illuminate\View\View
     */
    public function database()
    {
        $response = $this->databaseManager->migrateAndSeed();

        return redirect()->route('LaravelInstaller::admin_setup')->with(['message' => $response]);
//        return redirect()->route('LaravelInstaller::final')->with(['message' => $response]);
    }

    public function manual_migration()
    {
        try {
            Artisan::call('migrate', ['--force'=> true]);
        } catch (Exception $e) {
            dd($e);
        }
        dd('done!');
    }

    public function manual_seed($flag = null)
    {
        try {
            if(!empty($flag)){
                if($flag == 'all'){
                    Artisan::call('db:seed', ['--force'=> true]);
                }else{
                    Artisan::call('db:seed', ['--class' => $flag, '--force'=> true]);
                }
            }
        } catch (Exception $e) {
            dd($e);
        }
        dd('done!');
    }
}
