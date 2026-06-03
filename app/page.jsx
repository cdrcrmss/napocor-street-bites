"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, Receipt,
    LogOut, Utensils, RefreshCw, X, AlertCircle, CheckCircle,
    Sun, Moon
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import POS from "./components/POS";
import Sales from "./components/Sales";

const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "pos",       label: "Point of Sale", icon: ShoppingCart },
    { id: "sales",     label: "Sales", icon: Receipt },
];

const DEFAULT_ANALYTICS = {
    day:   { amount: 0, profit: 0, transactions: 0 },
    week:  { amount: 0, profit: 0, transactions: 0 },
    month: { amount: 0, profit: 0, transactions: 0 },
    topItems: [],
};

export default function AppPage() {
    const router = useRouter();
    const [tab, setTab]               = useState("dashboard");
    const [products, setProducts]     = useState([]);
    const [sales, setSales]           = useState([]);
    const [analytics, setAnalytics]   = useState(DEFAULT_ANALYTICS);
    const [filter, setFilter]         = useState("all");
    const [salesSearch, setSalesSearch] = useState("");
    const [loading, setLoading]       = useState(true);
    const [notice, setNotice]         = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [dark, setDark]             = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("nsb-theme");
        const isDark = saved === null ? true : saved === "dark";
        setDark(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    function toggleTheme() {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("nsb-theme", next ? "dark" : "light");
    }

    function showNotice(msg, type = "info") {
        setNotice({ msg, type });
        setTimeout(() => setNotice(null), 4000);
    }

    async function apiFetch(path) {
        const res = await fetch(path, { cache: "no-store" });
        if (res.status === 401) { router.push("/login"); throw new Error("Unauthorized"); }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    }

    const fetchAll = useCallback(async (opts = {}) => {
        const q = new URLSearchParams({ period: filter, search: salesSearch }).toString();
        const doProducts  = opts.products  !== false;
        const doSales     = opts.sales     !== false;
        const doAnalytics = opts.analytics !== false;

        const [pRes, sRes, aRes] = await Promise.allSettled([
            doProducts  ? apiFetch("/api/products")        : Promise.resolve(null),
            doSales     ? apiFetch(`/api/sales?${q}`)      : Promise.resolve(null),
            doAnalytics ? apiFetch("/api/analytics")       : Promise.resolve(null),
        ]);

        if (doProducts  && pRes.status === "fulfilled" && pRes.value)  setProducts(pRes.value.products  || []);
        if (doSales     && sRes.status === "fulfilled" && sRes.value)  setSales(sRes.value.sales        || []);
        if (doAnalytics && aRes.status === "fulfilled" && aRes.value)  setAnalytics(aRes.value);

        const errors = [pRes, sRes, aRes]
            .filter((r, i) => [doProducts, doSales, doAnalytics][i] && r.status === "rejected" && r.reason?.message !== "Unauthorized")
            .map((r) => r.reason?.message);
        if (errors.length) showNotice(errors.join(" | "), "error");
    }, [filter, salesSearch]);

    useEffect(() => {
        setLoading(true);
        fetchAll().finally(() => setLoading(false));
    }, []);

    async function handleRefresh(opts) {
        setRefreshing(true);
        await fetchAll(opts);
        setRefreshing(false);
    }

    async function handleFilterChange(newFilter) {
        setFilter(newFilter);
        const q = new URLSearchParams({ period: newFilter, search: salesSearch }).toString();
        try {
            const data = await apiFetch(`/api/sales?${q}`);
            setSales(data.sales || []);
        } catch {}
    }

    async function handleSalesSearch() {
        const q = new URLSearchParams({ period: filter, search: salesSearch }).toString();
        try {
            const data = await apiFetch(`/api/sales?${q}`);
            setSales(data.sales || []);
        } catch {}
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    const ActiveIcon = TABS.find((t) => t.id === tab)?.icon || LayoutDashboard;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/25">
                            <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Napocor Street Bites</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 leading-none mt-0.5">Admin Portal</p>
                        </div>
                    </div>

                    <nav className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    tab === id
                                        ? "bg-orange-500 text-white shadow"
                                        : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="hidden md:inline">{label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="sm:hidden flex items-center gap-1.5">
                        <ActiveIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {TABS.find((t) => t.id === tab)?.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title={dark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => handleRefresh()}
                            disabled={refreshing}
                            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {notice && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium max-w-sm w-full mx-4 transition-all ${
                    notice.type === "error"
                        ? "bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200"
                }`}>
                    {notice.type === "error"
                        ? <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                        : <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    }
                    <span className="flex-1">{notice.msg}</span>
                    <button onClick={() => setNotice(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                            tab === id ? "text-orange-500" : "text-gray-400 dark:text-slate-500"
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-semibold leading-none">{label === "Point of Sale" ? "POS" : label}</span>
                    </button>
                ))}
            </nav>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-24 pb-28 sm:pb-12">
                <div className="flex items-center gap-2 mb-6">
                    <ActiveIcon className="w-5 h-5 text-orange-500" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {TABS.find((t) => t.id === tab)?.label}
                    </h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400 dark:text-slate-500 text-sm">Loading data…</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {tab === "dashboard" && (
                            <Dashboard analytics={analytics} />
                        )}
                        {tab === "inventory" && (
                            <Inventory
                                products={products}
                                onRefresh={() => handleRefresh({ products: true, sales: false, analytics: false })}
                                onNotice={(m) => showNotice(m, m.startsWith("✓") ? "info" : "error")}
                            />
                        )}
                        {tab === "pos" && (
                            <POS
                                products={products}
                                onRefresh={() => handleRefresh()}
                                onNotice={(m) => showNotice(m, m.startsWith("✓") ? "info" : "error")}
                            />
                        )}
                        {tab === "sales" && (
                            <Sales
                                sales={sales}
                                filter={filter}
                                salesSearch={salesSearch}
                                onFilterChange={handleFilterChange}
                                onSearchChange={setSalesSearch}
                                onSearch={handleSalesSearch}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}