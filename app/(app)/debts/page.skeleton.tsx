/**
 * Debts page skeleton - matches exact layout from page.tsx
 * Layout: Header + FilterBar + Summary (2→4 cols) + Grid (2 cols)
 *
 * Note: The skeleton below is for full-page loading (before header/filter/summary render).
 * For in-page grid loading (after header/filter/summary are visible), use DebtsGridSkeleton only.
 */

import { PageHeaderSkeleton, FilterBarSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

// Full page skeleton (used when entire page is loading)
export function DebtsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Catatan Hutang & Piutang"
        showDescription
        showActions
        actionCount={1}
      />

      <FilterBarSkeleton
        showSearch
        showTabs
        tabCount={4}
      />

      {/* DebtsSummary: grid grid-cols-2 md:grid-cols-4 gap-4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCardSkeleton title="Total Hutang" valueAsZero />
        <InfoCardSkeleton title="Orang yang Saya Hutangi" valueAsZero />
        <InfoCardSkeleton title="Total Piutang" valueAsZero />
        <InfoCardSkeleton title="Orang yang Berhutang" valueAsZero />
      </div>

      {/* Debts grid: grid grid-cols-1 md:grid-cols-2 gap-4 */}
      <div className={GRID_PATTERNS.cards.dual}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton
            key={i}
            showTwoColumnAmounts
            showProgress
            showFooter
          />
        ))}
      </div>
    </div>
  );
}

// Grid-only skeleton (used when header/filter/summary are already rendered)
export function DebtsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ItemCardSkeleton
          key={i}
          showTwoColumnAmounts
          showProgress
          showFooter
        />
      ))}
    </div>
  );
}
