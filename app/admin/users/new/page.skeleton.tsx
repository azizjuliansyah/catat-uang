import { PageHeaderSkeleton } from "@/components/ui/skeleton";

export function NewUserPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header Skeleton */}
      <PageHeaderSkeleton
        title="Buat Pengguna Baru"
        showDescription
        showActions={false}
      />

      {/* Form Skeleton */}
      <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-5 animate-pulse">
        {/* Name Field */}
        <div className="space-y-2">
          <div className="h-3 w-24 bg-border/40 rounded" />
          <div className="h-10 w-full bg-border/40 rounded" />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <div className="h-3 w-16 bg-border/40 rounded" />
          <div className="h-10 w-full bg-border/40 rounded" />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-border/40 rounded" />
          <div className="h-10 w-full bg-border/40 rounded" />
        </div>

        {/* Role Field */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-border/40 rounded" />
          <div className="grid grid-cols-2 gap-3 bg-surface-input p-1 rounded-xl">
            <div className="h-10 w-full bg-border/40 rounded" />
            <div className="h-10 w-full bg-border/40 rounded" />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-border/40 rounded shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-48 bg-border/40 rounded" />
            <div className="h-2 w-64 bg-border/40 rounded" />
            <div className="h-2 w-56 bg-border/40 rounded" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-10 bg-border/40 rounded" />
          <div className="flex-1 h-10 bg-border/40 rounded" />
        </div>
      </div>
    </div>
  );
}
