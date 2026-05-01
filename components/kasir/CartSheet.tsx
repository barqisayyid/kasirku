// components/kasir/CartSheet.tsx
"use client";

import { useState } from "react";
import { CartItem } from "@/types";

type Props = {
  cart: CartItem[];
  total: number;
  cartCount: number;
  onUpdateQty: (productId: string, delta: number) => void;
  onCheckout: () => void;
};

export default function CartSheet({
  cart,
  total,
  cartCount,
  onUpdateQty,
  onCheckout,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-16 left-0 w-full z-40 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pt-3 pb-2 max-h-64 overflow-y-auto border-b border-gray-100">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-400">
                  Rp {item.product.price.toLocaleString("id-ID")} / pcs
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => onUpdateQty(item.product.id, -1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    remove
                  </span>
                </button>
                <span className="text-sm font-bold w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQty(item.product.id, 1)}
                  className="w-7 h-7 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add
                  </span>
                </button>
              </div>
              <p className="text-sm font-bold text-gray-800 ml-3 w-20 text-right">
                Rp{" "}
                {(item.product.price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary bar */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">
              {cartCount} Barang
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-emerald-600 text-xs font-semibold flex items-center gap-1"
            >
              {expanded ? "Sembunyikan" : "Lihat Detail"}
              <span className="material-symbols-outlined text-[16px]">
                {expanded ? "expand_more" : "expand_less"}
              </span>
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Tagihan</p>
            <p className="text-xl font-bold text-emerald-700">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="w-full h-14 bg-emerald-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">payments</span>
          BAYAR
        </button>
      </div>
    </div>
  );
}
