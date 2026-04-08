const products = [
  { id: 1, name: "Qtela Singkong Original", size: "60g", price: 5500, stock: 15, category: "Makanan Ringan", colorA: "#fff1ed", colorB: "#ffb387" },
  { id: 2, name: "Indomie Goreng Original", size: "85g", price: 3500, stock: 16, category: "Makanan Ringan", colorA: "#eef9eb", colorB: "#83cc7d" },
  { id: 3, name: "Chitato Sapi Panggang", size: "68g", price: 10200, stock: 9, category: "Makanan Ringan", colorA: "#fff7df", colorB: "#f7b940" },
  { id: 4, name: "Teh Botol Sosro", size: "450ml", price: 5000, stock: 22, category: "Minuman", colorA: "#fff1e9", colorB: "#d26d43" },
  { id: 5, name: "Aqua Botol", size: "600ml", price: 4000, stock: 30, category: "Minuman", colorA: "#e9f4ff", colorB: "#5ea9ff" },
  { id: 6, name: "Pulpen Faster C600", size: "Biru", price: 4500, stock: 20, category: "Alat Tulis Kantor (ATK)", colorA: "#eef3ff", colorB: "#7e9bff" },
  { id: 7, name: "Buku Tulis Sinar Dunia", size: "38 lembar", price: 4800, stock: 18, category: "Alat Tulis Kantor (ATK)", colorA: "#f6f0ff", colorB: "#9b7dff" },
  { id: 8, name: "Bayfresh Lavender", size: "600ml", price: 18200, stock: 8, category: "Produk Kebersihan", colorA: "#f0fffb", colorB: "#4dc7b0" },
  { id: 9, name: "Sabun Cuci Piring", size: "800ml", price: 13900, stock: 12, category: "Produk Kebersihan", colorA: "#ecfff4", colorB: "#7ecf90" }
];

const categories = ["Semua", ...new Set(products.map((product) => product.category))];
const cart = new Map();

const categoryTabs = document.querySelector("#category-tabs");
const productGrid = document.querySelector("#product-grid");
const visibleCount = document.querySelector("#visible-count");
const searchInput = document.querySelector("#search-input");
const cartItems = document.querySelector("#cart-items");
const clearCartButton = document.querySelector("#clear-cart");
const discountInput = document.querySelector("#discount-input");
const amountPaidInput = document.querySelector("#amount-paid-input");
const subtotalValue = document.querySelector("#subtotal-value");
const discountValue = document.querySelector("#discount-value");
const totalValue = document.querySelector("#total-value");
const changeValue = document.querySelector("#change-value");
const receiptPreview = document.querySelector("#receipt-preview");
const printButton = document.querySelector("#print-button");
const storeNameInput = document.querySelector("#store-name");
const cashierNameInput = document.querySelector("#cashier-name");
const productCardTemplate = document.querySelector("#product-card-template");

let activeCategory = "Semua";

const currency = new Intl.NumberFormat("id-ID");

function formatCurrency(value) {
  return `Rp ${currency.format(value)}`;
}

