/**
 * Dashboard Module Utilities
 * Pure utility functions for dashboard functionality
 */

/**
 * Get current month's date range
 */
export const getCurrentMonthRange = (): { startDate: string; endDate: string; year: number; month: number } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return { startDate: startDateStr, endDate: endDateStr, year, month };
};

/**
 * Get error message from unknown error
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};
