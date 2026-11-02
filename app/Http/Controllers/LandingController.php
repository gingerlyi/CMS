<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Service;
use App\Models\Showcase;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('welcome', [
            'services' => Service::where('is_active', true)->orderBy('sort_order')->get(),
            'showcases' => Showcase::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function order(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'service_id' => ['nullable', 'exists:services,id'],
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'device' => ['required', 'string', 'max:100'],
            'complaint' => ['required', 'string', 'max:1000'],
        ]);

        $order = Order::create($data);
        $wa = preg_replace('/\D/', '', (string) SiteSetting::current()->whatsapp);

        $text = "Halo, saya ingin pesan servis (Order #{$order->id})\n"
            ."Nama: {$order->name}\n"
            .'Layanan: '.($order->service?->name ?? '-')."\n"
            ."Alat: {$order->device}\n"
            ."Keluhan: {$order->complaint}";

        return back()->with('wa_url', $wa ? "https://wa.me/{$wa}?text=".rawurlencode($text) : null);
    }
}
