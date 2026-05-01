// components/laporan/ExportButtons.tsx
"use client";

import { useState } from "react";
import { exportToExcel, exportToPDF } from "@/lib/export";

type Props = {
  laporan: any;
};

export default function ExportButtons({ laporan }: Props) {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  async function handleExcelExport() {
    setLoadingExcel(true);
    try {
      exportToExcel(laporan);
    } catch (e) {
      console.error(e);
    }
    setLoadingExcel(false);
  }

  async function handlePDFExport() {
    setLoadingPDF(true);
    try {
      exportToPDF(laporan);
    } catch (e) {
      console.error(e);
    }
    setLoadingPDF(false);
  }

  if (!laporan || laporan.jumlahTransaksi === 0) return null;

  const periodeLabel =
    laporan.periode === "mingguan"
      ? "Mingguan"
      : laporan.periode === "bulanan"
        ? "Bulanan"
        : "Harian";

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 mb-2">
        Export Laporan {periodeLabel}
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleExcelExport}
          disabled={loadingExcel}
          className="flex-1 h-12 bg-white border-2 border-green-600 text-green-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          {loadingExcel ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">
              table_view
            </span>
          )}
          Excel
        </button>

        <button
          onClick={handlePDFExport}
          disabled={loadingPDF}
          className="flex-1 h-12 bg-white border-2 border-red-500 text-red-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          {loadingPDF ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">
              picture_as_pdf
            </span>
          )}
          PDF
        </button>
      </div>
    </div>
  );
}
