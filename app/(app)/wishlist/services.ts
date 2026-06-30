import { SupabaseClient } from "@supabase/supabase-js";
import { WishlistItem } from "./types";

export async function fetchWishlist(
  supabase: SupabaseClient
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    qty: Number(item.qty),
    price: Number(item.price)
  }));
}

export async function createWishlist(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from("wishlists")
    .insert([data]);

  if (error) throw error;
}

export async function updateWishlist(
  supabase: SupabaseClient,
  wishlistId: string,
  data: {
    name: string;
    qty: number;
    price: number;
    target_date: string | null;
    description: string | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from("wishlists")
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", wishlistId);

  if (error) throw error;
}

export async function markAsPurchased(
  supabase: SupabaseClient,
  wishlistId: string,
  transactionData: {
    user_id: string;
    wallet_id: string;
    amount: number;
    description: string;
    category_id: string | null;
  }
): Promise<string> {
  // 1. Insert transaction
  const { data: txData, error: txError } = await supabase
    .from("transactions")
    .insert([{
      user_id: transactionData.user_id,
      wallet_id: transactionData.wallet_id,
      amount: transactionData.amount,
      type: "expense",
      description: transactionData.description,
      category_id: transactionData.category_id,
      transaction_date: new Date().toISOString()
    }])
    .select("id")
    .single();

  if (txError) throw txError;
  const newTxId = txData.id;

  // 2. Update wishlist item
  const { error: wlError } = await supabase
    .from("wishlists")
    .update({
      is_purchased: true,
      transaction_id: newTxId,
      updated_at: new Date().toISOString()
    })
    .eq("id", wishlistId);

  if (wlError) {
    // Rollback transaction if wishlist update fails
    await supabase.from("transactions").delete().eq("id", newTxId);
    throw wlError;
  }

  return newTxId;
}

export async function markAsUnpurchased(
  supabase: SupabaseClient,
  wishlistId: string,
  transactionId: string
): Promise<void> {
  // 1. Update wishlist item first
  const { error: wlError } = await supabase
    .from("wishlists")
    .update({
      is_purchased: false,
      transaction_id: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", wishlistId);

  if (wlError) throw wlError;

  // 2. Delete transaction (wallet balance refunded by trigger)
  const { error: txError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (txError) throw txError;
}export async function deleteWishlist(
  supabase: SupabaseClient,
  wishlistId: string
): Promise<void> {
  const { data } = await supabase
    .from("wishlists")
    .select("transaction_id")
    .eq("id", wishlistId)
    .single();

  if (data?.transaction_id) {
    await supabase.from("transactions").delete().eq("id", data.transaction_id);
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("id", wishlistId);

  if (error) throw error;
}
