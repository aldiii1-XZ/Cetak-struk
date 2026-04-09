<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_respect_search_and_category_filters_together(): void
    {
        Product::query()->create([
            'name' => 'Teh Botol Sosro',
            'size' => '450ml',
            'price' => 5000,
            'stock' => 10,
            'category' => 'Minuman',
            'accent1' => '#fff1e9',
            'accent2' => '#d26d43',
            'icon' => 'TEH',
        ]);

        Product::query()->create([
            'name' => 'Botol Semprot',
            'size' => '500ml',
            'price' => 12000,
            'stock' => 4,
            'category' => 'Kebersihan',
            'accent1' => '#f0fffb',
            'accent2' => '#4dc7b0',
            'icon' => 'CLEAN',
        ]);

        $response = $this->getJson('/pos/products?category=Minuman&search=Botol');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Teh Botol Sosro')
            ->assertJsonPath('0.category', 'Minuman');
    }

    public function test_dashboard_keeps_transaction_history_from_session(): void
    {
        $response = $this
            ->withSession([
                'transaction_history' => [
                    [
                        'code' => 'TRX-20260409-000001',
                        'time' => '09 Apr 2026 - 08:15',
                        'payment' => 'Tunai',
                        'total' => 'Rp 12.000',
                        'total_amount' => 12000,
                        'item_count' => 2,
                    ],
                ],
            ])
            ->get('/');

        $response
            ->assertOk()
            ->assertSee('TRX-20260409-000001')
            ->assertSee('Tunai')
            ->assertSee('2 item');
    }
}
