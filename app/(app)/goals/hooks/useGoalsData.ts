import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { SavingGoal, GoalTransaction } from "../types";

export function useGoalsData() {
  const supabase = createClient();
  const { user, wallets, refreshWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Data States
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Goals when user changes
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  // Fetch Goals
  async function fetchGoals() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("saving_goals")
        .select("*")
        .order("target_date", { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(err);
      showErrorToast("Gagal memuat target tabungan: " + message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch History for Goal
  async function fetchHistory(goalId: string): Promise<GoalTransaction[]> {
    try {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(err);
      showErrorToast("Gagal memuat riwayat tabungan: " + message);
      return [];
    }
  }

  // Create Goal
  async function createGoal(data: {
    user_id: string;
    name: string;
    target_amount: number;
    target_date: string;
    icon: string;
  }) {
    const { error } = await supabase
      .from("saving_goals")
      .insert([{
        ...data,
        current_amount: 0.00,
        status: "ongoing"
      }]);

    if (error) throw error;
    showSuccessToast("Target tabungan baru berhasil ditambahkan!");
    await fetchGoals();
  }

  // Update Goal
  async function updateGoal(id: string, data: {
    name: string;
    target_amount: number;
    target_date: string;
    icon: string;
  }) {
    const { error } = await supabase
      .from("saving_goals")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    showSuccessToast("Target tabungan berhasil diperbarui!");
    await fetchGoals();
  }

  // Delete Goal
  async function deleteGoal(id: string) {
    const { error } = await supabase
      .from("saving_goals")
      .delete()
      .eq("id", id);

    if (error) throw error;
    showSuccessToast("Target tabungan berhasil dihapus");
    await fetchGoals();
  }

  // Create Top-up
  async function createTopup(data: {
    goal_id: string;
    wallet_id: string;
    amount: number;
    topup_date: string;
  }) {
    const { error } = await supabase
      .from("goal_topups")
      .insert([data]);

    if (error) throw error;
    showSuccessToast("Top-up tabungan berhasil!");
    await fetchGoals();
    await refreshWallets();
  }

  // Create Withdrawal
  async function createWithdrawal(data: {
    goal_id: string;
    wallet_id: string;
    amount: number;
    withdrawal_date: string;
  }) {
    const { error } = await supabase
      .from("goal_withdrawals")
      .insert([data]);

    if (error) throw error;
    showSuccessToast("Penarikan tabungan berhasil!");
    await fetchGoals();
    await refreshWallets();
  }

  // Delete Transaction
  async function deleteTransaction(txId: string, type: "topup" | "withdrawal") {
    const tableName = type === "topup" ? "goal_topups" : "goal_withdrawals";
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", txId);

    if (error) throw error;
    showSuccessToast("Transaksi berhasil dihapus & saldo dikembalikan!");
    await fetchGoals();
    await refreshWallets();
  }

  // Get active wallets for selection
  const activeWallets = wallets.filter(w => !w.is_archived);

  return {
    goals,
    loading,
    fetchGoals,
    fetchHistory,
    createGoal,
    updateGoal,
    deleteGoal,
    createTopup,
    createWithdrawal,
    deleteTransaction,
    activeWallets,
    user
  };
}
