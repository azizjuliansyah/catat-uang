import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, disabled = false, readOnly = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full bg-surface-input text-text-primary placeholder:text-text-muted border text-sm rounded-lg px-3.5 py-2.5 min-h-[44px] transition-all duration-200 focus:outline-none font-sans";

    const stateClasses = hasError
      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
      : readOnly
      ? "border-border bg-surface-input/50 cursor-default"
      : disabled
      ? "border-border/50 opacity-40 cursor-not-allowed"
      : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20";

    return (
      <input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
