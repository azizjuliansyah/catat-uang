import { PageHeaderSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";

export function DebtDetailPageSkeleton() {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Detail Hutang & Piutang"
        showDescription
        showActions
        actionCount={2}
      />

      {/* Debt Summary/Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-8 w-40 bg-border/40 rounded" />
            <div className="h-2 bg-border/40 rounded-full" />
            <div className="flex justify-between gap-4">
              <div className="h-4 w-24 bg-border/40 rounded" />
              <div className="h-4 w-24 bg-border/40 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-8 w-40 bg-border/40 rounded" />
            <div className="h-2 bg-border/40 rounded-full" />
            <div className="flex justify-between gap-4">
              <div className="h-4 w-24 bg-border/40 rounded" />
              <div className="h-4 w-24 bg-border/40 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Transaction Groups + Payment History */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Transaction Groups */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Paket Transaksi
            </h2>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-border/40 rounded" />
                  <div className="h-4 w-32 bg-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Riwayat Pembayaran
            </h2>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-24 bg-border/40 rounded" />
                    <div className="h-4 w-20 bg-border/40 rounded" />
                  </div>
                  <div className="h-2 w-32 bg-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
