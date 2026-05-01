// components/kasir/KasirView.tsx
"use client";

import { useState, useMemo } from "react";
import { Product, CartItem, Category } from "@/types";
import CartSheet from "./CartSheet";
import PaymentModal from "./PaymentModal";
import Toast from "@/components/ui/Toast"; // Import Toast

type Props = {
  initialProducts: Product[];
  categories: Category[];
};

export default function KasirView({ initialProducts, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [toast, setToast] = useState<string | null>(null); // State untuk toast

  // Filter produk
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory
        ? p.category_id === selectedCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [initialProducts, search, selectedCategory]);

  // Total item & harga di keranjang
  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  function addToCart(product: Product) {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // jangan melebihi stok
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function resetCart() {
    setCart([]);
    setShowPayment(false);
    setToast("Transaksi berhasil disimpan! 🎉"); // Trigger toast
  }

  // Hitung jumlah produk dengan stok menipis
  const lowStockCount = initialProducts.filter(
    (p) => p.stock <= p.low_stock_threshold && p.stock > 0,
  ).length;

  return (
    <div className="px-4">
      {/* Search */}
      <div className="mt-4 mb-4 relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-gray-400">
          search
        </span>
        <input
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === ""
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-200 text-gray-500"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-500"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Warning Banner Stok Menipis */}
      {lowStockCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-600 text-[20px]">
            warning
          </span>
          <p className="text-xs text-yellow-700 font-semibold">
            {lowStockCount} produk stoknya menipis
          </p>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3">
            inventory_2
          </span>
          <p className="text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            const isLowStock = product.stock <= product.low_stock_threshold;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white border rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer select-none
                  ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "active:scale-95 hover:border-emerald-300"}
                  ${inCart ? "border-emerald-400 ring-1 ring-emerald-400" : "border-gray-200"}
                `}
              >
                <div className="aspect-square rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-400 text-4xl">
                    storefront
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs font-medium ${isLowStock ? "text-red-500" : "text-gray-400"}`}
                    >
                      Stok: {product.stock}
                    </span>
                    {inCart && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        {inCart.quantity}x
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-base font-bold text-emerald-600">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Bottom Sheet */}
      {cartCount > 0 && (
        <CartSheet
          cart={cart}
          total={cartTotal}
          cartCount={cartCount}
          onUpdateQty={updateQty}
          onCheckout={() => setShowPayment(true)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          total={cartTotal}
          onClose={() => setShowPayment(false)}
          onSuccess={resetCart}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
