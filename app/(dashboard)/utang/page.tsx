// app/(dashboard)/utang/page.tsx
import { getUtangList } from "@/lib/actions/utang";
import UtangList from "@/components/utang/UtangList";

export default async function UtangPage() {
  const utangList = await getUtangList();

  const totalUtang = utangList.reduce((sum, d) => sum + d.remaining_debt, 0);
  const belumLunas = utangList.filter((d) => d.status === "belum_lunas").length;
  const lunas = utangList.filter((d) => d.status === "lunas").length;

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Utang Pelanggan</h2>
        <p className="text-xs text-gray-400">
          {utangList.length} catatan utang
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="col-span-3 bg-red-500 rounded-xl p-4">
          <p className="text-xs text-red-200 mb-1">Total Piutang</p>
          <p className="text-2xl font-bold text-white">
            Rp {totalUtang.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-500">{belumLunas}</p>
          <p className="text-xs text-gray-400 mt-0.5">Belum Lunas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{lunas}</p>
          <p className="text-xs text-gray-400 mt-0.5">Lunas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-700">{utangList.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total</p>
        </div>
      </div>

      <UtangList utangList={utangList as any} />
    </div>
  );
}
