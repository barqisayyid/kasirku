// app/(dashboard)/produk/tambah/page.tsx
import Link from "next/link";
import { getCategories } from "@/lib/actions/products";
import ProductForm from "@/components/produk/ProductForm";

export default async function TambahProdukPage() {
  const categories = await getCategories();

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/produk"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-500">
            arrow_back
          </span>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tambah Produk</h2>
          <p className="text-xs text-gray-400">Isi data produk baru</p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
