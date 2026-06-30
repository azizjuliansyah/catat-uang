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
    "w-full bg-surface-input border transition-all duration-150 ease font-sans text-text-primary";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[60px] rounded-md",
    md: "px-3 py-2 text-sm min-h-[80px] rounded-md",
    lg: "px-4 py-2.5 text-sm min-h-[120px] rounded-md",
  };

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  const stateClasses = hasError
    ? "border-danger focus:border-danger focus:outline-none"
    : "border-border focus:border-border-focus hover:border-border-strong focus:outline-none";

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed bg-surface-input/50"
    : "";

  return (
    <textarea
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${resizeClasses[resize]} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}
