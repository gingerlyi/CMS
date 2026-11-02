<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name');
            $table->string('tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('primary_color', 7)->default('#9b111e');
            $table->string('secondary_color', 7)->default('#24303e');
            $table->string('whatsapp', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('hero_title');
            $table->text('hero_subtitle')->nullable();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->unsignedInteger('price_from')->default(0);
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('phone', 20);
            $table->string('device');
            $table->text('complaint');
            $table->enum('status', ['baru', 'diproses', 'selesai', 'batal'])->default('baru');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('services');
        Schema::dropIfExists('site_settings');
    }
};
