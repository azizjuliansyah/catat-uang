/**
 * Settings Module Types
 * Centralized type definitions for settings functionality
 */

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

export interface TransactionTemplate {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  amount: number;
  category_id: string | null;
  wallet_id: string | null;
  paylater_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Category presets
export interface CategoryPresetColor {
  name: string;
  hex: string;
}

export interface CategoryPresets {
  colors: CategoryPresetColor[];
  icons: string[];
}
