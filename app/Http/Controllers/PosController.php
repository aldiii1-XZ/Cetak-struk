<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class PosController extends Controller
{
    public function index(): View
    {
        $categories = ['Semua', 'Makanan Ringan', 'Minuman', 'ATK', 'Kebersihan'];
        
        return view('pos', compact('categories'));
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
            'total_items' => count($cart),
        ]);
    }

    public function cart(): JsonResponse
    {
        $cart = Session::get('cart', []);
        return response()->json($cart);
    }
}

