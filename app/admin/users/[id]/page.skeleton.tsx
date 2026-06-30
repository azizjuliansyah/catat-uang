import { ItemCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export function UserDetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Back Button Skeleton */}
      <div className="h-9 w-32 bg-border/40 rounded animate-pulse" />

      {/* User Info Card Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-border/40" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 bg-border/40 rounded" />
            <div className="h-3 w-40 bg-border/40 rounded" />
            <div className="flex gap-4 pt-2">
              <div className="h-8 w-28 bg-border/40 rounded" />
              <div className="h-8 w-28 bg-border/40 rounded" />
              <div className="h-8 w-28 bg-border/40 rounded" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-2 w-20 bg-border/40 rounded mb-1" />
              <div className="h-3 w-32 bg-border/40 rounded" />
            </div>
            <div>
              <div className="h-2 w-20 bg-border/40 rounded mb-1" />
              <div className="h-3 w-32 bg-border/40 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Section Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-text-primary">Audit Log Pengguna</h3>
          <div className="h-8 w-24 bg-border/40 rounded animate-pulse" />
        </div>
        <div className="h-px bg-border/50" />
        <TableSkeleton rows={5} cols={4} showHeader={false} />
      </div>
    </div>
  );
}
