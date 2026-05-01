// components/laporan/PeriodeFilter.tsx
"use client";

import { useState } from "react";

type Periode = "harian" | "mingguan" | "bulanan";

type Props = {
  onChange: (periode: Periode, tanggal: string) => void;
  loading?: boolean;
};

export default function PeriodeFilter({ onChange, loading }: Props) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0], // format YYYY-MM-DD
  );

  function handlePeriodeChange(p: Periode) {
    setPeriode(p);
    onChange(p, tanggal);
  }

  function handleTanggalChange(t: string) {
    setTanggal(t);
    onChange(periode, t);
  }

  // Label periode yang dipilih
  function getPeriodeLabel() {
    const d = new Date(tanggal);
    if (periode === "harian") {
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (periode === "mingguan") {
      const start = new Date(d);
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      {/* Tab periode */}
      <div className="flex gap-2 mb-4">
        {(["harian", "mingguan", "bulanan"] as Periode[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodeChange(p)}
            className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-colors capitalize ${
              periode === p
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Input tanggal */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">
            {periode === "harian"
              ? "Pilih Tanggal"
              : periode === "mingguan"
                ? "Pilih Minggu (dari tanggal)"
                : "Pilih Bulan"}
          </label>
          <input
            type={periode === "bulanan" ? "month" : "date"}
            value={periode === "bulanan" ? tanggal.substring(0, 7) : tanggal}
            onChange={(e) => {
              const val =
                periode === "bulanan" ? e.target.value + "-01" : e.target.value;
              handleTanggalChange(val);
            }}
            max={new Date().toISOString().split("T")[0]}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
          />
        </div>
        {loading && (
          <div className="mt-5">
            <span className="material-symbols-outlined animate-spin text-emerald-600">
              progress_activity
            </span>
          </div>
        )}
      </div>

      {/* Label periode aktif */}
      <div className="mt-3 p-2 bg-emerald-50 rounded-lg">
        <p className="text-xs text-emerald-700 font-semibold text-center">
          📅 {getPeriodeLabel()}
        </p>
      </div>
    </div>
  );
}
