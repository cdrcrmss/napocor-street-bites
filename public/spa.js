(() => {
        const root = document.getElementById("spa-root");
        if (!root) return;

        const state = {
            tab: "dashboard",
            products: [],
            sales: [],
            analytics: { day: {}, week: {}, month: {}, topItems: [] },
            cart: [],
            filter: "all",
            notice: ""
        };

        const money = (v) =>
            new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

        async function api(path, options) {
            const res = await fetch(path, {
                ...options,
                headers: { "Content-Type": "application/json", ...((options && options.headers) || {}) }
            });

            if (res.status === 401) {
                window.location.href = "/login";
                throw new Error("Unauthorized");
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Request failed");
            return data;
        }

        function setNotice(msg) {
            state.notice = msg || "";
            render();
        }

        async function refresh() {
            try {
                const [productsRes, salesRes, analyticsRes] = await Promise.all([
                    api("/api/products"),
                    api(`/api/sales?period=${state.filter}`),
                    api("/api/analytics")
                ]);
                state.products = productsRes.products || [];
                state.sales = salesRes.sales || [];
                state.analytics = analyticsRes || { day: {}, week: {}, month: {}, topItems: [] };
                render();
            } catch (err) {
                setNotice(err.message);
            }
        }

        function subtotal() {
            return state.cart.reduce((a, b) => a + Number(b.sellPrice) * b.quantity, 0);
        }

        function printReceipt(sale) {
            const lines = [
                "NAPOCOR SARI-SARI STORE",
                "----------------------------------------",
                `Receipt: ${sale.receiptCode}`,
                `Date: ${new Date(sale.createdAt).toLocaleString("en-PH")}`,
                "----------------------------------------"
            ];
            sale.items.forEach((i) => lines.push(`${i.name} x${i.quantity} = ${money(i.lineTotal)}`));
            lines.push("----------------------------------------");
            lines.push(`TOTAL: ${money(sale.subtotal)}`);
            lines.push(`PROFIT: ${money(sale.totalProfit)}`);

            const popup = window.open("", "_blank", "width=420,height=680");
            if (!popup) return;
            popup.document.write(`<pre style=\"font-family:Consolas,monospace\">${lines.join("\\n")}</pre>`);
            popup.document.close();
            popup.print();
        }

        function bindEvents() {
            root.onclick = async(event) => {
                const t = event.target;
                if (!(t instanceof HTMLElement)) return;

                if (t.dataset.tab) {
                    state.tab = t.dataset.tab;
                    render();
                    return;
                }

                if (t.dataset.logout) {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                    return;
                }

                if (t.dataset.addCart) {
                    const id = t.dataset.addCart;
                    const product = state.products.find((p) => p.id === id);
                    if (!product) return;
                    const line = state.cart.find((c) => c.productId === id);
                    const qty = line ? line.quantity : 0;
                    if (qty + 1 > product.stock) return;
                    if (line) line.quantity += 1;
                    else state.cart.push({ productId: id, name: product.name, quantity: 1, sellPrice: Number(product.sellPrice) });
                    render();
                    return;
                }

                if (t.dataset.stockDelta) {
                    const id = t.dataset.stockId;
                    const delta = Number(t.dataset.stockDelta);
                    try {
                        await api(`/api/products/${id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ stockDelta: delta })
                        });
                        await refresh();
                    } catch (e) {
                        setNotice(e.message);
                    }
                    return;
                }

                if (t.dataset.checkout) {
                    const cashInput = document.getElementById("cashInput");
                    const cash = cashInput && cashInput.value ? Number(cashInput.value) : undefined;
                    try {
                        const payload = {
                            items: state.cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
                            cashReceived: cash
                        };
                        const data = await api("/api/sales", { method: "POST", body: JSON.stringify(payload) });
                        state.cart = [];
                        printReceipt(data.sale);
                        await refresh();
                    } catch (e) {
                        setNotice(e.message);
                    }
                }
            };

            root.onchange = async(event) => {
                const t = event.target;
                if (!(t instanceof HTMLElement)) return;
                if (t.id === "salesFilter") {
                    state.filter = t.value;
                    await refresh();
                }
            };

            root.onsubmit = async(event) => {
                const form = event.target;
                if (!(form instanceof HTMLFormElement)) return;
                if (form.id !== "inventoryForm") return;
                event.preventDefault();

                const formData = new FormData(form);
                const payload = {
                    name: String(formData.get("name") || ""),
                    category: String(formData.get("category") || ""),
                    costPrice: Number(formData.get("costPrice") || 0),
                    sellPrice: Number(formData.get("sellPrice") || 0),
                    stock: Number(formData.get("stock") || 0)
                };

                try {
                    await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
                    form.reset();
                    await refresh();
                } catch (e) {
                    setNotice(e.message);
                }
            };
        }

        function renderDashboard() {
            const a = state.analytics;
            return `
      <section class="spa-grid-3">
        <article class="spa-card"><h3>Today</h3><p>${money(a.day.amount)}</p><small>${a.day.transactions || 0} tx</small></article>
        <article class="spa-card"><h3>Week</h3><p>${money(a.week.amount)}</p><small>${a.week.transactions || 0} tx</small></article>
        <article class="spa-card"><h3>Month</h3><p>${money(a.month.amount)}</p><small>${a.month.transactions || 0} tx</small></article>
      </section>
    `;
        }

        function renderInventory() {
            const rows = state.products
                .map(
                    (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${money(p.costPrice)}</td>
        <td>${money(p.sellPrice)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="spa-mini" data-stock-id="${p.id}" data-stock-delta="1">+1</button>
          <button class="spa-mini" data-stock-id="${p.id}" data-stock-delta="-1">-1</button>
        </td>
      </tr>`
                )
                .join("");

            return `
      <section>
        <article class="spa-card">
          <h2>Add Inventory Item</h2>
          <form id="inventoryForm" class="spa-form">
            <label>Name<input class="spa-input" name="name" required></label>
            <label>Category<input class="spa-input" name="category" required></label>
            <label>Cost Price<input class="spa-input" type="number" step="0.01" name="costPrice" required></label>
            <label>Selling Price<input class="spa-input" type="number" step="0.01" name="sellPrice" required></label>
            <label>Stock<input class="spa-input" type="number" name="stock" required></label>
            <button class="spa-btn primary" type="submit">Save Item</button>
          </form>
        </article>
        <article class="spa-card spa-table-wrap">
          <table class="spa-table">
            <thead><tr><th>Item</th><th>Cost</th><th>Selling</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
      </section>
    `;
        }

        function renderPos() {
            const products = state.products
                .filter((p) => p.stock > 0)
                .map(
                    (p) => `
      <div class="spa-product">
        <h4>${p.name}</h4>
        <p class="spa-muted">Stock: ${p.stock}</p>
        <p>${money(p.sellPrice)}</p>
        <button class="spa-btn primary" data-add-cart="${p.id}">Add</button>
      </div>`
                )
                .join("");

            const cartRows = state.cart
                .map((c) => `<tr><td>${c.name}</td><td>${c.quantity}</td><td>${money(c.quantity * c.sellPrice)}</td></tr>`)
                .join("");

            return `
      <section class="spa-split">
        <article class="spa-card"><h2>Products</h2><div class="spa-products">${products}</div></article>
        <article class="spa-card">
          <h2>Cart</h2>
          <div class="spa-table-wrap"><table class="spa-table"><thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>${cartRows}</tbody></table></div>
          <p>Subtotal: <strong>${money(subtotal())}</strong></p>
          <label>Cash<input id="cashInput" class="spa-input" type="number" step="0.01"></label>
          <button class="spa-btn primary" data-checkout="1">Checkout + Receipt</button>
        </article>
      </section>
    `;
        }

        function renderSales() {
            const rows = state.sales
                .map(
                    (s) => `<tr><td>${s.receiptCode}</td><td>${new Date(s.createdAt).toLocaleString("en-PH")}</td><td>${money(s.subtotal)}</td><td>${money(s.totalProfit)}</td></tr>`
                )
                .join("");

            return `
      <section>
        <article class="spa-card">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
            <h2>Sales</h2>
            <select id="salesFilter" class="spa-select">
              <option value="all" ${state.filter === "all" ? "selected" : ""}>All</option>
              <option value="day" ${state.filter === "day" ? "selected" : ""}>Day</option>
              <option value="week" ${state.filter === "week" ? "selected" : ""}>Week</option>
              <option value="month" ${state.filter === "month" ? "selected" : ""}>Month</option>
            </select>
          </div>
          <div class="spa-table-wrap"><table class="spa-table"><thead><tr><th>Receipt</th><th>Date</th><th>Total</th><th>Profit</th></tr></thead><tbody>${rows}</tbody></table></div>
        </article>
      </section>
    `;
        }

        function renderBody() {
            if (state.tab === "inventory") return renderInventory();
            if (state.tab === "pos") return renderPos();
            if (state.tab === "sales") return renderSales();
            return renderDashboard();
        }

        function render() {
            root.innerHTML = `
      <header class="spa-header">
        <div>
          <p class="spa-kicker">Admin-only POS + Inventory</p>
          <h1 class="spa-title">Napocor Sari-Sari Store</h1>
        </div>
        <button class="spa-btn" data-logout="1">Logout</button>
      </header>
      ${state.notice ? `<p class="spa-notice">${state.notice}</p>` : ""}
      <nav class="spa-tabs">
        <button class="spa-tab ${state.tab === "dashboard" ? "active" : ""}" data-tab="dashboard">Dashboard</button>
        <button class="spa-tab ${state.tab === "inventory" ? "active" : ""}" data-tab="inventory">Inventory</button>
        <button class="spa-tab ${state.tab === "pos" ? "active" : ""}" data-tab="pos">POS</button>
        <button class="spa-tab ${state.tab === "sales" ? "active" : ""}" data-tab="sales">Sales</button>
      </nav>
      ${renderBody()}
    `;
  }

  bindEvents();
  render();
  refresh();
})();