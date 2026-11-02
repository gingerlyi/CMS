<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        return Inertia::render('admin/orders', [
            'orders' => Order::with('service:id,name')
                ->when(in_array($status, Order::STATUSES), fn ($q) => $q->where('status', $status))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'status' => $status,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $order->update($request->validate(['status' => ['required', Rule::in(Order::STATUSES)]]));

        return back();
    }

    public function destroy(Order $order): RedirectResponse
    {
        $order->delete();

        return back();
    }
}
