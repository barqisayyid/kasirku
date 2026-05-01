// lib/actions/products.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Product } from "@/types";

// Helper: ambil user yang sedang login
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const user = await getUser();
  if (!user) return [];

  const admin = createAdminClient();
  let query = admin
    .from("products")
    .select("*, categories(id, name)")
    .eq("user_id", user.id)
    .order("name");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export async function getCategories() {
  const user = await getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return data ?? [];
}

export async function getProductById(id: string) {
  const user = await getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, categories(id, name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function createCategory(name: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .insert({ user_id: user.id, name });

  if (error) return { error: error.message };
  revalidatePath("/produk");
  return { success: true };
}

export async function createProduct(formData: {
  name: string;
  category_id: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
}) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("products").insert({
    user_id: user.id,
    ...formData,
    category_id: formData.category_id || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function updateProduct(
  id: string,
  formData: {
    name: string;
    category_id: string;
    price: number;
    stock: number;
    low_stock_threshold: number;
  },
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({
      ...formData,
      category_id: formData.category_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/produk");
  revalidatePath("/kasir");
  return { success: true };
}
