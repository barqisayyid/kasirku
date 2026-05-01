// components/laporan/TransactionList.tsx
"use client";

import { useState } from "react";

type TransactionItem = {
  id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
};

type Transaction = {
  id: string;
  payment_method: "tunai" | "utang";
  total_price: number;
  created_at: string;
  transaction_items: TransactionItem[];
  customers?: { name: string } | null;
};

type Props = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-3">
          receipt_long
        </span>
        <p className="text-sm">Belum ada transaksi hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((trx, index) => {
        const isExpanded = expandedId === trx.id;
        const time = new Date(trx.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const isUtang = trx.payment_method === "utang";

        return (
          <div
            key={trx.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Header transaksi */}
            <div
              className="p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : trx.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isUtang ? "bg-red-100" : "bg-emerald-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isUtang ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {isUtang ? "history_edu" : "receipt_long"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  TRX-{String(index + 1).padStart(4, "0")}
                  {trx.customers?.name && (
                    <span className="text-xs text-gray-400 ml-2">
                      • {trx.customers.name}
                    </span>
                  )}
                </p>
                <p
                  className={`text-xs mt-0.5 ${isUtang ? "text-red-400" : "text-gray-400"}`}
                >
                  {time} • {isUtang ? "Utang" : "Tunai"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800">
                  Rp {trx.total_price.toLocaleString("id-ID")}
                </p>
                <span className="material-symbols-outlined text-gray-400 text-[16px]">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              </div>
            </div>

            {/* Detail item */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                {trx.transaction_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                        {item.quantity}x
                      </span>
                      <span className="text-sm text-gray-700">
                        {item.product_name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Total
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Rp {trx.total_price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
