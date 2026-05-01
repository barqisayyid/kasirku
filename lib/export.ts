// lib/export.ts
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- TYPES ---
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

// --- HELPERS ---
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

// Warna Emerald 600 untuk Branding KasirKu
const EMERALD_COLOR = "FF059669"; // Format ARGB

// ===== EXPORT EXCEL (ExcelJS) =====
export async function exportToExcel(laporan: LaporanData) {
  const workbook = new ExcelJS.Workbook();
  const tanggal = formatTanggal(laporan.tanggal);

  // --- SHEET 1: RINGKASAN ---
  const sheet1 = workbook.addWorksheet("Ringkasan");
  sheet1.getColumn(1).width = 25;
  sheet1.getColumn(2).width = 25;

  // Header Title
  sheet1.mergeCells("A1:B1");
  const titleCell = sheet1.getCell("A1");
  titleCell.value = "LAPORAN PENJUALAN HARIAN";
  titleCell.font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: EMERALD_COLOR },
  };
  titleCell.alignment = { horizontal: "center" };

  sheet1.addRow([`Tanggal:`, tanggal]);
  sheet1.addRow([]);

  // Ringkasan Section
  const ringkasanHeader = sheet1.addRow(["RINGKASAN"]);
  ringkasanHeader.font = { bold: true };

  const addSummaryRow = (
    label: string,
    value: any,
    isCurrency: boolean = true,
  ) => {
    const row = sheet1.addRow([label, value]);
    if (isCurrency) {
      row.getCell(2).numFmt = '"Rp "#,##0';
    }
  };

  addSummaryRow("Total Penjualan", laporan.totalPenjualan);
  addSummaryRow("Jumlah Transaksi", laporan.jumlahTransaksi, false);
  addSummaryRow("Total Tunai", laporan.totalTunai);
  addSummaryRow("Total Utang", laporan.totalUtang);

  sheet1.addRow([]);

  // Top Produk Table
  sheet1.addRow(["TOP PRODUK TERLARIS"]).font = { bold: true };
  const prodHeader = sheet1.addRow(["No", "Nama Produk", "Qty", "Total"]);

  // Style Table Header
  prodHeader.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EMERALD_COLOR },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  laporan.produkTerlaris.forEach((p, i) => {
    const row = sheet1.addRow([i + 1, p.name, p.qty, p.total]);
    row.getCell(4).numFmt = '"Rp "#,##0';
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // --- SHEET 2: DETAIL TRANSAKSI ---
  const sheet2 = workbook.addWorksheet("Detail Transaksi");
  sheet2.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Waktu", key: "waktu", width: 12 },
    { header: "Pelanggan", key: "cust", width: 20 },
    { header: "Metode", key: "metode", width: 12 },
    { header: "Item (Qty)", key: "item", width: 50 },
    { header: "Total", key: "total", width: 20 },
  ];

  // Header Style
  const trxHeaderRow = sheet2.getRow(1);
  trxHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  trxHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EMERALD_COLOR },
    };
  });

  laporan.transactions.forEach((trx, i) => {
    const itemList =
      trx.transaction_items
        ?.map((item) => `${item.product_name} (${item.quantity}x)`)
        .join(", ") ?? "-";
    const row = sheet2.addRow({
      no: i + 1,
      waktu: formatWaktu(trx.created_at),
      cust: trx.customers?.name ?? "Umum",
      metode: trx.payment_method === "tunai" ? "Tunai" : "Utang",
      item: itemList,
      total: trx.total_price,
    });
    row.getCell("total").numFmt = '"Rp "#,##0';
  });

  // --- SHEET 3: DETAIL ITEM ---
  const sheet3 = workbook.addWorksheet("Detail Item");
  sheet3.columns = [
    { header: "Waktu", key: "waktu", width: 12 },
    { header: "Produk", key: "produk", width: 30 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "Harga Satuan", key: "harga", width: 20 },
    { header: "Subtotal", key: "subtotal", width: 20 },
  ];

  const itemHeaderRow = sheet3.getRow(1);
  itemHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  itemHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EMERALD_COLOR },
    };
  });

  laporan.transactions.forEach((trx) => {
    trx.transaction_items?.forEach((item) => {
      const row = sheet3.addRow({
        waktu: formatWaktu(trx.created_at),
        produk: item.product_name,
        qty: item.quantity,
        harga: item.subtotal / item.quantity,
        subtotal: item.subtotal,
      });
      row.getCell("harga").numFmt = '"Rp "#,##0';
      row.getCell("subtotal").numFmt = '"Rp "#,##0';
    });
  });

  // --- DOWNLOAD LOGIC ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ===== EXPORT PDF (jsPDF) =====
export function exportToPDF(laporan: LaporanData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const tanggal = formatTanggal(laporan.tanggal);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Emerald
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KasirKu", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penjualan Harian", 14, 23);
  doc.text(tanggal, 14, 30);

  doc.setTextColor(30, 30, 30);

  // Summary Table
  autoTable(doc, {
    startY: 45,
    body: [
      ["Total Penjualan", formatRupiah(laporan.totalPenjualan)],
      ["Jumlah Transaksi", `${laporan.jumlahTransaksi} transaksi`],
      ["Total Tunai", formatRupiah(laporan.totalTunai)],
      ["Total Utang", formatRupiah(laporan.totalUtang)],
    ],
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: { 1: { fontStyle: "bold", textColor: [5, 150, 105] } },
  });

  // Top Produk Table
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Top Produk Terlaris", 14, (doc as any).lastAutoTable.finalY + 10);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["No", "Produk", "Qty", "Total"]],
    body: laporan.produkTerlaris.map((p, i) => [
      i + 1,
      p.name,
      `${p.qty}x`,
      formatRupiah(p.total),
    ]),
    headStyles: { fillColor: [5, 150, 105] },
    theme: "striped",
  });

  // Transactions Table
  doc.text("Detail Transaksi", 14, (doc as any).lastAutoTable.finalY + 10);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Waktu", "Pelanggan", "Metode", "Total"]],
    body: laporan.transactions.map((trx) => [
      formatWaktu(trx.created_at),
      trx.customers?.name ?? "Umum",
      trx.payment_method === "tunai" ? "Tunai" : "Utang",
      formatRupiah(trx.total_price),
    ]),
    headStyles: { fillColor: [5, 150, 105] },
    theme: "striped",
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`KasirKu — Halaman ${i} dari ${pageCount}`, pageWidth / 2, 285, {
      align: "center",
    });
  }

  doc.save(`Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.pdf`);
}
