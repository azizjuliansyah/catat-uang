import React from "react";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  showHeader = true,
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={`bg-surface-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Table Header */}
      {showHeader && (
        <div className="flex border-b border-border/50 p-4 bg-surface-hover/30">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-border/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Table Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex border-b border-border/30 p-4 items-center animate-pulse"
            style={{ animationDelay: `${r * 50}ms` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1">
                <div
                  className={`h-3 bg-border/40 rounded ${
                    c === 0 ? "w-2/3" : c === cols - 1 ? "w-1/3" : "w-1/2"
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
