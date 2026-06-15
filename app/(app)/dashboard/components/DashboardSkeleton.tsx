export function DashboardSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 bg-border/40 rounded animate-pulse" />
        <div className="h-9 w-36 bg-border/40 rounded-lg animate-pulse" />
      </div>

      {/* 5x InfoCard stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-border/40 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 bg-border/40 rounded" />
              <div className="h-5 w-24 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dompet Saya */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="h-3 w-20 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-12 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-card border border-border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden animate-pulse">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-border/40 rounded-l-2xl" />
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-border/40 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-border/40 rounded" />
                    <div className="h-2 w-16 bg-border/40 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-border/40 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Transaksi Terbaru */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="h-3 w-28 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-24 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-border/30 last:border-b-0 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-32 bg-border/40 rounded" />
                    <div className="h-2 w-20 bg-border/40 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-border/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
