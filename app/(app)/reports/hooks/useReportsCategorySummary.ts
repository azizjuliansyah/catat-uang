import { useState, useEffect, useMemo } from "react";
import { CategoryItem } from "@/app/providers/AppProvider";
import { Transaction } from "../types";
import { calculateCategoryTotals, groupSelectedDetails } from "../services";

export function useReportsCategorySummary(
  transactions: Transaction[],
  categories: CategoryItem[],
  startDate: Date,
  endDate: Date
) {
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate totals and compile all available categories (active + historic)
  const categoryTotals = useMemo(() => {
    return calculateCategoryTotals(transactions, categories, startDate, endDate);
  }, [transactions, categories, startDate, endDate]);

  // Automatically select all categories on first load/initialization
  useEffect(() => {
    if (categoryTotals.length > 0 && !isInitialized) {
      setSelectedIds(new Set(categoryTotals.map((c) => c.id)));
      setIsInitialized(true);
    }
  }, [categoryTotals, isInitialized]);

  // Toggle single category selection
  const toggleCategory = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Quick actions
  const selectAll = () => {
    setSelectedIds(new Set(categoryTotals.map((c) => c.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  // Filtered categories for the selector list based on search query
  const filteredSelectorCategories = useMemo(() => {
    return categoryTotals.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryTotals, searchQuery]);

  // Filtered selected categories split into income and expense
  const selectedDetails = useMemo(() => {
    return groupSelectedDetails(categoryTotals, selectedIds);
  }, [categoryTotals, selectedIds]);

  return {
    selectedIds,
    searchQuery,
    setSearchQuery,
    categoryTotals,
    filteredSelectorCategories,
    selectedDetails,
    toggleCategory,
    selectAll,
    clearAll,
  };
}
