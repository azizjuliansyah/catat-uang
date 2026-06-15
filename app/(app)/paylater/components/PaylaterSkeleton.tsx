export function PaylaterBannerSkeleton() {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-5 md:p-6 animate-pulse space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-24 bg-border/40 rounded" />
            <div className="h-7 w-32 bg-border/40 rounded" />
            <div className="h-2.5 w-36 bg-border/40 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-40 bg-border/40 rounded" />
          <div className="h-3 w-10 bg-border/40 rounded" />
        </div>
        <div className="h-2 w-full rounded-full bg-border/40" />
      </div>
    </div>
  );
}

export function PaylaterGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-card border border-border rounded-2xl overflow-hidden animate-pulse">
          <div className="h-1 w-full bg-border/40" />
          <div className="p-5 space-y-4">
            {/* Icon + name + billing cycle + action buttons */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-border/40 rounded" />
                  <div className="h-2.5 w-40 bg-border/40 rounded" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded-lg bg-border/40" />
                <div className="w-7 h-7 rounded-lg bg-border/40" />
              </div>
            </div>
            {/* 2-col amounts */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 bg-border/40 rounded" />
                <div className="h-4 w-20 bg-border/40 rounded" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-14 bg-border/40 rounded" />
                <div className="h-4 w-20 bg-border/40 rounded" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-border/40" />
            {/* Footer */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <div className="h-3 w-16 bg-border/40 rounded" />
              <div className="h-8 w-24 rounded-lg bg-border/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
