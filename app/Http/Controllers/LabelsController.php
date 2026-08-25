<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesTasks;
use App\Http\Middleware\RedirectIfNotAdmin;
use App\Models\Label;
use App\Models\TaskLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LabelsController extends Controller
{
    use AuthorizesTasks;

    public function __construct()
    {
        //        $this->middleware(RedirectIfNotAdmin::class);
    }

    public function all()
    {
        $labels = Label::limit(50)->get();

        return response()->json($labels);
    }

    public function addLabelToTask(Request $request)
    {
        $requestData = $request->all();

        if (!empty($requestData['task_id'])) {
            $this->authorizeTask($requestData['task_id'], 'edit');
        }

        $taskLabel = TaskLabel::where($requestData)->first();
        if (!empty($taskLabel)) {
            $taskLabel->delete();
            $taskLabel = ['success' => true];
        } else {
            $taskLabel = TaskLabel::create($requestData);
            $taskLabel->load('label');
        }

        return response()->json($taskLabel);
    }

    public function saveLabel(Request $request)
    {
        $requestData = $request->all();
        if (isset($requestData['id']) && !empty($requestData['id'])) {
            $label = Label::whereId($requestData['id'])->first();
            foreach ($requestData as $itemKey => $itemValue) {
                $label->{$itemKey} = $itemValue;
            }
            $label->save();
        } else {
            $label = Label::create($requestData);
        }

        return response()->json($label);
    }

    public function index()
    {
        return Inertia::render('Labels/Index', [
            'title' => 'Labels',
            'filters' => Request::all(['search']),
            'labels' => Label::orderBy('name')
                ->filter(Request::all(['search']))
                ->paginate(10)
                ->withQueryString()
                ->through(function ($priority) {
                    return [
                        'id' => $priority->id,
                        'name' => $priority->name,
                        'color' => $priority->color,
                    ];
                }),
        ]);
    }

    public function create()
    {
        return Inertia::render('Labels/Create', [
            'title' => 'Create a new label',
        ]);
    }

    public function store()
    {
        $request_data = Request::validate([
            'name' => ['required', 'max:50'],
            'color' => ['max:20'],
        ]);

        Label::create(['name' => $request_data['name'], 'color' => $request_data['color']]);

        return Redirect::route('labels')->with('success', 'Label created.');
    }

    public function edit(Label $label)
    {
        return Inertia::render('Labels/Edit', [
            'title' => 'Label',
            'label' => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ],
        ]);
    }

    public function update(Label $label)
    {
        $label->update(
            Request::validate([
                'name' => ['required', 'max:50'],
                'color' => ['max:20'],
            ])
        );

        return Redirect::back()->with('success', 'Label updated.');
    }

    public function destroy(Label $label)
    {
        $label->delete();

        return Redirect::route('labels')->with('success', 'Label deleted.');
    }

    public function restore(Label $label)
    {
        $label->restore();

        return Redirect::back()->with('success', 'Label restored.');
    }

    public function deleteLabel($id)
    {
        $label = Label::whereId($id)->first();
        if (!empty($label)) {
            TaskLabel::where('label_id', $id)->delete();
            $label->delete();
        }

        return response()->json(['success' => true]);
    }
}
