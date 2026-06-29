export function ReportsChartsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-w-0 items-start">
      {/* Cashflow Summary Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0 flex-1">
        <div className="h-4 w-48 bg-surface-hover rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 p-3 bg-surface-hover/30 rounded-xl">
              <div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-2 w-12 bg-surface-hover/50 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-surface-hover/50 rounded animate-pulse" />
                </div>
                <div className="h-2 bg-surface-card/50 rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-2 w-12 bg-surface-hover/50 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-surface-hover/50 rounded animate-pulse" />
                </div>
                <div className="h-2 bg-surface-card/50 rounded animate-pulse" />
              </div>
              <div className="pt-2 mt-2 border-t border-border/30">
                <div className="flex justify-between">
                  <div className="h-2 w-14 bg-surface-hover/50 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-surface-hover/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Two Donut Charts Skeleton */}
      <div className="space-y-6 min-w-0 flex-1">
        {/* Income Distribution Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <div className="h-4 w-56 bg-surface-hover rounded animate-pulse mb-4" />
          <div className="h-48 w-full bg-surface-hover/30 rounded animate-pulse" />
        </div>

        {/* Expense Distribution Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 min-w-0">
          <div className="h-4 w-56 bg-surface-hover rounded animate-pulse mb-4" />
          <div className="h-48 w-full bg-surface-hover/30 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
