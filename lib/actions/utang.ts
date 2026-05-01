// lib/actions/utang.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getUtangList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("debts")
    .select(
      "*, customers(id, name, phone), transactions(id, total_price, created_at)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUtangByCustomer(customerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("debts")
    .select("*, customers(id, name, phone), debt_payments(*)")
    .eq("user_id", user.id)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getCustomers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return data ?? [];
}

export async function createCustomer(name: string, phone?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .insert({ user_id: user.id, name, phone: phone || null })
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, customer: data };
}

export async function bayarUtang(debtId: string, amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // Ambil data utang
  const { data: debt } = await admin
    .from("debts")
    .select("*")
    .eq("id", debtId)
    .eq("user_id", user.id)
    .single();

  if (!debt) return { error: "Utang tidak ditemukan" };
  if (amount > debt.remaining_debt)
    return { error: "Jumlah bayar melebihi sisa utang" };

  const newRemaining = debt.remaining_debt - amount;
  const newStatus = newRemaining === 0 ? "lunas" : "belum_lunas";

  // Simpan pembayaran
  await admin.from("debt_payments").insert({
    debt_id: debtId,
    amount,
  });

  // Update sisa utang
  await admin
    .from("debts")
    .update({ remaining_debt: newRemaining, status: newStatus })
    .eq("id", debtId);

  revalidatePath("/utang");
  return { success: true };
}

export async function createDebt(
  customerId: string,
  transactionId: string,
  totalDebt: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("debts").insert({
    user_id: user.id,
    customer_id: customerId,
    transaction_id: transactionId,
    total_debt: totalDebt,
    remaining_debt: totalDebt,
    status: "belum_lunas",
  });

  if (error) return { error: error.message };
  revalidatePath("/utang");
  return { success: true };
}
