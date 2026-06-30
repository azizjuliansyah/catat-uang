/**
 * Paylater page skeleton - matches exact layout from page.tsx
 * Layout: Header + Progress card + Summary (4 cols) + Grid (2 cols)
 *
 * Note: The skeleton below is for full-page loading (before header/summary render).
 * For in-page grid loading (after header/summary are visible), use PaylaterGridSkeleton only.
 */

import { PageHeaderSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

// Full page skeleton (used when entire page is loading)
export function PaylaterPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Platform Paylater"
        showActions
        actionCount={1}
      />

      {/* PaylaterSummary - Progress Bar Card + 4 InfoCards */}
      <div className="bg-surface-card rounded-2xl p-5 space-y-3 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Persentase Penggunaan Limit
          </p>
          <div className="h-5 w-16 bg-border/40 rounded animate-pulse" />
        </div>
        <div className="h-2 bg-border/40 rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-border/40 rounded animate-pulse" />
          <div className="h-4 w-24 bg-border/40 rounded animate-pulse" />
        </div>
      </div>

      <div className={GRID_PATTERNS.stats.four}>
        <InfoCardSkeleton title="Total Tagihan" valueAsZero />
        <InfoCardSkeleton title="Sisa Kredit Tersedia" valueAsZero />
        <InfoCardSkeleton title="Jumlah Platform" valueAsZero />
        <InfoCardSkeleton title="Total Batas Limit" valueAsZero />
      </div>

      {/* Paylater grid: grid grid-cols-1 md:grid-cols-2 gap-4 */}
      <div className={GRID_PATTERNS.cards.dual}>
        {Array.from({ length: 4 }).map((_, i) => (
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

// Grid-only skeleton (used when header/summary are already rendered)
export function PaylaterGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
