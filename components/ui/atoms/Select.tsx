import React from "react";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  hasError?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Select({
  hasError = false,
  size = "md",
  disabled = false,
  className = "",
  children,
  ...props
}: SelectProps) {
  const baseClasses =
    "w-full bg-surface-input border outline-none transition-all cursor-pointer font-sans";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[36px] rounded-lg",
    md: "px-3.5 py-2.5 text-xs min-h-[44px] rounded-xl",
    lg: "px-4 py-3 text-sm min-h-[52px] rounded-xl",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger text-text-primary"
    : "border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-primary";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-hover"
    : "hover:border-border-strong";

  return (
    <select
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
