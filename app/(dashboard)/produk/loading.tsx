// app/(dashboard)/produk/loading.tsx
export default function ProdukLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-8 w-32 bg-gray-200 rounded-lg" />
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
