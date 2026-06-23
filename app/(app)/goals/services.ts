/**
 * Goals Module Services
 * All Supabase operations for goals functionality
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { SavingGoal, GoalTransaction } from "./types";

/**
 * Fetch all saving goals
 */
export async function fetchGoals(
  supabase: SupabaseClient
): Promise<SavingGoal[]> {
  const { data, error } = await supabase
    .from("saving_goals")
    .select("*")
    .order("target_date", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch transaction history for a specific goal
 */
export async function fetchGoalHistory(
  supabase: SupabaseClient,
  goalId: string
): Promise<GoalTransaction[]> {
  // 1. Fetch topups
  const { data: topups, error: topupErr } = await supabase
    .from("goal_topups")
    .select(`
      id,
      goal_id,
      wallet_id,
      amount,
      topup_date,
      created_at,
      wallets(name)
    `)
    .eq("goal_id", goalId);

  if (topupErr) throw topupErr;

  // 2. Fetch withdrawals
  const { data: withdrawals, error: wdrawErr } = await supabase
    .from("goal_withdrawals")
    .select(`
      id,
      goal_id,
      wallet_id,
      amount,
      withdrawal_date,
      created_at,
      wallets(name)
    `)
    .eq("goal_id", goalId);

  if (wdrawErr) throw wdrawErr;

  // Map & merge
  const historyList: GoalTransaction[] = [
    ...(topups || []).map((t: any) => ({
      id: t.id,
      goal_id: t.goal_id,
      wallet_id: t.wallet_id,
      amount: parseFloat(t.amount),
      date: t.topup_date,
      type: "topup" as const,
      wallet_name: t.wallets?.name || "Dompet Terhapus",
      created_at: t.created_at
    })),
    ...(withdrawals || []).map((w: any) => ({
      id: w.id,
      goal_id: w.goal_id,
      wallet_id: w.wallet_id,
      amount: parseFloat(w.amount),
      date: w.withdrawal_date,
      type: "withdrawal" as const,
      wallet_name: w.wallets?.name || "Dompet Terhapus",
      created_at: w.created_at
    }))
  ];

  // Sort by date desc
  historyList.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return historyList;
}

/**
 * Create a new saving goal
 */
export async function createGoal(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    name: string;
    target_amount: number;
    target_date: string;
    icon: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("saving_goals")
    .insert([{
      ...data,
      current_amount: 0.00,
      status: "ongoing"
    }]);

  if (error) throw error;
}

/**
 * Update an existing saving goal
 */
export async function updateGoal(
  supabase: SupabaseClient,
  goalId: string,
  data: {
    name: string;
    target_amount: number;
    target_date: string;
    icon: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("saving_goals")
    .update(data)
    .eq("id", goalId);

  if (error) throw error;
}

/**
 * Delete a saving goal
 */
export async function deleteGoal(
  supabase: SupabaseClient,
  goalId: string
): Promise<void> {
  const { error } = await supabase
    .from("saving_goals")
    .delete()
    .eq("id", goalId);

  if (error) throw error;
}

/**
 * Create a top-up transaction for a goal
 */
export async function createTopup(
  supabase: SupabaseClient,
  data: {
    goal_id: string;
    wallet_id: string;
    amount: number;
    topup_date: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("goal_topups")
    .insert([data]);

  if (error) throw error;
}

/**
 * Create a withdrawal transaction for a goal
 */
export async function createWithdrawal(
  supabase: SupabaseClient,
  data: {
    goal_id: string;
    wallet_id: string;
    amount: number;
    withdrawal_date: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("goal_withdrawals")
    .insert([data]);

  if (error) throw error;
}

/**
 * Delete a goal transaction (topup or withdrawal)
 */
export async function deleteGoalTransaction(
  supabase: SupabaseClient,
  txId: string,
  type: "topup" | "withdrawal"
): Promise<void> {
  const tableName = type === "topup" ? "goal_topups" : "goal_withdrawals";
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", txId);

  if (error) throw error;
}
