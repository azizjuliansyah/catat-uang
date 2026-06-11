import React from "react";
import { LucideIcon } from "lucide-react";

interface DynamicColorIconProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  color: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "light" | "gradient";
  className?: string;
}

export function DynamicColorIcon({
  icon: Icon,
  color,
  size = "md",
  variant = "light",
  className = "",
}: DynamicColorIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantStyles = {
    solid: {
      backgroundColor: color,
      border: `1px solid ${color}`,
      color: "white",
    },
    light: {
      backgroundColor: `${color}10`, // 6% opacity
      border: `1px solid ${color}25`, // 15% opacity
      color: color,
    },
    gradient: {
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`,
      color: color,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={styles}
    >
      <Icon className={iconSizeClasses[size]} />
    </div>
  );
}
