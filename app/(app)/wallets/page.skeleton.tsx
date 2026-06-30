/**
 * Wallets page skeleton - matches exact layout from page.tsx
 * Layout: Header + Summary card + FilterBar + Grid (3→4 cols)
 *
 * Note: The skeleton below is for full-page loading (before header/summary/filter render).
 * For in-page grid loading (after header/summary/filter are visible), use WalletsGridSkeleton only.
 */

import { PageHeaderSkeleton, FilterBarSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

// Full page skeleton (used when entire page is loading)
export function WalletsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Kelola Dompet"
        showActions
        actionCount={2}
      />

      {/* WalletSummary card */}
      <div className="bg-surface-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label text-text-secondary uppercase tracking-wide">Total Saldo Aktif</p>
            <p className="text-metric text-text-primary font-mono mt-2">Rp 0</p>
          </div>
          <div className="text-right">
            <p className="text-caption text-text-secondary">4 Dompet Aktif</p>
          </div>
        </div>
      </div>

      <FilterBarSkeleton showSearch showTabs tabCount={2} />

      {/* Wallets grid: grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 */}
      <div className={GRID_PATTERNS.cards.quad}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Grid-only skeleton (used when header/summary/filter are already rendered)
export function WalletsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}
