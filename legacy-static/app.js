const defaultProducts = [
  { id: 1, sku: "8993175532011", name: "Qtela Singkong Original", size: "60g", price: 5500, stock: 15, category: "Makanan Ringan", colorA: "#fff1ed", colorB: "#ffb387", icon: "CHIPS" },
  { id: 2, sku: "089686041672", name: "Indomie Goreng Original", size: "85g", price: 3500, stock: 16, category: "Makanan Ringan", colorA: "#eef9eb", colorB: "#83cc7d", icon: "MIE" },
  { id: 3, sku: "8996001600267", name: "Chitato Sapi Panggang", size: "68g", price: 10200, stock: 9, category: "Makanan Ringan", colorA: "#fff7df", colorB: "#f7b940", icon: "SNACK" },
  { id: 4, sku: "8992761132016", name: "Teh Botol Sosro", size: "450ml", price: 5000, stock: 22, category: "Minuman", colorA: "#fff1e9", colorB: "#d26d43", icon: "TEH" },
  { id: 5, sku: "8992772194010", name: "Aqua Botol", size: "600ml", price: 4000, stock: 30, category: "Minuman", colorA: "#e9f4ff", colorB: "#5ea9ff", icon: "AIR" },
  { id: 6, sku: "8991002101207", name: "Pulpen Faster C600", size: "Biru", price: 4500, stock: 20, category: "Alat Tulis Kantor (ATK)", colorA: "#eef3ff", colorB: "#7e9bff", icon: "PEN" },
  { id: 7, sku: "8991389300017", name: "Buku Tulis Sinar Dunia", size: "38 lembar", price: 4800, stock: 18, category: "Alat Tulis Kantor (ATK)", colorA: "#f6f0ff", colorB: "#9b7dff", icon: "BOOK" },
  { id: 8, sku: "8992775002213", name: "Bayfresh Lavender", size: "600ml", price: 18200, stock: 8, category: "Produk Kebersihan", colorA: "#f0fffb", colorB: "#4dc7b0", icon: "CLEAN" },
  { id: 9, sku: "8998866601018", name: "Sabun Cuci Piring", size: "800ml", price: 13900, stock: 12, category: "Produk Kebersihan", colorA: "#ecfff4", colorB: "#7ecf90", icon: "SOAP" }
];

const stockStorageKey = "cetak-struk-products";
const cart = new Map();
const historyStorageKey = "cetak-struk-history";
const products = loadProducts();

