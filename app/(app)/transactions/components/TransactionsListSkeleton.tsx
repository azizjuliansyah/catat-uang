export function TransactionsListSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((g) => (
        <div key={g} className="space-y-3">
          {/* Date group header */}
          <div className="flex items-center gap-3 px-1">
            <div className="h-2.5 w-24 bg-border/40 rounded animate-pulse" />
            <div className="h-px flex-1 bg-border/40" />
          </div>
          {/* Transaction cards */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-card border border-border rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-32 bg-border/40 rounded" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-4 w-16 bg-border/40 rounded-lg" />
                      <div className="h-4 w-14 bg-border/40 rounded-lg" />
                      <div className="h-4 w-16 bg-border/40 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="h-5 w-20 bg-border/40 rounded ml-4 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
