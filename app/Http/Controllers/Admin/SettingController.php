<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings');
    }

    public function update(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:100'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'primary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'secondary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'hero_title' => ['required', 'string', 'max:150'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'scroll_image' => ['nullable', 'image', 'max:4096'],
            'content' => ['nullable', 'array'],
            'content.*' => ['nullable', 'string', 'max:500'],
        ]);

        foreach (['logo' => 'logo_path', 'scroll_image' => 'scroll_image_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                if ($settings->{$column}) {
                    Storage::disk('public')->delete($settings->{$column});
                }
                $data[$column] = $request->file($field)->store($field, 'public');
            }
            unset($data[$field]);
        }

        // Only known keys are stored; blank ones are dropped so the default text comes back.
        $data['content'] = array_filter(Arr::only($data['content'] ?? [], array_keys(SiteSetting::CONTENT_DEFAULTS)));

        $settings->update($data);

        return back();
    }
}
