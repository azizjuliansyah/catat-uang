import React from "react";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  variant?: "solid" | "striped";
  className?: string;
}

export function ProgressBar({
  value = 0,
  max = 100,
  size = "md",
  color,
  showPercentage = true,
  showLabel = false,
  label,
  variant = "solid",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  const stripedClass = variant === "striped" ? "bg-[length:8px_8px]" : "";

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`w-full ${sizeClasses[size]} bg-surface-input rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            stripedClass ? "bg-stripes" : ""
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {(showPercentage || showLabel || label) && (
        <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1 font-mono">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
    </div>
  );
}
