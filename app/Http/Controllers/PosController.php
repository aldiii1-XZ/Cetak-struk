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
        $cart = Session::get('cart', []);
        $history = Session::get('transaction_history', []);
        $catalogCount = Product::count();
        $inStockCount = Product::where('stock', '>', 0)->count();
        $sessionRevenue = (int) collect($history)->sum(function (array $item) {
            if (isset($item['total_amount'])) {
                return (int) $item['total_amount'];
            }

            return (int) preg_replace('/\D/', '', (string) ($item['total'] ?? '0'));
        });
        $sessionTransactions = count($history);
        $paymentMix = collect($history)
            ->pluck('payment')
            ->filter()
            ->countBy()
            ->sortDesc();
        $categories = collect(['Semua'])
            ->merge(
                Product::query()
                    ->select('category')
                    ->distinct()
                    ->orderBy('category')
                    ->pluck('category')
            )
            ->values()
            ->all();

        $dashboard = [
            'catalog_count' => $catalogCount,
            'in_stock_count' => $inStockCount,
            'low_stock_count' => Product::whereBetween('stock', [1, 5])->count(),
            'out_of_stock_count' => Product::where('stock', 0)->count(),
            'active_cart_items' => collect($cart)->sum('qty'),
            'active_cart_lines' => count($cart),
            'session_transactions' => $sessionTransactions,
            'session_revenue' => $sessionRevenue,
            'average_ticket' => $sessionTransactions > 0 ? (int) round($sessionRevenue / $sessionTransactions) : 0,
            'stock_ready_percentage' => $catalogCount > 0 ? (int) round(($inStockCount / $catalogCount) * 100) : 100,
            'top_payment_method' => $paymentMix->keys()->first() ?? 'Belum ada',
        ];

        return view('pos', compact('categories', 'history', 'dashboard'));
    }

    public function apiProducts(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($search = trim((string) $request->get('search'))) {
            $query->where(function ($productQuery) use ($search) {
                $productQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = $request->get('category')) {
            if ($category !== 'Semua') {
                $query->where('category', $category);
            }
        }

        $products = $query
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
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
            'total_amount' => $totalAmount,
            'item_count' => collect($cart)->sum('qty'),
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

