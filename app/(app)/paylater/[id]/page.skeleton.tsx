import { PageHeaderSkeleton, InfoCardSkeleton } from "@/components/ui/skeleton";

export function PaylaterDetailPageSkeleton() {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Detail Platform Paylater"
        showDescription
        showActions
        actionCount={3}
      />

      {/* Progress & Info Section */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Persentase Penggunaan Limit
          </p>
          <div className="h-5 w-16 bg-border/40 rounded" />
        </div>
        <div className="h-2 bg-border/40 rounded-full" />
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-border/40 rounded" />
          <div className="h-4 w-24 bg-border/40 rounded" />
        </div>
      </div>

      {/* Next Billing Dates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-6 w-28 bg-border/40 rounded" />
          </div>
        </div>
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-32 bg-border/40 rounded" />
            <div className="h-6 w-28 bg-border/40 rounded" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Transactions + Payment History */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Transactions Section */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Daftar Transaksi
            </h2>
            <div className="h-8 w-32 bg-border/40 rounded" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-border/40 rounded" />
                    <div className="h-3 w-28 bg-border/40 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History Section */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Riwayat Pembayaran
            </h2>
            <div className="h-9 w-28 bg-border/40 rounded" />
          </div>
          <div className="space-y-2">
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
