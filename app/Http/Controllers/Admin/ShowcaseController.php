<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Showcase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ShowcaseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/showcases', [
            'showcases' => Showcase::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Showcase::create($this->validated($request));

        return back();
    }

    public function update(Request $request, Showcase $showcase): RedirectResponse
    {
        $data = $this->validated($request);

        if (isset($data['image_path']) && $showcase->image_path) {
            Storage::disk('public')->delete($showcase->image_path);
        }

        $showcase->update($data);

        return back();
    }

    public function destroy(Showcase $showcase): RedirectResponse
    {
        if ($showcase->image_path) {
            Storage::disk('public')->delete($showcase->image_path);
        }

        $showcase->delete();

        return back();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'tag' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:100'],
            'subtitle' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('showcases', 'public');
        }
        unset($data['image']);

        return $data;
    }
}
