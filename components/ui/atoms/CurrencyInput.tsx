import React, { forwardRef } from "react";
import { Input } from "./Input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
  prefix?: string; // Default: "Rp."
  onValueChange?: (rawValue: string) => void;
}

/**
 * CurrencyInput - Text input with currency prefix and formatting
 *
 * Handles Indonesian Rupiah formatting automatically:
 * - Displays formatted value (e.g., "1.000.000")
 * - Emits raw numeric value (e.g., "1000000")
 *
 * @example
 * <CurrencyInput
 *   value={amount}
 *   onChange={setAmount}
 *   prefix="Rp."
 *   size="md"
 *   hasError={hasError}
 * />
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      prefix = "Rp.",
      size = "md",
      hasError = false,
      onValueChange,
      className = "",
      ...props
    },
    ref
  ) => {
    // Format raw number to Indonesian locale format
    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "";
      const clean = val.toString().replace(/\D/g, "");
      if (!clean) return "";
      return parseInt(clean, 10).toLocaleString("id-ID");
    };

    const displayValue = formatCurrency(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const rawVal = e.target.value.replace(/\D/g, "");
        const simulatedEvent = {
          ...e,
          target: {
            ...e.target,
            value: rawVal,
            name: props.name || ""
          }
        };
        onChange(simulatedEvent as any);
      }
      if (onValueChange) {
        onValueChange(e.target.value.replace(/\D/g, ""));
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-text-secondary select-none pointer-events-none">
          {prefix}
        </span>
        <Input
          ref={ref}
          {...props}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={`!pl-11 font-mono font-bold ${className}`}
          size={size}
          hasError={hasError}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
