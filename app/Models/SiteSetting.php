<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    /** Landing page texts editable from the admin; a blank value falls back to these. */
    public const CONTENT_DEFAULTS = [
        'marquee' => 'Bergaransi, Teknisi berpengalaman, Harga transparan',
        'scroll_label' => 'Kenali kami',
        'scroll_title' => 'Bengkel elektronik modern, teknisi berpengalaman',
        'tunnel_label' => 'Jejak Perbaikan',
        'tunnel_title' => 'Ratusan alat kembali hidup',
        'tunnel_text' => 'Gulir pelan-pelan dan lihat sebagian alat yang sudah kami tangani.',
        'showcase_label' => 'Hasil Perbaikan',
        'showcase_title' => 'Bukti kerja kami',
        'services_label' => 'Katalog Layanan',
        'services_title' => 'Apa yang bisa kami perbaiki?',
        'steps_label' => 'Cara Kerja',
        'steps_title' => 'Tiga langkah, alat kembali normal',
        'step1_title' => 'Pilih layanan',
        'step1_text' => 'Cari jenis servis sesuai alat elektronik Anda.',
        'step2_title' => 'Isi form & chat WA',
        'step2_text' => 'Ceritakan keluhannya, kami balas cepat lewat WhatsApp.',
        'step3_title' => 'Diperbaiki & bergaransi',
        'step3_text' => 'Teknisi kami perbaiki, harga transparan, ada garansi.',
        'order_label' => 'Pesan Servis',
        'order_title' => 'Ceritakan keluhannya, kami yang urus.',
        'order_text' => 'Setelah form dikirim, Anda langsung diarahkan ke WhatsApp kami dengan detail pesanan yang sudah terisi.',
        'location_label' => 'Lokasi Kami',
        'location_title' => 'Datang langsung ke bengkel kami',
        'location_text' => 'Klik titik merah di globe untuk melihat lokasi kami lebih dekat.',
        'map_zoom' => '16',
    ];

    protected $guarded = ['id'];

    protected $casts = ['latitude' => 'float', 'longitude' => 'float'];

    protected $appends = ['logo_url', 'scroll_image_url'];

    public static function current(): self
    {
        return static::firstOrCreate([], ['site_name' => config('app.name'), 'hero_title' => config('app.name')]);
    }

    public function getContentAttribute(?string $value): array
    {
        return array_merge(self::CONTENT_DEFAULTS, json_decode($value ?? '[]', true) ?: []);
    }

    public function setContentAttribute(array $value): void
    {
        $this->attributes['content'] = json_encode($value);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        // Paths starting with "/" are bundled files in public/, the rest are uploads.
        return str_starts_with($this->logo_path, '/') ? $this->logo_path : Storage::disk('public')->url($this->logo_path);
    }

    public function getScrollImageUrlAttribute(): string
    {
        if (! $this->scroll_image_path) {
            return '/images/dummy/scroll-laptop.jpg';
        }

        // Paths starting with "/" are bundled files in public/, the rest are uploads.
        return str_starts_with($this->scroll_image_path, '/') ? $this->scroll_image_path : Storage::disk('public')->url($this->scroll_image_path);
    }
}
