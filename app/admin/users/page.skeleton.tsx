import { TableSkeleton } from "@/components/ui/skeleton";

export function AdminUsersPageSkeleton() {
  return (
    <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
      <TableSkeleton rows={8} cols={6} showHeader headerLabels={[
        "Nama",
        "Email",
        "Role",
        "Status",
        "Dibuat",
        "Aksi"
      ]} />
    </div>
  );
}

export function AdminUsersFullPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-64 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-border/40 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 max-w-xs bg-border/40 rounded-full" />
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-border/40 rounded-full" />
            <div className="h-10 w-28 bg-border/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Users Table Skeleton */}
      <AdminUsersPageSkeleton />
    </div>
  );
}
