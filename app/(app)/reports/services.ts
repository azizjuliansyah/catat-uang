/**
 * Reports Module Services
 * All Supabase operations for reports functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { CategoryItem } from "@/app/providers/AppProvider";
import { Transaction, DebtData, CategoryTotalItem, SelectedDetailsResult } from "./types";

/**
 * Fetch all transactions for reports
 */
export async function fetchReportTransactions(
  supabase: SupabaseClient,
  userId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      transaction_date,
      description,
      category_id,
      categories (name, icon, color),
      wallets (name)
    `)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: true });

  if (error) throw error;
  return (data as unknown as Transaction[]) || [];
}

/**
 * Fetch all debts for reports summary
 */
export async function fetchReportDebts(
  supabase: SupabaseClient
): Promise<DebtData[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("id, type, total_amount, paid_amount, status");

  if (error) throw error;
  return (data as unknown as DebtData[]) || [];
}

/**
 * Calculates the total transaction amount per category in the specified date range.
 * Includes both active categories and historic categories found in transactions.
 */
export function calculateCategoryTotals(
  transactions: Transaction[],
  categories: CategoryItem[],
  startDate: Date,
  endDate: Date
): CategoryTotalItem[] {
  const map = new Map<string, CategoryTotalItem>();

  // Group active categories first
  categories.forEach((cat) => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      amount: 0,
    });
  });

  // Filter transactions by date range
  const dateFiltered = transactions.filter((tx) => {
    const txDate = new Date(tx.transaction_date);
    return txDate >= startDate && txDate <= endDate;
  });

  // Populate transaction amounts
  dateFiltered.forEach((tx) => {
    const catId = tx.category_id;
    if (!catId) return;

    const existing = map.get(catId);
    const amt = Number(tx.amount) || 0;
    if (existing) {
      existing.amount += amt;
    } else {
      // Handle historic/deleted categories that still have transactions
      map.set(catId, {
        id: catId,
        name: tx.categories?.name || "Tanpa Kategori",
        type: tx.type,
        icon: tx.categories?.icon || "HelpCircle",
        color: tx.categories?.color || "#71717a",
        amount: amt,
      });
    }
  });

  return Array.from(map.values());
}

/**
 * Groups and sorts selected categories into income and expense categories,
 * and calculates total nominals for each type.
 */
export function groupSelectedDetails(
  categoryTotals: CategoryTotalItem[],
  selectedIds: Set<string>
): SelectedDetailsResult {
  const selectedList = categoryTotals.filter((c) => selectedIds.has(c.id));

  const expenses = selectedList
    .filter((c) => c.type === "expense")
    .sort((a, b) => b.amount - a.amount);

  const income = selectedList
    .filter((c) => c.type === "income")
    .sort((a, b) => b.amount - a.amount);

  const totalExpenseNominal = expenses.reduce((sum, c) => sum + c.amount, 0);
  const totalIncomeNominal = income.reduce((sum, c) => sum + c.amount, 0);

  return {
    expenses,
    income,
    totalExpenseNominal,
    totalIncomeNominal,
  };
}

