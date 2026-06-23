"use client";

import React from "react";
import { formatIDR } from "@/lib/utils/format";

export type CurrencyFormat = "full" | "compact" | "short";

interface CurrencyDisplayProps {
  value: number;
  format?: CurrencyFormat;
  showSign?: boolean;
  signType?: "positive" | "negative" | "auto";
  locale?: string;
  className?: string;
}

/**
 * Currency display component that formats numbers as Indonesian Rupiah.
 *
 * @example
 * <CurrencyDisplay value={1500000} /> // "Rp 1.500.000"
 * <CurrencyDisplay value={1500000} showSign signType="positive" /> // "+ Rp 1.500.000"
 * <CurrencyDisplay value={1500000} format="compact" /> // "Rp 1.5jt"
 */
export function CurrencyDisplay({
  value,
  format = "full",
  showSign = false,
  signType = "auto",
  locale = "id-ID",
  className = "",
}: CurrencyDisplayProps) {
  const formatted = formatIDR(value);

  // Handle compact format (shortened numbers like 1.5jt, 2.3M)
  let displayValue = formatted;
  if (format === "compact" || format === "short") {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      displayValue = formatIDR(value / 1_000_000_000).replace(/\s/g, "") + " M";
    } else if (absValue >= 1_000_000) {
      displayValue = formatIDR(value / 1_000_000).replace(/\s/g, "") + " jt";
    } else if (absValue >= 1_000) {
      displayValue = formatIDR(value / 1_000).replace(/\s/g, "") + " rb";
    }
  }

  // Handle sign display
  let finalValue = displayValue;
  if (showSign) {
    const sign = signType === "positive" || (signType === "auto" && value >= 0) ? "+" : "-";
    // formatIDR already includes "Rp", so we need to handle the sign position
    // "Rp 1.500.000" -> "+ Rp 1.500.000" or "- Rp 1.500.000"
    finalValue = `${sign} ${displayValue}`;
  }

  return (
    <span className={`font-mono ${className}`}>
      {finalValue}
    </span>
  );
}
