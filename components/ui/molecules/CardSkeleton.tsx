import React from "react";

interface CardSkeletonProps {
  showIcon?: boolean;
  showMetric?: boolean;
  showActions?: boolean;
  lines?: number;
  className?: string;
  variant?: "horizontal" | "vertical";
}

export function CardSkeleton({
  showIcon = true,
  showMetric = true,
  showActions = true,
  lines = 2,
  className = "",
  variant = "horizontal",
}: CardSkeletonProps) {
  const layoutClass =
    variant === "horizontal" ? "flex-row items-start gap-4" : "flex-col gap-4";

  return (
    <div
      className={`bg-surface-card border border-border rounded-2xl p-5 animate-pulse ${className}`}
    >
      <div className={`flex ${layoutClass}`}>
        {showIcon && (
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-lg bg-border/40" />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Header row with title and actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="h-4 bg-border/40 rounded w-1/3 mb-2" />
              <div className="h-3 bg-border/40 rounded w-1/4" />
            </div>
            {showActions && (
              <div className="flex gap-1 shrink-0">
                <div className="w-7 h-7 rounded-full bg-border/40" />
                <div className="w-7 h-7 rounded-full bg-border/40" />
              </div>
            )}
          </div>

          {/* Metric */}
          {showMetric && (
            <div className="h-8 bg-border/40 rounded w-32" />
          )}

          {/* Text lines */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-border/40 rounded"
                style={{ width: i === lines - 1 ? "60%" : "100%" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
