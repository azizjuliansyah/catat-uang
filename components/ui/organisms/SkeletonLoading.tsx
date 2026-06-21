import React from "react";

interface SkeletonProps {
  className?: string;
}

export function SkeletonBase({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-border/40 rounded animate-pulse ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-surface-card border border-border/50 rounded-lg p-5 flex flex-col gap-3.5 ${className}`}>
      <SkeletonBase className="h-4 w-1/3" />
      <SkeletonBase className="h-8 w-2/3" />
      <div className="flex gap-2 mt-2">
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4, className = "" }: { rows?: number } & SkeletonProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-surface-card border border-border/40 rounded-lg">
          <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonBase className="h-4 w-1/3" />
            <SkeletonBase className="h-3 w-1/4" />
          </div>
          <SkeletonBase className="h-5 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number } & SkeletonProps) {
  return (
    <div className={`bg-surface-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="flex border-b border-border/50 p-4 bg-surface-hover/30">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1">
            <SkeletonBase className="h-4 w-1/2" />
          </div>
        ))}
      </div>
      {/* Table Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex border-b border-border/30 p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1">
                <SkeletonBase className={`h-3 ${c === 0 ? "w-2/3" : "w-1/2"}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-6 p-6 bg-surface-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-4">
        <SkeletonBase className="w-16 h-16 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonBase className="h-5 w-1/4" />
          <SkeletonBase className="h-4 w-1/3" />
        </div>
      </div>
      <hr className="border-border/30" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-16" />
          <SkeletonBase className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
