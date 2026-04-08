<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Qtela Singkong',
                'size' => '60g',
                'price' => 5500,
                'stock' => 15,
                'category' => 'Makanan Ringan',
                'accent1' => '#fff1ed',
                'accent2' => '#ffb387',
                'icon' => 'CHIPS',
            ],
            [
                'name' => 'Indomie Goreng',
                'size' => '85g',
                'price' => 3500,
                'stock' => 16,
                'category' => 'Makanan Ringan',
                'accent1' => '#eef9eb',
                'accent2' => '#83cc7d',
                'icon' => 'MIE',
            ],
            [
                'name' => 'Teh Botol Sosro',
                'size' => '450ml',
                'price' => 5000,
                'stock' => 22,
                'category' => 'Minuman',
                'accent1' => '#fff1e9',
                'accent2' => '#d26d43',
                'icon' => 'TEH',
            ],
            [
                'name' => 'Aqua Botol',
                'size' => '600ml',
                'price' => 4000,
                'stock' => 30,
                'category' => 'Minuman',
                'accent1' => '#e9f4ff',
                'accent2' => '#5ea9ff',
                'icon' => 'AIR',
            ],
            [
                'name' => 'Pulpen Faster',
                'size' => 'Biru',
                'price' => 4500,
                'stock' => 20,
                'category' => 'ATK',
                'accent1' => '#eef3ff',
                'accent2' => '#7e9bff',
                'icon' => 'PEN',
            ],
            [
                'name' => 'Bayfresh Lavender',
                'size' => '600ml',
                'price' => 18200,
                'stock' => 8,
                'category' => 'Kebersihan',
                'accent1' => '#f0fffb',
                'accent2' => '#4dc7b0',
                'icon' => 'CLEAN',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}

