/**
 * Transactions page skeleton - matches exact layout from page.tsx
 * Layout: Header + FilterBar + Summary (3 cols) + Transaction list
 */

import { PageHeaderSkeleton, FilterBarSkeleton, InfoCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

export function TransactionsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Daftar Transaksi"
        showActions
        actionCount={2}
      />

      <FilterBarSkeleton
        showSearch
        showTabs={false}
        showFilters={true}
        filterCount={5}
      />

      {/* TransactionsSummary: grid grid-cols-1 sm:grid-cols-3 gap-4 */}
      <div className={GRID_PATTERNS.stats.three}>
        <InfoCardSkeleton title="Total Pemasukan" valueAsZero />
        <InfoCardSkeleton title="Total Pengeluaran" valueAsZero />
        <InfoCardSkeleton title="Arus Bersih (Net)" valueAsZero />
      </div>

      {/* Transaction list skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`tx-group-${i}`} className="space-y-3">
            <div className="h-4 w-28 bg-border/40 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={`tx-${i}-${j}`} className="bg-surface-card border border-border rounded-xl p-4 animate-pulse">
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
