(() => {
        const root = document.getElementById("spa-root");
        if (!root) return;

        const state = {
            tab: "dashboard",
            products: [],
            sales: [],
            analytics: {
                day: { amount: 0, profit: 0, transactions: 0 },
                week: { amount: 0, profit: 0, transactions: 0 },
                month: { amount: 0, profit: 0, transactions: 0 },
                topItems: []
            },
            cart: [],
            filter: "all",
            salesSearch: "",
            posSearch: "",
            inventorySearch: "",
            cashInput: "",
            notice: ""
        };

        const currency = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP"
        });

        const money = (value) => currency.format(Number(value || 0));

        function getBundleFromName(name) {
            const match = String(name || "").match(/(\d+)\s*for\s*([0-9]+(?:\.[0-9]+)?)/i);
            if (!match) {
                return null;
            }

            return {
                quantity: Number(match[1]),
                price: Number(match[2])
            };
        }

        function renderWithFocus(inputId) {
            const current = document.getElementById(inputId);
            let start = null;
            let end = null;

            if (current && typeof current.selectionStart === "number") {
                start = current.selectionStart;
                end = current.selectionEnd;
            }

            render();

            const next = document.getElementById(inputId);
            if (!next) {
                return;
            }

            next.focus();
            if (typeof start === "number" && typeof next.setSelectionRange === "function") {
                const max = next.value.length;
                const safeStart = Math.min(start, max);
                const safeEnd = Math.min(typeof end === "number" ? end : start, max);
                next.setSelectionRange(safeStart, safeEnd);
            }
        }

        function toDateTime(value) {
            return new Date(value).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        function setNotice(message) {
            state.notice = message || "";
            render();
        }

        async function api(path, options) {
            const response = await fetch(path, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...((options && options.headers) || {})
                }
            });

            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }

            return data;
        }

        function sanitizeNumberInput(value) {
            const cleaned = String(value || "").replace(/[^0-9.]/g, "");
            const segments = cleaned.split(".");
            if (segments.length <= 1) {
                return cleaned;
            }
            return `${segments[0]}.${segments.slice(1).join("")}`;
        }

        function getCashReceived() {
            const numeric = Number(state.cashInput || 0);
            return Number.isFinite(numeric) ? numeric : 0;
        }

        function getSubtotal() {
            return state.cart.reduce((total, item) => total + item.sellPrice * item.quantity, 0);
        }

        function getCartItemCount() {
            return state.cart.reduce((count, item) => count + item.quantity, 0);
        }

        function getChange() {
            return Math.max(0, getCashReceived() - getSubtotal());
        }

        function findProduct(productId) {
            return state.products.find((product) => product.id === productId);
        }

        function resetPosInputs() {
            state.cashInput = "";
        }

        function addToCart(productId) {
            const product = findProduct(productId);
            if (!product || product.stock <= 0) {
                setNotice("Item is out of stock.");
                return;
            }

            const line = state.cart.find((entry) => entry.productId === productId);
            const currentQty = line ? line.quantity : 0;

            if (currentQty + 1 > product.stock) {
                setNotice(`Only ${product.stock} in stock for ${product.name}.`);
                return;
            }

            if (line) {
                line.quantity += 1;
            } else {
                state.cart.push({
                    productId,
                    name: product.name,
                    sellPrice: Number(product.sellPrice),
                    quantity: 1
                });
            }

            render();
        }

        function changeCartQuantity(productId, delta) {
            const product = findProduct(productId);
            if (!product) {
                return;
            }

            state.cart = state.cart
                .map((line) => {
                    if (line.productId !== productId) {
                        return line;
                    }

                    const nextQty = line.quantity + delta;
                    if (nextQty <= 0) {
                        return null;
                    }

                    if (nextQty > product.stock) {
                        setNotice(`Only ${product.stock} in stock for ${product.name}.`);
                        return line;
                    }

                    return {...line, quantity: nextQty };
                })
                .filter(Boolean);

            render();
        }

        function removeCartItem(productId) {
            state.cart = state.cart.filter((line) => line.productId !== productId);
            render();
        }

        function clearCart() {
            state.cart = [];
            resetPosInputs();
            render();
        }

        function pushCashInput(text) {
            if (text === "CLR") {
                state.cashInput = "";
                renderWithFocus("cashInput");
                return;
            }

            if (text === "BACK") {
                state.cashInput = state.cashInput.slice(0, -1);
                renderWithFocus("cashInput");
                return;
            }

            const next = sanitizeNumberInput(state.cashInput + text);
            state.cashInput = next;
            renderWithFocus("cashInput");
        }

        function addCashShortcut(value) {
            const current = getCashReceived();
            state.cashInput = String(current + value);
            renderWithFocus("cashInput");
        }

        function printReceipt(sale) {
            const lines = [
                "NAPOCOR STREET BITES",
                "----------------------------------------",
                `Receipt: ${sale.receiptCode}`,
                `Date: ${toDateTime(sale.createdAt)}`,
                "----------------------------------------"
            ];

            sale.items.forEach((item) => {
                lines.push(`${item.name}`);
                lines.push(`  ${item.quantity} x ${money(item.sellPrice)} = ${money(item.lineTotal)}`);
            });

            lines.push("----------------------------------------");
            lines.push(`TOTAL: ${money(sale.subtotal)}`);
            if (sale.cashReceived !== null) {
                lines.push(`CASH: ${money(sale.cashReceived)}`);
                lines.push(`CHANGE: ${money(sale.changeGiven)}`);
            }
            lines.push(`PROFIT: ${money(sale.totalProfit)}`);

            const popup = window.open("", "_blank", "width=460,height=720");
            if (!popup) {
                setNotice("Please allow pop-ups to print receipt.");
                return;
            }

            popup.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Consolas, monospace; margin: 16px; }
            pre { white-space: pre-wrap; line-height: 1.5; font-size: 13px; }
          </style>
        </head>
        <body>
          <pre>${lines.join("\n")}</pre>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);
            popup.document.close();
        }

        async function checkout() {
            if (state.cart.length === 0) {
                setNotice("Cart is empty.");
                return;
            }

            const subtotal = getSubtotal();
            const cash = getCashReceived();

            if (cash > 0 && cash < subtotal) {
                setNotice("Cash received is less than the total amount.");
                return;
            }

            try {
                const payload = {
                    items: state.cart.map((line) => ({ productId: line.productId, quantity: line.quantity }))
                };

                if (cash > 0) {
                    payload.cashReceived = cash;
                }

                const data = await api("/api/sales", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                state.cart = [];
                resetPosInputs();
                state.notice = "Checkout complete.";
                printReceipt(data.sale);
                await refresh();
            } catch (error) {
                setNotice(error.message);
            }
        }

        async function refresh() {
            try {
                const query = new URLSearchParams({
                    period: state.filter,
                    search: state.salesSearch
                }).toString();

                const [productsRes, salesRes, analyticsRes] = await Promise.all([
                    api("/api/products"),
                    api(`/api/sales?${query}`),
                    api("/api/analytics")
                ]);

                state.products = productsRes.products || [];
                state.sales = salesRes.sales || [];
                state.analytics = analyticsRes || state.analytics;
                render();
            } catch (error) {
                setNotice(error.message);
            }
        }

        async function handleInventoryStock(productId, delta) {
            try {
                await api(`/api/products/${productId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ stockDelta: delta })
                });
                await refresh();
            } catch (error) {
                setNotice(error.message);
            }
        }

        async function handleInventoryDelete(productId) {
            if (!window.confirm("Delete this product from inventory?")) {
                return;
            }

            try {
                await api(`/api/products/${productId}`, {
                    method: "DELETE"
                });
                await refresh();
            } catch (error) {
                setNotice(error.message);
            }
        }

        async function handleInventoryEditPrice(productId) {
            const product = findProduct(productId);
            if (!product) {
                return;
            }

            const nextCost = window.prompt("New original price (cost):", String(product.costPrice));
            const nextSell = window.prompt("New selling price:", String(product.sellPrice));

            if (nextCost === null || nextSell === null) {
                return;
            }

            const costPrice = Number(nextCost);
            const sellPrice = Number(nextSell);

            if (!Number.isFinite(costPrice) || !Number.isFinite(sellPrice) || costPrice < 0 || sellPrice < 0) {
                setNotice("Invalid price values.");
                return;
            }

            try {
                await api(`/api/products/${productId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ costPrice, sellPrice })
                });
                await refresh();
            } catch (error) {
                setNotice(error.message);
            }
        }

        async function handleLogout() {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
        }

        function bindEvents() {
            root.addEventListener("click", async(event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;

                const clickable = target.closest("button, [data-action]");
                if (!(clickable instanceof HTMLElement)) return;

                if (clickable.dataset.tab) {
                    state.tab = clickable.dataset.tab;
                    render();
                    return;
                }

                if (clickable.dataset.action === "logout") {
                    await handleLogout();
                    return;
                }

                if (clickable.dataset.action === "add-cart") {
                    addToCart(clickable.dataset.id);
                    return;
                }

                if (clickable.dataset.action === "cart-plus") {
                    changeCartQuantity(clickable.dataset.id, 1);
                    return;
                }

                if (clickable.dataset.action === "cart-minus") {
                    changeCartQuantity(clickable.dataset.id, -1);
                    return;
                }

                if (clickable.dataset.action === "cart-remove") {
                    removeCartItem(clickable.dataset.id);
                    return;
                }

                if (clickable.dataset.action === "cart-clear") {
                    clearCart();
                    return;
                }

                if (clickable.dataset.action === "checkout") {
                    await checkout();
                    return;
                }

                if (clickable.dataset.action === "stock-change") {
                    await handleInventoryStock(clickable.dataset.id, Number(clickable.dataset.delta));
                    return;
                }

                if (clickable.dataset.action === "inventory-delete") {
                    await handleInventoryDelete(clickable.dataset.id);
                    return;
                }

                if (clickable.dataset.action === "inventory-price") {
                    await handleInventoryEditPrice(clickable.dataset.id);
                    return;
                }

                if (clickable.dataset.action === "cash-key") {
                    pushCashInput(clickable.dataset.key || "");
                    return;
                }

                if (clickable.dataset.action === "cash-shortcut") {
                    addCashShortcut(Number(clickable.dataset.value || 0));
                    return;
                }
            });

            root.addEventListener("input", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;

                if (target.id === "posSearch") {
                    state.posSearch = target.value;
                    renderWithFocus("posSearch");
                }

                if (target.id === "inventorySearch") {
                    state.inventorySearch = target.value;
                    renderWithFocus("inventorySearch");
                }

                if (target.id === "salesSearch") {
                    state.salesSearch = target.value;
                }

                if (target.id === "cashInput") {
                    state.cashInput = sanitizeNumberInput(target.value);
                    renderWithFocus("cashInput");
                }
            });

            root.addEventListener("change", async(event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;

                if (target.id === "salesFilter") {
                    state.filter = target.value;
                    await refresh();
                }
            });

            root.addEventListener("submit", async(event) => {
                const form = event.target;
                if (!(form instanceof HTMLFormElement)) return;

                if (form.id === "inventoryForm") {
                    event.preventDefault();

                    const formData = new FormData(form);
                    const costPrice = Number(formData.get("costPrice") || 0);
                    const sellPrice = Number(formData.get("sellPrice") || 0);
                    const stockRaw = Number(formData.get("stock") || 0);
                    const payload = {
                        name: String(formData.get("name") || "").trim(),
                        category: String(formData.get("category") || "").trim(),
                        costPrice: Number.isFinite(costPrice) && costPrice >= 0 ? costPrice : 0,
                        sellPrice: Number.isFinite(sellPrice) && sellPrice >= 0 ? sellPrice : 0,
                        stock: Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.trunc(stockRaw) : 0
                    };

                    if (!payload.name || !payload.category) {
                        setNotice("Item name and category are required.");
                        return;
                    }

                    try {
                        await api("/api/products", {
                            method: "POST",
                            body: JSON.stringify(payload)
                        });
                        form.reset();
                        await refresh();
                    } catch (error) {
                        setNotice(error.message);
                    }
                    return;
                }

                if (form.id === "salesSearchForm") {
                    event.preventDefault();
                    await refresh();
                }
            });
        }

        function renderStatsCards() {
            const groups = [
                { title: "Today", data: state.analytics.day },
                { title: "This Week", data: state.analytics.week },
                { title: "This Month", data: state.analytics.month }
            ];

            return groups
                .map(
                    (group) => `
      <article class="spa-card spa-stat-card">
        <p class="spa-stat-label">${group.title}</p>
        <h3 class="spa-stat-amount">${money(group.data.amount)}</h3>
        <p class="spa-muted">${group.data.transactions || 0} transactions</p>
        <p class="spa-muted">Profit: ${money(group.data.profit)}</p>
      </article>
    `
                )
                .join("");
        }

        function renderTopItems() {
            const items = state.analytics.topItems || [];
            if (items.length === 0) {
                return `<p class="spa-muted">No top-selling items yet this month.</p>`;
            }

            return items
                .map(
                    (item) => `
      <div class="spa-top-item">
        <span>${item.name}</span>
        <strong>${item.quantity} sold</strong>
      </div>
    `
                )
                .join("");
        }

        function renderDashboard() {
            return `
      <section class="spa-dashboard-grid">
        ${renderStatsCards()}
      </section>
      <section class="spa-card">
        <div class="spa-card-head">
          <h2>Top Sellers This Month</h2>
        </div>
        <div class="spa-top-list">
          ${renderTopItems()}
        </div>
      </section>
    `;
        }

        function stockClass(stock) {
            if (stock <= 0) return "is-out";
            if (stock <= 5) return "is-low";
            return "is-good";
        }

        function filteredInventory() {
            const q = state.inventorySearch.trim().toLowerCase();
            if (!q) {
                return state.products;
            }

            return state.products.filter((item) => {
                return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
            });
        }

        function renderInventoryRows() {
            const rows = filteredInventory();

            if (rows.length === 0) {
                return `<tr><td colspan="8" class="spa-muted">No matching inventory items.</td></tr>`;
            }

            return rows
                .map((item) => {
                    const margin = Number(item.sellPrice) - Number(item.costPrice);
                    return `
          <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${money(item.costPrice)}</td>
            <td>${money(item.sellPrice)}</td>
            <td>${money(margin)}</td>
            <td><span class="spa-stock ${stockClass(item.stock)}">${item.stock}</span></td>
            <td>
              <button class="spa-mini" data-action="stock-change" data-id="${item.id}" data-delta="1">+1</button>
              <button class="spa-mini" data-action="stock-change" data-id="${item.id}" data-delta="5">+5</button>
              <button class="spa-mini" data-action="stock-change" data-id="${item.id}" data-delta="-1">-1</button>
            </td>
            <td>
              <button class="spa-mini" data-action="inventory-price" data-id="${item.id}">Price</button>
              <button class="spa-mini danger" data-action="inventory-delete" data-id="${item.id}">Delete</button>
            </td>
          </tr>
        `;
                })
                .join("");
        }

        function renderInventory() {
            return `
      <section class="spa-stack">
        <article class="spa-card">
          <div class="spa-card-head">
            <h2>Add Inventory Item</h2>
          </div>
          <form id="inventoryForm" class="spa-form">
            <label>Item Name<input class="spa-input" name="name" required></label>
            <label>Category<input class="spa-input" name="category" required></label>
                        <label>Original Price<input class="spa-input" type="number" step="0.01" min="0" name="costPrice" placeholder="0.00 (optional)"></label>
            <label>Selling Price<input class="spa-input" type="number" step="0.01" name="sellPrice" required></label>
                        <label>Starting Stock<input class="spa-input" type="number" step="1" min="0" name="stock" placeholder="0 (optional)"></label>
            <button class="spa-btn primary" type="submit">Save Item</button>
          </form>
        </article>

        <article class="spa-card">
          <div class="spa-card-head">
            <h2>Inventory List</h2>
            <input id="inventorySearch" class="spa-input" value="${state.inventorySearch}" placeholder="Search item or category">
          </div>
          <div class="spa-table-wrap">
            <table class="spa-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Original</th>
                  <th>Selling</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Stock Tools</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${renderInventoryRows()}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    `;
        }

        function filteredProductsForPos() {
            const q = state.posSearch.trim().toLowerCase();
            return state.products.filter((item) => {
                if (!q) {
                    return true;
                }
                return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
            });
        }

        function renderPosProducts() {
            const list = filteredProductsForPos();
            if (list.length === 0) {
                return `<p class="spa-muted">No products found for the current search.</p>`;
            }

            return list
                .map((item) => {
                        const bundle = getBundleFromName(item.name);
                        return `
      <div class="spa-product">
        <p class="spa-product-name">${item.name}</p>
                ${
                    bundle
                        ? `<p class="spa-bundle">Bundle price: ${bundle.quantity} for ${money(bundle.price)}</p>`
                        : ""
                }
        <p class="spa-muted">${item.category}</p>
        <div class="spa-product-meta">
          <span>Stock: ${item.stock}</span>
          <strong>${money(item.sellPrice)}</strong>
        </div>
                <button class="spa-btn primary ${item.stock <= 0 ? "disabled" : ""}" data-action="add-cart" data-id="${item.id}" ${
                    item.stock <= 0 ? "disabled" : ""
                }>${item.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
      </div>
        `;
                                })
                .join("");
        }

        function renderCartRows() {
            if (state.cart.length === 0) {
                return `<tr><td colspan="5" class="spa-muted">Cart is empty.</td></tr>`;
            }

            return state.cart
                .map((line) => {
                    const lineTotal = line.quantity * line.sellPrice;
                                        const bundle = getBundleFromName(line.name);
                    return `
          <tr>
                        <td>
                            ${line.name}
                            ${bundle ? `<div class="spa-bundle-inline">Bundle: ${bundle.quantity} for ${money(bundle.price)}</div>` : ""}
                        </td>
            <td>
              <button class="spa-mini" data-action="cart-minus" data-id="${line.productId}">-</button>
              <span class="spa-qty">${line.quantity}</span>
              <button class="spa-mini" data-action="cart-plus" data-id="${line.productId}">+</button>
            </td>
            <td>${money(line.sellPrice)}</td>
            <td>${money(lineTotal)}</td>
            <td><button class="spa-mini danger" data-action="cart-remove" data-id="${line.productId}">x</button></td>
          </tr>
        `;
                })
                .join("");
        }

        function renderCashKeypad() {
            const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "BACK"];

            return keys
                .map((key) => {
                    const label = key === "BACK" ? "<-" : key;
                    return `<button class="spa-key" data-action="cash-key" data-key="${key}">${label}</button>`;
                })
                .join("");
        }

        function renderPos() {
            const subtotal = getSubtotal();
            const cash = getCashReceived();
            const change = getChange();

            return `
      <section class="spa-pos-grid">
        <article class="spa-card">
          <div class="spa-card-head">
            <h2>Product Catalog</h2>
            <input id="posSearch" class="spa-input" value="${state.posSearch}" placeholder="Search products">
          </div>
          <div class="spa-products-grid">
            ${renderPosProducts()}
          </div>
        </article>

        <article class="spa-card">
          <div class="spa-card-head">
            <h2>Point of Sale</h2>
            <button class="spa-btn" data-action="cart-clear">Clear Cart</button>
          </div>

          <div class="spa-table-wrap">
            <table class="spa-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${renderCartRows()}
              </tbody>
            </table>
          </div>

          <div class="spa-pos-summary">
            <p><span>Items:</span><strong>${getCartItemCount()}</strong></p>
            <p><span>Subtotal (Selling Price):</span><strong>${money(subtotal)}</strong></p>
            <p><span>Cash Received:</span><strong>${money(cash)}</strong></p>
            <p class="spa-change"><span>Change:</span><strong>${money(change)}</strong></p>
          </div>

          <div class="spa-cash-panel">
            <label>Cash Input
              <input id="cashInput" class="spa-input" value="${state.cashInput}" placeholder="0.00">
            </label>
            <div class="spa-shortcuts">
              <button class="spa-chip" data-action="cash-shortcut" data-value="20">+20</button>
              <button class="spa-chip" data-action="cash-shortcut" data-value="50">+50</button>
              <button class="spa-chip" data-action="cash-shortcut" data-value="100">+100</button>
              <button class="spa-chip" data-action="cash-shortcut" data-value="500">+500</button>
              <button class="spa-chip" data-action="cash-key" data-key="CLR">Clear</button>
            </div>
            <div class="spa-keypad">
              ${renderCashKeypad()}
            </div>
          </div>

          <button class="spa-btn primary spa-checkout-btn" data-action="checkout">Checkout and Print Receipt</button>
        </article>
      </section>
    `;
        }

        function renderSalesRows() {
            if (state.sales.length === 0) {
                return `<tr><td colspan="5" class="spa-muted">No sales transactions found.</td></tr>`;
            }

            return state.sales
                .map((sale) => {
                    const itemCount = sale.items.reduce((count, item) => count + item.quantity, 0);
                    return `
          <tr>
            <td>${sale.receiptCode}</td>
            <td>${toDateTime(sale.createdAt)}</td>
            <td>${itemCount}</td>
            <td>${money(sale.subtotal)}</td>
            <td>${money(sale.totalProfit)}</td>
          </tr>
        `;
                })
                .join("");
        }

        function renderSales() {
            return `
      <section class="spa-stack">
        <article class="spa-card">
          <form id="salesSearchForm" class="spa-sales-tools">
            <h2>Sales History</h2>
            <select id="salesFilter" class="spa-select">
              <option value="all" ${state.filter === "all" ? "selected" : ""}>All</option>
              <option value="day" ${state.filter === "day" ? "selected" : ""}>Today</option>
              <option value="week" ${state.filter === "week" ? "selected" : ""}>This Week</option>
              <option value="month" ${state.filter === "month" ? "selected" : ""}>This Month</option>
            </select>
            <input id="salesSearch" class="spa-input" value="${state.salesSearch}" placeholder="Search receipt code">
            <button class="spa-btn" type="submit">Search</button>
          </form>

          <div class="spa-table-wrap">
            <table class="spa-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Sales</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                ${renderSalesRows()}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    `;
        }

        function renderBody() {
            if (state.tab === "inventory") {
                return renderInventory();
            }
            if (state.tab === "pos") {
                return renderPos();
            }
            if (state.tab === "sales") {
                return renderSales();
            }
            return renderDashboard();
        }

        function render() {
            root.innerHTML = `
      <div class="spa-bg"></div>
      <header class="spa-header">
        <div>
          <p class="spa-kicker">Admin Panel</p>
          <h1 class="spa-title">Napocor Street Bites</h1>
          <p class="spa-muted">Modern inventory, POS, and sales analytics</p>
        </div>
        <button class="spa-btn" data-action="logout">Logout</button>
      </header>

      ${state.notice ? `<p class="spa-notice">${state.notice}</p>` : ""}

      <nav class="spa-tabs">
        <button class="spa-tab ${state.tab === "dashboard" ? "active" : ""}" data-tab="dashboard">Dashboard</button>
        <button class="spa-tab ${state.tab === "inventory" ? "active" : ""}" data-tab="inventory">Inventory</button>
        <button class="spa-tab ${state.tab === "pos" ? "active" : ""}" data-tab="pos">Point of Sale</button>
        <button class="spa-tab ${state.tab === "sales" ? "active" : ""}" data-tab="sales">Sales</button>
      </nav>

      <main>
        ${renderBody()}
      </main>
    `;
  }

  bindEvents();
  render();
  refresh();
})();