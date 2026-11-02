<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Service;
use App\Models\Showcase;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $recent = Order::where('created_at', '>=', now()->subDays(89)->startOfDay())->get(['service_id', 'status', 'created_at', 'updated_at']);
        $serviceNames = Service::pluck('name', 'id');

        $created = $recent->countBy(fn (Order $o) => $o->created_at->toDateString());
        // ponytail: "completed on" = last update of an order now marked selesai; add a completed_at column if this needs to be exact.
        $completed = $recent->where('status', 'selesai')->countBy(fn (Order $o) => $o->updated_at->toDateString());

        $byService = $recent->countBy(fn (Order $o) => $serviceNames[$o->service_id] ?? 'Lainnya')->sortDesc();
        $topServices = $byService->take(4)->map(fn ($value, $label) => compact('label', 'value'))->values();
        if ($byService->count() > 4) {
            $topServices->push(['label' => 'Lainnya', 'value' => $byService->skip(4)->sum()]);
        }

        $weekdays = $recent->countBy(fn (Order $o) => $o->created_at->dayOfWeekIso);

        return Inertia::render('dashboard', [
            'daily' => collect(range(89, 0))->map(function (int $ago) use ($created, $completed) {
                $date = now()->subDays($ago)->toDateString();

                return ['date' => $date, 'masuk' => $created[$date] ?? 0, 'selesai' => $completed[$date] ?? 0];
            }),
            'counts' => Order::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'topServices' => $topServices,
            'weekdays' => collect(range(1, 7))->map(fn (int $d) => $weekdays[$d] ?? 0),
            'newOrders' => Order::with('service:id,name')->where('status', 'baru')->latest()->take(3)->get(),
            'latest' => Order::with('service:id,name')->latest()->take(5)->get(),
            'content' => [
                'services' => Service::where('is_active', true)->count(),
                'showcases' => Showcase::where('is_active', true)->count(),
            ],
        ]);
    }
}
