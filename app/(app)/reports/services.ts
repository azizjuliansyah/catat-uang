/**
 * Reports Module Services
 * All Supabase operations for reports functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Transaction, DebtData } from "./types";

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
