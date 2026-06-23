export function UsersSkeleton() {
  return (
    <div className="p-6 space-y-4 font-sans">
      {/* Header row skeleton */}
      <div className="flex gap-4 px-4">
        <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
        <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
        <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
        <div className="h-3 w-20 bg-border/40 rounded animate-pulse" />
        <div className="h-3 w-12 bg-border/40 rounded animate-pulse ml-auto" />
      </div>

      {/* Table rows skeleton */}
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex gap-4 px-4 py-3 border-t border-border/40">
          {/* User column */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-40 bg-border/40 rounded animate-pulse" />
          </div>

          {/* Role column */}
          <div className="w-20 flex items-center">
            <div className="h-6 w-14 bg-border/40 rounded-full animate-pulse" />
          </div>

          {/* Status column */}
          <div className="w-24 flex items-center">
            <div className="h-6 w-20 bg-border/40 rounded-full animate-pulse" />
          </div>

          {/* Date column */}
          <div className="w-28 flex items-center">
            <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
          </div>

          {/* Actions column */}
          <div className="flex gap-1 ml-auto">
            <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
