/**
 * Wallets Module Services
 * All Supabase operations for wallets functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { WalletItem } from "./types";

/**
 * Add a new wallet
 */
export async function addWallet(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    name: string;
    initial_balance: number;
    icon: string;
    color: string;
    is_default: boolean;
    is_archived: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .insert([data]);

  if (error) throw error;
}

/**
 * Update an existing wallet
 */
export async function updateWallet(
  supabase: SupabaseClient,
  walletId: string,
  data: {
    name: string;
    icon: string;
    color: string;
    is_default: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .update(data)
    .eq("id", walletId);

  if (error) throw error;
}

/**
 * Toggle wallet archive status
 */
export async function toggleArchiveWallet(
  supabase: SupabaseClient,
  walletId: string,
  isArchived: boolean
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .update({ is_archived: isArchived })
    .eq("id", walletId);

  if (error) throw error;
}

/**
 * Set wallet as default
 */
export async function setDefaultWallet(
  supabase: SupabaseClient,
  walletId: string
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .update({ is_default: true })
    .eq("id", walletId);

  if (error) throw error;
}

/**
 * Delete a wallet
 */
export async function deleteWallet(
  supabase: SupabaseClient,
  walletId: string
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .delete()
    .eq("id", walletId);

  if (error) throw error;
}

/**
 * Create a transfer between wallets
 */
export async function createTransfer(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    from_wallet_id: string;
    to_wallet_id: string;
    amount: number;
    description: string;
    transfer_date: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("transfers")
    .insert([data]);

  if (error) throw error;
}
