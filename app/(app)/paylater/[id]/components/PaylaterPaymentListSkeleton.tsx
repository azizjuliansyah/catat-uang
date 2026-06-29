export function PaylaterPaymentListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0 animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-28 bg-border/40 rounded animate-pulse" />
              <div className="h-2.5 w-40 bg-border/40 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-20 bg-border/40 rounded shrink-0 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
