import React from "react";

export type ProgressBarVariant = "gradient" | "solid";
export type ProgressBarHeight = "sm" | "md" | "lg";
export type ProgressBarTrackColor = "default" | "muted";

interface ProgressBarProps {
  percentage: number;
  variant?: ProgressBarVariant;
  color?: string; // For solid variant or gradient start color
  gradientEndColor?: string; // For gradient end color
  height?: ProgressBarHeight;
  trackColor?: ProgressBarTrackColor;
  isLoading?: boolean;
}

const heightClasses: Record<ProgressBarHeight, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4"
};

const trackColorClasses: Record<ProgressBarTrackColor, string> = {
  default: "bg-surface-hover",
  muted: "bg-surface-hover/60"
};

export function ProgressBar({
  percentage,
  variant = "solid",
  color,
  gradientEndColor,
  height = "md",
  trackColor = "default",
  isLoading = false
}: ProgressBarProps) {
  const heightClass = heightClasses[height];
  const trackColorClass = trackColorClasses[trackColor];

  // For gradient variant with custom color - use inline style
  if (variant === "gradient" && color) {
    const endColor = gradientEndColor || `${color}CC`;
    const gradientStyle = {
      width: `${percentage}%`,
      background: `linear-gradient(to right, ${color}, ${endColor})`
    };

    return (
      <div className={`w-full ${trackColorClass} rounded-full overflow-hidden ${heightClass}`}>
        {isLoading ? (
          <div className="h-full w-full bg-border/40 rounded-full animate-pulse" />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-500"
            style={gradientStyle}
          />
        )}
      </div>
    );
  }

  // For gradient variant without custom color - use Tailwind classes
  if (variant === "gradient") {
    return (
      <div className={`w-full ${trackColorClass} rounded-full overflow-hidden ${heightClass}`}>
        {isLoading ? (
          <div className="h-full w-full bg-border/40 rounded-full animate-pulse" />
        ) : (
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-feedback-error transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    );
  }

  // For solid variant
  const solidStyle = { width: `${percentage}%`, backgroundColor: color };

  return (
    <div className={`w-full ${trackColorClass} rounded-full overflow-hidden ${heightClass}`}>
      {isLoading ? (
        <div className="h-full w-full bg-border/40 rounded-full animate-pulse" />
      ) : (
        <div
          className="h-full rounded-full transition-all duration-500"
          style={solidStyle}
        />
      )}
    </div>
  );
}
