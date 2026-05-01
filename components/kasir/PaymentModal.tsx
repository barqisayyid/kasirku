// components/kasir/PaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/types";
import { createTransaction } from "@/lib/actions/transactions";
import { getCustomers, createCustomer } from "@/lib/actions/utang";

type Customer = { id: string; name: string; phone: string | null };

type Props = {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaymentModal({
  cart,
  total,
  onClose,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState<"tunai" | "utang">("tunai");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);

  const paid = parseInt(amountPaid.replace(/\D/g, "")) || 0;
  const change = paid - total;

  useEffect(() => {
    if (method === "utang") {
      getCustomers().then(setCustomers);
    }
  }, [method]);

  async function handleAddCustomer() {
    if (!newCustomerName.trim()) return;
    setCustomerLoading(true);
    const result = await createCustomer(
      newCustomerName.trim(),
      newCustomerPhone.trim(),
    );
    if (result.error) {
      setError(result.error);
    } else if (result.customer) {
      setCustomers((prev) => [...prev, result.customer!]);
      setSelectedCustomer(result.customer.id);
      setShowNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    }
    setCustomerLoading(false);
  }

  async function handleSubmit() {
    if (method === "tunai" && paid < total) {
      setError("Uang bayar kurang dari total tagihan");
      return;
    }
    if (method === "utang" && !selectedCustomer) {
      setError("Pilih pelanggan untuk transaksi utang");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createTransaction(
      cart,
      total,
      method,
      paid,
      method === "utang" ? selectedCustomer : undefined,
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  function handleAmountChange(val: string) {
    const numeric = val.replace(/\D/g, "");
    setAmountPaid(numeric ? parseInt(numeric).toLocaleString("id-ID") : "");
  }

  const quickAmounts = [total, 5000, 10000, 20000, 50000, 100000]
    .filter((v, i, arr) => arr.indexOf(v) === i && v >= total)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal — z-index lebih tinggi dari navbar (z-50) */}
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header — fixed di dalam modal */}
        <div className="flex justify-between items-center p-6 pb-4 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6">
          {/* Total */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
            <p className="text-3xl font-bold text-emerald-700">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Metode */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setMethod("tunai")}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-colors ${
                method === "tunai"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                payments
              </span>
              Tunai
            </button>
            <button
              onClick={() => setMethod("utang")}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-colors ${
                method === "utang"
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                history_edu
              </span>
              Utang
            </button>
          </div>

          {/* Input Tunai */}
          {method === "tunai" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">
                Uang Dibayar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountPaid}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xl font-bold"
                />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmountPaid(amt.toLocaleString("id-ID"))}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Rp {amt.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>
              {paid >= total && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-blue-700 font-medium">
                    Kembalian
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    Rp {change.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Input Utang */}
          {method === "utang" && (
            <div className="mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-500">
                  Pilih Pelanggan
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                  className="text-xs text-emerald-600 font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    add
                  </span>
                  Pelanggan Baru
                </button>
              </div>

              {showNewCustomer && (
                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Nama pelanggan"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
                  />
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="No. HP (opsional)"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomer}
                    disabled={customerLoading}
                    className="w-full h-10 bg-emerald-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                  >
                    {customerLoading ? "Menyimpan..." : "Simpan Pelanggan"}
                  </button>
                </div>
              )}

              <div className="relative">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="appearance-none w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-sm bg-white"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="p-3 bg-red-50 rounded-xl text-center">
                <p className="text-xs text-red-500 font-medium">
                  Transaksi ini akan dicatat sebagai utang pelanggan
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
          )}
        </div>

        {/* Tombol — fixed di bawah modal, tidak tertutup navbar */}
        <div className="p-6 pt-4 shrink-0 bg-white rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-emerald-600 text-white font-bold text-base rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                SELESAIKAN TRANSAKSI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
