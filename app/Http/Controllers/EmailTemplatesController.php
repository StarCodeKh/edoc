<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RedirectIfNotAdmin;
use App\Http\Middleware\RedirectIfNotParmitted;
use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmailTemplatesController extends Controller {

    public function __construct(){
//        $this->middleware(RedirectIfNotParmitted::class.':email_template');
    }

    public function index(){
        return Inertia::render('EmailTemplates/Index', [
            'title' => 'Notification Templates',
            'filters' => Request::all('search', 'channel'),
            'channels' => $this->channelCounts(),
            'templates' => EmailTemplate::orderBy('channel')
                ->orderBy('name')
                ->filter(Request::only('search', 'channel'))
                ->paginate(10)
                ->withQueryString()
                ->through(function ($template) {
                    return [
                        'id' => $template->id,
                        'name' => $template->name,
                        'language' => $template->en,
                        'details' => $template->details,
                        'slug' => $template->slug,
                        'channel' => $template->channel ?: EmailTemplate::CHANNEL_EMAIL,
                        'html' => $template->html,
                    ];
                } ),
        ]);
    }

    /**
     * Row counts per channel, so the index can show tabs with totals.
     */
    private function channelCounts(): array
    {
        $counts = EmailTemplate::selectRaw('channel, count(*) as total')
            ->groupBy('channel')
            ->pluck('total', 'channel');

        return [
            'all' => (int) $counts->sum(),
            EmailTemplate::CHANNEL_EMAIL => (int) $counts->get(EmailTemplate::CHANNEL_EMAIL, 0),
            EmailTemplate::CHANNEL_TELEGRAM => (int) $counts->get(EmailTemplate::CHANNEL_TELEGRAM, 0),
        ];
    }

    public function edit(EmailTemplate $emailTemplate){
        return Inertia::render('EmailTemplates/Edit', [
            'title' => $emailTemplate->name,
            'template' => [
                'id' => $emailTemplate->id,
                'name' => $emailTemplate->name,
                'details' => $emailTemplate->details,
                'language' => $emailTemplate->en,
                'slug' => $emailTemplate->slug,
                'channel' => $emailTemplate->channel ?: EmailTemplate::CHANNEL_EMAIL,
                'html' => $emailTemplate->html,
            ],
        ]);
    }

    public function update(EmailTemplate $emailTemplate) {
        if (config('app.demo')) {
            return Redirect::back()->with('error', 'Updating template are not allowed for the live demo.');
        }
        $emailTemplate->update(
            Request::validate([
                'html' => ['required'],
            ])
        );

        return Redirect::back()->with('success', 'Template updated.');
    }
}
