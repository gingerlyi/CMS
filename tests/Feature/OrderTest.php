<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_order_is_saved_and_redirects_with_whatsapp_link()
    {
        SiteSetting::current()->update(['whatsapp' => '+62 812-3456']);
        $service = Service::create(['name' => 'Servis TV', 'category' => 'TV']);

        $this->post('/orders', [
            'service_id' => $service->id,
            'name' => 'Budi',
            'phone' => '0812',
            'device' => 'TV LG',
            'complaint' => 'Mati total',
        ])->assertRedirect()->assertSessionHas('wa_url', fn ($url) => str_starts_with($url, 'https://wa.me/628123456?text=') && str_contains($url, 'Servis%20TV'));

        $this->assertDatabaseHas('orders', ['name' => 'Budi', 'service_id' => $service->id, 'status' => 'baru']);
    }

    public function test_order_requires_fields()
    {
        $this->post('/orders', [])->assertSessionHasErrors(['name', 'phone', 'device', 'complaint']);
    }

    public function test_admin_pages_require_login()
    {
        foreach (['/admin/services', '/admin/showcases', '/admin/orders', '/admin/settings'] as $url) {
            $this->get($url)->assertRedirect('/login');
        }
    }

    public function test_admin_can_open_admin_pages_and_update_settings()
    {
        $this->actingAs(User::factory()->create());

        foreach (['/', '/admin/services', '/admin/showcases', '/admin/orders', '/admin/settings'] as $url) {
            $this->get($url)->assertOk();
        }

        $this->post('/admin/settings', [
            'site_name' => 'Toko Servis',
            'primary_color' => '#112233',
            'secondary_color' => '#445566',
            'hero_title' => 'Halo',
            'content' => ['services_title' => 'Layanan kami', 'steps_title' => '', 'unknown_key' => 'x'],
        ])->assertSessionHasNoErrors();

        $settings = SiteSetting::current();
        $this->assertSame('#112233', $settings->primary_color);
        $this->assertSame('Layanan kami', $settings->content['services_title']);
        // A blank field falls back to the default text, unknown keys are ignored.
        $this->assertSame(SiteSetting::CONTENT_DEFAULTS['steps_title'], $settings->content['steps_title']);
        $this->assertArrayNotHasKey('unknown_key', $settings->content);

        $valid = ['site_name' => 'Toko', 'primary_color' => '#112233', 'secondary_color' => '#445566', 'hero_title' => 'Halo'];
        $this->post('/admin/settings', $valid + ['latitude' => '-6.2', 'longitude' => '106.8'])->assertSessionHasNoErrors();
        $this->assertSame(-6.2, SiteSetting::current()->latitude);
        $this->post('/admin/settings', $valid + ['latitude' => '95', 'longitude' => '106.8'])->assertSessionHasErrors('latitude');
        $this->post('/admin/settings', $valid + ['latitude' => '-6.2', 'longitude' => ''])->assertSessionHasErrors('longitude');
    }
}
