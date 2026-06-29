/**
 * Re-export common entity types from their source modules
 * This file serves as a central reference for shared entity types
 */

// Re-export from module-specific type files
export type { WalletItem } from "@/app/(app)/wallets/types";
export type { Category } from "@/app/(app)/settings/types";
export type { Transaction } from "@/app/(app)/transactions/types";
