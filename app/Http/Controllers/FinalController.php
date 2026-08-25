<?php

namespace App\Http\Controllers;

use App\Events\LaravelInstallerFinished;
use App\Helpers\EnvironmentManager;
use App\Helpers\FinalInstallManager;
use App\Helpers\InstalledFileManager;
use App\Models\User;
use App\Support\EnvFile;
use Illuminate\Contracts\View\Factory;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\View\View;
use Symfony\Component\Console\Output\BufferedOutput;

class FinalController extends Controller
{
    /**
     * Update installed file and display finished view.
     *
     * @return Factory|View
     */
    public function finish(InstalledFileManager $fileManager, FinalInstallManager $finalInstall, EnvironmentManager $environment)
    {
        $finalMessages = $finalInstall->runFinal();
        $finalStatusMessage = $fileManager->update();
        $finalEnvFile = $environment->getEnvContent();

        event(new LaravelInstallerFinished);

        return view('vendor.installer.finished', compact('finalMessages', 'finalStatusMessage', 'finalEnvFile'));
    }

    public function adminSetup()
    {
        return view('vendor.installer.admin-setup');
    }

    public function saveAdminSetup(BufferedOutput $outputLog, InstalledFileManager $fileManager, FinalInstallManager $finalInstall, EnvironmentManager $environment)
    {
        $userData = \Illuminate\Support\Facades\Request::validate([
            'first_name' => ['required', 'max:100'],
            'last_name' => ['required', 'max:100'],
            'email' => ['required', 'email', 'max:100'],
            'password' => ['required', 'max:100'],
        ]);
        $userData['role_id'] = 1;

        try {
            Artisan::call('migrate', ['--force' => true], $outputLog);
            Artisan::call('db:seed', ['--force' => true], $outputLog);
        } catch (Exception $e) {
            return $this->response($e->getMessage(), 'error', $outputLog);
        }

        User::create($userData);

        $env = EnvFile::load();
        $env->setKey('APP_INSTALLED', 'true');
        $env->setKey('DB_SETUP', 'true');
        $env->save();
        Artisan::call('config:cache');

        return $this->finisSetup($fileManager, $finalInstall, $environment);

        //        return redirect()->route('LaravelInstaller::final')->with(['message' => 'The application installed successfully!']);
    }

    private function finisSetup($fileManager, $finalInstall, $environment)
    {
        $finalMessages = $finalInstall->runFinal();
        $finalStatusMessage = $fileManager->update();
        $finalEnvFile = $environment->getEnvContent();

        event(new LaravelInstallerFinished);

        return view('vendor.installer.finished', compact('finalMessages', 'finalStatusMessage', 'finalEnvFile'));
    }
}
