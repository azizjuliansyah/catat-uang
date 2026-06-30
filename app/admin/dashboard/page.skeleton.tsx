import { PageHeaderSkeleton, InfoCardSkeleton, ItemCardSkeleton } from "@/components/ui/skeleton";

export function AdminDashboardPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Dashboard Admin"
        showDescription
        showActions={false}
      />

      {/* Banner Skeleton */}
      <div className="bg-warning/10 border border-warning/20 rounded-2xl p-5 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-border/40 rounded" />
          <div className="h-3 w-64 bg-border/40 rounded" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCardSkeleton title="Total Pengguna" valueAsZero />
        <InfoCardSkeleton title="Pengguna Aktif" valueAsZero />
        <InfoCardSkeleton title="Admin Terdaftar" valueAsZero />
        <InfoCardSkeleton title="Audit Log Entri" valueAsZero />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Section Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-border/40 rounded" />
            <div className="h-3 w-40 bg-border/40 rounded" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-8 w-24 bg-border/40 rounded" />
              <div className="h-8 w-20 bg-border/40 rounded" />
            </div>
          </div>
        </div>

        {/* Audit Logs Section Skeleton */}
        <div className="bg-surface-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-border/40 rounded" />
            <div className="h-3 w-40 bg-border/40 rounded" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-8 w-24 bg-border/40 rounded" />
              <div className="h-8 w-20 bg-border/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
