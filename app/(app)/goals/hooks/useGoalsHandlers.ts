import { useToast } from "@/components/ui/molecules/Toast";
import { SavingGoal, GoalTransaction } from "../types";
import { formatIDR } from "../utils";

interface UseGoalsHandlersProps {
  user: any;
  createGoal: (data: any) => Promise<void>;
  updateGoal: (id: string, data: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  createTopup: (data: any) => Promise<void>;
  createWithdrawal: (data: any) => Promise<void>;
  deleteTransaction: (id: string, type: "topup" | "withdrawal") => Promise<void>;
  fetchHistory: (goalId: string) => Promise<GoalTransaction[]>;
  closeAllModals: () => void;
  resetGoalForm: () => void;
  setSelectedGoal: (goal: SavingGoal | null) => void;
  setTxAmount: (amount: string) => void;
  setSubmittingGoal: (submitting: boolean) => void;
  setSubmittingTx: (submitting: boolean) => void;
  setIsDeleteSubmitting: (submitting: boolean) => void;
  setTransactionsHistory: (history: GoalTransaction[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  setIsTxDeleteSubmitting: (submitting: boolean) => void;
}

export function useGoalsHandlers({
  user,
  createGoal,
  updateGoal,
  deleteGoal,
  createTopup,
  createWithdrawal,
  deleteTransaction,
  fetchHistory,
  closeAllModals,
  resetGoalForm,
  setSelectedGoal,
  setTxAmount,
  setSubmittingGoal,
  setSubmittingTx,
  setIsDeleteSubmitting,
  setTransactionsHistory,
  setLoadingHistory,
  setIsTxDeleteSubmitting
}: UseGoalsHandlersProps) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleSaveGoal = async (
    e: React.FormEvent,
    formName: string,
    formTargetAmount: string,
    formTargetDate: string,
    formIcon: string,
    editingGoal: SavingGoal | null,
    isAddModalOpen: boolean
  ) => {
    e.preventDefault();
    if (!formName.trim()) {
      showErrorToast("Nama target tidak boleh kosong");
      return;
    }
    const targetNum = parseFloat(formTargetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      showErrorToast("Jumlah target harus lebih besar dari 0");
      return;
    }
    if (!user) return;

    try {
      setSubmittingGoal(true);
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          name: formName.trim(),
          target_amount: targetNum,
          target_date: new Date(formTargetDate).toISOString(),
          icon: formIcon
        });
      } else {
        await createGoal({
          user_id: user.id,
          name: formName.trim(),
          target_amount: targetNum,
          target_date: new Date(formTargetDate).toISOString(),
          icon: formIcon
        });
      }
      closeAllModals();
      resetGoalForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menyimpan target: " + message);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalToDelete: SavingGoal | null) => {
    if (!goalToDelete) return;
    try {
      setIsDeleteSubmitting(true);
      await deleteGoal(goalToDelete.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menghapus target: " + message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleSaveTransaction = async (
    e: React.FormEvent,
    type: "topup" | "withdrawal",
    selectedGoal: SavingGoal | null,
    txAmount: string,
    txWalletId: string,
    txDate: string,
    isTopupModalOpen: boolean,
    isWithdrawModalOpen: boolean
  ) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast("Jumlah dana harus lebih besar dari 0");
      return;
    }
    if (!txWalletId) {
      showErrorToast("Silakan pilih dompet transaksi");
      return;
    }

    if (type === "withdrawal" && amountNum > selectedGoal.current_amount + 0.01) {
      showErrorToast(`Jumlah penarikan melebihi dana terkumpul saat ini (${formatIDR(selectedGoal.current_amount)})`);
      return;
    }

    try {
      setSubmittingTx(true);
      if (type === "topup") {
        await createTopup({
          goal_id: selectedGoal.id,
          wallet_id: txWalletId,
          amount: amountNum,
          topup_date: new Date(txDate).toISOString()
        });
      } else {
        await createWithdrawal({
          goal_id: selectedGoal.id,
          wallet_id: txWalletId,
          amount: amountNum,
          withdrawal_date: new Date(txDate).toISOString()
        });
      }
      setTxAmount("");
      setSelectedGoal(null);
      closeAllModals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Transaksi gagal: " + message);
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleOpenHistoryModal = async (
    goal: SavingGoal,
    setHistoryGoal: (goal: SavingGoal | null) => void,
    setIsHistoryModalOpen: (open: boolean) => void
  ) => {
    setHistoryGoal(goal);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    const history = await fetchHistory(goal.id);
    setTransactionsHistory(history);
    setLoadingHistory(false);
  };

  const handleDeleteTransaction = async (
    txToDelete: GoalTransaction | null,
    historyGoal: SavingGoal | null
  ) => {
    if (!txToDelete || !historyGoal) return;
    try {
      setIsTxDeleteSubmitting(true);
      await deleteTransaction(txToDelete.id, txToDelete.type);
      const history = await fetchHistory(historyGoal.id);
      setTransactionsHistory(history);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showErrorToast("Gagal menghapus transaksi: " + message);
    } finally {
      setIsTxDeleteSubmitting(false);
    }
  };

  return {
    handleSaveGoal,
    handleDeleteGoal,
    handleSaveTransaction,
    handleOpenHistoryModal,
    handleDeleteTransaction
  };
}
