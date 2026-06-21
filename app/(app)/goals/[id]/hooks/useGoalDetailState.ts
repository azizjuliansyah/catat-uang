/**
 * Goal Detail Page State Management Hook
 * Handles all state for the goal detail page
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { SavingGoal, GoalTransaction } from "../../types";
import { formatForDateTimeInput } from "@/lib/utils/date";

export function useGoalDetailState() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loadingUser, wallets } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  // Main Data State
  const [goal, setGoal] = useState<SavingGoal | null>(null);
  const [transactions, setTransactions] = useState<GoalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<GoalTransaction | null>(null);

  // Edit Goal Form States
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formIcon, setFormIcon] = useState("PiggyBank");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Transaction Form States
  const [txAmount, setTxAmount] = useState("");
  const [txWalletId, setTxWalletId] = useState("");
  const [txDate, setTxDate] = useState("");
  const [isSavingTx, setIsSavingTx] = useState(false);

  // Deletion Submitting States
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Fetch Page Data
  const loadData = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("saving_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (goalError || !goalData) {
        showErrorToast("Target tabungan tidak ditemukan.");
        router.push("/goals");
        return;
      }

      setGoal(goalData);

      // Fetch topups
      const { data: topups, error: topupErr } = await supabase
        .from("goal_topups")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          topup_date,
          created_at,
          transaction_id,
          wallets(name)
        `)
        .eq("goal_id", id);

      if (topupErr) throw topupErr;

      // Fetch withdrawals
      const { data: withdrawals, error: wdrawErr } = await supabase
        .from("goal_withdrawals")
        .select(`
          id,
          goal_id,
          wallet_id,
          amount,
          withdrawal_date,
          created_at,
          transaction_id,
          wallets(name)
        `)
        .eq("goal_id", id);

      if (wdrawErr) throw wdrawErr;

      // Map & merge transactions
      const historyList: GoalTransaction[] = [
        ...(topups || []).map((t: any) => ({
          id: t.id,
          goal_id: t.goal_id,
          wallet_id: t.wallet_id,
          amount: parseFloat(t.amount),
          date: t.topup_date,
          type: "topup" as const,
          wallet_name: t.wallets?.name || "Dompet Terhapus",
          created_at: t.created_at,
          transaction_id: t.transaction_id || null
        })),
        ...(withdrawals || []).map((w: any) => ({
          id: w.id,
          goal_id: w.goal_id,
          wallet_id: w.wallet_id,
          amount: parseFloat(w.amount),
          date: w.withdrawal_date,
          type: "withdrawal" as const,
          wallet_name: w.wallets?.name || "Dompet Terhapus",
          created_at: w.created_at,
          transaction_id: w.transaction_id || null
        }))
      ];

      // Sort by date desc, then created_at desc
      historyList.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTransactions(historyList);
    } catch (err: unknown) {
      console.error(err);
      showErrorToast("Gagal memuat data detail.");
    } finally {
      setLoading(false);
    }
  }, [id, user, supabase, router, showErrorToast]);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, loadingUser, loadData, router]);

  // Set default transaction date and wallet when modal opens
  useEffect(() => {
    const activeWallets = wallets.filter(w => !w.is_archived);
    const defaultWallet = activeWallets.find(w => w.is_default) || activeWallets[0];

    if (isTopupModalOpen || isWithdrawModalOpen) {
      setTxDate(formatForDateTimeInput(new Date().toISOString()));
      if (defaultWallet) {
        setTxWalletId(defaultWallet.id);
      }
    }
  }, [isTopupModalOpen, isWithdrawModalOpen, wallets]);

  // Open Edit Dialog
  const openEditModal = () => {
    if (!goal) return;
    setFormName(goal.name);
    setFormTargetAmount(goal.target_amount.toString());
    setFormTargetDate(formatForDateTimeInput(goal.target_date));
    setFormIcon(goal.icon || "PiggyBank");
    setIsEditModalOpen(true);
  };

  return {
    // State
    goal,
    transactions,
    loading,
    user,
    wallets,

    // Modal States
    isEditModalOpen,
    setIsEditModalOpen,
    isTopupModalOpen,
    setIsTopupModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    showDeleteGoalModal,
    setShowDeleteGoalModal,
    transactionToDelete,
    setTransactionToDelete,

    // Form States
    formName,
    setFormName,
    formTargetAmount,
    setFormTargetAmount,
    formTargetDate,
    setFormTargetDate,
    formIcon,
    setFormIcon,
    isSavingGoal,
    setIsSavingGoal,

    // Transaction Form States
    txAmount,
    setTxAmount,
    txWalletId,
    setTxWalletId,
    txDate,
    setTxDate,
    isSavingTx,
    setIsSavingTx,

    // Deletion States
    isDeletingGoal,
    setIsDeletingGoal,
    isDeletingTx,
    setIsDeletingTx,

    // Actions
    loadData,
    openEditModal
  };
}
