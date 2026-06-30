import { PageHeaderSkeleton, CategoryItemSkeleton } from "@/components/ui/skeleton";

export function AdminCategoriesPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Template Kategori"
        showDescription
        showActions
        actionCount={1}
      />

      {/* Filter Bar Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="h-10 flex-1 max-w-xs bg-border/40 rounded-full" />
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-border/40 rounded-full" />
            <div className="h-10 w-28 bg-border/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <CategoryItemSkeleton key={i} height="short" typeLabel="Pengeluaran" />
        ))}
      </div>
    </div>
  );
}
