/**
 * Goal Detail Page Handlers Hook
 * Handles all server operations for the goal detail page
 */

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { GoalTransaction } from "../../types";
import { formatIDR } from "@/lib/utils/format";
import { useRouter } from "next/navigation";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as any).message;
  }
  return "Unknown error";
}

interface UseGoalDetailHandlersProps {
  goal: any;
  user: any;
  formName: string;
  formTargetAmount: string;
  formTargetDate: string;
  formIcon: string;
  txAmount: string;
  txWalletId: string;
  txDate: string;
  transactionToDelete: GoalTransaction | null;
  isSavingGoal: boolean;
  isSavingTx: boolean;
  isDeletingGoal: boolean;
  isDeletingTx: boolean;
  setIsSavingGoal: (value: boolean) => void;
  setIsSavingTx: (value: boolean) => void;
  setIsDeletingGoal: (value: boolean) => void;
  setIsDeletingTx: (value: boolean) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setIsTopupModalOpen: (value: boolean) => void;
  setIsWithdrawModalOpen: (value: boolean) => void;
  setTransactionToDelete: (value: GoalTransaction | null) => void;
  loadData: () => Promise<void>;
  isActionLoading: boolean;
  setIsActionLoading: (value: boolean) => void;
}

export function useGoalDetailHandlers({
  goal,
  user,
  formName,
  formTargetAmount,
  formTargetDate,
  formIcon,
  txAmount,
  txWalletId,
  txDate,
  transactionToDelete,
  isSavingGoal,
  isSavingTx,
  isDeletingGoal,
  isDeletingTx,
  setIsSavingGoal,
  setIsSavingTx,
  setIsDeletingGoal,
  setIsDeletingTx,
  setIsEditModalOpen,
  setIsTopupModalOpen,
  setIsWithdrawModalOpen,
  setTransactionToDelete,
  loadData,
  isActionLoading,
  setIsActionLoading
}: UseGoalDetailHandlersProps) {
  const supabase = createClient();
  const router = useRouter();
  const { refreshWallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Submit Save/Edit Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSavingGoal) return;

    if (!formName.trim()) {
      showErrorToast("Nama target tidak boleh kosong");
      return;
    }

    const amountNum = parseFloat(formTargetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah target harus lebih besar dari 0");
      return;
    }

    if (!user || !goal) return;

    try {
      setIsSavingGoal(true);
      const isoTargetDate = new Date(formTargetDate).toISOString();

      const { error } = await supabase
        .from("saving_goals")
        .update({
          name: formName.trim(),
          target_amount: amountNum,
          target_date: isoTargetDate,
          icon: formIcon,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      if (error) throw error;

      showSuccessToast("Target tabungan berhasil diperbarui!");
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal memperbarui target: " + message);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Generic Transaction Handler
  const handleTransaction = async (e: React.FormEvent, type: "topup" | "withdrawal") => {
    if (isSavingTx) return;

    if (!goal || !user) return;
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah harus lebih besar dari 0");
      return;
    }
    if (!txWalletId) {
      showErrorToast("Silakan pilih dompet transaksi");
      return;
    }

    // For withdrawal, check if enough funds available
    if (type === "withdrawal" && amountNum > goal.current_amount) {
      showErrorToast(`Jumlah penarikan melebihi dana terkumpul (${formatIDR(goal.current_amount)})`);
      return;
    }

    try {
      setIsSavingTx(true);

      const tableName = type === "topup" ? "goal_topups" : "goal_withdrawals";
      const dateColumn = type === "topup" ? "topup_date" : "withdrawal_date";
      const txType = type === "topup" ? "expense" : "income";
      const txDescription = type === "topup"
        ? `Top-up tabungan: ${goal.name}`
        : `Tarik tabungan: ${goal.name}`;

      const { data: newTx, error: newTxError } = await supabase
        .from("transactions")
        .insert([{
          user_id: user.id,
          wallet_id: txWalletId,
          paylater_id: null,
          category_id: null,
          amount: amountNum,
          type: txType,
          description: txDescription,
          transaction_date: new Date(txDate).toISOString(),
          receipt_url: null
        }])
        .select()
        .single();

      if (newTxError) throw newTxError;

      const { error: moduleError } = await supabase
        .from(tableName)
        .insert([{
          goal_id: goal.id,
          wallet_id: txWalletId,
          amount: amountNum,
          [dateColumn]: new Date(txDate).toISOString(),
          transaction_id: newTx.id
        }]);

      if (moduleError) {
        await supabase.from("transactions").delete().eq("id", newTx.id);
        throw moduleError;
      }

      showSuccessToast(type === "topup" ? "Top-up berhasil!" : "Penarikan berhasil!");
      // Close appropriate modal
      if (type === "topup") {
        setIsTopupModalOpen(false);
      } else {
        setIsWithdrawModalOpen(false);
      }
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal: " + message);
    } finally {
      setIsSavingTx(false);
    }
  };

  // Submit Top-up Transaction
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction(e, "topup");
  };

  // Submit Withdrawal Transaction
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction(e, "withdrawal");
  };

  // Submit Delete Goal
  const handleDeleteGoal = async () => {
    if (!goal) return;
    try {
      setIsDeletingGoal(true);
      const { error } = await supabase
        .from("saving_goals")
        .delete()
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast("Target tabungan berhasil dihapus");
      router.push("/goals");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus target: " + message);
    } finally {
      setIsDeletingGoal(false);
    }
  };

  // Submit Delete Transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || !goal) return;
    try {
      setIsDeletingTx(true);

      const tableName = transactionToDelete.type === "topup" ? "goal_topups" : "goal_withdrawals";
      const txId = transactionToDelete.transaction_id;

      const { error: deleteModuleError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", transactionToDelete.id);

      if (deleteModuleError) throw deleteModuleError;

      if (txId) {
        const { error: deleteTxError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId);
        if (deleteTxError) throw deleteTxError;
      }

      showSuccessToast("Transaksi berhasil dihapus");
      setTransactionToDelete(null);
      await loadData();
      await refreshWallets();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      showErrorToast("Gagal menghapus transaksi: " + message);
    } finally {
      setIsDeletingTx(false);
    }
  };

  // Mark Complete handler
  const handleMarkComplete = async () => {
    if (!goal || goal.status === "achieved" || goal.status === "withdrawn") return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from("saving_goals")
        .update({ status: "achieved" })
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast(`Tujuan "${goal.name}" berhasil ditandai selesai!`);
      await loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menandai tujuan sebagai selesai");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Archive handler
  const handleToggleArchive = async () => {
    if (!goal) return;
    setIsActionLoading(true);
    try {
      const nextArchived = !goal.is_archived;
      const { error } = await supabase
        .from("saving_goals")
        .update({ is_archived: nextArchived })
        .eq("id", goal.id);

      if (error) throw error;
      showSuccessToast(nextArchived ? "Tujuan berhasil diarsipkan" : "Tujuan berhasil diaktifkan kembali");
      await loadData();
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mengubah status arsip tujuan");
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    handleSaveGoal,
    handleTopup,
    handleWithdraw,
    handleDeleteGoal,
    handleDeleteTransaction,
    handleMarkComplete,
    handleToggleArchive
  };
}
