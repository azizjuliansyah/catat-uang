export function PaylaterTransactionListSkeleton() {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-3">
      <div className="h-4 w-48 bg-border/40 rounded animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border border-border/30 rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-border/40 shrink-0 animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-border/40 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-16 bg-border/40 rounded shrink-0 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
