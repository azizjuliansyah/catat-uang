import React, { forwardRef } from "react";
import { Input } from "./Input";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

/**
 * DateInput - Native HTML5 date input with consistent styling
 *
 * Wrapper around native <input type="date"> with standardized
 * sizing, border-radius, and focus states.
 *
 * @example
 * <DateInput
 *   value={date}
 *   onChange={handleChange}
 *   size="md"
 *   hasError={hasError}
 * />
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ size = "md", hasError = false, className = "", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        size={size}
        hasError={hasError}
        className={className}
        {...props}
      />
    );
  }
);

DateInput.displayName = "DateInput";
