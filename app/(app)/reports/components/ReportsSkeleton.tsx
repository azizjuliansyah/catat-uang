export function ReportsSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header: title + export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-border/40 rounded animate-pulse" />
          <div className="h-3 w-72 bg-border/40 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-border/40 rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-border/40 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row flex-wrap items-center gap-3 animate-pulse">
        <div className="h-9 w-full sm:w-48 bg-border/40 rounded-xl" />
        <div className="h-9 w-full sm:w-48 bg-border/40 rounded-xl" />
        <div className="h-9 w-full sm:w-48 bg-border/40 rounded-xl" />
        <div className="sm:ml-auto h-9 w-28 bg-border/40 rounded-xl" />
      </div>

      {/* 4x InfoCard summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-card border border-border/50 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-border/40 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 bg-border/40 rounded" />
              <div className="h-5 w-24 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Cashflow chart placeholder */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 h-64 animate-pulse" />
      {/* Category breakdown placeholder */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 h-48 animate-pulse" />
    </div>
  );
}
