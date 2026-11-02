<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }

    public function test_dashboard_reflects_real_orders()
    {
        $this->actingAs(User::factory()->create());
        $service = Service::create(['name' => 'Servis TV', 'category' => 'TV']);

        // A visitor orders through the website form...
        $this->post('/orders', ['service_id' => $service->id, 'name' => 'Budi', 'phone' => '0812', 'device' => 'TV LG', 'complaint' => 'Mati']);

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('counts.baru', 1)
            ->where('daily.89.masuk', 1)
            ->where('topServices.0', ['label' => 'Servis TV', 'value' => 1])
            ->where('weekdays.'.(now()->dayOfWeekIso - 1), 1)
            ->where('newOrders.0.name', 'Budi')
            ->where('content.services', 1)
            ->etc());

        // ...and the admin finishes it.
        $this->put('/admin/orders/'.Order::first()->id, ['status' => 'selesai']);

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('counts.selesai', 1)
            ->missing('counts.baru')
            ->where('daily.89.selesai', 1)
            ->has('newOrders', 0)
            ->etc());
    }
}
