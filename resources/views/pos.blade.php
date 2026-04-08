@php
    $categories = ['Semua', 'Makanan Ringan', 'Minuman', 'ATK', 'Kebersihan'];
    $history = [
        ['code' => 'TRX-20260409-001', 'time' => '09 Apr 2026 • 09:12', 'payment' => 'QRIS', 'total' => 'Rp 42.500'],
        ['code' => 'TRX-20260409-002', 'time' => '09 Apr 2026 • 09:28', 'payment' => 'Tunai', 'total' => 'Rp 18.000'],
        ['code' => 'TRX-20260409-003', 'time' => '09 Apr 2026 • 09:41', 'payment' => 'Kartu Debit', 'total' => 'Rp 76.200'],
    ];
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kasir Pintar Laravel</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/pos.js'])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #dce9df;
            --panel: rgba(255,255,255,0.78);
            --panel-strong: #ffffff;
            --soft: #eef6f0;
            --line: #d9e6dc;
            --text: #173025;
            --muted: #7e9487;
            --green: #1eb66a;
            --green-dark: #119156;
            --blue: #4787ff;
            --orange: #d26d43;
            --shadow: 0 25px 60px rgba(26, 79, 51, 0.12);
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Plus Jakarta Sans", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at top left, rgba(30, 182, 106, 0.15), transparent 24%),
                radial-gradient(circle at right, rgba(71, 135, 255, 0.12), transparent 18%),
                linear-gradient(180deg, #eaf2ec 0%, var(--bg) 100%);
        }

        .page {
            padding: 24px;
            display: grid;
            gap: 24px;
        }

        .hero,
        .workspace,
        .panel {
            background: var(--panel);
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 28px;
            backdrop-filter: blur(18px);
            box-shadow: var(--shadow);
        }

        .hero {
            padding: 24px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
        }

        .hero h1,
        .section-header h2,
        .receipt-header h2,
        .table-card h3,
        .mini-title {
            margin: 0;
        }

        .eyebrow {
            margin: 0 0 8px;
            font-size: 0.8rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
            font-weight: 800;
        }

        .hero p,
        .subtle {
            margin: 8px 0 0;
            color: var(--muted);
        }

        .badge-row,
        .quick-actions,
        .category-row,
        .summary-grid,
        .mini-metrics {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .pill,
        .chip,
        .action,
        .nav-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-weight: 700;
        }

        .pill {
            min-height: 42px;
            padding: 0 18px;
            background: var(--soft);
            color: var(--green-dark);
        }

        .pill.primary {
            background: linear-gradient(135deg, var(--green), var(--green-dark));
            color: #fff;
        }

        .workspace {
            padding: 24px;
            display: grid;
            grid-template-columns: minmax(0, 1.55fr) minmax(360px, 0.85fr);
            gap: 24px;
        }

        .catalog {
            display: grid;
            gap: 18px;
        }

        .toolbar,
        .section-header,
        .receipt-top,
        .history-item,
        .table-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .search-shell {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 60px;
            padding: 0 18px;
            border-radius: 20px;
            border: 1px solid var(--line);
            background: var(--panel-strong);
            flex: 1;
        }

        .search-shell input {
            border: none;
            outline: none;
            background: transparent;
            width: 100%;
            font: inherit;
            color: var(--text);
        }

        .action {
            min-height: 52px;
            padding: 0 18px;
            border: none;
            background: var(--panel-strong);
            color: var(--text);
            cursor: pointer;
        }

        .action.green {
            background: var(--soft);
            color: var(--green-dark);
        }

        .action.dark {
            background: linear-gradient(135deg, #21372c, #173025);
            color: #fff;
        }

        .chip {
            min-height: 42px;
            padding: 0 16px;
            background: var(--panel-strong);
            border: 1px solid var(--line);
            color: var(--text);
        }

        .chip.active {
            background: var(--green);
            color: #fff;
            border-color: transparent;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
        }

        .product-card,
        .metric-card,
        .history-card,
        .table-card,
        .receipt-card {
            background: var(--panel-strong);
            border: 1px solid var(--line);
            border-radius: 24px;
        }

        .product-card {
            padding: 14px;
            display: grid;
            gap: 14px;
            transition: transform .18s ease, box-shadow .18s ease;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 26px rgba(20, 62, 40, 0.08);
        }

        .visual {
            aspect-ratio: 1 / 1;
            border-radius: 20px;
            padding: 16px;
            display: grid;
            place-items: center;
            color: #173025;
            font-weight: 800;
            letter-spacing: .08em;
            border: 1px solid rgba(23, 48, 37, 0.08);
            box-shadow: inset 0 -20px 30px rgba(255,255,255,0.28);
        }

        .product-card h3 {
            margin: 0;
            font-size: 1rem;
        }

        .price-row,
        .muted-row,
        .summary-line {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: center;
        }

        .muted-row,
        .summary-line span:first-child,
        .history-item small,
        .table-row span {
            color: var(--muted);
        }

        .nav-badge {
            min-height: 28px;
            padding: 0 10px;
            background: var(--soft);
            color: var(--green-dark);
            font-size: .75rem;
        }

        .sidebar {
            display: grid;
            gap: 16px;
        }

        .receipt-card,
        .metric-card,
        .history-card,
        .table-card {
            padding: 18px;
        }

        .receipt-items,
        .history-list,
        .table-list {
            display: grid;
            gap: 12px;
        }

        .receipt-item {
            padding: 14px;
            border-radius: 18px;
            background: var(--soft);
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }

        .metric-card strong,
        .summary-line strong,
        .receipt-item strong,
        .table-row strong {
            font-size: 1rem;
        }

        .summary-box {
            padding: 16px;
            border-radius: 20px;
            background: #f7faf8;
            border: 1px solid var(--line);
            display: grid;
            gap: 10px;
        }

        .summary-line.total {
            padding-top: 10px;
            border-top: 1px dashed #c6d7cb;
            font-size: 1.05rem;
        }

        .history-item,
        .table-row {
            padding: 12px 14px;
            border-radius: 16px;
            background: #f8fbf8;
            border: 1px solid var(--line);
        }

        .table-card {
            display: grid;
            gap: 14px;
        }

        .table-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
        }

        @media (max-width: 1100px) {
            .workspace {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 720px) {
            .page {
                padding: 14px;
            }

            .hero,
            .toolbar,
            .section-header,
            .receipt-top,
            .table-head {
                flex-direction: column;
                align-items: stretch;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <section class="hero">
            <div>
                <p class="eyebrow">Laravel POS Dashboard</p>
                <h1>Kasir Pintar untuk minimarket modern</h1>
                <p>Versi Laravel ini siap dijadikan pondasi untuk autentikasi, database transaksi, manajemen produk, dan laporan penjualan.</p>
            </div>
            <div class="badge-row">
                <span class="pill primary">Laravel 13</span>
                <span class="pill">PHP 8.5</span>
                <span class="pill">{{ now()->translatedFormat('d M Y') }}</span>
            </div>
        </section>

        <section class="workspace">
            <div class="catalog">
                <div class="toolbar">
                    <div class="search-shell">
                        <span>⌕</span>
                        <input type="text" id="searchInput" placeholder="Cari nama, barcode, atau SKU..." value="">
                    </div>
                    <button class="action green">Scan barcode</button>
                    <button class="action dark">+ Produk baru</button>
                </div>

                <div class="section-header">
                    <div>
                        <p class="eyebrow">Katalog Produk</p>
                        <h2>Display menu kasir berbasis Blade</h2>
                    </div>
                    <div class="quick-actions category-row" id="categories">
                        @foreach ($categories as $index => $category)
                            <span class="chip {{ $index === 0 ? 'active' : '' }}" data-category="{{ $category }}">{{ $category }}</span>
                        @endforeach
                    </div>
                </div>

                <div class="product-grid" id="productGrid">
                </div>
                <div id="loading" style="display: none; text-align: center; padding: 20px;">
                    <span>Loading produk...</span>
                </div>
                </div>

                <div class="table-card">
                    <div class="table-head">
                        <div>
                            <p class="eyebrow">Ringkasan Operasional</p>
                            <h3>Status shift kasir</h3>
                        </div>
                        <span class="pill">Shift pagi aktif</span>
                    </div>
                    <div class="table-list">
                        <div class="table-row">
                            <span>Kasir aktif</span>
                            <strong>Rani Putri</strong>
                        </div>
                        <div class="table-row">
                            <span>Nomor terminal</span>
                            <strong>POS-01</strong>
                        </div>
                        <div class="table-row">
                            <span>Printer struk</span>
                            <strong>Thermal 80mm</strong>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="sidebar">
                <div class="summary-grid">
                    <article class="metric-card">
                        <p class="eyebrow">Transaksi Hari Ini</p>
                        <strong>128</strong>
                        <p class="subtle">Naik 14% dari kemarin</p>
                    </article>
                    <article class="metric-card">
                        <p class="eyebrow">Omzet</p>
                        <strong>Rp 8.420.000</strong>
                        <p class="subtle">Target harian 84%</p>
                    </article>
                </div>

                <section class="receipt-card">
                    <div class="receipt-top">
                        <div class="receipt-header">
                            <p class="eyebrow">Transaksi Aktif</p>
                            <h2>Maju Jaya Mart</h2>
                            <p class="subtle">Kasir: Rani • Member: 998812</p>
                        </div>
                        <span class="pill primary">QRIS</span>
                    </div>

                    <div class="receipt-items" id="receiptItems">
                    </div>

                    <div class="summary-box" id="summaryBox">
                        <div class="summary-line">
                            <span>Subtotal</span>
                            <strong>Rp 0</strong>
                        </div>
                        <div class="summary-line total">
                            <span>Total</span>
                            <strong>Rp 0</strong>
                        </div>
                    </div>
                </section>

                <section class="history-card">
                    <p class="eyebrow">Histori Terbaru</p>
                    <div class="history-list">
                        @foreach ($history as $item)
                            <div class="history-item">
                                <div>
                                    <strong>{{ $item['code'] }}</strong>
                                    <small>{{ $item['time'] }} • {{ $item['payment'] }}</small>
                                </div>
                                <strong>{{ $item['total'] }}</strong>
                            </div>
                        @endforeach
                    </div>
                </section>
            </aside>
        </section>
    </div>
</body>
</html>
