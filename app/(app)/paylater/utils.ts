/**
 * PayLater Module Utilities
 * Pure utility functions for paylater functionality
 */

import { formatIDR } from "@/lib/utils/format";
import { formatDateTimeLong } from "@/lib/utils/date";

export { formatIDR };

/**
 * Calculate next billing and due dates for a paylater platform
 */
export const getNextBillingDate = (platform: { billing_cycle_date: number; due_date_offset: number }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const billingDay = platform.billing_cycle_date;

  let thisMonthBilling = new Date(currentYear, currentMonth, billingDay);
  if (thisMonthBilling < today) {
    thisMonthBilling = new Date(currentYear, currentMonth + 1, billingDay);
  }

  const dueDate = new Date(thisMonthBilling);
  dueDate.setDate(dueDate.getDate() + platform.due_date_offset);

  return {
    billing: formatDateTimeLong(thisMonthBilling.toISOString()),
    due: formatDateTimeLong(dueDate.toISOString())
  };
};

/**
 * Calculate usage percentage
 */
export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

/**
 * Get error message from unknown error
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

/**
 * Presets for platform creation
 */
export const PAYLATER_PRESETS = {
  colors: [
    { name: "Blue", hex: "#0C5CAB" },
    { name: "Green", hex: "#10B981" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F59E0B" },
    { name: "Cyan", hex: "#06B6D4" },
    { name: "Gray", hex: "#6B7280" }
  ],
  icons: ["CreditCard", "Smartphone", "Building", "Wallet", "Banknote", "Coins", "Star"] as string[]
};
