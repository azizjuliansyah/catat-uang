import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { SavingGoal, GoalTransaction } from "../types";
import {
  fetchGoals as fetchGoalsSvc,
  fetchGoalHistory,
  createGoal as createGoalSvc,
  updateGoal as updateGoalSvc,
  deleteGoal as deleteGoalSvc,
  createTopup as createTopupSvc,
  createWithdrawal as createWithdrawalSvc,
  deleteGoalTransaction
} from "../services";

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
      const data = await fetchGoalsSvc(supabase);
      setGoals(data);
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
      const historyList = await fetchGoalHistory(supabase, goalId);
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
    await createGoalSvc(supabase, data);
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
    await updateGoalSvc(supabase, id, data);
    showSuccessToast("Target tabungan berhasil diperbarui!");
    await fetchGoals();
  }

  // Delete Goal
  async function deleteGoal(id: string) {
    await deleteGoalSvc(supabase, id);
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
    await createTopupSvc(supabase, data);
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
    await createWithdrawalSvc(supabase, data);
    showSuccessToast("Penarikan tabungan berhasil!");
    await fetchGoals();
    await refreshWallets();
  }

  // Delete Transaction
  async function deleteTransaction(txId: string, type: "topup" | "withdrawal") {
    await deleteGoalTransaction(supabase, txId, type);
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
