<?php

use App\Http\Controllers\PosController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PosController::class, 'index'])->name('pos');

Route::controller(PosController::class)->prefix('pos')->name('pos.')->group(function () {
    Route::get('products', 'apiProducts');
    Route::post('cart/add', 'addToCart');
    Route::patch('cart/update', 'updateCart');
    Route::post('cart/clear', 'clearCart');
    Route::post('checkout', 'completeTransaction');
    Route::get('cart', 'cart');
}); 

Route::get('/legacy', function () {
    return view('legacy');
})->name('legacy');
