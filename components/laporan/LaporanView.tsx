// components/laporan/LaporanView.tsx
"use client";

import { useState, useTransition } from "react";
import { getLaporan } from "@/lib/actions/laporan";
import PeriodeFilter from "./PeriodeFilter";
import WeeklyChart from "./WeeklyChart";
import TransactionList from "./TransactionList";
import ExportButtons from "./ExportButtons";

type Periode = "harian" | "mingguan" | "bulanan";

type Props = {
  initialLaporan: any;
  initialMingguan: any[];
};

export default function LaporanView({
  initialLaporan,
  initialMingguan,
}: Props) {
  const [laporan, setLaporan] = useState(initialLaporan);
  const [isPending, startTransition] = useTransition();

  function handlePeriodeChange(periode: Periode, tanggal: string) {
    startTransition(async () => {
      const data = await getLaporan(periode, tanggal);
      setLaporan(data);
    });
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Laporan</h2>
        <p className="text-xs text-gray-400">
          Pilih periode untuk melihat laporan
        </p>
      </div>

      {/* Filter Periode */}
      <PeriodeFilter onChange={handlePeriodeChange} loading={isPending} />

      {/* Summary Cards */}
      <div
        className={`grid grid-cols-2 gap-3 mb-4 transition-opacity ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="col-span-2 bg-emerald-600 rounded-xl p-5">
          <p className="text-xs font-semibold text-emerald-200 mb-1">
            Total Penjualan
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

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Transaksi</p>
          <p className="text-2xl font-bold text-gray-800">
            {laporan?.jumlahTransaksi ?? 0}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {laporan?.periode ?? "Hari ini"}
          </p>
        </div>

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

      {/* Chart — hanya tampil di harian */}
      {(!laporan?.periode || laporan?.periode === "harian") && (
        <div className="mb-4">
          <WeeklyChart data={initialMingguan} />
        </div>
      )}

      {/* Export Buttons */}
      <ExportButtons laporan={laporan} />

      {/* Top Produk */}
      {laporan?.produkTerlaris && laporan.produkTerlaris.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Top Produk</p>
          {laporan.produkTerlaris.map((p: any, i: number) => (
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
      <div
        className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-800">Detail Transaksi</h3>
          <span className="text-xs text-gray-400">
            {laporan?.jumlahTransaksi ?? 0} transaksi
          </span>
        </div>
        <TransactionList transactions={laporan?.transactions ?? []} />
      </div>
    </div>
  );
}
