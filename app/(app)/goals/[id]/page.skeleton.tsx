import { PageHeaderSkeleton, InfoCardSkeleton } from "@/components/ui/skeleton";

export function GoalDetailPageSkeleton() {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Detail Target Tabungan"
        showDescription
        showActions
        actionCount={3}
      />

      {/* Goal Summary Card */}
      <div className="bg-surface-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 bg-border/40 rounded" />
              <div className="h-3 w-32 bg-border/40 rounded" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-6 w-32 bg-border/40 rounded ml-auto" />
              <div className="h-3 w-24 bg-border/40 rounded ml-auto" />
            </div>
          </div>
          <div className="h-2 bg-border/40 rounded-full" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-8 w-32 bg-border/40 rounded" />
          </div>
        </div>
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-8 w-32 bg-border/40 rounded" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Deadline Estimation + Transaction List */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Deadline Estimation */}
        <div className="flex-1">
          <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
            <div className="space-y-3">
              <div className="h-3 w-32 bg-border/40 rounded" />
              <div className="h-4 w-24 bg-border/40 rounded" />
              <div className="h-3 w-28 bg-border/40 rounded" />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Riwayat Setoran/Tarik
            </h2>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-border/40 rounded" />
                  <div className="h-4 w-20 bg-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
