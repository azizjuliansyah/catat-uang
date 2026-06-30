/**
 * CardSkeleton - Base card skeleton with real text labels support.
 * Enhanced version of components/ui/molecules/CardSkeleton.tsx
 * with support for real titles/subtitles and zero-value display.
 */

import { ValueBlock } from "./ValueBlock";
import { TextSkeleton } from "./TextSkeleton";

interface CardSkeletonProps {
  // Layout
  variant?: "horizontal" | "vertical" | "wallet-list" | "transaction-list";

  // Content with real text labels
  title?: string; // Real title text
  subtitle?: string; // Real subtitle text
  showTitle?: boolean;
  showSubtitle?: boolean;
  titleClassName?: string;
  subtitleClassName?: string;

  // Value placeholder
  valueWidth?: string;
  showValue?: boolean;
  valueAsZero?: boolean; // Show "0" for numbers
  valueClassName?: string;

  // Icon
  showIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
  iconClassName?: string;

  // Action buttons
  showActions?: boolean;
  actionCount?: number;

  // Additional content
  lines?: number; // Text lines below title/value
  showProgress?: boolean;
  showFooter?: boolean;

  // Styling
  className?: string;
  innerClassName?: string;
}

const iconSizes = {
  sm: "w-9 h-9",
  md: "w-14 h-14",
  lg: "w-16 h-16",
};

export function CardSkeleton({
  variant = "horizontal",
  title,
  subtitle,
  showTitle = true,
  showSubtitle = false,
  titleClassName = "text-sm font-semibold",
  subtitleClassName = "text-[10px]",
  valueWidth = "w-24",
  showValue = true,
  valueAsZero = false,
  valueClassName = "text-sm font-bold font-mono",
  showIcon = true,
  iconSize = "md",
  iconClassName = "",
  showActions = true,
  actionCount = 2,
  lines = 0,
  showProgress = false,
  showFooter = false,
  className = "",
  innerClassName = "",
}: CardSkeletonProps) {
  const layoutClass =
    variant === "horizontal"
      ? "flex-row items-start gap-4"
      : variant === "vertical"
        ? "flex-col gap-4"
        : variant === "wallet-list"
          ? "flex-row items-center gap-3"
          : "flex-col gap-3";

  const iconClass = iconSizes[iconSize];

  // Wallet list variant - compact horizontal card
  if (variant === "wallet-list") {
    return (
      <div
        className={`bg-surface-card border border-border/80 rounded-2xl px-4 py-2 ${className}`}
      >
        <div className={`flex items-center justify-between w-full ${layoutClass}`}>
          <div className={`flex items-center ${innerClassName}`.trim() || "gap-3.5 min-w-0"}>
            {showIcon && (
              <div className={`shrink-0 ${iconClass} rounded-xl bg-surface-hover ${iconClassName}`.trim()} />
            )}
            <div className="min-w-0 space-y-2">
              {showTitle && (
                title ? (
                  <p className={`${titleClassName} text-text-primary truncate`}>{title}</p>
                ) : (
                  <div className="h-3.5 w-24 bg-surface-hover rounded animate-pulse" />
                )
              )}
              {showSubtitle && (
                subtitle ? (
                  <p className={`${subtitleClassName} text-text-secondary`}>{subtitle}</p>
                ) : (
                  <div className="h-2.5 w-20 bg-surface-hover rounded animate-pulse" />
                )
              )}
            </div>
          </div>
          {showValue && (
            valueAsZero ? (
              <span className={`${valueClassName} text-text-primary text-right`}>Rp 0</span>
            ) : (
              <div className={`h-4 ${valueWidth} bg-surface-hover rounded animate-pulse`} />
            )
          )}
        </div>
        {showFooter && (
          <div className="mt-2 pt-1 border-t border-border/50 flex justify-end">
            <div className="h-3 w-16 bg-surface-hover rounded ml-auto animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  // Transaction list variant
  if (variant === "transaction-list") {
    return (
      <div className={`bg-surface-card border border-border rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className={`w-9 h-9 rounded-lg bg-surface-hover ${iconClassName}`.trim()} />
            )}
            <div className="space-y-2">
              {showTitle && (
                title ? (
                  <p className={`${titleClassName} text-text-primary`}>{title}</p>
                ) : (
                  <div className="h-3 w-32 bg-surface-hover rounded animate-pulse" />
                )
              )}
              {showSubtitle && (
                subtitle ? (
                  <p className={`${subtitleClassName} text-text-secondary`}>{subtitle}</p>
                ) : (
                  <div className="h-2 w-24 bg-surface-hover rounded animate-pulse" />
                )
              )}
            </div>
          </div>
          {showValue && (
            valueAsZero ? (
              <span className={`${valueClassName} text-text-primary`}>Rp 0</span>
            ) : (
              <div className={`h-4 ${valueWidth} bg-surface-hover rounded animate-pulse`} />
            )
          )}
        </div>
      </div>
    );
  }

  // Standard card variants (horizontal/vertical)
  return (
    <div
      className={`bg-surface-card border border-border rounded-2xl p-5 ${className}`}
    >
      <div className={`flex ${layoutClass}`}>
        {showIcon && (
          <div className="shrink-0">
            <div className={`${iconClass} rounded-lg bg-border/40 ${iconClassName}`.trim()} />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Header row with title and actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              {showTitle && (
                title ? (
                  <p className={`${titleClassName} text-text-primary`}>{title}</p>
                ) : (
                  <div className="h-4 bg-border/40 rounded w-1/3 mb-2 animate-pulse" />
                )
              )}
              {showSubtitle && (
                subtitle ? (
                  <p className={`${subtitleClassName} text-text-secondary block mt-1`}>{subtitle}</p>
                ) : (
                  <div className="h-3 bg-border/40 rounded w-1/4 animate-pulse" />
                )
              )}
            </div>
            {showActions && (
              <div className="flex gap-1 shrink-0">
                {Array.from({ length: actionCount }).map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-border/40 animate-pulse" />
                ))}
              </div>
            )}
          </div>

          {/* Value */}
          {showValue && (
            valueAsZero ? (
              <span className={`${valueClassName} text-text-primary`}>Rp 0</span>
            ) : (
              <ValueBlock width={valueWidth} className={valueClassName} />
            )
          )}

          {/* Progress bar */}
          {showProgress && (
            <div className="space-y-2">
              <div className="h-2 bg-border/40 rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
                <div className="h-3 w-12 bg-border/40 rounded animate-pulse" />
              </div>
            </div>
          )}

          {/* Text lines */}
          {lines > 0 && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: lines }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-border/40 rounded animate-pulse"
                  style={{ width: i === lines - 1 ? "60%" : "100%" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-20 bg-border/40 rounded animate-pulse" />
          </div>
          <div className="h-3 w-16 bg-border/40 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
