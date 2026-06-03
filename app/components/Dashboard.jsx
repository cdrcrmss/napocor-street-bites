"use client";

import { TrendingUp, ShoppingCart, DollarSign, Award, TrendingDown } from "lucide-react";

const money = (v) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

function StatCard({ title, icon: Icon, amount, profit, transactions, accent, iconBg }) {
    const margin = amount > 0 ? ((profit / amount) * 100).toFixed(1) : 0;
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl hover:border-orange-200 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{money(amount)}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-slate-500 mt-2">
                <span>{transactions} transactions</span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{money(profit)} profit
                </span>
                {amount > 0 && (
                    <>
                        <span className="text-gray-300 dark:text-slate-700">•</span>
                        <span className="text-orange-500 font-semibold">{margin}% margin</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ analytics }) {
    const { day, week, month, topItems } = analytics;
    const maxQty = topItems.length > 0 ? Math.max(...topItems.map((i) => i.quantity)) : 1;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Today"      icon={ShoppingCart} amount={day.amount}   profit={day.profit}   transactions={day.transactions}   iconBg="bg-orange-500" />
                <StatCard title="This Week"  icon={TrendingUp}   amount={week.amount}  profit={week.profit}  transactions={week.transactions}  iconBg="bg-violet-500" />
                <StatCard title="This Month" icon={DollarSign}   amount={month.amount} profit={month.profit} transactions={month.transactions} iconBg="bg-emerald-500" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Sellers This Month</h2>
                </div>

                {topItems.length === 0 ? (
                    <p className="text-gray-400 dark:text-slate-500 text-sm py-4 text-center">No sales data for this month yet.</p>
                ) : (
                    <div className="space-y-3">
                        {topItems.map((item, idx) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <span className="w-6 text-xs font-bold text-gray-300 dark:text-slate-600 text-right flex-shrink-0">#{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200 truncate">{item.name}</span>
                                        <span className="text-xs font-bold text-orange-500 ml-2 flex-shrink-0">{item.quantity} sold</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
