export function GoalsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-surface-card border border-border rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
          {/* Header: icon + name + badge + action buttons */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-border/40 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-border/40 rounded" />
                <div className="h-5 w-16 rounded-full bg-border/40" />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="w-7 h-7 rounded-lg bg-border/40" />
              <div className="w-7 h-7 rounded-lg bg-border/40" />
            </div>
          </div>
          {/* 2-col amounts (Terkumpul / Target) */}
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-border/40 rounded" />
              <div className="h-4 w-20 bg-border/40 rounded" />
            </div>
            <div className="flex flex-col items-end space-y-1.5">
              <div className="h-2.5 w-12 bg-border/40 rounded" />
              <div className="h-4 w-24 bg-border/40 rounded" />
            </div>
          </div>
          {/* Progress bar */}
          <div>
            <div className="h-1.5 w-full rounded-full bg-border/40" />
            <div className="flex justify-between mt-1.5">
              <div className="h-2.5 w-24 bg-border/40 rounded" />
              <div className="h-2.5 w-8 bg-border/40 rounded" />
            </div>
          </div>
          {/* Footer: date + detail link */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <div className="h-3 w-24 bg-border/40 rounded" />
            <div className="h-3 w-16 bg-border/40 rounded" />
          </div>
          {/* Quick action buttons */}
          <div className="flex justify-end gap-2">
            <div className="h-7 w-14 rounded-lg bg-border/40" />
            <div className="h-7 w-16 rounded-lg bg-border/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
