/**
 * Wishlist page skeleton - matches exact layout from page.tsx
 * Layout: Header + FilterBar + Summary (4 cols) + Grid (2 cols, gap-6)
 */

import { PageHeaderSkeleton, FilterBarSkeleton, InfoCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";
import { WishlistGridSkeleton } from "./components/WishlistGridSkeleton";

// Full page skeleton (used when entire page is loading)
export function WishlistPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Daftar Keinginan"
        showActions
        actionCount={1}
      />

      <FilterBarSkeleton showTabs tabCount={3} />

      {/* WishlistSummary: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 */}
      <div className={GRID_PATTERNS.stats.four}>
        <InfoCardSkeleton title="Dana yang Dibutuhkan" valueAsZero />
        <InfoCardSkeleton title="Total Nilai Wishlist" valueAsZero />
        <InfoCardSkeleton title="Sudah Terbeli" valueAsZero />
        <InfoCardSkeleton title="Menunggu Dibeli" valueAsZero />
      </div>

      {/* Wishlist Grid */}
      <WishlistGridSkeleton />
    </div>
  );
}
