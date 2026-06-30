/**
 * FilterBarSkeleton - Filter bar skeleton with search, tabs, and filters.
 * Displays blank placeholders for interactive elements.
 */

interface FilterBarSkeletonProps {
  showSearch?: boolean;
  showTabs?: boolean;
  tabCount?: number;
  showFilters?: boolean; // Expanded filter section
  filterCount?: number;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function FilterBarSkeleton({
  showSearch = true,
  showTabs = true,
  tabCount = 2,
  showFilters = false,
  filterCount = 4,
  layout = "horizontal",
  className = "",
}: FilterBarSkeletonProps) {
  const containerClass = layout === "horizontal"
    ? "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border rounded-2xl p-4"
    : "space-y-4 bg-surface-card border border-border rounded-2xl p-4";

  return (
    <div className={containerClass}>
      {/* Tabs or search on the left */}
      <div className="flex gap-2 flex-wrap">
        {showTabs &&
          Array.from({ length: tabCount }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 bg-border/40 rounded-full animate-pulse"
            />
          ))}
        </div>

      {/* Search input */}
      {showSearch && (
        <div className="h-10 w-full sm:w-64 bg-border/40 rounded-lg animate-pulse" />
      )}

      {/* Filters section */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {Array.from({ length: filterCount }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-border/40 rounded animate-pulse" />
              <div className="h-9 w-full bg-border/40 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Action buttons on the right */}
      <div className="flex gap-2 ml-auto">
        <div className="h-9 w-24 bg-border/40 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
