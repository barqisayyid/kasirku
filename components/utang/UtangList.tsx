// components/utang/UtangList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BayarUtangModal from "./BayarUtangModal";

type Debt = {
  id: string;
  total_debt: number;
  remaining_debt: number;
  status: "belum_lunas" | "lunas";
  created_at: string;
  customers: { id: string; name: string; phone: string | null };
  transactions: { id: string; total_price: number; created_at: string };
};

type Props = {
  utangList: Debt[];
};

export default function UtangList({ utangList }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<"semua" | "belum_lunas" | "lunas">(
    "belum_lunas",
  );
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const filtered = utangList.filter((d) =>
    filter === "semua" ? true : d.status === filter,
  );

  if (utangList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-3">
          history_edu
        </span>
        <p className="text-sm font-medium">Belum ada catatan utang</p>
        <p className="text-xs mt-1">
          Utang akan muncul saat transaksi dicatat sebagai utang
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["belum_lunas", "lunas", "semua"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-500"
            }`}
          >
            {f === "belum_lunas"
              ? "Belum Lunas"
              : f === "lunas"
                ? "Lunas"
                : "Semua"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            Tidak ada data untuk filter ini
          </p>
        ) : (
          filtered.map((debt) => {
            const isLunas = debt.status === "lunas";
            const date = new Date(debt.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const paidPercent = Math.round(
              ((debt.total_debt - debt.remaining_debt) / debt.total_debt) * 100,
            );

            return (
              <div
                key={debt.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isLunas ? "bg-emerald-100" : "bg-red-100"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isLunas ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {isLunas ? "check_circle" : "history_edu"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {debt.customers?.name}
                      </p>
                      <p className="text-xs text-gray-400">{date}</p>
                      {debt.customers?.phone && (
                        <p className="text-xs text-gray-400">
                          {debt.customers.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isLunas
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isLunas ? "Lunas" : "Belum Lunas"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Terbayar {paidPercent}%</span>
                    <span>
                      Total: Rp {debt.total_debt.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isLunas ? "bg-emerald-500" : "bg-red-400"
                      }`}
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Sisa Utang</p>
                    <p
                      className={`text-lg font-bold ${
                        isLunas ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      Rp {debt.remaining_debt.toLocaleString("id-ID")}
                    </p>
                  </div>
                  {!isLunas && (
                    <button
                      onClick={() => setSelectedDebt(debt)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal bayar utang */}
      {selectedDebt && (
        <BayarUtangModal
          debtId={selectedDebt.id}
          remainingDebt={selectedDebt.remaining_debt}
          customerName={selectedDebt.customers?.name}
          onClose={() => setSelectedDebt(null)}
          onSuccess={() => {
            setSelectedDebt(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
