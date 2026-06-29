export function WalletDetailTransactionListSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          {/* Date header */}
          <div className="flex items-center justify-between px-1">
            <div className="h-2.5 w-24 bg-border/40 rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-border/40 rounded animate-pulse" />
          </div>
          {/* Transaction cards */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0 animate-pulse" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-border/40 rounded animate-pulse mt-2" />
                </div>
              </div>
              <div className="h-5 w-20 bg-border/40 rounded ml-4 shrink-0 animate-pulse" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
