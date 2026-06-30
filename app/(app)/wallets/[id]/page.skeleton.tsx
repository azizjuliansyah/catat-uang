import { PageHeaderSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";

export function WalletDetailPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Dompet"
        showDescription
        showActions
        actionCount={1}
      />

      {/* Date Filter Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 animate-pulse">
        <div className="h-9 w-48 bg-border/40 rounded-full" />
      </div>

      {/* Wallet Stats Skeleton - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCardSkeleton title="Saldo Saat Ini" valueAsZero />
        <InfoCardSkeleton title="Total Pemasukan" valueAsZero />
        <InfoCardSkeleton title="Total Pengeluaran" valueAsZero />
        <InfoCardSkeleton title="Arus Kas Bersih" valueAsZero />
      </div>

      {/* Transaction List Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Date Group Header */}
            <div className="h-4 w-28 bg-border/40 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-border/40" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-border/40 rounded" />
                        <div className="h-2 w-24 bg-border/40 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-border/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
