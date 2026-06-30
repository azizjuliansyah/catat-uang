/**
 * TextSkeleton - Text/label skeleton with real text labels support.
 * Displays real text for labels while showing blank placeholders for values.
 */

import { ValueBlock } from "./ValueBlock";

interface TextSkeletonProps {
  // Label (shown as real text)
  label?: string;
  labelWidth?: string; // If no label provided, use skeleton placeholder
  labelClassName?: string;

  // Value placeholder (blank skeleton block)
  valueWidth?: string;
  valueHeight?: string;
  showValue?: boolean;
  valueAsZero?: boolean; // Show "0" instead of blank
  valueClassName?: string;

  // Layout
  direction?: "row" | "column";
  align?: "items-center" | "items-start" | "items-end";
  justify?: "justify-between" | "justify-start" | "justify-end";
  gap?: string;

  className?: string;
}

export function TextSkeleton({
  label,
  labelWidth = "w-24",
  labelClassName = "",
  valueWidth = "w-24",
  valueHeight = "h-7",
  showValue = true,
  valueAsZero = false,
  valueClassName = "",
  direction = "column",
  align = "items-start",
  justify = "justify-start",
  gap = "gap-2",
  className = "",
}: TextSkeletonProps) {
  const containerClass = `flex ${direction} ${align} ${justify} ${gap}`.trim();

  return (
    <div className={containerClass}>
      {/* Label */}
      {label ? (
        <span className={`text-text-secondary ${labelClassName}`.trim()}>
          {label}
        </span>
      ) : (
        <div className={`bg-border/40 rounded animate-pulse h-3 ${labelWidth}`} />
      )}

      {/* Value */}
      {showValue && (
        valueAsZero ? (
          <span className={`font-mono font-bold text-text-primary ${valueClassName}`.trim()}>
            Rp 0
          </span>
        ) : (
          <ValueBlock width={valueWidth} height={valueHeight} className={valueClassName} />
        )
      )}
    </div>
  );
}
