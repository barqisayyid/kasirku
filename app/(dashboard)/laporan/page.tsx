// app/(dashboard)/laporan/page.tsx
import { getLaporan, getLaporanMingguan } from "@/lib/actions/laporan";
import LaporanView from "@/components/laporan/LaporanView";

export default async function LaporanPage() {
  const [laporan, mingguan] = await Promise.all([
    getLaporan("harian"),
    getLaporanMingguan(),
  ]);

  return <LaporanView initialLaporan={laporan} initialMingguan={mingguan} />;
}
