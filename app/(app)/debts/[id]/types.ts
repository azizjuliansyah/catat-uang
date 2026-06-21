/**
 * Debt Detail Page Types
 * Extends shared debt types for the detail page
 */

import type { DebtItem, DebtPaymentItem, DebtPackage, DebtTransactionItem } from "../types";

export interface DebtDetailFormData {
  name: string;
  type: "owe" | "lend";
  packages: DebtPackage[];
}

export interface DebtPaymentFormData {
  amount: string;
  walletId: string;
  date: string;
  proofFiles: File[] | null;
  proofPreviews: string[] | null;
}

// Re-export parent types
export type { DebtItem, DebtPaymentItem, DebtPackage, DebtTransactionItem };
