import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, disabled = false, readOnly = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full bg-surface text-text-primary placeholder:text-text-tertiary border text-sm rounded-md px-3 py-2 min-h-[44px] transition-all duration-150 ease focus:outline-none font-sans";

    const stateClasses = hasError
      ? "border-danger focus:border-danger"
      : readOnly
      ? "border-border bg-surface-input/50 cursor-default"
      : disabled
      ? "border-border opacity-40 cursor-not-allowed"
      : "border-border hover:border-border-strong focus:border-border-focus";

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
