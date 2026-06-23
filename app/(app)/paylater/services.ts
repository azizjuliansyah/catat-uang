/**
 * PayLater Module Services
 * All Supabase operations for paylater functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  PaylaterPlatform,
  PaylaterTransaction,
  PaylaterPayment
} from "./types";

/**
 * Fetch paylater platform details with transactions and payments
 */
export async function fetchPaylaterDetail(
  supabase: SupabaseClient,
  platformId: string,
  userId: string
): Promise<{
  platform: PaylaterPlatform | null;
  transactions: PaylaterTransaction[];
  payments: PaylaterPayment[];
}> {
  // Fetch platform details
  const { data: platformData, error: platformError } = await supabase
    .from("paylater_platforms")
    .select("*")
    .eq("id", platformId)
    .eq("user_id", userId)
    .single();

  if (platformError) throw platformError;

  // Fetch transactions using this paylater (only expense transactions that add to balance)
  const { data: transactionsData, error: transactionsError } = await supabase
    .from("transactions")
    .select("id, amount, type, description, transaction_date, receipt_url, categories(id, name, icon, color)")
    .eq("paylater_id", platformId)
    .eq("type", "expense")
    .order("transaction_date", { ascending: false });

  if (transactionsError) throw transactionsError;

  // Fetch payment history
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("paylater_payments")
    .select("id, amount, payment_date, created_at, transaction_id, wallets(id, name)")
    .eq("paylater_id", platformId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (paymentsError) throw paymentsError;

  return {
    platform: platformData,
    transactions: (transactionsData as unknown as PaylaterTransaction[]) || [],
    payments: (paymentsData as unknown as PaylaterPayment[]) || [],
  };
}

/**
 * Delete a paylater payment and its associated transaction
 */
export async function deletePaylaterPayment(
  supabase: SupabaseClient,
  paymentId: string,
  transactionId: string | null | undefined
): Promise<void> {
  // Delete the payment record
  const { error: deletePaymentError } = await supabase
    .from("paylater_payments")
    .delete()
    .eq("id", paymentId);

  if (deletePaymentError) throw deletePaymentError;

  // Delete associated transaction if exists
  if (transactionId) {
    const { error: deleteTxError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (deleteTxError) throw deleteTxError;
  }
}

/**
 * Create a new paylater platform
 */
export async function createPaylaterPlatform(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    name: string;
    limit_amount: number;
    billing_cycle_date: number;
    due_date_offset: number;
    icon: string;
    color: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("paylater_platforms")
    .insert({
      user_id: data.user_id,
      name: data.name.trim(),
      limit_amount: data.limit_amount,
      balance: 0,
      billing_cycle_date: data.billing_cycle_date,
      due_date_offset: data.due_date_offset,
      icon: data.icon,
      color: data.color,
    });

  if (error) throw error;
}

/**
 * Update an existing paylater platform
 */
export async function updatePaylaterPlatform(
  supabase: SupabaseClient,
  platformId: string,
  data: {
    name: string;
    limit_amount: number;
    billing_cycle_date: number;
    due_date_offset: number;
    icon: string;
    color: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("paylater_platforms")
    .update({
      name: data.name.trim(),
      limit_amount: data.limit_amount,
      billing_cycle_date: data.billing_cycle_date,
      due_date_offset: data.due_date_offset,
      icon: data.icon,
      color: data.color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", platformId);

  if (error) throw error;
}

/**
 * Delete a paylater platform
 */
export async function deletePaylaterPlatform(
  supabase: SupabaseClient,
  platformId: string
): Promise<void> {
  const { error } = await supabase
    .from("paylater_platforms")
    .delete()
    .eq("id", platformId);

  if (error) throw error;
}

/**
 * Archive/unarchive a paylater platform
 */
export async function toggleArchivePaylaterPlatform(
  supabase: SupabaseClient,
  platformId: string,
  isArchived: boolean
): Promise<void> {
  const { error } = await supabase
    .from("paylater_platforms")
    .update({ is_archived: isArchived })
    .eq("id", platformId);

  if (error) throw error;
}
