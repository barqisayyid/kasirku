// app/(dashboard)/produk/page.tsx
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/actions/products";
import ProductList from "@/components/produk/ProductList";

export default async function ProdukPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Produk</h2>
          <p className="text-xs text-gray-400">
            {products.length} produk terdaftar
          </p>
        </div>
        <Link
          href="/produk/tambah"
          className="flex items-center gap-2 h-10 px-4 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah
        </Link>
      </div>

      {/* Ringkasan stok */}
      {products.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{products.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Produk</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">
              {
                products.filter(
                  (p) => p.stock <= p.low_stock_threshold && p.stock > 0,
                ).length
              }
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Stok Menipis</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-500">
              {products.filter((p) => p.stock === 0).length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Habis</p>
          </div>
        </div>
      )}

      <ProductList products={products} />
    </div>
  );
}
