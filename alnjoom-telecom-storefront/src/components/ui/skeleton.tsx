export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => <div key={index} className="surface-card overflow-hidden p-3"><div className="skeleton aspect-square rounded-lg" /><div className="skeleton mt-4 h-4 rounded" /><div className="skeleton mt-3 h-4 w-2/3 rounded" /></div>)}
    </div>
  );
}
