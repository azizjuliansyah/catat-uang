import React, { forwardRef } from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  hasError?: boolean;
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ hasError = false, disabled = false, className = "", label, id, ...props }, ref) => {
    const baseClasses = "rounded border transition-all duration-150 ease cursor-pointer";
    const sizeClasses = "w-4 h-4";

    const stateClasses = hasError
      ? "border-danger text-danger focus:border-danger focus:ring-0"
      : disabled
        ? "border-border opacity-40 cursor-not-allowed bg-surface-input"
        : "border-border text-primary focus:border-border-strong focus:ring-0 hover:border-border-strong bg-surface-input";

    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        id={id}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses} ${stateClasses} ${className}`}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="flex items-center gap-3">
          {checkbox}
          <label
            htmlFor={id}
            className={`text-body text-text-secondary select-none cursor-pointer ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {label}
          </label>
        </div>
      );
    }

    return checkbox;
  }
);

Checkbox.displayName = "Checkbox";
