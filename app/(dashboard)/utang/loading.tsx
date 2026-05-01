// app/(dashboard)/utang/loading.tsx
export default function UtangLoading() {
  return (
    <div className="px-4 py-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6" />
      <div className="h-24 bg-gray-200 rounded-xl mb-3" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
