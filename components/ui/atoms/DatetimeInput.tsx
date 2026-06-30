import React, { forwardRef } from "react";
import { Input } from "./Input";

interface DatetimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

/**
 * DatetimeInput - Native HTML5 datetime-local input with consistent styling
 *
 * Wrapper around native <input type="datetime-local"> with standardized
 * sizing, border-radius, and focus states.
 *
 * @example
 * <DatetimeInput
 *   value={datetime}
 *   onChange={handleChange}
 *   size="md"
 *   hasError={hasError}
 * />
 */
export const DatetimeInput = forwardRef<HTMLInputElement, DatetimeInputProps>(
  ({ size = "md", hasError = false, className = "", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="datetime-local"
        size={size}
        hasError={hasError}
        className={className}
        {...props}
      />
    );
  }
);

DatetimeInput.displayName = "DatetimeInput";