const categoryTabs = document.querySelector("#category-tabs");
const productGrid = document.querySelector("#product-grid");
const visibleCount = document.querySelector("#visible-count");
const searchInput = document.querySelector("#search-input");
const scanButton = document.querySelector("#scan-button");
const focusSearchButton = document.querySelector("#focus-search-button");
const cartItems = document.querySelector("#cart-items");
const clearCartButton = document.querySelector("#clear-cart");
const discountInput = document.querySelector("#discount-input");
const amountPaidInput = document.querySelector("#amount-paid-input");
const paymentMethodInput = document.querySelector("#payment-method");
const memberCodeInput = document.querySelector("#member-code-input");
const subtotalValue = document.querySelector("#subtotal-value");
const discountValue = document.querySelector("#discount-value");
const totalValue = document.querySelector("#total-value");
const changeValue = document.querySelector("#change-value");
const receiptPreview = document.querySelector("#receipt-preview");
const printButton = document.querySelector("#print-button");
const checkoutButton = document.querySelector("#checkout-button");
const storeNameInput = document.querySelector("#store-name");
const cashierNameInput = document.querySelector("#cashier-name");
const statusBanner = document.querySelector("#status-banner");
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history-button");
const exportTransactionsButton = document.querySelector("#export-transactions-button");
const importTransactionsFile = document.querySelector("#import-transactions-file");
const todayTransactionCount = document.querySelector("#today-transaction-count");
const todayRevenueValue = document.querySelector("#today-revenue-value");
const productCardTemplate = document.querySelector("#product-card-template");
const checkoutModal = document.querySelector("#checkout-modal");
const checkoutSummary = document.querySelector("#checkout-summary");
const closeModalButton = document.querySelector("#close-modal-button");
const confirmCheckoutButton = document.querySelector("#confirm-checkout-button");
const openAdminButton = document.querySelector("#open-admin-button");
const adminModal = document.querySelector("#admin-modal");
const closeAdminButton = document.querySelector("#close-admin-button");
const adminProductList = document.querySelector("#admin-product-list");
const adminProductForm = document.querySelector("#admin-product-form");
const adminFormTitle = document.querySelector("#admin-form-title");
const newProductButton = document.querySelector("#new-product-button");
const resetProductsButton = document.querySelector("#reset-products-button");
const exportProductsButton = document.querySelector("#export-products-button");
const importProductsFile = document.querySelector("#import-products-file");
const deleteProductButton = document.querySelector("#delete-product-button");
const adminNameInput = document.querySelector("#admin-name");
const adminSkuInput = document.querySelector("#admin-sku");
const adminCategoryInput = document.querySelector("#admin-category");
const adminSizeInput = document.querySelector("#admin-size");
const adminPriceInput = document.querySelector("#admin-price");
const adminStockInput = document.querySelector("#admin-stock");
const adminIconInput = document.querySelector("#admin-icon");
const adminImageInput = document.querySelector("#admin-image");
const adminImageFileInput = document.querySelector("#admin-image-file");
const adminImagePreview = document.querySelector("#admin-image-preview");

let activeCategory = "Semua";
let scanMode = false;
let transactionHistory = loadTransactionHistory();
let selectedAdminProductId = null;

const currency = new Intl.NumberFormat("id-ID");

function formatCurrency(value) {
  return `Rp ${currency.format(value)}`;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(file);
  });
}

function isValidProduct(product) {
  return Boolean(
    product &&
    Number.isFinite(Number(product.id)) &&
    typeof product.name === "string" &&
    typeof product.sku === "string" &&
    typeof product.category === "string" &&
    typeof product.size === "string" &&
    Number.isFinite(Number(product.price)) &&
    Number.isFinite(Number(product.stock))
  );
}

function normalizeProduct(product) {
  return {
    id: Number(product.id),
    name: product.name.trim(),
    sku: product.sku.trim(),
    category: product.category.trim(),
    size: product.size.trim(),
    price: Number(product.price),
    stock: Number(product.stock),
    colorA: product.colorA || "#eef7f0",
    colorB: product.colorB || "#91c9a4",
    icon: (product.icon || "ITEM").slice(0, 8).toUpperCase(),
    image: product.image || ""
  };
}

function isValidTransaction(transaction) {
  return Boolean(
    transaction &&
    typeof transaction.id === "string" &&
    typeof transaction.date === "string" &&
    Array.isArray(transaction.items) &&
    Number.isFinite(Number(transaction.total))
  );
}

function getCategories() {
  return ["Semua", ...new Set(products.map((product) => product.category).filter(Boolean))];
}

function loadProducts() {
  try {
    const storedProducts = JSON.parse(window.localStorage.getItem(stockStorageKey) || "null");
    if (Array.isArray(storedProducts) && storedProducts.length) {
      return storedProducts;
    }
  } catch {
    // ignore and fall back
  }

  return defaultProducts.map((product) => ({ ...product }));
}

function saveProducts() {
  window.localStorage.setItem(stockStorageKey, JSON.stringify(products));
}

