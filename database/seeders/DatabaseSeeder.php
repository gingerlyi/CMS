<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Showcase;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = config('app.admin_password');
        if (! $password && app()->isProduction()) {
            throw new \RuntimeException('Set ADMIN_PASSWORD in .env before seeding production.');
        }

        User::firstOrCreate(['email' => config('app.admin_email')], [
            'name' => 'Admin',
            'password' => $password ?: 'password',
            'email_verified_at' => now(),
        ]);

        SiteSetting::firstOrCreate([], [
            'site_name' => 'Cover Multimedia Solution',
            'logo_path' => '/images/logo.webp',
            'primary_color' => '#9b111e',
            'secondary_color' => '#24303e',
            'whatsapp' => '6281234567890',
            'address' => 'Jl. Contoh No. 1, Jakarta',
            // Example point in central Jakarta; set the real one in Admin > Tampilan Situs.
            'latitude' => -6.1753924,
            'longitude' => 106.8271528,
            'hero_title' => 'Alat elektronik rusak? Kami perbaiki.',
            'hero_subtitle' => 'Teknisi berpengalaman untuk TV, AC, kulkas, mesin cuci, laptop dan HP. Bisa datang ke rumah.',
        ]);

        $services = [
            ['Servis TV', 'TV & Audio', 'LED, LCD, Smart TV: layar bergaris, mati total, tidak ada suara.', 75000],
            ['Servis AC', 'Pendingin', 'Cuci AC, isi freon, AC tidak dingin, bocor air.', 85000],
            ['Servis Kulkas', 'Pendingin', 'Kulkas tidak dingin, bunga es berlebih, kompresor mati.', 100000],
            ['Servis Mesin Cuci', 'Rumah Tangga', 'Tidak berputar, bocor, tidak mau buang air.', 90000],
            ['Servis Laptop', 'Komputer', 'Ganti LCD, keyboard, upgrade SSD, install ulang, mati total.', 50000],
            ['Servis HP', 'Gadget', 'Ganti layar, baterai, konektor charger, HP bootloop.', 50000],
        ];

        foreach ($services as $i => [$name, $category, $description, $price]) {
            Service::firstOrCreate(['name' => $name], [
                'category' => $category,
                'description' => $description,
                'price_from' => $price,
                'sort_order' => $i,
            ]);
        }

        // Example entries; replace with real repair photos from the admin "Galeri Hasil" page.
        $showcases = [
            ['#ServisTV', 'TV LED 43 Inci', 'Mati total jadi normal', 'Ganti modul power supply, diuji 24 jam sebelum diserahkan.', 'hasil-tv'],
            ['#ServisAC', 'AC Split 1 PK', 'Tidak dingin jadi sejuk', 'Isi ulang freon dan cuci evaporator, dingin kembali maksimal.', 'hasil-ac'],
            ['#ServisLaptop', 'Laptop Gaming', 'Overheat jadi stabil', 'Ganti thermal paste dan bersihkan kipas, suhu turun drastis.', 'scroll-laptop'],
            ['#ServisHP', 'Smartphone', 'Layar pecah jadi mulus', 'Ganti LCD, touchscreen kembali responsif.', 'hasil-hp'],
            ['#ServisKulkas', 'Kulkas 2 Pintu', 'Bunga es jadi normal', 'Perbaikan timer defrost dan thermostat.', 'hasil-kulkas'],
        ];

        foreach ($showcases as $i => [$tag, $title, $subtitle, $description, $photo]) {
            Showcase::firstOrCreate(['title' => $title], compact('tag', 'subtitle', 'description') + [
                'sort_order' => $i,
                'image_path' => "/images/dummy/{$photo}.jpg", // dummy photo, see public/images/dummy/CREDITS.txt
            ]);
        }
    }
}
