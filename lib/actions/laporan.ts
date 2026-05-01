// lib/actions/laporan.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getLaporanHarian(tanggal?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Tentukan range tanggal
  const targetDate = tanggal ? new Date(tanggal) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Ambil semua transaksi hari ini
  const { data: transactions } = await admin
    .from("transactions")
    .select("*, transaction_items(*, products(name)), customers(name)")
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString())
    .order("created_at", { ascending: false });

  if (!transactions) return null;

  // Hitung ringkasan
  const totalPenjualan = transactions.reduce(
    (sum, t) => sum + t.total_price,
    0,
  );
  const jumlahTransaksi = transactions.length;
  const totalTunai = transactions
    .filter((t) => t.payment_method === "tunai")
    .reduce((sum, t) => sum + t.total_price, 0);
  const totalUtang = transactions
    .filter((t) => t.payment_method === "utang")
    .reduce((sum, t) => sum + t.total_price, 0);

  // Produk terlaris
  const productSales: Record<
    string,
    { name: string; qty: number; total: number }
  > = {};
  transactions.forEach((t) => {
    t.transaction_items?.forEach((item: any) => {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = {
          name: item.product_name,
          qty: 0,
          total: 0,
        };
      }
      productSales[item.product_name].qty += item.quantity;
      productSales[item.product_name].total += item.subtotal;
    });
  });

  const produkTerlaris = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    tanggal: targetDate.toISOString(),
    totalPenjualan,
    jumlahTransaksi,
    totalTunai,
    totalUtang,
    produkTerlaris,
    transactions,
  };
}

export async function getLaporanMingguan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();

  // 7 hari terakhir
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { data } = await admin
      .from("transactions")
      .select("total_price")
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    const total = data?.reduce((sum, t) => sum + t.total_price, 0) ?? 0;
    days.push({
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      total,
      date: date.toISOString(),
    });
  }

  return days;
}
