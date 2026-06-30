/**
 * Reports page skeleton - matches exact layout from page.tsx
 * Layout: Header + FilterBar + Summary (4 cols) + Charts (flex row)
 */

import { PageHeaderSkeleton, FilterBarSkeleton, InfoCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Laporan Keuangan"
        showDescription
        showActions
        actionCount={2}
      />

      <FilterBarSkeleton
        showTabs={false}
        filterCount={4}
      />

      {/* ReportsSummary: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 */}
      <div className={GRID_PATTERNS.stats.four}>
        <InfoCardSkeleton title="Total Pemasukan" valueAsZero />
        <InfoCardSkeleton title="Total Pengeluaran" valueAsZero />
        <InfoCardSkeleton title="Arus Kas Bersih" valueAsZero />
        <InfoCardSkeleton title="Total Saldo Dompet" valueAsZero />
      </div>

      {/* Charts placeholder */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 h-64 bg-surface-card border border-border rounded-2xl animate-pulse" />
        <div className="space-y-6 min-w-0 flex-1">
          <div className="h-48 bg-surface-card border border-border rounded-2xl animate-pulse" />
          <div className="h-48 bg-surface-card border border-border rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
