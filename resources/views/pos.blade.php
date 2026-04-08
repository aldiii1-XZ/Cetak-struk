@php
    $history = [];
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
            --panel: rgba(255, 255, 255, 0.78);
            --panel-strong: #ffffff;
            --soft: #eef6f0;
            --line: #d9e6dc;
            --text: #173025;
            --muted: #6d8376;
            --green: #1eb66a;
            --green-dark: #119156;
            --green-soft: #e8faf0;
            --blue: #4787ff;
            --orange: #d26d43;
            --danger: #d04d4d;
            --shadow: 0 25px 60px rgba(26, 79, 51, 0.12);
        }

        * {
            box-sizing: border-box;
        }

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

        button,
        input {
            font: inherit;
        }

        button {
            cursor: pointer;
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
            border: 1px solid rgba(255, 255, 255, 0.7);
            border-radius: 28px;
            backdrop-filter: blur(18px);
            box-shadow: var(--shadow);
        }

        .hero {
            padding: 24px 28px;
            display: grid;
            grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
            gap: 20px;
            align-items: center;
        }

        .hero-copy h1,
        .section-header h2,
        .receipt-header h2,
        .table-card h3,
        .mini-title {
            margin: 0;
        }

        .hero-copy p,
        .subtle {
            margin: 8px 0 0;
            color: var(--muted);
        }

        .eyebrow {
            margin: 0 0 8px;
            font-size: 0.8rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
            font-weight: 800;
        }

        .hero-side {
            display: grid;
            gap: 12px;
        }

        .badge-row,
        .quick-actions,
        .category-row,
        .summary-grid,
        .mini-metrics,
        .receipt-actions,
        .cart-status {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .pill,
        .chip,
        .action,
        .nav-badge,
        .ghost-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-weight: 700;
            border: 1px solid transparent;
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

        .metric-inline {
            display: grid;
            gap: 6px;
            padding: 16px 18px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid rgba(217, 230, 220, 0.9);
        }

        .metric-inline strong {
            font-size: 1.3rem;
        }

        .metric-inline span {
            color: var(--muted);
            font-size: 0.92rem;
        }

        .workspace {
            padding: 24px;
            display: grid;
            grid-template-columns: minmax(0, 1.55fr) minmax(360px, 0.85fr);
            gap: 24px;
        }

        .catalog,
        .sidebar {
            display: grid;
            gap: 18px;
            min-width: 0;
        }

        .toolbar,
        .section-header,
        .receipt-top,
        .history-item,
        .table-row,
        .catalog-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .toolbar {
            flex-wrap: wrap;
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
            flex: 1 1 420px;
        }

        .search-shell input {
            border: none;
            outline: none;
            background: transparent;
            width: 100%;
            color: var(--text);
        }

        .search-icon {
            font-size: 1.1rem;
            color: var(--muted);
        }

        .ghost-button {
            min-height: 38px;
            padding: 0 14px;
            background: transparent;
            color: var(--muted);
            border-color: var(--line);
        }

        .ghost-button[hidden] {
            display: none;
        }

        .action {
            min-height: 52px;
            padding: 0 18px;
            background: var(--panel-strong);
            color: var(--text);
            border-color: var(--line);
        }

        .action.green {
            background: var(--soft);
            color: var(--green-dark);
        }

        .action.dark {
            background: linear-gradient(135deg, #21372c, #173025);
            color: #fff;
            border-color: transparent;
        }

        .chip {
            min-height: 42px;
            padding: 0 16px;
            background: var(--panel-strong);
            border-color: var(--line);
            color: var(--text);
        }

        .chip.active,
        .chip[aria-pressed="true"] {
            background: var(--green);
            color: #fff;
            border-color: transparent;
        }

        .catalog-meta {
            flex-wrap: wrap;
            padding: 2px 2px 0;
        }

        .catalog-meta p {
            margin: 0;
            color: var(--muted);
        }

        .loading-text {
            padding: 10px 4px 0;
            color: var(--muted);
            font-size: 0.94rem;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
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
            transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 26px rgba(20, 62, 40, 0.08);
            border-color: rgba(17, 145, 86, 0.2);
        }

        .product-card.is-disabled {
            opacity: 0.68;
        }

        .visual {
            aspect-ratio: 1 / 1;
            border-radius: 20px;
            padding: 16px;
            display: grid;
            place-items: center;
            color: #173025;
            font-weight: 800;
            letter-spacing: 0.08em;
            border: 1px solid rgba(23, 48, 37, 0.08);
            box-shadow: inset 0 -20px 30px rgba(255, 255, 255, 0.28);
        }

        .product-card h3 {
            margin: 0;
            font-size: 1rem;
        }

        .product-card p {
            margin: 0;
        }

        .price-row,
        .muted-row,
        .summary-line,
        .stock-line {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: center;
        }

        .muted-row,
        .summary-line span:first-child,
        .history-item small,
        .table-row span,
        .stock-line {
            color: var(--muted);
        }

        .nav-badge {
            min-height: 28px;
            padding: 0 10px;
            background: var(--soft);
            color: var(--green-dark);
            font-size: 0.75rem;
        }

        .stock-line {
            font-size: 0.88rem;
        }

        .stock-line.low-stock {
            color: var(--orange);
        }

        .stock-line.out-stock {
            color: var(--danger);
        }

        .add-to-cart {
            min-height: 40px;
            padding: 0 16px;
            border-radius: 999px;
            border: none;
            background: var(--green-soft);
            color: var(--green-dark);
            font-weight: 800;
        }

        .add-to-cart:disabled {
            cursor: not-allowed;
            background: #f3f5f4;
            color: var(--muted);
        }

        .receipt-card,
        .metric-card,
        .history-card,
        .table-card {
            padding: 18px;
        }

        .metric-card {
            display: grid;
            gap: 8px;
        }

        .receipt-card {
            position: sticky;
            top: 24px;
            display: grid;
            gap: 16px;
        }

        .receipt-items,
        .history-list,
        .table-list {
            display: grid;
            gap: 12px;
        }

        .empty-state,
        .empty-cart {
            padding: 18px;
            border-radius: 20px;
            border: 1px dashed #c7d8cc;
            background: linear-gradient(180deg, #f8fbf8 0%, #f2f7f3 100%);
            color: var(--muted);
            text-align: center;
        }

        .empty-state strong,
        .empty-cart strong {
            display: block;
            margin-bottom: 6px;
            color: var(--text);
        }

        .receipt-item {
            padding: 14px;
            border-radius: 18px;
            background: var(--soft);
            display: grid;
            gap: 8px;
        }

        .receipt-item-controls,
        .payment-order-item,
        .payment-order-meta,
        .payment-order-footer,
        .discount-row,
        .qris-box,
        .qris-meta {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
        }

        .receipt-item-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
        }

        .qty-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: #fff;
        }

        .qty-button {
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 999px;
            background: var(--green-soft);
            color: var(--green-dark);
            font-weight: 800;
        }

        .qty-button.remove {
            background: #fff0f0;
            color: var(--danger);
        }

        .qty-value {
            min-width: 22px;
            text-align: center;
            font-weight: 800;
            color: var(--text);
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

        .summary-line.discount span:first-child,
        .summary-line.discount strong {
            color: var(--green-dark);
        }

        .history-item,
        .table-row {
            padding: 12px 14px;
            border-radius: 16px;
            background: #f8fbf8;
            border: 1px solid var(--line);
        }

        .history-item {
            align-items: flex-start;
        }

        .history-item div,
        .table-card,
        .receipt-header {
            display: grid;
            gap: 4px;
        }

        .table-card {
            gap: 14px;
        }

        .table-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
        }

        .checkout-button {
            min-height: 54px;
            width: 100%;
            border: none;
            border-radius: 18px;
            background: linear-gradient(135deg, var(--green), var(--green-dark));
            color: #fff;
            font-weight: 800;
            box-shadow: 0 18px 30px rgba(17, 145, 86, 0.18);
        }

        .checkout-button:disabled {
            cursor: not-allowed;
            box-shadow: none;
            background: #d5dfd8;
            color: #6e8075;
        }

        .checkout-note {
            margin: 0;
            text-align: center;
            color: var(--muted);
            font-size: 0.9rem;
        }

        .cart-count {
            min-width: 28px;
            min-height: 28px;
            padding: 0 8px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.18);
            color: #fff;
        }

        .toast {
            position: fixed;
            right: 20px;
            bottom: 20px;
            max-width: 320px;
            padding: 14px 16px;
            border-radius: 18px;
            background: #173025;
            color: #fff;
            box-shadow: 0 18px 30px rgba(0, 0, 0, 0.18);
            opacity: 0;
            transform: translateY(12px);
            pointer-events: none;
            transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        .product-skeleton {
            min-height: 280px;
            border-radius: 24px;
            background:
                linear-gradient(90deg, rgba(238, 246, 240, 0.7) 25%, rgba(255, 255, 255, 0.95) 50%, rgba(238, 246, 240, 0.7) 75%),
                #eef6f0;
            background-size: 220% 100%;
            animation: shimmer 1.2s infinite linear;
        }

        @keyframes shimmer {
            from {
                background-position: 200% 0;
            }

            to {
                background-position: -20% 0;
            }
        }

        .modal-shell {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            padding: 20px;
            background: rgba(17, 31, 24, 0.42);
            backdrop-filter: blur(8px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 30;
        }

        .modal-shell.show {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-card {
            width: min(100%, 980px);
            max-height: min(88vh, 920px);
            overflow: auto;
            background: #fff;
            border-radius: 30px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
            border: 1px solid rgba(217, 230, 220, 0.9);
            display: grid;
            gap: 18px;
            padding: 22px;
        }

        .modal-header,
        .payment-layout,
        .payment-summary-row,
        .payment-actions,
        .print-preview-head {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            align-items: center;
        }

        .modal-header {
            align-items: flex-start;
        }

        .icon-button {
            width: 42px;
            height: 42px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: #fff;
            color: var(--text);
            font-size: 1.1rem;
        }

        .payment-layout {
            align-items: stretch;
        }

        .payment-panel,
        .print-panel {
            flex: 1;
            min-width: 0;
            border: 1px solid var(--line);
            border-radius: 24px;
            padding: 18px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fbf8 100%);
            display: grid;
            gap: 16px;
        }

        .payment-panel {
            flex: 1.1;
        }

        .payment-order-list {
            display: grid;
            gap: 12px;
        }

        .payment-order-item {
            align-items: flex-start;
            padding: 14px;
            border-radius: 20px;
            background: #fff;
            border: 1px solid var(--line);
        }

        .payment-order-meta {
            align-items: flex-start;
            color: var(--muted);
            font-size: 0.92rem;
        }

        .payment-order-footer {
            align-items: center;
        }

        .payment-methods,
        .quick-amounts {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
        }

        .method-chip,
        .quick-amount {
            min-height: 52px;
            border-radius: 18px;
            border: 1px solid var(--line);
            background: #fff;
            color: var(--text);
            font-weight: 700;
        }

        .method-chip.active,
        .quick-amount.active {
            border-color: transparent;
            background: linear-gradient(135deg, var(--green), var(--green-dark));
            color: #fff;
        }

        .field-group {
            display: grid;
            gap: 8px;
        }

        .field-group label,
        .field-group span {
            color: var(--muted);
            font-size: 0.92rem;
        }

        .payment-input {
            min-height: 56px;
            border-radius: 18px;
            border: 1px solid var(--line);
            background: #fff;
            padding: 0 16px;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text);
        }

        .payment-input:focus {
            outline: 2px solid rgba(30, 182, 106, 0.18);
            border-color: rgba(17, 145, 86, 0.38);
        }

        .discount-input {
            text-transform: uppercase;
        }

        .helper-text,
        .payment-status {
            margin: 0;
            color: var(--muted);
            font-size: 0.92rem;
        }

        .payment-status.danger {
            color: var(--danger);
        }

        .payment-status.success {
            color: var(--green-dark);
        }

        .payment-summary {
            display: grid;
            gap: 12px;
            padding: 16px;
            border-radius: 20px;
            background: #f5faf6;
            border: 1px solid var(--line);
        }

        .payment-summary-row strong {
            font-size: 1rem;
        }

        .payment-summary-row.total {
            padding-top: 10px;
            border-top: 1px dashed #c6d7cb;
        }

        .secondary-button,
        .primary-button {
            min-height: 54px;
            border-radius: 18px;
            border: 1px solid var(--line);
            padding: 0 20px;
            font-weight: 800;
        }

        .secondary-button {
            background: #fff;
            color: var(--text);
        }

        .primary-button {
            border: none;
            background: linear-gradient(135deg, var(--green), var(--green-dark));
            color: #fff;
            box-shadow: 0 18px 30px rgba(17, 145, 86, 0.18);
        }

        .primary-button:disabled {
            cursor: not-allowed;
            box-shadow: none;
            background: #d5dfd8;
            color: #6e8075;
        }

        .print-preview {
            display: grid;
            gap: 14px;
            padding: 16px;
            border-radius: 22px;
            background: #fff;
            border: 1px dashed #cad9cd;
            font-family: "IBM Plex Mono", monospace;
        }

        .print-preview-items {
            display: grid;
            gap: 10px;
            font-size: 0.93rem;
        }

        .print-preview-item {
            display: grid;
            gap: 4px;
        }

        .print-preview-total {
            display: grid;
            gap: 6px;
            padding-top: 10px;
            border-top: 1px dashed #cad9cd;
            font-size: 0.92rem;
        }

        .qris-shell {
            display: grid;
            gap: 12px;
            padding: 16px;
            border-radius: 20px;
            background: linear-gradient(180deg, #eef7ff 0%, #f8fbff 100%);
            border: 1px solid #d8e6ff;
        }

        .qris-shell[hidden] {
            display: none;
        }

        .qris-box {
            align-items: flex-start;
        }

        .qris-code {
            width: 220px;
            max-width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 18px;
            border: 1px solid #d8e6ff;
            background: #fff;
            padding: 12px;
            object-fit: contain;
        }

        .qris-meta {
            flex-direction: column;
            align-items: flex-start;
            color: var(--muted);
            font-size: 0.92rem;
        }

        @media (max-width: 1100px) {
            .hero,
            .workspace {
                grid-template-columns: 1fr;
            }

            .receipt-card {
                position: static;
            }

            .payment-layout {
                flex-direction: column;
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
                align-items: stretch;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }

            .product-grid {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            }

            .action,
            .search-shell {
                width: 100%;
            }

            .toast {
                left: 14px;
                right: 14px;
                max-width: none;
            }

            .modal-shell {
                padding: 12px;
            }

            .modal-card {
                padding: 16px;
                border-radius: 24px;
            }

            .payment-methods,
            .quick-amounts {
                grid-template-columns: 1fr;
            }

            .payment-actions {
                flex-direction: column-reverse;
                align-items: stretch;
            }

            .secondary-button,
            .primary-button {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <section class="hero">
            <div class="hero-copy">
                <p class="eyebrow">Laravel POS Dashboard</p>
                <h1>Kasir Pintar untuk transaksi cepat, rapi, dan nyaman dipakai.</h1>
                <p>Tampilan dibuat lebih fokus untuk ritme kerja kasir: cari barang cepat, cek stok tanpa bingung, dan pantau transaksi aktif tanpa pindah perhatian terlalu jauh.</p>
            </div>
            <div class="hero-side">
                <div class="badge-row">
                    <span class="pill primary">Laravel 13</span>
                    <span class="pill">PHP 8.5</span>
                    <span class="pill">{{ now()->translatedFormat('d M Y') }}</span>
                </div>
                <div class="mini-metrics">
                    <div class="metric-inline">
                        <strong>128</strong>
                        <span>Transaksi hari ini</span>
                    </div>
                    <div class="metric-inline">
                        <strong>Rp 8.420.000</strong>
                        <span>Omzet shift berjalan</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="workspace">
            <div class="catalog">
                <div class="toolbar">
                    <label class="search-shell" for="searchInput">
                        <span class="search-icon">Cari</span>
                        <input type="text" id="searchInput" placeholder="Cari nama produk atau kategori..." autocomplete="off">
                        <button type="button" class="ghost-button" id="clearSearch" hidden>Reset</button>
                    </label>
                    <button class="action green" type="button">Scan barcode</button>
                    <button class="action dark" type="button">+ Produk baru</button>
                </div>

                <div class="section-header">
                    <div>
                        <p class="eyebrow">Katalog Produk</p>
                        <h2>Display menu kasir berbasis Blade</h2>
                        <p class="subtle">Pilih kategori, cari produk, lalu tambahkan ke transaksi aktif.</p>
                    </div>
                    <div class="quick-actions category-row" id="categories">
                        @foreach ($categories as $index => $category)
                            <button
                                type="button"
                                class="chip {{ $index === 0 ? 'active' : '' }}"
                                data-category="{{ $category }}"
                                aria-pressed="{{ $index === 0 ? 'true' : 'false' }}"
                            >
                                {{ $category }}
                            </button>
                        @endforeach
                    </div>
                </div>

                <div class="catalog-meta">
                    <p id="resultSummary">Memuat katalog produk...</p>
                    <p id="activeFilterLabel">Filter aktif: Semua</p>
                </div>

                <div id="loading" class="loading-text" aria-live="polite">
                    Menyiapkan katalog...
                </div>

                <div class="product-grid" id="productGrid" aria-live="polite"></div>

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
                            <p class="subtle">Kasir: Rani - Member: 998812</p>
                        </div>
                        <div class="cart-status">
                            <span class="pill primary">QRIS</span>
                            <span class="pill">Item <span class="cart-count">0</span></span>
                        </div>
                    </div>

                    <div class="receipt-items" id="receiptItems">
                        <div class="empty-cart" id="emptyCartState">
                            <strong>Keranjang masih kosong</strong>
                            Tambahkan produk dari katalog untuk mulai transaksi baru.
                        </div>
                    </div>

                    <div class="summary-box" id="summaryBox">
                        <div class="summary-line">
                            <span>Subtotal</span>
                            <strong>Rp 0</strong>
                        </div>
                        <div class="summary-line discount">
                            <span>Estimasi hemat</span>
                            <strong>Rp 0</strong>
                        </div>
                        <div class="summary-line total">
                            <span>Total</span>
                            <strong>Rp 0</strong>
                        </div>
                    </div>

                    <div class="receipt-actions">
                        <button type="button" class="checkout-button" id="checkoutButton" disabled>Proses pembayaran</button>
                    </div>
                    <p class="checkout-note" id="checkoutNote">Pilih minimal satu produk untuk mengaktifkan pembayaran.</p>
                </section>

                <section class="history-card">
                    <p class="eyebrow">Histori Terbaru</p>
                    <div class="history-list" id="historyList">
                        @forelse ($history as $item)
                            <div class="history-item">
                                <div>
                                    <strong>{{ $item['code'] }}</strong>
                                    <small>{{ $item['time'] }} - {{ $item['payment'] }}</small>
                                </div>
                                <strong>{{ $item['total'] }}</strong>
                            </div>
                        @empty
                            <div class="empty-cart">
                                <strong>Histori sudah direset</strong>
                                Belum ada transaksi terbaru yang ditampilkan.
                            </div>
                        @endforelse
                    </div>
                </section>
            </aside>
        </section>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <div class="modal-shell" id="paymentModal" aria-hidden="true">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="paymentModalTitle">
            <div class="modal-header">
                <div>
                    <p class="eyebrow">Pembayaran</p>
                    <h2 id="paymentModalTitle">Selesaikan transaksi aktif</h2>
                    <p class="subtle">Pilih metode bayar, cek nominal, lalu cetak struk bila transaksi selesai.</p>
                </div>
                <button type="button" class="icon-button" id="closePaymentModal" aria-label="Tutup modal">x</button>
            </div>

            <div class="payment-layout">
                <section class="payment-panel">
                    <div class="field-group">
                        <span>Pesanan aktif</span>
                        <div class="payment-order-list" id="paymentOrderList">
                            <div class="empty-cart">
                                <strong>Belum ada item</strong>
                                Tambahkan produk untuk melanjutkan ke pembayaran.
                            </div>
                        </div>
                    </div>

                    <div class="field-group">
                        <span>Metode pembayaran</span>
                        <div class="payment-methods" id="paymentMethods">
                            <button type="button" class="method-chip active" data-method="Tunai">Tunai</button>
                            <button type="button" class="method-chip" data-method="QRIS">QRIS</button>
                            <button type="button" class="method-chip" data-method="Kartu Debit">Kartu Debit</button>
                        </div>
                    </div>

                    <div class="payment-summary">
                        <div class="payment-summary-row">
                            <span>Total item</span>
                            <strong id="paymentItemCount">0 item</strong>
                        </div>
                        <div class="payment-summary-row">
                            <span>Subtotal</span>
                            <strong id="paymentSubtotal">Rp 0</strong>
                        </div>
                        <div class="payment-summary-row">
                            <span>Estimasi hemat</span>
                            <strong id="paymentDiscount">Rp 0</strong>
                        </div>
                        <div class="payment-summary-row total">
                            <span>Total bayar</span>
                            <strong id="paymentTotal">Rp 0</strong>
                        </div>
                    </div>

                    <div class="field-group">
                        <label for="discountInput">Diskon</label>
                        <input type="text" id="discountInput" class="payment-input discount-input" inputmode="text" placeholder="Contoh: 5000 atau 10%">
                        <p class="helper-text">Angka biasa otomatis jadi rupiah. Tambahkan simbol `%` untuk potongan persen.</p>
                    </div>

                    <div class="payment-summary">
                        <div class="payment-summary-row">
                            <span>Tipe diskon</span>
                            <strong id="discountTypeLabel">Belum ada</strong>
                        </div>
                        <div class="payment-summary-row">
                            <span>Potongan</span>
                            <strong id="discountAmountLabel">Rp 0</strong>
                        </div>
                    </div>

                    <div class="field-group">
                        <label for="paymentAmountInput">Nominal dibayar</label>
                        <input type="text" id="paymentAmountInput" class="payment-input" inputmode="numeric" placeholder="Masukkan nominal bayar">
                        <p class="helper-text">Untuk pembayaran non-tunai, gunakan nominal yang sama atau lebih besar dari total.</p>
                    </div>

                    <div class="field-group">
                        <span>Nominal cepat</span>
                        <div class="quick-amounts" id="quickAmounts">
                            <button type="button" class="quick-amount" data-amount="20000">20.000</button>
                            <button type="button" class="quick-amount" data-amount="50000">50.000</button>
                            <button type="button" class="quick-amount" data-amount="100000">100.000</button>
                        </div>
                    </div>

                    <div class="payment-summary">
                        <div class="payment-summary-row">
                            <span>Status pembayaran</span>
                            <strong id="paymentStatusLabel">Menunggu input</strong>
                        </div>
                        <div class="payment-summary-row">
                            <span>Kembalian</span>
                            <strong id="paymentChange">Rp 0</strong>
                        </div>
                    </div>
                    <p class="payment-status" id="paymentStatusMessage">Masukkan nominal bayar untuk menyelesaikan transaksi.</p>

                    <div class="qris-shell" id="qrisSection" hidden>
                        <div>
                            <p class="eyebrow">QRIS</p>
                            <h3 class="mini-title">Scan untuk bayar</h3>
                        </div>
                        <div class="qris-box">
                            <img id="qrisImage" class="qris-code" alt="Kode QRIS pembayaran">
                            <div class="qris-meta">
                                <strong id="qrisAmountLabel">Total Rp 0</strong>
                                <span id="qrisReferenceLabel">Ref: QRIS-POS</span>
                                <span>Tunjukkan kode ini ke pelanggan untuk dipindai dari e-wallet atau mobile banking.</span>
                            </div>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button type="button" class="secondary-button" id="printReceiptButton">Cetak struk</button>
                        <button type="button" class="primary-button" id="completePaymentButton" disabled>Selesaikan pembayaran</button>
                    </div>
                </section>

                <aside class="print-panel">
                    <div class="print-preview-head">
                        <div>
                            <p class="eyebrow">Preview Struk</p>
                            <h3 class="mini-title">Maju Jaya Mart</h3>
                        </div>
                        <span class="pill" id="previewPaymentMethod">Tunai</span>
                    </div>

                    <div class="print-preview" id="receiptPreview">
                        <div>
                            <strong id="previewReceiptCode">TRX-{{ now()->format('Ymd-His') }}</strong>
                            <div class="subtle" id="previewReceiptTime">{{ now()->translatedFormat('d M Y H:i') }}</div>
                        </div>
                        <div class="print-preview-items" id="receiptPreviewItems">
                            <div class="empty-cart">
                                <strong>Belum ada item</strong>
                                Tambahkan produk dulu untuk melihat struk.
                            </div>
                        </div>
                        <div class="print-preview-total" id="receiptPreviewTotal">
                            <div class="payment-summary-row">
                                <span>Total</span>
                                <strong>Rp 0</strong>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</body>
</html>
