<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RedirectIfInstalled;
use App\Install\Requirement;
use App\Models\Role;
use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
//use App\Models\BusinessSetting;
use App\Models\User;
use App\Support\EnvFile;

class InstallController extends Controller {

    public function __construct() {
        $this->middleware(RedirectIfInstalled::class);
    }


    public function index(){
        return redirect()->route('install.init');
    }

    public function migrate(){
        Artisan::call('migrate:fresh');
    }

    public function init() {
        Artisan::call('key:generate');
        $env = EnvFile::load();
        $env->setKey('APP_URL', URL::to('/'));
        $env->setKey('APP_ENV', 'local');
        $env->setKey('DB_SETUP', 'false');
        $env->setKey('APP_DEBUG', 'true');
        $env->save();
        return view('installation.init');
    }

    public function pre_installation(Requirement $requirement) {
        return view('installation.pre_installation', compact('requirement'));
    }

    public function purchase_code() {
        return view('installation.purchase_code');
    }

    public function database_setup() {
        $purchaseCode = EnvFile::load()->getValue('APP_PCE');
        if(preg_match("/^(\{)?[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}(?(1)\})$/i", $purchaseCode)){
            return view('installation.database_setup');
        }else{
            return redirect()->route('install.purchase_code')->with('error','Please input your purchase code!');
        }
    }

    public function mail_setup() {
        $db_setup = EnvFile::load()->getValue('DB_SETUP');
        if($db_setup == 'true'){
            return view('installation.mail_setup');
        }else{
            return redirect()->route('install.database_setup')->with('error','Please setup your database connection first!');
        }
    }

    public function admin_setup() {
        return view('installation.admin_setup');
    }

    public function purchaseCodeVerify() {
        $purchaseCode = Request::input('purchase_code');
        if(!empty($purchaseCode) && preg_match("/^(\{)?[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}(?(1)\})$/i", $purchaseCode)){
            $env = EnvFile::load();
            $env->setKey('APP_PCE', $purchaseCode);
            $env->save();
            return redirect()->route('install.database_setup');
        }else{
            return redirect()->route('install.purchase_code')->with('error', 'Invalid purchase code, please input a valid purchase code.');
        }
    }

    private function getPurchaseCode($product_code) {
        $url = "https://api.envato.com/v3/market/author/sale?code=" . $product_code;
        $curl = curl_init($url);
        $header = array();
        $pate = decrypt(config('app.pate'));
        $header[] = 'Authorization: Bearer ' . $pate;
        $header[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:41.0) Gecko/20100101 Firefox/41.0';
        $header[] = 'timeout: 20';
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
        $envatoRes = curl_exec($curl);
        curl_close($curl);
        $envatoRes = is_string($envatoRes) ? json_decode($envatoRes, true) : $envatoRes;
        return $envatoRes;
    }

    public function mailSetupStore(){
        if(Request::input('skip_mailer') != 'on'){
            $mailVariables = Request::validate([
                'MAIL_HOST' => ['required'],
                'MAIL_PORT' => ['required'],
                'MAIL_USERNAME' => ['required'],
                'MAIL_PASSWORD' => ['required'],
                'MAIL_ENCRYPTION' => ['required'],
                'MAIL_FROM_ADDRESS' => ['nullable', 'email'],
                'MAIL_FROM_NAME' => ['nullable'],
            ]);
            $this->setEnvVariables($mailVariables);
        }

        return redirect()->route('install.admin_setup');
    }

    private function setEnvVariables($data) {
        $env = EnvFile::load();
        foreach ($data as $data_key => $data_value){
            $env->setKey($data_key, $data_value);
        }
        $env->save();
    }

    public function adminSetupSave(){
        Artisan::call('migrate:fresh');
        $this->import_sql();
        $data = Request::validate([
            'first_name' => ['required'],
            'last_name' => ['required'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required'],
        ]);
        $adminRole = Role::where('slug', 'admin')->first();
        User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role_id' => $adminRole ? $adminRole->id: null,
            'title' => 'Engineer',
        ]);
        $env = EnvFile::load();
        $env->setKey('APP_INSTALLED', 'true');
        $env->setKey('APP_ENV', 'production');
        $env->setKey('APP_DEBUG', 'false');
        $env->save();
        $this->clearCache();
        return view('installation.complete');
    }

    public function welcome(){
        return view('installation.complete');
    }

    public function database_installation() {
        $data = [
            'host' => Request::input('DB_HOST'),
            'port' => Request::input('DB_PORT'),
            'database' => Request::input('DB_DATABASE'),
            'username' => Request::input('DB_USERNAME'),
            'password' => Request::input('DB_PASSWORD') ?? '',
        ];

        $hasError = null;
        try {
            $this->checkDatabaseConnection($data);
        }catch (\Throwable $e){
            $hasError = $e;
        }
        if(!empty($hasError)){
            if(in_array($data['host'], ['127.0.0.1', 'localhost'])){
                $data['host'] = ($data['host'] == 'localhost') ? '127.0.0.1' : 'localhost';
                try {
                    $this->checkDatabaseConnection($data);
                }catch (\Throwable $e){
                    return redirect()->route('install.database_setup')->with('error', 'Please check your database credentials carefully.');
                }
            }else{
                return redirect()->route('install.database_setup')->with('error', 'Please check your database credentials carefully.');
            }
        }
        $this->setDatabaseVariables($data);
        config([ 'database.setup' => true ]);
        return redirect()->route('install.mail_setup');
    }

    private function checkDatabaseConnection($data) {
        $this->setupDatabaseConnectionConfig($data);

        DB::connection('mysql')->reconnect();
        DB::connection('mysql')->getPdo();
    }

    private function setupDatabaseConnectionConfig($data) {
        config([
            'database.default' => 'mysql',
            'database.connections.mysql.host' => $data['host'],
            'database.connections.mysql.port' => $data['port'],
            'database.connections.mysql.database' => $data['database'],
            'database.connections.mysql.username' => $data['username'],
            'database.connections.mysql.password' => $data['password'],
        ]);
    }

    private function setDatabaseVariables($data) {
        $env = EnvFile::load();
        $env->setKey('DB_HOST', $data['host']);
        $env->setKey('DB_PORT', $data['port']);
        $env->setKey('DB_DATABASE', $data['database']);
        $env->setKey('DB_USERNAME', $data['username']);
        $env->setKey('DB_PASSWORD', $data['password']);
        $env->setKey('DB_SETUP', 'true');
        $env->save();
        Artisan::call('config:cache');
    }

    private function import_sql() {
        $sql_path = base_path('database/install_helpdesk.sql');
        DB::unprepared(file_get_contents($sql_path));
    }

    private function clearCache(){
        Artisan::call('optimize');
        Artisan::call('cache:clear');
        Artisan::call('route:cache');
        Artisan::call('view:clear');
        Artisan::call('config:cache');
        Artisan::call('clear-compiled');
    }

    private function truncateTables(){
        Schema::disableForeignKeyConstraints();
        $tableNames = Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
        foreach ($tableNames as $name) {
            //if you don't want to truncate migrations
            if ($name == 'migrations') {
                continue;
            }
            DB::table($name)->truncate();
        }
        Schema::enableForeignKeyConstraints();
    }
}
