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

// --- EXPORT EXCEL (ExcelJS) ---

export async function exportToExcel(laporan: LaporanData) {
  const workbook = new ExcelJS.Workbook();
  const tanggal = formatTanggal(laporan.tanggal);
  const emeraldColor = "FF059669"; // Format ARGB (Emerald 600)

  // 1. Sheet Ringkasan
  const sheet1 = workbook.addWorksheet("Ringkasan");

  // Styling Kolom
  sheet1.columns = [
    { header: "Keterangan", key: "label", width: 25 },
    { header: "Nilai", key: "value", width: 25 },
  ];

  // Header Laporan
  const title = sheet1.getCell("A1");
  title.value = "LAPORAN PENJUALAN HARIAN";
  title.font = { size: 16, bold: true, color: { argb: emeraldColor } };
  sheet1.addRow([`Tanggal: ${tanggal}`]);
  sheet1.addRow([]);

  // Tabel Ringkasan
  sheet1.addRow(["RINGKASAN"]).font = { bold: true };
  const rows = [
    ["Total Penjualan", laporan.totalPenjualan],
    ["Jumlah Transaksi", laporan.jumlahTransaksi],
    ["Total Tunai", laporan.totalTunai],
    ["Total Utang", laporan.totalUtang],
  ];

  rows.forEach((r) => {
    const row = sheet1.addRow(r);
    if (typeof r[1] === "number" && r[0] !== "Jumlah Transaksi") {
      row.getCell(2).numFmt = '"Rp "#,##0';
    }
  });

  sheet1.addRow([]);

  // Tabel Top Produk
  const topHeader = sheet1.addRow(["TOP PRODUK TERLARIS"]);
  topHeader.font = { bold: true };

  const productTableHead = ["No", "Nama Produk", "Qty", "Total"];
  const headRow = sheet1.addRow(productTableHead);

  // Style Header Table
  headRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: emeraldColor },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { horizontal: "center" };
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

  // 2. Sheet Detail Transaksi
  const sheet2 = workbook.addWorksheet("Detail Transaksi");
  sheet2.addRow(["DETAIL TRANSAKSI"]).font = { bold: true, size: 14 };
  sheet2.addRow([]);

  const trxHeader = ["Waktu", "Pelanggan", "Metode", "Item", "Total"];
  const trxHeadRow = sheet2.addRow(trxHeader);

  trxHeadRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: emeraldColor },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
  });

  laporan.transactions.forEach((trx) => {
    const items = trx.transaction_items
      .map((i) => `${i.product_name} (${i.quantity}x)`)
      .join(", ");
    const row = sheet2.addRow([
      formatWaktu(trx.created_at),
      trx.customers?.name ?? "Umum",
      trx.payment_method === "tunai" ? "Tunai" : "Utang",
      items,
      trx.total_price,
    ]);
    row.getCell(5).numFmt = '"Rp "#,##0';
  });

  sheet2.columns.forEach((col) => (col.width = 20));
  sheet2.getColumn(4).width = 40;

  // --- Browser Download ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.xlsx`;
  a.click();
}

// --- EXPORT PDF (jsPDF) ---

export function exportToPDF(laporan: LaporanData) {
  const doc = new jsPDF();
  const tanggal = formatTanggal(laporan.tanggal);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Emerald
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("KasirKu - Laporan Harian", 14, 15);
  doc.setFontSize(10);
  doc.text(tanggal, 14, 22);

  // Ringkasan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text("Ringkasan Penjualan", 14, 40);

  autoTable(doc, {
    startY: 45,
    body: [
      ["Total Penjualan", formatRupiah(laporan.totalPenjualan)],
      ["Jumlah Transaksi", `${laporan.jumlahTransaksi} Transaksi`],
      ["Total Tunai", formatRupiah(laporan.totalTunai)],
      ["Total Utang", formatRupiah(laporan.totalUtang)],
    ],
    theme: "plain",
    columnStyles: { 0: { cellWidth: 50 }, 1: { fontStyle: "bold" } },
  });

  // Top Produk Table
  doc.text("Top Produk Terlaris", 14, (doc as any).lastAutoTable.finalY + 10);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["No", "Produk", "Qty", "Total"]],
    body: laporan.produkTerlaris.map((p, i) => [
      i + 1,
      p.name,
      p.qty,
      formatRupiah(p.total),
    ]),
    headStyles: { fillColor: [5, 150, 105] },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString("id-ID")} - Halaman ${i}/${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" },
    );
  }

  doc.save(`Laporan_KasirKu_${tanggal.replace(/ /g, "_")}.pdf`);
}
