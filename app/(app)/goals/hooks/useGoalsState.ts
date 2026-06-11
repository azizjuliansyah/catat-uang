import { useState, useEffect } from "react";
import { SavingGoal, GoalTransaction } from "../types";
import { getDefaultTargetDate, getTodayDate } from "../utils";
import { formatForDateTimeInput } from "@/lib/utils/date";

export function useGoalsState(activeWallets: Array<{ id: string }>) {
  // Filter States
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "achieved" | "withdrawn">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Form State - Add / Edit Saving Goal
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState(getDefaultTargetDate());
  const [formIcon, setFormIcon] = useState("PiggyBank");
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Form State - Top-up / Withdrawal
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [txAmount, setTxAmount] = useState("");
  const [txWalletId, setTxWalletId] = useState("");
  const [txDate, setTxDate] = useState(getTodayDate());
  const [submittingTx, setSubmittingTx] = useState(false);

  // Delete States
  const [goalToDelete, setGoalToDelete] = useState<SavingGoal | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // History States
  const [historyGoal, setHistoryGoal] = useState<SavingGoal | null>(null);
  const [transactionsHistory, setTransactionsHistory] = useState<GoalTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Transaction Delete States
  const [txToDelete, setTxToDelete] = useState<GoalTransaction | null>(null);
  const [isTxDeleteSubmitting, setIsTxDeleteSubmitting] = useState(false);

  // Set default wallet ID when activeWallets change
  useEffect(() => {
    if (activeWallets.length > 0 && !txWalletId) {
      setTxWalletId(activeWallets[0].id);
    }
  }, [activeWallets, txWalletId]);

  const resetGoalForm = () => {
    setFormName("");
    setFormTargetAmount("");
    setFormTargetDate(getDefaultTargetDate());
    setFormIcon("PiggyBank");
    setEditingGoal(null);
  };

  const openEditModal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormTargetAmount(goal.target_amount.toString());
    setFormTargetDate(formatForDateTimeInput(goal.target_date));
    setFormIcon(goal.icon);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    resetGoalForm();
    setIsAddModalOpen(true);
  };

  const openTxModal = (goal: SavingGoal, type: "topup" | "withdrawal") => {
    setSelectedGoal(goal);
    setTxDate(getTodayDate());
    if (type === "topup") {
      const remaining = goal.target_amount - goal.current_amount;
      setTxAmount(remaining > 0 ? remaining.toString() : "");
      setIsTopupModalOpen(true);
    } else {
      setTxAmount(goal.current_amount.toString());
      setIsWithdrawModalOpen(true);
    }
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsTopupModalOpen(false);
    setIsWithdrawModalOpen(false);
    setIsHistoryModalOpen(false);
  };

  return {
    // Filter
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,

    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isTopupModalOpen,
    setIsTopupModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,

    // Form - Goal
    formName,
    setFormName,
    formTargetAmount,
    setFormTargetAmount,
    formTargetDate,
    setFormTargetDate,
    formIcon,
    setFormIcon,
    editingGoal,
    setEditingGoal,
    submittingGoal,
    setSubmittingGoal,

    // Form - Transaction
    selectedGoal,
    setSelectedGoal,
    txAmount,
    setTxAmount,
    txWalletId,
    setTxWalletId,
    txDate,
    setTxDate,
    submittingTx,
    setSubmittingTx,

    // Delete
    goalToDelete,
    setGoalToDelete,
    isDeleteSubmitting,
    setIsDeleteSubmitting,

    // History
    historyGoal,
    setHistoryGoal,
    transactionsHistory,
    setTransactionsHistory,
    loadingHistory,
    setLoadingHistory,

    // Transaction Delete
    txToDelete,
    setTxToDelete,
    isTxDeleteSubmitting,
    setIsTxDeleteSubmitting,

    // Actions
    resetGoalForm,
    openEditModal,
    openAddModal,
    openTxModal,
    closeAllModals
  };
}
