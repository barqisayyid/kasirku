// components/produk/ProductList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { deleteProduct } from "@/lib/actions/products";

type Props = {
  products: Product[];
};

export default function ProductList({ products }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteProduct(id);
    setConfirmId(null);
    setDeletingId(null);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="material-symbols-outlined text-6xl mb-3">
          inventory_2
        </span>
        <p className="text-sm font-medium">Belum ada produk</p>
        <p className="text-xs mt-1">
          Tap tombol + untuk menambah produk pertama
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isLow = product.stock <= product.low_stock_threshold;
        const isOut = product.stock === 0;

        return (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-400">
                storefront
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {product.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {(product as any).categories?.name ?? "Tanpa Kategori"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-emerald-600">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isOut
                      ? "bg-red-100 text-red-600"
                      : isLow
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isOut ? "Habis" : `Stok: ${product.stock}`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => router.push(`/produk/edit/${product.id}`)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
              </button>
              <button
                onClick={() => setConfirmId(product.id)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  delete
                </span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Confirm Delete Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center mb-4">
              <span className="material-symbols-outlined text-red-500 text-5xl">
                delete_forever
              </span>
              <h3 className="text-base font-bold text-gray-800 mt-2">
                Hapus Produk?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Produk yang dihapus tidak bisa dikembalikan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 h-12 border-2 border-gray-200 rounded-xl font-semibold text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={!!deletingId}
                className="flex-1 h-12 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-60"
              >
                {deletingId ? "..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
