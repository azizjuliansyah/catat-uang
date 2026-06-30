/**
 * CategoryItemSkeleton - Settings category/template item skeleton.
 * Used for CategoriesTab and TemplatesTab items.
 */

interface CategoryItemSkeletonProps {
  showIcon?: boolean;
  showTypeLabel?: boolean; // "Pengeluaran" / "Pemasukan"
  typeLabel?: string; // Real text for type label
  showActions?: boolean;
  showDescription?: boolean; // For templates
  height?: "short" | "tall"; // short: categories (~64px), tall: templates (~128px)
  className?: string;
}

export function CategoryItemSkeleton({
  showIcon = true,
  showTypeLabel = true,
  typeLabel,
  showActions = true,
  showDescription = false,
  height = "short",
  className = "",
}: CategoryItemSkeletonProps) {
  const heightClass = height === "tall" ? "min-h-32" : "h-16";

  return (
    <div
      className={`bg-surface-card border border-border rounded-2xl p-4 flex items-start justify-between transition-all ${heightClass} ${className}`}
    >
      {/* Top portion */}
      <div className="flex items-start gap-3 relative z-10 flex-1">
        {/* Icon */}
        {showIcon && (
          <div className="w-10 h-10 rounded-xl bg-border/40 animate-pulse shrink-0" />
        )}

        {/* Name + Type */}
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-1" />
          {showTypeLabel && (
            typeLabel ? (
              <p className="text-[10px] font-semibold text-text-secondary">{typeLabel}</p>
            ) : (
              <div className="h-2 w-20 bg-border/40 rounded animate-pulse" />
            )
          )}
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center gap-0.5 relative z-10">
          <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-border/40 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Description (for templates) */}
      {showDescription && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="h-3 w-full bg-border/40 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