function createProductArt(product) {
  const shortName = product.name.split(" ").slice(0, 2).join(" ");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${product.colorA}" />
          <stop offset="100%" stop-color="${product.colorB}" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="42" fill="url(#g)" />
      <rect x="65" y="42" width="170" height="216" rx="18" fill="rgba(255,255,255,0.85)" />
      <text x="150" y="132" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="700" fill="#173025">${shortName}</text>
      <text x="150" y="170" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" fill="#3a5b4b">${product.size}</text>
    </svg>
  `;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function renderCategoryTabs() {
  categoryTabs.innerHTML = categories
    .map((category) => `
      <button class="category-tab ${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">
        ${category}
      </button>
    `)
    .join("");
}

function getVisibleProducts() {
  const keyword = searchInput.value.trim().toLowerCase();

  return products.filter((product) => {
    const matchCategory = activeCategory === "Semua" || product.category === activeCategory;
    const matchKeyword = !keyword || `${product.name} ${product.size}`.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    const fragment = productCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".product-button");

    fragment.querySelector(".product-visual").style.backgroundImage = createProductArt(product);
    fragment.querySelector(".product-name").textContent = product.name;
    fragment.querySelector(".product-size").textContent = product.size;
    fragment.querySelector(".product-price").textContent = formatCurrency(product.price);
    fragment.querySelector(".product-stock").textContent = `(${product.stock})`;

    card.addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(fragment);
  });

  visibleCount.textContent = String(visibleProducts.length);

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<div class="empty-state">Produk tidak ditemukan. Coba kata kunci lain.</div>';
  }
}

function addToCart(productId) {
  const currentQty = cart.get(productId) || 0;
  cart.set(productId, currentQty + 1);
  renderCart();
}

function updateQuantity(productId, change) {
  const currentQty = cart.get(productId) || 0;
  const nextQty = currentQty + change;

  if (nextQty <= 0) {
    cart.delete(productId);
  } else {
    cart.set(productId, nextQty);
  }

  renderCart();
}

function renderCart() {
  if (!cart.size) {
    cartItems.innerHTML = '<div class="empty-state">Belum ada produk di struk. Ketuk produk di kiri untuk menambah.</div>';
  } else {
    cartItems.innerHTML = Array.from(cart.entries()).map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      const subtotal = product.price * quantity;

      return `
        <div class="cart-row" data-product-id="${productId}">
          <div class="cart-row-header">
            <div>
              <strong>${product.name}</strong>
              <small>${product.size}</small>
            </div>
            <button class="remove-button" type="button" data-action="remove">Hapus</button>
          </div>
          <div class="cart-row-footer">
            <div class="qty-controls">
              <button class="qty-button" type="button" data-action="decrease">-</button>
              <strong>${quantity}</strong>
              <button class="qty-button" type="button" data-action="increase">+</button>
            </div>
            <strong>${formatCurrency(subtotal)}</strong>
          </div>
        </div>
      `;
    }).join("");
  }

  attachCartEvents();
  updateSummary();
  updateReceiptPreview();
}

function attachCartEvents() {
  cartItems.querySelectorAll(".cart-row").forEach((row) => {
    const productId = Number(row.dataset.productId);

    row.querySelector('[data-action="increase"]')?.addEventListener("click", () => updateQuantity(productId, 1));
    row.querySelector('[data-action="decrease"]')?.addEventListener("click", () => updateQuantity(productId, -1));
    row.querySelector('[data-action="remove"]')?.addEventListener("click", () => {
      cart.delete(productId);
      renderCart();
    });
  });
}

function getSummary() {
  const subtotal = Array.from(cart.entries()).reduce((total, [productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return total + (product.price * quantity);
  }, 0);

  const discount = Number(discountInput.value || 0);
  const total = Math.max(subtotal - discount, 0);
  const amountPaid = Number(amountPaidInput.value || 0);
  const change = Math.max(amountPaid - total, 0);

  return { subtotal, discount, total, amountPaid, change };
}

function updateSummary() {
  const summary = getSummary();
  subtotalValue.textContent = formatCurrency(summary.subtotal);
  discountValue.textContent = formatCurrency(summary.discount);
  totalValue.textContent = formatCurrency(summary.total);
  changeValue.textContent = formatCurrency(summary.change);
}

function updateReceiptPreview() {
  const summary = getSummary();
  const now = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  const itemLines = cart.size
    ? Array.from(cart.entries()).map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      const subtotal = product.price * quantity;
      return `
        <div>${product.name}</div>
        <div class="receipt-line">
          <span>${quantity} x ${formatCurrency(product.price)}</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
      `;
    }).join("")
    : "<div>Belum ada item</div>";

  receiptPreview.innerHTML = `
    <div class="receipt-center">
      <strong>${storeNameInput.value || "Nama Toko"}</strong><br>
      Jl. Contoh Kasir No. 12<br>
      Kasir: ${cashierNameInput.value || "-"}<br>
      ${now}
    </div>
    <div class="receipt-divider"></div>
    ${itemLines}
    <div class="receipt-divider"></div>
    <div class="receipt-line">
      <span>Subtotal</span>
      <span>${formatCurrency(summary.subtotal)}</span>
    </div>
    <div class="receipt-line">
      <span>Diskon</span>
      <span>${formatCurrency(summary.discount)}</span>
    </div>
    <div class="receipt-line">
      <strong>Total</strong>
      <strong>${formatCurrency(summary.total)}</strong>
    </div>
    <div class="receipt-line">
      <span>Bayar</span>
      <span>${formatCurrency(summary.amountPaid)}</span>
    </div>
    <div class="receipt-line">
      <span>Kembali</span>
      <span>${formatCurrency(summary.change)}</span>
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-center">
      Terima kasih sudah berbelanja
    </div>
  `;
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest(".category-tab");
  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  renderCategoryTabs();
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
discountInput.addEventListener("input", () => {
  updateSummary();
  updateReceiptPreview();
});
amountPaidInput.addEventListener("input", () => {
  updateSummary();
  updateReceiptPreview();
});
storeNameInput.addEventListener("input", updateReceiptPreview);
cashierNameInput.addEventListener("input", updateReceiptPreview);

clearCartButton.addEventListener("click", () => {
  cart.clear();
  renderCart();
});

printButton.addEventListener("click", () => {
  updateReceiptPreview();
  window.print();
});

renderCategoryTabs();
renderProducts();
renderCart();
