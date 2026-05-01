// lib/actions/transactions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { CartItem } from "@/types";

export async function createTransaction(
  cart: CartItem[],
  total: number,
  method: "tunai" | "utang",
  amountPaid: number,
  customerId?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // 1. Simpan transaksi
  const { data: trx, error: trxError } = await admin
    .from("transactions")
    .insert({
      user_id: user.id,
      payment_method: method,
      total_price: total,
      amount_paid: method === "tunai" ? amountPaid : 0,
      change_amount: method === "tunai" ? amountPaid - total : 0,
      customer_id: customerId || null,
    })
    .select()
    .single();

  if (trxError || !trx) return { error: "Gagal menyimpan transaksi" };

  // 2. Simpan item transaksi
  const items = cart.map((item) => ({
    transaction_id: trx.id,
    product_id: item.product.id,
    product_name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  await admin.from("transaction_items").insert(items);

  // 3. Update stok produk
  for (const item of cart) {
    await admin
      .from("products")
      .update({ stock: item.product.stock - item.quantity })
      .eq("id", item.product.id);
  }

  // 4. Jika utang, buat record debt
  if (method === "utang" && customerId) {
    await admin.from("debts").insert({
      user_id: user.id,
      customer_id: customerId,
      transaction_id: trx.id,
      total_debt: total,
      remaining_debt: total,
      status: "belum_lunas",
    });
  }

  revalidatePath("/kasir");
  revalidatePath("/laporan");
  revalidatePath("/utang");
  return { success: true };
}
