/**
 * Goals page skeleton - matches exact layout from page.tsx
 * Layout: Header + FilterBar + Summary (4 cols) + Grid (2 cols, gap-6)
 *
 * Note: The skeleton below is for full-page loading (before header/filter/summary render).
 * For in-page grid loading (after header/filter/summary are visible), use GoalsGridSkeleton only.
 */

import { PageHeaderSkeleton, FilterBarSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

// Full page skeleton (used when entire page is loading)
export function GoalsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Target Tabungan"
        showActions
        actionCount={1}
      />

      <FilterBarSkeleton showTabs tabCount={4} />

      {/* GoalsSummary: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 */}
      <div className={GRID_PATTERNS.stats.four}>
        <InfoCardSkeleton title="Target Aktif Berjalan" valueAsZero />
        <InfoCardSkeleton title="Total Dana Terkumpul" valueAsZero />
        <InfoCardSkeleton title="Total Keseluruhan Target" valueAsZero />
        <InfoCardSkeleton title="Target Berhasil Dicapai" valueAsZero />
      </div>

      {/* Goals grid: grid grid-cols-1 md:grid-cols-2 gap-4 */}
      <div className={GRID_PATTERNS.cards.dual}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton
            key={i}
            showBadge
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
export function GoalsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ItemCardSkeleton
          key={i}
          showBadge
          showTwoColumnAmounts
          showProgress
          showFooter
        />
      ))}
    </div>
  );
}
