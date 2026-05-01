// components/produk/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category, Product } from "@/types";
import {
  createProduct,
  updateProduct,
  createCategory,
} from "@/lib/actions/products";

type Props = {
  categories: Category[];
  product?: Product; // jika ada → mode edit
};

export default function ProductForm({
  categories: initialCategories,
  product,
}: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [threshold, setThreshold] = useState(
    product?.low_stock_threshold?.toString() ?? "5",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tambah kategori baru
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    const result = await createCategory(newCatName.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setNewCatName("");
      setShowNewCat(false);
      router.refresh();
    }
    setCatLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nama produk wajib diisi");
    if (!price || parseInt(price) <= 0)
      return setError("Harga harus lebih dari 0");
    if (!stock || parseInt(stock) < 0)
      return setError("Stok tidak boleh negatif");

    setLoading(true);

    const formData = {
      name: name.trim(),
      category_id: categoryId,
      price: parseInt(price),
      stock: parseInt(stock),
      low_stock_threshold: parseInt(threshold) || 5,
    };

    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/produk");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Nama Produk */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Nama Produk
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Indomie Goreng"
          className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm bg-white"
        />
      </div>

      {/* Kategori */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-gray-500">
            Kategori
          </label>
          <button
            type="button"
            onClick={() => setShowNewCat(!showNewCat)}
            className="text-xs text-emerald-600 font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Kategori Baru
          </button>
        </div>

        {showNewCat && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nama kategori baru"
              className="flex-1 h-10 px-3 rounded-lg border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none text-sm"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={catLoading}
              className="px-4 h-10 bg-emerald-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {catLoading ? "..." : "Tambah"}
            </button>
          </div>
        )}

        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="appearance-none w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm bg-white"
          >
            <option value="">Tanpa Kategori</option>
            {initialCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      {/* Harga & Stok */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            Harga Jual
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
              Rp
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base font-bold bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            Stok
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base font-bold text-center bg-white"
          />
        </div>
      </div>

      {/* Threshold stok menipis */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Batas Stok Menipis
          <span className="font-normal text-gray-400 ml-1">
            (peringatan muncul jika stok ≤ angka ini)
          </span>
        </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="5"
          min="1"
          className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm bg-white"
        />
      </div>

      {/* Submit Section */}
      <div className="pt-2 pb-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-emerald-600 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
