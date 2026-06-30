/**
 * TableSkeleton - Table skeleton with configurable rows and columns.
 * Displays real text for column headers with blank placeholders for cell values.
 */

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  headerLabels?: string[]; // Real column headers
  cellHeight?: string;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  showHeader = true,
  headerLabels = [],
  cellHeight = "h-12",
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        {/* Header */}
        {showHeader && (
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="text-left p-3">
                  {headerLabels[i] || (
                    <div className="h-4 w-24 bg-border/40 rounded animate-pulse" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/50">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className={`p-3 ${cellHeight}`}>
                  <div className="h-4 bg-border/40 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
