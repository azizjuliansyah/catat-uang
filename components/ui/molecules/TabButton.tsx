import React from "react";

export interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  variant?: "underline" | "pill" | "pill-colored";
  color?: string;
}

export function TabButton({
  isActive = false,
  variant = "underline",
  color,
  children,
  className = "",
  style,
  ...props
}: TabButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-sans text-sm font-medium transition-all duration-150 ease cursor-pointer focus:outline-none py-2 px-4 select-none";

  const variantClasses = {
    underline: isActive
      ? "text-primary border-b-2 border-primary font-semibold"
      : "text-text-secondary hover:text-text-primary border-b-2 border-transparent hover:border-border",
    pill: isActive
      ? "bg-primary/10 text-primary font-semibold rounded-md"
      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md",
    "pill-colored": isActive
      ? "font-semibold rounded-md border"
      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md",
  };

  const coloredStyle = variant === "pill-colored" && isActive && color
    ? {
        ...style,
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}20`,
      }
    : style;

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={coloredStyle}
      {...props}
    >
      {children}
    </button>
  );
}
