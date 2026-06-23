/**
 * PayLater Module Types
 * Centralized type definitions for paylater functionality
 */

export interface PaylaterPlatform {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  balance: number;
  billing_cycle_date: number;
  due_date_offset: number;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaylaterTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  receipt_url: string | null;
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface PaylaterPayment {
  id: string;
  amount: number;
  payment_date: string;
  created_at: string;
  transaction_id?: string | null;
  wallets: {
    id: string;
    name: string;
  } | null;
}

export interface PaylaterBillingDates {
  billing: string;
  due: string;
}

// Presets for platform creation
export interface PaylaterPresetColors {
  name: string;
  hex: string;
}

export interface PaylaterPresets {
  colors: PaylaterPresetColors[];
  icons: string[];
}
