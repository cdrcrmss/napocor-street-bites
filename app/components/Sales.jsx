"use client";

import { useState } from "react";
import { Search, Receipt, ChevronDown, ChevronUp, Printer } from "lucide-react";
import ReceiptModal, { printSale } from "./ReceiptModal";

const money = (v) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

function toDateTime(v) {
    return new Date(v).toLocaleString("en-PH", {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });
}

function SaleRow({ sale, onViewReceipt }) {
    const [open, setOpen] = useState(false);
    const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);

    return (
        <>
            <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3">
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className="flex items-center gap-2 text-left w-full"
                    >
                        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 flex-shrink-0" />}
                        <span className="font-mono text-xs text-orange-500 dark:text-orange-400">{sale.receiptCode}</span>
                    </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{toDateTime(sale.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium">{itemCount}</span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{money(sale.subtotal)}</td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{money(sale.totalProfit)}</td>
                <td className="px-4 py-3 text-right text-gray-500 dark:text-slate-400 text-xs">
                    {sale.cashReceived !== null ? money(sale.cashReceived) : "—"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            onClick={() => onViewReceipt(sale)}
                            title="View Receipt"
                            className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg transition-colors"
                        >
                            <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => printSale(sale)}
                            title="Print Receipt"
                            className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 rounded-lg transition-colors"
                        >
                            <Printer className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>
            {open && (
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                    <td colSpan={7} className="px-6 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {sale.items.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg p-2.5 text-xs">
                                    <p className="font-medium text-gray-800 dark:text-slate-200">{item.name}</p>
                                    <p className="text-gray-400 dark:text-slate-500 mt-0.5">
                                        {item.quantity} × {money(item.sellPrice)} = <span className="text-gray-700 dark:text-slate-300 font-semibold">{money(item.lineTotal)}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        {sale.cashReceived !== null && (
                            <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                                <span>Cash: <span className="text-gray-700 dark:text-slate-300">{money(sale.cashReceived)}</span></span>
                                <span>Change: <span className="text-gray-700 dark:text-slate-300">{money(sale.changeGiven)}</span></span>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

export default function Sales({ sales, filter, salesSearch, onFilterChange, onSearchChange, onSearch }) {
    const [viewReceipt, setViewReceipt] = useState(null);
    const totalRevenue = sales.reduce((s, sale) => s + Number(sale.subtotal), 0);
    const totalProfit = sales.reduce((s, sale) => s + Number(sale.totalProfit), 0);

    const FILTERS = [
        { value: "all", label: "All Time" },
        { value: "day", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
    ];

    return (
        <div className="space-y-5">
            {viewReceipt && <ReceiptModal sale={viewReceipt} onClose={() => setViewReceipt(null)} />}
            {sales.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{sales.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{money(totalRevenue)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 col-span-2 md:col-span-1 shadow-sm">
                        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Profit (sell − cost)</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{money(totalProfit)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Sales History</h2>
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSearch(); }}
                    className="flex flex-wrap gap-3 mb-5"
                >
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => onFilterChange(f.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    filter === f.value
                                        ? "bg-orange-500 text-white shadow"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                value={salesSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search receipt code..."
                                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <button type="submit" className="bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm">
                            Search
                        </button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Receipt</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Revenue</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Profit</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Cash</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-slate-500">
                                        No sales transactions found.
                                    </td>
                                </tr>
                            ) : sales.map((sale) => (
                                <SaleRow key={sale.id} sale={sale} onViewReceipt={setViewReceipt} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
