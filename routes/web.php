<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [App\Http\Controllers\PosController::class, 'index'])->name('pos');

Route::controller(PosController::class)->prefix('pos')->name('pos.')->group(function () {
    Route::get('products', 'apiProducts');
    Route::post('cart/add', 'addToCart');
    Route::get('cart', 'cart');
}); 

Route::get('/legacy', function () {
    return view('legacy');
})->name('legacy');
