<?php

use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShowcaseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');
Route::post('orders', [LandingController::class, 'order'])->middleware('throttle:5,1')->name('orders.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('services', ServiceController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('showcases', ShowcaseController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('orders', OrderController::class)->only(['index', 'update', 'destroy']);
        Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
