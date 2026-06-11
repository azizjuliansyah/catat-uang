import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  size?: "sm" | "md" | "lg";
}

export function Textarea({
  hasError = false,
  resize = "none",
  size = "md",
  disabled = false,
  className = "",
  ...props
}: TextareaProps) {
  const baseClasses =
    "w-full bg-surface-input border outline-none transition-all font-sans text-text-primary";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[60px] rounded-lg",
    md: "px-3.5 py-2.5 text-xs min-h-[80px] rounded-xl",
    lg: "px-4 py-3 text-sm min-h-[120px] rounded-xl",
  };

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
    : "border-border focus:border-primary focus:ring-1 focus:ring-primary";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-hover"
    : "";

  return (
    <textarea
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${resizeClasses[resize]} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}
