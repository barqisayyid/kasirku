// app/(dashboard)/laporan/page.tsx
import { getLaporanHarian, getLaporanMingguan } from "@/lib/actions/laporan";
import WeeklyChart from "@/components/laporan/WeeklyChart";
import TransactionList from "@/components/laporan/TransactionList";

export default async function LaporanPage() {
  const [laporan, mingguan] = await Promise.all([
    getLaporanHarian(),
    getLaporanMingguan(),
  ]);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Laporan</h2>
          <p className="text-xs text-gray-400 capitalize">{today}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Penjualan */}
        <div className="col-span-2 bg-emerald-600 rounded-xl p-5">
          <p className="text-xs font-semibold text-emerald-200 mb-1">
            Total Penjualan Hari Ini
          </p>
          <p className="text-3xl font-bold text-white">
            Rp {(laporan?.totalPenjualan ?? 0).toLocaleString("id-ID")}
          </p>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-xs text-emerald-300">Transaksi</p>
              <p className="text-lg font-bold text-white">
                {laporan?.jumlahTransaksi ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-300">Tunai</p>
              <p className="text-lg font-bold text-white">
                Rp {(laporan?.totalTunai ?? 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-300">Utang</p>
              <p className="text-lg font-bold text-white">
                Rp {(laporan?.totalUtang ?? 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Transaksi */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Transaksi</p>
          <p className="text-2xl font-bold text-gray-800">
            {laporan?.jumlahTransaksi ?? 0}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Hari ini
          </p>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Terlaris</p>
          <p className="text-sm font-bold text-gray-800 truncate">
            {laporan?.produkTerlaris?.[0]?.name ?? "-"}
          </p>
          {laporan?.produkTerlaris?.[0] && (
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {laporan.produkTerlaris[0].qty} terjual
            </p>
          )}
        </div>
      </div>

      {/* Chart Mingguan */}
      <div className="mb-4">
        <WeeklyChart data={mingguan} />
      </div>

      {/* Produk Terlaris */}
      {laporan?.produkTerlaris && laporan.produkTerlaris.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Top Produk Hari Ini
          </p>
          {laporan.produkTerlaris.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : i === 1
                      ? "bg-gray-100 text-gray-600"
                      : i === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-50 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.qty} terjual</p>
              </div>
              <p className="text-sm font-bold text-emerald-600">
                Rp {p.total.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Daftar Transaksi */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-800">
            Transaksi Hari Ini
          </h3>
          <span className="text-xs text-gray-400">
            {laporan?.jumlahTransaksi ?? 0} transaksi
          </span>
        </div>
        <TransactionList transactions={(laporan?.transactions as any) ?? []} />
      </div>
    </div>
  );
}
