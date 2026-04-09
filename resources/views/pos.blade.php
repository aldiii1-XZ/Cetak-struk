@php
    $sessionRevenue = number_format($dashboard['session_revenue'], 0, ',', '.');
    $averageTicket = number_format($dashboard['average_ticket'], 0, ',', '.');
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
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="pos-body">
    <div class="pos-page">
        <header class="hero-surface">
            <div class="hero-main">
                <div class="hero-eyebrow-row">
                    <span class="eyebrow-badge">Retail Workspace</span>
                    <span class="hero-hint">Shortcut `/` untuk fokus ke pencarian</span>
                </div>
                <h1>UI kasir yang lebih profesional, fokus, dan siap dipakai saat shift sedang padat.</h1>
                <p class="hero-copy">
                    Halaman ini dirapikan agar kasir lebih cepat menemukan produk, membaca total belanja, dan menyelesaikan pembayaran tanpa terdistraksi oleh elemen demo yang tidak berguna.
                </p>

                <div class="hero-highlights">
                    <article class="hero-highlight">
                        <span class="mini-label">Keranjang aktif</span>
                        <strong>{{ $dashboard['active_cart_items'] }} item</strong>
                        <p>Jumlah item transaksi yang sedang berjalan di sesi ini.</p>
                    </article>
                    <article class="hero-highlight">
                        <span class="mini-label">Low stock</span>
                        <strong>{{ $dashboard['low_stock_count'] }} produk</strong>
                        <p>Produk dengan stok tipis langsung terlihat dari panel katalog.</p>
                    </article>
                    <article class="hero-highlight">
                        <span class="mini-label">Rata-rata tiket</span>
                        <strong>Rp {{ $averageTicket }}</strong>
                        <p>Dihitung dari histori transaksi sesi yang tersimpan.</p>
                    </article>
                </div>
            </div>

            <div class="hero-side">
                <article class="hero-side-card emphasis">
                    <span class="mini-label">Ringkasan sesi</span>
                    <strong>{{ $dashboard['session_transactions'] }} transaksi tersimpan</strong>
                    <p>
                        @if ($dashboard['session_transactions'] > 0)
                            Omzet sesi saat ini Rp {{ $sessionRevenue }} dengan histori yang tetap terlihat di dashboard.
                        @else
                            Belum ada transaksi tersimpan. Begitu pembayaran selesai, histori akan langsung muncul di bawah.
                        @endif
                    </p>
                </article>

                <div class="hero-side-grid">
                    <article class="hero-side-card">
                        <span class="mini-label">Metode dominan</span>
                        <strong>{{ $dashboard['top_payment_method'] }}</strong>
                        <p>Preferensi pembayaran terbaca otomatis dari transaksi sesi.</p>
                    </article>
                    <article class="hero-side-card">
                        <span class="mini-label">Kesiapan stok</span>
                        <strong>{{ $dashboard['stock_ready_percentage'] }}%</strong>
                        <p>{{ $dashboard['in_stock_count'] }} dari {{ $dashboard['catalog_count'] }} produk siap dijual.</p>
                    </article>
                </div>
            </div>
        </header>

        <section class="overview-grid" aria-label="Ringkasan dashboard">
            <article class="overview-card">
                <p class="eyebrow">Katalog</p>
                <strong>{{ $dashboard['catalog_count'] }}</strong>
                <p class="overview-copy">Produk aktif yang siap ditampilkan ke kasir.</p>
            </article>
            <article class="overview-card">
                <p class="eyebrow">Stok Aman</p>
                <strong>{{ $dashboard['in_stock_count'] }}</strong>
                <p class="overview-copy">Produk masih tersedia dan bisa langsung dijual.</p>
            </article>
            <article class="overview-card">
                <p class="eyebrow">Stok Habis</p>
                <strong>{{ $dashboard['out_of_stock_count'] }}</strong>
                <p class="overview-copy">Perlu restok agar tidak muncul sebagai bottleneck.</p>
            </article>
            <article class="overview-card">
                <p class="eyebrow">Omzet Sesi</p>
                <strong>Rp {{ $sessionRevenue }}</strong>
                <p class="overview-copy">Diambil dari transaksi yang benar-benar tersimpan di session.</p>
            </article>
        </section>

        <div class="workspace-grid">
            <section class="panel-surface catalog-panel">
                <div class="section-head">
                    <div>
                        <p class="eyebrow">Katalog Produk</p>
                        <h2>Temukan produk lebih cepat saat antrean sedang ramai</h2>
                        <p class="subtle">Cari dengan keyboard, filter kategori, lalu tambahkan item tanpa pindah halaman.</p>
                    </div>
                    <div class="panel-tags">
                        <span class="panel-tag">Live dari database</span>
                        <span class="panel-tag panel-tag-muted">Gunakan `Esc` untuk menutup modal</span>
                    </div>
                </div>

                <div class="toolbar">
                    <label class="search-shell" for="searchInput">
                        <span class="search-icon">Cari</span>
                        <input type="text" id="searchInput" placeholder="Cari nama produk atau kategori..." autocomplete="off">
                        <button type="button" class="ghost-button" id="clearSearch" hidden>Reset</button>
                    </label>
                    <div class="toolbar-notes" aria-hidden="true">
                        <span class="toolbar-note">Shortcut `/`</span>
                        <span class="toolbar-note">Pencarian instan</span>
                    </div>
                </div>

                <div class="category-row" id="categories">
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

                <div class="catalog-insights">
                    <article class="insight-card">
                        <span class="mini-label">Total produk</span>
                        <strong>{{ $dashboard['catalog_count'] }}</strong>
                        <p>Semua item aktif bisa langsung dicari dari kolom pencarian.</p>
                    </article>
                    <article class="insight-card">
                        <span class="mini-label">Peringatan stok</span>
                        <strong>{{ $dashboard['low_stock_count'] + $dashboard['out_of_stock_count'] }}</strong>
                        <p>Low stock dan out of stock ditandai jelas pada setiap kartu produk.</p>
                    </article>
                    <article class="insight-card">
                        <span class="mini-label">Filter default</span>
                        <strong>Semua</strong>
                        <p>Kasir bisa mulai dari keseluruhan katalog lalu mempersempit pilihan.</p>
                    </article>
                </div>

                <div class="catalog-meta">
                    <p id="resultSummary">Memuat katalog produk...</p>
                    <p id="activeFilterLabel">Filter aktif: Semua</p>
                </div>

                <div id="loading" class="loading-text" aria-live="polite">
                    Menyiapkan katalog...
                </div>

                <div class="product-grid" id="productGrid" aria-live="polite"></div>
            </section>

            <aside class="panel-surface order-panel">
                <div class="order-head">
                    <div class="receipt-header">
                        <p class="eyebrow">Transaksi Aktif</p>
                        <h2>Maju Jaya Mart</h2>
                        <p class="subtle">Panel ini difokuskan untuk review item, total, dan pembayaran agar kasir tidak kehilangan konteks.</p>
                    </div>
                    <div class="cart-status">
                        <span class="pill primary">Tunai</span>
                        <span class="pill">Item <span class="cart-count">0</span></span>
                    </div>
                </div>

                <div class="workflow-strip" aria-hidden="true">
                    <div class="workflow-step active">1. Pilih</div>
                    <div class="workflow-step">2. Review</div>
                    <div class="workflow-step">3. Bayar</div>
                </div>

                <div class="checkout-spotlight">
                    <div>
                        <span class="mini-label">Status checkout</span>
                        <strong id="checkoutStateHeadline">Menunggu item pertama</strong>
                        <p class="checkout-note" id="checkoutNote">Pilih minimal satu produk untuk mengaktifkan pembayaran.</p>
                    </div>
                    <button type="button" class="secondary-button subtle-button" id="clearCartButton" hidden>Kosongkan</button>
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
                        <span>Diskon</span>
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
            </aside>
        </div>

        <section class="support-grid">
            <article class="panel-surface ops-panel">
                <div class="section-head slim">
                    <div>
                        <p class="eyebrow">Operasional Shift</p>
                        <h2>Informasi kerja yang relevan tetap dekat</h2>
                    </div>
                    <span class="panel-tag">Terminal siap</span>
                </div>

                <div class="ops-grid">
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
                    <div class="table-row">
                        <span>Rata-rata transaksi</span>
                        <strong>Rp {{ $averageTicket }}</strong>
                    </div>
                </div>
            </article>

            <section class="panel-surface history-card">
                <div class="section-head slim">
                    <div>
                        <p class="eyebrow">Histori Sesi</p>
                        <h2>Transaksi terakhir langsung terlihat</h2>
                    </div>
                    <span class="panel-tag">{{ $dashboard['session_transactions'] }} tersimpan</span>
                </div>

                <div class="history-list" id="historyList">
                    @forelse ($history as $item)
                        <div class="history-item">
                            <div>
                                <strong>{{ $item['code'] }}</strong>
                                <small>{{ $item['time'] }} - {{ $item['payment'] }}@if(isset($item['item_count'])) - {{ $item['item_count'] }} item @endif</small>
                            </div>
                            <strong>{{ $item['total'] }}</strong>
                        </div>
                    @empty
                        <div class="empty-cart">
                            <strong>Belum ada histori sesi</strong>
                            Selesaikan pembayaran pertama untuk mulai membangun histori transaksi.
                        </div>
                    @endforelse
                </div>
            </section>
        </section>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <div class="modal-shell" id="paymentModal" aria-hidden="true">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="paymentModalTitle">
            <div class="modal-header">
                <div>
                    <p class="eyebrow">Pembayaran</p>
                    <h2 id="paymentModalTitle">Selesaikan transaksi aktif</h2>
                    <p class="subtle">Pilih metode bayar, cek nominal, lalu cetak struk jika transaksi sudah valid.</p>
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
                        <p class="helper-text">Angka biasa dibaca sebagai rupiah. Tambahkan simbol `%` untuk diskon persentase.</p>
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
                        <p class="helper-text">Untuk non-tunai, nominal awal otomatis disetarakan dengan total transaksi.</p>
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
