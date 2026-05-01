// components/utang/BayarUtangModal.tsx
"use client";

import { useState } from "react";
import { bayarUtang } from "@/lib/actions/utang";

type Props = {
  debtId: string;
  remainingDebt: number;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BayarUtangModal({
  debtId,
  remainingDebt,
  customerName,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paid = parseInt(amount.replace(/\D/g, "")) || 0;

  function handleAmountChange(val: string) {
    const numeric = val.replace(/\D/g, "");
    setAmount(numeric ? parseInt(numeric).toLocaleString("id-ID") : "");
  }

  async function handleSubmit() {
    if (paid <= 0) return setError("Masukkan jumlah pembayaran");
    if (paid > remainingDebt) return setError("Jumlah melebihi sisa utang");

    setLoading(true);
    setError("");
    const result = await bayarUtang(debtId, paid);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Bayar Utang</h2>
          <button onClick={onClose} className="text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-red-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500">Pelanggan</p>
          <p className="text-base font-bold text-gray-800">{customerName}</p>
          <p className="text-xs text-gray-500 mt-2">Sisa Utang</p>
          <p className="text-2xl font-bold text-red-600">
            Rp {remainingDebt.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            Jumlah Dibayar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-xl font-bold"
            />
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[remainingDebt, Math.ceil(remainingDebt / 2)]
              .filter((v, i, arr) => arr.indexOf(v) === i && v > 0)
              .map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toLocaleString("id-ID"))}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                  Rp {amt.toLocaleString("id-ID")}
                </button>
              ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-red-500 text-white font-bold text-base rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              KONFIRMASI PEMBAYARAN
            </>
          )}
        </button>
      </div>
    </div>
  );
}
