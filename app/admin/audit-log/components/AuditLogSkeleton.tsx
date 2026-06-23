export function AuditLogSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Stats grid skeleton */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-surface-card border border-border rounded-2xl p-5 space-y-2">
            <div className="h-2.5 w-20 bg-border/40 rounded animate-pulse" />
            <div className="h-7 w-16 bg-border/40 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div> */}

      {/* Table skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {/* Header row skeleton */}
        <div className="bg-surface-input flex gap-4 px-4 py-3">
          <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
          <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
          <div className="h-3 w-12 bg-border/40 rounded animate-pulse" />
          <div className="h-3 w-14 bg-border/40 rounded animate-pulse" />
          <div className="h-3 w-12 bg-border/40 rounded animate-pulse" />
        </div>

        {/* Table rows skeleton */}
        <div className="divide-y divide-border/40">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex gap-4 px-4 py-3">
              {/* Time column */}
              <div className="w-28 flex items-center">
                <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
              </div>

              {/* Admin column */}
              <div className="w-36 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-border/40 animate-pulse shrink-0" />
                <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
              </div>

              {/* Action column */}
              <div className="w-32 flex items-center">
                <div className="h-6 w-28 bg-border/40 rounded-full animate-pulse" />
              </div>

              {/* Target column */}
              <div className="w-32 flex items-center">
                <div className="h-3 w-28 bg-border/40 rounded animate-pulse" />
              </div>

              {/* Detail column */}
              <div className="flex-1 flex items-center">
                <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