function createProductArt(product) {
  if (product.image) {
    return `url("${product.image.replace(/"/g, '\\"')}")`;
  }

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
      <circle cx="238" cy="58" r="26" fill="rgba(255,255,255,0.4)" />
      <rect x="58" y="36" width="184" height="228" rx="28" fill="rgba(255,255,255,0.9)" />
      <rect x="74" y="58" width="152" height="122" rx="22" fill="rgba(255,255,255,0.78)" stroke="rgba(23,48,37,0.08)" />
      <text x="150" y="127" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" font-weight="700" fill="#173025">${product.icon || "ITEM"}</text>
      <text x="150" y="206" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" font-weight="700" fill="#173025">${shortName}</text>
      <text x="150" y="232" text-anchor="middle" font-size="16" font-family="Arial, sans-serif" fill="#3a5b4b">${product.size}</text>
      <rect x="92" y="246" width="116" height="8" rx="4" fill="rgba(23,48,37,0.12)" />
    </svg>
  `;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function renderCategoryTabs() {
  const categories = getCategories();
  if (!categories.includes(activeCategory)) {
    activeCategory = "Semua";
  }

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
    const matchKeyword = !keyword || `${product.name} ${product.size} ${product.sku}`.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    const fragment = productCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".product-button");
    const cardRoot = fragment.querySelector(".product-card");

    fragment.querySelector(".product-visual").style.backgroundImage = createProductArt(product);
    fragment.querySelector(".product-name").textContent = product.name;
    fragment.querySelector(".product-size").textContent = product.size;
    fragment.querySelector(".product-price").textContent = formatCurrency(product.price);
    fragment.querySelector(".product-stock").textContent = `SKU ${product.sku.slice(-6)} | stok ${product.stock}`;
    fragment.querySelector(".product-sku").textContent = product.category;
    const stockBadge = fragment.querySelector(".stock-badge");
    stockBadge.textContent = product.stock === 0 ? "Habis" : product.stock <= 5 ? "Stok menipis" : "Ready";
    stockBadge.classList.toggle("low", product.stock <= 5 && product.stock > 0);
    stockBadge.classList.toggle("empty", product.stock === 0);
    card.disabled = product.stock === 0;
    card.setAttribute("aria-disabled", product.stock === 0 ? "true" : "false");
    cardRoot.classList.toggle("sold-out", product.stock === 0);
    if (product.stock > 0) {
      card.addEventListener("click", () => addToCart(product.id));
    }
    productGrid.appendChild(fragment);
  });

  visibleCount.textContent = String(visibleProducts.length);

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<div class="empty-state">Produk tidak ditemukan. Coba kata kunci lain.</div>';
  }
}

function getNextProductId() {
  return products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
}

function setAdminImagePreview(imageUrl) {
  if (imageUrl) {
    adminImagePreview.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;
    adminImagePreview.classList.add("has-image");
    adminImagePreview.textContent = "Preview";
    return;
  }

  adminImagePreview.style.backgroundImage = "";
  adminImagePreview.classList.remove("has-image");
  adminImagePreview.textContent = "Belum ada gambar";
}

function resetAdminForm(product = null) {
  selectedAdminProductId = product ? product.id : null;
  adminFormTitle.textContent = product ? `Edit produk: ${product.name}` : "Tambah produk";
  adminNameInput.value = product?.name || "";
  adminSkuInput.value = product?.sku || "";
  adminCategoryInput.value = product?.category || "";
  adminSizeInput.value = product?.size || "";
  adminPriceInput.value = product?.price ?? "";
  adminStockInput.value = product?.stock ?? "";
  adminIconInput.value = product?.icon || "";
  adminImageInput.value = product?.image || "";
  adminImageFileInput.value = "";
  setAdminImagePreview(product?.image || "");
  deleteProductButton.disabled = !product;
}

function renderAdminProductList() {
  adminProductList.innerHTML = products.map((product) => `
    <article class="admin-product-item ${product.id === selectedAdminProductId ? "active" : ""}" data-product-id="${product.id}">
      <div class="admin-item-top">
        <strong>${product.name}</strong>
        <strong>${formatCurrency(product.price)}</strong>
      </div>
      <div class="admin-item-bottom">
        <small>${product.category} | SKU ${product.sku}</small>
        <small>Stok ${product.stock}</small>
      </div>
    </article>
  `).join("");

  adminProductList.querySelectorAll(".admin-product-item").forEach((item) => {
    item.addEventListener("click", () => {
      const product = products.find((entry) => entry.id === Number(item.dataset.productId));
      if (product) {
        resetAdminForm(product);
        renderAdminProductList();
      }
    });
  });
}

function openAdminModal() {
  renderAdminProductList();
  if (!selectedAdminProductId) {
    resetAdminForm();
  }
  adminModal.hidden = false;
}

function closeAdminModal() {
  adminModal.hidden = true;
}

function syncProductViews() {
  renderCategoryTabs();
  renderProducts();
  renderCart();
  renderAdminProductList();
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const currentQty = cart.get(productId) || 0;

  if (currentQty >= product.stock) {
    showStatus(`Stok ${product.name} sudah habis untuk transaksi ini.`);
    return;
  }

  cart.set(productId, currentQty + 1);
  showStatus(`${product.name} ditambahkan ke struk.`);
  renderCart();
}

function addToCartBySku(value) {
  const product = products.find((item) => item.sku === value.trim());
  if (!product) {
    showStatus("Barcode atau SKU tidak ditemukan.");
    return;
  }

  addToCart(product.id);
}

function showStatus(message) {
  statusBanner.textContent = message;
  statusBanner.classList.add("show");
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    statusBanner.classList.remove("show");
  }, 2400);
}

function loadTransactionHistory() {
  try {
    return JSON.parse(window.localStorage.getItem(historyStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveTransactionHistory() {
  window.localStorage.setItem(historyStorageKey, JSON.stringify(transactionHistory));
}

function generateReceiptNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");

  return `TRX-${stamp}`;
}

function finalizeTransaction() {
  if (!cart.size) {
    showStatus("Keranjang masih kosong.");
    return null;
  }

  const summary = getSummary();
  if (summary.amountPaid < summary.total) {
    showStatus("Nominal bayar masih kurang.");
    return null;
  }

  const transaction = {
    id: generateReceiptNumber(),
    date: new Date().toISOString(),
    storeName: storeNameInput.value || "Nama Toko",
    cashier: cashierNameInput.value || "-",
    paymentMethod: paymentMethodInput.value,
    memberCode: memberCodeInput.value.trim() || "-",
    items: Array.from(cart.entries()).map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      return {
        name: product.name,
        sku: product.sku,
        quantity,
        price: product.price,
        subtotal: product.price * quantity
      };
    }),
    ...summary
  };

  transaction.items.forEach((item) => {
    const product = products.find((entry) => entry.sku === item.sku);
    if (product) {
      product.stock = Math.max(product.stock - item.quantity, 0);
    }
  });

  transactionHistory = [transaction, ...transactionHistory].slice(0, 8);
  saveProducts();
  saveTransactionHistory();
  renderProducts();
  updateDailyStats();
  renderHistory();
  showStatus(`Transaksi ${transaction.id} berhasil disimpan.`);
  return transaction;
}

function renderHistory() {
  if (!transactionHistory.length) {
    historyList.innerHTML = '<div class="empty-state">Belum ada histori transaksi tersimpan.</div>';
    return;
  }

  historyList.innerHTML = transactionHistory.map((transaction) => {
    const dateText = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(transaction.date));

    return `
      <article class="history-item" data-transaction-id="${transaction.id}">
        <div class="history-item-top">
          <strong>${transaction.id}</strong>
          <strong>${formatCurrency(transaction.total)}</strong>
        </div>
        <div class="history-item-bottom">
          <small>${dateText} | ${transaction.paymentMethod}</small>
          <small>${transaction.items.length} item</small>
        </div>
      </article>
    `;
  }).join("");

  historyList.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const transaction = transactionHistory.find((entry) => entry.id === item.dataset.transactionId);
      if (!transaction) {
        return;
      }

      receiptPreview.innerHTML = buildReceiptMarkup({
        storeName: transaction.storeName,
        cashierName: transaction.cashier,
        paymentMethod: transaction.paymentMethod,
        memberCode: transaction.memberCode,
        items: transaction.items,
        summary: transaction
      }, new Date(transaction.date));
      showStatus(`Preview transaksi ${transaction.id} dimuat.`);
    });
  });
}

function resetCheckoutFields() {
  discountInput.value = "0";
  amountPaidInput.value = "50000";
  paymentMethodInput.value = "Tunai";
  memberCodeInput.value = "";
}

function updateQuantity(productId, change) {
  const product = products.find((item) => item.id === productId);
  const currentQty = cart.get(productId) || 0;
  const nextQty = currentQty + change;

  if (nextQty <= 0) {
    cart.delete(productId);
  } else if (nextQty > product.stock) {
    showStatus(`Stok ${product.name} tidak mencukupi.`);
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

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildReceiptMarkup(data, date = new Date()) {
  const itemLines = data.items.length
    ? data.items.map((item) => `
        <div>${item.name}</div>
        <div class="receipt-line">
          <span>${item.quantity} x ${formatCurrency(item.price)}</span>
          <span>${formatCurrency(item.subtotal)}</span>
        </div>
      `).join("")
    : "<div>Belum ada item</div>";

  return `
    <div class="receipt-center">
      <strong>${data.storeName || "Nama Toko"}</strong><br>
      Jl. Contoh Kasir No. 12<br>
      Kasir: ${data.cashierName || "-"}<br>
      Metode: ${data.paymentMethod}<br>
      Member: ${data.memberCode || "-"}<br>
      ${formatDate(date)}
    </div>
    <div class="receipt-divider"></div>
    ${itemLines}
    <div class="receipt-divider"></div>
    <div class="receipt-line">
      <span>Subtotal</span>
      <span>${formatCurrency(data.summary.subtotal)}</span>
    </div>
    <div class="receipt-line">
      <span>Diskon</span>
      <span>${formatCurrency(data.summary.discount)}</span>
    </div>
    <div class="receipt-line">
      <strong>Total</strong>
      <strong>${formatCurrency(data.summary.total)}</strong>
    </div>
    <div class="receipt-line">
      <span>Bayar</span>
      <span>${formatCurrency(data.summary.amountPaid)}</span>
    </div>
    <div class="receipt-line">
      <span>Kembali</span>
      <span>${formatCurrency(data.summary.change)}</span>
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-center">
      Terima kasih sudah berbelanja
    </div>
  `;
}

function updateReceiptPreview() {
  const summary = getSummary();

  const items = Array.from(cart.entries()).map(([productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return {
      name: product.name,
      quantity,
      price: product.price,
      subtotal: product.price * quantity
    };
  });

  receiptPreview.innerHTML = buildReceiptMarkup({
    storeName: storeNameInput.value,
    cashierName: cashierNameInput.value,
    paymentMethod: paymentMethodInput.value,
    memberCode: memberCodeInput.value.trim() || "-",
    items,
    summary
  });
}

function updateDailyStats() {
  const today = new Date().toLocaleDateString("sv-SE");
  const todayTransactions = transactionHistory.filter((transaction) => {
    return new Date(transaction.date).toLocaleDateString("sv-SE") === today;
  });

  const totalRevenue = todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  todayTransactionCount.textContent = String(todayTransactions.length);
  todayRevenueValue.textContent = formatCurrency(totalRevenue);
}

function openCheckoutModal() {
  if (!cart.size) {
    showStatus("Keranjang masih kosong.");
    return;
  }

  const summary = getSummary();
  const itemMarkup = Array.from(cart.entries()).map(([productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return `
      <div class="checkout-item">
        <span>${product.name} x${quantity}</span>
        <strong>${formatCurrency(product.price * quantity)}</strong>
      </div>
    `;
  }).join("");

  checkoutSummary.innerHTML = `
    <div class="checkout-box">
      <div class="checkout-line">
        <span>Kasir</span>
        <strong>${cashierNameInput.value || "-"}</strong>
      </div>
      <div class="checkout-line">
        <span>Metode</span>
        <strong>${paymentMethodInput.value}</strong>
      </div>
      <div class="checkout-line">
        <span>Member</span>
        <strong>${memberCodeInput.value.trim() || "-"}</strong>
      </div>
    </div>
    <div class="checkout-box">
      <div class="checkout-items">${itemMarkup}</div>
    </div>
    <div class="checkout-box">
      <div class="checkout-line">
        <span>Subtotal</span>
        <strong>${formatCurrency(summary.subtotal)}</strong>
      </div>
      <div class="checkout-line">
        <span>Diskon</span>
        <strong>${formatCurrency(summary.discount)}</strong>
      </div>
      <div class="checkout-line">
        <span>Bayar</span>
        <strong>${formatCurrency(summary.amountPaid)}</strong>
      </div>
      <div class="checkout-line total">
        <span>Total akhir</span>
        <strong>${formatCurrency(summary.total)}</strong>
      </div>
      <div class="checkout-line">
        <span>Kembalian</span>
        <strong>${formatCurrency(summary.change)}</strong>
      </div>
    </div>
  `;

  checkoutModal.hidden = false;
}

function closeCheckoutModal() {
  checkoutModal.hidden = true;
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
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && scanMode) {
    event.preventDefault();
    addToCartBySku(searchInput.value);
    searchInput.value = "";
    renderProducts();
  }
});
discountInput.addEventListener("input", () => {
  updateSummary();
  updateReceiptPreview();
});
amountPaidInput.addEventListener("input", () => {
  updateSummary();
  updateReceiptPreview();
});
paymentMethodInput.addEventListener("change", updateReceiptPreview);
memberCodeInput.addEventListener("input", updateReceiptPreview);
storeNameInput.addEventListener("input", updateReceiptPreview);
cashierNameInput.addEventListener("input", updateReceiptPreview);

clearCartButton.addEventListener("click", () => {
  cart.clear();
  renderCart();
});

scanButton.addEventListener("click", () => {
  scanMode = !scanMode;
  scanButton.classList.toggle("active", scanMode);
  showStatus(scanMode ? "Mode scan aktif. Tekan Enter setelah input barcode." : "Mode scan dimatikan.");
  searchInput.focus();
});

focusSearchButton.addEventListener("click", () => {
  searchInput.focus();
});

checkoutButton.addEventListener("click", () => {
  openCheckoutModal();
});

printButton.addEventListener("click", () => {
  updateReceiptPreview();
  window.print();
});

clearHistoryButton.addEventListener("click", () => {
  transactionHistory = [];
  saveTransactionHistory();
  updateDailyStats();
  renderHistory();
  showStatus("Histori transaksi dihapus.");
});

exportTransactionsButton.addEventListener("click", () => {
  downloadJson("histori-transaksi.json", transactionHistory);
  showStatus("Histori transaksi berhasil diexport.");
});

importTransactionsFile.addEventListener("change", async () => {
  const [file] = importTransactionsFile.files || [];
  if (!file) {
    return;
  }

  try {
    const data = await readJsonFile(file);
    if (!Array.isArray(data) || !data.every(isValidTransaction)) {
      throw new Error("invalid transactions");
    }

    transactionHistory = data;
    saveTransactionHistory();
    updateDailyStats();
    renderHistory();
    showStatus(`Import histori selesai: ${transactionHistory.length} transaksi.`);
  } catch {
    showStatus("File histori gagal diimport.");
  } finally {
    importTransactionsFile.value = "";
  }
});

openAdminButton.addEventListener("click", openAdminModal);
closeAdminButton.addEventListener("click", closeAdminModal);
newProductButton.addEventListener("click", () => {
  resetAdminForm();
  renderAdminProductList();
});

adminProductForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    id: selectedAdminProductId ?? getNextProductId(),
    name: adminNameInput.value.trim(),
    sku: adminSkuInput.value.trim(),
    category: adminCategoryInput.value.trim(),
    size: adminSizeInput.value.trim(),
    price: Number(adminPriceInput.value || 0),
    stock: Number(adminStockInput.value || 0),
    colorA: products.find((product) => product.id === selectedAdminProductId)?.colorA || "#eef7f0",
    colorB: products.find((product) => product.id === selectedAdminProductId)?.colorB || "#91c9a4",
    icon: (adminIconInput.value.trim() || "ITEM").slice(0, 8).toUpperCase(),
    image: adminImageInput.value.trim()
  };

  if (!payload.name || !payload.sku || !payload.category || !payload.size) {
    showStatus("Data produk belum lengkap.");
    return;
  }

  const duplicateSku = products.find((product) => product.sku === payload.sku && product.id !== payload.id);
  if (duplicateSku) {
    showStatus("SKU sudah dipakai produk lain.");
    return;
  }

  const existingIndex = products.findIndex((product) => product.id === payload.id);
  if (existingIndex >= 0) {
    products[existingIndex] = { ...products[existingIndex], ...payload };
  } else {
    products.unshift(payload);
  }

  saveProducts();
  resetAdminForm(products.find((product) => product.id === payload.id));
  syncProductViews();
  showStatus(`Produk ${payload.name} disimpan.`);
});

deleteProductButton.addEventListener("click", () => {
  if (!selectedAdminProductId) {
    return;
  }

  const index = products.findIndex((product) => product.id === selectedAdminProductId);
  if (index === -1) {
    return;
  }

  const [removed] = products.splice(index, 1);
  cart.delete(removed.id);
  saveProducts();
  resetAdminForm();
  syncProductViews();
  showStatus(`Produk ${removed.name} dihapus.`);
});

resetProductsButton.addEventListener("click", () => {
  products.splice(0, products.length, ...defaultProducts.map((product) => ({ ...product })));
  cart.clear();
  saveProducts();
  resetAdminForm();
  syncProductViews();
  showStatus("Katalog dikembalikan ke data demo.");
});

exportProductsButton.addEventListener("click", () => {
  downloadJson("produk-kasir.json", products);
  showStatus("Data produk berhasil diexport.");
});

importProductsFile.addEventListener("change", async () => {
  const [file] = importProductsFile.files || [];
  if (!file) {
    return;
  }

  try {
    const data = await readJsonFile(file);
    if (!Array.isArray(data) || !data.every(isValidProduct)) {
      throw new Error("invalid products");
    }

    products.splice(0, products.length, ...data.map(normalizeProduct));
    cart.clear();
    saveProducts();
    resetAdminForm();
    syncProductViews();
    showStatus(`Import produk selesai: ${products.length} item.`);
  } catch {
    showStatus("File produk gagal diimport.");
  } finally {
    importProductsFile.value = "";
  }
});

adminImageInput.addEventListener("input", () => {
  setAdminImagePreview(adminImageInput.value.trim());
});

adminImageFileInput.addEventListener("change", () => {
  const [file] = adminImageFileInput.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    adminImageInput.value = result;
    setAdminImagePreview(result);
    showStatus(`Gambar ${file.name} siap disimpan ke produk.`);
  });
  reader.readAsDataURL(file);
});

closeModalButton.addEventListener("click", closeCheckoutModal);
confirmCheckoutButton.addEventListener("click", () => {
  const transaction = finalizeTransaction();
  if (!transaction) {
    return;
  }

  closeCheckoutModal();
  cart.clear();
  resetCheckoutFields();
  renderCart();
});

checkoutModal.addEventListener("click", (event) => {
  if (event.target === checkoutModal) {
    closeCheckoutModal();
  }
});

adminModal.addEventListener("click", (event) => {
  if (event.target === adminModal) {
    closeAdminModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !checkoutModal.hidden) {
    closeCheckoutModal();
  }
  if (event.key === "Escape" && !adminModal.hidden) {
    closeAdminModal();
  }
});

renderCategoryTabs();
renderProducts();
renderCart();
renderHistory();
updateDailyStats();
resetAdminForm();
