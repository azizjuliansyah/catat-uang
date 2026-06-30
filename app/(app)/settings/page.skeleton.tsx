/**
 * Settings page skeleton - matches exact layout from page.tsx
 * Layout: Header + Tabs + Profile/Security section + Categories (3 cols) + Templates (3 cols wide)
 */

import { PageHeaderSkeleton, CategoryItemSkeleton } from "@/components/ui/skeleton";
import { GRID_PATTERNS } from "@/components/ui/skeleton/layouts/grid-config";

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeaderSkeleton
        title="Pengaturan Aplikasi"
        showDescription
        showActions={false}
      />

      {/* Tabs selector skeleton */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-border/40 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Profile/Security section */}
      <div className="space-y-4">
        <div className="bg-surface-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-border/40 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-border/40 rounded animate-pulse" />
              <div className="h-3 w-48 bg-border/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories section */}
      <div className="space-y-4">
        {/* Subtab bar skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border rounded-2xl p-4">
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
            <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-border/40 rounded-lg animate-pulse" />
            <div className="h-9 w-32 bg-border/40 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Categories grid: grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 */}
        <div className={GRID_PATTERNS.settings.three}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryItemSkeleton key={i} height="short" />
          ))}
        </div>
      </div>

      {/* Templates section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border rounded-2xl p-4">
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
            <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-border/40 rounded-lg animate-pulse" />
        </div>

        {/* Templates grid: grid grid-cols-1 sm:grid-cols-3 gap-4 */}
        <div className={GRID_PATTERNS.settings.threeWide}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryItemSkeleton key={i} height="tall" showDescription />
          ))}
        </div>
      </div>
    </div>
  );
}
