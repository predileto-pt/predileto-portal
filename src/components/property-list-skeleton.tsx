export function PropertyListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border border-gray-200 bg-white px-3 py-2">
          <div className="flex gap-3">
            <div className="w-20 h-20 shrink-0 bg-gray-100 rounded" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 w-1/4 bg-gray-200 rounded" />
              <div className="h-2 w-1/3 bg-gray-100 rounded" />
              <div className="h-2.5 w-3/4 bg-gray-100 rounded" />
              <div className="flex gap-3">
                <div className="h-2 w-12 bg-gray-100 rounded" />
                <div className="h-2 w-8 bg-gray-100 rounded" />
                <div className="h-2 w-10 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
