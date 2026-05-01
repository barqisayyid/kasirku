// lib/actions/laporan.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Periode = "harian" | "mingguan" | "bulanan";

function getRangeFromPeriode(periode: Periode, tanggal?: string) {
  const target = tanggal ? new Date(tanggal) : new Date();

  if (periode === "harian") {
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (periode === "mingguan") {
    const start = new Date(target);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Senin sebagai hari pertama
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // bulanan
  const start = new Date(target.getFullYear(), target.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getLaporan(
  periode: Periode = "harian",
  tanggal?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { start, end } = getRangeFromPeriode(periode, tanggal);

  const { data: transactions } = await admin
    .from("transactions")
    .select("*, transaction_items(*), customers(name)")
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (!transactions) return null;

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
    periode,
    tanggal: start.toISOString(),
    tanggalAkhir: end.toISOString(),
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
