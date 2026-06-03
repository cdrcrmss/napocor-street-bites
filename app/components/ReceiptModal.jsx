"use client";

import { X, Printer, CheckCircle } from "lucide-react";

const money = (v) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));

function toDateTime(v) {
    return new Date(v).toLocaleString("en-PH", {
        year: "numeric", month: "long", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });
}

export function printSale(sale) {
    const fmt = (v) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(v || 0));
    const dt = new Date(sale.createdAt).toLocaleString("en-PH", {
        year: "numeric", month: "long", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });

    const itemLines = sale.items
        .map((i) => {
            const name = i.name.padEnd(24, " ").slice(0, 24);
            const qty  = `${i.quantity}x`.padStart(4);
            const price = fmt(i.sellPrice).padStart(10);
            const total = fmt(i.lineTotal).padStart(10);
            return `${name} ${qty} ${price} ${total}`;
        })
        .join("\n");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt – ${sale.receiptCode}</title>
  <style>
    @page { margin: 12mm; size: 80mm auto; }
    * { box-sizing: border-box; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .center { text-align: center; }
    .divider { border-top: 1px dashed #999; margin: 8px 0; }
    .store-name { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
    .tagline { font-size: 10px; color: #555; margin-top: 2px; }
    .meta { font-size: 10px; color: #444; margin: 4px 0; }
    .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin: 6px 0 2px; }
    .item-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
    .item-name { flex: 1; }
    .item-qty  { width: 28px; text-align: right; color: #555; }
    .item-price { width: 64px; text-align: right; color: #555; }
    .item-total { width: 72px; text-align: right; font-weight: bold; }
    .summary-row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
    .summary-label { color: #444; }
    .summary-value { font-weight: bold; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 6px 0; }
    .change-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #1a6b1a; margin: 3px 0; }
    .footer { font-size: 10px; color: #777; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="store-name">NAPOCOR STREET BITES</div>
    <div class="tagline">Napocor Village, Diliman, Quezon City</div>
  </div>
  <div class="divider"></div>
  <div class="meta">Receipt: <strong>${sale.receiptCode}</strong></div>
  <div class="meta">Date: ${dt}</div>
  <div class="divider"></div>
  <div class="section-label">Items</div>
  ${sale.items.map((i) => `
    <div class="item-row">
      <div class="item-name">${i.name}</div>
      <div class="item-qty">${i.quantity}×</div>
      <div class="item-price">${fmt(i.sellPrice)}</div>
      <div class="item-total">${fmt(i.lineTotal)}</div>
    </div>
  `).join("")}
  <div class="divider"></div>
  <div class="total-row">
    <span>TOTAL</span>
    <span>${fmt(sale.subtotal)}</span>
  </div>
  ${sale.cashReceived !== null ? `
    <div class="summary-row">
      <span class="summary-label">Cash</span>
      <span class="summary-value">${fmt(sale.cashReceived)}</span>
    </div>
    <div class="change-row">
      <span>Change</span>
      <span>${fmt(sale.changeGiven)}</span>
    </div>
  ` : ""}
  <div class="divider"></div>
  <div class="center footer">
    <div>Thank you for your purchase!</div>
    <div style="margin-top:4px">— Napocor Street Bites —</div>
  </div>
</body>
</html>`;

    const popup = window.open("", "_blank", "width=420,height=700");
    if (!popup) { alert("Allow pop-ups to print receipt."); return; }
    popup.document.write(html);
    popup.document.close();
    popup.onload = () => popup.print();
}

export default function ReceiptModal({ sale, onClose }) {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Checkout Complete</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-5 py-4">
                    <div className="bg-white rounded-xl p-5 text-slate-900 font-mono text-sm shadow-inner">
                        <div className="text-center mb-4">
                            <p className="text-base font-black tracking-wide uppercase">Napocor Street Bites</p>
                            <p className="text-xs text-slate-500 mt-0.5">Napocor Village, Diliman, QC</p>
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-3" />

                        <div className="space-y-0.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span className="font-semibold">Receipt</span>
                                <span className="text-slate-800 font-mono">{sale.receiptCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Date</span>
                                <span>{toDateTime(sale.createdAt)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-3" />

                        <div className="space-y-1.5">
                            {sale.items.map((item) => (
                                <div key={item.id}>
                                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{item.quantity} × {money(item.sellPrice)}</span>
                                        <span className="font-bold text-slate-800">{money(item.lineTotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-3" />

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-black">
                                <span>TOTAL</span>
                                <span>{money(sale.subtotal)}</span>
                            </div>
                            {sale.cashReceived !== null && (
                                <>
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Cash</span>
                                        <span>{money(sale.cashReceived)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-emerald-700">
                                        <span>Change</span>
                                        <span>{money(sale.changeGiven)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-dashed border-slate-300 my-3" />
                        <p className="text-center text-xs text-slate-400">Thank you for your purchase!</p>
                    </div>
                </div>

                <div className="flex gap-3 px-5 pb-5 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => printSale(sale)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all text-sm shadow-lg shadow-orange-500/20"
                    >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
