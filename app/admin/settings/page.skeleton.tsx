import { PageHeaderSkeleton } from "@/components/ui/skeleton";

export function AdminSettingsPageSkeleton() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Pengaturan Admin"
        showDescription
        showActions={false}
      />

      {/* Tabs Selector Skeleton */}
      <div className="flex justify-center gap-2">
        <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
        <div className="h-10 w-28 bg-border/40 rounded-full animate-pulse" />
      </div>

      {/* Profile/Security Section Skeleton */}
      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-surface-card border border-border rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-border/40" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-border/40 rounded" />
              <div className="h-3 w-48 bg-border/40 rounded" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="space-y-2">
              <div className="h-2 w-20 bg-border/40 rounded" />
              <div className="h-9 w-full bg-border/40 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-24 bg-border/40 rounded" />
              <div className="h-9 w-full bg-border/40 rounded" />
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-surface-card border border-border rounded-2xl p-6 animate-pulse">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-border/40 rounded" />
              <div className="h-8 w-20 bg-border/40 rounded" />
            </div>
            <div className="h-px bg-border/50" />
            <div className="space-y-2">
              <div className="h-2 w-28 bg-border/40 rounded" />
              <div className="h-9 w-full bg-border/40 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-32 bg-border/40 rounded" />
              <div className="h-9 w-full bg-border/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
