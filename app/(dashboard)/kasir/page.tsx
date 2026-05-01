// app/(dashboard)/kasir/page.tsx
import { getProducts, getCategories } from "@/lib/actions/products";
import KasirView from "@/components/kasir/KasirView";

export default async function KasirPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <KasirView initialProducts={products} categories={categories} />;
}
