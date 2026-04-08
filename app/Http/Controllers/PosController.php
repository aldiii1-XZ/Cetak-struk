<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class PosController extends Controller
{
    public function index(): View
    {
        $categories = ['Semua', 'Makanan Ringan', 'Minuman', 'ATK', 'Kebersihan'];
        $history = Session::get('transaction_history', []);

        return view('pos', compact('categories', 'history'));
    }

    public function apiProducts(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        if ($category = $request->get('category')) {
            if ($category !== 'Semua') {
                $query->where('category', $category);
            }
        }

        $products = $query->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'size' => $product->size,
                'price' => 'Rp ' . number_format($product->price, 0, ',', '.'),
                'price_value' => (int) $product->price,
                'stock' => $product->stock,
                'category' => $product->category,
                'accent' => [$product->accent1, $product->accent2],
                'icon' => $product->icon,
            ];
        });

        return response()->json($products);
    }

    public function addToCart(Request $request): JsonResponse
    {
        $productId = $request->input('product_id');
        $product = Product::findOrFail($productId);

        $cart = Session::get('cart', []);

        $cart[$productId] = [
            'name' => $product->name,
            'qty' => ($cart[$productId]['qty'] ?? 0) + 1,
            'price' => $product->price,
            'subtotal' => $product->price * (($cart[$productId]['qty'] ?? 0) + 1),
        ];

        Session::put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'total_items' => collect($cart)->sum('qty'),
        ]);
    }

    public function updateCart(Request $request): JsonResponse
    {
        $productId = $request->input('product_id');
        $qty = max((int) $request->input('qty', 0), 0);
        $cart = Session::get('cart', []);

        if (!isset($cart[$productId])) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan di keranjang.',
            ], 404);
        }

        if ($qty === 0) {
            unset($cart[$productId]);
        } else {
            $product = Product::findOrFail($productId);
            $cart[$productId]['qty'] = $qty;
            $cart[$productId]['price'] = $product->price;
            $cart[$productId]['subtotal'] = $product->price * $qty;
        }

        Session::put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'total_items' => collect($cart)->sum('qty'),
        ]);
    }

    public function clearCart(): JsonResponse
    {
        Session::forget('cart');

        return response()->json([
            'success' => true,
            'cart' => [],
            'total_items' => 0,
        ]);
    }

    public function completeTransaction(Request $request): JsonResponse
    {
        $cart = Session::get('cart', []);

        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang masih kosong.',
            ], 422);
        }

        $subtotal = collect($cart)->sum('subtotal');
        $discountAmount = min(max((int) $request->input('discount_amount', 0), 0), $subtotal);
        $totalAmount = max($subtotal - $discountAmount, 0);
        $paidAmount = max((int) $request->input('paid_amount', 0), 0);
        $paymentMethod = $request->input('payment_method', 'Tunai');
        $discountLabel = $request->input('discount_label', 'Belum ada');

        if ($paidAmount < $totalAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Nominal pembayaran belum mencukupi total transaksi.',
            ], 422);
        }

        $now = Carbon::now();
        $transactionCode = 'TRX-' . $now->format('Ymd-His');
        $history = Session::get('transaction_history', []);

        array_unshift($history, [
            'code' => $transactionCode,
            'time' => $now->translatedFormat('d M Y - H:i'),
            'payment' => $paymentMethod,
            'total' => 'Rp ' . number_format($totalAmount, 0, ',', '.'),
        ]);

        $history = array_slice($history, 0, 10);

        Session::put('transaction_history', $history);
        Session::forget('cart');

        return response()->json([
            'success' => true,
            'cart' => [],
            'total_items' => 0,
            'history' => $history,
            'transaction' => [
                'code' => $transactionCode,
                'time' => $now->translatedFormat('d M Y H:i'),
                'payment_method' => $paymentMethod,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'discount_label' => $discountLabel,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => max($paidAmount - $totalAmount, 0),
                'items' => collect($cart)->values()->all(),
            ],
        ]);
    }

    public function cart(): JsonResponse
    {
        $cart = Session::get('cart', []);

        return response()->json([
            'cart' => $cart,
            'total_items' => collect($cart)->sum('qty'),
        ]);
    }
}

