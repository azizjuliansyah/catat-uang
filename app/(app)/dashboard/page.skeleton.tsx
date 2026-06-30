/**
 * Dashboard page skeleton - matches exact layout from page.tsx
 * Layout: Stats grid (5 cols) + Main grid (Wallets 1 col + Transactions 2 cols)
 */

import { PageHeaderSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeaderSkeleton
        title="Selamat Datang"
        showDescription
        showActions
      />

      {/* DashboardStats: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 */}
      <div className={GRID_PATTERNS.stats.five}>
        <InfoCardSkeleton title="Total Saldo" valueAsZero />
        <InfoCardSkeleton title="Pemasukan Bulan Ini" valueAsZero />
        <InfoCardSkeleton title="Pengeluaran Bulan Ini" valueAsZero />
        <InfoCardSkeleton title="Arus Bersih (Net)" valueAsZero />
        <InfoCardSkeleton title="Hutang Paylater" valueAsZero />
      </div>

      {/* Main: Wallets (left) + Recent Transactions (right) */}
      <div className={GRID_PATTERNS.dashboard.main}>
        {/* Wallets section with label */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Dompet Saya
            </h2>
            <div className="h-3 w-16 bg-border/40 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((_, i) => (
              <ItemCardSkeleton key={`wallet-${i}`} variant="wallet-list" />
            ))}
          </div>
        </div>

        {/* Recent transactions section */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center px-1 mb-4">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
              <span className="w-3.5 h-3.5 bg-border/40 rounded" />
              Transaksi Terbaru
            </h2>
            <div className="h-3 w-16 bg-border/40 rounded" />
          </div>
          <div className="space-y-6">
            {/* Transaction groups with dates */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`tx-group-${i}`} className="space-y-3">
                <div className="h-4 w-28 bg-border/40 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <ItemCardSkeleton key={`tx-${i}-${j}`} variant="transaction-list" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
