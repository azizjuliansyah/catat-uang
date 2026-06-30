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
    "w-full bg-surface-input border transition-all duration-150 ease cursor-pointer font-sans text-text-primary";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs h-9 rounded-md",
    md: "px-3 py-2 text-sm min-h-[44px] rounded-md",
    lg: "px-4 py-2.5 text-sm min-h-[52px] rounded-md",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger focus:outline-none"
    : "border-border focus:border-border-focus hover:border-border-strong focus:outline-none";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-input/50"
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
