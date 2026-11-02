<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // The bundled logo was replaced by a much smaller file; uploaded logos are left alone.
    public function up(): void
    {
        DB::table('site_settings')->where('logo_path', '/images/logo.png')->update(['logo_path' => '/images/logo.webp']);
    }

    public function down(): void
    {
        DB::table('site_settings')->where('logo_path', '/images/logo.webp')->update(['logo_path' => '/images/logo.png']);
    }
};
