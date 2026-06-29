export function ReportsTablesSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Cashflow Table Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 flex-1">
        <div className="h-4 w-48 bg-surface-hover rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {/* Header */}
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-surface-hover rounded animate-pulse" />
            <div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
            <div className="h-3 w-24 bg-surface-hover rounded animate-pulse" />
            <div className="h-3 w-16 bg-surface-hover rounded animate-pulse" />
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-16 bg-surface-hover/60 rounded animate-pulse" />
              <div className="h-8 w-20 bg-surface-hover/60 rounded animate-pulse" />
              <div className="h-8 w-24 bg-surface-hover/60 rounded animate-pulse" />
              <div className="h-8 w-16 bg-surface-hover/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Two Category Tables Skeleton */}
      <div className="space-y-6 flex-1">
        {/* Income Category Table Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <div className="h-4 w-56 bg-surface-hover rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
              <div className="h-3 w-24 bg-surface-hover rounded animate-pulse" />
              <div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
              <div className="h-3 w-16 bg-surface-hover rounded animate-pulse" />
            </div>
            {/* Rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-24 bg-surface-hover/60 rounded animate-pulse" />
                <div className="h-8 w-20 bg-surface-hover/60 rounded animate-pulse" />
                <div className="h-8 w-16 bg-surface-hover/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Expense Category Table Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <div className="h-4 w-56 bg-surface-hover rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
              <div className="h-3 w-24 bg-surface-hover rounded animate-pulse" />
              <div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
              <div className="h-3 w-16 bg-surface-hover rounded animate-pulse" />
            </div>
            {/* Rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-24 bg-surface-hover/60 rounded animate-pulse" />
                <div className="h-8 w-20 bg-surface-hover/60 rounded animate-pulse" />
                <div className="h-8 w-16 bg-surface-hover/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
