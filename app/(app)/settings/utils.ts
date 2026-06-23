/**
 * Settings Module Utilities
 * Pure utility functions for settings functionality
 */

import { formatIDR } from "@/lib/utils/format";
import { CategoryPresetColor, CategoryPresets } from "./types";

export { formatIDR };

/**
 * Get error message from unknown error
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

/**
 * Category presets for UI
 */
export const CATEGORY_PRESETS: CategoryPresets = {
  colors: [
    { name: "Emerald", hex: "#10B981" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Indigo", hex: "#6366F1" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Pink", hex: "#EC4899" },
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F59E0B" },
    { name: "Gray", hex: "#6B7280" }
  ],
  icons: [
    "Briefcase",
    "TrendingUp",
    "Utensils",
    "Car",
    "ShoppingBag",
    "FileText",
    "Film",
    "HelpCircle"
  ]
};
