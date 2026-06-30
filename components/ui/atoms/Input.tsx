import React, { forwardRef } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, disabled = false, readOnly = false, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs h-9 rounded-md',           // 36px
      md: 'px-3 py-2 text-sm min-h-[44px] rounded-md',     // 44px (default)
      lg: 'px-4 py-2.5 text-sm min-h-[52px] rounded-md',   // 52px
    };

    const baseClasses = `w-full bg-surface-input text-text-primary placeholder:text-text-tertiary border transition-all duration-150 ease font-sans ${sizeClasses[size]}`;

    const stateClasses = hasError
      ? "border-danger focus:border-danger focus:outline-none"
      : readOnly
      ? "border-border bg-surface-input/50 cursor-default focus:outline-none"
      : disabled
      ? "border-border opacity-40 cursor-not-allowed focus:outline-none"
      : "border-border hover:border-border-strong focus:border-border-focus focus:outline-none";

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
