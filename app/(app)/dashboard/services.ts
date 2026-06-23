/**
 * Dashboard Module Services
 * All Supabase operations for dashboard functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { DashboardTransaction } from "./types";

/**
 * Fetch monthly income/expense statistics for the current month
 */
export async function fetchMonthlyStats(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: number
): Promise<{ income: number; expense: number }> {
  const startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const startISO = new Date(`${startDateStr}T00:00:00`).toISOString();
  const endISO = new Date(`${endDateStr}T23:59:59.999`).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", userId)
    .gte("transaction_date", startISO)
    .lte("transaction_date", endISO);

  if (error) throw error;

  let incomeSum = 0;
  let expenseSum = 0;
  if (data) {
    data.forEach((tx) => {
      if (tx.type === "income") {
        incomeSum += Number(tx.amount);
      } else if (tx.type === "expense") {
        expenseSum += Number(tx.amount);
      }
    });
  }

  return { income: incomeSum, expense: expenseSum };
}

/**
 * Fetch recent transactions (last 5)
 */
export async function fetchRecentTransactions(
  supabase: SupabaseClient,
  userId: string,
  limit = 5
): Promise<DashboardTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      user_id,
      wallet_id,
      paylater_id,
      category_id,
      amount,
      type,
      description,
      transaction_date,
      receipt_url,
      created_at,
      wallets (name, icon, color),
      paylater_platforms (name, color, icon),
      categories (name, icon, color)
    `)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as DashboardTransaction[]) || [];
}
