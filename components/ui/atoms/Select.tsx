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
    "w-full bg-surface border outline-none transition-all duration-150 ease cursor-pointer font-sans";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[36px] rounded-md",
    md: "px-3 py-2 text-sm min-h-[44px] rounded-md",
    lg: "px-4 py-2.5 text-sm min-h-[52px] rounded-md",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger text-text-primary"
    : "border-border focus:border-border-focus text-text-primary hover:border-border-strong";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-input"
    : "";

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
