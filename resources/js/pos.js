document.addEventListener('DOMContentLoaded', function () {
    let currentCategory = 'Semua';
    let searchTerm = '';
    let searchTimer = null;
    let toastTimer = null;
    let currentCart = {};
    let paymentMethod = 'Tunai';
    let lastFocusedElement = null;

    const searchInput = document.getElementById('searchInput');
    const clearSearchButton = document.getElementById('clearSearch');
    const categoryChips = document.querySelectorAll('.chip[data-category]');
    const productGrid = document.getElementById('productGrid');
    const loading = document.getElementById('loading');
    const resultSummary = document.getElementById('resultSummary');
    const activeFilterLabel = document.getElementById('activeFilterLabel');
    const receiptItems = document.getElementById('receiptItems');
    const summaryBox = document.getElementById('summaryBox');
    const cartBadge = document.querySelector('.cart-count');
    const checkoutButton = document.getElementById('checkoutButton');
    const checkoutNote = document.getElementById('checkoutNote');
    const checkoutStateHeadline = document.getElementById('checkoutStateHeadline');
    const clearCartButton = document.getElementById('clearCartButton');
    const historyList = document.getElementById('historyList');
    const toast = document.getElementById('toast');
    const sidebarPaymentBadge = document.querySelector('.cart-status .pill.primary');

    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModalButton = document.getElementById('closePaymentModal');
    const paymentMethodButtons = document.querySelectorAll('.method-chip');
    const paymentOrderList = document.getElementById('paymentOrderList');
    const discountInput = document.getElementById('discountInput');
    const discountTypeLabel = document.getElementById('discountTypeLabel');
    const discountAmountLabel = document.getElementById('discountAmountLabel');
    const paymentAmountInput = document.getElementById('paymentAmountInput');
    const quickAmountButtons = document.querySelectorAll('.quick-amount');
    const paymentItemCount = document.getElementById('paymentItemCount');
    const paymentSubtotal = document.getElementById('paymentSubtotal');
    const paymentDiscount = document.getElementById('paymentDiscount');
    const paymentTotal = document.getElementById('paymentTotal');
    const paymentChange = document.getElementById('paymentChange');
    const paymentStatusLabel = document.getElementById('paymentStatusLabel');
    const paymentStatusMessage = document.getElementById('paymentStatusMessage');
    const previewPaymentMethod = document.getElementById('previewPaymentMethod');
    const previewReceiptCode = document.getElementById('previewReceiptCode');
    const previewReceiptTime = document.getElementById('previewReceiptTime');
    const receiptPreviewItems = document.getElementById('receiptPreviewItems');
    const receiptPreviewTotal = document.getElementById('receiptPreviewTotal');
    const qrisSection = document.getElementById('qrisSection');
    const qrisImage = document.getElementById('qrisImage');
    const qrisAmountLabel = document.getElementById('qrisAmountLabel');
    const qrisReferenceLabel = document.getElementById('qrisReferenceLabel');
    const printReceiptButton = document.getElementById('printReceiptButton');
    const completePaymentButton = document.getElementById('completePaymentButton');

    const currencyFormatter = new Intl.NumberFormat('id-ID');

    function formatCurrency(value) {
        return `Rp ${currencyFormatter.format(value)}`;
    }

    function formatItemLabel(totalItems) {
        return `${totalItems} item`;
    }

    function syncQuickAmountButtons(amount) {
        quickAmountButtons.forEach(function (button) {
            button.classList.toggle('active', Number(button.dataset.amount) === amount);
        });
    }

    function getCartMetrics(cart) {
        const items = Object.entries(cart).map(function ([id, item]) {
            return {
                id,
                ...item,
            };
        });
        const subtotal = items.reduce(function (sum, item) {
            return sum + item.subtotal;
        }, 0);
        const totalItems = items.reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);

        return {
            items,
            subtotal,
            totalItems,
        };
    }

    function parseCurrencyInput(value) {
        const numericValue = String(value || '').replace(/\D/g, '');
        return numericValue ? Number(numericValue) : 0;
    }

    function getDiscountState(subtotal) {
        const rawValue = discountInput.value.trim();

        if (!rawValue) {
            return {
                type: 'Belum ada',
                amount: 0,
                formatted: '',
            };
        }

        if (rawValue.includes('%')) {
            const percent = Math.min(parseCurrencyInput(rawValue), 100);
            const amount = Math.round(subtotal * percent / 100);

            return {
                type: `${percent}%`,
                amount,
                formatted: `${percent}%`,
            };
        }

        const amount = Math.min(parseCurrencyInput(rawValue), subtotal);

        return {
            type: 'Rupiah',
            amount,
            formatted: amount > 0 ? formatCurrency(amount) : '',
        };
    }

    function normalizeDiscountInput() {
        const discountState = getDiscountState(getCartMetrics(currentCart).subtotal);
        discountInput.value = discountState.formatted;
    }

    function setPaymentAmountValue(value) {
        paymentAmountInput.value = value > 0 ? formatCurrency(value) : '';
    }

    function getPaymentMetrics() {
        const cartMetrics = getCartMetrics(currentCart);
        const discountState = getDiscountState(cartMetrics.subtotal);
        const total = Math.max(cartMetrics.subtotal - discountState.amount, 0);
        const paidAmount = paymentMethod === 'QRIS'
            ? total
            : parseCurrencyInput(paymentAmountInput.value);
        const change = paymentMethod === 'Tunai'
            ? Math.max(paidAmount - total, 0)
            : 0;

        return {
            ...cartMetrics,
            discountState,
            total,
            paidAmount,
            change,
        };
    }

    function createTransactionCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `TRX-${year}${month}${date}-${hours}${minutes}${seconds}`;
    }

    function formatReceiptTime(date) {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }

    function showSkeletons() {
        productGrid.innerHTML = Array.from({ length: 6 }, function () {
            return '<div class="product-skeleton" aria-hidden="true"></div>';
        }).join('');
    }

    function updateFilterLabel() {
        activeFilterLabel.textContent = `Filter aktif: ${currentCategory}${searchTerm ? `, kata kunci "${searchTerm}"` : ''}`;
        clearSearchButton.hidden = searchTerm.length === 0;
    }

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove('show');
        }, 2200);
    }

    function renderEmptyProducts(message, detail) {
        productGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <strong>${message}</strong>
                ${detail}
            </div>
        `;
    }

    function renderHistory(history) {
        if (!historyList) {
            return;
        }

        if (!history.length) {
            historyList.innerHTML = `
                <div class="empty-cart">
                    <strong>Belum ada histori sesi</strong>
                    Selesaikan pembayaran pertama untuk mulai membangun histori transaksi.
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(function (item) {
            return `
                <div class="history-item">
                    <div>
                        <strong>${item.code}</strong>
                        <small>${item.time} - ${item.payment}${item.item_count ? ` - ${formatItemLabel(item.item_count)}` : ''}</small>
                    </div>
                    <strong>${item.total}</strong>
                </div>
            `;
        }).join('');
    }

    function renderProductCard(product) {
        const article = document.createElement('article');
        const isOutOfStock = product.stock <= 0;
        const isLowStock = product.stock > 0 && product.stock <= 5;
        const stockClass = isOutOfStock ? 'out-stock' : (isLowStock ? 'low-stock' : '');
        const stockLabel = isOutOfStock ? 'Stok habis' : (isLowStock ? `Stok menipis - sisa ${product.stock}` : `Stok aman - ${product.stock}`);

        article.className = `product-card${isOutOfStock ? ' is-disabled' : ''}`;
        article.innerHTML = `
            <div class="visual" style="background: linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]});">
                <span class="nav-badge">${product.category}</span>
                <strong class="visual-mark">${product.icon}</strong>
            </div>
            <div class="product-copy">
                <div class="product-head">
                    <div>
                        <h3>${product.name}</h3>
                        <p class="subtle">${product.size}</p>
                    </div>
                    <strong>${product.price}</strong>
                </div>
                <div class="stock-line ${stockClass}">
                    <span>${stockLabel}</span>
                </div>
            </div>
            <div class="price-row">
                <p class="subtle">${isOutOfStock ? 'Restok produk untuk menjual kembali.' : 'Tap sekali untuk tambah ke keranjang.'}</p>
                <button class="add-to-cart" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? 'Habis' : 'Tambah'}
                </button>
            </div>
        `;

        return article;
    }

    async function loadProducts() {
        loading.style.display = 'block';
        loading.textContent = 'Memuat produk...';
        showSkeletons();
        updateFilterLabel();

        const params = new URLSearchParams({
            category: currentCategory,
            search: searchTerm,
        });

        try {
            const response = await fetch(`/pos/products?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Produk gagal dimuat');
            }

            const products = await response.json();
            productGrid.innerHTML = '';

            if (!products.length) {
                resultSummary.textContent = 'Tidak ada produk yang cocok dengan filter saat ini.';
                renderEmptyProducts('Produk tidak ditemukan', 'Coba ganti kata kunci atau pindah kategori.');
                return;
            }

            products.forEach(function (product) {
                productGrid.appendChild(renderProductCard(product));
            });

            resultSummary.textContent = `Menampilkan ${products.length} produk siap jual.`;
        } catch (error) {
            console.error('Error loading products:', error);
            resultSummary.textContent = 'Katalog belum bisa ditampilkan.';
            renderEmptyProducts('Terjadi kendala saat memuat produk', 'Coba refresh halaman atau periksa koneksi aplikasi.');
        } finally {
            loading.style.display = 'none';
        }
    }

    function renderSidebarCart(metrics) {
        cartBadge.textContent = metrics.totalItems;
        if (clearCartButton) {
            clearCartButton.hidden = metrics.items.length === 0;
        }

        if (!metrics.items.length) {
            receiptItems.innerHTML = `
                <div class="empty-cart" id="emptyCartState">
                    <strong>Keranjang masih kosong</strong>
                    Tambahkan produk dari katalog untuk mulai transaksi baru.
                </div>
            `;
            if (checkoutStateHeadline) {
                checkoutStateHeadline.textContent = 'Menunggu item pertama';
            }
            checkoutButton.disabled = true;
            checkoutNote.textContent = 'Pilih minimal satu produk untuk mengaktifkan pembayaran.';
            return;
        }

        receiptItems.innerHTML = metrics.items.map(function (item) {
            return `
                <div class="receipt-item">
                    <div class="receipt-item-head">
                        <div>
                            <strong>${item.name}</strong>
                            <p class="subtle">${formatCurrency(item.price)} / item</p>
                        </div>
                        <strong>${formatCurrency(item.subtotal)}</strong>
                    </div>
                    <div class="receipt-item-controls">
                        <span class="muted-row">Atur jumlah tanpa kembali ke katalog.</span>
                        <div class="qty-control">
                            <button type="button" class="qty-button remove" data-action="remove-item" data-id="${item.id}">x</button>
                            <button type="button" class="qty-button" data-action="decrease-qty" data-id="${item.id}">-</button>
                            <span class="qty-value">${item.qty}</span>
                            <button type="button" class="qty-button" data-action="increase-qty" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (checkoutStateHeadline) {
            checkoutStateHeadline.textContent = `${formatItemLabel(metrics.totalItems)} siap ditinjau`;
        }
        checkoutButton.disabled = false;
        checkoutNote.textContent = 'Setelah pilihan menu selesai, lanjutkan ke pembayaran.';
    }

    function renderPaymentOrderList(metrics) {
        if (!metrics.items.length) {
            paymentOrderList.innerHTML = `
                <div class="empty-cart">
                    <strong>Belum ada item</strong>
                    Tambahkan produk untuk melanjutkan ke pembayaran.
                </div>
            `;
            return;
        }

        paymentOrderList.innerHTML = metrics.items.map(function (item) {
            return `
                <div class="payment-order-item">
                    <div class="payment-order-stack">
                        <div class="payment-order-meta">
                            <div>
                                <strong class="payment-order-title">${item.name}</strong>
                                <span>${formatCurrency(item.price)} / item</span>
                            </div>
                            <strong class="payment-order-total">${formatCurrency(item.subtotal)}</strong>
                        </div>
                        <div class="payment-order-footer">
                            <span class="subtle">Jumlah dapat diubah langsung di sini.</span>
                            <div class="qty-control">
                                <button type="button" class="qty-button remove" data-action="remove-item" data-id="${item.id}">x</button>
                                <button type="button" class="qty-button" data-action="decrease-qty" data-id="${item.id}">-</button>
                                <span class="qty-value">${item.qty}</span>
                                <button type="button" class="qty-button" data-action="increase-qty" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateQrisSection(metrics) {
        const shouldShow = paymentMethod === 'QRIS' && metrics.items.length > 0;
        qrisSection.hidden = !shouldShow;

        if (!shouldShow) {
            return;
        }

        const reference = createTransactionCode();
        const qrisPayload = `QRIS|Maju Jaya Mart|${reference}|${metrics.total}`;
        qrisImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrisPayload)}`;
        qrisAmountLabel.textContent = `Total ${formatCurrency(metrics.total)}`;
        qrisReferenceLabel.textContent = `Ref: ${reference}`;
    }

    function renderReceiptPreview(metrics) {
        previewPaymentMethod.textContent = paymentMethod;
        previewReceiptCode.textContent = createTransactionCode();
        previewReceiptTime.textContent = formatReceiptTime(new Date());

        if (!metrics.items.length) {
            receiptPreviewItems.innerHTML = `
                <div class="empty-cart">
                    <strong>Belum ada item</strong>
                    Tambahkan produk dulu untuk melihat struk.
                </div>
            `;
        } else {
            receiptPreviewItems.innerHTML = metrics.items.map(function (item) {
                return `
                    <div class="print-preview-item">
                        <strong>${item.name}</strong>
                        <div>${item.qty} x ${formatCurrency(item.price)}</div>
                        <div>${formatCurrency(item.subtotal)}</div>
                    </div>
                `;
            }).join('');
        }

        receiptPreviewTotal.innerHTML = `
            <div class="payment-summary-row">
                <span>Subtotal</span>
                <strong>${formatCurrency(metrics.subtotal)}</strong>
            </div>
            <div class="payment-summary-row">
                <span>Diskon</span>
                <strong>${formatCurrency(metrics.discountState.amount)}</strong>
            </div>
            <div class="payment-summary-row">
                <span>Metode</span>
                <strong>${paymentMethod}</strong>
            </div>
            <div class="payment-summary-row total">
                <span>Total</span>
                <strong>${formatCurrency(metrics.total)}</strong>
            </div>
        `;
    }

    function updatePaymentSummary() {
        const metrics = getPaymentMetrics();
        const isSufficient = metrics.paidAmount >= metrics.total && metrics.total > 0;

        paymentItemCount.textContent = formatItemLabel(metrics.totalItems);
        paymentSubtotal.textContent = formatCurrency(metrics.subtotal);
        paymentDiscount.textContent = formatCurrency(metrics.discountState.amount);
        paymentTotal.textContent = formatCurrency(metrics.total);
        paymentChange.textContent = formatCurrency(metrics.change);
        discountTypeLabel.textContent = metrics.discountState.type;
        discountAmountLabel.textContent = formatCurrency(metrics.discountState.amount);

        paymentAmountInput.readOnly = paymentMethod === 'QRIS';
        if (paymentMethod === 'QRIS') {
            setPaymentAmountValue(metrics.total);
        }
        syncQuickAmountButtons(parseCurrencyInput(paymentAmountInput.value));

        if (!metrics.items.length) {
            paymentStatusLabel.textContent = 'Keranjang kosong';
            paymentStatusMessage.textContent = 'Tambahkan produk lebih dulu sebelum masuk ke pembayaran.';
            paymentStatusMessage.className = 'payment-status';
            completePaymentButton.disabled = true;
        } else if (!metrics.paidAmount && paymentMethod !== 'QRIS') {
            paymentStatusLabel.textContent = 'Menunggu input';
            paymentStatusMessage.textContent = 'Masukkan nominal bayar untuk menyelesaikan transaksi.';
            paymentStatusMessage.className = 'payment-status';
            completePaymentButton.disabled = true;
        } else if (!isSufficient) {
            paymentStatusLabel.textContent = 'Belum cukup';
            paymentStatusMessage.textContent = `Nominal masih kurang ${formatCurrency(metrics.total - metrics.paidAmount)}.`;
            paymentStatusMessage.className = 'payment-status danger';
            completePaymentButton.disabled = true;
        } else {
            paymentStatusLabel.textContent = 'Siap diproses';
            paymentStatusMessage.textContent = paymentMethod === 'Tunai'
                ? `Pembayaran cukup. Kembalian ${formatCurrency(metrics.change)}.`
                : paymentMethod === 'QRIS'
                    ? 'Pelanggan dapat scan QRIS lalu transaksi siap diselesaikan.'
                    : 'Nominal valid. Transaksi non-tunai siap diselesaikan.';
            paymentStatusMessage.className = 'payment-status success';
            completePaymentButton.disabled = false;
        }

        if (sidebarPaymentBadge) {
            sidebarPaymentBadge.textContent = paymentMethod;
        }

        renderPaymentOrderList(metrics);
        renderReceiptPreview(metrics);
        updateQrisSection(metrics);
    }

    function renderCart(cart, totalItems) {
        currentCart = cart;
        const metrics = getPaymentMetrics();

        renderSidebarCart({
            ...getCartMetrics(cart),
            totalItems,
        });

        summaryBox.innerHTML = `
            <div class="summary-line">
                <span>Subtotal</span>
                <strong>${formatCurrency(metrics.subtotal)}</strong>
            </div>
            <div class="summary-line discount">
                <span>Diskon</span>
                <strong>${formatCurrency(metrics.discountState.amount)}</strong>
            </div>
            <div class="summary-line total">
                <span>Total</span>
                <strong>${formatCurrency(metrics.total)}</strong>
            </div>
        `;

        updatePaymentSummary();
    }

    async function loadCart() {
        try {
            const response = await fetch('/pos/cart');

            if (!response.ok) {
                throw new Error('Cart gagal dimuat');
            }

            const data = await response.json();
            renderCart(data.cart || {}, data.total_items || 0);
        } catch (error) {
            console.error('Error loading cart:', error);
            renderCart({}, 0);
        }
    }

    async function syncCart(productId, qty) {
        try {
            const response = await fetch('/pos/cart/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ product_id: productId, qty: qty }),
            });

            if (!response.ok) {
                throw new Error('Gagal memperbarui keranjang');
            }

            const data = await response.json();
            renderCart(data.cart, data.total_items);
        } catch (error) {
            console.error('Error syncing cart:', error);
            showToast('Keranjang belum berhasil diperbarui.');
        }
    }

    async function clearCart() {
        try {
            const response = await fetch('/pos/cart/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]').getAttribute('content'),
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengosongkan keranjang');
            }

            const data = await response.json();
            discountInput.value = '';
            paymentMethod = 'Tunai';
            paymentMethodButtons.forEach(function (button) {
                button.classList.toggle('active', button.dataset.method === 'Tunai');
            });
            setPaymentAmountValue(0);
            syncQuickAmountButtons(0);
            renderCart(data.cart, data.total_items);
            showToast('Transaksi aktif dikosongkan.');
        } catch (error) {
            console.error('Error clearing cart:', error);
            showToast('Transaksi aktif belum berhasil dikosongkan.');
        }
    }

    async function addToCart(productId, button) {
        const originalLabel = button ? button.textContent : 'Tambah';

        if (button) {
            button.disabled = true;
            button.textContent = 'Menambah...';
        }

        try {
            const response = await fetch('/pos/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ product_id: productId }),
            });

            if (!response.ok) {
                throw new Error('Gagal menambah ke cart');
            }

            const data = await response.json();

            if (data.success) {
                renderCart(data.cart, data.total_items);

                if (button) {
                    button.textContent = 'Ditambah';
                    window.setTimeout(function () {
                        button.textContent = originalLabel;
                        button.disabled = false;
                    }, 900);
                }

                showToast('Menu masuk ke keranjang.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);

            if (button) {
                button.textContent = 'Coba lagi';
                window.setTimeout(function () {
                    button.textContent = originalLabel;
                    button.disabled = false;
                }, 1200);
            }

            showToast('Produk belum berhasil ditambahkan.');
        }
    }

    function openPaymentModal() {
        const metrics = getCartMetrics(currentCart);

        if (!metrics.items.length) {
            showToast('Keranjang masih kosong.');
            return;
        }

        lastFocusedElement = document.activeElement;
        paymentModal.classList.add('show');
        paymentModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        if (paymentMethod === 'Tunai') {
            setPaymentAmountValue(getPaymentMetrics().total);
        }

        updatePaymentSummary();
        window.setTimeout(function () {
            if (paymentMethod === 'Tunai') {
                paymentAmountInput.focus();
                paymentAmountInput.select();
                return;
            }

            discountInput.focus();
        }, 40);
    }

    function closePaymentModal() {
        paymentModal.classList.remove('show');
        paymentModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }

        lastFocusedElement = null;
    }

    function printReceipt(transactionData = null) {
        const metrics = transactionData
            ? {
                items: transactionData.items || [],
                totalItems: (transactionData.items || []).reduce(function (sum, item) {
                    return sum + item.qty;
                }, 0),
                subtotal: transactionData.subtotal,
                discountState: {
                    amount: transactionData.discount_amount,
                },
                total: transactionData.total_amount,
                paidAmount: transactionData.paid_amount,
                change: transactionData.change_amount,
            }
            : getPaymentMetrics();
        const reference = transactionData ? transactionData.code : createTransactionCode();
        const paymentLabel = transactionData ? transactionData.payment_method : paymentMethod;
        const timeLabel = transactionData ? transactionData.time : formatReceiptTime(new Date());

        if (!metrics.items.length) {
            showToast('Belum ada transaksi untuk dicetak.');
            return;
        }

        const receiptWindow = window.open('', '_blank', 'width=420,height=820');

        if (!receiptWindow) {
            showToast('Popup print diblokir browser.');
            return;
        }

        const qrisPayload = `QRIS|Maju Jaya Mart|${reference}|${metrics.total}`;
        const receiptItemsHtml = metrics.items.map(function (item) {
            return `
                <div style="margin-bottom:12px;">
                    <div style="font-weight:700;">${item.name}</div>
                    <div>${item.qty} x ${formatCurrency(item.price)}</div>
                    <div>${formatCurrency(item.subtotal)}</div>
                </div>
            `;
        }).join('');
        const qrisMarkup = paymentLabel === 'QRIS'
            ? `
                <div style="margin-top:16px; text-align:center;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrisPayload)}" alt="QRIS" style="width:180px;height:180px;border:1px solid #ddd;padding:8px;border-radius:12px;">
                    <div style="margin-top:8px;">Scan QRIS untuk pembayaran</div>
                </div>
            `
            : '';

        receiptWindow.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Cetak Struk</title>
                <style>
                    body { font-family: "IBM Plex Mono", monospace; padding: 24px; color: #111; }
                    .row { display:flex; justify-content:space-between; gap: 12px; }
                    .total { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #999; }
                </style>
            </head>
            <body>
                <h2 style="margin:0 0 8px;">Maju Jaya Mart</h2>
                <div>${reference}</div>
                <div>${timeLabel}</div>
                <div>Metode: ${paymentLabel}</div>
                <hr style="border:none;border-top:1px dashed #999;margin:16px 0;">
                ${receiptItemsHtml}
                <div class="row"><span>Total item</span><strong>${formatItemLabel(metrics.totalItems)}</strong></div>
                <div class="row"><span>Subtotal</span><strong>${formatCurrency(metrics.subtotal)}</strong></div>
                <div class="row"><span>Diskon</span><strong>${formatCurrency(metrics.discountState.amount)}</strong></div>
                <div class="row"><span>Total</span><strong>${formatCurrency(metrics.total)}</strong></div>
                <div class="row"><span>Dibayar</span><strong>${formatCurrency(metrics.paidAmount)}</strong></div>
                <div class="row total"><span>Kembalian</span><strong>${formatCurrency(metrics.change)}</strong></div>
                ${qrisMarkup}
            </body>
            </html>
        `);

        receiptWindow.document.close();
        receiptWindow.focus();
        receiptWindow.print();
    }

    searchInput.addEventListener('input', function () {
        searchTerm = this.value.trim();
        updateFilterLabel();
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(loadProducts, 220);
    });

    clearSearchButton.addEventListener('click', function () {
        searchInput.value = '';
        searchTerm = '';
        updateFilterLabel();
        loadProducts();
        searchInput.focus();
    });

    if (clearCartButton) {
        clearCartButton.addEventListener('click', function () {
            if (!Object.keys(currentCart).length) {
                return;
            }

            if (!window.confirm('Kosongkan transaksi aktif sekarang?')) {
                return;
            }

            clearCart();
        });
    }

    categoryChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            categoryChips.forEach(function (currentChip) {
                currentChip.classList.remove('active');
                currentChip.setAttribute('aria-pressed', 'false');
            });

            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            currentCategory = this.dataset.category;
            updateFilterLabel();
            loadProducts();
        });
    });

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.add-to-cart');
        const actionButton = event.target.closest('[data-action]');

        if (button) {
            addToCart(button.dataset.id, button);
            return;
        }

        if (!actionButton) {
            return;
        }

        const currentItem = currentCart[actionButton.dataset.id];

        if (!currentItem) {
            return;
        }

        if (actionButton.dataset.action === 'increase-qty') {
            syncCart(actionButton.dataset.id, currentItem.qty + 1);
        }

        if (actionButton.dataset.action === 'decrease-qty') {
            syncCart(actionButton.dataset.id, Math.max(currentItem.qty - 1, 0));
        }

        if (actionButton.dataset.action === 'remove-item') {
            syncCart(actionButton.dataset.id, 0);
        }
    });

    paymentMethodButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            paymentMethodButtons.forEach(function (currentButton) {
                currentButton.classList.remove('active');
            });
            this.classList.add('active');
            paymentMethod = this.dataset.method;

            if (paymentMethod !== 'Tunai') {
                setPaymentAmountValue(getPaymentMetrics().total);
            }

            updatePaymentSummary();
        });
    });

    quickAmountButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            quickAmountButtons.forEach(function (currentButton) {
                currentButton.classList.remove('active');
            });

            this.classList.add('active');
            setPaymentAmountValue(Number(this.dataset.amount));
            updatePaymentSummary();
        });
    });

    discountInput.addEventListener('input', function () {
        const rawValue = this.value.toUpperCase();
        const hasPercent = rawValue.includes('%');
        const numericValue = parseCurrencyInput(rawValue);

        if (!numericValue) {
            this.value = hasPercent ? '0%' : '';
        } else if (hasPercent) {
            this.value = `${Math.min(numericValue, 100)}%`;
        } else {
            this.value = formatCurrency(numericValue);
        }

        if (paymentMethod !== 'Tunai') {
            setPaymentAmountValue(getPaymentMetrics().total);
        }

        updatePaymentSummary();
    });

    paymentAmountInput.addEventListener('input', function () {
        if (paymentMethod === 'QRIS') {
            return;
        }

        const amount = parseCurrencyInput(this.value);
        setPaymentAmountValue(amount);
        syncQuickAmountButtons(amount);
        updatePaymentSummary();
    });

    checkoutButton.addEventListener('click', function () {
        normalizeDiscountInput();
        openPaymentModal();
    });

    closePaymentModalButton.addEventListener('click', function () {
        closePaymentModal();
    });

    paymentModal.addEventListener('click', function (event) {
        if (event.target === paymentModal) {
            closePaymentModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        const activeElement = document.activeElement;
        const isTypingField = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );

        if (event.key === '/' && !isTypingField && !paymentModal.classList.contains('show')) {
            event.preventDefault();
            searchInput.focus();
            searchInput.select();
            return;
        }

        if (event.key === 'Escape' && paymentModal.classList.contains('show')) {
            closePaymentModal();
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && paymentModal.classList.contains('show') && !completePaymentButton.disabled) {
            event.preventDefault();
            completePaymentButton.click();
        }
    });

    printReceiptButton.addEventListener('click', function () {
        printReceipt();
    });

    completePaymentButton.addEventListener('click', async function () {
        const metrics = getPaymentMetrics();
        const originalLabel = completePaymentButton.textContent;

        completePaymentButton.disabled = true;
        completePaymentButton.textContent = 'Memproses...';

        try {
            const response = await fetch('/pos/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    payment_method: paymentMethod,
                    paid_amount: metrics.paidAmount,
                    discount_amount: metrics.discountState.amount,
                    discount_label: metrics.discountState.type,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Gagal menyimpan transaksi.');
            }

            printReceipt(data.transaction);

            discountInput.value = '';
            paymentMethod = 'Tunai';
            paymentMethodButtons.forEach(function (button) {
                button.classList.toggle('active', button.dataset.method === 'Tunai');
            });
            setPaymentAmountValue(0);
            renderCart(data.cart || {}, data.total_items || 0);
            renderHistory(data.history || []);
            closePaymentModal();
            showToast('Pembayaran selesai dan histori transaksi diperbarui.');
        } catch (error) {
            console.error('Error completing transaction:', error);
            showToast(error.message || 'Transaksi belum berhasil diselesaikan.');
            updatePaymentSummary();
        } finally {
            completePaymentButton.textContent = originalLabel;
        }
    });

    updateFilterLabel();
    showSkeletons();
    loadProducts();
    loadCart();
});
