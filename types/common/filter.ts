/**
 * Shared filter type definitions
 */

export type DateRangeType = "all_time" | "this_month" | "last_3_months" | "last_6_months" | "this_year" | "custom";

export interface DateRange {
  type: DateRangeType;
  startDate?: string;
  endDate?: string;
}

export interface FilterOptions {
  searchTerm: string;
  dateRange: DateRange;
  selectedTypes?: string[];
  selectedCategories?: string[];
  selectedWallets?: string[];
}
