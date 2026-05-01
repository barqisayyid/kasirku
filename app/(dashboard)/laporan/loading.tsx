// app/(dashboard)/laporan/loading.tsx
export default function LaporanLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded-lg mb-6" />
      <div className="h-36 bg-gray-200 rounded-xl mb-3" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-48 bg-gray-200 rounded-xl mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
