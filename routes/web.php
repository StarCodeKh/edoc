<?php

use App\Http\Controllers\AssigneesController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BackgroundsController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CheckListsController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\CronJobsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\EnvironmentController;
use App\Http\Controllers\FinalController;
use App\Http\Controllers\ImagesController;
use App\Http\Controllers\InstallerController;
use App\Http\Controllers\LabelsController;
use App\Http\Controllers\LanguagesController;
use App\Http\Controllers\ListsController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSettingController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\RequirementsController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\StarredProjectsController;
use App\Http\Controllers\TasksController;
use App\Http\Controllers\TimersController;
use App\Http\Controllers\UpdateController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\FilterController;
use App\Http\Controllers\EmailTemplatesController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WatcherController;
use App\Http\Controllers\WorkSpacesController;
use App\Http\Controllers\WorkspaceTypesController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\ModernInstallerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Auth

Route::get('login', [AuthenticatedSessionController::class, 'create'])
    ->name('login')
    ->middleware('guest');

Route::get('register', [AuthenticatedSessionController::class, 'register'])->name('register')->middleware('guest');

Route::get('password-reset', [AuthenticatedSessionController::class, 'forgotPassword'])->name('password.reset')->middleware('guest');
Route::post('password-reset-email', [AuthenticatedSessionController::class, 'forgotPasswordMail'])->name('password.reset.email')->middleware('guest');
Route::get('password-reset/{token}', [AuthenticatedSessionController::class, 'forgotPasswordToken'])->name('password.reset.token')->middleware('guest');
Route::post('password-reset-confirm', [AuthenticatedSessionController::class, 'forgotPasswordStore'])->name('password.reset.store')->middleware('guest');

Route::post('login', [AuthenticatedSessionController::class, 'store'])
    ->name('login.store')
    ->middleware('guest');

Route::post('register', [AuthenticatedSessionController::class, 'registerStore'])
    ->name('register.store')
    ->middleware('guest');

