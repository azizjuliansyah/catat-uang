import React from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "dashed" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  color?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  color,
  children,
  className = "",
  type = "button",
  style,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-medium rounded-md transition-all duration-150 ease focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-primary hover:opacity-85 text-white border border-primary",
    secondary:
      "bg-transparent hover:bg-surface-hover text-text-primary border border-border hover:border-border-strong",
    ghost:
      "bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-transparent",
    destructive:
      "bg-danger hover:opacity-85 text-white border border-danger",
    dashed:
      "bg-transparent hover:bg-surface-hover text-text-secondary hover:text-primary border border-dashed border-border hover:border-primary/50",
    success:
      "bg-success hover:opacity-85 text-white border border-success",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-3.5 py-2 text-sm min-h-[44px]", // 14px padding, 44px min touch target
    lg: "px-5 py-3 text-base min-h-[52px]",
  };

  const fullWidthClass = fullWidth ? "flex-1" : "";

  const combinedStyle = color ? { ...style, backgroundColor: color, borderColor: color, color: "white" } : style;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      style={combinedStyle}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          <span>Memproses...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
