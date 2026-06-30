/**
 * PageHeaderSkeleton - Page header skeleton with title/actions.
 * Displays real text for title and description while showing blank placeholders for icons/actions.
 */

interface PageHeaderSkeletonProps {
  showIcon?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  actionCount?: number;
  title?: string; // Real text: "Daftar Transaksi"
  description?: string; // Real text: "Lihat semua catatan..."
  iconSize?: string;
  className?: string;
}

export function PageHeaderSkeleton({
  showIcon = true,
  showDescription = true,
  showActions = true,
  actionCount = 2,
  title = "Loading...",
  description = "Memuat data...",
  iconSize = "w-6 h-6",
  className = "",
}: PageHeaderSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Left side: Icon + Title + Description */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
            {showIcon && <div className={`bg-border/40 rounded ${iconSize} animate-pulse`} />}
            <span>{title}</span>
          </h1>
          {showDescription && (
            <p className="text-xs text-text-secondary mt-1">{description}</p>
          )}
        </div>

        {/* Right side: Action buttons */}
        {showActions && (
          <div className="flex gap-2 w-full sm:w-auto">
            {Array.from({ length: actionCount }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-border/40 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
