// lib/export.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TransactionItem = {
  id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
};

type Transaction = {
  id: string;
  payment_method: "tunai" | "utang";
  total_price: number;
  created_at: string;
  transaction_items: TransactionItem[];
  customers?: { name: string } | null;
};

type LaporanData = {
  tanggal: string;
  totalPenjualan: number;
  jumlahTransaksi: number;
  totalTunai: number;
  totalUtang: number;
  produkTerlaris: { name: string; qty: number; total: number }[];
  transactions: Transaction[];
};

// Format tanggal Indonesia
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ===== EXPORT EXCEL =====
export function exportToExcel(laporan: LaporanData) {
  const wb = XLSX.utils.book_new();
  const tanggal = formatTanggal(laporan.tanggal);

  // --- Sheet 1: Ringkasan ---
  const ringkasanData = [
    ["LAPORAN PENJUALAN HARIAN"],
    ["Tanggal:", tanggal],
    [""],
    ["RINGKASAN"],
    ["Total Penjualan", formatRupiah(laporan.totalPenjualan)],
    ["Jumlah Transaksi", laporan.jumlahTransaksi],
    ["Total Tunai", formatRupiah(laporan.totalTunai)],
    ["Total Utang", formatRupiah(laporan.totalUtang)],
    [""],
    ["TOP PRODUK TERLARIS"],
    ["No", "Nama Produk", "Qty Terjual", "Total"],
    ...laporan.produkTerlaris.map((p, i) => [
      i + 1,
      p.name,
      p.qty,
      formatRupiah(p.total),
    ]),
  ];

  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);

  // Style lebar kolom
  wsRingkasan["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, wsRingkasan, "Ringkasan");

  // --- Sheet 2: Detail Transaksi ---
  const transaksiRows: any[][] = [
    ["DETAIL TRANSAKSI"],
    ["Tanggal:", tanggal],
    [""],
    ["No", "Waktu", "Pelanggan", "Metode", "Item", "Total"],
  ];

  laporan.transactions.forEach((trx, i) => {
    const itemList =
      trx.transaction_items
        ?.map((item) => `${item.product_name} (${item.quantity}x)`)
        .join(", ") ?? "-";

    transaksiRows.push([
      i + 1,
      formatWaktu(trx.created_at),
      trx.customers?.name ?? "Umum",
      trx.payment_method === "tunai" ? "Tunai" : "Utang",
      itemList,
      formatRupiah(trx.total_price),
    ]);
  });

  const wsTransaksi = XLSX.utils.aoa_to_sheet(transaksiRows);
  wsTransaksi["!cols"] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 20 },
    { wch: 10 },
    { wch: 50 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTransaksi, "Detail Transaksi");

  // --- Sheet 3: Per Item ---
  const itemRows: any[][] = [
    ["DETAIL PER ITEM"],
    ["Tanggal:", tanggal],
    [""],
    ["Waktu", "Produk", "Qty", "Harga Satuan", "Subtotal"],
  ];

  laporan.transactions.forEach((trx) => {
    trx.transaction_items?.forEach((item) => {
      itemRows.push([
        formatWaktu(trx.created_at),
        item.product_name,
        item.quantity,
        formatRupiah(item.subtotal / item.quantity),
        formatRupiah(item.subtotal),
      ]);
    });
  });

  const wsItem = XLSX.utils.aoa_to_sheet(itemRows);
  wsItem["!cols"] = [
    { wch: 10 },
    { wch: 30 },
    { wch: 8 },
    { wch: 20 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsItem, "Detail Item");

  // Download
  const fileName = `Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ===== EXPORT PDF =====
export function exportToPDF(laporan: LaporanData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const tanggal = formatTanggal(laporan.tanggal);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KasirKu", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penjualan Harian", 14, 23);
  doc.text(tanggal, 14, 30);

  // Reset warna teks
  doc.setTextColor(30, 30, 30);

  // Ringkasan cards
  let y = 45;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 14, y);
  y += 6;

  const summaryData = [
    ["Total Penjualan", formatRupiah(laporan.totalPenjualan)],
    ["Jumlah Transaksi", `${laporan.jumlahTransaksi} transaksi`],
    ["Total Tunai", formatRupiah(laporan.totalTunai)],
    ["Total Utang", formatRupiah(laporan.totalUtang)],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "normal", textColor: [100, 100, 100], cellWidth: 60 },
      1: { fontStyle: "bold", textColor: [5, 150, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  // Top produk terlaris
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Top Produk Terlaris", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["No", "Produk", "Qty", "Total"]],
    body: laporan.produkTerlaris.map((p, i) => [
      i + 1,
      p.name,
      `${p.qty}x`,
      formatRupiah(p.total),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Detail transaksi
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Detail Transaksi", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Waktu", "Pelanggan", "Metode", "Total"]],
    body: laporan.transactions.map((trx) => [
      formatWaktu(trx.created_at),
      trx.customers?.name ?? "Umum",
      trx.payment_method === "tunai" ? "Tunai" : "Utang",
      formatRupiah(trx.total_price),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `KasirKu — Digenerate otomatis • Halaman ${i} dari ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  // Download
  const fileName = `Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.pdf`;
  doc.save(fileName);
}
