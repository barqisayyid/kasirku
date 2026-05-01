// app/(dashboard)/kasir/loading.tsx
export default function KasirLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      {/* Search skeleton */}
      <div className="h-12 bg-gray-200 rounded-xl mb-4" />

      {/* Chips skeleton */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}
