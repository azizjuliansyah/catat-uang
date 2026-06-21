"use client";

// Import new components
import { GoalDetailHeader } from "./components/GoalDetailHeader";
import { GoalProgressSection } from "./components/GoalProgressSection";
import { GoalTransactionList } from "./components/GoalTransactionList";
import { GoalEmptyState } from "./components/GoalEmptyState";
import { GoalDetailModals } from "./components/GoalDetailModals";
import { useGoalDetailState } from "./hooks/useGoalDetailState";
import { useGoalDetailHandlers } from "./hooks/useGoalDetailHandlers";
import { calculateETAInfo } from "../utils";
import { ETAInfo } from "../types";

export default function GoalDetailPage() {
  // Use custom hooks for state and handlers
  const state = useGoalDetailState();

  const {
    goal,
    transactions,
    loading,
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
    formName,
    formTargetAmount,
    formTargetDate,
    formIcon,
    txAmount,
    txWalletId,
    txDate,
    isSavingGoal,
    setIsSavingGoal,
    isSavingTx,
    setIsSavingTx,
    isDeletingGoal,
    setIsDeletingGoal,
    isDeletingTx,
    setIsDeletingTx,
    openEditModal
  } = state;

  const handlers = useGoalDetailHandlers({
    goal,
    user: state.user,
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
    loadData: state.loadData
  });

  if (loading || !goal) {
    return <GoalEmptyState />;
  }

  // Calculate derived values
  const eta = calculateETAInfo(goal) as ETAInfo;
  const isAchieved = goal.status === "achieved";
  const isWithdrawn = goal.status === "withdrawn";
  const hasFunds = goal.current_amount > 0;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Section */}
      <GoalDetailHeader
        goal={goal}
        onEdit={openEditModal}
        onDelete={() => setShowDeleteGoalModal(true)}
      />

      {/* Progress Section */}
      <GoalProgressSection goal={goal} eta={eta} />

      {/* Transaction List */}
      <GoalTransactionList
        transactions={transactions}
        hasFunds={hasFunds}
        isAchieved={isAchieved}
        isWithdrawn={isWithdrawn}
        onTopup={() => setIsTopupModalOpen(true)}
        onWithdraw={() => setIsWithdrawModalOpen(true)}
        onDeleteTransaction={(tx) => setTransactionToDelete(tx)}
      />

      {/* Modals */}
      <GoalDetailModals state={state} handlers={handlers} />
    </div>
  );
}
