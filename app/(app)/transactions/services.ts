/**
 * Transactions Module Services
 * All Supabase operations for transactions functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Transaction } from "./types";
import { getDateRange } from "./hooks/useTransactionsState";

/**
 * Fetch transactions with filters
 */
export async function fetchTransactions(
  supabase: SupabaseClient,
  userId: string,
  dateRangeType: string,
  customStartDate: string,
  customEndDate: string
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select(`
      *,
      wallets (name, icon, color),
      paylater_platforms (name, color),
      categories (name, icon, color)
    `)
    .eq("user_id", userId);

  const { startDate, endDate } = getDateRange(dateRangeType, customStartDate, customEndDate);
  const startISO = new Date(`${startDate}T00:00:00`).toISOString();
  const endISO = new Date(`${endDate}T23:59:59.999`).toISOString();
  query = query.gte("transaction_date", startISO).lte("transaction_date", endISO);

  query = query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Transaction[]) || [];
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  supabase: SupabaseClient,
  transactionId: string
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) throw error;
}
