"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Package, X, Info } from "lucide-react";

const money = (v) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

const INPUT = "w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all";

function StockBadge({ stock }) {
    if (stock <= 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">Out of stock</span>;
    if (stock <= 5) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">{stock} — Low</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">{stock} in stock</span>;
}

function ProfitPreview({ cost, sell }) {
    const cp = Number(cost) || 0;
    const sp = Number(sell) || 0;
    const profit = sp - cp;
    const pct = sp > 0 ? ((profit / sp) * 100).toFixed(1) : 0;
    if (!sp) return null;
    return (
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
            profit >= 0
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
        }`}>
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
                Profit per unit: <strong>{money(profit)}</strong>
                {sp > 0 && <span className="ml-1 opacity-70">({pct}% margin)</span>}
            </span>
        </div>
    );
}

function ItemModal({ initial, onClose, onSave, categories }) {
    const isEdit = !!initial;
    const [name,      setName]      = useState(initial?.name      ?? "");
    const [category,  setCategory]  = useState(initial?.category  ?? "");
    const [costPrice, setCostPrice] = useState(initial ? String(Number(initial.costPrice)) : "");
    const [sellPrice, setSellPrice] = useState(initial ? String(Number(initial.sellPrice)) : "");
    const [stock,     setStock]     = useState(initial ? String(initial.stock) : "0");
    const [saving,    setSaving]    = useState(false);
    const [err,       setErr]       = useState("");
    const [customCat, setCustomCat] = useState(!categories.includes(initial?.category ?? ""));

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        const cp = Number(costPrice) || 0;
        const sp = Number(sellPrice) || 0;
        if (!name.trim()) { setErr("Item name is required."); return; }
        if (!category.trim()) { setErr("Category is required."); return; }
        if (sp <= 0) { setErr("Selling price must be greater than 0."); return; }
        setSaving(true);
        try {
            await onSave({ name: name.trim(), category: category.trim(), costPrice: cp, sellPrice: sp, stock: Math.max(0, Math.trunc(Number(stock) || 0)) });
            onClose();
        } catch (ex) { setErr(ex.message); }
        finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {isEdit ? `Edit — ${initial.name}` : "Add New Item"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chippy, Milo 3-in-1" className={INPUT} autoFocus />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                        {!customCat && categories.length > 0 ? (
                            <div className="flex gap-2">
                                <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT + " flex-1"}>
                                    <option value="">— Select category —</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button type="button" onClick={() => { setCustomCat(true); setCategory(""); }} className="px-3 py-2 text-xs font-semibold text-orange-500 border border-orange-300 dark:border-orange-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors whitespace-nowrap">
                                    + New
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g. Snacks, Beverages" className={INPUT + " flex-1"} />
                                {categories.length > 0 && (
                                    <button type="button" onClick={() => { setCustomCat(false); setCategory(""); }} className="px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        Pick
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                Cost Price (₱)
                            </label>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1.5">What you paid (buying price)</p>
                            <input type="number" step="0.01" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" className={INPUT} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                Selling Price (₱) <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1.5">What customers pay</p>
                            <input type="number" step="0.01" min="0.01" required value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0.00" className={INPUT} />
                        </div>
                    </div>

                    <ProfitPreview cost={costPrice} sell={sellPrice} />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                            {isEdit ? "Set Stock to" : "Initial Stock"}
                        </label>
                        <input type="number" step="1" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className={INPUT} />
                    </div>

                    {err && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-2.5">
                            {err}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all text-sm disabled:opacity-50 shadow-lg shadow-orange-500/20">
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Inventory({ products, onRefresh, onNotice }) {
    const [search,      setSearch]      = useState("");
    const [showAdd,     setShowAdd]     = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const categories = [...new Set(products.map(p => p.category))].sort();

    const filtered = products.filter((p) => {
        const q = search.trim().toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

    async function api(path, opts) {
        const res = await fetch(path, {
            ...opts,
            headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
        });
        if (res.status === 401) { window.location.href = "/login"; throw new Error("Unauthorized"); }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    }

    async function handleAdd(payload) {
        await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
        onNotice(`✓ Added: ${payload.name}`);
        onRefresh();
    }

    async function handleEdit(payload) {
        await api(`/api/products/${editProduct.id}`, {
            method: "PATCH",
            body: JSON.stringify({ ...payload, stock: payload.stock }),
        });
        onNotice("✓ Item updated");
        onRefresh();
    }

    async function handleStockChange(id, delta) {
        try {
            await api(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify({ stockDelta: delta }) });
            onRefresh();
        } catch (err) { onNotice(err.message); }
    }

    async function handleDelete(id, name) {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await api(`/api/products/${id}`, { method: "DELETE" });
            onNotice(`Deleted: ${name}`);
            onRefresh();
        } catch (err) { onNotice(err.message); }
    }

    const TH = "px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider";

    return (
        <div className="space-y-5">
            {showAdd && (
                <ItemModal categories={categories} onClose={() => setShowAdd(false)} onSave={handleAdd} />
            )}
            {editProduct && (
                <ItemModal initial={editProduct} categories={categories} onClose={() => setEditProduct(null)} onSave={handleEdit} />
            )}

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Inventory</h2>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{products.length} items · {products.filter(p => p.stock <= 0).length} out of stock</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search items…"
                                className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-52"
                            />
                        </div>
                        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold px-4 py-2 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all text-sm shadow-lg shadow-orange-500/20 whitespace-nowrap">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <th className={`${TH} text-left`}>Item</th>
                                <th className={`${TH} text-left`}>Category</th>
                                <th className={`${TH} text-right`}>Cost Price</th>
                                <th className={`${TH} text-right`}>Sell Price</th>
                                <th className={`${TH} text-right`}>Profit/unit</th>
                                <th className={`${TH} text-center`}>Stock</th>
                                <th className={`${TH} text-center`}>Adjust Stock</th>
                                <th className={`${TH} text-center`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-400 dark:text-slate-500">
                                        {search ? "No items match your search." : "No items yet — click \"Add Item\" to get started."}
                                    </td>
                                </tr>
                            ) : filtered.map((item) => {
                                const profit = Number(item.sellPrice) - Number(item.costPrice);
                                const noCost = Number(item.costPrice) === 0;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">{item.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-xs px-2 py-0.5 rounded-md font-medium">{item.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-slate-400">
                                            {noCost ? <span className="text-amber-500 text-xs font-medium">Not set</span> : money(item.costPrice)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{money(item.sellPrice)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {noCost
                                                ? <span className="text-xs text-gray-400 dark:text-slate-500 italic">Set cost price</span>
                                                : <span className={`font-semibold ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>{money(profit)}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center"><StockBadge stock={item.stock} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {[-5, -1, 1, 5].map(d => (
                                                    <button key={d} onClick={() => handleStockChange(item.id, d)}
                                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                                        {d > 0 ? `+${d}` : d}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => setEditProduct(item)} title="Edit item" className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-800 rounded-lg transition-colors">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id, item.name)} title="Delete item" className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
