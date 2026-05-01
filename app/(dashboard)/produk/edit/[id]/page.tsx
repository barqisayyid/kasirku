// app/(dashboard)/produk/edit/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/actions/products";
import ProductForm from "@/components/produk/ProductForm";

export default async function EditProdukPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="px-4 py-4">
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
          <h2 className="text-xl font-bold text-gray-800">Edit Produk</h2>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {product.name}
          </p>
        </div>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
