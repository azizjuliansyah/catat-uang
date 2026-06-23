/**
 * Dashboard Module Types
 * Centralized type definitions for dashboard functionality
 */

import { Transaction } from "../transactions/types";

export type DashboardTransaction = Transaction;

export interface DashboardStats {
  currentMonthIncome: number;
  currentMonthExpense: number;
  netCashflow: number;
  totalBalance: number;
  totalPaylaterDebt: number;
}