Route::delete('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

// Dashboard
Route::get('/', [WorkSpacesController::class, 'index'])->name('dashboard')->middleware('auth');
Route::get('/home', function() { return redirect()->route('dashboard'); })->name('home')->middleware('auth');

Route::get('/workspace/{uid}/main-dashboard', [WorkspacesController::class, 'viewMainDashboard'])->name('workspace.view.maindashboard');

Route::get('json/workspaces/mine', [WorkSpacesController::class, 'jsonMineAll'])->name('json.workspaces.mine')->middleware('auth');
Route::get('json/workspaces/all', [WorkSpacesController::class, 'jsonAll'])->name('json.workspaces.all')->middleware('auth');
Route::get('json/workspaces/other_users/{workspace_id}', [WorkSpacesController::class, 'getOtherUsers'])->name('json.workspaces.users.other')->middleware('auth');
Route::post('json/workspace/create', [WorkSpacesController::class, 'jsonCreate'])->name('json.workspace.create')->middleware('auth');
Route::post('json/workspace-types/get', [WorkspaceTypesController::class, 'jsonGet'])->name('json.workspace.types.get')->middleware('auth');
Route::post('json/workspace/member/add', [WorkSpacesController::class, 'jsonAddMember'])->name('json.workspace.member.add')->middleware('auth');
Route::post('json/workspace/change', [WorkSpacesController::class, 'jsonChangeWorkspace'])->name('json.workspace.change')->middleware('auth');
Route::post('workspace/update/{id}', [WorkSpacesController::class, 'updateWorkspace'])->name('workspace.update')->middleware('auth');

Route::get('json/backgrounds/all', [BackgroundsController::class, 'jsonAll'])->name('json.backgrounds.all')->middleware('auth');

Route::post('json/list/add', [ListsController::class, 'addNew'])->name('json.list.add')->middleware('auth');
Route::post('json/list/archive/{list_id}', [ListsController::class, 'makeArchive'])->name('json.list.archive')->middleware('auth');

Route::post('json/p/starred/save/{project_id}', [StarredProjectsController::class, 'makeFavorite'])->name('json.p.starred.save')->middleware('auth');

Route::get('json/projects/all/{workspace_id}', [ProjectsController::class, 'jsonAll'])->name('json.projects.all')->middleware('auth');
Route::get('json/projects/recent', [ProjectsController::class, 'jsonRecent'])->name('json.projects.recent')->middleware('auth');
Route::get('json/projects/star', [ProjectsController::class, 'jsonStar'])->name('json.projects.star')->middleware('auth');
Route::post('json/project/create', [ProjectsController::class, 'jsonCreate'])->name('json.project.create')->middleware('auth');
Route::get('json/project/members/{project_id}', [ProjectsController::class, 'jsonMembers'])->name('json.project.members')->middleware('auth');
Route::get('json/project/filter/data/{project_id}', [ProjectsController::class, 'jsonFilterData'])->name('json.project.filter.data')->middleware('auth');

Route::get('json/menu_data/tasks/{project_id}', [TasksController::class, 'jsonArchiveTasks'])->name('json.menu_data.tasks')->middleware('auth');
Route::get('json/menu_data/boards/{project_id}', [ListsController::class, 'jsonArchiveBoardLists'])->name('json.menu_data.boards')->middleware('auth');
Route::get('json/menu_data/workspaces', [WorkSpacesController::class, 'jsonMineAll'])->name('json.menu_data.workspaces')->middleware('auth');
Route::get('json/menu_data/backgrounds', [BackgroundsController::class, 'jsonAll'])->name('json.menu_data.backgrounds')->middleware('auth');
Route::post('json/board/remove/archive/{id}', [ListsController::class, 'jsonRemoveArchive'])->name('json.board.remove.archive')->middleware('auth');

Route::post('json/list/order', [ListsController::class, 'orderList'])->name('json.list.order')->middleware('auth');

Route::get('w/{uid}', [WorkSpacesController::class, 'workspaceView'])->name('workspace.view')->middleware('auth');
Route::get('w/{uid}/members', [WorkSpacesController::class, 'workspaceMembers'])->name('workspace.members')->middleware('auth');
Route::get('w/{uid}/tasks/board', [WorkSpacesController::class, 'workspaceBoard'])->name('workspace.view.board')->middleware('auth');
Route::get('w/{uid}/tasks/calendar', [WorkSpacesController::class, 'workspaceCalendar'])->name('workspace.view.calendar')->middleware('auth');
Route::get('w/{uid}/tasks/timeline', [WorkSpacesController::class, 'workspaceTimeline'])->name('workspace.view.timeline')->middleware('auth');
Route::get('w/{uid}/tasks/table', [WorkSpacesController::class, 'workspaceTables'])->name('workspace.view.table')->middleware('auth');

Route::get('w/{uid}/my-tasks/count', [WorkSpacesController::class, 'jsonMyTasksCount'])->name('json.workspace.my-tasks.count')->middleware('auth');
Route::get('w/{uid}/tasks/my-tasks/board', [WorkSpacesController::class, 'workspaceMyTasksBoard'])->name('workspace.view.my-tasks.board')->middleware('auth');

Route::get('w/{uid}/tasks/my-tasks/calendar', [WorkSpacesController::class, 'workspaceMyTasksCalendar'])->name('workspace.view.my-tasks.calendar')->middleware('auth');
Route::get('w/{uid}/tasks/my-tasks/timeline', [WorkSpacesController::class, 'workspaceMyTasksTimeline'])->name('workspace.view.my-tasks.timeline')->middleware('auth');
Route::get('w/{uid}/tasks/my-tasks/table', [WorkSpacesController::class, 'workspaceMyTasks'])->name('workspace.view.my-tasks.table')->middleware('auth');
Route::get('w/{uid}/tasks/my-tasks', [WorkSpacesController::class, 'workspaceMyTasks'])->name('workspace.view.my-tasks')->middleware('auth');
Route::get('w/{uid}/tables', [WorkSpacesController::class, 'workspaceTables'])->name('workspace.tables')->middleware('auth');
Route::delete('workspace/destroy/{id}', [WorkSpacesController::class, 'destroy'])->name('workspace.destroy')->middleware('auth');

Route::delete('project/destroy/{id}', [ProjectsController::class, 'destroy'])->name('project.destroy')->middleware('auth');
Route::get('projects', [ProjectsController::class, 'index'])->name('projects.index')->middleware('auth');
Route::get('project/test', [ProjectsController::class, 'test'])->name('project.test')->middleware('auth');
Route::post('project/update/{id}', [ProjectsController::class, 'update'])->name('project.update')->middleware('auth');
Route::get('p/board/{uid}', [ProjectsController::class, 'view'])->name('projects.view.board')->middleware('auth');
Route::get('p/na', [ProjectsController::class, 'noProject'])->name('projects.view.na')->middleware('auth');
Route::get('p/table/{uid}', [ProjectsController::class, 'viewTable'])->name('projects.view.table')->middleware('auth');
Route::get('p/calendar/{uid}', [ProjectsController::class, 'viewCalendar'])->name('projects.view.calendar')->middleware('auth');
Route::get('p/timeline/{uid}', [ProjectsController::class, 'viewTimeline'])->name('projects.view.timeline')->middleware('auth');
Route::get('p/dashboard/{uid}', [ProjectsController::class, 'viewDashboard'])->name('projects.view.dashboard')->middleware('auth');
Route::get('p/time-logs/{uid}', [ProjectsController::class, 'viewTimeLogs'])->name('projects.view.time_logs')->middleware('auth');
Route::get('p/board/{projectUid}/task/{taskUid}', [ProjectsController::class, 'viewWithTask'])->name('projects.board.with.task')->middleware('auth');
Route::get('p/table/{projectUid}/task/{taskUid}', [ProjectsController::class, 'viewTableWithTask'])->name('projects.table.with.task')->middleware('auth');
Route::get('project/all', [ProjectsController::class, 'all'])->name('project.all')->middleware('auth');
Route::get('project/other/data/{project_id}', [ProjectsController::class, 'projectOtherData'])->name('project.other.data')->middleware('auth');
Route::get('workspace/other/data/{workspace_id}', [ProjectsController::class, 'workspaceOtherData'])->name('workspace.other.data')->middleware('auth');

Route::post('task/update/order', [TasksController::class, 'updateTaskOrder'])->name('task.update.order')->middleware('auth');
Route::post('task/new', [TasksController::class, 'newTask'])->name('task.new')->middleware('auth');
Route::post('task/delete/{id}', [TasksController::class, 'deleteDask'])->name('task.delete')->middleware('auth');
Route::get('json/task/get/{taskUid}', [TasksController::class, 'getJsonTask'])->name('json.task.get')->middleware('auth');
Route::post('task/update/{taskUid}', [TasksController::class, 'updateTask'])->name('task.update')->middleware('auth');
Route::post('task/update/list/{project_id}', [TasksController::class, 'updateTaskListByProjectId'])->name('task.update.list')->middleware('auth');
Route::get('task/list/count/{id}', [TasksController::class, 'countListItemsById'])->name('task.list.count')->middleware('auth');
Route::get('task/other/data/{task_id}/{project_id}', [TasksController::class, 'taskOtherData'])->name('task.other.data')->middleware('auth');
Route::post('task/attachment/add/{id}', [TasksController::class, 'addAttachment'])->name('task.attachment.add')->middleware('auth');
Route::post('project/background/upload/{id}', [ProjectsController::class, 'uploadBackground'])->name('project.background.upload')->middleware('auth');
Route::post('project/background/update/{id}', [ProjectsController::class, 'updateBackground'])->name('project.background.update')->middleware('auth');
Route::post('task/attachment/delete/{id}', [TasksController::class, 'removeAttachment'])->name('task.attachment.delete')->middleware('auth');

Route::post('board/update/{id}', [ListsController::class, 'update'])->name('board.update')->middleware('auth');
Route::get('board_list/all', [ListsController::class, 'all'])->name('board_lists.all')->middleware('auth');

Route::post('task/labels/add', [LabelsController::class, 'addLabelToTask'])->name('task.labels.add')->middleware('auth');
Route::post('labels/save', [LabelsController::class, 'saveLabel'])->name('labels.save')->middleware('auth');
Route::post('labels/delete/{id}', [LabelsController::class, 'deleteLabel'])->name('labels.delete')->middleware('auth');

Route::post('task/assignees/add', [AssigneesController::class, 'assignUserToTask'])->name('task.assignees.add')->middleware('auth');
Route::post('task/timer/stop', [TimersController::class, 'stopTimer'])->name('task.timer.stop')->middleware('auth');
Route::post('task/timer/start', [TimersController::class, 'startTimer'])->name('task.timer.start')->middleware('auth');
Route::post('task/timer/manual', [TimersController::class, 'manualTime'])->name('task.timer.manual')->middleware('auth');
Route::get('task/timer/duration/{task_id}', [TimersController::class, 'getDuration'])->name('task.timer.duration')->middleware('auth');

Route::post('checklist/update/{id}', [CheckListsController::class, 'update'])->name('check_list.update')->middleware('auth');
Route::post('checklist/new', [CheckListsController::class, 'saveNew'])->name('check_list.new')->middleware('auth');
Route::post('checklist/delete/{id}', [CheckListsController::class, 'deleteItem'])->name('check_list.delete')->middleware('auth');

Route::post('comments/delete/{id}', [CommentsController::class, 'deleteItem'])->name('comment.delete')->middleware('auth');
Route::post('comments/new', [CommentsController::class, 'saveNew'])->name('comments.new')->middleware('auth');
Route::post('comments/update/{id}', [CommentsController::class, 'update'])->name('comment.update')->middleware('auth');


/** Status Routing */

Route::get('settings/filter/customers', [FilterController::class, 'customers'])
    ->name('filter.customers')
    ->middleware('auth');

Route::get('settings/filter/assignees', [FilterController::class, 'assignees'])
    ->name('filter.assignees')
    ->middleware('auth');

Route::get('settings/filter/users_except_customer', [FilterController::class, 'usersExceptCustomer'])
    ->name('filter.users_except_customer')
    ->middleware('auth');



// Email Templates
Route::get('settings/templates', [EmailTemplatesController::class, 'index'])
    ->name('templates')
    ->middleware('auth');

Route::get('settings/templates/{emailTemplate}/edit', [EmailTemplatesController::class, 'edit'])
    ->name('templates.edit')
    ->middleware('auth');

Route::put('settings/templates/{emailTemplate}', [EmailTemplatesController::class, 'update'])
    ->name('templates.update')
    ->middleware('auth');
// End - Email Template

// Languages
Route::get('settings/languages', [LanguagesController::class, 'index'])
    ->name('languages')
    ->middleware('auth');

Route::get('settings/languages/create', [LanguagesController::class, 'create'])
    ->name('languages.create')
    ->middleware('auth');

Route::post('settings/languages', [LanguagesController::class, 'store'])
    ->name('languages.store')
    ->middleware('auth');

Route::get('settings/languages/{language}/edit', [LanguagesController::class, 'edit'])
    ->name('languages.edit')
    ->middleware('auth');

Route::put('settings/languages/{language}', [LanguagesController::class, 'update'])
    ->name('languages.update')
    ->middleware('auth');

Route::post('settings/languages/new_item', [LanguagesController::class, 'newItem'])
    ->name('languages.newItem')
    ->middleware('auth');

Route::delete('settings/languages/delete_item/{value}', [LanguagesController::class, 'deleteItem'])
    ->name('languages.deleteItem')
    ->middleware('auth');

Route::delete('settings/languages/{id}', [LanguagesController::class, 'delete'])
    ->name('languages.delete')
    ->middleware('auth');
// End - Lanuages



Route::get('settings/users', [UsersController::class, 'index'])
    ->name('users')
    ->middleware('auth');


Route::get('settings/users/create', [UsersController::class, 'create'])
    ->name('users.create')
    ->middleware('auth');

Route::post('settings/users', [UsersController::class, 'store'])
    ->name('users.store')
    ->middleware('auth');

Route::get('settings/users/{user}/edit', [UsersController::class, 'edit'])
    ->name('users.edit')
    ->middleware('auth');

Route::get('settings/edit-profile', [DashboardController::class, 'editProfile'])
    ->name('users.edit.profile')
    ->middleware('auth');

Route::put('settings/edit-profile/{user}', [DashboardController::class, 'editProfileUpdate'])
    ->name('users.edit.profile.update')
    ->middleware('auth');

Route::put('settings/users/{user}', [UsersController::class, 'update'])
    ->name('users.update')
    ->middleware('auth');

Route::delete('settings/users/{user}', [UsersController::class, 'destroy'])
    ->name('users.destroy')
    ->middleware('auth');

Route::put('settings/users/{user}/restore', [UsersController::class, 'restore'])
    ->name('users.restore')
    ->middleware('auth');


// Global Settings
Route::get('settings/global', [SettingsController::class, 'index'])
    ->name('global')
    ->middleware('auth');
Route::post('settings/global', [SettingsController::class, 'update'])->name('global.update')->middleware('auth');
Route::post('settings/pre_made_list', [SettingsController::class, 'updatePreMadeList'])->name('global.update.pre_made_list')->middleware('auth');
Route::get('settings/smtp', [SettingsController::class, 'smtp'])->name('settings.smtp')->middleware('auth');
Route::get('settings/update', [SettingsController::class, 'systemUpdate'])->name('settings.update')->middleware('auth');
Route::get('settings/pre-made-boards', [SettingsController::class, 'preMadeBoards'])->name('pre-made-boards')->middleware('auth');
Route::post('settings/update/check', [SettingsController::class, 'systemUpdateCheck'])->name('settings.update.check')->middleware('auth');
Route::put('settings/smtp/update', [SettingsController::class, 'updateSmtp'])
    ->name('settings.smtp.update')
    ->middleware('auth');

Route::get('dev/setup/clear/{slug}', [SettingsController::class, 'clearCache'])
    ->name('clear.cache');
// End - Global Settings

/** User Roles */
Route::get('settings/roles', [RolesController::class, 'index'])
    ->name('roles')
    ->middleware('auth');
Route::get('settings/roles/create', [RolesController::class, 'create'])
    ->name('roles.create')
    ->middleware('auth');
Route::post('settings/roles', [RolesController::class, 'store'])
    ->name('roles.store')
    ->middleware('auth');
Route::get('settings/roles/{role}/edit', [RolesController::class, 'edit'])
    ->name('roles.edit')
    ->middleware('auth');
Route::put('settings/roles/{role}', [RolesController::class, 'update'])
    ->name('roles.update')
    ->middleware('auth');
Route::delete('settings/roles/{role}', [RolesController::class, 'destroy'])
    ->name('roles.destroy')
    ->middleware('auth');


Route::resource('settings/workspace_types', WorkspaceTypesController::class);

/** Send Mail Controller */
Route::post('mail/send/comment/{id}', [MailController::class, 'comment'])->name('send.mail.comment')->middleware('auth');
Route::post('mail/send/task_update/{id}', [MailController::class, 'task_update'])->name('send.mail.task_update')->middleware('auth');
Route::post('mail/send/board_update/{id}', [MailController::class, 'board_update'])->name('send.mail.board_update')->middleware('auth');


Route::get('/img/{path}', [ImagesController::class, 'show'])
    ->where('path', '.*')
    ->name('image');


/** Language Selector  */
Route::get('/language/{language}', [DashboardController::class, 'setLocale'])
    ->name('language');

/** Newsletter Subscribe */
Route::post('subscribe/news', [SubscriptionController::class, 'subscribe'])->name('subscribe.news');
/** Newsletter Subscribe */

/** Installation Steps */
Route::get('/backup/test', [BackupController::class, 'test'])->name('backup.test');
Route::get('/language/test/{code}', [LanguagesController::class, 'newLanguageManually'])->name('language.test');

Route::get('project/csv/export/{project_id}', [ProjectsController::class, 'csvExport'])->name('project.csv.export')
    ->middleware('auth');
Route::get('project/excel/export/{project_id}', [ProjectsController::class, 'excelExport'])->name('project.excel.export')
    ->middleware('auth');


Route::get('/admin/import/demo', [DemoController::class, 'import'])->name('import.demo')->middleware('auth');

// IMAP Custom
Route::get('/cron/queue_work', [CronJobsController::class, 'queueWork'])->name('cron.queue_work');

Route::post('/json/task/search', [TasksController::class, 'jsonTaskSearch'])->name('json.task.search');


// New code for installer
Route::group(['prefix' => 'install', 'as' => 'LaravelInstaller::', 'middleware' => ['web', 'install']], function () {
    Route::get('/', [InstallerController::class, 'welcome'])->name('welcome');
    Route::get('environment', [EnvironmentController::class, 'environmentMenu'])->name('environment');
    Route::get('environment/info', [EnvironmentController::class, 'environmentInfo'])->name('environmentInfo');
    Route::get('environment/database', [EnvironmentController::class, 'environmentDatabase'])->name('environmentDatabase');
    Route::get('environment/wizard', [EnvironmentController::class, 'environmentWizard'])->name('environmentWizard');
    Route::post('environment/saveWizard', [EnvironmentController::class, 'saveWizard'])->name('environmentSaveWizard');
    Route::post('environment/saveInfo', [EnvironmentController::class, 'saveInfo'])->name('environmentSaveInfo');
    Route::post('environment/saveDatabase', [EnvironmentController::class, 'saveDatabase'])->name('environmentSaveDatabase');
    Route::get('environment/classic', [EnvironmentController::class, 'environmentClassic'])->name('environmentClassic');
    Route::post('environment/saveClassic', [EnvironmentController::class, 'saveClassic'])->name('environmentSaveClassic');
    Route::get('requirements', [RequirementsController::class, 'requirements'])->name('requirements');
    Route::get('permissions', [PermissionsController::class, 'permissions'])->name('permissions');
    Route::get('database', [DatabaseController::class, 'database'])->name('database');
    Route::get('final', [FinalController::class, 'finish'])->name('final');
    Route::get('admin_setup', [FinalController::class, 'adminSetup'])->name('admin_setup');
    Route::post('saveAdminSetup', [FinalController::class, 'saveAdminSetup'])->name('saveAdminSetup');
});

Route::get('/database/manual/migration', [DatabaseController::class, 'manual_migration'])->name('manual.migration');
Route::get('/database/manual/seed/{flag}', [DatabaseController::class, 'manual_seed'])->name('manual.seed');

// Modern Installer Routes
Route::group(['prefix' => 'install', 'middleware' => ['web', 'install']], function () {
    // Main installer page
    Route::get('/', function () {
        try {
            return Inertia::render('Installer/Index');
        } catch (Exception $e) {
            \Log::error('Installer page failed to load', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Fallback to simple HTML installer
            return view('install');
        }
    })->name('installer.index');

    // API endpoints for installer
    Route::post('/check-requirements', [ModernInstallerController::class, 'checkRequirements'])->name('installer.check-requirements');
    Route::post('/verify-license', [ModernInstallerController::class, 'verifyLicense'])->name('installer.verify-license');
    Route::post('/test-database', [ModernInstallerController::class, 'testDatabase'])->name('installer.test-database');
    Route::post('/save-environment', [ModernInstallerController::class, 'saveEnvironment'])->name('installer.save-environment');
    Route::post('/run-installation', [ModernInstallerController::class, 'runInstallation'])->name('installer.run-installation');
});

Route::group(['prefix' => 'update', 'as' => 'LaravelUpdater::', 'middleware' => 'web'], function () {
    Route::group(['middleware' => 'update'], function () {
        Route::get('/', [UpdateController::class, 'welcome'])->name('update.welcome');
        Route::get('overview', [UpdateController::class, 'overview'])->name('overview');
        Route::get('database', [UpdateController::class, 'database'])->name('database');
    });

    // This needs to be out of the middleware because right after the migration has been
    // run, the middleware sends a 404.
    Route::get('final', [UpdateController::class, 'finish'])->name('final');
});
// New code for installer


Route::get('/settings/license', [LicenseController::class, 'showSettings'])->name('license.settings');
Route::post('/settings/license/deactivate', [LicenseController::class, 'deactivate'])->name('license.deactivate');

Route::get('/license/activate', [LicenseController::class, 'showActivationForm'])->name('license.show');
Route::post('/license/activate', [LicenseController::class, 'activate'])->name('license.activate');

Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}', [NotificationController::class, 'update'])->name('notifications.update');
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::post('/watch/toggle', [WatcherController::class, 'toggle'])->name('watch.toggle');

    Route::get('/settings/notifications', [NotificationSettingController::class, 'index'])
        ->name('notification-settings.index');

    // Route 2: Handles the update for a single toggle switch.
    Route::patch('/settings/notifications/{setting}', [NotificationSettingController::class, 'update'])
        ->name('notification-settings.update');
});


Route::get('/settings/license', [LicenseController::class, 'showSettings'])->name('license.settings');
Route::post('/settings/license/deactivate', [LicenseController::class, 'deactivate'])->name('license.deactivate');

Route::get('/license/activate', [LicenseController::class, 'showActivationForm'])->name('license.show');
Route::post('/license/activate', [LicenseController::class, 'activate'])->name('license.activate');