document.addEventListener('DOMContentLoaded', function() {
    let currentCategory = 'Semua';
    let searchTerm = '';

    const searchInput = document.getElementById('searchInput');
    const categoryChips = document.querySelectorAll('.chip[data-category]');
    const productGrid = document.querySelector('.product-grid');
    const loading = document.getElementById('loading');
    const cartBadge = document.querySelector('.cart-count') || null;

    // Load products
    async function loadProducts() {
        loading.style.display = 'block';
        productGrid.innerHTML = '';

        const params = new URLSearchParams({
            category: currentCategory,
            search: searchTerm
        });

        try {
            const response = await fetch(`/pos/products?${params}`);
            const products = await response.json();

            products.forEach(product => {
                const card = createProductCard(product);
                productGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<p style="text-align: center; color: var(--muted);">Error memuat produk</p>';
        } finally {
            loading.style.display = 'none';
        }
    }

    function createProductCard(product) {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.innerHTML = `
            <div class="visual" style="background: linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]});">
                ${product.icon}
            </div>
            <div>
                <div class="muted-row">
                    <span class="nav-badge">${product.category}</span>
                    <span>Stok ${product.stock}</span>
                </div>
                <h3>${product.name}</h3>
                <p class="subtle">${product.size}</p>
            </div>
            <div class="price-row">
                <strong>${product.price}</strong>
                <span class="pill add-to-cart" data-id="${product.id}">Tambah</span>
            </div>
        `;
        return article;
    }

    // Event listeners
    searchInput.addEventListener('input', function() {
        searchTerm = this.value;
        loadProducts();
    });

    categoryChips.forEach(chip => {
        chip.addEventListener('click', function() {
            categoryChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            loadProducts();
        });
    });

    // Add to cart
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
        }
    });

    async function addToCart(productId) {
        try {
            const response = await fetch('/pos/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ product_id: productId })
            });

            const data = await response.json();
            if (data.success) {
                updateCartUI(data.cart, data.total_items);
                e.target.textContent = 'Ditambahkan ✓';
                setTimeout(() => { e.target.textContent = 'Tambah'; }, 1500);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }

    function updateCartUI(cart, totalItems) {
        // Update cart badge if exists
        if (cartBadge) cartBadge.textContent = totalItems;

        // Update receipt section (mock for now)
        const receiptItems = document.querySelector('.receipt-items');
        receiptItems.innerHTML = Object.values(cart).map(item => `
            <div class="receipt-item">
                <strong>${item.name}</strong>
                <div class="muted-row">
                    <span>${item.qty} x Rp ${Math.floor(item.price).toLocaleString()}</span>
                    <strong>Rp ${item.subtotal.toLocaleString()}</strong>
                </div>
            </div>
        `).join('');

        // Update totals
        const subtotal = Object.values(cart).reduce((sum, item) => sum + item.subtotal, 0);
        const summaryBox = document.querySelector('.summary-box');
        summaryBox.innerHTML = `
            <div class="summary-line">
                <span>Subtotal</span>
                <strong>Rp ${subtotal.toLocaleString()}</strong>
            </div>
            <div class="summary-line total">
                <span>Total</span>
                <strong>Rp ${subtotal.toLocaleString()}</strong>
            </div>
        `;
    }

    // Initial load
    loadProducts();
});

