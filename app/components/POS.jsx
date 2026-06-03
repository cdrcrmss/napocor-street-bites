"use client";

import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, X, CreditCard, Trash2 } from "lucide-react";
import ReceiptModal from "./ReceiptModal";

const money = (v) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

function sanitizeNum(v) {
    const c = String(v || "").replace(/[^0-9.]/g, "");
    const parts = c.split(".");
    return parts.length <= 1 ? c : `${parts[0]}.${parts.slice(1).join("")}`;
}

export default function POS({ products, onRefresh, onNotice }) {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [cashInput, setCashInput] = useState("");
    const [checking, setChecking] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const subtotal = cart.reduce((s, i) => s + i.sellPrice * i.quantity, 0);
    const cash = Number(cashInput) || 0;
    const change = Math.max(0, cash - subtotal);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    const filtered = products.filter((p) => {
        const q = search.trim().toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

    function addToCart(product) {
        if (product.stock <= 0) { onNotice("Item is out of stock."); return; }
        setCart((prev) => {
            const line = prev.find((l) => l.productId === product.id);
            const cur = line ? line.quantity : 0;
            if (cur + 1 > product.stock) { onNotice(`Only ${product.stock} in stock.`); return prev; }
            if (line) return prev.map((l) => l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l);
            return [...prev, { productId: product.id, name: product.name, sellPrice: Number(product.sellPrice), quantity: 1 }];
        });
    }

    function changeQty(productId, delta) {
        const product = products.find((p) => p.id === productId);
        setCart((prev) =>
            prev.map((l) => {
                if (l.productId !== productId) return l;
                const next = l.quantity + delta;
                if (next <= 0) return null;
                if (product && next > product.stock) { onNotice(`Only ${product.stock} in stock.`); return l; }
                return { ...l, quantity: next };
            }).filter(Boolean)
        );
    }

    function removeItem(productId) { setCart((p) => p.filter((l) => l.productId !== productId)); }
    function clearCart() { setCart([]); setCashInput(""); }

    async function checkout() {
        if (cart.length === 0) { onNotice("Cart is empty."); return; }
        if (cash > 0 && cash < subtotal) { onNotice("Cash received is less than the total."); return; }
        setChecking(true);
        try {
            const payload = { items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })) };
            if (cash > 0) payload.cashReceived = cash;
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.status === 401) { window.location.href = "/login"; return; }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Checkout failed.");
            clearCart();
            setReceipt(data.sale);
            onRefresh();
        } catch (err) { onNotice(err.message); }
        finally { setChecking(false); }
    }

    const SHORTCUTS = [20, 50, 100, 200, 500, 1000];
    const KEYS = ["7","8","9","4","5","6","1","2","3",".","0","⌫"];

    return (
        <>
        {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Product Catalog</h2>
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                    {filtered.length === 0 ? (
                        <p className="col-span-full text-gray-400 dark:text-slate-500 text-sm text-center py-8">No products found.</p>
                    ) : filtered.map((item) => {
                        const outOfStock = item.stock <= 0;
                        const lowStock = item.stock > 0 && item.stock <= 5;
                        return (
                            <div
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className={`relative group flex flex-col p-3 rounded-xl border cursor-pointer transition-all select-none ${
                                    outOfStock
                                        ? "bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-800 opacity-60 hover:opacity-80"
                                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-white dark:hover:bg-slate-800/90 active:scale-95"
                                }`}
                            >
                                <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm leading-snug mb-0.5 line-clamp-2">{item.name}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">{item.category}</p>
                                <div className="mt-auto flex items-center justify-between gap-1">
                                    <span className="text-orange-400 font-bold text-sm">{money(item.sellPrice)}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                                        outOfStock ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" :
                                        lowStock   ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400" :
                                                     "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400"
                                    }`}>
                                        {outOfStock ? "Out" : `${item.stock}`}
                                    </span>
                                </div>
                                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    outOfStock
                                        ? "bg-slate-700 opacity-0 group-hover:opacity-100"
                                        : "bg-orange-500 opacity-0 group-hover:opacity-100 shadow-sm shadow-orange-500/40"
                                }`}>
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-orange-500" />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cart</h2>
                        {cartCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-48">
                    {cart.length === 0 ? (
                        <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6">Cart is empty. Add products.</p>
                    ) : cart.map((line) => (
                        <div key={line.productId} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-2.5">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{line.name}</p>
                                <p className="text-xs text-orange-400">{money(line.sellPrice)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => changeQty(line.productId, -1)} className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                                    <Minus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">{line.quantity}</span>
                                <button onClick={() => changeQty(line.productId, 1)} className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                                    <Plus className="w-3 h-3 text-gray-600 dark:text-slate-300" />
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right flex-shrink-0">
                                {money(line.sellPrice * line.quantity)}
                            </p>
                            <button onClick={() => removeItem(line.productId)} className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">Subtotal</span>
                        <span className="font-bold text-gray-900 dark:text-white text-base">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">Cash</span>
                        <span className="font-semibold text-gray-700 dark:text-slate-200">{money(cash)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">Change</span>
                        <span className={`font-bold ${change > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-400"}`}>{money(change)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex gap-1 flex-wrap">
                        {SHORTCUTS.map((v) => (
                            <button
                                key={v}
                                onClick={() => setCashInput((p) => String((Number(p) || 0) + v))}
                                className="flex-1 min-w-[2.8rem] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                +{v}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={cashInput}
                            onChange={(e) => setCashInput(sanitizeNum(e.target.value))}
                            placeholder="Cash received (optional)"
                            className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {cashInput && (
                            <button onClick={() => setCashInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {KEYS.map((k) => (
                            <button
                                key={k}
                                onClick={() => {
                                    if (k === "⌫") setCashInput((p) => p.slice(0, -1));
                                    else setCashInput((p) => sanitizeNum(p + k));
                                }}
                                className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={checkout}
                    disabled={checking || cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CreditCard className="w-4 h-4" />
                    {checking ? "Processing..." : "Checkout & Print Receipt"}
                </button>
            </div>
        </div>
        </>
    );
}
