// components/laporan/WeeklyChart.tsx
"use client";

type DayData = {
  label: string;
  total: number;
  date: string;
};

type Props = {
  data: DayData[];
};

export default function WeeklyChart({ data }: Props) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const today = new Date().toDateString();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 mb-4">
        Penjualan 7 Hari Terakhir
      </p>
      <div className="flex items-end gap-2 h-32">
        {data.map((day, i) => {
          const isToday = new Date(day.date).toDateString() === today;
          const heightPercent = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex items-end justify-center"
                style={{ height: "100px" }}
              >
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isToday ? "bg-emerald-600" : "bg-emerald-200"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  title={`Rp ${day.total.toLocaleString("id-ID")}`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isToday ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
      {maxTotal > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Tertinggi: Rp {maxTotal.toLocaleString("id-ID")}
        </p>
      )}
    </div>
  );
}
