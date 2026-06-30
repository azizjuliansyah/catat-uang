import { PageHeaderSkeleton, InfoCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export function AuditLogPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Audit Log Sistem"
        showDescription
        showActions={false}
      />

      {/* Filter Bar Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="h-10 flex-1 max-w-xs bg-border/40 rounded-full" />
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-border/40 rounded-full" />
            <div className="h-10 w-28 bg-border/40 rounded-full" />
            <div className="h-10 w-28 bg-border/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Summary Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCardSkeleton title="Total Entri" valueAsZero />
        <InfoCardSkeleton title="Hari Ini" valueAsZero />
        <InfoCardSkeleton title="Minggu Ini" valueAsZero />
        <InfoCardSkeleton title="Bulan Ini" valueAsZero />
      </div>

      {/* Audit Log Table Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <TableSkeleton rows={10} cols={6} showHeader headerLabels={[
          "Waktu",
          "Admin",
          "Aksi",
          "Target",
          "Detail",
          "IP Address"
        ]} />
      </div>
    </div>
  );
}
